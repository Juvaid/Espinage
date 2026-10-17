import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {ChecklistCardConfig} from '../../types/graphics';

const CheckSvg: React.FC<{at: number; accentColor: string; textColor: string}> = ({
  at,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const ring = ramp(frame, at + 2, 8, 0, 1, ease.inOut);
  const tick = ramp(frame, at + 6, 7, 0, 1, ease.out);
  const fill = ramp(frame, at + 8, 8);
  const pop = 1 + Math.sin(Math.min(1, ramp(frame, at + 8, 8)) * Math.PI) * 0.12;

  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      style={{flex: 'none', transform: `scale(${pop})`, overflow: 'visible'}}
    >
      <circle
        cx={20}
        cy={20}
        r={17}
        fill={`rgba(223, 178, 90, ${0.18 * fill})`}
        stroke={accentColor}
        strokeWidth={2}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - ring}
        transform="rotate(-90 20 20)"
      />
      <path
        d="M12.5 20.5 L18 26 L28 14.5"
        fill="none"
        stroke={textColor}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - tick}
      />
    </svg>
  );
};

export const ChecklistCard: React.FC<{
  config: ChecklistCardConfig;
  style?: React.CSSProperties;
}> = ({config, style}) => {
  const frame = useCurrentFrame();
  const {
    title,
    items,
    startFrame,
    endFrame,
    width = 880,
    accentColor = '#DFB25A',
    textColor = '#FAF8F5',
    bgColor = 'linear-gradient(170deg, oklch(0.16 0.012 45 / 0.94), oklch(0.11 0.01 45 / 0.94))',
    borderColor = 'oklch(0.32 0.025 60 / 0.45)',
    borderRadius = 26,
    position,
  } = config;

  const cardIn = ramp(frame, startFrame - 4, 10);
  if (cardIn <= 0) return null;

  const rule = ramp(frame, startFrame - 2, 16, 0, 1, ease.outQuart);

  return (
    <div
      style={{
        position: 'absolute',
        left: position?.x ?? `calc(50% - ${width / 2}px)`,
        top: position?.y ?? '22%',
        width,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding: '30px 32px 20px',
        boxShadow:
          '0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        opacity: cardIn,
        transform: `translateY(${(1 - cardIn) * 30}px)`,
        zIndex: 40,
        ...style,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
        <div
          style={{
            flex: 1,
            height: 1,
            background: borderColor,
            transform: `scaleX(${rule})`,
            transformOrigin: '0 50%',
          }}
        />
      </div>

      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14}}>
        {items.map((item, i) => {
          const itemAt = item.atFrame ?? startFrame + i * 18;
          if (frame < itemAt - 2) return null;

          const p = ramp(frame, itemAt - 2, 9, 0, 1, ease.out);
          const nextAt = items[i + 1]?.atFrame ?? endFrame ?? itemAt + 30;
          const active = frame >= itemAt - 1 && frame < nextAt - 1;
          const float = Math.sin((frame - itemAt) / 16) * (active ? 2.5 : 0);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: p,
                transform: `translateX(${(1 - p) * 24}px) translateY(${float}px)`,
                padding: '8px 12px',
                borderRadius: 14,
                backgroundColor: active ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <CheckSvg at={itemAt} accentColor={accentColor} textColor={textColor} />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: active ? 600 : 400,
                  color: active ? accentColor : textColor,
                  letterSpacing: '0.02em',
                }}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
