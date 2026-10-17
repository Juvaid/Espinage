import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, ramp} from '../../lib/anim';
import {TEXT_SHADOW_DEEP, standardGlow} from '../../lib/color';
import {getCaptionPreset} from '../../presets/captions';
import {CaptionPresetConfig, TimedWord} from '../../types/captions';
import {Bevel, BevelDefs} from './Bevel';
import {PopWord, RiseLetters, SettleWord} from './KineticLetters';
import {SlitWord} from './SlitWord';

export interface KineticCaptionProps {
  words: TimedWord[];
  preset?: string | CaptionPresetConfig;
  tweak?: Partial<CaptionPresetConfig>;
  style?: React.CSSProperties;
}

export const KineticCaption: React.FC<KineticCaptionProps> = ({
  words,
  preset = 'dhunna_luxury_gold',
  tweak,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Resolve config with overrides
  const baseConfig = getCaptionPreset(preset);
  const config: CaptionPresetConfig = {
    ...baseConfig,
    ...tweak,
    heroHighlight: {
      ...baseConfig.heroHighlight,
      ...tweak?.heroHighlight,
    },
    background: {
      ...baseConfig.background,
      ...tweak?.background,
    },
    layout: {
      ...baseConfig.layout,
      ...tweak?.layout,
    },
  };

  // Convert words with seconds to frames if needed
  const normalizedWords = words.map((w, index) => {
    const s =
      w.startFrame !== undefined
        ? w.startFrame
        : w.startTime !== undefined
        ? Math.round(w.startTime * fps)
        : index * 10;
    const e =
      w.endFrame !== undefined
        ? w.endFrame
        : w.endTime !== undefined
        ? Math.round(w.endTime * fps)
        : s + 10;

    return {
      ...w,
      startFrame: s - config.leadFrames,
      endFrame: e,
    };
  });

  const {positionY, verticalPercent = 74, align, maxWidth = 960, lineGap = '0.3em'} =
    config.layout;

  // Calculate vertical placement
  const topPosition =
    positionY === 'top'
      ? '16%'
      : positionY === 'middle'
      ? '50%'
      : `${verticalPercent}%`;

  const needsBevelDefs =
    config.animation === 'bevel_settle' ||
    (config.heroHighlight.enabled && config.heroHighlight.style === 'metal_bevel');

  return (
    <div
      style={{
        position: 'absolute',
        top: topPosition,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        pointerEvents: 'none',
        zIndex: 50,
        padding: '0 40px',
        ...style,
      }}
    >
      {needsBevelDefs && <BevelDefs />}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          columnGap: '0.28em',
          rowGap: lineGap,
          maxWidth,
          fontFamily: config.fontFamily,
          fontSize: config.fontSize,
          fontWeight: config.fontWeight,
          letterSpacing: config.letterSpacing,
          textTransform: config.textTransform,
          color: config.textColor,
          textShadow:
            typeof config.textShadow === 'string'
              ? config.textShadow
              : config.textShadow
              ? TEXT_SHADOW_DEEP
              : undefined,
          backgroundColor:
            config.background.enabled && config.background.color
              ? config.background.color
              : undefined,
          opacity: config.background.enabled ? config.background.opacity ?? 1 : undefined,
          padding: config.background.enabled ? config.background.padding : undefined,
          borderRadius: config.background.enabled ? config.background.borderRadius : undefined,
          border: config.background.enabled ? config.background.border : undefined,
          backdropFilter:
            config.background.enabled && config.background.backdropBlur
              ? `blur(${config.background.backdropBlur}px)`
              : undefined,
        }}
      >
        {normalizedWords.map((w, i) => {
          const s = w.startFrame!;
          const e = w.endFrame!;
          const isSpeaking = frame >= s && frame < e;
          const isHero = Boolean(w.isHero);

          // Word entrance progress
          const p = ramp(frame, s, config.animationDuration || 8);
          if (p <= 0) return null;

          // 1. Slit Reveal Animation Mode
          if (config.animation === 'slit_reveal') {
            return (
              <SlitWord
                key={i}
                text={w.word}
                startFrame={s}
                endFrame={e}
                hero={isHero}
                highlight={isHero && isSpeaking}
                accentColor={config.heroHighlight.accentColor || config.activeTextColor || '#DFB25A'}
                textColor={config.textColor}
                fontSize={config.fontSize}
                underlineHeight={config.heroHighlight.underlineHeight || 3}
                durationFrames={config.animationDuration || 14}
              />
            );
          }

          // 2. Bevel Settle Animation Mode
          if (config.animation === 'bevel_settle') {
            const sheen =
              config.heroHighlight.sheenSweep && isHero
                ? ramp(frame, s + 4, 14, -20, 120, ease.inOut)
                : -99;

            const tone =
              w.heroHighlightStyle === 'metal_bevel'
                ? 'gold'
                : config.heroHighlight.bevelTone || 'gold';

            if (isHero) {
              return (
                <span key={i} style={{display: 'inline-block', margin: '0 0.08em'}}>
                  <SettleWord
                    text={w.word}
                    startFrame={s}
                    duration={config.animationDuration || 8}
                    bevel={{
                      tone,
                      size: config.heroHighlight.bevelSize || 'md',
                      sheen,
                      glow: config.heroHighlight.glow ? 1 : 0,
                    }}
                  />
                </span>
              );
            }

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: Math.min(1, p * 1.8),
                  transform: `translateY(${(1 - p) * 0.25}em) scale(${1.18 - p * 0.18})`,
                  color: isSpeaking && config.activeTextColor ? config.activeTextColor : config.textColor,
                  textShadow:
                    isSpeaking && config.activeTextColor
                      ? standardGlow(config.activeTextColor, 16, 0.4)
                      : undefined,
                }}
              >
                {w.word}
              </span>
            );
          }

          // 3. Letter Rise Animation Mode
          if (config.animation === 'letter_rise') {
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: isSpeaking && config.activeTextColor ? config.activeTextColor : config.textColor,
                }}
              >
                <RiseLetters
                  text={w.word}
                  startFrame={s}
                  duration={config.animationDuration || 9}
                  stagger={config.staggerFrames || 0.45}
                />
              </span>
            );
          }

          // 4. Pop Punch Animation Mode
          if (config.animation === 'pop_punch') {
            return (
              <PopWord
                key={i}
                text={w.word}
                startFrame={s}
                endFrame={e}
                isHero={isHero}
                accentColor={config.heroHighlight.accentColor || config.activeTextColor || '#FFD700'}
                duration={config.animationDuration || 6}
              />
            );
          }

          // 5. Default Subtle Fade / Slide
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: p,
                transform: `translateY(${(1 - p) * 0.35}em)`,
                color: isSpeaking && config.activeTextColor ? config.activeTextColor : config.textColor,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
