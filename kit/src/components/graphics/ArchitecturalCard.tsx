import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface ArchitecturalCardProps {
  label: string;
  code?: string;
  startFrame: number;
  width: number;
  height: number;
  x: number;
  y: number;
  accentColor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ArchitecturalCard: React.FC<ArchitecturalCardProps> = ({
  label,
  code = 'DRAFT // 01',
  startFrame,
  width,
  height,
  x,
  y,
  accentColor = '#DFB25A',
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, startFrame, 16, 0, 1, ease.expoOut);
  if (p <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y,
        width,
        height,
        border: '1px solid rgba(255, 255, 255, 0.14)',
        background: 'rgba(12, 10, 9, 0.85)',
        backdropFilter: 'blur(20px)',
        transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + p * 0.04})`,
        opacity: p,
        overflow: 'hidden',
        zIndex: 30,
        ...style,
      }}
    >
      {/* Corner Registration Crosshairs */}
      <div style={{position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderTop: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}`}} />
      <div style={{position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderTop: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}`}} />
      <div style={{position: 'absolute', bottom: 8, left: 8, width: 8, height: 8, borderBottom: `1px solid ${accentColor}`, borderLeft: `1px solid ${accentColor}`}} />
      <div style={{position: 'absolute', bottom: 8, right: 8, width: 8, height: 8, borderBottom: `1px solid ${accentColor}`, borderRight: `1px solid ${accentColor}`}} />

      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.2em', color: accentColor, textTransform: 'uppercase'}}>
          {label}
        </span>
        <span style={{fontSize: 13, letterSpacing: '0.15em', color: 'rgba(255, 255, 255, 0.5)'}}>
          {code}
        </span>
      </div>

      <div style={{position: 'relative', width: '100%', height: 'calc(100% - 50px)'}}>
        {children}
      </div>
    </div>
  );
};
