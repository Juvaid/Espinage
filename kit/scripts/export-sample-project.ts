// Writes the sample 54D project as plain JSON (projects/54d-o3-sample.json): what the Caption Studio saves and what
// `remotion render … Manifest --props=<file>` renders.
import fs from 'node:fs';
import { SAMPLE_MANIFEST } from '../src/demo/manifestSample';
fs.mkdirSync(new URL('../projects/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../projects/54d-o3-sample.json', import.meta.url), JSON.stringify(SAMPLE_MANIFEST, null, 1));
console.log('wrote projects/54d-o3-sample.json');
