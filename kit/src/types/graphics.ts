import React from 'react';

export interface ChecklistItem {
  text: string;
  atFrame?: number;
  atTime?: number; // In seconds
  icon?: string;
  activeColor?: string;
}

export interface ChecklistCardConfig {
  title: string;
  items: ChecklistItem[];
  startFrame: number;
  endFrame?: number;
  width?: number;
  accentColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  position?: { x?: number; y?: number };
}

export interface PhotoCardConfig {
  mediaUrl: string;
  isVideo?: boolean;
  label: string;
  code?: string;
  startFrame: number;
  backFrame?: number;
  width: number;
  height: number;
  x: number;
  y: number;
  tilt?: number;
  from?: 'bottom' | 'right' | 'left';
  accentBorder?: string;
  driftIntensity?: number;
  borderRadius?: number;
}

export interface MetricCounterConfig {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  startFrame: number;
  durationFrames?: number;
  accentColor?: string;
  textColor?: string;
  position?: { x?: number; y?: number };
  width?: number;
  kind?: 'standard' | 'frontage' | 'parking' | 'catchment';
}

export interface TagMarkerConfig {
  text: string;
  startFrame: number;
  accentColor?: string;
  textColor?: string;
  lineWidth?: number;
  position?: { x?: number; y?: number };
}

export interface AtmosphereConfig {
  grain?: boolean;
  dust?: boolean;
  lightLeak?: boolean;
  vignette?: boolean;
  opacity?: number;
  warmth?: 'warm' | 'cool' | 'neutral';
}

export type IconName =
  | 'design'
  | 'pantry'
  | 'restroom'
  | 'parking'
  | 'area'
  | 'kitchen'
  | 'alfresco'
  | 'sky'
  | 'chat'
  | 'shield'
  | 'lift'
  | 'star';

export interface SvgIconConfig {
  name: IconName;
  startFrame: number;
  size?: number;
  strokeColor?: string;
  glow?: boolean;
  position?: { x: number; y: number };
}

export interface CadGridConfig {
  startFrame: number;
  accentColor?: string;
  gridSize?: number;
  opacity?: number;
  coordinates?: string;
  code?: string;
}

export interface MapRouteConfig {
  startFrame: number;
  durationFrames?: number;
  pathD?: string;
  destinationPoint?: { x: number; y: number };
  badgeText?: string;
  accentColor?: string;
}

export interface TrackedPinConfig {
  label: string;
  startFrame: number;
  x?: number | string;
  y?: number | string;
  accentColor?: string;
  code?: string;
}

export interface CarouselSlideConfig {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  code?: string;
}

export interface DeckCarouselConfig {
  slides: CarouselSlideConfig[];
  startFrame: number;
  slideDuration?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  accentColor?: string;
}

export interface TriptychColumnConfig {
  id: string;
  label: string;
  sublabel?: string;
  imageUrl?: string;
}

export interface TriptychConfig {
  columns: TriptychColumnConfig[];
  startFrame: number;
  accentColor?: string;
}

export interface FloorLevelConfig {
  name: string;
  yTop: number;
  yBottom: number;
  label?: string;
}

export interface FloorHighlightConfig {
  floors: FloorLevelConfig[];
  startFrame: number;
  accentColor?: string;
  sheenPass?: boolean;
}

export interface Coin3DConfig {
  position?: [number, number, number];
  scale?: number;
  symbol?: string;
  accentColor?: string;
  spinSpeed?: number;
}

export interface WireframeTowerConfig {
  levels?: number;
  position?: [number, number, number];
  scale?: number;
  lineColor?: string;
}

export interface LogoSaberConfig {
  startFrame: number;
  width?: number;
  height?: number;
  imageUrl?: string;
  fallbackText?: string;
  accentColor?: string;
  position?: { x?: number; y?: number };
}
