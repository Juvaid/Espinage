# Hooks, structures and casts

The owner's note (22 Oct 2026): scripts must be **playful, sarcastic, joke-led**, grab attention in the first second (a visual or a spoken line), and use **non-linear** patterns so the reel is interesting to watch. Every new script names one hook and one structure from this file, and no two reels in a row use the same pair.

## Hooks (frame 0 to 1.5 s)

Each hook pairs a **spoken** line with a **visual** that is already on screen at frame 0.

| # | Hook | Spoken | Visual at frame 0 |
|---|---|---|---|
| H1 | **Cold open in the disaster** | "Bhai… production database khaali hai." | The broken thing itself: "0 rows", a red deploy, a giant invoice |
| H2 | **Fake-out** | Starts as a hype ad ("Main ban gaya 10x developer!"), then the Lord deflates it in 3 words | A glossy fake ad card that cracks or record-scratches to a stop |
| H3 | **Confession** | "Maine ek prompt mein poora weekend jala diya." | The evidence: a 300-line prompt scrolling forever |
| H4 | **Choice / quiz** | "Ek line mein bata: A ya B?" | Two cards side by side with a vote bar the viewer wants to fill |
| H5 | **Wrong on purpose** | A confident wrong statement, stamped "galat" a beat later | A big claim card that gets a slanted orange "GALAT" shard |
| H6 | **Roast** | "Ye code dekh ke senior ne resign kar diya." | The guilty code with a red diff gutter |
| H7 | **Visual interrupt** | (one word, or silence for 0.5 s) | Something absurd and literal: a Ferrari delivering milk, a fire-extinguisher on a laptop, a 404 the size of the screen |
| H8 | **Mid-conversation** | Starts mid-sentence: "…aur isliye maine Friday ko deploy kiya." | The two mascots already arguing |

## Structures (the body)

| # | Structure | How it runs | House move that carries it |
|---|---|---|---|
| S1 | **Rewind** | Open on the ending (the disaster), "Ruko. Rewind karte hain.", play the cause, then fast-forward to the fix | `Rewind`: the one-take literally plays backwards for ~1 s (frames remapped with `<Freeze>`), with a scrub sound |
| S2 | **Answer first** | Give the punchline answer in line 2 ("Dono."), then earn it | The answer card stays pinned small in a corner while the reasons build |
| S3 | **Two timelines** | Bunty's way vs the Lord's way, cut side by side on the same task | The hero window splits into two panes; the same clock runs in both |
| S4 | **Out of order** | "Rule 3 pehle, kyunki wahi sab bhoolte hain", then 1 and 2 | The slab count fills 3 first |
| S5 | **Interrupted** | The Lord pauses the reel mid-explanation to correct Bunty | Everything freezes (`<Freeze>`), a pause glyph, the Lord steps forward |
| S6 | **Loop** | The last line sets up the first, so the replay feels intentional | The final frame matches frame 0 |

## Joke craft

- One real joke per 8–10 s, and the joke lands on a visual (Bunty's face, a stamp, a reveal), never only in the words.
- **Callbacks** beat new jokes: set something up in the hook and pay it off before the CTA ("Ferrari se doodh" → "ab cycle se").
- Sarcasm goes at the **habit**, never at the viewer. Bunty is the one who did it; the viewer laughs with recognition.
- The Lord's best lines are short: 1–4 words after a long Bunty line ("Aur das bugs.").
- Keep the teaching true: every fix in a joke reel is real advice (see `docs/IDEAS.md` fact rules).

## Frame rules (owner's note on clutter, 22 Oct 2026)

- **One reading target per moment.** While a caption is building, the window shows nothing new to read; while the window shows text, the caption is short (≤ 4 words) or off.
- **Captions:** ≤ 6 words per line, 2 lines max, size 86; never repeat words a card already shows.
- **Nothing in the caption zone** (y 250–560): satellites, chips and stickers stay below the caption's last line, or overlap the window's lower half.
- **Readable on a phone:** text inside cards ≥ 30 px, code ≥ 32 px, tags ≥ 24 px.
- **Nothing touches the cast:** the mascots own y ≥ 1090; cards and chips stay above y 1060 on screen.
