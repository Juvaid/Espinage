/**
 * SFX Sound Library Presets
 * Links to the mastered impact and riser sound assets in /Volumes/disk 2/dhunnainfra-reelv3/sfx-src/
 */

export interface SfxCue {
  id: string;
  name: string;
  category: 'impact' | 'riser' | 'whoosh' | 'boom';
  path: string;
  defaultVolume: number; // Master gain (anti-slop: ≤ 0.45)
}

export const SFX_LIBRARY: Record<string, SfxCue> = {
  // Cinematic Whoosh Impacts
  whoosh_hit: {
    id: 'whoosh_hit',
    name: 'Whoosh Hit',
    category: 'whoosh',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/01 Impact/03 Whoosh Impacts/Whoosh Hit.wav',
    defaultVolume: 0.42,
  },
  quick_riser: {
    id: 'quick_riser',
    name: 'Quick Riser with Hit',
    category: 'riser',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/01 Impact/03 Whoosh Impacts/Riser with Hit.wav',
    defaultVolume: 0.38,
  },
  kshmr_impact: {
    id: 'kshmr_impact',
    name: 'Clean Bottom Impact',
    category: 'impact',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/01 Impact/03 Whoosh Impacts/KSHMR_fx_impact_clean_bottom.wav',
    defaultVolume: 0.45,
  },
  dark_hit: {
    id: 'dark_hit',
    name: 'Cinematic Dark Hit',
    category: 'impact',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/01 Impact/01 Cinematic Impacts/Dark Hit.wav',
    defaultVolume: 0.4,
  },
  deep_boom: {
    id: 'deep_boom',
    name: 'Deep Boom Hit',
    category: 'boom',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/01 Impact/01 Cinematic Impacts/Daruma_Impact Bass Drum Hit Deep Boom.wav',
    defaultVolume: 0.45,
  },
  epic_riser: {
    id: 'epic_riser',
    name: 'Epic Long Riser',
    category: 'riser',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/02 Risers/03 Long Risers/Epic Riser.wav',
    defaultVolume: 0.35,
  },
  short_riser_8: {
    id: 'short_riser_8',
    name: 'Short Riser 8',
    category: 'riser',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/02 Risers/01 Basic Risers/Riser 8.wav',
    defaultVolume: 0.35,
  },
  cymbal_riser: {
    id: 'cymbal_riser',
    name: 'Cymbal Riser',
    category: 'riser',
    path: '/Volumes/disk 2/dhunnainfra-reelv3/sfx-src/02 Risers/01 Basic Risers/Cymbal Riser A.wav',
    defaultVolume: 0.32,
  },
};
