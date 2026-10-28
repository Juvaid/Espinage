# Espinage

Private skills for Claude Code.

## Skills

- **promo-reel**: art-direct and build 9:16 promo reels and ads in Remotion (Dhunna Infra, Crown Crest). It covers:
  - taste rules from client feedback;
  - 3D type and chrome, depth-photo moves and text behind subjects;
  - map → 3D match cuts, and the stage take (locked camera, in-frame transitions);
  - motion (60 fps, motion blur, depth of field, GSAP);
  - sourcing (ChatGPT/Codex stills, Gemini voices);
  - delivery and naming.
- **instagram-brand-kit**: build a brand's Instagram identity set and brand kit in Remotion. It covers:
  - profile picture, 1:1 highlight covers, and post covers that work at 9:16 and in the 3:4 grid;
  - safe-zone overlays (`tools/safe_zones.py`) and the sizes table;
  - an editor motion pack: intro, outro/CTA, letterform transitions, loops, stickers and lower thirds, with alpha;
  - packing the kit folder and uploading it to Drive.

## Kit

`kit/` is the reel components kit (Remotion), the component library the promo-reel skill builds with. Start with `kit/CATALOG.md`.
- `kit/AUDIT.md` covers what was refined and what's legacy.
- `kit/ICONS-AND-EFFECTS.md` lists icon sets and effects to port.
- Music beds, voiceovers and footage aren't committed: their licences are unknown and they're client material. They live in the local projects on disk 2.

## Install

Copy or symlink a skill into `~/.claude/skills/`:

```bash
ln -s "$(pwd)/skills/promo-reel" ~/.claude/skills/promo-reel
```
