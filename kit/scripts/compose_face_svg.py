"""Build blink / talk SVGs that reuse the base pose's vector paths exactly, with only the new face drawn on top.

Tracing two near-identical PNGs gives slightly different outlines (≈1.5% of the body pixels differ after
rasterising), which shimmers when frames swap. So each blink/talk SVG is: the base pose's SVG, plus the new frame's
traced paths shown only through a feathered mask over the eyes (blinks) or the mouth (talk). The base's hoodie logo
stays; the new frame's logo print is dropped. Both SVGs must come from same-size PNGs traced at the same --scale.

  "/Volumes/disk 2/.reel-tools/venv/bin/python" -I scripts/compose_face_svg.py <svg_dir> <align.json> \
      --blink neutral:neutral-blink,thumbs:thumbs-blink --talk neutral:talk-ah [--scale 4]
Overwrites <svg_dir>/<new>.svg (keeps the traced original as <new>.traced.svg on first run).
"""
import argparse
import json
import os
import re
import shutil

ap = argparse.ArgumentParser()
ap.add_argument('svg_dir')
ap.add_argument('align')
ap.add_argument('--blink', default='')
ap.add_argument('--talk', default='')
ap.add_argument('--scale', type=float, default=4)
a = ap.parse_args()
A = json.load(open(a.align))


def inner(svg):
    body = svg[svg.index('>', svg.index('<svg')) + 1:svg.rindex('</svg>')]
    return re.sub(r'<g id="print".*?</g>', '', body, flags=re.S)


def ellipses(base, kind):
    bx, by, bw, bh = (v * a.scale for v in A[base]['head_px'])
    if kind == 'blink':
        return [(bx + e['cx'] * bw, by + e['cy'] * bh, e['rx'] * bw * 1.7, e['ry'] * bh * 1.45) for e in A[base]['eyes']]
    return [(bx + 0.5 * bw, by + 0.83 * bh, 0.17 * bw, 0.10 * bh)]


for kind, spec in (('blink', a.blink), ('talk', a.talk)):
    for pair in filter(None, spec.split(',')):
        base, new = pair.split(':')
        bp, np_ = os.path.join(a.svg_dir, base + '.svg'), os.path.join(a.svg_dir, new + '.svg')
        traced = os.path.join(a.svg_dir, new + '.traced.svg')
        if not os.path.exists(traced):
            shutil.copy(np_, traced)
        bsvg, nsvg = open(bp).read(), open(traced).read()
        head = bsvg[:bsvg.index('>', bsvg.index('<svg')) + 1]
        mid = f'wl-{new}'
        grads, shapes = [], []
        for i, (cx, cy, rx, ry) in enumerate(ellipses(base, kind)):
            grads.append(f'<radialGradient id="{mid}-g{i}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')
            shapes.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="url(#{mid}-g{i})"/>')
        defs = f'<defs>{"".join(grads)}<mask id="{mid}" maskUnits="userSpaceOnUse">{"".join(shapes)}</mask></defs>'
        prints = re.findall(r'<g id="print".*?</g>', bsvg, flags=re.S)  # the base's hoodie logo, kept as is
        out = head + inner(bsvg) + ''.join(prints)
        out += defs + f'<g mask="url(#{mid})">{inner(nsvg)}</g></svg>'
        open(np_, 'w').write(out)
        print(f'{new:13s} = {base} paths + {kind} face ({len(shapes)} mask ellipse{"s" if len(shapes) > 1 else ""})')
