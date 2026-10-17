import {Config} from '@remotion/cli/config';

// WebGL (ShaderBackdrop, TypeSpace, CoinRain) needs the ANGLE renderer in headless renders.
Config.setChromiumOpenGlRenderer('angle');
