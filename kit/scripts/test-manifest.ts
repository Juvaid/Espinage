// Project format checks: defaults, validation messages, the sample project, durations.
import { REGISTRY } from '../src/manifest/registry';
import { manifestDuration, newItem, parseManifest } from '../src/manifest/schema';
import { SAMPLE_MANIFEST } from '../src/demo/manifestSample';
import { ALL_COMPONENTS_MANIFEST } from '../src/demo/manifestAll';

let fail = 0;
const check = (name: string, ok: boolean, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !extra ? '' : '  → ' + extra}`);
  if (!ok) fail++;
};

for (const e of REGISTRY) {
  const r = e.props.safeParse({});
  check(`${e.type}: defaults are valid`, r.success, r.success ? '' : r.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; '));
}
const all = parseManifest(ALL_COMPONENTS_MANIFEST);
check(`a project with all ${REGISTRY.length} components parses`, all.ok, all.ok ? '' : all.problems.join(' | '));
const sample = parseManifest(SAMPLE_MANIFEST);
check('the 54D sample project parses', sample.ok, sample.ok ? '' : sample.problems.join(' | '));
if (sample.ok) check('sample duration ends after the voice', manifestDuration(sample.manifest) >= 707, String(manifestDuration(sample.manifest)));

const bad1 = parseManifest({ tracks: [{ id: 't', items: [{ id: 'x', type: 'spaceship', from: 0, durationInFrames: 10, props: {} }] }] });
check('an unknown component is refused with its path', !bad1.ok && bad1.problems.some((p) => p.startsWith('tracks.0.items.0')), bad1.ok ? 'accepted' : bad1.problems.join(' | '));
const bad2 = parseManifest({ tracks: [{ id: 't', items: [{ id: 'x', type: 'background', from: 0, durationInFrames: 10, props: { energy: 2 } }] }] });
check('an out-of-range control value is refused, naming the field', !bad2.ok && bad2.problems.some((p) => p.includes('props.energy')), bad2.ok ? 'accepted' : bad2.problems.join(' | '));
const bad3 = parseManifest({ tracks: [{ id: 't', items: [{ id: 'x', type: 'title', from: -5, durationInFrames: 0, props: {} }] }] });
check('negative start and zero length are refused', !bad3.ok && bad3.problems.length >= 2, bad3.ok ? 'accepted' : bad3.problems.join(' | '));
const empty = parseManifest({});
check('an empty project gets every default', empty.ok && empty.manifest.fps === 30 && empty.manifest.theme === 'dhunna_54d' && manifestDuration(empty.manifest) === 1);
const it = newItem('captions', 30, 'c9');
check('newItem fills defaults', it.from === 30 && it.durationInFrames > 0 && (it.props as { preset: string }).preset === 'dhunna-steel');
const withItem = parseManifest({ tracks: [{ id: 't', items: [it] }] });
check('a new item round-trips through parse', withItem.ok);
let threw = false;
try { newItem('nope', 0, 'x'); } catch { threw = true; }
check('newItem refuses an unknown type', threw);
process.exit(fail ? 1 : 0);
