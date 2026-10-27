# WordLord Media taste: Winter Arc

The owner set the bar at **8.5/10**, as for Tech Lords. Shared rules live in `brands/tech-lords-taste.md` ("Transfer to WordLord Media"). This file is what is specific to WordLord's Winter Arc season.

## Voice in three physical words

**Crisp, friendly, confident.** A fresh white hoodie, a cold clear winter morning, a mascot who winks at you. Clean, never sterile: the elephant brings the warmth and the cobalt brings the snap.

## Build around the brand, not the colour (owner, 24 Oct 2026)

- **What "Winter Arc" means:** it is only the project folder's name. It is not a season, theme or campaign; don't build winter or training-arc concepts from it.
- **The palette:** the owner's **Minimal & Clean** scheme, used as given.
- **The owner's rule:** "build it around our branding, not only the colour palette; other brands use cobalt too."
  - Cobalt on white with a mascot is generic.
  - Every piece carries what only WordLord has: the logo's tall D, the elephant mascot, the brush line, the spaced tagline, the BRAND / CONTENT / STRATEGY / GROWTH book spines, and merch.
- **The current series:** **Wordlord's Winter General**, a minimal editorial magazine about the cobalt blue colour trend 2026. The plan is in `wordlord-social/docs/WINTER-GENERAL-PLAN.md`, and the moodboard and checked brand facts are in `wordlord-social/out/moodboard/`.
- **Build it programmatically.** Layout, type, swatches and cards are live Remotion code. ChatGPT makes only isolated cutouts on flat green (the elephant's poses, cobalt objects), which we key to PNG and place in code, so every element stays changeable.
- **Brand examples must be true.**
  - Use one checked fact per brand, with its source.
  - Never generate images of real brands' products or logos.
  - ChatGPT's draft invented a cobalt Blue Tokai can, an Apple and a BMW that don't hold up.

## Colour

- **Ground:** white `#F8FAFC` or ice blue `#BFD8FE`. Dark frames use navy `#0B1B3A`.
- **Cobalt `#0047AB`** is the one signal per frame: MEDIA in the logo, the crown, the sneakers, a key word, one chart line.
- **Grey `#D1D5DB`** is for hairlines and quiet chips. Ink is charcoal `#393939`.
- **No vermilion red** in Winter Arc pieces. Red is the base brand's, and the season replaces it.
- **No texture behind type.** The dots, grain and silk of Tech Lords are not part of this look. Winter Arc is flat and clean, and depth comes from soft cobalt shadows and the mascot.

## The mascot: the elephant (from 27 Oct 2026)

The owner replaced the bull with an elephant. Reference: `wordlord-social/assets/winter-general/elephant/` (`ref-character-sheet.webp`: turnaround, expressions, props, palette; `ref-cover-elephant.webp`: the cover).

- **On model:** grey elephant, pink inner ears and blush, cobalt knit beanie with a small white crown patch (some poses a "W" patch), white hoodie (WORD LORD MEDIA on the chest), cobalt waist bag, dark cargo trousers, white-and-cobalt sneakers; sunglasses for the cool pose. Its own sheet palette: cobalt #0052CC, grey #D6D6D6, white #F5F7FA, ice #B7D8FF.
- **Make new art in ChatGPT with both reference images attached**, on flat #00FF00, then key with `scripts/key_green.py`. Fastest route: Claude in Chrome (uploads and downloads work). The in-app browser blocks both; the ChatGPT desktop app works only in front.
- **Use the owner's finished art when it fits:** the cover plate is their cover with the type lifted off (`scripts/clean_elephant_cover.py`).
- **Placements so far:** cover, in the coffee cup under live WINTER / GENERAL.; closing, peeking up over the ice panel's bottom edge with the beanie breaking out above it.

## Retired: the bull (archived 27 Oct 2026)

Everything below about the bull is history. Its assets are archived; don't use it in new work. The layout lessons (hero bleeding off an edge, type never on the face, one logo per slide) still apply to the elephant.


- **True to the owner's reference, always.** Redraw it, never redesign it. Every new drawing goes through the pipeline in `wordlord-social/src/winter/README.md` and is checked against the reference sheet.
- **Rig vs library:**
  - Use the **rig** (`<Bull>`, drawn frames) for animated poses, blinking and talking.
  - Use the **library** (`<BullArt>`) for specific gestures: point, thumbs-up, peace, laptop, phone, chart, camera, growth arrow, events, chair.
  - Use **stickers** as reaction punctuation in corners.
- **Covers:** the bull is the hero. A big pose drawing bleeds off a frame edge, with the headline set *behind* or *beside* him, never on his face.
- **Inner slides:** he is small. A bust in a corner reacts to the content (idea, thinking, surprised), or a sticker punctuates a point.
- **Closing slides:** a celebrate or thumbs-up sticker at sign-off size. Never a giant logo; that was a Tech Lords lesson.
- **The hoodie logo** is always our vector logo, never a traced or generated print.

## Type (to confirm with the owner)

**Locked by the owner, 24 Oct 2026:** Sofia Sans Extra Condensed and Caveat Brush (`wordlord-social/src/winter/type.tsx` → `WINTER_TYPE`). The fonts are in `wordlord-social/public/fonts`.

- **Display: Sofia Sans Extra Condensed** at weight 820, set as stacked uppercase lockups like the wordmark (`StackLockup`). It's the tightest of the condensed grotesks and closest to the logo's narrow letters.
  - The owner compared it with Barlow Condensed and Saira ExtraCondensed on the carousel cover (`out/winter-arc-01/type-options.jpg`).
  - Saira's wider letters let the bull cover the cover's key word, so it is out.
  - Numerals: weight 900.
- **Supporting type:** spaced caps for taglines ("IDEAS. CONTENT. STRATEGY. GROWTH."), wide-tracked and light, in grey or charcoal. Body copy is Barlow 500 at 34 px.
- **Brush accent: Caveat Brush**, the hand-brushed "Bigger ideas. Bolder brands." (`Brush`, brush `caveat`).
  - Set in mixed case, slightly rotated (−7°), in cobalt.
  - It's a warm handwritten note against the condensed caps. The owner preferred it to Permanent Marker's loud all-caps.
  - Once per carousel, on the cover. Never a generated image.

## Carousels (from carousel 01, 24 Oct 2026)

`wordlord-social/src/winter/Carousel01.tsx`, folder Winter-Arc-Carousel-01; full-size stills in `wordlord-social/out/winter-arc-01/`.

- **Frame:** 1080 × 1350, 72 px margins. The page index ("02 / 07") is spaced caps, top right, cobalt (ice on navy).
- **Cover:** a stacked lead in charcoal, then **one giant cobalt word**, the tall-letter moment, with the bull standing in front of it. The brush line sits in the free corner, with "SWIPE" in spaced caps at the bottom. The bull may cover only the **last letter's lower right**, so the word still reads: the first pass hid the whole C and the key word read "AR".
- **Rhythm:** white slides, with one navy slide early (slide 2, the definition).
  - **On navy:** the accent row is ice blue, because cobalt fails contrast there (`StackLockup accentColor`).
  - **The black bull on navy** needs an ice disc behind him, or the fur disappears.
- **Pillar slides:**
  - a cobalt label ("01 · IDEAS") and a stacked three-row headline, with the last row in cobalt;
  - one honest line, at most 420 px wide;
  - a **giant ice numeral** (Sofia 900, 760 px) in the bottom left, bleeding off the edge, with the bull's pose drawing at the right just overlapping its last digit.
  - Two placements failed: a numeral fully behind the bull vanished, and one under the copy cluttered it.
- **One logo per slide.** When the bull's hoodie shows the logo, there is no corner mark. The cover's mark is about 124 px, and the close's sign-off logo is about 200 px.
- **Close:**
  - a stacked ask, with the cobalt row "WINTER ARC.";
  - one line of copy;
  - the tagline split over two lines, so the sticker never cuts it;
  - the thumbs-up sticker at the right.
- **Copy:** say what we do, never results, numbers, client names or CTA mechanics the owner hasn't confirmed.
  - Read every paragraph for widows: a lone "it." on a line is a fail.
- **Check before showing:** render all slides as one contact sheet. Look for a mascot over a key word, text under a sticker, widows, and two logos on one slide.

## Motion

- The rig swaps drawings; it never bends them. Ambient motion: breathing, a soft sway, and a drawn blink about every 3 s.
- **Gestures:** waves swing about ±12°. Hops squash and stretch gently (0.93/1.05; heavier looked rubbery).
- **Covers are complete on frame 0.** The mascot can be mid-pose, but nothing enters on the first frame.
- **Reactions:** swap between library drawings with a quick squash, settle in 6–8 frames with ease-out, and never scale up from 0.

## Scoring (same bar as Tech Lords)

| Points | What it takes |
|---|---|
| 6 | The mascot is off-model, or there's text in generated art, or the palette is muddy. |
| 7 | On-model and clean, but a part shows a seam, the face patch shows, or the layout is templated. |
| 8.5 | The mascot is unmistakably the owner's elephant, one cobalt signal, crisp type, motion with a job, nothing to remove. |

## Lessons from building the bull (23 Oct 2026)

- **Rig v1 failed:** the parts were drawn separately and then assembled by hand. The head, muzzle and limbs didn't add up to the character.
- **Rig v2 (a cut-out puppet from an exploded sheet) was also rejected ("no good").** Rotated sleeves look rubbery, arms stretch, and one hand drawing can't make every gesture. Painted-on lids and mouths look like stickers on the face, whatever the colour match.
- **Rig v3 works: drawn frames only.** Every pose, blink and mouth shape is a drawing of the owner's bull (`wordlord-social/src/winter/README.md`):
  - Draw four frames per sheet on one camera, with the neutral frame attached, changing only the arms and face.
  - Normalise every frame to the neutral one by horn-top, sole-bottom and head centre (`align_frames.py`), so swaps never jump.
  - Blink and talk frames keep the base pose's body exactly: only the eyes or mouth come from the new drawing (`face_swap_frames.py`, then `compose_face_svg.py` on the vector paths). Separately drawn or traced bodies shimmer: 3–8% of the silhouette for drawings, about 1.5% of the outline pixels for traces.
  - Motion on top stays tiny: 0.7% breathing, a 0.6° sway, a squash on pose change. Waves alternate two drawings on twos.
- **Chroma backgrounds:** use pure green for anything with a white hoodie on a white background, so the hoodie and backdrop never merge.
- **Separating drawings:** touching drawings split with a watershed. Loose marks (sparks, bulbs) join only a nearby drawing.
- **Only the actual logo.** Every logo instance (hoodies, covers, rig) is the master SVG's paths, recoloured to the owner's Winter version. Never a traced, redrawn or generated logo.
- **Refinement checks for the rig:** compare it at full size against the assembled drawing, then look for:
  - stubs or seams at the neck (cut pieces at the chin; fill the hood's V with fur);
  - stray limbs or tails that the reference view doesn't show (hide them by default);
  - backdrop colour leaking into the art (purple or green turning up in an iris or an edge; snap it back before tracing).
- **Trace smoothness:** corner 100, length 8, speckle 14 at 4× (rounder curves, no specks). The earlier, sharper settings showed steps at zoom.


## Reels (from the five-fonts reel, 24 Oct 2026)

`wordlord-social/src/winter/fonts/FiveFonts.tsx`, comp `WL-five-fonts`. The owner scored the first build 5/10 design, 6/10 presentation. What fixed it:

- **Voice:** Hinglish, masculine and energetic. Gemini **Fenrir**, with the script punctuated with "!" and a 5% lift in pace. Calm female voices (Sulafat) were rejected. WordLord doesn't borrow the Tech Lords hosts (Charon, Puck).
- **No caption track on type showcases** ("why are you cluttering it with small captions? keep minimal"). Each beat is the subject itself, huge and fitted to the safe width, with one tight partner line. The voice carries the rest.
- **Tight spacing:** stacked lines at 0.8–0.88 line height; the partner line sits about 22 px under the block.
- **Text effects, not flat type, but clean:**
  - outline to fill with an italic swap;
  - variable-axis morphs (width, weight, softness);
  - letters rising from a mask;
  - a tilt-up extrusion in a light tint of the face.
  - Rejected: dark muddy extrusion sides on a thin serif, gradient-filled text, and generic white UI cards with a scrolling alphabet.
- **Rhythm:** grounds alternate cobalt, white, ice, navy and white, cut with a 10-frame circle mask; a slow push keeps every beat moving.
- **Fonts:** measure only after the faces load, and re-render when they do. A fallback measure made Unbounded overflow.
- **Sound:** a fast original beat plus synced SFX (`scripts/score_fast.py`); one sound per event kind.
