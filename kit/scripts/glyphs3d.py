# Letter outlines for the 3D type beats: Geist (variable) instanced at the house weights, each word as glyph
# paths in font units (y up) with its advance, tracking applied. Output: $OUT (default src/demo/type3d.json); font: public/fonts/Geist-VF.ttf
# usage: python scripts/glyphs3d.py "Nayi:300" "opportunities:640" ...
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont, OverlapMode
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

import os
OUT = os.environ.get('OUT', 'src/demo/type3d.json')
out, cache = {}, {}
for spec in sys.argv[1:]:
    word, w = spec.rsplit(':', 1)
    w = int(w)
    if w not in cache:
        # REMOVE merges overlapping contours (needs skia-pathops); without it some letters (Geist L) self-intersect
        # and break three.js triangulation, so the 3D letter collapses
        cache[w] = instantiateVariableFont(TTFont('public/fonts/Geist-VF.ttf'), {'wght': w}, overlap=OverlapMode.REMOVE)
    f = cache[w]
    gs, cmap, upm = f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm
    track = -0.035 * upm if w >= 500 else -0.02 * upm
    x, glyphs = 0, []
    for ch in word:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (1, 0, 0, 1, 0, 0)))
        d = pen.getCommands()
        if d:
            glyphs.append({'ch': ch, 'd': d, 'x': x})
        x += gs[g].width + track
    out[f'{word}:{w}'] = {'upm': upm, 'width': x - track, 'glyphs': glyphs}
json.dump(out, open(OUT, 'w'))
print({k: round(v['width']) for k, v in out.items()})
