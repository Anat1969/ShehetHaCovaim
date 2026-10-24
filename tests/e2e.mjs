// Full journey e2e against `vite preview`. Run: npm run build && (npx vite preview --port 4173 &) && node tests/e2e.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(require("node:child_process").execSync("npm root -g").toString().trim() + "/playwright"); }

const BASE = process.env.BASE || "http://localhost:4173";
const SHOTS = "tests/shots";
fs.mkdirSync(SHOTS, { recursive: true });

const GOAL = "אני רוצה לפתוח סטודיו קטן לעיצוב פנים בעיר שלי תוך שנה, בלי לעזוב את העבודה הנוכחית. ברור שכולם צריכים מעצבת. יש לי שלושה לקוחות שמחכים";
const errors = [];
const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
const ok = (m) => console.log("ok  ", m);

async function noHScroll(page, label) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  over > 1 ? fail(`horizontal scroll ${over}px on ${label}`) : ok(`no horizontal scroll: ${label}`);
}

async function run(viewport, tag, colorScheme) {
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport, locale: "he-IL", colorScheme });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${tag}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/fonts\.g/.test(m.text()) && errors.push(`${tag} console: ${m.text()}`));
  page.on("dialog", (d) => d.accept());
  const mobile = viewport.width < 800;
  const shot = (n) => page.screenshot({ path: `${SHOTS}/${tag}-${n}.png`, fullPage: true });

  await page.goto(BASE + "/");
  await page.waitForSelector(".display");
  await noHScroll(page, `${tag} home`);
  await shot("01-home");

  // top bar
  if (mobile) {
    await page.click(".topbar__menu");
    await page.waitForSelector(".mobile-menu");
    await page.click(".mobile-menu >> text=הכובעים");
  } else {
    await page.click(".topnav >> text=הכובעים");
  }
  await page.waitForURL(/\/hats/);
  for (const h of ["red", "black", "yellow", "green", "blue", "white"]) {
    await page.click(`.hatcard:has-text("${({ red: "אדום", black: "שחור", yellow: "צהוב", green: "ירוק", blue: "כחול", white: "לבן" })[h]}")`);
    if (!page.url().includes(`hat=${h}`)) fail(`hat param ${h}`);
  }
  ok("hat explorer updates the URL");
  await page.click(".hatcard:has-text('ירוק')");
  await noHScroll(page, `${tag} hats`);
  await shot("02-hats");

  // copy link
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  if (mobile) { await page.click(".topbar__menu"); await page.click(".mobile-menu >> text=העתקת קישור"); }
  else await page.click(".topnav >> text=העתקת קישור");
  await page.waitForSelector(".toast");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  clip.includes("hat=green") ? ok("copy link holds the hat") : fail(`clipboard: ${clip}`);

  // brand -> home
  await page.click(".brand");
  await page.waitForURL(BASE + "/");
  ok("brand links home");

  // start
  await page.goto(BASE + "/start");
  (await page.locator("text=התחל את המסע").isDisabled()) ? ok("start disabled when empty") : fail("start enabled when empty");
  await page.fill("#goal", "קצר מדי");
  await page.click("text=התחל את המסע");
  (await page.isVisible("[role=alert]")) ? ok("short goal rejected") : fail("short goal accepted");
  await page.fill("#goal", GOAL);
  await page.click("text=התחל את המסע");
  await page.waitForURL(/\/map/);
  await shot("03-map");
  await page.click("text=כניסה לחדר הראשון");

  // white
  await page.waitForURL(/room\/white/);
  const nextBtn = page.locator(".room-foot .btn--hat");
  if (await nextBtn.isEnabled()) fail("white next enabled too early");
  for (const t of ["יש לי חיסכון לחצי שנה", "יש לי תואר בעיצוב פנים", "הלקוחות ישלמו מחיר מלא"]) {
    await page.fill(".card input.field", t);
    await page.click("text=הוסף");
  }
  let flip = 0;
  while (await page.locator(".item__acts >> text=יודע").count()) {
    await page.locator(".item__acts").first().locator(flip++ % 2 ? "text=מניח" : "text=יודע").click();
    await page.waitForTimeout(60);
  }
  await noHScroll(page, `${tag} white`);
  await shot("04-white");
  await nextBtn.click();

  // red
  await page.waitForURL(/room\/red/);
  const ta = page.locator("textarea");
  await ta.click();
  await page.keyboard.type("אני מתרגש מאוד אבל גם מפחד וחושש שזה ייכשל ולא יהיה לי כסף בסוף החודש ואני לא בטוח שאני מסוגל לעשות את זה לבד בלי עזרה מאף אחד בכלל באמת");
  await page.keyboard.press("Backspace");
  const v = await ta.inputValue();
  v.endsWith("באמת") ? ok("red room blocks deletion") : fail("deletion allowed");
  await page.click("text=סיים עכשיו");
  await page.waitForSelector("text=הרגש הדומיננטי");
  await page.click(".seg >> text=חלקית");
  await page.click(".chip:has-text('פחד')");
  await shot("05-red");
  await nextBtn.click();

  // black
  await page.waitForURL(/room\/black/);
  const risks = [["אין מספיק לקוחות בשנה הראשונה", 5, 5], ["העבודה הנוכחית לא תשאיר זמן", 4, 4], ["שכירות גבוהה מדי לסטודיו", 3, 4], ["מתחרים זולים יותר בעיר", 3, 2]];
  for (const [t, p, i] of risks) {
    await page.click(`.cell[aria-label^="הסתברות ${p}, השפעה ${i},"]`);
    await page.fill("#risk", t);
    await page.click("text=הוסף למפה");
  }
  const plans = page.locator("textarea.field");
  await plans.nth(0).fill("אציע חבילת ייעוץ קצרה במחיר כניסה");
  await plans.nth(1).fill("אקצה שני ערבים קבועים בשבוע לסטודיו");
  await noHScroll(page, `${tag} black`);
  await shot("06-black");
  if (!(await nextBtn.isEnabled())) fail("black next disabled");
  await nextBtn.click();

  // yellow
  await page.waitForURL(/room\/yellow/);
  const yv = page.locator("textarea.field");
  await yv.nth(0).fill("גם מעט לקוחות בשנה הראשונה יבנו לי תיק עבודות אמיתי ומוניטין בעיר");
  await yv.nth(1).fill("עבודה בערבים בלבד מכריחה אותי לבחור רק פרויקטים שבאמת מתאימים לסטודיו");
  await shot("07-yellow");
  await nextBtn.click();

  // green
  await page.waitForURL(/room\/green/);
  const gf = () => page.locator("textarea.field");
  await gf().nth(0).fill("לקבל כל פרויקט ולא לסרב לאף אחד");
  await gf().nth(1).fill("להתמחות בנישה אחת של דירות קטנות");
  await page.click("role=tab[name=/אנלוגיה/]");
  await page.click(".chip:has-text('אדריכלות')");
  await gf().nth(0).fill("לבנות את הסטודיו במודולים, שירות אחד בכל רבעון");
  await page.click("role=tab[name=/הגזמה/]");
  await gf().nth(0).fill("לפתוח חלל תצוגה גדול במרכז העיר");
  await gf().nth(1).fill("תצוגה זמנית בבית קפה שכונתי לחודש");
  await page.locator(".seg").first().locator("text=ישים").click();
  await page.locator(".seg").nth(1).locator("text=מעניין").click();
  await shot("08-green");
  await nextBtn.click();

  // blue
  await page.waitForURL(/room\/blue/);
  await page.fill("#step", "אתקשר לשלושה לקוחות שמחכים ואציע להם חבילת ייעוץ קצרה עד יום שלישי בערב");
  await page.locator("button.item").first().click();
  const con = await page.inputValue("#con");
  con.length > 5 ? ok("contingency prefilled from black hat") : fail("contingency not prefilled");
  await noHScroll(page, `${tag} blue`);
  await shot("09-blue");
  if (!(await nextBtn.isEnabled())) fail("blue next disabled");
  await nextBtn.click();

  // summary
  await page.waitForURL(/summary/);
  await page.waitForSelector(".contract__step");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=תזכורת ביומן לעוד שבוע")]);
  const ics = fs.readFileSync(await dl.path(), "utf8");
  ics.includes("BEGIN:VEVENT") && ics.includes("אתקשר") ? ok("ics reminder") : fail("ics broken");
  await page.click("text=העתקת התכנית");
  const plan = await page.evaluate(() => navigator.clipboard.readText());
  plan.includes("כובע ירוק") ? ok("plan copy includes green hat") : fail("plan missing green");
  await noHScroll(page, `${tag} summary`);
  await shot("10-summary");

  // profile
  await page.goto(BASE + "/profile");
  await page.waitForSelector(".radar");
  await noHScroll(page, `${tag} profile`);
  await shot("11-profile");

  // persistence across reload
  await page.reload();
  (await page.locator(".history .card").count()) === 1 ? ok("journey persisted once") : fail("history count wrong");

  // theme toggle
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  before === (colorScheme === "dark" ? "obsidian" : "chalk") ? ok("theme follows system") : fail(`theme default ${before}`);
  if (mobile) { await page.click(".topbar__menu"); await page.click(".mobile-menu [aria-label='החלפת מצב תצוגה']"); }
  else await page.click(".topnav [aria-label='החלפת מצב תצוגה']");
  (await page.evaluate(() => document.documentElement.dataset.theme)) !== before ? ok("theme toggle") : fail("theme");
  await page.goto(BASE + "/");
  await shot("12-home-toggled");

  // week check-in banner
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("hats-v2"));
    s.state.journeys[0].completedAt -= 8 * 864e5;
    localStorage.setItem("hats-v2", JSON.stringify(s));
  });
  await page.reload();
  await page.click("text=עשיתי");
  await page.goto(BASE + "/profile");
  (await page.isVisible("text=100%")) ? ok("check-in feeds follow-through") : fail("check-in not counted");

  // locked room guard + 404
  await page.goto(BASE + "/room/nope");
  await page.waitForURL(/map/);
  await page.goto(BASE + "/missing-page");
  (await page.isVisible("text=החדר הזה לא קיים")) ? ok("404") : fail("404");

  if (!mobile) {
    const cdp = await ctx.newCDPSession(page);
    await page.goto(BASE + "/");
    await page.waitForTimeout(1500);
    const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
    installabilityErrors.length ? fail(`installability: ${JSON.stringify(installabilityErrors)}`) : ok("installable (no errors)");
  }
  await browser.close();
}

await run({ width: 1440, height: 900 }, "desktop", "dark");
await run({ width: 390, height: 844 }, "mobile", "light");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
console.log(process.exitCode ? "E2E FAILED" : "E2E PASSED");
