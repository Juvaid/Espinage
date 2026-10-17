import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
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
import {KineticCaption} from '../components/captions/KineticCaption';
import {SpinningCoin3D} from '../components/three/SpinningCoin3D';
import {ThreeStage} from '../components/three/ThreeStage';
import {WireframeTower3D} from '../components/three/WireframeTower3D';
import {TimedWord} from '../types/captions';

export const DemoComposition: React.FC = () => {
  // Scene 1: Luxury Metal + 3D Coin + CAD Grid
  const scene1Words: TimedWord[] = [
    {word: '54-D', startFrame: 10, endFrame: 26, isHero: true},
    {word: 'IS', startFrame: 26, endFrame: 35},
    {word: 'SARABHA', startFrame: 35, endFrame: 48},
    {word: 'NAGAR’S', startFrame: 48, endFrame: 62},
    {word: 'FINEST', startFrame: 62, endFrame: 85, isHero: true},
  ];

  // Scene 2: Crown Crest Checklist + 3D Wireframe + SVG Icons
  const scene2Words: TimedWord[] = [
    {word: 'THREE', startFrame: 10, endFrame: 24, isHero: true},
    {word: 'EXCLUSIVE', startFrame: 24, endFrame: 38},
    {word: 'LEVELS', startFrame: 38, endFrame: 52},
    {word: 'OF', startFrame: 52, endFrame: 60},
    {word: 'UNMATCHED', startFrame: 60, endFrame: 75},
    {word: 'PRIVACY', startFrame: 75, endFrame: 98, isHero: true},
  ];

  // Scene 3: Stacking Deck Carousel + Floor Highlights
  const scene3Words: TimedWord[] = [
    {word: 'GROUND', startFrame: 8, endFrame: 24, isHero: true},
    {word: 'PLUS', startFrame: 24, endFrame: 32},
    {word: 'THREE', startFrame: 32, endFrame: 45, isHero: true},
    {word: 'EXPANSIVE', startFrame: 45, endFrame: 65},
    {word: 'FLOORPLATES', startFrame: 65, endFrame: 90, isHero: true},
  ];

  // Scene 4: Logo Saber Reveal + Triptych Columns
  const scene4Words: TimedWord[] = [
    {word: 'DHUNNA', startFrame: 8, endFrame: 28, isHero: true},
    {word: 'INFRA', startFrame: 28, endFrame: 45, isHero: true},
    {word: 'SHAPING', startFrame: 45, endFrame: 60},
    {word: 'TOMORROW', startFrame: 60, endFrame: 85, isHero: true},
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0c0a09'
      }}
    >
      {/* Universal Film Grain & Dust Atmosphere */}
      <Atmosphere config={{grain: true, dust: true, lightLeak: true, vignette: true}} />

      {/* ─── SCENE 1: CAD Blueprint + 3D Gold Coin + Luxury Metal Bevel (0-90) ─── */}
      <Sequence from={0} durationInFrames={90}>
        <CadDraftingGrid startFrame={4} opacity={0.3} />

        <TagMarker
          config={{
            text: 'SARABHA NAGAR // LUDHIANA',
            startFrame: 6,
            accentColor: '#DFB25A',
            position: {x: 96, y: 180},
          }}
        />

        <MetricCounter
          config={{
            value: 100,
            suffix: '%',
            label: 'PRIME RETAIL LOCATION',
            startFrame: 12,
            durationFrames: 24,
            accentColor: '#DFB25A',
            kind: 'frontage',
            position: {x: 96, y: 320},
          }}
        />

        {/* 3D WebGL Spinning Gold Rupee Coin */}
        <ThreeStage pos={[0, 0, 8]} look={[0, 0, 0]}>
          <SpinningCoin3D position={[2.2, 0.4, 0]} scale={1.7} accentColor="#c9953c" />
        </ThreeStage>

        <KineticCaption words={scene1Words} preset="dhunna_luxury_gold" />
      </Sequence>

      {/* ─── SCENE 2: Checklist Card + 3D Wireframe Tower + SVG Icons (90-185) ─── */}
      <Sequence from={90} durationInFrames={95}>
        <ChecklistCard
          config={{
            title: 'RESIDENCE SPECIFICATIONS',
            startFrame: 8,
            items: [
              {text: 'Dedicated High-Speed Elevator', atFrame: 16},
              {text: 'Dual-Aspect Panoramic Balconies', atFrame: 38},
              {text: 'Automated Multi-Tier Security', atFrame: 62},
            ],
            accentColor: '#E2C799',
            position: {x: 96, y: 220},
            width: 888,
          }}
        />

        {/* Animated SVG Micro Icons */}
        <div style={{position: 'absolute', left: 96, top: 580, display: 'flex', gap: 24, zIndex: 40}}>
          <AnimatedSvgIcon name="lift" startFrame={16} size={52} strokeColor="#E2C799" />
          <AnimatedSvgIcon name="sky" startFrame={38} size={52} strokeColor="#E2C799" />
          <AnimatedSvgIcon name="shield" startFrame={62} size={52} strokeColor="#E2C799" />
        </div>

        {/* 3D Architectural Wireframe Massing Model */}
        <ThreeStage pos={[0, 1, 9]} look={[0, 0, 0]}>
          <WireframeTower3D position={[0, -1.8, 0]} scale={1.4} lineColor="#E2C799" />
        </ThreeStage>

        <TrackedHoverPin
          label="CROWN CREST LEVEL 12"
          startFrame={25}
          x="58%"
          y="68%"
          accentColor="#E2C799"
        />

        <KineticCaption words={scene2Words} preset="crown_crest_silver" />
      </Sequence>

      {/* ─── SCENE 3: Stacking Deck Carousel + Floor Highlights + Map Track (185-280) ─── */}
      <Sequence from={185} durationInFrames={95}>
        <FloorHighlight
          startFrame={6}
          floors={[
            {name: 'L1', yTop: 240, yBottom: 360, label: 'GROUND FLOOR'},
            {name: 'L2', yTop: 370, yBottom: 490, label: 'LEVEL ONE'},
            {name: 'L3', yTop: 500, yBottom: 620, label: 'LEVEL TWO'},
          ]}
          accentColor="#DFB25A"
        />

        <DeckCarousel
          startFrame={10}
          slideDuration={28}
          slides={[
            {id: 'p1', title: 'Ground Floor Showroom', subtitle: '3,200 SQ.FT • DOUBLE HEIGHT'},
            {id: 'p2', title: 'First Floor Retail', subtitle: '4,100 SQ.FT • 360° GLAZING'},
            {id: 'p3', title: 'Executive Offices', subtitle: 'TERRACE DECK ACCESS'},
          ]}
          width={860}
          height={680}
          y={660}
        />

        <KineticCaption words={scene3Words} preset="architectural_slit" />
      </Sequence>

      {/* ─── SCENE 4: Logo Saber Laser Trace + Triptych 3-Way Split (280-370) ─── */}
      <Sequence from={280} durationInFrames={90}>
        <TriptychColumns
          startFrame={6}
          columns={[
            {id: 'c1', label: 'RETAIL', sublabel: 'LUXURY FLAGSHIP'},
            {id: 'c2', label: 'OFFICE', sublabel: 'CORPORATE SUITES'},
            {id: 'c3', label: 'TERRACE', sublabel: 'SKYLINE LOUNGE'},
          ]}
          accentColor="#DFB25A"
          top={0}
          height="75%"
        />

        <LogoSaberReveal
          startFrame={12}
          width={840}
          height={160}
          fallbackText="DHUNNA INFRA"
          accentColor="#DFB25A"
          style={{position: 'absolute', left: 'calc(50% - 420px)', top: 280, zIndex: 45}}
        />

        <KineticCaption words={scene4Words} preset="dhunna_luxury_gold" />
      </Sequence>
    </AbsoluteFill>
  );
};
