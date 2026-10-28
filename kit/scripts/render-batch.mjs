// Render many compositions fast: one webpack bundle and one browser for the whole batch.
// `npx remotion render` re-bundles and relaunches Chrome on every call (~45 s each on the Mac, and the source of the
// "Timed out … connecting to the browser" failures). Same codec, CRF and pixel format as the CLI defaults.
// Run from a project root (entry src/index.ts):
//   node <kit>/scripts/render-batch.mjs --out out/carousels/x --match N-claude-duet-        every comp whose id starts with this
//   node <kit>/scripts/render-batch.mjs --out out/current VibeOneTake=techlords_vibe_v03.mp4 McpReel   named comps (=file name)
// Options: --muted (drop audio)  --conc 4 (frames in parallel; 2 for heavy 3D/WebGL films on the 8 GB Mac)  --entry src/index.ts
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderMedia} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  if (i === -1) return dflt;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const out = opt('--out', 'out');
const match = opt('--match', null);
const conc = Number(opt('--conc', 4));
const entry = opt('--entry', 'src/index.ts');
const muted = flag('--muted');
if (!match && !args.length) throw new Error('give --match <id prefix> or composition ids');
mkdirSync(out, {recursive: true});

const t0 = Date.now();
const serveUrl = await bundle({entryPoint: entry});
// Mac: use the Chrome 149 copy (see remotion.config.ts); elsewhere Remotion's default
const MAC_CHROME = '/Volumes/disk 2/.reel-tools/chrome-headless-shell-149/chrome-headless-shell';
const browserExecutable = process.platform === 'darwin' && existsSync(MAC_CHROME) ? MAC_CHROME : null;
// Chrome sometimes misses the 25 s connect window under memory pressure: retry the launch, not the whole run
const launch = async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
    } catch (e) {
      if (attempt === 3) throw e;
      console.log(`browser launch ${attempt} failed, retrying`);
    }
  }
};
const browser = await launch();
const all = await getCompositions(serveUrl, {puppeteerInstance: browser, timeoutInMilliseconds: 120000});
const jobs = match
  ? all.filter((c) => c.id.startsWith(match)).map((c) => [c, `${c.id}.mp4`])
  : args.map((a) => {
      const [id, file] = a.split('=');
      const c = all.find((x) => x.id === id);
      if (!c) throw new Error(`no composition ${id}`);
      return [c, file || `${id}.mp4`];
    });
console.log(`bundle + browser ${((Date.now() - t0) / 1000).toFixed(0)} s, ${jobs.length} to render`);

for (const [composition, file] of jobs) {
  const t = Date.now();
  for (let attempt = 1; ; attempt++) {
    try {
      await renderMedia({serveUrl, composition, codec: 'h264', outputLocation: `${out}/${file}`, puppeteerInstance: browser, concurrency: conc, muted, timeoutInMilliseconds: 90000});
      break;
    } catch (e) {
      if (attempt === 3) throw e;
      console.log(`${composition.id} attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
    }
  }
  console.log(`${composition.id} ${((Date.now() - t) / 1000).toFixed(0)} s → ${out}/${file}`);
}
await browser.close({silent: true});
console.log(`total ${((Date.now() - t0) / 1000).toFixed(0)} s`);
// Remotion leaves its compositor and serve handles open, so the process never ends on its own and the caller's
// mastering step waits forever. Everything is written by now.
process.exit(0);
