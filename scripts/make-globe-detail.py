#!/usr/bin/env python3
"""Rebuild the on-demand country-detail windows from pinned Natural Earth 1:10m.

Run with Python 3 + GDAL Python bindings (e.g. /usr/bin/python3 on Debian).
Pass local input files to regenerate without network; content hashes are verified.
The normal static-site build does not run this script or need GDAL.
"""
import argparse
import gzip
import hashlib
import json
import math
import re
import urllib.request
from pathlib import Path

from osgeo import ogr

ROOT = Path(__file__).resolve().parents[1]
RELEASE = 'v5.1.2'
MIRROR = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{RELEASE}/geojson/'
SOURCES = {
    'land': ('ne_10m_admin_0_countries.geojson', '239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255'),
    'water': ('ne_10m_lakes.geojson', '2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9'),
}
OUT = ROOT / 'src/assets/geo/detail-10m-v1'
SIMPLIFY_DEGREES = .003
LAND_AREA = .00012
LAKE_AREA = .002
MAX_GZIP = 215 * 1024
MAX_RAW = 620 * 1024
ogr.UseExceptions()


def source(kind, given):
    name, digest = SOURCES[kind]
    if given:
        data = given.read_bytes()
    else:
        with urllib.request.urlopen(MIRROR + name, timeout=60) as resp:
            data = resp.read()
    if hashlib.sha256(data).hexdigest() != digest:
        raise ValueError(f'{name} does not match the pinned {RELEASE} digest')
    return json.loads(data)['features']


def polygons(g):
    if not g or g.IsEmpty():
        return
    kind = g.GetGeometryName()
    if kind == 'POLYGON':
        yield g
    elif kind in ('MULTIPOLYGON', 'GEOMETRYCOLLECTION'):
        for i in range(g.GetGeometryCount()):
            yield from polygons(g.GetGeometryRef(i))


def area(poly):
    _, _, south, north = poly.GetEnvelope()
    return poly.GetArea() * math.cos(math.radians((south + north) / 2))


def rectangle(w, s, e, n):
    return ogr.CreateGeometryFromWkt(f'POLYGON (({w} {s},{e} {s},{e} {n},{w} {n},{w} {s}))')


def records(features, water=False):
    for f in features:
        if not f.get('geometry'):
            continue
        g = ogr.CreateGeometryFromJson(json.dumps(f['geometry'], separators=(',', ':')))
        props = f['properties']
        code = next((str(props.get(k, '')).lower() for k in ('ISO_A2_EH', 'ISO_A2')
                     if re.fullmatch('[a-z]{2}', str(props.get(k, '')).lower())), None)
        if not code:
            code = str(props.get('ADM0_A3', '~')).lower()
            code = {'sds': 'ss', 'kos': 'xk', 'psx': 'ps', 'sol': 'xs'}.get(code, '~' + code)
        cutoff = LAKE_AREA if water else LAND_AREA
        for poly in polygons(g):
            if area(poly) < cutoff:
                continue
            # Per-polygon repairs keep intersection robust for complex coastlines.
            for part in polygons(poly.SimplifyPreserveTopology(SIMPLIFY_DEGREES)):
                clean = part if part.IsValid() else part.MakeValid()
                for p in polygons(clean):
                    yield code, p.Clone(), p.GetEnvelope()


def rings(poly, dx):
    result = []
    for i in range(poly.GetGeometryCount()):
        ring = poly.GetGeometryRef(i)
        vertex = []
        for j in range(ring.GetPointCount() - 1):
            x, y, *_ = ring.GetPoint(j)
            q = (round((x + dx) * 10_000), round(y * 10_000))
            if not vertex or q != vertex[-1]:
                vertex.append(q)
        if len(set(vertex)) < 3:
            if i == 0:
                return []
            continue
        packed = list(vertex[0])
        for (ax, ay), (bx, by) in zip(vertex, vertex[1:]):
            packed.extend((bx - ax, by - ay))
        result.append(packed)
    return result


def prepare_window(bounds, candidates, is_water=False):
    w, s, e, n = bounds
    grouped = {}
    for dx in (-360, 0, 360):
        a, b = max(-180, w - dx), min(180, e - dx)
        if a >= b:
            continue
        clip = rectangle(a, s, b, n)
        for code, p, (pw, pe, ps, pn) in candidates:
            if pe <= a or pw >= b or pn <= s or ps >= n:
                continue
            geometry = p if a <= pw <= pe <= b and s <= ps <= pn <= n else p.Intersection(clip)
            for q in polygons(geometry):
                if area(q) >= (LAKE_AREA if is_water else LAND_AREA) * .2 and (packed := rings(q, dx)):
                    grouped.setdefault(code, []).append(packed)
    if is_water:
        return [poly for items in grouped.values() for poly in items]
    return [[code, value] for code, value in sorted(grouped.items())]


def main():
    arg = argparse.ArgumentParser(description=__doc__)
    arg.add_argument('--countries', type=Path, help='local pinned admin-0 GeoJSON')
    arg.add_argument('--lakes', type=Path, help='local pinned lakes GeoJSON')
    args = arg.parse_args()
    land = list(records(source('land', args.countries)))
    water = list(records(source('water', args.lakes), True))
    # Use the largest local extent of each destination, so distant overseas
    # territory does not become the centre of its teaching map. Date-line
    # slivers are stitched in longitude when each regional window is clipped.
    mainlands = {}
    for code, p, box in land:
        if code not in mainlands or area(p) > mainlands[code][0]:
            mainlands[code] = area(p), p.Centroid()
    codes = [p.stem for p in sorted((ROOT / 'data/countries').glob('??.json'))]
    missing = sorted(set(codes) - mainlands.keys())
    if missing:
        raise ValueError(f'no matching country geometry for {missing}')
    OUT.mkdir(parents=True, exist_ok=True)
    stat = []
    for code in codes:
        point = mainlands[code][1]
        x = point.GetX()
        y = point.GetY()
        lon_span = min(40, max(16, 13 / math.cos(math.radians(y))))
        bounds = [round(x - lon_span, 4), round(max(-89.9, y - 12), 4),
                  round(x + lon_span, 4), round(min(89.9, y + 12), 4)]
        info = {'v': 1, 'country': code, 'bounds': bounds,
                'land': prepare_window(bounds, land), 'lakes': prepare_window(bounds, water, True)}
        if code not in (c for c, _ in info['land']):
            raise ValueError(f'{code}: own outline missing from window')
        body = (json.dumps(info, separators=(',', ':'), allow_nan=False) + '\n').encode()
        size = len(gzip.compress(body, mtime=0))
        if size > MAX_GZIP or len(body) > MAX_RAW:
            raise ValueError(f'{code} exceeds budget: {len(body)} raw, {size} gzipped bytes')
        (OUT / f'{code}.json').write_bytes(body)
        stat.append((size, code, len(body)))
    for p in OUT.glob('??.json'):
        if p.stem not in codes:
            p.unlink()
    print(f'{len(stat)} destination windows; {sum(r for _, _, r in stat):,} bytes static total; '
          f'largest individual {max(stat)} (gzip bytes, country, raw bytes)')


if __name__ == '__main__':
    main()
