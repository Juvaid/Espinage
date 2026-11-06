---
name: search-presence
description: >
  Check a brand's public SEO, Google Business signals on its own site, search
  snippets, and AI-search files. Use for WordLord Media or another saved
  profile when the user asks for an SEO check, GMB check, page-rank check,
  local search check, or AI search check. Run /search-presence. Fetch public
  pages with scripts/check_presence.py. Never invent a Google rank.
---

# Search presence

One profile JSON is the brand. The script reads it and writes what the public web returned.

## Run

From this skill directory:

```bash
python3 scripts/check_presence.py --self-test
python3 scripts/check_presence.py --profile profiles/wordlord-media.json --out reports/wordlord-media.json
```

Exit code 1 means at least one fail. Warnings still exit 0. Read `reports/<id>.md` for the short list and the JSON for titles, schema types, and the hosts parsed from each search page.

## What a check is

- **Pages.** Title, meta description, H1, canonical, and HTTP status for every path on the profile.
- **Business profile.** On `/` and `/contact`, visible phone, street, city, and email must match the profile. JSON-LD should include LocalBusiness or ProfessionalService, a street, and a phone. The contact page should link to Google Maps. This is the public site's business record. It does not log into Google Business Profile.
- **Index files.** `robots.txt` must load and name a sitemap. `sitemap.xml` must list the paths in `sitemap_must_include` except `/llms.txt`.
- **AI search.** `llms.txt` and `llms-full.txt` should load and name the brand. Named AI crawlers in `robots.txt` should be allowed on public pages.
- **Search snippets.** For each query, record where the site's host sits in the first 10 hosts from DuckDuckGo HTML. Bing is fetched too and recorded only when its page actually contains result links. Say the engine and the query with the number. If the fetch fails or the parser finds no results, say that and leave the position empty.

## How to report

Lead with fails, then warnings, then the search lines. Quote the observed title when a length warning fires. Do not turn a missing position into "not ranking on Google". Do not add stars, review counts, or traffic numbers the script did not return.

## A new brand

Copy `profiles/wordlord-media.json`. Change `id`, `site`, NAP, pages, and queries. Keep the phone as digits with country code. The street string must appear on the contact page.
