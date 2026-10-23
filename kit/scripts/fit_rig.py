"""Fit an exploded rig sheet: find each loose piece on the assembled figure, so the rig's layout is measured, not guessed.

The sheet (chroma green) has the assembled character in its left third and the same character's pieces, at the same
scale, on the right. Every piece is template-matched onto the assembled figure (masked, normalised correlation,
scales --smin..--smax (default 0.8–1.2)), which gives its exact box in assembled coordinates.

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/fit_rig.py <sheet.png> <out_dir> --names head,torso,...

Writes <out_dir>/assembled.png and <out_dir>/<name>.png (on magenta, for trace_mascot.py), and
<out_dir>/fit.json: {canvas: [w, h], parts: {name: {box: [x, y, w, h], score, scale}}} in assembled-figure pixels.
The --names order follows reading order of the pieces (rows top to bottom, then left to right).
"""
import argparse
import json
import os

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('sheet')
ap.add_argument('out')
ap.add_argument('--names', required=True)
ap.add_argument("--min-area", type=int, default=1500)
ap.add_argument("--smin", type=float, default=0.8)
ap.add_argument("--smax", type=float, default=1.2)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
names = a.names.split(',')

img = cv2.imread(a.sheet)
H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
fg = cv2.bitwise_not(cv2.inRange(hsv, (40, 120, 120), (85, 255, 255)))
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, cen = cv2.connectedComponentsWithStats(cv2.dilate(fg, np.ones((5, 5), np.uint8)), 8)
islands = [i for i in range(1, n) if st[i, 4] >= a.min_area]

# the assembled figure: the biggest island whose centre is in the left third
left = [i for i in islands if cen[i][0] < W / 3]
asm = max(left, key=lambda i: st[i, 4])
pieces = [i for i in islands if i != asm and cen[i][0] >= W / 3 - 20]
pieces.sort(key=lambda i: (round(cen[i][1] / (H / 5)), cen[i][0]))
if len(pieces) != len(names):
    raise SystemExit(f'found {len(pieces)} pieces, expected {len(names)} ({names})')

def cut(i, pad=10):
    x, y, w, h = st[i, :4]
    x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(W, x + w + pad), min(H, y + h + pad)
    m = (lab[y0:y1, x0:x1] == i) & (fg[y0:y1, x0:x1] > 0)
    return img[y0:y1, x0:x1].copy(), m, (x0, y0)

def on_magenta(crop, m):
    out = np.full_like(crop, (255, 0, 255))
    out[m] = crop[m]
    return out

A, Am, Ao = cut(asm, 0)
cv2.imwrite(os.path.join(a.out, 'assembled.png'), on_magenta(A, Am))
Ag = cv2.cvtColor(A, cv2.COLOR_BGR2GRAY).astype(np.float32)
Ag[~Am] = 0

fit = {'canvas': [int(A.shape[1]), int(A.shape[0])], 'parts': {}}
for name, i in zip(names, pieces):
    P, Pm, _ = cut(i)
    cv2.imwrite(os.path.join(a.out, f'{name}.png'), on_magenta(P, Pm))
    best = (-1, None, None)
    for s in np.linspace(a.smin, a.smax, 25):
        T = cv2.resize(P, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        Tm = cv2.resize(Pm.astype(np.uint8), None, fx=s, fy=s, interpolation=cv2.INTER_NEAREST)
        if T.shape[0] > Ag.shape[0] or T.shape[1] > Ag.shape[1]:
            continue
        Tg = cv2.cvtColor(T, cv2.COLOR_BGR2GRAY).astype(np.float32)
        r = cv2.matchTemplate(Ag, Tg, cv2.TM_CCORR_NORMED, mask=Tm.astype(np.float32))
        r = np.nan_to_num(r, nan=-1, posinf=-1, neginf=-1)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]:
            best = (mx, loc, s)
    mx, loc, s = best
    if loc is None:
        raise SystemExit(f'{name}: piece larger than the assembled figure at every scale')
    fit['parts'][name] = {'box': [int(loc[0]), int(loc[1]), round(P.shape[1] * s, 1), round(P.shape[0] * s, 1)], 'score': round(float(mx), 3), 'scale': round(float(s), 3)}
    print(f'{name:10s} score {mx:.3f} scale {s:.2f} at {loc}')
json.dump(fit, open(os.path.join(a.out, 'fit.json'), 'w'), indent=1)
