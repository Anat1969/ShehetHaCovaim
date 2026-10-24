import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney, type Risk } from "@/store/game";
import { blackFeedback, blackScore, isHigh } from "@/lib/heuristics";

export default function BlackRoom() {
  const risks = useActiveJourney()!.rooms.black.risks;
  const updateRoom = useGame((s) => s.updateRoom);
  const [draft, setDraft] = useState({ text: "", probability: 3, impact: 3 });
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  function add() {
    if (!draft.text.trim()) return;
    const r: Risk = { id: `r-${Date.now()}`, text: draft.text.trim(), probability: draft.probability, impact: draft.impact };
    updateRoom("black", { risks: [...risks, r] });
    setDraft({ ...draft, text: "" });
  }
  const patch = (id: string, p: Partial<Risk>) => updateRoom("black", { risks: risks.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  const remove = (id: string) => updateRoom("black", { risks: risks.filter((r) => r.id !== id) });

  const high = risks.filter(isHigh);
  const withPlan = risks.filter((r) => (r.contingency || "").trim().length >= 5);
  const highPlanned = high.every((r) => (r.contingency || "").trim().length >= 5);
  const canContinue = risks.length >= 4 && high.length >= 1 && withPlan.length >= 2 && highPlanned;

  return (
    <RoomShell
      hat="black"
      feedback={blackFeedback(risks)}
      status={`${risks.length} סיכונים, ${high.length} גבוה־גבוה, ${withPlan.length} עם מגירה`}
      canContinue={canContinue}
      score={() => blackScore(risks)}
    >
      <div className="card card--pad">
        <p className="eyebrow" style={{ marginBottom: 6 }}>מפת הסיכונים</p>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>לחץ על משבצת כדי לקבוע הסתברות והשפעה לסיכון הבא. הפינה העליונה השמאלית היא הגבוה־גבוה.</p>
        <div className="matrix-wrap">
          <div className="axis-y">השפעה, מ־1 עד 5</div>
          <div>
            <div className="matrix" role="grid" aria-label="מפת הסתברות והשפעה">
              {[5, 4, 3, 2, 1].map((y) =>
                [1, 2, 3, 4, 5].map((x) => {
                  const cell = risks.filter((r) => r.probability === x && r.impact === y);
                  const selected = draft.probability === x && draft.impact === y;
                  return (
                    <button
                      key={`${x}-${y}`}
                      className="cell"
                      style={{ ["--heat" as string]: String(((x * y) / 25) ** 1.4) }}
                      aria-pressed={selected}
                      aria-label={`הסתברות ${x}, השפעה ${y}, ${cell.length} סיכונים`}
                      title={cell.map((r) => r.text).join("\n")}
                      onClick={() => setDraft({ ...draft, probability: x, impact: y })}
                    >
                      <AnimatePresence>
                        {cell.length > 0 && (
                          <motion.span className="cell__count" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            {cell.length}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                }),
              )}
            </div>
            <div className="mono muted" style={{ fontSize: 12, textAlign: "center", marginTop: 8 }}>הסתברות, מ־1 (ימין) עד 5 (שמאל)</div>
          </div>
        </div>
      </div>

      <div className="card card--pad">
        <label className="label" htmlFor="risk">סיכון חדש</label>
        <input id="risk" className="field" placeholder="מה יכול להשתבש?" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, marginTop: 16 }}>
          {(["probability", "impact"] as const).map((k) => (
            <label key={k} style={{ fontSize: 14 }}>
              <div className="row"><span>{k === "probability" ? "הסתברות" : "השפעה"}</span><span className="spacer" /><b className="mono">{draft[k]}</b></div>
              <input className="range" type="range" min={1} max={5} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: +e.target.value })} />
            </label>
          ))}
        </div>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={add} disabled={!draft.text.trim()}>הוסף למפה</button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <AnimatePresence initial={false}>
          {risks.map((r) => {
            const hi = isHigh(r);
            const showPlan = hi || openPlan === r.id || !!r.contingency;
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="card" style={{ padding: 16, borderColor: hi ? "var(--hat-red)" : undefined }}>
                <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{r.text}</div>
                    <div className="mono muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                      הסתברות {r.probability}, השפעה {r.impact}{hi && <span style={{ color: "var(--hat-red)" }}>, גבוה־גבוה</span>}
                    </div>
                  </div>
                  <button className="btn btn--sm muted" onClick={() => remove(r.id)}>הסר</button>
                </div>
                {showPlan ? (
                  <textarea
                    className="field"
                    rows={2}
                    style={{ marginTop: 12, fontSize: 15 }}
                    value={r.contingency || ""}
                    onChange={(e) => patch(r.id, { contingency: e.target.value })}
                    placeholder={hi ? "חובה: מה תעשה אם זה קורה?" : "תכנית מגירה"}
                  />
                ) : (
                  <button className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={() => setOpenPlan(r.id)}>הוסף תכנית מגירה</button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </RoomShell>
  );
}
