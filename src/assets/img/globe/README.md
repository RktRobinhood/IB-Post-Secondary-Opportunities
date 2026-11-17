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
