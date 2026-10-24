import type { HatId } from "@/store/game";

export type HatInfo = {
  id: HatId;
  name: string;
  short: string;
  subtitle: string;
  skill: string;
  task: string;
  why: string;
  traits: string[];
  questions: string[];
  order: number;
};

export const HATS: HatInfo[] = [
  {
    id: "white", name: "כובע לבן", short: "לבן", subtitle: "עובדות ונתונים", skill: "הפרדת עובדה מהנחה",
    task: "מיין כל משפט: יודע בוודאות, או מניח.",
    why: "רוב ההחלטות הגרועות נשענות על הנחה שהתחפשה לעובדה. כאן מפרידים ביניהן לפני שבונים עליהן.",
    traits: ["ניטרלי ואובייקטיבי לחלוטין", "מבוסס עובדות ונתונים בלבד", "מפריד בין עובדה להנחה", "מדייק ומזהה פערי מידע"],
    questions: ["מה אנחנו יודעים בוודאות?", "אילו נתונים יש ברשותנו עכשיו?", "מה חסר לנו כדי להחליט?", "מה ניתן לאמת ומה לא?"],
    order: 1,
  },
  {
    id: "red", name: "כובע אדום", short: "אדום", subtitle: "רגשות ואינטואיציה", skill: "הקשבה לרגש",
    task: "90 שניות של כתיבה חופשית, בלי מחיקה.",
    why: "הרגש משפיע על ההחלטה גם כשמתעלמים ממנו. כשהוא כתוב מול העיניים, אפשר לשקלל אותו במקום להיגרר אחריו.",
    traits: ["מביע רגשות ואינטואיציה ישירות", "לא מצריך הצדקה לוגית", "כנה ולא מסונן", "מגלה מה הבטן אומרת"],
    questions: ["מה אתה מרגיש לגבי זה?", "מה האינטואיציה שלך אומרת?", "מה מפחיד אותך? מה מרגש?", "מה הבטן שלך אומרת עכשיו?"],
    order: 2,
  },
  {
    id: "black", name: "כובע שחור", short: "שחור", subtitle: "ביקורת וסיכונים", skill: "מיפוי סיכונים",
    task: "מקם סיכונים על מפת הסתברות והשפעה.",
    why: "סיכון שיש לו שם ומקום במפה הוא סיכון שאפשר לנהל. סיכון עמום הוא רק חרדה.",
    traits: ["ביקורתי, זהיר ומציאותי", "מזהה סיכונים לפני שהם קורים", "מונע כשלים ואכזבות", "חיוני, לא שלילי"],
    questions: ["מה יכול להיכשל כאן?", "מה הסיכונים שלא ראינו?", "למה זה לא יעבוד?", "מה החסרונות שמפספסים?"],
    order: 3,
  },
  {
    id: "yellow", name: "כובע צהוב", short: "צהוב", subtitle: "אופטימיות ויתרונות", skill: "זיהוי ערך",
    task: "לכל סיכון: מה עדיין נותן לזה ערך.",
    why: "אופטימיות שעונה ישירות לסיכון היא לא תקווה, היא נימוק. כך נבנית הסיבה להמשיך למרות הקושי.",
    traits: ["אופטימי וחיובי ממוקד", "מחפש ערך ופוטנציאל", "בונה ומעצים", "מאמין ביכולת לפתור"],
    questions: ["מה היתרונות שכאן?", "למה זה יכול לעבוד?", "מה ההזדמנויות שלא ראינו?", "מה הפוטנציאל האמיתי?"],
    order: 4,
  },
  {
    id: "green", name: "כובע ירוק", short: "ירוק", subtitle: "יצירתיות וחדשנות", skill: "ייצור רעיונות",
    task: "היפוך, אנלוגיה והגזמה, ואז הכלאה.",
    why: "רעיונות טובים נולדים מהתנגשות בין זוויות. שלוש טכניקות מייצרות חומר גלם, וההכלאה מוציאה ממנו כיוון.",
    traits: ["יצירתי, גמיש ופתוח", "בוחן אלטרנטיבות באומץ", "לא מפחד מהרעיון הלא אפשרי", "מחפש פריצת דרך"],
    questions: ["מה האלטרנטיבות האחרות?", "איך נוכל לעשות זאת אחרת?", "מה הרעיון הבלתי אפשרי?", "מה אם נעשה בדיוק ההפך?"],
    order: 5,
  },
  {
    id: "blue", name: "כובע כחול", short: "כחול", subtitle: "תהליך וניהול", skill: "תכנון פעולה",
    task: "צעד אחד, מחסום אחד, תגובה אחת.",
    why: "כל החשיבה שווה רק אם היא מסתיימת בפעולה שיש לה פועל ותאריך. כאן החוט נקשר.",
    traits: ["מאורגן, מנהל ומוביל", "שומר על מבנה התהליך", "מסכם ומחבר בין הכובעים", "מוביל לתוכנית פעולה"],
    questions: ["איפה אנחנו עכשיו?", "מה הצעד הבא שצריך לקרות?", "מה המסקנה שעולה?", "מה הוחלט ומה עדיין פתוח?"],
    order: 6,
  },
];

export const HAT: Record<HatId, HatInfo> = Object.fromEntries(HATS.map((h) => [h.id, h])) as Record<HatId, HatInfo>;

export const hatColor = (h: HatId) => `var(--hat-${h})`;

export const HAT_FACES: Record<HatId, JSX.Element> = {
  white: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <rect x="26" y="7" width="28" height="21" rx="2" fill="#D4CFC7" />
      <rect x="16" y="27" width="48" height="5" rx="1.5" fill="#C0BCB4" />
      <rect x="35" y="3" width="10" height="5" rx="1" fill="#C8C4BC" />
      <circle cx="40" cy="60" r="24" fill="#ECEAE4" stroke="#C8C4BC" strokeWidth="1.5" />
      <circle cx="31" cy="56" r="4" fill="#2C2C2A" />
      <circle cx="49" cy="56" r="4" fill="#2C2C2A" />
      <circle cx="32.5" cy="54.5" r="1.8" fill="rgba(255,255,255,0.6)" />
      <circle cx="50.5" cy="54.5" r="1.8" fill="rgba(255,255,255,0.6)" />
      <line x1="27" y1="49" x2="35" y2="49" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="49" x2="53" y2="49" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      <path d="M 33 67 Q 40 71 47 67" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  red: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <ellipse cx="40" cy="19" rx="21" ry="13" fill="#C0392B" />
      <ellipse cx="40" cy="30" rx="27" ry="5" fill="#A03020" />
      <circle cx="40" cy="60" r="24" fill="#F5CFCC" stroke="#C0392B" strokeWidth="1.5" />
      <circle cx="31" cy="55" r="5.5" fill="#2C2C2A" />
      <circle cx="49" cy="55" r="5.5" fill="#2C2C2A" />
      <circle cx="33" cy="53" r="2.2" fill="rgba(255,255,255,0.65)" />
      <circle cx="51" cy="53" r="2.2" fill="rgba(255,255,255,0.65)" />
      <path d="M 25 46 Q 31 41 37 45" stroke="#2C2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 43 45 Q 49 41 55 46" stroke="#2C2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 29 66 Q 40 76 51 66" stroke="#2C2C2A" strokeWidth="2" fill="#C0392B" strokeLinecap="round" />
    </svg>
  ),
  black: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <rect x="24" y="3" width="32" height="27" rx="2" fill="#3A3A37" />
      <rect x="11" y="30" width="58" height="5" rx="1.5" fill="#2C2C2A" />
      <circle cx="40" cy="60" r="24" fill="#DEDAD4" stroke="#6A6A67" strokeWidth="1.5" />
      <ellipse cx="31" cy="57" rx="5" ry="3.5" fill="#2C2C2A" />
      <ellipse cx="49" cy="57" rx="5" ry="3.5" fill="#2C2C2A" />
      <circle cx="33" cy="56" r="1.2" fill="rgba(255,255,255,0.5)" />
      <circle cx="51" cy="56" r="1.2" fill="rgba(255,255,255,0.5)" />
      <line x1="25" y1="47" x2="36" y2="51" stroke="#2C2C2A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="55" y1="47" x2="44" y2="51" stroke="#2C2C2A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 32 69 Q 40 64 48 69" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  yellow: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <rect x="26" y="10" width="28" height="18" rx="3" fill="#C8960C" />
      <ellipse cx="40" cy="29" rx="34" ry="7" fill="#B8860B" />
      <circle cx="40" cy="60" r="24" fill="#FFF4D0" stroke="#C8960C" strokeWidth="1.5" />
      <path d="M 26 55 Q 31 50 36 55" stroke="#2C2C2A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 44 55 Q 49 50 54 55" stroke="#2C2C2A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 27 47 Q 31 44 35 47" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 45 47 Q 49 44 53 47" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 28 65 Q 40 77 52 65" stroke="#2C2C2A" strokeWidth="2.5" fill="#C8960C" strokeLinecap="round" />
    </svg>
  ),
  green: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <path d="M 18 31 Q 22 8 40 9 Q 58 8 62 22 Q 66 29 60 31 Z" fill="#2E7D4F" />
      <ellipse cx="40" cy="31" rx="26" ry="6" fill="#256040" />
      <circle cx="40" cy="60" r="24" fill="#C8ECD8" stroke="#2E7D4F" strokeWidth="1.5" />
      <circle cx="30" cy="56" r="5.5" fill="#2C2C2A" />
      <circle cx="50" cy="56" r="3.5" fill="#2C2C2A" />
      <circle cx="32" cy="54" r="2.2" fill="rgba(255,255,255,0.65)" />
      <circle cx="51.5" cy="54.5" r="1.2" fill="rgba(255,255,255,0.6)" />
      <line x1="25" y1="48" x2="35" y2="49" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      <path d="M 44 46 Q 50 42 56 46" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 31 67 Q 42 73 51 65" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  blue: (
    <svg viewBox="0 0 80 90" aria-hidden="true">
      <rect x="22" y="17" width="36" height="14" rx="2" fill="#2257A0" />
      <rect x="9" y="31" width="62" height="5" rx="1.5" fill="#1A4A7A" />
      <rect x="36" y="10" width="8" height="8" rx="1" fill="#2257A0" />
      <line x1="40" y1="10" x2="60" y2="22" stroke="#1A4A7A" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="60" r="24" fill="#C4D4EC" stroke="#2257A0" strokeWidth="1.5" />
      <circle cx="31" cy="56" r="4.5" fill="#2C2C2A" />
      <circle cx="49" cy="56" r="4.5" fill="#2C2C2A" />
      <circle cx="32.5" cy="54.5" r="1.8" fill="rgba(255,255,255,0.65)" />
      <circle cx="50.5" cy="54.5" r="1.8" fill="rgba(255,255,255,0.65)" />
      <line x1="27" y1="48" x2="35" y2="47" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="47" x2="53" y2="48" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      <path d="M 34 67 Q 40 72 46 67" stroke="#2C2C2A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

export const TYPE_LABEL = { business: "עסקי", personal: "אישי", creative: "יצירתי" } as const;

export const DEV_CHAT_URL = "https://claude.ai/code/session_01TNpRzaHbYx4Q4rNR746kVo";
