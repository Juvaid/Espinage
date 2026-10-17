import {CaptionPresetConfig, TimedWord} from './captions';
import {
  AtmosphereConfig,
  CadGridConfig,
  ChecklistCardConfig,
  Coin3DConfig,
  DeckCarouselConfig,
  FloorHighlightConfig,
  LogoSaberConfig,
  MapRouteConfig,
  MetricCounterConfig,
  PhotoCardConfig,
  SvgIconConfig,
  TagMarkerConfig,
  TrackedPinConfig,
  TriptychConfig,
  WireframeTowerConfig,
} from './graphics';

export interface ReelTheme {
  id: string;
  name: string;
  ground: string;      // Near-black or background color
  accent: string;      // Gold, Champagne, Electric Yellow, Cyan, etc.
  accentGlow: string;
  ivory: string;       // Primary text
  muted: string;       // Secondary text
  hairline: string;    // Subtle border
  fontFamilyHead: string;
  fontFamilyBody: string;
}

export type SceneGraphic =
  | {type: 'checklist'; config: ChecklistCardConfig}
  | {type: 'photoCard'; config: PhotoCardConfig}
  | {type: 'metric'; config: MetricCounterConfig}
  | {type: 'tag'; config: TagMarkerConfig}
  | {type: 'svgIcon'; config: SvgIconConfig}
  | {type: 'cadGrid'; config: CadGridConfig}
  | {type: 'mapRoute'; config: MapRouteConfig}
  | {type: 'trackedPin'; config: TrackedPinConfig}
  | {type: 'carousel'; config: DeckCarouselConfig}
  | {type: 'triptych'; config: TriptychConfig}
  | {type: 'floorHighlight'; config: FloorHighlightConfig}
  | {type: 'coin3D'; config: Coin3DConfig}
  | {type: 'wireframe3D'; config: WireframeTowerConfig}
  | {type: 'logoSaber'; config: LogoSaberConfig};

/** Declarative Scene Manifest for Agents and Human Editors */
export interface SceneManifest {
  id: string;
  durationFrames: number;
  theme?: string | ReelTheme;
  captionPreset?: string | CaptionPresetConfig;
  words?: TimedWord[];
  graphics?: SceneGraphic[];
  atmosphere?: AtmosphereConfig;
  background?: {
    type: 'color' | 'image' | 'video';
    src?: string;
    color?: string;
    zoomDrift?: boolean;
    dim?: number; // 0..1 darkness overlay
  };
}
