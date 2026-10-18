// Word timings, in seconds, from any source. CaptionTrack only needs {text, start, end, hero?}.
export type CapWord = {text: string; start: number; end: number; hero?: boolean};

// Kit / 54D voice-over JSON (scripts/align_vo.py): {lines: [{text, words: [[text, start], …]}], end}
export const fromVoJson = (vo: {end?: number; lines: {words: [string, number][]}[]}, heroWords: string[] = []): CapWord[] => {
  const flat = vo.lines.flatMap((l, li) => l.words.map(([text, start], wi) => ({text, start, line: li, last: wi === l.words.length - 1})));
  const heroes = new Set(heroWords.map(norm).filter(Boolean));
  return flat.map((w, i) => {
    const next = flat[i + 1]?.start ?? vo.end ?? w.start + 0.6;
    const end = w.last ? Math.min(next, w.start + 0.6) : Math.min(next, w.start + 1.2);
    return {text: w.text, start: w.start, end: Math.max(end, w.start + 0.12), hero: heroes.has(norm(w.text))};
  });
};

// AutoCaption Studio cues ({startTime, endTime, text, words?: {word, startTime, endTime, isHero}}) → words.
// Cues without word timing are spread evenly across the cue.
type Cue = {startTime: number; endTime: number; text: string; words?: {word: string; startTime: number; endTime: number; isHero?: boolean}[]};
export const fromAutocaption = (cues: Cue[]): CapWord[] =>
  cues.flatMap((c) =>
    c.words?.length
      ? c.words.map((w) => ({text: w.word, start: w.startTime, end: w.endTime, hero: !!w.isHero}))
      : spread(c.text, c.startTime, c.endTime),
  );

// SRT text → words (even spread inside each cue)
export const fromSrt = (srt: string): CapWord[] => {
  const t = (s: string) => {
    const [h, m, rest] = s.trim().split(':');
    return +h * 3600 + +m * 60 + parseFloat(rest.replace(',', '.'));
  };
  return srt
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .flatMap((block) => {
      const lines = block.trim().split('\n');
      const time = lines.find((l) => l.includes('-->'));
      if (!time) return [];
      const [a, b] = time.split('-->');
      return spread(lines.slice(lines.indexOf(time) + 1).join(' '), t(a), t(b));
    });
};

// Even timing for a plain sentence (demos, scripts without audio yet). `rate`: seconds per word.
export const spread = (text: string, start: number, end?: number, rate = 0.36): CapWord[] => {
  const ws = text.split(/\s+/).filter(Boolean);
  const step = end !== undefined ? (end - start) / ws.length : rate;
  return ws.map((w, i) => {
    const m = /^\*(.+)\*([^\p{L}\p{N}]*)$/u.exec(w); // *word* (punctuation may follow) marks a hero
    return {text: m ? m[1] + m[2] : w, start: start + i * step, end: start + (i + 1) * step, hero: !!m};
  });
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
