import React from 'react';
import {AbsoluteFill} from 'remotion';
import '../lib/fonts';
import {TogglePills} from '../components/graphics/TogglePills';
import {MORPH_SHAPES, ShapeMorph} from '../components/svg/ShapeMorph';
import {getReelTheme} from '../presets/themes';

// Demos of the motion-graphics additions, themed per brand: toggle-pill benefit rows and a shape-morph chain.
export const TogglePillsDemo: React.FC<{theme?: string}> = ({theme = 'dhunna_54d'}) => {
  const t = getReelTheme(theme);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 40%, color-mix(in oklch, ${t.ground} 70%, white 6%), ${t.ground})`}}>
      <TogglePills
        theme={t}
        startFrame={6}
        fontFamilyLabel={theme === 'crown_crest' ? 'Cinzel' : 'Archivo'}
        items={[
          {label: ['Premium', 'investment'], icon: 'rupee', at: 30},
          {label: ['Timeless', 'luxury'], icon: 'diamond', at: 52},
          {label: ['Prime', 'location'], icon: 'pin', at: 74},
        ]}
      />
    </AbsoluteFill>
  );
};

export const ShapeMorphDemo: React.FC<{theme?: string}> = ({theme = 'dhunna_54d'}) => {
  const t = getReelTheme(theme);
  return (
    <AbsoluteFill style={{background: t.ground, alignItems: 'center', justifyContent: 'center'}}>
      <ShapeMorph theme={t} shapes={[MORPH_SHAPES.pin, MORPH_SHAPES.building, MORPH_SHAPES.key, MORPH_SHAPES.house]} at={[0, 40, 80, 120]} size={520} />
    </AbsoluteFill>
  );
};
