import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {useKitTheme} from '../theme/KitTheme';

// Complementary background line art (production: Dhunna construction reel, "Aaj, ek Vision." hook), themed:
//   WireEye  · an eye that traces itself on, a wireframe-globe iris that turns, a blink, a light chasing the outline
//   WirePin  · a wireframe map pin drawn in perspective over a small ground grid, that can travel to a new spot
//   ArchGrid · a faint drifting architectural grid with registration crosses
// Use behind a type beat or a "vision / location" line, at low opacity behind the hero, never on top of it.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);

// start/end: frames it builds on and off; x, y, w: placement (px); blinkAt: frame of the blink (optional)
export const WireEye: React.FC<{start: number; end: number; x?: number; y?: number; w?: number; blinkAt?: number; opacity?: number}> = ({start, end, x = 130, y = 300, w = 820, blinkAt, opacity = 0.92}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const t = f - start;
  if (f < start || f > end + 2) return null;
  const on = interpolate(f, [start, start + 8, end - 14, end], [0, 1, 1, 0], clamp);
  const trace = interpolate(t, [0, 23], [0, 1], {...clamp, easing: expo});
  const scale = interpolate(f, [start, start + 28, end - 14, end], [0.78, 1, 1.035, 1.15], clamp);
  const b = blinkAt ?? start + 58;
  const blink = interpolate(f, [start, start + 10, b, b + 3, b + 7], [0.08, 1, 1, 0.12, 1], clamp);
  const line = C.type3d.ramp[3][1], hot = C.type3d.ramp[0][1];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.417, opacity: on * opacity, transform: `perspective(1200px) rotateY(${interpolate(t, [0, 28, end - start], [-24, 0, 14], clamp)}deg) rotateZ(${Math.sin(f / 28) * 3}deg) scale(${scale})`, filter: `blur(${interpolate(t, [0, 10], [3, 0], clamp)}px)`}}>
      <svg viewBox="0 40 240 100" width="100%" height="100%" fill="none" stroke={line} strokeWidth="1.15">
        <defs><filter id="wire-eye-glow" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="1.25" /></filter></defs>
        <g transform={`translate(0,${90 * (1 - blink)}) scale(1,${blink})`}>
          <path d="M12 90 Q120 4 228 90 Q120 176 12 90Z" strokeWidth="2" strokeOpacity=".28" filter="url(#wire-eye-glow)" />
          <path d="M12 90 Q120 4 228 90 Q120 176 12 90Z" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trace} />
          <g transform={`translate(${Math.sin(f / 16) * 4},0)`}>
            <ellipse cx="120" cy="90" rx="40" ry="43" strokeWidth="1.3" />
            {Array.from({length: 6}, (_, i) => {
              const c = Math.cos((i * Math.PI) / 6 + f * 0.055);
              return <ellipse key={i} cx="120" cy="90" rx={Math.max(1, Math.abs(40 * c))} ry="43" strokeOpacity={0.35 + 0.35 * Math.abs(c)} strokeWidth=".65" />;
            })}
            <ellipse cx="120" cy="90" rx="40" ry="14" strokeWidth=".8" />
            <ellipse cx="120" cy="90" rx="40" ry="29" strokeWidth=".8" />
            <circle cx="120" cy="90" r={8 + Math.sin(f / 12) * 1.5} stroke={hot} strokeWidth="1.5" />
            <circle cx="114" cy="84" r="2" fill={hot} stroke="none" />
          </g>
          <path d="M12 90 Q120 4 228 90 Q120 176 12 90Z" stroke={hot} strokeWidth="2" pathLength={1} strokeDasharray=".09 .91" strokeDashoffset={-f * 0.016} strokeOpacity=".9" />
        </g>
      </svg>
    </div>
  );
};

// start/end: frames on and off; from/to: [left, top] in px; travel: [start, end] frames of the move (optional)
export const WirePin: React.FC<{start: number; end: number; from?: [number, number]; to?: [number, number]; travel?: [number, number]; opacity?: number}> = ({start, end, from = [750, 1080], to, travel, opacity = 0.94}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  if (f < start || f > end + 2) return null;
  const on = interpolate(f, [start, start + 12, end - 14, end], [0, 1, 1, 0], clamp);
  const draw = interpolate(f, [start, start + 28], [0, 1], {...clamp, easing: expo});
  const k = travel && to ? interpolate(f, travel, [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.2, 1)}) : 0;
  const dest = to ?? from;
  const left = from[0] + (dest[0] - from[0]) * k;
  const top = from[1] + (dest[1] - from[1]) * k + Math.sin(f / 15) * 6 * (1 - k);
  const w = 240 - 60 * k, h = 390 - 90 * k;
  const line = C.type3d.ramp[3][1], hot = C.type3d.ramp[0][1];
  return (
    <div style={{position: 'absolute', left, top, width: w, height: h, opacity: on * opacity, transform: `perspective(1000px) rotateY(${interpolate(f, [start, start + 30], [-30, 0], clamp) + Math.sin(f / 26) * 10 * (1 - k)}deg) translateY(${(1 - draw) * 25}px)`, filter: `blur(${(1 - draw) * 3}px)`}}>
      <svg viewBox="0 0 240 360" width="100%" height="100%" fill="none" stroke={line} strokeWidth="1.8">
        <defs><filter id="wire-pin-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5" /></filter></defs>
        <path d="M120 285 C102 258 38 166 38 112 A82 82 0 0 1 202 112 C202 166 138 258 120 285Z" strokeWidth="3" strokeOpacity=".24" filter="url(#wire-pin-glow)" />
        <path d="M120 285 C102 258 38 166 38 112 A82 82 0 0 1 202 112 C202 166 138 258 120 285Z" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <path d="M120 285 C108 239 73 165 73 112 A47 82 0 0 1 167 112 C167 165 132 239 120 285Z" strokeOpacity=".42" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <ellipse cx="120" cy="112" rx="82" ry="26" strokeOpacity=".55" />
        <ellipse cx="120" cy="112" rx={Math.max(3, 35 * Math.abs(Math.cos(f * 0.04)))} ry="35" />
        <circle cx="120" cy="112" r="35" stroke={hot} />
        <path d="M45 155Q120 198 195 155M66 207Q120 230 174 207M120 30V76M120 148V285" strokeOpacity=".4" />
        <path d="M120 285 C102 258 38 166 38 112 A82 82 0 0 1 202 112 C202 166 138 258 120 285Z" stroke={hot} strokeWidth="2.2" pathLength={1} strokeDasharray=".1 .9" strokeDashoffset={-f * 0.012} />
        <g opacity={(1 - k) * 0.65}>
          <path d="M15 313L105 282L225 320L135 352Z M45 303L165 342M75 293L195 331M45 322L135 292M75 333L165 302M105 343L195 311" strokeWidth=".8" />
          <ellipse cx="120" cy="312" rx={35 + Math.sin(f / 12) * 6} ry="10" />
        </g>
      </svg>
    </div>
  );
};

export const ArchGrid: React.FC<{opacity?: number}> = ({opacity = 0.065}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const drift = Math.sin(f / 100) * 9;
  const line = C.type3d.ramp[5][1];
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      <defs>
        <pattern id="kit-arch-grid" width="180" height="180" patternUnits="userSpaceOnUse" patternTransform={`translate(${drift},${-drift})`}>
          <path d="M0 180V0H180" fill="none" stroke={line} strokeWidth=".8" />
          <path d="M86 90H94M90 86V94" stroke={line} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#kit-arch-grid)" />
    </svg>
  );
};
