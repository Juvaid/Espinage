import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bevel} from './Bevel';
import {Card, type Media} from './Cards';
import {DepthCard, type Move} from './DepthCard';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Production film parts (from the Dhunna 54D films: Flagship v2, O3, N3, S3, B3), themed by useKitTheme().
// Every film: a voice take aligned to its script (src/v3/vo-<id>.json), one text at a time, a layout per beat.
export const LEAD = 6; // frames before the voice starts
// film time in 30 fps frames whatever the composition's fps, so a film built at 30 fps also renders at 60 fps
// (every animation is then sampled twice as often); fractional at 60 fps
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (f * 30) / fps;
};
export type VO = {end: number; lines: {text: string; words: (string | number)[][]}[]};
export const timing = (vo: VO, tail = 75) => {
  const fr = (s: number) => Math.round(s * 30) + LEAD;
  const L = vo.lines.map((l) => l.words.map(([, t]) => fr(t as number)));
  return {
    w: (line: number, word: number) => L[line][word], // frame a word is spoken
    lineAt: (line: number) => L[line][0] - 3, // a beat starts 3 frames before its line
    total: fr(vo.end) + tail,
  };
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const out4 = Easing.bezier(0.25, 1, 0.5, 1);
export const inOut = Easing.bezier(0.77, 0, 0.175, 1);
export const ramp = (f: number, a: number, d: number, e = out4) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});
export const VIS = 'Concept visualisation';
const HEAD_Y = 250;
const Chip: React.FC<{text: string}> = ({text}) => {
  const C = useKitTheme();
  return (
  <div style={{position: 'absolute', left: 22, bottom: 22, padding: '9px 15px', borderRadius: 999, background: C.panel, border: `1px solid ${C.hair}`, fontFamily: C.fontLabel, fontStretch: '115%', fontWeight: 500, fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ivory}}>{text}</div>
  );
};

// heading in the one slot: light 300 words beside a display 640 accent word in steel bevel with a deep cool glow;
// each piece lands on its own spoken frame
export type Piece = {t: string; at: number; role: 'light' | 'accent'};
export const Heading: React.FC<{lines: Piece[][]; from: number; to: number; y?: number; size?: number}> = ({lines, from, to, y = HEAD_Y, size = 104}) => {
  const C = useKitTheme();
  const f = useT();
  if (f < from - 4 || f >= to) return null;
  const gone = ramp(f, to - 6, 6);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 1 - gone}}>
      {lines.map((line, i) => (
        <div key={i} style={{display: 'flex', gap: 18, alignItems: 'baseline', justifyContent: 'center', flexWrap: 'wrap'}}>
          {line.map((pc, j) => {
            const p = ramp(f, pc.at - 2, 10);
            const base: React.CSSProperties = {display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 0.3}em)`, filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined, lineHeight: 1.05};
            if (pc.role === 'accent') {
              const sheen = interpolate(f, [pc.at + 6, pc.at + 22], [-20, 120], clamp);
              return (
                <span key={j} style={base}>
                  <Bevel tone={C.metal} size="lg" sheen={sheen} glow={0.9}>{() => <span style={{fontFamily: C.fontHead, fontWeight: 640, fontSize: size, letterSpacing: '-0.035em'}}>{pc.t}</span>}</Bevel>
                </span>
              );
            }
            return <span key={j} style={{...base, fontFamily: C.fontHead, fontWeight: 300, fontSize: size * 0.58, letterSpacing: '-0.01em', color: C.ivory, textShadow: `0 0 36px ${alpha(C.glow, 0.45)}, 0 4px 22px ${C.shadow}`}}>{pc.t}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

// a still in the shared card face, moved as a 2.5D camera shot (needs public/depth/<id>.png)
// src / depth: the picture and its depth map (public paths)
export const DepthFace: React.FC<{src: string; depth: string; label: string; w: number; h: number; dur: number; move: Move; focusY?: number; style?: React.CSSProperties}> = ({src, depth, label, w, h, dur, move, focusY = 0.55, style}) => {
  const C = useKitTheme();
  return (
  <div style={{position: 'absolute', width: w, height: h, borderRadius: 28, overflow: 'hidden', border: `1.5px solid ${C.hair}`, boxShadow: `inset 0 1.5px 0 oklch(1 0 0 / 0.28), 0 36px 70px ${C.shadow}, 0 0 140px ${alpha(C.glow, 0.3)}`, background: C.deep, ...style}}>
    <DepthCard src={src} depth={depth} w={w} h={h} dur={dur} move={move} focusY={focusY} />
    <Chip text={label} />
  </div>
  );
};
export const MOVES: Record<string, Move> = {
  slide: {from: [-0.35, 0.05, -0.5], to: [0.35, 0, -0.1]},
  push: {from: [0, 0.05, 0.1], to: [0.05, 0, -1.1]},
  rise: {from: [0, -0.35, -0.5], to: [0, 0.25, -0.1]},
  pull: {from: [0, 0.25, -1.6], to: [0.05, 0, 0.25]},
};

// one wide depth card rising into place, the single picture of its beat
export const Hero: React.FC<{src: string; depth: string; label: string; dur: number; move?: Move; w?: number; h?: number; top?: number}> = ({src, depth, label, dur, move = MOVES.slide, w = 920, h = 1060, top = 470}) => {
  const f = useT();
  const inn = ramp(f, 0, 20), out = ramp(f, dur - 8, 8, inOut);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <DepthFace src={src} depth={depth} label={label} w={w} h={h} dur={dur} move={move} style={{left: 540 - w / 2, top, transform: `translateY(${(1 - inn) * 140}px) scale(${0.95 + 0.05 * inn})`, opacity: inn}} />
    </AbsoluteFill>
  );
};

// two prints side by side, the second arriving on its word: a before/after or two sides of one idea
export const SidePair: React.FC<{a: Media; b: Media; bAt: number; dur: number}> = ({a, b, bAt, dur}) => {
  const f = useT();
  const out = ramp(f, dur - 8, 8, inOut);
  const W = 470, H = 760, top = 560;
  const card = (m: Media, x: number, tilt: number, at: number) => {
    const p = ramp(f, at - 4, 18);
    const live = interpolate(f, [at, dur], [0, 1], clamp);
    return <Card m={m} w={W} h={H} from={Math.max(0, at - 4)} dur={dur} glow={0.6} style={{left: x - W / 2, top, transform: `translateY(${(1 - p) * 700 - live * 18}px) rotate(${tilt * (1 - live * 0.5)}deg)`, opacity: Math.min(1, p * 1.5)}} />;
  };
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {card(a, 290, -2.2, 0)}
      {card(b, 790, 2.2, bAt)}
    </AbsoluteFill>
  );
};

// a horizontal carousel: the card in focus in the middle, neighbours peeking left and right, one step per word
export const Carousel: React.FC<{items: Media[]; steps: number[]; dur: number}> = ({items, steps, dur}) => {
  const f = useT();
  const inn = ramp(f, 0, 18), out = ramp(f, dur - 8, 8, inOut);
  const pos = steps.reduce((acc, at) => acc + ramp(f, at - 10, 20, inOut), 0);
  const W = 720, H = 900, GAP = 640, top = 520;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {items.map((m, i) => {
        const d = i - pos;
        const focus = 1 - Math.min(1, Math.abs(d));
        return <Card key={i} m={m} w={W} h={H} from={0} dur={dur} glow={focus} style={{left: 540 - W / 2, top, transform: `translateX(${d * GAP}px) translateY(${(1 - inn) * 160}px) scale(${0.82 + 0.18 * focus})`, opacity: (0.4 + 0.6 * focus) * inn, filter: focus < 1 ? `brightness(${0.55 + 0.45 * focus})` : undefined, zIndex: Math.round(focus * 10)}} />;
      })}
    </AbsoluteFill>
  );
};

// the floors in order (index 0 = lowest); the stack slides to the floor being spoken, neighbours dimmed, a rail
export const FloorStack: React.FC<{items: Media[]; steps: {at: number; level: number}[]; start: number; dur: number}> = ({items, steps, start, dur}) => {
  const C = useKitTheme();
  const f = useT();
  const inn = ramp(f, 0, 18), out = ramp(f, dur - 8, 8, inOut);
  let level = start;
  steps.forEach((s, i) => {
    const prev = i ? steps[i - 1].level : start;
    level += (s.level - prev) * ramp(f, s.at - 10, 22, inOut);
  });
  const W = 820, H = 600, GAP = 640, CY = 1010;
  const RAIL = 120 * (items.length - 1);
  return (
    <AbsoluteFill style={{opacity: 1 - out, WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, transparent 21%, black 34%, black 84%, transparent 96%)'}}>
      {items.map((m, i) => {
        const d = i - level;
        const focus = 1 - Math.min(1, Math.abs(d));
        return <Card key={i} m={m} w={W} h={H} from={0} dur={dur} glow={focus} style={{left: 540 - W / 2, top: CY - H / 2, transform: `translateY(${-d * GAP + (1 - inn) * 200}px) scale(${0.8 + 0.2 * focus})`, opacity: (0.35 + 0.65 * focus) * inn, filter: focus < 1 ? `blur(${(1 - focus) * 3}px) brightness(${0.6 + 0.4 * focus})` : undefined, zIndex: Math.round(focus * 10)}} />;
      })}
      <div style={{position: 'absolute', right: 34, top: CY - RAIL / 2, width: 8, height: RAIL}}>
        <div style={{position: 'absolute', left: 3, top: 0, width: 2, height: RAIL, background: C.hair}} />
        {items.map((_, i) => {
          const on = 1 - Math.min(1, Math.abs(i - level));
          return <div key={i} style={{position: 'absolute', left: -3 - 3 * on, top: RAIL - i * 120 - 7 - 3 * on, width: 14 + 6 * on, height: 14 + 6 * on, borderRadius: 99, background: on > 0.5 ? C.accent : C.deep, border: `2px solid ${C.accent}`, boxShadow: on > 0.5 ? `0 0 18px ${C.accent}` : undefined, opacity: inn}} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

// text behind the subject: the photo, then the hero word, then the depth cut-out of the near subject
// (public/cutout/<id>.png from scripts/cutout.py), all in one box with one shared push, so the word sits in the
// scene and rises from behind the subject on its spoken frame
// wordY / wordX place the word (fraction of the card height / px from centre); imgPos frames the photo (and the
// cut-out with it), e.g. '50% 0%' to show the sky above a building
// src: the photo; cutout: an RGBA cut-out of its near subject (same size), e.g. from depth_tools.py cutout
export const TextBehind: React.FC<{src: string; cutout: string; word: string; at: number; dur: number; wordY?: number; wordX?: number; size?: number; imgPos?: string; label?: string}> = ({src, cutout, word, at, dur, wordY = 0.3, wordX = 0, size = 230, imgPos = '50% 50%', label = VIS}) => {
  const C = useKitTheme();
  const f = useT();
  const inn = ramp(f, 0, 18), out = ramp(f, dur - 8, 8, inOut);
  const z = interpolate(f, [0, dur], [1.08, 1.0], clamp);
  const p = ramp(f, at - 4, 18);
  const sheen = interpolate(f, [at + 8, at + 28], [-20, 120], clamp);
  const W = 920, H = 1180, top = 440;
  const img = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgPos} as const;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540 - W / 2, top, width: W, height: H, borderRadius: 28, overflow: 'hidden', border: `1.5px solid ${C.hair}`, boxShadow: `inset 0 1.5px 0 oklch(1 0 0 / 0.28), 0 36px 70px ${C.shadow}, 0 0 140px ${alpha(C.glow, 0.3)}`, background: C.deep, transform: `translateY(${(1 - inn) * 140}px)`, opacity: inn}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`}}>
          <Img src={staticFile(src)} style={img} />
          <div style={{position: 'absolute', left: 0, right: 0, top: `${wordY * 100}%`, display: 'flex', justifyContent: 'center', opacity: p, transform: `translate(${wordX}px, ${(1 - p) * 120}px)`}}>
            <Bevel tone={C.metal} size="lg" sheen={sheen} glow={0.8}>{() => <span style={{fontFamily: C.fontHead, fontWeight: 640, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1}}>{word}</span>}</Bevel>
          </div>
          <Img src={staticFile(cutout)} style={img} />
        </div>
        <Chip text={label} />
      </div>
    </AbsoluteFill>
  );
};

// the place under the building, on its spoken name
export const Place: React.FC<{from: number; to: number; text: string}> = ({from, to, text}) => {
  const C = useKitTheme();
  const f = useT();
  if (f < from - 2 || f >= to) return null;
  const p = ramp(f, from, 14), gone = ramp(f, to - 6, 6);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p * (1 - gone)}}>
      <div style={{height: 2, width: 420 * p, background: C.accent, margin: '0 0 22px', boxShadow: `0 0 18px ${alpha(C.accent, 0.6)}`}} />
      <div style={{fontFamily: C.fontLabel, fontStretch: '125%', fontWeight: 500, fontSize: 34, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.ivory}}>{text}</div>
    </div>
  );
};

// wordmark above the message button, centred in the clear band under the closing picture (pair with MakeRoom);
// the button is pressed on "karo"
export const CTA: React.FC<{from: number; press: number; logo: string; label: string; top?: number}> = ({from, press, logo, label, top = 1395}) => {
  const C = useKitTheme();
  const f = useT();
  if (f < from) return null;
  const btn = ramp(f, from + 6, 12);
  const k = interpolate(f, [press, press + 3, press + 9], [1, 0.96, 1], clamp);
  const ring = ramp(f, press + 3, 18);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: ramp(f, from, 12)}}>
      <Img src={staticFile(logo)} style={{width: 250, filter: `drop-shadow(0 6px 20px ${C.shadow})`}} />
      <div style={{position: 'relative', opacity: btn, transform: `translateY(${(1 - btn) * 16}px) scale(${k})`}}>
        <div style={{position: 'absolute', inset: -2, borderRadius: 999, border: `2px solid ${C.accent}`, opacity: (1 - ring) * 0.85, transform: `scale(${1 + ring * 0.16}, ${1 + ring * 0.5})`}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '24px 46px', borderRadius: 999, background: `linear-gradient(180deg, color-mix(in oklch, ${C.accent} 14%, white), color-mix(in oklch, ${C.accent} 42%, white))`, color: C.deep, fontFamily: C.fontHead, fontWeight: 640, fontSize: 40, boxShadow: `0 16px 40px ${C.shadow}`}}>
          {label} <span style={{fontWeight: 400}}>→</span>
        </div>
      </div>
    </div>
  );
};

// the brand end card: the wordmark alone, large, with one gleam (music-led films)
export const Wordmark: React.FC<{from: number; logo: string}> = ({from, logo}) => {
  const C = useKitTheme();
  const f = useT();
  if (f < from) return null;
  const p = ramp(f, from, 20);
  const sweep = interpolate(f, [from + 10, from + 34], [-30, 130], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: p}}>
      <div style={{position: 'relative', transform: `scale(${0.94 + 0.06 * p})`}}>
        <Img src={staticFile(logo)} style={{width: 620, filter: `drop-shadow(0 0 40px ${alpha(C.glow, 0.45)})`}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${sweep - 12}%, oklch(1 0 0 / 0.55) ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: 'overlay', WebkitMaskImage: `url(${staticFile(logo)})`, WebkitMaskSize: '100% 100%'}} />
      </div>
    </AbsoluteFill>
  );
};

// voice, music (lifted on the 54D reveal) and one sound per kind of event
export type Sfx = {t: number; src: string; vol: number};
export const swish = (ts: number[]): Sfx[] => ts.map((t) => ({t: t - 8, src: 'sfx/swish.wav', vol: 0.12}));
export const ticks = (ts: number[]): Sfx[] => ts.map((t) => ({t, src: 'sfx/tick.wav', vol: 0.12}));
export const reveal = (mark: number): Sfx[] => [{t: mark - 1, src: 'sfx/deep-boom.wav', vol: 0.24}, {t: mark + 10, src: 'sfx/gleam.wav', vol: 0.12}];
// music + musicDrop: the track and the second in it that should land on `mark` (the reveal frame)
export const FilmAudio: React.FC<{vo: string; music: string; musicDrop: number; mark: number; total: number; events: Sfx[]; bed?: number}> = ({vo, music: track, musicDrop, mark, total, events, bed = 0.1}) => {
  const f = useT();
  const {fps} = useVideoConfig();
  const k = fps / 30; // film frames → composition frames
  const music = interpolate(f, [0, 10, mark - 4, mark + 2, mark + 26, total - 60, total - 20, total], [0, bed, bed, 0.24, bed + 0.01, 0.2, 0.2, 0], clamp);
  return (
    <>
      <Sequence from={Math.round(LEAD * k)}><Audio src={staticFile(vo)} /></Sequence>
      <Audio src={staticFile(track)} volume={music} startFrom={Math.max(0, Math.round((musicDrop - mark / 30) * fps))} />
      {events.map((x, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(x.t * k))} durationInFrames={Math.round(60 * k)}>
          <Audio src={staticFile(x.src)} volume={x.vol} />
        </Sequence>
      ))}
    </>
  );
};

// the closing beat makes room for the call to action: the picture shrinks up into the top of the frame
export const MakeRoom: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const f = useT();
  const p = ramp(f, at - 6, 18, inOut);
  // scaled about the cards' top edge (y ≈ 450), so the picture never rises into the heading above it
  return <AbsoluteFill style={{transformOrigin: '50% 23.5%', transform: `scale(${1 - 0.22 * p})`}}>{children}</AbsoluteFill>;
};
