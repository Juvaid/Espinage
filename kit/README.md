# Reel components kit

Remotion components for 9:16 brand reels, taken from delivered Dhunna Infra and Crown Crest films. Every component is frame-driven, so renders are deterministic, and themed through one provider. The craft rules that go with this kit are in the `promo-reel` skill (`skills/promo-reel` in Espinage).

- **Projects as data** (`src/manifest`): a film as JSON (tracks of registered components with typed settings and editor controls), played by `ManifestReel`. See the top of CATALOG.md.
- **CATALOG.md**: every production component, with its job, key props, showcase segment and status. Start here.
- **AUDIT.md**: why the first-pass components are now `legacy`, what replaces each one, what was fixed, and the known gaps.
- **ICONS-AND-EFFECTS.md**: the vendored icon set and where to get more icons and effects (licences included).

## Use

```tsx
import {KitThemeProvider, Backdrop, BevelDefs, Heading, Carousel, TogglePills, CTA, MakeRoom} from 'reel-components-kit';

export const Film = () => (
  <KitThemeProvider theme="dhunna_54d">{/* or 'dhunna' (59-D gold), 'crown_crest' (champagne) */}
    <Backdrop />
    <BevelDefs />
    <Heading from={0} to={90} lines={[[{t: 'Premium', at: 6, role: 'light'}, {t: 'address', at: 12, role: 'accent'}]]} />
    <TogglePills startFrame={100} top={640} items={[{label: ['Prime', 'location'], icon: 'map-pin', at: 120}]} />
  </KitThemeProvider>
);
```

3D components (`TypeSpace`, `CoinRain`) take the theme as props inside the canvas, because React context doesn't cross into R3F; the owning component passes it. Legacy components are still reachable as `legacy.*`; don't use them for client films (see AUDIT.md).

## Look at it

```bash
npm run studio
```

Compositions:

- `Pro-Showcase-Dhunna54D`, `-DhunnaGold` and `-CrownCrest`: 15 segments × 90 frames each.
- `Mograph-TogglePills`, `Mograph-ShapeMorph` and `Icons-Sheet`.
- `00`–`20`: the legacy demos.

Stills for a quick check (3–4 frames per call; bigger batches run out of memory):

```bash
npm run stills -- out/check Pro-Showcase-CrownCrest:620 Pro-Showcase-Dhunna54D:1200
```

## Layout

```
src/pro/         production components (front door)
src/theme/       KitTheme tokens: dhunna_54d, dhunna, crown_crest
src/icons/       Phosphor subset (MIT) + KitIcon
src/components/  legacy first pass (+ TogglePills, ShapeMorph, which are current)
src/demo/        showcase compositions
scripts/         stills.mjs (batch stills), glyphs3d.py (3D glyph outlines for TypeSpace)
public/          brand, fonts, sfx, audio, samples (committed); footage/stills/maps/models/... are local symlinks
```

## Setup in a fresh clone

Run `npm install`. The kit has its own `node_modules` (Remotion pinned to exactly 4.0.536; never use `^` for Remotion packages, because every `@remotion/*` must match). On the Mac, `remotion.config.ts` and `scripts/stills.mjs` use Chrome 149 from `/Volumes/disk 2/.reel-tools/chrome-headless-shell-149`, because Remotion 4.0.536's Chromium 157 doesn't start reliably there. The 3D glyph script needs Python with `fonttools` and `skia-pathops`:

```bash
OUT=src/demo/type3d.json python scripts/glyphs3d.py
```
