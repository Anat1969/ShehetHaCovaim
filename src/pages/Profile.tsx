import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame, HAT_ORDER, nextOpenHat, type HatId } from "@/store/game";
import { HAT, hatColor } from "@/lib/hats";

const CHECKIN_TEXT = { done: "בוצע", partial: "בוצע חלקית", not: "לא בוצע" } as const;

export default function Profile() {
  const nav = useNavigate();
  const journeys = useGame((s) => s.journeys);
  const openJourney = useGame((s) => s.openJourney);
  const deleteJourney = useGame((s) => s.deleteJourney);

  const completed = journeys.filter((j) => j.completedAt);
  const n = completed.length;

  const avg = Object.fromEntries(
    HAT_ORDER.map((h) => [h, n ? Math.round(completed.reduce((a, j) => a + (j.rooms[h].score || 0), 0) / n) : 0]),
  ) as Record<HatId, number>;
  const strongest = HAT_ORDER.reduce((a, b) => (avg[a] >= avg[b] ? a : b));
  const weakest = HAT_ORDER.reduce((a, b) => (avg[a] <= avg[b] ? a : b));
  const checked = completed.filter((j) => j.checkIn);
  const follow = checked.length ? Math.round((checked.reduce((a, j) => a + (j.checkIn === "done" ? 1 : j.checkIn === "partial" ? 0.5 : 0), 0) / checked.length) * 100) : null;
  const avgTotal = n ? Math.round(completed.reduce((a, j) => a + (j.totalScore || 0), 0) / n) : 0;

  function open(id: string) {
    openJourney(id);
    const j = journeys.find((x) => x.id === id)!;
    const next = nextOpenHat(j.rooms);
    nav(next ? "/map" : "/summary");
  }

  return (
    <main className="page">
      <p className="eyebrow">פרופיל החשיבה, {n} מסעות שהושלמו</p>
      <h1 className="title" style={{ marginTop: 12 }}>איך אתה חושב</h1>

      {n === 0 ? (
        <div className="card card--pad card--dashed" style={{ marginTop: 32, textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 19, fontWeight: 300 }}>הפרופיל נבנה מהמסעות שתסיים.</p>
          <p className="muted" style={{ marginTop: 6 }}>אחרי המסע הראשון תראה את מפת הכובעים שלך. אחרי שלושה היא כבר אמינה.</p>
          <Link to="/start" className="btn btn--primary" style={{ marginTop: 22 }}>התחלת מסע</Link>
        </div>
      ) : (
        <>
          <div className="statgrid" style={{ marginTop: 28 }}>
            <div className="card stat"><p className="eyebrow">ציון ממוצע</p><div className="stat__v">{avgTotal}</div></div>
            <div className="card stat"><p className="eyebrow">שיעור ביצוע</p><div className="stat__v">{follow === null ? "טרם" : `${follow}%`}</div></div>
            <div className="card stat"><p className="eyebrow">מסעות</p><div className="stat__v">{n}</div></div>
          </div>
          {n < 3 && <p className="muted" style={{ fontSize: 14, marginTop: 12 }}>הפרופיל מבוסס על {n} {n === 1 ? "מסע" : "מסעות"}. אחרי שלושה התמונה תתייצב.</p>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16, marginTop: 20 }}>
            <div className="card card--pad card--deep"><Radar avg={avg} /></div>
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <div className="statgrid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
                {[{ k: "הכובע החזק", h: strongest }, { k: "דורש תשומת לב", h: weakest }].map(({ k, h }) => (
                  <div key={k} className="card stat" style={{ ["--hat" as string]: hatColor(h) }}>
                    <p className="eyebrow">{k}</p>
                    <div className="stat__v" style={{ color: "var(--hat)", fontSize: 28 }}>{HAT[h].short}</div>
                    <p className="muted" style={{ fontSize: 13 }}>{HAT[h].skill}, {avg[h]}/100</p>
                  </div>
                ))}
              </div>
              <div className="card card--pad">
                <p className="eyebrow" style={{ marginBottom: 14 }}>לפי כובע</p>
                <div className="bars">
                  {HAT_ORDER.map((h, i) => (
                    <div key={h} className="bar" style={{ ["--hat" as string]: hatColor(h) }}>
                      <span>{HAT[h].short}</span>
                      <div className="bar__track"><motion.div className="bar__fill" initial={{ width: 0 }} animate={{ width: `${avg[h]}%` }} transition={{ delay: i * 0.06, duration: 0.6 }} /></div>
                      <span className="mono" style={{ fontSize: 13 }}>{avg[h]}</span>
                    </div>
                  ))}
                </div>
                <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>במסע הבא, תן זמן נוסף לכובע ה{HAT[weakest].short}: {HAT[weakest].questions[0]}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {journeys.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <p className="eyebrow" style={{ marginBottom: 14 }}>כל המסעות</p>
          <div className="history">
            {journeys.map((j) => {
              const done = HAT_ORDER.filter((h) => j.rooms[h].completed).length;
              return (
                <div key={j.id} className="card card--pad">
                  <div className="row">
                    <span className="eyebrow">{new Date(j.createdAt).toLocaleDateString("he-IL")}</span>
                    <span className="spacer" />
                    <span className="chip">{j.completedAt ? `${j.totalScore}/100` : `${done}/6 חדרים`}</span>
                    {j.checkIn && <span className="chip">{CHECKIN_TEXT[j.checkIn]}</span>}
                  </div>
                  <p style={{ marginTop: 10, fontSize: 15.5 }}>{j.goalText.slice(0, 140)}{j.goalText.length > 140 ? "..." : ""}</p>
                  {j.completedAt && <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>הצעד: {j.rooms.blue.nextStep}</p>}
                  <div className="row" style={{ marginTop: 14 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => open(j.id)}>{j.completedAt ? "לתכנית" : "להמשך"}</button>
                    <button className="btn btn--sm muted" onClick={() => { if (confirm("למחוק את המסע הזה?")) deleteJourney(j.id); }}>מחיקה</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function Radar({ avg }: { avg: Record<HatId, number> }) {
  const size = 360, cx = 180, cy = 180, r = 128;
  const pt = (i: number, t: number) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return [cx + Math.cos(a) * r * t, cy + Math.sin(a) * r * t] as const;
  };
  const poly = HAT_ORDER.map((h, i) => pt(i, Math.max(0.04, avg[h] / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar" style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }} role="img" aria-label="מפת הכובעים">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon key={t} points={HAT_ORDER.map((_, i) => pt(i, t).join(",")).join(" ")} fill="none" stroke="var(--line-2)" strokeWidth={1} />
      ))}
      {HAT_ORDER.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />; })}
      <motion.polygon
        points={poly}
        fill="color-mix(in srgb, var(--fg) 12%, transparent)"
        stroke="var(--fg)"
        strokeWidth={1.5}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {HAT_ORDER.map((h, i) => {
        const [x, y] = pt(i, Math.max(0.04, avg[h] / 100));
        const [lx, ly] = pt(i, 1.2);
        return (
          <g key={h}>
            <circle cx={x} cy={y} r={6} fill={hatColor(h)} stroke="var(--bg)" strokeWidth={2} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">{HAT[h].short}</text>
          </g>
        );
      })}
    </svg>
  );
}
