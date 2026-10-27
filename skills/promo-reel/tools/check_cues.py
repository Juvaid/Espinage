"""check_cues.py <film.tsx> <vo.json> : every at(line, 'word'[, 'after']) cue must resolve (same rule as stage/timing.ts),
so a missing word is caught before the module throws on import and takes down the whole Studio/render bundle."""
import json, re, sys
src, vo = open(sys.argv[1]).read(), json.load(open(sys.argv[2]))
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
bad = 0
for li, w, after in re.findall(r"\bat\((\d+),\s*'([^']+)'(?:,\s*'([^']+)')?\)", src):
    li = int(li)
    if li >= len(vo['lines']): print('no line', li, w); bad += 1; continue
    words = [norm(x[0]) for x in vo['lines'][li]['words']]
    start = words.index(norm(after)) + 1 if after and norm(after) in words else 0
    rest = words[start:]
    if not (norm(w) in rest or any(x.startswith(norm(w)) for x in rest)):
        print(f'MISSING line {li} "{w}"' + (f' after "{after}"' if after else '') + f'  words: {words}'); bad += 1
print('ok' if not bad else f'{bad} missing')
sys.exit(1 if bad else 0)
