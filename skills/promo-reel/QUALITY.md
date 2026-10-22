# Review checklist

Run on rendered stills at every beat (scale 0.4), then the **every-second audit** (below), then on a half-res review render with audio. Each item comes from a correction the user made; all must pass.

**Every-second audit (before calling any film done):** render one frame per second of the whole film into contact sheets and look at every cell for collisions, clipped text, unreadable sizes and empty frames. Spot stills at the beats miss the in-between frames, which is where text lands on cards (22 Oct 2026). Tools: `techlords-reels/scripts/audit.mjs <dir> 30 Comp…` (one bundle, one browser) and `scripts/audit_sheet.py <dir> <Comp>`.

## Type
- Captions centred; nothing overlaps a caption (chips, stickers, satellites, window edges) in any frame.
- One reading target at a time: while a card or window shows text to read, the caption is ≤ 4 words or off.
- Text inside cards and UI ≥ 30 px, code ≥ 32 px, tags ≥ 24 px, at 1080 wide.
- Every line sits inside the 96 px margins: hero words through `fitSize`, supporting lines ≤ `size.l`, long lines wrap or split.
- Everything inside the cross-platform safe frame (EDIT.md §3): x 80–930, y 250–1480, nothing in the right 150 px below y 900.
- Every heading is at most 7 words and stays on screen at least 0.25 s per word + 0.5 s.
- Word spaces present in mixed-size rows (flex `gap` in em needs the row's own `fontSize`).
- Every caption legible over its footage: caption shadow on, lists on a solid card, tags on solid pills.
- Gold/accent hero words carry a soft glow in the brand's hue; spelling matches the brand file.
- No sentence appears twice (heading + caption); headings in sentence case, in the one heading slot.
- 3D lettering sits centred and fully inside the frame through the whole camera move.

## Timing
- Each word appears on its spoken frame; no caption shows ahead of the voice (list rows appear only on their word).
- No brand card, logo or product appears before its name is spoken.
- Cuts land on the noun they illustrate; scene changes on the first word of a line.
- The first frame is a designed picture with text on screen by frame 6; something new happens every 1.5–2.5 s; the reveal holds 1.5–2 s; the CTA stays at least 2.5 s.

## Picture
- No exposed frame edges (pans, crops, split screens, stabilization zoom, depth-move edges).
- The hero building is shown whole (sky and road around it), never tight or fisheye.
- No empty frame: every beat has a picture or a designed type scene.
- Adjacent beats use different layouts; a match cut lines up scale and position across it.
- Overlays and tags stay locked to their subject through the whole shot.
- Footage is steady (stabilized or gimbal) and graded to the brand; no two adjacent shots look like different films.
- The shot shows what the VO says; labels only state confirmed facts.

## Sound
- Voice clearly on top; music drop lands on the intended beat; SFX soft and attached to visible events.
- Master measures −14 LUFS integrated, ≤ −1 dBTP.

## Delivery
- Full master + <16 MB WhatsApp share copy, 1080×1920, correct duration; files named by the scheme.
- The RERA number is shown if the client has supplied it (EDIT.md §1); otherwise it's flagged to the user as missing.
- Uploaded to the brand's Drive folder (private), replaced cut in `_replaced/`, FILMS.md updated, link sent.
