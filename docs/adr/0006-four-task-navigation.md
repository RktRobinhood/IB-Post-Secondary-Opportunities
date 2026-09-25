# Four menu items, one per question a student brings

## What forced the decision

The masthead carried seven items: Denmark · Europe · Worldwide · Find a degree ·
Check my subjects · Preparing · Deadlines. Measured on the live site in
September 2026 (docs/research/ia/nav-audit.md):

- Denmark, Europe and Worldwide were three items on one axis, and Europe and
  Worldwide were one function (`countryIndex()`) called twice. Denmark was not
  on the Europe page at all, though it is in Europe and on the compare page.
- Find a degree and Check my subjects rendered the same 73 Opportunities with
  the same card, and shared no state.
- Every destination had up to four names: "Worldwide" in the menu was "Beyond
  Europe" in its H1 and footer; "Deadlines" was "The calendar" and "Application
  calendar"; "Preparing" was "What actually counts" and "CAS, the EE and what
  counts".

## The decision

**Countries · Find a degree · Deadlines · What counts**, with **For
counsellors** set apart (right-aligned on a desktop, below a rule in the phone
menu).

- **Countries** (`/countries/`) opens with three doors named by distance —
  *Right here* (the school country, `audience.schoolCountry`), *Nearby* (the
  rest of Europe), *Explore* (everywhere else) — then every Destination grouped
  by region, the globe, and compare. The distance is drawn on each door (a dot
  that is you: rings, a short hop, a line that leaves the frame) and moves
  once, on the `geographic` token. The owner's steer: lose the three places in
  the menu, keep the sense of close, nearby and far in the page.
- The same three doors open the home page and appear as chips under Countries
  in the phone menu (`distanceDoors()`), so a place has one name everywhere.
- A page's `section` that names no menu item is a place, and is under
  Countries (`currentNav()` in layout.mjs). No country is named in that rule.
- Each label is the page's own name, in the menu, the footer and the home page.

## Rejected

- **Keep the three places in the menu, merge the tools** (Denmark · Europe ·
  Worldwide · Degrees · Plan). Smallest change, but keeps two items for one
  template and hides the word "Deadlines", which is what students look for.
- **Journey verbs** (Explore · Check · Plan · Apply). Abstract labels need a
  sentence each; "Apply" implies the site submits applications, which it
  never does.

## Moved addresses

GitHub Pages cannot send a 301. A moved page is a stub from `redirectPage()`:
meta refresh, canonical, `noindex`, and a script that `location.replace()`s to
the new address keeping the query and the anchor, so Back skips the stub. Stubs
stay out of the sitemap, and `scripts/check.mjs` fails any page that links to
one.

| Old | New |
|---|---|
| `/europe/` | `/countries/#europe` |
| `/world/` | `/countries/#worldwide` |
| `/planner/` | `/programmes/#my-subjects`, when the subject checker moves into Find a degree (plan Batch 3) |

## Back means back

Opening the phone menu is a history step: Back closes it. A link followed from
inside the menu replaces that step, so Back from the next page returns to this
page, closed, and one more Back leaves it. Region chips are anchors, so each
jump is a step too.
