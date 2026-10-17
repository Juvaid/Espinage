import React from 'react';
import {Img, OffthreadVideo, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {PhotoCardConfig} from '../../types/graphics';

export const PhotoCard: React.FC<{
  config: PhotoCardConfig;
  style?: React.CSSProperties;
}> = ({config, style}) => {
  const frame = useCurrentFrame();
  const {
    mediaUrl,
    isVideo,
    label,
    code,
    startFrame,
    backFrame,
    width,
    height,
    x,
    y,
    tilt = -2,
    from = 'bottom',
    accentBorder = 'oklch(1 0 0 / 0.16)',
    driftIntensity = 1.12,
    borderRadius = 28,
  } = config;

  const p = ramp(frame, startFrame - 10, 12, 0, 1, ease.out);
  if (p <= 0) return null;

  const b = backFrame === undefined ? 0 : ramp(frame, backFrame - 10, 12, 0, 1, ease.out);
  const dx = from === 'right' ? 900 : from === 'left' ? -900 : 0;
  const dy = from === 'bottom' ? 1000 : 120;
  const rot = tilt + (1 - p) * (from === 'left' ? -14 : 14) - b * 5;
  const s = (0.88 + p * 0.12) * (1 - b * 0.1);
  const drift = ramp(frame, startFrame - 10, 90, driftIntensity, 1.02, ease.outQuart);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${drift})`,
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y,
        width,
        height,
        transform: `translate(${(1 - p) * dx - b * 40}px, ${(1 - p) * dy - b * 70}px) rotate(${rot}deg) scale(${s})`,
        transformOrigin: '50% 60%',
        borderRadius,
        overflow: 'hidden',
        border: `1.5px solid ${accentBorder}`,
        boxShadow: `0 ${40 - b * 10}px ${80 - b * 20}px rgba(0, 0, 0, ${0.7 - b * 0.2}), inset 0 0 0 1px rgba(255, 255, 255, 0.08)`,
        filter: b > 0 ? `brightness(${1 - b * 0.42}) blur(${b * 1.5}px)` : undefined,
        opacity: Math.min(1, p * 1.6),
        zIndex: 35,
        ...style,
      }}
    >
      {/* Media: Image or Video */}
      {mediaUrl ? (
        isVideo ? (
          <OffthreadVideo src={mediaUrl} muted style={mediaStyle} />
        ) : (
          <Img src={mediaUrl} style={mediaStyle} />
        )
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          }}
        />
      )}

      {/* Physical print top-sheen reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, rgba(255, 255, 255, 0.12) 0%, transparent 28%, transparent 70%, rgba(0, 0, 0, 0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Label Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 28,
          right: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'rgba(12, 10, 9, 0.75)',
          backdropFilter: 'blur(10px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span
          style={{
            color: '#FAF8F5',
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        {code && (
          <span
            style={{
              color: '#DFB25A',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            {code}
          </span>
        )}
      </div>
    </div>
  );
};
