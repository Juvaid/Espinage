import {ReelTheme} from '../types/presets';

export const DHUNNA_THEME: ReelTheme = {
  id: 'dhunna',
  name: 'Dhunna Infra Gold (59-D look)',
  ground: 'oklch(0.12 0.01 45)',
  accent: '#DFB25A',
  accentGlow: 'oklch(0.8 0.125 80 / 0.45)',
  ivory: '#F2ECE2',
  muted: '#9C9281',
  hairline: 'oklch(0.32 0.025 60 / 0.45)',
  fontFamilyHead: "'Geist', sans-serif",
  fontFamilyBody: "'Geist', sans-serif",
};

// Dhunna 54D look (Oct 2026 films): navy ground, ice-blue accent, steel metal
export const DHUNNA_54D_THEME: ReelTheme = {
  id: 'dhunna_54d',
  name: 'Dhunna 54D Navy Steel',
  ground: 'oklch(0.14 0.03 252)',
  accent: '#a9d4ff',
  accentGlow: 'oklch(0.86 0.07 235 / 0.45)',
  ivory: '#F6F4EE',
  muted: '#9AA8BA',
  hairline: 'oklch(0.86 0.07 235 / 0.35)',
  fontFamilyHead: "'Geist', sans-serif",
  fontFamilyBody: "'Geist', sans-serif",
};

export const CROWN_CREST_THEME: ReelTheme = {
  id: 'crown_crest',
  name: 'Crown Crest Royal',
  ground: 'oklch(0.10 0.008 40)',
  accent: '#E2C799',
  accentGlow: 'oklch(0.85 0.11 75 / 0.4)',
  ivory: '#FAF8F5',
  muted: '#A39E93',
  hairline: 'oklch(1 0 0 / 0.12)',
  fontFamilyHead: "'Geist', sans-serif",
  fontFamilyBody: "'Geist', sans-serif",
};

export const VIRAL_NEON_THEME: ReelTheme = {
  id: 'viral_neon',
  name: 'Viral High Energy',
  ground: '#020617',
  accent: '#FFD700',
  accentGlow: 'rgba(255, 215, 0, 0.6)',
  ivory: '#FFFFFF',
  muted: '#94A3B8',
  hairline: 'rgba(255, 255, 255, 0.15)',
  fontFamilyHead: "'Montserrat', sans-serif",
  fontFamilyBody: "'Montserrat', sans-serif",
};

export const REEL_THEMES: Record<string, ReelTheme> = {
  dhunna_54d: DHUNNA_54D_THEME,
  dhunna: DHUNNA_THEME,
  crown_crest: CROWN_CREST_THEME,
  viral_neon: VIRAL_NEON_THEME,
};

export const getReelTheme = (themeOrId?: string | ReelTheme): ReelTheme => {
  if (!themeOrId) return DHUNNA_THEME;
  if (typeof themeOrId === 'string') {
    return REEL_THEMES[themeOrId] || DHUNNA_THEME;
  }
  return themeOrId;
};
