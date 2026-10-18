import React from 'react';
import {AbsoluteFill} from 'remotion';
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
import {TimedWord} from '../types/captions';

const sampleWords: TimedWord[] = [
  {word: 'WELCOME', startFrame: 10, endFrame: 25},
  {word: 'TO', startFrame: 25, endFrame: 35},
  {word: 'ARCHITECTURAL', startFrame: 35, endFrame: 50, isHero: true},
  {word: 'EXCELLENCE', startFrame: 50, endFrame: 80, isHero: true},
];

export const CompDhunnaGold: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <Atmosphere config={{grain: true, dust: true, lightLeak: true}} />
    <KineticCaption words={sampleWords} preset="dhunna_luxury_gold" />
  </AbsoluteFill>
);

export const CompCrownSilver: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a0d14'}}>
    <Atmosphere config={{grain: true, dust: true, lightLeak: true, warmth: 'cool'}} />
    <KineticCaption words={sampleWords} preset="crown_crest_silver" />
  </AbsoluteFill>
);

export const CompArchitecturalSlit: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <Atmosphere config={{grain: true, vignette: true}} />
    <KineticCaption words={sampleWords} preset="architectural_slit" />
  </AbsoluteFill>
);

export const CompHormoziViral: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#050505'}}>
    <KineticCaption words={sampleWords} preset="hormozi_viral" />
  </AbsoluteFill>
);

export const CompMrBeastHype: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#020617'}}>
    <KineticCaption words={sampleWords} preset="mrbeast_hype" />
  </AbsoluteFill>
);

export const CompAliAbdaal: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0f172a'}}>
    <KineticCaption words={sampleWords} preset="ali_abdaal_clean" />
  </AbsoluteFill>
);

export const CompCyberpunkNeon: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#030712'}}>
    <KineticCaption words={sampleWords} preset="cyberpunk_neon" />
  </AbsoluteFill>
);

export const CompAppleKeynote: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000000'}}>
    <KineticCaption words={sampleWords} preset="apple_keynote" />
  </AbsoluteFill>
);

export const CompEditorialSerif: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#080808'}}>
    <Atmosphere config={{grain: true, dust: true}} />
    <KineticCaption words={sampleWords} preset="minimal_editorial" />
  </AbsoluteFill>
);

export const CompChecklist: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <Atmosphere config={{grain: true, lightLeak: true}} />
    <ChecklistCard
      config={{
        title: 'EXCLUSIVE FEATURES',
        startFrame: 10,
        items: [
          {text: 'Dedicated High-Speed Elevator', atFrame: 18},
          {text: 'Panoramic Sky Lounge', atFrame: 38},
          {text: 'Triple-Tier Security Access', atFrame: 58},
        ],
        accentColor: '#DFB25A',
        position: {x: 96, y: 520},
      }}
    />
  </AbsoluteFill>
);

export const CompPhotoCard: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <Atmosphere config={{grain: true, dust: true}} />
    <PhotoCard
      config={{
        mediaUrl: '',
        label: 'PANORAMIC FACADE',
        code: 'ELEVATION // 59-D',
        startFrame: 10,
        width: 880,
        height: 1050,
        x: 540,
        y: 380,
        tilt: -1.5,
        accentBorder: 'rgba(223, 178, 90, 0.4)',
      }}
    />
  </AbsoluteFill>
);

export const CompDeckCarousel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <Atmosphere config={{grain: true, dust: true}} />
    <DeckCarousel
      startFrame={10}
      slideDuration={30}
      slides={[
        {id: '1', title: 'Ground Floor Showroom', subtitle: '3,200 SQ.FT • DOUBLE HEIGHT'},
        {id: '2', title: 'First Floor Retail', subtitle: '4,100 SQ.FT • 360° GLAZING'},
        {id: '3', title: 'Executive Offices', subtitle: 'TERRACE DECK ACCESS'},
      ]}
      accentColor="#DFB25A"
      y={540}
    />
  </AbsoluteFill>
);

export const CompFloorHighlight: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <FloorHighlight
      startFrame={10}
      floors={[
        {name: 'G', yTop: 320, yBottom: 480, label: 'GROUND FLOOR'},
        {name: '1', yTop: 500, yBottom: 660, label: 'LEVEL ONE'},
        {name: '2', yTop: 680, yBottom: 840, label: 'LEVEL TWO'},
      ]}
      accentColor="#DFB25A"
    />
  </AbsoluteFill>
);

export const CompTriptych: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <TriptychColumns
      startFrame={10}
      columns={[
        {id: '1', label: 'RETAIL', sublabel: 'GROUND LEVEL'},
        {id: '2', label: 'OFFICE', sublabel: 'LEVEL 1 & 2'},
        {id: '3', label: 'LOUNGE', sublabel: 'ROOFTOP'},
      ]}
      accentColor="#DFB25A"
    />
  </AbsoluteFill>
);

export const CompCoin3D: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <ThreeStage pos={[0, 0, 8]}>
      <SpinningCoin3D position={[0, 0, 0]} scale={2.4} accentColor="#c9953c" spinSpeed={0.06} />
    </ThreeStage>
  </AbsoluteFill>
);

export const CompWireframe3D: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <ThreeStage pos={[0, 1.5, 9]}>
      <WireframeTower3D position={[0, -2, 0]} scale={1.8} lineColor="#DFB25A" />
    </ThreeStage>
  </AbsoluteFill>
);

export const CompCadGrid: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <CadDraftingGrid startFrame={5} opacity={0.5} />
    <TagMarker
      config={{
        text: 'ARCHITECTURAL SCHEMATIC // 54D',
        startFrame: 10,
        position: {x: 96, y: 220},
      }}
    />
    <MetricCounter
      config={{
        value: 100,
        suffix: '%',
        label: 'PRIME FRONTAGE',
        startFrame: 15,
        kind: 'frontage',
        position: {x: 96, y: 360},
      }}
    />
  </AbsoluteFill>
);

export const CompSvgIcons: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gap: 40}}>
      {(['lift', 'shield', 'design', 'pantry', 'parking', 'area', 'kitchen', 'sky'] as const).map((name, i) => (
        <div key={name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
          <AnimatedSvgIcon name={name} startFrame={10 + i * 5} size={64} strokeColor="#DFB25A" />
          <span style={{color: '#FAF8F5', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase'}}>
            {name}
          </span>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const CompMapRoute: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09'}}>
    <MapRouteTrack startFrame={10} durationFrames={50} accentColor="#DFB25A" />
    <TrackedHoverPin label="SARABHA NAGAR" startFrame={35} x="54%" y="42%" accentColor="#DFB25A" />
  </AbsoluteFill>
);

export const CompLogoSaber: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0c0a09', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <LogoSaberReveal startFrame={15} width={900} height={200} fallbackText="DHUNNA INFRA" accentColor="#DFB25A" />
  </AbsoluteFill>
);
