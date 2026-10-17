# Motion-graphics elements

UI-like elements that carry information and lift engagement: a list becomes switches turning on, a number counts up, an outline becomes the next idea. They are shared across brands. Every one is themed by the brand's tokens (`reel-components-kit/src/presets/themes.ts`: `dhunna`, `dhunna_54d`, `crown_crest`), never restyled by hand per film.

The library is `/Volumes/disk 2/reel-components-kit`. Previews: `npx remotion studio src/demo/index.ts`, or `npx remotion still src/demo/index.ts <Comp> out.jpg --frame=N`. Copy a component into the film project, or import it from the kit, and pass the brand theme.

| Element | Use for | Component | Motion |
|---|---|---|---|
| **Toggle pills** | 2–4 short benefits ("Premium investment", "Timeless luxury", "Prime location") | `TogglePills` (graphics) | Rows slide in with a 5-frame stagger. On each spoken benefit the knob slides across (stretching mid-travel), the track fills with the metal, the icon turns once and the label lights up |
| **Checklist card** | A list of amenities or features | `ChecklistCard` | Ring then tick draw on each row's word; solid reading card |
| **Counter** | One number that matters (80 ft, 82 ft, floors) | `MetricCounter` | Counts up over 18–24 frames, landing on the word; a unit in light weight |
| **Dimension bar** | Widths and lengths | `Front` in GCards (54D) | A line draws out from the centre with end ticks; the measure sits on it |
| **Shape morph** | One idea becoming the next (pin → building → key → home) | `ShapeMorph` + `MORPH_SHAPES` (svg) | Outlines resampled and aligned, blended over 18–30 frames, in-out; metal fill. Single-contour shapes only |
| **Map route / tracked pin** | Travel time, the way to the site | `MapRouteTrack`, `TrackedHoverPin`, `TagMarker` | The route draws, a pin pulses, a tag builds |
| **Deck / carousel** | Floor plans, galleries | `DeckCarousel`, GCards `Deck`, v3 `Carousel` | One step per spoken item; the focused card is lit |
| **Triptych** | Three spaces or uses at once | `TriptychColumns` | Columns reveal with an inset clip, then hold |
| **Floor highlight** | Which floors are what, on a facade photo | `FloorHighlight` | Bands light floor by floor with a sweep |
| **3D coins** | Money, investing, returns | `SpinningCoin3D` (kit), `CoinRain` (54D) | Only when money is spoken |
| **Logo reveal** | The end mark | `LogoSaberReveal` | A light traces the logo edge, the metal fills, one sheen |
| **Kinetic caption presets** | Brand caption looks | `KineticCaption` (`dhunna_luxury_gold`, `architectural_slit`, …) | Per preset |

Rules:
- **One element type per screen, one change per spoken word.** Elements build in order; they never all appear at once.
- **Size for a phone:** labels at least 44 px, hero numbers 140 px or more, inside the safe zones (EDIT.md §3).
- **Icons:** solid, meaningful glyphs inside a control (a knob, a tag), never thin line icons stamped on headings (TASTE.md).
- **New elements go into the kit** (component, demo composition, README line), themed by tokens, so every brand gets them. Brand-only looks stay in the brand file and theme.
- **GSAP** (`@remotion/gsap`, installed in the 54D project) suits dense, staggered element choreography (MOTION.md). GSAP's MorphSVG plugin is an alternative to `ShapeMorph` for complex outlines.
