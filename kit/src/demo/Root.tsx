import React from 'react';
import {Composition} from 'remotion';
import {DemoComposition} from './DemoComposition';
import {ShapeMorphDemo, TogglePillsDemo} from './MographDemo';
import {ProShowcase, SEG} from './ProShowcase';
import {IconSheet} from './IconSheet';
import {SHADER_SEG, ShaderGrid, ShaderTour} from './ShaderDemo';
import {
  CompAliAbdaal,
  CompAppleKeynote,
  CompArchitecturalSlit,
  CompCadGrid,
  CompChecklist,
  CompCoin3D,
  CompCrownSilver,
  CompCyberpunkNeon,
  CompDeckCarousel,
  CompDhunnaGold,
  CompEditorialSerif,
  CompFloorHighlight,
  CompHormoziViral,
  CompLogoSaber,
  CompMapRoute,
  CompMrBeastHype,
  CompPhotoCard,
  CompSvgIcons,
  CompTriptych,
  CompWireframe3D,
} from './PresetCompositions';

export const Root: React.FC = () => {
  return (
    <>
      <Composition id="Icons-Sheet" component={IconSheet} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d', weight: 'duotone' as const}} />
      {/* production components, per brand theme: the audit and preview reel */}
      <Composition id="Shaders-Dhunna54D" component={ShaderTour} durationInFrames={SHADER_SEG * 6} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d'}} />
      <Composition id="Shaders-DhunnaGold" component={ShaderTour} durationInFrames={SHADER_SEG * 6} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna'}} />
      <Composition id="Shaders-CrownCrest" component={ShaderTour} durationInFrames={SHADER_SEG * 6} fps={30} width={1080} height={1920} defaultProps={{theme: 'crown_crest'}} />
      <Composition id="Shaders-Grid-Dhunna54D" component={ShaderGrid} durationInFrames={240} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d'}} />
      <Composition id="Shaders-Grid-CrownCrest" component={ShaderGrid} durationInFrames={240} fps={30} width={1080} height={1920} defaultProps={{theme: 'crown_crest'}} />
      <Composition id="Pro-Showcase-Dhunna54D" component={ProShowcase} durationInFrames={SEG * 15} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d'}} />
      <Composition id="Pro-Showcase-DhunnaGold" component={ProShowcase} durationInFrames={SEG * 15} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna'}} />
      <Composition id="Pro-Showcase-CrownCrest" component={ProShowcase} durationInFrames={SEG * 15} fps={30} width={1080} height={1920} defaultProps={{theme: 'crown_crest'}} />
      <Composition id="Mograph-TogglePills" component={TogglePillsDemo} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d'}} />
      <Composition id="Mograph-TogglePills-CrownCrest" component={TogglePillsDemo} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{theme: 'crown_crest'}} />
      <Composition id="Mograph-ShapeMorph" component={ShapeMorphDemo} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={{theme: 'dhunna_54d'}} />
      {/* ─── 00. MASTER SHOWCASE ─── */}
      <Composition
        id="00-Full-Showcase"
        component={DemoComposition}
        durationInFrames={370}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── CAPTION PRESETS ─── */}
      <Composition
        id="01-Caption-Dhunna-Gold"
        component={CompDhunnaGold}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="02-Caption-Crown-Silver"
        component={CompCrownSilver}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="03-Caption-Architectural-Slit"
        component={CompArchitecturalSlit}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="04-Caption-Hormozi-Viral"
        component={CompHormoziViral}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="05-Caption-MrBeast-Hype"
        component={CompMrBeastHype}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="06-Caption-Ali-Abdaal-Clean"
        component={CompAliAbdaal}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="07-Caption-Cyberpunk-Neon"
        component={CompCyberpunkNeon}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="08-Caption-Apple-Keynote"
        component={CompAppleKeynote}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="09-Caption-Editorial-Serif"
        component={CompEditorialSerif}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── UI CARDS, CAROUSELS & HIGHLIGHTS ─── */}
      <Composition
        id="10-Checklist-Amenity-Card"
        component={CompChecklist}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="11-PhotoCard-Gallery-Drift"
        component={CompPhotoCard}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="12-Deck-Stacking-Carousel"
        component={CompDeckCarousel}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="13-Floor-Level-Illumination"
        component={CompFloorHighlight}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="14-Triptych-3Way-Split"
        component={CompTriptych}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── 3D WEBGL GRAPHICS ─── */}
      <Composition
        id="15-3D-Gold-Rupee-Coin"
        component={CompCoin3D}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="16-3D-Wireframe-Tower"
        component={CompWireframe3D}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ─── TECHNICAL SVG & LOGOS ─── */}
      <Composition
        id="17-CAD-Blueprint-Drafting"
        component={CompCadGrid}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="18-Animated-SVG-Line-Icons"
        component={CompSvgIcons}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="19-Map-Route-Navigation"
        component={CompMapRoute}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="20-Brand-Logo-Saber-Laser"
        component={CompLogoSaber}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
