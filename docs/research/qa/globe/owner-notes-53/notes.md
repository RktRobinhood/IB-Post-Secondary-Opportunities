# Owner's notes on #53: what changed, with evidence

26 September 2026. The owner's notes on issue #53, in the order they were done.
Decision record: [ADR 0007](../../../../adr/0007-the-flat-map-is-removed.md).
Screenshots: `shoot53.mjs` beside this file (the harness of `../shoot.mjs`, cut
down), headless Chromium with SwiftShader, pages opened with `?map=globe`
because the globe refuses a software renderer on purpose. Numbers:
`report.json` (after) and `report-before.json` (the code before this change,
built from `HEAD` into a scratch folder and served on another port).

## 1. The old flat map is gone

- `worldWindow()` (`src/lib/primitives.mjs`) writes no SVG, no coastline and no
  markers: an empty transparent stage the size the globe will be, the places as
  JSON, the list, and a hidden line "This browser cannot draw the globe. Every
  place is in the list below."
- Deleted: `src/assets/js/map-flat.js` (780 lines), the projection, framing and
  coastline code in `primitives.mjs`, and the flat map's CSS (sea, land,
  markers, groups, spider legs, callouts). `map.js` no longer falls back to a
  flat map: where the globe cannot run (no JavaScript, no WebGL, a software
  renderer, a lost context, slow frames) the figure is `data-globe="off"`, the
  stage is not shown, the line is, and a folded list opens (`?map=off` forces
  it; `?map=flat` is gone). The head script sets `data-js` before first paint
  so a no-JavaScript reader never sees an empty stage.
- HTML got smaller: home 317 → 268 kB, `/countries/` 142 → 107 kB,
  `/destinations/nl/` 124 → 110 kB (with the new schools data included).

| Shot | What it shows |
|---|---|
| `00-before-home-desk-light-200ms.jpg` | **Before**, 200 ms after navigation: the flat map with its hollow rings is the first paint, on a dark band (57 flat-map elements in the DOM) |
| `00-before-home-desk-light-load.jpg`, `00-before-home-desk-light-globe.jpg` | Before: the flat map still up at the load event, then replaced by the globe — the flash the owner saw |
| `00-before-countries-desk-light-200ms.jpg`, `…-load.jpg`, `…-globe.jpg` | The same on `/countries/` (37 flat-map elements) |
| `01-home-desk-light-200ms.jpg` | **After**, 200 ms: the stage is empty paper; no map of any kind (0 flat-map elements; the stage holds only the JSON) |
| `01-home-desk-light-load.jpg` | After, the load event + 300 ms: the globe has landed, nothing else came first |
| `01-countries-desk-light-200ms.jpg`, `01-countries-desk-light-load.jpg` | The same on `/countries/` |
| `09-home-no-globe.jpg` | `?map=off` (as with no WebGL): one line and the list, opened, in the globe's column |
| `09-countries-no-globe.jpg` | The same on `/countries/` |

## 2. The globe floats

The stage has no background and no border in either theme, and the home
page's band is the page's own paper (it was a night sky, `#03050b`, in both
themes: "obstructive in the light mode"). Its title, doors, caption and fold
now take the theme's tokens. The canvas was already transparent.

| Shot | What it shows |
|---|---|
| `02-home-desk-light.jpg`, `02-home-desk-dark.jpg` | Home at rest, desktop, both themes |
| `02-home-phone-light.jpg`, `02-home-phone-dark.jpg` | Home at rest, phone |
| `02-countries-desk-light.jpg`, `02-countries-desk-dark.jpg` | `/countries/` at rest, desktop |
| `02-countries-phone-light.jpg`, `02-countries-phone-dark.jpg` | `/countries/` at rest, phone |

## 3. The card is the link

A card on the globe has one link, in its title, stretched over the whole card
(`::after`, `inset: 0`), so a click anywhere on the photo, title or lines
follows it. The close button and a country card's list of places sit above it
and stay buttons; nothing interactive is nested in the link. The visible
"Open … →" line is `aria-hidden`; the link says it for a screen reader.
`report.json`: `card.links: 1`, `nestedInteractive: 0`; a click at the
bottom of the card's body (not on the title) went to `/destinations/us/`.

| Shot | What it shows |
|---|---|
| `04-countries-us-schools-and-card.jpg` | The United States card, one link |
| `05-card-click-landed.jpg` | After clicking the card's body: the United States page |
| `07-countries-harvard-card.jpg` | A school's card links to its own page (`/universities/us-harvard/`) |

## 4. Country lights sit in the middle of the country

The light was the medoid of a country's campuses (ADR 0005 round 1), which
is a campus: the United States' light was near Detroit (42.3, −83.7), 51 km
from Lake Erie; Canada's by Lake Ontario; Australia's in Canberra. It is now
`visualCentre()` of the country's own Natural Earth 50m outline
(`src/lib/geo.mjs`): the area centroid of its main land (the largest ring and
any at least a third its size) when that is well inside, otherwise the nearest
point to it that is. The medoid is the fallback for a country with no outline.

| Country | Before (medoid) | After |
|---|---|---|
| United States | 42.3, −83.7 (Detroit area) | 39.1, −98.8 (Kansas) |
| Canada | 43.5, −80.5 (Ontario) | 55.7, −101.6 (northern Manitoba) |
| Australia | −35.3, 149.1 (Canberra) | −25.3, 134.2 (the centre) |
| China | 31.4, 120.9 (Shanghai area) | 36.0, 103.3 |
| Sweden | 58.4, 15.6 | 62.4, 15.8 |
| New Zealand | −41.3, 174.8 (Wellington, on the coast) | −41.8, 172.9 |

| Shot | What it shows |
|---|---|
| `03-countries-us-light-centred.jpg` | The United States and Canada lights in the middle of each country |

## 5. Zooming into a country shows its schools

A country's light now carries the institutions inside it that have a position
and a page (`schoolsOf()`, on `/` and `/countries/`). Far out it is one light
at the country's middle; once the camera is close to that country (its schools
would spread over more than half the stage, or the camera is down at 0.45
Earth radii, the altitude a chosen place is flown to) it gives way to one pin
per institution. They group and split with the zoom exactly as Europe's places
do, and a school's card links to its page. A school pin is a small solid dot,
without the country light's glow, so the two levels read differently.

| Shot | What it shows |
|---|---|
| `04-countries-us-schools-and-card.jpg` | The US chosen: its light gives way to its schools (Macalester, Grinnell, Illinois, Michigan, groups "4") |
| `06-countries-us-east-schools.jpg` | Lower over the east coast: Yale, NYU, Amherst and groups that split as you zoom |
| `08-home-europe-schools.jpg` | Home, over northern Europe at 0.42 radii: the countries opened into their schools (19 single pins, 35 groups) |

## Guards (`scripts/test-map.mjs`, the gate's `map` check)

Removed with the flat map, because they protected only it: the coastline and
land opacities, the recorded contrast ratios, `preserveAspectRatio="xMidYMid
slice"`, the flat map's 44 px hit radius in viewBox units, its pinch and
`pan-y` and no-wheel checks, and "the SVG is hidden only once the globe has
drawn". Kept (moved to the globe where they were the flat map's): the narrow
stage shape, 44 px controls, the disabled-button rule, pinch and double-click
zoom, the wheel and `pan-y` rules, the fallback triggers (now to the list).
New: no SVG or basemap in `worldWindow()` and no `map-flat`; the stage is
empty and keeps its size; the stage is transparent and borderless and nothing
holding the globe paints a dark background; the stage is hidden only with the
globe off or JavaScript off, and the line shows then; the card is one
stretched link with nothing nested; the canvas fades in only after its first
frame; every country light is at least a third as deep in its country as the
deepest point; every positioned institution rides on its country's light and
the globe opens it.

## Not done, or worth a look

- The street-level map after a school dive could not be shown here: this
  sandbox has no network, so MapLibre's tiles do not load (the console's one
  warning). Harvard and MIT stay one group of 2 without it.
- On home the unit is "degree" but a country's light and its schools count
  institutions (a group of US schools reads "3"). That mismatch predates this
  change (a country light already said "14 degrees" for 14 institutions); it
  wants its own fix.
- Where the globe cannot run the reader now gets no picture at all. If school
  laptops without a GPU turn out to be common, a static still of the globe in
  the stage is the next step (ADR 0007), not the flat map back.
- Not re-critiqued. A critic round on the floating home band and the schools
  level would be the next step.
