import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { HatId } from "@/store/game";
import { Character } from "@/components/Character";

/*
 * A character that leads the user: walks from one point on screen to another,
 * says one line, then either walks back or settles in place.
 * Rendered in a portal with fixed position so no frame clips it.
 * Any click or key skips it. Nothing happens under reduced motion.
 */

export type Box = { left: number; top: number; width: number; height: number };

type Props = {
  hat: HatId;
  from: Box;
  to: Box;
  caption: string;
  /** Walk back to `from` after speaking (map), or settle at `to` and fade (room arrival). */
  returnHome?: boolean;
  onDone: () => void;
};

const WALK = 1.6;
const HOLD = 2.6;

export function Guide({ hat, from, to, caption, returnHome = false, onDone }: Props) {
  const reduce = useReducedMotion();
  const [speaking, setSpeaking] = useState(false);

  // Feet are the anchor: align bottoms and centers, scale by height.
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height - (from.top + from.height);
  const s = to.height / from.height;
  const total = returnHome ? WALK * 2 + HOLD : WALK + HOLD;
  const t1 = WALK / total;
  const t2 = (WALK + HOLD) / total;

  useEffect(() => {
    if (reduce) {
      onDone();
      return;
    }
    const a = setTimeout(() => setSpeaking(true), WALK * 1000);
    const b = setTimeout(() => setSpeaking(false), (WALK + HOLD - 0.3) * 1000);
    const skip = () => onDone();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (reduce) return null;

  const lean = Math.max(-7, Math.min(7, dx / 80));
  const anim = returnHome
    ? { x: [0, dx, dx, 0], y: [0, dy, dy, 0], scale: [1, s, s, 1], rotate: [lean, 0, 0, -lean], opacity: [0, 1, 1, 0] }
    : { x: [0, dx, dx], y: [0, dy, dy], scale: [1, s, s], rotate: [lean, 0, 0], opacity: [0, 1, 0] };
  const times = returnHome ? [0, t1, t2, 1] : [0, t1, 1];

  // The line appears above the destination, kept inside the viewport.
  const bubbleLeft = Math.min(Math.max(12, to.left + to.width / 2 - 150), window.innerWidth - 312);
  const bubbleTop = Math.max(72, to.top - 64);

  return createPortal(
    <div className="guide" aria-live="polite">
      <motion.div
        className="roamer__traveler guide__walker"
        style={{ left: from.left, top: from.top, width: from.width, height: from.height, transformOrigin: "50% 100%" }}
        initial={false}
        animate={anim}
        transition={{ duration: total, times, ease: "easeInOut" }}
        onAnimationComplete={onDone}
      >
        <motion.div style={{ width: "100%", height: "100%" }} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
          <Character hat={hat} eager />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {speaking && (
          <motion.p
            className="guide__line"
            style={{ left: bubbleLeft, top: bubbleTop, ["--hat" as string]: `var(--hat-${hat})` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {caption}
          </motion.p>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

/** Fire a guide once per key per browser session. */
export function useOnce(key: string) {
  const id = `guide:${key}`;
  const [fresh] = useState(() => {
    try {
      if (sessionStorage.getItem(id)) return false;
      sessionStorage.setItem(id, "1");
      return true;
    } catch {
      return false;
    }
  });
  return fresh;
}

export function boxOf(el: Element | null): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}
