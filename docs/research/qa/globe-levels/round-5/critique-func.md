# Globe levels, round 5: functionality critique

Critic: functionality (interaction design + QA). 7 October 2026. Build at http://127.0.0.1:4400, `?map=globe`, headless Chrome over CDP (port 9381, driver 9382) with real mouse, touch and key events. Probes and raw output are in `round-5/func/`.
- The round-4 probes that found bugs were re-run: `r4-a`, `r4-b`, `r4-c`, `r4-d`, `r4-f`, `q4` and `q8`.
- Five short new probes were added: `s1`–`s5`.

## Score: 8 / 10

The round-4 headline bugs are fixed. Pointing at a thing now gets that thing:
- **R4-1, a drag mid-flight: fixed.**
  - A 60 px drag at 300 ms or 900 ms, a 200 px drag at 500 ms, and a 72 px phone swipe at 400 ms all settle on Europe at altitude 1.026, with 26 coins.
- **R4-2, a phone double-tap on a country: fixed.**
  - DK at 80, 150 and 300 ms gives the Denmark card.
  - NL, DE and GB double-taps give their country.
  - Desktop double-clicks and click-clicks are all correct.
- **R4-3 and R4-8, names: fixed.** Real clicks and taps on every university's dot and every drawn name:

| Device | Countries | Pins | Wrong at the dot | Names tried | Wrong name |
|---|---|---|---|---|---|
| Phone | 7 | 98 | 0 | 25 | 0 |
| Desktop | 7 | 94 | 0 | 42 | 0 |

  - The Europe country names that missed in round 4 (Estonia, Slovenia, Lithuania, Denmark, Germany) now open their own country.
  - Fewer names are tried than in round 4. That comes from the probe, not a regression: round 4's re-opened country still showed the last university's forced name. At rest, phone Denmark shows 3–4 names, as before (`s2`).
- **R4-5, Escape on a university: fixed.** It steps back to the Denmark card and `#country=dk`, and the list widens to 51 of 67. Back then returns to Aarhus.
- **R4-6, Back to a door: fixed.** Nearby → Explore → Back on a phone gives Europe *with* its card and rail. Here → Nearby → Back gives Denmark with its card.
- **R4-9, a deep-linked university's count: fixed.** `#place=dk-baaa` shows "1 programme".
- **Also checked:** the phone rail opens all 26 countries. Enter on a card chip opens that university. `#country=ru` gives its hint. The console was clean throughout.

It is not higher than 8 because of one way to leave the page by accident, one intermittent level-skip, and a keyboard focus loss.

## Remaining bugs

**F5-1 (major, one pin seen so far). On a phone, a university dot sits under the "Imagery: NASA" credits link** (`s1`, `s5`, `s5-phone-italy.jpg`).
- Steps: phone, Italy, tap Sapienza's dot at (332, 596).
- Expected: the Sapienza card.
- Actual: the page navigates to `/credits/#globe`. The dot is under the link.
- 1 of 12 countries is affected on a phone; 0 of 12 on desktop.

**F5-2 (minor, intermittent). A phone re-tap on the Europe coin can still skip to a country inside the 0.7 s let-go** (`s3`, `s3b`, `s4`).
- Steps: phone, World, tap Europe, then tap the same spot again 400–600 ms later.
- Expected: Europe.
- Actual: 3 of 26 tries opened a country (Netherlands at 400 ms, Latvia at 600 ms, Denmark at 600 ms). On desktop, 0 of 8 tries skipped within 600 ms.

**F5-3 (minor, keyboard). Escape on a university card drops focus to the page** (`q8`).
- Steps: Tab to a chip, press Enter (opens the university), then press Escape.
- Expected: focus stays on `.world__stage` or the country card.
- Actual: focus goes to the page top, at "Skip to content". In round 4, focus stayed on the stage.

**F5-4 (minor). Europe's university count depends on the route.**
- The card says "274 universities" from the coin, but "260 universities" from the Nearby door, with the same 26 countries.

**F5-5 (minor). A phone tap on empty globe at Europe closes the card**, and with it the rail of country names (`s3`, at 900 and 1500 ms). That is defensible, but it is the phone's only list of country names.

**Unchanged:**
- R4-7: under a search, choosing a dimmed university dims every pin. Not re-tested.
- R4-10: Maastricht writes `inst:nl-maastricht` but `#place=nl-um`. Both deep links resolve correctly.
- `#region=europe` gives "67 programmes", where a click gives "67 of 67 · On the globe: Europe ×".

## Five fixes

1. **Keep pins out from under stage furniture (F5-1).**
   - Include the credits link (and any absolutely placed link) in the "covered by furniture" margin used for framing.
   - Alternatively, make the link `pointer-events: none` except on its text, and frame Italy so Rome isn't on the bottom edge.
   - Acceptance: `s1-credits-cover.mjs` reports "clean" for every country on a phone.
2. **Make the let-go window independent of frame timing (F5-2).** Stamp it with `performance.now()` at the press that chose the level, not at the flight's first frame, and also ignore nodes revealed by that choice until the flight ends. Acceptance: `s4` gives 0 of 40 skips at 250–650 ms.
3. **Escape keeps focus (F5-3).** After stepping back to the country, focus `.world__stage` (or the country card's title).
4. **One Europe total (F5-4).** Compute the Europe card's count from the level, not from the door's filter. Or label it "260 universities nearby".
5. **R4-7 and the `#region` deep link.**
   - Choosing a dimmed university under a search should keep the matching pins lit.
   - `#region=europe` should apply the same "On the globe: Europe" filter that a click applies.
