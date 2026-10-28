---
name: instagram-brand-kit
description: Build a brand's Instagram identity set and brand kit in Remotion: profile picture, highlight covers, grid/post covers that work at 9:16 and 3:4, safe-zone overlays, a motion pack for editors (intro, outro/CTA, transitions, loops, stickers, lower thirds), and the organised kit folder on Drive. Use for a profile refresh or new theme, highlight or reel covers, Instagram sizes and safe zones, editor assets, or packaging and uploading a brand kit.
---

# Instagram brand kit

Every asset is a Remotion composition in the brand's project (so it stays editable), rendered to files, then packed into one kit folder on Drive. Read the brand file in `promo-reel/brands/` first; its palette, type, mascot and logo rules decide every look here. Reference build: WordLord Media, `wordlord-social/src/winter/instagram/` and `src/winter/brandkit/` (28 Oct 2026).

## Steps

1. **Inspect the live profile** in the browser pane: profile picture, highlight names, the last few grid posts.
   - The avatar's `img` src gives 150 px only. A post page's main `img` gives the full-size original (up to 3072 × 4096); download with `curl`.
   - Read follower counts from the logged-in profile **header**; the meta description can be a stale cache.
   - Done when you can name what the current picture shows and list every highlight.
2. **Ask what to keep.** Owners describe their current avatar loosely ("hat style" meant the mascot perched on the logo's letter, as on the live picture). Zoom the live avatar and rebuild that layout in the new theme before inventing a new one.
3. **Build the comps** (one Studio folder, e.g. "Instagram-Refresh"):
   - **Profile picture**, 1080 × 1080: the real logo SVG plus the mascot cutout, inside a ring. Instagram crops a circle, so keep all text inside the inner 80%. A mascot ear or crown may overlap the ring but must stay inside the crop.
   - **Highlight covers**, **1:1** (1080 × 1080, owner's rule): the highlight name as the brand's stacked lockup on the brand ground, one or two words, wide enough to read at 64 px.
   - **Post / reel covers**, 1080 × 1920: the complete design inside the centre 1080 × 1440 (the 3:4 grid crop, y 240–1680). The bands above and below carry only a logo mark and the tagline, so either crop reads finished. Use only facts from the post's own caption.
   - **Review sheets:** a sheet of every highlight as small circles, and each cover whole beside its 3:4 crop. Check those, not the raw frames.
4. **Render** from Studio's Render button. Preset every comp's export with `calculateMetadata` so each is one click (promo-reel OPERATIONS.md, "Rendering"). Done when a contact sheet of every PNG looks right at its real size.
5. **Safe-zone overlays:** `python tools/safe_zones.py <font.ttf> <out-dir>` writes transparent PNGs for reels, reel covers, stories, 4:5 feed posts, and profile and highlight circles. Add `SIZES.md` (template below).
6. **Motion pack** (optional, when asked for editor assets), 1080 wide, 30 fps:
   - **Intro sting:** the logo builds row by row from its own paths, and the mascot lands on it.
   - **Outro / CTA card:** profile card with a follow button tap.
   - **Three transitions:** 24 frames each, covering the frame at f 12. One must be built from the brand's own letterform.
   - **Seamless background loops** of the brand pattern.
   - **Animated mascot stickers** and a **follow lower third**, inside the reel safe area.
   - Overlays are ProRes 4444 with alpha. Confirm `yuva444p12le` with ffprobe.
   - Write `HOW-TO-USE.md` with one row per clip: file, length, where to cut.
7. **Pack and upload:**
   - Folders: `01_Logo` (SVG + transparent PNG for each ground), `02_Mascot` (transparent cutouts, green-screen originals, references, retired mascots in `_retired-*`), `03_Instagram-<theme>`, `04_Colour-and-Type` (palette table, type roles, OFL font files with licences), `05_Instagram-Safe-Zones`, `06_Motion-Pack`, plus a `README.md`.
   - Upload: `rclone copy <kit> "gdrive:<Brand> Brand Kit"`, then `rclone check --one-way`. Sharing links are the owner's call, so leave them to the owner.
   - Done when the check reports no differences and the README lists every folder.

## Gotchas

- **Transparent logo PNGs without an SVG rasteriser:** QuickLook (`qlmanage -t -s 2000`) pads onto white, so a white-lettered logo vanishes. Rebuild alpha from the light version instead: alpha from distance to white per ink class, then recolour per ground.
- **Mascot sitting on a logo or card:** measure the cutout's seat line as fractions (`seatX`, `seatY`) and pin that point to the edge; animate a landing with a spring and squash from the seat.
- **Positions of doodles** (crown, sparks) are relative to the mascot's box, never absolute, or they drift when the mascot moves.

## SIZES.md template

| Format | Canvas | Safe area |
|---|---|---|
| Reel | 1080 × 1920 | x 80–930, y 250–1480; right 150 px clear below y 900 |
| Reel / 9:16 post cover | 1080 × 1920 | grid shows the centre 1080 × 1440 (y 240–1680) |
| Story | 1080 × 1920 | x 60–1020, y 250–1670 |
| Feed / carousel | 1080 × 1350 | grid shows the centre 1012 × 1350 |
| Profile picture, highlight cover | 1080 × 1080 | circle; text inside the inner 80% |
