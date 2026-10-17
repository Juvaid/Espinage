import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface MapRouteTrackProps {
  startFrame: number;
  durationFrames?: number;
  pathD?: string;
  destinationPoint?: {x: number; y: number};
  badgeText?: string;
  accentColor?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

/** Animated Map Route Trajectory with Pulsing Destination Pin */
export const MapRouteTrack: React.FC<MapRouteTrackProps> = ({
  startFrame,
  durationFrames = 45,
  pathD = 'M 180 820 C 300 700, 420 540, 540 460 S 760 380, 840 260',
  destinationPoint = {x: 840, y: 260},
  badgeText = '6 MIN // DIRECT ACCESS',
  accentColor = '#DFB25A',
  width = 1080,
  height = 1080,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, startFrame, durationFrames, 0, 1, ease.inOut);
  if (frame < startFrame) return null;

  // Destination pulse when path completes
  const pulseAt = startFrame + Math.round(durationFrames * 0.7);
  const pulse = frame >= pulseAt ? Math.sin((frame - pulseAt) / 8) * 0.5 + 0.5 : 0;
  const badgeIn = ramp(frame, pulseAt + 4, 12, 0, 1, ease.out);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 25,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{overflow: 'visible'}}
      >
        {/* Glow under-path */}
        <path
          d={pathD}
          fill="none"
          stroke={accentColor}
          strokeWidth="12"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
          opacity="0.3"
          style={{filter: `drop-shadow(0 0 16px ${accentColor})`}}
        />

        {/* Crisp core path */}
        <path
          d={pathD}
          fill="none"
          stroke="#FAF8F5"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
        />

        {/* Pulsing Destination Pin */}
        {frame >= pulseAt && (
          <g transform={`translate(${destinationPoint.x}, ${destinationPoint.y})`}>
            {/* Outer ripple ring */}
            <circle
              r={14 + pulse * 24}
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              opacity={1 - pulse}
            />
            {/* Core glowing marker */}
            <circle r={9} fill={accentColor} style={{filter: `drop-shadow(0 0 8px ${accentColor})`}} />
            <circle r={4} fill="#FAF8F5" />
          </g>
        )}
      </svg>

      {/* Floating Travel Badge */}
      {badgeIn > 0 && (
        <div
          style={{
            position: 'absolute',
            left: destinationPoint.x + 24,
            top: destinationPoint.y - 48,
            backgroundColor: 'rgba(12, 10, 9, 0.88)',
            border: `1px solid ${accentColor}`,
            padding: '10px 16px',
            borderRadius: 12,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            opacity: badgeIn,
            transform: `translateY(${(1 - badgeIn) * 12}px)`,
          }}
        >
          <span
            style={{
              color: '#FAF8F5',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
