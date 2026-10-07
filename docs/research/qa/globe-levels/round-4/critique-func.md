# Globe levels, round 4: functionality critique

Critic: functionality (interaction design + QA). 7 October 2026. Build at http://127.0.0.1:4400, `?map=globe`, headless Chrome driven over CDP with real mouse, touch and key events. Probes and raw output are in `round-4/func/`. The round-2 probes that found bugs were re-run (`q1`, `q4`, `q6`, `q7`, `q8`, `p2`, `p11`), and six short follow-ups were added (`r4-a` … `r4-f`).

## Score: 7 / 10

This is a real step up from round 2's 5. All three of round 2's headline failures are fixed or mostly fixed, and the five minors I re-checked are fixed:
- **Back after one door then another (M2)** now works on desktop and on a phone.
  - Nearby → Explore → Back lands on Europe.
  - Right here → Nearby → Back lands on Denmark.
  - Right here → Explore → Back lands on Denmark.
  - Nearby → Back lands on World.
- **A click or a double-click on a coin during its flight (B1)** now lands at the level, on desktop.
- **Names now choose their owner (M1).**
  - Continent names: 4/4 on desktop and 4/4 on a phone (round 2: 0/4).
  - Country names at Europe on desktop: 23 or 24 of 26 (round 2: 4/26).
  - University names: 91/94 on desktop and 77/83 on a phone (round 2: 0/154 and 0/79).

It is still not an 8. A student who acts naturally can still hit three things:
- A small drag during a flight leaves the camera stranded between levels.
- On a phone, a double-tap on a country coin opens a university the student never chose.
- About one university name in 15 on a phone opens a *different university*, because the name is drawn over that other university's dot.

Each of these can be recovered from with Back or the trail, but each one breaks "what you point at is what you get".

## Bugs, by severity

### Major

**R4-1. A drag during a level's flight still strands the camera** (`r4-b-drag.txt`, `r4-b-drag-300.jpg`, `r4-a-doublepress.txt` e)
- Steps: at World, click the Europe coin, then drag the globe by 60 px within the first second (a phone swipe of 72 px behaves the same).
- Expected: the student's drag is respected, but the globe then settles onto Europe's frame. Or, if the drag is taken as "I'm steering", the level gives way and returns to World.
- Actual: the level is `region/europe` and the trail says "World › Europe", but the camera stays at the desk-globe distance (altitude 4.32 after a drag at 300 ms, 1.80 at 900 ms, 3.51 on the phone). That leaves 27–29 coins piled onto the desk globe. This is round 2's B1 picture, reached by a drag instead of a click.
- It does recover on the next coin click. But a student who nudges the globe while it turns sees the "confused" globe the owner complained about.

**R4-2. On a phone, a double-tap on a country coin opens a university** (`r4-a-doublepress.txt` f, g; `q6-midflight-press.txt` 7)
- Steps: on a phone at Europe, double-tap the Denmark coin with a 150 ms or 300 ms gap.
- Expected: Denmark, with the country card.
- Actual: the country level opens **with the Aalborg University card**, URL `#place=dk-aau`. The second tap lands on a pin that has just appeared under the finger.
  - The UK does the same: double-tap → University of Glasgow.
  - The Netherlands and Germany happen to land correctly.
  - An 80 ms gap is fine.
  - Desktop double-click and click-click at 80, 150 and 300 ms are all correct.
- The 450 ms "second press of a double click" guard evidently covers the same key but not a pin on the *next* level.

**R4-3. A university's name drawn over another university's dot opens that other university** (`q4-pinclicks-*.txt`, `r4-e-label-geom.txt`)
- The element on top at the press point is the name, but the dot-first rule wins:

| Device | Name pressed | Distance from the press to the other dot | Opened |
|---|---|---|---|
| Phone | "Technical University of Denmark" | 8 px from VIA's dot | **VIA University College** |
| Phone | "Delft University of Technology" | 2 px from Radboud's dot | **Radboud** |
| Desktop | "Leiden University" | 7 px from Utrecht's dot | **Utrecht** |

- Others seen: Eindhoven → University College Roosevelt and Radboud → Rotterdam UAS (phone), and Stavanger → Oslo National Academy of the Arts (desktop).
- "Umeå University" (desktop and phone) and "University of Oxford" (phone) instead open the neighbouring country or the country card. For Umeå, the name is on top and its own dot is 67 px away.
- Expected: a press on a visible name chooses that name's owner. If a name covers a dot, the name is what the student sees, so the name should win (or the layout should keep names off other dots).

### Minor

- **R4-4. An impatient second press at about 600 ms skips a level.**
  - Desktop: click Europe, then click the same spot at 600 ms → **Belgium**.
  - Phone: the same → **Czechia**.
  - The second press lands on whichever country coin has flown under the cursor (`q6` 3, `r4-a` h). It is defensible as "what was under the pointer", but no student meant it. Consider ignoring presses on newly revealed nodes for the first ~700 ms of a level flight.
- **R4-5. Escape on a university card closes the card but leaves the university chosen.** At DK → Aarhus University, pressing Escape removes the card, but the URL stays `#place=dk-au` and the result list stays "5 of 67 programmes · Aarhus University ×". Back then gives Denmark. The globe and the list disagree until Back (`r4-f-hint-escape.txt`).
- **R4-6. Back to a door restores the level but not its card.**
  - Right here → Nearby → Back gives Denmark with no Denmark card.
  - On a phone, Nearby → Explore → Back gives Europe with no Europe card, so **no rail of country buttons**. A phone student at Europe then has unlabelled coins only (`q1`, `r4-d-phone-doors.txt`).
- **R4-7. Under a search, choosing a dimmed university still dims every pin** (round-2 m2, still open). With "medicine", at Denmark, clicking dimmed Aalborg gives 14/14 pins dimmed, including Absalon, which matches (`q7` A).
- **R4-8. Some country names miss.**
  - "Estonia" opens Latvia: the name sits over Latvia's coin.
  - "Austria" opens Slovenia: Slovenia's coin is on top of the name at its centre.
  - "Denmark" did nothing once in `q7` but worked in `r4-c`.
- **R4-9. A deep link to a university shows no programme count.** `#place=dk-baaa` gives the card "[Aarhus]" while the list says "1 of 67". `#region=…` doesn't narrow the list the way a click does ("67 programmes" vs "67 of 67 · On the globe: Europe ×"). Both are small.
- **R4-10. Two ids for Maastricht.** Choosing Maastricht writes `where=inst:nl-maastricht` but `#place=nl-um`. It works, but a shared link carries two names for one place. Worth a check that `#place=nl-um` and the `inst:` filter agree after a reload. Not tested.

### Fixed since round 2 (verified)

- **B1, clicks:**
  - Desktop double-click on Europe → Europe at 1.03.
  - Click DK, then again at 80, 150 or 300 ms → Denmark at 0.15.
  - Double-click on DK, NL, GB or DE → that country.
  - Phone double-tap on Europe → Europe at 1.03.
  - A tap mid-stage during a flight is ignored.
- **M1:** the numbers above. Labels now have `pointer-events: auto`, and continent names work everywhere.
- **M2:** all three door paths, desktop and phone.
- **m1:**
  - `#country=dk` → "51 of 67" plus the card's "· 51 programmes".
  - The country links for jp, sg, hk, mt, lu, au and nz are all correct.
- **m3:** `#country=ru` → World plus "No universities from Russia on this map yet".
- **m4:** fast `+ + +` at 80 ms → Netherlands, the same as slow.
- **m5:** Escape leaves focus on `.world__stage`. Enter (with `\r`) and Space on a card chip open that university.
- **Phone rail:** 26/26 country buttons open their country. Rail → Denmark → Back = Europe with the rail.
- **Dots:** 94/94 on desktop and 84/84 on a phone, with 0 pins covered by furniture.
- **Countries page:** the World → Europe → France → Sciences Po walk, then Back ×3.
- **Console:** clean in every probe.

### Not checked this round

- Wheel, trackpad and pinch beyond the standard harness's regression run.
- Reduced motion beyond its use as a probe setting.
- Dark theme.
- Safari and Firefox.
- The full 28-country pin sweep: this round sampled 7 countries on desktop and 5 on a phone.

## The five fixes that would raise the score most

1. **Settle after a drag (R4-1).** When a pointer or touch drag ends and no flight is running, fly to the current level's frame (`lvCam`). Alternatively, if the drag moved more than a threshold away from it, drop the level one step so the trail matches the view. Acceptance: `r4-b-drag.mjs` ends at about 1.03 (desktop) or about 0.83–1.03 (phone) with 26 coins.
2. **The thing on top wins (R4-3, R4-8).** If `elementFromPoint` at the press is a visible `.world__pin-label` or `.world__cluster-label`, choose its owner before any dot or coin reach test. Better still, keep names from being laid over other dots and coins. Acceptance: `q4-pinclicks.mjs phone dk,nl,gb,se,hk` and `desk dk,nl,hk,us,se,no,de` report `wrongLabel: 0`, and `r4-c` gets 6/6.
3. **Swallow the second tap of a double-tap across a level change (R4-2, R4-4).**
   - For about 450 ms after a level choice, ignore any press that would choose a node *revealed by* that choice (pins of the new country, coins of the new continent). Don't only ignore the same key.
   - Optionally extend this to about 700 ms while the flight is still running.
   - Acceptance: `r4-a-doublepress.mjs` f/g give the country card at 80, 150 and 300 ms; `q6` 3 and `r4-a` h stay at Europe.
4. **Keep the globe, the list and the card in one state (R4-5, R4-6, R4-9).**
   - Escape on a university card should step to the country: replace the entry with `#country=…` and widen the list, as Back does.
   - Back to a door entry should redraw that level's card. On a phone, the Europe card and its rail are the only way to name countries.
   - Deep-linked universities should show their programme count.
5. **Search dimming (R4-7).** Choosing a dimmed university should keep the lit ones lit and leave its own pin undimmed. The card should say "0 programmes match 'medicine'" rather than drop the count.

Fixes 1–3 together would take this to about 8.5: the level model, Back and deep links are now predictable, and what is left is mostly a matter of being strict about which thing the student touched.
