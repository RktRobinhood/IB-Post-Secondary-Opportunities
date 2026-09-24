# Globe — round 1 critique (art director + motion critic)

**SCORE: 6 / 10.**

This is a real achievement: hand-written WebGL, 60 fps, a lovely curved-horizon view of
Europe, a card that arrives with a photo, correct reduced motion, a clean fallback. Held
at mid-zoom (/europe/, /programmes/ at rest, dark theme) it already feels like holding a
world. But the brief's payoff is "zooming into universities", and that is where it falls
apart. The closest zoom is a soft green blur. The pages about one country rest on blobs
("12", "15", "11"). Three things the globe tells students are false: Denmark is "not
covered", 12 Danish cities "share a spot", and Canada's pin sits in Minnesota. Cards stay
open over places the reader has already left. On a phone the card shows a photo and hides
its own title and action. Most of these are small, concrete fixes. I would not ship to
students until the false statements and the phone card are fixed, and the close zoom needs
a real answer (texture, not tuning) before this reaches 8.

How I judged it: I built the site with SITE_BASE unset, copied dist/ to a scratch folder
and served it on :4398, because other agents rebuild dist/. I drove headless Chrome over
CDP with real mouse, wheel, key and touch events (scripts in this folder, `cdp.mjs` +
`a-`…`i-*.mjs`). Headless Chrome on this machine renders on the real GPU (AMD RX 580,
D3D11), not SwiftShader. That also holds for round-0's `drawMs`. For a low-end run I
forced SwiftShader with `--use-angle=swiftshader` and a 4x CPU throttle.

## What works — keep it

- **Look at mid-zoom.** /europe/ (`a-rest_europe_.png`, `c-europe-dark.png`) is the reference: a lit disc with atmosphere, clouds, stars, clean labels, clusters that make sense. /programmes/ at rest (`a-rest_programmes_.png`) with the horizon across the top is beautiful.
- **Feel.** Drag, fling and inertia feel physical: a fast 270 px flick spins about 95° and settles. Idle, spin, fling, reset and dive all measured 60 fps (p95 16.8 ms) on a desktop GPU, and `draw()` costs 0.22 ms of CPU.
- **Flights.** Pull-out, travel, dive reads as one arc. The card with its photo appears on click, before the flight, which is right (`h-dive-realtime-sheet.jpg`).
- **Etiquette.** A wheel over an untouched globe scrolls the page. Ctrl+wheel zooms, and a click takes hold. Keyboard arrows, +/−, 0 and Esc all work. Reduced motion is instant everywhere (list click lands at Greece with no idle, no rush). `?map=flat` falls back (`c-flat.png`). No console errors on any page.
- **Counts.** The Netherlands card says "5 places · 16 programmes", which equals its list entries (4+4+3+3+2). Pin screen positions match their lat/lon to within 5–55 km (`a-pins.json`).

## The four things the coordinator noticed

**(a) The close zoom is very blurry. Confirmed, and it is worse than "soft".** At MIN_ALT 0.045 one texel of the 2048-wide day map covers about 40–65 screen pixels (`b03-closest-zoom.png`): Zealand is a green-brown smear and coast and sea barely separate. Even the /programmes/ rest (alt 0.42) is magnified about 7x, which is the "smeared" look of Germany in `a-rest_programmes_.png`. Two code findings:
- **The unsharp mask in `EARTH_FS` does nothing.** `texture2D(uDay, vUv, 2.5)` adds bias to the LOD, but under magnification the LOD is about −3 to −5, so the bias still lands on level 0 and `soft == c`. Measured: with vs without the line, mean pixel difference 0.015/255 and identical edge energy (`h-sharp-on.png` / `h-sharp-off.png`). The comment "puts back some edge" is not true.
- **No anisotropic filtering.** I patched it in: a small gain near the horizon (`c-aniso-on.png` vs `c-aniso-off.png`). It is not the cure. Resolution is.

**(b) Stale card in 06. Confirmed in real use, not only a harness artefact.** Clicking the "12" group opens a card. I then dragged away and zoomed out to the whole of Europe with the + and − buttons, and the card was still open (`b04-card-after-pan.png`, `b05-zoomed-out-max.png`). `closeCard()` runs only on the sea, Esc, Reset and ×.

**(c) Australia has 17 options but no pin. Confirmed, and it is framing, not a missing pin.** /world/ rests at lat −5.5, alt 1.4, pitch about 18°. The Australia pin (−33.6, 143) is below the frame's bottom edge while the continent fills it. The idle spin only turns longitude, so Australia's and New Zealand's pins **never** appear at rest. Canada (20) and the US come round only after about 100 s. At rest 5 of the 10 destinations are visible (`a-rest_world_.png`, `c-phone-world.png`). The pin exists: flying there shows it (`a-world-australia.png`, `i-world-australia.png`).

**(d) Blocky clouds. Confirmed.** `c-world-clouds-crop.png` and `-dpr2.png` show square WebP macroblocks, for example the rectangular grey band in the Banda Sea and the square cloud tufts. Three causes stack: a 1024x512 source magnified about 4x at alt 1.4, lossy q60 greyscale, and `smoothstep(0.18, 0.85)` stretching the contrast of the block edges.

## Correctness: false statements the globe makes

1. **"Denmark — Nothing on this map here yet. This guide does not cover it yet."** This appears when a student clicks Denmark on /europe/ (`c-dive-eu-dk-sheet.jpg`). `destinations.json` is built from `site.countries` in `src/build.mjs` (around line 309), which leaves out the home door `/denmark/`. The site's flagship country is described as uncovered, which breaks "nothing invented".
2. **"12 places here — They share a spot on the map."** This appears when the Denmark group on /programmes/ is clicked (`b01-after-cluster-click.png`), while the view shows them split into 3, 2 and 4 plus singles across Jutland and Zealand. `openGroup()` takes `minAng` as the *smallest* pairwise angle. Copenhagen and Frederiksberg are 3 km apart, so `splitAlt < MIN_ALT` and the whole group becomes a "crowd".
3. **Canada's pin is in the United States** (46.52, −92.89, Minnesota, just south of the border line in `i-world-canada.png`). A point-in-polygon check against borders-50m finds `ca → us`. Every other pin lies in its own country, except coastal cities that fall just offshore at 50m, which is harmless.
4. **The list click leaves the card under the masthead.** On /programmes/ at 1280x800, clicking an entry below the map leaves the stage at top −189 to −230 px, and the card's title sits under the sticky header (`b07-list-maastricht.png`). `stage.scrollIntoView({ block: 'nearest' })` does not move the page here.

## Motion and "passing through the clouds"

- From a far start (/europe/, /world/), the dive has a real cloud moment: about 0.4 s of white sheets, then clearing, arriving by about 1.7 s (`h-dive-realtime-sheet.jpg`, `c-dive-eu-dk-sheet.jpg`). It reads as a fast fog flash more than as layers rushing past. It is acceptable, but it is a 2D overlay with no parallax.
- **On /programmes/ and every Destination page it never happens.** Those rest at alt 0.42, below where clouds fade out (0.85), and a hop to a nearby country never climbs back through the deck (`c-dive-sheet.jpg`: a plain zoom, no clouds). The owner's signature moment is missing from the page students use most.
- Groups churn during a flight (12 → 10 → 9 → 5/5/4). This is noisy but tolerable.
- One 83 ms hitch at the first dive below alt 0.9: the borders-50m parse and the picking raster built on the main thread. On the low-end run the fetch and parse alone took 3.8 s.

## Phone (390 x 844, DPR 2)

- **The card hides its own content.** It is capped at 58% of a 358 px square stage (206 px), and the photo fills it. The title, meta and "Open …" action are below, reachable only by scrolling inside the card, and nothing says so (`d-phone-tap-cluster.png`, `f-phone-card_europe_.png`: `titleVisibleInStage: false`, `actionVisible: false`). The pin that was flown to sits *under* the card (pin y 234 vs card top 143).
- /programmes/ on a phone rests on "15" and "4" blobs (`c-phone-programmes.png`). The +/−/Reset row covers the China and Japan labels on /world/ (`c-phone-world.png`).
- Touch works: tap a pin → card, a sideways swipe on an untouched globe spins it without scrolling, and pinch zooms (`e-probe.mjs`). **But after a tap has taken hold, a thumb on the globe cannot scroll the page (0 px moved)** until the reader taps outside. On a phone the globe is about 45% of the screen, and nothing tells the reader how to let go.

## Performance

| Measure | Desktop GPU (RX 580) | SwiftShader + 4x CPU |
|---|---|---|
| Idle spin, p50 / p95 frame | 16.7 / 16.8 ms | 83 / 444 ms (about 12 fps) |
| Dive, p50 / p95 / max | 16.7 / 16.8 / 83.5 ms | 83 / 217 / 234 ms |
| Drag | 16.7 ms steady | 67 / 133 ms |
| `draw()` CPU | 0.22 ms | 0.6–1.3 ms |
| JS heap | 6 MB | 9 MB |
| Navigation → globe on (/europe/) | about 0 (already on at load) | 3.4 s |

- GPU memory: day map 2048x1024 RGB with mips is about 8.4 MB, clouds about 0.7 MB, mask 0.5 MB. Fine.
- **A software-GL machine gets the globe at 12 fps instead of the flat map.** There is no `failIfMajorPerformanceCaveat` and no renderer check. A blocklisted school Chromebook would get a juddering globe.
- First paint is the build-time SVG, as the ADR promises. No scroll hijack on desktop.

## Top fixes (ranked by score gained per hour)

1. **Stop the three false statements** (each small):
   - `src/build.mjs` destinations.json: include the home door. Derive `{ code, name, flag, href: '/denmark/' }` from whatever record already defines the Denmark door, not an `if (code === 'dk')`. Clicking Denmark then says "Open the Denmark page".
   - `globe.js openGroup()`: decide "crowd" by the group's *diameter*, not its closest pair. If `maxAng / (PIN_GAP * 1.25) * H / (2 * TAN) < MIN_ALT`, show the crowd card. Otherwise `fitCamera(members, { minAlt: MIN_ALT })` and dive to `min(fit.alt, splitAlt)` with no card. Show "They share a spot" only when it is true.
   - Canada's country point: move it inside Canada (a representative interior or largest-city point, not the campus mean). Add a guard to `scripts/test-map.mjs` that every place with a `country` lies inside that country's 50m polygon or within about 30 km of it (to allow for coasts).
2. **Close zoom that rewards zooming into universities.**
   - (a) A lazily fetched **Europe detail texture**, fetched like borders-50m below alt 0.9: for example 2048x2048 over lon −25…45, lat 34…72, giving 5–9x the texel density. Blend it in `EARTH_FS` inside its UV rectangle. Alternatively a 4096x2048 global map. Either needs the owner to move the 2048 / 400 kB budget and its guard in `test-map.mjs`.
   - (b) Replace the no-op unsharp with a real one: a 4-tap blur at ±1 texel (`uniform vec2 uTexel`), and use bicubic (B-spline via 4 bilinear taps) sampling when magnified.
   - (c) Turn on `EXT_texture_filter_anisotropic` (8x) in `texture()`.
   - (d) Until (a) lands, raise `MIN_ALT` to about 0.08 so the closest view is soft rather than mush. The crowd card covers what still does not split.
3. **Close cards that are no longer about the view.** In `layoutPins()`, if the card's subject (the place's pin, or the selected country's frame centre) projects off-stage or behind the planet, or `view.alt` exceeds 2.5x the altitude at which the card opened, call `closeCard()`. That also clears the country tint.
4. **Phone card.** At max-width 44rem, set `.world__card-img` to max-height about 88px (or a 72px thumbnail beside the title) so the title, meta and action show without an inner scroll. When a card opens on a phone, frame the target in the space above the sheet: pass a bottom inset, the card's height, into `fitCamera`/`flyTo` and shift the target so the pin lands at y ≈ (H − cardH)/2.
5. **/world/ rest must show the world's pins.** For pages whose places cannot fit at `REST_MAX_ALT`, choose the rest camera that shows the most count-weighted places. Sample lat −10…+30 with pitch near 0 at alt 1.8–2.4, a whole disc that still overfills a phone. Turn the idle spin to about 6°/s there (currently 2.4°/s, one turn in 150 s). No destination with a visible continent should be pinless at rest.
6. **Clean clouds.** In `scripts/make-globe-textures.mjs`, remake `earth-clouds.webp` at 2048x1024, near-lossless or q90 with `-sharp_yuv`, with a 1 px pre-blur. In `CLOUD_FS` and `RUSH_FS`, soften `smoothstep(0.18, 0.85)` to (0.1, 0.95).
7. **Put the clouds into the flights students take.** When a flight's great-circle distance is over about 500 km, or it starts from a page's rest camera, let the altitude arc peak at ≥ 1.0 so the descent crosses the deck and `diveIn` triggers (`flyTo`'s `peak`). On /programmes/ that gives Denmark → Netherlands its cloud moment. Reduced motion stays instant.
8. **List click scroll.** Replace `scrollIntoView({ block: 'nearest' })` with an explicit check: if the stage's top is under `scroll-padding-top` (88px) or its bottom is past `innerHeight`, `scrollTo({ top: stageTop + scrollY − 88 })`.
9. **Software GL → flat map.** Pass `getContext('webgl', { failIfMajorPerformanceCaveat: true, … })`, fall back to flat when the renderer string names SwiftShader, llvmpipe or Basic Render, and drop the DPR to 1 if the first 30 frames' p50 exceeds 25 ms.
10. **Phone hold.** Release the hold (`disengage()`) 4 s after the last globe gesture, and change the hint to "Tap outside the globe to scroll the page". Without this, a thumb stays trapped after the first tap.
11. **Small ones.**
    - Prefetch and build borders-50m in `requestIdleCallback` once the globe is on, which removes the 83 ms dive hitch.
    - Add the controls' rectangle to `taken` in `layoutPins()` so labels avoid the buttons.
    - Once (2) lands, lower `REST_MIN_ALT` for single-country pages (`home` set) to about 0.2, so /destinations/nl/ rests on the Netherlands and not on "11" and "3" (`a-rest_destinations_nl_.png`).

Fixes 1, 3, 4, 8 and 10 are each an hour or less and would take this to about 7. Fix 2 (the detail texture) together with 5 and 7 is what makes it an 8+: a globe you can dive into Denmark on and actually see Denmark.

## Screenshots (this folder)

| File | Shows |
|---|---|
| `a-rest_programmes_.png`, `a-rest_europe_.png`, `a-rest_world_.png`, `a-rest_destinations_nl_.png` | Rest views. /world/ has Australia in view without a pin. The NL page rests on "11" and "3" |
| `a-world-australia.png`, `i-world-australia.png` | The Australia pin exists, only below the rest frame |
| `b01-after-cluster-click.png` | The false "12 places share a spot" card over a split Denmark |
| `b03-closest-zoom.png` | The closest zoom: mush |
| `b04-card-after-pan.png`, `b05-zoomed-out-max.png` | The stale card after panning away and zooming out |
| `b06-germany-card.png` | A country click: tint, outline and card look good |
| `b07-list-maastricht.png`, `c-list-click-scroll.png` | List click leaves the card under the masthead |
| `c-dive-sheet.jpg` | /programmes/ → Netherlands, stepped: no clouds at all |
| `c-dive-eu-dk-sheet.jpg` | /europe/ → Denmark, stepped: the cloud moment and the "not covered" card |
| `h-dive-realtime-sheet.jpg` | /europe/ → Italy, real-time screencast frames 0.37–3.4 s |
| `c-aniso-off.png` / `c-aniso-on.png` | The anisotropic filtering A/B |
| `h-sharp-on.png` / `h-sharp-off.png` | The unsharp mask on and off: identical |
| `c-world-clouds-crop.png`, `c-world-clouds-crop-dpr2.png` | Blocky clouds at 1:1 and DPR 2 |
| `c-phone-programmes.png`, `c-phone-world.png`, `d-phone-tap-cluster.png`, `f-phone-card_*.png` | Phone: blobs, labels under the buttons, the card hiding its title and action |
| `c-europe-dark.png`, `c-flat.png`, `i-world-zoomed-out.png`, `i-world-canada.png` | Dark theme, flat fallback, whole Earth, the Canada pin in the US |

Data: `a-pins.json` (pins vs list per page), `b-play.json` (real-input play session and frame timings), `c-look.json`, `d-touch-scroll.json`, `g-lowend.json`, `h-motion.json`. Reproduce with `node <script>.mjs` from this folder against a server on :4398 (`PREVIEW=` overrides it).
