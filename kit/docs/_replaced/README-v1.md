# 🎬 Reel Components Kit

> Unified, config-driven, brand-themed (`dhunna`, `dhunna_54d`, `crown_crest` in `src/presets/themes.ts`; fonts via `src/lib/fonts.ts`) Remotion motion graphics, 3D WebGL, SVG animations & caption presets library. Decoupled from hardcoded project files, fully tweakable via JSON/TypeScript configs, and ready for AI agents or human editors.

---

## 📦 Complete Component Catalog (All Categories)

### 1. 🔤 Kinetic Caption Presets (`<KineticCaption />`)
* **`dhunna_luxury_gold`**: Cinematic champagne gold metal bevel with multi-layer SVG lighting filter, anisotropic sheen sweep, and dark warm backplate.
* **`crown_crest_silver`**: Royal chrome & silver metallic finish with soft glow halo.
* **`architectural_slit`**: Precision masked reveal with exponential deceleration curve, subtle scale spring, and champagne underline.
* **`viral_kinetic_pop`**: 1-frame punchline lead with electric yellow/gold hero word punch and calibrated shadow.
* **`minimal_editorial`**: Elegant serif/sans letter-rise with subtle fade.
* **Primitives**: `<Bevel />`, `<SlitWord />`, `<RiseLetters />`, `<SettleWord />`, `<PopWord />`.

### 2. 🗂️ Cards, Carousels & Multi-View Layouts
* **`<DeckCarousel />`**: Stacking 3D perspective card deck with active focus, slide transitions, depth offsets, and pagination pills (ideal for floor plans & galleries).
* **`<TriptychColumns />`**: 3-column (or N-column) animated vertical split screen with `clipPath` inset reveal, gold dividing lines, and category scrims.
* **`<FloorHighlight />`**: Architectural floor illumination bands across building facades with laser divider lines, warm color blend, and sheen sweeps.
* **`<ChecklistCard />`**: Drawn SVG circle ring + animated checkmark draw (`strokeDashoffset`) on spoken beats, with floating active row.
* **`<PhotoCard />`**: Media frame (image/video) with physical print sheen, hairline border glow, camera drift, and deck step-back on transition.
* **`<ArchitecturalCard />`**: Technical blueprint frame with registration crosshairs and metadata header.
* **`<TogglePills />`**: Benefit rows as toggle switches. The knob slides across (stretching mid-travel) on each spoken benefit, the track fills with the brand metal, the icon turns and the label lights. Demo: `Mograph-TogglePills` (+ `-CrownCrest`).

### 3. ✒️ SVG Animations & Technical Drafting
* **`<AnimatedSvgIcon />`**: 12+ custom architectural and luxury line icons (`lift`, `shield`, `design`, `pantry`, `restroom`, `parking`, `area`, `kitchen`, `alfresco`, `sky`, `chat`, `star`) that draw on stroke-by-stroke (`strokeDashoffset`).
* **`<CadDraftingGrid />`**: Technical architectural CAD grid with dashed lines, intersection crosshairs, dynamic GPS coordinates, and registration markers.
* **`<MapRouteTrack />`**: Animated navigation route with vector trajectory draw, glowing under-path, pulsing destination pin, and travel time badge.
* **`<TrackedHoverPin />`**: 2.5D perspective tracked location callout with animated leader line and target dot.
* **`<LogoSaberReveal />`**: Saber laser edge tracer cutting across logo letters, expanding metallic face fill, and sheen sweep.
* **`<ShapeMorph />`** + `MORPH_SHAPES`: one outline becoming the next (pin → building → key → house). Points are resampled and aligned, then blended with a metal fill. Demo: `Mograph-ShapeMorph`.

### 4. 🌐 3D WebGL Elements (Three.js + R3F)
* **`<ThreeStage />`**: Full-frame transparent WebGL stage with camera rig, lookAt targeting, directional key lights, and fog.
* **`<SpinningCoin3D />`**: Procedural 3D gold Rupee coin with embossed canvas textures, metallic cylinder geometry, and physics rotation.
* **`<WireframeTower3D />`**: 3D architectural wireframe massing model with luminous edges and continuous turntable rotation.

### 5. 🎞️ Cinematic Atmosphere FX (`<Atmosphere />`)
* Real-time SVG film grain filter (`feTurbulence`).
* Organic floating ambient dust motes with sinusoidal drift.
* Smooth drifting directional light leaks.
* Cinematic vignette corner falloff.

---

## 🛠️ Usage Examples

### 1. Animated SVG Line Icon
```tsx
import { AnimatedSvgIcon } from './reel-components-kit';

<AnimatedSvgIcon
  name="lift"
  startFrame={15}
  size={56}
  strokeColor="#DFB25A"
  glow
/>
```

### 2. 3D WebGL Coin or Wireframe Tower
```tsx
import { ThreeStage, SpinningCoin3D, WireframeTower3D } from './reel-components-kit';

<ThreeStage pos={[0, 0, 9]}>
  <SpinningCoin3D position={[2, 0, 0]} scale={1.8} symbol="₹" />
  <WireframeTower3D position={[-2, -1.5, 0]} scale={1.2} lineColor="#DFB25A" />
</ThreeStage>
```

### 3. Floor Plan Stacking Deck Carousel
```tsx
import { DeckCarousel } from './reel-components-kit';

<DeckCarousel
  startFrame={10}
  slideDuration={30}
  slides={[
    { id: '1', title: 'Ground Floor Showroom', subtitle: '3,200 SQ.FT' },
    { id: '2', title: 'First Floor Retail', subtitle: '4,100 SQ.FT' },
    { id: '3', title: 'Executive Offices', subtitle: 'TERRACE ACCESS' },
  ]}
  accentColor="#DFB25A"
/>
```

### 4. Complete Declarative Scene (Pure JSON Manifest for AI Agents)
```tsx
import { ReelSceneRenderer } from './reel-components-kit';

const manifest = {
  id: "hero_scene",
  durationFrames: 120,
  theme: "dhunna",
  captionPreset: "dhunna_luxury_gold",
  words: [
    { word: "EXPERIENCE", startFrame: 10, endFrame: 25 },
    { word: "TRUE", startFrame: 25, endFrame: 35 },
    { word: "LUXURY", startFrame: 35, endFrame: 65, isHero: true }
  ],
  graphics: [
    { type: "cadGrid", config: { startFrame: 5, opacity: 0.3 } },
    { type: "coin3D", config: { position: [2.2, 0.4, 0], scale: 1.7 } },
    { type: "checklist", config: { title: "PRIVILEGES", startFrame: 15, items: [...] } }
  ],
  atmosphere: { grain: true, lightLeak: true, vignette: true }
};

export const Scene = () => <ReelSceneRenderer manifest={manifest} />;
```

---

## 🖥️ Previewing the Complete Showcase
```bash
cd "/Volumes/disk 2/reel-components-kit"
npx remotion still src/demo/index.ts ReelPresetsShowcase out/preview.png --frame=45 --gl=angle
# Or launch Studio:
npx remotion studio src/demo/index.ts
```
