"""Split a chroma-green cut-out parts sheet into one image per part.

Each part is a separate island on the #00FF00 background. Islands are found with connected components on the
keyed mask, padded, and saved on a magenta (#FF00FF) backdrop, so scripts/trace_mascot.py removes the background
exactly. Small islands closer than --merge px to a bigger one are merged into it (e.g. a highlight that touches nothing).

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/split_parts.py <sheet.png> <out_dir> [--min-area 400]

Writes <out_dir>/part-NN.png and <out_dir>/parts.json ([{file, box: [x0,y0,x1,y1], area}], in reading order).
"""
import argparse
import json
import os

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('sheet')
ap.add_argument('out')
ap.add_argument('--min-area', type=int, default=400)
ap.add_argument('--merge', type=int, default=6)
ap.add_argument('--pad', type=int, default=12)
ap.add_argument('--expect', type=int, default=0, help='touching drawings: split into exactly this many by watershed')
ap.add_argument('--attach', type=int, default=150, help='with --expect: max px from a drawing for a loose mark to join it')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

img = cv2.imread(a.sheet)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# green screen: hue around 60 (OpenCV 0..180), strong saturation and value
green = cv2.inRange(hsv, (40, 120, 120), (85, 255, 255))
fg = cv2.bitwise_not(green)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
# close tiny gaps so a part's separate strokes (a pair of brows stays two parts, a highlight joins its eye)
joined = cv2.dilate(fg, np.ones((a.merge, a.merge), np.uint8))
n, labels, stats, _ = cv2.connectedComponentsWithStats(joined, 8)
if a.expect:
    # Drawings that touch (busts side by side, sticker borders): erode the mask until it breaks into the expected
    # number of large cores, then grow each core back out with a watershed over the distance map, so the cut falls
    # on the narrow neck between drawings. Loose marks (sparks, a bulb) go to the nearest drawing.
    dist = cv2.distanceTransform((fg > 0).astype(np.uint8), cv2.DIST_L2, 5)
    best = None
    for thr in np.linspace(0.05, 0.6, 40) * dist.max():
        core = (dist > thr).astype(np.uint8)
        nc, cl, cs, _ = cv2.connectedComponentsWithStats(core, 8)
        big = [i for i in range(1, nc) if cs[i, 4] > 200]
        if len(big) == a.expect:
            best = (cl, big)
            break
    if best is None:
        raise SystemExit(f'could not find {a.expect} cores; try another --expect or --min-area')
    cl, big = best
    markers = np.zeros(fg.shape, np.int32)
    for k, i in enumerate(big):
        markers[cl == i] = k + 1
    ws = cv2.watershed(img.copy(), markers.copy())
    # The watershed floods the whole image. Only islands that hold a drawing's core take its labels (touching
    # drawings are cut along the watershed line); every other island is a loose mark (a spark, a bulb): it joins the
    # drawing whose box it is near, or is dropped, so no box stretches across the sheet.
    nn, il, ist, icent = cv2.connectedComponentsWithStats((fg > 0).astype(np.uint8), 8)
    lab = np.zeros(fg.shape, np.int32)
    loose = []
    for i in range(1, nn):
        m = il == i
        if (markers[m] > 0).any():
            lab[m] = np.maximum(ws[m], 0)
        else:
            loose.append(i)
    boxes = []
    for k in range(len(big)):
        ys, xs = np.nonzero(lab == k + 1)
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
    for i in loose:
        cx, cy = icent[i]
        def gap(b):
            dx = max(b[0] - cx, 0, cx - b[2]); dy = max(b[1] - cy, 0, cy - b[3])
            return (dx * dx + dy * dy) ** 0.5
        d = [gap(b) for b in boxes]
        k = int(np.argmin(d))
        if d[k] < a.attach:
            lab[il == i] = k + 1
    # tidy: each drawing keeps its largest piece and pieces near it; thin bridges to distant drawings are dropped
    for k in range(1, len(big) + 1):
        nk, kl, ks, _ = cv2.connectedComponentsWithStats((lab == k).astype(np.uint8), 8)
        if nk <= 2:
            continue
        main = 1 + int(np.argmax(ks[1:, 4]))
        bx = (ks[main, 0], ks[main, 1], ks[main, 0] + ks[main, 2], ks[main, 1] + ks[main, 3])
        for j in range(1, nk):
            if j == main:
                continue
            x, y, w, h = ks[j, :4]
            dx = max(bx[0] - (x + w), 0, x - bx[2]); dy = max(bx[1] - (y + h), 0, y - bx[3])
            if (dx * dx + dy * dy) ** 0.5 >= a.attach:
                lab[kl == j] = 0
    labels = lab
    stats = []
    n = len(big) + 1
    stats = np.zeros((n, 5), np.int64)
    for k in range(1, n):
        ys, xs = np.nonzero(labels == k)
        stats[k] = [xs.min(), ys.min(), xs.max() - xs.min() + 1, ys.max() - ys.min() + 1, len(xs)]

H, W = fg.shape
parts = []
for i in range(1, n):
    x, y, w, h, area = stats[i]
    if area < a.min_area:
        continue
    parts.append((x, y, w, h, area, i))
# reading order: rows (by vertical centre, banded), then left to right
parts.sort(key=lambda p: (round((p[1] + p[3] / 2) / (H / 6)), p[0]))

manifest = []
for k, (x, y, w, h, area, i) in enumerate(parts):
    x0, y0 = max(0, x - a.pad), max(0, y - a.pad)
    x1, y1 = min(W, x + w + a.pad), min(H, y + h + a.pad)
    sel = (labels[y0:y1, x0:x1] == i) & (fg[y0:y1, x0:x1] > 0)
    crop = np.full((y1 - y0, x1 - x0, 3), (255, 0, 255), np.uint8)
    crop[sel] = img[y0:y1, x0:x1][sel]
    # soften the green spill on edges: pixels that are still greenish become the nearest dark outline colour
    hc = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    spill = cv2.inRange(hc, (40, 60, 60), (85, 255, 255)) > 0
    crop[spill] = (20, 20, 20)
    fn = f'part-{k:02d}.png'
    cv2.imwrite(os.path.join(a.out, fn), crop)
    manifest.append({'file': fn, 'box': [int(x0), int(y0), int(x1), int(y1)], 'area': int(area)})

json.dump(manifest, open(os.path.join(a.out, 'parts.json'), 'w'), indent=1)
print(f'{len(manifest)} parts → {a.out}')
