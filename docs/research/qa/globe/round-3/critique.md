# Globe: round 3 critique (art director and motion critic)

**SCORE: 7 / 10.**

**Verdict: not yet 8, but close. Round 2's interaction bugs are almost all gone, and the bytes are cut by two thirds. What still separates this from "one continuous dive" is the bottom 5% of every journey, plus three regressions this round introduced.**

Round 2's list is largely done, and done properly:

- The page no longer scrolls away under a wheel.
- Cards survive their own flights, and a city is shown at city zoom.
- Delft → Aarhus now climbs out, crosses the cloud deck and dives back in, with its card kept.
- Nothing close loads at rest, and a first dive costs 2–3 MB instead of 5–10 MB.
- Back works exactly as the owner asked. On /countries/, choosing the Netherlands, opening its page and pressing Back restores the Netherlands card on the globe.
- The globe leg is the best thing on the site. The /countries/ → Netherlands journey (`s9b-countries-netherlands-sheet.jpg`) goes from whole Earth through cloud to a labelled Europe in 1.9 s, and it feels like holding a world.

It is not an 8 because the ground-level half still shows its seams, and because the round-2 fixes introduced three regressions:

- **Cream voids** whenever the camera goes *up* inside the close map (Reset, wheel-out, climb-out). Missing tiles are painted in the style's cream background, not in Earth.
- **A 1–1.3 s freeze on the first Reset** from street level: MapLibre compiles shaders synchronously.
- **A soft, washed satellite for 1–1.5 s at street level, then a hard pop** to the vector street map.
- **The first click's climb to space plays as a slideshow**: 4096² textures are uploaded mid-flight.
- **Regression: the resting views of /programmes/ and Destination pages are visibly blurrier**, with polygonal 110m borders. This is the first impression.
- **Regression: the biggest group click on /programmes/ ("12", Denmark) frames 2 of its 12 members.**
- **New page, weak rest: /countries/** rests over Pakistan, with Europe (311 of 455 programmes) as groups on the limb.

Fixes 1–4 below are each a few hours, and they are the difference between 7 and 8.

**How I judged it.** I drove the **live** site. Its `globe.js`, `globe-close.js` and `map.js` are byte-identical to the working tree (checked again after the deploy below). I used headless Chrome over CDP on the real GPU (ANGLE D3D11, RX 580), with real mouse, wheel and touch input. Recordings are real-time screencasts plus a page-side camera sampler, rAF gaps and long tasks (`rec.mjs`). I added CPU profiles to attribute the long tasks (`s11`, `s12`), and fresh browser profiles for the cold first-dive bytes (`s10`).

**Mid-session deploy.** At 05:53 UTC another agent deployed a restructure: /europe/ and /world/ now redirect to **/countries/**, and the nav changed. No globe file changed. The runs before the deploy are in `pre-deploy/`, and /countries/ was judged separately (`s9`).

## Round-2 bugs and fixes: status

| # | Round 2 | Live now |
|---|---|---|
| A | Wheel over a pin in the close map scrolls the page (120 px) | **Fixed.** 0 px, and the zoom changes (`s3-play.json` `wheelOverPinInClose`). A 40-tick wheel-out from street level keeps the stage on screen. |
| B | Card closes itself on a close-map flight | **Fixed.** Delft → Aarhus keeps the Aarhus card for the whole journey. |
| C | City dived to street level | **Fixed.** Aarhus and Kongens Lyngby end at zoom 11.5. |
| D | Group click bounces back out | **No bounce, but a new framing bug.** Phone "13" → zoom 5.8, split into 8 pins + "3". Desktop "12" → zoom 6.54 centred at 56.9°N: **10 of the 12 members are below the stage** (`s7-history.json` `group.projected`, `s7b-programmes-group-end.png`). |
| E | Phone NL page rests in MapLibre | **Fixed.** It rests on the globe at alt 0.184. No attribution box at rest. |
| F | Reset from street pops to orbit | **Half fixed.** The climb-out is right. The *first* Reset after a dive freezes for **956–1,300 ms** (MapLibre `getProgramParameter`/`getShaderParameter`, 930 ms in `s11-reset-profile.json`), then shows a street-map trapezoid in a cream void (`s2c-nl-reset-from-street-sheet.jpg`, 0.45 s and 2.11 s). The second Reset is smooth. Back from street level is smooth (`s7a`, worst frame 67 ms). |
| G | First wheel-in freezes | **Better.** Longest task 210 ms. The palette still jumps at the handoff (`pre-deploy/s3b-europe-wheel-in-sheet.jpg`, 2.24 → 2.35 s: pale beige → saturated orange). |
| Fix 1 | Warm the close map during the globe leg | **Works when the map exists.** Cold dives hand off at 1.9–2.1 s with no "Loading" hint (the hover preload works). With no hover, the US page still shows "Loading the close-up map…" for 1.6 s. |
| Fix 6 | Nothing close at rest | **Done, at a cost.** See regression R1. |
| Fix 7 | Satellite-first | **Done.** No road atlas at the handoff. But see the street-level pop. |
| Fix 8 | Phone attribution | **Done** (collapsed, no tiling). |
| Fix 10 | Abbreviations | **Mostly done by the data change.** UM, UT, EUR, RUG and UU are now full names. UvA, TU/e, "AUAS / HvA" and BUas remain. |
| Owner rule | Only off-site links open new tabs; choices undoable with Back | **Holds for places and countries.** The card's "Visit their website" opens a new tab. "Open Netherlands" stays in the tab, and Back restores the card. The list click flies and does not navigate. **Group dives push nothing:** Back after diving into a group leaves the page (`s7-history.json` `europe.group.pushed: 0`). |

## Measurements vs round 2

| Measure | Round 2 | Round 3 (live) |
|---|---|---|
| Handoff standstill, NL → TU Delft | 1.2 s warm / 5.3 s cold | **250 ms cold** (`s10c`), 422 ms (`s2b`) |
| Standstill, /programmes/ → Delft | ~1.4 s (handoff at 4.6 s) | **263 ms**, handoff at 2.1 s |
| US campus cold: time to street | 8.7 s | **6.5 s**. The "Loading" hint still shows for 1.6 s, with a 616 ms freeze. |
| Worst long task, dive | 1,505 ms | **370 ms** at the click (globe.js `texture()`), **471–726 ms** on arrival (MapLibre first use) |
| Worst long task, first Reset from street | none recorded (the pop was the bug) | **956–1,300 ms** (shader compile) |
| First press on the globe (drag) | — | 249–284 ms hitch (the 4096 upload fires on `touch()`) |
| Idle spin p95, all pages | 16.8 ms | 16.8 ms |
| Frame p95 in a dive | 184 ms | 16.8–33.5 ms |
| Seam at the handoff | 1.4 px | 1.4 px |
| Bytes at rest, /programmes/ (globe) | 1.46 MB | **~0.51 MB** |
| Bytes at rest, /destinations/nl/ | +4.4 MB close map | **0 close map**, globe ~0.65 MB (50m borders at idle) |
| Cold first dive, /programmes/ → Delft | 4.8 MB | **2.8 MB** (+273 kB MapLibre, fetched on hover) |
| → Aarhus / → Kongens Lyngby (Danish areas) | — | 3.0 / 3.2 MB |
| US campus, cold | 10.5 MB | **1.6 MB** |
| Wheel over pin in close map | page +120 px | **0 px** |
| Reset, worst altitude ratio per *visible* frame | 293× | 2.45× when warm; **~190× on the first Reset** (camera moves during the 1.3 s freeze) |
| Console | 115 GPU warnings, style nulls | 240 "READ-usage buffer" warnings, 9 style null warnings per dive, no errors |

## The dive, frame by frame (what a student sees)

**/programmes/ → Delft (`s2f-programmes-delft-sheet.jpg`).**
- 0.75 s: a whole Earth.
- 1.04 s: through a real cloud deck.
- 1.8 s: the Netherlands in sharp Europe detail.

That part is lovely. Then:
- 2.35 s: the handoff over pixel-blocky globe texture.
- 2.65 s: 0.3 s of grey-green mush with one sharp strip pasted in.
- **2.9–4.1 s: a soft, milky satellite at zoom 15.** The Sentinel source is `maxzoom: 14`, 10 m imagery overzoomed at 55% opacity.
- **4.5 s: the vector street map snaps in all at once**, with a 471 ms long task.

The pop at the end is the one seam every campus dive now has (`s2b` 5.71 s, `s2a` 6.78 s shows it half-drawn, tile by tile).

**Danish area: /programmes/ → Kongens Lyngby, cold (`s10d-cold-programmes-lyngby-end.png`).**
- The flight and the handoff are good.
- A **905 ms freeze** on arrival at zoom 11.5 (a 726 ms long task).
- The result is a dark satellite under heavy yellow road spaghetti with dozens of italic suburb labels.
- **The pin's "Kongens Lyngby" label sits 12 px under MapLibre's own "Kongens Lyngby" label.**

It is honest ("Placed at the city, not at the campus"), but it reads as a road atlas, not a place to study.

**Reset / wheel-out / climb-out.** Every upward move inside MapLibre shows the style's **cream background** where lower-zoom tiles have not loaded:
- a floating trapezoid of streets (`s2c` 0.45 s);
- a satellite rectangle in a cream field (`s2d` 2.4–4.1 s);
- white wedges during the cross-fade back to the globe (`s2c` 2.2–2.5 s, `s2g` 0.43 and 1.14 s).

This is the most "broken-looking" thing left, and it happens on the move the owner asked for by name (zoom-out through the clouds).

**First click on a page (`s12-dive-profile_programmes_.json`).** From 0.27 to 0.9 s the main thread is in `globe.js texture()`:
- `texImage2D` decodes the 4096 day map and the Europe detail synchronously;
- `getParameter` after `generateMipmap` forces a GPU sync, about 200 ms.

So the joyful climb to space is ~6 frames in 700 ms. `s2b` shows it: the screencast has 7 frames between 0.65 and 1.5 s.

**Phone (`s10e-phone-programmes-aarhus-sheet.jpg`).** The card opens at 0.5 s and covers ~70% of the square stage, so **the whole climb and cloud dive happen behind the card**. The student sees a 60 px strip of it. The arrival is good: the pin sits above the card, and street tiles load. Separately, the /countries/ phone rest clips labels at the stage edge ("HK Ho…", "SG Singap…", `s9e-phone-countries-rest.png`).

## Regressions and new findings

**R1. The resting picture got worse.** Round-2 fix 6 gated the Europe detail, the 4096 day map and the 50m borders behind the first gesture. On /programmes/ (rest alt 0.42) and on Destination pages (alt 0.2), the resting camera is *below* `FINE_ALT`, so the landing picture is now the 2048 texture magnified. Denmark is a smear with 110m pentagon borders. Compare `pre-deploy/s1-rest_programmes_.png` with `../round-2/s1-rest_programmes_.png`, and `pre-deploy/s1-rest_destinations_nl_.png` with its round-2 twin. The saving was about 0.8 MB, and the cost is the first impression of the flagship page. My predecessor's fix 6 asked for this, and it was the wrong trade for pages that rest below `FINE_ALT`.

**R2. Group framing (`openGroup` → `fitClose`).** The zoom floor `m.getZoom() + 0.6` overrides the fit, and `cameraForBounds` with the lens-shift top padding puts the centre north of the group. The "12" on /programmes/ lands on North Jutland, showing Aalborg, Viborg, Herning and Aarhus. Copenhagen, Odense, Esbjerg and the others are off the bottom. There is also a visible tile band across the middle of the frame (`s6-programmes-group-split.png`).

**R3. /countries/ rests on the wrong hemisphere.** `worldRest()` (globe.js ~730) chose lat 30, lon 60–70, alt 2.3. Europe's 25 places (311 of 455 programmes) are the "14", "6" and "2" groups on the upper-left limb. The Americas are not in view (`s1-rest_countries_.png`, `s1-countries-dark.png`). The scorer counts a place on the limb as fully "visible".

## Correctness that holds

- **Pins match the lists:** on /programmes/, /countries/, /destinations/nl/ and /destinations/us/, counts sum to the list (73, 455, 15, 14). Every visible pin is within 40 km of its own lat/lon when picked back off the globe.
- **Redirects:** /europe/ → /countries/#europe, with no extra history entry.
- **Reduced motion:** a list click lands in ≤150 ms. A campus goes straight to the close map at 1.3 s.
- **`?map=flat`** works. Software GL gives `data-globe-off="software renderer: ANGLE (… SwiftShader …)"`, which is fixed as asked.
- **Dark theme:** the frame and card are correct; `s1-countries-dark.png`, `s5-*.png`.
- **Phone:** a thumb swipe over an untouched globe scrolls 235 px, and one finger over the close map scrolls the page with the cooperative-gesture notice. `s4y` counted a "new tab", but `s8` shows that was a worker target: no tab opens.

## Top fixes (ranked by visible impact per hour)

1. **Never show cream: draw the Earth under the close map.**
   - `globe-close.js` `style()`: set the style's `background` layer to `background-opacity: 0` (or drop it), so untiled areas are transparent.
   - `globe.js` `frame()`: change `if (!closeActive) draw(now)` so the globe keeps drawing under MapLibre while `closeActive`. The `move` handler already syncs `view`, and the seam is 1.4 px.

   Missing tiles then show Blue Marble or the Europe detail at the same camera, not voids. This removes every cream trapezoid, rectangle and wedge in Reset, wheel-out, climb-out and the cross-fade. Guard: `test-map.mjs` asserts that the close style has no opaque background layer.

2. **Remove the main-thread hitches from the journeys** (the slideshow climb, the first-press hitch, the Reset freeze, the arrival freezes).
   - (a) `texture()` (globe.js ~258): read `MAX_TEXTURE_MAX_ANISOTROPY_EXT` **once** at context creation, not after every `generateMipmap`. That is the forced GPU sync, ~200 ms.
   - (b) Load the lazy textures with `createImageBitmap(await (await fetch(url)).blob())`, so decoding happens off the main thread.
   - (c) Never upload during a flight. Queue `upgradeDay` and `maybeDetail` uploads and apply them when `!flight` (or in `onArrive`). Start the *fetch* on intent (hover or press), as the close map already does.
   - (d) Prime MapLibre's programs. In `createCloseMap` after `load`, while hidden and in idle callbacks, `jumpTo` zooms 5.3 / 9.5 / 12 / 15 at the handoff pitch over the page's places, and call `map.redraw()` at each.

   Verify with `s11-reset-profile.mjs` (run 1 must show no long task > 200 ms) and `s12-dive-profile.mjs`.

3. **Restore the resting picture (R1) without undoing the byte win.** When `rest.alt < FINE_ALT` and the rest view overlaps `detail.json`'s rectangle, fetch and upload the Europe detail and the 50m borders at idle after the first frame, as round 1 did. Home pages already do this for the borders. Keep the 4096 day map and the close map behind intent. This costs about 580 kB on /programmes/ and Destination pages and gives back the picture students land on.

4. **End the street-level pop.**
   - In `warmClose()`, do not let `handOff()`'s `warmToken++` cancel the final stop. Keep warming `[13, zoom]` at the destination while the handoff and the flight run, so the z14–15 vector tiles and glyphs are in before arrival.
   - Fade the street layers in with a layer-opacity transition on first `idle` at zoom ≥ 13, not tile by tile.
   - Lower the satellite `raster-opacity` curve so the cross-fade is finished by 14.5, since the source's `maxzoom: 14` is soft beyond that.

5. **Groups: frame all members, and make the dive undoable (R2 + owner rule).**
   - In `fitClose`, drop the `m.getZoom() + 0.6` floor (keep `zoomForAlt(HANDBACK_ALT) + 0.3`).
   - Compute `cameraForBounds` at pitch 0 with symmetric padding, then check every member with `close.project`. Zoom out 0.3 at a time until all are on the stage.
   - `openGroup` should `remember({ kind: 'view', … })` (a camera entry), so Back climbs back out instead of leaving the page.
   - Guard: after a group click, every member is on the stage or in a visible group.

6. **/countries/ rest (R3).** In `worldRest()`, weight each place by its facing term (for example `max(0, facing)²`) and by its count. Also prefer a centre on the count-weighted centroid. That rests over Europe at a pose where the 25 European places split, and the idle turn then brings Asia and the Americas round. In `layoutPins()`, put a label on the left when it would cross the stage's right edge (phone: "HK Ho…").

7. **Phone: show the dive, then the card.** When the card is full-width (the `frameAbove` case), open it collapsed (title and action only, ≤ 30% of the stage) until `onArrive`, then expand it.

8. **Handoff palette.** On the `satellite` layer, add `raster-saturation` and `raster-contrast` ramps (for example `['interpolate', ['linear'], ['zoom'], 6, -0.35, 10, 0]`) so the first Sentinel frames match Blue Marble's muted palette and warm up as the camera descends. The globe's `uPunch` alone does not close the gap over deserts.

9. **Small ones.**
   - Hide the basemap's place label when a pin with the same name is within ~40 px (or drop `place` labels of class `suburb`/`neighbourhood` below z13). This fixes "Kongens Lyngby" twice and the italic clutter at city zoom.
   - The remaining abbreviations: UvA, TU/e, "AUAS / HvA", BUas.
   - The card photo is a blank grey box for ~300 ms on open: reserve the space with a colour or fade the image in.
   - Patch the liberty style's null-number expressions.
   - If the no-hover cold case matters (US: 1.6 s "Loading"), fetch only the MapLibre script and style (≈290 kB, no tiles) at idle on pages whose places can dive.

With 1–4 done, the dive from space to campus has no void, no freeze and no pop. That is the 8. Fixes 5–7 make it an 8 on the flagship page, the new Countries door and a phone too.

## Files (this folder)

| File | Shows |
|---|---|
| `cdp.mjs`, `rec.mjs`, `an.mjs` | The harness (from round 2) and a frame-gap and standstill analyser |
| `s1-rest.*`, `s1-rest_*.png`, `s1-countries-dark.png` | Post-deploy rest audit: /programmes/, /countries/, NL, US |
| `pre-deploy/` | Pre-deploy rest shots (R1 comparison), /europe/ play (`s3a`–`s3c`), `s3-play.json` |
| `s2-dive.json`, `s2a`–`s2g-*-sheet.jpg` | Real-time dives: US cold, NL → Delft, Reset, wheel-out, wheel-in, /programmes/ → Delft, Delft → Aarhus |
| `s4-phone.json`, `s4y-*.json`, `s4e-*-sheet.jpg` | Phone rest, tap-to-dive, group tap. The `s4` TU Delft tap hit France (a smooth-scroll harness artifact); `s4y` is the correct run. |
| `s5-misc.json`, `s6-checks.json`, `s6-programmes-group-split.png` | Flat, software GL, reduced motion, card link, Denmark card, group framing |
| `s7-history.json`, `s7a`/`s7b` sheets | Back behaviour, Back from street, group members on stage |
| `s8-phone-newtab.json` | No new tab from a list tap (tabs counted as pages) |
| `s9-countries.json`, `s9*-sheet.jpg`, `s9*.png` | /countries/: rest, fling, Netherlands card → page → Back, group, reduced motion, phone |
| `s10*-summary.json`, `s10*-sheet.jpg`, `s10*-end.png` | Cold first dives, fresh profile (bytes and standstills). Run with `MSYS_NO_PATHCONV=1` in Git Bash. |
| `s11-reset-profile.json`, `s12-dive-profile_programmes_.json` | CPU attribution of the Reset freeze and the dive hitches |

Frame folders (`*-frames/`) were deleted after the sheets were made. Re-run a script to regenerate them.
