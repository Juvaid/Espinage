# Dataset and layout

## Dataset contract

Use a JSON object with:

- `account`: handle, without credentials or session data.
- `window`: inclusive `start` and `end` as `YYYY-MM-DD`, plus an IANA `timezone`.
- `captured_at`: ISO timestamp with an offset.
- `coverage`: `status` (`complete` or `partial`), `feed_boundary_verified`, `story_boundary_verified`, and `notes` explaining gaps when partial. Verification means reviewing the source, not merely setting a flag.
- `items`: catalogue records, oldest publication date first across all formats.

Optional renderer metadata: `client_name`, `agency_name`, `demo` (true for sample data), `report_notes` (list of strings), and `allow_mixed_native_totals` (false by default). Enable mixed totals only deliberately and retain the renderer's mixed-basis labels and native notes. `coverage.notes` is a list of strings. The renderer supports Unicode through the optional paired TTF font arguments described in `template.md`.

Each item has:

| Field | Meaning |
|---|---|
| `id` | Unique account media ID or canonical content URL |
| `type` | `reel`, `post`, `carousel`, or `story` |
| `published_date` | Verified date in the report timezone |
| `published_at` | Optional exact ISO timestamp with timezone |
| `source_url` | Published content or owner insights URL |
| `title` | Short factual title; optional for stories |
| `visuals` | Ordered list of `{path, role}`; role is `cover`, `post`, `slide`, or `story` |
| `expected_visual_count` | Verified cover/image/slide count, or `null` when unavailable |
| `missing_visual_note` | Explanation of unavailable required visuals |
| `metrics` | Native metric names with non-negative numbers or `null` |
| `metric_basis` | Basis per non-null metric, e.g. `cumulative-native`, `cumulative-includes-ads`, or a precise measurement window |
| `promotion` | `present`, `not_observed`, or `unknown`; not proof of all historical spend |
| `native_notes` | Ad definitions, discrepancies, derivations and unavailable fields |

Use one visual for each reel/post/story record and one visual per carousel slide. The renderer's primary fields are `Views`, `Interactions`, `Follows` and, for stories, `Viewers`; other native fields remain in the supporting metrics. Store percentages using `_pct` suffixes. Do not relabel a different native metric as one of these fields to fill a blank.

Store percentages under explicit names such as `views_followers_pct`. Preserve independently displayed non-follower percentages rather than assuming a rounded complement. Retain per-item capture times and evidence paths when collection spans sessions.

`metric_basis` records provenance, not an estimated organic/paid split. Basis groups are only comparable after reviewing their definitions.

## Collection traps

- Layouts and labels vary. Use current controls and fresh page state; previous account routes and selectors are not a reusable API.
- Virtualization may remove old DOM nodes. Save each verified batch and deduplicate by media identity. Check dates and membership before merging.
- Story archive dates may label only the first tile of a day. Carry that verified date across subsequent tiles; a highlight label is not a new date.
- Thumbnail endpoints can give different filenames for the same item. Confirm visual identity and the detail page rather than trusting filenames alone.
- A carousel's initial DOM may include adjacent slides. Advance until the visible next control ends; preserve slide order. Multiple preview variants of one video are not additional slides.

## Layout defaults

- A4 portrait, roughly 40-45 pt margins. Body around 9-11 pt; supporting labels at least 8 pt when practical.
- White, dark grey, purple `#8134AF`, pink `#DD2A7B`, orange `#F58529`; restrained accents.
- Cover: account, publication window, capture date and format counts; optional strip of actual reel covers.
- Summary: format/count/views/interactions table and horizontal bars. Separate differing metric bases when needed. Do not hide outliers using unlabeled nonlinear scales.
- Reel/post: visual left, primary metrics right, supporting native fields below.
- Carousel: numbered slides, followed by upload-level metrics; continue onto another page when necessary.
- Stories: two or three adjacent records per page, each image beside its own metrics. Enlarge a lone story rather than leaving a tiny record above a blank page.
- Footer: capture date/source and page number. Make source links visibly clickable.

Keep methodology concise: publication versus measurement dates, promotion definitions, unavailable fields and native discrepancies. Default scope is delivery documentation, without audit verdicts, strategy or recommendations.
