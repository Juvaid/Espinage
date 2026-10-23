"""Put the real WordLord logo (vector, from the master SVG) on the bull's hoodie in traced library drawings.

Chest finding: in the drawing's source PNG, take the hoodie's white pixels below the head and find the largest
circle that fits inside them (distance-transform peak). The logo is centred there and sized to sit inside it.
Overrides in --overrides (JSON: {name: {"skip": true} | {"dx": px, "dy": px, "scale": k, "center": true,
"xmin": f, "xmax": f, "below": f}}) fix the odd one (center: x on the centre line; xmin/xmax: search window).

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/place_logo.py --png-dir <png> --svg-dir <svg> \
      [--scale 4] [--overrides placements.json] [--only name1,name2] [--below 0.4]
Writes the logo into each SVG (replacing a previous <g id="print">) and prints the placement.
"""
import argparse
import json
import os
import re

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--png-dir', required=True)
ap.add_argument('--svg-dir', required=True)
ap.add_argument('--scale', type=float, default=4)
ap.add_argument('--logo-svg', default='assets/winter-arc/brand/wordlord-winter-light.svg')
ap.add_argument('--overrides', default=None)
ap.add_argument('--only', default=None)
ap.add_argument('--below', type=float, default=0.42, help='search the chest below this fraction of the height')
a = ap.parse_args()

logo = open(a.logo_svg).read()
inner = logo[logo.index('>', logo.index('<svg')) + 1:logo.rindex('</svg>')]
inner = re.sub(r'<!--.*?-->', '', inner, flags=re.S)
over = json.load(open(a.overrides)) if a.overrides and os.path.exists(a.overrides) else {}
only = set(a.only.split(',')) if a.only else None
out = {}
for f in sorted(os.listdir(a.png_dir)):
    if not f.endswith('.png'):
        continue
    name = f[:-4]
    if only and name not in only:
        continue
    o = over.get(name, {})
    svgp = os.path.join(a.svg_dir, name + '.svg')
    svg = open(svgp).read()
    svg = re.sub(r'<g id="print".*?</g>', '', svg, flags=re.S)
    if o.get('skip'):
        open(svgp, 'w').write(svg)
        out[name] = 'skip'
        continue
    img = cv2.imread(os.path.join(a.png_dir, f))
    H, W = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    white = ((img.min(2) > 205) & (hsv[:, :, 1] < 40)).astype(np.uint8)
    white[: int(H * o.get('below', a.below))] = 0
    # optional search window (a prop such as a whiteboard can be the biggest white area)
    white[:, : int(W * o.get('xmin', 0))] = 0
    white[:, int(W * o.get('xmax', 1)):] = 0
    white = cv2.morphologyEx(white, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    dist = cv2.distanceTransform(white, cv2.DIST_L2, 5)
    _, r, _, (cx, cy) = cv2.minMaxLoc(dist)
    lw = r * 1.25 * o.get('scale', 1.0)
    if o.get('center'):
        cx = W / 2  # busts: the chest is on the figure's centre line
    cx, cy = cx + o.get('dx', 0), cy + o.get('dy', 0)
    s = a.scale
    k = lw * s / 25.0
    g = f'<g id="print" transform="translate({cx * s - lw * s / 2:.1f} {cy * s - 26 * k / 2:.1f}) scale({k:.4f})">{inner}</g>'
    svg = svg.replace('</svg>', g + '</svg>')
    open(svgp, 'w').write(svg)
    out[name] = [round(cx), round(cy), round(lw)]
print(json.dumps(out))
