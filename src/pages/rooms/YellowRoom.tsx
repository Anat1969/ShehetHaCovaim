import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney } from "@/store/game";
import { isHigh, words, yellowValueFeedback } from "@/lib/heuristics";

const MIN = 8;

export default function YellowRoom() {
  const rooms = useActiveJourney()!.rooms;
  const risks = rooms.black.risks;
  const values = rooms.yellow.values;
  const updateRoom = useGame((s) => s.updateRoom);

  const valueOf = (id: string) => values.find((v) => v.riskId === id);
  function setVal(riskId: string, text: string) {
    const approved = words(text).length >= MIN;
    const rest = values.filter((v) => v.riskId !== riskId && risks.some((r) => r.id === v.riskId));
    updateRoom("yellow", { values: [...rest, { riskId, text, approved }] });
  }

  const high = risks.filter(isHigh);
  const highDone = high.filter((r) => valueOf(r.id)?.approved).length;
  const approved = risks.filter((r) => valueOf(r.id)?.approved).length;
  const canContinue = high.length > 0 && highDone === high.length;

  const fb: string[] = [];
  if (approved > 0) fb.push(`${approved} ערכים מנוסחים היטב.`);
  const short = risks.filter((r) => { const v = valueOf(r.id); return v && v.text.trim() && !v.approved; }).length;
  if (short > 0) fb.push(`${short} ניסוחים כלליים מדי. צריך לפחות ${MIN} מילים.`);
  if (canContinue && approved < risks.length) fb.push("כל הסיכונים הגבוהים קיבלו ערך. השאר רשות.");

  // Highest risks first: they are the ones that must be answered.
  const ordered = [...risks].sort((a, b) => b.probability * b.impact - a.probability * a.impact);

  return (
    <RoomShell
      hat="yellow"
      feedback={fb}
      status={`${highDone}/${high.length} סיכונים גבוהים קיבלו ערך`}
      canContinue={canContinue}
      score={() => Math.round((approved / Math.max(1, risks.length)) * 100)}
    >
      {risks.length === 0 ? (
        <div className="card card--pad card--dashed">
          <p>אין עדיין סיכונים. הכובע הצהוב עונה לכובע השחור.</p>
          <Link to="/room/black" className="btn btn--ghost" style={{ marginTop: 14 }}>חזרה לכובע השחור</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ordered.map((r, i) => {
            const v = valueOf(r.id);
            const hi = isHigh(r);
            const tip = yellowValueFeedback(v?.text || "", r.text);
            return (
              <motion.div key={r.id} className="card" style={{ padding: 18, borderColor: hi ? "var(--hat)" : undefined }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="row" style={{ flexWrap: "nowrap", alignItems: "baseline" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--hat-red)" }}>סיכון</span>
                  <span style={{ flex: "1 1 auto", minWidth: 0, fontWeight: 500 }}>{r.text}</span>
                  {hi && <span className="chip" style={{ borderColor: "var(--hat)" }}>חובה</span>}
                </div>
                <textarea
                  className="field"
                  rows={2}
                  style={{ marginTop: 12, fontSize: 15 }}
                  value={v?.text || ""}
                  onChange={(e) => setVal(r.id, e.target.value)}
                  placeholder="למרות הסיכון, מה עדיין נותן לזה ערך?"
                />
                <div className="row" style={{ marginTop: 8, fontSize: 13 }}>
                  <span className="muted">{tip}</span>
                  <span className="spacer" />
                  <span className="mono" style={{ color: v?.approved ? "var(--ok)" : "var(--muted)" }}>{words(v?.text || "").length}/{MIN}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </RoomShell>
  );
}
