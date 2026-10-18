# Captions and type pairing

Captions are part of the design, not a subtitle layer. The kit has the engine (`CaptionTrack`), 20 presets, 17 font pairs and a library of 31 fonts covering Latin, Devanagari and Gurmukhi; its CATALOG.md has the API. This file covers choosing.

## Choose a preset by the film's style (STYLES.md)

| Film style | Presets | Why |
|---|---|---|
| 3D card ad, brand film (Dhunna) | `dhunna-steel`, `dhunna-gold` | Quiet lead, one metal hero per page; nothing competes with the cards |
| Crown Crest | `crown-crest` | Italic serif hero in champagne; Cinzel only for the brand name |
| Interiors, lifestyle, calm voice | `editorial-italic`, `garamond-soft`, `magazine`, `quiet-lowercase` | One italic serif word is the voice; lowercase reads as quiet luxury |
| Footage promo, presenter, hooks | `bold-pop`, `karaoke-fill`, `box-highlight`, `word-punch` | Heavy geometric sans, white with an outline, one accent; the dominant 2026 reel look |
| Busy footage | `pill-lines`, `clean-subtitle` | A solid surface under the words; never loose text on busy pictures |
| Launch, event, numbers | `poster-stack`, `wide-tech` | Tall or wide display heroes |
| Hindi or Punjabi script | `hindi-clean`, `punjabi-bold` | Devanagari-first or Gurmukhi-first pairs |

## Pairing rules

- **Contrast on one axis at a time:** weight (same family, 300 → 640), structure (sans lead + serif hero) or width (condensed or expanded hero). Two axes at once looks accidental.
- **Serifs are for the hero, not the running caption.** Phone-size caption streams want a sans (the research and our films agree).
- **Every Latin pair carries its Indic twins.** High-contrast Didone → Rozha One; italic serif → Tiro Devanagari; condensed Anton or Bebas → Teko or Khand; geometric → Poppins, which has its own Devanagari.
- **Devanagari and Gurmukhi have no capitals.** Uppercase styles must not rely on case for hierarchy; use size and weight.
- **No system fonts** (Impact, Arial) and no CDN fonts at render time. Every face is vendored in the kit.

## Craft

- **Numbers and codes are written as numerals:** 54D, 80 ft, 10 min. The voice says them as words; `writtenForm` (on by default in every word adapter) converts them on screen. Hindi number words convert only before a unit (assi foot → 80 ft).
- **Hinglish lines start with the Hindi word** (voice rule), and the hero is the noun the voice lands on, not the longest word. Mark heroes (`heroWords`, or `*word*` in `spread`); `autoHero` is only a fallback.
- **One effect family per film:** don't mix karaoke on one page and a box highlight on the next.
- **Captions never duplicate on-screen headings** (TASTE.md); when a heading carries the line, drop the caption for that beat.
- **Strokes** use `paint-order: stroke fill`. Gradient-filled words take `drop-shadow`, never `text-shadow`, and no stroke.
- **Check at phone size, on the real background,** mid-page. A preset that reads on navy can vanish on a bright facade; use a pill or panel there.

## Editing presets

1. Open the `Caption-Editor` composition (`npm run studio` in the kit).
2. Pick a preset and override fields in the props panel. The script choices play real voice-overs.
3. Save writes the props to `KitRoot.tsx`.
4. To keep a look, add it to `CAPTION_PRESETS` in `src/captions/style.ts` with a note on when to use it.
