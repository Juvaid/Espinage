# Operations: machines, rendering, storage, assets, documentation

Verified 2026-10-19. Re-check before relying on a number: run `df`, `docker ps`, and read the file.

## Machines

| Machine | Facts | Use it for |
|---|---|---|
| **Mac** | 8 GB RAM; the internal drive is nearly full (it hit 0 bytes on 2026-10-18); `/Volumes/disk 2` has ≈ 0.9 TB with ≈ 770 GB free | Editing code, Remotion Studio previews, short still checks |
| **VPS** (Hostinger KVM 4, SSH alias `hostinger-hermes`, root, key auth) | 4 vCPU, 16 GB RAM, ≈ 180 GB free, Ubuntu, Docker, Caddy at `https://srv2071242.hstgr.cloud` | Final renders, hosted Caption Studio, WAHA, Hermes |

VPS services (`docker ps`; Caddy at `/etc/caddy/Caddyfile`, with a backup made before every edit):

| Path | Service | Port |
|---|---|---|
| `/api/*` | WAHA (WhatsApp) | 127.0.0.1:3000 |
| `/host-agent/*` | WordLord host agent | :3040 |
| `/studio/*` | Caption Studio (AutoCaption), `/opt/autocaption` | 127.0.0.1:3050 |
| (none) | Hermes agent, `/opt/hermes` (host network, dashboard on localhost) | — |
| (none) | Render box image `render-box`, `/opt/render` | — |

## Rendering

**On the Mac:** always set `TMPDIR="/Volumes/disk 2/tmp/render"`, use `--concurrency=2`, run one Studio at a time, and render stills in batches of 3–4. **Before a full render, check `sysctl -n vm.swapusage`:** with more than ~6 GB of swap used, Chrome times out connecting ("Timed out … connecting to the browser"), twice on 22 Oct 2026. Stop the Studio, or render on the VPS, or hand the render to the user.

**On the VPS (preferred for finals and batches):**

```bash
# 1. sync the project. Anchor every exclude with a leading / (an unanchored "data" also drops src/data).
rsync -az --delete --exclude /node_modules --exclude /out <project>/ hostinger-hermes:/srv/projects/<name>/
# 2. install once per dependency change (the npm cache is kept in /srv/projects/.npm)
ssh hostinger-hermes 'docker run --rm -v /srv/projects/<name>:/work -v /srv/projects/.npm:/root/.npm render-box npm install --no-audit --no-fund'
# 3. render (software WebGL: --gl=swangle)
ssh hostinger-hermes 'docker run --rm -v /srv/projects/<name>:/work render-box npx remotion render <entry> <Comp> out/<file>.mp4 --gl=swangle --concurrency=4'
# 4. bring it back
scp hostinger-hermes:/srv/projects/<name>/out/<file>.mp4 "/Volumes/disk 2/<project>/out/"
```

- **Measured on 2026-10-19 (kit, VPS):**
  - The 24-second 54D sample project (720 frames, WebGL background, depth reveal, captions, voice), rendered from JSON, took **96 s on Remotion 4.0.536** and ≈ 390 s on 4.0.530. In a controlled test of the same 180 frames, 4.0.536 took 38 s and 4.0.530 took 140 s.
  - Use 4.0.536 or newer for VPS renders.
- **Render a project file (no film code):** `npx remotion render src/demo/kit-entry.ts Manifest out/<name>.mp4 --props=projects/<project>.json --gl=swangle --concurrency=4`.
- **Pin Remotion exactly:** every `remotion` / `@remotion/*` package at the same exact version, no `^`. A caret let a fresh install mix 4.0.536 and 4.0.530, and Remotion warned "Version mismatch".
- **Mac Chrome:** Remotion 4.0.536's own headless Chromium 157 fails to start intermittently on this Mac ("Timed out … connecting to the browser"; once "icudtl.dat not found in bundle"). Point `browserExecutable` at Chrome for Testing 149 in `/Volumes/disk 2/.reel-tools/chrome-headless-shell-149` (the kit's `remotion.config.ts` and `stills.mjs` do this). Linux is fine with the default.
- **The project must declare its dependencies.** A symlinked `node_modules` doesn't travel. Check with `grep -rhoE "from '[^./'][^']*'" src`, compared against `package.json`.
- **Footage projects:** sync `public/` once (it can be gigabytes), then sync only `src/` for each render. Symlinks inside `public/` must be resolved, either with `rsync -L` or by copying the real files.
- **Leftover temp bundles:** every render leaves a `remotion-webpack-bundle-*` folder that copies `public/` (2.4–2.7 GB for footage projects). Delete them when nothing is rendering:

  ```bash
  pgrep -fl "remotion (render|still)"
  find "$TMPDIR" -maxdepth 1 -name 'remotion-webpack-bundle-*' -mmin +30 -exec rm -rf {} +
  ```

  On 2026-10-19 there were 198 of them (≈ 86 GB). In scripts, `bundle()` once and reuse the bundle for every composition.
- **Licence:** Remotion is free for organisations of up to 3 employees. WordLord has 3 (owner, 2026-10-19), so the free tier applies. At 4 or more it needs a company licence (remotion.pro).

## Storage and assets

- **One Remotion project per brand.**
  - All films for that brand live in it, in Studio folders Current / Archive / Codex-drafts / Dev.
  - `docs/FILMS.md` is the index.
  - Masters are named `<brand>-<project>_<film>_<audience>_<ratio>_<voice>_v<NN>_<YYYY-MM-DD>.mp4`.
- **Shared code:** `reel-components-kit` (also in the private Espinage repo under `kit/`). New reusable pieces go there, never copied into a film.
- **Brand assets:**
  - Renders, plans and materials live in `dhunnainfra-assets/project-59D/` (catalogue: `catalog.json`).
  - Footage masters stay in `Downloads/`.
  - Graded proxies go in each project's `public/footage`.
  - The kit's `public/` only symlinks client footage (not committed).
- **Team projects:**
  - Captions, styles and edits saved in the Caption Studio go to the admin's Convex (`studioProjects`, bodies in Convex storage).
  - Their media goes to the VPS, at `/opt/autocaption/data/media`.
  - Projects are archived, never deleted.
- **Delivery:** Drive through rclone `gdrive:`, with replaced cuts in `_replaced/`. Never run `rclone link`.
- **Don't delete project files;** move them to `archive/` or `_replaced/`. Leftover temp bundles and caches are the exception: they rebuild themselves.

## Documentation

- **Every project needs:**
  - a README: what it is, its entry file, its compositions, and how to preview and render it;
  - `docs/FILMS.md` for film projects;
  - `.agent/CONTEXT.md` for durable facts and sources;
  - `HANDOFF.md` for work in flight.
- **Facts carry their source:** brochure, deck or client message. Unknowns stay marked unknown (e.g. 54D's RERA number). Brand facts live in `brands/<brand>.md` here and in the admin.
- **Keys and tokens never go in docs, code, prompts or chat.** Note env var names only. A plain-text WAHA key was found in `Real estate/.agent/CONTEXT.md` on 2026-10-19.
- **Put code under git.** On 2026-10-19 only `autocaption`, `Real estate`, `dhunnainfra-59d-3d`, `pickkk4lickk-site`, `weplaysite`, `applemobilestore-in`, `vector-agent`, `wordlord-svg-motion-studio` and `Espinage` were repositories. The film projects were not.
- **Record decisions where the next agent will look:** the kit's CATALOG, AUDIT and ROADMAP; AutoCaption's `docs/STUDIO-PLAN.md` and `docs/REMOTION-PLATFORM.md`; and this skill.

## Platform direction

The product is **one user-facing editor**, the Caption Studio (AutoCaption) merged with Remotion. Anyone on the team can make and adjust videos there like in any editor, without an agent:

- **Script and voice:** Gemini writes a script, or uses one from a person or an agent, and turns it into the voiceover. Captions follow.
- **Building blocks:** kit components and presets with real controls, generated from their zod schemas.
- **Editing:** a timeline and a live Player preview.
- **Observability:** a visible job record for every generation and render.
- **Rendering:** on the VPS.

A project is a manifest: JSON naming kit components and their props. Agents are optional helpers that edit the same manifest. Plan: `/Volumes/disk 2/autocaption/docs/REMOTION-PLATFORM.md`.
