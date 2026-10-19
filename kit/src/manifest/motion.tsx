import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { ui } from './controls';

// Motion every item gets, whatever its component: an entrance, an exit, a transform (position, scale, rotation,
// opacity, blur, blend, colour) and an optional "animate to" end state. Applied by ManifestReel around the component,
// so the editor's preview and the render box agree. Every default is a no-op: projects saved before this existed
// render exactly as they did.

export const TRANSITIONS = ['none', 'fade', 'rise', 'drop', 'slideLeft', 'slideRight', 'zoomIn', 'zoomOut', 'blur', 'wipeUp', 'wipeDown', 'wipeLeft', 'wipeRight', 'iris', 'pop'] as const;
export type ItemTransitionKind = (typeof TRANSITIONS)[number];
export const TRANSITION_LABELS: Record<ItemTransitionKind, string> = {
  none: 'None',
  fade: 'Fade',
  rise: 'Rise',
  drop: 'Drop',
  slideLeft: 'Slide left',
  slideRight: 'Slide right',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  blur: 'Focus',
  wipeUp: 'Wipe up',
  wipeDown: 'Wipe down',
  wipeLeft: 'Wipe left',
  wipeRight: 'Wipe right',
  iris: 'Iris',
  pop: 'Pop',
};

export const EASINGS = ['smooth', 'gentle', 'glide', 'snap', 'linear'] as const;
export type EasingKind = (typeof EASINGS)[number];
const EASE: Record<EasingKind, (t: number) => number> = {
  smooth: Easing.bezier(0.16, 1, 0.3, 1), // expo out: the kit default
  gentle: Easing.bezier(0.25, 1, 0.5, 1), // quart out
  glide: Easing.bezier(0.77, 0, 0.175, 1), // in-out, for moves across the frame
  snap: Easing.bezier(0.72, 0, 0.18, 1), // whip
  linear: Easing.linear,
};

export const BLENDS = ['normal', 'screen', 'lighten', 'overlay', 'soft-light', 'multiply'] as const;

const transitionSchema = z.object({
  type: ui(z.enum(TRANSITIONS).default('none'), { label: 'Effect' }),
  duration: ui(z.number().int().min(1).max(90).default(14), { label: 'Length', control: 'frames' }),
  easing: ui(z.enum(EASINGS).default('smooth'), { label: 'Easing', help: 'smooth · gentle · glide (across the frame) · snap · linear' }),
  distance: ui(z.number().min(0).max(1200).default(120), { label: 'Distance', control: 'slider', step: 10, unit: 'px', help: 'how far rise, drop and slides travel' }),
});
export type ItemTransition = z.infer<typeof transitionSchema>;

const transformFields = {
  x: ui(z.number().min(-1080).max(1080).default(0), { label: 'Move X', control: 'slider', step: 1, unit: 'px' }),
  y: ui(z.number().min(-1920).max(1920).default(0), { label: 'Move Y', control: 'slider', step: 1, unit: 'px' }),
  scale: ui(z.number().min(0.1).max(4).default(1), { label: 'Scale', control: 'slider', step: 0.01 }),
  rotate: ui(z.number().min(-180).max(180).default(0), { label: 'Rotate', control: 'slider', step: 0.5, unit: '°' }),
  opacity: ui(z.number().min(0).max(1).default(1), { label: 'Opacity', control: 'slider', step: 0.01 }),
};
const transformSchema = z.object({
  ...transformFields,
  blur: ui(z.number().min(0).max(40).default(0), { label: 'Blur', control: 'slider', step: 0.5, unit: 'px' }),
  brightness: ui(z.number().min(0).max(2).default(1), { label: 'Brightness', control: 'slider', step: 0.01 }),
  contrast: ui(z.number().min(0).max(2).default(1), { label: 'Contrast', control: 'slider', step: 0.01 }),
  saturate: ui(z.number().min(0).max(2).default(1), { label: 'Saturation', control: 'slider', step: 0.01 }),
  blend: ui(z.enum(BLENDS).default('normal'), { label: 'Blend', help: 'screen or lighten for light effects over pictures' }),
  originX: ui(z.number().min(0).max(100).default(50), { label: 'Pivot X', control: 'slider', step: 1, unit: '%' }),
  originY: ui(z.number().min(0).max(100).default(50), { label: 'Pivot Y', control: 'slider', step: 1, unit: '%' }),
});
export type ItemTransform = z.infer<typeof transformSchema>;

// a two-keyframe move: the transform above at the item's start, these values at its end
const animateSchema = z.object({
  on: ui(z.boolean().default(false), { label: 'Animate to an end state' }),
  ...transformFields,
  easing: ui(z.enum(EASINGS).default('glide'), { label: 'Easing' }),
});
export type ItemAnimate = z.infer<typeof animateSchema>;

/** Fields every item has besides its component props (see itemBase in schema.ts). */
export const motionFields = {
  enter: transitionSchema.default({ type: 'none', duration: 14, easing: 'smooth', distance: 120 }),
  exit: transitionSchema.default({ type: 'none', duration: 10, easing: 'smooth', distance: 120 }),
  transform: transformSchema.default(transformSchema.parse({})),
  animate: animateSchema.default(animateSchema.parse({})),
};
export const MOTION_SCHEMAS = { transition: transitionSchema, transform: transformSchema, animate: animateSchema };
export const motionDefaults = () => ({
  enter: motionFields.enter.parse(undefined),
  exit: motionFields.exit.parse(undefined),
  transform: motionFields.transform.parse(undefined),
  animate: motionFields.animate.parse(undefined),
});

type Look = { tx: number; ty: number; scale: number; opacity: number; blur: number; clip?: string };
const NONE: Look = { tx: 0, ty: 0, scale: 1, opacity: 1, blur: 0 };

// t: 0 = hidden, 1 = fully in. dir: +1 entering, -1 leaving (moves continue the way they came instead of reversing).
const look = (tr: ItemTransition, t: number, dir: 1 | -1, popScale: number): Look => {
  const u = 1 - t;
  const d = tr.distance * u;
  switch (tr.type) {
    case 'fade':
      return { ...NONE, opacity: t };
    case 'rise':
      return { ...NONE, ty: d * dir, opacity: t };
    case 'drop':
      return { ...NONE, ty: -d * dir, opacity: t };
    case 'slideLeft':
      return { ...NONE, tx: d * dir, opacity: t };
    case 'slideRight':
      return { ...NONE, tx: -d * dir, opacity: t };
    case 'zoomIn': // never from 0: a small scale-up plus a fade reads as arriving
      return { ...NONE, scale: 1 - 0.14 * u, opacity: t };
    case 'zoomOut':
      return { ...NONE, scale: 1 + 0.14 * u, opacity: t };
    case 'blur':
      return { ...NONE, blur: 24 * u, opacity: Math.min(1, t * 1.4) };
    case 'wipeUp':
      return { ...NONE, clip: `inset(${u * 100}% 0 0 0)` };
    case 'wipeDown':
      return { ...NONE, clip: `inset(0 0 ${u * 100}% 0)` };
    case 'wipeLeft':
      return { ...NONE, clip: `inset(0 0 0 ${u * 100}%)` };
    case 'wipeRight':
      return { ...NONE, clip: `inset(0 ${u * 100}% 0 0)` };
    case 'iris':
      return { ...NONE, clip: `circle(${t * 75}% at 50% 50%)` };
    case 'pop':
      return { ...NONE, scale: popScale, opacity: Math.min(1, t * 2) };
    default:
      return NONE;
  }
};

const isIdentity = (x: ItemTransform) =>
  !x.x && !x.y && x.scale === 1 && !x.rotate && x.opacity === 1 && !x.blur && x.brightness === 1 && x.contrast === 1 && x.saturate === 1 && x.blend === 'normal';

/** Wraps one item: frames are local to the item (0 = its first frame). */
export const ItemMotion: React.FC<{
  durationInFrames: number;
  enter: ItemTransition;
  exit: ItemTransition;
  transform: ItemTransform;
  animate: ItemAnimate;
  children: React.ReactNode;
}> = ({ durationInFrames: dur, enter, exit, transform: x, animate: a, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (enter.type === 'none' && exit.type === 'none' && !a.on && isIdentity(x)) return <AbsoluteFill>{children}</AbsoluteFill>;

  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const inLen = Math.min(enter.duration, dur);
  const outLen = Math.min(exit.duration, dur);
  const tIn = enter.type === 'none' ? 1 : interpolate(f, [0, inLen], [0, 1], { ...clamp, easing: EASE[enter.easing] });
  const tOut = exit.type === 'none' ? 1 : interpolate(f, [dur - outLen, dur], [1, 0], { ...clamp, easing: EASE[exit.easing] });
  const popIn = enter.type === 'pop' ? 0.6 + 0.4 * spring({ frame: f, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } }) : 1;
  const popOut = exit.type === 'pop' ? interpolate(tOut, [0, 1], [0.7, 1]) : 1;
  const A = look(enter, tIn, 1, popIn);
  const B = look(exit, tOut, -1, popOut);

  // the base transform, optionally animated to the end state across the item
  const k = a.on ? interpolate(f, [0, Math.max(1, dur - 1)], [0, 1], { ...clamp, easing: EASE[a.easing] }) : 0;
  const mix = (p: number, q: number) => p + (q - p) * k;
  const tx = mix(x.x, a.x) + A.tx + B.tx;
  const ty = mix(x.y, a.y) + A.ty + B.ty;
  const scale = mix(x.scale, a.scale) * A.scale * B.scale;
  const rotate = mix(x.rotate, a.rotate);
  const opacity = mix(x.opacity, a.opacity) * A.opacity * B.opacity;
  const blur = x.blur + A.blur + B.blur;
  const filters = [
    blur > 0.05 ? `blur(${blur}px)` : '',
    x.brightness !== 1 ? `brightness(${x.brightness})` : '',
    x.contrast !== 1 ? `contrast(${x.contrast})` : '',
    x.saturate !== 1 ? `saturate(${x.saturate})` : '',
  ].filter(Boolean);
  const clip = f < inLen ? A.clip : f >= dur - outLen ? B.clip : undefined;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: `${x.originX}% ${x.originY}%`,
        opacity,
        filter: filters.length ? filters.join(' ') : undefined,
        mixBlendMode: x.blend === 'normal' ? undefined : x.blend,
        clipPath: clip,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
