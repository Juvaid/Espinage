# Reel styles

The edit styles this studio makes, so a film is a deliberate choice, not the last style used. Pick one **base style** per film and at most two **guest elements** from other styles (a presenter film with a toggle-pill list and a 3D map beat, for example). The look comes from the brand file; the craft in each style is shared by every brand.

| Style | Use when | Spine of the edit | Reference project |
|---|---|---|---|
| **1. Footage promo** | Real drone, phone or 360 footage of the site exists | Cut on the word over graded footage; kinetic captions; tracked tags and road highlights on drone shots; checklist and photo cards for interiors | Dhunna reel v3 / reel 3 (59-D), Crown Crest v1 |
| **2. Presenter reel** | A person speaks to camera | The presenter is the spine; captions in a lead / hero / tail stack; B-roll and graphic inserts over the voice; captions move to a top band when the presenter sits low | Dhunna 54D presenter reel (`dhunnainfra-54d`) |
| **3. 3D card ad** | No real footage of the finished building; concept stills and 3D | Navy or brand ground; one card frame per beat in varied layouts; 3D type beats; map → 3D match cut | 54D Flagship v2, G, O3, N3, S3 |
| **4. Motion-graphics explainer** | Benefits, numbers, comparisons or process steps | UI-like elements: toggle-pill rows, checklists, counters, dimension bars, carousels, shape morphs, over a calm ground or a soft photo | MOGRAPH.md; reference: toggle rows "Premium investment / Timeless luxury / Prime location" |
| **5. Map and location reel** | The address is the message | OSM map from the city to the site, road highlight, travel-time tag, landmark tags, then the building | `MapScene`, `CCMap`, `Address3D` |
| **6. Single take** | The user asks for no cuts | Flying camera (one world, camera travels) or stage take (camera holds, elements build, hand off and morph) | `OneTake`, `OneTakeV2` (TECHNIQUES.md) |
| **7. Brand film** | Mood, not facts; music-led, 10–20 s | Few words, big type, slow moves, material close-ups, a mark reveal | Noir, Clay, Lumière, Drawn, B3 |
| **9. SaaS one-take explainer** | Tech, process, product explainers; anything taught with UI, code or diagrams | One world and one moving camera (spline, no cuts); a hero window that morphs between modes (editor → chat → terminal → diagram → comment pill); satellites rise from it; the host's cursor causes actions; optional cast of code-drawn mascots at the foot | Tech Lords `VibeOneTake`, `ProdUdaDiya`, `McpReel`, `FakePackages` (`techlords-reels/src/stage/`, docs/HOUSE-FORMAT.md) |
| **8. Story / poster in motion** | 15 s Stories, or animating an approved poster or carousel | One idea per screen; the poster's own layout animated (builds, light sweep, parallax) | Dhunna poster and carousel sets on Drive |

## Choosing

1. **Real footage of the thing named?** Footage promo (1), or a presenter reel (2) if a person is speaking.
2. **No footage, a building to sell?** 3D card ad (3), with a map beat (5) for the address.
3. **A list of benefits or numbers?** Motion-graphics explainer (4), or toggle pills / counters as a guest element.
4. **Mood or brand awareness?** Brand film (7).
4b. **Teaching something (tech, a process, a product)?** SaaS one-take explainer (9), with the cast for conversation scripts.
5. **The user asks for "one take", "no cuts" or "smooth like After Effects"?** Single take (6).

Write the chosen style and guest elements into the brief (EDIT.md §1).

## What each style must get right

- **Footage promo:** graded, stable, correctly rotated clips (FOOTAGE.md); cuts on nouns; nothing loose on busy footage (solid cards and pills); a tracked tag or road highlight on at least one drone shot.
- **Presenter reel:**
  - the face is never covered: captions sit in the band away from it;
  - B-roll covers jump cuts;
  - the first frame is the presenter mid-sentence with the hook caption up;
  - the caption stack is lead line, one big hero word, small tail.
- **3D card ad:** TASTE.md and TECHNIQUES.md in full.
- **Motion-graphics explainer:**
  - one element type per screen;
  - every state change lands on its word;
  - elements build in sequence, not all at once;
  - a real photo or the brand ground behind, never a busy video.
- **Map reel:** real OSM data only; hold on the city before the fall; the road lit at its real width; the travel time only if the client confirms it.
- **Single take:** TECHNIQUES.md "Stage take" / "Single take".
- **Brand film:** one hero material or object; type is the picture; music carries; 1–3 lines of voice at most.
- **SaaS one-take explainer:** the camera never stops dead and never cuts; the window is the anchor and never leaves (it steps back and returns); one satellite per beat proving the line; every named tool or person shows its mark or photo; captions centred above, cast below, all inside the safe frame.
- **Story / poster in motion:** keep the approved layout; animate it, don't redesign it; 15 s; the CTA is a sticker-like button.
