# Globe build — running log

Written as the work happens so it survives a dead session. Newest at the bottom
of each section.

## Brief (owner, 2026-09-24)

The flat map "drives me crazy": wants a rotating, zoomable, clickable 3D Earth,
pins, fly-to with zoom in/out through the clouds, no libraries. Overrules
ADR 0004. The list stays the accessible control surface; flat SVG stays first
paint and fallback; reduced motion = instant camera.

## Decisions

1. **Raw WebGL 1, hand-written.** One canvas per world window. A textured UV
   sphere, a cloud shell, a fullscreen backdrop pass (space, stars, atmosphere
   halo, cloud rush), GL_LINES for borders. WebGL 1 rather than 2 for the
   widest school-laptop support; nothing here needs 2.
2. **Textures vendored**: NASA Blue Marble NG (Dec 2004) day map 2048x1024 q85
   = 171 kB; NASA cloud_combined 1536x768 grey q60 = 177 kB. Total 348 kB.
   `scripts/make-globe-textures.mjs` remakes them. README beside them.
3. **Progressive**: `map.js` stays the entry point every page already loads.
   It checks WebGL is possible, waits until the figure is near the viewport,
   then `import()`s `globe.js` and fetches geometry + textures. The build-time
   SVG is on screen until the first globe frame, then cross-fades out (it stays
   in the DOM). If WebGL is missing or context creation fails, the old flat
   interaction layer (moved verbatim to `map-flat.js`) runs instead.
4. **Camera model**: target point on the sphere (lat, lon), altitude above the
   surface in Earth radii, pitch that grows as the camera comes down (so the
   horizon curves across the top of the frame at rest instead of a small disc
   in a wide box). North stays up.
5. **Country picking**: an equirectangular id raster (2D canvas, 1024x512)
   filled from `countries.json` at load. A click is a ray-sphere hit, then a
   pixel lookup. The selected country's mask is a second small canvas uploaded
   as a texture for the tint. No per-country code anywhere.
6. **Pins are DOM** in an `aria-hidden` overlay, not focusable, so the list is
   still the one control surface. Clusters by great-circle angle scaled to the
   zoom, so they are stable while spinning and split as you zoom.

7. **Textures changed month**: first vendored December 2004 — Scandinavia was
   under snow and read as cloud over the very places /programmes/ is about.
   Now July 2004 (record 74092): 140 kB. Clouds 1024x512 (power of two, so
   WebGL 1 can wrap and mipmap them for the drift): 103 kB. Total 243 kB.
8. **Finer borders, lazily**: `data/geo/countries.json` (110m at 0.22°) makes
   the Netherlands a pentagon at country zoom. `scripts/make-globe-borders.mjs`
   writes Natural Earth 50m at 0.05° to `src/assets/geo/borders-50m.json`
   (366 kB raw / 134 kB gzip), fetched the first time the camera goes below
   alt 0.9 and then used for lines, picking and masks. Same id rule as
   `make-basemap.mjs`.
9. **Rest framing**: a numeric fit against the real projection (binary search
   on altitude, then re-centre the places in the room under the horizon, three
   passes). Clamped to alt 0.42–1.4 at rest: never so close the texture is
   mush and the horizon is gone, never so far it is a small disc.
10. **Clustering**: screen-space for facing pins (a tilted camera squeezes
    north/south together — angular-only clustering overlapped on the first
    screenshot), angular for the far side; recomputed on zoom change or when
    the camera has travelled, so groups hold still under a spin.
11. **A single-country page outlines its country** at rest (all places share
    one `country`): derived, never named.
12. **Links**: the card's action is a real `<a>`, so site.js's new-tab rule
    covers it; the explorer cancels `world:select` and filters instead. The
    flat fallback's one scripted navigation uses `window.open(…, '_blank')`
    for off-site and detail pages, same rule.
13. **Touch**: `touch-action: pan-y` until a tap or sideways drag takes hold of
    the globe (then `none`); a mouse takes hold on press. Leaving the stage or
    pressing outside it lets go. Wheel zooms only when held, or with Ctrl/⌘.

14. **Motion token**: `geographic` (1400 ms, camera easing) is back in
    `src/lib/motion.mjs`, as that file's own note said it would be once
    something flew a camera. A flight is 0.65–2.1x the token by distance.
15. **Country cards**: a country with one place on the page (a page of
    countries) shows that place's photo and count; several places show the
    count and chips for each; none says "Nothing on this map here yet" and
    still links to the Destination page when one exists.

## Measurements

- CPU per frame (`draw()` incl. matrix build and every GL call): **0.15–0.33 ms**
  (headless Chrome + SwiftShader on the dev machine; a real GPU is faster).
  GPU work per frame: sky quad, sphere (25,600 triangles), lines (~29k
  segments once 50m is in), cloud shell, optional rush quad.
- The loop runs only while something moves (flight, inertia, idle spin, cloud
  drift throttled to ≤ 20 fps) and stops offscreen or in a hidden tab.
- Payload after first paint, only when the map is near the viewport:
  globe.js 69 kB raw / 22 kB gzip; map.js 3.7 kB (the loader, on every map
  page); map-flat.js 31 kB / 10 kB (static import; the fallback); textures
  243 kB; countries.json 80 kB / 29 kB gzip; destinations.json ~3 kB; and
  borders-50m.json 366 kB / 134 kB gzip only after the camera goes below 0.9.
- Screenshot harness: `docs/research/qa/globe/shoot.mjs` (headless Chrome via
  CDP; deterministic mid-flight frames via `debug.stepTo(fraction)`; real
  input events for the interaction checks). The desktop app's browser pane was
  unusable for scrolled shots (stale layers above the header) and does not
  run rAF while hidden — use the harness.
- Other agents rebuilt `dist/` repeatedly (sometimes with SITE_BASE, which the
  local server cannot serve). Round-0 was shot against a copy of a local
  build served on :4399 (`PREVIEW=http://localhost:4399`).

## Round 0 (docs/research/qa/globe/round-0/)

| Shot | What it shows |
|---|---|
| 01-programmes-rest | /programmes/ at rest: horizon across the top, DK + NL framed, 50m borders, groups |
| 02-dive-start | mid-flight at 30%: pulled out to a whole-hemisphere globe, atmosphere, stars |
| 03-dive-clouds, 04-dive-clouds-late | the dive through the cloud rush into the Netherlands |
| 05-country-card | arrived: the Netherlands tinted and outlined, its card with its places and link |
| 06-close-zoom-labels | close zoom on Denmark: every pin labelled, groups split |
| 07-pin-card | a place card with its photo, count, cue and action |
| 08-programmes-dark | dark site theme around the frame |
| 09-phone-first-screen, 10-phone-globe | 390 x 844: the whole map is in the first screen of /programmes/ |
| 11-europe | /europe/: the reference look — Iceland to Greece under a curved horizon |
| 12-world | /world/: a large, cropped, turning globe with labels |
| 13-destination-nl | a Destination page: its country outlined at rest |
| 14-flat-fallback | `?map=flat`: the flat map and its old interaction layer |
| 15-country-click | a real click on bare land (Sweden) → fly + country card with photo |
| 16-list-click-card | a real click on a list entry (Portugal) → fly + place card |

report.json: every page `"on"`, fallback `"off"`, reduced motion instant =
true, wheel on an untouched globe scrolls the page = true, Ctrl+wheel zooms =
true, drag spins = true, held wheel zooms without scrolling = true, country
click → card, list click → card and camera at Portugal, console empty.

## Test status

- `node scripts/test-map.mjs`: 25 guards pass (15 map, 10 new globe guards:
  first paint, progressive load, fallback paths, SVG hidden only once the
  globe is on, reduced motion, pausing + DPR cap, decorative pins, no country
  literals, texture budget, texture licence).
- `node scripts/test-controls.mjs`: passes after moving the pin hit-area to
  `var(--tap)` and the credit to `var(--type-floor)`.
- Full gate, PowerShell, `SITE_BASE=/IB-Post-Secondary-Opportunities`:
  every data check passes except `image-records` (the photo agent's
  in-flight replacements, not this work); build, check, page-budget and
  release pass. The first two runs failed on concurrent builds (ENOENT
  motion.css; EBUSY) — re-run, as PARALLEL_WORK.md says.

## Known gaps

- **Touch gestures are code-reviewed, not driven**: pinch, tap-to-take-hold and
  double-tap were not exercised with synthetic touch; the phone shots are
  static. Worth a hand test on a real phone.
- **Real-GPU frame rate on a school laptop not measured** — only CPU per frame.
- **Close zoom is soft**: the 2048 day texture (owner's budget) is magnified
  ~6-12x at the closest zoom; an unsharp pass and the 50m borders help. A 4096
  texture (~450 kB) would be the fix if the budget moves.
- **A single-country page rests further out** than its flat frame did (the
  rest camera keeps the horizon), so its institutions start as groups; a click
  splits them.
- **Behaviour change on /programmes/**: activating a list entry now flies to
  it and opens its card; filtering to the place is the card's action ("Show
  the N programmes here"), one click more than before.
- **Behaviour change on Destination pages**: map list entries now link to the
  institution's own website (new tab, like its card above) instead of `#map-…`.
- The 110m layer lacks microstates (e.g. Malta): until the 50m layer has
  loaded, clicking such a country finds nothing; its pin still works.

## Round 1 — critic 6/10 (docs/research/qa/globe/round-1/critique.md)

Coordinator decisions: raise the texture budget (4096 day map and/or a lazy
Europe detail texture, 2048 lightly compressed clouds; lazy-load the big
ones), real sharpening + anisotropic + mipmaps; Denmark from its existing
record; a pin-in-country test + fix Canada; longer flights climb through the
cloud deck; phone card/fly/release; software GL or low fps → flat.
Screenshots for this round go to round-1-fixes/.

Progress (newest last):
- R1.1a Denmark: `destinations.json` is now built from `site.destinations`
  with each href from `destinationFacet()` (canonical.mjs DESTINATION_HUBS),
  so Denmark → `/denmark/` from its record. 36 entries.
- R1.1c Canada: a country's light is now the medoid of its own places
  (`src/lib/geo.mjs representativePoint`), always inside the country. New
  guard in test-map: all 726 lights inside their 50m outline or within 30 km.
  One documented exception by place id: `hu-vienna-austria` (CEU, Hungary-
  accredited, campus in Vienna) — true data; a `country` field on Place would
  let the record say so itself (data agent's call).
- R1.2 textures: day map now made from the 21600x10800 July master. First
  load: earth-day 2048 (135 kB) + earth-clouds 2048 q82, 0.6 px pre-blur
  (302 kB). Lazy: earth-day-4096 (357 kB, idle after first frame) and
  earth-detail-europe 4096x2048 over lon −25…45 / lat 34…72 (443 kB, ~57 px
  per degree, first approach below alt 0.9; region in detail.json). Shader:
  real 4-tap unsharp (±1 texel; the LOD-bias version was a no-op), detail
  blended in its rectangle with a soft edge and no branchy fetches;
  anisotropic filtering up to 8x on mipmapped textures. MIN_ALT 0.045→0.06.
  Clouds smoothstep (0.18,0.85)→(0.1,0.95) in both cloud shaders.
- R1.3 cards close themselves when their subject leaves the view (off-stage,
  behind the planet, or zoomed out past 2.5x the arrival altitude).
- R1.1b groups: "crowd" only when the group's diameter fits in one pin at
  MIN_ALT; otherwise dive to split. Copy: "Too close together to separate on
  the map." Groups hold still during a flight.
- R1.4/10 phone: card photo is a 5.5rem strip; goToPlace/goToCountry/crowd
  flights land the subject in the room above a bottom card (frameAbove); a
  touch hold lets go 4 s after the last gesture, hint "Tap outside the globe
  to scroll the page" once.
- R1.5 /world/: when a page's places cannot all fit at rest, worldRest()
  scores lat −10…30 × lon × alt 1.8/2.1/2.4 by count-weighted visible places.
  Idle spin 2.4→6°/s for whole-world views.
- R1.7 journeys (list/pin/country/Reset) of > 500 km, or starting from the
  rest view, climb to ≥ 1.05 (or 2.4x the target) so the descent crosses the
  cloud deck: /programmes/ DK→NL now dives through clouds.
- R1.8 list click scrolls the stage below the masthead explicitly
  (scroll-padding-top).
- R1.9 software GL → flat: failIfMajorPerformanceCaveat + renderer string
  (SwiftShader/llvmpipe/Basic Render); frame watch drops DPR to 1 at p50 >
  25 ms and hands over to flat at p50 > 40 ms. `?map=globe` forces the globe.
- R1.11 borders-50m and the 4096 day map prefetched in requestIdleCallback
  after the first frame (no dive hitch); labels avoid the buttons and the
  card; single-country pages rest down to alt 0.2 (0.6x on a phone).
- Tests: texture budget guard rewritten (first load ≤2048, <500 kB; lazy
  ≤4096, <600 kB each, must be lazy); fallback guard checks the software
  refusal and the frame-rate handover. All map guards pass.
- R1 constraint change (coordinator): libraries allowed. Close zoom now hands
  off to **MapLibre GL JS 5.24.0**, vendored in src/assets/vendor/maplibre-gl
  (1.06 MB / 277 kB gzip, BSD-3, SHA-256 in its README), loaded by
  `globe-close.js` only on intent: taking hold of the globe, hovering a list
  entry that can dive, or the camera below alt 0.3. Tiles: EOxCloudless 2024
  Sentinel-2 satellite (non-commercial use with attribution — this site is a
  free school guide) fading into the OpenFreeMap "liberty" street map (OSM,
  no key). Handoff below alt 0.12, handback above 0.16 (hysteresis). Globe
  FOV changed 34°→36.87° to equal MapLibre's; lens shift → MapLibre top
  padding; zoom from metres-per-pixel at the centre, calibrated on the map
  itself (MapLibre's globe scales like Mercator at the latitude). **Measured
  seam: 1.4 px** worst over facing places after fixing one bug — MapLibre's
  CSS `.maplibregl-map{position:relative}` collapsed the map to 300 px (seam
  was 146 px). Place dives: campus/institution → zoom 15, city → 11.5, region
  → stays on the globe. A dive that arrives before the map has loaded waits
  ("Loading the close-up map…") and carries on. Probe: TU Delft from the NL
  page — globe flight 1.4 s, map ready ~3 s (tiles cold), street level at
  ~5.6 s; zoom-out buttons hand back at zoom 5.38.
- `DIST_DIR` env override added to src/build.mjs so an agent can build to
  its own folder (others kept wiping dist/ mid-copy).
- `institution` coordinate precision no longer gets the "placed at the city"
  cue (schema: it locates the institution; finer than city).
- LIVE BUG (2026-09-25): the committed mid-edit globe.js declared `vec2 d`
  beside `float d` in EARTH_FS → every browser refused the shader → flat
  map. Current source uses du/de/dw. New guard in test-map ("every shader in
  globe.js reads as one that compiles"): extracts all 8 GLSL strings and
  checks duplicate declarations per scope (params included), balanced braces
  and parens, a main() in each. Verified it FAILS on the live bug
  ("EARTH_FS: 'd' declared twice in one scope") and passes now.
- Debug `pause()` now sets its own `paused` flag; it used to reuse `dead`,
  which made a close map arriving during a paused QA frame destroy itself.
- Gate (PowerShell, SITE_BASE=/IB-Post-Secondary-Opportunities): all 30
  checks pass (freshness advisory only). test-map: 31 guards pass.
- Production-base build served at /IB-Post-Secondary-Opportunities/ in
  headless Chrome (real GPU): globe "on" on /programmes/, /europe/, /world/,
  /destinations/nl/; close map hands off and dives to zoom 14.7; console empty.

### Round-1-fixes shots (docs/research/qa/globe/round-1-fixes/, report.json)

01 programmes rest · 02 europe rest · 03 world rest · 04 NL page rest (NL
outlined, alt 0.2) · 05–07 /programmes/ → Delft: climb, cloud rush, late
dive · 08 Delft at street level in the close map · 09 the Denmark "12" group
clicked → dives into the close map, split · 10 /europe/ Denmark card →
"Open the Denmark page" (/denmark/) · 11 TU Delft street level from the NL
page · 12 zoomed back out → globe again · 13 list click (Maastricht): stage
top 88 px, card title below the masthead · 14 europe dark · 15/16 phone rest ·
17 phone card (title + action visible, pin above the card; hold released
after 4 s) · 18 flat fallback. Report: seam 1.4 px, reduced motion instant,
wheel-over-untouched scrolls the page, drag spins, console empty.

### Left after this stop (round-1 list)

- Run the software-GL check for real (`--use-angle=swiftshader`) and confirm
  the flat map takes over (code + guard done, not yet exercised).
- /world/ rest: 7 of 10 destinations at rest (au jp ae hk sg cn kr); NZ fell
  out with the last grid change (alt 1.9 lat −5); US/Canada come round on
  the 6°/s spin. Worth one more framing pass.
- Phone card still scrolls internally a little (title + action visible).
- Fresh critic round on round-1-fixes/.
