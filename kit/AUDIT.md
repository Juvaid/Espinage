# Kit audit (2026-10-17)

The first version of the kit (`src/components`, `src/presets`, `src/engine`) was written as generic, config-driven
stand-ins for what the films actually used. Rendered at their demo frames (`out/legacy-sheet.jpg`), they read as
placeholders: small type, empty cards, clipped 3D, and none of the motion the films had. They are kept under
`legacy` and are not the kit's front door. The production versions now live in `src/pro`. See CATALOG.md.

## What each legacy component does, and what to use instead

| Legacy | Finding | Use instead |
|---|---|---|
| `KineticCaption` + caption presets | Small caption bar at the bottom; brand presets ignore the brand fonts (Outfit/Montserrat); five presets copy creator styles | `Heading`, `Bevel`, `TypeSpace` (brand films don't use a running caption bar) |
| Creator presets (`hormozi_viral`, `mrbeast_hype`, `ali_abdaal_clean`, `cyberpunk_neon`, `apple_keynote`) | Not on-brand for any client; marked **experimental** in `presets/captions.ts` | Only for non-brand social tests |
| `Bevel` (captions) | Older filter; no champagne tone, no hue-aware glow | `pro/Bevel` |
| `ChecklistCard` | Card at about a third of the frame width, 20 px text, plain line icons | `Checklist` (46 px rows, Phosphor duotone chips) |
| `PhotoCard` (graphics) | Demo card is an empty gradient; no media wiring | `pro/PhotoCard` (`src` / `video`) |
| `DeckCarousel` | Empty placeholder cards; deck motion is fine but there is no media | `Carousel`, `Deck` |
| `FloorHighlight` | Bands across a blank frame, tiny labels | `FloorStack`, `Floors` |
| `TriptychColumns` | Three empty columns, tiny labels | No pro equivalent yet. Rebuild with `Card` × 3 when a film needs it |
| `MetricCounter` | Serif number at 100 px with a thin rule; no roll | `NumberTicker` |
| `TagMarker` / `TrackedHoverPin` | Tiny labels (≈ 14 px) | `Place`, `WirePin` |
| `MapRouteTrack` | The route line draws well; badges are tiny | Keep the idea; pair with `AnimatedBeam`. Needs a refit before film use |
| `CadDraftingGrid` | Fine as a texture; its metadata text is unreadable | `ArchGrid` |
| `AnimatedSvgIcon` | Plain stroke icons at 40 px; this is the "plain icon" look the client rejected | `KitIcon` (Phosphor duotone) inside a chip or control |
| `LogoSaberReveal` | Renders "DHUNNA INFRA" as small serif text, not the logo | `LogoReveal` |
| `SpinningCoin3D` | Coin runs off the frame edge; the ₹ is a malformed emboss | `CoinRain` (glyph-accurate ₹, studio reflections) |
| `WireframeTower3D` / `ThreeStage` | Tower is clipped and has no subject; camera framing is off | `TypeSpace` stage, OneTake scenes in the 54D project |
| `Atmosphere` | Adds film grain and dust; grain is off-brand for client sites and films | `Backdrop` + `TypeSpace` dust |
| `ReelSceneRenderer` (engine) | JSON scene runner over the legacy set only | Compose `pro` components directly |

## Fixed in this pass

- **TogglePills off state:** the track was nearly invisible, so the off rows looked broken. It is now a lighter track with a 2 px hairline, a ringed knob, and the label at 62 % rising to 100 % when switched on. The pills are also larger: 300 × 134 track, 58 px labels.
- **TogglePills and ShapeMorph follow `KitThemeProvider`:** with no `theme` prop they read the brand theme, so demos no longer need `as never` casts.
- **ShapeMorph first frame:** it now starts on the first shape (p = 0), not a blend.
- **Checklist icons:** it takes any Phosphor name and renders it duotone. The legacy line-icon names still work.
- **NumberTicker roll:** digits roll through a soft-masked window, so you no longer see a hard-clipped half-digit mid-roll.
- **Geist "L" in 3D type:** the glyph self-intersected after variable-font instancing. Fixed by removing overlaps (`OverlapMode.REMOVE`, needs skia-pathops) before extrusion.
- **Public assets:** brand, sfx and audio are now real files rather than symlinks. Remotion's bundler didn't follow the symlinks, which is why logos failed to load.
- **Root export:** the root is now `src/pro`; legacy is reachable as `legacy.*`.

## Motion check

Every segment of `Pro-Showcase-*` was rendered as strips at offsets 4–88 (`out/motion/strips.jpg`) and in all three themes. All of these build, hold and exit on their frames:

- Carousel, floor stack, checklist and photo cards
- Toggles, morph, deck + CTA and logo reveal
- Wire eye and pin
- Border beam, number ticker and shine sweep
- Orbit, beam, lens and spotlight

## Known gaps

- `TriptychColumns` and `MapRouteTrack` have no production version yet.
- `TypeSpace` needs a glyph JSON per font, made with `scripts/glyphs3d.py` using the reel-tools venv with skia-pathops.
- `public/footage`, `illustrations`, `library`, `maps`, `models` and `stills` are symlinks into the client projects and are not committed. The showcase needs those projects on disk 2.
- `node_modules` is a symlink to `dhunnainfra-reel3/node_modules`. In a fresh clone, run `npm install` (it needs remotion, @remotion/three, three, @react-three/fiber).
