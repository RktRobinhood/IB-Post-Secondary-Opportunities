# #53 round 3: fixes, item by item

This answers `../critique-round-2.md` (7.5/10).

- **Evidence:** `shoot.mjs` produced `report.json` and the JPEGs beside this file. The shots were taken in headless Chromium with SwiftShader, using `?map=globe`. There was no network, so the street-map tiles never load.
- **Gate:** `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs` passes 37 of 37.

## The owner's own test: phone, tap the United States

| Frame | Shot | Measured (`report.json` → `phoneUs`) |
|---|---|---|
| 60 ms | `03-phone-home-us-60ms.jpg` | One card, already final. The US light is a single dot; nothing is on the brass ring. |
| 400 ms | `03-phone-home-us-400ms.jpg` | The same card element (`sameAsFirst: true`), 224 px, mid-turn. |
| Arrived | `03-phone-home-us-arrived.jpg` | The same card. Alt 1.45: the Earth's edge shows on top and at both sides. |

On arrival:
- The US shows as groups 2, 4 and 7, plus Arizona State University.
- `chosen.visibleSum` is 14, which equals the light's count (14) and the card ("14 institutions").
- `mixedGroups: 0`: no group holds another country's schools. Canada is one faded light.
- `labelsOverGroups: []`.

## 1. A clean, consistent arrival on a chosen country

- **Only the chosen country's schools group.**
  - Clustering keeps two sides: the chosen country, and everything else (`chosenSide()` in `near()` and in the overlap merge). A US group can never take in a Canadian school, and the country's light never merges with a neighbour.
  - While a country is chosen, no other country opens into schools. Its neighbours stay single lights at 45% opacity, without labels.
  - So every number on the stage is the chosen country's, and they add up to its total: 14 on the phone, and 14 on desktop `/countries/` (`countriesUs.chosen`).
- **The country's light shows no competing number.**
  - While the country is closed, its light is a single dot. The "12" and "15" in round 2 came from merges, which can no longer happen.
  - Once open, its groups count schools, and those counts sum to the card's number.
- **Labels are placed after all pins and groups.**
  - Labels are placed after every group and pin is positioned. Priority order: the selected place, lit places, the chosen country's places, then size.
  - Each label goes right, else flips left, else is dropped. It is never drawn across a group, another pin, another label, the buttons, the card, the stage edge or the ring.
  - A lit pin used to show its label regardless (`[data-on] .world__pin-label { display: block }`). That rule is gone, and it was the "Michigan on a 4" case.
  - Measured: no label crosses a group in any shot (`labelsOverGroups` is empty for the phone US view, desktop US, the big group and Europe).
- **Schools open only once they face you, and nothing rides the ring.**
  - A chosen country opens into its schools only when its centre faces the camera (`facing > 0.3`) and the desk has faded.
  - On the desk, any pin, group or label past the globe's disc on screen (`globeDisc()`) is not drawn. At 60 ms the stage shows the US light on the globe's face, and nothing on the brass.
- **Guards:** `test-map.mjs` "a chosen country arrives clean" covers:
  - the side test in grouping and merging;
  - no neighbour opening while a country is chosen;
  - facing plus off-desk before opening;
  - labels placed after the groups loop and checked against obstacles;
  - groups kept off the ring;
  - no forced label display for lit pins.

  The two browser measurements (sum equals count, no label on a group) are in `shoot.mjs` → `report.json`.

## 2. A country's lean-in lands on a sphere

- **`sphereAlt()` now needs the limb on top, left and right.** Five stage points must look past the Earth: the top corners, the top middle, and both sides at half height.
  - Phone: the United States lands at alt 1.45 on a whole curved Earth.
  - Desktop `/countries/`: it lands at 0.52, with both flanks curving away.
  - The full feathered stage is kept for a group of schools, a campus or a later zoom.
- **No clouds below about alt 1.3.** `cloudAlpha` is `smooth(1.3, 1.9, alt)`. This removes the white blobs over the schools and the diagonal streak.
- **No blocky sea.**
  - Water pixels now take an eight-tap average from 2.5 texels out (`soft()` in `EARTH_FS`), and the water mask is taken from that average. Land keeps its sharp sample.
  - This is done in the shader over the textures already in the repo; nothing was downloaded.
  - `09-home-nearby-door.jpg`: the North Sea, the Mediterranean and the Adriatic are smooth.

## 3. First paint and small honesty issues

- **The still of the globe.**
  - It is now a `<picture>`: the system theme picks light or dark, and it loads with `loading="eager" fetchpriority="high"`.
  - Home also preloads it in the `<head>`, per `prefers-color-scheme` (new `preload` option on `page()`, `posterPreload()`).
  - The alpha channel is now lossless (`alphaQuality: 100`). Lossy alpha had flattened the halo into a grey plate with a rim. The halo now falls off smoothly, 11 → 2 over the last 20 px, to about 1% at the box edge (`01-home-desk-200ms.jpg`). Each still is 72–73 kB.
- **Card photograph.**
  - It fades in over 150 ms into its reserved box (instantly under reduced motion).
  - It is fetched when the finger touches down on a light, or on first hover.
- **"All places" on desktop home.** Opened, it is now a real list: 55 links in a 499×649 box under the globe (`11-home-desk-all-places.jpg`). The globe column stops being sticky while it is open.
- **The legend.** A page whose lights count two things (degrees at a place, institutions at a country's own light) now says "Bigger light, more to study there". `/countries/` keeps "more institutions".
- **Names on the globe.** New `globeName()`, derived rather than listed.
  - It uses the full name whenever that is 26 characters or fewer: University of Toronto, Dalhousie University, Université de Strasbourg, Nord University, Western University, Yale University, McGill University, University of Michigan-Ann Arbor.
  - For a longer name, it uses the short name only if all three hold: every word of it is in the full name, no word is a code, and it is not the place the school is "of". So "Illinois" gives way to "University of Illinois Urbana-Champaign", while Chalmers, Queen's, Sapienza and Heriot-Watt Dubai keep their short names.
  - `readableName()` is unchanged, so home's cards and the country pages keep their text.
  - Guard: a school's globe name is its full name, or a short name made of the full name's own words, used only for a long name.

## Not done

- The card photograph's placeholder is the card's own paper, not the photograph's average colour. There is no colour data for the photographs, and the build does not run an image library.
- The first-paint time was not re-measured on a throttled link. The still is now eager, high priority and preloaded, which is the change the critic asked for.
- The Europe schools level is still busy when zoomed in with no country chosen (`08`: 36 groups at alt 0.3). Choosing a country now keeps it to that country.
- The street-level dive is still untestable here (no network).
- The work has not been re-critiqued.
