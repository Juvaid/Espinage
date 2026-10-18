import React, {useId} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Grade and lens: one look across every picture in a film, so renders, phone footage and stock sit together.
//   Grade      · contrast curve + brand split-tone (shadows to the deep tone, highlights to the light metal) +
//                halation (highlights bleed a warm glow) + saturation, in one SVG filter. Wrap a picture or a scene.
//   Vignette   · soft edge falloff in the ground colour (pull the eye in; 0.3–0.5)
//   LightLeak  · a feathered brand-tinted leak drifting across once: the single biggest reveal, once per film
//   FocusPull  · rack focus: soft → sharp (or back) with a small breath in scale
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rgb = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export type GradeLook = 'brand' | 'neutral' | 'night' | 'golden';
// contrast 0..1 (S-curve strength), tone 0..1 (split-tone strength), halation 0..1, saturation (1 = unchanged)
export const Grade: React.FC<{look?: GradeLook; contrast?: number; tone?: number; halation?: number; saturation?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  look = 'brand', contrast = 0.45, tone = 0.3, halation = 0.25, saturation = 1, children, style,
}) => {
  const C = useKitTheme();
  const id = `grade-${useId().replace(/:/g, '')}`;
  // shadow and highlight tints per look; brand takes them from the theme's metal
  const [sh, hi] =
    look === 'brand' ? [C.type3d.env[3], String(C.type3d.ramp[1][1])]
    : look === 'night' ? ['#0b1830', '#cfe0ff']
    : look === 'golden' ? ['#2a1a10', '#ffe2b0']
    : ['#202020', '#f0f0f0'];
  const [s, h] = [rgb(sh), rgb(hi)];
  // contrast: a straight line blended towards an S-curve (blacks and whites stay put)
  const curve = Array.from({length: 17}, (_, i) => {
    const x = i / 16;
    const sc = 0.5 - 0.5 * Math.cos(Math.PI * x); // S-curve
    return (x + contrast * 0.6 * (sc - x)).toFixed(4);
  }).join(' ');
  // gradient map of luminance: black → shadow tint → mid grey → highlight tint → white
  const map = (c: number) => `0 ${s[c] * 0.6} ${0.5} ${h[c] * 0.92 + 0.08} 1`;
  const glow = rgb(C.type3d.light);
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', filter: `url(#${id})`, ...style}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceGraphic" result="curve">
            <feFuncR type="table" tableValues={curve} />
            <feFuncG type="table" tableValues={curve} />
            <feFuncB type="table" tableValues={curve} />
          </feComponentTransfer>
          <feColorMatrix in="curve" type="saturate" values={String(saturation)} result="sat" />
          {/* split tone: a duotone map of the luminance, blended soft-light over the picture */}
          <feColorMatrix in="sat" type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="luma" />
          <feComponentTransfer in="luma" result="duo">
            <feFuncR type="table" tableValues={map(0)} />
            <feFuncG type="table" tableValues={map(1)} />
            <feFuncB type="table" tableValues={map(2)} />
          </feComponentTransfer>
          <feBlend in="duo" in2="sat" mode="soft-light" result="toned" />
          <feComposite in="toned" in2="sat" operator="arithmetic" k1={0} k2={tone} k3={1 - tone} k4={0} result="graded" />
          {/* halation: the brightest parts, tinted with the light, blurred and screened back */}
          <feComponentTransfer in="luma" result="hot">
            <feFuncR type="linear" slope={5} intercept={-3.9} />
            <feFuncG type="linear" slope={5} intercept={-3.9} />
            <feFuncB type="linear" slope={5} intercept={-3.9} />
          </feComponentTransfer>
          <feColorMatrix in="hot" type="matrix" values={`${glow[0]} 0 0 0 0  0 ${glow[1] * 0.8} 0 0 0  0 0 ${glow[2] * 0.6} 0 0  0 0 0 1 0`} result="tint" />
          <feGaussianBlur in="tint" stdDeviation="14" result="bloom" />
          <feComposite in="bloom" in2="graded" operator="arithmetic" k1={0} k2={halation} k3={1} k4={0} />
        </filter>
      </svg>
      {children}
    </div>
  );
};

export const Vignette: React.FC<{amount?: number}> = ({amount = 0.4}) => {
  const C = useKitTheme();
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(120% 85% at 50% 48%, transparent 45%, ${alpha(C.deep, amount)} 100%)`}} />;
};

// at: frame the leak peaks (put it on the reveal word); dur: frames on screen; from: the side it drifts in from
export const LightLeak: React.FC<{at: number; dur?: number; from?: 'left' | 'right'; strength?: number}> = ({at, dur = 30, from = 'left', strength = 0.55}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  if (f < at - dur / 2 || f > at + dur / 2) return null;
  const p = interpolate(f, [at - dur / 2, at + dur / 2], [0, 1], clamp);
  const o = Math.sin(Math.PI * p) * strength;
  const x = from === 'left' ? -20 + 90 * p : 120 - 90 * p;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', opacity: o}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(45% 60% at ${x}% 38%, ${alpha(C.type3d.light, 0.9)}, transparent 70%)`}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(25% 35% at ${x + 8}% 30%, ${String(C.type3d.ramp[0][1])}, transparent 70%)`}} />
    </div>
  );
};

// from/to: blur in px; at: start frame; dur: frames
export const FocusPull: React.FC<{at: number; dur?: number; from?: number; to?: number; children: React.ReactNode}> = ({at, dur = 18, from = 14, to = 0, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
  const b = from + (to - from) * p;
  const breath = 1 + 0.015 * Math.sin(Math.PI * p);
  return <div style={{position: 'absolute', inset: 0, filter: b > 0.1 ? `blur(${b}px)` : undefined, transform: `scale(${breath})`}}>{children}</div>;
};
