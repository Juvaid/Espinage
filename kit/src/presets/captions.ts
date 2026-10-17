import {CaptionPresetConfig} from '../types/captions';

// ─── 1. LUXURY REAL ESTATE & BRAND PRESETS ──────────────────────────────

export const DHUNNA_LUXURY_GOLD: CaptionPresetConfig = {
  id: 'dhunna_luxury_gold',
  name: 'Dhunna Luxury Gold',
  description: 'Cinematic real-estate aesthetic: champagne gold metal bevel, sheen sweep, dark warm ground, and soft glow.',
  animation: 'bevel_settle',
  fontFamily: "'Outfit', 'Montserrat', sans-serif",
  fontSize: 48,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  textColor: '#FAF8F5',
  activeTextColor: '#DFB25A',
  textShadow: '0 2px 18px oklch(0.06 0.006 70 / 0.75), 0 1px 3px oklch(0.06 0.006 70 / 0.6)',
  leadFrames: 1,
  staggerFrames: 0.5,
  animationDuration: 8,
  heroHighlight: {
    enabled: true,
    style: 'metal_bevel',
    bevelTone: 'gold',
    bevelSize: 'md',
    sheenSweep: true,
    glow: true,
    accentColor: '#DFB25A',
  },
  background: {
    enabled: true,
    color: '#0C0A09',
    opacity: 0.85,
    padding: '16px 28px',
    borderRadius: 20,
    border: '1px solid oklch(0.3 0.02 60 / 0.35)',
    backdropBlur: 8,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 74,
    align: 'center',
    maxWidth: 960,
    lineGap: '0.3em',
  },
};

export const CROWN_CREST_SILVER: CaptionPresetConfig = {
  id: 'crown_crest_silver',
  name: 'Crown Crest Silver Chrome',
  description: 'High-end architectural chrome and ivory metallic sheen with soft halo.',
  animation: 'bevel_settle',
  fontFamily: "'Geist', 'Inter', sans-serif",
  fontSize: 46,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  textColor: '#F2ECE2',
  activeTextColor: '#FFFFFF',
  textShadow: '0 2px 20px rgba(0, 0, 0, 0.85)',
  leadFrames: 1,
  staggerFrames: 0.4,
  animationDuration: 7,
  heroHighlight: {
    enabled: true,
    style: 'metal_bevel',
    bevelTone: 'chrome',
    bevelSize: 'md',
    sheenSweep: true,
    glow: true,
    accentColor: '#FFFFFF',
  },
  background: {
    enabled: true,
    color: 'oklch(0.12 0.01 45 / 0.88)',
    opacity: 0.85,
    padding: '14px 26px',
    borderRadius: 18,
    border: '1px solid oklch(1 0 0 / 0.12)',
    backdropBlur: 12,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 75,
    align: 'center',
    maxWidth: 940,
    lineGap: '0.28em',
  },
};

export const ARCHITECTURAL_SLIT: CaptionPresetConfig = {
  id: 'architectural_slit',
  name: 'Architectural Slit Reveal',
  description: 'Masked slit reveal with exponential deceleration, subtle scale spring, and champagne underline.',
  animation: 'slit_reveal',
  fontFamily: "'Geist', 'Outfit', sans-serif",
  fontSize: 52,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  textColor: '#E5DFD7',
  activeTextColor: '#DFB25A',
  textShadow: '0 3px 14px rgba(0, 0, 0, 0.7)',
  leadFrames: 1,
  animationDuration: 14,
  heroHighlight: {
    enabled: true,
    style: 'underline',
    accentColor: '#DFB25A',
    underlineHeight: 4,
  },
  background: {
    enabled: false,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 72,
    align: 'center',
    maxWidth: 980,
    lineGap: '0.35em',
  },
};

export const MINIMAL_EDITORIAL: CaptionPresetConfig = {
  id: 'minimal_editorial',
  name: 'Minimal Editorial Serif',
  description: 'Sophisticated luxury typography: letter rise with soft fade and ivory accents.',
  animation: 'letter_rise',
  fontFamily: "'Playfair Display', serif",
  fontSize: 44,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'none',
  textColor: '#EDE8DF',
  activeTextColor: '#FAF8F5',
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
  leadFrames: 2,
  staggerFrames: 0.6,
  animationDuration: 10,
  heroHighlight: {
    enabled: true,
    style: 'underline',
    accentColor: '#C4A470',
    underlineHeight: 2,
  },
  background: {
    enabled: true,
    color: '#080808',
    opacity: 0.7,
    padding: '12px 24px',
    borderRadius: 8,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 76,
    align: 'center',
    maxWidth: 900,
    lineGap: '0.4em',
  },
};

// ─── 2. VIRAL CREATOR & ENERGY PRESETS (from autocaption) ───────────────
// EXPERIMENTAL: generic social-caption styles, never used in a delivered brand film. Not for Dhunna or Crown Crest
// work (brand films use Heading / Bevel / TypeSpace from src/pro). Named after the look they echo, not endorsed.

export const HORMOZI_VIRAL: CaptionPresetConfig = {
  id: 'hormozi_viral',
  name: 'Hormozi Viral Punch',
  description: 'Electric yellow pop punchline with heavy outline and drop shadow.',
  animation: 'pop_punch',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 54,
  fontWeight: 900,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  textColor: '#FFFFFF',
  activeTextColor: '#FFE600',
  textShadow: '0 4px 0 #000000, 0 8px 24px rgba(0, 0, 0, 0.9)',
  leadFrames: 1,
  animationDuration: 5,
  heroHighlight: {
    enabled: true,
    style: 'neon_glow',
    accentColor: '#FFE600',
  },
  background: {
    enabled: false,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 72,
    align: 'center',
    maxWidth: 920,
    lineGap: '0.25em',
  },
};

export const MRBEAST_HYPE: CaptionPresetConfig = {
  id: 'mrbeast_hype',
  name: 'MrBeast High Energy',
  description: 'Ultra bold compressed impact with electric blue/yellow accents.',
  animation: 'pop_punch',
  fontFamily: "'Anton', 'Impact', sans-serif",
  fontSize: 60,
  fontWeight: 900,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  textColor: '#FFFFFF',
  activeTextColor: '#00E5FF',
  textShadow: '0 6px 0 #000000, 0 10px 30px rgba(0,0,0,0.85)',
  leadFrames: 1,
  animationDuration: 4,
  heroHighlight: {
    enabled: true,
    style: 'neon_glow',
    accentColor: '#00E5FF',
  },
  background: {
    enabled: false,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 70,
    align: 'center',
    maxWidth: 940,
    lineGap: '0.2em',
  },
};

export const ALI_ABDAAL_CLEAN: CaptionPresetConfig = {
  id: 'ali_abdaal_clean',
  name: 'Ali Abdaal Clean Highlighter',
  description: 'Clean humanist sans with pastel yellow highlighter pill on active word.',
  animation: 'letter_rise',
  fontFamily: "'Inter', sans-serif",
  fontSize: 42,
  fontWeight: 600,
  letterSpacing: '0.01em',
  textTransform: 'none',
  textColor: '#F8FAFC',
  activeTextColor: '#FEF08A',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  leadFrames: 1,
  staggerFrames: 0.35,
  animationDuration: 7,
  heroHighlight: {
    enabled: true,
    style: 'box_pill',
    accentColor: 'rgba(254, 240, 138, 0.25)',
  },
  background: {
    enabled: true,
    color: 'rgba(15, 23, 42, 0.75)',
    opacity: 0.85,
    padding: '12px 22px',
    borderRadius: 12,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 75,
    align: 'center',
    maxWidth: 880,
    lineGap: '0.3em',
  },
};

export const CYBERPUNK_NEON: CaptionPresetConfig = {
  id: 'cyberpunk_neon',
  name: 'Cyberpunk Neon Pulse',
  description: 'High-contrast cyan and neon pink glows with tech monospace feel.',
  animation: 'pop_punch',
  fontFamily: "'Geist Mono', 'Courier New', monospace",
  fontSize: 48,
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  textColor: '#E0F2FE',
  activeTextColor: '#38BDF8',
  textShadow: '0 0 16px rgba(56, 189, 248, 0.8), 0 2px 4px #000',
  leadFrames: 1,
  animationDuration: 5,
  heroHighlight: {
    enabled: true,
    style: 'neon_glow',
    accentColor: '#F43F5E',
  },
  background: {
    enabled: true,
    color: 'rgba(3, 7, 18, 0.85)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    padding: '12px 24px',
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 72,
    align: 'center',
    maxWidth: 900,
    lineGap: '0.3em',
  },
};

export const APPLE_KEYNOTE: CaptionPresetConfig = {
  id: 'apple_keynote',
  name: 'Apple Keynote Elegance',
  description: 'Silky smooth SF Pro-styled slide-up typography with gentle falloff.',
  animation: 'slit_reveal',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  fontSize: 46,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  textTransform: 'none',
  textColor: '#E2E8F0',
  activeTextColor: '#FFFFFF',
  textShadow: '0 2px 14px rgba(0, 0, 0, 0.4)',
  leadFrames: 1,
  animationDuration: 12,
  heroHighlight: {
    enabled: true,
    style: 'underline',
    accentColor: '#38BDF8',
    underlineHeight: 2,
  },
  background: {
    enabled: false,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 76,
    align: 'center',
    maxWidth: 900,
    lineGap: '0.3em',
  },
};

export const VIRAL_KINETIC_POP: CaptionPresetConfig = {
  id: 'viral_kinetic_pop',
  name: 'Viral Kinetic Pop',
  description: 'High-energy 1-frame punchline caption with electric gold punch and calibrated shadow.',
  animation: 'pop_punch',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 56,
  fontWeight: 900,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  textColor: '#FFFFFF',
  activeTextColor: '#FFD700',
  textShadow: '0 4px 0 #000000, 0 8px 24px rgba(0, 0, 0, 0.9)',
  leadFrames: 1,
  animationDuration: 6,
  heroHighlight: {
    enabled: true,
    style: 'neon_glow',
    accentColor: '#FFD700',
  },
  background: {
    enabled: false,
  },
  layout: {
    positionY: 'bottom',
    verticalPercent: 70,
    align: 'center',
    maxWidth: 920,
    lineGap: '0.25em',
  },
};

export const CAPTION_PRESETS: Record<string, CaptionPresetConfig> = {
  dhunna_luxury_gold: DHUNNA_LUXURY_GOLD,
  crown_crest_silver: CROWN_CREST_SILVER,
  architectural_slit: ARCHITECTURAL_SLIT,
  minimal_editorial: MINIMAL_EDITORIAL,
  hormozi_viral: HORMOZI_VIRAL,
  mrbeast_hype: MRBEAST_HYPE,
  ali_abdaal_clean: ALI_ABDAAL_CLEAN,
  cyberpunk_neon: CYBERPUNK_NEON,
  apple_keynote: APPLE_KEYNOTE,
  viral_kinetic_pop: VIRAL_KINETIC_POP,
};

export const getCaptionPreset = (presetOrId?: string | CaptionPresetConfig): CaptionPresetConfig => {
  if (!presetOrId) return DHUNNA_LUXURY_GOLD;
  if (typeof presetOrId === 'string') {
    return CAPTION_PRESETS[presetOrId] || DHUNNA_LUXURY_GOLD;
  }
  return presetOrId;
};
