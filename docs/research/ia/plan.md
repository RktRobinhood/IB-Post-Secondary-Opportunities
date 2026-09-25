# Implementation plan: navigation and text walls

This plan implements [`nav-audit.md`](nav-audit.md) §5 and [`text-walls.md`](text-walls.md). The batches are ordered so that each one ships alone, passes the gate (`npm test` = `scripts/qa.mjs`), and makes the site better even if the next one never lands.

**Working rules** (from project memory): agents write files and the coordinating session commits; agents do not run git. Add worktrees by hand from local `main`. Code never branches on a country; each rule is universal and enforced by a guard that reads the source back. Canonical records are live, so edit `data/…` directly and never re-run `migrate:dk`. Each batch passes the critic loop (score ≥ 8, at most 5 rounds, otherwise file an issue with evidence). "Possibilities first": pictures and places before rules, one line per block.

**Files other agents are editing now:** `src/assets/js/globe*.js`, `map*.js`, `src/lib/primitives.mjs` (globe); `src/lib/components.mjs`, `src/assets/js/explorer.js`, `data/programme-images.json` (programme cards). On 25 September, `explorer.mjs`, `planner.mjs`, `planner.js`, `institutions.mjs`, `meta.mjs` and `data.mjs` were also modified that morning. The batches touching those files are marked **⚠ after card/globe work lands**. Rebase onto the result; do not edit in parallel.

---

## What already constrains word counts

| Guard | File | What it enforces | Scope |
|---|---|---|---|
| Destination page budget | `scripts/test-page-budget.mjs`, measure in `scripts/lib/page-measure.mjs` | ≤120 words before `#institutions`; ≤650 words of reading from `#overview`; ≤90 words per `section.topic` default view; ≤1,500 whole default view; institutions before topics; sources last and closed | **`dist/destinations/*` only** |
| Registration | `scripts/lib/quality-gate.mjs`, `id: 'page-budget'`, `stage: 'built'` | Runs after the build | — |
| Documented budget | `docs/EXPERIENCE_PRINCIPLES.md` "The budget" | The table above; "the fix is a shorter short answer or a new disclosure, not a higher number" | Destinations |
| Nav section per page | `scripts/test-destinations.mjs` (`sectionOf()`, and the allow-regex `^section:\s*['"]\/(programmes\|planner\|timeline\|prepare)\/['"]$` near l.347) | Which menu item a page claims | Changes in Batch 2/3 |
| Controls | `scripts/test-controls.mjs` (l.383 mentions `/planner/`'s eighteen selects) | Control styling and touch policy | Changes in Batch 3 |
| IB terms on cards | `scripts/test-requirement-translation.mjs` (`ib-terms`) | No card shows a local-level requirement without its IB translation | Cards: Batch 1/3 |
| Links | `scripts/check.mjs` | Structure, metadata, internal links | Must accept redirect stubs (Batch 2) |

Nothing measures any page outside `/destinations/`. That is how `/programmes/` reached 78 phone screens and `/timeline/` 158 with every check green, the same failure #37 recorded for Destinations.

## The new guard: `scripts/test-text-walls.mjs`

A prototype is in [`tools/text-wall-probe.mjs`](tools/text-wall-probe.mjs). Run on the 149 live pages, it flags exactly the pages the hand audit found (23: the 11 standalone pages in `text-walls.md` plus 12 programme pages), and **no** Destination or University page.

### Rules

Every built page is held to them, and none is named in code:

| Rule | Budget | Why this number |
|---|---|---|
| **Prose run**: consecutive paragraphs of ≥15 words with only headings between them, before a picture, control, card, table or disclosure | **>4 paragraphs or >150 words fails** | About one phone screen of body text. Rebuilt pages measure ≤89 words. Headings do not break a run, because heading, paragraph, heading, paragraph is still a wall |
| **Words before the first action**: default-view words after the hero, before the first picture, control, card, table or `<summary>` | **120** | The same number as the Destination "before institutions" budget, generalised |
| **Open note**: any `aside.note` in the default view | **60** | A note is a callout, and a longer one is a dump (the `/programmes/` note is 4,770) |
| **One paragraph** | **90** | The same as the one-topic budget |
| **Whole default view** | **1,500** | The same as the Destination ceiling |
| **Repeated sentence**: a visible sentence of ≥12 words on more than 10 pages | fails | Boilerplate belongs in a component (chip, tooltip, legend) or on one linked page |

### Mechanics

- Move `replaceElements()` into the exports of `scripts/lib/page-measure.mjs`. Add `defaultView(html, { markDisclosures: true })`, which keeps a marker for each closed `<summary>` (the prototype fakes this). Add `proseRuns(view)` and `wordsBeforeFirst(view, BREAK)`. Card-list containers (`ul.tiles`, `article.card`, `ul.need`, `ul.timeline`, `ul.prog-list` …) are removed with the nesting-aware remover before runs are counted, so the items of a card list are never read as prose. This closes the prototype's known gap, where short `need__card` items on 12 programme pages add up to 153 words.
- **Ratchet, then strict.** `KNOWN_WALLS` is a map `{ 'programmes/': { run: 4762, note: 4770, … } }` of today's measured values, each entry with an issue number. The guard fails if an unlisted page breaches a rule **or a listed page gets worse**. Each batch below deletes its entries. Batch 9 deletes the map. An entry whose page now passes also fails the guard ("remove me"), so the list can only shrink.
- Reference pages (`/credits/`, `/glossary/`) do not get an exemption. They meet the same rules with closed disclosures, just as Destinations did.
- Register it in `scripts/lib/quality-gate.mjs`: `{ id: 'text-walls', script: 'scripts/test-text-walls.mjs', stage: 'built', title: 'No page opens on a wall of prose; details sit behind a disclosure' }`.
- A self-test in the same file: feed it a synthetic page with 5 × 40-word paragraphs and assert that it fails; feed it the same page with a `<details>` after paragraph 3 and assert that it passes. This is how the page-budget guard proved its own ordering check.
- Document it in `docs/EXPERIENCE_PRINCIPLES.md`: extend "The budget" into "Every page's budget" and add the six rows.

---

## Batches

### Batch D: the home page becomes the discovery surface (replaces Batch 1; 25 September 2026)
Owner: "Find a degree … needs to feel like adventure, discovery and opportunity … It's meant to be a 3D visualising tool that is more fun than the 2D cards of the front page. Maybe move it to the front as a filter-type system over the cards, then cut all the text that serves no purpose."

**The page, top to bottom (`/`, section `#discover`)**
1. **Globe hero**: `worldWindow()`, full-bleed and tall, with every place that has a degree plus a pin for each Destination without one (so Worldwide is not empty). One line of intro over it, no more.
2. **Three distance presets** on the globe: *Right here · Denmark*, *Nearby · Europe*, *Explore · Worldwide* (`distanceDoors()`; "Right here" is `audience.schoolCountry`, never "home"). Each one frames the globe (`show({ country })`, `show({ bounds })` from the scope's Destinations, `reset()`) and sets a scope filter on the cards.
3. **Filter chips**: Subject (select), Where (grouped select), *Accepts Course Results* (with an "i" linking to `/guides/course-results/`), *No Maths HL needed*, *Open admission*, and *Check my subjects* (links to `/planner/` until Batch 3 puts the panel here). Live counts, and every choice is a Back step (the history model from Batch 1's `explorer.js`). On a phone the chips go behind "Filters (n)" in a sheet.
4. **One count line, then the cards**: server-rendered at build time through `card()` (components.mjs, not edited) with `cardGroups()`/`familyCard()` (paths.mjs), so the backdrops, the IB requirement lines, the credential line and the "N paths" rows are the variants agent's. Filtering hides cards; with no JavaScript every card is there. Choosing a place on the globe narrows the cards; the filters re-weight the pins (`setCounts`).
5. **When a scope has no mapped degrees** (Worldwide today), the Destinations in that scope show as photo tiles instead (`placeTiles()`), under one line saying so.
6. **Then the tools, one row**: Deadlines · What counts · Compare, and the small print.

**Moves:** `/programmes/` → `redirectPage('/#discover')` (query and hash kept); programme pages stay at `/programmes/<id>/`. Menu "Find a degree" → `/#discover`. Breadcrumbs "Programmes" → "Find a degree" at `/#discover`. The old hero copy, reel, doors and study question are absorbed (the reel's job is done by the card photographs). `release-check.mjs`, `test-programme-images.mjs`, `test-unique-images.mjs` and `test-requirement-translation.mjs` read the finder from `/` instead of `/programmes/`.

**Globe:** the globe files are the globe agent's. Anything the hero needs from them is specified in `docs/research/ia/globe-hero.md`.

**Carried over from Batch 1** (progress.md): `/guides/course-results/`, `alternativeRouteSummary`, the route-placement guard, `awardLabel()`, the "i" popover, `requiresMathsHL()`, readable institution names. Critic round 2 (8/10) must-fixes also apply: the cut-off reads "Lowest admitted in 2026: 40 IB points", never "a floor"; and "Diploma, or another route" must lead somewhere a student can read the route.

**Done when:** the first card is within 1.5 phone screens and 1 desktop screen; no prose between the globe and the first card beyond one line; every choice is a Back step with scroll restored; the gate passes; screenshots desktop and phone, light and dark, in `after/`; critic ≥ 8.

**Then Batch 3** (My subjects) goes inside this surface, and `/planner/` redirects to `/#my-subjects` with its state.

### Batch 0: the guard, in ratchet mode (no visible change)
- **New:** `scripts/test-text-walls.mjs`.
- **Edit:** `scripts/lib/page-measure.mjs` (exports and `markDisclosures`), `scripts/lib/quality-gate.mjs` (register), `docs/EXPERIENCE_PRINCIPLES.md` (budget table), `docs/PAGE_TEMPLATES.md` (acceptance checklist: "no prose run over 150 words; nothing but one line between filters and results").
- **Seed** `KNOWN_WALLS` from `npm run build && node scripts/test-text-walls.mjs --baseline`.
- **Done when:** the gate is green, and the self-test shows the guard can fail.

### Batch 1: Find a degree loses its wall ⚠ after card work lands
Highest value, smallest change. Target: first card within 1.5 phone screens; ≤60 words between H1 and first card.
- `src/pages/explorer.mjs`:
  - **Delete the `note()` block** (the `routes` collection and the "If you will not hold the full Diploma" note).
  - Drop `crumbs()`.
  - H1 becomes the count: `${plural(programmeCount,'degree')} taught in English`. Lede: `${scope.label}, mapped subject by subject.` plus a link to Countries.
  - Merge `f-inst` and `f-campus` into one `f-where` grouped select (`<optgroup>` per Destination, cities, then institutions by **full name**).
  - The award select becomes a chip "Accepts Course Results (n)" with an ⓘ popover of ≤35 words and a link to `/guides/course-results/`.
  - Render help text from the options actually offered, never mentioning a state with no records.
- `src/assets/js/explorer.js`:
  - `f-nomath` label "No Maths HL needed". Its logic reads the IB-term requirement, not "Mathematics A" (ADR 0002).
  - `f-where` parsing, keeping the old `?inst=` and `?campus=` query params readable.
  - A card badge from `p.award`: "Course Results: route published" or "Diploma only", linking to `${p.href}#requirements`.
  - The card slimmed to ≤35 words: drop the summary or cut it to one clause, move "Danish requirement" lines to the programme page, and make the cut-off "Cut-off 11.1 (2026) ⓘ". The `ib-terms` guard must still pass.
  - Phone: one "Filters (n)" button opening a sheet with a sticky "Show n degrees".
- `src/lib/primitives.mjs` ⚠ (globe agent): in `worldWindow()`, say the "Placed at the city, not at the campus" precision caveat once, in the legend, not per place. Make the caption one legend line. `filterQuestion({ help })` renders as a popover (`<button aria-expanded>` + a `role="note"` panel) rather than a paragraph.
- **New** `src/pages/course-results.mjs` → `/guides/course-results/` (write it in `src/build.mjs` beside the topic guides and add it to the footer Guides list):
  - Generated from records: for each Destination with Opportunities, one line from a **new optional field `ibRecognition.courseResults.short`** in `data/destinations/*.json` (one sentence; the long form stays in the existing evidence). Then a table of institution → "route published / Diploma only", from `requirements[].alternativeRoute` and `entryAward()`, with each `alternativeRoute` in a `<details>` **headed by the programme's name**.
  - Add the field to `schemas/` with the other `ibRecognition` fields, and fill it for `dk` and `nl`.
- `src/assets/css/site.css`: popover, chip row, filter sheet.
- **Guards:** remove `programmes/` from `KNOWN_WALLS`. Add to `scripts/test-catalogue.mjs` (or a new check) that no `alternativeRoute` string is rendered outside its own programme page or the guide.

### Batch 2: Navigation (four items, Countries hub, redirects) ⚠ `destinations.mjs` after globe work
- `src/lib/layout.mjs`:
  - `NAV = [Countries /countries/, Find a degree /programmes/, Deadlines /timeline/, What counts /prepare/]`, each with a `line` field (the one-line descriptions in nav-audit §5). Add `{ href: '/counsellors/', label: 'For counsellors', quiet: true }`.
  - `FOOTER` labels renamed to the menu's words (Countries, Find a degree, Deadlines, What counts), with Guides and About kept.
  - Drawer markup: rows with `line`; Denmark · Europe · Worldwide chips under Countries (`/denmark/`, `/countries/#europe`, `/countries/#worldwide`); `aria-current` in the drawer too; a divider, then counsellors · about · report.
  - A new `redirectPage(to)` export: meta refresh, canonical, `noindex`, and `location.replace(to + location.search + location.hash)`.
- `src/assets/js/site.js`: focus trap inside the drawer, and focus back to the toggle on close. The masthead button gets the visible text "Menu".
- `src/pages/destinations.mjs`:
  - `countryIndex()` becomes `countriesIndex(site)`, taking both `site.europe` and `site.world`.
  - Open with `doors()` (import from `components.mjs`): Denmark, Europe and Worldwide, reusing `data/site-config.json` `homeDoors`.
  - A sticky region-chip row; region groups with `id="europe"` and `id="worldwide"` wrappers; a Denmark tile first (read from `site.dkInstitutions` / the dk Destination record, not a hard-coded link); then the globe; then compare.
  - `europeIndex()` and `worldIndex()` are deleted.
  - l.636 `section:` becomes `'/countries/'`.
- `src/lib/canonical.mjs` l.261: `section` → `'/countries/'` for every Destination (the hub distinction goes away). `src/pages/denmark.mjs`: `section: '/denmark/'` ×4 → `'/countries/'`.
- `src/build.mjs`: `write('/countries/', countriesIndex(site))`; `write('/europe/', redirectPage('/countries/#europe'))`; `write('/world/', redirectPage('/countries/#worldwide'))`; leave stubs out of `sitemap()`.
- `src/pages/home.mjs`: doors unchanged (they already point at `/denmark/`; switch the Europe and World doors to `/countries/#europe` and `#worldwide`). Keep the toolkit link to `/compare/`.
- `scripts/check.mjs`: recognise a redirect stub (meta refresh plus canonical) as a valid page, and **fail on internal links that point at a stub**, so no page links through a redirect.
- `scripts/test-destinations.mjs`: expected `section` values → `/countries/`; update the allow-regex near l.347.
- **New ADR:** `docs/adr/0006-four-task-navigation.md` (the decision, the rejected alternatives B and C, and the redirect policy). Update `docs/PAGE_TEMPLATES.md` "Shared experience shell" and `docs/EXPERIENCE_PRINCIPLES.md` "Every page" table (Europe / Worldwide row → Countries).

### Batch 3: Check my subjects moves into Find a degree ⚠ after card work lands
- **New** `src/assets/js/profile.js`: one module for the Student Profile's `localStorage` read and write, and events, used by both scripts (planner.js already stores the profile; lift that code out rather than duplicating it).
- `src/pages/explorer.mjs`:
  - A "My subjects" panel with `id="my-subjects"`. Move the `<form class="picker">` markup out of `planner.mjs` into a shared partial `subjectPicker(site)` in `src/pages/programme-facts.mjs`, next to the other shared programme helpers.
  - Emit the `opportunities`, `evidenceIndex` and `evidencePolicy` JSON that `planner.mjs` builds today.
- `src/assets/js/explorer.js`: when the profile has at least two subjects, run the same assessment `planner.js` runs (import it, do not re-implement it). Put a fit badge on each card, add the "Only what I qualify for" chip, and add the fit-outcome chips (Meets / Possible with action / Needs review / Does not currently meet).
- `src/pages/planner.mjs` → deleted; `src/build.mjs` writes `/planner/` as `redirectPage('/programmes/#my-subjects')` (the query is preserved).
- Links to update: `home.mjs` toolkit, `denmark.mjs` hero button and apply step 1, `programme.mjs` "Check my subjects against it", `prepare.mjs` aside button, `counsellors.mjs`, `layout.mjs` footer. `check.mjs` from Batch 2 catches any that are missed.
- **Guards:** `test-controls.mjs` (the selects move to `/programmes/`), `test-eligibility.mjs` (engine unchanged, and it must stay green untouched), `test-requirement-translation.mjs`, `test-destinations.mjs` allow-regex (drop `planner`).
- **Docs:** ADR 0003 gets a note that the Decide scene now includes the profile, and `docs/PAGE_TEMPLATES.md` "Fit explanation" says where it renders.

### Batch 4: Deadlines opens on "next up"
- `src/pages/timeline.mjs`:
  - Server-render, in order: a month strip (Oct → Aug, one tick per dated event, "today" marker); country chips with counts (`represented` already exists); **the next 10 upcoming dated events**; then `<details>` "Everything upcoming (n)", "Earlier this cycle (n)" for past dates, and the existing undated and closed topics.
  - Past means `e.date < build date`. Also have `calendar.js` recompute on load, since a page can sit in a browser for a week (the concern `planner.mjs` already records).
- `src/assets/js/calendar.js`: chips drive the scope, preselected from the Exploration List or compare selection; "Next up" follows the scope. The no-JS view is still complete, one tap away.
- `src/lib/primitives.mjs` ⚠ `deadlineList()`: an optional `groupBy: 'month'` that emits month headings. No data changes.
- **Guards:** remove `timeline/` from `KNOWN_WALLS`. `scripts/test-calendar.mjs` gets an added assertion: no past-dated event appears before the first upcoming one in the default view.

### Batch 5: The Denmark sub-pages
The rules and numbers here are universal, even though the page is Danish: every block is read from the records (`site.recognitionSchemes`, `stateGrant(site)`, `data/funding/*`), never typed in.
- `denmarkConversion()`:
  - The calculator first (move `#calculator` above `#levels`), with a subject-lookup select beneath it (from `c.subjectLevels` rows).
  - Every table goes into `topic()` with a one-line `short` and the table as `body`.
  - The "If you finish in May 2027" note becomes one hero line.
  - "What qualifies you" (`c.access.*`) becomes three short answers. It becomes the page the programme pages link to for the national Course Results rule (Batch 6).
- `denmarkMoney()`:
  - A `glance()` band (tuition / grant / living, from `stateGrant(site)` and the budget rows).
  - Every `<h2>` section becomes `topic()` with a ≤90-word short answer.
  - **New** `src/assets/js/grant-check.js`: a three-question stepper over the grant's `routes`, read from the funding record (`routeList(grant)` already exists), not from copy.
- `denmarkApply()`: steps rendered with `steps()` (components.mjs), each a date plus a one-line action, the rest in the step's own `<details>`. "Subject short" and "sabbatår" become `topic()`s. Each step links its date to `/timeline/#…`.
- **Data:** add `short` strings to the records that feed these sections, where the first sentence (`firstSentence`) is not already a good short answer. Candidate fields: `data/funding/*.json` routes, `data/ib-conversion.json` `access.{summary,rules,retakeRule,resultsTiming}` and `subjectLevels.specialCases[].detail`.
- **Guards:** remove the three pages from `KNOWN_WALLS`. Extend `test-page-budget.mjs`'s topic check (≤90 words) to any page with `section.topic`, not only Destinations.

### Batch 6: Programme-page disclosures and the Evidence drawer ⚠ primitives/components
- `src/lib/primitives.mjs` `evidenceBlock()`: each record becomes one line (publisher · type · date · status), with `excerpt`, `claim` and `interpretation` in a nested `<details>`. The summary reads "Sources (12)"; drop the 22-word "Open this to see…" line.
- `src/pages/programme.mjs`:
  - "The fine print" shows the programme's own rules. A national rule shared by every Opportunity in a Destination is **detected, not named**: evidence cited by more than N Opportunities with the same `destination` renders as one line linking to its home (the conversion page's `#access`, or `/guides/course-results/`).
  - Remove the duplicate "Apply by" from the side aside.
  - "What it is" must not start with the hero lede (use `firstSentence` for the hero and the remainder for the topic).
- `src/lib/components.mjs` ⚠ `freshness()`: one state chip ("Read from source · 23 Sep") with the explanation in a tooltip or popover. The provisional-dates sentence becomes a badge on each provisional date.
- **Guards:** the repeated-sentence rule goes strict for programme pages. `KNOWN_WALLS` programme entries are removed.

### Batch 7: The essays (trust, counsellors, about, credits, glossary)
- `src/pages/trust.mjs`: nine `topic()` short answers; a glance band with two numbers (from the same counts `counsellors.mjs` computes); a "Report a mistake" button at the top. The motion section is cut to one line and moved to `about`.
- `src/pages/counsellors.mjs`: the coverage table first; the "four things students get wrong" as four cards (a `toolkit()`-style list); the conversation order as a 4-step strip; the rest as `topic()`. Budget ≤600 default words.
- `src/pages/meta.mjs`:
  - `about()`: three short answers.
  - `credits()`: photographs grouped by Destination in closed `<details>`, with a filter box.
  - `glossary()`: a filter input and A–Z chips, one-line definitions, the rest on tap.
- **Guards:** empty `KNOWN_WALLS` of these pages.

### Batch 8: Compare on a phone
- `src/pages/compare.mjs`: the "Why there is no ranking" note becomes the lede (it already says it). The "whole set" table becomes compact rows (country · EU tuition · English-taught in one word · coverage dots), with cell prose in a row expander. `src/assets/js/compare.js` handles sort.
- **Data:** a one-word or short-number field per Destination for the compact columns, if one does not exist. Check `feeContext` and `language` for a structured value before adding `summaryShort`.
- **Target:** ≤6 phone screens.

### Batch 9: Strict mode and What counts by IB year
- Delete `KNOWN_WALLS`, so the guard is strict for all pages.
- `src/pages/prepare.mjs`: group actions by `timing`, bucketed into DP1 / DP2 summer / DP2 autumn / after results. `data/preparation.json` `actions[].timing` is free text today ("Before you finalise IB subject choices…"), so add a structured `when` enum beside it. Link each timed action to `/timeline/`.
- Phase-2 option from nav-audit: tabs **Degrees | Universities** on `/programmes/`, and `/universities/` → `redirectPage('/programmes/?view=universities')`.

---

## Order and dependencies

```
Batch 0 (guard) ─┬─ Batch 1 (finder wall)  ⚠ cards ─┐
                 ├─ Batch 2 (nav, redirects) ⚠ globe ┼─ Batch 3 (planner merge) ⚠ cards
                 ├─ Batch 4 (deadlines)              │
                 ├─ Batch 5 (Denmark sub-pages)      │
                 ├─ Batch 6 (programme disclosures) ⚠ primitives/components
                 ├─ Batch 7 (essays)
                 └─ Batch 8 (compare) ───────────────┴─ Batch 9 (strict + prepare by year)
```

Batches 4, 5, 7 and 8 touch no file under active edit and can run in parallel worktrees now. Batch 1 is the one the site owner is waiting for; if the card agent's work is close, land it first and do Batch 1 immediately after.

## Checks per batch
1. `npm run build && npm test`: the gate, including `text-walls` and `page-budget`.
2. `node docs/research/ia/tools/text-wall-probe.mjs dist`: before and after numbers go in the PR body.
3. Screenshots with `docs/research/ia/tools/cdp.mjs … shoot` against the preview, saved to `docs/research/ia/after/`, the same file names as `before/`.
4. The critic loop: score ≥ 8 on "does a student reach something to do within one screen, and does every paragraph change what they do".
