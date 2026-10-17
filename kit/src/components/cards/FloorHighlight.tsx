import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface FloorLevel {
  name: string;
  yTop: number;
  yBottom: number;
  label?: string;
}

export interface FloorHighlightProps {
  floors: FloorLevel[];
  startFrame: number;
  accentColor?: string;
  staggerFrames?: number;
  sheenPass?: boolean;
  style?: React.CSSProperties;
}

/** Architectural Floor Level Illumination Bands & Laser Divider Lines */
export const FloorHighlight: React.FC<FloorHighlightProps> = ({
  floors,
  startFrame,
  accentColor = '#DFB25A',
  staggerFrames = 6,
  sheenPass = true,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 22,
        ...style,
      }}
    >
      {floors.map((floor, i) => {
        const floorStart = startFrame + i * staggerFrames;
        const p = ramp(frame, floorStart, 10, 0, 1, ease.out);
        if (p <= 0) return null;

        const height = floor.yBottom - floor.yTop;
        const sweep = sheenPass ? ramp(frame, floorStart + 4, 18, -20, 120, ease.inOut) : -99;
        const hasSweep = sweep > -15 && sweep < 115;

        return (
          <div key={floor.name}>
            {/* Glowing Floor Band */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: floor.yTop,
                height,
                background: `linear-gradient(90deg, rgba(223, 178, 90, 0.05), rgba(223, 178, 90, 0.28) 40%, rgba(223, 178, 90, 0.28) 60%, rgba(223, 178, 90, 0.05))`,
                mixBlendMode: 'screen',
                opacity: p,
              }}
            />

            {/* Laser Sheen Sweep across the floor plate */}
            {hasSweep && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: floor.yTop,
                  height,
                  background: `linear-gradient(105deg, transparent ${sweep - 15}%, rgba(255, 245, 220, 0.45) ${sweep}%, transparent ${sweep + 15}%)`,
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* Dividing Laser Line Top */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: floor.yTop,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor} 20%, ${accentColor} 80%, transparent)`,
                boxShadow: `0 0 16px ${accentColor}`,
                opacity: p * 0.9,
                clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
              }}
            />

            {/* Floor Name Badge */}
            <div
              style={{
                position: 'absolute',
                right: 80,
                top: floor.yTop + height / 2 - 16,
                backgroundColor: 'rgba(12, 10, 9, 0.85)',
                border: `1px solid ${accentColor}`,
                padding: '6px 14px',
                borderRadius: 8,
                color: '#FAF8F5',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                opacity: p,
                transform: `translateX(${(1 - p) * 20}px)`,
              }}
            >
              {floor.label || floor.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
