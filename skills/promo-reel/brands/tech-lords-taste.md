# Tech Lords taste (and what carries over to WordLord Media)

The owner's taste for @techlordsbywlm, from the 21–23 Oct 2026 carousel rounds. The bar is **8.5/10**: the 23 Oct v3 round started at 6/10 and reached 7/10 before the fixes below.

- **This file:** why things look the way they do.
- **`tech-lords.md`:** the facts (tokens, files, cast).
- **The project's `src/carousel/v3/README.md`:** how to build it.

## The voice in three physical words

**Machined, cheeky, after-dark.** Think of a laser-etched panel on dark metal with one hot orange part, a sticker slapped on a server rack, a club flyer. The work is never cute, never corporate, never glassy.

## Type

- **Display face: Hubot Sans 720.** It is a mechanical grotesk, set at normal width with tight tracking (-0.03em).
  - Accent words take its **italic in brand orange**. The slant is the logo's slant, so emphasis comes from the brand, not decoration.
  - One accent per headline.
- **Body:** Geist. **Labels:** Geist Mono. **Numerals:** Mona Sans.
  - Hubot's zero is barred and reads as θ, which a general audience can't parse.
  - Check every display face's numerals before adopting it.
- **One scale, four weights.** `T` (≈1.25 ratio) and `WT` (400/560/680/800) live in `v3/tokens.tsx`. Eight weights and sizes 40/44/46/48/52 was the v2 mud.
- **Posters:**
  - One uniform size per headline, set by the longest line.
  - The author writes the line breaks: 2–3 short lines, about 12 characters each.
  - Lines at mixed sizes read as a ransom note, and automatic re-breaking chose ugly splits. Both were rejected.
- **Rejected:**
  - Hubot at 800 semi-expanded: "chunky".
  - Bricolage: quirky glyphs at poster size.
  - Plain Geist display: clean but forgettable. Keep it as the fallback.

## Colour and texture

- **Ground:** charcoal `#151517`. **Accent:** brand orange `#F24D07`, plus a burnt orange `#A8380A` for sheen.
  - Orange is earned: the accent word, the hero art, the one live element.
- **Silk (the satin shader):** ground only, at low energy. Its folds stay charcoal, and only the crests reach orange.
- **Grain:** static, soft, about 2 px.
  - It dithers dark gradients so they survive Instagram's re-encode, and costs almost no bits because it never changes.
  - This is an owner exception to the no-grain rule for client brands.
- **Halftone dots** are the signature texture: the logo, the number, a bar, the TL mark.
  - Noisy, with one shimmer pass.
  - Spacing at least 12 px (14–16 for big art). Smaller dots smear into grey after the re-encode.
- **Never texture behind type.** Dots and silk turn type muddy as the slide plays; that was a 7/10 note.
  - The art layer sits under calm bands.
  - The dot field fades out above the deck line.

## Composition

- **The cover is a poster:**
  - a tag (orange slanted shard + mono caps);
  - a giant left-aligned stack;
  - a two-line deck;
  - one hero visual bleeding off the frame.
- **The cover's design comes from the story, never one template.** The same hero on every carousel was rejected as repetitive.
  - **number:** a stat story. The headline sets it up, the dots pay it off.
  - **logo:** a one-company story.
  - **shards:** multi-company or roundup stories.
  - Add a new design when a story doesn't fit; don't force one.
- **Exaggerate one thing per frame.** On the cover: headline scale and the hero art. Inner slides stay calm and centred, with the data visual as the star.
- **Brand marks are sign-offs, not heroes.** The closing TL mark is about 256 px wide; at 380 px the owner said "too large".
- **Safe rhythm:**
  - brand bar on top;
  - date chip top right;
  - source line and progress shards at the bottom;
  - nothing important in the bottom 200 px except those.

## Motion (every moving thing must justify itself)

- The cover is complete on frame 0, because it is the thumbnail. No entrance on covers.
- **Ambient motion gets one job each:**
  - the shimmer crosses the hero once;
  - the dot noise breathes;
  - tiles float about ±5 px;
  - the silk drifts and continues from slide to slide (seeded by slide index).
- **Inner slides:**
  - Elements enter with a strong ease-out (0.23, 1, 0.32, 1) in 0.3–0.5 s, staggered 4–8 frames.
  - On-screen moves use ease-in-out (0.77, 0, 0.175, 1).
  - Never scale from 0; start at 0.94 or more.
- **Cut:** spinning orbit rings and pulsing glows. They are decoration without a job.

## Scoring a frame (be honest before showing it)

| Points | What it takes |
|---|---|
| 6 | Correct and on-brand, but templated. Same layout everywhere, mud behind text, too many weights. |
| 7 | Clean type zones and a real hero, but something fights: muddy bottom, crowded deck, a logo too big. |
| 8.5 | One idea per frame, readable at thumbnail size, every element placed on purpose, motion with a job, nothing to remove. |
| 10 | Someone screenshots it to show a designer. |

**Check:**
- stills at frame 0 (covers) and frame 140;
- a contact sheet of the whole carousel;
- a 3.5 Mbps re-encode crop of the dots and gradients.

## Transfer to WordLord Media (parent brand)

WordLord Media (`#FF4E2E` red on obsidian `#0D0D11`, deep slate `#252836`, white) shares Tech Lords' core: a hot red-orange on near-black. Lift both brands with one family system.

**Carries over as the parent DNA:**

| Principle | Tech Lords | WordLord Media |
|---|---|---|
| Hot accent on near-black, earned not sprayed | Orange `#F24D07` on charcoal | Red `#FF4E2E` on obsidian |
| Halftone dots as the signature texture | TL mark, numbers, logos | The WordLord wordmark or a client's result number in dots, for case-study covers |
| Poster covers designed per story | News stories | Case studies, client launches, results posts |
| Calm bands: nothing textured behind type | Yes | Yes |
| One exaggeration per frame; marks as sign-offs | Yes | Yes |
| Motion rules and the frame-0 rule | Yes | Yes |
| One type scale, four weights, measured headlines | Yes | Yes |

**Stays Tech Lords' own:**
- the slanted shards and italic accent (from the TL logo);
- the Hinglish voice and cheeky copy;
- Hubot Sans;
- the silk ground.

**WordLord picks its own:**
- a display face from its wordmark's character;
- its geometric motif from its own logo;
- a flatter ground (agency polish over tech grit).

**How to use this:**
- Build WordLord pieces from the same kit components: `DotField`, `ShaderBackdrop` with grain, and the render-batch flow.
- Swap the tokens; don't copy the Tech Lords layouts wholesale.
- When a principle is proven on one brand, record it here and in the other brand's file so both improve.

**Not adopted:** the vault's "Electric Indigo" secondary for Techlords. Orange-only reads stronger; revisit only if a second accent is ever needed.
