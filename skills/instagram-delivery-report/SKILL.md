---
name: instagram-delivery-report
description: Create an agency Instagram delivery report as a PDF, with every available reel cover, post, carousel slide and story image in publication-date order, plus collective and individual native insights. Use for monthly work-delivery or published-content reports; strategy and content planning are separate requests.
---

# Instagram delivery report

Produce a factual record of published work and its recorded performance. Use economical, professional wording. The default report contains content, visuals, metrics and brief reporting notes. Exclude recommendations, future content plans, inflated claims and unsupported business outcomes unless the user explicitly expands the task.

## Establish the scope

- Identify the account from the authenticated page. Resolve the requested year and inclusive start/end dates from the conversation; state a reasonable assumption when necessary.
- Record the reporting timezone and capture date. Distinguish **publication window** from **measurement window** before collecting totals.
- Use the user's requested browser. When they ask for the logged-in internal browser, use its documented browser-control tools. Follow current tool documentation rather than reusing old element indices, selectors or private endpoint routes.
- Collect only the requested account's reporting material. Creating a report does not authorize posting, messages, account changes or uploading the result elsewhere.
- Read the available PDF skill before authoring; follow its dependency discovery, artifact-start contract and render verification workflow.

## Collect the inventory

Keep a structured local dataset and source evidence as you work. Read [references/data-and-layout.md](references/data-and-layout.md) for the schema and PDF layout guidance.

1. Enumerate feed uploads and archived stories. Load lazy content until the lower date boundary is verified, or the archive visibly ends. One grid viewport is not an inventory.
2. Verify exact publication dates from visible timestamps or DOM-backed `time` elements. Prefer the original post timestamp over rounded grid dates or relative text. Do not infer dates from media IDs. Treat pinned order separately from publication order.
3. Save every included item's visual: the published **cover for each reel**, actual **image for each post**, **every carousel slide in sequence**, and each **story's own image or video preview**. Put each visual beside its own insights. Link videos to their published source.
4. Download through documented media-download or page-asset tools. Copy required assets into the task's stable working directory before browser cleanup. Match visuals and metrics by source URL, media ID or verified visual identity. Use order alone only after confirming identical inventory membership and ordering.
5. Open each item's native insights and save its source URL, capture time and available metrics. A click is not a captured record: confirm the expected fields loaded and were saved. Retry delayed views from current visible state; mark persistently unavailable fields explicitly.

Preserve native labels and displayed values, including inconsistencies. Capture views, reach/viewers, interactions, likes, comments, saves, shares, replies, accounts engaged, profile activity, profile visits, follows, link/address taps, follower/non-follower splits, view sources and story navigation where available.

Use `null`, displayed as a dash, for unavailable fields. Missing is not zero. Infer omitted navigation categories as zero only when the displayed total reconciles, and record that inference. If coverage is incomplete, state the specific limitation; do not call it complete or invent missing visuals or metrics.

## Calculate collective insights

- Prefer exact-range account totals when available; verify the selected measurement dates in the UI.
- If the UI offers rolling ranges only, use a wider range to discover items, then filter by publication dates. Do not rename "last 30 days" as a calendar month.
- For cumulative item insights, label collective figures as **totals for content published in [window], captured [date]**. They may include activity after the window ends.
- Add compatible action counts and displayed item totals. Preserve promotion flags and native ad-inclusion notes. Group different definitions separately, or explicitly label a combined sum as mixed native definitions. Do not present it as organic performance.
- Do not add unique reach, viewers or accounts engaged into unique people. Content-attributed follows are not net follower growth. Label current follower count as a capture-date snapshot.
- Retain native interaction totals when their components do not reconcile; explain material discrepancies briefly instead of replacing source values.

## Build the PDF

Use the included versioned renderer by default so different agents reproduce the same design. Read [references/template.md](references/template.md) for the command, input options and ready-to-render example. Inspect [assets/preview.png](assets/preview.png) or [assets/template-preview.pdf](assets/template-preview.pdf) as the visual reference. Replace the dataset and branding, rather than rebuilding the layout. Change the design only when the user requests it.

The template uses a clean white layout, dark text and restrained Instagram purple, pink and orange accents. Charts have clear labels, linear scales and exact values. Keep the report factual and compact.

Suggested structure, scaled to the inventory:

1. Account, inclusive publication dates and capture date.
2. Delivery counts and collective insights with concise graphs.
3. A chronological catalogue interleaving **all formats by upload date**. Retain carousel slide sequence. If story times are unavailable, state that cross-format order within the same day is unspecified.
4. Short source and metric notes covering material limitations.

Use neutral item titles based on the actual content. Enlarge single-item pages; pack adjacent story records where readable. Preserve image proportions and full composition. Use continuation pages when carousel slides would become too small. Covers and previews represent video; provide clickable source links.

## Verify and deliver

- Run `python3 scripts/check_dataset.py /absolute/path/report-data.json` from this skill directory. Resolve failures and inspect coverage and metric-basis groups before choosing chart totals. The script checks saved data, not live inventory completeness.
- Reconcile counts, visuals, publication boundaries and summary figures with source evidence. Each item needs a visual or an explicit unavailable-visual note.
- Render the final PDF. Inspect all pages as a montage and representative dense pages at readable size. Fix clipping, overlap, small labels, wrong image associations and excessive empty space; re-render changed pages.
- Check extracted catalogue dates for chronological order across formats, source links for usable destinations and embedded visuals against the item/slide inventory.
- Keep JPEGs encoded as JPEGs when embedding with ReportLab: pass a JPEG file path to `drawImage` to avoid unnecessary lossless raster inflation. Verify final size and image quality.
- Deliver the PDF with a short coverage/capture-date summary. No advice section in the report or final response by default. Log the completed outcome through the owner's vault workflow when available.
