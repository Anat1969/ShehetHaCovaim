import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney, type GreenIdeas, type HybridRating } from "@/store/game";
import { buildHybrids, greenCardsDone, greenScore } from "@/lib/heuristics";

const DOMAINS: Record<string, string> = {
  ספורט: "מאמני NBA פותרים בעיית מוטיבציה דרך מיקרו־מטרות יומיות במקום יעדי עונה.",
  טבע: "נמלים פותרות בעיות לוגיסטיקה בעזרת שבילי פרומונים: מסלול מוצלח מקבל חיזוק.",
  אמנות: "פיקאסו פירק את הצורה כדי לראות כמה זוויות בו בזמן.",
  ביולוגיה: "מערכת החיסון לומדת מחשיפה הדרגתית לאיומים מבוקרים.",
  אדריכלות: "גאודי בנה את סגרדה פמיליה (Sagrada Família) במודולים, כך שכל דור ממשיך מאיפה שהקודם עצר.",
};

const TABS = [
  { id: "reverse" as const, label: "היפוך" },
  { id: "analogy" as const, label: "אנלוגיה" },
  { id: "exaggerate" as const, label: "הגזמה" },
];

const RATINGS: { id: HybridRating; label: string }[] = [
  { id: "applicable", label: "ישים" },
  { id: "interesting", label: "מעניין" },
  { id: "irrelevant", label: "לא רלוונטי" },
];

export default function GreenRoom() {
  const room = useActiveJourney()!.rooms.green;
  const updateRoom = useGame((s) => s.updateRoom);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("reverse");
  const ideas = room.ideas;

  const setIdea = (k: keyof GreenIdeas, v: string) => updateRoom("green", { ideas: { ...ideas, [k]: v } });
  const rate = (id: string, r: HybridRating) => updateRoom("green", { ratings: { ...room.ratings, [id]: r } });

  const done = greenCardsDone(ideas);
  const hybrids = buildHybrids(ideas);
  const hasApplicable = hybrids.some((h) => room.ratings[h.id] === "applicable");
  const canContinue = done >= 2 && hasApplicable;
  const tabDone = {
    reverse: !!(ideas.reverse1.trim() && ideas.reverse2.trim()),
    analogy: !!(ideas.analogyDomain && ideas.analogyAnswer.trim()),
    exaggerate: !!(ideas.exaggerate1.trim() && ideas.exaggerate2.trim()),
  };

  const fb: string[] = [];
  if (done >= 1) fb.push(`${done}/3 טכניקות הושלמו.`);
  if (done >= 2 && hybrids.length === 0) fb.push("כדי לקבל הכלאה, מלא את השדה השני בכל טכניקה.");
  if (hybrids.length > 0) fb.push(`${hybrids.length} הכלאות נוצרו. דרג אותן.`);
  if (hybrids.length > 0 && !hasApplicable) fb.push("צריך לפחות הכלאה אחת שתסומן ישימה.");

  return (
    <RoomShell
      hat="green"
      feedback={fb}
      status={`${done}/3 טכניקות, ${hasApplicable ? "יש" : "אין"} הכלאה ישימה`}
      canContinue={canContinue}
      score={() => greenScore(hybrids, room.ratings, done)}
    >
      <div className="card" style={{ padding: "6px 22px 22px" }}>
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
              {tabDone[t.id] && <span className="mono" style={{ fontSize: 11, color: "var(--hat)", marginInlineStart: 6 }}>הושלם</span>}
              {tab === t.id && <motion.span layoutId="ink" className="tabs__ink" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.2 }} style={{ display: "grid", gap: 16, marginTop: 20 }}>
            {tab === "reverse" && (
              <>
                <Field label="אם היית רוצה שזה ייכשל בוודאות, מה היית עושה?" value={ideas.reverse1} onChange={(v) => setIdea("reverse1", v)} />
                <Field label="עכשיו הפוך: מה האסטרטגיה החיובית שעולה מזה?" value={ideas.reverse2} onChange={(v) => setIdea("reverse2", v)} />
              </>
            )}
            {tab === "analogy" && (
              <>
                <div>
                  <p className="label">בחר תחום רחוק</p>
                  <div className="row">
                    {Object.keys(DOMAINS).map((d) => (
                      <button key={d} className="chip" style={ideas.analogyDomain === d ? { background: "var(--hat)", color: "#fff", borderColor: "var(--hat)" } : undefined} onClick={() => setIdea("analogyDomain", d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {ideas.analogyDomain && <div className="example">דוגמה מ{ideas.analogyDomain}: {DOMAINS[ideas.analogyDomain]}</div>}
                <Field label="מי פתר בעיה דומה בתחום הזה, ואיך זה נראה אצלך?" value={ideas.analogyAnswer} onChange={(v) => setIdea("analogyAnswer", v)} />
              </>
            )}
            {tab === "exaggerate" && (
              <>
                <Field label="אם היה לך תקציב פי 10 ואפס מגבלות, מה היית עושה?" value={ideas.exaggerate1} onChange={(v) => setIdea("exaggerate1", v)} />
                <Field label="מה מזה אפשר לעשות ב־10% מהתקציב?" value={ideas.exaggerate2} onChange={(v) => setIdea("exaggerate2", v)} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {hybrids.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          <p className="eyebrow">הכלאות</p>
          {hybrids.map((h, i) => (
            <motion.div key={h.id} className="card" style={{ padding: 18, borderColor: room.ratings[h.id] === "applicable" ? "var(--hat)" : undefined }} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
              <p className="mono" style={{ fontSize: 12, color: "var(--hat)" }}>{h.label}</p>
              <p style={{ marginTop: 6 }}>{h.text}</p>
              <div className="seg" style={{ marginTop: 12 }} role="group" aria-label="דירוג ההכלאה">
                {RATINGS.map((r) => (
                  <button key={r.id} aria-pressed={room.ratings[h.id] === r.id} onClick={() => rate(h.id, r.id)}>{r.label}</button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </RoomShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea className="field" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
