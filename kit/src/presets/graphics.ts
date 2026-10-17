import {
  AtmosphereConfig,
  ChecklistCardConfig,
  MetricCounterConfig,
  PhotoCardConfig,
  TagMarkerConfig,
} from '../types/graphics';

export const DEFAULT_CHECKLIST_CONFIG: ChecklistCardConfig = {
  title: 'PREMIUM SPECIFICATIONS',
  items: [
    {text: 'Dedicated High-Speed Elevator', atFrame: 15, icon: 'lift'},
    {text: 'Dual-Aspect Panoramic Views', atFrame: 35, icon: 'view'},
    {text: 'Triple-Tier 24/7 Security', atFrame: 55, icon: 'shield'},
  ],
  startFrame: 10,
  accentColor: '#DFB25A',
  width: 900,
};

export const DEFAULT_PHOTOCARD_CONFIG: PhotoCardConfig = {
  mediaUrl: '',
  label: 'ARCHITECTURAL ELEVATION',
  code: 'REF // 54-D',
  startFrame: 12,
  width: 880,
  height: 980,
  x: 540,
  y: 420,
  tilt: -1.5,
  from: 'bottom',
};

export const DEFAULT_METRIC_CONFIG: MetricCounterConfig = {
  value: 100,
  prefix: '',
  suffix: '%',
  label: 'LEASED OCCUPANCY',
  startFrame: 15,
  durationFrames: 25,
  accentColor: '#DFB25A',
  kind: 'standard',
};

export const DEFAULT_TAG_CONFIG: TagMarkerConfig = {
  text: 'EXCLUSIVE ACCESS',
  startFrame: 8,
  accentColor: '#DFB25A',
  lineWidth: 56,
};

export const DEFAULT_ATMOSPHERE_CONFIG: AtmosphereConfig = {
  grain: true,
  dust: true,
  lightLeak: true,
  vignette: true,
  opacity: 0.65,
  warmth: 'warm',
};
