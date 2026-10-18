// Vendor Fontsource packages (OFL) into public/fonts/lib and write src/type/fontfaces.json, the manifest the
// runtime loader reads. Usage: node scripts/fonts-vendor.mjs <dir with fontsource *.tgz>
// Keeps only latin, latin-ext, devanagari and gurmukhi subsets, and (for static families) the weights listed below.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SRC = process.argv[2];
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(KIT, 'public/fonts/lib');
const SUBSETS = new Set(['latin', 'latin-ext', 'devanagari', 'gurmukhi']);
// static families: weights to keep (variable families keep their one axis file per style)
const WEIGHTS = {
  anton: [400], 'bebas-neue': [400], poppins: [300, 400, 500, 600, 700, 800, 900], 'instrument-serif': [400], 'dm-serif-display': [400],
  hind: [300, 400, 500, 600, 700], mukta: [300, 400, 500, 600, 700, 800], khand: [400, 500, 600, 700], 'rozha-one': [400],
  'tiro-devanagari-hindi': [400], gotu: [400], 'mukta-mahee': [300, 400, 500, 600, 700, 800],
};

fs.mkdirSync(OUT, {recursive: true});
const faces = [];
for (const tgz of fs.readdirSync(SRC).filter((f) => f.endsWith('.tgz'))) {
  const dir = path.join(SRC, tgz.replace('.tgz', ''));
  fs.mkdirSync(dir, {recursive: true});
  execFileSync('tar', ['-xzf', path.join(SRC, tgz), '-C', dir]);
  const pkg = path.join(dir, 'package');
  const meta = JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8'));
  const id = meta.name.split('/')[1];
  const variable = meta.name.startsWith('@fontsource-variable/');
  const cssFiles = variable
    ? ['index.css', 'wght-italic.css'].filter((f) => fs.existsSync(path.join(pkg, f)))
    : fs.readdirSync(pkg).filter((f) => /^\d{3}(-italic)?\.css$/.test(f) && (WEIGHTS[id] ?? [400]).includes(+f.slice(0, 3)));
  const dest = path.join(OUT, id);
  fs.mkdirSync(dest, {recursive: true});
  for (const css of cssFiles) {
    const text = fs.readFileSync(path.join(pkg, css), 'utf8');
    for (const block of text.split('@font-face').slice(1)) {
      const sub = /\/\*\s*([\w-]+)\s*\*\//.exec(text.slice(0, text.indexOf(block)).split('@font-face').pop() ?? '')?.[1];
      const url = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
      if (!url) continue;
      const subset = /-(latin-ext|latin|devanagari|gurmukhi|cyrillic-ext|cyrillic|greek-ext|greek|vietnamese|math|symbols)-/.exec(url)?.[1] ?? sub;
      if (!SUBSETS.has(subset)) continue;
      fs.copyFileSync(path.join(pkg, 'files', url), path.join(dest, url));
      faces.push({
        id,
        family: /font-family:\s*'([^']+)'/.exec(block)[1].replace(/ Variable$/, ''),
        style: /font-style:\s*(\w+)/.exec(block)[1],
        weight: /font-weight:\s*([\d ]+);/.exec(block)[1].trim(),
        unicodeRange: /unicode-range:\s*([^;]+);/.exec(block)?.[1].trim(),
        subset,
        file: `fonts/lib/${id}/${url}`,
      });
    }
  }
  const lic = ['LICENSE', 'LICENSE.md', 'OFL.txt'].find((f) => fs.existsSync(path.join(pkg, f)));
  if (lic) fs.copyFileSync(path.join(pkg, lic), path.join(dest, 'LICENSE'));
}
fs.mkdirSync(path.join(KIT, 'src/type'), {recursive: true});
fs.writeFileSync(path.join(KIT, 'src/type/fontfaces.json'), JSON.stringify(faces, null, 1));
const fams = [...new Set(faces.map((f) => f.family))];
console.log(`${faces.length} faces, ${fams.length} families:`, fams.join(', '));
