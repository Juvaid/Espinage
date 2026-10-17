# Visual direction for a new brand

Derive the system from the brand's own evidence, then write it to `brands/<brand>.md` before building. Steps:

1. **Read the logo.** Its material sets the accent metal (gold, rose gold, silver, bronze, copper); its letterforms set the brand-name face (geometric wide → extended sans labels; classical serif caps → Cinzel or a similar inscriptional serif; script → keep the logo itself, never imitate script in type). The brand-name face is used only for the brand's names.
2. **Read the footage.** Day/dusk/night balance and dominant colours decide the ground and grade. Warm stone/peach buildings → warm near-black ground, cream ink. Glass/steel → cooler neutral ground, silver-white ink. The accent must survive on top of the footage's strongest colour.
3. **Write tokens.** `bg`, `bgLift`, `ivory`, `ivoryDim`, accent (`gold` key keeps the engine re-skinnable), `goldDeep`, `goldGlow`, `hairline`; bevel face + two extrusion stops; 3D metal hex. OKLCH, accent chroma ≤ 0.13.
4. **Pick the one signature move** the brand owns (Dhunna: gold 3D clay icons + site-plan overlays; Crown Crest: medallion reveal + Cinzel brand names). Everything else stays in the shared vocabulary so reels feel like one studio.
5. **Pick music** for the brand's energy (search Pixabay; reject every "Content ID Registered" track; choose by measured energy arc so a drop exists to land on the brand reveal). Ask before downloading.
6. **Render two or three stills** of the direction (hook, a list/card beat, the logo reveal), run them through the TASTE.md check loop, then show the user the ones that pass before building the full reel.

Done when `brands/<brand>.md` exists with tokens, type, logo treatment, signature move, music, and project/asset paths.
