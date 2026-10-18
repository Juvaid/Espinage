import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

// WebGL (ShaderBackdrop, TypeSpace, CoinRain) needs the ANGLE renderer in headless renders.
Config.setChromiumOpenGlRenderer('angle');
// the demo entry (lets Studio's "Save default props" find KitRoot.tsx)
Config.setEntryPoint('src/demo/kit-entry.ts');

// Mac only: Remotion 4.0.536's own headless Chrome (Chromium 157) fails to start intermittently on this Mac
// ("Timed out … connecting to the browser"; once "icudtl.dat not found in bundle"). Chrome for Testing 149 works
// reliably with it, so use that copy. Linux (the VPS render box) keeps Remotion's default browser.
const MAC_CHROME = '/Volumes/disk 2/.reel-tools/chrome-headless-shell-149/chrome-headless-shell';
if (process.platform === 'darwin' && fs.existsSync(MAC_CHROME)) Config.setBrowserExecutable(MAC_CHROME);
