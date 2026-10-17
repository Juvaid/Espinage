# Edit craft: brief, script, structure, pacing, sound, deliverables

How a reel is built as an ad, before and around the visuals. TASTE.md says what looks right; this file says what the edit must do.

## 1. Brief (before anything else)

Write it at the top of the film's doc (`docs/<film>-BRIEF.md`) and confirm it with the user:
- **Audience:** one group (retail brands, companies, families abroad, shop owners, investors).
- **One message:** the single thing they should remember.
- **The ask:** the action and the channel ("Message Dhunna Infra" on WhatsApp).
- **Placement:** Reels, Stories, feed ad. It sets the length and safe zones.
- **Length:** 20–26 s for ads, 10–15 s for brand cuts.
- **Voice:** the user's recording or Gemini (SOURCING.md).
- **Fact sheet:** every number, name and claim allowed on screen, with its source. Anything not on the sheet does not go on screen.
- **Legal:**
  - Indian property ads for registered projects must show the RERA registration number and the RERA website. Ask the client for it; never invent it.
  - Concept imagery must be labelled.
  - Music must be licensed (no Content ID).

Done when the fact sheet exists and the user has confirmed audience, message and ask.

## 2. Script

- **Word budget:** Gemini Hinglish promo runs about 4 words a second (measured 4.0–4.3). A 22 s film is about 70 words; a 10 s brand cut about 25.
- **Beat structure:**
  - **Hook (0–2.5 s):** tension or a question aimed at the audience, opening on Hindi words.
  - **Turn (2.5–6 s):** what's missing, or the promise.
  - **Reveal (6–9 s):** the place or brand, on its spoken name.
  - **Proof (9–20 s):** 2–4 concrete facts from the fact sheet, one per line.
  - **Ask (last 4–5 s):** a question, then the call to action.
- **Hook patterns that worked here:**
  - Call out the audience: N3 "Videsh mein baithe ho, par dil Ludhiana mein hai?"
  - Their problem as a question: O3 "Arre, team badh rahi hai aur office chhota pad raha hai?"
  - Correct a belief: Flagship "Flagship sirf bada showroom nahi hota"
  - Imagine: "Socho, aapka brand…"
  - A problem pair: S3 "Dukaan achhi hai… par customer ki nazar hi nahi padti?"
- **Line rules:**
  - One idea per line; 1.5–3 s per line.
  - Numbers and names written as spoken.
  - The brand named once at the reveal and once in the ask.
- **Variants:** write two hook variants per script, so the user can A/B them as ads.

## 3. Structure and pacing

- **Something new on screen every 1.5–2.5 s:** a build, a slide, a focus pull or a new card. No beat runs past ~3.5 s without a change inside it.
- **Rhythm:** vary beat lengths (short, short, long). The reveal holds longest (1.5–2 s after the name).
- **First frame:** a designed picture with text on screen by frame 6. It is the thumbnail and the scroll-stop; never black or empty.
- **Ask:** the CTA stays on screen at least 2.5 s, with the button pressed on "karo". The last frame must work as a still.
- **Loop:** the last frame should sit comfortably before the first (Reels replay).
- **Reading time:** at most 7 words per heading, on screen for at least 0.25 s per word plus 0.5 s.
- **Safe zones (1080×1920):** keep type and faces out of:
  - the top ~250 px (account header);
  - the bottom ~360 px (caption and buttons);
  - the right ~120 px from y 900 down (Reels like, comment and share column).

## 4. Sound

- **Music:**
  - Choose by energy arc.
  - `scripts/music_analyze.py` finds the lift; offset the music start so the lift lands on the reveal word.
  - Pixabay only, never a "Content ID Registered" track; ask before downloading.
- **Levels:**
  - VO on top.
  - Music bed about 0.1 (≈ −12 dB under the voice), lifting to about 0.24 on the reveal and to 0.2 under the CTA.
  - SFX soft.
  - Master at −14 LUFS, ≤ −1 dBTP.
- **Events:** one sound per kind of event (SKILL.md). A beat of near-silence before the reveal word makes the boom land.

## 5. Deliverables

- **Master:** 1080×1920 at 30 fps, or 60 fps with motion blur for 3D films (MOTION.md). Name it by the scheme (SKILL.md).
- **WhatsApp share copy:** under 16 MB (`-crf 26`, AAC 128k).
- **When the placement needs them:**
  - a 4:5 feed version (1080×1350), recomposed rather than cropped;
  - a 15 s cutdown (hook, reveal, one proof, ask);
  - a cover frame PNG;
  - an `.srt` caption file from the aligned words.
- **Ad tests:** one master per hook variant, everything else identical.

## 6. Working with notes (agent behaviour)

- **Scope every note:** this frame, this film, every film of the brand, or the system.
  - The default is every affected film. The user had to ask more than once ("check those on other videos too").
  - Fix the shared component when one exists, so every film inherits the fix.
- **Record the lesson the same turn:** a ban plus an "instead" in TASTE.md, a fact in the brand file, a recipe in TECHNIQUES.md.
- **Preview before rendering:**
  - Show changes in Studio and as checked stills.
  - Render masters only to deliver, or when the user asks. A master takes 5–30 min, so batch all fixes into one render pass.
- **Compute:**
  - One render process at a time.
  - No stills while a render runs.
  - Post-processed 3D stills one per call.
  - Long jobs run in the background, with a check on the output file, not the process.
- **Versions:** bump the version on every delivered re-render and never overwrite a delivered file. Replaced cuts go to `_replaced/`.
- **Ask, or proceed with a stated default:**
  - Ask about script wording, facts, voice choice and anything public or paid.
  - Proceed on layout, timing and technique choices, and say what you chose.
