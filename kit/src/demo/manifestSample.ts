import { fromVoJson } from '../captions/words';
import type { Manifest } from '../manifest/schema';
import O3 from './captions/vo-O3.json';

// A real project as data: the 54D "O3 offices" voiceover (Gemini Puck) with its word timings, one picture per spoken
// line, captions from the voice, and only facts from the brief (82 ft front, 80 ft road). Line starts (s): 0, 3.5,
// 7.48, 10.86, 13.42, 16.6, 19.82, 21.5; the voice starts at frame 6.
type Vo = { end: number; lines: { words: [string, number][] }[] };
const words = fromVoJson(O3 as unknown as Vo, ['office', 'address', '54D', 'showrooms', 'parking', 'entrance', 'message']);

const img = (id: string, src: string, from: number, to: number, extra: Record<string, unknown> = {}) => ({
  id, type: 'image', from, durationInFrames: to - from, props: { src, zoomFrom: 1.04, zoomTo: 1.12, ...extra },
});

export const SAMPLE_MANIFEST = {
  version: 1,
  title: '54D · O3 offices (sample project)',
  theme: 'dhunna_54d',
  fps: 30,
  width: 1080,
  height: 1920,
  voice: { src: 'audio/vo/O3-Puck.wav', volume: 1, offset: 6, words, script: (O3 as unknown as { lines: { text: string }[] }).lines.map((l) => l.text).join(' ') },
  tracks: [
    { id: 'bg', name: 'Background', items: [{ id: 'bg1', type: 'background', from: 0, durationInFrames: 720, props: { shader: 'mesh', energy: 0.5 } }] },
    {
      id: 'pics',
      name: 'Pictures',
      items: [
        img('p1', 'samples/o-open-plan.jpg', 0, 111),
        img('p2', 'samples/r-rain.jpg', 111, 230, { focusX: 50 }),
        { id: 'p3', type: 'depthReveal', from: 230, durationInFrames: 102, props: { src: 'samples/r-golden.jpg', depth: 'samples/r-golden-depth.png', revealFrames: 40, width: 760, height: 900, left: 160, top: 360 } },
        { id: 'p4', type: 'card', from: 332, durationInFrames: 77, props: { src: 'samples/s-double-height.jpg', label: 'Showroom concept', width: 720, height: 820, y: 440 } },
        img('p5', 'samples/b-parking.jpg', 409, 504),
        img('p6', 'samples/r-statue-tight.jpg', 504, 601, { zoomFrom: 1.1, zoomTo: 1.02 }),
        { id: 'p7', type: 'logo', from: 651, durationInFrames: 69, props: { width: 640, y: 860 } },
      ],
    },
    {
      id: 'text',
      name: 'Text & figures',
      items: [
        { id: 't1', type: 'stats', from: 140, durationInFrames: 90, props: { items: [{ value: '82', unit: 'ft', label: 'Front' }, { value: '80', unit: 'ft', label: 'Road' }], y: 760 } },
        { id: 't2', type: 'title', from: 601, durationInFrames: 50, props: { text: 'Floor plans?', effect: 'shimmer', size: 140, y: 820 } },
      ],
    },
    { id: 'caps', name: 'Captions', items: [{ id: 'c1', type: 'captions', from: 0, durationInFrames: 651, props: { source: 'voice', preset: 'dhunna-steel' } }] },
    { id: 'fx', name: 'Effects', items: [{ id: 'f1', type: 'lightLeak', from: 640, durationInFrames: 34, props: { strength: 0.5 } }] },
  ],
} as unknown as Manifest;
