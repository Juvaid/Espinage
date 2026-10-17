import {Easing, interpolate} from 'remotion';

export const DEFAULT_FPS = 30;
export const DEFAULT_WIDTH = 1080;
export const DEFAULT_HEIGHT = 1920;

/** Convert seconds to nearest frame count */
export const sec = (s: number, fps = DEFAULT_FPS) => Math.round(s * fps);

/** Frame to seconds */
export const toSec = (f: number, fps = DEFAULT_FPS) => f / fps;

/** Standard production easing curves (anti-slop: exponential curves favored) */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),       // expo out
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  whip: Easing.bezier(0.72, 0, 0.18, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: Easing.linear,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Interpolate value 0->1 (or a->b) over `dur` frames starting at `from` */
export const ramp = (
  frame: number,
  from: number,
  dur: number,
  a = 0,
  b = 1,
  easing = ease.out
) => interpolate(frame, [from, from + Math.max(dur, 0.0001)], [a, b], {...clamp, easing});

/** Piecewise keyframes with custom easing per segment */
export const keys = (
  frame: number,
  frames: number[],
  values: number[],
  easing = ease.inOut
) => interpolate(frame, frames, values, {...clamp, easing});

/** Decaying camera/element shake */
export const shake = (frame: number, at: number, amp: number, dur = 12) => {
  const t = frame - at;
  if (t < 0 || t > dur) return {x: 0, y: 0, r: 0};
  const k = Math.pow(1 - t / dur, 2) * amp;
  return {
    x: Math.sin(t * 2.9) * k,
    y: Math.cos(t * 3.7) * k * 0.8,
    r: Math.sin(t * 2.3) * k * 0.04,
  };
};
