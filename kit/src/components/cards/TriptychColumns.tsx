import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface TriptychColumn {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
}

export interface TriptychColumnsProps {
  columns: TriptychColumn[];
  startFrame: number;
  accentColor?: string;
  height?: number | string;
  top?: number | string;
  style?: React.CSSProperties;
}

/** 3-Way Split Column Triptych with Vertical Reveal */
export const TriptychColumns: React.FC<TriptychColumnsProps> = ({
  columns,
  startFrame,
  accentColor = '#DFB25A',
  height = '100%',
  top = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const count = columns.length;
  const colWidth = 100 / count;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        zIndex: 20,
        ...style,
      }}
    >
      {columns.map((col, i) => {
        const p = ramp(frame, startFrame + i * 3, 12, 0, 1, ease.out);
        if (p <= 0) return null;

        return (
          <div
            key={col.id}
            style={{
              position: 'absolute',
              left: `${i * colWidth}%`,
              width: `${colWidth}%`,
              top: 0,
              bottom: 0,
              overflow: 'hidden',
              clipPath: `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`,
              borderRight: i < count - 1 ? `2px solid ${accentColor}` : undefined,
              boxShadow: `0 0 20px rgba(0, 0, 0, 0.6)`,
            }}
          >
            {col.imageUrl ? (
              <Img
                src={col.imageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.05) saturate(0.9) brightness(0.8)',
                  transform: `scale(${1.1 - p * 0.05})`,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(180deg, #1c1917, #0c0a09)`,
                }}
              />
            )}

            {/* Gradient Scrim for Label */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 40%, rgba(12, 10, 9, 0.9) 85%)',
              }}
            />

            {/* Column Label */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 120,
                textAlign: 'center',
                padding: '0 12px',
                opacity: p,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#FAF8F5',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {col.label}
              </div>
              {col.sublabel && (
                <div
                  style={{
                    fontSize: 16,
                    color: accentColor,
                    marginTop: 6,
                    letterSpacing: '0.12em',
                  }}
                >
                  {col.sublabel}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
