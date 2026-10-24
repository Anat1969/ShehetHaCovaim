import type { RoomsState, Risk, WhiteItem, GoalType, GreenIdeas, HybridRating } from "@/store/game";

export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
export const isHigh = (r: Risk) => r.probability >= 4 && r.impact >= 4;

// === Topic classification ===
const BUSINESS_KW = ["עסק", "סטארטאפ", "לקוח", "מכירות", "הכנסה", "מוצר", "שוק", "צוות", "חברה", "קמפיין", "השקעה", "רווח", "משרד", "פרויקט"];
const CREATIVE_KW = ["ספר", "סרט", "שיר", "אומנות", "אמנות", "עיצוב", "יצירה", "קליפ", "פודקאסט", "מותג", "לכתוב", "ליצור", "תערוכה"];
const PERSONAL_KW = ["אני", "משפחה", "זוגיות", "ילד", "ילדים", "בריאות", "ספורט", "משקל", "להפסיק", "להתחיל", "ללמוד", "קריירה", "שינה"];

export function classifyGoal(text: string): { type: GoalType; complexity: number } {
  const score = (kws: string[]) => kws.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
  const b = score(BUSINESS_KW), c = score(CREATIVE_KW), p = score(PERSONAL_KW);
  let type: GoalType = "personal";
  if (b >= c && b >= p && b > 0) type = "business";
  else if (c >= b && c >= p && c > 0) type = "creative";
  const complexity = Math.min(5, Math.max(1, Math.round(words(text).length / 12)));
  return { type, complexity };
}

// === White hat ===
const ASSUMPTION_MARKERS = ["ברור ש", "תמיד", "אף פעם", "כולם יודעים", "בוודאי", "ללא ספק", "כל אחד", "אין סיכוי", "בטוח ש", "כנראה", "אולי", "נראה לי"];

const FALLBACK_ITEMS = [
  "אני יודע מי קהל היעד שלי",
  "יש לי לוח זמנים ברור",
  "התקציב שלי מוגדר",
  "יש לי את הזמן הפנוי לזה",
  "האנשים סביבי יתמכו בזה",
  "כבר ניסו משהו דומה בעבר",
];

export const isAssumption = (text: string) => ASSUMPTION_MARKERS.some((m) => text.includes(m));

export function extractWhiteItems(goal: string): WhiteItem[] {
  const sentences = goal
    .split(/[.!?\n,;]/)
    .map((s) => s.trim())
    .filter((s) => words(s).length >= 3);
  const need = Math.max(0, 6 - sentences.length);
  const base = [...sentences, ...FALLBACK_ITEMS.slice(0, need)];
  return base.map((text, i) => ({
    id: `w-${i}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    bucket: "unsorted" as const,
    assumption: isAssumption(text),
  }));
}

export function whiteFeedback(items: WhiteItem[]) {
  const fb: string[] = [];
  const sorted = items.filter((i) => i.bucket !== "unsorted");
  const knows = items.filter((i) => i.bucket === "knows");
  const assumes = items.filter((i) => i.bucket === "assumes");
  const knownAssumptions = knows.filter((i) => i.assumption);
  if (knownAssumptions.length > 0) fb.push(`${knownAssumptions.length} פריטים עם מילות הנחה סווגו כעובדה. בדוק שוב.`);
  if (sorted.length > 0 && sorted.length < items.length) fb.push(`סווגו ${sorted.length} מתוך ${items.length} פריטים.`);
  if (sorted.length >= 2 && assumes.length === 0) fb.push("הכול נראה ודאי? זה בדרך כלל סימן שיש הנחה מוסתרת.");
  if (knows.length >= 3 && assumes.length >= 3) fb.push("חלוקה מאוזנת בין ידוע למשוער.");
  if (items.length < 6) fb.push("הוסף עוד פריטים משלך. צריך לפחות 3 בכל עמודה.");
  return fb;
}

export function whiteScore(items: WhiteItem[]) {
  if (items.length === 0) return 0;
  const sorted = items.filter((i) => i.bucket !== "unsorted").length;
  const knows = items.filter((i) => i.bucket === "knows");
  const balance = Math.min(knows.length, items.filter((i) => i.bucket === "assumes").length) >= 2 ? 20 : 0;
  const penalty = knows.filter((i) => i.assumption).length * 5;
  return Math.max(0, Math.min(100, Math.round((sorted / items.length) * 80 + balance - penalty)));
}

// === Red hat ===
export const EMOTIONS = ["פחד", "התרגשות", "ספק", "ביטחון", "עייפות"] as const;
const EMO_MARKERS: Record<string, string[]> = {
  פחד: ["פחד", "מפחד", "חושש", "מודאג", "חרדה", "אימה", "אסון", "ייכשל", "אם לא", "לחץ", "לחוץ"],
  התרגשות: ["התרגשות", "מתרגש", "מצפה", "כיף", "אנרגיה", "סוף סוף", "סוף-סוף", "מדהים", "שמח", "רוצה"],
  ספק: ["ספק", "אולי", "לא בטוח", "מתלבט", "תוהה", "באמת", "לא יודע"],
  ביטחון: ["בטוח", "יודע", "אצליח", "ברור", "פשוט", "אעשה", "מסוגל"],
  עייפות: ["עייף", "תקוע", "כבד", "אין כוח", "נשרף", "מותש", "דחיינות", "דוחה"],
};

export function analyzeRed(text: string): { pie: Record<string, number>; dominant: string } {
  const counts: Record<string, number> = {};
  for (const [emo, kws] of Object.entries(EMO_MARKERS)) counts[emo] = kws.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pie: Record<string, number> = {};
  Object.entries(counts).forEach(([k, v]) => (pie[k] = total === 0 ? 20 : Math.round((v / total) * 100)));
  const dominant = total === 0 ? "לא מובחן" : Object.entries(pie).sort((a, b) => b[1] - a[1])[0][0];
  return { pie, dominant };
}

export function redLiveFeedback(text: string): string[] {
  if (words(text).length < 8) return [];
  const { pie, dominant } = analyzeRed(text);
  if (dominant === "לא מובחן") return ["עדיין לא מזוהה רגש ברור. כתוב איך זה מרגיש, לא מה אתה חושב."];
  const fb = [`${pie[dominant]}% מהמילים הרגשיות שלך שייכות ל${dominant}.`];
  if (pie["פחד"] >= 40) fb.push("הפחד תופס נפח גדול. הכובע השחור יעזור לתת לו שם ומקום.");
  if (pie["התרגשות"] >= 40) fb.push("יש כאן אנרגיה. שמור אותה לכובע הירוק.");
  return fb;
}

export function redScore(text: string, confirmed: "yes" | "no" | "partial" | null) {
  const wordBonus = Math.min(20, Math.floor(words(text).length / 5));
  const confirmBonus = confirmed === "yes" ? 20 : confirmed === "partial" ? 10 : 5;
  return Math.min(100, 60 + wordBonus + confirmBonus);
}

// === Black hat ===
export function blackFeedback(risks: Risk[]) {
  const fb: string[] = [];
  const high = risks.filter(isHigh);
  const withPlan = risks.filter((r) => (r.contingency || "").trim().length >= 5);
  if (risks.length > 0 && risks.length < 4) fb.push(`${risks.length} סיכונים. צריך לפחות 4.`);
  if (high.length === 0 && risks.length >= 2) fb.push("אין עדיין סיכון בריבוע גבוה־גבוה. מה התרחיש הגרוע ביותר?");
  if (high.length > 0) fb.push(`${high.length} סיכונים בריבוע גבוה־גבוה. כל אחד דורש תכנית מגירה.`);
  if (risks.length >= 4 && withPlan.length < 2) fb.push("רק חלק מהסיכונים קיבלו תכנית מגירה. צריך לפחות 2.");
  return fb;
}

export function blackScore(risks: Risk[]) {
  const high = risks.filter(isHigh).length;
  const withPlan = risks.filter((r) => (r.contingency || "").length >= 5).length;
  return Math.min(100, Math.min(60, risks.length * 12) + Math.min(20, high * 10) + Math.min(20, withPlan * 8));
}

// === Yellow hat ===
export function yellowValueFeedback(text: string, riskText: string): string {
  const n = words(text).length;
  if (n === 0) return "";
  if (n < 8) return `${n} מילים. צריך לפחות 8 כדי שזה יהיה ספציפי.`;
  const overlap = words(riskText).filter((w) => w.length > 3 && text.includes(w)).length;
  return overlap >= 1 ? "הערך מחובר ישירות לסיכון." : "נסה לקשר את הערך לסיכון הספציפי.";
}

// === Green hat ===
export type Hybrid = { id: string; label: string; a: string; b: string; text: string };

export function buildHybrids(ideas: GreenIdeas): Hybrid[] {
  const parts = [
    { id: "rev-ana", label: "היפוך ואנלוגיה", a: ideas.reverse2, b: ideas.analogyAnswer },
    { id: "ana-exa", label: "אנלוגיה והגזמה", a: ideas.analogyAnswer, b: ideas.exaggerate2 },
    { id: "exa-rev", label: "הגזמה והיפוך", a: ideas.exaggerate2, b: ideas.reverse2 },
  ];
  return parts
    .filter((p) => p.a.trim() && p.b.trim())
    .map((p) => ({ ...p, text: `מה יקרה אם תשלב את "${shorten(p.a)}" עם "${shorten(p.b)}"?` }));
}
function shorten(s: string) {
  const t = s.trim();
  return t.length > 60 ? t.slice(0, 60) + "..." : t;
}

export function greenCardsDone(ideas: GreenIdeas) {
  return (
    (ideas.reverse1.trim() && ideas.reverse2.trim() ? 1 : 0) +
    (ideas.analogyDomain && ideas.analogyAnswer.trim() ? 1 : 0) +
    (ideas.exaggerate1.trim() && ideas.exaggerate2.trim() ? 1 : 0)
  );
}

export function greenScore(hybrids: Hybrid[], ratings: Record<string, HybridRating>, cardsDone: number) {
  const rated = hybrids.filter((h) => ratings[h.id]).length;
  const applicable = hybrids.filter((h) => ratings[h.id] === "applicable").length;
  return Math.min(100, cardsDone * 25 + rated * 5 + applicable * 15);
}

// === Blue hat ===
const DATE_MARKERS = ["מחר", "היום", "השבוע", "ביום", "תוך", "עד ", "בשעה", "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "בבוקר", "בערב", "בצהריים", "החודש", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const NOT_VERBS = ["אני", "אם", "אבל", "או", "אחרי", "אחר", "אז", "אצל", "אחד", "אחת", "אין", "איך", "אולי", "אותו", "אותה", "אלה", "אלו", "אתה", "את", "אנחנו", "אפשר", "אל", "אצלי", "אותי"];

/** Hebrew first person future tense opens with א: "אכתוב", "אתקשר", "אקבע". */
export function findActionVerb(step: string): string | null {
  const ws = words(step.replace(/[.,!?;:"]/g, " "));
  return ws.find((w) => /^א[א-ת]{2,}$/.test(w) && !NOT_VERBS.includes(w)) ?? null;
}

export function validateBlueStep(step: string) {
  const hasVerb = !!findActionVerb(step);
  const hasDate = DATE_MARKERS.some((d) => step.includes(d)) || /\d/.test(step);
  return { hasVerb, hasDate, ok: hasVerb && hasDate };
}

export function validateBlueContingency(text: string) {
  const passive = ["אחשוב", "אבדוק", "אראה", "אנסה"];
  if (text.trim().length < 8) return { ok: false, msg: "קצר מדי. תאר פעולה ממשית." };
  if (passive.some((p) => text.includes(p)) && words(text).length < 6) return { ok: false, msg: "פעולה רכה מדי. מה תעשה בפועל?" };
  return { ok: true, msg: "" };
}

export function priorCorpus(rooms: RoomsState) {
  return [
    ...rooms.white.items.map((i) => i.text),
    rooms.red.text,
    ...rooms.black.risks.map((r) => `${r.text} ${r.contingency || ""}`),
    ...rooms.yellow.values.map((v) => v.text),
    rooms.green.ideas.reverse2,
    rooms.green.ideas.analogyAnswer,
    rooms.green.ideas.exaggerate2,
  ].join(" ");
}

export function connectedWords(step: string, rooms: RoomsState) {
  const corpus = priorCorpus(rooms);
  return Array.from(new Set(words(step).filter((w) => w.length > 3 && corpus.includes(w))));
}

export function blueScore(rooms: RoomsState) {
  const b = rooms.blue;
  let score = 0;
  if (validateBlueStep(b.nextStep).ok) score += 40;
  if (b.obstacleRiskId) score += 25;
  if (validateBlueContingency(b.contingency).ok) score += 25;
  if (connectedWords(b.nextStep, rooms).length >= 3) score += 10;
  return Math.min(100, score);
}
