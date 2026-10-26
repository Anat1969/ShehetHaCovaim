import type { CSSProperties } from "react";
import type { HatId } from "@/store/game";

/*
 * Six painted characters (public/characters/*.webp, transparent, 2:3).
 * Generated in Canva from a folk-modern reference: elongated figures, heavy-lidded eyes,
 * spiral-tipped hats and tails, soft directional light. Body language carries the hat.
 *
 * crop:
 *  - full: whole figure, fits the box, feet on the bottom edge
 *  - bust: head and shoulders, needs a square box
 *  - head: face and hat, needs a square box
 */

type Crop = "full" | "bust" | "head";

// Where the face sits in each image, as a fraction of width and height.
const FACE: Record<HatId, { x: number; y: number }> = {
  white: { x: 0.47, y: 0.15 },
  red: { x: 0.44, y: 0.17 },
  black: { x: 0.43, y: 0.14 },
  yellow: { x: 0.48, y: 0.18 },
  green: { x: 0.45, y: 0.23 },
  blue: { x: 0.53, y: 0.16 },
};

const ZOOM: Record<Exclude<Crop, "full">, number> = { head: 2.7, bust: 1.7 };

export const characterSrc = (hat: HatId) => `/characters/${hat}.webp`;

export function Character({
  hat,
  head = false,
  crop,
  still = false,
  className,
  eager = false,
}: {
  hat: HatId;
  /** Shorthand for crop="head". */
  head?: boolean;
  crop?: Crop;
  still?: boolean;
  className?: string;
  eager?: boolean;
}) {
  const mode: Crop = crop ?? (head ? "head" : "full");
  let imgStyle: CSSProperties | undefined;
  if (mode !== "full") {
    const z = ZOOM[mode];
    const f = FACE[hat];
    const fy = mode === "bust" ? f.y + 0.1 : f.y;
    imgStyle = {
      position: "absolute",
      width: `${z * 100}%`,
      height: "auto",
      maxWidth: "none",
      left: `${50 - f.x * z * 100}%`,
      top: `${50 - fy * z * 150}%`,
    };
  }
  return (
    <div className={`ch ch--${mode} ch--${hat}${still ? " ch--still" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <img
        src={characterSrc(hat)}
        srcSet={`/characters/${hat}-sm.webp 320w, /characters/${hat}.webp 640w`}
        sizes={mode === "full" ? "(max-width: 760px) 45vw, 360px" : "320px"}
        alt=""
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={imgStyle}
      />
    </div>
  );
}
