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
  style?: React.CSSProperties;
}> = ({shapes, at, morph = 18, viewBox = '0 0 100 100', size = 420, theme, fill = 'metal', style}) => {
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
  const id = `morph-${t.id}`;
  return (
    <svg width={size} height={size} viewBox={viewBox} style={{overflow: 'visible', filter: `drop-shadow(0 0 18px ${t.accentGlow})`, ...style}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor={t.accent} />
          <stop offset="0.55" stopColor={`color-mix(in oklch, ${t.accent} 60%, black)`} />
          <stop offset="1" stopColor={t.accent} />
        </linearGradient>
      </defs>
      <path d={d} fill={fill === 'metal' ? `url(#${id})` : 'none'} stroke={fill === 'metal' ? 'oklch(1 0 0 / 0.5)' : t.accent} strokeWidth={fill === 'metal' ? 0.6 : 2} strokeLinejoin="round" />
    </svg>
  );
};

// ready-made outlines on a 100-unit box, for morph chains
export const MORPH_SHAPES = {
  pin: 'M50 6 C30 6 18 21 18 38 C18 60 50 94 50 94 C50 94 82 60 82 38 C82 21 70 6 50 6 Z',
  building: 'M22 92 L22 30 L38 22 L38 12 L62 12 L62 22 L78 30 L78 92 Z',
  key: 'M14 50 A17 17 0 1 1 48 50 L90 50 L90 58 L82 58 L82 66 L74 66 L74 58 L48 58 A17 17 0 0 1 14 50 Z',
  circle: 'M50 8 A42 42 0 1 1 49.9 8 Z',
  house: 'M14 50 L50 14 L86 50 L76 50 L76 90 L24 90 L24 50 Z',
  diamond: 'M28 14 L72 14 L92 40 L50 92 L8 40 Z',
};
