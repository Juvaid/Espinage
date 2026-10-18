import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '../lib/fonts';
import {
  BevelDefs, BlurInText, Callout, Cut, DepthReveal, DistanceRings, FocusPull, Grade, Heading, KitThemeProvider, LightLeak, planScenes,
  RouteDraw, Scene, Scenes, ShaderBackdrop, ShimmerText, SlitLine, StatGrid, useKitTheme, Vignette, WordRotate, type CutProps,
} from '../pro';

// Bundle 1 showcase. Transitions: every kind in a chain of photo scenes. Elements: grade, lens, text effects,
// location and the depth reveal, 90 frames each. Demo labels only; real films take facts from the brief.
const Photo: React.FC<{src: string; label: string}> = ({src, label}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img src={staticFile(`samples/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + f * 0.0006})`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.deep} 0%, transparent 30%, transparent 70%, ${C.deep} 100%)`, opacity: 0.85}} />
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: C.fontLabel, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accent}}>enter: {label}</div>
    </AbsoluteFill>
  );
};

const CHAIN: [string, CutProps | null][] = [
  ['r-golden', null],
  ['s-double-height', {kind: 'whip', dir: 'left'}],
  ['o-open-plan', {kind: 'push'}],
  ['r-walkers', {kind: 'blur'}],
  ['s-mezzanine', {kind: 'iris', origin: [0.5, 0.62]}],
  ['r-rain', {kind: 'shape', shape: 'pin', origin: [0.5, 0.5]}],
  ['b-parking', {kind: 'sweep'}],
  ['cc-evening', {kind: 'slats', dir: 'left'}],
  ['r-golden', {kind: 'flip'}],
];
const chain = () => {
  const out: React.ReactNode[] = [];
  CHAIN.forEach(([src, cut], i) => {
    if (cut) out.push(<Cut key={`c${i}`} {...cut} />);
    out.push(
      <Scene key={`s${i}`} dur={60}>
        <Photo src={src} label={cut ? cut.kind : 'start'} />
      </Scene>,
    );
  });
  return out;
};
export const TRANSITIONS_TOTAL = planScenes(chain()).total;

const TransitionsInner: React.FC = () => <Scenes>{chain()}</Scenes>;

const SEG = 90;
// raw on the left of a moving line, graded on the right
const GradeCompare: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [10, 70], [92, 8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pic = <Img src={staticFile('samples/s-double-height.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{pic}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${x}%)`}}>
        <Grade contrast={0.55} tone={0.38} halation={0.35}>{pic}</Grade>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 3, background: 'white', boxShadow: '0 0 18px white'}} />
    </AbsoluteFill>
  );
};

const ElementsInner: React.FC = () => {
  const C = useKitTheme();
  const seg = (i: number, node: React.ReactNode) => (
    <Sequence key={i} from={i * SEG} durationInFrames={SEG}>
      {node}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <BevelDefs />
      {seg(0, <>
        <GradeCompare />
        <Heading from={0} to={SEG} lines={[[{t: 'Raw', at: 4, role: 'light'}, {t: 'graded', at: 10, role: 'accent'}]]} />
      </>)}
      {seg(1, <>
        <FocusPull at={4} dur={22}>
          <Grade><Img src={staticFile('samples/r-golden.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Grade>
        </FocusPull>
        <Vignette amount={0.5} />
        <LightLeak at={50} dur={36} />
        <Heading from={0} to={SEG} lines={[[{t: 'Focus,', at: 4, role: 'light'}, {t: 'leak', at: 46, role: 'accent'}]]} />
      </>)}
      {seg(2, <>
        <ShaderBackdrop kind="mesh" seed={2} />
        <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center', fontFamily: C.fontHead, fontWeight: 300, fontSize: 72, color: C.dim}}>Built for your</div>
        <WordRotate words={[{t: 'showroom', at: 10}, {t: 'office', at: 36}, {t: 'clinic', at: 60}]} size={150} style={{position: 'absolute', top: 800, left: 0, right: 0}} />
      </>)}
      {seg(3, <>
        <ShaderBackdrop kind="rays" seed={3} />
        <ShimmerText text="Flagship" at={14} dur={28} size={190} style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center'}} />
        <BlurInText text="One address on Sarabha Nagar's main road" at={34} stagger={3} size={46} style={{position: 'absolute', top: 1000, left: 120, right: 120}} />
      </>)}
      {seg(4, <>
        <ShaderBackdrop kind="silk" seed={4} />
        <SlitLine text="The frontage" at={6} style={{position: 'absolute', top: 470, left: 90}} />
        <StatGrid items={[{value: '82', unit: 'ft', label: 'Front', at: 24}, {value: '80', unit: 'ft', label: 'Road', at: 44}]} style={{position: 'absolute', top: 760, left: 90}} />
      </>)}
      {seg(5, <>
        <ShaderBackdrop kind="contour" seed={5} />
        <DistanceRings x={540} y={1060} start={6} angle={-35} rings={[{r: 170, label: 'Sarabha Nagar', at: 14}, {r: 330, label: 'Ludhiana', at: 36}]} />
        <Heading from={0} to={SEG} lines={[[{t: 'Around', at: 4, role: 'light'}, {t: 'the site', at: 10, role: 'accent'}]]} />
      </>)}
      {seg(6, <>
        <ShaderBackdrop kind="contour" seed={6} energy={0.4} />
        <RouteDraw d="M180 1560 C 300 1380, 260 1210, 470 1150 S 760 990, 760 820" at={8} dur={46} end={{text: '54D, Sarabha Nagar', icon: 'buildings'}} />
        <Heading from={0} to={SEG} lines={[[{t: 'Route', at: 4, role: 'light'}, {t: 'draw', at: 10, role: 'accent'}]]} />
      </>)}
      {seg(7, <>
        <Grade><Img src={staticFile('samples/s-double-height.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Grade>
        <Vignette />
        <Callout point={[420, 1030]} text="Double-height showroom" icon="storefront" at={12} side="right" rise={-170} length={60} />
      </>)}
      {seg(8, <>
        <ShaderBackdrop kind="mesh" seed={8} />
        <DepthReveal src="samples/r-golden.jpg" depth="samples/r-golden-depth.png" at={8} dur={44} w={900} h={1180} left={90} top={420} radius={28} />
        <Heading from={0} to={SEG} lines={[[{t: 'Depth', at: 4, role: 'light'}, {t: 'reveal', at: 10, role: 'accent'}]]} />
      </>)}
    </AbsoluteFill>
  );
};

export const BUNDLE_ELEMENTS_TOTAL = SEG * 9;
export const BundleTransitions: React.FC<{theme: string}> = ({theme}) => <KitThemeProvider theme={theme}><TransitionsInner /></KitThemeProvider>;
export const BundleElements: React.FC<{theme: string}> = ({theme}) => <KitThemeProvider theme={theme}><ElementsInner /></KitThemeProvider>;
