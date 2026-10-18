// Front door: production components (src/pro), verified in delivered films and themed via KitThemeProvider.
// See CATALOG.md. The older generic components live under `legacy` (see AUDIT.md for why, and what replaces each).
export * from './pro';
export * from './captions';
export * from './type';
export * as legacy from './components';
export * as legacyPresets from './presets';
export * as legacyEngine from './engine';
export type * from './types';
export * as anim from './lib/anim';
