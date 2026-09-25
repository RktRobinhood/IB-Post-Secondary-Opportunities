# Home discovery page: round 3 (issue #44)

**Score: 7 / 10.** Not accepted. This is a higher 7 than round 2.

I checked localhost:4380 (the live build) at 1280×800 and 390×844, in light and dark mode. The tools are in `tools/` and the measurements in `notes-*.json`.

## Why 7

**Fixed:**
- On desktop a whole photograph is on the first screen, at y=503–686.
- The filters are one row, and the sheet is clean.
- Nearby shows 16 cards and then 24 country tiles, the most place-like view on the site.
- "psychology" leads to 2 degrees plus subject-area chips.
- The legend is one line.
- Dark mode is strong.

**What holds it at 7:**
- **The biggest number on screen contradicts the doors.**
  - At rest, the light over Denmark reads **320** on desktop and **362** on a phone. The door says 57, and the page says 73.
  - After Nearby, the lights read 62/58/33/28, or 246 on a phone, against "16 degrees".
  - Round 2 reported this unit problem (40 against 57). It is now worse: the number counts neither degrees nor places.
- **The phone first screen is mostly globe.**
  - The + / − / RESET buttons sit on the sphere.
  - A "43" ghosts at the rim.
  - Only about 100 px of a photograph shows.
- **Worldwide on a phone** has a "56" bubble beside "10 countries", then a blank gap, then a line of apology. No photo shows before you scroll.
- **"law"** gives one shipping degree and no way on to the countries.
- "Not yet mapped one by one" describes the site's backlog, not the student's options.

## Three changes

1. **One unit on the globe** (`layoutPins` in globe.js).
   - Print the sum of the members' degree `count`.
   - Give unmapped countries no number.
   - Drop the faded rim clusters.
   - Fixed means: at rest the light reads 57, and Nearby's lights add up to 16.
2. **Phone hero: the photo before the chrome.**
   - Move + / − / RESET off the sphere, or show them after the first touch.
   - Shorten the stage so the count and one full card photo fit in 844 px.
3. **Thin results end on places, in the student's words.**
   - For "law" (1 match) and Worldwide, put the country tiles right under the count.
   - Write, for example, "Law is taught across these countries, open one".
   - Remove the gap above the Worldwide tiles.

## Bugs

| # | Bug | Shot |
|---|---|---|
| 1 | The globe reads 320 / 362 / 246 against 57 / 73 / 16 degrees. | `bug-globe-320-vs-doors.jpg` |
| 2 | "psychology" (2 degrees, both in Roskilde) adds a ghost "2" on the rim (desktop) and a "4" (phone). | `bug-psychology-ghost-bubble.jpg` |
| 3 | On a phone, the controls overlap the sphere and a "43" ghosts at the rim. | `bug-phone-globe-controls-ghost.jpg` |
| 4 | Worldwide on a phone: "56" against 10 countries, and a gap before the tiles. | `bug-phone-worldwide-56-gap.jpg` |
| 5 | The "United Kingdom" label sits on the Netherlands' "58". | `bug-uk-label-on-nl.jpg` |
| 6 | "law" is a dead end after one card. | `search-law-phone-light.jpg` |
| 7 | "Imagery: NASA" overlaps the satellite globe. | `door-nearby-desk-light.jpg` |

The pill has no bug. It stays hidden because applying Filters scrolls the count into view (`notes-probe.json`).
