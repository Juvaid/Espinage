# WordLord Media taste: Winter Arc

The owner set the bar at **8.5/10**, as for Tech Lords. Shared rules live in `brands/tech-lords-taste.md` ("Transfer to WordLord Media"). This file is what is specific to WordLord's Winter Arc season.

## Voice in three physical words

**Crisp, friendly, confident.** A fresh white hoodie, a cold clear winter morning, a mascot who winks at you. Clean, never sterile: the bull brings the warmth and the cobalt brings the snap.

## Colour

- **Ground:** white `#F8FAFC` or ice blue `#BFD8FE`. Dark frames use navy `#0B1B3A`.
- **Cobalt `#0047AB`** is the one signal per frame: MEDIA in the logo, the crown, the sneakers, a key word, one chart line.
- **Grey `#D1D5DB`** is for hairlines and quiet chips. Ink is charcoal `#393939`.
- **No vermilion red** in Winter Arc pieces. Red is the base brand's, and the season replaces it.
- **No texture behind type.** The dots, grain and silk of Tech Lords are not part of this look. Winter Arc is flat and clean, and depth comes from soft cobalt shadows and the mascot.

## The mascot (the bull)

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

- **Display:** a condensed grotesk that matches the logo's construction, set as stacked uppercase lockups like the wordmark. Barlow Condensed is the first candidate; the fonts are in `wordlord-social/public/fonts`. A specimen comes before the choice is locked.
- **Supporting type:** spaced caps for taglines ("IDEAS. CONTENT. STRATEGY. GROWTH."), wide-tracked and light, in grey or charcoal.
- **Brush lettering:** the reference's hand-brushed "Bigger ideas. Bolder brands." is a brand accent. Set it with a brush font, never as a generated image. Pick an OFL brush face, and show it to the owner first.

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
| 8.5 | The bull is unmistakably the owner's bull, one cobalt signal, crisp type, motion with a job, nothing to remove. |

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

