import { z } from 'zod';

// Control metadata on a schema field: how an editor should present it. The schema stays the single source of truth —
// Remotion Studio's props panel, the Caption Studio's inspector and agents all read the same definition (and its
// JSON Schema export, scripts/export-manifest-schema.ts). Where `control` is omitted an editor infers it:
// enum → select, boolean → toggle, number with min/max → slider, number → number field, string → text.
export type ControlKind =
  | 'slider'
  | 'number'
  | 'frames' // a duration or offset in frames, shown as seconds
  | 'color' // a theme token (ivory, dim, accent, deep, ground, glow) or any CSS colour
  | 'text'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'media' // a file in the project or library (see `accept`)
  | 'icon' // a KitIcon name
  | 'path'; // an SVG path drawn on the canvas

export type ControlMeta = {
  label?: string;
  control?: ControlKind;
  step?: number;
  unit?: string;
  group?: string; // panel section, e.g. "Style", "Timing", "Layout"
  help?: string;
  accept?: 'image' | 'video' | 'audio';
  advanced?: boolean; // tucked away by default
};

/** Attach editor controls to a schema field. */
export const ui = <T extends z.ZodType>(schema: T, meta: ControlMeta): T => schema.meta(meta as Record<string, unknown>) as T;

// common fields
export const colorField = (label: string, def: string, group = 'Style') => ui(z.string().default(def), { label, control: 'color', group });
export const posX = (def = 540, label = 'X') => ui(z.number().min(0).max(1080).default(def), { label, control: 'slider', step: 1, unit: 'px', group: 'Layout' });
export const posY = (def = 960, label = 'Y') => ui(z.number().min(0).max(1920).default(def), { label, control: 'slider', step: 1, unit: 'px', group: 'Layout' });
export const unit01 = (label: string, def: number, group = 'Style') => ui(z.number().min(0).max(1).default(def), { label, control: 'slider', step: 0.01, group });
