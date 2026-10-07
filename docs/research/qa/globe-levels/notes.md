# Globe levels — running log

Written as the work happens so it survives a dead session.

## Brief (owner, 6 October 2026)

The home globe "has too many granular zoom settings and gets quite confused";
it "struggles to focus" and can scroll to street level. Keep the whole-planet
desk view ("I love what that looks like"). Instead, levels that line up with
the template structure:

1. **World** — one bubble per continent/region with its number.
2. **Region** — click a region: the camera zooms to it and it subdivides into
   **one node per country** (never countries grouped together), each with its
   number.
3. **Country** — click a country's node or its outline: zoom to the country,
   its card (→ the country page), and its **individual universities** as pins.
4. **University** — click one: its card (→ the university page).

A student can enter the site at the country level or the university level.
Aesthetic pass too. Two critics — functionality and aesthetic — must both
score 8+ before it is done.

## Design

- **Levels are state, not altitude.** `lv = { level, region, country }`. The
  camera goes to each level's frame; zoom input steps a level instead of
  sliding through altitudes. No close map (MapLibre) and no street level on a
  levels page.
- **Which pages:** a globe whose places are all country lights (precision
  `region`) in more than one country, with a region known for them: the home
  page (changed to one light per Destination, like /countries/) and
  /countries/. Single-country pages keep their behaviour.
- **Regions from the records.** Each Destination record has `scope` and
  `region`; `data/geo/continents.json` maps those words to a continent (a
  vocabulary, no country named). `destinations.json` carries `continent` and
  `continentName` per Destination.
- **Numbers are universities**, the pins the next level shows. The home page's
  filters still re-weight them: a university with no matching degree dims when
  a degree filter is on; a country's number is its lit universities.
- **No overlap without grouping:** region bubbles, country nodes and university
  pins are relaxed apart on screen (warm-started each frame), with a thin
  leader line back to the true spot when moved.
- **Input:** a click on a bubble/node/outline steps in; +/− and the wheel and a
  pinch step one level; double-click steps in at the point; drag still spins.
  A trail ("World › Europe › Denmark") names the level and steps back up.
- **History:** every level step is a choice: pushState, Back undoes it.

## Log

- **Built (dev-0).** `data/geo/continents.json` + `src/lib/continents.mjs`;
  `destinations.json` carries `continent`/`continentName`. Home's globe is one
  light per Destination with its universities (`schoolsOf` now carries the
  catalogue id `inst`). globe.js "Levels": `lv`, `clusterLevels`,
  `layoutLevels` (relax + threads), `goToRegion`, `goToSchool`, `levelStep`,
  the trail, wheel/pinch/keys/buttons as level steps, no close map.
  discover.js: counts per university id; region choices narrow cards like a
  group dive; Nearby door opens the continent.
- **dev-0 fixes:** Europe framed too far out (the sphere floor does not suit a
  tall stage → floor 0.3); clouds hid the countries (veil only in flight);
  the desk faced between Europe and Asia (now weighted by continent²); the
  country fit diverged with the card's room on the left (now fit symmetric,
  then slide); a country's choice greyed its neighbours (the globe's own
  choice now narrows the cards only); nodes burst on the desk at click (now
  swap at half way and pop in).
- **dev-1…3 fixes:** card docked along the bottom on a wide stage (horizontal,
  photo left) and the country framed above it (`fitCamera({ below })`, solved
  symmetric then slid); continent frames may rise to just under the desk;
  `canonicalId` is the catalogue id the degrees name; one wheel swipe = one
  step (lock ≥ 900 ms); Back re-derives which filters were the globe's; the
  trail's "World" is a little globe on a phone and Reset hides while the trail
  shows; desk nodes are kept inside the globe's disc; guards in
  `scripts/test-map.mjs` "Levels".
- **Round 1 shot** (`round-1/`, `shoot.mjs`): 42 frames, console clean. Two
  critics launched in parallel: art director (`critique-art.md`) and
  functionality (`critique-func.md`).
- Seen while waiting: in flight, labels arrived before their coins (now the
  whole node fades in with the pop); Europe's coin sat over Belarus (now on the
  universities-weighted medoid country).

## Round 1 — art director 6/10, functionality 5/10

`round-1/critique-art.md`, `round-1/critique-func.md` (probes in `round-1/func/`).

Fixed since (dev-4…dev-7, port 4400 build in D:/ibp-tmp/dist-levels):
- **Pin you see = pin you get** (blocker B1): a click resolves to the nearest
  drawn node centre (`levelsClick`, `lvHit`), not the overlapping 32 px
  targets; schools spaced 7 px (12 on touch). Real-click probe
  (`shoot.mjs ONLY=pinclicks`, every university of 18 countries, live
  positions): **0/233 wrong on desktop and on a phone** (was 46% / 56%).
- Double click: a repeat on the same node, or a click < 450 ms after a level
  change, is dropped; two quick taps on two pins are two choices.
- History: entries stamp the level (`lv`); Back restores it; a page's own
  reframe in the same popstate (a door) wins (`shownAt === popAt`); a typed
  `#region=…` is followed; deep links use `countryFor` (microstates).
- Trail redraw no longer lets its click fall through to the coin below.
- Numbers: 52 universities had no place → all placed (sourced, see
  `places-log.md`); globe = tile counts now (UK 22, Japan 15…). Country card
  programmes = the list's card count (`deg:<code>`). Validator reads the 50m
  outline (the Azores were "16° adrift").
- Names: every country coin named — flag + name placed below/right/left/above,
  else its flag alone (`LABEL_SPOTS`); coins stay near home. Continent coins on
  the country with the most universities near them (medoid).
- World level: continents round the back wait at the rim (North America,
  Oceania). Country level: no other continents ("ghost coins").
- Look: continent level keeps the desk globe's pastel countries and ink coasts;
  political raster 2048; finer 50m borders (0.015°, 259 KB gzip, lazy);
  route a dotted brass arc that fades in 0.65 s; old level fades by 30% of a
  flight, new pops at 50%; hover outlines under the coins; softer edge fade.
- Cards: desktop docks bottom (photo left); country = flag, name, hook line,
  "N universities · N programmes", 3 university chips (6 on a phone) — also
  the keyboard's way to a university; no status lines.
- Phone: stage grows near-square below the world level; trail keeps "World";
  count pill hidden while the globe card shows; Reset hides while the trail shows.
- Frames: continents on their countries' outlines; a country whose outline
  dwarfs its universities (China, Canada) frames the universities; far
  outposts (Azores) do not shrink a mainland.

**Paused 6 Oct ~21:15 UTC at 71% of the 5-hour window (ceiling 70%).**
Next: sync D:/ibp-tmp/dist-levels to the preview (or serve it), shoot round 2
(`ROUND=round-2`, all scenarios + `pinclicks`), and give both critics the
round-1 critiques plus the new frames; iterate to 8+ (max 5 rounds). Then the
full gate on D:/ibp-tmp clean copy, merge to main, push, check the deploy.
Open from round 1 not yet addressed: keyboard reach to the stage (m2), deep
links narrowing the cards (m7), a brass bezel round the satellite stage.

## Rounds 2–5

| Round | Art | Functionality | Folder |
|---|---|---|---|
| 1 | 6 | 5 | round-1/ |
| 2 | 6 | 5 | round-2/ |
| 3 | 6 | — (fixes first) | round-3/ |
| 4 | 7 | 7 | round-4/ |
| 5 | 7 (desk ~8, phone ~6.5) | **8 — accepted** | round-5/ |

Functionality accepted at round 5. Art stopped at the five-round limit
(docs/QA_CRITIC_LOOP.md) at 7/10; its remaining fixes are filed as a GitHub
issue (see STATUS.md) and the work stays live, being better than before.
Round-5 functional leftovers fixed straight after: the NASA credit moved to
the top of the stage (a phone's pin lay under the link); Escape on a
university's card returns focus to the globe.
