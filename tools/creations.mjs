// מפיק את public/creations.json: כתבות ויצירות מתוך התוכן של האפליקציה (תקן "יצירות", AppOfApp-GH/docs/creations-standard.md).
// הרצה: node tools/creations.mjs
// מקור: src/lib/hats.tsx (ששת הכובעים: משימה, למה, תכונות, שאלות, שפת גוף), והטקסטים שבחדרים ובדפים.
// כל משפט מהאפליקציה עובר בדיקה: הוא חייב להופיע כלשונו בקוד (src/). בקוד הזה כתובים רק שמות החדרים, התוויות וההייקו (מסומנים "הייקו מקורי").
// תמונות: הדמויות של האפליקציה (public/characters, נוצרו ב-Canva) על רקע חאקי, מוכנות ב-public/creations/img.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { build } from 'esbuild';

// הנתונים: hats.tsx נבנה זמנית ל-ESM ונטען כמו שהוא
const tmp = path.resolve('node_modules/.cache/creations-hats.mjs');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
await build({ entryPoints: ['src/lib/hats.tsx'], bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'error', alias: { '@': './src' } });
const { HATS, HAT } = await import(pathToFileURL(tmp).href);

// כל הטקסט של האפליקציה, לבדיקה שכל משפט מצוטט קיים בה
const SRC = (function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [fs.readFileSync(path.join(d, e.name), 'utf8')] : [])); })('src').join('\n');
const plain = (s) => String(s).replace(/\*\*|==/g, '');
const has = (s) => { if (!SRC.includes(plain(s))) throw new Error(`לא נמצא באפליקציה: ${plain(s)}`); return s; };
const a = (...parts) => parts.map(has).join(' ');

const IMG = (h) => ({ image: `creations/img/${h}.jpg`, credit: 'איור: הדמויות של ששת הכובעים, נוצרו ב-Canva לאפליקציה', pos: 'center 18%' });
const ask = (h, i) => ({ style: 'quote', quote: has(HAT[h].questions[i]), who: `${HAT[h].persona}, ${HAT[h].name}`, cite: `שאלה מרכזית, חדר ${HAT[h].order} מתוך 6` });
const haiku = (lines, text) => ({ style: 'haiku', lines, text: `הייקו מקורי. ${text}` });
const T = (id, zone, title, sub, creations, kicker) => ({ id, zone, title, sub, creations: creations.filter(Boolean).map((c) => ({ id: c.id || c.style, kicker: c.kicker || kicker, ...c })) });

const topics = [
  T('method', 'ידע', 'כל כובע הוא זווית אחת', has('שש זוויות חשיבה על מטרה אחת. בסוף המסע יש צעד אחד, עם תאריך, שאי אפשר לא לעשות.'), [
    { style: 'poster', title: 'ששת הכובעים', text: 'שיטת **אדוארד דה בונו** (Edward de Bono), **1985**', ...IMG('ensemble'), pos: 'center 40%' },
    { style: 'insight', title: 'לא חושבים על הכול בבת אחת', text: 'חובשים כובע אחד, מסתכלים דרכו עד הסוף, ועוברים לבא. ==הסדר כאן הוא סדר המסע.==' },
    { style: 'essay', title: 'איך זה עובד', text: has('כ־30 דקות, שישה חדרים, תכנית פעולה אחת.'), body: [
      `**מטרה אחת.** ${has('כותבים במשפטים פשוטים מה רוצים להשיג. לפחות עשר מילים.')}`,
      `**שישה חדרים.** ${has('בכל חדר כלי אחד: מיון, כתיבה חופשית, מפת סיכונים, ערך, רעיונות, תכנית.')}`,
      `**צעד אחד.** ${has('יוצאים עם פעולה שיש לה פועל ותאריך, מחסום צפוי ותגובה מוכנה.')}`,
      `**חוזרים אחרי שבוע.** ${has('בודקים מה קרה. הפרופיל לומד איזה כובע חזק אצלך ואיזה פחות.')}`,
    ] },
    { style: 'post', title: 'שש זוויות על מטרה אחת', text: HATS.map((h) => `**${h.name}:** ${h.subtitle}`).join('\n'), tags: ['ששת_הכובעים', 'דה_בונו', 'חשיבה'] },
    haiku(['כובע אחד על הראש', 'שש פעמים מחליפים', 'ובסוף צעד'], 'שש זוויות, **צעד** אחד.'),
  ], 'השיטה'),

  T('white-facts', 'ידע', 'עובדה או הנחה', HAT.white.why, [
    { style: 'poster', title: `${HAT.white.name}: ${HAT.white.persona}`, text: HAT.white.task, ...IMG('white') },
    ask('white', 0),
    { style: 'fromto', title: 'ממשפט אחד לשתי עמודות', fromLabel: 'מניח', from: has('נשמע נכון, עדיין לא נבדק.'), toLabel: 'יודע בוודאות', to: has('אפשר להראות הוכחה או מספר.'), text: a(HAT.white.questions[2], HAT.white.questions[3]) },
    { style: 'insight', title: 'הכול נראה ודאי?', text: `זה בדרך כלל סימן שיש ==${has('הנחה מוסתרת')}==.` },
    { style: 'essay', title: HAT.white.skill, text: HAT.white.task, body: [
      `**${HAT.white.traits[0]}.** ${HAT.white.traits[1]}.`, `**${HAT.white.traits[2]}.** ${HAT.white.traits[3]}.`, `**שפת גוף.** ${HAT.white.body}`,
    ] },
    haiku(['לוח צמוד לחזה', 'משפט אחד ועוד אחד', 'רק העט זז'], 'מה שיודעים **מימין**, מה שמניחים **משמאל**.'),
  ], HAT.white.name),

  T('red-feeling', 'הבנה', 'רגש שכתוב מול העיניים', HAT.red.why, [
    { style: 'veil', title: `${HAT.red.name}: ${HAT.red.persona}`, text: HAT.red.task.replace('90', '**90**'), ...IMG('red') },
    ask('red', 3),
    { style: 'insight', title: 'אין מחיקה, אין עריכה', text: `==${has('רק מה שעולה.')}== ${has('הטיימר מתחיל עם האות הראשונה')}.` },
    { style: 'fromto', title: 'כל רגש מוביל לכובע הבא', fromLabel: 'כשיש פחד', from: has('הפחד תופס נפח גדול. הכובע השחור יעזור לתת לו שם ומקום.'), toLabel: 'כשיש התרגשות', to: has('יש כאן אנרגיה. שמור אותה לכובע הירוק.'), text: `**${['פחד', 'התרגשות', 'ספק', 'ביטחון', 'עייפות'].map(has).join(', ')}**: חמשת הרגשות שהחדר מזהה.` },
    { style: 'essay', title: HAT.red.skill, text: HAT.red.task, body: [
      `**${HAT.red.traits[0]}.** ${HAT.red.traits[1]}.`, `**${HAT.red.traits[2]}.** ${HAT.red.traits[3]}.`, `**שפת גוף.** ${HAT.red.body}`,
    ] },
    haiku(['יד אחת על הלב', 'תשעים שניות בלי מחק', 'הבטן מדברת'], 'הרגש **כתוב**, ולכן אפשר לשקלל אותו.'),
  ], HAT.red.name),

  T('black-yellow', 'הבנה', 'סיכון וערך: השחור והצהוב', HAT.black.why, [
    { style: 'poster', title: `${HAT.black.name}: ${HAT.black.persona}`, text: `${HAT.black.traits[0]}. ==${HAT.black.traits[3]}.==`, ...IMG('black') },
    ask('black', 2),
    { style: 'fromto', title: has('הכובע הצהוב עונה לכובע השחור'), fromLabel: HAT.black.name, from: HAT.black.questions[0], toLabel: HAT.yellow.name, to: has('למרות הסיכון, מה עדיין נותן לזה ערך?'), text: HAT.yellow.why },
    { style: 'insight', title: HAT.black.task.replace(/\.$/, ''), text: `**הסתברות** ו**השפעה**, מ־**1** עד **5**. ${has('הפינה העליונה השמאלית היא הגבוה־גבוה.')}` },
    { style: 'essay', title: 'מפה, מגירה וערך', text: HAT.black.task, body: [
      `**תכנית מגירה.** ${has('חובה: מה תעשה אם זה קורה?')}`,
      `**${HAT.yellow.name}.** ${HAT.yellow.task}`,
      `**${HAT.yellow.persona}.** ${HAT.yellow.traits[1]}. ${HAT.yellow.traits[3]}.`,
    ] },
    haiku(['גבה אחת מורמת', 'וזרועות פתוחות לשמש', 'אותה דרך עצמה'], 'כל **סיכון** מקבל **ערך** שעונה לו.'),
  ], `${HAT.black.name} ו${HAT.yellow.name}`),

  T('green-ideas', 'הבנה', 'היפוך, אנלוגיה והגזמה', HAT.green.why, [
    { style: 'poster', title: `${HAT.green.name}: ${HAT.green.persona}`, text: HAT.green.body, ...IMG('green') },
    ask('green', 3),
    { style: 'fromto', title: 'מכישלון בטוח לאסטרטגיה', fromLabel: 'היפוך', from: has('אם היית רוצה שזה ייכשל בוודאות, מה היית עושה?'), toLabel: 'אסטרטגיה', to: has('עכשיו הפוך: מה האסטרטגיה החיובית שעולה מזה?'), text: 'הגזמה: תקציב פי **10** ואפס מגבלות. ואז: מה מזה אפשר לעשות ב־**10%** מהתקציב?' },
    { style: 'essay', title: 'אנלוגיות מתחומים רחוקים', text: has('מי פתר בעיה דומה בתחום הזה, ואיך זה נראה אצלך?'), body: [
      `**אדריכלות.** ${has('גאודי בנה את סגרדה פמיליה (Sagrada Família) במודולים, כך שכל דור ממשיך מאיפה שהקודם עצר.')}`,
      `**טבע.** ${has('נמלים פותרות בעיות לוגיסטיקה בעזרת שבילי פרומונים: מסלול מוצלח מקבל חיזוק.')}`,
      `**ספורט.** ${has('מאמני NBA פותרים בעיית מוטיבציה דרך מיקרו־מטרות יומיות במקום יעדי עונה.')}`,
    ] },
    { style: 'insight', title: 'שלוש טכניקות, הכלאה אחת', text: `==${has('צריך לפחות הכלאה אחת שתסומן ישימה.')}==` },
    haiku(['על רגל אחת', 'נבט קטן ביד', 'מה אם להפך'], 'רעיון נולד מ**התנגשות** בין זוויות.'),
  ], HAT.green.name),

  T('blue-step', 'יישום', 'צעד אחד עם תאריך', HAT.blue.why, [
    { style: 'poster', title: `${HAT.blue.name}: ${HAT.blue.persona}`, text: HAT.blue.task, ...IMG('blue') },
    ask('blue', 1),
    { style: 'fromto', title: 'מפעולה רכה לפעולה ממשית', fromLabel: 'רך מדי', from: `"${['אחשוב', 'אבדוק', 'אנסה'].map(has).join('", "')}". ${has('פעולה רכה מדי. מה תעשה בפועל?')}`, toLabel: 'ממשי', to: has('אתקשר לשלושה לקוחות פוטנציאליים עד יום שלישי בערב'), text: has('חסר פועל בגוף ראשון עתיד: אכתוב, אתקשר, אקבע.') },
    { style: 'insight', title: has('הצעד הבא שאי אפשר לא לעשות'), text: `פעולה אחת, תוך **7** ימים. ==${has('חסר מועד: מחר, השבוע, עד יום שלישי, או תאריך.')}==` },
    { style: 'essay', title: 'צעד, מחסום, תגובה', text: HAT.blue.task, body: [
      `**המחסום.** ${has('המחסום שאני כבר יודע שיגיע')}.`,
      `**התגובה.** ${has('מה אני עושה כשהוא מגיע. פעולה ממשית, לא')} "אחשוב על זה". ${has('השתמש בתכנית המגירה מהכובע השחור')}.`,
      `**החוט.** ${has('החוט, מה עלה עד עכשיו')}: ${has('מילים מהחדרים הקודמים.')}`,
    ] },
    haiku(['שרביט מורם', 'פועל אחד ותאריך', 'החוט נקשר'], 'החשיבה שווה רק כשהיא נגמרת ב**פעולה**.'),
  ], HAT.blue.name),

  T('goal', 'יישום', 'מטרה אחת, במשפטים פשוטים', has('כתוב כמו שזה בראש, עם הקשיים וההנחות. המשפטים שתכתוב יהפכו לחומר הגלם של הכובע הלבן.'), [
    { style: 'post', title: has('אין רעיון? התחל מדוגמה'), ...IMG('yellow'), pos: 'center 22%', text: [
      has('אני רוצה לפתוח סטודיו קטן לעיצוב פנים בעיר שלי תוך שנה, בלי לעזוב את העבודה הנוכחית עד שיהיו לי שלושה לקוחות קבועים.'),
      has('אני רוצה לכתוב ולהוציא ספר ילדים מאויר עד סוף השנה, למרות שאין לי ניסיון בהוצאה לאור ואין לי מאייר.'),
      has('אני רוצה לחזור לרוץ שלוש פעמים בשבוע ולהשתתף בריצת עשרה קילומטרים באביב, אחרי שנתיים בלי פעילות.'),
    ].join('\n'), tags: ['ששת_הכובעים', 'מטרה', 'מסע'] },
    { style: 'quote', quote: has('מה המטרה שאתה רוצה להשיג?'), who: 'ששת הכובעים', cite: 'פתיחת מסע חדש' },
    { style: 'insight', title: 'לפחות עשר מילים', text: `==${has('ככל שהמטרה מפורטת יותר, החדרים יעבדו טוב יותר.')}==` },
    { style: 'fromto', title: 'ממטרה כתובה לחומר גלם', fromLabel: 'המטרה', from: 'משפט עם הקשיים וההנחות, כמו שהוא בראש.', toLabel: HAT.white.name, to: HAT.white.task, text: HAT.white.why },
    haiku(['סטודיו קטן בעיר', 'שלושה לקוחות קבועים', 'מילה אחר מילה'], 'מטרה **מפורטת** היא חומר הגלם של המסע.'),
  ], 'מסע חדש'),

  T('week', 'יישום', 'חוזרים אחרי שבוע', has('בודקים מה קרה. הפרופיל לומד איזה כובע חזק אצלך ואיזה פחות.'), [
    { style: 'gradient', title: has('בדיקה: האם עשיתי את הצעד?'), text: `**${['עשיתי', 'חלקית', 'עוד לא'].map(has).join(' · ')}**. ${has('תזכורת ביומן לעוד שבוע')}.` },
    { style: 'quote', quote: has('אחרי המסע הראשון תראה את מפת הכובעים שלך. אחרי שלושה היא כבר אמינה.'), who: 'פרופיל החשיבה', cite: 'ששת הכובעים' },
    { style: 'insight', title: has('הפרופיל נבנה מהמסעות שתסיים.'), text: `==${has('אחרי שלושה התמונה תתייצב.')}==` },
    { style: 'fromto', title: 'משבוע אחד לכובע החלש', fromLabel: 'בדיקה של שבוע', from: `${has('התחייבת לצעד')}. ${has('מה קרה איתו?')}`, toLabel: 'המסע הבא', to: `${has('במסע הבא, תן זמן נוסף לכובע ה')}לבן: ${HAT.white.questions[0]}`, text: HAT.blue.why },
    { style: 'post', title: 'שבוע אחרי', ...IMG('ensemble'), pos: 'center 45%', text: [has('הצעד הבא, תוך 7 ימים'), has('בדיקה: האם עשיתי את הצעד?'), has('הפרופיל לומד איזה כובע חזק אצלך ואיזה פחות.')].join('\n'), tags: ['ששת_הכובעים', 'פרופיל_חשיבה'] },
    haiku(['שבעה ימים עברו', 'עשיתי, חלקית, עוד לא', 'המפה מתבהרת'], 'כל **בדיקה** מוסיפה שכבה לפרופיל.'),
  ], 'פרופיל החשיבה'),
];

// מאגר המקורות ל"יצירת כתבה": שלושה מקורות לכל כובע (ידע, הבנה, יישום) ואנלוגיה לכל תחום רחוק בחדר הירוק
const pool = [];
const P = (...args) => pool.push(T(...args));
for (const h of HATS) {
  const k = h.name;
  P(`${h.id}-traits`, 'ידע', `${h.name}: ${h.subtitle}`, `**${h.persona}.** ${h.skill}.`, [
    { style: 'poster', title: h.name, text: h.skill, ...IMG(h.id) },
    { style: 'insight', title: h.skill, text: h.why },
    ask(h.id, 0),
    { style: 'post', title: `${h.name}: ${h.persona}`, text: h.traits.join('\n'), tags: ['ששת_הכובעים', `כובע_${h.short}`] },
  ], k);
  P(`${h.id}-questions`, 'הבנה', `ארבע השאלות של ה${h.name}`, h.why, [
    ask(h.id, 1),
    { style: 'post', title: `השאלות של ה${h.name}`, text: h.questions.join('\n'), tags: ['ששת_הכובעים', `כובע_${h.short}`] },
    { style: 'insight', title: h.subtitle, text: h.task },
    { style: 'essay', title: h.persona, text: h.body, body: [`**${h.traits[0]}.** ${h.traits[1]}.`, `**${h.traits[2]}.** ${h.traits[3]}.`] },
    { style: 'veil', title: h.name, text: h.body, ...IMG(h.id) },
  ], k);
  P(`${h.id}-task`, 'יישום', `חדר ${h.order}: ${h.skill}`, h.task, [
    { style: 'veil', title: `${h.name}: ${h.persona}`, text: h.task, ...IMG(h.id) },
    { style: 'insight', title: h.skill, text: h.why },
    ask(h.id, 3),
    { style: 'gradient', title: h.persona, text: h.body },
  ], k);
}
const DOMAINS = { אדריכלות: 'גאודי בנה את סגרדה פמיליה (Sagrada Família) במודולים, כך שכל דור ממשיך מאיפה שהקודם עצר.', טבע: 'נמלים פותרות בעיות לוגיסטיקה בעזרת שבילי פרומונים: מסלול מוצלח מקבל חיזוק.', אמנות: 'פיקאסו פירק את הצורה כדי לראות כמה זוויות בו בזמן.', ביולוגיה: 'מערכת החיסון לומדת מחשיפה הדרגתית לאיומים מבוקרים.', ספורט: 'מאמני NBA פותרים בעיית מוטיבציה דרך מיקרו־מטרות יומיות במקום יעדי עונה.' };
Object.entries(DOMAINS).forEach(([d, s], i) => P(`analogy-${i + 1}`, 'הבנה', `אנלוגיה מ${d}`, has(s), [
  { style: 'veil', title: `אנלוגיה מ${d}`, text: s, ...IMG('green') },
  { style: 'insight', title: 'בחר תחום רחוק', text: has('מי פתר בעיה דומה בתחום הזה, ואיך זה נראה אצלך?') },
  ask('green', 1),
  { style: 'gradient', title: HAT.green.skill, text: HAT.green.why },
], HAT.green.name));

// בדיקות התקן
for (const t of [...topics, ...pool]) {
  const st = t.creations.map((c) => c.style);
  if (new Set(st).size !== st.length) throw new Error(`עיצוב חוזר: ${t.id}`);
  if (st.length < 4 || st.length > 6) throw new Error(`ב-${t.id} ${st.length} יצירות`);
  if (plain(t.title).split(/\s+/).length > 8) throw new Error(`כותרת ארוכה: ${t.title}`);
  for (const c of t.creations) {
    if (c.style === 'haiku' && c.lines.length !== 3) throw new Error(`הייקו: ${t.id}`);
    if (c.style === 'post' && c.text.split('\n').length > 6) throw new Error(`פוסט ארוך: ${t.id}`);
    if (c.image && !fs.existsSync(path.join('public', c.image))) throw new Error(`תמונה חסרה: ${c.image}`);
  }
}
if (topics.length < 6 || new Set(topics.map((t) => t.zone)).size < 3) throw new Error('צריך 6 חדרים לפחות ושלושה שלבים');
if (pool.length < 20) throw new Error(`מאגר קטן: ${pool.length}`);

// צבע לכל כובע: הכתבה של כובע מקבלת את צבע הכובע (צבעי מצב בהיר של האפליקציה)
const HUE = { white: '#857f74', red: '#c0392b', black: '#1f1f1e', yellow: '#b07f06', green: '#237a4a', blue: '#1f5aa6' };
const hueCSS = Object.entries(HUE).map(([h, c]) => `&[data-ar^="${h}"] .ar-in,&[data-ar^="pool:${h}"] .ar-in{--cr-a:${c};--cr-accent:${c}}`).join('');

const data = {
  app: {
    id: 'covaim', name: 'ששת הכובעים', url: 'https://shehet-hacovaim.vercel.app', repo: 'Anat1969/ShehetHaCovaim',
    description: 'כתבות מתוך מסע החשיבה של ששת הכובעים: כל כובע זווית אחת, וכל מסע נגמר בצעד אחד עם תאריך.',
    // פורמט "מגזין": תמונת הדמות על חאקי בשליש העליון, וצבע הכובע בכל כתבה
    article: { layout: 'magazine', css: `--cr-paper2:#efe7cc;& .ar-title{font-weight:300;letter-spacing:-.02em}& .ar-mg-hero{background:linear-gradient(180deg,#d8c793,#bfae7c)}${hueCSS}` },
    palette: {
      a: '#1f5aa6', b: '#c0392b', c: '#b07f06', s: '#237a4a', accent: '#1f5aa6', marker: '#f3d46a',
      ink: '#19191a', paper: '#fbfaf7', paper2: '#efe7cc', 'b-wash': '#f6e3df', 's-wash': '#e2f0e7',
      serif: '"IBM Plex Sans Hebrew", system-ui, sans-serif',
    },
  },
  topics,
  pool,
};
fs.writeFileSync('public/creations.json', JSON.stringify(data, null, 2) + '\n');
console.log(`${topics.length} חדרים, ${topics.reduce((n, t) => n + t.creations.length, 0)} יצירות, ${pool.length} מקורות במאגר`);
