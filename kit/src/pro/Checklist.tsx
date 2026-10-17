import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../lib/anim';
import {alpha, useKitTheme} from '../theme/KitTheme';
import {LineIcon, type IconName} from './Icons2D';
import {KIT_ICON_NAMES, KitIcon, type KitIconName} from '../icons/KitIcon';

// Amenity checklist card (production, Crown Crest v1), themed: a title, then rows that land on their spoken word.
// Place it inside the safe zones at a readable size (default width 840 px; rows at 34 px).
// Each row: icon chip pops in and draws on → text slides up → a check mark draws itself.

// icon: any Phosphor name from KitIcon (duotone, preferred) or a legacy line-icon name
export type CheckItem = {icon: KitIconName | IconName; text: string; at: number};

const Check: React.FC<{at: number}> = ({at}) => {
  const C = useKitTheme();
  const frame = useCurrentFrame();
  const ring = ramp(frame, at + 2, 8, 0, 1, ease.inOut);
  const tick = ramp(frame, at + 6, 7, 0, 1, ease.out);
  const fill = ramp(frame, at + 8, 8);
  const pop = 1 + Math.sin(Math.min(1, ramp(frame, at + 8, 8)) * Math.PI) * 0.12;
  return (
    <svg width={54} height={54} viewBox="0 0 40 40" style={{flex: 'none', transform: `scale(${pop})`, overflow: 'visible'}}>
      <circle cx={20} cy={20} r={17} fill={alpha(C.accent, 0.22 * fill)} stroke={C.accent} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 20 20)" />
      <path d="M12.5 20.5 L18 26 L28 14.5" fill="none" stroke={C.ivory} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
    </svg>
  );
};

export const Checklist: React.FC<{
  title: string;
  items: CheckItem[];
  end: number; // frame the last item stops being "current"
  style?: React.CSSProperties;
  show?: number; // 0..1 card visibility
}> = ({title, items, end, style, show = 1}) => {
  const C = useKitTheme();
  const frame = useCurrentFrame();
  const cardIn = ramp(frame, items[0].at - 4, 10) * show;
  if (cardIn <= 0) return null;
  const rule = ramp(frame, items[0].at - 2, 16, 0, 1, ease.outQuart);
  return (
    <div
      style={{
        background: `linear-gradient(170deg, ${alpha(C.lift, 0.92)}, ${alpha(C.deep, 0.92)})`,
        border: `1px solid ${C.hair}`,
        borderRadius: 26,
        padding: '38px 40px 24px',
        boxShadow: `0 30px 70px ${C.shadow}, inset 0 1px 0 oklch(1 0 0 / 0.06)`,
        opacity: cardIn,
        transform: `translateY(${(1 - cardIn) * 30}px)`,
        ...style,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{fontFamily: C.fontLabel, fontWeight: 500, textTransform: 'uppercase', fontSize: 24, letterSpacing: '0.3em', color: C.accent}}>{title}</div>
        <div style={{flex: 1, height: 1, background: C.hair, transform: `scaleX(${rule})`, transformOrigin: '0 50%'}} />
      </div>
      <div style={{marginTop: 12}}>
        {items.map((it, i) => {
          if (frame < it.at - 2) return null;
          const p = ramp(frame, it.at - 2, 9, 0, 1, ease.out);
          const chip = ramp(frame, it.at - 2, 10, 0, 1, ease.out);
          const next = items[i + 1]?.at ?? end;
          const active = frame >= it.at - 1 && frame < next - 1;
          const float = Math.sin((frame - it.at) / 16) * (active ? 2.5 : 0);
          return (
            <div
              key={it.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '22px 0',
                borderTop: i === 0 ? undefined : `1px solid ${alpha(C.accent, 0.14)}`,
                opacity: p * (active ? 1 : 0.74),
                transform: `translateY(${(1 - p) * 18}px)`,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  background: active ? alpha(C.accent, 0.16) : 'oklch(1 0 0 / 0.04)',
                  border: `1px solid ${active ? C.accent : alpha(C.accent, 0.25)}`,
                  boxShadow: active ? `0 0 22px ${alpha(C.accent, 0.35)}` : undefined,
                  transform: `scale(${0.7 + chip * 0.3}) translateY(${float}px)`,
                }}
              >
                {(KIT_ICON_NAMES as string[]).includes(it.icon) ? <KitIcon name={it.icon as KitIconName} weight="duotone" at={it.at} size={46} color={active ? C.ivory : C.accent} /> : <LineIcon name={it.icon as IconName} start={it.at - 1} size={44} />}
              </div>
              <div style={{fontFamily: C.fontHead, flex: 1, fontSize: 46, fontWeight: 520, fontVariationSettings: "'wght' 520", letterSpacing: '-0.015em', color: C.ivory, lineHeight: 1.15}}>
                {it.text}
              </div>
              <Check at={it.at} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
