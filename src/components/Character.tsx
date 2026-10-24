import { useId } from "react";
import type { HatId } from "@/store/game";

/*
 * Six characters in one graphic language, distilled from a folk-modern cat portrait:
 * - stretched bodies that flow to the ground like bottles, tiny feet, no stick legs
 * - big wide heads, heavy-lidded almond eyes: the lid and the gaze carry the emotion
 * - hats replace pointed ears and end in spirals; every figure has a "tail"
 *   (scarf, tape, sash, hem) that sweeps out and curls into a spiral
 * - soft side-lit gradients and polka dots instead of hard shading
 * Body language carries the hat: posture, arms, gaze, eyelid weight.
 */

const INK = "#2A2420";
const PAPER = "#FBF6E9";
const LINE = { stroke: INK, strokeWidth: 1.1, strokeOpacity: 0.75 } as const;

type P = { x: number; y: number };

/** Archimedean spiral that starts at (ex, ey) and winds inward. */
function spiralFrom(ex: number, ey: number, r: number, start: number, dir = 1, turns = 1.6) {
  const cx = ex - Math.cos(start) * r;
  const cy = ey - Math.sin(start) * r;
  const N = 40;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - t * 0.8);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

const Curl = ({ d, color, w = 2.6 }: { d: string; color: string; w?: number }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
);

/** Side-lit fill: light on one edge, deeper on the other, like the reference. */
function Grad({ id, a, b, dir = "h" }: { id: string; a: string; b: string; dir?: "h" | "v" }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={dir === "h" ? 1 : 0} y2={dir === "v" ? 1 : 0}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
}

function Eye({ c, w, h, lid, look, iris, lidColor, id, tilt = 0 }: { c: P; w: number; h: number; lid: number; look: P; iris: string; lidColor: string; id: string; tilt?: number }) {
  const almond = `M${c.x - w} ${c.y} Q${c.x} ${c.y - h * 2} ${c.x + w} ${c.y} Q${c.x} ${c.y + h * 2} ${c.x - w} ${c.y} Z`;
  const lidY = c.y - h * 2 + h * 4 * lid;
  const lidPath = `M${c.x - w - 1} ${c.y} Q${c.x} ${c.y - h * 2 - 1} ${c.x + w + 1} ${c.y} Q${c.x} ${lidY} ${c.x - w - 1} ${c.y} Z`;
  const r = h * 1.05;
  return (
    <g transform={tilt ? `rotate(${tilt} ${c.x} ${c.y})` : undefined}>
      <g className="ch-blink">
        <clipPath id={id}><path d={almond} /></clipPath>
        <path d={almond} fill={PAPER} />
        <g clipPath={`url(#${id})`}>
          <g className="ch-iris">
            <circle cx={c.x + look.x} cy={c.y + look.y} r={r} fill={iris} />
            <circle cx={c.x + look.x} cy={c.y + look.y} r={r * 0.42} fill={INK} />
            <circle cx={c.x + look.x - r * 0.35} cy={c.y + look.y - r * 0.4} r={r * 0.2} fill="#fff" />
          </g>
          {lid > 0 && <path d={lidPath} fill={lidColor} />}
        </g>
        <path d={`M${c.x - w} ${c.y} Q${c.x} ${lid > 0 ? lidY : c.y - h * 2} ${c.x + w} ${c.y}`} fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
        <path d={almond} fill="none" stroke={INK} strokeWidth={0.9} strokeOpacity={0.7} />
      </g>
    </g>
  );
}

const Dots = ({ pts, fill, r = 1.7 }: { pts: [number, number][]; fill: string; r?: number }) => (
  <g>{pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? r * 1.5 : r} fill={fill} />)}</g>
);

const Arm = ({ d, color, w = 5 }: { d: string; color: string; w?: number }) => (
  <g>
    <path d={d} fill="none" stroke={INK} strokeOpacity={0.75} strokeWidth={w + 1.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Hand = ({ x, y, skin }: { x: number; y: number; skin: string }) => <circle cx={x} cy={y} r={3.2} fill={skin} {...LINE} />;
const Feet = ({ y = 192, a = 52, b = 68 }: { y?: number; a?: number; b?: number }) => (
  <g fill={INK}>
    <ellipse cx={a} cy={y} rx={5.5} ry={2.6} />
    <ellipse cx={b} cy={y} rx={5.5} ry={2.6} />
  </g>
);
const Shadow = ({ rx = 34 }: { rx?: number }) => <ellipse cx="60" cy="195" rx={rx} ry="4" fill="#3a2a10" opacity=".2" />;
const Nose = ({ x = 60, y = 62, len = 9 }) => (
  <g>
    <path d={`M${x} ${y} L${x - 2} ${y + len} L${x + 2} ${y + len}`} fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".8" />
    <circle cx={x} cy={y + len + 0.5} r="1.6" fill="#C8402F" />
  </g>
);

/* ---------------- White: the analyst. Upright column, clipboard, level gaze, measuring tape tail. ---------------- */
function White({ u }: { u: string }) {
  const skin = "#F3D9C2";
  return (
    <g className="ch-bob-soft">
      <defs>
        <Grad id={`${u}b`} a="#F7F2E6" b="#CDC3AD" />
        <Grad id={`${u}h`} a="#F8F3E8" b="#D7CDB9" />
        <Grad id={`${u}s`} a="#F8E3D0" b="#E2BFA1" />
      </defs>
      <Shadow />
      {/* tape tail */}
      <Curl d="M66 150 Q92 160 96 178" color="#7E8E99" w={3.4} />
      <Curl d={spiralFrom(96, 178, 9, -Math.PI / 2, 1, 1.5)} color="#7E8E99" w={3.4} />
      <Feet />
      <path d="M43 90 Q37 140 40 190 Q60 194 80 190 Q83 140 77 90 Q60 82 43 90 Z" fill={`url(#${u}b)`} {...LINE} />
      <path d="M53 90 L60 104 L67 90" fill="none" stroke="#B9AE97" strokeWidth="1.3" />
      <line x1="60" y1="104" x2="60" y2="186" stroke="#C2B8A2" strokeWidth="1.1" />
      <Dots pts={[[48, 160], [72, 166], [52, 178], [70, 148], [46, 140]]} fill="#A9B3B9" />
      {/* clipboard */}
      <rect x="44" y="110" width="32" height="40" rx="3" fill="#FFFDF7" {...LINE} />
      <rect x="54" y="107" width="12" height="6" rx="1.5" fill="#7E8E99" />
      {[120, 126, 132, 138, 144].map((y, i) => <line key={y} x1="49" x2={i % 2 ? 66 : 71} y1={y} y2={y} stroke="#9AA5AE" strokeWidth="1.4" strokeLinecap="round" />)}
      <Arm d="M45 96 Q34 114 45 128" color="#E9E1CF" />
      <Hand x={46} y={128} skin={skin} />
      <g className="ch-tap" style={{ transformOrigin: "75px 97px" }}>
        <Arm d="M75 96 Q88 112 74 124" color="#E3DAC6" />
        <line x1="73" y1="124" x2="63" y2="113" stroke="#4E5B63" strokeWidth="2.4" strokeLinecap="round" />
        <Hand x={73} y={124} skin={skin} />
      </g>
      <rect x="55" y="78" width="10" height="12" fill={skin} />
      <g className="ch-tilt-soft" style={{ transformOrigin: "60px 86px" }}>
        <ellipse cx="60" cy="60" rx="25" ry="22" fill={`url(#${u}s)`} {...LINE} />
        <path d="M35 62 Q33 38 60 38 Q87 38 85 62 Q82 47 60 46 Q38 47 35 62 Z" fill="#6B5A4E" />
        <Eye id={`${u}a`} c={{ x: 49, y: 60 }} w={7.5} h={3.3} lid={0.4} look={{ x: 0, y: 0.8 }} iris="#5D7A8C" lidColor="#E7C6AA" />
        <Eye id={`${u}c`} c={{ x: 71, y: 60 }} w={7.5} h={3.3} lid={0.4} look={{ x: 0, y: 0.8 }} iris="#5D7A8C" lidColor="#E7C6AA" />
        <circle cx="49" cy="60" r="10" fill="none" stroke="#4E5B63" strokeWidth="1.7" />
        <circle cx="71" cy="60" r="10" fill="none" stroke="#4E5B63" strokeWidth="1.7" />
        <line x1="59" y1="60" x2="61" y2="60" stroke="#4E5B63" strokeWidth="1.7" />
        <line x1="40" y1="47" x2="56" y2="47" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="64" y1="47" x2="80" y2="47" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <Nose y={63} len={7} />
        <line x1="54" y1="76" x2="66" y2="76" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        {/* top hat */}
        <path d="M44 40 L47 4 Q60 0 73 4 L76 40 Z" fill={`url(#${u}h)`} {...LINE} />
        <rect x="44.6" y="30" width="30.8" height="6" fill="#7E8E99" />
        <ellipse cx="60" cy="40" rx="28" ry="4.4" fill="#DED5C2" {...LINE} />
      </g>
    </g>
  );
}

/* ---------------- Red: the feeler. Leaning, hand on heart, arm flung up, wide open eyes, swinging hem. ---------------- */
function Red({ u }: { u: string }) {
  const skin = "#F0C3A6";
  return (
    <g>
      <defs>
        <Grad id={`${u}b`} a="#E2583F" b="#A32E22" />
        <Grad id={`${u}h`} a="#F07A4E" b="#C23A26" />
        <Grad id={`${u}s`} a="#F7D2BA" b="#DFA88A" />
      </defs>
      <Shadow rx={38} />
      <g className="ch-sway" style={{ transformOrigin: "60px 194px" }}>
        <g transform="rotate(-6 60 194)">
          <Feet a={50} b={70} />
          {/* hem tail */}
          <path d="M46 92 Q36 130 26 182 Q44 192 62 188 Q80 194 92 182 Q82 130 74 92 Q60 84 46 92 Z" fill={`url(#${u}b)`} {...LINE} />
          <Curl d="M26 182 Q12 182 12 168" color="#A32E22" w={4} />
          <Curl d={spiralFrom(12, 168, 8, Math.PI / 2, 1, 1.5)} color="#E07A3A" w={3.4} />
          <Dots pts={[[40, 164], [76, 160], [58, 176], [50, 140], [70, 132], [84, 176], [34, 176]]} fill="#F2B33D" />
          <path d="M60 104 C55 96 46 101 51 109 L60 118 L69 109 C74 101 65 96 60 104 Z" fill="#F2B33D" {...LINE} />
          <Arm d="M48 96 Q40 112 56 108" color="#B5352A" />
          <Hand x={56} y={108} skin={skin} />
          <g className="ch-wave" style={{ transformOrigin: "73px 96px" }}>
            <Arm d="M73 96 Q92 84 98 60" color="#C23A26" />
            <Curl d={spiralFrom(98, 60, 5, Math.PI / 2, 1, 1.4)} color={INK} w={2.8} />
          </g>
          <rect x="55" y="78" width="10" height="12" fill={skin} />
          <g transform="rotate(-8 60 60)">
            <Curl d={spiralFrom(34, 68, 8, 0, -1)} color="#8E2A1E" w={3.4} />
            <Curl d={spiralFrom(86, 70, 8, Math.PI, 1)} color="#8E2A1E" w={3.4} />
            <ellipse cx="60" cy="60" rx="25" ry="21" fill={`url(#${u}s)`} {...LINE} />
            <path d="M35 58 Q40 40 60 41 Q80 40 85 58 Q72 48 60 50 Q48 48 35 58 Z" fill="#8E2A1E" />
            <circle cx="42" cy="69" r="5" fill="#E98A7A" opacity=".65" />
            <circle cx="78" cy="69" r="5" fill="#E98A7A" opacity=".65" />
            <Eye id={`${u}a`} c={{ x: 49, y: 59 }} w={8.5} h={4.6} lid={0} look={{ x: 2, y: -1.4 }} iris="#3E7F86" lidColor="#E5AE92" />
            <Eye id={`${u}c`} c={{ x: 71, y: 59 }} w={8.5} h={4.6} lid={0} look={{ x: 2, y: -1.4 }} iris="#3E7F86" lidColor="#E5AE92" />
            <path d="M39 48 Q48 40 56 47" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
            <path d="M64 47 Q72 40 81 48" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
            <Nose y={61} len={7} />
            <path d="M52 73 Q60 84 68 73 Q60 76 52 73 Z" fill="#7A1E14" />
            {/* floppy cone hat, tip falls sideways into a spiral */}
            <path d="M38 44 Q42 10 64 8 Q88 8 100 26 Q92 22 84 24 Q76 32 82 44 Z" fill={`url(#${u}h)`} {...LINE} />
            <Curl d={spiralFrom(100, 26, 6, -Math.PI / 2, 1, 1.5)} color="#C8402F" w={3.2} />
            <path d="M38 44 Q60 37 82 44" fill="none" stroke="#F2B33D" strokeWidth="3.2" />
            <ellipse cx="60" cy="44" rx="25" ry="3.8" fill="#9E2E20" {...LINE} />
          </g>
        </g>
      </g>
    </g>
  );
}

/* ---------------- Black: the critic. Tall, arms crossed, leaning back, sideways narrow look, stiff hooked scarf. ---------------- */
function Black({ u }: { u: string }) {
  const skin = "#C99A7A";
  return (
    <g>
      <defs>
        <Grad id={`${u}b`} a="#454D5B" b="#1F242C" />
        <Grad id={`${u}h`} a="#2E333C" b="#101317" />
        <Grad id={`${u}s`} a="#D7AE90" b="#B5876A" />
      </defs>
      <Shadow />
      <g transform="rotate(4 60 194)">
        <g className="ch-foot" style={{ transformOrigin: "68px 190px" }}>
          <ellipse cx="72" cy="192" rx="7" ry="2.6" fill={INK} />
        </g>
        <ellipse cx="49" cy="192" rx="7" ry="2.6" fill={INK} />
        <path d="M45 90 Q40 140 43 190 L77 190 Q80 140 75 90 Q60 82 45 90 Z" fill={`url(#${u}b)`} {...LINE} />
        <path d="M52 90 L60 108 L68 90" fill="none" stroke="#5E6878" strokeWidth="1.4" />
        <Dots pts={[[50, 160], [70, 168], [58, 178], [68, 146], [50, 138]]} fill="#3E6A6E" />
        {/* stiff scarf with a hook, not a playful spiral */}
        <path d="M54 90 L50 168 L44 176 L42 170" fill="none" stroke="#3E6A6E" strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" />
        {/* crossed arms */}
        <Arm d="M46 98 Q51 122 73 114" color="#3A414E" w={6} />
        <Arm d="M74 98 Q69 122 47 114" color="#4A5260" w={6} />
        <Hand x={73} y={113} skin={skin} />
        <Hand x={47} y={113} skin={skin} />
        <rect x="55" y="78" width="10" height="12" fill={skin} />
        <ellipse cx="60" cy="60" rx="21" ry="24" fill={`url(#${u}s)`} {...LINE} />
        <path d="M55 82 L60 92 L65 82 Z" fill="#3A2E28" />
        <Eye id={`${u}a`} c={{ x: 50, y: 59 }} w={7} h={3.4} lid={0.64} look={{ x: -3, y: 1 }} iris="#C8A23A" lidColor="#A87B5F" tilt={-6} />
        <Eye id={`${u}c`} c={{ x: 70, y: 59 }} w={7} h={3.4} lid={0.64} look={{ x: -3, y: 1 }} iris="#C8A23A" lidColor="#A87B5F" tilt={6} />
        <line x1="41" y1="48" x2="56" y2="53" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="80" y1="45" x2="64" y2="51" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        <Nose y={58} len={12} />
        <path d="M53 79 Q60 76 67 80" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
        {/* stovepipe */}
        <g transform="rotate(-8 60 38)">
          <path d="M46 38 L43 -6 L77 -6 L74 38 Z" fill={`url(#${u}h)`} {...LINE} />
          <rect x="45" y="28" width="30" height="5" fill="#3E6A6E" />
          <ellipse cx="60" cy="38" rx="25" ry="4" fill="#15181E" {...LINE} />
        </g>
      </g>
    </g>
  );
}

/* ---------------- Yellow: the optimist. Bouncing, arms wide up, eyes closed in joy, springy ribbon. ---------------- */
function Yellow({ u }: { u: string }) {
  const skin = "#F5D7A8";
  return (
    <g>
      <defs>
        <Grad id={`${u}b`} a="#F3C552" b="#CF8E1E" />
        <Grad id={`${u}h`} a="#F7D467" b="#DDA22C" />
        <Grad id={`${u}s`} a="#FBE3BD" b="#E9BE88" />
      </defs>
      <ellipse className="ch-shadow-bounce" cx="60" cy="195" rx="32" ry="4" fill="#3a2a10" opacity=".2" style={{ transformOrigin: "60px 195px" }} />
      <g className="ch-bounce">
        <Feet y={190} a={50} b={70} />
        <path d="M46 92 Q28 140 34 186 Q60 194 86 186 Q92 140 74 92 Q60 84 46 92 Z" fill={`url(#${u}b)`} {...LINE} />
        <Curl d="M84 176 Q100 172 98 158" color="#D9662B" w={3.4} />
        <Curl d={spiralFrom(98, 158, 7, -Math.PI / 2, -1, 1.6)} color="#D9662B" w={3} />
        <Dots pts={[[44, 160], [76, 162], [60, 176], [52, 130], [69, 124], [60, 146], [80, 140], [40, 144], [48, 178], [72, 180]]} fill="#D9662B" />
        <g className="ch-wave" style={{ transformOrigin: "48px 96px" }}>
          <Arm d="M48 96 Q32 80 22 58" color="#E2A630" />
          <Curl d={spiralFrom(22, 58, 5, Math.PI / 2, -1, 1.4)} color={INK} w={2.8} />
        </g>
        <g className="ch-wave-r" style={{ transformOrigin: "72px 96px" }}>
          <Arm d="M72 96 Q88 80 98 58" color="#D69A2A" />
          <Curl d={spiralFrom(98, 58, 5, Math.PI / 2, 1, 1.4)} color={INK} w={2.8} />
        </g>
        <rect x="55" y="78" width="10" height="12" fill={skin} />
        <g transform="rotate(5 60 60)">
          <Curl d={spiralFrom(34, 62, 6, 0, -1)} color="#B5652B" w={3} />
          <Curl d={spiralFrom(86, 62, 6, Math.PI, 1)} color="#B5652B" w={3} />
          <ellipse cx="60" cy="60" rx="26" ry="22" fill={`url(#${u}s)`} {...LINE} />
          <circle cx="42" cy="67" r="5.4" fill="#EE9A6A" opacity=".7" />
          <circle cx="78" cy="67" r="5.4" fill="#EE9A6A" opacity=".7" />
          <path d="M41 59 Q48 50 55 59" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M65 59 Q72 50 79 59" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <Nose y={60} len={6} />
          <path d="M47 70 Q60 88 73 70 Z" fill="#8A2E14" />
          <path d="M50 71.6 L70 71.6" stroke="#fff" strokeWidth="2.2" />
          {/* sun hat */}
          <path d="M45 42 Q45 20 60 20 Q75 20 75 42 Z" fill={`url(#${u}h)`} {...LINE} />
          <Curl d={spiralFrom(60, 17, 5, Math.PI / 2, 1, 1.3)} color="#D9662B" w={2.6} />
          <rect x="45" y="35" width="30" height="5" fill="#D9662B" />
          <ellipse cx="60" cy="42" rx="38" ry="6.6" fill="#F3CB55" {...LINE} />
          <Dots pts={[[28, 42], [40, 45.5], [80, 45.5], [92, 42], [60, 47]]} fill="#D9662B" r={1.3} />
        </g>
      </g>
    </g>
  );
}

/* ---------------- Green: the inventor. One leg up, head tilted, mismatched eyes, sprouting idea, looping scarf. ---------------- */
function Green({ u }: { u: string }) {
  const skin = "#B98663";
  return (
    <g>
      <defs>
        <Grad id={`${u}b`} a="#3FA58F" b="#1E6B5C" />
        <Grad id={`${u}h`} a="#3B9C88" b="#1C6556" />
        <Grad id={`${u}s`} a="#CC9B78" b="#A17052" />
      </defs>
      <Shadow />
      <g className="ch-sway-slow" style={{ transformOrigin: "58px 194px" }}>
        <ellipse cx="56" cy="192" rx="6" ry="2.6" fill={INK} />
        <g className="ch-kick" style={{ transformOrigin: "70px 176px" }}>
          <path d="M70 176 Q86 178 88 166" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="89" cy="164" rx="3" ry="5" fill={INK} transform="rotate(-30 89 164)" />
        </g>
        <path d="M47 92 Q32 132 44 188 Q60 192 74 182 Q88 130 73 92 Q60 84 47 92 Z" fill={`url(#${u}b)`} {...LINE} />
        <Dots pts={[[50, 158], [68, 164], [58, 176], [70, 134], [48, 128], [62, 116]]} fill="#E8B23A" />
        <Curl d={spiralFrom(60, 144, 6, 0, 1, 1.4)} color="#C8402F" w={2} />
        {/* looping scarf */}
        <Curl d="M54 90 Q30 100 36 124 Q42 140 26 150" color="#E8B23A" w={4} />
        <Curl d={spiralFrom(26, 150, 7, Math.PI / 2, 1, 1.5)} color="#E8B23A" w={3.4} />
        <Arm d="M47 98 Q34 112 40 126" color="#2A8A75" />
        <Hand x={40} y={126} skin={skin} />
        {/* idea stem */}
        <g className="ch-stem" style={{ transformOrigin: "90px 78px" }}>
          <path d="M90 78 Q86 52 96 34 Q102 22 98 10" fill="none" stroke="#3C7A3A" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M92 52 Q102 46 107 52 Q100 59 92 52 Z" fill="#4CA36A" {...LINE} />
          <path d="M90 64 Q80 58 75 64 Q82 71 90 64 Z" fill="#4CA36A" {...LINE} />
          <circle cx="98" cy="10" r="8.5" fill="#E8B23A" {...LINE} />
          <Curl d={spiralFrom(104.5, 10, 6.5, 0, 1, 1.5)} color="#C8402F" w={1.9} />
        </g>
        <Arm d="M73 98 Q88 92 90 78" color="#2A8A75" />
        <Hand x={90} y={78} skin={skin} />
        <rect x="55" y="78" width="10" height="12" fill={skin} />
        <g className="ch-tilt" style={{ transformOrigin: "60px 86px" }}>
          <g transform="rotate(12 60 60)">
            <ellipse cx="60" cy="60" rx="25" ry="21" fill={`url(#${u}s)`} {...LINE} />
            {[[38, 50], [48, 42], [60, 40], [72, 43], [82, 52]].map(([x, y], i) => (
              <Curl key={i} d={spiralFrom(x, y, 4.6, i * 1.2, i % 2 ? 1 : -1)} color={INK} w={3} />
            ))}
            <Eye id={`${u}a`} c={{ x: 48, y: 60 }} w={9} h={5} lid={0.06} look={{ x: 1.5, y: -2 }} iris="#E8B23A" lidColor="#9B6A4E" />
            <Eye id={`${u}c`} c={{ x: 72, y: 61 }} w={6} h={3.2} lid={0.32} look={{ x: 1, y: -1.2 }} iris="#E8B23A" lidColor="#9B6A4E" />
            <path d="M38 49 Q47 43 56 49" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
            <path d="M65 54 L80 51" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
            <Nose y={62} len={7} />
            <path d="M53 75 Q62 80 69 72" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            {/* cone curling into a spiral */}
            <path d="M40 42 Q42 18 54 8 Q62 2 68 8 Q66 24 80 42 Z" fill={`url(#${u}h)`} {...LINE} />
            <Curl d={spiralFrom(54, 8, 6, Math.PI, -1, 1.5)} color="#2E8C7A" w={3.4} />
            <circle cx="60" cy="26" r="2" fill="#E8B23A" />
            <circle cx="67" cy="35" r="1.6" fill="#C8402F" />
            <ellipse cx="60" cy="42" rx="23" ry="3.8" fill="#185A4C" {...LINE} />
          </g>
        </g>
      </g>
    </g>
  );
}

/* ---------------- Blue: the conductor. Upright, baton raised, calm half-lidded gaze, precise sash spiral. ---------------- */
function Blue({ u }: { u: string }) {
  const skin = "#E8C2A0";
  return (
    <g className="ch-bob-soft">
      <defs>
        <Grad id={`${u}b`} a="#3466A8" b="#173A6B" />
        <Grad id={`${u}h`} a="#2E61A3" b="#163564" />
        <Grad id={`${u}s`} a="#F1D2B5" b="#D4A988" />
      </defs>
      <Shadow />
      <Feet a={53} b={68} />
      <path d="M44 90 Q39 140 42 190 L78 190 Q81 140 76 90 Q60 82 44 90 Z" fill={`url(#${u}b)`} {...LINE} />
      {[106, 120, 134, 148, 162].map((y) => <circle key={y} cx="60" cy={y} r="2" fill="#A9C4E6" />)}
      <path d="M44 93 L56 93" stroke="#A9C4E6" strokeWidth="2.2" />
      <path d="M64 93 L76 93" stroke="#A9C4E6" strokeWidth="2.2" />
      {/* sash: neat geometric spiral */}
      <Curl d="M76 100 L46 150 Q40 162 30 166" color="#E8B23A" w={3.6} />
      <Curl d={spiralFrom(30, 166, 8, Math.PI / 2, -1, 1.75)} color="#E8B23A" w={3} />
      <Arm d="M45 96 Q36 116 45 128" color="#2C5C9C" />
      <rect x="37" y="122" width="16" height="20" rx="1.5" fill="#F5EFE0" {...LINE} transform="rotate(-8 45 132)" />
      {[127, 131.5, 136].map((y) => <line key={y} x1="40" x2="50" y1={y} y2={y - 1.3} stroke="#23508F" strokeWidth="1.3" />)}
      <g className="ch-conduct" style={{ transformOrigin: "75px 96px" }}>
        <Arm d="M75 96 Q90 88 94 64" color="#2C5C9C" />
        <line x1="94" y1="64" x2="112" y2="36" stroke="#F5EFE0" strokeWidth="2.4" strokeLinecap="round" />
        <Hand x={94} y={64} skin={skin} />
      </g>
      <rect x="55" y="78" width="10" height="12" fill={skin} />
      <g transform="rotate(-4 60 60)">
        <ellipse cx="60" cy="60" rx="24" ry="22" fill={`url(#${u}s)`} {...LINE} />
        <path d="M36 60 Q36 42 60 42 Q84 42 84 60 Q78 48 66 48 Q48 48 36 60 Z" fill="#3A2E28" />
        <Eye id={`${u}a`} c={{ x: 49, y: 60 }} w={7.5} h={3.6} lid={0.48} look={{ x: 2.6, y: -1 }} iris="#3A6FB5" lidColor="#CFA182" />
        <Eye id={`${u}c`} c={{ x: 71, y: 60 }} w={7.5} h={3.6} lid={0.48} look={{ x: 2.6, y: -1 }} iris="#3A6FB5" lidColor="#CFA182" />
        <path d="M40 50 Q48 46 56 49" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M64 49 Q72 46 80 50" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
        <Nose y={62} len={7} />
        <path d="M53 75 Q60 80 67 75" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        {/* conductor cap */}
        <path d="M40 41 L42 12 Q60 5 78 12 L80 41 Z" fill={`url(#${u}h)`} {...LINE} />
        <rect x="40.6" y="31" width="38.8" height="5" fill="#A9C4E6" />
        <Curl d={spiralFrom(60, 21, 4.4, Math.PI / 2, 1, 1.4)} color="#E8B23A" w={2} />
        <path d="M38 41 Q60 50 82 41 Q60 45 38 41 Z" fill="#102A50" {...LINE} />
      </g>
    </g>
  );
}

const DRAW: Record<HatId, (p: { u: string }) => JSX.Element> = { white: White, red: Red, black: Black, yellow: Yellow, green: Green, blue: Blue };

export function Character({ hat, head = false, still = false, className }: { hat: HatId; head?: boolean; still?: boolean; className?: string }) {
  const u = useId().replace(/:/g, "");
  const C = DRAW[hat];
  return (
    <svg
      viewBox={head ? "14 0 92 96" : "0 -8 120 208"}
      className={`ch${still ? " ch--still" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      overflow="visible"
    >
      <C u={u} />
    </svg>
  );
}
