import React, {createContext, useContext} from 'react';

// One theme per brand look, read by every production component (src/pro) through useKitTheme(). Wrap a film in
// <KitThemeProvider theme="dhunna_54d"> once. 3D scenes (TypeSpace) cannot read context inside the canvas, so they
// take the theme as a prop from the component that owns the canvas.
export type Metal = 'steel' | 'gold' | 'champagne' | 'ivory' | 'crimson';
export type KitTheme = {
  id: string;
  name: string;
  ground: string; // the backdrop
  deep: string; // darkest ground, card backs
  lift: string; // the soft light at the top of the ground
  ivory: string; // primary text
  dim: string; // secondary text
  accent: string; // the one accent (spoken word, rules, rails)
  hair: string; // hairline borders
  panel: string; // solid reading surfaces (chips, caption panel)
  shadow: string; // drop shadows
  glow: string; // soft glow colour behind hero type and cards
  metal: Metal; // bevel tone for hero words
  fontHead: string; // headings (light 300 / display 640)
  fontLabel: string; // tiny tracked labels
  fontBrand: string; // brand names only
  logo: string; // public path of the brand mark (white or metal on transparent)
  logoRatio: number; // logo height / width
  logoMode: 'mask' | 'image'; // mask = white master repainted in metal; image = full-colour mark revealed as is
  // 3D type (TypeSpace): face ramp top→bottom, environment, satin words, dust and glow
  type3d: {ramp: [number, string][]; side: string; env: [string, string, string, string, string]; box: string; satin: string; dust: string; glow: string; bg: string; light: string};
};

export const KIT_THEMES: Record<string, KitTheme> = {
  dhunna_54d: {
    id: 'dhunna_54d',
    name: 'Dhunna 54D · navy steel',
    ground: 'oklch(0.17 0.03 250)', deep: 'oklch(0.12 0.03 252)', lift: 'oklch(0.26 0.045 248)',
    ivory: 'oklch(0.97 0.008 90)', dim: 'oklch(0.8 0.015 240)', accent: 'oklch(0.86 0.07 235)', hair: 'oklch(0.86 0.07 235 / 0.35)',
    panel: 'oklch(0.14 0.03 250 / 0.88)', shadow: 'oklch(0.06 0.02 250 / 0.7)', glow: 'oklch(0.62 0.11 240)',
    metal: 'steel', fontHead: 'Geist', fontLabel: 'Archivo', fontBrand: 'Didot, "Bodoni 72", serif',
    logo: 'brand/dhunna-infra-wordmark-white.png', logoRatio: 278 / 968, logoMode: 'mask',
    type3d: {
      ramp: [[0, '#ffffff'], [0.12, '#eef3fa'], [0.26, '#d6e1ef'], [0.38, '#aebfd6'], [0.48, '#8297b4'], [0.55, '#6c82a2'], [0.62, '#8a9fbb'], [0.72, '#bccbdf'], [0.84, '#e6eef8'], [0.93, '#d3dfee'], [1, '#c4d3e6']],
      side: '#dfe7f2', env: ['#2a3a52', '#dfe9f7', '#ffffff', '#1a2638', '#070c16'], box: 'rgba(240,246,255,0.95)', satin: '#f4f1ea',
      dust: '226,238,255', glow: '150,190,240', bg: '#0c1424', light: '#7fa6e0',
    },
  },
  dhunna: {
    id: 'dhunna',
    name: 'Dhunna 59-D · warm gold',
    ground: 'oklch(0.135 0.008 70)', deep: 'oklch(0.11 0.008 70)', lift: 'oklch(0.22 0.03 75)',
    ivory: 'oklch(0.96 0.012 85)', dim: 'oklch(0.74 0.012 85)', accent: 'oklch(0.8 0.125 80)', hair: 'oklch(0.8 0.125 80 / 0.35)',
    panel: 'oklch(0.13 0.01 70 / 0.88)', shadow: 'oklch(0.05 0.006 70 / 0.7)', glow: 'oklch(0.72 0.12 78)',
    metal: 'gold', fontHead: 'Geist', fontLabel: 'Archivo', fontBrand: 'Archivo',
    logo: 'brand/dhunna-infra-wordmark-white.png', logoRatio: 278 / 968, logoMode: 'mask',
    type3d: {
      ramp: [[0, '#fff8e4'], [0.14, '#fbe7b4'], [0.28, '#efcd7e'], [0.4, '#d9ad55'], [0.5, '#b8893a'], [0.56, '#946a2a'], [0.63, '#b98b3e'], [0.74, '#e2bd6c'], [0.86, '#f8dfa0'], [0.94, '#ecd08a'], [1, '#dfb25a']],
      side: '#e8c47a', env: ['#3a2c18', '#f6e2b6', '#fff8ea', '#2a1e10', '#0a0705'], box: 'rgba(255,244,222,0.95)', satin: '#f2ece2',
      dust: '255,230,190', glow: '232,190,110', bg: '#0f0c08', light: '#e0a85a',
    },
  },
  crown_crest: {
    id: 'crown_crest',
    name: 'Crown Crest · champagne rose gold',
    ground: 'oklch(0.135 0.009 45)', deep: 'oklch(0.11 0.008 45)', lift: 'oklch(0.32 0.03 50 / 0.55)',
    ivory: 'oklch(0.955 0.018 70)', dim: 'oklch(0.75 0.02 60)', accent: 'oklch(0.85 0.06 55)', hair: 'oklch(0.78 0.085 45 / 0.35)',
    panel: 'oklch(0.13 0.01 45 / 0.86)', shadow: 'oklch(0.05 0.006 45 / 0.65)', glow: 'oklch(0.75 0.09 50)',
    metal: 'champagne', fontHead: 'Geist', fontLabel: 'Archivo', fontBrand: 'Cinzel',
    logo: 'brand/crowncrest-logo.png', logoRatio: 1, logoMode: 'image',
    type3d: {
      ramp: [[0, '#fff7ee'], [0.12, '#fde6d2'], [0.26, '#f4cfb3'], [0.38, '#e2ad8b'], [0.48, '#c48a6c'], [0.55, '#a8735c'], [0.62, '#bf8b6f'], [0.72, '#e6b897'], [0.84, '#f8d9bf'], [0.93, '#f1c7a8'], [1, '#e9b998']],
      side: '#f2c39c', env: ['#3a2a22', '#f6dcc4', '#fff6ec', '#2a1c16', '#0a0706'], box: 'rgba(255,240,226,0.95)', satin: '#f4ede4',
      dust: '255,226,200', glow: '232,170,128', bg: '#0f0b09', light: '#e8a07c',
    },
  },
};

const Ctx = createContext<KitTheme>(KIT_THEMES.dhunna_54d);
export const KitThemeProvider: React.FC<{theme: string | KitTheme; children: React.ReactNode}> = ({theme, children}) => (
  <Ctx.Provider value={typeof theme === 'string' ? KIT_THEMES[theme] ?? KIT_THEMES.dhunna_54d : theme}>{children}</Ctx.Provider>
);
export const useKitTheme = () => useContext(Ctx);
// a colour at a given opacity, for any CSS colour (glows, shadows)
export const alpha = (c: string, a: number) => `color-mix(in oklch, ${c} ${Math.round(a * 100)}%, transparent)`;

// Bridge for the two mograph components that predate KitTheme (TogglePills, ShapeMorph): with no `theme` prop they
// follow the surrounding KitThemeProvider; a preset id or ReelTheme object still works.
export type ReelThemeLike = {id: string; name: string; ground: string; accent: string; accentGlow: string; ivory: string; muted: string; hairline: string; fontFamilyHead: string; fontFamilyBody: string};
export const useReelThemeFromKit = (): ReelThemeLike => {
  const C = useKitTheme();
  return {id: C.id, name: C.name, ground: C.ground, accent: C.accent, accentGlow: alpha(C.glow, 0.6), ivory: C.ivory, muted: C.dim, hairline: C.hair, fontFamilyHead: C.fontLabel, fontFamilyBody: C.fontHead};
};
