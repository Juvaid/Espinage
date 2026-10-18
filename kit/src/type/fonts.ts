import {useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import FACES from './fontfaces.json';

// The kit's font library: 31 open-licence families (Fontsource, SIL OFL; licences in public/fonts/lib/<id>/LICENSE)
// vendored as woff2, so renders never wait on a CDN. Latin + Devanagari + Gurmukhi subsets, each with its own
// unicode-range, so a stack like "Poppins, Mukta, Mukta Mahee" picks the right face per character and Hinglish,
// Hindi and Punjabi captions all render in designed fonts. Brand faces (Geist, Archivo, Cinzel) come from
// public/fonts. Re-vendor with scripts/fonts-vendor.mjs.
type Face = {id: string; family: string; style: string; weight: string; unicodeRange?: string; subset: string; file: string};
const ALL = FACES as Face[];

export type FontRole = 'sans' | 'display' | 'serif' | 'script' | 'devanagari' | 'gurmukhi';
export type FontInfo = {family: string; role: FontRole; scripts: string[]; mood: string; note?: string};

// what each family is for (mood words are for choosing, not rules)
export const FONTS: FontInfo[] = [
  {family: 'Geist', role: 'sans', scripts: ['latin'], mood: 'precise, quiet, modern', note: 'Dhunna house face'},
  {family: 'Archivo', role: 'sans', scripts: ['latin'], mood: 'architectural; width axis 62–125%', note: 'labels, expanded heroes'},
  {family: 'Cinzel', role: 'serif', scripts: ['latin'], mood: 'classical capitals', note: 'Crown Crest brand name only'},
  {family: 'Inter', role: 'sans', scripts: ['latin'], mood: 'neutral, legible', note: 'subtitles, documentary'},
  {family: 'Poppins', role: 'sans', scripts: ['latin', 'devanagari'], mood: 'geometric, friendly, Instagram-like', note: 'Latin and Devanagari designed together'},
  {family: 'Montserrat', role: 'sans', scripts: ['latin'], mood: 'bold, urban, high-energy at 800–900'},
  {family: 'Plus Jakarta Sans', role: 'sans', scripts: ['latin'], mood: 'soft modern, premium SaaS'},
  {family: 'Outfit', role: 'sans', scripts: ['latin'], mood: 'round geometric, clean'},
  {family: 'Figtree', role: 'sans', scripts: ['latin'], mood: 'warm, open'},
  {family: 'Bricolage Grotesque', role: 'display', scripts: ['latin'], mood: 'characterful grotesque, editorial-modern'},
  {family: 'Syne', role: 'display', scripts: ['latin'], mood: 'art-school, wide at 800'},
  {family: 'Unbounded', role: 'display', scripts: ['latin'], mood: 'wide, tech, loud'},
  {family: 'Anton', role: 'display', scripts: ['latin'], mood: 'ultra-bold condensed: single-word punches'},
  {family: 'Bebas Neue', role: 'display', scripts: ['latin'], mood: 'tall caps, poster'},
  {family: 'Instrument Serif', role: 'serif', scripts: ['latin'], mood: 'editorial italic accent (current trend)'},
  {family: 'Fraunces', role: 'serif', scripts: ['latin'], mood: 'warm soft serif, premium'},
  {family: 'Playfair Display', role: 'serif', scripts: ['latin'], mood: 'high-contrast luxury'},
  {family: 'Cormorant Garamond', role: 'serif', scripts: ['latin'], mood: 'refined, literary'},
  {family: 'Bodoni Moda', role: 'serif', scripts: ['latin'], mood: 'Didone fashion luxury'},
  {family: 'DM Serif Display', role: 'serif', scripts: ['latin'], mood: 'chunky display serif'},
  {family: 'Caveat', role: 'script', scripts: ['latin'], mood: 'handwritten note: accent words only'},
  {family: 'Hind', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'clean, legible Hindi captions'},
  {family: 'Mukta', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'modern humanist Hindi, wide weight range'},
  {family: 'Noto Sans Devanagari', role: 'devanagari', scripts: ['devanagari'], mood: 'safe fallback, every weight'},
  {family: 'Baloo 2', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'rounded, playful, bold'},
  {family: 'Teko', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'condensed display: pairs with Anton/Bebas'},
  {family: 'Khand', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'semi-condensed, punchy'},
  {family: 'Rozha One', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'high-contrast display: pairs with Bodoni/Playfair'},
  {family: 'Tiro Devanagari Hindi', role: 'devanagari', scripts: ['devanagari'], mood: 'book serif with italic: pairs with serif heroes'},
  {family: 'Gotu', role: 'devanagari', scripts: ['devanagari', 'latin'], mood: 'calligraphic display'},
  {family: 'Mukta Mahee', role: 'gurmukhi', scripts: ['gurmukhi', 'latin'], mood: 'clean Punjabi captions'},
  {family: 'Baloo Paaji 2', role: 'gurmukhi', scripts: ['gurmukhi', 'latin'], mood: 'rounded bold Punjabi'},
  {family: 'Anek Gurmukhi', role: 'gurmukhi', scripts: ['gurmukhi'], mood: 'modern Punjabi display'},
];

const LOCAL: Record<string, [string, string, string?][]> = {
  Geist: [['fonts/Geist-VF.ttf', '100 900']],
  Archivo: [['fonts/Archivo-VF.ttf', '100 900', '62% 125%']],
  Cinzel: [['fonts/Cinzel-VF.ttf', '400 900']],
};

const cache = new Map<string, Promise<unknown>>();
export const loadFamily = (family: string) => {
  if (typeof document === 'undefined') return Promise.resolve();
  const hit = cache.get(family);
  if (hit) return hit;
  const faces: FontFace[] = LOCAL[family]
    ? LOCAL[family].map(([file, weight, stretch]) => new FontFace(family, `url(${staticFile(file)})`, {weight, ...(stretch ? {stretch} : {})}))
    : ALL.filter((f) => f.family === family).map((f) => new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight, style: f.style, ...(f.unicodeRange ? {unicodeRange: f.unicodeRange} : {})}));
  if (!faces.length) console.warn(`kit fonts: no faces for "${family}"`);
  const p = Promise.all(faces.map((ff) => ff.load().then((x) => document.fonts.add(x))));
  cache.set(family, p);
  return p;
};
export const loadFamilies = (families: string[]) => Promise.all([...new Set(families)].map(loadFamily));

// Hold the frame until these families are loaded. Keyed by the set, so switching presets in the editor loads the
// new faces too (each set is waited for once).
export const useFonts = (families: string[]) => {
  const key = [...new Set(families)].sort().join('|');
  const [seen] = useState(() => new Set<string>());
  if (!seen.has(key)) {
    seen.add(key);
    const h = delayRender(`fonts: ${key}`);
    loadFamilies(families).then(
      () => continueRender(h),
      (e) => {
        console.warn('kit fonts failed', e);
        continueRender(h);
      },
    );
  }
};

// A CSS font-family stack: the Latin face first, then the Indic faces, then a generic.
export const stack = (...families: (string | undefined)[]) => [...families.filter(Boolean).map((f) => `'${f}'`), 'sans-serif'].join(', ');
