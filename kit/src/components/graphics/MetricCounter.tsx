import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {MetricCounterConfig} from '../../types/graphics';

export const MetricCounter: React.FC<{
  config: MetricCounterConfig;
  style?: React.CSSProperties;
}> = ({config, style}) => {
  const frame = useCurrentFrame();
  const {
    value,
    decimals = 0,
    prefix = '',
    suffix = '',
    label,
    startFrame,
    durationFrames = 24,
    accentColor = '#DFB25A',
    textColor = '#FAF8F5',
    position = {x: 96, y: 320},
    kind = 'standard',
  } = config;

  if (frame < startFrame) return null;

  const p = ramp(frame, startFrame, durationFrames, 0, 1, ease.outQuart);
  const currentNum = (value * p).toFixed(decimals);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        color: textColor,
        zIndex: 40,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-2px',
        }}
      >
        {prefix && <span style={{fontSize: 56, color: accentColor}}>{prefix}</span>}
        <span
          style={{
            fontSize: 160,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          }}
        >
          {currentNum}
        </span>
        {suffix && (
          <span style={{fontSize: 64, color: accentColor, letterSpacing: '0.02em'}}>
            {suffix}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 400,
          marginTop: 18,
          color: 'rgba(250, 248, 245, 0.75)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      {/* Optional Architectural Dimension Line Graphic */}
      {kind === 'frontage' && (
        <svg
          width="850"
          height="44"
          viewBox="0 0 850 44"
          style={{marginTop: 20, width: 850}}
        >
          <path
            d="M 2 12 V 36 M 2 24 H 844 M 844 12 V 36"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
          />
          {Array.from({length: 11}, (_, i) => (
            <path
              key={i}
              d={`M ${2 + i * 84.2} 20 v8`}
              stroke={accentColor}
              opacity={p}
            />
          ))}
        </svg>
      )}
    </div>
  );
};
