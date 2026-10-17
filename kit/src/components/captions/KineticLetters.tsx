import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {TEXT_SHADOW_DEEP, standardGlow} from '../../lib/color';
import {Bevel, BevelProps} from './Bevel';

export interface RiseLettersProps {
  text: string;
  startFrame: number;
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const RiseLetters: React.FC<RiseLettersProps> = ({
  text,
  startFrame,
  stagger = 0.45,
  duration = 9,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-flex',
        overflow: 'hidden',
        paddingBottom: '0.08em',
        marginBottom: '-0.08em',
        ...style,
      }}
    >
      {[...text].map((ch, i) => {
        const p = ramp(frame, startFrame + i * stagger, duration, 0, 1, ease.out);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - p) * 108}%)`,
              whiteSpace: 'pre',
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export interface SettleWordProps {
  text: string;
  startFrame: number;
  bevel?: {
    tone: BevelProps['tone'];
    size: BevelProps['size'];
    sheen?: number;
    glow?: number;
  };
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const SettleWord: React.FC<SettleWordProps> = ({
  text,
  startFrame,
  bevel,
  stagger = 0.5,
  duration = 8,
  style,
}) => {
  const frame = useCurrentFrame();

  const renderLetters = () => (
    <span style={{display: 'inline-flex', whiteSpace: 'pre'}}>
      {[...text].map((ch, i) => {
        const p = ramp(frame, startFrame + i * stagger, duration, 0, 1, ease.out);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: Math.min(1, p * 1.8),
              transform: `translateY(${(1 - p) * 0.25}em) scale(${1.18 - p * 0.18})`,
              filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );

  return (
    <span
      style={{
        display: 'inline-block',
        textShadow: bevel ? undefined : TEXT_SHADOW_DEEP,
        ...style,
      }}
    >
      {bevel ? (
        <Bevel tone={bevel.tone} size={bevel.size} sheen={bevel.sheen} glow={bevel.glow}>
          {renderLetters}
        </Bevel>
      ) : (
        renderLetters()
      )}
    </span>
  );
};

export interface PopWordProps {
  text: string;
  startFrame: number;
  endFrame?: number;
  accentColor?: string;
  isHero?: boolean;
  duration?: number;
  style?: React.CSSProperties;
}

export const PopWord: React.FC<PopWordProps> = ({
  text,
  startFrame,
  endFrame,
  accentColor = '#FFD700',
  isHero = false,
  duration = 6,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const p = ramp(frame, startFrame, duration, 0, 1, ease.out);
  // Pop overshoot: 1.25 -> 1.0
  const scale = 1 + (1 - p) * 0.25;
  const isSpeaking = endFrame ? frame >= startFrame && frame < endFrame : frame >= startFrame;

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        color: isHero && isSpeaking ? accentColor : undefined,
        textShadow:
          isHero && isSpeaking
            ? `0 4px 0 #000, ${standardGlow(accentColor, 18, 0.6)}`
            : undefined,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
