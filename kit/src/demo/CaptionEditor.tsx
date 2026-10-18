import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, type CalculateMetadataFunction} from 'remotion';
import {z} from 'zod';
import '../lib/fonts';
import {CAPTION_PRESETS, captionStyleSchema, presetById, PRESET_IDS} from '../captions/style';
import {CaptionTrack} from '../captions/CaptionTrack';
import {fromVoJson, spread, type CapWord} from '../captions/words';
import {Grade, KitThemeProvider, ShaderBackdrop, useKitTheme, Vignette} from '../pro';
import {FONT_PAIRS, faceCss} from '../type/pairs';
import {useFonts} from '../type/fonts';
import O3 from './captions/vo-O3.json';
import N3 from './captions/vo-N3.json';
import S3 from './captions/vo-S3.json';
import B3 from './captions/vo-B3.json';

// Caption editor: pick a preset, then override any field in Remotion Studio's props panel (right side). The preview
// plays a real voice-over with its word timings. "Save" in the panel writes the props back to Root.tsx; copy the
// `overrides` object into a preset in src/captions/style.ts to keep it.
type Vo = {end: number; lines: {words: [string, number][]}[]};
const VO: Record<string, {vo: Vo; audio: string; heroes: string[]}> = {
  O3: {vo: O3 as unknown as Vo, audio: 'audio/vo/O3-Puck.wav', heroes: ['office', 'address', 'Sarabha', 'showrooms', 'parking', 'entrance', 'message']},
  N3: {vo: N3 as unknown as Vo, audio: 'audio/vo/N3-Kore.wav', heroes: []},
  S3: {vo: S3 as unknown as Vo, audio: 'audio/vo/S3-Kore.wav', heroes: []},
  B3: {vo: B3 as unknown as Vo, audio: 'audio/vo/B3-Puck.wav', heroes: []},
};
// demo lines without audio (even timing; *word* marks a hero)
const DEMO: Record<string, string> = {
  hindi: 'सराभा नगर में आपका *नया* पता। नीचे *शोरूम* और ऊपर ऑफिस। आज ही *मैसेज* करें।',
  punjabi: 'ਸਰਾਭਾ ਨਗਰ ਵਿੱਚ ਤੁਹਾਡਾ *ਨਵਾਂ* ਪਤਾ। ਹੇਠਾਂ *ਸ਼ੋਅਰੂਮ* ਤੇ ਉੱਤੇ ਦਫ਼ਤਰ। ਅੱਜ ਹੀ *ਮੈਸੇਜ* ਕਰੋ।',
  hinglish: 'Toh suniye, *Fifty-Four* D, Sarabha Nagar. Neeche *showrooms*, aur upar corporate offices.',
};

export const captionEditorSchema = z.object({
  preset: z.enum(PRESET_IDS),
  theme: z.enum(['dhunna_54d', 'dhunna', 'crown_crest']),
  script: z.enum(['O3', 'N3', 'S3', 'B3', 'hinglish', 'hindi', 'punjabi']).describe('O3–B3 play the real voice-over'),
  background: z.enum(['photo', 'shader', 'plain']),
  heroWords: z.string().describe('comma-separated words to mark as hero (voice-over scripts)'),
  overrides: captionStyleSchema.partial(),
});
type EditorProps = z.infer<typeof captionEditorSchema>;

const wordsFor = (script: string, heroWords: string): {words: CapWord[]; audio?: string; end: number} => {
  const v = VO[script];
  if (v) {
    const heroes = heroWords.trim() ? heroWords.split(',').map((x) => x.trim()) : v.heroes;
    return {words: fromVoJson(v.vo, heroes), audio: v.audio, end: v.vo.end};
  }
  const words = spread(DEMO[script] ?? DEMO.hinglish, 0.4, undefined, 0.42);
  return {words, end: words[words.length - 1].end};
};

const Ground: React.FC<{kind: EditorProps['background']}> = ({kind}) => {
  const C = useKitTheme();
  if (kind === 'photo')
    return (
      <AbsoluteFill>
        <Grade><Img src={staticFile('samples/r-walkers.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Grade>
        <Vignette amount={0.5} />
      </AbsoluteFill>
    );
  if (kind === 'shader') return <ShaderBackdrop kind="mesh" />;
  return <AbsoluteFill style={{background: C.ground}} />;
};

const Editor: React.FC<EditorProps> = ({preset, script, background, heroWords, overrides}) => {
  const C = useKitTheme();
  const style = useMemo(() => ({...presetById(preset).style, ...overrides}), [preset, overrides]);
  const {words, audio} = useMemo(() => wordsFor(script, heroWords), [script, heroWords]);
  const pr = presetById(preset);
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <Ground kind={background} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <CaptionTrack words={words} style={style} />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: C.fontLabel, fontWeight: 500, fontSize: 24, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accent, opacity: 0.85}}>
        {pr.name} · {style.pair}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionEditor: React.FC<EditorProps> = (props) => (
  <KitThemeProvider theme={props.theme}>
    <Editor {...props} />
  </KitThemeProvider>
);
export const captionEditorMetadata: CalculateMetadataFunction<EditorProps> = ({props}) => {
  const {end} = wordsFor(props.script, props.heroWords);
  return {durationInFrames: Math.ceil((end + 1.5) * 30)};
};
export const CAPTION_EDITOR_DEFAULTS: EditorProps = {preset: 'dhunna-steel', theme: 'dhunna_54d', script: 'O3', background: 'photo', heroWords: '', overrides: {}};

// Gallery: every preset for a few seconds on the same Hinglish line, the preset named at the top.
const SLICE = spread(DEMO.hinglish, 0.35, undefined, 0.36);
const GAL = 120;
const Gallery: React.FC<{theme: string}> = ({theme}) => (
  <KitThemeProvider theme={theme}>
    <AbsoluteFill>
      {CAPTION_PRESETS.map((pr, i) => (
        <Sequence key={pr.id} from={i * GAL} durationInFrames={GAL}>
          <GalleryCard id={pr.id} />
        </Sequence>
      ))}
    </AbsoluteFill>
  </KitThemeProvider>
);
const GalleryCard: React.FC<{id: string}> = ({id}) => {
  const C = useKitTheme();
  const pr = presetById(id);
  const words = pr.category === 'indic' ? spread(pr.id === 'punjabi-bold' ? DEMO.punjabi : DEMO.hindi, 0.35, undefined, 0.36) : SLICE;
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <Ground kind="photo" />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.deep} 0%, transparent 26%)`, opacity: 0.9}} />
      <CaptionTrack words={words} style={pr.style} />
      <div style={{position: 'absolute', top: 150, left: 80, right: 80}}>
        <div style={{fontFamily: C.fontLabel, fontWeight: 500, fontSize: 24, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accent}}>{pr.category}</div>
        <div style={{marginTop: 10, fontFamily: C.fontHead, fontWeight: 640, fontSize: 64, letterSpacing: '-0.03em', color: C.ivory}}>{pr.name}</div>
        <div style={{marginTop: 8, fontFamily: C.fontHead, fontWeight: 400, fontSize: 30, color: C.dim, maxWidth: 820}}>{pr.note}</div>
      </div>
    </AbsoluteFill>
  );
};
export const CaptionGallery = Gallery;
export const CAPTION_GALLERY_TOTAL = CAPTION_PRESETS.length * GAL;

// Font pairs specimen: every pair with Latin, Hindi and Punjabi lines, as one tall still.
export const PAIR_ROW = 290;
export const FontPairs: React.FC<{theme: string}> = ({theme}) => (
  <KitThemeProvider theme={theme}>
    <PairsInner />
  </KitThemeProvider>
);
const PairsInner: React.FC = () => {
  const C = useKitTheme();
  useFonts(FONT_PAIRS.flatMap((p) => [p.lead.family, p.hero.family, p.label.family, p.deva.lead, p.deva.hero, p.guru.lead, p.guru.hero]));
  return (
    <AbsoluteFill style={{background: C.ground, padding: '90px 70px'}}>
      <div style={{fontFamily: C.fontLabel, fontWeight: 500, fontSize: 26, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accent}}>Font pairs · {FONT_PAIRS.length}</div>
      {FONT_PAIRS.map((p) => (
        <div key={p.id} style={{height: PAIR_ROW, borderBottom: `1px solid ${C.hair}`, paddingTop: 26}}>
          <div style={{...faceCss(p, 'label'), fontSize: 20, textTransform: 'uppercase', color: C.dim}}>{p.name}{p.brand ? ` · ${p.brand}` : ''}</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 8, color: C.ivory}}>
            <span style={{...faceCss(p, 'lead'), fontSize: 50}}>Your next</span>
            <span style={{...faceCss(p, 'hero'), fontSize: 96, color: C.accent}}>address</span>
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 28, color: C.ivory, marginTop: 4}}>
            <span style={{...faceCss(p, 'lead'), fontSize: 40}}>आपका अगला</span>
            <span style={{...faceCss(p, 'hero'), fontSize: 52, color: C.accent}}>पता</span>
            <span style={{...faceCss(p, 'lead'), fontSize: 40}}>ਤੁਹਾਡਾ ਅਗਲਾ</span>
            <span style={{...faceCss(p, 'hero'), fontSize: 52, color: C.accent}}>ਪਤਾ</span>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
