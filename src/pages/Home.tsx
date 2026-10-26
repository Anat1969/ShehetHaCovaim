import type { PointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame, HAT_ORDER, nextOpenHat, type CheckIn } from "@/store/game";
import { HATS, HAT, hatColor } from "@/lib/hats";
import { Character } from "@/components/Character";
import { toast } from "@/components/toast";

const STEPS = [
  { t: "מטרה אחת", d: "כותבים במשפטים פשוטים מה רוצים להשיג. לפחות עשר מילים." },
  { t: "שישה חדרים", d: "בכל חדר כלי אחד: מיון, כתיבה חופשית, מפת סיכונים, ערך, רעיונות, תכנית." },
  { t: "צעד אחד", d: "יוצאים עם פעולה שיש לה פועל ותאריך, מחסום צפוי ותגובה מוכנה." },
  { t: "חוזרים אחרי שבוע", d: "בודקים מה קרה. הפרופיל לומד איזה כובע חזק אצלך ואיזה פחות." },
];

const CHECKIN_LABEL: Record<CheckIn, string> = { done: "עשיתי", partial: "חלקית", not: "עוד לא" };

export default function Home() {
  const nav = useNavigate();
  const journeys = useGame((s) => s.journeys);
  const openJourney = useGame((s) => s.openJourney);
  const setCheckIn = useGame((s) => s.setCheckIn);

  const inProgress = journeys.find((j) => !j.completedAt);
  const due = journeys.find((j) => j.completedAt && !j.checkIn && Date.now() - j.completedAt > 6 * 864e5);

  function resume(id: string) {
    openJourney(id);
    const j = journeys.find((x) => x.id === id)!;
    const next = nextOpenHat(j.rooms);
    nav(next ? `/room/${next}` : "/summary");
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            שיטת אדוארד דה בונו (Edward de Bono), 1985
          </motion.p>
          <motion.h1 className="display" style={{ marginTop: 18 }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
            ששת<br />הכובעים
          </motion.h1>
          <motion.p className="hero__lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            שש זוויות חשיבה על מטרה אחת. בסוף המסע יש צעד אחד, עם תאריך, שאי אפשר לא לעשות.
          </motion.p>
          <motion.div className="row" style={{ marginTop: 30, gap: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            {inProgress ? (
              <>
                <button className="btn btn--primary" onClick={() => resume(inProgress.id)}>המשך את המסע</button>
                <Link to="/start" className="btn btn--ghost">מסע חדש</Link>
              </>
            ) : (
              <>
                <Link to="/start" className="btn btn--primary">התחלת מסע</Link>
                <Link to="/hats" className="btn btn--ghost">הכרות עם הכובעים</Link>
              </>
            )}
          </motion.div>
          {inProgress && (
            <p className="muted" style={{ fontSize: 14, marginTop: 14, maxWidth: "46ch" }}>
              באמצע: "{inProgress.goalText.slice(0, 70)}{inProgress.goalText.length > 70 ? "..." : ""}"
            </p>
          )}
        </div>
        <Ensemble />
      </section>

      {due && (
        <motion.section className="card card--pad card--deep" style={{ marginBottom: 48, ["--hat" as string]: hatColor("blue") }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">בדיקה של שבוע</p>
          <h2 className="h3" style={{ marginTop: 10, fontSize: 24, fontWeight: 400 }}>התחייבת לצעד: {due.rooms.blue.nextStep}</h2>
          <p className="muted" style={{ marginTop: 6 }}>מה קרה איתו?</p>
          <div className="row" style={{ marginTop: 16 }}>
            {(Object.keys(CHECKIN_LABEL) as CheckIn[]).map((k) => (
              <button key={k} className="btn btn--ghost btn--sm" onClick={() => { setCheckIn(due.id, k); toast("נשמר בפרופיל החשיבה"); }}>
                {CHECKIN_LABEL[k]}
              </button>
            ))}
          </div>
        </motion.section>
      )}

      <section style={{ marginTop: 24 }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <p className="eyebrow">איך זה עובד</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <motion.div key={s.t} className="card step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="step__n">0{i + 1}</div>
              <div className="step__t">{s.t}</div>
              <p className="muted" style={{ fontSize: 14.5 }}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 64 }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <p className="eyebrow">ששת החדרים</p>
          <span className="spacer" />
          <Link to="/hats" className="btn btn--ghost btn--sm">לכל הכובעים</Link>
        </div>
        <div className="hatgrid">
          {HATS.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/hats?hat=${h.id}`} className="hatcard" style={{ display: "block", ["--hat" as string]: hatColor(h.id) }}>
                <span className="hatcard__num">0{h.order}</span>
                <motion.div className="hatcard__face khaki" whileHover={{ y: -6 }}><Character hat={h.id} still /></motion.div>
                <div className="hatcard__name">{h.name}</div>
                <div className="hatcard__sub">{h.persona}, {h.skill}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {journeys.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <div className="row" style={{ marginBottom: 18 }}>
            <p className="eyebrow">המסעות שלך</p>
            <span className="spacer" />
            <Link to="/profile" className="btn btn--ghost btn--sm">לפרופיל</Link>
          </div>
          <div className="history">
            {journeys.slice(0, 4).map((j) => {
              const done = HAT_ORDER.filter((h) => j.rooms[h].completed).length;
              return (
                <button key={j.id} className="card card--pad" style={{ textAlign: "right" }} onClick={() => resume(j.id)}>
                  <div className="row">
                    <span className="eyebrow">{new Date(j.createdAt).toLocaleDateString("he-IL")}</span>
                    <span className="spacer" />
                    <span className="chip">{j.completedAt ? `הושלם, ${j.totalScore}/100` : `${done}/6 חדרים`}</span>
                  </div>
                  <p style={{ marginTop: 10, fontSize: 15.5 }}>{j.goalText.slice(0, 120)}{j.goalText.length > 120 ? "..." : ""}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

// Group portrait on khaki, after the reference: tall figures behind, small ones in front, overlapping.
// Group portrait on khaki: tall figures behind, the front row larger and sharper, overlapping.
// Each layer drifts with the pointer by its depth, so the scene reads as space, not a flat row.
const CAST: { hat: keyof typeof HAT; left: number; bottom: number; width: number; z: number; depth: number; delay: number }[] = [
  { hat: "black", left: -3, bottom: 31, width: 40, z: 1, depth: 5, delay: 0.1 },
  { hat: "white", left: 31, bottom: 37, width: 38, z: 0, depth: 3, delay: 0 },
  { hat: "blue", left: 63, bottom: 31, width: 40, z: 1, depth: 5, delay: 0.2 },
  { hat: "red", left: 0, bottom: 1, width: 42, z: 2, depth: 10, delay: 0.3 },
  { hat: "green", left: 58, bottom: 1, width: 42, z: 2, depth: 10, delay: 0.5 },
  { hat: "yellow", left: 29, bottom: -3, width: 42, z: 3, depth: 14, delay: 0.4 },
];

function Ensemble() {
  const nav = useNavigate();
  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    e.currentTarget.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  }
  function onLeave(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  }
  return (
    <motion.div
      className="ensemble khaki"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, scale: 0.95, rotateX: 12 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className="ensemble__title">שישה כובעים, שש דמויות</span>
      {CAST.map((c) => (
        <div
          key={c.hat}
          className="ensemble__fig"
          data-row={c.z < 2 ? "back" : "front"}
          style={{ left: `${c.left}%`, bottom: `${c.bottom}%`, width: `${c.width}%`, zIndex: c.z, ["--depth" as string]: c.depth }}
        >
          <motion.button
            className="ensemble__btn"
            aria-label={`${HAT[c.hat].name}, ${HAT[c.hat].persona}`}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + c.delay, type: "spring", stiffness: 120, damping: 14 }}
            whileHover={{ y: -12, scale: 1.04 }}
            onClick={() => nav(`/hats?hat=${c.hat}`)}
          >
            <Character hat={c.hat} eager />
            <span className="ensemble__name">{HAT[c.hat].persona}</span>
          </motion.button>
        </div>
      ))}
    </motion.div>
  );
}
