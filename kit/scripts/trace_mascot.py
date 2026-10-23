"""Trace a flat 2D mascot drawing into a clean vector SVG.

Pipeline:
1. Crop, and paint out regions we redraw as true vectors (e.g. the hoodie print).
2. Enlarge.
3. Edge-preserving smoothing (bilateral), which removes WebP blotches but keeps lines.
4. Flood-fill the background from the edges into a marker colour, so a white hoodie on a white backdrop stays apart.
5. Snap to a flat palette: k-means per brightness band (darks, mids, lights) in Lab.
6. vtracer, then drop the marker-coloured paths.

Run with the tools venv:
  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/trace_mascot.py <src> <out.svg> \
      --crop x0,y0,x1,y1 [--paint x0,y0,x1,y1:#rrggbb ...] [--scale 4] [--dark 4 --mid 9 --light 5] [--bg-tol 22]
Coordinates are in the source image's pixels; --paint boxes are relative to the crop.
Writes <out.svg> and <out>.prep.png (the cleaned raster that was traced, for QA).
"""
import argparse
import re

import cv2
import numpy as np
import vtracer
from PIL import Image, ImageDraw

MARK = (255, 0, 255)

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('out')
ap.add_argument('--crop', required=True)
ap.add_argument('--paint', action='append', default=[])
ap.add_argument('--scale', type=int, default=4)
ap.add_argument('--dark', type=int, default=4, help='palette colours for dark tones')
ap.add_argument('--mid', type=int, default=9, help='palette colours for mid tones')
ap.add_argument('--light', type=int, default=5, help='palette colours for light tones')
ap.add_argument('--bg-tol', type=int, default=22)
# tracer smoothness: higher corner threshold = rounder curves; bigger speckle/length = fewer tiny bits
ap.add_argument('--corner', type=int, default=100)
ap.add_argument('--length', type=float, default=8.0)
ap.add_argument('--speckle', type=int, default=14)
ap.add_argument('--layer-diff', type=int, default=10)
ap.add_argument('--shadow-tol', type=int, default=48, help='wider fill from the bottom edge for a floor shadow; 0 = off')
ap.add_argument('--keep-hues', action='store_true', help='keep purples/greens (skip the backdrop-contamination fix)')
ap.add_argument('--logo', default=None, help='cx,cy,width in crop pixels: place the Winter Arc vector logo there (e.g. a hoodie print)')
ap.add_argument('--logo-svg', default='assets/winter-arc/brand/wordlord-winter-light.svg')
a = ap.parse_args()

box = tuple(int(v) for v in a.crop.split(','))
im = Image.open(a.src).convert('RGB').crop(box)
draw = ImageDraw.Draw(im)
for p in a.paint:
    rect, col = p.split(':')
    draw.rectangle(tuple(int(v) for v in rect.split(',')), fill=col)

w, h = im.size
arr = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
arr = cv2.resize(arr, (w * a.scale, h * a.scale), interpolation=cv2.INTER_CUBIC)
for _ in range(2):
    arr = cv2.bilateralFilter(arr, 9, 40, 9)

# background → marker: flood fill from every border pixel that is close to the corner colour
H, W = arr.shape[:2]
mask = np.zeros((H + 2, W + 2), np.uint8)
t = (a.bg_tol,) * 3
for x, y in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]:
    if mask[y + 1, x + 1] == 0:
        cv2.floodFill(arr, mask, (x, y), MARK[::-1], t, t, 4 | cv2.FLOODFILL_FIXED_RANGE)
# floor shadow: a soft grey under the feet, darker than the backdrop; flood it from the bottom edge with a wider
# tolerance (the drawing's black outline stops the fill, so the shoes are safe)
if a.shadow_tol:
    ts = (a.shadow_tol,) * 3
    for x in range(0, W, 6):
        y = H - 1
        if mask[y + 1, x + 1] == 0 and arr[y, x].min() > 150:
            cv2.floodFill(arr, mask, (x, y), MARK[::-1], ts, ts, 4 | cv2.FLOODFILL_FIXED_RANGE)

# Palette by brightness band: separate k-means for darks, mids and lights, so near-black lines on near-black fur
# (the wink, brows, finger lines) keep their own colours instead of losing them to the many light greys.
lab = cv2.cvtColor(arr, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
bgr = arr.reshape(-1, 3)
is_mark = np.all(bgr == np.array(MARK[::-1], np.uint8), axis=1)
L = lab[:, 0]
bands = [(L < 70, a.dark), ((L >= 70) & (L < 200), a.mid), (L >= 200, a.light)]
centers = []
crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
for sel, k in bands:
    pts = lab[sel & ~is_mark]
    if len(pts) < k:
        continue
    if len(pts) > 200000:
        pts = pts[np.random.default_rng(0).choice(len(pts), 200000, replace=False)]
    _, _, c = cv2.kmeans(pts, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    centers.append(c)
pal = np.concatenate(centers)
# nearest palette colour per pixel (Lab distance), in chunks to keep memory low
idx = np.empty(len(lab), np.int32)
for i in range(0, len(lab), 400000):
    d = ((lab[i:i + 400000, None, :] - pal[None, :, :]) ** 2).sum(-1)
    idx[i:i + 400000] = d.argmin(1)
pal_bgr = cv2.cvtColor(pal.reshape(1, -1, 3).astype(np.uint8), cv2.COLOR_LAB2BGR).reshape(-1, 3)
out = pal_bgr[idx].reshape(arr.shape)
out[is_mark.reshape(arr.shape[:2])] = MARK[::-1]
out = cv2.medianBlur(out, 3)  # tidy one-pixel stairs on edges
qa = cv2.cvtColor(out, cv2.COLOR_BGR2RGB)
# Backdrop contamination: the magenta (or a green chroma) backdrop drags some palette colours toward purple/green.
# Snap them back: dark purples are the iris navy, light ones are white; greens go to fur or white. (The mascots here
# have no purple or green of their own; pass --keep-hues to skip this for art that does.)
if not a.keep_hues:
    hsv_q = cv2.cvtColor(np.ascontiguousarray(qa), cv2.COLOR_RGB2HSV).astype(int)
    hq, sq, vq = hsv_q[..., 0] * 2, hsv_q[..., 1], hsv_q[..., 2]
    notmark = ~np.all(qa == np.array(MARK, np.uint8), axis=-1)
    purple = notmark & (hq > 255) & (hq < 335) & (sq > 50)
    green = notmark & (hq > 75) & (hq < 165) & (sq > 50)
    qa[purple & (vq < 110)] = (0x1B, 0x2A, 0x66)
    qa[purple & (vq >= 110)] = (0xEE, 0xF1, 0xF6)
    qa[green & (vq < 140)] = (0x15, 0x15, 0x15)
    qa[green & (vq >= 140)] = (0xF2, 0xF2, 0xF4)
prep = re.sub(r'\.svg$', '.prep.png', a.out)
Image.fromarray(qa).save(prep)

vtracer.convert_image_to_svg_py(
    prep, a.out, colormode='color', hierarchical='cutout', mode='spline',
    filter_speckle=a.speckle, color_precision=8, layer_difference=a.layer_diff, corner_threshold=a.corner,
    length_threshold=a.length, max_iterations=10, splice_threshold=45, path_precision=2,
)

svg = open(a.out).read()
n0 = svg.count('<path')
# drop the marker paths: any fill within a few steps of #ff00ff (the tracer may shift it slightly)
def is_marker(m):
    c = m.group(1)
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return r > 0xE0 and g < 0x30 and b > 0xE0
svg = re.sub(r'<path[^>]*fill="#([0-9A-Fa-f]{6})"[^>]*/>', lambda m: '' if is_marker(m) else m.group(0), svg)
# drop a floor shadow that never touched the edge: a light, low-chroma path that is wide and sits at the very bottom
# (shoe shading is small and enclosed, so it stays)
def is_floor_shadow(m):
    tag, c = m.group(0), m.group(1)
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    if not (185 < (r + g + b) / 3 < 242 and max(r, g, b) - min(r, g, b) < 24):
        return False
    tx, ty = (float(v) for v in (re.search(r'translate\(([-\d.]+),([-\d.]+)\)', tag) or re.match(r'()()', '0,0')).groups() or (0, 0)) if 'translate(' in tag else (0.0, 0.0)
    nums = [float(v) for v in re.findall(r'-?\d+\.?\d*', re.search(r'd="([^"]+)"', tag).group(1))]
    xs, ys = [v + tx for v in nums[0::2]], [v + ty for v in nums[1::2]]
    return (max(xs) - min(xs)) > 0.22 * W and min(ys) > 0.86 * H
if a.shadow_tol:
    svg = re.sub(r'<path[^>]*fill="#([0-9A-Fa-f]{6})"[^>]*/>', lambda m: '' if is_floor_shadow(m) else m.group(0), svg)
# optional: the real vector logo on top (e.g. on the hoodie), instead of a traced print
if a.logo:
    cx, cy, lw = (float(v) * a.scale for v in a.logo.split(','))
    logo = open(a.logo_svg).read()
    inner = logo[logo.index('>', logo.index('<svg')) + 1:logo.rindex('</svg>')]
    s_ = lw / 25.0
    g = f'<g id="print" transform="translate({cx - lw / 2:.1f} {cy - 26 * s_ / 2:.1f}) scale({s_:.3f})">{inner}</g>'
    svg = svg.replace('</svg>', g + '</svg>')
open(a.out, 'w').write(svg)
print(f'{a.out}: {svg.count("<path")} paths ({n0 - svg.count("<path")} background paths removed)')
