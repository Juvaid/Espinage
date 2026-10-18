# Kit roadmap

The kit should hold everything a reel needs beyond the client's own pictures and voice. That way a new film is assembly and taste, not rebuilding. This file lists what exists, what each reel style still lacks, and the order we build in.

## Inventory by layer (2026-10-18)

| Layer | Have | Gap |
|---|---|---|
| Ground | `Backdrop`, `Space`, `ShaderBackdrop` ×6, `ArchGrid`, `WireEye`, `WirePin` | — |
| Type | `Heading`, `Bevel`, `TypeSpace` (3D), `TextBehind`, `NumberTicker`, `Place` | Word rotate, one-pass shimmer, blur-in words, masked line reveal |
| Pictures | `Hero`/`DepthCard`, `SidePair`, `Carousel`, `FloorStack`, `PhotoCard`, card set, `Lens` | Ken Burns drift with rack focus, depth reveal (near → far) |
| Lists and controls | `Checklist`, `TogglePills`, `ShapeMorph`, `KitIcon` | Stat grid (2–4 tickers) |
| Location | `WirePin`, `AnimatedBeam`, `Place` | Distance rings, route draw over a map, callout with leader line |
| Transitions | none in the kit (they live in film projects) | **Whip, zoom-through, blur dissolve, iris, shape wipe, light sweep, slats, card flip, depth reveal; each with its sound** |
| Grade and lens | none | **Brand split-tone grade, halation, vignette, light leak, focus pull, chromatic edge (in transitions only)** |
| Brand moments | `CTA`, `LogoReveal`, `Wordmark`, `CoinRain` | — |
| Sound | `FilmAudio`, `swish`, `ticks`, `reveal` | Transition-aware SFX (each transition says what it sounds like) |
| QA | `stills.mjs` | Contact sheet per film with safe-zone overlay; caption-duplicate check |

## Bundle 1 (done 2026-10-18; see CATALOG.md)

- **Transitions** (`Transitions.tsx`): `Scenes` / `Scene` / `Cut` to sequence scenes with overlapping transitions, and `TRANSITION_KINDS`:
  - whip, push (zoom-through), blur (dissolve), iris, shape (pin, house or any `MORPH_SHAPES`), sweep (light bar), slats and flip.
  - `sceneSfx()` returns the matching sounds.
- **DepthReveal** (`DepthReveal.tsx`): a photo builds in near-to-far from its depth map, with a light edge. WebGL.
- **Grade and lens** (`Grade.tsx`):
  - `Grade` (brand split-tone, contrast and halation in one SVG filter);
  - `Vignette`, `LightLeak` and `FocusPull`.
- **Text effects** (`TextFx.tsx`): `WordRotate`, `ShimmerText`, `BlurInText` and `SlitLine`.
- **Location** (`Location.tsx`): `DistanceRings`, `RouteDraw` and `Callout`.
- **Stat grid** (`StatGrid` in `TextFx.tsx`).
- **Showcase:** `Bundle-*` compositions, one segment per element, in all three themes.

## Bundle 2 (next)

- **QA script:** a contact sheet of every beat with safe zones drawn, a caption-duplicate check and a contrast check on headings.
- **Footage helpers:** `SpeedRamp` (frame-mapped `OffthreadVideo`), stabilised crop and `TrackedTag` (keyframed track points).
- **Presenter helpers:** a caption stack (lead / hero / tail) with face-safe bands.
- **Grade:** LUT support (`.cube` → WebGL) for footage that needs a real grade.
- **Transitions:** object wipe (a roto or depth matte of a foreground object reveals the next shot) and match-cut helper.

## Improvements to the film projects

1. **Import from the kit instead of copying.** The 54D, Crown Crest and reel3 projects each hold their own copies (`v3/parts.tsx`, GCards, Bevel), so a fix in one never reaches the others. Point the projects at the kit with a webpack alias in `remotion.config.ts` (`reel-components-kit` → `/Volumes/disk 2/reel-components-kit/src`), then delete the copies film by film.
2. **One beat manifest per film.** Today a film's timing is spread across component props. A JSON beat list (word frames from `align_vo.py` → beat → component + props) would make script-to-film a fill-in step and let QA read it.
3. **Pick shader grounds by section,** not one backdrop for the whole film, and give every scene its own `seed`.
4. **SFX from the edit:** transitions and builds emit their sounds, so there are no hand-placed swishes to drift out of sync.
5. **A kit `node_modules` of its own.** The symlink into `dhunnainfra-reel3` means a dependency change there can break the kit. Disk 2 has the room; the internal drive does not.
