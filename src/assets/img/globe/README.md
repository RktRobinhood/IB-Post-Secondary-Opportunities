# Illustrated globe assets

The live globe paints pastel countries from the public-domain Natural Earth
geometry in `data/geo/countries.json` and `src/assets/geo/borders-50m.json`.
There are no photographic Earth textures or outside map tiles.

The four `poster-*.webp` files are transparent 600 × 700 stills for home and
`/countries/`, each with a light and saved-dark-theme version. They stand in
for the live globe while it loads, or when WebGL is unavailable. Regenerate
them from the current renderer with `scripts/make-globe-poster.mjs` when its
appearance or Europe-centred resting camera changes. See ADR 0005.

Natural Earth: <https://www.naturalearthdata.com/>. University and city
positions come from the site's place records.

## Close country view

Below the continental scale, the Discover World Window requests one same-site
country window from `src/assets/geo/detail-10m-v1/` after the camera rests. The
ordinary globe, picker, country layout, pin locations and initial downloads
are unchanged. It first shows the ordinary geography; if detail is unsupported
or unavailable, that remains usable. Coastlines and international borders
use Natural Earth Admin 0; the lakes overlay is from the same publisher.
These are generalised educational maps, not survey or territorial authorities.

Sources: [Natural Earth v5.1.2](https://github.com/nvkelso/natural-earth-vector/releases/tag/v5.1.2),
[Admin 0 countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/),
[physical lakes](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-lakes/), and
[public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/).
The regeneration script checks both input SHA-256 digests, clips overlapping
neighbouring polygons (including across the date line), preserves outer and
inner rings, and packs coordinates in delta integers of 0.0001°. A topology-
preserving 0.003° simplification occurs before clipping. The normal static
site serves these pre-generated files; no runtime external endpoint, GIS
tool, additional framework or initial download is needed. To update:
`/usr/bin/python3 scripts/make-globe-detail.py` (Python 3 with GDAL Python bindings).
Use `--countries` and `--lakes` to regenerate from local pinned inputs.
