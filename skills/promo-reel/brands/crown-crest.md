# Crown Crest

Commercial building (offices, showrooms) with a rooftop sports + social club, **Sky Paddle** (pickleball, padel, rooftop kitchen, al fresco café). Tagline from the VO: "jahan business aur lifestyle, dono premium hain."

## Design system

- **Metal:** rose gold. `color.gold` holds `oklch(0.78 0.085 45)` so engine components re-skin; bevel face `#dca48d`, extrusion `#8c5846 → #46271d`, 3D metal `#d69c84`.
- **Ground:** warm near-black `oklch(0.135 0.009 45)`; cream ink `oklch(0.955 0.018 70)`.
- **Type:** Geist everywhere; **Cinzel 600** (inscriptional caps) only for brand names — CROWN CREST, SKY PADDLE — matching the logo's serif. Headings: light/display pairs, key word in bright **champagne** bevel (`tone="champagne"`); no all caps.
- **Logo:** round rose-gold medallion with crown (`crowncrest-logo.png`, has alpha). `CrestLogo` reveals it: saber light traces the rim → emblem resolves → sheen.
- **Grade:** warm cream highlights, slightly muted greens (courts stay readable, never neon).

## Approved looks

- Office amenities as a **checklist card** (icon chips draw on, check marks draw themselves).
- Office photos as **gallery photo cards** over a blurred room; meeting room as a video card.
- Glass lift: tracked tag on the facade's left tower.
- Sky Paddle: brand reveal in Cinzel on the music drop, then top-down courts.
- Work/relax split screen; CTA over the lit dusk facade with Leasing / Selling pills.
- Music: "Extraordinary" (Rockot, Pixabay, no Content ID), drop on "Sky Paddle".

## The v2 system (Ice Cream Masters, Oct 2026)

- **Cards and carousels on the house theme**; never full-bleed video; a clean backdrop (no blurred video behind cards).
- **Building shots:** the ChatGPT façade sets in `public/cc-gpt/` as depth-moved cards.
  - `locked/`: evening, daylight, golden, night trails, print.
  - `perspectives/`: across-wide, aerial with the rooftop padel court, low, right34. The user removed left34.
  - Plus the real drone clips in `footage-bright/` (front, intro, city).
- **Type-only beats** ("Nayi opportunities", "First big highlight?", "None other than…") as `TypeSpace`:
  - champagne-gold extruded Geist with an animated smooth ramp;
  - floating gold spheres, rings and diamonds;
  - no floor.
- **Brand reveals:** the Ice Cream Masters card arrives on its name; branch imagery carries "Existing branch imagery · Crown Crest outlet upcoming".
- **Map:** `CCMap` from Ludhiana to Barewal Road (OSM way 256721737) with the road highlighted; captions only on the map beats.

## Project and assets

- Project: `/Volumes/disk 2/crowncrest-skypaddle` (StoryV2 in `src/crowncrest-v2/`). Masters: `output/crowncrest-v2-2026-10-16/` (v2b → v2d).
  - Drive: "Crown Crest Creatives / Ice Cream Masters v2 (16 Oct)".
- v1 project: `/Volumes/disk 2/Downloads/crowncrest downloads/crowncrest` (assets in the parent folder; phone clips in `../Mobile/`).
- Footage is 360-camera and phone: always run through `scripts/make_proxies.sh` (vid.stab + slow-mo).
- No contact number or address supplied yet — ask before adding one.
