import React from 'react';
import {Img, OffthreadVideo, Sequence, useCurrentFrame} from 'remotion';
import {asset} from '../lib/asset';
import {ease, ramp} from '../lib/anim';
import {alpha, useKitTheme} from '../theme/KitTheme';

// Gallery-style photo card (production, Crown Crest v1), themed: flies in, settles, drifts inside its frame, and
// steps back into the deck (scale down, tilt, dim) when the next card lands.

export const PhotoCard: React.FC<{
  /** A still (public path), or a clip (public path) that plays inside the card. */
  src?: string;
  video?: string;
  label: string;
  at: number; // lands on this frame
  back?: number; // frame the next card lands (card steps back)
  w: number;
  h: number;
  x: number; // centre x
  y: number; // top
  from?: 'bottom' | 'right' | 'left';
  tilt?: number; // resting tilt, deg
}> = ({src, video, label, at, back, w, h, x, y, from = 'bottom', tilt = -2}) => {
  const C = useKitTheme();
  const frame = useCurrentFrame();
  const p = ramp(frame, at - 10, 12, 0, 1, ease.out);
  if (p <= 0) return null;
  const b = back === undefined ? 0 : ramp(frame, back - 10, 12, 0, 1, ease.out);
  const dx = from === 'right' ? 900 : from === 'left' ? -900 : 0;
  const dy = from === 'bottom' ? 1100 : 120;
  const rot = tilt + (1 - p) * (from === 'left' ? -14 : 14) - b * 5;
  const s = (0.88 + p * 0.12) * (1 - b * 0.1);
  const drift = ramp(frame, at - 10, 90, 1.14, 1.02, ease.outQuart);
  const media = {width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${drift})`} as const;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        height: h,
        transform: `translate(${(1 - p) * dx - b * 40}px, ${(1 - p) * dy - b * 70}px) rotate(${rot}deg) scale(${s})`,
        transformOrigin: '50% 60%',
        borderRadius: 30,
        overflow: 'hidden',
        border: `1.5px solid ${C.hair}`,
        boxShadow: `0 ${40 - b * 10}px ${80 - b * 20}px ${C.shadow}, 0 0 0 1px oklch(1 0 0 / 0.04) inset`,
        filter: b > 0 ? `brightness(${1 - b * 0.42}) blur(${b * 1.5}px)` : undefined,
        opacity: Math.min(1, p * 1.6),
      }}
    >
      {video ? (
        <Sequence from={at - 12} layout="none">
          <OffthreadVideo src={asset(video)} muted style={media} />
        </Sequence>
      ) : src ? (
        <Img src={asset(src)} style={media} />
      ) : null}
      {/* soft top sheen so the card reads as a physical print */}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(160deg, oklch(1 0 0 / 0.12) 0%, transparent 28%, transparent 70%, ${alpha(C.deep, 0.45)} 100%)`}} />
      <div
        style={{
          position: 'absolute',
          left: 24,
          bottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          borderRadius: 999,
          background: C.panel,
          border: `1px solid ${C.hair}`,
          opacity: ramp(frame, at, 8),
        }}
      >
        <div style={{width: 8, height: 8, borderRadius: 999, background: C.accent, boxShadow: `0 0 10px ${C.accent}`}} />
        <div style={{fontFamily: C.fontLabel, fontWeight: 500, textTransform: 'uppercase', fontSize: 18, color: C.ivory}}>{label}</div>
      </div>
    </div>
  );
};
