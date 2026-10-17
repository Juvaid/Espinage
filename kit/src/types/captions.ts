export type BevelTone = 'gold' | 'ivory' | 'crimson' | 'chrome' | 'emerald';
export type BevelSize = 'lg' | 'md' | 'sm';

export type CaptionAnimationType =
  | 'bevel_settle'
  | 'slit_reveal'
  | 'letter_rise'
  | 'pop_punch'
  | 'wipe_clean'
  | 'subtle_fade';

/** Universal word representation (compatible with both timestamp seconds and frame numbers) */
export interface TimedWord {
  id?: number;
  word: string;
  startFrame?: number;
  endFrame?: number;
  startTime?: number; // in seconds
  endTime?: number;   // in seconds
  isHero?: boolean;
  heroHighlightStyle?: 'metal_bevel' | 'underline' | 'neon_glow' | 'box_pill';
  customColor?: string;
}

export interface HeroHighlightConfig {
  enabled: boolean;
  style: 'metal_bevel' | 'underline' | 'neon_glow' | 'box_pill';
  bevelTone?: BevelTone;
  bevelSize?: BevelSize;
  sheenSweep?: boolean;
  glow?: boolean;
  accentColor?: string;
  underlineHeight?: number;
}

export interface CaptionBackgroundConfig {
  enabled: boolean;
  color?: string;
  opacity?: number;
  padding?: string | number;
  borderRadius?: number;
  border?: string;
  backdropBlur?: number;
}

export interface CaptionLayoutConfig {
  positionY: 'top' | 'middle' | 'bottom';
  verticalPercent?: number; // e.g. 70 for 70% from top
  align: 'left' | 'center' | 'right';
  maxWidth?: number;
  lineGap?: string | number;
}

/** Tweakable preset configuration for captions */
export interface CaptionPresetConfig {
  id: string;
  name: string;
  description?: string;
  animation: CaptionAnimationType;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number | string;
  textTransform: 'uppercase' | 'none' | 'capitalize';
  textColor: string;
  activeTextColor?: string;
  textShadow?: boolean | string;
  leadFrames: number;      // Appear N frames before spoken beat (default 1)
  staggerFrames?: number;  // Delay per letter or word
  animationDuration?: number; // Frames for entrance
  heroHighlight: HeroHighlightConfig;
  background: CaptionBackgroundConfig;
  layout: CaptionLayoutConfig;
}
