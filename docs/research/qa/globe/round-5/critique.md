# Globe: round 5 critique (desk globe, final round)

**SCORE: 8 / 10.** Ready to ship to students today, with the leftovers below.

Note: `localhost:4350` was serving a `dist` built with the production base (`/IB-Post-Secondary-Opportunities/`), so its CSS and JS returned 404. I rebuilt the current `src` to `D:/ibp-tmp/r5dist` (`SITE_BASE=`) and tested that on port 4360.

## Why

**The hero now looks like a place worth going.** The desk globe reads as a real classroom object: pastel countries, thin ink coasts, a flat blue sea, the brass ring and the wooden stand (`d-1-rest-globe-crop.png`, `dk-1-rest.png`). Round 4's black Caspian, Red Sea and Gulf are gone, and so are the black coastal bands. The eye sits at 40°N and the idle movement only rocks, so Europe stays in front (`s1-rest.json`: rest lon 18, view lon 34 at most).

**Motion, desktop.** A horizontal drag turns the globe 73° plus 32° of inertia. A vertical drag changes latitude by 0.00. Frame p95 is 16.8–17.2 ms at rest, while dragging and in flights. The globe turns, the ring and pastel crossfade to the photograph in about 150 ms, and it leans in (`d-3r-handover-sheet.jpg`). Reset and Back climb out to the desk.

**Subject pages.** `/destinations/nl/` rests over the Netherlands (`s1-destinations-nl-desk-stage.png`). The NL dive hands off to the street map with no mush (`s3e-nl-handoff-sheet.jpg`). Zooming out stops at the desk, and the "−" button is then disabled (`s4-zoom.json`).

**Reduced motion** reaches every end state: the desktop group in 250 ms, the phone group and pin in 300 ms, no idle movement, and Back works (`s3-more.json`, `s4-reduced-phone-*.png`).

**The phone controls on home** now sit off the ring. The fold summary is readable, and "Hollow markers" appears once.

**What stops it going higher.** The phone is weaker than desktop: the drag feel, label collisions, and one page where the controls still cover the ring. The photograph below the desk still shows JPEG squares and borders drawn across the sea.

## What is left (ranked)

1. **Phone drag overshoots the finger.** A 220 px swipe turns the globe 142° while the finger is down (round 4: 83°), then coasts to about 190° in total (`p-motion.json`, `p-2c-drag-rec.json`). The globe runs ahead of the finger, so it does not feel held. Scale the drag gain by the on-screen globe radius so the point under the finger stays under it, and cap inertia at about 40°.
2. **Phone group end: labels collide.** The "10" cluster sits on "GB United Kingdom", "PT Portugal" is clipped at the left edge, and two rings have no label (`p-3-group-end.png`, `s4-reduced-phone-group.png`). Hide or offset any label that intersects a cluster, and keep labels inside the stage.
3. **Sea squares and borders in the sea below the desk.** At the end of the main Europe flight, the Tyrrhenian and Adriatic show blocky JPEG squares, and a border line runs down the middle of the Adriatic (`d-3-group-end-sea-crop.png`, also `d-5-place-end.png` Gulf of Oman). Apply round 4's advice to the photographic ocean: use a blurred sample for water pixels, and mask border ink where `pol.a` is water.
4. **The `/countries/` phone controls cover the ring.** "+ − Reset" overlap the ring's top-right (`s1-countries-phone-stage.png`; `s4-zoom.json` `countries-p.overlap`). Apply the home fix (a row above the ring) on every globe page.
5. **The desk is not "one zoom-out away" on `/destinations/nl/`.** It takes 4 presses of "−" on desktop and 5 on phone, with alt going 0.2 → 0.4 → 0.8 → 1.6 → 3.2 (`s4-zoom.json`, `s4-nl-desk-zoomout-pair.jpg`). Make the first "−" from a country rest go straight to the desk, as the owner asked.
6. **Reset re-merges clusters late.** For about 1 s after landing on the desk, Europe shows "5", "15", "2" and a pile of overlapping rings before they merge back to "40" (`d-4r-reset-rec-sheet.jpg`, 0.91–1.93 s). Re-cluster at desk scale before the climb ends.
7. **The phone fold has no gutter.** The "▶ Every place on the globe (55)" summary sits at x = 0 (`s4-zoom.json` `phoneLegend.left: 0`, `s1-home-phone-stage.png`).
8. **Cloud smears mid-dive.** At 0.6–0.7 of the flight the clouds render as stretched white streaks across the view (`d-3-group-f07.png`, `d-4r-reset-rec-sheet.jpg` at 0.60 s). Fade the clouds faster or clamp their stretch.
9. **Small items.**
   - The brass pole nub floats in the Arctic, away from the ring pivot, and reads as a stray place dot (`d-1-rest-globe-crop.png`).
   - On the NL close map, a lighter tile rectangle shows in the sea at the top-left (`s3e-destinations-nl-group-end.png`).
   - The palette shifts from warm to cool at the handoff to the close map (`s3e-nl-handoff-sheet.jpg`, 1.96–2.02 s).

## Bugs

| # | Bug | Evidence |
|---|---|---|
| 1 | Phone drag gain is about 1.7× the finger, with long inertia | `p-motion.json`, `p-2c-drag-rec-sheet.jpg` |
| 2 | Phone group end: the "10" covers the "United Kingdom" label and "Portugal" is clipped | `p-3-group-end.png`, `s4-reduced-phone-group.png` |
| 3 | JPEG squares in the sea, and a border line down the Adriatic | `d-3-group-end-sea-crop.png`, `d-5-place-end.png` |
| 4 | `/countries/` phone controls overlap the ring | `s1-countries-phone-stage.png` |
| 5 | The NL page's desk is 4–5 "−" presses away, not one | `s4-zoom.json`, `s4-nl-desk-zoomout-pair.jpg` |
| 6 | After Reset, split clusters pile up on the desk for about 1 s | `d-4r-reset-rec-sheet.jpg` |
| 7 | The phone fold summary has no side gutter | `s1-home-phone-stage.png` |
| 8 | Stretched cloud streaks mid-dive | `d-3-group-f07.png` |
| 9 | Pole nub reads as a place dot | `d-1-rest-globe-crop.png` |
| 10 | Tile seam rectangle on the NL close map | `s3e-destinations-nl-group-end.png` |
| 11 | The mouse wheel over the desk scrolls the page (the known "take hold first" rule), so desktop has no wheel lean-in | `s3-more.json` `wheel` |
| 12 | Build: `localhost:4350` served a production-base `dist`, so every asset returned 404 | this note |

Harness: round 4's scripts, copied; `s4-zoom.mjs` (zoom-out, reduced-motion phone group, layout checks); `fsheet.py` (fine frame sheets).
