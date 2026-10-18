import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bevel, BevelDefs} from '../pro/Bevel';
import {alpha, useKitTheme, type KitTheme} from '../theme/KitTheme';
import {useFonts} from '../type/fonts';
import {faceCss, pairById, pairFamilies} from '../type/pairs';
import type {CaptionStyle} from './style';
import type {CapWord} from './words';

// Caption track: word timings + a CaptionStyle → paged, animated captions over any video or scene.
//   <CaptionTrack words={fromVoJson(vo, ['Sarabha'])} style={presetById('dhunna-steel').style} />
// Pages break on maxWords, sentence ends and pauses. Per word: upcoming → active (being spoken) → spoken.
// Text is always real DOM text (crisp at any size, any script); strokes use paint-order so they never eat the glyph.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
const expo = Easing.bezier(0.16, 1, 0.3, 1);

type Page = {words: (CapWord & {i: number})[]; start: number; end: number; show: number; hide: number; hero: number};

export const paginate = (words: CapWord[], s: CaptionStyle): Page[] => {
  const max = s.layout === 'word' ? 1 : s.maxWords;
  const pages: Page[] = [];
  let cur: (CapWord & {i: number})[] = [];
  const flush = () => {
    if (!cur.length) return;
    let hero = cur.findIndex((w) => w.hero);
    if (hero < 0 && s.autoHero && s.layout !== 'word') {
      let best = -1;
      cur.forEach((w, k) => {
        const len = w.text.replace(/[^\p{L}\p{N}]/gu, '').length;
        if (len > 3 && (best < 0 || len >= cur[best].text.replace(/[^\p{L}\p{N}]/gu, '').length)) best = k;
      });
      hero = best;
    }
    pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end, show: 0, hide: 0, hero});
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = cur[cur.length - 1];
    if (cur.length && (cur.length >= max || w.start - prev.end > s.pauseBreak || /[.?!।॥]$/.test(prev.text))) flush();
    cur.push({...w, i});
  });
  flush();
  pages.forEach((pg, k) => {
    const next = pages[k + 1];
    pg.show = pg.start - 0.06;
    pg.hide = next ? Math.min(next.start - 0.06, pg.end + 0.9) : pg.end + 0.9;
  });
  return pages;
};

const color = (c: string, C: KitTheme) =>
  ({ivory: C.ivory, dim: C.dim, accent: C.accent, deep: C.deep, ground: C.ground, glow: C.glow, panel: C.panel} as Record<string, string>)[c] ?? c;
const shadowCss = (s: CaptionStyle, C: KitTheme) =>
  s.shadow === 'soft' ? `0 4px 26px ${alpha(C.shadow, 0.9)}, 0 1px 3px ${alpha(C.shadow, 0.8)}`
  : s.shadow === 'hard' ? '0 5px 0 rgba(0,0,0,0.85), 0 8px 18px rgba(0,0,0,0.45)'
  : s.shadow === 'glow' ? `0 0 28px ${alpha(C.glow, 0.85)}, 0 2px 10px ${alpha(C.shadow, 0.8)}`
  : undefined;
const caseOf = (m: CaptionStyle['leadCase']) => (m === 'upper' ? 'uppercase' : m === 'lower' ? 'lowercase' : 'none');

const Word: React.FC<{w: CapWord; t: number; fps: number; pageShow: number; s: CaptionStyle; hero: boolean; idx: number}> = ({w, t, fps, pageShow, s, hero, idx}) => {
  const C = useKitTheme();
  const pair = pairById(s.pair);
  const f = (t - w.start) * fps; // frames since the word starts
  const shownEarly = s.upcoming !== 'hidden';
  // arrival: with the page (staggered) when upcoming words show, else on its own spoken frame
  const arrive = shownEarly ? (t - pageShow) * fps - idx * 1.2 : f + 1.5;
  const p = s.enter === 'none' ? (arrive >= 0 ? 1 : 0) : interpolate(arrive, [0, 7], [0, 1], clamp);
  const state = t < w.start ? 'upcoming' : t < w.end ? 'active' : 'spoken';
  const act = state === 'active' ? 1 : 0;
  const pulse = interpolate(f, [0, 3, 9], [0, 1, 0.8], clamp) * act;

  const face = faceCss(pair, hero ? 'hero' : 'lead');
  const weight = hero ? s.heroWeight ?? face.fontWeight : s.leadWeight ?? face.fontWeight;
  const size = s.size * (hero ? s.heroScale : 1);
  let fg = color(state === 'upcoming' ? s.upcomingColor : s.color, C);
  if (state === 'upcoming' && s.upcoming === 'dim') fg = alpha(color(s.upcomingColor, C), 0.6);
  if (hero && s.hero === 'color') fg = color(s.heroColor, C);
  if (state === 'active' && (s.active === 'color' || s.active === 'glow')) fg = color(s.activeColor, C);

  const tf: string[] = [];
  let opacity = p;
  let filter: string | undefined;
  let clip: string | undefined;
  switch (s.enter) {
    case 'pop': tf.push(`scale(${0.55 + 0.45 * back(p)})`); break;
    case 'rise': tf.push(`translateY(${(1 - expo(p)) * 0.45}em)`); break;
    case 'blur': filter = `blur(${(1 - p) * 10}px)`; tf.push(`translateY(${(1 - expo(p)) * 0.12}em)`); break;
    case 'slit': clip = `inset(-0.3em -0.2em ${(1 - expo(p)) * 100}% -0.2em)`; tf.push(`translateY(${(1 - expo(p)) * 0.7}em)`); opacity = p > 0 ? 1 : 0; break;
    case 'drop': tf.push(`translateY(${(1 - back(p)) * -0.6}em)`); break;
  }
  if (s.active === 'scale' || (hero && s.hero === 'scale')) tf.push(`scale(${1 + 0.12 * pulse})`);
  if (state === 'upcoming' && !shownEarly) opacity = 0;

  const style: React.CSSProperties = {
    ...face,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1.12,
    color: fg,
    textTransform: caseOf(hero ? s.heroCase : s.leadCase),
    display: 'inline-block',
    position: 'relative',
    opacity,
    transform: tf.join(' ') || undefined,
    filter,
    clipPath: clip,
    textShadow: s.panel === 'line-pill' ? undefined : shadowCss(s, C),
    WebkitTextStroke: s.stroke > 0 ? `${s.stroke * 2}px ${color(s.strokeColor, C)}` : undefined,
    paintOrder: 'stroke fill',
    padding: '0 0.04em',
  };
  if (state === 'active' && s.active === 'glow') style.textShadow = `0 0 ${18 + 16 * pulse}px ${alpha(color(s.activeColor, C), 0.9)}, 0 0 4px ${alpha(color(s.activeColor, C), 0.6)}`;
  if (state === 'active' && s.active === 'karaoke') {
    const k = interpolate(t, [w.start, w.end], [0, 100], clamp);
    style.backgroundImage = `linear-gradient(90deg, ${color(s.activeColor, C)} ${k}%, ${fg} ${k}%)`;
    style.WebkitBackgroundClip = 'text';
    style.backgroundClip = 'text';
    style.color = 'transparent';
  }
  if (state === 'spoken' && s.active === 'karaoke') style.color = color(s.activeColor, C);

  // gradient-filled text (karaoke, shimmer) is transparent: a text-shadow would show through it, so shadow the
  // painted result instead
  const clipText = () => {
    if (style.color !== 'transparent') return;
    style.textShadow = undefined;
    const outline = s.stroke > 0 ? `drop-shadow(0 0 ${s.stroke * 0.6}px ${color(s.strokeColor, C)}) drop-shadow(0 0 ${s.stroke * 0.6}px ${color(s.strokeColor, C)})` : '';
    style.WebkitTextStroke = undefined; // a stroke would paint over the transparent fill
    style.filter = [filter, outline, s.shadow !== 'none' ? `drop-shadow(0 4px 12px ${alpha(C.shadow, 0.9)})` : ''].filter(Boolean).join(' ') || undefined;
  };
  clipText();
  // boxes behind the word: the spoken word (pill / box) or the hero (box)
  const boxed = (state === 'active' && (s.active === 'pill' || s.active === 'box')) || (hero && s.hero === 'box');
  if (boxed) {
    const bg = color(hero && s.hero === 'box' ? s.heroColor : s.activeColor, C);
    const pop = hero && s.hero === 'box' ? interpolate(arrive, [2, 9], [0, 1], {...clamp, easing: back}) : interpolate(f, [-1, 4], [0.7, 1], {...clamp, easing: back});
    style.color = C.deep;
    style.textShadow = undefined;
    style.WebkitTextStroke = undefined;
    return (
      <span style={{display: 'inline-block', position: 'relative', margin: '0 0.06em', opacity, transform: tf.join(' ') || undefined}}>
        <span style={{position: 'absolute', inset: '0.04em -0.14em', borderRadius: s.active === 'pill' && !hero ? '0.5em' : '0.16em', background: bg, transform: `scale(${pop})`, boxShadow: `0 8px 24px ${alpha(C.shadow, 0.6)}`}} />
        <span style={{...style, transform: undefined, opacity: 1, filter: undefined, clipPath: undefined}}>{w.text}</span>
      </span>
    );
  }
  if (hero && s.hero === 'metal') {
    const sheen = interpolate(arrive, [6, 30], [-20, 120], clamp);
    return (
      <span style={{display: 'inline-block', opacity, transform: tf.join(' ') || undefined, filter, clipPath: clip}}>
        <Bevel tone={C.metal} size={size > 110 ? 'lg' : 'md'} sheen={sheen} glow={0.4}>
          {() => <span style={{...style, color: undefined, opacity: 1, transform: undefined, filter: undefined, clipPath: undefined, textShadow: undefined}}>{w.text}</span>}
        </Bevel>
      </span>
    );
  }
  if (hero && s.hero === 'shimmer') {
    const x = interpolate(arrive, [4, 30], [-30, 130], clamp);
    style.backgroundImage = `linear-gradient(100deg, ${fg} ${x - 22}%, ${C.type3d.light} ${x - 8}%, ${String(C.type3d.ramp[0][1])} ${x}%, ${C.type3d.light} ${x + 8}%, ${fg} ${x + 22}%)`;
    style.WebkitBackgroundClip = 'text';
    style.backgroundClip = 'text';
    style.color = 'transparent';
    clipText();
  }
  const under = state !== 'upcoming' && s.active === 'underline' ? interpolate(t, [w.start, w.end], [0, 1], clamp) : 0;
  return (
    <span style={style}>
      {w.text}
      {under > 0 ? <span style={{position: 'absolute', left: '0.04em', right: '0.04em', bottom: '-0.04em', height: '0.08em', borderRadius: 9, background: color(s.activeColor, C), transform: `scaleX(${under})`, transformOrigin: '0 50%'}} /> : null}
    </span>
  );
};

export const CaptionTrack: React.FC<{words: CapWord[]; style: CaptionStyle; offset?: number}> = ({words, style: s, offset = 0}) => {
  const C = useKitTheme();
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const pair = pairById(s.pair);
  useFonts(pairFamilies(pair));
  const pages = useMemo(() => paginate(words, s), [words, s]);
  const t = frame / fps - offset;
  const page = pages.find((pg) => t >= pg.show && t < pg.hide);
  if (!page) return s.hero === 'metal' ? <BevelDefs /> : null;

  const out = interpolate(t, [page.hide - 0.2, page.hide], [0, 1], clamp);
  const exitStyle: React.CSSProperties =
    s.exit === 'fade' ? {opacity: 1 - out} : s.exit === 'rise' ? {opacity: 1 - out, transform: `translateY(${-out * 30}px)`} : {};
  const words2 = page.words.map((w, k) => (
    <Word key={w.i} w={w} t={t} fps={fps} pageShow={page.show} s={s} hero={k === page.hero} idx={k} />
  ));

  let body: React.ReactNode;
  if (s.layout === 'stack' && page.hero >= 0) {
    const lead = words2.slice(0, page.hero), hero = words2[page.hero], tail = words2.slice(page.hero + 1);
    const row = (nodes: React.ReactNode[], key: string) => (nodes.length ? <div key={key} style={{display: 'flex', flexWrap: 'wrap', justifyContent: s.align === 'center' ? 'center' : 'flex-start', columnGap: '0.28em', fontSize: s.size}}>{nodes}</div> : null);
    body = [row(lead, 'lead'), <div key="hero" style={{display: 'flex', justifyContent: s.align === 'center' ? 'center' : 'flex-start', margin: '0.02em 0'}}>{hero}</div>, row(tail, 'tail')];
  } else {
    body = <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: s.align === 'center' ? 'center' : 'flex-start', columnGap: '0.26em', rowGap: '0.05em', fontSize: s.size}}>{words2}</div>;
  }

  // a panel arrives with the first word (never an empty box waiting for words)
  const first = page.words[0];
  const panelIn = s.upcoming !== 'hidden' ? interpolate((t - page.show) * fps, [0, 5], [0, 1], clamp) : interpolate((t - first.start) * fps, [-1.5, 4], [0, 1], clamp);
  const panelBg = alpha(color(s.panelColor, C), s.panelOpacity * panelIn);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: s.y * height, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', ...exitStyle}}>
      {s.hero === 'metal' ? <BevelDefs /> : null}
      <div
        style={{
          maxWidth: s.width,
          textAlign: s.align,
          ...(s.panel === 'box' ? {background: panelBg, padding: '0.35em 0.6em', borderRadius: 22, fontSize: s.size} : {}),
          ...(s.panel === 'line-pill' ? {background: panelBg, padding: '0.18em 0.5em', borderRadius: '0.7em', fontSize: s.size, boxShadow: `0 10px 30px ${alpha(C.shadow, 0.5)}`} : {}),
        }}
      >
        {body}
      </div>
    </div>
  );
};
