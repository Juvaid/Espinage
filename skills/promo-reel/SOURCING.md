# Sourcing: stills, angles, voice, footage, maps

## ChatGPT / Codex stills and angles

The user's ChatGPT desktop app is Codex (`com.openai.codex`). It generates images and keeps project context. Open the existing project chat ("Improve Dhunna Infra videos" holds both brands) rather than a new one.

- **Brief with only the project and references.** Name the building and the locked reference image. Say which features to keep exactly: towers, arches, signage, colours, floor count, proportions. List the shots wanted, each by camera position.
  - Proven angle set: three-quarter left, three-quarter right, low hero from the forecourt, wide from across the road (building small in the upper half), elevated three-quarter at ~30 m.
  - Ask for "standalone 9:16, photoreal, no text overlays".
- **Sending a message:**
  - Background typing sets the field's value without updating the app, so Send does nothing.
  - Take on-screen control: bring ChatGPT forward with `open_application`, click the message box, `cmd+Down`, type a space, Backspace, then Return.
  - Release full control afterwards.
- **Where results land:**
  - Raw generations go to `~/.codex/generated_images/<session-id>/exec-*.png` (newest by mtime).
  - Packaged sets go to `~/Documents/Codex/<date>/<slug>/outputs/<set>/` (zip and folder, with `MANIFEST.json`).
  - Prefer the packaged "locked" set over the raw files when both exist: it has the corrected proportions.
- **After receiving:**
  - Copy the set into the brand project (`public/cc-gpt/{locked,perspectives}` for Crown Crest; `public/gpt2`, `assets-gpt3` for 54D).
  - Grade: ffmpeg `unsharp=5:5:0.5,eq=contrast=1.04:saturation=1.05`.
  - Make depth maps (TECHNIQUES.md).
  - Contact-sheet the set and look at it before use.
- **Truth:**
  - These are visualisations, so label them in the film ("Concept visualisation") or tell the user they are unlabelled.
  - Reject any that alter the building.
  - The user may still remove one after seeing it (a three-quarter view was cut from Crown Crest v2d).
- **Images, not video:** Google Flow makes short clips. Crop the sparkle watermark (bottom ~8%).

## Pictures of what the voice names

- **People:** Wikimedia Commons (API search, `prop=imageinfo&iiprop=extmetadata` gives the licence and author). Use CC0 / CC BY / CC BY-SA only, credit on screen ("Photo: <author> · CC BY 3.0"), crop tight on the face, grade toward the brand.
- **Companies, products, tools:** Simple Icons (CC0 SVG marks) from `cdn.jsdelivr.net/npm/simple-icons@<version>/icons/<slug>.svg`, painted in the brand's ink. Some brands asked to be removed (Slack, OpenAI): use a plain glyph with the name instead of drawing their logo.
- Record every source in the project's `public/img/SOURCES.md`.

## Voiceover

- **Two routes:** the user's own recordings (Drive "Your voice recordings" or `work/vo-human/`; `docs/VO-RECORDING-SHEET.md` is the script sheet), or **Gemini speech with the autocaption key**. The Gemini route was approved for Flagship v2 (16 Oct 2026).
- **Gemini route (approved):**
  - The key is `GEMINI_API_KEY` in `/Volumes/disk 2/autocaption/.env`. Load it with dotenv inside the script and never print it.
  - Template: `54D scripts/tts_flagship_v2.mjs <Voice…>`, with the script JSON in `docs/`.
  - Models: `gemini-3.8-flash-tts`, falling back to `-lite`.
  - Voices: Kore (female, clearest names), Puck (male, charismatic); Charon is deep and serious.
  - Make two takes, send both, and build on the clearer one.
- **Scripts for the voice:**
  - Hinglish that opens on Hindi words ("Socho, …", "Toh milo, …").
  - Cheerful, exciting and promotional: short lines, a lift on the reveal, a question before the CTA.
  - Write numbers and names as spoken ("Fifty-Four D", "Assi foot").
  - Facts from the brief only.
  - The style hint asks for an authentic Punjabi-Delhi Indian accent, smiling, energetic and warm.
- **Word timing:** `54D scripts/align_vo.py <take.wav> <scripts.json> <film> <out.json> [hi|en]`. It runs whisper `small` with word timestamps and the script as prompt, matches the heard words to the script (difflib) and fills the gaps.
  - If it matches 0 words, whisper wrote Devanagari: rerun with `en` to get Latin script.
  - It prints anything heard before the script starts. That is a leaked style hint: trim the take there (`ffmpeg -ss <start-0.2>`) and realign.
  - Two of five takes leaked on 17 Oct.
- **Check every take** with `scripts/vo_check.py`: loudness, pitch spread (flat reads robotic, 4–7 semitones is natural promo), and whether whisper hears the key names.
- **Whisper:** use `small` with `initial_prompt` naming the brand ("Dhunna", "Sarabha"); `base` mishears names. Large models froze the Mac.
- **Two speakers in one take (conversation reels):** `multiSpeakerVoiceConfig` with one `speakerVoiceConfigs` entry per name. The 3.8 TTS models need **one content part per line**, each with `speechMetadata: {speaker}`; a single "Name: text" block is rejected. Template: `techlords-reels/scripts/tts_duo.mjs`. Then `scripts/tighten.py` (pauses ≤ 0.3 s) and align with speaker labels stripped.
- **Recurring cast:** a brand with a host keeps one voice per character in every reel (brand file), and its scripts are written in that character's voice.
- **Gemini limits and gotchas:**
  - Gemini TTS allows 10 requests a day per model per key, and its output is band-limited to ~12.5 kHz.
  - The full `flash-tts` model reads style hints aloud, so trim with whisper.
  - Never print or store the user's API key; pass it as an env var.

## Footage

Prep and editing of real footage: FOOTAGE.md. Sourcing notes:

- **Grade** with ffmpeg `hqdn3d, unsharp, curves, colorbalance, eq` into a `footage-bright/` set. Use bright, graded 4K segments only; dull or ungraded clips read untidy on a phone.
- **Leave out:** construction footage in Dhunna films; tight fisheye or close-up shots of the hero building (see TASTE.md).
- **Before choosing shots,** contact-sheet the clips (frame at 1 s, 320 px wide, tiled) to judge wide vs tight.

## Maps (OpenStreetMap)

- **Pull data** from the Overpass API around the plot: road classes, railway, water, parks, building footprints.
- **Build** with `scripts/build_map.py` (54D) / `build_cc_map.py` (Crown Crest) → `map.json`, metres from the plot.
- **Unnamed roads:** pick the OSM way nearest the Google Business pin with the right direction, and record its id.
  - Barewal Road is way 256721737.
- **Credit** "map data © OpenStreetMap" on screen.

## Mascots: generate, trace, rig (from the WordLord bull, 23 Oct 2026)

- **Generate headlessly:** the ChatGPT app bundles the Codex CLI at `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`.
  - Run `codex exec -s workspace-write -C <project> --skip-git-repo-check -i <reference.png> - < prompt.txt`.
  - The prompt tells it to save the PNG into the project. Independent sheets can run in parallel.
- **A style reference with a character in it gets copied, body shape included.** To borrow only a style, describe it in words and attach only the brand reference.
- **Sheets for cutting out:**
  - a pure `#00FF00` background with wide gaps;
  - no text;
  - "REDRAW, do not redesign" when a reference exists.
- **Tools, in the kit's `scripts/`** (run with `/Volumes/disk 2/.reel-tools/venv/bin/python -I`):
  - `split_parts.py` keys and splits a sheet; `--expect N` separates touching drawings with a watershed.
  - `trace_mascot.py` enlarges, smooths, snaps colours to a palette per brightness band, traces with vtracer (cutout mode) and drops the backdrop. `--logo` places a vector logo on top.
  - `fit_rig.py` template-matches the pieces of an exploded sheet onto its assembled figure.
- **Rigs:** start from an exploded sheet (the assembled character plus pieces at the same scale), fit the pieces, and keep the joints few. Use drawn library poses for specific hand gestures.

