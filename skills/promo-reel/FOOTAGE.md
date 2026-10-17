# Real footage: prep, edit and effects

For footage promos and presenter reels (STYLES.md 1–2). Learned on the Dhunna 59-D reels, Crown Crest v1 and the 54D presenter reel.

## Prep (before any edit)

- **Contact-sheet every clip** (frame at 1 s, 320 px, tiled). Note what it shows, wide or tight, steady or shaky, day or night.
- **Rotation:** phone and DJI clips carry rotation flags. Check `displaymatrix` before cropping; many are already vertical.
- **HDR → SDR:** iPhone clips are often HDR (HEVC 10-bit HLG). Convert with Apple's pipeline: `avconvert -s in.MOV -p Preset1920x1080 -o out.mp4`, then re-encode video-only at 30 fps. ffmpeg tonemapping left takes washed out and pink.
- **Proxies:** `scripts/make_proxies.sh [name]` (Crown Crest v1 / Dhunna reels) cuts graded 1080×1920 proxies.
  - Stabilisation is vid.stab two-pass. It's essential for 360-camera and handheld clips. vid.stab paths can't contain spaces.
  - It also handles speed, slow-mo and reverse. One name rebuilds one clip.
- **Grade** to the brand with ffmpeg `hqdn3d, unsharp, curves, colorbalance, eq` into a `footage-bright/` set.
  - Bright and clean beats moody on a phone.
  - Never put an ungraded clip next to a graded one.
- **Slow-mo first:** prefer slowed footage (smoother, more premium), then speed-ramp into cuts.

## Edit

- **Cut on the noun:** the shot of the thing lands on its spoken word (`words.json`). Scene changes fall on the first word of a line.
- **One move per shot:** a slow push or pan, or the clip's own motion. Pan stills by `object-position`, never by moving the frame (exposed edges).
- **Shot length:** 1–2.5 s for B-roll; hold a drone reveal 2–3 s.
- **Music:** `scripts/music_analyze.py` (tempo, energy, sections) and `music_hits.py` (beat times). Snap cuts within ±2 frames of a beat when the voice allows. Land the drop on the logo or the reveal.
- **Presenter:**
  - Captions stay off the face. Move them to a top band over a scrim when the presenter sits low.
  - Cover jump cuts with B-roll or a graphic insert.
  - A punch-in (1.0 → 1.08 over the line) gives emphasis on the hero word, once per 10 s at most.

## Effects on footage

- **Tracked tags and overlays:** `scripts/track_homography.py` / `track_generic.py clip out.json REF` give per-frame homography from shapes marked on a reference frame. Pin a tag, a plot outline or a road to the ground plane, and keep it locked for the whole shot. Component: `SiteHighlight` (Dhunna reel 3).
- **Road highlight on drone:** black-and-white drone footage, the main road painted in the brand metal (feathered edges, glints along them), the plot outlined thin in real colour, and one solid tag. This was the client-approved location look on 59-D. Avoid legend boxes.
- **Text behind a moving subject:** `depth_tools.py video <clip> <start> <dur> <outdir> <thr>` writes a matte per frame (TECHNIQUES.md).
- **Photo cards over a blurred room:** interior stills presented as gallery prints over the same room, blurred (`PhotoCard`, Crown Crest v1 / kit).
- **Checklist card over footage:** a solid reading card with self-drawing ticks; each row appears on its word (`ChecklistCard`).
- **Split screens:** work vs relax, before vs after. Two clips on one shared move, with a thin metal divider.
- **Light leaks and flashes:** at most once per film (on the reveal), soft and feathered.
