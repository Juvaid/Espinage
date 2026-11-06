#!/usr/bin/env python3
"""Public SEO, business-profile, search-snippet, and AI-crawler check.

Reads a profile JSON and fetches only public URLs. Search positions are what
DuckDuckGo and Bing returned on this run. They are not Google rank.
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

UA = "JuvaidHomeSearchPresence/1.0 (+https://github.com/Juvaid/Espinage)"
SEARCH_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
TIMEOUT = 25
MAX_BYTES = 1_500_000


class PageExtract(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.h1_parts: list[str] = []
        self.text_parts: list[str] = []
        self.metas: list[tuple[str, str, str]] = []
        self.canonical = ""
        self.ld: list[str] = []
        self.links: list[str] = []
        self._skip = 0
        self._in_title = False
        self._in_h1 = False
        self._in_ld = False
        self._ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag in {"script", "style", "noscript"} and not (
            tag == "script" and "ld+json" in a.get("type", "")
        ):
            self._skip += 1
        if tag == "title":
            self._in_title = True
        if tag == "h1" and not self.h1_parts:
            self._in_h1 = True
        if tag == "meta":
            self.metas.append((a.get("name", ""), a.get("property", ""), a.get("content", "")))
        if tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonical = a.get("href", "")
        if tag == "a":
            href = a.get("href", "")
            if href:
                self.links.append(href)
        if tag == "script" and "ld+json" in a.get("type", ""):
            self._in_ld = True
            self._ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        if tag == "h1":
            self._in_h1 = False
        if tag == "script" and self._in_ld:
            self.ld.append("".join(self._ld_parts))
            self._in_ld = False
        if tag in {"script", "style", "noscript"} and self._skip and not self._in_ld:
            self._skip -= 1

    def handle_data(self, data: str) -> None:
        if self._in_ld:
            self._ld_parts.append(data)
            return
        if self._skip:
            return
        if self._in_title:
            self.title_parts.append(data)
        if self._in_h1:
            self.h1_parts.append(data)
        if data.strip():
            self.text_parts.append(data)


def fetch(url: str, ua: str = UA) -> tuple[int, str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "text/html,application/xhtml+xml,*/*"})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as res:
            raw = res.read(MAX_BYTES)
            charset = res.headers.get_content_charset() or "utf-8"
            return res.status, raw.decode(charset, errors="replace"), res.geturl()
    except urllib.error.HTTPError as err:
        body = err.read(MAX_BYTES).decode("utf-8", errors="replace")
        return err.code, body, url
    except Exception as err:  # network, TLS, timeout
        return 0, str(err), url


def meta_content(page: PageExtract, name: str = "", prop: str = "") -> str:
    for n, p, c in page.metas:
        if name and n.lower() == name.lower():
            return c.strip()
        if prop and p.lower() == prop.lower():
            return c.strip()
    return ""


def digits(value: str) -> str:
    return re.sub(r"\D", "", value)


def walk_types(node, found: list[dict]) -> None:
    if isinstance(node, list):
        for item in node:
            walk_types(item, found)
        return
    if not isinstance(node, dict):
        return
    if "@graph" in node:
        walk_types(node["@graph"], found)
    types = node.get("@type")
    if types:
        found.append(node)
    for value in node.values():
        if isinstance(value, (dict, list)):
            walk_types(value, found)


def business_nodes(blobs: list[str]) -> list[dict]:
    nodes: list[dict] = []
    for blob in blobs:
        try:
            data = json.loads(blob)
        except json.JSONDecodeError:
            continue
        found: list[dict] = []
        walk_types(data, found)
        for node in found:
            types = node.get("@type")
            types = types if isinstance(types, list) else [types]
            if any(t in {"LocalBusiness", "ProfessionalService", "Organization"} for t in types):
                nodes.append(node)
    return nodes


def add(findings: list[dict], level: str, code: str, detail: str) -> None:
    findings.append({"level": level, "code": code, "detail": detail})


def check_page(site: str, path: str, profile: dict) -> dict:
    url = site.rstrip("/") + (path if path != "/" else "/")
    if path == "/":
        url = site.rstrip("/") + "/"
    status, body, final = fetch(url)
    findings: list[dict] = []
    if status == 0:
        add(findings, "fail", "fetch", f"{url} did not load: {body[:180]}")
        return {"url": url, "status": status, "findings": findings}
    if status != 200:
        add(findings, "fail", "status", f"{url} returned HTTP {status}")
    page = PageExtract()
    page.feed(body)
    title = re.sub(r"\s+", " ", "".join(page.title_parts)).strip()
    h1 = re.sub(r"\s+", " ", "".join(page.h1_parts)).strip()
    description = meta_content(page, "description")
    robots = meta_content(page, "robots")
    text = re.sub(r"\s+", " ", " ".join(page.text_parts))
    nap = profile["nap"]
    phone_ok = digits(nap["phone_digits"])[-10:] in digits(text)
    street_ok = nap["street"].split(",")[0].lower() in text.lower() and nap["locality"].lower() in text.lower()
    email_ok = nap["email"].lower() in text.lower()
    nodes = business_nodes(page.ld)
    schema_phone = False
    schema_street = False
    schema_types: list[str] = []
    for node in nodes:
        types = node.get("@type")
        types = types if isinstance(types, list) else [types]
        schema_types.extend(str(t) for t in types)
        blob = json.dumps(node)
        if digits(nap["phone_digits"])[-10:] in digits(blob):
            schema_phone = True
        address = node.get("address") if isinstance(node.get("address"), dict) else {}
        street = str(address.get("streetAddress") or "")
        if nap["street"].split(",")[0].lower() in street.lower():
            schema_street = True
    if not title:
        add(findings, "fail", "title", "Missing <title>")
    elif not (15 <= len(title) <= 70):
        add(findings, "warn", "title-length", f"Title is {len(title)} characters: {title}")
    if not description:
        add(findings, "fail", "description", "Missing meta description")
    elif not (50 <= len(description) <= 180):
        add(findings, "warn", "description-length", f"Description is {len(description)} characters")
    if not h1:
        add(findings, "warn", "h1", "No H1 in the first pass of the HTML")
    if "noindex" in robots.lower():
        add(findings, "warn", "noindex", f"robots meta is {robots}")
    host = urllib.parse.urlparse(site).netloc
    if page.canonical and host not in page.canonical:
        add(findings, "fail", "canonical", f"Canonical is off-host: {page.canonical}")
    if path in {"/", "/contact"}:
        if not phone_ok:
            add(findings, "fail", "nap-phone", "Visible page text is missing the profile phone")
        if not street_ok:
            add(findings, "fail", "nap-street", "Visible page text is missing the street and city")
        if not email_ok:
            add(findings, "warn", "nap-email", "Visible page text is missing the profile email")
        if not any("LocalBusiness" in t or "ProfessionalService" in t for t in schema_types):
            add(findings, "warn", "schema-type", "No LocalBusiness or ProfessionalService JSON-LD")
        if not schema_street:
            add(findings, "warn", "schema-street", "JSON-LD has no matching streetAddress")
        if not schema_phone:
            add(findings, "warn", "schema-phone", "JSON-LD has no matching telephone")
        maps = any("google.com/maps" in href and profile.get("maps_url_contains", "").lower() in href.lower() for href in page.links)
        if path == "/contact" and not maps:
            add(findings, "warn", "maps-link", "Contact page has no Google Maps directions link")
    return {
        "url": final or url,
        "status": status,
        "title": title,
        "description": description,
        "h1": h1,
        "canonical": page.canonical,
        "schema_types": sorted(set(schema_types)),
        "findings": findings,
    }


def parse_robots(body: str) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    pending: list[str] = []
    started_rules = False
    for raw in body.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key, value = key.strip().lower(), value.strip()
        if key == "user-agent":
            if started_rules:
                pending = []
                started_rules = False
            pending.append(value.lower())
            groups.setdefault(value.lower(), [])
        elif key in {"allow", "disallow"} and pending:
            started_rules = True
            rule = f"{key}:{value or '/'}"
            for agent in pending:
                groups.setdefault(agent, []).append(rule)
    return groups


def blocks_public_pages(rules: list[str]) -> bool:
    return "disallow:/" in rules


def check_robots(site: str, profile: dict) -> dict:
    status, body, _ = fetch(site.rstrip("/") + "/robots.txt")
    findings: list[dict] = []
    if status != 200:
        add(findings, "fail", "robots", f"robots.txt HTTP {status}")
        return {"status": status, "findings": findings, "bots": []}
    if "sitemap:" not in body.lower():
        add(findings, "warn", "robots-sitemap", "robots.txt does not name a sitemap")
    groups = parse_robots(body)
    star = groups.get("*", [])
    bots = []
    for bot in profile.get("ai_bots", []):
        rules = groups.get(bot.lower(), [])
        effective = rules or star
        allowed = not blocks_public_pages(effective)
        bots.append({"bot": bot, "named": bool(rules), "allows_public_pages": allowed})
        if not rules:
            add(findings, "info", "ai-bot", f"{bot} is not named; it falls through to User-agent: *")
        elif not allowed:
            add(findings, "warn", "ai-bot-blocked", f"{bot} is named and disallows the whole site")
    return {"status": status, "bots": bots, "findings": findings}


def check_ai_files(site: str, profile: dict) -> list[dict]:
    out = []
    name = profile["name"].lower()
    for path in profile.get("ai_files", []):
        status, body, _ = fetch(site.rstrip("/") + path)
        findings: list[dict] = []
        if status != 200:
            add(findings, "warn", "ai-file", f"{path} HTTP {status}")
        elif name not in body.lower():
            add(findings, "warn", "ai-file-name", f"{path} does not mention {profile['name']}")
        out.append({"path": path, "status": status, "bytes": len(body), "findings": findings})
    return out


def check_sitemap(site: str, profile: dict) -> dict:
    status, body, _ = fetch(site.rstrip("/") + "/sitemap.xml")
    findings: list[dict] = []
    if status != 200:
        add(findings, "fail", "sitemap", f"sitemap.xml HTTP {status}")
        return {"status": status, "findings": findings}
    locs = re.findall(r"<loc>\s*([^<]+)\s*</loc>", body)
    paths = set()
    for loc in locs:
        path = urllib.parse.urlparse(loc.strip()).path or "/"
        paths.add("/") if path == "/" else paths.add(path.rstrip("/"))
    missing = []
    for path in profile.get("sitemap_must_include", []):
        key = "/" if path in {"", "/"} else path.rstrip("/")
        if key not in paths:
            missing.append(path)
    if missing:
        add(findings, "fail", "sitemap-missing", "Missing from sitemap: " + ", ".join(missing))
    return {"status": status, "url_count": len(locs), "missing": missing, "findings": findings}


def result_links_ddg(html: str) -> list[str]:
    links = re.findall(r'class="result__a"[^>]*href="([^"]+)"', html)
    if not links:
        links = re.findall(r'href="(https://duckduckgo\.com/l/\?uddg=[^"]+)"', html)
    cleaned = []
    for href in links:
        href = urllib.parse.unquote(href.replace("&amp;", "&"))
        query = urllib.parse.urlparse(href).query
        target = urllib.parse.parse_qs(query).get("uddg", [href])[0]
        cleaned.append(urllib.parse.unquote(target))
    return cleaned


def result_links_bing(html: str) -> list[str]:
    return re.findall(r'<h2><a[^>]+href="(https?://[^"]+)"', html)


def host_of(url: str) -> str:
    host = urllib.parse.urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def organic_hosts(links: list[str]) -> list[str]:
    seen = []
    for link in links:
        h = host_of(link)
        if not h or h.endswith(("duckduckgo.com", "bing.com", "microsoft.com")):
            continue
        if h not in seen:
            seen.append(h)
        if len(seen) >= 10:
            break
    return seen


def position_of(links: list[str], host: str) -> int | None:
    for index, h in enumerate(organic_hosts(links), start=1):
        if h == host or h.endswith("." + host):
            return index
    return None


def check_search(profile: dict) -> list[dict]:
    host = urllib.parse.urlparse(profile["site"]).netloc
    host = host[4:] if host.startswith("www.") else host
    rows = []
    engines = [
        ("duckduckgo", "https://html.duckduckgo.com/html/?q=", result_links_ddg),
        ("bing", "https://www.bing.com/search?q=", result_links_bing),
    ]
    for query in profile.get("queries", []):
        for name, base, parser in engines:
            status, body, _ = fetch(base + urllib.parse.quote(query), ua=SEARCH_UA)
            links = parser(body) if status == 200 else []
            hosts = organic_hosts(links)
            pos = None
            for index, h in enumerate(hosts, start=1):
                if h == host or h.endswith("." + host):
                    pos = index
                    break
            note = "observed in this fetch"
            if status != 200:
                note = f"engine returned HTTP {status}; no rank recorded"
            elif not hosts:
                note = "engine returned no organic results; no rank recorded"
            elif pos is None:
                note = "domain was not in the first 10 organic hosts"
            rows.append({
                "engine": name,
                "query": query,
                "http": status,
                "position": pos,
                "note": note,
                "sample": hosts[:5],
            })
            time.sleep(0.4)
    return rows


def summarize(report: dict) -> str:
    fails = []
    warns = []

    def take(items: list[dict]) -> None:
        for item in items:
            line = f"{item['code']}: {item['detail']}"
            if item["level"] == "fail":
                fails.append(line)
            elif item["level"] == "warn":
                warns.append(line)

    for page in report["pages"]:
        take(page["findings"])
    take(report["robots"]["findings"])
    take(report["sitemap"]["findings"])
    for ai in report["ai_files"]:
        take(ai["findings"])
    lines = [
        f"# {report['profile']} presence check",
        f"Site: {report['site']}",
        f"Fails: {len(fails)}  Warnings: {len(warns)}",
        "",
    ]
    if fails:
        lines.append("## Fails")
        lines.extend(f"- {line}" for line in fails)
        lines.append("")
    if warns:
        lines.append("## Warnings")
        lines.extend(f"- {line}" for line in warns)
        lines.append("")
    lines.append("## Search observations")
    lines.append("These are DuckDuckGo and Bing results from this run. They are not a Google rank.")
    for row in report["search"]:
        if row["position"]:
            place = str(row["position"])
        elif "no rank recorded" in row["note"]:
            place = "no position"
        else:
            place = "not in the first 10"
        lines.append(f"- {row['engine']} / {row['query']}: {place}. {row['note']}")
    lines.append("")
    lines.append("## Pages")
    for page in report["pages"]:
        lines.append(f"- {page.get('status')} {page.get('url')} — {page.get('title', '')}")
    return "\n".join(lines) + "\n"


def run(profile_path: Path, out: Path | None) -> int:
    profile = json.loads(profile_path.read_text())
    report = {
        "profile": profile["id"],
        "site": profile["site"],
        "pages": [check_page(profile["site"], path, profile) for path in profile["pages"]],
        "robots": check_robots(profile["site"], profile),
        "sitemap": check_sitemap(profile["site"], profile),
        "ai_files": check_ai_files(profile["site"], profile),
        "search": check_search(profile),
    }
    text = summarize(report)
    sys.stdout.write(text)
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2))
        md = out.with_suffix(".md")
        md.write_text(text)
    fails = 0
    for page in report["pages"]:
        fails += sum(1 for item in page["findings"] if item["level"] == "fail")
    fails += sum(1 for item in report["robots"]["findings"] if item["level"] == "fail")
    fails += sum(1 for item in report["sitemap"]["findings"] if item["level"] == "fail")
    return 1 if fails else 0


def self_test() -> None:
    html = """<html><head><title>Digital Marketing Agency in Ludhiana | WordLord Media</title>
    <meta name="description" content="Ludhiana content house with strategy, reels, ads and websites from one in-house team.">
    <link rel="canonical" href="https://wordlordmedia.com/">
    <script type="application/ld+json">{"@type":["LocalBusiness","ProfessionalService"],"telephone":"+917973575656","address":{"streetAddress":"180 J Block, Sarabha Nagar","addressLocality":"Ludhiana"}}</script>
    </head><body><h1>WordLord Media</h1><p>180 J Block, Sarabha Nagar, Ludhiana. support@wordlordmedia.com +91 79735 75656</p>
    <a href="https://www.google.com/maps/dir/?api=1&destination=Sarabha%20Nagar">Directions</a></body></html>"""
    page = PageExtract()
    page.feed(html)
    assert "WordLord" in "".join(page.title_parts)
    assert business_nodes(page.ld)
    assert position_of(["https://example.com", "https://wordlordmedia.com/contact"], "wordlordmedia.com") == 2
    ddg = result_links_ddg('<a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fwordlordmedia.com%2F">x</a>')
    assert ddg == ["https://wordlordmedia.com/"]
    ddg_rel = result_links_ddg(
        '<a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwordlordmedia.com%2Fabout&amp;rut=abc">x</a>'
    )
    assert ddg_rel[0].startswith("https://wordlordmedia.com/about")
    groups = parse_robots("User-agent: GPTBot\nUser-agent: ClaudeBot\nAllow: /\nDisallow: /api/\n")
    assert groups["gptbot"] == ["allow:/", "disallow:/api/"]
    assert groups["claudebot"] == ["allow:/", "disallow:/api/"]
    assert not blocks_public_pages(groups["gptbot"])
    print("self-test ok")


def main() -> None:
    parser = argparse.ArgumentParser()
    here = Path(__file__).resolve().parents[1]
    parser.add_argument("--profile", type=Path, default=here / "profiles" / "wordlord-media.json")
    parser.add_argument("--out", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    sys.exit(run(args.profile, args.out))


if __name__ == "__main__":
    main()
