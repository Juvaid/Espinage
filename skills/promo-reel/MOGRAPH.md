# Motion-graphics elements

UI-like elements that carry information and lift engagement: a list becomes switches turning on, a number counts up, an outline becomes the next idea. They are shared across brands. Every one is themed by the brand's tokens through `KitThemeProvider` (`reel-components-kit/src/theme/KitTheme.tsx`: `dhunna_54d`, `dhunna`, `crown_crest`), never restyled by hand per film.

The library is `/Volumes/disk 2/reel-components-kit` (also in Espinage under `kit/`). **Read its `CATALOG.md` first**: every production component, with its job, props, showcase segment and status. `AUDIT.md` lists the legacy components not to use. `ICONS-AND-EFFECTS.md` covers icon sets and effects to port next. Import from the kit root (`src/pro`), wrap the film in `<KitThemeProvider theme="…">`, and pass the theme as props into R3F canvases.

Preview with `npx remotion studio src/demo/index.ts`:
- `Pro-Showcase-Dhunna54D`, `-DhunnaGold`, `-CrownCrest`: 15 segments × 90 frames;
- `Mograph-TogglePills`, `Mograph-ShapeMorph`, `Icons-Sheet`.

For stills, run `node scripts/stills.mjs out/check <Comp>:<frame> …` (3–4 frames per call).

| Element | Use for | Component | Motion |
|---|---|---|---|
| **Toggle pills** | 2–4 short benefits ("Premium investment", "Timeless luxury", "Prime location") | `TogglePills` | Rows slide in with a 5-frame stagger. On each spoken benefit the knob slides across (stretching mid-travel), the track fills with the metal, the icon turns once and the label lights up. The off state stays readable (visible track, ringed knob, label at 62 %) |
| **Checklist card** | A list of amenities or features | `Checklist` | Chip icon (Phosphor duotone), text slides up, ring then tick draw on the row's word; 46 px rows |
| **Number ticker** | One number that matters (80 ft, 82 ft, floors) | `NumberTicker` | Digits roll through a soft-masked window and land on the word, 22 frames; unit in light weight |
| **Dimension bar** | Widths and lengths | `Front` | A line draws out from the centre with end ticks; the measure sits on it |
| **Shape morph** | One idea becoming the next (pin → building → key → home) | `ShapeMorph` + `MORPH_SHAPES` | Outlines resampled and aligned, blended over 18–30 frames, in-out; metal fill. Single-contour shapes only |
| **Pin / place** | The site on a map, travel | `WirePin` (can travel), `Place`, `AnimatedBeam` | Pin draws in perspective; a beam connects city → site |
| **Deck / carousel / floors** | Floor plans, galleries, which floor is what | `Carousel`, `Deck`, `FloorStack`, `Floors`, `SidePair` | One step per spoken item; the focused card is lit |
| **Orbit** | "Everything around it": amenities or places around the site | `Orbit` with `KitIcon` chips | Ring opens, 3–6 chips circle with depth scale |
| **Lens** | A detail worth seeing in a photo | `Lens` | Loupe glides once, magnified inside |
| **Card accents** | The card or button that matters this beat | `BorderBeam`, `ShineSweep`, `Spotlight` | One lap, one sweep, once |
| **Shader backdrop** | The ground of a scene, instead of a flat backdrop | `ShaderBackdrop` (`mesh`, `silk`, `metal`, `aurora`, `rays`, `contour`) | Slow, frame-driven, brand palette. One kind per section, a new `seed` per scene, `energy` 0.3–0.6 under content. Pick by meaning: contour for land and location, rays for reveals, metal behind 3D type |
| **Grade and lens** | One look across renders, footage and stock | `Grade` (brand split-tone, halation), `Vignette`, `FocusPull`, `LightLeak` (once per film) | Grade every picture in a film the same way; leak only on the reveal |
| **Text effects** | Hero word, use-cases in one slot, quiet subtitles | `ShimmerText`, `WordRotate`, `BlurInText`, `SlitLine` | Each lands on its spoken frame; one per screen |
| **Figures** | 2–4 numbers from the brief | `StatGrid` | Ticks in on each word |
| **Location** | Distances, route, a point on a picture | `DistanceRings`, `RouteDraw`, `Callout` | Labels and distances from the brief only |
| **Background line art** | Behind "vision" or "location" lines | `WireEye`, `WirePin`, `ArchGrid` | Low opacity, behind the hero, never on it |
| **3D coins** | Money, investing, returns | `CoinRain` | Only when money is spoken |
| **Logo reveal** | The end mark | `LogoReveal` (`mask` metal or `image` as is) | Metal fills, one sheen |
| **Icons** | Inside a control or chip | `KitIcon` (85 Phosphor icons, fill/duotone) | Pops in on its word |

Not for client films: the legacy `ChecklistCard`, `MetricCounter`, `DeckCarousel`, `TriptychColumns`, `FloorHighlight`, `AnimatedSvgIcon`, `LogoSaberReveal`, `SpinningCoin3D`, `WireframeTower3D`, `Atmosphere`, `KineticCaption` and the creator caption presets. They render as placeholders: small type, empty cards, clipped 3D. AUDIT.md lists the replacement for each.

Rules:
- **One element type per screen, one change per spoken word.** Elements build in order; they never all appear at once.
- **Size for a phone:** labels at least 44 px and hero numbers 140 px or more, inside the safe zones (EDIT.md §3).
- **Icons:** solid or duotone, meaningful, inside a control (a knob, a chip, a tag). Never thin line icons stamped on headings (TASTE.md).
- **Effects:** one per beat, on the element that matters. Port Magic UI or Aceternity ideas frame-driven; never use CSS keyframes.
- **New elements go into the kit:** add the component to `src/pro`, a showcase segment, a CATALOG row and a still check, themed by tokens so every brand gets them. Then sync the kit to Espinage. Brand-only looks stay in the brand file and theme.
- **GSAP** (`@remotion/gsap`, installed in the 54D project) suits dense, staggered element choreography (MOTION.md). GSAP's MorphSVG plugin is an alternative to `ShapeMorph` for complex outlines.
