import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useActiveJourney, useGame, HAT_ORDER, totalScoreOf } from "@/store/game";
import { HAT, HAT_FACES, hatColor } from "@/lib/hats";
import { planBlocks, planText, checkInIcs, download, copyText } from "@/lib/plan";
import { toast } from "@/components/toast";

export default function Summary() {
  const j = useActiveJourney();
  const finishJourney = useGame((s) => s.finishJourney);
  const allDone = !!j && HAT_ORDER.every((h) => j.rooms[h].completed);

  useEffect(() => {
    if (allDone) finishJourney();
  }, [allDone, finishJourney]);

  if (!j) return <Navigate to="/start" replace />;
  if (!allDone) return <Navigate to="/map" replace />;

  const total = j.totalScore ?? totalScoreOf(j.rooms);
  const blocks = planBlocks(j).filter((b) => b.lines.length);
  const obstacle = j.rooms.black.risks.find((r) => r.id === j.rooms.blue.obstacleRiskId);
  const C = 2 * Math.PI * 52;

  async function copyPlan() {
    toast((await copyText(planText(j!))) ? "התכנית הועתקה" : "ההעתקה נכשלה");
  }

  return (
    <main className="page page--narrow">
      <p className="eyebrow no-print">סיכום המסע</p>
      <h1 className="title" style={{ marginTop: 12 }}>תכנית הפעולה שלך</h1>
      <p className="muted" style={{ marginTop: 12, fontSize: 17 }}>{j.goalText}</p>

      <motion.section className="card card--deep contract" style={{ marginTop: 32 }} initial={{ opacity: 0, y: 24, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.7 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "start" }}>
          <div>
            <p className="eyebrow">הצעד הבא, תוך 7 ימים</p>
            <p className="contract__step">{j.rooms.blue.nextStep}</p>
          </div>
          <svg className="score-ring" viewBox="0 0 120 120" aria-label={`ציון כולל ${total}`}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line-2)" strokeWidth="6" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke="var(--hat-blue)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - total / 100) }} transition={{ duration: 1.2, delay: 0.3 }} transform="rotate(-90 60 60)" />
            <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="200" fill="var(--fg)">{total}</text>
            <text x="60" y="80" textAnchor="middle" fontSize="11" fill="var(--muted)">מתוך 100</text>
          </svg>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14 }}>
          <div>
            <p className="eyebrow">המחסום</p>
            <p style={{ marginTop: 4 }}>{obstacle?.text ?? "לא נבחר"}</p>
          </div>
          <div>
            <p className="eyebrow">כשהוא מגיע</p>
            <p style={{ marginTop: 4 }}>{j.rooms.blue.contingency}</p>
          </div>
        </div>
      </motion.section>

      <div className="row no-print" style={{ marginTop: 20 }}>
        <button className="btn btn--primary" onClick={() => download("בדיקת-צעד.ics", checkInIcs(j, window.location.origin), "text/calendar")}>תזכורת ביומן לעוד שבוע</button>
        <button className="btn btn--ghost" onClick={copyPlan}>העתקת התכנית</button>
        <button className="btn btn--ghost" onClick={() => window.print()}>הדפסה או PDF</button>
      </div>

      <section style={{ marginTop: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>שש השכבות</p>
        <div className="plan">
          {blocks.map((b, i) => (
            <motion.article key={b.title} className="card plan-block" style={{ ["--hat" as string]: hatColor(b.hat) }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <div className="plan-block__bar" />
              <div className="plan-block__body">
                <div className="row" style={{ alignItems: "center" }}>
                  <span style={{ width: 30, height: 34 }}>{HAT_FACES[b.hat]}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600 }}>{HAT[b.hat].name}</h3>
                  <span className="muted" style={{ fontSize: 14 }}>{b.title}</span>
                  <span className="spacer" />
                  {b.title !== "הנחות שכדאי לבדוק" && <span className="mono muted" style={{ fontSize: 12 }}>{j.rooms[b.hat].score}</span>}
                </div>
                <ul>{b.lines.map((l) => <li key={l}>{l}</li>)}</ul>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="row no-print" style={{ marginTop: 36 }}>
        <Link to="/profile" className="btn btn--ghost">לפרופיל החשיבה</Link>
        <Link to="/map" className="btn btn--ghost">חזרה לחדרים</Link>
        <Link to="/start" className="btn btn--ghost">מסע חדש</Link>
      </div>
    </main>
  );
}
