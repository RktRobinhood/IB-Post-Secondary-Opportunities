# Globe levels, round 1: functionality critique

Critic: functionality (interaction design + QA). 6 October 2026. Tested against the built site at http://127.0.0.1:4321 using real CDP input (mouse, wheel, ctrl+wheel, touch and pinch, keys, history). Probes and raw output are in `round-1/func/` (`p1`–`p12` `.mjs` and `.txt`, plus a few `.jpg`).

## Score: 5 / 10

The level model works. World → continent → country is predictable with mouse, wheel, trackpad pinch, touch pinch, `+`/`−`/`0`/Escape and the trail. Back and Forward step exactly one level per entry on the clicked path. No close map or street level is ever reached: `closeState` is always `failed`, and the lowest altitude reached in any probe was 0.12. The continent number always equals the sum of its countries, and each country node equals its pins and its card. The console stayed clean across about 300 actions.

It still can't ship to students. **The fourth level, choosing a university, is unreliable.** On a desktop, clicking the visible dot of 46% of university pins (66/145) opens a *different* university. On a phone the figure is 56% (81/145). Some universities can't be chosen at all. Round 1's own evidence already shows it: the desk walk aimed at Aarhus and opened Business Academy Aarhus, and the phone walk opened VIA University College. On top of that:
- Back after a door (Right here / Nearby / Explore) leaves the globe at World while the cards go back to the door.
- A double-click on a country node lands in a different country.
- Deep links and reloads fail for Singapore, Hong Kong, Malta and Luxembourg.
- The globe's university numbers disagree with the country tiles in 20 of 36 countries.

---

## Bugs, by severity

### Blocker

**B1. A click or tap on a university pin opens a neighbour; some pins can't be chosen at all.** (`p4-pinhits*.txt`, `p5-reach.txt`)
- Steps: open `/?map=globe`, go to any country level (UK, Netherlands, Japan, US, Australia, Singapore, Hong Kong…), then click exactly on a pin's dot.
- Expected: that university's card.
- Actual: a different university's card for 66/145 pins on desktop and 81/145 on a phone. Examples on desktop:

  | Clicked | Opens |
  |---|---|
  | Harvard | Bowdoin |
  | MIT | Bowdoin |
  | Tokyo | Keio |
  | Melbourne | RMIT |
  | Imperial | LSE |
  | UvA | AUAS |
  | NUS | ESSEC |
  | HKU | HKMU |

  On a phone, Oxford opens UCL. With a 40 px search disc around the dot, these can't be reached anywhere:
  - phone: **Oxford, Aarhus University, CBS, Utrecht, ANU**
  - desktop: HKAPA, UOWD
- Where: `primitives.css` ~373 gives every pin a 32 px invisible `::before` target (`--tap` on coarse pointers). `globe.js` `relax()` only keeps school pins `r+r+4` = 15 px apart. Neighbouring targets overlap by up to 17 px and the later DOM sibling wins. A country level is the deepest level (`+` is disabled there), so a dense cluster such as Boston, the Randstad, London or Singapore can never be pulled further apart.

### Major

**M1. Back after a door leaves the globe at World while the cards return to the door.** (`p10`, `p12`, `func/door-back-desync.jpg`)
- Steps: press Nearby, then Explore, then browser Back.
- Expected: URL `?scope=nearby`, cards "Nearby · Europe", globe at **Europe**.
- Actual: URL and cards are Nearby, but the globe is at **World**. This was still true 3.5 s later.
- Same pattern elsewhere:
  - Right here → Nearby → Back: cards show Denmark, globe shows World.
  - Nearby → click Netherlands → Back: globe goes to World instead of Europe.
- Where: the globe's `onPop` (`globe.js` ~2777) calls `goHome()` for any entry with no `sel`. It runs after `discover.js`'s popstate handler has already called `frame(state.scope)` (~640), so it overrides it. The listeners are registered in that order.

**M2. A double-click on a country node opens a different country.** (`p11-rapid.txt`)
- Steps: open Europe, then double-click the Denmark node, then the UK node, then Germany.
- Expected: Denmark, UK, Germany.
- Actual: **Czechia**, **Netherlands**, **Latvia**. Only one of four tries was right, and both clicks push history entries.
- Where: the stage `click` handler (`globe.js` ~3560) acts on the first click at once (`goToCountry`). The second click of the double-click hits whichever outgoing node now sits under the pointer, because the camera has already moved and the old nodes "ride the first half" of the flight.

**M3. Deep links and reloads fail for countries without an outline in the borders (Singapore, Hong Kong, Malta, Luxembourg).** (`p2-deeplinks.txt`, `p3-microstates.txt`)
- Steps: open `/?map=globe#country=sg` in a fresh tab, or choose Singapore and press reload.
- Expected: the Singapore country level.
- Actual: World. After a reload the cards below stay narrowed to Singapore (`?where=dest:sg`) while the globe shows the world.
- Where: `select()` (`globe.js` ~2775) and the initial `linked` hash (~3937) use `geography.byId.get(sel.id)`, not `countryFor()`. Back and Forward only work for these countries because `discover.js` happens to re-drive the globe.

**M4. The globe's numbers disagree with the country tiles in 20 of 36 countries.** (`p9-numbers.txt`)

| Country | Globe | Tile |
|---|---|---|
| UK | 16 | 22 |
| Canada | 14 | 20 |
| China | 9 | 14 |
| UAE | 10 | 14 |
| Malta | 3 | 6 |
| Australia | 14 | 17 |
| Belgium | 8 | 11 |
| France | 6 | 8 |
| Estonia | 6 | 8 |
| Japan | 14 | 15 |

The rest are off by one. The globe counts only universities with a mapped location (`p.subs.length`, `globe.js` ~647). The Explore door then puts "UAE · 14 universities" next to a globe saying 10. Nothing tells the student the globe is a subset. Internally the globe is consistent: continent = sum of countries = pins = card.

**M5. The world level shows 2 of 4 continents.** At rest on both desktop and phone, only Europe 243 and Asia 71 are visible. North America (28) and Oceania (24) are behind the desk globe. The idle sway (±18°) never reveals them, and nothing on the stage says they exist. The owner asked for "one bubble per continent/region with its number". (`restCamera`, ~1133, faces the universities-weighted heart.)

**M6. Most nodes and pins have no name, so there is no way to know what you are choosing.**

| Where | Named |
|---|---|
| Europe, desktop | 16 of 26 countries. Unnamed include the UK (16), Netherlands (15), Germany, Sweden, Austria, Portugal, Switzerland |
| Europe, phone | 9 of 26 |
| Denmark, phone | **1 of 14** pins |
| Denmark, desktop | 6 of 14 |
| USA, desktop | 4 of 14 (the whole New England cluster is unnamed) |

On touch there is no hover. Together with B1, choosing a university on a phone is a lottery.

### Minor

- **m1. Clicks on land with no destination fly to a dead end, and the trail is wrong.**
  - From the world, clicks on Russia, Afghanistan, South Sudan or Mali fly in to "*Nothing on this map here yet.*" and push `#country=ru`.
  - From Europe, Algeria shows the trail "World › **Europe** › Algeria" and Russia shows "World › Europe › Russia".
  - Clicking Russia from Europe zooms *out* (altitude 1 → 2.19).
  - Where: `goToCountry` levels branch, `region: … || lv.region`.
- **m2. Keyboard users can't choose a university on the globe.** Pins have `tabindex=-1`, and the list below the globe has only countries. It takes 14 Tab presses to reach the stage.
- **m3. Fast key presses are dropped, and `+` at the country level does nothing silently.** `+ + +` at 80 ms intervals gives one step. With the wheel, the deepest level shows a hint; with keys there is none.
- **m4. "Right here" → trail "World" leaves the door pressed.** The cards stay "Right here · Denmark (51 of 67)" while the globe shows the world.
- **m5. Hash-only navigation goes to World.** Typing `#region=asia` over an open page arrives as popstate with null state, so it goes to World.
- **m6. Programme counts disagree for the Netherlands.** The card says "19 programmes" but the list says "16 of 67 programmes": paths versus condensed cards.
- **m7. Deep links don't narrow the cards, so a shared link isn't the clicked state.** `#country=dk` shows "67 programmes" and a card without "· 51 programmes", while the clicked state shows 51 of 67. Cause: `restored: true` is ignored by `discover.js`.
- **m8. Choosing a dimmed university under a search dims every pin.** With "medicine", choosing Aalborg University leaves 14 of 14 pins dimmed, including the one that matches. The card says "Aalborg" with no programme count. The cards below correctly say "No degrees".

### Works (checked)

- One step per wheel or trackpad gesture.
  - A 1.5 s ctrl+wheel pinch is one step.
  - Two swipes 0.5 s apart are two steps.
  - Wheel-out at World does nothing.
  - An unengaged wheel scrolls the page.
- Phone pinch:
  - pinch-in steps in, aimed at the pinch point;
  - pinch-out steps out;
  - a tiny pinch settles back;
  - a big pinch-out at a region goes to World.
- `+`, `−`, `0`, Escape (closes the card, then steps up), arrows (turn without changing level).
- Trail buttons; Reset hidden while the trail shows.
- Back and Forward through world → Europe → Denmark → university, one entry each. Back pressed mid-flight is correct.
- Clicks on a destination country's land work at every level, including clicking Sweden or Germany from Denmark. Sea clicks close the card and keep the level.
- `/countries/`: the walk and Back work.
- Reduced motion works.
- No MapLibre, no street level, no console errors.

---

## The five changes that would raise the score most

1. **Make the pin you see the pin you get (B1).** Resolve a press on a country level to the *nearest* visible pin within ~22 px of the pointer, in one hit layer, instead of overlapping 32 px `::before` discs. Or enforce `relax` spacing ≥ the hit diameter (32 px fine, 44 px coarse) for school pins, or fan a dense cluster into a rosette on first press. Also add the country's universities as a list in the country card, so every university has a named, focusable, tappable entry (this also fixes m2 and most of M6).
   Acceptance: `func/p4-pinhits.mjs` and `p5-reach.mjs` report 0 wrong and 0 unreachable on desk and phone for sg, hk, us, gb, nl, au, dk.

2. **Back after a door must restore the door's frame (M1).**
   - In `onPop`, when the entry has no globe `sel` but carries a discover `scope`, don't `goHome()`; let `frame(scope)` win. Alternatively, have discover call `frame()` after the globe's handler, for example by deferring with a microtask.
   - Repro: Nearby → Explore → Back must show Europe; Nearby → Netherlands → Back must show Europe.

3. **Ignore the second click of a double-click, and don't hit-test nodes that are leaving (M2).**
   - In the stage click handler, drop clicks with `e.detail > 1` on nodes, or ignore node clicks for ~400 ms after a level change.
   - Make outgoing nodes `pointer-events: none` once a flight starts.
   - Repro: in Europe, double-clicking Denmark, the UK and Germany must open those three.

4. **Deep links and reload for every destination (M3, m7).**
   - Use `countryFor()` in `select()` and for the initial `#country=` hash.
   - On a deep link, let `discover.js` narrow the cards as a click would, so a shared link equals the clicked state.
   - Repro: fresh tabs on `#country=sg`, `#country=hk`, `#country=mt` and `#country=lu`, plus reloading `?where=dest:sg#country=sg`, must all land on that country.

5. **Make the numbers and the world honest (M4, M5).**
   - Either count every university the country page counts, with unmapped ones listed in the card, or label the globe's number ("16 of 22 on the map").
   - At World, show North America and Oceania. Possible ways:
     - a small "+2 continents behind" chip that turns the globe;
     - an idle turn that visits every continent;
     - edge markers for continents on the back.

   Without this, the owner's "one bubble per continent with its number" isn't met on first view.

Also worth doing once those are in: name every node at the continent level on a desktop, and on a phone show names for the chosen continent's biggest countries (M6). Treat land without a destination as a gentle "No universities here yet", without a flight or a history entry (m1).
