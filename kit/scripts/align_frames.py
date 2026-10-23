"""Align drawn pose frames to the rig, by the head, and measure each frame's face for blink/talk overlays.

Each frame (a PNG on magenta, e.g. from split_parts.py) is searched for the rig's head piece (template match over
scales). The head's box in the frame, compared with the head's box on the rig canvas (rig2-fit.json), gives the
frame's placement on the rig canvas: so swapping frames never makes the bull jump. Then, inside the found head box,
the eye whites (neutral white blobs) and the snout (warm cream blob) are measured, as fractions of the head box.

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/align_frames.py <frames_dir> <rig_head.png> <rig2-fit.json> <out.json> \
      [--names a,b,c] [--smin 0.6 --smax 1.6]
out.json: {name: {"place": [x, y, w, h] on the rig canvas, "score", "eyes": [...]|[], "snout": {...}|null}}
"""
import argparse
import json
import os

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('frames_dir')
ap.add_argument('rig_head')
ap.add_argument('rig_fit')
ap.add_argument('out')
ap.add_argument('--names', default=None)
ap.add_argument('--smin', type=float, default=0.6)
ap.add_argument('--smax', type=float, default=1.6)
ap.add_argument('--ref', default=None, help='frame name to normalise all others to (horn top, sole bottom, head centre)')
a = ap.parse_args()

MAG = np.array([255, 0, 255], np.uint8)[::-1]
head = cv2.imread(a.rig_head)
hmask = ~np.all(head == MAG, axis=2)
# match on the upper head only (horns, tuft, brow line): the face below changes between expressions
cut = int(head.shape[0] * 0.55)
tmpl, tmask = head[:cut], hmask[:cut]
fit = json.load(open(a.rig_fit))
rx, ry, rw, rh = fit['parts']['head']['box']

files = sorted(f for f in os.listdir(a.frames_dir) if f.endswith('.png'))
names = a.names.split(',') if a.names else [f[:-4] for f in files]
out = {}
for f, name in zip(files, names):
    img = cv2.imread(os.path.join(a.frames_dir, f))
    H, W = img.shape[:2]
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    g[np.all(img == MAG, axis=2)] = 0
    best = (-1, None, None)
    for s in np.linspace(a.smin, a.smax, 41):
        T = cv2.resize(tmpl, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        M = cv2.resize(tmask.astype(np.uint8), None, fx=s, fy=s, interpolation=cv2.INTER_NEAREST)
        if T.shape[0] >= H or T.shape[1] >= W:
            continue
        r = cv2.matchTemplate(g, cv2.cvtColor(T, cv2.COLOR_BGR2GRAY).astype(np.float32), cv2.TM_CCORR_NORMED, mask=M.astype(np.float32))
        r = np.nan_to_num(r, nan=-1, posinf=-1, neginf=-1)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]:
            best = (mx, loc, s)
    mx, (hx, hy), s = best
    hw, hh = head.shape[1] * s, head.shape[0] * s  # the head's full box in the frame
    k = rw / hw  # frame px → rig units
    place = [rx - hx * k, ry - hy * k, W * k, H * k]
    # face geometry inside the found head box (fractions of the head box, like rig2-face.json)
    x0, y0, x1, y1 = int(hx), int(hy), int(min(W, hx + hw)), int(min(H, hy + hh))
    crop = img[y0:y1, x0:x1].astype(int)
    B, G, R = crop[..., 0], crop[..., 1], crop[..., 2]
    neutral = ((crop.min(2) > 200) & (np.abs(R - B) < 12)).astype(np.uint8)
    warm = ((crop.min(2) > 180) & (R - B > 12)).astype(np.uint8)
    ch, cw = crop.shape[:2]
    neutral[: int(ch * 0.35)] = 0
    warm[: int(ch * 0.5)] = 0
    n, l, st, c = cv2.connectedComponentsWithStats(neutral, 8)
    eyes = sorted([i for i in range(1, n) if st[i, 4] > 150 * s * s and c[i][1] < ch * 0.8], key=lambda i: -st[i, 4])[:2]
    eyes = [{'cx': round((st[i, 0] + st[i, 2] / 2) / hw, 4), 'cy': round((st[i, 1] + st[i, 3] / 2) / hh, 4), 'rx': round(st[i, 2] / 2 / hw, 4), 'ry': round(st[i, 3] / 2 / hh, 4)} for i in sorted(eyes, key=lambda i: c[i][0])]
    n, l, st, c = cv2.connectedComponentsWithStats(warm, 8)
    snout = None
    if n > 1:
        i = max(range(1, n), key=lambda i: st[i, 4])
        snout = {'cx': round((st[i, 0] + st[i, 2] / 2) / hw, 4), 'cy': round((st[i, 1] + st[i, 3] / 2) / hh, 4)}
    out[name] = {'head_px': [float(hx), float(hy), float(hw), float(hh)], 'file': f, 'place': [round(v, 2) for v in place], 'score': round(float(mx), 3), 'scale': round(float(s), 3), 'eyes': eyes if len(eyes) == 2 else [], 'snout': snout}
    print(f"{name:10s} head score {mx:.3f} scale {s:.2f}  eyes {len(eyes)}  snout {'yes' if snout else 'no'}")
# Normalise every frame to the reference frame (--ref): the bodies are identical, so the horn-top to sole-bottom
# height must match exactly (head-match scales are quantised and jump ~3% between frames). Vertical: horn top and
# sole bottom land where the reference's do. Horizontal: the matched head's centre lands on the reference's.
if a.ref:
    def extent(name):
        img = cv2.imread(os.path.join(a.frames_dir, out[name]['file']))
        fg = ~np.all(img == MAG, axis=2)
        ys = np.nonzero(fg.any(1))[0]
        return ys.min(), ys.max()
    R = out[a.ref]
    rt, rb = extent(a.ref)
    kR = R['place'][2] / cv2.imread(os.path.join(a.frames_dir, R['file'])).shape[1]
    top_r, bot_r = R['place'][1] + rt * kR, R['place'][1] + rb * kR
    head_cx_r = R['place'][0] + (R['head_px'][0] + R['head_px'][2] / 2) * kR
    for name, v in out.items():
        img = cv2.imread(os.path.join(a.frames_dir, v['file']))
        H, W = img.shape[:2]
        t, b = extent(name)
        k = (bot_r - top_r) / (b - t)
        hcx = (v['head_px'][0] + v['head_px'][2] / 2) * k
        v['place'] = [round(head_cx_r - hcx, 2), round(top_r - t * k, 2), round(W * k, 2), round(H * k, 2)]
json.dump(out, open(a.out, 'w'), indent=1)
