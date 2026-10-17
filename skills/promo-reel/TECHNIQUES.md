# Techniques

Recipes proven in the Dhunna 54D and Crown Crest films (Oct 2026). Each names the file to copy from; copy the component into the brand project rather than rewriting it.

## Depth from a still

- **Model:** Depth Anything V2 Small (ONNX) at `/Volumes/disk 2/.reel-tools/models/depth`, run with the reel-tools venv. Near = white.
  - 54D: `scripts/depth_maps.py <id>` (reads `public/gpt2/<id>.jpg`).
  - Crown Crest: `scripts/depth_tools.py depth <in.jpg> <out.png>`.
- **2.5D camera move:** a finely divided plane displaced by depth, camera on one short steady path, plane oversized 14% so edges never show.
  - Full frame: `54D src/DepthPhoto.tsx`. Inside a card: `crowncrest src/crowncrest-v2/DepthCard.tsx` (`focusY` picks the band of a tall image).
  - Moves: pull-back that ends wide `[0,0.25,-1.6] → [0.05,0,0.25]`, slide `[-0.4,…] → [0.4,…]`, rise up a façade `[0,-0.35,-0.5] → [0,0.25,-0.1]`.
- **Relight:** `LitPhoto.tsx` (both projects) shades a still by a moving light using normals from depth.
- **Text behind the subject** (use wherever a shot has a clear foreground subject against open background):
  1. **Pick the shot.** It needs a subject that stands clearly nearer than the background (statue against a façade, tower against sky, person against street), with open space behind it where the word can sit. Flat fronts with nothing nearer than the wall don't work.
  2. **Cut it out.** Make the depth map, then `scripts/cutout.py <id> <threshold 0–1>` (54D; e.g. `r-statue-tight 0.62`) or `depth_tools.py cutout <in> <thr> <out.png>` (Crown Crest) → an RGBA PNG of only the near subject.
     - Raise the threshold until the background is gone and the subject stays whole.
     - Check the edges over a bright colour before use.
     - For video, `depth_tools.py video <clip> <start> <dur> <outdir> <thr>` writes a matte per frame.
  3. **Stack three layers in the same box, with the same transform and camera move:** the photo, then the big type (one hero word, display weight, metal bevel), then the cut-out. The word reads "in" the scene, passing behind the subject.
  4. **Masks:** CSS masks need alpha PNGs, not grayscale. Preload every matte with `<Img>` so no frame renders before it loads.
  5. **Placement:** the word stays readable, with at most one letter partly hidden. If the subject covers a key letter, move the word, not the subject.
     - A centred statue hides the middle of a centred word. Drop the word to where the subject is narrowest (the legs, `wordY ≈ 0.8`), or shift it (`wordX`) so the gap between two words falls behind the subject.
     - Building against sky: frame the photo to show the sky (`imgPos '50% 0%'`) and set the word just above the roofline (`wordY ≈ 0.21`), so towers cut through the bottom of the letters. This was the strongest result (N3 "Floor plans").
     - Check every placement on a rendered still. It takes one or two nudges.
  - Component: `54D src/v3/parts.tsx` → `TextBehind` (props: `word`, `at`, `wordY`, `wordX`, `size`, `imgPos`). Photo, word and cut-out share one push.
  - Existing cut-outs: `public/cutout/{r-statue-tight,r-arch-tight,r-night,r-steps}.png` (54D). Used in Noir ("Crafted for Legacy" behind the statue).
- **Drawn linework:** `scripts/linework.py` turns a render into self-drawing pen strokes (Drawn film).

## 3D type and chrome

- **Outlines:** fontTools → SVG path per glyph, in font units, y up. Instance variable fonts with `overlap=OverlapMode.REMOVE` (needs `skia-pathops` in the reel-tools venv). Without it, Geist's L, and any letter built from overlapping contours, self-intersects and collapses into a wedge in 3D. Check every hero word for a broken letter.
  - Didot from `/System/Library/Fonts/Supplemental/Didot.ttc` (54D `src/investor/mark54d.json`).
  - Geist instanced per weight: `crowncrest scripts/glyphs3d.py "word:640" …` → `type3d.json`.
- **Geometry:** `SVGLoader().parse('<svg><path d=…/></svg>')` → `SVGLoader.createShapes` → `ExtrudeGeometry` (bevel on). Per-letter meshes so letters can stagger in.
- **Chrome / metal that reads:** a flat face reflects one direction only, so the faces carry a vertical colour ramp (canvas texture, `repeat = 1/width, 1/capHeight`) plus matching emissive. Bevels and sides stay mirror metal reflecting a custom canvas environment (dark floor, bright horizon band, softboxes) through PMREM.
  - Keep the ramp smooth: wide transitions and no hard dark line.
  - Animate `ramp.offset.y` so a band of light sweeps through the letters.
  - Steel for Dhunna, champagne gold for Crown Crest.
- **Space:** a soft glow sprite behind the words, additive warm dust points at many depths, and a few small metal objects (spheres, thin rings, octahedra) kept off the words. A slow symmetric camera dolly keeps the words centred. No reflective floor (rejected).
- **Components:**
  - `crowncrest src/crowncrest-v2/TypeSpace.tsx`: whole type-only beat.
  - `54D src/investor/Address3D.tsx` → `ChromeMark`: 54D letters dropping behind the building and bouncing up clear of the roof.

## Maps and the map → 3D match cut

- **Data:** Overpass API → `scripts/build_map.py` / `build_cc_map.py` → `map.json` with metres from the plot (x east, y south). It holds roads by class, parks, buildings, the surveyed plot and the front road.
- **2D map:** `MapScene.tsx` (54D) / `CCMap.tsx` (Crown Crest).
  - Hold wide on the city before the fall (`zoomFrom`).
  - The zoom eases in log space.
  - The target ring and label appear while the map is still city-wide.
- **Match cut** (`Address3D.tsx`): the 3D scene opens looking straight down, north up, at the 2D map's last scale (px/m → camera distance for the fov), with its pin where the 2D pin stands. The ground is the map laid flat (same topo plate, parks, footprints, road widths). Dissolve over the map's last ~12 frames while the zoom carries on, then tilt to 3/4.
- **In the 3D scene:** the plot lit, a pulse ring, the clay model rising out of the plot, the front road lit at its real width with edge lines, a dimension bar, and a camera-facing sprite label ("80 ft chaudi road").
- **Truth:** only real OSM buildings; widen the shot to reach them rather than inventing neighbours.

## Asset arsenal (use only where the words call for it)

Icons and overlays earn their place by meaning, not decoration. Use one per beat at most, at a size that reads (a real asset, never a thin line icon), and none at all where the picture already says it. The user rejected thin line icons on every heading.
- **Money / investing** ("paisa", "invest", "returns", "kiraya"): `54D src/v3/CoinRain.tsx`, a short rain of gold ₹ coins (metal rim, embossed ₹) through the frame at several depths, then gone. Used on G "Ludhiana mein paisa lagana hai". The coin model comes from `dhunnainfra-reelv3/src/three/Coins.tsx`.
- **Brand 3D icon set** (`dhunnainfra-reelv3/src/three/Icons.tsx`, gold / ivory / ink clay): map pin on a city tile, hard hat, studded shield with padlock, rocket, pinned note card. Use for security, growth or "plans" beats; port and re-tone to steel for 54D.
- **The map pin** (`Address3D` → `Pin`) for any address beat; **dimension bars** for measurements; **floor rail** for floors.
- **Missing assets** (cash bundles, keys, a handshake, a WhatsApp-style message bubble): brief ChatGPT/Codex for premium 3D renders on a transparent background, 1:1, steel or gold to the brand (SOURCING.md). Never fake app UI chrome.
- **Never:** thin line icons in rings on every heading; icons on the 3D type hooks; more than one icon per beat.

## Procedural 3D props

No Sketchfab connection; build props in code.
- **Map pin:** a teardrop silhouette (circle plus tangent lines to the tip) with a hole, extruded and bevelled, clear-coated steel. It faces the camera and lies flat to read as the 2D pin at a top-down start (`Address3D.tsx` → `Pin`).
- **Building:** the 54D clay model (`public/models/54d.glb`, `ClayModel.tsx`). It is indicative, so draw no plot outline on it.

## Stage take: locked camera, in-frame transitions (the user's preferred single take)

The camera holds: a locked-off frame with only a slow drift for life. The frame is a **stage**, and every change happens to the elements inside it, never by cutting or flying the camera. Name the moves in storyboards and scripts with these terms:
- **Stage:** the fixed frame and its depth layers. **Foreground** is type and hero objects, **midground** is the hero card or diorama, **background** is dimmed earlier elements, glow and dust. Elements move between layers instead of leaving.
- **Anchor:** the element that holds the eye's place across beats (the hero card position, the diorama, the building), so the viewer never re-orients.
- **Build on / build off:** how an element enters or leaves inside the frame.
  - *Slide*: from a frame edge.
  - *Rise / sink*: from below or into below.
  - *Pop*: scale 0.85→1 with an expo-out, never an elastic bounce on flat type.
  - *Unfold*: rotating from edge-on to facing.
  - *Draw-on*: for lines and roads.
  - *Drop*: for pins and lettering, with a small landing settle.
- **Hand-off:** the outgoing element stays and steps back a layer (dims, shrinks, moves behind) while the new one builds on in front. The previous beat remains as context.
- **Match transform (morph):** the outgoing element becomes the incoming one. Examples:
  - a card unfolds flat into a map tile;
  - a map tile tilts into a 3D diorama;
  - the hero card shrinks into the front card of the deck;
  - a floor slab slides out as a floor card.
- **Object wipe:** an element crossing the frame reveals the next beat behind it.
- **Diorama:** a small, tilted 3D tile of the real OSM neighbourhood (roads, plot, building, pin, road highlight) sitting on the stage like a model on a table. It is turned by the object's own rotation, not the camera's.
- **Beat stack:** stacked cards that slide past the anchor position (floors, carousels) with the focused one lit and the others dimmed.

Rules: one build per beat lands on the spoken word. The outgoing element always goes somewhere (hand-off, sink, slide off, morph), and never just disappears. The camera moves only in a slow drift of a few percent of the frame.

- **Hand-off placement:** the outgoing element steps back into an empty quadrant (up and to one side, smaller and dimmer), never under the incoming one, so the new hero word stays clean.
- **Diorama:** clip everything to the tile. Roads are clipped by segment against the tile radius, and the lit front road uses `Road80 maxLen`. Scale the tile so its width is about the frame width, and tilt it from facing the camera to ~0.6 rad as the match transform.

Component: `54D src/onetake/OneTakeV2.tsx` (`Flagship54D-OneTake-v2`); master `dhunna-54d_f2-flagship-stagetake_…_v01`.

## Single take in 3D, flying camera (no cuts)

Experiment, Oct 2026: `54D src/onetake/OneTake.tsx` (`Flagship54D-OneTake`). One `ThreeCanvas` and one camera carry the whole film through one world, with the same voice and screen-space headings as the cut version.
- **Stations:**
  - pictures as floating panels: a cover-cropped texture with a thin steel frame;
  - the 3D type (`Letters` scaled ~24) in the sky;
  - the OSM city with the pin, the rising clay 54D, the chrome mark and the lit road (exported from `Address3D`);
  - a floor stack, a facade panel and a fanned deck off to one side.
- **Camera:** keyframes (frame → position, target) joined by centripetal Catmull-Rom curves. The curve parameter is averaged over ±10 frames, so the move never stops or jerks at a key. Put keys just before and after each spoken cue, and add a held drift key where a line needs time (e.g. "Sarabha Nagar" after the mark lands).
- **Framing:** the camera stands far enough back that the panel width is about 3/4 of the frame width. For a portrait frame at fov 34, that's ~250 units from a 62-wide panel. Space stacked panels so a neighbour never sits behind a heading (90 units apart for 46-tall panels).
- **Rendering:** heavy; render stills one at a time, never in parallel with a film render.

## Card layouts (vary per beat)

All from `54D src/investor/GCards.tsx`, on one shared `Card` face:
- **Front:** one wide card with a measurement drawn under it as a dimension bar; the bar is the heading.
- **Floors:** a vertical stack in floor order that slides as the voice goes up, neighbours dimmed and blurred, a floor rail.
- **Design:** a tall card turning slowly in perspective over its own reflection.
- **Deck:** the closing card with earlier concepts fanned behind it.
- **Backdrop:** brand ground plus slow, large-scale fractal-noise light. Not fine grain.

## Three.js in Remotion (always)

- After any async load (textures, GLTF), call `advance(performance.now())` before `continueRender`, or frames render empty. Release the frame only after the textured object has drawn.
- `ExtrudeGeometry` UVs on caps are raw shape units; scale texture `repeat` to match.
- Negative scale (mirrors) is handled by three; keep materials front-sided.
