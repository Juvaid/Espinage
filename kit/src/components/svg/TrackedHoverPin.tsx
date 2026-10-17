import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface TrackedHoverPinProps {
  label: string;
  startFrame: number;
  x?: number | string;
  y?: number | string;
  accentColor?: string;
  textColor?: string;
  code?: string;
  style?: React.CSSProperties;
}

/** 2.5D Perspective Tracked Pin & Callout Card with Vector Leader Line */
export const TrackedHoverPin: React.FC<TrackedHoverPinProps> = ({
  label,
  startFrame,
  x = '54%',
  y = '28%',
  accentColor = '#DFB25A',
  textColor = '#FAF8F5',
  code = 'LOCATION // PIN',
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const p = ramp(frame, startFrame, 12, 0, 1, ease.out);
  // Organic 2.5D floating drift
  const driftX = Math.sin((frame - startFrame) / 24) * 4;
  const driftY = Math.cos((frame - startFrame) / 30) * 4;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: p,
        transform: `perspective(1000px) rotateY(-4deg) translate(${driftX}px, ${driftY}px)`,
        zIndex: 40,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {/* Callout Card */}
      <div
        style={{
          border: `1px solid ${accentColor}`,
          background: 'rgba(12, 10, 9, 0.92)',
          padding: '14px 22px',
          borderRadius: 14,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {code}
        </div>
        <div
          style={{
            color: textColor,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      </div>

      {/* SVG Leader Line connecting to focal point */}
      <svg width="180" height="120" style={{overflow: 'visible'}}>
        <path
          d="M 36 0 L 36 60 L 10 94"
          stroke={accentColor}
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 3"
        />
        <circle cx="10" cy="94" r="7" fill={accentColor} />
        <circle cx="10" cy="94" r="3" fill="#FAF8F5" />
      </svg>
    </div>
  );
};
