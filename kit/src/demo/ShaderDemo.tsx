import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import '../lib/fonts';
import {BevelDefs, Heading, KitThemeProvider, PhotoCard, SHADER_KINDS, ShaderBackdrop, useKitTheme, type ShaderKind} from '../pro';

// Each shader backdrop for 90 frames behind a heading and a card, so it's judged where it will be used: behind content.
const SEG = 90;
const NOTE: Record<ShaderKind, [string, string]> = {
  mesh: ['Mesh', 'light pools'],
  silk: ['Silk', 'satin folds'],
  metal: ['Liquid', 'metal'],
  aurora: ['Aurora', 'curtains'],
  rays: ['Light', 'rays'],
  contour: ['Contour', 'lines'],
};
const PICS = ['s-double-height', 'r-golden', 'r-rain', 'o-open-plan', 'r-walkers', 'b-parking'];

const Tour: React.FC = () => {
  const t = useKitTheme();
  return (
    <AbsoluteFill style={{background: t.deep}}>
      <BevelDefs />
      {SHADER_KINDS.map((k, i) => (
        <Sequence key={k} from={i * SEG} durationInFrames={SEG}>
          <ShaderBackdrop kind={k} seed={i} />
          <Heading from={0} to={SEG} lines={[[{t: NOTE[k][0], at: 4, role: 'light'}, {t: NOTE[k][1], at: 8, role: 'accent'}]]} />
          <PhotoCard src={`samples/${PICS[i]}.jpg`} label={k} at={12} w={700} h={820} x={540} y={620} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// All six side by side, moving, for choosing a look.
const Grid: React.FC = () => {
  const t = useKitTheme();
  return (
    <AbsoluteFill style={{background: t.deep, display: 'grid', gridTemplateColumns: 'repeat(3, 340px)', gap: 20, justifyContent: 'center', alignContent: 'center'}}>
      {SHADER_KINDS.map((k, i) => (
        <div key={k} style={{position: 'relative', width: 340, height: 604, borderRadius: 18, overflow: 'hidden', boxShadow: `0 0 0 1px ${t.hair}`}}>
          <ShaderBackdrop kind={k} seed={i} res={0.34} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontFamily: t.fontLabel, fontWeight: 500, fontSize: 26, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.ivory}}>{k}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const ShaderTour: React.FC<{theme: string}> = ({theme}) => <KitThemeProvider theme={theme}><Tour /></KitThemeProvider>;
export const ShaderGrid: React.FC<{theme: string}> = ({theme}) => <KitThemeProvider theme={theme}><Grid /></KitThemeProvider>;
export const SHADER_SEG = SEG;
