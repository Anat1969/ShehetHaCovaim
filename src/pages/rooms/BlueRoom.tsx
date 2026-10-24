import { motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney, type HatId } from "@/store/game";
import { blueScore, buildHybrids, connectedWords, findActionVerb, isHigh, validateBlueContingency, validateBlueStep } from "@/lib/heuristics";
import { HAT, hatColor } from "@/lib/hats";

export default function BlueRoom() {
  const rooms = useActiveJourney()!.rooms;
  const room = rooms.blue;
  const updateRoom = useGame((s) => s.updateRoom);

  const step = validateBlueStep(room.nextStep);
  const con = validateBlueContingency(room.contingency);
  const verb = findActionVerb(room.nextStep);
  const links = connectedWords(room.nextStep, rooms);
  const obstacle = rooms.black.risks.find((r) => r.id === room.obstacleRiskId);
  const canContinue = step.ok && con.ok && !!obstacle;

  const fb: string[] = [];
  if (room.nextStep && !step.hasVerb) fb.push("חסר פועל בגוף ראשון עתיד: אכתוב, אתקשר, אקבע.");
  if (room.nextStep && !step.hasDate) fb.push("חסר מועד: מחר, השבוע, עד יום שלישי, או תאריך.");
  if (room.contingency && !con.ok) fb.push(con.msg);
  if (step.ok) fb.push(links.length >= 3 ? `הצעד נשען על ${links.length} מילים מהחדרים הקודמים.` : "הצעד עדיין רחוק ממה שעלה בחדרים. נסה לשלב מילים מהחוט.");

  const applicable = buildHybrids(rooms.green.ideas).filter((h) => rooms.green.ratings[h.id] === "applicable");
  const thread: { hat: HatId; text: string }[] = [
    ...rooms.white.items.filter((i) => i.bucket === "knows").slice(0, 3).map((i) => ({ hat: "white" as const, text: i.text })),
    ...(rooms.red.emotion ? [{ hat: "red" as const, text: `רגש: ${rooms.red.emotion}` }] : []),
    ...rooms.black.risks.filter(isHigh).map((r) => ({ hat: "black" as const, text: r.text })),
    ...rooms.yellow.values.filter((v) => v.approved).slice(0, 2).map((v) => ({ hat: "yellow" as const, text: v.text })),
    ...applicable.map((h) => ({ hat: "green" as const, text: `${h.a} + ${h.b}` })),
  ];

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className="chip mono" style={{ fontSize: 12, borderColor: ok ? "var(--ok)" : undefined, color: ok ? "var(--ok)" : "var(--muted)" }}>{label}</span>
  );

  return (
    <RoomShell
      hat="blue"
      feedback={fb}
      status={`${[step.ok, !!obstacle, con.ok].filter(Boolean).length}/3 שדות תקינים`}
      canContinue={canContinue}
      score={() => blueScore(rooms)}
    >
      <div className="card card--pad">
        <p className="eyebrow" style={{ marginBottom: 12 }}>החוט, מה עלה עד עכשיו</p>
        <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto", gridAutoRows: "max-content" }}>
          {thread.map((t, i) => (
            <motion.div key={i} className="row" style={{ flexWrap: "nowrap", alignItems: "baseline", fontSize: 14.5 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <span className="mono" style={{ fontSize: 11.5, color: hatColor(t.hat), minWidth: 36 }}>{HAT[t.hat].short}</span>
              <span style={{ flex: "1 1 auto", minWidth: 0, color: "var(--fg-2)" }}>{t.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card card--pad">
        <label className="label" htmlFor="step">א. הצעד הבא שאי אפשר לא לעשות. פעולה אחת, תוך 7 ימים.</label>
        <textarea id="step" className="field" rows={2} value={room.nextStep} onChange={(e) => updateRoom("blue", { nextStep: e.target.value })} placeholder="לדוגמה: אתקשר לשלושה לקוחות פוטנציאליים עד יום שלישי בערב" />
        <div className="row" style={{ marginTop: 10 }}>
          <Check ok={step.hasVerb} label={verb ? `פועל: ${verb}` : "פועל"} />
          <Check ok={step.hasDate} label="מועד" />
          <Check ok={links.length >= 3} label={`קשר לחדרים: ${links.length}`} />
        </div>
      </div>

      <div className="card card--pad">
        <p className="label">ב. המחסום שאני כבר יודע שיגיע</p>
        <div style={{ display: "grid", gap: 8 }}>
          {rooms.black.risks.map((r) => (
            <button
              key={r.id}
              className="item"
              style={{ textAlign: "right", gridTemplateColumns: "minmax(0,1fr) auto", borderColor: room.obstacleRiskId === r.id ? "var(--hat)" : undefined, boxShadow: room.obstacleRiskId === r.id ? "0 0 0 1px var(--hat)" : undefined }}
              onClick={() => updateRoom("blue", { obstacleRiskId: r.id, contingency: room.contingency || r.contingency || "" })}
              aria-pressed={room.obstacleRiskId === r.id}
            >
              <span>{r.text}</span>
              <span className="mono muted" style={{ fontSize: 12 }}>{r.probability}x{r.impact}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card card--pad">
        <label className="label" htmlFor="con">ג. מה אני עושה כשהוא מגיע. פעולה ממשית, לא "אחשוב על זה".</label>
        <textarea id="con" className="field" rows={2} value={room.contingency} onChange={(e) => updateRoom("blue", { contingency: e.target.value })} />
        {obstacle?.contingency && room.contingency !== obstacle.contingency && (
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={() => updateRoom("blue", { contingency: obstacle.contingency! })}>
            השתמש בתכנית המגירה מהכובע השחור
          </button>
        )}
      </div>
    </RoomShell>
  );
}
