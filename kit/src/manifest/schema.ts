import { z } from 'zod';
import { KIT_THEMES } from '../theme/KitTheme';
import { ui } from './controls';
import { motionFields, type ItemAnimate, type ItemTransform, type ItemTransition } from './motion';
import { REGISTRY } from './registry';

// A project (manifest): plain JSON a person edits in the Caption Studio, an agent can write, and the renderer plays.
//   tracks render bottom → top in array order (track 0 is the back); items on a track are placed by `from`.
// Versioned: a breaking change bumps `version` and ships a migration (migrateManifest) — saved projects must keep
// opening.
export const MANIFEST_VERSION = 1;

const THEME_IDS = Object.keys(KIT_THEMES) as [string, ...string[]];

const itemBase = {
  id: z.string().min(1),
  from: ui(z.number().int().min(0), { label: 'Starts at', control: 'frames', group: 'Timing' }),
  durationInFrames: ui(z.number().int().min(1), { label: 'Length', control: 'frames', group: 'Timing' }),
  label: ui(z.string().optional(), { label: 'Name in timeline', group: 'Timing' }),
  locked: ui(z.boolean().optional(), { label: 'Locked', help: 'locked items cannot be moved in the timeline' }),
  ...motionFields, // enter, exit, transform, animate (motion.tsx): defaults change nothing
};

export const itemSchema = z.discriminatedUnion(
  'type',
  REGISTRY.map((e) => z.object({ ...itemBase, type: z.literal(e.type), props: e.props })) as unknown as [z.ZodObject, z.ZodObject, ...z.ZodObject[]],
);

export const trackSchema = z.object({
  id: z.string().min(1),
  name: ui(z.string().default('Track'), { label: 'Track name' }),
  hidden: ui(z.boolean().default(false), { label: 'Hidden' }),
  muted: ui(z.boolean().default(false), { label: 'Muted' }),
  items: z.array(itemSchema).default([]),
});

const wordSchema = z.object({ text: z.string(), start: z.number(), end: z.number(), hero: z.boolean().optional() });

export const manifestSchema = z.object({
  version: z.literal(MANIFEST_VERSION).default(MANIFEST_VERSION),
  title: ui(z.string().default('Untitled film'), { label: 'Title', group: 'Project' }),
  theme: ui(z.enum(THEME_IDS).default('dhunna_54d'), { label: 'Brand look', group: 'Project' }),
  fps: ui(z.number().int().min(24).max(60).default(30), { label: 'Frame rate', control: 'number', unit: 'fps', group: 'Project', help: '30 for reels; 60 for smooth motion' }),
  width: z.number().int().min(240).max(4096).default(1080),
  height: z.number().int().min(240).max(4096).default(1920),
  durationInFrames: ui(z.number().int().min(1).optional(), { label: 'Length (empty = until the last item ends)', control: 'frames', group: 'Project' }),
  voice: ui(
    z
      .object({
        src: ui(z.string(), { label: 'Voiceover', control: 'media', accept: 'audio' }),
        volume: ui(z.number().min(0).max(1).default(1), { label: 'Volume', control: 'slider', step: 0.01 }),
        offset: ui(z.number().int().min(0).default(6), { label: 'Starts at', control: 'frames' }),
        words: z.array(wordSchema).default([]), // word timings (seconds from the voice's own start); captions use them
        script: ui(z.string().optional(), { label: 'Script', control: 'textarea' }),
      })
      .optional(),
    { label: 'Voiceover', group: 'Sound' },
  ),
  music: ui(
    z
      .object({
        src: ui(z.string(), { label: 'Music', control: 'media', accept: 'audio' }),
        volume: ui(z.number().min(0).max(1).default(0.12), { label: 'Volume', control: 'slider', step: 0.01 }),
        startAt: ui(z.number().min(0).default(0), { label: 'Start inside the track', control: 'number', step: 0.1, unit: 's' }),
      })
      .optional(),
    { label: 'Music', group: 'Sound' },
  ),
  tracks: z.array(trackSchema).default([]),
});

// The union is built from the registry at runtime, so its static type is spelled out here.
export type ManifestItem = {
  id: string;
  type: string;
  from: number;
  durationInFrames: number;
  label?: string;
  locked?: boolean;
  // filled with no-op defaults by parseManifest; an editor may hold items without them
  enter?: ItemTransition;
  exit?: ItemTransition;
  transform?: ItemTransform;
  animate?: ItemAnimate;
  props: Record<string, unknown>;
};
export type ManifestTrack = Omit<z.infer<typeof trackSchema>, 'items'> & { items: ManifestItem[] };
export type Manifest = Omit<z.infer<typeof manifestSchema>, 'tracks'> & { tracks: ManifestTrack[] };

/** Total length: the explicit length, or until the last item (or the voice) ends; at least 1 frame. */
export const manifestDuration = (m: Manifest) => {
  if (m.durationInFrames) return m.durationInFrames;
  let end = 1;
  for (const t of m.tracks) for (const i of t.items) end = Math.max(end, i.from + i.durationInFrames);
  if (m.voice?.words.length) end = Math.max(end, m.voice.offset + Math.ceil((m.voice.words[m.voice.words.length - 1].end + 1) * m.fps));
  return end;
};

/** Older saved projects → the current version (none yet; the hook is here so a schema change can't strand projects). */
export const migrateManifest = (raw: unknown): unknown => raw;

/** Parse and fill defaults; on failure returns readable problems (path → message) instead of throwing. */
export const parseManifest = (raw: unknown): { ok: true; manifest: Manifest } | { ok: false; problems: string[] } => {
  const r = manifestSchema.safeParse(migrateManifest(raw));
  if (r.success) return { ok: true, manifest: r.data as unknown as Manifest };
  return { ok: false, problems: r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
};

/** A new item of a registered type with its defaults, placed at `from`. */
export const newItem = (type: string, from: number, id: string): ManifestItem => {
  const e = REGISTRY.find((x) => x.type === type);
  if (!e) throw new Error(`Unknown component "${type}"`);
  return { id, type, from, durationInFrames: e.defaultDuration, props: e.props.parse({}) } as ManifestItem;
};
