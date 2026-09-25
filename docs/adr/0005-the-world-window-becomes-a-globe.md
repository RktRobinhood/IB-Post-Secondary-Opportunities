# The world window becomes a globe: the owner's call, and how this build pays 0004's costs

Supersedes [ADR 0004](0004-the-world-window-stays-flat.md).

## What forced the decision

ADR 0004 declined the globe on measurements: an orthographic disc uses a third
of a wide panel, a third of the list highlights markers behind the planet, and
the geometry moves from the HTML into a second request. Those measurements were
honest. They answered the question 0004 asked — *does geographic motion help a
student find an option faster than a static map?* — and the answer was no.

On 24 September 2026 the site owner asked a different question, and answered
it himself:

> The map drives me crazy. It's not interactive enough — you need to be able
> to click on things. … What I'm really imagining is a 3D sphere that rotates,
> so you can see pins, and it rotates to the place you're looking at. …
> zooming into universities when you click on an area, or zooming into
> countries, with zoom-in and zoom-out animations, maybe passing through the
> clouds. … Make something really, really interesting where they feel they
> have the whole world, and of course they can click it, drag it and spin it.

0004 itself named this as the evidence that would overturn it fastest: "whether
a student remembers the site … Nobody has put either map in front of a
sixteen-year-old yet." The owner works with those sixteen-year-olds every day.
His judgement is that the flat map fails the half of the question 0004 could
not measure — whether the site feels like a world worth exploring — and that
is his call to make.

## The decision

**The world window is a globe wherever `worldWindow()` is used**: `/programmes/`,
`/europe/`, `/world/` and every Destination page. It is hand-written raw
WebGL 1 — a textured Earth (NASA Blue Marble), a drifting cloud layer (NASA),
an atmosphere, stars, faint country borders, pins in the site's own palette
that group and split with the zoom, and a camera that flies: pull out, travel,
dive in, through the clouds on the way down and back out through them on the
way up. **Close to the ground it hands the camera to MapLibre GL JS** (below,
"Round 1: the close map"), which draws satellite imagery and a street map down
to campus level.

The owner first asked for no libraries (he later allowed them — see below), and 0004 had already found the one thing a
library would have fixed — clipping filled polygons to the limb on a 2D canvas
— to be the thing that did not matter. On WebGL the sphere is a mesh and the
depth buffer does the clipping, so that limitation is gone rather than
papered over.

## Round 1: the close map (25 September 2026)

The first critic round scored the globe 6/10, and the lowest marks were for the
payoff the owner asked for by name, "zooming into universities": at the closest
zoom a 2048-wide Blue Marble is a green smear, 20 km to a texel. A bigger
texture helps down to region level (the globe now also lazy-loads a 4096 day
map and a Europe detail crop, ~57 pixels a degree) but no global texture
reaches a campus.

The owner then allowed libraries ("if there are existing resources you can
leverage, use them"). The decision:

- **The hand-written globe keeps everything from space down to about 750 km**:
  the far view, the spin, the flights and the dive through the clouds, which
  is what the owner said looks good.
- **Below that, MapLibre GL JS 5.24.0 takes the camera**, in its own globe
  projection, at exactly the same centre, scale and pitch, and cross-fades in;
  zooming back out past a slightly higher altitude hands the camera back. The
  globe's field of view was changed to MapLibre's (36.87°) so the perspective
  does not jump, the globe's lens shift becomes MapLibre's top padding, and the
  zoom is computed from metres-per-pixel at the centre, calibrated on the map
  itself. Measured seam between the two engines at the handoff: **about 1.4
  px** worst case over the places in view.
- A place known to its campus or institution dives to street level (zoom 15),
  a city to the city (11.5); a place known only to its country stays on the
  globe. Pins, labels and cards are the globe's own throughout, positioned by
  MapLibre's projection while it has the camera.
- **Tiles, no keys:** EOxCloudless 2024 Sentinel-2 satellite imagery (EOX's
  terms allow non-commercial use with attribution; this is a free school
  guide — if that ever changes, the layer must be licensed or removed),
  fading into the OpenFreeMap street map (OpenStreetMap data, ODbL) as the
  camera comes down to street level. Both credited in the map and on /credits/.
- **Vendored, not installed or hot-linked**: `src/assets/vendor/maplibre-gl/`
  (1.06 MB, 277 kB gzip, BSD-3, checksum in its README). The build stays
  dependency-free, a school network that blocks a CDN still gets the map, and
  nothing of it loads on first paint: `globe-close.js` injects it on the first
  sign of a dive (taking hold of the globe, hovering a list entry that can
  dive, or the camera coming below ~1,900 km).
- On a touch screen the close map uses MapLibre's cooperative gestures (one
  finger scrolls the page, two move the map), and the globe itself lets go of
  a finger four seconds after its last gesture.

Round 1 also fixed three false statements the globe made (Denmark "not
covered" — `destinations.json` now comes from every Destination record with
its real page; twelve Danish cities called "one spot"; Canada's light in
Minnesota — a country's light is now the medoid of its own places, guarded by a
test that every light is inside its own country), closed cards whose subject
has left the view, framed whole-world pages on the most places, made journeys
climb through the cloud deck so the dive happens on /programmes/ too, and
hands a machine that would draw the globe in software, or too slowly, the flat
map instead.

## How this build answers each of 0004's costs

**The panel.** 0004's central number was the disc using 33.3% of a 960 x 460
panel, and Europe shrinking to a 63 x 72 px blob. This globe never rests as a
disc in a box. The camera has a pitch and a lens shift that grow as it comes
down, so at rest the planet is large and cropped with the horizon curving
across the top of the frame, and the places the page holds fill the room
beneath it. The resting camera is fitted numerically to those places (every
one inside the frame, then re-centred), clamped between an altitude where the
horizon is still in view and one where the globe is still bigger than the
panel. `/europe/` at rest spans Iceland to Greece across the full width; a
whole-world page rests on a globe that overfills the panel and turns. The panel
also went from 2.38:1 to 2:1 (square on a phone) so the horizon has room.

**Occlusion.** A pin behind the planet is still behind the planet. 0004's
answer — flying the camera on every focus move — was rejected because it was
"motion that explains nothing". What changed is not the analysis but the brief:
the owner *wants* activating a place to fly there. So hovering or focusing a
list entry lights its pin (as before), and *activating* one flies the globe to
it and opens its card. The flight is the explanation. Focus alone does not move
the camera.

**Bytes and first paint.** The flat SVG is still built into every page and is
still the first paint, the no-JavaScript map and the no-WebGL map. `map.js`
checks for WebGL, waits until the figure is within a screen of the viewport,
then imports `globe.js` and fetches its first-frame textures (437 kB since
round 1) and the 110m borders (80 kB raw); the SVG cross-fades out only after the globe's first frame. A finer
Natural Earth 50m border layer (134 kB gzip) is fetched only the first time the
camera comes close enough for the 110m outlines to look like polygons. If
anything fails — no WebGL, a refused context, a lost context, a failed fetch —
the flat map's own interaction layer (`map-flat.js`, the code that shipped
before, unchanged) takes over. `?map=flat` forces it for testing.

**Accessibility.** The list under the map is still the control surface: every
place is a real link in the served HTML, pins are `aria-hidden` and never
focusable, and the list works with JavaScript off. The stage is one focusable
group with arrow keys, + / −, 0 and Escape; the buttons are real buttons; the
card is a labelled region whose action is a real link (so the site's new-tab
rule applies to it) and whose close button returns focus to the list entry
that opened it. A polite live region says where the camera went.

**Motion.** Reduced motion — the operating system's setting or the site's own
toggle — makes every camera change instant, stops the idle spin, stops the
cloud drift, and skips the cloud rush and the cross-fade. The reader still
arrives; they are not flown. Rendering stops when the map is offscreen or the
tab is hidden, runs only while something moves, and caps the pixel ratio at 2.
The wheel zooms only after the reader has taken hold of the globe (a click or
a drag) or with Ctrl/⌘; a wheel passing over it scrolls the page and shows a
one-line hint. On a phone `touch-action` stays `pan-y` until a tap or a
sideways drag takes hold, so a thumb scrolling up the page still scrolls it.

**No country branches.** The engine knows no country. A page's resting camera
comes from its places; a single-country page's outline comes from all its
places sharing one `country`; a clicked country's card and link come from the
Destination records via `assets/geo/destinations.json`; a place's country comes
from its record, or from a picking raster when the record is silent.

## What this costs, stated plainly

- A second, larger asset set on every page with a map (about 540 kB for the
  first globe frame; the 4096 map, the Europe detail, the finer borders and
  the close map — about 1.3 MB more — only for a reader who goes close),
  all after first paint. 0004's bytes argument is paid, not refuted.
- Two third-party tile services at close zoom. If either is down, the globe
  stays on its own and clamps at its closest altitude.
- On a narrow set such as one Destination's institutions, the resting camera
  is further out than the flat map's frame was, so pins group sooner; clicking a
  group dives until it splits.
- A vendored library to upgrade by hand (steps in its README).
- A new engine to maintain. `scripts/test-map.mjs` now guards the fallback
  and reduced-motion guarantees by reading the source back, and
  `docs/research/qa/globe/shoot.mjs` produces the same screenshots every run.

## What would change this

A student-facing measurement that the globe makes a task slower or less
accessible than the flat map did — timed, with real students — is the evidence
0004 asked for and still the best. The flat map is one query parameter away,
so the comparison is cheap to run.
