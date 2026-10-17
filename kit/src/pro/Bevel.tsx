import React from 'react';
import {useCurrentFrame} from 'remotion';

// Sleek bevel for emphasis words: a thin chamfer with SVG lighting & shallow extrusion.
type Size = 'lg' | 'md' | 'sm';
const SIZES: Record<Size, {soft: number; depth: number; extrude: number}> = {
  lg: {soft: 2.6, depth: 2.4, extrude: 5},
  md: {soft: 1.3, depth: 1.7, extrude: 3},
  sm: {soft: 0.8, depth: 1.2, extrude: 2},
};

export type Tone = 'gold' | 'ivory' | 'crimson' | 'steel' | 'champagne';
const TONES: Record<Tone, {face: string; extrude: [string, string]; light: string}> = {
  gold: {face: '#dfb25a', extrude: ['#8f6726', '#4a3312'], light: '#fff3d9'},
  ivory: {face: '#f2ece2', extrude: ['#9c9281', '#4a4338'], light: '#ffffff'},
  // cool chamfer for the navy look of the 54D voice ads
  steel: {face: '#f1f4f8', extrude: ['#8793a6', '#283243'], light: '#ffffff'},
  // Crown Crest: brighter rose gold for small screens
  champagne: {face: '#f4cdb0', extrude: ['#a8694f', '#5a3426'], light: '#fff6ee'},
  crimson: {face: '#c8323a', extrude: ['#7a1b20', '#3d0c0f'], light: '#ffd9d3'},
};

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

/** Render once per composition. The key light drifts slowly so edges glint. */
export const BevelDefs: React.FC = () => {
  const frame = useCurrentFrame();
  const az = 230 + Math.sin(frame / 26) * 30;
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      {/* soft inner shadow: the top inside edge of each letter falls into shade */}
      <filter id="inset-soft" x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
        <feOffset in="SourceAlpha" dy={2.2} result="off" />
        <feGaussianBlur in="off" stdDeviation={1.6} result="blur" />
        <feComposite in="SourceAlpha" in2="blur" operator="out" result="edge" />
        <feFlood floodColor="#16233c" floodOpacity={0.6} />
        <feComposite in2="edge" operator="in" result="shade" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="shade" /></feMerge>
      </filter>
      {(Object.keys(SIZES) as Size[]).flatMap((size) =>
        (Object.keys(TONES) as Tone[]).map((tone) => {
          const s = SIZES[size];
          return (
            <filter key={size + tone} id={`bevel-${size}-${tone}`} x="-10%" y="-25%" width="120%" height="150%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation={s.soft} result="b" />
              <feDiffuseLighting in="b" surfaceScale={s.depth} diffuseConstant={1.08} lightingColor="#ffffff" result="d">
                <feDistantLight azimuth={az} elevation={62} />
              </feDiffuseLighting>
              <feSpecularLighting in="b" surfaceScale={s.depth} specularConstant={0.95} specularExponent={48} lightingColor={TONES[tone].light} result="sp">
                <feDistantLight azimuth={az} elevation={30} />
              </feSpecularLighting>
              <feComposite in="sp" in2="SourceAlpha" operator="in" result="spIn" />
              <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1.04} k2={0} k3={0} k4={0} result="shaded" />
              <feComposite in="shaded" in2="spIn" operator="arithmetic" k1={0} k2={1} k3={0.85} k4={0} result="lit" />
              <feComposite in="lit" in2="SourceAlpha" operator="in" />
            </filter>
          );
        }),
      )}
    </svg>
  );
};

export const Bevel: React.FC<{
  tone: Tone;
  size: Size;
  sheen?: number;
  glow?: number;
  children: () => React.ReactNode;
  style?: React.CSSProperties;
}> = ({tone, size, sheen = -99, glow = 0, children, style}) => {
  const t = TONES[tone];
  const s = SIZES[size];
  const stack = Array.from({length: s.extrude}, (_, i) => `0 ${i + 1}px 0 ${mix(t.extrude[0], t.extrude[1], i / Math.max(1, s.extrude - 1))}`);
  stack.push(`0 ${s.extrude + 6}px ${s.extrude * 4}px oklch(0.06 0.005 70 / 0.6)`);
  const g = tone === 'gold' ? Math.max(glow, 0.5) : glow;
  const hue = tone === 'steel' ? '0.8 0.09 235' : tone === 'crimson' ? '0.7 0.15 25' : tone === 'champagne' ? '0.82 0.08 55' : '0.8 0.125 80';
  if (g > 0) stack.push(`0 0 ${s.extrude * 10 * g}px oklch(${hue} / ${0.35 * g})`, `0 0 ${s.extrude * 3 * g}px oklch(${hue} / ${0.3 * g})`);

  const band = `linear-gradient(112deg, transparent ${sheen - 16}%, rgba(0,0,0,0.12) ${sheen - 7}%, black ${sheen}%, rgba(0,0,0,0.12) ${sheen + 7}%, transparent ${sheen + 16}%)`;
  const sheenOn = sheen > -18 && sheen < 118;

  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <div aria-hidden style={{position: 'absolute', inset: 0, color: t.extrude[0], textShadow: stack.join(', ')}}>
        {children()}
      </div>
      <div style={{position: 'relative', color: t.face, filter: `url(#bevel-${size}-${tone})`}}>{children()}</div>
      {sheenOn ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            color: '#fffdf6',
            WebkitMaskImage: band,
            maskImage: band,
            filter: `drop-shadow(0 0 ${s.extrude * 1.4}px ${t.light})`,
            opacity: 0.8,
          }}
        >
          {children()}
        </div>
      ) : null}
    </div>
  );
};
