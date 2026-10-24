import { useEffect, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { RoomShell } from "@/components/RoomShell";
import { useGame, useActiveJourney, type WhiteItem } from "@/store/game";
import { extractWhiteItems, isAssumption, whiteFeedback, whiteScore } from "@/lib/heuristics";

const COLS = [
  { key: "knows" as const, label: "יודע בוודאות", hint: "אפשר להראות הוכחה או מספר." },
  { key: "assumes" as const, label: "מניח", hint: "נשמע נכון, עדיין לא נבדק." },
];

export default function WhiteRoom() {
  const j = useActiveJourney()!;
  const items = j.rooms.white.items;
  const updateRoom = useGame((s) => s.updateRoom);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (items.length === 0) updateRoom("white", { items: extractWhiteItems(j.goalText) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const knows = items.filter((i) => i.bucket === "knows");
  const assumes = items.filter((i) => i.bucket === "assumes");
  const unsorted = items.filter((i) => i.bucket === "unsorted");
  const ratio = items.length ? (items.length - unsorted.length) / items.length : 0;
  const canContinue = ratio >= 0.8 && knows.length >= 3 && assumes.length >= 3;

  const move = (id: string, bucket: WhiteItem["bucket"]) =>
    updateRoom("white", { items: items.map((it) => (it.id === id ? { ...it, bucket } : it)) });
  const remove = (id: string) => updateRoom("white", { items: items.filter((it) => it.id !== id) });

  function add() {
    const text = draft.trim();
    if (!text) return;
    updateRoom("white", { items: [...items, { id: `w-${Date.now()}`, text, bucket: "unsorted", assumption: isAssumption(text) }] });
    setDraft("");
  }

  return (
    <RoomShell
      hat="white"
      feedback={whiteFeedback(items)}
      status={`${items.length - unsorted.length}/${items.length} סווגו, ${knows.length} ידוע, ${assumes.length} מניח`}
      canContinue={canContinue}
      score={() => whiteScore(items)}
    >
      <LayoutGroup>
        <div className="card card--pad">
          <p className="eyebrow" style={{ marginBottom: 12 }}>לסיווג ({unsorted.length})</p>
          <div style={{ display: "grid", gap: 8 }}>
            {unsorted.map((it) => <Item key={it.id} it={it} move={move} remove={remove} />)}
            {unsorted.length === 0 && <p className="muted" style={{ fontSize: 14.5 }}>הכול סווג. אפשר להוסיף עוד.</p>}
          </div>
          <div className="row" style={{ marginTop: 14, flexWrap: "nowrap" }}>
            <input
              className="field"
              style={{ flex: "1 1 auto", minWidth: 0 }}
              placeholder="הוסף עובדה או הנחה משלך"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button className="btn btn--ghost" onClick={add} disabled={!draft.trim()}>הוסף</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
          {COLS.map((col) => {
            const list = col.key === "knows" ? knows : assumes;
            return (
              <div key={col.key} className="card sortcol" style={{ borderStyle: "dashed" }}>
                <div className="row">
                  <span className="h3">{col.label}</span>
                  <span className="spacer" />
                  <span className="mono muted" style={{ fontSize: 13 }}>{list.length}/3</span>
                </div>
                <p className="muted" style={{ fontSize: 13.5, marginTop: -4 }}>{col.hint}</p>
                {list.map((it) => <Item key={it.id} it={it} move={move} remove={remove} />)}
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </RoomShell>
  );
}

function Item({ it, move, remove }: { it: WhiteItem; move: (id: string, b: WhiteItem["bucket"]) => void; remove: (id: string) => void }) {
  return (
    <motion.div layout layoutId={it.id} className={`item${it.assumption ? " item--flag" : ""}`} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
      <div>
        {it.assumption && <div className="item__flag">מילת הנחה</div>}
        {it.text}
      </div>
      <div className="item__acts">
        {it.bucket === "unsorted" ? (
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => move(it.id, "knows")}>יודע</button>
            <button className="btn btn--ghost btn--sm" onClick={() => move(it.id, "assumes")}>מניח</button>
            <button className="btn btn--sm muted" onClick={() => remove(it.id)} aria-label="מחיקת הפריט">מחק</button>
          </>
        ) : (
          <button className="btn btn--sm muted" onClick={() => move(it.id, "unsorted")}>החזר</button>
        )}
      </div>
    </motion.div>
  );
}
