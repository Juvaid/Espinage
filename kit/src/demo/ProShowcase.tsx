import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import '../lib/fonts';
import {
  BevelDefs, Backdrop, Carousel, Checklist, CTA, Deck, FloorStack, Heading, Hero, KitThemeProvider, LogoReveal, MakeRoom, MORPH_SHAPES, PhotoCard,
  ShapeMorph, SidePair, Space, TextBehind, TogglePills, TypeSpace, useKitTheme, VIS, WireEye, WirePin, ArchGrid,
  AnimatedBeam, BorderBeam, KitIcon, Lens, NumberTicker, Orbit, ShineSweep, Spotlight, Card,
} from '../pro';
import GLYPHS from './type3d.json';

// Every production component in sequence on sample pictures, for one brand theme: the audit and preview reel.
// Segments are 90 frames; each component's own frames start at 0 inside its segment.
export const SEG = 90;
const img = (n: string, label = VIS) => ({image: `samples/${n}.jpg`, label});
const Inner: React.FC = () => {
  const t = useKitTheme();
  const seg = (i: number, node: React.ReactNode, ground: 'backdrop' | 'space' | 'none' = 'backdrop') => (
    <Sequence key={i} from={i * SEG} durationInFrames={SEG}>
      {ground === 'backdrop' ? <Backdrop /> : ground === 'space' ? <Space dur={SEG} /> : null}
      {node}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{background: t.deep}}>
      <BevelDefs />
      {seg(0, <>
        <Hero src="samples/r-walkers.jpg" depth="samples/r-walkers-depth.png" label={VIS} dur={SEG} />
        <Heading from={0} to={SEG} lines={[[{t: 'Hero depth card', at: 8, role: 'light'}], [{t: 'and heading', at: 16, role: 'accent'}]]} />
      </>)}
      {seg(1, <TypeSpace font={GLYPHS} dur={SEG} maxW={3.2} light={0.4} lines={[[{text: 'Flagship', weight: 640, gold: true, at: 6}], [{text: 'sirf', weight: 300, at: 18}, {text: 'showroom', weight: 300, at: 24}, {text: 'nahi.', weight: 300, at: 30}]]} />, 'none')}
      {seg(2, <>
        <SidePair a={img('r-golden')} b={img('r-rain')} bAt={20} dur={SEG} />
        <Heading from={0} to={SEG} lines={[[{t: 'Side pair', at: 4, role: 'accent'}]]} />
      </>)}
      {seg(3, <>
        <Carousel items={[img('s-double-height', 'Showroom concept'), img('s-mezzanine', 'Showroom concept'), img('o-open-plan', 'Office concept')]} steps={[30, 58]} dur={SEG} />
        <Heading from={0} to={SEG} lines={[[{t: 'Carousel', at: 4, role: 'accent'}]]} />
      </>, 'space')}
      {seg(4, <>
        <FloorStack items={[img('b-parking', 'Parking concept'), img('s-double-height', 'Showroom concept'), img('o-open-plan', 'Office concept')]} start={0} steps={[{at: 30, level: 1}, {at: 60, level: 2}]} dur={SEG} />
        <Heading from={0} to={SEG} lines={[[{t: 'Floor', at: 4, role: 'light'}, {t: 'stack', at: 8, role: 'accent'}]]} />
      </>)}
      {seg(5, <>
        <TextBehind src="samples/r-statue-tight.jpg" cutout="samples/r-statue-tight-cutout.png" word="Entrance" at={14} dur={SEG} wordY={0.8} size={180} />
        <Heading from={0} to={SEG} lines={[[{t: 'Text behind', at: 4, role: 'accent'}]]} />
      </>)}
      {seg(6, <>
        <Checklist title="Amenities" end={SEG} style={{position: 'absolute', left: 120, right: 120, top: 560}} items={[{icon: 'storefront', text: 'Double-height showrooms', at: 10}, {icon: 'garage', text: 'Basement parking', at: 30}, {icon: 'road-horizon', text: '82 ft front', at: 50}]} />
        <Heading from={0} to={SEG} lines={[[{t: 'Checklist', at: 4, role: 'accent'}]]} />
      </>)}
      {seg(7, <>
        <PhotoCard src="samples/s-double-height.jpg" label="Showroom" at={10} back={44} w={760} h={900} x={540} y={560} />
        <PhotoCard src="samples/o-open-plan.jpg" label="Office" at={44} w={760} h={900} x={540} y={560} from="right" tilt={2} />
        <Heading from={0} to={SEG} lines={[[{t: 'Photo cards', at: 4, role: 'accent'}]]} />
      </>)}
      {seg(8, <>
        <TogglePills startFrame={4} top={640} items={[{label: ['Premium', 'investment'], icon: 'rupee', at: 24}, {label: ['Timeless', 'luxury'], icon: 'diamond', at: 44}, {label: ['Prime', 'location'], icon: 'pin', at: 64}]} />
        <Heading from={0} to={SEG} lines={[[{t: 'Toggle', at: 4, role: 'light'}, {t: 'pills', at: 8, role: 'accent'}]]} />
      </>)}
      {seg(9, <>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <ShapeMorph shapes={[MORPH_SHAPES.pin, MORPH_SHAPES.building, MORPH_SHAPES.house]} at={[0, 40, 80]} size={520} />
        </AbsoluteFill>
        <Heading from={0} to={SEG} lines={[[{t: 'Shape', at: 4, role: 'light'}, {t: 'morph', at: 8, role: 'accent'}]]} />
      </>)}
      {seg(10, <>
        <MakeRoom at={40}><Deck front={img('r-golden')} back={[img('r-rain'), img('s-double-height', 'Showroom concept')]} dur={SEG} /></MakeRoom>
        <Heading from={0} to={SEG} lines={[[{t: 'Deck', at: 4, role: 'light'}, {t: '+ CTA', at: 8, role: 'accent'}]]} />
        <CTA from={40} press={66} logo={t.logo} label="Message us" />
      </>)}
      {seg(12, <>
        <ArchGrid opacity={0.08} />
        <WireEye start={0} end={SEG} y={360} />
        <WirePin start={20} end={SEG} from={[700, 1000]} to={[420, 520]} travel={[50, 80]} />
        <Heading from={0} to={SEG} lines={[[{t: 'Wire eye', at: 4, role: 'light'}, {t: '+ pin', at: 8, role: 'accent'}]]} y={1500} />
      </>)}
      {seg(13, <>
        <div style={{position: 'absolute', left: 160, top: 470}}>
          <BorderBeam w={760} h={620} at={6} dur={56}>
            <Card m={img('r-golden')} w={760} h={620} from={0} dur={SEG} style={{left: 0, top: 0}} />
          </BorderBeam>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1140, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16}}>
          <NumberTicker value="82" at={14} size={170} /><span style={{fontFamily: t.fontHead, fontWeight: 300, fontSize: 70, color: t.ivory}}>ft front</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center'}}>
          <ShineSweep at={50}><div style={{padding: '24px 46px', borderRadius: 999, background: `linear-gradient(180deg, color-mix(in oklch, ${t.accent} 14%, white), color-mix(in oklch, ${t.accent} 42%, white))`, color: t.deep, fontFamily: t.fontHead, fontWeight: 640, fontSize: 40}}>Message us →</div></ShineSweep>
        </div>
        <Heading from={0} to={SEG} lines={[[{t: 'Border beam', at: 4, role: 'light'}, {t: 'ticker', at: 8, role: 'accent'}]]} />
      </>)}
      {seg(14, <>
        <Card m={img('s-double-height', 'Showroom concept')} w={800} h={560} from={0} dur={SEG} style={{left: 140, top: 1040}} />
        <Lens src="samples/s-double-height.jpg" w={800} h={560} left={140} top={1040} at={30} dur={50} />
        <Orbit cx={540} cy={700} rx={340} ry={110} at={4} items={(['car', 'shield-check', 'elevator', 'coffee', 'wifi-high'] as const).map((n) => (
          <div key={n} style={{width: 96, height: 96, borderRadius: 99, background: t.panel, border: `1.5px solid ${t.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><KitIcon name={n} size={52} weight="duotone" /></div>
        ))} />
        <div style={{position: 'absolute', left: 540 - 60, top: 640, width: 120, height: 120, borderRadius: 99, background: t.deep, border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><KitIcon name="buildings" size={70} /></div>
        <AnimatedBeam from={[540, 760]} to={[540, 1030]} at={20} />
        <Spotlight at={8} dur={40} />
        <Heading from={0} to={SEG} lines={[[{t: 'Orbit, beam', at: 4, role: 'light'}, {t: 'lens', at: 8, role: 'accent'}]]} />
      </>)}
      {seg(11, <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><LogoReveal logo={t.logo} ratio={t.logoRatio} mode={t.logoMode} start={8} width={t.logoRatio > 0.6 ? 420 : 760} /></AbsoluteFill>)}
    </AbsoluteFill>
  );
};
export const ProShowcase: React.FC<{theme: string}> = ({theme}) => (
  <KitThemeProvider theme={theme}>
    <Inner />
  </KitThemeProvider>
);
