import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HATS, HAT, hatColor } from "@/lib/hats";
import { Character } from "@/components/Character";
import type { HatId } from "@/store/game";

export default function Hats() {
  const [params, setParams] = useSearchParams();
  const id = (params.get("hat") as HatId) || "white";
  const active = HAT[id] ?? HAT.white;
  const select = (h: HatId) => setParams({ hat: h }, { replace: true });

  return (
    <main className="page">
      <p className="eyebrow">ששת הכובעים</p>
      <h1 className="title" style={{ marginTop: 12 }}>כל כובע הוא זווית אחת</h1>
      <p className="muted" style={{ marginTop: 14, maxWidth: "52ch", fontSize: 17 }}>
        לא חושבים על הכול בבת אחת. חובשים כובע אחד, מסתכלים דרכו עד הסוף, ועוברים לבא. הסדר כאן הוא סדר המסע.
      </p>

      <div className="hatgrid" style={{ marginTop: 36 }}>
        {HATS.map((h) => (
          <motion.button
            key={h.id}
            className="hatcard"
            aria-pressed={h.id === active.id}
            style={{ ["--hat" as string]: hatColor(h.id) }}
            onClick={() => select(h.id)}
            whileHover={{ y: -4, rotateX: 6 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="hatcard__num">0{h.order}</span>
            <div className="hatcard__face khaki"><Character hat={h.id} still={h.id !== active.id} /></div>
            <div className="hatcard__name">{h.name}</div>
            <div className="hatcard__sub">{h.subtitle}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={active.id}
          className="card card--deep"
          style={{ marginTop: 22, overflow: "hidden", ["--hat" as string]: hatColor(active.id), borderColor: "var(--hat)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="hatbar" style={{ background: "var(--hat)", borderRadius: 0 }} />
          <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 18, alignItems: "center" }}>
            <div className="khaki" style={{ width: 130, height: 190, borderRadius: 18, padding: "12px 10px 4px" }}><Character hat={active.id} /></div>
            <div>
              <p className="eyebrow">חדר {active.order} מתוך 6</p>
              <h2 style={{ fontSize: 30, fontWeight: 300, color: "var(--hat)", marginTop: 4 }}>{active.name}</h2>
              <p className="muted" style={{ fontSize: 15 }}>{active.persona}. {active.subtitle}. {active.task}</p>
              <p style={{ fontSize: 14.5, marginTop: 8, color: "var(--fg-2)" }}><span className="eyebrow">שפת גוף</span> {active.body}</p>
            </div>
          </div>
          <div className="why" style={{ margin: "20px 24px 0" }}>{active.why}</div>
          <div className="detail">
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>תכונות</p>
              <ul>
                {active.traits.map((t) => (
                  <li key={t} className="row" style={{ flexWrap: "nowrap", alignItems: "baseline", fontSize: 15.5, color: "var(--fg-2)" }}>
                    <span className="dot" style={{ transform: "translateY(-1px)" }} />
                    <span style={{ flex: "1 1 auto" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>שאלות מרכזיות</p>
              <ul>
                {active.questions.map((q) => <li key={q} className="q">{q}</li>)}
              </ul>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <section className="card card--pad" style={{ marginTop: 28, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 400 }}>מוכן לחשוב בשש שכבות?</h2>
          <p className="muted" style={{ fontSize: 14.5 }}>כ־30 דקות, שישה חדרים, תכנית פעולה אחת.</p>
        </div>
        <Link to="/start" className="btn btn--primary">התחלת מסע</Link>
      </section>
    </main>
  );
}
