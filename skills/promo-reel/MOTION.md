# Motion: making movement feel premium

What separates a smooth, expensive-feeling film from a template, and how to do each in this stack (Remotion, three.js / React Three Fiber, GSAP). Use alongside TASTE.md (what to avoid) and TECHNIQUES.md (recipes).

## Frame rate and motion blur

- **60 fps:** build films in 30 fps "film time" and read time through `useT()` (`54D src/v3/parts.tsx`): frame × 30 / fps, fractional at 60. Register the same component again with `fps={60}` and `durationInFrames × 2`. Audio offsets scale inside `FilmAudio`. Every animation is then sampled twice as often, with no retiming.
- **Motion blur, 3D:** register the component at `fps={120}` (`× 4` frames), then `scripts/render_blur60.sh <Comp-120> <out.mp4>`. ffmpeg `tmix=frames=2` blends each pair, which is a 180° shutter, then keeps 60 fps. Fast moves smear the way a camera does, slow ones stay crisp. It costs 4× the frames of 30 fps; run it in the background.
- **Motion blur, 2D/DOM only:** `@remotion/motion-blur` → `<CameraMotionBlur shutterAngle={180} samples={6}>` renders the subtree several times per frame and averages them. Cheap for type and cards, too heavy for 3D scenes. It isn't installed yet: ask before adding it.
- Don't fake blur with CSS blur on moving elements. It reads as out-of-focus, not as motion.

## Easing and springs

- **Entrances:** expo-out `bezier(0.16, 1, 0.3, 1)`. Fast arrival, long settle. **Transfers** (an element moving from one place to another): in-out `bezier(0.77, 0, 0.175, 1)`. **Exits:** ease-in, quick.
- **Springs** for anything physical (cards landing, objects dropping): Remotion `spring({frame, fps, config: {damping, stiffness, mass}})`.
  - `damping` ≥ 200 settles with no overshoot, for type.
  - ~14–20 gives a small natural overshoot, for 3D objects only.
- **Never linear**, except continuous drifts (dust, a slow pan) and the camera parameter along a spline (smoothed, see below).
- **Durations at 30 fps:** small UI builds 10–14 frames; cards and type 16–22; big transfers and match transforms 22–30. Anything longer reads slow; under 8 frames reads as a cut.

## The animation principles that matter most here

- **Overlap and follow-through:** parts of an element arrive 2–4 frames apart: letters stagger 1–2 frames, a card's label after the card, a shadow after its object. Nothing complex moves as one rigid block.
- **Anticipation:** before a big move, a tiny counter-move (2–3% back, 4–6 frames). Use it sparingly: on the reveal, not on every card.
- **Arcs:** things travel along curves, not straight lines. Give transfers a slight arc (y offset that peaks mid-move) and run cameras on Catmull-Rom splines.
- **Secondary motion:** a slow bob or drift on floating things, a light sweep across metal, dust drifting up. It keeps a still frame alive.
- **Staging:** one focus at a time. Depth of field and focus pulls (below) do this in 3D; dimming and stepping back (hand-off) do it in 2D.
- **Slow in, slow out at keys, but never a dead stop:** in a single take the motion carries through keys. Average the curve parameter over ±10 frames.

## Lens language (3D)

- **Depth of field:** `54D src/onetake/Post.tsx`, a three.js BokehPass. Blur = |depth − focus| × aperture, in world units from the camera.
  - Stage take (camera ~20 units away): aperture ≈ 0.0016, maxblur ≈ 0.009.
  - Flying take (~250 units): aperture ≈ 0.000035, focus = distance to the camera's target.
- **Focus pulls:** move `focus` from the outgoing layer to the incoming one over 12–18 frames, on the hand-off.
- **Bloom:** subtle only. Strength 0.12–0.15, threshold 0.9, so only chrome edges, lamps and highlights glint. At 0.35 or more the chrome and type blow out (rejected).
- **Opaque output:** post-processing makes the canvas opaque. Put the background (colour, glow plane) inside the scene, not in CSS behind it.
- **Cost:** stills with post-processing must render one at a time on this Mac; batches run out of memory.

## GSAP in Remotion

- `@remotion/gsap` → `useGsapTimeline(({timeline, selector}) => …)` builds a GSAP timeline that Remotion seeks to each frame. It is deterministic, so it's safe to render. Used in `54D src/NoirAd.tsx`.
- **Reach for GSAP when choreography is dense:** many staggered elements, labels on a timeline, letter-by-letter type with `stagger`, motion along a path (MotionPathPlugin), or easing families beyond bezier (`expo.out`, `power4.inOut`, `back.out(1.2)` for small 3D settles).
- **Keep simple single moves** in Remotion `interpolate` / `spring`. Don't mix GSAP and interpolate on the same property.
- **For 3D:** drive three.js values from frame-derived numbers. GSAP can tween a plain object whose fields you read into the scene each frame.

## Other techniques worth using

- **Masked reveals:** clip-path or SVG mask wipes that follow the motion direction, for type and cards. A line draws, then the content wipes in behind it.
- **Object wipes and match cuts:** see TECHNIQUES.md "Stage take".
- **Per-letter kinetic type:** stagger letters 1–2 frames with a small y travel and blur-in. In 3D, letters fly in from depth (TypeSpace).
- **Light sweeps** across metal (animated ramp offset or a sheen gradient) on the hero word, once per beat.
- **Path morphs** (SVG path interpolation) for icons or shapes that change into each other. Only where it carries meaning.
- **Shader transitions** (dissolves with noise, directional warps) only between worlds, and never as a habit.
