import {Config} from '@remotion/cli/config';

// WebGL (ShaderBackdrop, TypeSpace, CoinRain) needs the ANGLE renderer in headless renders.
Config.setChromiumOpenGlRenderer('angle');
// the demo entry (lets Studio's "Save default props" find Root.tsx)
Config.setEntryPoint('src/demo/kit-entry.ts');
