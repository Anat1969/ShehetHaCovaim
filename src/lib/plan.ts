import type { Journey } from "@/store/game";
import { buildHybrids, isHigh } from "@/lib/heuristics";
import { HAT } from "@/lib/hats";

export type PlanBlock = { hat: keyof typeof HAT; title: string; lines: string[] };

export function planBlocks(j: Journey): PlanBlock[] {
  const r = j.rooms;
  const hybrids = buildHybrids(r.green.ideas).filter((h) => r.green.ratings[h.id] === "applicable");
  const conf = r.red.confirmed === "yes" ? "מדויק" : r.red.confirmed === "partial" ? "מדויק חלקית" : "לא מדויק";
  const highRisks = r.black.risks.filter(isHigh);
  return [
    { hat: "white", title: "עובדות שאפשר לבנות עליהן", lines: r.white.items.filter((i) => i.bucket === "knows").map((i) => i.text) },
    { hat: "white", title: "הנחות שכדאי לבדוק", lines: r.white.items.filter((i) => i.bucket === "assumes").map((i) => i.text) },
    { hat: "red", title: "הרגש שמלווה את המטרה", lines: r.red.emotion ? [`${r.red.emotion} (לפי תחושתך: ${conf})`] : [] },
    { hat: "black", title: "סיכונים מרכזיים", lines: (highRisks.length ? highRisks : r.black.risks).slice(0, 3).map((x) => x.contingency ? `${x.text}. מגירה: ${x.contingency}` : x.text) },
    { hat: "yellow", title: "למה זה שווה את זה", lines: r.yellow.values.filter((v) => v.approved).map((v) => v.text) },
    { hat: "green", title: "רעיונות ישימים", lines: hybrids.length ? hybrids.map((h) => `${h.label}: ${h.a} + ${h.b}`) : [r.green.ideas.reverse2, r.green.ideas.exaggerate2].filter(Boolean) },
    {
      hat: "blue", title: "תכנית הפעולה",
      lines: [
        `הצעד הבא: ${r.blue.nextStep}`,
        `המחסום הצפוי: ${r.black.risks.find((x) => x.id === r.blue.obstacleRiskId)?.text || "לא נבחר"}`,
        `כשהוא מגיע: ${r.blue.contingency}`,
      ],
    },
  ];
}

export function planText(j: Journey) {
  const blocks = planBlocks(j).filter((b) => b.lines.length);
  return [
    "ששת הכובעים | תכנית פעולה",
    "",
    `המטרה: ${j.goalText}`,
    "",
    ...blocks.flatMap((b) => [`${HAT[b.hat].name} | ${b.title}`, ...b.lines.map((l) => `- ${l}`), ""]),
  ].join("\n");
}

function icsDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

/** A calendar event 7 days after completion, to check in on the committed step. */
export function checkInIcs(j: Journey, appUrl: string) {
  const start = new Date((j.completedAt ?? Date.now()) + 7 * 864e5);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 15 * 60e3);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//shehet-hacovaim//he",
    "BEGIN:VEVENT",
    `UID:${j.id}@shehet-hacovaim`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc("בדיקה: האם עשיתי את הצעד?")}`,
    `DESCRIPTION:${esc(`${j.rooms.blue.nextStep}\n\nהמטרה: ${j.goalText}\n\n${appUrl}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
