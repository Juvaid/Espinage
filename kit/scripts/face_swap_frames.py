"""Make blink / talk frames that share the base pose's body exactly: take only the FACE from the new drawing.

Separately drawn frames never match perfectly (3–8% of the body silhouette differs), so swapping whole frames makes
the body shimmer. Instead, the new drawing is aligned to the base frame by the matched head (head_px from
align_frames.py: scale + offset), and only an elliptical face area (eyes, snout, mouth; not horns or ears) is blended
onto the base frame through a feathered mask. The result has the base frame's body pixel for pixel.

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/face_swap_frames.py <frames_dir> <align.json> <out_dir> \
      --pairs neutral:neutral-blink,neutral:talk-ah,thumbs:thumbs-blink
Writes <out_dir>/<new>.png (on magenta, same size as the base frame) and prints each pair.
Face area: an ellipse (--cx --cy --rx --ry, fractions of the head box; talk: the mouth below the snout), or with
--eyes one ellipse per measured eye of the base frame (blinks: the snout and mouth stay the base's).
"""
import argparse
import json
import os

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('frames_dir')
ap.add_argument('align')
ap.add_argument('out')
ap.add_argument('--pairs', required=True)
ap.add_argument('--cx', type=float, default=0.5)
ap.add_argument('--cy', type=float, default=0.66)
ap.add_argument('--rx', type=float, default=0.36)
ap.add_argument('--ry', type=float, default=0.27)
ap.add_argument('--feather', type=float, default=0.07)
ap.add_argument('--eyes', action='store_true', help='blinks: mask each of the base frame\'s measured eyes (x1.7 radius) instead of one ellipse')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
A = json.load(open(a.align))
MAG = np.array([255, 0, 255], np.uint8)

for pair in a.pairs.split(','):
    base, new = pair.split(':')
    B = cv2.imread(os.path.join(a.frames_dir, A[base]['file']))
    N = cv2.imread(os.path.join(a.frames_dir, A[new]['file']))
    bx, by, bw, bh = A[base]['head_px']
    nx, ny, nw, nh = A[new]['head_px']
    s = bw / nw
    M = np.float32([[s, 0, bx - nx * s], [0, s, by - ny * s]])
    Nw = cv2.warpAffine(N, M, (B.shape[1], B.shape[0]), flags=cv2.INTER_CUBIC, borderValue=(255, 0, 255))
    H, W = B.shape[:2]
    mask = np.zeros((H, W), np.float32)
    if a.eyes:
        for e in A[base]['eyes']:
            cv2.ellipse(mask, (int(bx + e['cx'] * bw), int(by + e['cy'] * bh)), (int(e['rx'] * bw * 1.7), int(e['ry'] * bh * 1.45)), 0, 0, 360, 1.0, -1)
    else:
        cv2.ellipse(mask, (int(bx + a.cx * bw), int(by + a.cy * bh)), (int(a.rx * bw), int(a.ry * bh)), 0, 0, 360, 1.0, -1)
    k = max(3, int(a.feather * bw) | 1)
    mask = cv2.GaussianBlur(mask, (k * 2 + 1, k * 2 + 1), k / 2)
    # never paste magenta (outside the new drawing) or onto the base's background
    nmag = np.all(Nw == MAG[::-1], axis=2) | np.all(B == MAG[::-1], axis=2)
    mask[nmag] = 0
    m3 = mask[..., None]
    out = (B.astype(np.float32) * (1 - m3) + Nw.astype(np.float32) * m3).astype(np.uint8)
    cv2.imwrite(os.path.join(a.out, f'{new}.png'), out)
    print(f'{new:13s} face from {new} onto {base}: scale {s:.3f}')
