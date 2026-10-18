# Catalog: production components (`src/pro`)

Every component here was lifted from a delivered film, re-themed through `KitThemeProvider`, and checked in the
showcase (`Pro-Showcase-Dhunna54D`, `-DhunnaGold`, `-CrownCrest`; 15 segments × 90 frames, segment *n* starts at
frame `n × 90`). Import from the kit root: `import {Heading, Carousel, KitThemeProvider} from 'reel-components-kit'`.

Status: **prod** = shipped in a film; **new** = built for the kit and checked frame-by-frame in the showcase, not yet in a film.

## Setup (every film)

| Component | Job | Key props |
|---|---|---|
| `KitThemeProvider` | Wrap the film once; every component reads the brand look | `theme`: `'dhunna_54d'` (navy steel) · `'dhunna'` (59-D gold) · `'crown_crest'` (champagne) · or a `KitTheme` object |
| `useKitTheme()` / `alpha(c, a)` | Read theme tokens; colour at an opacity | — |
| `Backdrop` | Brand ground: lifted gradient + soft fractal tint (no grain) | — |
| `BevelDefs` | SVG filter defs for `Bevel`; mount once per film | — |
| `useT()` | Film time in 30 fps units, so 60/120 fps renders keep the timing | — |
| `timing(vo, tail)` / `LEAD` | Scene timing from voice-over word times | `vo` from `align_vo.py` |
| `FilmAudio` | VO + music bed with a drop + SFX events (`swish`, `ticks`, `reveal`) | `vo, music, musicDrop, mark, total, events, bed` |

## Type

| Component | Job | Key props | Seg | Status |
|---|---|---|---|---|
| `Heading` | Two-weight heading (light 300 + display 640), words land on their spoken frame | `lines: {t, at, role: 'light'\|'accent'}[][]`, `from, to, y, size` | 0 | prod |
| `Bevel` | Metal-bevel hero word with a hue-aware glow | `tone`: steel/gold/champagne/ivory/crimson | 0 | prod |
| `TypeSpace` + `Space` | 3D extruded chrome type with dust and floating bits, for text-only beats and hooks | `font` (glyph JSON from `scripts/glyphs3d.py`), `lines: {text, weight, gold, at}[][]`, `dur, maxW, light` | 1 | prod |
| `TextBehind` | Word placed behind the subject: photo → word → depth cut-out | `src, cutout, word, at, dur, wordY, wordX, size` | 5 | prod |
| `Place` | Small place line ("Sarabha Nagar, Ludhiana") | `from, to, text` | — | prod |

## Pictures and cards

| Component | Job | Key props | Seg | Status |
|---|---|---|---|---|
| `Hero` / `DepthFace` / `DepthCard` | Photo with real parallax from a depth map (Depth Anything V2) | `src, depth, label, dur, move` (`MOVES.slide` etc.) | 0 | prod |
| `SidePair` | Two cards, second lands on its word | `a, b: Media`, `bAt, dur` | 2 | prod |
| `Carousel` | Cards advance on spoken steps | `items: Media[]`, `steps: number[]`, `dur` | 3 | prod |
| `FloorStack` | Floors stack as the voice names them | `items, steps: {at, level}[], start, dur` | 4 | prod |
| `PhotoCard` | Print-style card with a sheen, image or video | `src` or `video`, timing | 7 | prod |
| `Card` / `Pair` / `Front` / `Floors` / `Design` / `Deck` | G Investor card set (deck back-cards, "82 ft ka front" pair) | `Media = {image?, video?, offset?, label}` | 10 | prod |
| `MakeRoom` | Steps the content up and back so a CTA never sits on a card | `at` | 10 | prod |

## Lists and controls

| Component | Job | Key props | Seg | Status |
|---|---|---|---|---|
| `Checklist` | Amenity card: chip icon → text → check, per spoken word | `title, items: {icon, text, at}[], end` (icon = any `KitIcon` name) | 6 | prod |
| `TogglePills` | Benefits as toggles: knob slides and stretches, track fills, icon turns | `items: {label: [l1, l2?], icon, at}[], startFrame, top, left, rowGap` | 8 | new |
| `ShapeMorph` + `MORPH_SHAPES` | One outline becomes the next (pin → building → house) | `shapes: string[], at: number[], morph, size, fill` | 9 | new |
| `KitIcon` | Phosphor fill/duotone icon, 85-icon real-estate set; inside a control, never stamped on headings | `name, size, weight, color, at` | sheet | new |

## Brand moments

| Component | Job | Key props | Seg | Status |
|---|---|---|---|---|
| `CTA` | Stacked CTA: logo, label, press | `from, press, logo, label, top` | 10 | prod |
| `LogoReveal` | Logo in metal (`mask`: white master repainted) or as is (`image`) | `logo, ratio, start, width, mode` (theme gives all three) | 11 | prod |
| `Wordmark` | Small end wordmark | `from, logo` | — | prod |
| `CoinRain` | 3D ₹ coins falling, for money lines (StudioEnv lighting) | `dur, n` | — | prod |

## Background and effects

| Component | Job | Key props | Seg | Status |
|---|---|---|---|---|
| `WireEye` | Wireframe eye with globe iris, blink, chasing light; behind "vision" lines | `start, end, x, y, w, blinkAt, opacity` | 12 | prod |
| `WirePin` | Wireframe pin over a ground grid; can travel | `start, end, from, to, travel` | 12 | prod |
| `ArchGrid` | Faint drifting architectural grid | `opacity` (≤ 0.08) | 12 | prod |
| `BorderBeam` | A light runs once round a card or button border | wrap; `w, h, radius, at, dur, laps` | 13 | new |
| `NumberTicker` | Digits roll into place (soft-masked window) | `value, at, dur, size` | 13 | new |
| `ShineSweep` | One diagonal shine across a pill or button | wrap; `at, dur, radius` | 13 | new |
| `Orbit` | Chips circle a centre object on a tilted ring | `cx, cy, rx, ry, at, items, speed` | 14 | new |
| `AnimatedBeam` | Curved line draws between two points, then a light runs it | `from, to, at, curve, dur` | 14 | new |
| `Lens` | Loupe glides over a photo, magnified inside | `src, w, h, left, top, at, path, zoom, r` | 14 | new |
| `Spotlight` | Soft cone sweeps once across a card or word | `at, dur` | 14 | new |
| `Post` / `StudioEnv` | R3F post (bokeh depth of field + gentle bloom) and studio reflections | `focus, aperture, maxblur, bloom` | — | prod (OneTake) |

## Shader backdrops

`ShaderBackdrop` is a full-frame WebGL2 fragment shader, frame-driven and coloured from the theme's 3D palette. It replaces `Backdrop` for a scene. Its props are `kind, energy (0..1, default 0.5), speed, seed, res, opacity, colors`.

Demos:
- `Shaders-Dhunna54D`, `-DhunnaGold`, `-CrownCrest`: each kind for 90 frames behind a heading and a card.
- `Shaders-Grid-*`: all six side by side.

| kind | Look | Use behind | Status |
|---|---|---|---|
| `mesh` | Four soft pools of light drifting | Cards and headings; the default | new |
| `silk` | Broad satin folds with a soft sheen | Interiors, "luxury" lines | new |
| `metal` | Liquid chrome in the brand metal ramp; the top third is kept calm for headings | 3D type, logo, hooks (the loudest one; energy ≤ 0.5) | new |
| `aurora` | Broken curtains of light | Openers and hooks | new |
| `rays` | Shafts of light falling from above | Reveals, the brand name | new |
| `contour` | Drifting topographic lines (full resolution) | Location, map and land beats | new |

Use one kind per film section, with a different `seed` per scene so the pattern doesn't repeat. Keep `energy` at 0.3–0.6 under content. No grain: the only noise is a ±0.5/255 dither against banding. Renders need the ANGLE GL renderer, which `remotion.config.ts` sets.

## Transitions

These are frame-driven, with no `@remotion/transitions` dependency. `Scenes` sequences `Scene`s and the `Cut`s between them; each cut overlaps its two scenes by its length and plays its own sound (`sfx` defaults to on). `planScenes(children).total` gives the film length for `durationInFrames`. Demo: `Bundle-Transitions-*`.

| kind | Default length | Sound | Use |
|---|---|---|---|
| `cut` | 0 | — | Footage and presenter; the default |
| `whip` | 8 | whip | Energy between locations; `dir` = the way the picture travels; directional blur follows the motion |
| `push` | 10 | whoosh-hit | Into a detail or a new space (zoom-through) |
| `blur` | 12 | — | Between worlds only, never between two cards |
| `iris` | 16 | gleam | Opening from a point (`origin`) with a light ring |
| `shape` | 20 | ui-animation | Opens through a `MORPH_SHAPES` outline (pin, house…) that grows geometrically; corners fade in at the end |
| `sweep` | 16 | scan | A light bar wipes the next scene on: the big reveal, once per film |
| `slats` | 16 | swish | Seven strips slide in, staggered |
| `flip` | 16 | swish | The frame turns like a card: card ads |

## Grade and lens

Demo: `Bundle-Elements-*`, segments 0–1.

| Component | Job | Key props |
|---|---|---|
| `Grade` | Contrast S-curve + split-tone from the brand metal + halation + saturation, in one SVG filter; wrap a picture or a whole scene | `look` (`brand`/`neutral`/`night`/`golden`), `contrast`, `tone`, `halation`, `saturation` |
| `Vignette` | Edge falloff in the ground colour | `amount` 0.3–0.5 |
| `LightLeak` | Brand-tinted leak drifting across once; the biggest reveal only | `at` (peak), `dur`, `from`, `strength` |
| `FocusPull` | Rack focus with a small breath | `at, dur, from, to` (blur px) |

## Text effects and figures

Demo: `Bundle-Elements-*`, segments 2–4.

| Component | Job | Key props |
|---|---|---|
| `WordRotate` | One slot; words replace each other on their frames | `words: {t, at}[]`, `size` |
| `ShimmerText` | One pass of light through the hero word (brand ramp) | `text, at, dur, size` |
| `BlurInText` | Words come out of focus one by one; a quiet subtitle | `text, at, stagger` or `ats` |
| `SlitLine` | A line rises from a slit, with a drawn rule | `text, at, rule` |
| `StatGrid` | 2–4 figures ticking in, with unit and label; facts from the brief only | `items: {value, unit, label, at}[]` |

## Location

Demo: `Bundle-Elements-*`, segments 5–7. Labels and distances come from the brief only.

| Component | Job | Key props |
|---|---|---|
| `DistanceRings` | Rings open from the site, each with its chip | `x, y, start, rings: {r, label, at}[]` |
| `RouteDraw` | Route draws with a light at its head, ending in a pin and chip | `d` (SVG path in frame px), `at, dur, end: {text, icon}` |
| `Callout` | Point → elbow leader → solid chip with icon | `point, text, icon, at, side, rise, length` |

## Depth reveal

`DepthReveal` builds a photo in near → far from its depth map, with a light edge. It walks the depth histogram, so the area grows evenly even when most of the frame is far away. Props: `src, depth, at, dur, out, w, h, left, top, radius`. Demo: `Bundle-Elements-*`, segment 8.

## Rules agents must keep

- One effect per beat, on the element that matters. Icons only where they mean something, never spammed.
- CTA never over a card: wrap the cards in `MakeRoom`.
- Real assets only: Phosphor icons, project renders, depth maps. No plain line icons, no glassmorphism, no grain or dot textures.
- Never invent facts (prices, phone numbers, RERA, amenities a project doesn't have).
- Render stills and look at them before reporting: `node scripts/stills.mjs out/check Pro-Showcase-Dhunna54D:1200` (3–4 frames per call).
