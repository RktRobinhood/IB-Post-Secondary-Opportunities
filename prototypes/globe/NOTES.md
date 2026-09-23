# Globe prototype — working notes

## How to run it again

    node prototypes/globe/build.mjs        # regenerates index.html, data.json, measured.json
    # serve the repository root statically on any port, then open
    # /prototypes/globe/index.html

`build.mjs`, `globe.js`, `app.js`, `globe.css` and `template.html` are the
source. `index.html`, `data.json` and `measured.json` are generated and can be
deleted and rebuilt at any time. Nothing here is imported by `src/build.mjs` and
nothing reaches `dist/`.

The page carries its own instrument panel — an engine switch (globe / flat),
a forced reduced-motion toggle, a forced no-canvas toggle and a **Run the
bench** button that prints frame times, the one-off conversion cost, the
hemisphere cover and the startup marks. `?nocanvas` in the URL exercises the
no-canvas path from a cold load. `window.__proto` exposes `state`, `records`,
`globe`, `render()`, `runBench()` and `coverage()` for measuring from the
console.

Written as the work happened, per `docs/PARALLEL_WORK.md`. The conclusions live
in `docs/adr/0004-*`; this file is the audit trail behind them, kept so the
question can be reopened without redoing the measurements.

## Baseline: what the flat map already costs and does

Measured off `dist/` as built on 2026-09-23 (not rebuilt — another agent may be
building; `docs/PARALLEL_WORK.md` forbids a concurrent `node src/build.mjs`).

| Thing | Raw | Gzip |
|---|---|---|
| `/europe/` inline world-window SVG (whole `<svg>`) | 41,979 B | 12,684 B |
| — of which coastline `<path>`s | 27,629 B | 10,181 B |
| `/programmes/` inline world-window SVG | 21,701 B | 6,626 B |
| `assets/js/map.js` | 30,684 B | 10,052 B |

The decisive structural fact, found in `src/assets/js/map.js:268-310`:

    function render() {
      ...
      if (land) land.setAttribute('transform', t);

**The flat map's camera is one SVG `transform` attribute.** Panning and zooming
never reproject a single coastline vertex; the browser composites the existing
path geometry. Marker positions are baked at build time as `data-x`/`data-y`
attributes and moved by the same transform. The per-frame JavaScript cost of a
flat-map camera move is O(number of visible markers), not O(number of vertices).

An orthographic globe cannot do this. Rotation is not an affine transform of the
projected plane, so every coastline vertex must be reprojected on every frame.
That asymmetry is the thing to measure, and it is not an implementation detail
that a better implementation removes.

## Data available for the slice

- `data/geo/countries.json` — Natural Earth 110m, simplified to 0.22°, as
  `{ countries: [{ id, name, rings: [[lon,lat,lon,lat,...]] }] }`. Usable
  unchanged by an orthographic projection.
- `data/places/*.json` — 274 real Place records, worldwide, with
  `coordinates.{lat,lon}` and `coordinatePrecision`. These are the real records
  the slice uses; no fixtures.
- `data/destinations/*.json` — 15, with `region`, `scope`, `language`,
  `ibRecognition`.
- `data/opportunities/*.json` — 53, all `dk-*`. Too Denmark-shaped to be the
  slice's spread on its own, so the slice is built on Places grouped by
  Destination, with real Opportunity counts attached where they exist.

## What was built

`prototypes/globe/`, run with `node prototypes/globe/build.mjs` and served
statically. Not referenced by `src/build.mjs`, not in `dist/`, not shipped.

- **155 real Place records** across **15 real Destination records** and three
  regions (Europe 75, Asia-Pacific 54, North America 26). Geography is
  `data/geo/countries.json` unchanged. No fixtures anywhere.
- **Three filters** over real Destination fields — scope, EU/EEA tuition status,
  local-language requirement — updating map, count and list in one pass.
  (The research doc names field / language / IB fit. `field` does not exist on
  any current record and inventing it would have made the slice a fixture, so
  three real fields were used instead. The atomicity is what was being tested,
  not the wording of the questions.)
- **Semantic list is the state.** `render()` filters the records, paints the
  list, then hands the *same filtered array* to whichever engine is drawing.
  Neither engine can disagree with the list because neither engine filters.
- **Two engines in one page**: the hand-rolled orthographic canvas globe, and
  the shipped flat map's exact camera (`setAttribute('transform', …)`),
  so the two can be timed doing the same job.
- **Detail panel** resolves real Evidence records — publisher, source class,
  retrieved date, verification state.

## Measurements

Chrome, Windows desktop. Speed anchor for re-scaling: **5,000,000 `Math.sqrt`
in 15.5 ms**. A mid-range Android of the kind Lighthouse models is 4–6x slower
than this machine, so multiply the frame figures accordingly.

### Time and frames

| | |
|---|---|
| `domInteractive` | 28 ms |
| `domContentLoaded` | 41 ms |
| app module starts | 40 ms |
| `data.json` parsed | 64 ms |
| first globe frame | 81 ms |
| lon/lat to unit sphere, one-off | 1.50 ms (5,904 vertices) |
| globe: one full redraw, k=1 | **0.95–1.01 ms** |
| globe: one full redraw, k=2 | 0.75 ms |
| globe: one full redraw, k=4 | 0.45 ms |
| flat: one camera move | **0.004 ms** (one attribute) |

The globe's per-frame cost *falls* as it zooms in, because fewer rings survive
the visibility test. At a 6x phone multiplier the worst frame is ~6 ms against
a 16.7 ms budget: **the hand-rolled globe is fast enough, and compute is not
the argument against it.**

The flat map is 250x cheaper in main-thread JavaScript per camera move, but
that is not the interesting comparison — 1 ms a frame is affordable either way.
What matters is that the flat map's first useful render needs **no JavaScript at
all** (the coastline is in the HTML), while the globe's first frame needs the
module, a 26.6 KB fetch and a parse: 81 ms here, and the whole of that behind a
cold connection on a phone.

### Bytes

| | Raw | Gzip |
|---|---|---|
| Shipped `/europe/` inline flat SVG (Europe only) | 41,979 | **12,684** |
| Shipped `/programmes/` inline flat SVG | 21,701 | 6,626 |
| Prototype world-frame flat SVG (155 places, whole world) | 100,853 | 27,931 |
| Globe geometry (`data/geo/countries.json` verbatim) | 73,311 | **26,576** |
| `globe.js` | 13,779 | 5,082 |
| `app.js` | 17,780 | 6,176 |

A globe needs the **whole world** every time, because it can be rotated to any
of it. A flat map ships only the frame it shows: a Europe page carries 12.7 KB
gzip of coastline and never pays for the Pacific. So on the pages where most of
the site's traffic is, a globe roughly **triples** the geographic payload
(12.7 KB to 26.6 KB of geometry, plus 11.3 KB gzip of engine) and moves all of
it from "already in the HTML" to "a second request that must land before
anything is drawn".

Shipping precomputed x,y,z instead of lon,lat was measured and rejected: 38,189
gzip against 26,576, to save 1.5 ms once.

### Where a globe is worse, in numbers

**Panel area.** The stage measured 960x460 px. An orthographic disc that fits it
has area 146,846 px2 — **33.3% of the panel**. Two-thirds of a wide map panel is
thrown away. The flat map uses all of it.

**Scale, which is the same fact stated usefully.** Europe subtends 13.4 degrees
from its own centroid. On the globe at k=1 that is a **100 px** blob in a 460 px
panel. The flat map with a Europe frame gives Europe the **whole 460 px**. To
draw Europe as large as the flat map already draws it, the globe must zoom to
**k = 4.6**, at which point the disc is 1,989 px across in a 460 px panel: the
horizon is off-screen and **the globe is no longer visibly a globe.** That is
the finding the whole prototype turns on. The sphere is only legible as a sphere
at the zoom levels where the content is too small to compare.

**Occlusion.** Greedy hemisphere cover over the filtered set:

| Filter | Results | Globe camera positions to see them all | Best single position |
|---|---|---|---|
| Everything | 155 | **3** | 131 (85%) |
| Europe | 75 | **1** | 75 (100%) |
| Outside Europe | 80 | **3** | 56 (70%) |
| No tuition fee | 32 | **1** | 32 (100%) |

From the global centroid, 15 of 155 results are behind the planet and a further
11 are within 15 degrees of the limb, where they are edge-on and unreadable.

**Distortion is *not* the argument.** This was the expected finding and it did
not survive measurement. Across the 75 European places the worst radial
compression from the European centroid is **0.973** and the median is **0.997** —
under 3%, invisible. A globe centred on Europe does not distort Europe. Issue
#19's own worry ("a globe is worse than a flat map for comparing European
Destinations") is true, but not for the reason it gives: the cost is panel area
and a second request, not geometry.

### The same information, same panel, same job

Whole-world frame, 960x460 stage, the 75 European places:

| | On-screen extent of Europe |
|---|---|
| Flat map, world frame | 91 x 106 px |
| Globe, k=1, camera on Europe | **63 x 72 px** |
| Flat map framed on Europe, as `/europe/` ships today | 960 x 460 px |

The globe gives Europe **2.1x less pixel area** than a flat map of the same
scope in the same panel, and **15x less** than the framing the site already
ships. On a 375px phone the stage is 343 x 455 and the 75 European places
become a **47 x 53 px** blob — and the filters and the count fill the first
screen, so on a phone the globe is below the fold and paid for before it is
seen.

### Accessibility and degradation, tested

| | Result |
|---|---|
| No canvas (`?nocanvas`) | Falls back to the build-time flat SVG. Filters, count and list all still work: no-fee filter gives 32 list entries and 32 markers. Camera controls stay hidden. |
| Reduced motion (in-product `data-motion="reduced"`) | `flyTo` arrives in **5.1 ms** at exactly the target camera. No journey, same destination. |
| No JavaScript | The flat SVG and all 155 list entries are in the served HTML. Nothing is drawn by script on first paint. |
| Keyboard | 99 tab stops: skip link, 10 filter radios, the stage, 155 list buttons (hidden ones excluded). **No marker is focusable**, matching the shipped decision. |
| Touch targets | Everything at 44px except the skip link (216x24) — a prototype oversight, not a finding. |
| Scroll | `touch-action: pan-y` on the stage and no wheel handler: the page scrolls, the camera never does. |

**The keyboard defect that is specific to a globe.** Focusing a list entry
lights its marker. On a flat map every marker is either on screen or explicitly
declared "outside this frame" in the caption. On a globe a marker can be behind
the planet, and the highlight is then silently invisible. At the default camera,
**52 of 155 entries (34%)** highlight a marker nobody can see. Fixing it means
either flying the camera on every focus move — motion that explains nothing,
which the research doc forbids — or announcing "behind the globe", which is a
new concept the flat map never had to teach. Neither is free.

### What the hand-rolled orthographic version could *not* do

1. **Clip a filled polygon to the limb correctly.** `clipRing` in `globe.js`
   walks the limb arc the short way round, which is wrong for a ring that wraps
   more than half the disc. Measured over 72 camera positions: a mean of **2.6
   visible rings per frame** (worst frame **10**, at 0N 160W) fall back to
   outline-only, out of a mean 158.6 visible. Eurasia, Africa and Antarctica are
   the offenders. Doing it properly is d3-geo's clipping, and it is the one
   place in this prototype where a library would earn its bytes.
2. **Cluster and spiderfy.** `src/assets/js/map.js` already does both, in SVG,
   tied to marker radii. None of it survives the move to canvas: hit-testing,
   grouping and the spider layout would all have to be rewritten against a
   projection where a marker can vanish behind the planet mid-interaction. That
   is most of a 762-line file, rebuilt, to reach parity with what ships today.
3. **Scale with the page.** SVG is resolution-independent; a canvas is a raster
   that has to be redrawn on every resize and at every devicePixelRatio. At 200%
   browser zoom the flat map is simply larger; the canvas needs a redraw to stop
   being blurry, which it gets, but only because script is running.

Everything else it did do, and did cheaply: real geography, a real camera,
keyboard control, touch drag, reduced motion, and 0.45-1.01 ms a frame.

### The one thing the globe is honestly better at

Mercator's area exaggeration over the 155 real places, computed from their
latitudes: **6.71x** at Tromso (67.3N) against the equator, and **3.0x** across
Europe alone (Tromso against the southernmost European place at 48.1N). The
globe has none of that. It is a real fidelity gain — and it buys almost nothing
for the task, because a student compares Destinations by entry requirements,
fees and deadlines, never by area. Nobody has ever chosen Aalborg over Delft
because Norway looked the right size.

### Two runs of the startup marks, and why both are worth keeping

| | warm run | cold run |
|---|---|---|
| `domInteractive` | 28 ms | 138 ms |
| `domContentLoaded` | 41 ms | 304 ms |
| `data.json` fetched and parsed | 64 ms | **3,360 ms** |
| first globe frame | 81 ms | **3,389 ms** |

The cold run is a 269 KB uncompressed `data.json` off a naive local static
server on a OneDrive-backed working copy, so 3.4 s is not a number to quote as
a production figure. What it is, is the shape of the risk stated loudly: the
flat map's geography is *in the HTML* and is on screen at `domInteractive`
whatever else happens, while the globe's geography is a second request that can
be slow for reasons nothing on the page controls. Two runs of the same page
differ by a factor of forty on "when is there a map", and only one of the two
engines can vary at all.

## Test status

`npm test` was not run whole, because its last two steps are
`node src/build.mjs && node scripts/check.mjs` and another agent may be building
(`docs/PARALLEL_WORK.md`, "Two agents must not build at the same time"). Every
other step was run individually:

    test-no-control-chars  pass
    validate               pass (750 records across 9 collections)
    test-eligibility       pass (73 scenarios)
    test-probes            pass
    test-sourcing          FAIL - 16 evidence records in data/evidence/dk.json
                           and data/evidence/nl.json marked `verified` with no
                           `review.by`. Pre-existing and in data/, which this
                           pass did not touch; it belongs to whoever is working
                           there.
    test-credentials       pass
    test-map               pass
    test-images            pass

Nothing under `prototypes/` can affect any of them: no shipped file was modified.

## The decision this produced

`docs/adr/0004-the-world-window-stays-flat.md`. In one sentence: the flat window
stays, the globe does not ship, and the reason is that an orthographic disc
spends two thirds of the panel and a third of the keyboard's feedback to buy
area fidelity that comparing entry requirements never uses.

## Two places the prototype is weaker than the shipped site, on purpose

Neither affects the decision, and both would have to be fixed before any of this
became product, so they are written down rather than left to be rediscovered.

1. **The list entries are `<button>`, not `<a href>`.** The shipped
   `worldWindow` uses anchors, so with JavaScript off every place still links
   somewhere. Here the list renders and reads correctly without script but does
   nothing when clicked, because a detail panel with no page to link to needs a
   button. The 236 coastline paths and all 155 entries are in the served HTML
   either way, which is what the fallback claim rests on.
2. **No clustering or spiderfying on the globe.** `src/assets/js/map.js` has
   both and they are why the shipped map stays readable where Places pile up.
   The globe prototype draws every marker, so the Randstad and the Kanto plain
   are single dark blobs. Reaching parity is a canvas rewrite of most of a
   762-line file — counted as a cost in the ADR, not built.
