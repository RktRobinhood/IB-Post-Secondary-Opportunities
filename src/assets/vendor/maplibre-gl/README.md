# MapLibre GL JS 5.24.0 (vendored)

The close-zoom half of the globe (ADR 0005, round 1): below the altitude where
the hand-written globe's textures run out, `assets/js/globe.js` hands the
camera to MapLibre, which draws satellite imagery and a street map down to
campus level, and takes it back when the reader zooms out.

Vendored rather than installed, so the build stays dependency-free (no npm in
CI), and rather than hot-linked, so a school network that blocks a CDN still
gets the map. Loaded with a `<script>` tag injected by `globe.js` the first
time the camera comes close — never on first paint.

| File | Source | SHA-256 |
|---|---|---|
| `maplibre-gl.js` | <https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js> | `45a9b07a9189ce56054c620a947ccf41e291e58c95e9b61533b740aaa65ee5cb` |
| `maplibre-gl.css` | <https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css> | `ab1e70d59ec40465bae7e7030da2f3ccf28133fd502e62bd598eefbadfd7a732` |
| `LICENSE.txt` | <https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/LICENSE.txt> | — |

Licence: BSD 3-Clause (MapLibre contributors), plus the notices for the parts
of Mapbox GL JS it derives from — both in `LICENSE.txt`.

~1.06 MB raw, ~277 kB gzip. To upgrade: download the three files for the new
version, update this table and the version constant in `globe.js`, and check
the handoff still lines up (`docs/research/qa/globe/shoot.mjs`).

## The tiles it draws (no keys, recorded here and on /credits/)

- **Street map:** [OpenFreeMap](https://openfreemap.org/) "liberty" style,
  `https://tiles.openfreemap.org/styles/liberty`. Free, no key, no limits,
  commercial and non-commercial use. Data © OpenStreetMap contributors (ODbL),
  schema © OpenMapTiles. Attribution: "OpenFreeMap © OpenMapTiles Data from
  OpenStreetMap" (MapLibre shows the sources' own attribution in the map).
- **Satellite:** [EOxCloudless](https://cloudless.eox.at/) Sentinel-2
  cloudless 2024, `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg`.
  EOX's licence page: non-commercial use is unrestricted with attribution;
  commercial use needs a licence from EOX. This site is a free, non-commercial
  school guide. Attribution, shown in the map: "EOxCloudless 2024 by EOX IT
  Services GmbH (Contains modified Copernicus Sentinel data 2024)". If the site
  ever becomes commercial, this layer must be licensed or removed.
