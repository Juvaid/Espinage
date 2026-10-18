import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CaptionTrack } from '../captions/CaptionTrack';
import { captionStyleSchema, presetById, PRESET_IDS } from '../captions/style';
import { spread, type CapWord } from '../captions/words';
import { KIT_ICON_NAMES, type KitIconName } from '../icons/KitIcon';
import { DepthReveal } from '../pro/DepthReveal';
import { Grade, LightLeak, Vignette } from '../pro/Grade';
import { Callout, DistanceRings, RouteDraw } from '../pro/Location';
import { LogoReveal } from '../pro/LogoReveal';
import { PhotoCard } from '../pro/PhotoCard';
import { SHADER_KINDS, ShaderBackdrop, type ShaderKind } from '../pro/Shaders';
import { BlurInText, ShimmerText, SlitLine, StatGrid, WordRotate } from '../pro/TextFx';
import { useKitTheme, type KitTheme } from '../theme/KitTheme';
import { colorField, posX, posY, ui, unit01 } from './controls';

// The component registry: every kit component a project (manifest) can use, with its settings schema (which doubles
// as the editor's controls), its default length and how it renders. Items render inside a <Sequence>, so frames here
// are local to the item (0 = the item's first frame).
//
// Adding a component: give it a schema with ui() controls and defaults, a render function, an entry below, and a
// showcase in the Manifest-Demo project. Never change the meaning of an existing field (saved projects use it);
// add a new one with a default instead.

export type RenderCtx = { fps: number; from: number; durationInFrames: number; voiceWords: CapWord[] };
export type RegistryEntry<S extends z.ZodObject = z.ZodObject> = {
  type: string;
  label: string;
  category: 'Background' | 'Picture' | 'Text' | 'Captions' | 'Figures' | 'Location' | 'Effect' | 'Brand';
  description: string;
  defaultDuration: number; // frames at 30 fps
  props: S;
  render: (props: z.infer<S>, ctx: RenderCtx) => React.ReactNode;
};
const entry = <S extends z.ZodObject>(e: RegistryEntry<S>) => e as unknown as RegistryEntry;

const tokenColor = (c: string, C: KitTheme) =>
  (({ ivory: C.ivory, dim: C.dim, accent: C.accent, deep: C.deep, ground: C.ground, glow: C.glow }) as Record<string, string>)[c] ?? c;
const media = (label: string, accept: 'image' | 'video' | 'audio', def = '') => ui(z.string().default(def), { label, control: 'media', accept, group: 'Content' });
const src = (p: string) => (/^https?:\/\//.test(p) ? p : staticFile(p));

// ── Background ──────────────────────────────────────────────────────────────
const backgroundProps = z.object({
  mode: ui(z.enum(['shader', 'solid']).default('shader'), { label: 'Type', group: 'Style' }),
  shader: ui(z.enum(SHADER_KINDS as [ShaderKind, ...ShaderKind[]]).default('mesh'), { label: 'Look', group: 'Style', help: 'mesh · silk · metal · aurora · rays · contour' }),
  energy: unit01('Energy', 0.5),
  speed: ui(z.number().min(0.2).max(3).default(1), { label: 'Speed', control: 'slider', step: 0.1, group: 'Style' }),
  seed: ui(z.number().int().min(0).max(99).default(0), { label: 'Variation', control: 'slider', step: 1, group: 'Style' }),
  color: colorField('Colour (solid)', 'ground'),
});
const Background: React.FC<z.infer<typeof backgroundProps>> = (p) => {
  const C = useKitTheme();
  if (p.mode === 'solid') return <AbsoluteFill style={{ background: tokenColor(p.color, C) }} />;
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
];

export const registryByType = (type: string) => REGISTRY.find((e) => e.type === type);
