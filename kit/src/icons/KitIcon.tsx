import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import ICONS from './phosphor.json';
import {useKitTheme} from '../theme/KitTheme';

// Solid and duotone icons from Phosphor (MIT, src/icons/PHOSPHOR-LICENSE), a curated real-estate set
// (src/icons/phosphor.json; groups: property, location, money, trust, measure, amenities). Use inside a control
// (toggle knob, tag, chip, button) or as a meaningful object, never as thin decoration stamped on headings.
// `at`: optional frame to pop in (scale 0.7 → 1, the duotone tint fading up after the outline).
type Rec = {group: string; fill?: [string, number][]; duotone?: [string, number][]};
const SET = ICONS as unknown as Record<string, Rec>;
export type KitIconName = keyof typeof ICONS;
export const KIT_ICON_NAMES = Object.keys(SET) as KitIconName[];

export const KitIcon: React.FC<{name: KitIconName; size?: number; weight?: 'fill' | 'duotone'; color?: string; at?: number; style?: React.CSSProperties}> = ({name, size = 56, weight = 'fill', color, at, style}) => {
  const f = useCurrentFrame();
  const t = useKitTheme();
  const c = color ?? t.accent;
  const rec = SET[name];
  const paths = rec?.[weight] ?? rec?.fill ?? [];
  const p = at === undefined ? 1 : interpolate(f, [at - 2, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tint = at === undefined ? 1 : interpolate(f, [at + 4, at + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" style={{opacity: p, transform: `scale(${0.7 + 0.3 * p})`, ...style}}>
      {paths.map(([d, op], i) => (
        <path key={i} d={d} fill={c} opacity={op < 1 ? op * tint : 1} />
      ))}
    </svg>
  );
};
