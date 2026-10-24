import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useActiveJourney, useGame, HAT_ORDER, type HatId } from "@/store/game";
import { HAT, HAT_FACES, hatColor } from "@/lib/hats";

type Props = {
  hat: HatId;
  children: ReactNode;
  feedback: string[];
  status: string;
  canContinue: boolean;
  score: () => number;
};

export function RoomShell({ hat, children, feedback, status, canContinue, score }: Props) {
  const nav = useNavigate();
  const j = useActiveJourney()!;
  const completeRoom = useGame((s) => s.completeRoom);
  const info = HAT[hat];
  const idx = HAT_ORDER.indexOf(hat);
  const next = HAT_ORDER[idx + 1];

  function proceed() {
    if (!canContinue) return;
    completeRoom(hat, score());
    nav(next ? `/room/${next}` : "/summary");
  }

  return (
    <main className="page" style={{ ["--hat" as string]: hatColor(hat), paddingBottom: 24 }}>
      <div className="progress" aria-label={`חדר ${idx + 1} מתוך 6`}>
        {HAT_ORDER.map((h, i) => (
          <span key={h} style={{ ["--hat" as string]: hatColor(h) }}>
            <motion.i initial={false} animate={{ scaleX: j.rooms[h].completed ? 1 : i === idx ? 0.35 : 0 }} transition={{ duration: 0.5 }} />
          </span>
        ))}
      </div>

      <div className="room-head">
        <motion.div className="room-head__face" initial={{ y: -30, rotate: -12, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
          {HAT_FACES[hat]}
        </motion.div>
        <div>
          <p className="eyebrow">חדר {idx + 1} מתוך 6, {info.skill}</p>
          <h1 className="title" style={{ color: "var(--hat)", marginTop: 8 }}>{info.name}</h1>
          <p style={{ fontSize: 18, fontWeight: 300, marginTop: 6, color: "var(--fg-2)" }}>{info.task}</p>
        </div>
      </div>

      <div className="room-grid">
        <section className="stack" style={{ ["--gap" as string]: "26px" }}>
          <div className="card goalstrip">
            <span className="eyebrow">המטרה</span>
            <p>{j.goalText}</p>
          </div>
          <div className="why">{info.why}</div>
          {children}
        </section>

        <aside className="card mirror" aria-live="polite">
          <p className="eyebrow" style={{ marginBottom: 14 }}>המראה</p>
          {feedback.length === 0 ? (
            <p className="muted" style={{ fontSize: 14.5 }}>המשוב מופיע כאן תוך כדי עבודה.</p>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {feedback.map((f) => (
                  <motion.li key={f} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} layout>
                    {f}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </aside>
      </div>

      <footer className="room-foot">
        <Link to="/map" className="btn btn--ghost btn--sm">למפה</Link>
        <span className="mono muted" style={{ fontSize: 13 }}>{status}</span>
        <span className="spacer" />
        <button className="btn btn--hat" style={{ ["--on-hat" as string]: `var(--on-hat-${hat})` }} onClick={proceed} disabled={!canContinue}>
          {next ? `לכובע ה${HAT[next].short}` : "לתכנית הפעולה"}
        </button>
      </footer>
    </main>
  );
}
