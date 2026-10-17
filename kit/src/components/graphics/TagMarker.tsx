import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {TagMarkerConfig} from '../../types/graphics';

export const TagMarker: React.FC<{
  config: TagMarkerConfig;
  style?: React.CSSProperties;
}> = ({config, style}) => {
  const frame = useCurrentFrame();
  const {
    text,
    startFrame,
    accentColor = '#DFB25A',
    textColor = '#DFB25A',
    lineWidth = 56,
    position,
  } = config;

  const p = ramp(frame, startFrame, 10);
  const line = ramp(frame, startFrame + 2, 14, 0, 1, ease.outQuart);

  return (
    <div
      style={{
        position: position ? 'absolute' : 'relative',
        left: position?.x,
        top: position?.y,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: p,
        zIndex: 45,
        ...style,
      }}
    >
      <div
        style={{
          width: lineWidth * line,
          height: 2,
          background: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: textColor,
          transform: `translateX(${(1 - p) * -16}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};
