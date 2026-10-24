import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useActiveJourney, HAT_ORDER, roomStatus } from "@/store/game";
import { HAT, HAT_FACES, hatColor, TYPE_LABEL } from "@/lib/hats";

const STATE_LABEL = { done: "הושלם", active: "פתוח", locked: "נעול" } as const;

export default function JourneyMap() {
  const j = useActiveJourney();
  if (!j) return <Navigate to="/start" replace />;

  const rooms = j.rooms;
  const completed = HAT_ORDER.filter((h) => rooms[h].completed).length;
  const allDone = completed === 6;

  return (
    <main className="page">
      <p className="eyebrow">מפת המסע, {completed}/6 הושלמו</p>
      <h1 className="title" style={{ marginTop: 12 }}>המסלול שלך</h1>

      <div className="card card--pad" style={{ marginTop: 28 }}>
        <div className="row">
          <p className="eyebrow">המטרה</p>
          <span className="spacer" />
          <span className="chip">{TYPE_LABEL[j.goalType]}</span>
          <span className="chip">מורכבות {j.complexity}/5</span>
        </div>
        <p style={{ fontSize: 19, fontWeight: 300, marginTop: 10, lineHeight: 1.55 }}>{j.goalText}</p>
      </div>

      <div className="progress" style={{ marginTop: 32 }}>
        {HAT_ORDER.map((h) => (
          <span key={h} style={{ ["--hat" as string]: hatColor(h) }}>
            <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: rooms[h].completed ? 1 : 0 }} transition={{ duration: 0.6 }} />
          </span>
        ))}
      </div>

      <ol className="trail" style={{ marginTop: 18, padding: 0, listStyle: "none" }}>
        {HAT_ORDER.map((h, i) => {
          const st = roomStatus(rooms, h);
          const body = (
            <>
              <div className="eyebrow">0{i + 1}</div>
              <motion.div className="station__face" animate={st === "active" ? { y: [0, -5, 0] } : {}} transition={{ duration: 2.4, repeat: Infinity }}>
                {HAT_FACES[h]}
              </motion.div>
              <div style={{ fontWeight: 600 }}>{HAT[h].name}</div>
              <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.4, minHeight: 34 }}>{HAT[h].skill}</div>
              <div className="station__state" style={{ marginTop: 8 }}>
                {STATE_LABEL[st]}{st === "done" ? `, ${rooms[h].score}` : ""}
              </div>
            </>
          );
          return (
            <motion.li key={h} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              {st === "locked" ? (
                <div className="station" data-status={st} style={{ ["--hat" as string]: hatColor(h) }} aria-disabled="true">{body}</div>
              ) : (
                <motion.div whileHover={{ y: -5 }}>
                  <Link to={`/room/${h}`} className="station" data-status={st} style={{ ["--hat" as string]: hatColor(h) }}>{body}</Link>
                </motion.div>
              )}
            </motion.li>
          );
        })}
      </ol>

      <div className="row" style={{ marginTop: 36 }}>
        {allDone ? (
          <Link to="/summary" className="btn btn--primary">לתכנית הפעולה</Link>
        ) : (
          <Link to={`/room/${HAT_ORDER.find((h) => !rooms[h].completed)}`} className="btn btn--primary">
            {completed === 0 ? "כניסה לחדר הראשון" : "המשך לחדר הבא"}
          </Link>
        )}
        <Link to="/start" className="btn btn--ghost">מטרה חדשה</Link>
      </div>
    </main>
  );
}
