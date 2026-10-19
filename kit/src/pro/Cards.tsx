import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {asset} from '../lib/asset';
import {Bevel} from './Bevel';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Card layouts (production, from the Dhunna 54D films), one shared card face (hairline edge, top-edge highlight,
// soft glow, concept label), themed by useKitTheme(). Vary the layout per beat:
//   Front   · one wide card with a measurement drawn under it as a dimension bar (the bar is the heading)
//   Floors  · a vertical stack in floor order (parking below, showrooms, offices above); the stack slides down
//             as the voice goes up a floor, neighbours peek dimmed, a floor rail on the right
//   Design  · one tall card turning slowly in perspective over its own reflection
//   Deck    · the closing card with two earlier concepts fanned behind it, for "Floor plans dekhne hain?"
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out4 = Easing.bezier(0.25, 1, 0.5, 1);
const inOut = Easing.bezier(0.77, 0, 0.175, 1);
const ramp = (f: number, a: number, d: number, e = out4) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});

export type Media = {video?: string; image?: string; offset?: number; label: string};

// clean ground: the brand radial with slow, large fractal-noise light drifting through it (no fine grain)
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const C = useKitTheme();
  const tint = C.type3d.glow.split(',').map((n) => (+n / 255).toFixed(2));
  return (
    <AbsoluteFill style={{background: `radial-gradient(110% 60% at 50% 32%, ${C.lift} 0%, ${C.ground} 55%, ${C.deep} 100%)`, overflow: 'hidden'}}>
      <svg width={1600} height={2400} style={{position: 'absolute', left: -260, top: -240, transform: `translate(${Math.sin(f / 140) * 120}px, ${-f * 0.5}px) rotate(${f * 0.01}deg)`, mixBlendMode: 'screen', opacity: 0.3}}>
        <filter id="g-fractal" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0016" numOctaves={4} seed={7} />
          {/* luminance → the brand's glow colour, only the brighter wisps survive */}
          <feColorMatrix type="matrix" values={`0 0 0 0 ${tint[0]}  0 0 0 0 ${tint[1]}  0 0 0 0 ${tint[2]}  2.4 0 0 0 -1.15`} />
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g-fractal)" />
      </svg>
      <AbsoluteFill style={{background: `radial-gradient(90% 70% at 50% 50%, transparent 55%, ${C.deep} 100%)`}} />
    </AbsoluteFill>
  );
};

const Fill: React.FC<{m: Media; dur: number; zoom?: [number, number]}> = ({m, dur, zoom = [1.08, 1]}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], zoom, clamp);
  const css = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`} as const;
  return m.video ? <OffthreadVideo muted src={asset(m.video)} startFrom={Math.round((m.offset ?? 0) * 30)} style={css} /> : <Img src={asset(m.image!)} style={css} />;
};

// the shared card face; `from` is when its media starts (videos play from there)
export const Card: React.FC<{m: Media; w: number; h: number; from: number; dur: number; style?: React.CSSProperties; glow?: number; zoom?: [number, number]}> = ({m, w, h, from, dur, style, glow = 1, zoom}) => {
  const C = useKitTheme();
  return (
  <div style={{position: 'absolute', width: w, height: h, borderRadius: 28, overflow: 'hidden', border: `1.5px solid ${C.hair}`, boxShadow: `inset 0 1.5px 0 oklch(1 0 0 / 0.28), 0 36px 70px ${C.shadow}, 0 0 ${140 * glow}px ${alpha(C.glow, 0.3 * glow)}`, background: C.deep, ...style}}>
    <Sequence from={from} layout="none">
      <Fill m={m} dur={dur} zoom={zoom} />
    </Sequence>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(160deg, oklch(1 0 0 / 0.14) 0%, transparent 26%, transparent 76%, ${alpha(C.deep, 0.4)} 100%)`}} />
    <div style={{position: 'absolute', left: 22, bottom: 22, padding: '9px 15px', borderRadius: 999, background: C.panel, border: `1px solid ${C.hair}`, fontFamily: C.fontLabel, fontStretch: '115%', fontWeight: 500, fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ivory}}>{m.label}</div>
  </div>
  );
};

// accent word in steel bevel with a deep cool glow, paired with a light word
export const Pair: React.FC<{accent: string; light: string; size: number; p: number; sheen: number; lightFirst?: boolean}> = ({accent, light, size, p, sheen, lightFirst}) => {
  const C = useKitTheme();
  const a = (
    <Bevel tone={C.metal} size="lg" sheen={sheen} glow={0.9}>
      {() => <span style={{fontFamily: C.fontHead, fontWeight: 640, fontSize: size, letterSpacing: '-0.035em'}}>{accent}</span>}
    </Bevel>
  );
  const l = <span style={{fontFamily: C.fontHead, fontWeight: 300, fontSize: size * 0.56, color: C.ivory, textShadow: `0 0 36px ${alpha(C.glow, 0.45)}, 0 4px 22px ${C.shadow}`}}>{light}</span>;
  return (
    <div style={{display: 'flex', gap: 18, alignItems: 'baseline', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined}}>
      {lightFirst ? l : a}
      {lightFirst ? a : l}
    </div>
  );
};

// ─── Front: the façade, wide, with the 82 ft front measured under it ───────────────────────────────────────────
// accent/light: the measurement and its noun ("82 ft" / "ka front"); wordAt = frame the measure is spoken
export const Front: React.FC<{m: Media; dur: number; wordAt: number; accent?: string; light?: string}> = ({m, dur, wordAt, accent = '82 ft', light = 'ka front'}) => {
  const f = useCurrentFrame();
  const C = useKitTheme();
  const inn = ramp(f, 0, 18);
  const out = ramp(f, dur - 10, 10, inOut);
  const bar = ramp(f, wordAt - 4, 20, inOut);
  const W = 940, H = 700, top = 400;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Card m={m} w={W} h={H} from={0} dur={dur} style={{left: 540 - W / 2, top, transform: `translateY(${(1 - inn) * 120 - out * 40}px) scale(${0.94 + 0.06 * inn})`, opacity: inn}} />
      {/* dimension bar: ticks at both ends of the façade, a line drawn out from the centre, the measure on it */}
      <div style={{position: 'absolute', left: 540 - W / 2, width: W, top: top + H + 70, height: 40}}>
        {[0, 1].map((s) => (
          <div key={s} style={{position: 'absolute', [s ? 'right' : 'left']: 0, top: 0, width: 3, height: 40, background: C.accent, opacity: bar, boxShadow: `0 0 14px ${C.accent}`}} />
        ))}
        <div style={{position: 'absolute', left: (W / 2) * (1 - bar), right: (W / 2) * (1 - bar), top: 18.5, height: 3, background: C.accent, boxShadow: `0 0 18px ${C.accent}`}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: top + H + 130}}>
        <Pair accent={accent} light={light} size={112} p={ramp(f, wordAt + 2, 12)} sheen={interpolate(f, [wordAt + 8, wordAt + 26], [-20, 120], clamp)} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Floors: parking → showrooms → offices, a stack that moves down as we go up ────────────────────────────────
export const Floors: React.FC<{items: {m: Media; at: number}[]; dur: number}> = ({items, dur}) => {
  const f = useCurrentFrame();
  const inn = ramp(f, 0, 18);
  const out = ramp(f, dur - 10, 10, inOut);
  // level: 0 = parking in focus, 1 = showrooms, 2 = offices (eased steps at each phrase)
  const C = useKitTheme();
  const level = items.slice(1).reduce((acc, it) => acc + ramp(f, it.at - 8, 18, inOut), 0);
  const W = 820, H = 600, GAP = 640, CY = 1010;
  return (
    <AbsoluteFill style={{opacity: 1 - out, WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, transparent 21%, black 34%, black 84%, transparent 96%)'}}>
      {items.map((it, i) => {
        const d = i - level; // 0 = in focus; positive = above
        const focus = 1 - Math.min(1, Math.abs(d));
        const s = 0.8 + 0.2 * focus;
        return (
          <Card
            key={i}
            m={it.m}
            w={W}
            h={H}
            from={0}
            dur={dur}
            glow={focus}
            style={{left: 540 - W / 2, top: CY - H / 2, transform: `translateY(${-d * GAP + (1 - inn) * 200}px) scale(${s})`, opacity: (0.35 + 0.65 * focus) * inn, filter: focus < 1 ? `blur(${(1 - focus) * 3}px) brightness(${0.6 + 0.4 * focus})` : undefined, zIndex: Math.round(focus * 10)}}
          />
        );
      })}
      {/* the floor rail: three nodes, bottom = parking; the lit one is the floor in focus */}
      <div style={{position: 'absolute', right: 34, top: CY - 120, width: 8, height: 240}}>
        <div style={{position: 'absolute', left: 3, top: 0, width: 2, height: 240, background: C.hair}} />
        {items.map((_, i) => {
          const on = 1 - Math.min(1, Math.abs(i - level));
          return <div key={i} style={{position: 'absolute', left: -3 - 3 * on, top: 240 - i * 120 - 7 - 3 * on, width: 14 + 6 * on, height: 14 + 6 * on, borderRadius: 99, background: on > 0.5 ? C.accent : C.deep, border: `2px solid ${C.accent}`, boxShadow: on > 0.5 ? `0 0 18px ${C.accent}` : undefined, opacity: inn}} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Design: one tall card turning slowly over its reflection ─────────────────────────────────────────────────
export const Design: React.FC<{m: Media; dur: number}> = ({m, dur}) => {
  const f = useCurrentFrame();
  const inn = ramp(f, 0, 22);
  const out = ramp(f, dur - 10, 10, inOut);
  const ry = interpolate(f, [0, dur], [-16, 10], clamp);
  const W = 700, H = 980, top = 440;
  const card = (flip: boolean) => (
    <Card m={m} w={W} h={H} from={0} dur={dur} zoom={[1.02, 1.1]} glow={flip ? 0 : 1} style={{left: 0, top: 0, transform: flip ? 'scaleY(-1)' : undefined}} />
  );
  return (
    <AbsoluteFill style={{opacity: 1 - out, perspective: 1800}}>
      <div style={{position: 'absolute', left: 540 - W / 2, top, width: W, height: H * 2 + 14, transformStyle: 'preserve-3d', transform: `rotateY(${ry}deg) translateY(${(1 - inn) * 140}px) scale(${0.92 + 0.08 * inn})`, opacity: inn}}>
        {card(false)}
        <div style={{position: 'absolute', left: 0, top: H + 14, width: W, height: H, opacity: 0.3, WebkitMaskImage: 'linear-gradient(180deg, black 0%, transparent 34%)'}}>{card(true)}</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Deck: the closing card with two earlier concepts fanned behind it ────────────────────────────────────────
export const Deck: React.FC<{front: Media; back: Media[]; dur: number}> = ({front, back, dur}) => {
  const f = useCurrentFrame();
  const inn = ramp(f, 0, 20);
  const fan = ramp(f, 8, 24, inOut);
  const W = 720, H = 860, top = 470;
  return (
    <AbsoluteFill>
      {back.map((m, i) => {
        const s = i ? 1 : -1;
        return <Card key={i} m={m} w={W} h={H} from={0} dur={dur} glow={0} style={{left: 540 - W / 2, top, transformOrigin: '50% 120%', transform: `rotate(${s * 11 * fan}deg) translateX(${s * 70 * fan}px) scale(0.9)`, opacity: inn * 0.75, filter: 'brightness(0.62)'}} />;
      })}
      <Card m={front} w={W} h={H} from={0} dur={dur} style={{left: 540 - W / 2, top, transform: `translateY(${(1 - inn) * 160}px) scale(${0.94 + 0.06 * inn})`, opacity: inn}} />
    </AbsoluteFill>
  );
};
