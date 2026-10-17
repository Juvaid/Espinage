# Reel engine

Remotion 4.0.530 + React Three Fiber (`@remotion/three`, `@remotion/gsap`), 1080×1920 @ 30 fps.

**Shared component library:** `/Volumes/disk 2/reel-components-kit`. Brand-themed motion graphics, cards, captions, SVG and 3D elements, a JSON scene manifest (`ReelSceneRenderer`), and brand fonts. Index in MOGRAPH.md.

**One project per brand; every film for that brand lives in it.** Studio `<Folder>`s:
- Current: the films that count;
- Archive: replaced cuts, nothing deleted;
- Codex-drafts;
- Dev.

`docs/FILMS.md` is the index. It lists current films and archive, the lessons table, and the Drive link.

- **Dhunna 54D** (newest: `src/v3/parts.tsx` shared film parts (timing from a vo json, Heading, Hero depth card, SidePair, Carousel, FloorStack, TextBehind, Place, CTA, Wordmark, FilmAudio) and `src/v3/films.tsx` (O3/N3/S3/B3); `Address3D` has `u0` to start partway into the opening push when the mark comes early; Address3D map→3D scene, GCards layouts, DepthPhoto, LitPhoto, ClayModel, Drawn/Lumière/Noir/Clay/Cinema films, scorer, storyboard) — `/Volumes/disk 2/dhunnainfra-54d-voice-ad` (`node_modules` symlinked from `dhunnainfra-54d`)
- **Crown Crest** (StoryV2: CCMap, DepthCard, TypeSpace 3D type, champagne Bevel, house theme) — `/Volumes/disk 2/crowncrest-skypaddle` (entry `src/crowncrest-agent/index.tsx`)
- Older engines: Crown Crest v1 `/Volumes/disk 2/Downloads/crowncrest downloads/crowncrest`; Dhunna Reel 3 `/Volumes/disk 2/dhunnainfra-reel3` (SiteHighlight, GoldLogo, 3D icon props).

Clone with anchored excludes: `rsync -a --exclude '/out' --exclude '/src/scenes' …` (an unanchored `--exclude out` also strips folders inside `node_modules`). Delete the other brand's assets after cloning.

## Data flow

- `public/audio/voiceover.wav` → `scripts/align.py` (edit its `EST` list: display text, spoken text, estimated start) → `src/data/words.json`. Scenes reference words by id: `wf(id)` = frame the word appears.
- `src/data/timeline.ts`: scene boundaries `B.*` = first word of each line.
- `src/data/footage.ts`: named slots → `public/footage/<name>.mp4` (graded proxies). `Backplate` plays a slot from its scene start; `crop`/`origin` reframe.
- `src/lib/theme.ts`: tokens, `type`, `size` scale, `fitSize(text, max)` (cap a word to the safe width).

## Components

`Settle` / `Rise` / `Wipe` / `Subline` (kinetic type; Subline is the word-synced caption line) · `Bevel` + `BevelDefs` (metal type, sheen, glow) · `SceneWindow` (whip / whipUp / push / fade transitions) · `Backplate`, `Still`, `CinemaFrame`, `PhotoCard`, `Checklist`, `Panel`, `Scrim`, `LightLeak`, `Grain`, `Dust` · brand logos (`GoldLogo`, `CrestLogo`) · `SiteHighlight` (homography-tracked road + plot) · 3D: `IconStage`, icons, `Props` (rocket, note card), `Coins`.

## Scripts

- `scripts/make_proxies.sh [name]` — cut graded 1080×1920 proxies (vid.stab two-pass, speed/slow-mo/reverse); one name rebuilds one clip.
- `scripts/track_generic.py clip out.json REF` / `track_homography.py` — per-frame homography for pinning tags and overlays (mark shapes on the REF frame).
- `scripts/music_analyze.py` — tempo, energy curve, section jumps (find the drop).
- `scripts/master.sh raw.mp4 final.mp4` — audio to −14 LUFS / −1 dBTP, video copied.
- `scripts/stills.mjs <outDir> Comp:frame …` — one bundle, many stills at 0.4 scale (the fast review loop).
- `scripts/score_video.py [--calibrate docs/BENCHMARK-TARGETS.json] out.md video…` (54D) — per-scene factors.
  - Picture: motion, smooth, depth, still, sharp, expo, contrast, space, length, ui, repeat.
  - Edit and sound: hook, pace, loudness.
  - Cuts are found by a histogram jump or a frame correlation below 0.45.
  - `--bench` derives targets from benchmark reels (YouTube/Pinterest/Instagram, not the brand's own past reels).
- `scripts/storyboard.py spec.json out.jpg` — storyboard sheet from real frames with the move, light path and type drawn on.
- `scripts/depth_maps.py`, `cutout.py`, `linework.py` (54D), `depth_tools.py`, `glyphs3d.py`, `build_cc_map.py` (Crown Crest) — see TECHNIQUES.md.
- Python tools live in `/Volumes/disk 2/.reel-tools/venv` (faster-whisper, OpenCV, onnxruntime, fontTools, PyMuPDF).

## Gotchas

- Internal drive is nearly full and RAM is 8 GB: caches, temp, models and renders go on `/Volumes/disk 2`; render with `--concurrency=2 --timeout=60000`; one Studio at a time while rendering.
- Footage prep (HDR, rotation, stabilised proxies, grading): FOOTAGE.md.
- zsh: write `${var}` before a `:` in ffmpeg filters (`$trf:s…` is a zsh modifier); vid.stab paths can't contain spaces.
- SVG filters on near-vertical lines need `filterUnits="userSpaceOnUse"` (zero-width bounding box hides them).
- A transformed parent isolates `mix-blend-mode`; give blended layers their own transform.
- `Still` pans with `object-position`, never by translating the frame.
- Whisper large models froze the Mac once; base model only.
- **Renders:** retry up to three times in a loop. Before a render, and after a failed one, kill stray `chrome-headless-shell` processes by PID; `pkill` alone misses them.
  - "Timed out connecting to browser" means strays are left.
  - Progress shows in the frame count in the newest `/Volumes/disk 2/tmp/react-motion-render*/` folder: when it equals the duration, it is stitching.
- Don't run renders while the user needs to click links: memory pressure makes Chrome drop link clicks (AppleEvent timeouts).
- **zsh:** `for p in "a b" …; do set -- $p` does not word-split. Run such loops under `bash -c`. `ffprobe` isn't installed; read the duration from `ffmpeg -i`.
- Pass `-nostdin` to ffmpeg inside shell loops, or it eats the loop's input.
- **Drive** (rclone remote `gdrive:`): use `rclone copy` / `moveto` into the brand folder, with replaced cuts in `_replaced/`.
  - Never run `rclone link`: it makes a public share. Ask first, and send the folder URL from `rclone lsjson --dirs-only` (ID) instead.
