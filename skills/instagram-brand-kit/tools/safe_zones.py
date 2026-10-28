"""Instagram safe-zone overlays: transparent PNGs that tint the unsafe areas and outline the safe box.

  python -I safe_zones.py <font.ttf> <out_dir>

Writes reels-9x16-safe-zone.png, reel-cover-9x16-with-grid-3x4.png, stories-9x16-safe-zone.png,
feed-4x5-with-grid-3x4.png, profile-picture-1x1-circle.png and highlight-cover-1x1-circle.png.
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

font_path, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
F = lambda s: ImageFont.truetype(font_path, s)
UNSAFE, LINE = (255, 62, 29, 96), (191, 216, 254, 255)


def label(d, xy, t, s=30, fill=(255, 255, 255, 255)):
    d.text(xy, t, font=F(s), fill=fill, anchor='mm', stroke_width=3, stroke_fill=(11, 27, 58, 255))


def dashed(d, box, w=4, dash=24):
    x0, y0, x1, y1 = box
    for x in range(x0, x1, dash * 2):
        d.line([(x, y0), (min(x + dash, x1), y0)], fill=LINE, width=w)
        d.line([(x, y1), (min(x + dash, x1), y1)], fill=LINE, width=w)
    for y in range(y0, y1, dash * 2):
        d.line([(x0, y), (x0, min(y + dash, y1))], fill=LINE, width=w)
        d.line([(x1, y), (x1, min(y + dash, y1))], fill=LINE, width=w)


def canvas(w, h):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


# Reels: content inside x 80-930, y 250-1480; the action buttons sit in the right 150 px below y 900.
im, d = canvas(1080, 1920)
for box in [(0, 0, 1080, 250), (0, 1480, 1080, 1920), (0, 250, 80, 1480), (930, 250, 1080, 900)]:
    d.rectangle(box, fill=UNSAFE)
d.rectangle((930, 900, 1080, 1480), fill=(255, 62, 29, 150))
dashed(d, (80, 250, 930, 1480))
label(d, (540, 125), 'TOP UI  ·  0–250'); label(d, (540, 1700), 'CAPTION, HANDLE, AUDIO  ·  1480–1920')
label(d, (1005, 1190), 'BUTTONS', 24); label(d, (505, 865), 'SAFE  80–930 × 250–1480', 36, LINE)
im.save(os.path.join(out, 'reels-9x16-safe-zone.png'))

# 9:16 cover: the grid shows only the centre 1080 x 1440.
im, d = canvas(1080, 1920)
d.rectangle((0, 0, 1080, 240), fill=UNSAFE); d.rectangle((0, 1680, 1080, 1920), fill=UNSAFE)
dashed(d, (2, 240, 1078, 1680))
label(d, (540, 120), 'FULL VIEW ONLY  ·  0–240'); label(d, (540, 1800), 'FULL VIEW ONLY  ·  1680–1920')
label(d, (540, 960), 'GRID CROP 3:4  ·  1080 × 1440  ·  y 240–1680', 34, LINE)
im.save(os.path.join(out, 'reel-cover-9x16-with-grid-3x4.png'))

# Stories: profile and progress bar on top, reply bar below.
im, d = canvas(1080, 1920)
d.rectangle((0, 0, 1080, 250), fill=UNSAFE); d.rectangle((0, 1670, 1080, 1920), fill=UNSAFE)
dashed(d, (60, 250, 1020, 1670))
label(d, (540, 125), 'PROFILE + PROGRESS BAR'); label(d, (540, 1795), 'REPLY BAR')
label(d, (540, 960), 'SAFE  60–1020 × 250–1670', 36, LINE)
im.save(os.path.join(out, 'stories-9x16-safe-zone.png'))

# 4:5 feed post: the grid shows the centre 1012 x 1350.
im, d = canvas(1080, 1350)
d.rectangle((0, 0, 34, 1350), fill=UNSAFE); d.rectangle((1046, 0, 1080, 1350), fill=UNSAFE)
dashed(d, (34, 2, 1046, 1348))
label(d, (540, 675), 'GRID CROP 3:4  ·  1012 × 1350', 34, LINE); label(d, (540, 1300), '4:5 FEED POST  ·  1080 × 1350', 28)
im.save(os.path.join(out, 'feed-4x5-with-grid-3x4.png'))

# Profile picture and highlight cover: a circle crop; keep text inside the inner 80%.
for name, title in [('profile-picture-1x1-circle.png', 'PROFILE PICTURE  ·  1080 × 1080'),
                    ('highlight-cover-1x1-circle.png', 'HIGHLIGHT COVER  ·  1080 × 1080')]:
    im = Image.new('RGBA', (1080, 1080), UNSAFE)
    m = Image.new('L', (1080, 1080), 0); ImageDraw.Draw(m).ellipse([0, 0, 1079, 1079], fill=255)
    im.paste((0, 0, 0, 0), (0, 0), m); d = ImageDraw.Draw(im)
    d.ellipse([108, 108, 972, 972], outline=LINE, width=4)
    label(d, (540, 540), 'KEEP TEXT INSIDE 80%', 34, LINE); label(d, (540, 1040), title, 26)
    im.save(os.path.join(out, name))
print('wrote 6 overlays to', out)
