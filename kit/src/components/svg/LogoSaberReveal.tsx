import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface LogoSaberRevealProps {
  startFrame: number;
  width?: number;
  height?: number;
  imageUrl?: string;
  fallbackText?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

/** Saber Laser Edge Tracer, Extrusion & Metallic Sheen Reveal for Brand Logos */
export const LogoSaberReveal: React.FC<LogoSaberRevealProps> = ({
  startFrame,
  width = 640,
  height = 180,
  imageUrl,
  fallbackText = 'DHUNNA INFRA',
  accentColor = '#DFB25A',
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const saber = ramp(frame, startFrame, 16, -6, 106, ease.inOut); // % across
  const fill = ramp(frame, startFrame + 3, 16, 0, 100, ease.inOut);
  const sheen = ramp(frame, startFrame + 22, 18, -20, 120, ease.inOut);
  const drift = (frame - startFrame) * 0.15;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transform: `scale(${1 + drift * 0.0006})`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* 1. Underlying Extrusion Shadow Layers */}
      {[4, 3, 2, 1].map((d) => (
        <div
          key={d}
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${d}px)`,
            clipPath: `inset(-5% ${100 - fill}% -5% 0)`,
            filter: 'brightness(0.4)',
            opacity: 0.8,
          }}
        >
          {imageUrl ? (
            <Img src={imageUrl} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: '0.15em',
                color: '#3c2a0f',
              }}
            >
              {fallbackText}
            </div>
          )}
        </div>
      ))}

      {/* 2. Main Metallic Face Fill */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(-5% ${100 - fill}% -5% 0)`,
        }}
      >
        {imageUrl ? (
          <Img src={imageUrl} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: '0.15em',
              background:
                'linear-gradient(180deg, #fbe7b0 0%, #e7bd66 18%, #b8862f 44%, #f1d08a 58%, #d7b98a 66%, #c9ad82 82%, #9c8360 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 2px 10px rgba(0, 0, 0, 0.7))`,
            }}
          >
            {fallbackText}
          </div>
        )}
      </div>

      {/* 3. Laser Saber Cutting Edge */}
      {saber > -4 && saber < 104 && (
        <div
          style={{
            position: 'absolute',
            left: `${saber}%`,
            top: 0,
            bottom: 0,
            width: 4,
            background: '#ffffff',
            boxShadow: `0 0 14px 4px ${accentColor}, 0 0 28px 8px #ffffff`,
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* 4. Crossing Metallic Sheen Pass */}
      {sheen > -18 && sheen < 118 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(108deg, transparent ${sheen - 16}%, rgba(255,255,255,0.7) ${sheen}%, transparent ${sheen + 16}%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
