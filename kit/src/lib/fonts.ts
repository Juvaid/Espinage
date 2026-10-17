import {continueRender, delayRender, staticFile} from 'remotion';

// Brand faces for the kit's components and demos (public/fonts). Import once per entry point.
const handle = delayRender('kit fonts');
if (typeof document !== 'undefined') {
  Promise.all(
    [
      ['Geist', 'fonts/Geist-VF.ttf', '100 900'],
      ['Archivo', 'fonts/Archivo-VF.ttf', '100 900'],
      ['Cinzel', 'fonts/Cinzel-VF.ttf', '400 900'],
    ].map(([family, file, weight]) => new FontFace(family, `url(${staticFile(file)})`, {weight, stretch: '62% 125%'}).load().then((f) => document.fonts.add(f))),
  ).then(() => continueRender(handle), () => continueRender(handle));
}
