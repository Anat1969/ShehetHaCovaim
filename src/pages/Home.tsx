import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame, HAT_ORDER, nextOpenHat, type CheckIn } from "@/store/game";
import { HATS, HAT_FACES, hatColor } from "@/lib/hats";
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
        <Orbit />
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
                <motion.div className="hatcard__face" whileHover={{ y: -6, rotate: -4 }}>{HAT_FACES[h.id]}</motion.div>
                <div className="hatcard__name">{h.name}</div>
                <div className="hatcard__sub">{h.skill}</div>
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

function Orbit() {
  const nav = useNavigate();
  return (
    <motion.div className="stage" initial={{ opacity: 0, scale: 0.92, rotateX: 18 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
      <div className="stage__ring" />
      <div className="stage__ring stage__ring--2" />
      <motion.div style={{ position: "absolute", inset: 0 }} animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }}>
        {HATS.map((h, i) => {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          return (
            <motion.button
              key={h.id}
              className="orbit-hat"
              aria-label={h.name}
              style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              whileHover={{ scale: 1.14 }}
              onClick={() => nav(`/hats?hat=${h.id}`)}
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}>
                {HAT_FACES[h.id]}
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>
      <div className="stage__center">
        <div>
          <div style={{ fontSize: "clamp(40px, 7vw, 64px)", fontWeight: 200, lineHeight: 1 }}>6</div>
          <div className="eyebrow" style={{ marginTop: 6 }}>זוויות</div>
          <div style={{ width: 36, height: 1, background: "var(--line-2)", margin: "10px auto" }} />
          <div style={{ fontSize: "clamp(22px, 3.4vw, 30px)", fontWeight: 300, lineHeight: 1 }}>1</div>
          <div className="eyebrow" style={{ marginTop: 6 }}>צעד</div>
        </div>
      </div>
    </motion.div>
  );
}
