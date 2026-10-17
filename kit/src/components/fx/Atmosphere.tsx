import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AtmosphereConfig} from '../../types/graphics';

export const Atmosphere: React.FC<{
  config?: AtmosphereConfig;
}> = ({config}) => {
  const frame = useCurrentFrame();
  const {
    grain = true,
    dust = true,
    lightLeak = true,
    vignette = true,
    opacity = 0.65,
    warmth = 'warm',
  } = config || {};

  // Slow ambient drift for light leaks
  const leakX = 50 + Math.sin(frame / 45) * 15;
  const leakY = 20 + Math.cos(frame / 60) * 10;
  const leakColor =
    warmth === 'warm'
      ? 'rgba(255, 190, 100, 0.12)'
      : warmth === 'cool'
      ? 'rgba(100, 180, 255, 0.10)'
      : 'rgba(255, 255, 255, 0.08)';

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 10, opacity}}>
      {/* 1. Vignette: Soft darkened corners */}
      {vignette && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%)',
          }}
        />
      )}

      {/* 2. Light Leak Drift */}
      {lightLeak && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${leakX}% ${leakY}%, ${leakColor} 0%, transparent 60%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 3. Floating Dust Particles */}
      {dust && (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 12}, (_, i) => {
            const seed = (i + 1) * 73;
            const x = (seed % 100) + Math.sin((frame + seed) / 35) * 4;
            const y = ((seed * 3) % 100) - ((frame * 0.25 + seed) % 100);
            const r = 1 + (i % 3);
            const op = 0.2 + (Math.sin((frame + seed) / 20) + 1) * 0.15;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${(y + 100) % 100}%`}
                r={r}
                fill="#FAF8F5"
                opacity={op}
              />
            );
          })}
        </svg>
      )}

      {/* 4. Film Grain SVG Filter */}
      {grain && (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.045}}>
          <filter id="reel-film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves={3}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#reel-film-grain)" />
        </svg>
      )}
    </AbsoluteFill>
  );
};
