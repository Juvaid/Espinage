// Fast review stills: one bundle, many frames.  node scripts/stills.mjs <outDir> Comp:frame Comp:frame …
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
const [, , out, ...specs] = process.argv;
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: 'src/demo/index.ts'});
// Mac: use the Chrome 149 copy (see remotion.config.ts); elsewhere Remotion's default
const MAC_CHROME = '/Volumes/disk 2/.reel-tools/chrome-headless-shell-149/chrome-headless-shell';
const browserExecutable = process.platform === 'darwin' && existsSync(MAC_CHROME) ? MAC_CHROME : null;
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
const comps = {};
for (const spec of specs) {
  const i = spec.lastIndexOf(':');
  const id = spec.slice(0, i), f = spec.slice(i + 1);
  comps[id] ??= await selectComposition({serveUrl, id, puppeteerInstance: browser});
  await renderStill({serveUrl, composition: comps[id], frame: Number(f), scale: 0.25, imageFormat: 'jpeg', jpegQuality: 80, output: `${out}/${id}-${f.padStart(4, '0')}.jpg`, puppeteerInstance: browser, timeoutInMilliseconds: 120000});
}
await browser.close({silent: true});
console.log('stills', specs.length);
