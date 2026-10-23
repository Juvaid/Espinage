---
name: promo-reel
description: Art-direct and build 9:16 promo reels and ads (real estate / brand) in Remotion, in any style: footage, presenter, 3D card, motion-graphics explainer, map, single take, brand film. Use for a new reel or ad, writing ad scripts and hooks, motion graphics (toggle pills, counters, shape morphs), transitions, editing real footage, re-cutting or polishing a Dhunna Infra or Crown Crest film, a new brand's visual direction, storyboards, scoring scenes, 3D type / map / depth-photo shots, or briefing ChatGPT/Codex for images. Includes the taste rules (TASTE.md) and a mandatory render-look-critique-fix loop.
---

# Promo reel

A reel here is a 10–50 s vertical film with a Hinglish voiceover (or music only; **Hinglish even when the user's draft copy is in English**: translate it into the brand's voice and ask before voicing another language), type that lands on the spoken word, and mastered sound. It can be one of several styles (STYLES.md): footage promo, presenter reel, 3D card ad, motion-graphics explainer, map reel, single take, brand film, or story/poster in motion. Every film is built in Remotion, one project per brand.

**Shared craft, brand looks.** Everything in this skill's shared files (STYLES, EDIT, TASTE, TECHNIQUES, FOOTAGE, TRANSITIONS, MOGRAPH, MOTION, SOURCING) applies to every brand. A brand's look (tokens, faces, metal, signature move, approved looks, facts) lives only in its brand file and its theme in `reel-components-kit/src/presets/themes.ts`. A technique learned on one brand is written into the shared files; a correction about one brand's look goes into its brand file.

Read the brand file before touching design:
- Dhunna Infra → [`brands/dhunna-infra.md`](brands/dhunna-infra.md)
- Crown Crest → [`brands/crown-crest.md`](brands/crown-crest.md)
- Tech Lords (@techlordsbywlm, AI-engineering explainers) → [`brands/tech-lords.md`](brands/tech-lords.md) and its taste, [`brands/tech-lords-taste.md`](brands/tech-lords-taste.md) (also the base for WordLord Media's own pieces)
- Any other brand → [`NEW-BRAND.md`](NEW-BRAND.md) first, then write its `brands/<brand>.md`.

**Rules apply at full scope.** A rule written from one case covers every element of that kind: "one text at a time" counts text inside cards and windows; "reveal on the word" covers every named person, company, tool and source; the 44 px label minimum applies inside UI cards too. On 22 Oct 2026 an agent read these narrowly and the user had to correct each one ([`TASTE.md`](TASTE.md) §6).

**Read [`TASTE.md`](TASTE.md) before designing anything.** It holds the user's own corrections, what reads as slop, and the render → look → critique → fix loop. No visual is done until you have looked at it rendered.

Reach for these when a branch needs them:
- [`STYLES.md`](STYLES.md): the reel styles, when to use each, how to choose one base style plus at most two guest elements, and what each must get right.
- [`FOOTAGE.md`](FOOTAGE.md): real footage and presenters: prep (rotation, HDR, stabilised proxies, grading), cutting on the word and the beat, tracked tags, road highlights on drone shots, photo and checklist cards over footage.
- [`TRANSITIONS.md`](TRANSITIONS.md): the transition catalogue (cut, J/L, whip, push, slide, match cut, hand-off, morph, object wipe, mask reveal, light leak), with lengths and when each fits.
- [`OPERATIONS.md`](OPERATIONS.md): machines (Mac vs VPS), rendering on the VPS render box, temp-bundle cleanup, storage and asset layout, team projects, documentation and git rules, the Remotion licence, the platform direction.
- [`CAPTIONS.md`](CAPTIONS.md): caption presets by film style, font-pairing rules (Latin + Devanagari + Gurmukhi), caption craft and the preset editor.
- [`MOGRAPH.md`](MOGRAPH.md): motion-graphics elements from the shared `reel-components-kit` (toggle pills, checklist, number ticker, shape morph, pins, deck/carousel/floors, orbit, lens, card accents, wireframe background art, coins, logo reveal, Phosphor icons), themed per brand. The kit's CATALOG.md is the component index.
- [`EDIT.md`](EDIT.md): the edit as an ad: brief and fact sheet, script word budget and beat structure, hook patterns, pacing, safe zones, sound levels, deliverables, and how to handle notes and renders.
- [`ENGINE.md`](ENGINE.md): projects, components, scripts, render and delivery gotchas.
- [`TECHNIQUES.md`](TECHNIQUES.md): recipes for 3D type and chrome, depth-photo camera moves, text behind objects, map → 3D match cuts, procedural 3D props, card layouts.
- [`SOURCING.md`](SOURCING.md): briefing ChatGPT/Codex for stills and angles, voiceover (the user records it), footage grading, OpenStreetMap data.
- [`MOTION.md`](MOTION.md): making motion feel premium: 60 fps and motion blur, easing and springs, overlap and follow-through, depth of field and focus pulls, bloom, GSAP.
- [`QUALITY.md`](QUALITY.md): the per-frame checklist and the every-second audit.
- [`HOOKS.md`](HOOKS.md): hook types (first second, spoken + visual), non-linear structures, joke craft, recurring casts and mascots.

## Steps

0. **Start of session:** read the project's `docs/FILMS.md` and the brand file, check whether the Studio preview is running, and list what is current. **Brief:** for a new film, write the brief and fact sheet (EDIT.md §1) and confirm audience, message and ask.
1. **Choose the style** (STYLES.md): one base style plus at most two guest elements, written into the brief.
2. **Inventory.** List every asset: VO, footage (duration, rotation, HDR), stills (ChatGPT sets included), renders/PDFs, logo, references. Contact-sheet every clip. Done when each asset has a one-line "shows / usable for" note and a "wide or tight" call.
3. **Script + timing.** Write or check the script against the word budget and beat structure (EDIT.md §2), with two hook variants. Align every word of the voice to the audio (`scripts/align_vo.py`). Done when every word has a measured start and the user has confirmed the wording.
4. **Storyboard before building.** One beat per VO line, each with what is on screen, the camera move, the text and the layout (vary it, TASTE.md §3).
   - Render the board as a sheet with real frames (`scripts/storyboard.py`) and show it.
   - For missing angles or assets, brief ChatGPT (SOURCING.md) with only the project and its references.
   - Done when every beat has a real asset and the user has seen the board.
5. **Build** on the brand project. Reuse kit and project components before writing new ones; a new reusable element goes into the kit (MOGRAPH.md). Before each scene write its design read (TASTE.md §1).
   - Keep the Studio preview running (`.claude/launch.json` in `/Volumes/disk 2`) so the user can steer live.
   - They often send notes with screenshots while you work. Scope each note (this frame, this film, every film) and fix it everywhere it applies, in the shared component where one exists (EDIT.md §6).
   - Record each correction in TASTE.md, the brand file or TECHNIQUES.md in the same turn.
6. **Check every scene as you go** (TASTE.md §4): stills at its beats, then a contact sheet.
   - Score finished cuts per scene with `score_video.py`: 8/10 per scene passes, 10 is the goal.
   - The scorer is only a guide. It penalises tidy consistency ("repeat") and bright paper ("expo"), and the user's eye wins.
   - Done when every item passes on rendered pixels and the stills are shown.
7. **Deliver.**
   - Render masters only now, or when the user asks: batch every fix into one render pass (EDIT.md §6).
   - Full render with the kit's `scripts/render-batch.mjs` (one bundle and one browser for every file; OPERATIONS.md "Rendering"), loudness to −14 LUFS, copy into the brand's `out/current`. Add the share copy and any cutdowns the placement needs (EDIT.md §5).
   - **Post copy goes to Haiku** (owner, 23 Oct 2026): captions, title/cover options, pinned comment, hashtags, alt text and the YouTube/LinkedIn title are drafted by a Haiku subagent (Agent tool, `model: "haiku"`, in the background while you render or fix). Give it the film's fact source (script JSON or carousel data file), the brand's post rules and one approved example, tell it to use only facts in that source, and have it write to `docs/drafts/` with a "Facts used" list. Then check every number, date and name against the source, fix the voice, and merge the result into the brand's caption kit. Haiku drafts; you sign off.
   - Name every master `<brand>-<project>_<film>_<audience>_<ratio>_<voice>_v<NN>_<YYYY-MM-DD>.mp4`, all lower case with hyphens inside a field and underscores between fields. Example: `dhunna-54d_o3-offices_companies_9x16_puck_v04_2026-10-17.mp4`. Use the same name locally (`out/current`) and on Drive.
   - Upload to the brand's Drive folder, with replaced cuts moved to `_replaced/` under their scheme name.
   - Add the files to the Drive index sheet ("00 Index · every creative" in Dhunna Ad Creatives) so they can be found by film, audience, type, status or date.
   - Update the film index (`docs/FILMS.md`) and send the Drive folder link.
   - Done when the user has the link and the index shows the real count of current films.

## Design rules (all brands)

- **One text at a time, one reading target per moment.** A heading, a 3D label or a type beat carries the line. A caption panel shows only where nothing else says it, so two texts never say the same words. Text inside cards, windows and chips counts: while a card has something to read, the caption is ≤ 4 words or off.
- **Captions centred** in the one fixed slot by default (left-aligned only when the brand file says so), ≤ 6 words a line, 2 lines max, never touching a card.
- **Cross-platform safe frame** (Reels, Shorts, TikTok): content inside x 80–930 and y 250–1480; nothing in the right 150 px below y 900.
- **Headings** sit in one fixed slot, in sentence case. Each pairs a light 300 word with a display 640 accent word in the brand metal (bevel, one sheen pass, deep soft glow in the brand's hue).
- **Cards, not full-bleed**, for stills and clips. They share one card face (hairline edge, top-edge highlight, concept label), and the layout changes per beat.
- **Wide shots.** Show the whole building with sky and road around it. If the only shot of the hero building is tight, fisheye or cropped, get a ChatGPT angle or a reshoot instead.
- **Type-only beats live in 3D space**: extruded lettering, depth, floating elements.
- **Text behind the subject wherever the scene allows.** When a shot has a clear foreground subject (statue, tower, person, car, tree) against open background, set the heading's hero word behind it using a depth cut-out (TECHNIQUES.md). Use it at least once per film where such a shot exists.
- **Reveal on the word, and names get pictures.** A brand, place or product appears on its spoken name. Every named person, company, tool, product or source gets its picture on its word: a photo card (licensed, credited on screen), a logo mark, or the mark inside the card that cites it (SOURCING.md "Pictures of what the voice names").
- **Explainers are one take, not slides.** For explainers (tech, process, how-to) use the SaaS one-take (STYLES.md 9): one world, one moving camera, one hero window that morphs, satellites and a cursor. Static card-per-beat scenes were rejected as "too static" (22 Oct 2026).
- **Stage take** (TECHNIQUES.md) when the user asks for a single take or no cuts: locked camera, elements build on and off, hand off and match-transform inside the frame. Its terms (stage, anchor, build on/off, hand-off, match transform, object wipe, diorama, beat stack) are the shared vocabulary for storyboards.
- **Motion:**
  - One steady camera move per shot (depth push, slide, orbit), and clean slides between cards.
  - Match cuts and short dissolves between worlds (map → 3D).
  - Expo-out or in-out easing; a landing overshoot only on 3D objects.
- **Sound:** VO on top, music ducked with its lift on the reveal. One sound per kind of event: pin = blip, card = swish, heading = tick, reveal = low boom, button = snap.
- **Truth:**
  - Use only facts the client or the assets confirm: numbers, phone numbers, buildings, landmarks.
  - Label concepts ("Concept visualisation").
  - Draw maps from real OSM data, with only real neighbours.
  - Flag guesses for confirmation.
