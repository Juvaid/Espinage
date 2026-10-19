# Taste: what slop looks like in a reel, and what to do instead

Every reel, scene, card or still you design must pass this file **before** you call it done. These are the mistakes agents keep making. They come from the user's own corrections on the Dhunna Infra and Crown Crest films (latest: Oct 2026, G Investor and Crown Crest v2d), plus the `taste-skill` and `impeccable` rules applied to motion.

## 1. Think before you build: the design read

Before writing a scene, write three lines in your notes or reply:

1. **What the viewer must feel and remember from this beat.** Name one idea, not three.
2. **The one hero element**: a word, a number, a shot or a card. Everything else supports it.
3. **The real asset that proves it**: the client's footage, photo, render or plan. If there is none, ask. Don't fake one.

If you can't fill all three lines, the scene isn't ready to build.

## 2. Banned: these read as AI-made

**Typography**
- Eyebrow kickers above headlines ("PREMIUM LOCATION", "WHY CHOOSE US").
- Numbered scaffolding ("01 / 03", "Step 1", "#1").
- Em-dash flourishes.
- Emoji.
- Gradient-filled text.
- Rainbow or neon glows.
- Hero words wider than the safe width. Use `fitSize`, not "it fits on my screen".
- Three or more type sizes in one frame.
- Every word bold. Contrast comes from light 300 next to display 640.
- More than one hero word per line.
- Caption text that doesn't match the spoken words, or appears before they're said.
- The same words twice on screen: a heading or 3D label plus a caption repeating it.
- All-caps headings or plain highlighted text with no type pairing.
- Default display serifs (Fraunces, Instrument Serif, Playfair), Inter, or system fonts. Use the brand file's faces.

**Layout and surfaces**
- Glassmorphism cards.
- Generic rounded white cards with drop shadows.
- Pill badges sprinkled on everything.
- Text floating loose over busy footage.
- Headings that wander: each beat's heading in a different place. One fixed heading slot per film.
- One card layout repeated for every beat. Vary it (measured, stacked, turning, fanned, carousel).
- Full-bleed video where the brand system uses cards (Crown Crest), and blurred video behind cards.
- A type-only beat as flat text on a plain ground. Put it in 3D space.
- A reflective floor under 3D type (rejected as cheap).
- An empty frame: a beat with only background and a caption.
- Symmetric grids of identical icons with labels. Use a checklist card, a carousel or a tracked tag (see the "information is a UI" rule in SKILL.md).
- Legend boxes, keys and fake UI chrome (fake browser bars, fake phone frames, fake dashboards).
- Content in the bottom ~360 px (the Reels caption and button zone), or pressed against the frame edge.
- A fact shown as a huge numeral floating over the map with a thin dimension bar, an uppercase tracked label ("WIDE ROAD", "PLOT") and the pin under it, while the caption repeats the same words (rejected 19 Oct 2026 on the 54D A, B, C, G, N, O, P, R films). Facts take the house heading in the fixed slot ("**80 ft** chaudi road"), and the caption steps aside while it shows.
- A glossy app-icon tile ("P" for parking) with animated chevrons and a tracked label. Say it in a heading ("Basement **parking**") or show the real thing.
- A dark, warm carved-stone look on a film whose brand look is navy and steel (54D Lumière, rejected as "too dull"): muddy brown grounds, words carved so faintly they don't read, a 5 s static end card on stone.

**Colour and finish**
- More than one accent colour.
- A neon or saturated accent (OKLCH chroma > 0.13).
- Pure black `#000` or pure white `#fff` grounds.
- Default purple, blue or teal "tech" gradients.
- A beige + brass + espresso palette unless the brand file says so.
- Ungraded footage next to graded footage.
- Over-sharpened bloom and harsh glow edges. Glows are soft and feathered.
- A metal gradient with a hard dark line through the letters. Metal ramps are smooth, with wide transitions.
- A glow in the wrong hue: steel and cool brands glow cool blue, gold brands warm.
- Dull, ungraded or dim footage; it reads untidy on a phone.
- Fine grain or dot textures on client work. Depth comes from brand assets, light and soft large-scale fractal-noise light.

**Motion**
- Bounce, elastic or overshoot easing on flat type (a small landing overshoot on 3D objects and lettering is approved).
- Everything sliding in from the same side.
- Fade-in on every element.
- Spinning or pulsing icons for no reason.
- Decorative props that the line doesn't call for (street trees and lamps added to the diorama were rejected as unnecessary). Keep the stage to what the words are about.
- Strong bloom: chrome and type blowing out to white. Keep bloom at a glint (MOTION.md).
- Thin line icons stamped on every heading or type screen (rejected as spam). Use an icon or overlay only where the words call for it, one per beat at most, as a real asset (3D coins, a 3D pin, the brand 3D icon set) at a size that reads.
- A call-to-action button laid over a card or photo. The closing picture shrinks in place (`MakeRoom`) and the wordmark and button get their own clear space below it.
- Whips, punch-ins and flash cuts between cards. Use clean slides (~16 frames, in-out) and match cuts.
- A zoom that rushes the establishing shot. Hold on the city before falling into the neighbourhood.
- Dead frames: nothing moving, or a static still with no drift.
- Several things animating at once, so the eye has no target.
- Transitions or animations that ignore the beat. Cuts land on the word; the music drop lands on the reveal.
- Shaky, ungraded or wrongly rotated clips.
- Tight, fisheye or cropped shots of the hero building. Show it whole, with sky and road.

**Content**
- Invented stats, phone numbers, addresses, landmark or building names.
- Stock footage of the wrong place standing in for the client's site.
- A generic render where the client's real footage of that exact thing exists.
- Labels stating guesses as fact.
- A brand or product shown before its name is spoken.
- Fabricated neighbouring buildings, roads or landmarks in maps and 3D scenes.
- Construction footage in Dhunna films; a café or terrace at 54D.

## 3. Instead, reach for these

- **Headings** in one slot: a light 300 word with a display 640 accent word in the brand metal (bevel, sheen pass, deep soft glow). The caption panel is solid, with the spoken word in the accent, and appears only where no heading speaks.
- **One steady move per shot:**
  - depth push or slide on stills (DepthCard);
  - slow orbit or dolly in 3D;
  - clean slides between cards;
  - a match cut plus a short dissolve between worlds (2D map → 3D).
- **Card layouts that change with the beat** (TECHNIQUES.md):
  - front card with a drawn dimension bar;
  - vertical floor stack with a floor rail;
  - tall card turning over its reflection;
  - fanned deck;
  - two prints side by side.
- **Information as UI:**
  - lists → a checklist card with self-drawing ticks;
  - measurements → dimension bars;
  - places → an OSM map or 3D scene with the road lit at its real width;
  - plans → a carousel.
- **Text behind the subject** on shots with a clear foreground subject (statue, tower, person): the hero word passes behind it (TECHNIQUES.md).
- **Type-only beats in 3D:** extruded lettering with a smooth animated metal ramp, a glow behind, dust and small metal objects at many depths, a slow centred dolly.
- **Reveals on the word:**
  - a chrome brand mark dropping behind the building and bouncing up clear of the roof;
  - a brand card arriving on its name;
  - the type beat before it holds the suspense.
- **Restraint:** one accent metal, one ground, one signature move per brand (see the brand file).

## 4. The check loop (mandatory, every time)

Thinking a scene through isn't checking it. **After you design or change any scene, render it and look at the result before you report back.** Never say "done", "looks good" or "fixed" about a visual you haven't seen as rendered pixels.

1. **Render stills** at every beat of the scene you touched: the first frame, each hero-word frame, each card or list state, and the last frame before the transition.
   `npx remotion still <Comp> --frame=<f> --scale=0.4 out/review/<scene>-<f>.png`
   Or batch many frames in one bundle with the project's `scripts/stills.mjs <outDir> Comp:frame …`, then tile them into one sheet; or render a half-res clip and use `tools/review_sheet.sh` (in this skill folder).
2. **Open and look at every image** (read the PNG). Describe in one line what a viewer actually sees, not what the code intends.
3. **Score it** against [`QUALITY.md`](QUALITY.md) and every ban in section 2. Write the result as a list: ✅ pass / ❌ fail with the reason. Be harsh: if a frame looks like a template, a stock ad or a PowerPoint slide, that's a fail.
4. **Fix every ❌**, re-render the same frames, and look again. Repeat until everything passes. Three loops without passing means the idea is wrong: go back to the design read in section 1 and change the concept, not the padding.
5. **Watch it in motion** once the stills pass: render a half-res review with audio, or play it in Studio. Check that the timing matches the voice, transitions read and nothing jitters. Make a contact sheet at 4 fps across any transition you changed.
6. **Report with evidence**: show the user the stills or contact sheet you checked, say what you fixed, and say what is still unconfirmed (facts, wording, assets).

## 5. Final gut check (ask about every frame)

- Would a premium real-estate brand's in-house team ship this frame as is?
- Can a viewer read it in under one second, on a phone, with the sound off?
- Is there exactly one place the eye goes first?
- Does it show the client's real thing?
- Would it still look intentional with the logo covered, or is it a template?

Any "no" means the frame fails. Go back to step 4.
