import { REGISTRY } from '../manifest/registry';
import type { Manifest } from '../manifest/schema';

// Every registered component with its default settings, 60 frames each, over a background: the visual check that a
// newly added component renders from defaults alone (what a person gets when they add it in the editor).
const SLOT = 60;
const parts = REGISTRY.filter((e) => e.type !== 'background');
export const ALL_COMPONENTS_MANIFEST = {
  version: 1,
  title: 'Every component, defaults only',
  theme: 'dhunna_54d',
  fps: 30,
  width: 1080,
  height: 1920,
  tracks: [
    { id: 'bg', name: 'Background', items: [{ id: 'bg', type: 'background', from: 0, durationInFrames: SLOT * parts.length, props: {} }] },
    { id: 'all', name: 'Components', items: parts.map((e, i) => ({ id: e.type, type: e.type, from: i * SLOT, durationInFrames: SLOT, label: e.label, props: {} })) },
  ],
} as unknown as Manifest;
export const ALL_COMPONENT_TYPES = parts.map((e) => e.type);
