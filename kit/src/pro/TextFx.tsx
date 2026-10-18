import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {NumberTicker} from './Effects';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Text effects (ideas from Magic UI / Aceternity, rebuilt frame-driven and themed). Each one lands on spoken frames.
//   WordRotate  · one slot, words replace each other on their frames ("Showroom → Office → Clinic")
//   ShimmerText · a light passes through the word once (brand ramp), on the hero word
//   BlurInText  · words come out of focus one by one: quiet subtitle under a 3D hook
//   SlitLine    · a line rises out of a slit: editorial headings
//   StatGrid    · 2–4 figures that tick in on their words, with a unit and a label
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);

type Tw = {size?: number; weight?: number; color?: string; style?: React.CSSProperties};

export const WordRotate: React.FC<Tw & {words: {t: string; at: number}[]; align?: 'left' | 'center'}> = ({words, size = 120, weight = 640, color, align = 'center', style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  return (
    <div style={{position: 'relative', height: size * 1.25, fontFamily: C.fontHead, fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', lineHeight: 1.25, color: color ?? C.ivory, WebkitMaskImage: 'linear-gradient(transparent, #000 22%, #000 78%, transparent)', maskImage: 'linear-gradient(transparent, #000 22%, #000 78%, transparent)', ...style}}>
      {words.map((w, i) => {
        const next = words[i + 1]?.at;
        const inn = interpolate(f, [w.at - 2, w.at + 10], [0, 1], {...clamp, easing: expo});
        const out = next === undefined ? 0 : interpolate(f, [next - 2, next + 8], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
        if (inn <= 0 || out >= 1) return null;
        const y = (1 - inn) * 0.6 - out * 0.6;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, textAlign: align, transform: `translateY(${y}em)`, opacity: inn * (1 - out), filter: `blur(${(1 - inn + out) * 8}px)`}}>
            {w.t}
          </div>
        );
      })}
    </div>
  );
};

// at: frame the light starts across; dur: frames to cross
export const ShimmerText: React.FC<Tw & {text: string; at: number; dur?: number}> = ({text, at, dur = 24, size = 140, weight = 640, color, style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const x = interpolate(f, [at, at + dur], [-30, 130], {...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1)});
  const base = color ?? C.ivory;
  const hot = String(C.type3d.ramp[0][1]), warm = C.type3d.light;
  return (
    <div style={{fontFamily: C.fontHead, fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', lineHeight: 1.1, backgroundImage: `linear-gradient(100deg, ${base} ${x - 22}%, ${warm} ${x - 8}%, ${hot} ${x}%, ${warm} ${x + 8}%, ${base} ${x + 22}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 4px 24px ${alpha(C.glow, 0.35)})`, ...style}}>
      {text}
    </div>
  );
};

// words appear one by one from `at`, every `stagger` frames (or pass `ats` with a frame per word)
export const BlurInText: React.FC<Tw & {text: string; at: number; stagger?: number; ats?: number[]; align?: 'left' | 'center'}> = ({text, at, stagger = 3, ats, size = 48, weight = 420, color, align = 'center', style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{fontFamily: C.fontHead, fontSize: size, fontWeight: weight, lineHeight: 1.3, color: color ?? C.ivory, textAlign: align, ...style}}>
      {words.map((w, i) => {
        const t0 = ats?.[i] ?? at + i * stagger;
        const p = interpolate(f, [t0, t0 + 12], [0, 1], {...clamp, easing: expo});
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.28em', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 0.25}em)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const SlitLine: React.FC<Tw & {text: string; at: number; dur?: number; rule?: boolean}> = ({text, at, dur = 16, size = 96, weight = 300, color, rule = true, style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: expo});
  const r = interpolate(f, [at - 4, at + dur], [0, 1], {...clamp, easing: expo});
  return (
    <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', ...style}}>
      <div style={{overflow: 'hidden', paddingBottom: '0.08em'}}>
        <div style={{fontFamily: C.fontHead, fontSize: size, fontWeight: weight, letterSpacing: '-0.025em', lineHeight: 1.08, color: color ?? C.ivory, transform: `translateY(${(1 - p) * 110}%)`}}>{text}</div>
      </div>
      {rule ? <div style={{height: 2, width: '100%', background: `linear-gradient(90deg, ${C.accent}, transparent)`, transform: `scaleX(${r})`, transformOrigin: '0 50%'}} /> : null}
    </div>
  );
};

export type Stat = {value: string; unit?: string; label: string; at: number};
// Figures only from the client's brief; never invent a number (see the brand file).
export const StatGrid: React.FC<{items: Stat[]; width?: number; style?: React.CSSProperties}> = ({items, width = 900, style}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const cols = items.length > 2 ? 2 : items.length;
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22, width, ...style}}>
      {items.map((s, i) => {
        const p = interpolate(f, [s.at - 6, s.at + 8], [0, 1], {...clamp, easing: expo});
        return (
          <div key={i} style={{padding: '34px 34px 30px', borderRadius: 26, background: `linear-gradient(165deg, ${alpha(C.lift, 0.9)}, ${alpha(C.deep, 0.92)})`, border: `1px solid ${C.hair}`, boxShadow: `0 24px 60px ${C.shadow}, inset 0 1px 0 oklch(1 0 0 / 0.06)`, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
              <NumberTicker value={s.value} at={s.at} size={128} />
              {s.unit ? <span style={{fontFamily: C.fontHead, fontWeight: 300, fontSize: 48, color: C.dim}}>{s.unit}</span> : null}
            </div>
            <div style={{marginTop: 14, fontFamily: C.fontLabel, fontWeight: 500, fontSize: 26, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.accent}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};
