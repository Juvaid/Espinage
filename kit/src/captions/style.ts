import {z} from 'zod';
import {FONT_PAIRS} from '../type/pairs';

// A caption style is plain data (JSON): the same object drives the kit's CaptionTrack, Remotion Studio's props panel
// (the editor) and saved presets. Colours accept theme tokens (ivory, dim, accent, deep, ground, glow) or any CSS
// colour, so one preset follows the brand theme it's rendered in.
const PAIR_IDS = FONT_PAIRS.map((p) => p.id) as [string, ...string[]];

export const captionStyleSchema = z.object({
  pair: z.enum(PAIR_IDS).describe('font pair (src/type/pairs.ts)'),
  layout: z.enum(['line', 'stack', 'word']).describe('line: words flow on 1–2 lines · stack: lead / big hero / tail · word: one word at a time'),
  maxWords: z.number().int().min(1).max(12).describe('words per page'),
  pauseBreak: z.number().min(0.1).max(2).describe('a gap longer than this (s) starts a new page'),
  leadCase: z.enum(['none', 'upper', 'lower']),
  heroCase: z.enum(['none', 'upper', 'lower']),
  size: z.number().min(24).max(200).describe('lead size, px at 1080 wide'),
  heroScale: z.number().min(1).max(3.5),
  leadWeight: z.number().min(100).max(900).optional(),
  heroWeight: z.number().min(100).max(900).optional(),
  y: z.number().min(0.1).max(0.92).describe('vertical centre of the caption, 0 = top'),
  width: z.number().min(400).max(1020),
  align: z.enum(['center', 'left']),
  color: z.string(),
  upcoming: z.enum(['hidden', 'dim', 'shown']).describe('words not yet spoken'),
  upcomingColor: z.string(),
  enter: z.enum(['none', 'pop', 'rise', 'blur', 'slit', 'drop']).describe('how each word arrives'),
  active: z.enum(['none', 'color', 'pill', 'box', 'underline', 'scale', 'glow', 'karaoke']).describe('the word being spoken'),
  activeColor: z.string(),
  hero: z.enum(['none', 'color', 'metal', 'shimmer', 'box', 'scale']).describe('the hero word'),
  heroColor: z.string(),
  autoHero: z.boolean().describe('no hero marked? use the longest word of each page'),
  stroke: z.number().min(0).max(14),
  strokeColor: z.string(),
  shadow: z.enum(['none', 'soft', 'hard', 'glow']),
  panel: z.enum(['none', 'box', 'line-pill']),
  panelColor: z.string(),
  panelOpacity: z.number().min(0).max(1),
  exit: z.enum(['cut', 'fade', 'rise']),
});
export type CaptionStyle = z.infer<typeof captionStyleSchema>;

const base: CaptionStyle = {
  pair: 'geist-steel', layout: 'line', maxWords: 4, pauseBreak: 0.45, leadCase: 'none', heroCase: 'none', size: 64, heroScale: 1.6,
  y: 0.74, width: 920, align: 'center', color: 'ivory', upcoming: 'hidden', upcomingColor: 'dim', enter: 'rise', active: 'none',
  activeColor: 'accent', hero: 'color', heroColor: 'accent', autoHero: false, stroke: 0, strokeColor: '#000000', shadow: 'soft',
  panel: 'none', panelColor: 'deep', panelOpacity: 0.7, exit: 'fade',
};

export type CaptionPreset = {id: string; name: string; category: 'brand' | 'editorial' | 'energy' | 'clean' | 'indic'; note: string; style: CaptionStyle};
const p = (id: string, name: string, category: CaptionPreset['category'], note: string, s: Partial<CaptionStyle>): CaptionPreset => ({id, name, category, note, style: {...base, ...s}});

// Named by look, not by creator. Each note says when to use it.
export const CAPTION_PRESETS: CaptionPreset[] = [
  p('dhunna-steel', 'Dhunna steel', 'brand', '54D films: quiet lead, metal hero word, nothing loud', {pair: 'geist-steel', layout: 'stack', size: 60, heroScale: 2.1, hero: 'metal', autoHero: true, enter: 'rise'}),
  p('dhunna-gold', 'Dhunna gold', 'brand', '59-D: wide Archivo hero in gold metal', {pair: 'archivo-expanded', layout: 'stack', size: 58, heroScale: 1.9, hero: 'metal', heroCase: 'upper', autoHero: true, enter: 'slit'}),
  p('crown-crest', 'Crown Crest italic', 'brand', 'Crown Crest: italic serif hero in champagne', {pair: 'crown-italic', layout: 'stack', size: 58, heroScale: 2.3, hero: 'color', autoHero: true, enter: 'blur'}),
  p('editorial-italic', 'Editorial italic', 'editorial', 'Lowercase sans with one italic serif word: lifestyle, interiors', {pair: 'editorial-italic', maxWords: 5, size: 60, heroScale: 1.35, leadCase: 'lower', enter: 'blur', autoHero: true}),
  p('magazine', 'Magazine serif', 'editorial', 'Fraunces hero catching one light pass', {pair: 'magazine-fraunces', layout: 'stack', size: 56, heroScale: 2.2, hero: 'shimmer', heroColor: 'ivory', autoHero: true, enter: 'rise'}),
  p('didone-luxe', 'Didone luxe', 'editorial', 'Tracked caps lead, Bodoni hero: fashion-grade luxury', {pair: 'didone-luxe', layout: 'stack', size: 40, leadCase: 'upper', heroScale: 3, hero: 'color', heroColor: 'ivory', autoHero: true, enter: 'blur'}),
  p('garamond-soft', 'Garamond soft', 'editorial', 'Gentle italic accents for calm voice-overs', {pair: 'garamond-soft', maxWords: 5, size: 58, heroScale: 1.45, autoHero: true, enter: 'rise'}),
  p('bold-pop', 'Bold pop', 'energy', 'The viral default: heavy caps, white with outline, one yellow word', {pair: 'bold-pop', maxWords: 3, size: 82, leadCase: 'upper', heroCase: 'upper', upcoming: 'shown', active: 'color', activeColor: '#FFD43B', hero: 'scale', heroScale: 1.15, stroke: 5, shadow: 'hard', enter: 'pop', y: 0.68}),
  p('karaoke-fill', 'Karaoke fill', 'energy', 'Each word fills with colour as it is spoken', {pair: 'insta-geometric', maxWords: 5, size: 66, upcoming: 'shown', upcomingColor: 'ivory', active: 'karaoke', activeColor: '#FFE066', hero: 'none', shadow: 'hard', stroke: 3, enter: 'none'}),
  p('box-highlight', 'Box highlight', 'energy', 'The spoken word sits in a coloured box', {pair: 'insta-geometric', maxWords: 4, size: 68, upcoming: 'shown', active: 'box', activeColor: 'accent', hero: 'none', shadow: 'soft', enter: 'pop'}),
  p('word-punch', 'Word punch', 'energy', 'One condensed word at a time, for hooks and fast lines', {pair: 'condensed-impact', layout: 'word', maxWords: 1, size: 170, heroScale: 1, leadCase: 'upper', heroCase: 'upper', hero: 'color', autoHero: false, shadow: 'hard', enter: 'pop', exit: 'cut', y: 0.6}),
  p('poster-stack', 'Poster stack', 'energy', 'Tall Bebas hero rising out of a slit: launches, events', {pair: 'poster-bebas', layout: 'stack', size: 50, heroScale: 3.2, heroCase: 'upper', hero: 'color', autoHero: true, enter: 'slit'}),
  p('clean-subtitle', 'Clean subtitle', 'clean', 'Documentary subtitles on a soft panel; no motion', {pair: 'quiet-inter', maxWords: 8, size: 46, leadWeight: 500, upcoming: 'shown', active: 'none', hero: 'none', enter: 'none', exit: 'cut', panel: 'box', panelOpacity: 0.62, shadow: 'none', y: 0.82}),
  p('pill-lines', 'Pill lines', 'clean', 'Each line on an ivory pill, dark text: busy footage', {pair: 'grotesk-modern', maxWords: 6, size: 50, color: 'deep', hero: 'none', panel: 'line-pill', panelColor: 'ivory', panelOpacity: 0.95, shadow: 'none', enter: 'rise'}),
  p('quiet-lowercase', 'Quiet lowercase', 'clean', 'Small, light, lowercase, butter yellow: quiet luxury', {pair: 'quiet-inter', maxWords: 6, size: 44, leadCase: 'lower', heroCase: 'lower', color: '#F6E7A6', hero: 'none', enter: 'blur', active: 'none', y: 0.78}),
  p('hand-note', 'Hand note', 'editorial', 'One handwritten word: a personal note', {pair: 'hand-note', maxWords: 5, size: 58, heroScale: 1.7, autoHero: true, enter: 'rise'}),
  p('wide-tech', 'Wide tech', 'energy', 'Wide Unbounded hero in a box: numbers, launches', {pair: 'wide-tech', layout: 'stack', size: 48, heroScale: 1.9, heroCase: 'upper', hero: 'box', autoHero: true, enter: 'rise'}),
  p('grotesk-glow', 'Grotesk glow', 'energy', 'Bricolage words, the spoken one glows', {pair: 'grotesk-modern', maxWords: 4, size: 70, upcoming: 'dim', active: 'glow', activeColor: 'ivory', hero: 'scale', heroScale: 1.25, autoHero: true, enter: 'rise'}),
  p('hindi-clean', 'Hindi clean', 'indic', 'Devanagari-first: Hind lead, calligraphic Gotu hero', {pair: 'hindi-native', maxWords: 5, size: 62, heroScale: 1.4, autoHero: true, enter: 'rise'}),
  p('punjabi-bold', 'Punjabi bold', 'indic', 'Gurmukhi-first: rounded Baloo Paaji, spoken word in colour', {pair: 'punjabi-native', maxWords: 4, size: 66, upcoming: 'shown', active: 'color', activeColor: '#FFD43B', hero: 'none', stroke: 3, shadow: 'hard', enter: 'pop'}),
];
export const PRESET_IDS = CAPTION_PRESETS.map((x) => x.id) as [string, ...string[]];
export const presetById = (id: string) => CAPTION_PRESETS.find((x) => x.id === id) ?? CAPTION_PRESETS[0];
