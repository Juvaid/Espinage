# Transitions

Every transition is a choice made for its beat. Default to the simplest one that keeps the eye on the next hero. A transition never runs over a spoken hero word.

| Transition | Use for | Length | How |
|---|---|---|---|
| **Cut on the word** | Footage promo and presenter: the default | 0 | Cut 1–3 frames before the noun's spoken frame |
| **J / L cut** | Presenter and B-roll | — | Sound leads (J) or trails (L) the picture by 6–12 frames |
| **Whip pan / whip-up** | Footage promo energy between locations | ≤ 6 frames | `SceneWindow` (Dhunna reels): offset by the frame width with directional blur that follows the velocity, `ease.whip` |
| **Push / zoom-through** | Into a detail or a new space | 6–10 | Scale 1 → 1.15 on the outgoing shot, 0.9 → 1 on the incoming one, short cross |
| **Clean slide** | Card to card in 3D card ads | ~16, in-out | The new card enters as the old one leaves on the same axis (GCards, `Swap`) |
| **Match cut** | Between worlds with a shared shape (map pin → 3D pin, card → tile) | 0–12 dissolve | Line up scale and position on both sides; dissolve only over the overlap (TECHNIQUES.md) |
| **Hand-off** | Stage take, and inside one beat | 20–26 | The outgoing element steps back a layer and dims as the new one builds in front |
| **Match transform / morph** | One element becomes the next | 18–30 | `ShapeMorph` for outlines; card → tile; card → deck front |
| **Object wipe** | Footage with a foreground object (pillar, statue, car) crossing | 6–12 | A depth or roto matte of the object reveals the next shot behind it |
| **Mask reveal** | Type and cards, editorial feel | 10–16 | A clip-path or line wipe in the motion's direction; a drawn line leads it |
| **Light leak / flash** | The single biggest reveal | 4–8 | Feathered warm leak over a cut; once per film |
| **Dissolve** | Only between worlds or for brand films | 8–14 | Never between two cards or two footage shots |

Rules:
- Pick a family per film (cuts and whips for footage promos, slides and match cuts for 3D card ads, hand-offs and morphs for stage takes) and stay in it. One "big" transition at the reveal may break the family.
- Directions mean something: forward = right or up. Don't alternate sides at random, and don't send everything in from the same side either.
- Timing with sound: a swish on slides and whips, a low boom on the reveal, nothing on plain cuts.
