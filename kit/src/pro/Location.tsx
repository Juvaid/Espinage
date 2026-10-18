import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {KitIcon, type KitIconName} from '../icons/KitIcon';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Location beats, over a map, an aerial or the brand ground. Labels and distances only from the brief: never
// invent travel times or distances (brand file). Coordinates are frame pixels (1080 × 1920).
//   DistanceRings · rings open from the site, one per spoken distance, each with its chip
//   RouteDraw     · a route draws itself with a light at its head, ending in a pin and a chip
//   Callout       · a point on a picture, a leader line, and a solid label chip (with an icon)
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

const Chip: React.FC<{text: string; icon?: KitIconName; p: number; size?: number; style?: React.CSSProperties}> = ({text, icon, p, size = 34, style}) => {
  const C = useKitTheme();
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: icon ? '12px 22px 12px 14px' : '12px 22px', borderRadius: 999, background: C.panel, border: `1px solid ${C.hair}`, boxShadow: `0 14px 34px ${C.shadow}`, fontFamily: C.fontHead, fontWeight: 560, fontSize: size, letterSpacing: '-0.01em', color: C.ivory, whiteSpace: 'nowrap', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style}}>
      {icon ? <KitIcon name={icon} size={size * 1.25} weight="duotone" /> : null}
      {text}
    </div>
  );
};

export const DistanceRings: React.FC<{x: number; y: number; start: number; rings: {r: number; label: string; at: number}[]; angle?: number}> = ({x, y, start, rings, angle = -40}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const dot = interpolate(f, [start, start + 10], [0, 1], {...clamp, easing: expo});
  const pulse = ((f - start) % 45) / 45;
  const a = (angle * Math.PI) / 180;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {rings.map((g, i) => {
          const p = interpolate(f, [g.at - 4, g.at + 18], [0, 1], {...clamp, easing: expo});
          return p > 0 ? <circle key={i} cx={x} cy={y} r={g.r * p} fill={alpha(C.accent, 0.04 * p)} stroke={C.accent} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="10 12" /> : null;
        })}
        {f >= start ? <circle cx={x} cy={y} r={14 + 60 * pulse} fill="none" stroke={C.accent} strokeOpacity={(1 - pulse) * 0.6 * dot} strokeWidth={2} /> : null}
        <circle cx={x} cy={y} r={12 * dot} fill={C.ivory} style={{filter: `drop-shadow(0 0 12px ${C.accent})`}} />
      </svg>
      {rings.map((g, i) => {
        const p = interpolate(f, [g.at + 6, g.at + 18], [0, 1], {...clamp, easing: expo});
        return p > 0 ? <Chip key={i} text={g.label} p={p} size={30} style={{position: 'absolute', left: x + Math.cos(a) * g.r, top: y + Math.sin(a) * g.r, translate: '-50% -50%'}} /> : null;
      })}
    </div>
  );
};

// d: an SVG path in frame pixels (draw it over the map picture); at/dur: the draw; end: chip at the destination
export const RouteDraw: React.FC<{d: string; at: number; dur?: number; end?: {text: string; icon?: KitIconName}}> = ({d, at, dur = 40, end}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const pts = useMemo(() => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d);
    const L = el.getTotalLength();
    return Array.from({length: 241}, (_, i) => {
      const q = el.getPointAtLength((L * i) / 240);
      return [q.x, q.y] as [number, number];
    });
  }, [d]);
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: inOut});
  const [hx, hy] = pts[Math.round(p * 240)];
  const fin = interpolate(f, [at + dur - 2, at + dur + 12], [0, 1], {...clamp, easing: expo});
  const [ex, ey] = pts[240];
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={d} fill="none" stroke={C.deep} strokeOpacity={0.7} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        <path d={d} fill="none" stroke={C.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{filter: `drop-shadow(0 0 10px ${alpha(C.glow, 0.9)})`}} />
        {p > 0 && p < 1 ? <circle cx={hx} cy={hy} r={11} fill={String(C.type3d.ramp[0][1])} style={{filter: `drop-shadow(0 0 14px ${C.accent}) drop-shadow(0 0 30px ${C.glow})`}} /> : null}
      </svg>
      {fin > 0 ? (
        <>
          <div style={{position: 'absolute', left: ex, top: ey, translate: '-50% -100%', transform: `scale(${fin})`, transformOrigin: '50% 100%'}}>
            <KitIcon name="map-pin" size={92} color={C.ivory} style={{filter: `drop-shadow(0 8px 18px ${C.shadow})`}} />
          </div>
          {end ? <Chip text={end.text} icon={end.icon} p={fin} style={{position: 'absolute', left: ex, top: ey - 150, translate: '-50% -50%'}} /> : null}
        </>
      ) : null}
    </div>
  );
};

// point: what the callout points at; side: where the label sits; length: leader length in px
export const Callout: React.FC<{point: [number, number]; text: string; icon?: KitIconName; at: number; side?: 'left' | 'right'; rise?: number; length?: number}> = ({point, text, icon, at, side = 'right', rise = -140, length = 180}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const [x, y] = point;
  const s = side === 'right' ? 1 : -1;
  const dot = interpolate(f, [at, at + 8], [0, 1], {...clamp, easing: expo});
  const line = interpolate(f, [at + 4, at + 18], [0, 1], {...clamp, easing: inOut});
  const chip = interpolate(f, [at + 14, at + 26], [0, 1], {...clamp, easing: expo});
  const ex = x + s * 70, ey = y + rise; // elbow
  const tx = ex + s * length;
  const d = `M${x} ${y} L${ex} ${ey} L${tx} ${ey}`;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={26 * dot} fill="none" stroke={C.ivory} strokeOpacity={0.5 * dot} strokeWidth={2} />
        <circle cx={x} cy={y} r={9 * dot} fill={C.ivory} style={{filter: `drop-shadow(0 0 10px ${C.accent})`}} />
        <path d={d} fill="none" stroke={C.ivory} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} style={{filter: `drop-shadow(0 2px 6px ${C.shadow})`}} />
      </svg>
      {chip > 0 ? <Chip text={text} icon={icon} p={chip} style={{position: 'absolute', left: tx, top: ey, translate: side === 'right' ? '0 -50%' : '-100% -50%'}} /> : null}
    </div>
  );
};
