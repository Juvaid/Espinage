import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, useCurrentFrame} from 'remotion';
import {KineticCaption} from '../components/captions/KineticCaption';
import {DeckCarousel} from '../components/cards/DeckCarousel';
import {FloorHighlight} from '../components/cards/FloorHighlight';
import {TriptychColumns} from '../components/cards/TriptychColumns';
import {Atmosphere} from '../components/fx/Atmosphere';
import {ChecklistCard} from '../components/graphics/ChecklistCard';
import {MetricCounter} from '../components/graphics/MetricCounter';
import {PhotoCard} from '../components/graphics/PhotoCard';
import {TagMarker} from '../components/graphics/TagMarker';
import {AnimatedSvgIcon} from '../components/svg/AnimatedSvgIcon';
import {CadDraftingGrid} from '../components/svg/CadDraftingGrid';
import {LogoSaberReveal} from '../components/svg/LogoSaberReveal';
import {MapRouteTrack} from '../components/svg/MapRouteTrack';
import {TrackedHoverPin} from '../components/svg/TrackedHoverPin';
import {SpinningCoin3D} from '../components/three/SpinningCoin3D';
import {ThreeStage} from '../components/three/ThreeStage';
import {WireframeTower3D} from '../components/three/WireframeTower3D';
import {ease, ramp} from '../lib/anim';
import {getReelTheme} from '../presets/themes';
import {SceneManifest} from '../types/presets';

export interface ReelSceneRendererProps {
  manifest: SceneManifest;
  style?: React.CSSProperties;
}

export const ReelSceneRenderer: React.FC<ReelSceneRendererProps> = ({
  manifest,
  style,
}) => {
  const frame = useCurrentFrame();
  const theme = getReelTheme(manifest.theme);

  // Background slow camera drift
  const bgDrift = manifest.background?.zoomDrift
    ? ramp(frame, 0, manifest.durationFrames, 1.0, 1.06, ease.outQuart)
    : 1.0;

  // Separate 3D elements from 2D DOM elements
  const threeElements = manifest.graphics?.filter(
    (g) => g.type === 'coin3D' || g.type === 'wireframe3D'
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: manifest.background?.color || theme.ground,
        overflow: 'hidden',
        fontFamily: theme.fontFamilyBody,
        ...style,
      }}
    >
      {/* 1. Background Layer (Image, Video, or Solid Color) */}
      {manifest.background?.src ? (
        manifest.background.type === 'video' ? (
          <OffthreadVideo
            src={manifest.background.src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${bgDrift})`,
            }}
          />
        ) : (
          <Img
            src={manifest.background.src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${bgDrift})`,
            }}
          />
        )
      ) : null}

      {/* Dim / Scrim overlay if requested */}
      {manifest.background?.dim ? (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(0, 0, 0, ${manifest.background.dim})`,
            zIndex: 5,
          }}
        />
      ) : null}

      {/* 2. WebGL 3D Layer (if 3D graphics are present) */}
      {threeElements && threeElements.length > 0 && (
        <ThreeStage>
          {threeElements.map((g, idx) => {
            if (g.type === 'coin3D') {
              return (
                <SpinningCoin3D
                  key={idx}
                  position={g.config.position}
                  scale={g.config.scale}
                  symbol={g.config.symbol}
                  accentColor={g.config.accentColor || theme.accent}
                  spinSpeed={g.config.spinSpeed}
                />
              );
            }
            if (g.type === 'wireframe3D') {
              return (
                <WireframeTower3D
                  key={idx}
                  levels={g.config.levels}
                  position={g.config.position}
                  scale={g.config.scale}
                  lineColor={g.config.lineColor || theme.accent}
                />
              );
            }
            return null;
          })}
        </ThreeStage>
      )}

      {/* 3. Motion Graphics, UI Cards, SVG & Layouts Layer */}
      {manifest.graphics?.map((graphic, idx) => {
        switch (graphic.type) {
          case 'checklist':
            return (
              <ChecklistCard
                key={idx}
                config={{
                  accentColor: theme.accent,
                  textColor: theme.ivory,
                  ...graphic.config,
                }}
              />
            );
          case 'photoCard':
            return <PhotoCard key={idx} config={graphic.config} />;
          case 'metric':
            return (
              <MetricCounter
                key={idx}
                config={{
                  accentColor: theme.accent,
                  textColor: theme.ivory,
                  ...graphic.config,
                }}
              />
            );
          case 'tag':
            return (
              <TagMarker
                key={idx}
                config={{
                  accentColor: theme.accent,
                  textColor: theme.accent,
                  ...graphic.config,
                }}
              />
            );
          case 'cadGrid':
            return (
              <CadDraftingGrid
                key={idx}
                startFrame={graphic.config.startFrame}
                accentColor={graphic.config.accentColor || theme.accent}
                gridSize={graphic.config.gridSize}
                opacity={graphic.config.opacity}
                coordinates={graphic.config.coordinates}
                code={graphic.config.code}
              />
            );
          case 'mapRoute':
            return (
              <MapRouteTrack
                key={idx}
                startFrame={graphic.config.startFrame}
                durationFrames={graphic.config.durationFrames}
                pathD={graphic.config.pathD}
                destinationPoint={graphic.config.destinationPoint}
                badgeText={graphic.config.badgeText}
                accentColor={graphic.config.accentColor || theme.accent}
              />
            );
          case 'trackedPin':
            return (
              <TrackedHoverPin
                key={idx}
                label={graphic.config.label}
                startFrame={graphic.config.startFrame}
                x={graphic.config.x}
                y={graphic.config.y}
                accentColor={graphic.config.accentColor || theme.accent}
                textColor={theme.ivory}
                code={graphic.config.code}
              />
            );
          case 'svgIcon':
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: graphic.config.position?.x ?? 96,
                  top: graphic.config.position?.y ?? 200,
                  zIndex: 35,
                }}
              >
                <AnimatedSvgIcon
                  name={graphic.config.name}
                  startFrame={graphic.config.startFrame}
                  size={graphic.config.size}
                  strokeColor={graphic.config.strokeColor || theme.accent}
                  glow={graphic.config.glow}
                />
              </div>
            );
          case 'carousel':
            return (
              <DeckCarousel
                key={idx}
                slides={graphic.config.slides}
                startFrame={graphic.config.startFrame}
                slideDuration={graphic.config.slideDuration}
                width={graphic.config.width}
                height={graphic.config.height}
                x={graphic.config.x}
                y={graphic.config.y}
                accentColor={graphic.config.accentColor || theme.accent}
              />
            );
          case 'triptych':
            return (
              <TriptychColumns
                key={idx}
                columns={graphic.config.columns}
                startFrame={graphic.config.startFrame}
                accentColor={graphic.config.accentColor || theme.accent}
              />
            );
          case 'floorHighlight':
            return (
              <FloorHighlight
                key={idx}
                floors={graphic.config.floors}
                startFrame={graphic.config.startFrame}
                accentColor={graphic.config.accentColor || theme.accent}
                sheenPass={graphic.config.sheenPass}
              />
            );
          case 'logoSaber':
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: graphic.config.position?.x ?? 220,
                  top: graphic.config.position?.y ?? 340,
                  zIndex: 45,
                }}
              >
                <LogoSaberReveal
                  startFrame={graphic.config.startFrame}
                  width={graphic.config.width}
                  height={graphic.config.height}
                  imageUrl={graphic.config.imageUrl}
                  fallbackText={graphic.config.fallbackText}
                  accentColor={graphic.config.accentColor || theme.accent}
                />
              </div>
            );
          default:
            return null;
        }
      })}

      {/* 4. Kinetic Word-Accurate Captions Layer */}
      {manifest.words && manifest.words.length > 0 && (
        <KineticCaption
          words={manifest.words}
          preset={manifest.captionPreset || 'dhunna_luxury_gold'}
        />
      )}

      {/* 5. Film Grain & Atmosphere Layer (Topmost VFX) */}
      {manifest.atmosphere && <Atmosphere config={manifest.atmosphere} />}
    </AbsoluteFill>
  );
};
