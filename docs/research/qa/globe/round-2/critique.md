# Globe: round 2 critique (art director and motion critic)

**SCORE: 7 / 10.**

Round 1 asked for a close zoom that rewards zooming into universities. This round delivers it. The owner's sentence now happens on the live site: from a whole Earth, through a cloud deck, down to a campus with 3D buildings and a pin on the right faculty (`s2b-nl-delft-sheet.jpg`, `s5-dark-leiden-street.png`). Region-level Sentinel imagery is the best-looking thing on the site (`s3b-europe-wheeled.png`). Every false statement from round 1 is gone. The phone card works, clouds now appear on /programmes/, the software-GL machine gets the flat map, and reduced motion is instant everywhere.

It is not an 8 yet, because the dive is not one continuous dive. It is two engines, and a student sees the join:

- A **freeze at the bottom of the globe leg.** It lasts 1.2 s when the map is warm and about 4.5 s cold, with a "Loading the close-up map…" hint and long tasks of up to 1.5 s.
- Then **2–3 s of grey-green mush** while MapLibre flies into tiles it has not loaded yet.
- Around that are several interaction bugs that feel broken rather than unpolished:
  - the page scrolls away under a wheel that is zooming the close map;
  - a card closes itself the moment it opens;
  - Reset jumps from street level straight to orbit;
  - a group click bounces back out;
  - a phone Destination page rests on a road atlas that is 19% covered by its credit box.
- The close map also costs a lot of bytes before anyone asks for it.

Each fix below is concrete, and fixes 1 to 4 are each a few hours. With them this ships.

**How I judged it.** I drove the **live** site (https://rktrobinhood.github.io/IB-Post-Secondary-Opportunities/). Its `globe.js`, `globe-close.js` and `map.js` are byte-identical to the working tree. I used headless Chrome over CDP on the real GPU (ANGLE D3D11, AMD RX 580), with real mouse, wheel and touch events. The scripts are in this folder: `cdp.mjs` and `rec.mjs` (a real-time screencast plus a page-side camera sampler, rAF gaps, long tasks and bytes per request), and `s1`…`s6-*.mjs`, with JSON beside each. Contact sheets (`*-sheet.jpg`) are real-time frames, and each label is seconds after the click. I used a fresh browser profile per script, so tile and library bytes are cold, as a first-time student would see them.

## Round-1 top fixes: status

| # | Round-1 fix | Live now |
|---|---|---|
| 1 | Three false statements | **Fixed.** Clicking Denmark on /europe/ gives "Open the Denmark page → /denmark/" (`s6-europe-denmark-click.png`). No card says "share a spot". Every visible pin on 5 pages sits within 40 km of its own lat/lon when picked back off the globe (`s1-rest.json`). The one outlier is NZ at 61 km, on the limb. |
| 2 | Close zoom | **Fixed by a new engine** (MapLibre handoff). The seam at the handoff is 1.4 px, which is excellent. The globe's own texture below alt 0.1 is still mush (`s3b-europe-wheel-in-sheet.jpg`, 1.62 s), and a reader now sees exactly that while the handoff waits. |
| 3 | Stale cards | **Fixed, and now over-eager.** See bug B. |
| 4 | Phone card | **Fixed.** Title, action and pin all show above the card at street level (`s4y-phone-nl-after-tap.png`). |
| 5 | /world/ rest | **Mostly fixed.** 7 of 10 destinations show at rest, all labelled (`s1-rest_world_.png`). Canada (the top entry, 20) and the US still show only on the turn. |
| 6 | Blocky clouds | **Fixed.** Soft and clean at /world/ and /europe/ rest. |
| 7 | Clouds in /programmes/ flights | **Fixed.** Delft from rest climbs to a whole Earth and dives through a real cloud sheet at about 1.1 s (`s2f-programmes-delft-sheet.jpg`). |
| 8 | List click scroll | **Fixed.** The stage top is at 104 px, below the masthead. |
| 9 | Software GL → flat | **Fixed.** With `--use-angle=swiftshader`, /europe/ gets `data-globe="off"`. The reason recorded is the generic "the globe could not start", not "software renderer". |
| 10 | Phone hold | **Fixed.** A swipe up on an untouched globe scrolls 235 px. The hold releases after 4 s. |
| 11 | Small ones | **Fixed.** No dive hitch from borders-50m, and labels avoid the buttons. /destinations/nl/ rests at 0.2 (see below). |

## The dive, frame by frame

**/destinations/nl/ → TU Delft (close map already warm), `s2b-nl-delft-sheet.jpg`:**

| Time | What the student sees |
|---|---|
| 0.2 s | The card opens. Good. |
| 0.7 s | The camera climbs to a whole Earth. It is a detour for a 50 km trip, but a joyful one. |
| 1.1 s | The cloud deck. |
| 1.4 s | Arrives over the Netherlands on the globe. |
| 1.4–2.6 s | **Nothing moves**: `handOff()` awaits `close.settled(1500)`. |
| 2.76 s | MapLibre appears. The palette jumps from the muted Blue Marble to bright Sentinel imagery with a yellow road network and labels on top. |
| 3.3–5.0 s | Grey-green blur with a few sharp tiles pasted in. |
| 5.3 s | Street level, which is lovely. |

**/destinations/us/ → Michigan, cold, `s2a-us-michigan-cold-sheet.jpg`:** the globe arrives at about 1.5 s. The screencast then emits **no new frame from 1.47 s to 6.75 s**: 5.3 s frozen, with "Loading the close-up map…" for 1.6 s and main-thread long tasks of 802, 622, 524 and 450 ms. Then 2 s of mush (7.5–8.3 s), and street level at 8.7 s. A 16-year-old will have clicked something else by then.

**/programmes/ → Delft, `s2f-programmes-delft-sheet.jpg`:** the cloud dive is the best 1.5 s on the site. Then it waits (handoff at 4.6 s) through a **1,505 ms long task** at 6.0 s. Frame p95 across the recording is 184 ms and p99 is 1,068 ms.

**Delft → Aarhus while at street level, `s2g-programmes-delft-to-aarhus-sheet.jpg`:** this is the worst sequence on the site. MapLibre flies alone, with no globe and no clouds. The frames show a flat vector atlas with a band of satellite across the bottom (0.71 s), then **blank cream frames** (0.90–1.10 s), then a white trapezoid of missing tiles (1.29 s), then 1 s of blur. The card is gone, and the camera ends at **street zoom on a city-precision pin** beside a kindergarten (`s2g-programmes-aarhus-arrived.png`).

**Reset from street level, `s2c-nl-reset-from-street-sheet.jpg`:** at 0.22 s the street map is double-exposed over the globe at alt 0.06. That is a jump of more than two orders of magnitude in one frame (the sampler shows alt 0.0002 → 0.06 in about 100 ms). The climb out through the clouds after that is lovely.

**Wheel out from street level, `s2d-nl-wheel-out-sheet.jpg`:** the zoom-out passes through cream blank areas and blue water polygons with no satellite under them (2.7–4.2 s). Then **the page scrolls away** (5.1 s, footer), because of bug A.

In short: space → clouds → region is one continuous camera and it feels like holding a world. Region → campus is a handoff you can see, a pause, and a blur. The owner's "zooming into universities" is there, but the in-between is not yet the "whole world in your hand" feeling.

## Bugs found (all reproduced with real input)

**A. Scroll hijack in reverse: zooming the close map scrolls the page.** In `globe.js`, the stage `wheel` handler returns early when `closeActive` without `preventDefault()`. That relies on MapLibre's own listener, but pins, labels and the card sit above the MapLibre canvas. So a wheel over a pin bubbles to the stage and the page scrolls. Zooming out around the cursor pulls the pin *towards* the cursor, so it happens in every long wheel-out. Measured: 3 wheel ticks over the TU Delft pin moved the page 120 px and the map zoom by 0.36 (`s3-play.json` `wheelOverPinInClose`). In `s2d` the stage leaves the screen entirely. Once the pointer is off the stage, `pointerleave` disengages, so the reader loses the map mid-gesture.

**B. A card closes itself as soon as it opens, on any close-map flight to somewhere off-screen.** `goToPlace()` → `placeCard()` → `closeFlyTo()`. On the next `layoutPins()`, `cardStillAbout()` finds the subject off-stage and calls `closeCard()`. Measured: Delft → Aarhus had `card: null` from 0 ms onwards (`farPlaceInClose`). The same happened on the phone for a direct `goToPlace` (`s4x-phone-nl-tap.json`, `direct`).

**C. A city-precision place is dived to street level.** In `goToPlace()`, `zoom: Math.max(close.map.getZoom(), zoom)` keeps zoom 15 when you arrive from a campus. So "Aarhus" (precision `city`, 6 programmes across several institutions) lands on one residential street.

**D. A group click on the close-map path bounces back out.** In `openGroup()`, `fitClose()` fits *all* members with 60 px padding (top `-shift*H+40`). For Denmark's group that lands at about zoom 5.1, which is above `HANDBACK_ALT`, so the zoom listener hands straight back to the globe.
- **Desktop:** the "12" ends at alt 0.18 with "2" and "4" still grouped, and Denmark small at the bottom of a frame of Norway (`s6-programmes-group-split.png`).
- **Phone:** the "13" hands to MapLibre, then back, and ends at alt 0.36 still showing **"13"**. That is further out than where the student started (`s4e-phone-programmes-group-sheet.jpg`).

**E. On a phone, /destinations/nl/ rests in MapLibre, not on the globe.** The home rest is 0.2 × 0.6 = **0.12 = `HANDOFF_ALT`**, so the loop hands off at rest (`s4y-phone-nl-rest-close.png`). What the student gets is:
- a road atlas, not a globe;
- "Netherlands" hidden under the "9" group and "Denmark" under RESET;
- MapLibre's compact attribution starting **expanded**, covering **19%** of the stage;
- the ⓘ toggle drawn **four times**, because the site's 44 px tap-target rule sizes `.maplibregl-ctrl-attrib-button` to 44 × 44 and its 24 px background image repeats (`background-repeat: repeat`, `s4z-attrib.mjs`).

**F. Reset from street level pops** (see above): `goHome()` calls `handBack()` first, and the globe starts its flight at whatever altitude MapLibre left.

**G. The first wheel-in to the handoff freezes.** On /europe/, wheeling down over Asia created the close map mid-gesture. Long tasks of 465, 344 and 957 ms, then a blocky globe for about 2 s (`s3b-europe-wheel-in-sheet.jpg`), then beautiful imagery.

**H. Console:** no errors. Two kinds of noise came from the vendored library: about 115 "READ-usage buffer … written again before being read back" GPU performance warnings (from `maplibre-gl.js`), and "Expected value to be of type number, but found null" style-expression warnings from the liberty style.

## Correctness that holds

- **Pins match the lists:** on /programmes/, /europe/, /world/, /destinations/nl/ and /destinations/us/, every list entry has a pin and every pin has an entry. Counts sum to the list (73, 311, 144, 15, 14).
- **Links:** the card's "Visit their website" opened **a new tab**, and the page stayed put (`s5-misc.json`). A list click on a Destination page flies and does not navigate.
- **Reduced motion:** a list click lands on Greece within 120 ms. On a campus it goes straight to the close map at about 0.9 s (the settle wait). No idle, no rush.
- **Dark theme:** the frame and card are correct. The street map stays light inside a dark page (`s5-dark-leiden-street.png`), which is acceptable. A dark street style would be nicer, but it is not on the critical path.
- **`?map=flat`:** off, and the flat map works (`s5-flat.png`).

## Performance

| Measure (RX 580, D3D11) | Value |
|---|---|
| Idle spin, all pages, p50 / p95 | 16.7 / 16.8 ms, `draw()` 0.3–0.6 ms |
| Drag and fling (/europe/), p95 | 16.8 ms. A 390 px flick turns about 78°. |
| Globe → clouds → globe arrival | 16.7 ms steady |
| **Handoff to MapLibre** | Long tasks of **1,505 ms** (/programmes/), **802 / 622 / 524 ms** (US cold), 957 ms (first wheel-in) |
| Inside MapLibre once loaded | 16.7 ms p50, occasional 70–170 ms tasks |

| Bytes (cold, encoded) | Value |
|---|---|
| /programmes/ at rest, no interaction | **1.46 MB of globe assets**: Europe detail 444, 4096 day 357, clouds 302, 50m borders 136, day 135, … (kB). Rest alt 0.42 < `FINE_ALT`, and the idle prefetch runs on every visit. ADR 0005 says "about 540 kB for the first globe frame", which is true of the frame and not of the visit. |
| **/destinations/nl/ at rest, no interaction** | **+4.4 MB**: MapLibre 283 kB, OpenFreeMap vector tiles 2.4 MB, glyph PBFs 1.1 MB, satellite 0.5 MB. Rest alt 0.2 < `CLOSE_PRELOAD_ALT` 0.3, so `ensureClose()` runs on load. The page total is 9.1 MB. |
| One dive to a US campus, cold | **10.5 MB** (8.4 MB vector tiles, 1.6 MB satellite) |
| /programmes/ → Delft | 4.8 MB |
| NL → TU Delft (map warm) | 0.7 MB. Wheel out from street: 1.4 MB. |

On a school network or a phone plan, 10 MB for one click is the real cost of this round, and most of it is vector tiles for zooms 5–11, where the student is looking at satellite anyway. (Separately, and not the globe: /europe/'s destination tiles load about 25 × 250–290 kB `img/places/*.webp` declared at 800 × 600, about 6 MB. That belongs to another critic.)

## Top fixes (ranked by score gained per hour)

1. **Warm the close map during the globe leg, so the handoff never waits.** In `goToPlace()` / `openGroup()`, when a flight will end in `handOff`:
   - (a) at flight start, `ensureClose()`, then `close.map.jumpTo(closeCamera({ lat, lon, alt: HANDOFF_ALT * 0.9 }))` and, once idle, the *destination* camera (`{ center: [p.lon, p.lat], zoom }`), then back. The map is hidden under the globe, so this is free to look at, and the ~1.5–2 s globe flight hides the tile loads;
   - (b) in `handOff()`, lower `close.settled(1500)` to about 300 ms, because the tiles are already there;
   - (c) make `closeFlyTo()` a two-step: `easeTo` the target at the current zoom, `await close.settled(800)`, then zoom in, so it never flies into blank tiles.

   This removes the 1.2–5 s freeze and the 2–3 s mush, which is the single biggest gap between 7 and 8.

2. **Fix bug A (wheel over pins scrolls the page).** In the stage `wheel` listener, when `closeActive && (engaged || e.ctrlKey || e.metaKey)`, call `e.preventDefault()` and forward it with `close.map.getCanvas().dispatchEvent(new WheelEvent('wheel', e))`, or return only when `e.target` is inside `.world__close`. Add a guard in `scripts/test-map.mjs`: the wheel handler never returns without `preventDefault` while the stage is engaged.

3. **Fix bugs B and C.**
   - B: `cardStillAbout()` must not run while `flight || closeFlying`. Set `cardSubject.alt = null` when a flight starts and re-arm it in `onArrive` / `moveend`.
   - C: in `goToPlace()`, use `zoom: CLOSE_ZOOM[p.precision]`, not `Math.max(close.map.getZoom(), zoom)`.

4. **Put every long journey and every exit through the globe.**
   - `goHome()` when `closeActive`: `close.map.flyTo({ zoom: zoomForAlt(HANDBACK_ALT * 1.05), duration: 700 })`, `handBack()` on `moveend`, then the globe's `flyTo(rest, { travel: true })`. This fixes bug F.
   - `goToPlace()` when `closeActive` and the target is more than `HOP` away or off-stage: the same climb-out, then the normal globe journey with its cloud dive and handoff. Delft → Aarhus then goes up through the clouds and down again, instead of across blank tiles.

5. **Group clicks: decide the engine before diving (bug D).** In `openGroup()`, compute `close.map.cameraForBounds(bounds(), { padding })` first, with padding scaled to the stage (`min(60, W * 0.08)`). If that zoom's `altForZoom` is above `HANDOFF_ALT`, stay on the globe with `fitCamera(members, { minAlt: MIN_ALT })` and do not hand off. Only hand off when the fit is below the handoff. Add a harness check: after a group click, no visible group with the same member set remains.

6. **Nothing close loads at rest (bug E and the bytes).**
   - The home rest on a phone must stay above `HANDBACK_ALT` (`Math.max(HANDBACK_ALT * 1.15, …)` in the rest fit), so the globe owns the rest view.
   - `CLOSE_PRELOAD_ALT` must not trigger from the rest camera: preload on intent (hold, hover, flight start) only.
   - Move the Europe detail texture and the 4096 map to the first gesture, not `requestIdleCallback` on every visit.

   That takes /destinations/nl/ at rest from 9.1 MB back to about 5 MB, and /programmes/ from 1.46 MB of globe to about 0.6 MB.

7. **Make the close map satellite-first until street level.** In `globe-close.js` `style()`, set `minzoom: 10` on the vector-tile source's layers except water/boundary lines (or on `transportation`, `poi` and place labels), and raise the satellite's opacity curve to hold 1.0 until about 12. The result:
   - it removes the road-atlas look at the handoff (`s3d-europe-group-clicked.png`, yellow spaghetti over Belgium);
   - it removes most of the 2.4–8.4 MB of vector tiles;
   - the Blue Marble → Sentinel change reads as "sharper", not as "a different app".

   Also fade the globe's last 0.02 of altitude towards the Sentinel colour balance (a small saturation/contrast lift in `EARTH_FS` as `alt → HANDOFF_ALT`) so the handoff does not jump in palette.

8. **Phone polish for the close map.** In CSS:
   - `.world .maplibregl-ctrl-attrib-button { background-repeat: no-repeat; background-position: center; }` (the icon currently repeats four times);
   - collapse the compact attribution after load (remove `maplibregl-compact-show` on `load`);
   - keep MapLibre's own place labels out of the rectangles `layoutPins()` already treats as taken (controls, groups), or set `text-optional`/`symbol-avoid-edges` on the style's place layers.

9. **The first handoff's main-thread cost.**
   - Create the close map in `requestIdleCallback` after the first *gesture* (not mid-wheel).
   - Disable `fill-extrusion` (3D buildings) until zoom ≥ 15 is settled.
   - Set `maxTileCacheSize` and `pixelRatio: Math.min(devicePixelRatio, 1.5)` on phones.

   Re-measure with `rec.mjs`: no long task over 200 ms during a dive.

10. **Small ones.**
    - Record why the globe was refused (`data-globe-off="software renderer"`) rather than "could not start".
    - Silence the liberty style's null-number warnings by patching the offending expressions in `style()`.
    - /world/ rest still misses Canada and the US: consider a second rest pose, or start the idle turn over the Atlantic.
    - Abbreviations as pin labels ("UT", "UM", "EUR") mean little to a 16-year-old at rest; use the short names the cards already carry.

Fixes 1–4 take this to 8: one continuous dive, no page jumping away, no self-closing cards, Reset that flies. Fixes 5–7 make it cheap and consistent enough to be proud of on a school Chromebook and a phone.

## Screenshots and data (this folder)

| File | Shows |
|---|---|
| `s1-rest_*.png`, `s1-world-dark.png` | Rest views on the live site. NL rests with "9 / 2 / 2" groups. /programmes/ rests on "12 / 4 / 2". |
| `s2a-us-michigan-cold-sheet.jpg` | Cold dive to a campus: 5 s frozen, then mush, then street at 8.7 s |
| `s2b-nl-delft-sheet.jpg`, `s2b-nl-delft-street.png` | Warm dive: climb, clouds, 1.2 s wait, handoff, blur, street |
| `s2c-nl-reset-from-street-sheet.jpg` | Reset: street → orbit in one frame, then a lovely climb through clouds |
| `s2d-nl-wheel-out-sheet.jpg`, `s2d-nl-wheeled-out.png` | Wheel out: blank areas, then the page scrolls to the footer (bug A) |
| `s2f-programmes-delft-sheet.jpg` | /programmes/: the cloud dive, then the long wait |
| `s2g-programmes-delft-to-aarhus-sheet.jpg`, `s2g-programmes-aarhus-arrived.png` | Close-map flight: blank tiles, lost card, city at street zoom |
| `s3a`–`s3c` sheets, `s3b-europe-wheeled.png`, `s3c-europe-germany-card.png`, `s3d-europe-group-clicked.png` | Play on /europe/: fling, wheel-in to Sentinel, Germany card, a group dive into the atlas look |
| `s4-phone-*.png`, `s4y-phone-nl-rest-close.png`, `s4y-phone-nl-after-tap.png` | Phone: the NL page at rest in MapLibre with the credit box covering it; street level with a good card |
| `s4e-phone-programmes-group-sheet.jpg` | Phone: tapping "13" ends further out, still "13" (bug D) |
| `s5-*.png` | Flat fallback, dark theme at street level, reduced motion |
| `s6-*.png` | Denmark card → /denmark/. The desktop group result. |
| (frames) | `rec.mjs` writes every screencast frame to `<name>-frames/`. They were deleted after the sheets were made (170 MB). Re-run a script to get them back. |
| `s1-rest.json`, `s2-dive.json`, `s3-play.json`, `s4-phone.json`, `s4x`/`s4y-phone-nl-tap.json`, `s5-misc.json`, `s6-checks.json` | The numbers above |

Reproduce with `node <script>.mjs` from this folder (live site by default; `ORIGIN=` / `BASEPATH=` point it elsewhere). Note: `s4x` tapped the wrong list entry because the site's smooth scrolling moved the entry after its rectangle was read. That was a harness artifact, and `s4y` (instant scroll) is the correct run.
