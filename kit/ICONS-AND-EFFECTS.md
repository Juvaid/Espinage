# Icons and effects: what's in, and where to get more

## In the kit now

**Phosphor (MIT): 85 icons, fill and duotone.** They are vendored as path data in `src/icons/phosphor.json` and rendered by `KitIcon`. The `Icons-Sheet` composition shows them all.

| Group | Icons |
|---|---|
| property | buildings, building-office, building-apartment, storefront, house, house-line, warehouse, garage, elevator, stairs, door-open, desk, office-chair, armchair, bed, bathtub, swimming-pool, plant, tree, park |
| location | map-pin, map-pin-line, map-trifold, navigation-arrow, compass, globe-hemisphere-east, road-horizon, signpost, path, car, car-profile, train, airplane-takeoff |
| money | currency-inr, coins, hand-coins, piggy-bank, chart-line-up, trend-up, chart-bar, percent, tag, receipt, wallet, bank, vault |
| trust | shield-check, lock-key, key, security-camera, seal-check, certificate, handshake, medal, trophy, crown, diamond, star, sparkle, check-circle |
| measure | ruler, frame-corners, arrows-out, arrows-out-line-horizontal, square-half, blueprint, compass-tool |
| amenities | lightning, drop, wind, sun, wifi-high, barbell, coffee, fork-knife, shopping-bag, calendar-check, clock, users-three, briefcase, chat-circle-dots, phone-call, envelope-simple, whatsapp-logo, play-circle |

To add one, copy its fill and duotone `<path d>` from `@phosphor-icons/core` into the JSON with a group. Get the package with `npm pack @phosphor-icons/core` into `/Volumes/disk 2/tmp`, not into the kit's node_modules.

**Effects (`src/pro/Effects.tsx`)** are rebuilt frame-driven from Magic UI and Aceternity UI patterns: BorderBeam, ShineSweep, NumberTicker, AnimatedBeam, Spotlight, Lens and Orbit.

## Next candidates

These are open-source and usable in commercial films. Any CSS keyframe animation must be rebuilt on `useCurrentFrame` before use.

### Icon sets

| Set | Licence | Why | Use for |
|---|---|---|---|
| **Phosphor** (more of it) | MIT | Already matches; 1,500+ icons, six weights | First choice. Every new icon comes from here unless it's missing |
| **Tabler Icons** (filled subset) | MIT | 5,000+; good architecture and finance coverage (`building-skyscraper`, `building-estate`, `currency-rupee`) | Gaps Phosphor doesn't cover |
| **Lucide** (shadcn's default) | ISC | The shadcn/ui icon set; consistent outline style | Only inside UI-like mock screens (an app, a form). Outline-only, so it's too plain as a hero icon |
| **Iconoir** | MIT | Clean architectural outlines | Blueprint-style beats only |
| **Remix Icon** | Apache-2.0 | Fill and line pairs, strong on finance and maps | Second source for filled icons |
| **Simple Icons** | CC0 | Brand marks (WhatsApp, Instagram, Google Maps) | CTA buttons ("Message us on WhatsApp") |

Avoid stroke-only icons as standalone decoration; the client rejected them. Icons sit in a chip, knob, tag or button, at a readable size, and only where the word they illustrate is spoken.

### Objects better than icons

For money, keys or a pin as the hero of a beat, use a real asset:

- 3D renders (`CoinRain`), or the photo cut-outs made with depth maps.
- Poly Haven or Kenney models (CC0) for keys, coins and pins as GLB.

### Effects to add next (Magic UI, Aceternity UI, Motion Primitives; all MIT)

| Effect | Source | Film use | Notes |
|---|---|---|---|
| Text shimmer / animated gradient text | Magic UI | A hero word catches light once | Use the theme ramp; one pass, not a loop |
| Word rotate / flip words | Magic UI, Aceternity | "Showroom → Office → Clinic" use-cases on one line | Swap on spoken words |
| Marquee | Magic UI | Slow strip of project photos behind a heading | Low opacity; background only |
| Animated grid pattern / retro grid | Magic UI | Floor or perspective grid under 2D type | Replaces `CadDraftingGrid` |
| Meteors / sparkles | Magic UI, Aceternity | Brand reveal accent | Sparingly: CTA or logo only |
| Card spotlight / 3D card tilt | Aceternity | A card tilts towards the light as it lands | Pairs with `Card` |
| Text generate (blur-in per word) | Aceternity | Quiet subtitles under a 3D hook | Respect the caption-duplication rule |
| Tracing beam | Aceternity | A vertical line drawing down a floor list | Pairs with `FloorStack` |
| Dock magnify | Magic UI | Row of amenity chips where the spoken one grows | Pairs with `KitIcon` |
| Ripple / pulsating button | Magic UI | CTA press | One ripple on `press` |
| Animated number (spring) | Motion Primitives | Area and frontage figures | `NumberTicker` covers digits; this is for decimals |
| Morphing text | Magic UI | "Invest → Own → Earn" | Same engine idea as `ShapeMorph`, for type |

Effects should come from Tailwind-ecosystem source code, ported into Remotion: read the component, keep the visual idea, drive it by frame, and theme it with `useKitTheme`. Never import a CSS-animated component as is; it renders differently on every frame.
