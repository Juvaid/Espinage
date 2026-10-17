import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BevelSize, BevelTone} from '../../types/captions';

const SIZES: Record<BevelSize, {soft: number; depth: number; extrude: number}> = {
  lg: {soft: 2.6, depth: 2.4, extrude: 5},
  md: {soft: 1.3, depth: 1.7, extrude: 3},
  sm: {soft: 0.8, depth: 1.2, extrude: 2},
};

const TONES: Record<BevelTone, {face: string; extrude: [string, string]; light: string}> = {
  gold: {face: '#dfb25a', extrude: ['#8f6726', '#4a3312'], light: '#fff3d9'},
  ivory: {face: '#f2ece2', extrude: ['#9c9281', '#4a4338'], light: '#ffffff'},
  crimson: {face: '#c8323a', extrude: ['#7a1b20', '#3d0c0f'], light: '#ffd9d3'},
  chrome: {face: '#f0f4f8', extrude: ['#7a889b', '#36404d'], light: '#ffffff'},
  emerald: {face: '#34d399', extrude: ['#065f46', '#022c22'], light: '#a7f3d0'},
};

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

/** Render once per composition or scene. The key light drifts slowly so edges glint. */
export const BevelDefs: React.FC = () => {
  const frame = useCurrentFrame();
  const az = 230 + Math.sin(frame / 26) * 30;
  return (
    <svg width={0} height={0} style={{position: 'absolute', pointerEvents: 'none'}}>
      {(Object.keys(SIZES) as BevelSize[]).flatMap((size) =>
        (Object.keys(TONES) as BevelTone[]).map((tone) => {
          const s = SIZES[size];
          return (
            <filter
              key={size + tone}
              id={`bevel-${size}-${tone}`}
              x="-10%"
              y="-25%"
              width="120%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation={s.soft} result="b" />
              <feDiffuseLighting
                in="b"
                surfaceScale={s.depth}
                diffuseConstant={1.08}
                lightingColor="#ffffff"
                result="d"
              >
                <feDistantLight azimuth={az} elevation={62} />
              </feDiffuseLighting>
              <feSpecularLighting
                in="b"
                surfaceScale={s.depth}
                specularConstant={0.95}
                specularExponent={48}
                lightingColor={TONES[tone].light}
                result="sp"
              >
                <feDistantLight azimuth={az} elevation={30} />
              </feSpecularLighting>
              <feComposite in="sp" in2="SourceAlpha" operator="in" result="spIn" />
              <feComposite
                in="SourceGraphic"
                in2="d"
                operator="arithmetic"
                k1={1.04}
                k2={0}
                k3={0}
                k4={0}
                result="shaded"
              />
              <feComposite
                in="shaded"
                in2="spIn"
                operator="arithmetic"
                k1={0}
                k2={1}
                k3={0.85}
                k4={0}
                result="lit"
              />
              <feComposite in="lit" in2="SourceAlpha" operator="in" />
            </filter>
          );
        }),
      )}
    </svg>
  );
};

export interface BevelProps {
  tone?: BevelTone;
  size?: BevelSize;
  sheen?: number; // Sheen progress in % (-20 -> 120 sweeps across)
  glow?: number;  // Multiplier for soft bloom
  children: () => React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Three stacked copies of the same content: extruded back, lit face, sheen.
 * `children` renders per layer so per-letter animation stays in sync.
 */
export const Bevel: React.FC<BevelProps> = ({
  tone = 'gold',
  size = 'md',
  sheen = -99,
  glow = 0,
  children,
  style,
}) => {
  const t = TONES[tone] || TONES.gold;
  const s = SIZES[size] || SIZES.md;
  const stack = Array.from(
    {length: s.extrude},
    (_, i) => `0 ${i + 1}px 0 ${mix(t.extrude[0], t.extrude[1], i / Math.max(1, s.extrude - 1))}`
  );
  stack.push(`0 ${s.extrude + 6}px ${s.extrude * 4}px oklch(0.06 0.005 70 / 0.6)`);

  const g = tone === 'gold' ? Math.max(glow, 0.5) : glow;
  if (g > 0) {
    stack.push(
      `0 0 ${s.extrude * 10 * g}px oklch(0.8 0.125 80 / ${0.35 * g})`,
      `0 0 ${s.extrude * 3 * g}px oklch(0.85 0.12 82 / ${0.3 * g})`
    );
  }

  const band = `linear-gradient(112deg, transparent ${sheen - 16}%, rgba(0,0,0,0.12) ${sheen - 7}%, black ${sheen}%, rgba(0,0,0,0.12) ${sheen + 7}%, transparent ${sheen + 16}%)`;
  const sheenOn = sheen > -18 && sheen < 118;

  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          color: t.extrude[0],
          textShadow: stack.join(', '),
        }}
      >
        {children()}
      </div>
      <div style={{position: 'relative', color: t.face, filter: `url(#bevel-${size}-${tone})`}}>
        {children()}
      </div>
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
            opacity: 0.85,
          }}
        >
          {children()}
        </div>
      ) : null}
    </div>
  );
};
