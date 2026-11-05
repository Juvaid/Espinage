#!/usr/bin/env python3
"""Validate a saved Instagram report inventory and summarize metric bases."""
import argparse
import json
import math
import sys
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

UNIQUE = {'reach', 'viewers', 'accounts engaged', 'meta accounts reached', 'accounts reached'}


def check(data, root):
    errors, warnings = [], []
    window = data['window']
    start, end = date.fromisoformat(window['start']), date.fromisoformat(window['end'])
    zone = ZoneInfo(window['timezone'])
    if start > end:
        errors.append('Window start is after end')
    capture = datetime.fromisoformat(data['captured_at'].replace('Z', '+00:00'))
    if capture.tzinfo is None:
        errors.append('captured_at needs a timezone offset')
    coverage = data.get('coverage', {})
    status = coverage.get('status')
    if status not in ('complete', 'partial'):
        errors.append('coverage.status must be complete or partial')
    if status == 'complete' and not all(coverage.get(k) is True for k in ('feed_boundary_verified', 'story_boundary_verified')):
        errors.append('Complete coverage requires both source boundaries verified')
    if status == 'partial' and not coverage.get('notes'):
        errors.append('Partial coverage needs notes explaining the gaps')
    for obj,key in ((coverage,'notes'),(data,'report_notes')):
        if key in obj and (not isinstance(obj[key],list) or not all(isinstance(v,str) for v in obj[key])):
            errors.append(f'{key} must be a list of strings')
    counts, seen, dates = Counter(), set(), []
    totals, unavailable = defaultdict(float), Counter()
    visuals = 0
    for n, item in enumerate(data['items'], 1):
        prefix = f'Item {n}'
        media_id = item.get('id')
        if not media_id or media_id in seen:
            errors.append(f'{prefix}: missing or duplicate id')
        seen.add(media_id)
        kind = item.get('type')
        if kind not in ('reel', 'post', 'carousel', 'story'):
            errors.append(f'{prefix}: invalid type')
        counts[kind] += 1
        published = date.fromisoformat(item['published_date'])
        dates.append(published)
        if not start <= published <= end:
            errors.append(f'{prefix}: publication outside window')
        if item.get('published_at'):
            exact = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
            if exact.tzinfo is None or exact.astimezone(zone).date() != published:
                errors.append(f'{prefix}: exact timestamp lacks timezone or disagrees with publication date')
        parsed = urlparse(item.get('source_url', ''))
        if parsed.scheme != 'https' or not parsed.netloc:
            errors.append(f'{prefix}: source_url must be an HTTPS URL')
        images = item.get('visuals', [])
        expected = item.get('expected_visual_count')
        if expected is not None and (not isinstance(expected, int) or isinstance(expected, bool) or expected < 1):
            errors.append(f'{prefix}: expected_visual_count must be positive or null')
        if (not images or (expected is not None and len(images) != expected)) and not item.get('missing_visual_note'):
            errors.append(f'{prefix}: missing visual or count mismatch without explanation')
        if expected is None:
            warnings.append(f'{prefix}: visual count not verified')
        if kind != 'carousel' and len(images)>1:
            errors.append(f'{prefix}: one cover, image or preview is required per non-carousel item')
        for key in ('native_notes',):
            if key in item and (not isinstance(item[key],list) or not all(isinstance(v,str) for v in item[key])):
                errors.append(f'{prefix}: {key} must be a list of strings')
        roles = {'reel': {'cover'}, 'post': {'post'}, 'carousel': {'slide'}, 'story': {'story'}}
        for image in images:
            path = Path(image['path'])
            path = path if path.is_absolute() else root / path
            if not path.is_file():
                errors.append(f'{prefix}: missing asset {path}')
            if image.get('role') not in roles.get(kind, set()):
                errors.append(f'{prefix}: visual role disagrees with content type')
            visuals += 1
        if item.get('promotion') not in ('present', 'not_observed', 'unknown'):
            errors.append(f'{prefix}: invalid promotion status')
        for metric, value in item.get('metrics', {}).items():
            if value is None:
                unavailable[metric] += 1
                continue
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0:
                errors.append(f'{prefix}: invalid value for {metric}')
                continue
            if metric.endswith('_pct') and value > 100:
                errors.append(f'{prefix}: percentage exceeds 100 for {metric}')
            basis = item.get('metric_basis', {}).get(metric)
            if not basis:
                errors.append(f'{prefix}: missing metric basis for {metric}')
                continue
            if metric.casefold().replace('_', ' ') not in UNIQUE and not metric.endswith('_pct'):
                totals[(metric, basis)] += value
    if dates != sorted(dates):
        errors.append('Catalogue is not in publication-date order across formats')
    if not data['items']:
        warnings.append('Empty inventory: verify the source window is actually empty')
    groups = [{'metric': k[0], 'basis': k[1], 'sum': int(v) if v.is_integer() else v} for k, v in sorted(totals.items())]
    return {'ok': not errors, 'account': data.get('account'), 'coverage': status, 'items': len(data['items']), 'by_type': dict(counts), 'visuals': visuals, 'metric_groups': groups, 'unavailable_fields': dict(unavailable), 'warnings': warnings, 'errors': errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('dataset', type=Path)
    args = parser.parse_args()
    try:
        result = check(json.loads(args.dataset.read_text()), args.dataset.resolve().parent)
    except (ValueError, KeyError, TypeError, OSError) as exc:
        result = {'ok': False, 'errors': [str(exc)]}
    print(json.dumps(result, indent=2))
    return 0 if result['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
