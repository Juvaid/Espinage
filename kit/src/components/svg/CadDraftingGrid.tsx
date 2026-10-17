import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface CadDraftingGridProps {
  startFrame: number;
  accentColor?: string;
  gridSize?: number;
  opacity?: number;
  coordinates?: string;
  code?: string;
  style?: React.CSSProperties;
}

/** Technical Architectural Drafting CAD Grid & Blueprint Crosshairs */
export const CadDraftingGrid: React.FC<CadDraftingGridProps> = ({
  startFrame,
  accentColor = '#DFB25A',
  gridSize = 120,
  opacity = 0.35,
  coordinates = '30°54\'08" N // 75°51\'18" E',
  code = 'CAD // DRAFTING // 54-D',
  style,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, startFrame, 20, 0, 1, ease.expoOut);
  if (p <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: p * opacity,
        zIndex: 8,
        ...style,
      }}
    >
      {/* Background CAD Grid */}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern
            id="cad-grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={accentColor}
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.4"
            />
            {/* Small intersection crosshair */}
            <path
              d="M -6 0 L 6 0 M 0 -6 L 0 6"
              fill="none"
              stroke={accentColor}
              strokeWidth="1.2"
              opacity="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cad-grid-pattern)" />
      </svg>

      {/* Top Left Registration Data */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontFamily: "'Geist Mono', 'Courier New', monospace",
          fontSize: 14,
          letterSpacing: '0.18em',
          color: accentColor,
        }}
      >
        <span>{code}</span>
        <span style={{opacity: 0.6}}>{coordinates}</span>
      </div>

      {/* Outer Border with Corner Brackets */}
      <div
        style={{
          position: 'absolute',
          inset: '40px',
          border: `1px solid ${accentColor}`,
          opacity: 0.25,
        }}
      />
    </div>
  );
};
