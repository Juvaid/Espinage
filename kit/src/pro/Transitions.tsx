import React, {useId} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {MORPH_SHAPES} from '../components/svg/ShapeMorph';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Scene transitions, frame-driven and themed. Sequence scenes with transitions between them; each transition
// overlaps the two scenes by its length, and can play its own sound.
//
//   <Scenes sfx>
//     <Scene dur={90}>…</Scene>
//     <Cut kind="whip" dur={8} dir="left" />
//     <Scene dur={90}>…</Scene>
//   </Scenes>
//
// Kinds (pick one family per film; see the skill's TRANSITIONS.md):
//   cut    · hard cut (dur 0)                      whip   · whip pan with directional blur (6–8 frames)
//   push   · zoom-through into the next (8–12)      blur   · soft dissolve with focus (10–14; between worlds only)
//   iris   · circle opens from a point (12–18)      shape  · the next scene opens through a shape: pin, house… (16–24)
//   sweep  · a light bar wipes the next scene on (12–18; the big reveal)
//   slats  · strips slide the next scene in (14–18) flip   · the frame turns over like a card (14–18)
export type TransitionKind = 'cut' | 'whip' | 'push' | 'blur' | 'iris' | 'shape' | 'sweep' | 'slats' | 'flip';
export const TRANSITION_KINDS: TransitionKind[] = ['cut', 'whip', 'push', 'blur', 'iris', 'shape', 'sweep', 'slats', 'flip'];
type Dir = 'left' | 'right' | 'up' | 'down';
export type CutProps = {
  kind: TransitionKind;
  dur?: number;
  dir?: Dir; // whip and slats: the way the picture travels (left = the next scene comes in from the right)
  shape?: keyof typeof MORPH_SHAPES; // shape: the outline the next scene opens through
  origin?: [number, number]; // iris and shape: where it opens from, as fractions of the frame
  sfx?: boolean | string; // false: silent; a path: that sound instead of the default
};
export const Scene: React.FC<{dur: number; children?: React.ReactNode}> = () => null;
export const Cut: React.FC<CutProps> = () => null;

const DEFAULT_DUR: Record<TransitionKind, number> = {cut: 0, whip: 8, push: 10, blur: 12, iris: 16, shape: 20, sweep: 16, slats: 16, flip: 16};
// the sound each transition makes, and how many frames before its middle it starts (most hits lead the picture)
const SOUND: Record<TransitionKind, [string, number, number] | null> = {
  cut: null,
  whip: ['sfx/whip.wav', 0.16, 4],
  push: ['sfx/whoosh-hit.wav', 0.14, 6],
  blur: null,
  iris: ['sfx/gleam.wav', 0.1, 4],
  shape: ['sfx/ui-animation.wav', 0.12, 6],
  sweep: ['sfx/scan.wav', 0.12, 8],
  slats: ['sfx/swish.wav', 0.12, 8],
  flip: ['sfx/swish.wav', 0.12, 6],
};

type Plan = {scenes: {start: number; dur: number; node: React.ReactNode; enter?: CutProps; exit?: CutProps}[]; total: number};
// Work out where every scene starts once transitions overlap them; usable outside render (durationInFrames).
export const planScenes = (children: React.ReactNode): Plan => {
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<any>[];
  const scenes: Plan['scenes'] = [];
  let t = 0;
  let pending: CutProps | undefined;
  for (const it of items) {
    if (it.type === Scene) {
      const dur = it.props.dur as number;
      const ov = pending ? pending.dur ?? DEFAULT_DUR[pending.kind] : 0;
      const start = Math.max(0, t - ov);
      const sc = {start, dur, node: it.props.children, enter: pending};
      if (pending && scenes.length) scenes[scenes.length - 1].exit = pending;
      scenes.push(sc);
      t = start + dur;
      pending = undefined;
    } else if (it.type === Cut) {
      pending = it.props as CutProps;
    }
  }
  return {scenes, total: t};
};

const whipEase = Easing.bezier(0.7, 0, 0.3, 1);
const inOut = Easing.bezier(0.77, 0, 0.175, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sign = (d: Dir) => (d === 'left' || d === 'up' ? -1 : 1);
const horiz = (d: Dir) => d === 'left' || d === 'right';

// Directional blur through an inline SVG filter, so the blur follows the motion (CSS blur is round).
const MotionBlur: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${x} ${y}`} edgeMode="duplicate" />
    </filter>
  </svg>
);

const shapeMask = (d: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${d}' fill='black'/></svg>`)}")`;

const Layer: React.FC<{start: number; dur: number; enter?: CutProps; exit?: CutProps; children: React.ReactNode; z: number}> = ({start, dur, enter, exit, children, z}) => {
  const f = useCurrentFrame();
  const C = useKitTheme();
  const {width: W, height: H} = useVideoConfig();
  const uid = useId().replace(/:/g, '');
  const style: React.CSSProperties = {};
  const overlays: React.ReactNode[] = [];
  let blur: [number, number] | null = null;
  const tf: string[] = [];

  // incoming: progress 0 → 1 over the first frames of this scene
  if (enter && enter.kind !== 'cut') {
    const n = enter.dur ?? DEFAULT_DUR[enter.kind];
    const raw = interpolate(f, [start, start + n], [0, 1], clamp);
    const dir = enter.dir ?? 'left';
    const [ox, oy] = enter.origin ?? [0.5, 0.5];
    if (raw < 1) {
      switch (enter.kind) {
        case 'whip': {
          const p = whipEase(raw);
          const s = -sign(dir);
          tf.push(horiz(dir) ? `translateX(${s * W * (1 - p)}px)` : `translateY(${s * H * (1 - p)}px)`);
          const b = 46 * Math.sin(Math.PI * raw);
          blur = horiz(dir) ? [b, 0] : [0, b];
          break;
        }
        case 'push': {
          const p = inOut(raw);
          tf.push(`scale(${0.86 + 0.14 * p})`);
          style.opacity = interpolate(raw, [0.25, 0.75], [0, 1], clamp);
          blur = [10 * (1 - p), 10 * (1 - p)];
          break;
        }
        case 'blur': {
          const p = inOut(raw);
          tf.push(`scale(${1.04 - 0.04 * p})`);
          style.opacity = p;
          blur = [14 * (1 - p), 14 * (1 - p)];
          break;
        }
        case 'iris': {
          const p = inOut(raw);
          const r = Math.hypot(Math.max(ox, 1 - ox) * W, Math.max(oy, 1 - oy) * H) * p;
          style.clipPath = `circle(${r}px at ${ox * W}px ${oy * H}px)`;
          overlays.push(<div key="ring" style={{position: 'absolute', left: ox * W - r, top: oy * H - r, width: r * 2, height: r * 2, borderRadius: '50%', boxShadow: `0 0 0 2px ${alpha(C.accent, 0.9 * (1 - raw))}, 0 0 40px ${alpha(C.glow, 0.8 * (1 - raw))}`, pointerEvents: 'none'}} />);
          break;
        }
        case 'shape': {
          const p = Easing.bezier(0.45, 0, 0.55, 1)(raw);
          const d = MORPH_SHAPES[enter.shape ?? 'pin'];
          // geometric growth (each frame scales by the same factor), so the shape stays readable for the first half
          // and then rushes past the frame; it ends when the shape's inside covers the frame
          const size = 60 * Math.pow((Math.max(W, H) * 3.2) / 60, p); // the pin's head covers the frame at ~2.9× height
          const pos = `${ox * W - size / 2}px ${oy * H - size / 2}px`;
          // a second, solid mask layer fades up at the end so the corners the shape's tip never reaches don't pop
          const q = interpolate(raw, [0.72, 1], [0, 1], clamp).toFixed(3);
          style.WebkitMaskImage = style.maskImage = `${shapeMask(d)}, linear-gradient(rgba(0,0,0,${q}), rgba(0,0,0,${q}))`;
          style.WebkitMaskSize = style.maskSize = `${size}px ${size}px, 100% 100%`;
          style.WebkitMaskPosition = style.maskPosition = `${pos}, 0 0`;
          style.WebkitMaskRepeat = style.maskRepeat = 'no-repeat, no-repeat';
          overlays.push(
            <svg key="edge" viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', left: ox * W - size / 2, top: oy * H - size / 2, overflow: 'visible', opacity: interpolate(raw, [0, 0.1, 0.7, 0.95], [0, 1, 1, 0], clamp), pointerEvents: 'none', filter: `drop-shadow(0 0 12px ${C.accent})`}}>
              <path d={d} fill="none" stroke={C.type3d.ramp[0][1]} strokeWidth={3} vectorEffect="non-scaling-stroke" />
            </svg>,
          );
          break;
        }
        case 'sweep': {
          const p = inOut(raw);
          const X = -12 + 124 * p; // percent along a 105° gradient
          style.WebkitMaskImage = style.maskImage = `linear-gradient(105deg, black ${X - 1.5}%, transparent ${X + 1.5}%)`;
          const L = W * Math.sin((105 * Math.PI) / 180) + H * Math.abs(Math.cos((105 * Math.PI) / 180));
          const dx = Math.sin((105 * Math.PI) / 180), dy = -Math.cos((105 * Math.PI) / 180);
          const cx = W / 2 + (X / 100 - 0.5) * L * dx, cy = H / 2 + (X / 100 - 0.5) * L * dy;
          const bar = Math.sin(Math.PI * raw);
          overlays.push(
            <div key="bar" style={{position: 'absolute', left: cx - 70, top: cy - 1600, width: 140, height: 3200, transform: 'rotate(15deg)', pointerEvents: 'none', opacity: bar, background: `linear-gradient(90deg, transparent, ${alpha(C.glow, 0.55)} 30%, ${C.type3d.ramp[0][1]} 50%, ${alpha(C.glow, 0.55)} 70%, transparent)`, filter: 'blur(6px)', mixBlendMode: 'screen'}} />,
          );
          break;
        }
        case 'slats': {
          const N = 7;
          const hz = !horiz(dir); // up/down travel uses vertical strips
          const s = sign(dir);
          let path = '';
          for (let i = 0; i < N; i++) {
            const k = interpolate(raw, [i * 0.06, 0.64 + i * 0.06], [0, 1], {...clamp, easing: inOut});
            if (!hz) {
              const y0 = (H / N) * i, h = H / N + 1, w = W * k;
              const x0 = s < 0 ? W - w : 0;
              path += `M${x0} ${y0}h${w}v${h}h${-w}Z`;
            } else {
              const x0 = (W / N) * i, w = W / N + 1, h = H * k;
              const y0 = s < 0 ? H - h : 0;
              path += `M${x0} ${y0}h${w}v${h}h${-w}Z`;
            }
          }
          style.clipPath = path ? `path('${path}')` : 'inset(100%)';
          break;
        }
        case 'flip': {
          if (raw < 0.5) style.visibility = 'hidden';
          else {
            const p = Easing.out(Easing.cubic)((raw - 0.5) * 2);
            tf.push(`perspective(2200px) rotateY(${-90 * (1 - p)}deg) scale(${0.9 + 0.1 * p})`);
          }
          break;
        }
      }
    }
  }

  // outgoing: progress 0 → 1 over the last frames of this scene
  if (exit && exit.kind !== 'cut') {
    const n = exit.dur ?? DEFAULT_DUR[exit.kind];
    const raw = interpolate(f, [start + dur - n, start + dur], [0, 1], clamp);
    const dir = exit.dir ?? 'left';
    if (raw > 0) {
      switch (exit.kind) {
        case 'whip': {
          const p = whipEase(raw);
          const s = sign(dir);
          tf.push(horiz(dir) ? `translateX(${s * W * p}px)` : `translateY(${s * H * p}px)`);
          const b = 46 * Math.sin(Math.PI * raw);
          blur = horiz(dir) ? [b, 0] : [0, b];
          break;
        }
        case 'push': {
          const p = inOut(raw);
          tf.push(`scale(${1 + 0.3 * p})`);
          style.opacity = 1 - interpolate(raw, [0.35, 0.9], [0, 1], clamp);
          blur = [12 * p, 12 * p];
          break;
        }
        case 'blur': {
          const p = inOut(raw);
          style.opacity = 1 - p;
          blur = [14 * p, 14 * p];
          break;
        }
        case 'iris':
        case 'shape':
        case 'sweep':
        case 'slats': {
          // the old scene settles back a touch while the new one opens over it
          const p = inOut(raw);
          tf.push(`scale(${1 + 0.05 * p})`);
          style.filter = `brightness(${1 - 0.35 * p})`;
          break;
        }
        case 'flip': {
          if (raw >= 0.5) style.visibility = 'hidden';
          else {
            const p = Easing.in(Easing.cubic)(raw * 2);
            tf.push(`perspective(2200px) rotateY(${90 * p}deg) scale(${1 - 0.1 * p})`);
          }
          break;
        }
      }
    }
  }

  if (tf.length) style.transform = tf.join(' ');
  if (blur && (blur[0] > 0.2 || blur[1] > 0.2)) style.filter = `${style.filter ?? ''} url(#mb-${uid})`.trim();
  return (
    <AbsoluteFill style={{zIndex: z}}>
      {blur ? <MotionBlur id={`mb-${uid}`} x={blur[0]} y={blur[1]} /> : null}
      <AbsoluteFill style={{...style, overflow: 'hidden'}}>
        <Sequence from={start} durationInFrames={dur} layout="none">
          {children}
        </Sequence>
      </AbsoluteFill>
      {overlays}
    </AbsoluteFill>
  );
};

export const Scenes: React.FC<{children: React.ReactNode; sfx?: boolean}> = ({children, sfx = true}) => {
  const f = useCurrentFrame();
  const C = useKitTheme();
  const plan = planScenes(children);
  return (
    <AbsoluteFill style={{background: C.deep}}>
      {plan.scenes.map((s, i) => {
        if (f < s.start || f >= s.start + s.dur) return null;
        return (
          <Layer key={i} start={s.start} dur={s.dur} enter={s.enter} exit={s.exit} z={i}>
            {s.node}
          </Layer>
        );
      })}
      {sfx
        ? plan.scenes.map((s, i) => {
            const c = s.enter;
            if (!c || c.sfx === false) return null;
            const def = SOUND[c.kind];
            const src = typeof c.sfx === 'string' ? c.sfx : def?.[0];
            if (!src) return null;
            const n = c.dur ?? DEFAULT_DUR[c.kind];
            const at = Math.max(0, s.start + Math.round(n / 2) - (def?.[2] ?? 4));
            return (
              <Sequence key={`sfx${i}`} from={at} durationInFrames={60}>
                <Audio src={staticFile(src)} volume={def?.[1] ?? 0.12} />
              </Sequence>
            );
          })
        : null}
    </AbsoluteFill>
  );
};
