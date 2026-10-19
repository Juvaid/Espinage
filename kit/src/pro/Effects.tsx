import React from 'react';
import {Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {asset} from '../lib/asset';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Stylised effects from the shadcn ecosystem (Magic UI, Aceternity UI), rebuilt frame-driven so they render the same
// every time (CSS keyframe animations don't). Brand-themed. One effect per beat, on the element that matters.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const inOut = Easing.bezier(0.77, 0, 0.175, 1);
const expo = Easing.bezier(0.16, 1, 0.3, 1);

// Border beam (Magic UI): a short glowing segment travels once around a card or button border.
// Wrap the element; w/h/radius must match it. `at`: start frame; `dur`: frames for one lap.
export const BorderBeam: React.FC<{w: number; h: number; radius?: number; at: number; dur?: number; laps?: number; children?: React.ReactNode}> = ({w, h, radius = 28, at, dur = 48, laps = 1, children}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur * laps], [0, laps], clamp);
  const vis = interpolate(f, [at, at + 6, at + dur * laps - 6, at + dur * laps], [0, 1, 1, 0], clamp);
  const per = 2 * (w + h - 4 * radius) + 2 * Math.PI * radius;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {children}
      <svg width={w + 8} height={h + 8} style={{position: 'absolute', left: -4, top: -4, overflow: 'visible', pointerEvents: 'none', opacity: vis}}>
        <rect x={4} y={4} width={w} height={h} rx={radius} fill="none" stroke={C.type3d.ramp[0][1]} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${per * 0.12} ${per * 0.88}`} strokeDashoffset={-per * (p % 1)} style={{filter: `drop-shadow(0 0 8px ${C.accent}) drop-shadow(0 0 18px ${alpha(C.glow, 0.8)})`}} />
      </svg>
    </div>
  );
};

// Shine sweep (Magic UI "shimmer button"): a diagonal light band crosses a button or pill once. Wrap the element.
export const ShineSweep: React.FC<{at: number; dur?: number; radius?: number; children: React.ReactNode}> = ({at, dur = 22, radius = 999, children}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [at, at + dur], [-40, 140], {...clamp, easing: inOut});
  return (
    <div style={{position: 'relative', display: 'inline-block', borderRadius: radius, overflow: 'hidden'}}>
      {children}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${x - 18}%, rgba(255,255,255,0.65) ${x}%, transparent ${x + 18}%)`, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
    </div>
  );
};

// Number ticker (Magic UI): each digit rolls up into place, the last digit landing on `at + dur`.
export const NumberTicker: React.FC<{value: string; at: number; dur?: number; size?: number; color?: string; style?: React.CSSProperties}> = ({value, at, dur = 22, size = 160, color, style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  return (
    <div style={{display: 'inline-flex', fontFamily: C.fontHead, fontWeight: 640, fontSize: size, lineHeight: 1, letterSpacing: '-0.04em', color: color ?? C.ivory, fontVariantNumeric: 'tabular-nums', ...style}}>
      {value.split('').map((ch, i) => {
        if (!/[0-9]/.test(ch)) return <span key={i}>{ch}</span>;
        const target = +ch;
        const p = interpolate(f, [at + i * 3, at + dur + i * 3], [0, 1], {...clamp, easing: expo});
        const pos = (target + 10) * p; // rolls through one full turn, then to the digit
        return (
          <span key={i} style={{display: 'inline-block', height: '1em', overflow: 'hidden', position: 'relative', WebkitMaskImage: 'linear-gradient(transparent, #000 18%, #000 82%, transparent)', maskImage: 'linear-gradient(transparent, #000 18%, #000 82%, transparent)'}}>
            <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-pos}em)`}}>
              {Array.from({length: 20}, (_, k) => <span key={k} style={{height: '1em'}}>{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Animated beam (Magic UI): a curved line between two points draws on, then a light runs along it.
// Connects ideas: the map pin to the building, the city to the site, a benefit to its picture.
export const AnimatedBeam: React.FC<{from: [number, number]; to: [number, number]; at: number; curve?: number; dur?: number}> = ({from, to, at, curve = -0.25, dur = 26}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * curve, my = (y1 + y2) / 2 + (x2 - x1) * curve;
  const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
  const draw = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: inOut});
  const run = interpolate(f, [at + dur * 0.6, at + dur * 1.8], [0, 1], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <path d={d} fill="none" stroke={C.hair} strokeWidth={2.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      <path d={d} fill="none" stroke={C.type3d.ramp[0][1]} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="0.14 0.86" strokeDashoffset={-run} opacity={run > 0 && run < 1 ? 1 : 0} style={{filter: `drop-shadow(0 0 10px ${C.accent})`}} />
      <circle cx={x2} cy={y2} r={8 * draw} fill={C.accent} style={{filter: `drop-shadow(0 0 10px ${C.accent})`}} />
    </svg>
  );
};

// Spotlight (Aceternity): a soft cone of light sweeps across a card or a word once; put it over the element.
export const Spotlight: React.FC<{at: number; dur?: number; w?: number; h?: number}> = ({at, dur = 36, w = 1080, h = 1920}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: inOut});
  const vis = interpolate(f, [at, at + 8, at + dur - 8, at + dur], [0, 1, 1, 0], clamp);
  return <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, pointerEvents: 'none', opacity: vis * 0.55, mixBlendMode: 'screen', background: `radial-gradient(38% 26% at ${-10 + 120 * p}% ${20 + 30 * p}%, ${alpha(C.glow, 0.9)}, transparent 70%)`}} />;
};

// Lens (Magic UI): a round loupe glides across a photo, showing it magnified inside: for a detail worth seeing.
// Same src and box as the photo underneath; path: [x, y] fractions the loupe travels between.
export const Lens: React.FC<{src: string; w: number; h: number; left: number; top: number; at: number; dur?: number; path?: [[number, number], [number, number]]; zoom?: number; r?: number}> = ({src, w, h, left, top, at, dur = 60, path = [[0.25, 0.4], [0.7, 0.55]], zoom = 2.2, r = 150}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: inOut});
  const vis = interpolate(f, [at, at + 8, at + dur, at + dur + 8], [0, 1, 1, 0], clamp);
  const cx = (path[0][0] + (path[1][0] - path[0][0]) * p) * w, cy = (path[0][1] + (path[1][1] - path[0][1]) * p) * h;
  return (
    <div style={{position: 'absolute', left: left + cx - r, top: top + cy - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', opacity: vis, border: `3px solid ${C.type3d.ramp[0][1]}`, boxShadow: `0 20px 50px ${C.shadow}, 0 0 30px ${alpha(C.glow, 0.5)}`}}>
      <Img src={asset(src)} style={{position: 'absolute', width: w * zoom, height: h * zoom, objectFit: 'cover', left: -(cx * zoom - r), top: -(cy * zoom - r)}} />
    </div>
  );
};

// Orbit (Magic UI "orbiting circles"): a few icons or chips circle a centre object on a tilted ring; for
// "everything around it" lines (amenities around the building, places around the site). 3–6 items.
export const Orbit: React.FC<{cx: number; cy: number; rx?: number; ry?: number; at: number; items: React.ReactNode[]; speed?: number}> = ({cx, cy, rx = 360, ry = 120, at, items, speed = 0.012}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const inn = interpolate(f, [at, at + 20], [0, 1], {...clamp, easing: expo});
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: inn}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={cx} cy={cy} rx={rx * inn} ry={ry * inn} fill="none" stroke={C.hair} strokeWidth={1.5} />
      </svg>
      {items.map((node, i) => {
        const a = (i / items.length) * Math.PI * 2 + (f - at) * speed;
        const depth = (Math.sin(a) + 1) / 2; // front of the ring = 1
        return (
          <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * rx * inn, top: cy + Math.sin(a) * ry * inn, transform: `translate(-50%, -50%) scale(${0.75 + 0.35 * depth})`, opacity: 0.45 + 0.55 * depth, zIndex: Math.round(depth * 10)}}>
            {node}
          </div>
        );
      })}
    </div>
  );
};
