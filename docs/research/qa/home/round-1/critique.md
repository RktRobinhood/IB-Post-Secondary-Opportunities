# Home as discovery surface: art director, round 1

**Score: 6 / 10.** Not ready for students yet.

Captured against http://localhost:4350/ with `shoot.mjs`, `probe.mjs` and `probe2.mjs` (in this folder; real GPU). Viewports: desktop 1280x800 and phone 390x844, light and dark. Raw state is in `notes-*.json`.

## Why 6

What works: the night hero, the headline and the three doors make a real first screen, and Denmark is prominent without being the only way in. "Right here" and "Nearby" fly the globe to the right place. Back undoes one choice at a time and puts the scroll position back (`notes-desk-light.json` → `back`). The doors have a clear gold focus ring. Dark mode hangs together better than light. The phone sheet is clean, and its button counts live ("Show 18 degrees").

What stops it at 6:
- **The cards are homework.** One card carries a title, a credential line, three to eight lines of "one of: … / … / …", a grey "Danish requirement" paragraph, a link, two or three tags and the institution. That is 420px of text under a photo washed out by the veil.
- **Duplicate cards.** The first twelve include three Copenhagen Business School "Business Administration and …" cards and two identical "Architectural Technology and Construction Management" cards. That breaks the uniqueness rule.
- **The most adventurous door is the dullest.** "Explore · Worldwide" leaves the globe on its default view, turns every light grey and says "No degrees". The ten beautiful country tiles are hidden below the fold.
- **On a phone the student gets no feedback.** The result count sits at y≈1218 behind the globe. After tapping a door or typing, nothing on screen changes except the globe (`countOnScreen: false`).

## The three changes that would raise it most

1. **One line per card, one card per programme family.** Files: `src/pages/discover.mjs` (`card()` calls), `.card--backdrop` in `site.css`, `cardGroups`/`familyCard` in `src/lib/paths.mjs`.
   - On the home card, drop the `req__local` Danish block and the "one of" chains. Show one clamped line, for example "Needs Maths HL 4 · Physics", with "+2 more" leading to the programme page. Keep at most one tag.
   - Start the veil lower, so the photo's top 60% is unwashed.
   - Merge the three CBS Business Administration cards and the VIA/Zealand pair into family cards with paths inside.
   - Fixed means: the first 12 cards have 12 distinct titles, no more than one requirement line each, and a card under about 300px tall on desktop.

2. **Make Worldwide and empty results into places.** Files: `discover.js` `frame()`/`paintMap()`, and `presetView.far` in `discover.mjs`.
   - "Explore" should frame the worldwide Destinations (their bounds, not `reset`) and keep their lights gold.
   - The ten country photo tiles should appear straight under the count, with the count line reading "10 countries researched".
   - A search with no hits, such as "medicine", should offer the nearest way out: the medicine guide that is already in the footer, and "remove one filter" suggestions.
   - Fixed means: no door, and no ordinary subject word, ever lands on grey lights and "No degrees".

3. **Phone: put the result under the thumb.** Files: `.discover__hero` and `.discover__globe` under 52rem in `site.css`, plus `discover.js`.
   - Show a sticky "57 degrees ↓" pill under the search row whenever the count changes, or shrink the globe to about 55vh.
   - Fixed means: at 390x844, after tapping a door or typing, the count and the top of the first card are visible without scrolling.

## Bugs

| # | Bug | Screenshot |
|---|-----|-----------|
| 1 | Worldwide door: the globe stays on its default view, all degree lights turn grey, the count reads "No degrees" and the tiles are off-screen | `desk-light-03-door-far.png`, `desk-light-04-door-far-results.png`, `phone-light-03-door-far.png` |
| 2 | Phone: a door, search or filter gives no visible feedback because the count is 370px or more below the fold | `phone-light-03-door-here.png`, `probe2-phone-search-medicine.png` |
| 3 | "medicine" returns "No degrees" with no hand-off, and the empty state is one bare line | `probe2-phone-search-medicine.png`, `desk-light-07-search-none.png` |
| 4 | Near-identical cards sit side by side (CBS ×3; Architectural Technology in Horsens and Næstved) | `probe-row4-cbs.png`, `desk-light-04-door-here-results.png` |
| 5 | The "Show all 73 degrees" label stays the same once opened and now sits mid-list; the page grows to 15,011px | `probe2-show-all-open.png` |
| 6 | Nearby: globe bubbles mix institution counts (country lights, `count: c.institutions.length`) with degree counts. They read 18/8/3/4 while the door says "16 degrees" | `desk-light-03-door-nearby.png` |
| 7 | Phone eyebrow wraps and its rule floats alone at the right edge | `phone-light-01-first.png` |
| 8 | Phone "Filters" button looks disabled: pale grey with no border in light, neutral `rgb(107,107,107)` in dark (off-palette) | `phone-light-01-first.png`, `phone-dark-01-first.png` |
| 9 | A dimmed chip with a 0 count still activates and leads to "No degrees" (Nearby + Accepts Course Results) | `desk-light-10-focus-chip.png` |
| 10 | CBS Digital Management uses a Kanban sticky-note stock photo that reads as a classroom, not a place | `probe-row4-cbs.png` |

Note: in the full-page JPGs the lower cards look photo-less because `loading=lazy` images don't load in a beyond-viewport capture. Scrolled into view, they load (`probe-row4-cbs.png`). That is not a bug.
