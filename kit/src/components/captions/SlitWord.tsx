import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';

export interface SlitWordProps {
  text: string;
  startFrame: number;
  endFrame?: number;
  hero?: boolean;
  highlight?: boolean;
  accentColor?: string;
  textColor?: string;
  fontSize?: number;
  underlineHeight?: number;
  durationFrames?: number;
  style?: React.CSSProperties;
}

export const SlitWord: React.FC<SlitWordProps> = ({
  text,
  startFrame,
  endFrame,
  hero = false,
  highlight = false,
  accentColor = '#DFB25A',
  textColor = '#FAF8F5',
  fontSize = 52,
  underlineHeight = 3,
  durationFrames = 14,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame - 2) return null;

  // Masked reveal: slides up smoothly with expo curve
  const reveal = ramp(frame, startFrame, durationFrames, 75, 0, ease.expoOut);
  const opacity = ramp(frame, startFrame, Math.round(durationFrames * 0.7), 0, 1, ease.expoOut);
  // Subtle scale spring
  const scale = ramp(frame, startFrame, durationFrames + 4, 0.92, 1, ease.expoOut);
  const isLive = endFrame ? frame >= startFrame && frame < endFrame : frame >= startFrame;

  // Animated underline draw
  const lineP = highlight ? ramp(frame, startFrame + 3, 16, 0, 1, ease.expoOut) : 0;

  const color = highlight || (hero && isLive) ? accentColor : textColor;

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        verticalAlign: 'top',
        lineHeight: 1.1,
        paddingBottom: highlight ? underlineHeight + 4 : 0,
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: `translateY(${reveal}%) scale(${scale})`,
          opacity,
          color,
          fontSize,
          transformOrigin: '50% 100%',
        }}
      >
        {text}
      </span>
      {highlight && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: underlineHeight,
            backgroundColor: accentColor,
            transform: `scaleX(${lineP})`,
            transformOrigin: '0 50%',
            borderRadius: 2,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
      )}
    </span>
  );
};
