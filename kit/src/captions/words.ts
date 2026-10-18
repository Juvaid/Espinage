// Word timings, in seconds, from any source. CaptionTrack only needs {text, start, end, hero?}.
export type CapWord = {text: string; start: number; end: number; hero?: boolean};

// Written form: the voice says numbers as words ("Fifty-Four D", "assi foot") so it pronounces them right; the screen
// shows numerals (54D, 80 ft). Spoken numbers → digits; a number + a single capital letter → one code (54D); a number
// + foot/feet → "ft". Hindi number words convert only before a unit, since several are also ordinary words
// (saath = with, do = give). Merged words keep the first start, the last end and the punctuation that followed.
const EN: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};
const HI: Record<string, number> = {
  das: 10, bees: 20, tees: 30, chalis: 40, chaalis: 40, pachas: 50, pachaas: 50, sattar: 70, assi: 80, nabbe: 90, sau: 100,
  bayasi: 82, beyasi: 82, pachpan: 55, chauvan: 54, chauwan: 54, hazaar: 1000,
};
const UNITS: Record<string, string> = {foot: 'ft', feet: 'ft', ft: 'ft', gaj: 'gaj', marla: 'marla', kanal: 'kanal', minute: 'min', minutes: 'min', km: 'km', kilometre: 'km', kilometer: 'km', saal: 'saal', lakh: 'lakh', crore: 'crore'};
const split = (w: string) => {
  const m = /^(.*?)([^\p{L}\p{N}]*)$/u.exec(w)!;
  return [m[1], m[2]] as const; // core, trailing punctuation
};
const enNumber = (core: string): number | null => {
  const parts = core.toLowerCase().split('-');
  if (!parts.every((x) => x in EN)) return null;
  return parts.reduce((a, x) => (EN[x] === 100 ? Math.max(1, a) * 100 : a + EN[x]), 0);
};
export const writtenForm = (words: CapWord[]): CapWord[] => {
  const out: CapWord[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const [core, punct] = split(w.text);
    const nextCore = words[i + 1] ? split(words[i + 1].text)[0] : '';
    const unit = UNITS[nextCore.toLowerCase()];
    let n = enNumber(core);
    if (n === null && unit && core.toLowerCase() in HI) n = HI[core.toLowerCase()];
    if (n === null && /^\d+$/.test(core)) n = +core;
    // "one", "two"… stay words ("no one", "one of a kind") unless a unit or a code letter follows
    if (n !== null && n < 10 && !/\d/.test(core) && !core.includes('-') && !unit && !/^[A-Z]$/.test(nextCore)) n = null;
    if (n === null) {
      out.push(w);
      continue;
    }
    const nx = words[i + 1];
    if (nx && !punct && /^[A-Z]$/.test(nextCore)) {
      // 54 + D → 54D (a building or plot code)
      out.push({text: `${n}${nextCore}${split(nx.text)[1]}`, start: w.start, end: nx.end, hero: w.hero || nx.hero});
      i++;
    } else if (nx && !punct && unit) {
      out.push({text: `${n} ${unit}${split(nx.text)[1]}`, start: w.start, end: nx.end, hero: w.hero || nx.hero});
      i++;
    } else out.push({...w, text: `${n}${punct}`});
  }
  return out;
};

// Kit / 54D voice-over JSON (scripts/align_vo.py): {lines: [{text, words: [[text, start], …]}], end}
export const fromVoJson = (vo: {end?: number; lines: {words: [string, number][]}[]}, heroWords: string[] = [], written = true): CapWord[] => {
  const flat = vo.lines.flatMap((l, li) => l.words.map(([text, start], wi) => ({text, start, line: li, last: wi === l.words.length - 1})));
  const heroes = new Set(heroWords.map(norm).filter(Boolean));
  const words = flat.map((w, i) => {
    const next = flat[i + 1]?.start ?? vo.end ?? w.start + 0.6;
    const end = w.last ? Math.min(next, w.start + 0.6) : Math.min(next, w.start + 1.2);
    return {text: w.text, start: w.start, end: Math.max(end, w.start + 0.12), hero: heroes.has(norm(w.text))};
  });
  return written ? writtenForm(words) : words;
};

// AutoCaption Studio cues ({startTime, endTime, text, words?: {word, startTime, endTime, isHero}}) → words.
// Cues without word timing are spread evenly across the cue.
type Cue = {startTime: number; endTime: number; text: string; words?: {word: string; startTime: number; endTime: number; isHero?: boolean}[]};
export const fromAutocaption = (cues: Cue[], written = true): CapWord[] => {
  const words = cues.flatMap((c) =>
    c.words?.length
      ? c.words.map((w) => ({text: w.word, start: w.startTime, end: w.endTime, hero: !!w.isHero}))
      : spread(c.text, c.startTime, c.endTime, undefined, false),
  );
  return written ? writtenForm(words) : words;
};

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
export const spread = (text: string, start: number, end?: number, rate = 0.36, written = true): CapWord[] => {
  const ws = text.split(/\s+/).filter(Boolean);
  const step = end !== undefined ? (end - start) / ws.length : rate;
  const words = ws.map((w, i) => {
    const m = /^\*(.+)\*([^\p{L}\p{N}]*)$/u.exec(w); // *word* (punctuation may follow) marks a hero
    return {text: m ? m[1] + m[2] : w, start: start + i * step, end: start + (i + 1) * step, hero: !!m};
  });
  return written ? writtenForm(words) : words;
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
