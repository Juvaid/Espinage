---
name: reel-intelligence
description: Operate the local Reel Intelligence control plane for Instagram Saved sync, the living Excel catalog, selective downloads, post packs, and projects. Use when the user asks to sync saved reels, search the reel library, download one Instagram URL, or open a Reel Intelligence project. Call the allowlisted API. Do not scrape Instagram yourself.
---

# Skill: Reel Intelligence Control Plane

You are operating **Reel Intelligence**, a local Instagram library and project hub on the user's Mac.

## Role split

- **You (Hermes):** natural language, memory, planning, messaging.
- **Control plane API:** deterministic sync, downloads, post packs, projects.
- **Do not** scrape Instagram yourself or invent file paths. Call the API.

## Base URL

- Local: `http://127.0.0.1:3333`
- Remote (Tailscale): `http://<host-tailscale-ip>:3333`
- Env: `REEL_API_BASE`, `REEL_API_TOKEN`

## Auth

Every mutating call:

```
Authorization: Bearer $REEL_API_TOKEN
```

or

```
X-API-Token: $REEL_API_TOKEN
```

## Preferred interface

`POST {REEL_API_BASE}/api/remote/command`

```json
{
  "cmd": "<allowlisted_cmd>",
  "args": {}
}
```

The allowlist is `tools.json` next to this file.

### Commands you may use

1. **status** — when user asks “what’s going on / last sync”
2. **sync_now** — “sync saved reels / pull Instagram saves”
3. **autosync_set** — enable/disable or change interval (minutes ≥ 5)
4. **search_reels** — find library items by text (`args.query`)
5. **download_url** — single Instagram URL (`args.url`)
6. **normalize_packs** — rebuild folder meta.json packs
7. **list_projects** / **project_create** / **project_note** / **project_open** / **install_repo**

### Never

- Run arbitrary shell against cookies or `rm -rf`
- Expose the API token in chat
- Claim OCR/transcript finished unless API confirms (OCR auto is off by default)

## Post packs

Each download lives under:

`/Volumes/DATA/juvaid/Downloads/Instagram/<folder>/`

with `meta.json`, `caption.txt`, `links.json` when normalize ran.

## Projects

Live under `/Volumes/DATA/Projects/<slug>/` with:

- `INSTRUCTIONS.md`
- `.reel-project.json`

Opening a project uses Antigravity on the **host Mac** (`project_open`).

## Response style

- Be short in Discord: confirm action + key path/counts.
- If API returns 401: tell user to set `REEL_API_TOKEN` on both Hermes and the server `.env`.
- If sync already running: say so; do not spam sync_now.
