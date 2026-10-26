import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { HatId } from "@/store/game";
import { Character } from "@/components/Character";

/*
 * A character that steps out of its frame on hover and wanders the screen.
 * The traveler is a fixed-position copy rendered in a portal, so no frame or overflow clips it.
 * It walks through a few random points inside the viewport and returns to its slot;
 * the slot keeps a faint ghost so the layout never jumps.
 * Touch: first tap releases the character, a second tap goes through to the link.
 */

type Trip = { left: number; top: number; width: number; height: number; xs: number[]; ys: number[]; rot: number[] };

const WALK_SECONDS = 7.5;

function planTrip(r: DOMRect): Trip {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 16;
  const minX = pad - r.left;
  const maxX = vw - pad - r.right;
  const minY = 70 - r.top; // stay below the top bar
  const maxY = vh - pad - r.bottom;
  const rnd = (a: number, b: number) => (b <= a ? (a + b) / 2 : a + Math.random() * (b - a));
  const xs = [0, 0, rnd(minX, maxX), rnd(minX, maxX), rnd(minX, maxX), 0, 0];
  const ys = [0, -Math.min(40, r.height * 0.12), rnd(minY, maxY), rnd(minY, maxY), rnd(minY, maxY), -20, 0];
  // Lean into the direction of travel, like a body in motion
  const rot = xs.map((x, i) => (i === 0 ? 0 : Math.max(-8, Math.min(8, (x - xs[i - 1]) / 60))));
  return { left: r.left, top: r.top, width: r.width, height: r.height, xs, ys, rot };
}

export function Roamer({ hat, still = false }: { hat: HatId; still?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const lastTouchRelease = useRef(0);
  const reduce = useReducedMotion();

  function release() {
    if (trip || reduce || !ref.current) return;
    setTrip(planTrip(ref.current.getBoundingClientRect()));
  }

  function onEnter(e: PointerEvent) {
    if (e.pointerType === "mouse") release();
  }

  // On touch, the first tap releases the character; a tap within the next few seconds follows the link.
  function onClickCapture(e: MouseEvent) {
    if (reduce) return;
    const type = (e.nativeEvent as globalThis.PointerEvent).pointerType;
    if (type !== "touch" && type !== "pen") return;
    if (Date.now() - lastTouchRelease.current < 12000) return;
    e.preventDefault();
    e.stopPropagation();
    lastTouchRelease.current = Date.now();
    release();
  }

  return (
    <div ref={ref} className="roamer" data-away={trip ? "true" : undefined} onPointerEnter={onEnter} onClickCapture={onClickCapture}>
      <Character hat={hat} still={still} eager />
      {trip &&
        createPortal(
          <motion.div
            className="roamer__traveler"
            style={{ left: trip.left, top: trip.top, width: trip.width, height: trip.height }}
            initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x: trip.xs, y: trip.ys, rotate: trip.rot, scale: [1, 1.12, 1.18, 1.1, 1.18, 1.08, 1] }}
            transition={{ duration: WALK_SECONDS, ease: "easeInOut", times: [0, 0.08, 0.3, 0.55, 0.78, 0.94, 1] }}
            onAnimationComplete={() => setTrip(null)}
          >
            <motion.div
              style={{ width: "100%", height: "100%" }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
            >
              <Character hat={hat} eager />
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
