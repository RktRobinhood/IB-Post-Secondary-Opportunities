# #53 round 2: fixes, item by item

Answers `../critique-round-1.md` (art director and motion critic, 7/10) and the
owner's own phone notes on the live globe, which came first. Shots and
numbers: `shoot.mjs` → `report.json` and the JPEGs beside this file (headless
Chromium with SwiftShader, `?map=globe`, no network, so the street-level
tiles never load). Gate: `SITE_BASE=/IB-Post-Secondary-Opportunities node
scripts/qa.mjs`, 35 of 35.

## The owner's phone notes (top priority)

| Note | Fix | Evidence |
|---|---|---|
| The card shows a visible "Open United States →" line | Gone from every card (country, place, school). The title is the one link, stretched over the card, with a small accent arrow after it that moves under the pointer. The link's accessible name still says where it goes ("United States — Open United States"). | `03-phone-home-us-arrived.jpg`, `05-…`, `06-…`; `report.json` `visibleOpenLine: false`, `links: 1` |
| The card "flashes": a first card, then a fuller one | Caused by the phone card being folded to its title during the flight and unfolded on arrival (`foldCard` / `data-collapsed`), plus a lazy photograph. Both removed: a card is drawn once, in its final form, and its photograph is fetched at once into a reserved box. | `03-phone-home-us-60ms.jpg`, `-460ms`, `-arrived`: the same card element (`sameAsFirst: true`), the same height (224 px) at 60 ms, 460 ms and after the flight |
| + − RESET on top of the globe | On a phone the buttons are a row above the stage (and their room is kept from the first paint, so nothing jumps). | `02-home-phone-*.jpg`, `02-countries-phone-*.jpg`; `report.json` `controls-*-phone`: outside the stage, 22–26 px clear of the ring at 390×844 |
| The card covers most of the stage | On a phone the card is a sheet below the stage, full width; the chosen country owns the whole stage. | `03-phone-home-us-arrived.jpg` (`overStage: false`) |
| The stage is a hard-edged rectangle of imagery | See critique item 1 below. | `05`, `07`, `08` |
| "Placed at the country, not at a campus" means nothing | Dropped from a country's card (a city's card still says it is placed at the city). The list keeps the cue for screen readers. | `03-…arrived.jpg` |

Guards (`scripts/test-map.mjs`): no `world__card-go` and no visible label line
in `cardLink()`; the link names its destination; no `foldCard`,
`dataset.collapsed` or `data-collapsed`; `placeCard()` and `countryCard()`
each call `openCard()` once and load no lazy photograph; the card photo has a
reserved aspect ratio.

## Critique round 1, ranked changes

### 1. Keep the zoomed globe a sphere; frame arrivals on what matters

- **Feathered, rounded stage.** The globe's canvas and the close map fade into
  the paper over the last 40 px on every side (`mask-image`), and the stage has
  rounded corners. Pins, buttons and card are not masked. The home stage keeps
  a 16 px gutter on both sides.
- **A sphere floor.** `sphereAlt()` in `globe.js` finds, against the real
  camera, the lowest altitude at which the stage's upper corners and its
  sides a third of the way down still look past the Earth. A country's light,
  a region, and a group of countries stop there: the curved limb and paper
  stay in view (`05-countries-us-framed.jpg` at alt 0.52,
  `07-countries-big-group.jpg` at 0.56). Only a dive onto a group of schools
  or a campus goes lower, into the full (feathered) stage.
- **The atmosphere's band fades as the camera comes down** (halo strength ×
  0.3–1 between alt 0.3 and 1.3), so a lean-in has no blue slab across the top.
- **A chosen country is framed on its schools**: `fitCamera()` over the light
  and `p.subs` (pad as `openGroup`), not a fly to 0.32 over its centre. The
  United States arrives with Arizona to Michigan and the east coast groups in
  frame (`05`). Choosing a country (its light or its outline) opens it into its
  schools whatever the altitude; the next choice, Reset or Back closes it.
- **A group dive stops at the countries level.** A group holding country
  lights dives no lower than `max(1.25 × SCHOOLS_ALT, sphereAlt())`: the "281"
  on `/countries/` now opens into 19 named country lights and 2 groups, 0
  schools (`07`; round 1: 31 school groups and 20 acronyms). Schools open on
  the next choice or zoom (`08`).

### 2. The phone shows what was chosen

- Card below the stage, buttons above it: above, with the guard that `globe.js`
  moves both out of the stage under `(max-width: 44rem)` and the CSS keeps them
  static. Measured at 390×844 in `report.json`.
- **The Denmark door** lands on Denmark's own places, framed on them and
  allowed down to just above the street map (a country with several places;
  0.2 kept Denmark as one "56" on a 358 px stage): Denmark now reads 27, 14,
  Sønderborg and single lights (`04-phone-home-denmark-door.jpg`). Copenhagen's
  and East Jutland's towns are still grouped at this size.

### 3. The schools level has names and photographs

- `schoolsOf()` names a school with `readableName(i)`: its short name when that
  is a word (Yale, McGill, Durham), else its full name ("University of Central
  Florida", not "UCF"). `report.json`: 0 initials among visible labels on
  every shot. A long name that has no room loses its label, as any label does.
- Every school carries `picture(site, key)`: its card opens on its campus
  (`06-countries-school-card.jpg`, Michigan).
- **Denmark's photograph**: a country's picture is now `countryPicture()` — its
  own, or its first hosted institution's, the same one its tile uses — for the
  lights on `/countries/` and home and for every country's card on the globe
  (`destinations.json` carries `image`). `04` shows Denmark's card with AAU's
  photograph.
- Guards: no school named by initials where the record has a full name (ESADE
  is its own full name); at least 80% of schools carry a photograph; the
  country cards' `image` is written by the build.

## Also done

- **The still of the desk globe as the stage's poster**
  (`scripts/make-globe-poster.mjs`, new). For home and `/countries/`, light and
  dark: the desk globe at its resting pose, ring and stand, on transparency,
  600×700 WebP, 55–57 kB each (only the theme's one is fetched). It is placed
  with container units exactly where `deskAltFor()` will draw the globe, the
  canvas fades in over it, then it fades out. `01-home-desk-200ms.jpg` vs
  `01-home-desk-globe.jpg` and the phone pair: the globe lands on its own
  picture. Where the globe cannot run (`10-home-*-no-globe.jpg`) the still
  stays, one line says where the places are, and "All places" stays folded
  (round 1: the hero became 55 chips). Other pages (a Destination rests on its
  country, not the desk) have no poster and keep the empty stage, then the
  list without WebGL.
- **One unit on home.** A country that has no degree on the page is now a
  "door": its light and its card count institutions ("14 institutions", not
  "14 degrees"), and a group made only of doors and schools says how many
  places it holds and is drawn hollow. The Nearby door says 16 degrees and the
  globe's degree group says 16 (`09-home-nearby-door.jpg`; round 1: 35, 28,
  33). "How to use the globe" says: "A hollow group counts countries or
  schools, not degrees."
- The repo's shared `dist/` was not touched; builds were only in this worktree.

## Not done

- **Round-5 leftovers** (critique item 7): label collisions under groups, JPEG
  squares in the photographic sea, cloud streaks at ~0.75 of a dive.
- Denmark on a phone is open to 7 lights and groups, not every town: the
  stage is 358 px and PIN_GAP is a finger.
- The poster's pose is the page's resting pose when it was made: if the
  weight of a page's places moves, remake it (the script says when).
- The halo still shows as a thin pale band along the horizon when leaned in
  (fainter than round 1).
- Not re-critiqued.
