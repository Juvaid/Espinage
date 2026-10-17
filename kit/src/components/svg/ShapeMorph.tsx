import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease} from '../../lib/anim';
import {getReelTheme} from '../../presets/themes';
import {useReelThemeFromKit} from '../../theme/KitTheme';
import type {ReelTheme} from '../../types/presets';

// One shape smoothly becoming the next (pin → building → key …): every outline is resampled to the same number of
// points along its length, rotated so the point orders line up (least total travel), then the points are blended.
// Single-contour outlines only (no holes); give every shape the same viewBox. `at[i]` = frame shape i is complete;
// each morph takes `morph` frames and ends on its frame.
const N = 160;
const sample = (d: string): [number, number][] => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  const L = el.getTotalLength();
  return Array.from({length: N}, (_, i) => {
    const p = el.getPointAtLength((L * i) / N);
    return [p.x, p.y] as [number, number];
  });
};
const align = (a: [number, number][], b: [number, number][]) => {
  // rotate b's start point (and try both directions) to minimise the distance travelled from a
  let best = b, bestD = Infinity;
  for (const dir of [b, [...b].reverse()]) {
    for (let s = 0; s < N; s += 2) {
      let d = 0;
      for (let i = 0; i < N; i += 4) {
        const q = dir[(i + s) % N];
        d += (a[i][0] - q[0]) ** 2 + (a[i][1] - q[1]) ** 2;
      }
      if (d < bestD) { bestD = d; best = dir.map((_, i) => dir[(i + s) % N]); }
    }
  }
  return best;
};

export const ShapeMorph: React.FC<{
  shapes: string[];
  at: number[];
  morph?: number;
  viewBox?: string;
  size?: number;
  theme?: string | ReelTheme;
  fill?: 'metal' | 'outline';
  labels?: string[]; // one word per shape, crossfading under it ("Location", "Building", "Home")
  style?: React.CSSProperties;
}> = ({shapes, at, morph = 18, viewBox = '0 0 100 100', size = 420, theme, fill = 'metal', labels, style}) => {
  const f = useCurrentFrame();
  const kit = useReelThemeFromKit();
  const t = theme === undefined ? kit : getReelTheme(theme);
  const pts = useMemo(() => {
    const out: [number, number][][] = [];
    shapes.forEach((d, i) => {
      const s = sample(d);
      out.push(i === 0 ? s : align(out[i - 1], s));
    });
    return out;
  }, [shapes]);
  // which pair we're between, and how far
  let k = 0, p = 0;
  for (let i = 1; i < pts.length; i++) {
    if (f >= at[i] - morph) {
      k = i - 1;
      p = interpolate(f, [at[i] - morph, at[i]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
    }
  }
  const A = pts[k], B = pts[Math.min(k + 1, pts.length - 1)];
  const d = 'M' + A.map((a, i) => `${a[0] + (B[i][0] - a[0]) * p} ${a[1] + (B[i][1] - a[1]) * p}`).join('L') + 'Z';
  // the landed shape shows its details (pin hole, windows, door, key hole); they fade out as the outline starts to move
  const near = p < 0.5 ? k : Math.min(k + 1, shapes.length - 1);
  const landed = p < 0.5 ? interpolate(p, [0, 0.22], [1, 0], {extrapolateRight: 'clamp'}) : interpolate(p, [0.78, 1], [0, 1], {extrapolateLeft: 'clamp'});
  const detail = MORPH_DETAIL[shapeName(shapes[near]) ?? ''];
  const squash = 1 - 0.07 * Math.sin(Math.PI * p); // a small breath while it changes, settling on the new shape
  const id = `morph-${t.id}`;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, ...style}}>
      <svg width={size} height={size} viewBox={viewBox} style={{overflow: 'visible', transform: `scale(${squash})`, filter: `drop-shadow(0 18px 30px oklch(0 0 0 / 0.5)) drop-shadow(0 0 22px ${t.accentGlow})`}}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor={`color-mix(in oklch, ${t.accent} 45%, white)`} />
            <stop offset="0.5" stopColor={t.accent} />
            <stop offset="1" stopColor={`color-mix(in oklch, ${t.accent} 62%, black)`} />
          </linearGradient>
        </defs>
        <path d={d} fill={fill === 'metal' ? `url(#${id})` : 'none'} stroke={fill === 'metal' ? `color-mix(in oklch, ${t.ivory} 55%, transparent)` : t.accent} strokeWidth={fill === 'metal' ? 0.8 : 2} strokeLinejoin="round" />
        {detail ? <path d={detail} fill={fill === 'metal' ? t.ground : 'none'} stroke={fill === 'metal' ? 'none' : t.accent} strokeWidth={1.5} opacity={landed * 0.92} transform={`translate(50 50) scale(${0.9 + 0.1 * landed}) translate(-50 -50)`} /> : null}
      </svg>
      {labels ? (
        <div style={{position: 'relative', height: 64, width: size * 1.6}}>
          {labels.map((l, i) => {
            const o = i === near ? landed : 0;
            return (
              <div key={i} style={{position: 'absolute', inset: 0, textAlign: 'center', fontFamily: t.fontFamilyHead, fontWeight: 500, fontSize: 52, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.ivory, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, filter: `blur(${(1 - o) * 4}px)`}}>
                {l}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

// ready-made outlines on a 100-unit box, for morph chains
export const MORPH_SHAPES = {
  pin: 'M50 6 C30 6 18 21 18 38 C18 60 50 94 50 94 C50 94 82 60 82 38 C82 21 70 6 50 6 Z',
  building: 'M24 92 L24 34 L34 34 L34 22 L44 22 L44 8 L56 8 L56 22 L66 22 L66 34 L76 34 L76 92 Z',
  key: 'M14 50 A17 17 0 1 1 48 50 L90 50 L90 58 L82 58 L82 66 L74 66 L74 58 L48 58 A17 17 0 0 1 14 50 Z',
  circle: 'M50 8 A42 42 0 1 1 49.9 8 Z',
  house: 'M14 50 L50 14 L86 50 L76 50 L76 90 L24 90 L24 50 Z',
  diamond: 'M28 14 L72 14 L92 40 L50 92 L8 40 Z',
};
// details cut into each landed shape so it reads at a glance (drawn in the ground colour)
const win = (x: number, y: number, w = 8, h = 6) => `M${x} ${y}h${w}v${h}h-${w}Z`;
const MORPH_DETAIL: Record<string, string> = {
  pin: 'M50 26 A12 12 0 1 1 49.9 26 Z',
  building: [30, 44, 58].flatMap((x) => [42, 52, 62, 72].map((y) => win(x + 2, y))).join(' ') + ' ' + win(46, 28, 8, 5) + ' ' + win(44, 80, 12, 12),
  key: 'M31 44 A6 6 0 1 1 30.9 44 Z',
  house: win(43, 66, 14, 24) + ' ' + win(31, 56, 9, 9) + ' ' + win(60, 56, 9, 9),
  diamond: 'M28 14 L36 40 L50 92 L64 40 L72 14 L70 15 L62 40 L50 84 L38 40 L30 15 Z M8 40 L92 40 L91 42 L9 42 Z',
};
const shapeName = (d: string) => (Object.keys(MORPH_SHAPES) as (keyof typeof MORPH_SHAPES)[]).find((n) => MORPH_SHAPES[n] === d);
