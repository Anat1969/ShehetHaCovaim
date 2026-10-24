import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney } from "@/store/game";
import { analyzeRed, redLiveFeedback, redScore, words, EMOTIONS } from "@/lib/heuristics";

const DURATION = 90;
const EARLY_WORDS = 25;
const C = 2 * Math.PI * 44;

export default function RedRoom() {
  const room = useActiveJourney()!.rooms.red;
  const updateRoom = useGame((s) => s.updateRoom);
  const [left, setLeft] = useState(room.locked ? 0 : DURATION);
  const [running, setRunning] = useState(false);
  const text = room.text;

  useEffect(() => {
    if (!running || room.locked) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running, room.locked]);

  useEffect(() => {
    if (left === 0 && running && !room.locked) lock();
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  function lock() {
    const { pie, dominant } = analyzeRed(text);
    updateRoom("red", { locked: true, pie, emotion: dominant });
    setRunning(false);
    setLeft(0);
  }

  function onChange(v: string) {
    if (room.locked) return;
    // Append only: what was written stays written.
    if (!v.startsWith(text)) return;
    if (!running && v.length > 0) setRunning(true);
    updateRoom("red", { text: v });
  }

  const n = words(text).length;
  const progress = room.locked ? 1 : (DURATION - left) / DURATION;
  const canContinue = room.locked && room.confirmed !== null;
  const fb = redLiveFeedback(text);
  if (room.locked && room.confirmed === "no") fb.push("הניתוח פספס. בחר למטה את הרגש שמתאים יותר.");

  return (
    <RoomShell
      hat="red"
      feedback={fb}
      status={room.locked ? (room.confirmed ? "מוכן להמשך" : "ענה על שאלת הדיוק") : running ? `${left} שניות, ${n} מילים` : "הטיימר מתחיל עם האות הראשונה"}
      canContinue={canContinue}
      score={() => redScore(text, room.confirmed)}
    >
      <div className="card card--pad">
        <div className="timer">
          <motion.svg viewBox="0 0 100 100" width="104" height="104" style={{ rotate: -90 }} animate={running ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line-2)" strokeWidth="5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hat)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 6px var(--hat))" }} />
          </motion.svg>
          <div>
            <div style={{ fontSize: 44, fontWeight: 200, lineHeight: 1 }}>{room.locked ? "הסתיים" : left}</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {room.locked ? "הכתיבה נעולה" : "שניות. אין מחיקה, אין עריכה. רק מה שעולה."}
            </div>
            {running && !room.locked && n >= EARLY_WORDS && (
              <button className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={lock}>סיים עכשיו</button>
            )}
          </div>
        </div>
        <textarea
          className="field"
          style={{ marginTop: 20, minHeight: 200 }}
          rows={8}
          value={text}
          disabled={room.locked}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Backspace" || e.key === "Delete") e.preventDefault(); }}
          onPaste={(e) => e.preventDefault()}
          placeholder="מה אתה מרגיש כשאתה חושב על המטרה הזו?"
          aria-label="כתיבה חופשית"
        />
      </div>

      {room.locked && (
        <motion.div className="card card--pad card--deep" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">הרגש הדומיננטי</p>
          <h2 style={{ fontSize: 34, fontWeight: 300, color: "var(--hat)", margin: "6px 0 18px" }}>{room.emotion}</h2>
          <div className="bars">
            {Object.entries(room.pie).map(([k, v], i) => (
              <div key={k} className="bar">
                <span>{k}</span>
                <div className="bar__track">
                  <motion.div className="bar__fill" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }} />
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{v}%</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 24 }}>זה מדויק?</p>
          <div className="seg" style={{ marginTop: 10 }} role="group" aria-label="דיוק הניתוח">
            {(["yes", "partial", "no"] as const).map((v) => (
              <button key={v} aria-pressed={room.confirmed === v} onClick={() => updateRoom("red", { confirmed: v })}>
                {v === "yes" ? "כן" : v === "partial" ? "חלקית" : "לא"}
              </button>
            ))}
          </div>
          {(room.confirmed === "no" || room.confirmed === "partial") && (
            <div style={{ marginTop: 16 }}>
              <p className="muted" style={{ fontSize: 14.5, marginBottom: 8 }}>מה הרגש המדויק יותר?</p>
              <div className="row">
                {EMOTIONS.map((e) => (
                  <button key={e} className="chip" style={room.emotion === e ? { background: "var(--fg)", color: "var(--bg)" } : undefined} onClick={() => updateRoom("red", { emotion: e })}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </RoomShell>
  );
}
