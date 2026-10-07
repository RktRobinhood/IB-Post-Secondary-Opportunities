# Globe levels, round 2: functionality critique

Critic: functionality (interaction design + QA). 7 October 2026. Tested the build at http://127.0.0.1:4400 with real CDP input: mouse, wheel, ctrl+wheel, touch taps and pinches, keys and history. Probes and raw output are in `round-2/func/`. The round-1 probes `p1`–`p12` were re-run, and new probes `q1`–`q9` were added.

Caveat: the served `globe.js` changed while I was testing. One change was the `idAt` check-digit fix. The art changes in `src/` (pitch, wash, neighbour coins) were not yet served. Every bug below was reproduced on the build served around 05:50 (sha1 `5fab3454…`) or on the one before it. None of the pending source changes touch the code paths named here.

## Score: 5 / 10

Round 1's blocker is fixed, and well. A real click or tap on a university's dot opened that university **347 of 347 times on desktop and 347 of 347 on a phone**, across 28 countries (`q4-pinclicks-*.txt`). The two "misses" in those files are the probe trimming "Yonsei University — Underwood…" at the dash. Other things that now work:
- deep links and reloads for Singapore, Hong Kong, Malta and Luxembourg;
- Back and Forward through world → continent → country → university;
- fast `+ + +`;
- double-clicking a country node once the camera has arrived;
- a hint (with no flight) for land that has no universities;
- globe numbers that match the tiles;
- Back after a door, then a country.

It still can't ship. The same failure as round 1 is back in a new form: **what the student points at is not what they get.**
1. **Names don't choose.** Clicking a university's name chose it 0 times out of 154 on desktop and 0 of 79 on a phone. Clicking a country's name at the continent level chose it 4 of 26 times on desktop and 12 of 26 on a phone. Often the click goes somewhere else instead. On a phone, tapping "Denmark" opens Germany, and "Sweden" opens Denmark. On desktop, clicking the name "Harvard University" opens Canada, and "University of Oslo" opens Sweden.
2. **A second press during a flight leaves the camera stranded.** This happens with a double-click, a double-tap, or an impatient second click. The level changes but the camera stops. The result is 26 European coins piled onto the whole-world desk globe, or 14 Danish pins in a clump with the whole of Europe around them. This is exactly the owner's complaint: it "gets quite confused… struggles to focus".
3. **Back after a door followed by another door still breaks.** The globe goes to World while the cards show the earlier door. The fix in the notes doesn't work in Chrome.

---

## Bugs, by severity

### Blocker

**B1. A second press during a level's flight leaves the camera between levels.** (`q6-midflight-press.txt`, `q6-1-dblclick-europe.jpg`, `q6-4-dk-again-300.jpg`, `q6-6-phone-doubletap-europe.jpg`, `p8-midflight-pinch.txt`, `p7-input.txt` C/D)

Steps and results (all on `/?map=globe`):

| Action | Level after | Altitude after | What the student sees |
|---|---|---|---|
| Desktop: double-click the Europe coin | `region/europe` | stays at the world value, 4.32 | 29 coins (all 26 countries plus the continents) crammed onto the desk globe |
| Phone: double-tap the Europe coin | `region/europe` | 3.59 | same pile-up |
| Desktop: click Europe, then click the same spot at 600 ms | `region/europe` | 4.32 | same pile-up |
| Desktop: click Europe, then press on land at 300 ms or 700 ms | `region/europe` | 4.32 | same pile-up |
| Desktop, at Europe: click the DK node, then click it again at 300 ms | `country/dk`, with the Denmark card | 1.12 | 14 pins in a clump among 25 European coins |
| Phone: double-tap the DK node | `country/dk` | 0.85 | same as above |

- Expected: the second press of a double-click is ignored, as the notes intend, and the flight completes.
- Where: the stage `pointerdown` handler (`globe.js` ~3631) runs `flight = null; rush = 0; spin = null` on every press. That includes the second press of a double-click. `levelsClick` then rightly drops that click (the `lvChoseAt < 450` check, or the same `lvChoseKey`), but the flight is already dead. Nothing ever re-flies to `lvCam`.
- The state does recover on the next level step.
- In the code, an impatient second press now behaves like a drag. This is the "confused" globe from the brief.

### Major

**M1. Clicking or tapping a name doesn't choose its owner, and often chooses a neighbour.** (`q4-pinclicks-desk.txt`, `q4-pinclicks-phone.txt`, `q7-filters-chips-labels.txt` C, `q5-label-debug.txt`)

Results, from the country (or continent) level with no university chosen:

| What was clicked | Desktop | Phone |
|---|---|---|
| A university's name | 0/154 right | 0/79 right |
| A country's name, at Europe | 4/26 right | 12/26 right |
| A continent's name, at World | 0/4 right ("Europe" does nothing) | 0/4 right ("Asia" goes to an Asian country) |

What the wrong clicks did instead:
- **University names, desktop:**
  - Most clicks close the country card ("(nothing)").
  - Many fly to a neighbouring country: Maastricht, Groningen, Eindhoven, Twente and Radboud → **Germany**; Harvard → **Canada**; Oslo and Nord → **Sweden**; TU Munich → **Austria**; CUHK, PolyU and CityU → **China**; Ottawa and York → **United States**; University of Luxembourg → Germany; LUNEX → France; Luleå → Norway; JKU Linz → Germany.
- **University names, phone:**
  - Some open a *different university*: TU Munich → Freiburg; Linköping → Gothenburg.
  - Some fly to another country: Franklin and Klagenfurt → Italy; Deusto, Vesalius and Howest → France; Waterloo and York → United States.
- **Country names at Europe:**
  - Desktop: Czechia → Poland; Belgium → France; Switzerland → Italy; Luxembourg → France. The other 18 wrong clicks do nothing.
  - Phone: **Denmark → Germany**, **Sweden → Denmark**, Poland → Czechia, Germany → Switzerland, Austria → Italy, Estonia → Lithuania, Slovenia → Italy, Luxembourg → Switzerland. The other 6 wrong taps do nothing.

Cause and impact:
- Where: the labels (`.world__pin-label`, `.world__cluster-label`) are `pointer-events: none`. `levelsClick` (~3819) only looks for a node *centre* within `max(r+5, 14)` px (22 px on touch). A press on a name therefore resolves to whichever coin centre happens to be near the label, or it falls through to `pick()` and the land under it (~3796).
- The labels look like chips: a flag and a name in a pill. On a desktop the name is the natural thing to click. On a phone it is the biggest target.

**M2. Back after one door then another still leaves the globe at World.** (`q1-door-back-trace.txt`, `q2-door-back-why.txt`, `q3-capture-order.txt`, `p12-door-back.txt`, `p10-doors-filters.txt` A)

| Steps | Cards after Back | Globe after Back |
|---|---|---|
| Nearby → Explore → Back | Nearby · Europe | World |
| Right here → Nearby → Back | Right here · Denmark | **flies out to World** (traced: altitude 0.99 → 4.32) |
| Here → Nearby → Far → Back ×2 | the earlier door | World both times |

The same happens on desktop and phone. (Nearby → a country → Back is now correct.)

Where:
- `q2` shows the order of events in one popstate. discover.js's listener calls `show({region:'europe'})` first, which sets `shownAt = popAt`. Then the globe's `onPop` falls through to `goHome()`.
- The guard relies on the capture listener `addEventListener('popstate', …, {capture:true})` (~2824) running before discover's bubble listener. On `window`, Chrome (HeadlessChrome 154) runs them **in registration order**: `q3` shows "bubble (added first) → capture (added second)". So `popAt` is bumped *after* `show()` has stamped it, `shownAt !== popAt`, and the `else` branch runs `goHome()`.
- Fix the ordering without relying on event phases. For example:
  - discover.js defers `frame()` with a microtask or `setTimeout(0)` and the globe stops homing when an entry carries `discover`/`scope`; or
  - the globe's `onPop` itself defers its `goHome()` and skips it if `show()` ran in that task.

### Minor

- **m1. Deep links still don't narrow the cards** (round-1 m7, still open). `#country=dk` from a fresh tab shows the Denmark card without "· 51 programmes" and "67 programmes" below. `#place=dk-baaa` shows "[Aarhus]" where a click shows "[1 programme · Aarhus]". A shared link is not the state that was clicked. (`p2-deeplinks.txt`)
- **m2. Choosing a dimmed university under a search dims every pin** (round-1 m8, still open). With "medicine", at Denmark, a real click on dimmed Aalborg gives 14/14 pins dimmed, including Absalon, which matches. The card has no programme count. (`q7` A)
- **m3. A typed or hashed country with no destination gets a level with a wrong trail.** `#country=ru` gives "World › Russia" with the card "Nothing on this map here yet." After a hash change from `#region=north-america`, it becomes "World › North America › Russia". Clicks on that land now give a hint, so this only affects hash entries. (`p1-history.txt`, `p2-deeplinks.txt`)
- **m4. Quick `+ +` picks a different country than slow `+ +`.** At 80 ms intervals, World → Europe → **Greece**. At 700 ms intervals, World → Europe → Netherlands. During the flight, "nearest the middle" is measured on a half-turned globe. (`p11-rapid.txt`, `p7-input.txt` F)
- **m5. Keyboard reach is partial.** A chip on the country card works with Enter and Space and takes 6 Tabs from the stage. But only 3 of 22 UK universities have a chip on desktop, and pins stay `tabindex=-1`. After Escape closes a university card, focus drops to `<body>` ("Skip to content") instead of the stage. It takes 14 Tabs from the top of the page to reach the stage. (`q8-keyboard-chip.txt`, `p7-input.txt` F/G)
- **m6. One Portuguese university has no pin at the country level.** The card and node say 9, but only 8 pins are drawn, probably the Azores outpost the frame leaves out. It can be reached only if it is one of the card's chips. (`q4`, `p9-numbers.txt`)
- **m7. A pin count above the node's number in Czechia, Finland and Hungary.** The node and card say 13, but 14 pins are visible at the country level. This is probably a neighbour's pin near the border. A student counting will notice. (`p9-numbers.txt`)
- **m8. A console warning in an earlier served build.** It read `[world] the finer borders could not load; the coarse ones stay. Cannot read properties of undefined (reading 'add')` and appeared twice in `p11`. The `idAt` range check that has since been served looks like the fix, but I did not re-verify it.

### Works (checked this round)

- **Dot clicks and taps:** 0 wrong out of 347 on desktop and 0 wrong out of 347 on a phone. 0 pins were covered by the card, trail or buttons when the country level opened.
- **Deep links and reload:**
  - `#country=` works for sg, hk, mt, lu, jp, au and nz. `#region=` and `#place=` work.
  - Reload, Back and Forward work for the four microstates (`p2`, `p3`).
- **History:**
  - The walk world → Europe → DK → university, then Back ×3 and Forward ×3: one level per entry (`p1`).
  - Back pressed mid-flight works (`p11`).
  - The Countries page walk and Back work (`q7` D).
- **Double-click on a country node after arrival** opens that country, for DK, GB, NL and DE (`p11`). This is round-1's M2.
- **Wheel, trackpad and pinch:**
  - Without taking hold, the wheel scrolls the page.
  - ctrl+wheel steps one level, and a 1.5 s pinch is one step.
  - Two swipes 0.5 s apart are two steps.
  - Phone pinch steps in and out, a tiny pinch settles back, and a big pinch-out goes to World (`p7`, `p8`).
- **Keys:** `+`, `−`, `0`, Escape and the arrows work (`p7` F).
- **Land and sea:**
  - Land with no destination gives the hint "No universities from Russia/India/Egypt/Kazakhstan/Belarus/Ukraine on this map yet", with no flight.
  - A neighbour's land at the country level chooses that neighbour.
  - The sea keeps the level (`q9-land.txt`).
- **Numbers:**
  - Continent = sum of its countries = pins = card, everywhere.
  - Globe numbers equal the tile totals ("13 universities and 1 college" counts as 14) (`p9`).
- **World level and trail:** all four continents are visible at World (`nodes=4`). Right here → trail "World" now releases the door (`p10` C).
- **Console:** clean apart from m8.

### Not checked

- The art-side source changes not yet served (neighbour coins at the country level, pitch, wash). These include the change "at a country, its nearest neighbours only", which may change m7.
- Reduced motion beyond its use as a probe setting.
- Dark theme interaction.
- Real Safari or Firefox, where popstate listener order on `window` may differ. That makes M2 browser-dependent.
- A mid-flight drag on purpose. B1's fix must keep a deliberate drag working.

---

## The five changes that would raise the score most

1. **Never strand the camera (B1).**
   - Don't kill `flight` on a press that turns out to be a click. Defer `flight = null` to the first `pointermove` past the drag threshold. Or, in `levelsClick`, when a click is dropped (450 ms window or same key) and a level flight was cut, call `flyTo(lvCam)` again.
   - More generally, whenever the pointer is released and `lv` has no camera in flight, settle onto `lvCam`.
   - Acceptance: `q6-midflight-press.mjs` cases 1, 3, 4, 6 and 7 end at the level's own altitude (≈0.99 Europe desk, ≈0.83 phone, ≈0.15 DK), and `p8` "press 300/700 ms" ends at Europe's frame.
2. **Make names click targets for their own node (M1).**
   - Give `.world__pin-label` and `.world__cluster-label` `pointer-events: auto`.
   - Resolve a press inside a visible label's box to that label's node *before* the nearest-centre search. Also add label boxes to `lvHit`.
   - A press on a label must never fall through to `pick()` or the land.
   - Acceptance: `q4-pinclicks.mjs desk|phone` reports `wrongLabel: 0`, and `q7` C reports 26/26 country names and 4/4 continent names on desktop and phone.
3. **Fix door-then-door Back (M2) without relying on listener phase order.**
   - Make the globe's `onPop` defer its fallback (`goHome`/`lv` restore) to a microtask and skip it if `show()` ran since the popstate.
   - Or have discover.js tell the globe explicitly, for example `show(spec, { fromPop: true })` setting a flag the globe checks after its own handler.
   - Acceptance: `q1-door-back-trace.mjs` A and B end at Europe and Denmark respectively, on desktop and phone, and `p10` A Back ×2 gives Europe, then Denmark, then World.
4. **A deep link equals the clicked state (m1).** On `world:choose` with `restored: true` from a fresh load, let discover.js narrow the cards as a click would. Acceptance: `p2` shows "51 of 67" and "· 51 programmes" for `#country=dk`.
5. **Tidy the remaining edges, in order:**
   - a dimmed university's choice keeps the lit ones lit and its own pin un-dimmed (m2);
   - after Escape, focus returns to the stage (m5);
   - `+` mid-flight targets the country nearest the middle of the *destination* frame (m4);
   - the Azores-type outpost gets an edge marker or a chip (m6);
   - a hash for a country with no destination goes to World with the hint (m3).

Items 1–3 alone would take this to about 7–8. The dot-click work is solid, and the rest of the model behaves predictably.
