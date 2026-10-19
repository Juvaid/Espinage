import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CaptionTrack } from '../captions/CaptionTrack';
import { captionStyleSchema, presetById, PRESET_IDS } from '../captions/style';
import { spread, type CapWord } from '../captions/words';
import { KIT_ICON_NAMES, type KitIconName } from '../icons/KitIcon';
import { ShapeMorph, MORPH_SHAPES } from '../components/svg/ShapeMorph';
import { TogglePills, type ToggleItem } from '../components/graphics/TogglePills';
import { Checklist } from '../pro/Checklist';
import { DepthReveal } from '../pro/DepthReveal';
import { AnimatedBeam, Lens, NumberTicker, Spotlight } from '../pro/Effects';
import { Carousel, CTA, Heading, Place, SidePair, TextBehind, Wordmark } from '../pro/parts';
import { ArchGrid, WireEye, WirePin } from '../pro/Wireframes';
import { Grade, LightLeak, Vignette } from '../pro/Grade';
import { Callout, DistanceRings, RouteDraw } from '../pro/Location';
import { LogoReveal } from '../pro/LogoReveal';
import { PhotoCard } from '../pro/PhotoCard';
import { SHADER_KINDS, ShaderBackdrop, type ShaderKind } from '../pro/Shaders';
import { BlurInText, ShimmerText, SlitLine, StatGrid, WordRotate } from '../pro/TextFx';
import { useKitTheme, type KitTheme } from '../theme/KitTheme';
import { asset } from '../lib/asset';
import { colorField, posX, posY, ui, unit01 } from './controls';

// The component registry: every kit component a project (manifest) can use, with its settings schema (which doubles
// as the editor's controls), its default length and how it renders. Items render inside a <Sequence>, so frames here
// are local to the item (0 = the item's first frame).
//
// Adding a component: give it a schema with ui() controls and defaults, a render function, an entry below, and a
// showcase in the Manifest-Demo project. Never change the meaning of an existing field (saved projects use it);
// add a new one with a default instead.

export const CATEGORIES = ['Background', 'Picture', 'Text', 'Captions', 'Figures', 'Lists', 'Location', 'Graphics', 'Effect', 'Brand'] as const;
export type Category = (typeof CATEGORIES)[number];
export type RenderCtx = { fps: number; from: number; durationInFrames: number; voiceWords: CapWord[] };
export type RegistryEntry<S extends z.ZodObject = z.ZodObject> = {
  type: string;
  label: string;
  category: Category;
  description: string;
  defaultDuration: number; // frames at 30 fps
  props: S;
  render: (props: z.infer<S>, ctx: RenderCtx) => React.ReactNode;
};
const entry = <S extends z.ZodObject>(e: RegistryEntry<S>) => e as unknown as RegistryEntry;

const tokenColor = (c: string, C: KitTheme) =>
  (({ ivory: C.ivory, dim: C.dim, accent: C.accent, deep: C.deep, ground: C.ground, glow: C.glow }) as Record<string, string>)[c] ?? c;
const media = (label: string, accept: 'image' | 'video' | 'audio', def = '') => ui(z.string().default(def), { label, control: 'media', accept, group: 'Content' });
// absolute URLs and root paths (e.g. the Caption Studio's /studio/api/media/<key>) pass through; the rest are kit
// assets resolved by staticFile
const src = asset;

// ── Background ──────────────────────────────────────────────────────────────
const backgroundProps = z.object({
  mode: ui(z.enum(['shader', 'solid', 'gradient']).default('shader'), { label: 'Type', group: 'Style' }),
  shader: ui(z.enum(SHADER_KINDS as [ShaderKind, ...ShaderKind[]]).default('mesh'), { label: 'Look', group: 'Style', help: 'mesh · silk · metal · aurora · rays · contour' }),
  energy: unit01('Energy', 0.5),
  speed: ui(z.number().min(0.2).max(3).default(1), { label: 'Speed', control: 'slider', step: 0.1, group: 'Style' }),
  seed: ui(z.number().int().min(0).max(99).default(0), { label: 'Variation', control: 'slider', step: 1, group: 'Style' }),
  color: colorField('Colour (solid)', 'ground'),
  color2: colorField('Second colour (gradient)', 'deep'),
  angle: ui(z.number().min(0).max(360).default(180), { label: 'Gradient angle', control: 'slider', step: 5, unit: '°', group: 'Style' }),
});
const Background: React.FC<z.infer<typeof backgroundProps>> = (p) => {
  const C = useKitTheme();
  if (p.mode === 'solid') return <AbsoluteFill style={{ background: tokenColor(p.color, C) }} />;
  if (p.mode === 'gradient') return <AbsoluteFill style={{ background: `linear-gradient(${p.angle}deg, ${tokenColor(p.color, C)}, ${tokenColor(p.color2, C)})` }} />;
  return <ShaderBackdrop kind={p.shader} energy={p.energy} speed={p.speed} seed={p.seed} />;
};

// ── Picture: full-frame image with drift, grade and vignette ────────────────
const imageProps = z.object({
  src: media('Image', 'image', 'samples/r-golden.jpg'),
  fit: ui(z.enum(['cover', 'contain']).default('cover'), { label: 'Fit', group: 'Layout' }),
  zoomFrom: ui(z.number().min(1).max(1.6).default(1.04), { label: 'Zoom start', control: 'slider', step: 0.01, group: 'Motion' }),
  zoomTo: ui(z.number().min(1).max(1.6).default(1.12), { label: 'Zoom end', control: 'slider', step: 0.01, group: 'Motion' }),
  driftX: ui(z.number().min(-0.15).max(0.15).default(0), { label: 'Drift sideways', control: 'slider', step: 0.01, group: 'Motion' }),
  focusX: ui(z.number().min(0).max(100).default(50), { label: 'Focus point X', control: 'slider', step: 1, unit: '%', group: 'Layout' }),
  focusY: ui(z.number().min(0).max(100).default(50), { label: 'Focus point Y', control: 'slider', step: 1, unit: '%', group: 'Layout' }),
  grade: ui(z.boolean().default(true), { label: 'Brand grade', group: 'Look' }),
  gradeTone: unit01('Grade tone', 0.3, 'Look'),
  vignette: unit01('Vignette', 0.35, 'Look'),
});
const Picture: React.FC<z.infer<typeof imageProps> & { durationInFrames: number }> = (p) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, Math.max(1, p.durationInFrames)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = p.zoomFrom + (p.zoomTo - p.zoomFrom) * t;
  const img = (
    <Img
      src={src(p.src)}
      style={{ width: '100%', height: '100%', objectFit: p.fit, objectPosition: `${p.focusX}% ${p.focusY}%`, transform: `scale(${scale}) translateX(${p.driftX * 100 * t}%)` }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {p.grade ? <Grade tone={p.gradeTone}>{img}</Grade> : img}
      {p.vignette > 0 ? <Vignette amount={p.vignette} /> : null}
    </AbsoluteFill>
  );
};

// ── Picture card ────────────────────────────────────────────────────────────
const cardProps = z.object({
  src: media('Image', 'image', 'samples/s-double-height.jpg'),
  label: ui(z.string().default('Concept visualisation'), { label: 'Label', group: 'Content' }),
  width: ui(z.number().min(300).max(1040).default(760), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  height: ui(z.number().min(300).max(1600).default(900), { label: 'Height', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  x: posX(540, 'Centre X'),
  y: posY(520, 'Top'),
  enterFrom: ui(z.enum(['bottom', 'right', 'left']).default('bottom'), { label: 'Enters from', group: 'Motion' }),
  tilt: ui(z.number().min(-8).max(8).default(-2), { label: 'Tilt', control: 'slider', step: 0.5, unit: '°', group: 'Layout' }),
});

// ── Video clip ──────────────────────────────────────────────────────────────
const videoProps = z.object({
  src: media('Video', 'video'),
  fit: ui(z.enum(['cover', 'contain']).default('cover'), { label: 'Fit', group: 'Layout' }),
  startAt: ui(z.number().min(0).default(0), { label: 'Start inside the clip', control: 'number', step: 0.1, unit: 's', group: 'Timing' }),
  volume: unit01('Volume', 0, 'Sound'),
  grade: ui(z.boolean().default(true), { label: 'Brand grade', group: 'Look' }),
});

// ── Title ───────────────────────────────────────────────────────────────────
const titleProps = z.object({
  text: ui(z.string().default('Your next address'), { label: 'Text', control: 'textarea', group: 'Content' }),
  effect: ui(z.enum(['plain', 'shimmer', 'slit', 'blurIn', 'rotate']).default('slit'), { label: 'Effect', group: 'Style', help: 'rotate: words separated by | take turns in one slot' }),
  size: ui(z.number().min(24).max(240).default(110), { label: 'Size', control: 'slider', step: 2, unit: 'px', group: 'Style' }),
  weight: ui(z.number().min(200).max(900).default(640), { label: 'Weight', control: 'slider', step: 20, group: 'Style' }),
  color: colorField('Colour', 'ivory'),
  y: posY(520, 'Vertical position'),
  align: ui(z.enum(['center', 'left']).default('center'), { label: 'Align', group: 'Layout' }),
});
const Title: React.FC<z.infer<typeof titleProps> & { durationInFrames: number }> = (p) => {
  const C = useKitTheme();
  const color = tokenColor(p.color, C);
  const box: React.CSSProperties = { position: 'absolute', top: p.y, left: 80, right: 80, textAlign: p.align, display: 'flex', justifyContent: p.align === 'center' ? 'center' : 'flex-start' };
  if (p.effect === 'shimmer') return <div style={box}><ShimmerText text={p.text} at={6} size={p.size} weight={p.weight} color={color} /></div>;
  if (p.effect === 'slit') return <div style={box}><SlitLine text={p.text} at={2} size={p.size} weight={p.weight} color={color} /></div>;
  if (p.effect === 'blurIn') return <div style={box}><BlurInText text={p.text} at={2} size={p.size} weight={p.weight} color={color} align={p.align} /></div>;
  if (p.effect === 'rotate') {
    const words = p.text.split('|').map((w) => w.trim()).filter(Boolean);
    const step = Math.max(12, Math.floor(p.durationInFrames / Math.max(1, words.length)));
    return <div style={{ ...box, display: 'block' }}><WordRotate words={words.map((t, i) => ({ t, at: 4 + i * step }))} size={p.size} weight={p.weight} color={color} align={p.align} /></div>;
  }
  return <div style={{ ...box, fontFamily: C.fontHead, fontSize: p.size, fontWeight: p.weight, color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{p.text}</div>;
};

// ── Captions ────────────────────────────────────────────────────────────────
const captionsProps = z.object({
  source: ui(z.enum(['voice', 'text']).default('voice'), { label: 'Words from', group: 'Content', help: 'voice: the project voiceover’s word timings (falls back to the text until there is a voice) · text: spread the text below evenly' }),
  text: ui(z.string().default('Toh suniye, *54D* Sarabha Nagar.'), { label: 'Text (when “Words from” is text)', control: 'textarea', group: 'Content', help: '*word* marks a hero word' }),
  wordSeconds: ui(z.number().min(0.15).max(1.2).default(0.36), { label: 'Seconds per word (text)', control: 'slider', step: 0.01, group: 'Timing' }),
  preset: ui(z.enum(PRESET_IDS).default('dhunna-steel'), { label: 'Preset', group: 'Style' }),
  overrides: ui(captionStyleSchema.partial().default({}), { label: 'Adjust preset', group: 'Style', advanced: true }),
});

// ── Figures ─────────────────────────────────────────────────────────────────
const statsProps = z.object({
  items: ui(
    z.array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() })).min(1).max(4).default([{ value: '82', unit: 'ft', label: 'Front' }, { value: '80', unit: 'ft', label: 'Road' }]),
    { label: 'Figures (from the brief only)', group: 'Content' },
  ),
  stagger: ui(z.number().int().min(0).max(60).default(18), { label: 'Gap between figures', control: 'frames', group: 'Timing' }),
  x: posX(90, 'Left'),
  y: posY(760, 'Top'),
});

// ── Location ────────────────────────────────────────────────────────────────
const iconEnum = z.enum(KIT_ICON_NAMES as [KitIconName, ...KitIconName[]]);
const calloutProps = z.object({
  text: ui(z.string().default('Double-height showroom'), { label: 'Label', group: 'Content' }),
  icon: ui(iconEnum.default('storefront'), { label: 'Icon', control: 'icon', group: 'Content' }),
  x: posX(420, 'Point X'),
  y: posY(1030, 'Point Y'),
  side: ui(z.enum(['right', 'left']).default('right'), { label: 'Label side', group: 'Layout' }),
  rise: ui(z.number().min(-400).max(400).default(-160), { label: 'Line rise', control: 'slider', step: 5, unit: 'px', group: 'Layout' }),
  length: ui(z.number().min(20).max(400).default(80), { label: 'Line length', control: 'slider', step: 5, unit: 'px', group: 'Layout' }),
});
const ringsProps = z.object({
  x: posX(540, 'Centre X'),
  y: posY(1060, 'Centre Y'),
  rings: ui(z.array(z.object({ r: z.number().min(40).max(520), label: z.string() })).min(1).max(4).default([{ r: 170, label: 'Sarabha Nagar' }, { r: 330, label: 'Ludhiana' }]), { label: 'Rings (labels from the brief only)', group: 'Content' }),
  angle: ui(z.number().min(-180).max(180).default(-35), { label: 'Label angle', control: 'slider', step: 5, unit: '°', group: 'Layout' }),
});
const routeProps = z.object({
  d: ui(z.string().default('M180 1560 C 300 1380, 260 1210, 470 1150 S 760 990, 760 820'), { label: 'Route', control: 'path', group: 'Content' }),
  endText: ui(z.string().default('54D, Sarabha Nagar'), { label: 'Destination label', group: 'Content' }),
  icon: ui(iconEnum.default('buildings'), { label: 'Icon', control: 'icon', group: 'Content' }),
  drawFrames: ui(z.number().int().min(10).max(150).default(46), { label: 'Draw time', control: 'frames', group: 'Timing' }),
});

// ── Effects ─────────────────────────────────────────────────────────────────
const leakProps = z.object({ from: ui(z.enum(['left', 'right']).default('left'), { label: 'From', group: 'Style' }), strength: unit01('Strength', 0.55) });
const vignetteProps = z.object({ amount: unit01('Amount', 0.4) });

// ── Brand ───────────────────────────────────────────────────────────────────
const logoProps = z.object({
  logo: media('Logo (empty = brand logo)', 'image', ''),
  width: ui(z.number().min(200).max(1000).default(640), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  y: posY(860, 'Vertical position'),
  mode: ui(z.enum(['brand', 'mask', 'image']).default('brand'), { label: 'Finish', group: 'Style', help: 'brand: the theme decides · mask: repaint in metal · image: as is' }),
});
const depthRevealProps = z.object({
  src: media('Image', 'image', 'samples/r-golden.jpg'),
  depth: media('Depth map', 'image', 'samples/r-golden-depth.png'),
  revealFrames: ui(z.number().int().min(10).max(150).default(44), { label: 'Reveal time', control: 'frames', group: 'Timing' }),
  width: ui(z.number().min(300).max(1080).default(900), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  height: ui(z.number().min(300).max(1920).default(1180), { label: 'Height', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  left: posX(90, 'Left'),
  top: posY(420, 'Top'),
  radius: ui(z.number().min(0).max(80).default(28), { label: 'Corner radius', control: 'slider', step: 1, unit: 'px', group: 'Style' }),
});

const Logo: React.FC<z.infer<typeof logoProps>> = (p) => {
  const C = useKitTheme();
  const logo = p.logo || C.logo;
  const mode = p.mode === 'brand' ? C.logoMode : p.mode;
  const ratio = p.logo ? 0.3 : C.logoRatio;
  return (
    <div style={{ position: 'absolute', top: p.y, left: (1080 - p.width) / 2 }}>
      <LogoReveal logo={logo} ratio={ratio} start={4} width={p.width} mode={mode} />
    </div>
  );
};

const VideoClip: React.FC<z.infer<typeof videoProps>> = (p) => {
  const { fps } = useVideoConfig();
  const C = useKitTheme();
  if (!p.src) return <AbsoluteFill style={{ background: C.deep, color: C.dim, display: 'grid', placeItems: 'center', fontFamily: C.fontHead, fontSize: 40 }}>Choose a video</AbsoluteFill>;
  const clip = <OffthreadVideo src={src(p.src)} startFrom={Math.round(p.startAt * fps)} volume={p.volume} style={{ width: '100%', height: '100%', objectFit: p.fit }} />;
  return <AbsoluteFill>{p.grade ? <Grade>{clip}</Grade> : clip}</AbsoluteFill>;
};


// ── More components (wrapping src/pro and src/components) ───────────────────
// Some pro components count time in 30 fps "film frames" (useT), so their cue frames are converted here.
const film = (frames: number, c: RenderCtx) => (frames * 30) / c.fps;
const textField = (label: string, def: string, control: 'text' | 'textarea' = 'text') => ui(z.string().default(def), { label, control, group: 'Content' });
const pictureList = (def: { src: string; label: string }[]) =>
  ui(z.array(z.object({ src: media('Picture', 'image'), label: z.string().default('Concept visualisation') })).min(1).max(8).default(def), { label: 'Pictures', group: 'Content' });

const headingProps = z.object({
  light: textField('Light words', 'Your next'),
  accent: textField('Accent words', 'address'),
  size: ui(z.number().min(40).max(200).default(104), { label: 'Size', control: 'slider', step: 2, unit: 'px', group: 'Style' }),
  y: posY(250, 'Vertical position'),
  stagger: ui(z.number().int().min(0).max(30).default(5), { label: 'Gap between words', control: 'frames', group: 'Timing' }),
});
const placeProps = z.object({ text: textField('Place', 'Sarabha Nagar, Ludhiana') });
const tickerProps = z.object({
  value: textField('Number', '82'),
  size: ui(z.number().min(40).max(400).default(200), { label: 'Size', control: 'slider', step: 2, unit: 'px', group: 'Style' }),
  color: colorField('Colour', 'ivory'),
  rollFrames: ui(z.number().int().min(4).max(60).default(22), { label: 'Roll time', control: 'frames', group: 'Timing' }),
  x: posX(540, 'Centre X'),
  y: posY(800, 'Top'),
});
const checklistProps = z.object({
  title: textField('Title', 'Inside the building'),
  items: ui(z.array(z.object({ icon: ui(iconEnum.default('check-circle' as KitIconName), { label: 'Icon', control: 'icon' }), text: z.string().default('Item') })).min(1).max(8).default([
    { icon: 'car' as KitIconName, text: 'Basement parking' },
    { icon: 'elevator' as KitIconName, text: 'Lifts to every floor' },
    { icon: 'storefront' as KitIconName, text: 'Double-height showrooms' },
  ]), { label: 'Items (from the brief only)', group: 'Content' }),
  stagger: ui(z.number().int().min(4).max(60).default(16), { label: 'Gap between items', control: 'frames', group: 'Timing' }),
  x: posX(90, 'Left'),
  y: posY(620, 'Top'),
  width: ui(z.number().min(400).max(1000).default(900), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
});
const togglesProps = z.object({
  items: ui(z.array(z.object({ line1: z.string().default('Benefit'), line2: z.string().default(''), icon: ui(iconEnum.default('check-circle' as KitIconName), { label: 'Icon', control: 'icon' }) })).min(1).max(4).default([
    { line1: 'Prime', line2: 'frontage', icon: 'storefront' as KitIconName },
    { line1: 'Basement', line2: 'parking', icon: 'car' as KitIconName },
  ]), { label: 'Toggles (from the brief only)', group: 'Content' }),
  stagger: ui(z.number().int().min(4).max(60).default(20), { label: 'Gap between toggles', control: 'frames', group: 'Timing' }),
  x: posX(110, 'Left'),
  y: posY(600, 'Top'),
  rowGap: ui(z.number().min(140).max(320).default(210), { label: 'Row spacing', control: 'slider', step: 5, unit: 'px', group: 'Layout' }),
});
const carouselProps = z.object({
  pictures: pictureList([{ src: 'samples/s-double-height.jpg', label: 'Showroom' }, { src: 'samples/o-open-plan.jpg', label: 'Offices' }, { src: 'samples/b-parking.jpg', label: 'Parking' }]),
  every: ui(z.number().int().min(10).max(150).default(36), { label: 'Time per picture', control: 'frames', group: 'Timing' }),
});
const sidePairProps = z.object({
  a: media('Left picture', 'image', 'samples/s-double-height.jpg'),
  aLabel: textField('Left label', 'Showroom'),
  b: media('Right picture', 'image', 'samples/o-open-plan.jpg'),
  bLabel: textField('Right label', 'Offices'),
  bAt: ui(z.number().int().min(0).max(120).default(18), { label: 'Right card lands at', control: 'frames', group: 'Timing' }),
});
const textBehindProps = z.object({
  src: media('Picture', 'image', 'samples/r-statue-tight.jpg'),
  cutout: media('Subject cut-out (transparent PNG)', 'image', 'samples/r-statue-tight-cutout.png'),
  word: textField('Word', '54D'),
  size: ui(z.number().min(80).max(420).default(230), { label: 'Size', control: 'slider', step: 2, unit: 'px', group: 'Style' }),
  wordY: ui(z.number().min(0).max(0.9).default(0.3), { label: 'Word height', control: 'slider', step: 0.01, group: 'Layout' }),
  wordX: ui(z.number().min(-400).max(400).default(0), { label: 'Word sideways', control: 'slider', step: 2, unit: 'px', group: 'Layout' }),
  label: textField('Card label', 'Concept visualisation'),
});
const lensProps = z.object({
  src: media('Picture', 'image', 'samples/r-golden.jpg'),
  showPicture: ui(z.boolean().default(true), { label: 'Show the picture', group: 'Content', help: 'off: only the loupe, over a picture on a track below (same box)' }),
  zoom: ui(z.number().min(1.2).max(5).default(2.2), { label: 'Magnification', control: 'slider', step: 0.1, group: 'Style' }),
  r: ui(z.number().min(60).max(320).default(150), { label: 'Lens size', control: 'slider', step: 5, unit: 'px', group: 'Style' }),
  startX: ui(z.number().min(0).max(1).default(0.25), { label: 'Start X', control: 'slider', step: 0.01, group: 'Motion' }),
  startY: ui(z.number().min(0).max(1).default(0.4), { label: 'Start Y', control: 'slider', step: 0.01, group: 'Motion' }),
  endX: ui(z.number().min(0).max(1).default(0.7), { label: 'End X', control: 'slider', step: 0.01, group: 'Motion' }),
  endY: ui(z.number().min(0).max(1).default(0.55), { label: 'End Y', control: 'slider', step: 0.01, group: 'Motion' }),
  width: ui(z.number().min(300).max(1080).default(920), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  height: ui(z.number().min(300).max(1920).default(1100), { label: 'Height', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  left: posX(80, 'Left'),
  top: posY(420, 'Top'),
});
const spotlightProps = z.object({ sweepFrames: ui(z.number().int().min(10).max(120).default(36), { label: 'Sweep time', control: 'frames', group: 'Timing' }) });
const beamProps = z.object({
  x1: posX(200, 'From X'),
  y1: posY(1300, 'From Y'),
  x2: posX(860, 'To X'),
  y2: posY(700, 'To Y'),
  curve: ui(z.number().min(-1).max(1).default(-0.25), { label: 'Curve', control: 'slider', step: 0.01, group: 'Layout' }),
  drawFrames: ui(z.number().int().min(6).max(90).default(26), { label: 'Draw time', control: 'frames', group: 'Timing' }),
});
const SHAPE_IDS = Object.keys(MORPH_SHAPES) as [keyof typeof MORPH_SHAPES, ...(keyof typeof MORPH_SHAPES)[]];
const morphProps = z.object({
  steps: ui(z.array(z.object({ shape: z.enum(SHAPE_IDS).default('pin'), label: z.string().default('') })).min(2).max(6).default([
    { shape: 'pin', label: 'Location' },
    { shape: 'building', label: 'Building' },
    { shape: 'house', label: 'Home' },
  ]), { label: 'Shapes', group: 'Content' }),
  every: ui(z.number().int().min(10).max(120).default(30), { label: 'Time per shape', control: 'frames', group: 'Timing' }),
  size: ui(z.number().min(160).max(800).default(420), { label: 'Size', control: 'slider', step: 10, unit: 'px', group: 'Style' }),
  fill: ui(z.enum(['metal', 'outline']).default('metal'), { label: 'Finish', group: 'Style' }),
  y: posY(640, 'Top'),
});
const gridProps = z.object({ opacity: ui(z.number().min(0.01).max(0.2).default(0.065), { label: 'Strength', control: 'slider', step: 0.005, group: 'Style' }) });
const eyeProps = z.object({
  x: posX(130, 'Left'),
  y: posY(300, 'Top'),
  width: ui(z.number().min(300).max(1000).default(820), { label: 'Width', control: 'slider', step: 10, unit: 'px', group: 'Layout' }),
  blinkAt: ui(z.number().int().min(0).max(300).default(40), { label: 'Blink at', control: 'frames', group: 'Timing' }),
  opacity: unit01('Strength', 0.92),
});
const pinProps = z.object({ x: posX(750, 'X'), y: posY(1080, 'Y'), opacity: unit01('Strength', 0.94) });
const ctaProps = z.object({
  label: textField('Button', 'Message us'),
  logo: media('Logo (empty = brand logo)', 'image', ''),
  pressAt: ui(z.number().int().min(0).max(300).default(36), { label: 'Button press at', control: 'frames', group: 'Timing' }),
  y: posY(1395, 'Top'),
});
const wordmarkProps = z.object({ logo: media('Logo (empty = brand logo)', 'image', '') });

const Ticker: React.FC<z.infer<typeof tickerProps>> = (p) => {
  const C = useKitTheme();
  return <NumberTicker value={p.value} at={6} dur={p.rollFrames} size={p.size} color={tokenColor(p.color, C)} style={{ position: 'absolute', left: 0, width: p.x * 2, top: p.y, display: 'flex', justifyContent: 'center' }} />;
};

const LensItem: React.FC<z.infer<typeof lensProps> & { durationInFrames: number }> = (p) => {
  const C = useKitTheme();
  return (
    <>
      {p.showPicture ? (
        <div style={{ position: 'absolute', left: p.left, top: p.top, width: p.width, height: p.height, borderRadius: 28, overflow: 'hidden', border: `1.5px solid ${C.hair}`, boxShadow: `0 36px 70px ${C.shadow}` }}>
          <Img src={asset(p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}
      <Lens src={p.src} w={p.width} h={p.height} left={p.left} top={p.top} at={6} dur={Math.max(12, p.durationInFrames - 12)} path={[[p.startX, p.startY], [p.endX, p.endY]]} zoom={p.zoom} r={p.r} />
    </>
  );
};

const BrandLogo: React.FC<{ logo: string; children: (logo: string) => React.ReactNode }> = ({ logo, children }) => {
  const C = useKitTheme();
  return <>{children(logo || C.logo)}</>;
};

const MORE: RegistryEntry[] = [
  entry({ type: 'heading', label: 'Two-weight heading', category: 'Text', description: 'Light words and accent words landing one by one', defaultDuration: 90, props: headingProps, render: (p, c) => {
    const words = [...p.light.split(/\s+/).filter(Boolean).map((t) => ({ t, role: 'light' as const })), ...p.accent.split(/\s+/).filter(Boolean).map((t) => ({ t, role: 'accent' as const }))];
    return <Heading lines={[words.map((w, i) => ({ ...w, at: film(2 + i * p.stagger, c) }))]} from={0} to={film(c.durationInFrames, c)} y={p.y} size={p.size} />;
  } }),
  entry({ type: 'place', label: 'Place line', category: 'Text', description: 'A small tracked place name under a light rule', defaultDuration: 75, props: placeProps, render: (p, c) => <Place from={film(2, c)} to={film(c.durationInFrames, c)} text={p.text} /> }),
  entry({ type: 'ticker', label: 'Number ticker', category: 'Figures', description: 'One big number rolling into place', defaultDuration: 75, props: tickerProps, render: (p) => <Ticker {...p} /> }),
  entry({ type: 'checklist', label: 'Checklist', category: 'Lists', description: 'A card of items, each ticked on its cue', defaultDuration: 120, props: checklistProps, render: (p, c) => {
    const items = p.items.map((it, i) => ({ icon: it.icon, text: it.text, at: 10 + i * p.stagger }));
    return <Checklist title={p.title} items={items} end={Math.max(items[items.length - 1].at + 20, c.durationInFrames - 10)} style={{ position: 'absolute', left: p.x, top: p.y, width: p.width }} />;
  } }),
  entry({ type: 'toggles', label: 'Toggle pills', category: 'Lists', description: '2–4 benefits switching on, one by one', defaultDuration: 120, props: togglesProps, render: (p) => (
    <TogglePills items={p.items.map((it, i) => ({ label: [it.line1, it.line2 || undefined], icon: it.icon, at: 14 + i * p.stagger }) as ToggleItem)} startFrame={2} top={p.y} left={p.x} rowGap={p.rowGap} />
  ) }),
  entry({ type: 'carousel', label: 'Carousel', category: 'Picture', description: 'Cards advancing one picture at a time', defaultDuration: 150, props: carouselProps, render: (p, c) => (
    <Carousel items={p.pictures.map((m) => ({ image: m.src, label: m.label }))} steps={p.pictures.slice(1).map((_, i) => film((i + 1) * p.every, c))} dur={film(c.durationInFrames, c)} />
  ) }),
  entry({ type: 'sidePair', label: 'Side-by-side cards', category: 'Picture', description: 'Two picture cards, the second landing on its cue', defaultDuration: 105, props: sidePairProps, render: (p, c) => (
    <SidePair a={{ image: p.a, label: p.aLabel }} b={{ image: p.b, label: p.bLabel }} bAt={film(p.bAt, c)} dur={film(c.durationInFrames, c)} />
  ) }),
  entry({ type: 'textBehind', label: 'Word behind subject', category: 'Picture', description: 'A word placed between the picture and its cut-out subject', defaultDuration: 105, props: textBehindProps, render: (p, c) => (
    <TextBehind src={p.src} cutout={p.cutout} word={p.word} at={film(10, c)} dur={film(c.durationInFrames, c)} size={p.size} wordY={p.wordY} wordX={p.wordX} label={p.label} />
  ) }),
  entry({ type: 'lens', label: 'Magnifier', category: 'Picture', description: 'A loupe gliding over a picture, magnified inside', defaultDuration: 105, props: lensProps, render: (p, c) => <LensItem {...p} durationInFrames={c.durationInFrames} /> }),
  entry({ type: 'spotlight', label: 'Spotlight', category: 'Effect', description: 'A soft cone of light sweeping once across the frame', defaultDuration: 45, props: spotlightProps, render: (p) => <Spotlight at={2} dur={p.sweepFrames} /> }),
  entry({ type: 'beam', label: 'Beam', category: 'Graphics', description: 'A curved line drawing between two points, then a light running it', defaultDuration: 60, props: beamProps, render: (p) => <AnimatedBeam from={[p.x1, p.y1]} to={[p.x2, p.y2]} at={4} curve={p.curve} dur={p.drawFrames} /> }),
  entry({ type: 'shapeMorph', label: 'Shape morph', category: 'Graphics', description: 'One outline becoming the next (pin → building → home)', defaultDuration: 120, props: morphProps, render: (p) => (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <ShapeMorph shapes={p.steps.map((x) => MORPH_SHAPES[x.shape])} at={p.steps.map((_, i) => 6 + i * p.every)} labels={p.steps.some((x) => x.label) ? p.steps.map((x) => x.label) : undefined} size={p.size} fill={p.fill} style={{ position: 'absolute', top: p.y }} />
    </AbsoluteFill>
  ) }),
  entry({ type: 'archGrid', label: 'Architect grid', category: 'Background', description: 'A faint drifting architectural grid over the background', defaultDuration: 150, props: gridProps, render: (p) => <ArchGrid opacity={p.opacity} /> }),
  entry({ type: 'wireEye', label: 'Wireframe eye', category: 'Graphics', description: 'A wireframe eye that traces in and blinks, behind "vision" lines', defaultDuration: 90, props: eyeProps, render: (p, c) => <WireEye start={0} end={c.durationInFrames - 1} x={p.x} y={p.y} w={p.width} blinkAt={p.blinkAt} opacity={p.opacity} /> }),
  entry({ type: 'wirePin', label: 'Wireframe pin', category: 'Graphics', description: 'A wireframe map pin over a ground grid', defaultDuration: 90, props: pinProps, render: (p, c) => <WirePin start={0} end={c.durationInFrames - 1} from={[p.x, p.y]} opacity={p.opacity} /> }),
  entry({ type: 'cta', label: 'Call to action', category: 'Brand', description: 'Wordmark and a button that gets pressed on its cue', defaultDuration: 90, props: ctaProps, render: (p, c) => (
    <BrandLogo logo={p.logo}>{(logo) => <CTA from={film(2, c)} press={film(p.pressAt, c)} logo={logo} label={p.label} top={p.y} />}</BrandLogo>
  ) }),
  entry({ type: 'wordmark', label: 'End wordmark', category: 'Brand', description: 'The wordmark alone, large, with one gleam', defaultDuration: 75, props: wordmarkProps, render: (p, c) => <BrandLogo logo={p.logo}>{(logo) => <Wordmark from={film(2, c)} logo={logo} />}</BrandLogo> }),
];

export const REGISTRY: RegistryEntry[] = [
  entry({ type: 'background', label: 'Background', category: 'Background', description: 'Animated brand background (shader) or a solid colour', defaultDuration: 150, props: backgroundProps, render: (p) => <Background {...p} /> }),
  entry({ type: 'image', label: 'Full-frame picture', category: 'Picture', description: 'A photo filling the frame, with zoom, drift, grade and vignette', defaultDuration: 120, props: imageProps, render: (p, c) => <Picture {...p} durationInFrames={c.durationInFrames} /> }),
  entry({ type: 'card', label: 'Picture card', category: 'Picture', description: 'A photo on a printed card that lands in the frame', defaultDuration: 90, props: cardProps, render: (p) => <PhotoCard src={p.src} label={p.label} at={8} w={p.width} h={p.height} x={p.x} y={p.y} from={p.enterFrom} tilt={p.tilt} /> }),
  entry({ type: 'video', label: 'Video clip', category: 'Picture', description: 'A video clip filling the frame, optionally graded', defaultDuration: 120, props: videoProps, render: (p) => <VideoClip {...p} /> }),
  entry({ type: 'title', label: 'Title', category: 'Text', description: 'A heading with an entrance effect', defaultDuration: 75, props: titleProps, render: (p, c) => <Title {...p} durationInFrames={c.durationInFrames} /> }),
  entry({
    type: 'captions',
    label: 'Captions',
    category: 'Captions',
    description: 'Word-timed captions from the voiceover or from text, in any caption preset',
    defaultDuration: 300,
    props: captionsProps,
    render: (p, c) => {
      const style = { ...presetById(p.preset).style, ...p.overrides };
      // voice words are timed on the whole film: shift them into this item's local time. A project without a voice
      // yet falls back to the text, so a newly added caption layer is never silently empty.
      const useVoice = p.source === 'voice' && c.voiceWords.length > 0;
      const words = useVoice ? c.voiceWords : spread(p.text, 0.3, undefined, p.wordSeconds);
      return <CaptionTrack words={words} style={style} offset={useVoice ? -c.from / c.fps : 0} />;
    },
  }),
  entry({ type: 'stats', label: 'Figures', category: 'Figures', description: '2–4 numbers ticking in, with unit and label', defaultDuration: 90, props: statsProps, render: (p) => <StatGrid items={p.items.map((s, i) => ({ ...s, at: 10 + i * p.stagger }))} style={{ position: 'absolute', left: p.x, top: p.y }} /> }),
  entry({ type: 'callout', label: 'Callout', category: 'Location', description: 'A point on the picture, a leader line and a label chip', defaultDuration: 75, props: calloutProps, render: (p) => <Callout point={[p.x, p.y]} text={p.text} icon={p.icon} at={4} side={p.side} rise={p.rise} length={p.length} /> }),
  entry({ type: 'rings', label: 'Distance rings', category: 'Location', description: 'Rings opening from the site, each with a label', defaultDuration: 90, props: ringsProps, render: (p) => <DistanceRings x={p.x} y={p.y} start={4} angle={p.angle} rings={p.rings.map((r, i) => ({ ...r, at: 12 + i * 22 }))} /> }),
  entry({ type: 'route', label: 'Route', category: 'Location', description: 'A route that draws itself to a pinned destination', defaultDuration: 90, props: routeProps, render: (p) => <RouteDraw d={p.d} at={6} dur={p.drawFrames} end={{ text: p.endText, icon: p.icon }} /> }),
  entry({ type: 'depthReveal', label: 'Depth reveal', category: 'Picture', description: 'A photo that builds in near → far from its depth map', defaultDuration: 90, props: depthRevealProps, render: (p) => <DepthReveal src={p.src} depth={p.depth} at={4} dur={p.revealFrames} w={p.width} h={p.height} left={p.left} top={p.top} radius={p.radius} /> }),
  entry({ type: 'lightLeak', label: 'Light leak', category: 'Effect', description: 'A brand-tinted light leak across the frame (once per film)', defaultDuration: 30, props: leakProps, render: (p, c) => <LightLeak at={Math.floor(c.durationInFrames / 2)} dur={c.durationInFrames} from={p.from} strength={p.strength} /> }),
  entry({ type: 'vignette', label: 'Vignette', category: 'Effect', description: 'Soft edge darkening', defaultDuration: 150, props: vignetteProps, render: (p) => <Vignette amount={p.amount} /> }),
  entry({ type: 'logo', label: 'Logo reveal', category: 'Brand', description: 'The brand mark revealed in metal or as is', defaultDuration: 90, props: logoProps, render: (p) => <Logo {...p} /> }),
  ...MORE,
];

export const registryByType = (type: string) => REGISTRY.find((e) => e.type === type);
