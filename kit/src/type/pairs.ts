import type React from 'react';
import {stack} from './fonts';

// Font pairs: a lead face (running words), a hero face (the one big word), a label face (tiny tracked caps), and
// the Devanagari and Gurmukhi faces that match the pair's character, so a Hinglish or Hindi line keeps the look.
// Contrast comes from one axis at a time: weight (same family), structure (sans + serif) or width (condensed hero).
// Devanagari has no capitals, so hierarchy in Hindi comes from size and weight: presets never rely on uppercase.
export type Face = {family: string; weight: number; italic?: boolean; stretch?: string; tracking?: string};
export type FontPair = {
  id: string;
  name: string;
  why: string; // why these work together, and where
  lead: Face;
  hero: Face;
  label: Face;
  deva: {lead: string; hero: string}; // Devanagari families for lead and hero
  guru: {lead: string; hero: string}; // Gurmukhi families
  brand?: 'dhunna_54d' | 'dhunna' | 'crown_crest';
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'geist-steel', name: 'Geist light / Geist display', brand: 'dhunna_54d',
    why: 'One family, weight contrast 300 → 640: the Dhunna 54D voice. Quiet lead, confident hero.',
    lead: {family: 'Geist', weight: 300}, hero: {family: 'Geist', weight: 640, tracking: '-0.035em'}, label: {family: 'Archivo', weight: 500, tracking: '0.3em'},
    deva: {lead: 'Mukta', hero: 'Mukta'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'archivo-expanded', name: 'Geist / Archivo expanded', brand: 'dhunna',
    why: 'Width contrast: a wide architectural hero over a narrow quiet lead. 59-D gold.',
    lead: {family: 'Geist', weight: 300}, hero: {family: 'Archivo', weight: 700, stretch: '125%', tracking: '-0.01em'}, label: {family: 'Archivo', weight: 500, tracking: '0.3em'},
    deva: {lead: 'Mukta', hero: 'Khand'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'crown-italic', name: 'Geist / Instrument Serif italic', brand: 'crown_crest',
    why: 'Sans lead with an italic serif hero: hospitality warmth for Crown Crest. Cinzel stays for the brand name only.',
    lead: {family: 'Geist', weight: 300}, hero: {family: 'Instrument Serif', weight: 400, italic: true, tracking: '-0.01em'}, label: {family: 'Archivo', weight: 500, tracking: '0.3em'},
    deva: {lead: 'Mukta', hero: 'Tiro Devanagari Hindi'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'editorial-italic', name: 'Inter / Instrument Serif italic',
    why: 'The current editorial look: a neutral sans carrying the line, one italic serif word as the voice.',
    lead: {family: 'Inter', weight: 500}, hero: {family: 'Instrument Serif', weight: 400, italic: true}, label: {family: 'Inter', weight: 600, tracking: '0.2em'},
    deva: {lead: 'Hind', hero: 'Tiro Devanagari Hindi'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'magazine-fraunces', name: 'Inter / Fraunces',
    why: 'Warm soft serif hero over a neutral sans: premium without being cold.',
    lead: {family: 'Inter', weight: 400}, hero: {family: 'Fraunces', weight: 650, tracking: '-0.02em'}, label: {family: 'Inter', weight: 600, tracking: '0.2em'},
    deva: {lead: 'Hind', hero: 'Rozha One'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'didone-luxe', name: 'Montserrat light / Bodoni Moda',
    why: 'Fashion luxury: thin tracked sans with a high-contrast Didone hero. Rozha One matches the contrast in Hindi.',
    lead: {family: 'Montserrat', weight: 300, tracking: '0.04em'}, hero: {family: 'Bodoni Moda', weight: 600}, label: {family: 'Montserrat', weight: 500, tracking: '0.32em'},
    deva: {lead: 'Hind', hero: 'Rozha One'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'garamond-soft', name: 'Figtree / Cormorant Garamond italic',
    why: 'Literary and gentle: open sans with a refined italic hero. For interiors and lifestyle lines.',
    lead: {family: 'Figtree', weight: 400}, hero: {family: 'Cormorant Garamond', weight: 600, italic: true}, label: {family: 'Figtree', weight: 600, tracking: '0.22em'},
    deva: {lead: 'Mukta', hero: 'Tiro Devanagari Hindi'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'bold-pop', name: 'Montserrat black',
    why: 'The high-energy reel default: one heavy geometric family, contrast from colour and scale, not weight.',
    lead: {family: 'Montserrat', weight: 800}, hero: {family: 'Montserrat', weight: 900, tracking: '-0.02em'}, label: {family: 'Montserrat', weight: 700, tracking: '0.18em'},
    deva: {lead: 'Baloo 2', hero: 'Baloo 2'}, guru: {lead: 'Baloo Paaji 2', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'insta-geometric', name: 'Poppins',
    why: 'Closest free match to Instagram Sans, with its own Devanagari: the native-feeling Hinglish caption.',
    lead: {family: 'Poppins', weight: 500}, hero: {family: 'Poppins', weight: 800}, label: {family: 'Poppins', weight: 600, tracking: '0.18em'},
    deva: {lead: 'Poppins', hero: 'Poppins'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'condensed-impact', name: 'Inter / Anton',
    why: 'Width contrast at its loudest: a condensed ultra-bold hero for one-word punches. Teko is its Devanagari twin.',
    lead: {family: 'Inter', weight: 600}, hero: {family: 'Anton', weight: 400, tracking: '0.01em'}, label: {family: 'Inter', weight: 700, tracking: '0.2em'},
    deva: {lead: 'Hind', hero: 'Teko'}, guru: {lead: 'Mukta Mahee', hero: 'Anek Gurmukhi'},
  },
  {
    id: 'poster-bebas', name: 'Outfit / Bebas Neue',
    why: 'Tall poster capitals over a round sans: event and launch energy.',
    lead: {family: 'Outfit', weight: 500}, hero: {family: 'Bebas Neue', weight: 400, tracking: '0.02em'}, label: {family: 'Outfit', weight: 600, tracking: '0.22em'},
    deva: {lead: 'Mukta', hero: 'Khand'}, guru: {lead: 'Mukta Mahee', hero: 'Anek Gurmukhi'},
  },
  {
    id: 'grotesk-modern', name: 'Inter / Bricolage Grotesque',
    why: 'Characterful grotesque hero: modern brand, not corporate.',
    lead: {family: 'Inter', weight: 450}, hero: {family: 'Bricolage Grotesque', weight: 800, tracking: '-0.03em'}, label: {family: 'Inter', weight: 600, tracking: '0.2em'},
    deva: {lead: 'Mukta', hero: 'Mukta'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'wide-tech', name: 'Plus Jakarta / Unbounded',
    why: 'Wide display hero for tech, launches and numbers.',
    lead: {family: 'Plus Jakarta Sans', weight: 500}, hero: {family: 'Unbounded', weight: 700, tracking: '-0.02em'}, label: {family: 'Plus Jakarta Sans', weight: 700, tracking: '0.2em'},
    deva: {lead: 'Mukta', hero: 'Noto Sans Devanagari'}, guru: {lead: 'Mukta Mahee', hero: 'Anek Gurmukhi'},
  },
  {
    id: 'hand-note', name: 'Figtree / Caveat',
    why: 'A handwritten word in a clean line: personal, a note from the founder. Accent words only.',
    lead: {family: 'Figtree', weight: 500}, hero: {family: 'Caveat', weight: 700}, label: {family: 'Figtree', weight: 600, tracking: '0.2em'},
    deva: {lead: 'Mukta', hero: 'Baloo 2'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'quiet-inter', name: 'Inter light',
    why: 'The quiet-luxury counter-trend: small, light, lowercase, almost no motion.',
    lead: {family: 'Inter', weight: 300}, hero: {family: 'Inter', weight: 500}, label: {family: 'Inter', weight: 500, tracking: '0.2em'},
    deva: {lead: 'Hind', hero: 'Hind'}, guru: {lead: 'Mukta Mahee', hero: 'Mukta Mahee'},
  },
  {
    id: 'hindi-native', name: 'Hind / Gotu',
    why: 'Devanagari-first: Hind for running words, calligraphic Gotu for the hero. Latin falls through to Poppins.',
    lead: {family: 'Hind', weight: 500}, hero: {family: 'Gotu', weight: 400}, label: {family: 'Poppins', weight: 600, tracking: '0.18em'},
    deva: {lead: 'Hind', hero: 'Gotu'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
  {
    id: 'punjabi-native', name: 'Mukta Mahee / Baloo Paaji 2',
    why: 'Gurmukhi-first: clean Mukta Mahee lead, rounded bold Baloo Paaji hero.',
    lead: {family: 'Mukta Mahee', weight: 500}, hero: {family: 'Baloo Paaji 2', weight: 800}, label: {family: 'Mukta Mahee', weight: 600, tracking: '0.18em'},
    deva: {lead: 'Mukta', hero: 'Baloo 2'}, guru: {lead: 'Mukta Mahee', hero: 'Baloo Paaji 2'},
  },
];

export const pairById = (id: string) => FONT_PAIRS.find((p) => p.id === id) ?? FONT_PAIRS[0];
export const pairFamilies = (p: FontPair) => [p.lead.family, p.hero.family, p.label.family, p.deva.lead, p.deva.hero, p.guru.lead, p.guru.hero];
// CSS for one role of a pair, with its Indic fallbacks in the stack
export const faceCss = (p: FontPair, role: 'lead' | 'hero' | 'label'): React.CSSProperties => {
  const f = p[role];
  const indic = role === 'label' ? [p.deva.lead, p.guru.lead] : [p.deva[role], p.guru[role]];
  return {fontFamily: stack(f.family, ...indic), fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal', fontStretch: f.stretch, letterSpacing: f.tracking};
};
