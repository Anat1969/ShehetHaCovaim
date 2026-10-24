import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "@/store/game";
import { classifyGoal, words } from "@/lib/heuristics";
import { TYPE_LABEL } from "@/lib/hats";

const MIN = 10;

const EXAMPLES = [
  "אני רוצה לפתוח סטודיו קטן לעיצוב פנים בעיר שלי תוך שנה, בלי לעזוב את העבודה הנוכחית עד שיהיו לי שלושה לקוחות קבועים.",
  "אני רוצה לכתוב ולהוציא ספר ילדים מאויר עד סוף השנה, למרות שאין לי ניסיון בהוצאה לאור ואין לי מאייר.",
  "אני רוצה לחזור לרוץ שלוש פעמים בשבוע ולהשתתף בריצת עשרה קילומטרים באביב, אחרי שנתיים בלי פעילות.",
];

export default function Start() {
  const nav = useNavigate();
  const startJourney = useGame((s) => s.startJourney);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const n = words(text).length;
  const preview = n >= MIN ? classifyGoal(text) : null;

  function start() {
    if (n < MIN) {
      setError(`עוד ${MIN - n} מילים. ככל שהמטרה מפורטת יותר, החדרים יעבדו טוב יותר.`);
      return;
    }
    const { type, complexity } = classifyGoal(text);
    startJourney(text.trim(), type, complexity);
    nav("/map");
  }

  return (
    <main className="page page--narrow">
      <p className="eyebrow">שלב 0</p>
      <h1 className="title" style={{ marginTop: 12 }}>מה המטרה שאתה רוצה להשיג?</h1>
      <p className="muted" style={{ marginTop: 12, fontSize: 17 }}>
        כתוב כמו שזה בראש, עם הקשיים וההנחות. המשפטים שתכתוב יהפכו לחומר הגלם של הכובע הלבן.
      </p>

      <div className="card card--pad card--deep" style={{ marginTop: 32 }}>
        <label className="label" htmlFor="goal">המטרה</label>
        <textarea
          id="goal"
          className="field"
          rows={6}
          value={text}
          autoFocus
          placeholder="אני רוצה..."
          onChange={(e) => { setText(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start(); }}
        />
        <div style={{ marginTop: 14, height: 4, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: "var(--fg)", transformOrigin: "right" }} animate={{ scaleX: Math.min(1, n / MIN) }} initial={{ scaleX: 0 }} />
        </div>
        <div className="row mono" style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
          <span>{n} מילים{n < MIN ? ` מתוך ${MIN}` : ""}</span>
          <span className="spacer" />
          {preview && <span>סיווג: <b style={{ color: "var(--fg)" }}>{TYPE_LABEL[preview.type]}</b>, מורכבות {preview.complexity}/5</span>}
        </div>
        {error && <p role="alert" style={{ color: "var(--danger)", marginTop: 10, fontSize: 14.5 }}>{error}</p>}
        <div className="row" style={{ marginTop: 22 }}>
          <button className="btn btn--primary" onClick={start} disabled={n === 0}>התחל את המסע</button>
          <button className="btn btn--ghost" onClick={() => nav(-1)}>ביטול</button>
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>אין רעיון? התחל מדוגמה</p>
        <div style={{ display: "grid", gap: 10 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} className="card" style={{ padding: "14px 18px", textAlign: "right", fontSize: 15, color: "var(--fg-2)" }} onClick={() => { setText(ex); setError(""); }}>
              {ex}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
