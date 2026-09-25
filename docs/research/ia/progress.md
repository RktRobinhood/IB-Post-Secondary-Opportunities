# Progress: text walls and navigation

One entry per batch of [`plan.md`](plan.md), appended as each lands. Numbers are from `scripts/test-text-walls.mjs --report` (default view, static) and `tools/cdp.mjs measure` (rendered, 375×812 phone / 1440×900 desktop) against a local build. Screenshots are in [`after/`](after/): `*.before.*` is the local build before the batch, the plain name is after.

## Batch 0: the text-wall guard (25 September 2026)

**What landed**

- `scripts/test-text-walls.mjs`, registered in `scripts/lib/quality-gate.mjs` as `text-walls` (built stage, straight after `check`). Every built page is held to the six rules in `plan.md`: prose run ≤4 paragraphs and ≤150 words; ≤120 words before the first action; open note ≤60; one paragraph ≤90; whole default view ≤1,500; no 12+-word sentence on more than 10 pages (digits normalised, so "3 dates…" and "5 dates…" count as one sentence).
- A self-test inside the guard: five 30-word paragraphs must fail; the same with a `<details>` after the third must pass; the items of a card list must never be read as prose.
- `scripts/lib/page-measure.mjs` now exports `replaceElements`, `defaultView(html, { markDisclosures })`, `BREAK`, `stripCardLists`, `proseRuns` and `wordsBeforeFirst`. Card lists (`tiles`, `cards`, `timeline`, `prog-list`, `need`, `glance`, `stats` …) are replaced by one break with the nesting-aware remover before runs are counted, which closes the prototype's gap (short `need__card` items adding up to a "run"). `defaultView()` without options is unchanged, so `test-page-budget.mjs` reads the same numbers as before.
- `scripts/lib/text-walls-known.json`: the grandfather list. 11 pages and 5 repeated sentences, each with the numbers measured today and the plan batch that removes it. A listed page may not get worse on any measure; a listed page that passes fails the guard until it is removed; a listed sentence may not spread to more pages. So the list only shrinks.
- `docs/EXPERIENCE_PRINCIPLES.md`: "Every page's budget" table under "The budget".
- `docs/research/ia/tools/cdp.mjs` takes `BASE` and `SUFFIX` from the environment, to shoot a local build and keep before/after side by side.
- The guard reads `DIST_DIR` like `src/build.mjs`, so an agent can measure its own build without touching `dist/`.

**Listed at baseline** (run ¶/words · before-action · note · paragraph · total)

| Page | Run | Before action | Note | Paragraph | Total | Removed by |
|---|---|---|---|---|---|---|
| `/programmes/` | 16 / 4,762 | 0 | 4,770 | 483 | 5,142 | Batch 1 |
| `/planner/` | 2 / 119 | 4 | 79 | 74 | 935 | Batch 3 |
| `/timeline/` | 1 / 25 | 0 | 27 | 25 | 12,629 | Batch 4 |
| `/denmark/apply/` | 13 / 726 | 758 | 113 | 109 | 787 | Batch 5 |
| `/denmark/money/` | 12 / 719 | 734 | 77 | 141 | 1,455 | Batch 5 |
| `/denmark/ib-conversion/` | 6 / 331 | 239 | 115 | 154 | 2,162 | Batch 5 |
| `/trust/` | 17 / 612 | 211 | 189 | 72 | 2,341 | Batch 7 |
| `/counsellors/` | 12 / 432 | 38 | 53 | 57 | 1,033 | Batch 7 |
| `/about/` | 10 / 442 | 472 | 54 | 65 | 497 | Batch 7 |
| `/credits/` | 3 / 274 | 118 | 0 | 132 | 8,102 | Batch 7 |
| `/glossary/` | 24 / 644 | 720 | 0 | 17 | 742 | Batch 7 |

Repeated sentences listed: "# dates on this page are carried over…" (73 pages), "See them on the calendar, alongside anywhere else…" (35), "Where to apply: directly to each university…" (23), "Where no grade is shown…" (22), "Admission is governed at the level below the country…" (11).

The 12 programme pages the prototype flagged on the live site already pass on today's build, so none is listed.

**Gate:** 32 checks, all pass (`text-walls` 0.6s).

## Batch 4: Deadlines opens on "next up" (25 September 2026)

**Files:** `src/pages/timeline.mjs` (rewritten), `src/assets/js/calendar.js` (rewritten), `src/lib/primitives.mjs` (one line: each calendar item carries `data-end` when it has an end date), CSS appended to the end of `src/assets/css/primitives.css` under a "Deadlines" comment block, `scripts/test-calendar.mjs` (new guard), `scripts/lib/text-walls-known.json` (`timeline/` removed).

**What moved where**

| Was | Now |
|---|---|
| H1 "The calendar", scope box "Showing every deadline on the site — 758 in all…" | H1 **Deadlines** (the menu's word), lede "The next dates that apply to you, in order. Some close before you have predicted grades." |
| Country picker behind "Choose which destinations to show" (36 checkboxes in a closed disclosure) | **"Which countries?" chips with counts** of upcoming dates, open by default. Preselected from the Exploration List / compare tray / profile as before. One sideways-scrolling row on a phone; wrapped on desktop |
| — | **Month strip**: one bar per month from this month to the last dated one, height = dates in scope, a "·" on this month. A month opens the full list at that month |
| 541 dated rows, oldest first, 60 past (first row 1 Sept 2025) | **Next up: the next 10** in scope, with "10 of 488" in the heading. Windows still open count as upcoming (past = the end date is behind today) |
| — | **"Every upcoming date (488)"**, closed, grouped by month with month headings |
| Past dates mixed in, greyed | **"Earlier this cycle (54)"**, closed, never before an upcoming date |
| Undated (213) and "Not open to you" | Unchanged, one tap each |
| Aside: Provisional note, stats "Dated events" / "Destinations with dates" | Note unchanged; stats now "Upcoming dates" / "Countries with dates ahead" |

`calendar.js` re-lays the page for the reader's today and scope: a date that passed since the build moves into "Earlier this cycle"; "Next up" is rebuilt as copies of the first ten visible items of the full list, so they cannot disagree; chip, month and disclosure counts are recomputed. With JavaScript off the page shows every country's next ten and every date one tap away (the chips stay hidden, as the picker did).

**Nothing cut.** Every dated event is still on the page (`test-calendar.mjs` now asserts it, and that the default view shows ≤10 dates, all upcoming, in order, for two different "today"s). Cut as self-referential: "Showing every deadline on the site — n in all. Once you start comparing destinations, this narrows to yours." (the chips show it); the 39-word noscript paragraph is shortened to 25 words saying the same thing.

**Numbers** (before → after)

| | Before | After |
|---|---|---|
| Phone screens | 158.1 | **6.9** |
| Desktop screens | 96.4 | **4.3** |
| Default-view words (static) | 12,629 | **504** (of which ~110 are the 36 chip labels) |
| Words in `<main>` incl. closed disclosures | 62,102 | 63,043 (the next-ten appear twice: once up top, once in the full list) |
| Words before the first control (rendered) | 38 (a summary) | **26** (the first chip, 0.57 phone screens) |
| "Next up" heading | — | phone screen 1.0 |
| Guard | listed (total 12,629) | **passes every rule; removed from the list** |

Screenshots: `after/timeline--{phone,desktop}-{fold,full}{.before,}.*`.

**Gate:** 32 checks, all pass.

## Batch 5: the three Denmark sub-pages (25 September 2026)

**Files:** `src/pages/denmark.mjs` (`denmarkApply`, `denmarkConversion`, `denmarkMoney`; the hub is untouched), `src/assets/js/converter.js` (subject lookup added), `data/ib-conversion.json` (two new fields: `gradeAverage.nextTable`, `access.short`), CSS appended to `src/assets/css/primitives.css` under a "Denmark sub-pages" block, `scripts/lib/text-walls-known.json` (three pages removed).

**Preserved from the audience and conversion agents' edits:** the Level → IB table (`levelRows`, now sharing `askedBy()`/`schemeFor()` with the lookup, same output), the SU record rendering (rate, `whoCanClaim.citizens`, the three `equalStatus` routes, `note`, `abroad.*`, `otherwise`, all from `data/funding/dk-su.json`), the "no multiplier" (1.08) paragraph citing BEK nr 288 § 17, the Ukrainian Special Act lines on money and apply, and both audience-allowlisted strings ("SU is limited to the prescribed duration of your", "including SU, can pay you"). The audience guard passes unchanged.

### `/denmark/apply/`

| Was | Now |
|---|---|
| 8 steps as prose paragraphs (26–118 words each) | 8 numbered steps: **date label, action heading, one line**, and the rest behind the step's own disclosure ("Institution codes", "Signing, with or without MitID", "Each institution's deadline", …). Results day and Offers need no disclosure |
| "Applicants who pay tuition" warning note (113 words, open) | `topic` "If you will pay tuition": one short answer (Aarhus: no application in the IB year; check early), full note behind it |
| "If you are a subject short", "Taking a sabbatår" (open h2 + paragraphs) | Two `topic`s with one-line answers; GSK text now links to `/denmark/ib-conversion/#access` |
| — | One line linking these dates to Deadlines, scoped to Denmark |
| Aside facts + "On ranking" note | Unchanged |

Cut: nothing. In each step the one line restates the opening of the old paragraph, and the disclosure holds only what the line does not say (no repetition when opened).

### `/denmark/ib-conversion/`

| Was | Now |
|---|---|
| "If you finish in May 2027" warning note (3 bullets, 115 words) at the top | One small line under the calculator: "Statistisk omregning 2026 … The table for the summer 2027 intake is published by 1 March 2027…" (from `gradeAverage.sourceLabel` + `nextTable`). The full three bullets moved into the grade-average topic |
| Calculator at phone screen 12.3, after 623 words and a 30-row table | **Calculator first** (phone screen 0.9, 56 words before it) |
| — | **Subject lookup** under it: pick an IB course (54: every course in the handbook table plus the four awkward cases), see its Danish level, the Danish name and how many programmes here ask for it. Built from `subjectLevels.map` read backwards, so it cannot disagree with the table |
| Level table, points table, single-grade table, full handbook table, awkward cases, what qualifies you, Danish language, sources: all open h2 sections | Each a `topic`: heading + one-line answer + the table/detail behind "The table, 18 to 45 points", "Every requirement a programme here asks for (27)", etc. Ids unchanged (`#levels`, `#average`, `#single`, `#subjects`, `#languages`, `#special`, `#access`, `#danish-language`) |
| "What qualifies you" (a 4-row prose table + two notes) | Three short answers visible (`access.short`: Diploma 24+ / Course Results / retakes); the table, retake note and results-timing note behind the disclosure. This is the `#access` anchor Batch 6 will link programme pages to |

### `/denmark/money/`

| Was | Now |
|---|---|
| Tuition / SU / reform / living / housing / work / admin: 12 open sections, 760-word prose run, facts box in the aside | **"What it costs"**: a two-column table (what + who pays / amount) of tuition ×2, application fee, residence permit, living costs and the SU rate — the SU row read from the funding record. Stays two columns on a phone |
| SU section (311 words + 3 bullets of up to 64 words) | **"SU: who can claim it"**: one paragraph (citizens apply via minSU; others need equal status, three routes, the first two usually fit families), the three routes as disclosures (the job route keeps the Agency's 40-hours warning), the non-EU study-permit prohibition visible, the EU-rules/Danish-rules note as small print |
| Reform warning note, SU abroad, tuition, living, housing, work, admin order, sources | Each a `topic` with a one-line answer and the original text, unchanged, beneath |
| Aside facts box (tuition, permit fee, SU, living) | Cut: true repetition of the cost table. The rent-figure note stays |

Cut as framing: "SU is the reason students in Denmark can live independently at nineteen — if they can claim it." Nothing a student could act on was cut.

### Numbers (before → after)

| | apply | money | ib-conversion |
|---|---|---|---|
| Phone screens | 8.9 → **7.0** | 14.7 → **7.2** | 48.8 → **6.6** |
| Desktop screens | 4.1 → **3.6** | 7.0 → **4.4** | 17.9 → **3.9** |
| Default-view words | 787 → **447** | 1,455 → **547** | 2,162 → **572** |
| Words in `<main>` incl. closed | 787 → 869 | 1,455 → 1,653 | 2,378 → 2,797 (the 54 lookup options) |
| Disclosures | 0 → 9 | 0 → 11 | 4 → 12 |
| Longest prose run (words) | 726 → **46** | 719 → **87** | 331 → **46** |
| Before the first action | 758 → **32** | 734 → **3** | 239 → **28** |
| Longest open note / paragraph | 113 / 109 → 43 / 41 | 77 / 141 → 41 / 43 | 115 / 154 → 46 / 44 |
| First control, phone | none → step 1's disclosure at 0.9 | none → first SU route at 2.2 | input at 12.3 → **0.9** |

All three pass every text-wall rule and are off the grandfather list (7 pages remain: programmes, planner, trust, counsellors, about, credits, glossary).

Against the plan's softer targets: apply is 447 default words against "≤250", and its 8 steps span about 2.7 phone screens against "≤2"; money is 547 against "≤300". The remaining words are the one-line step actions and topic answers; cutting further would mean dropping facts a student acts on (the 12:00 CET deadline, the signing rule, who pays what), so it was not done.

**Deferred:** the plan's "extend `test-page-budget.mjs`'s ≤90-word topic check to every page" would currently fail on two pages outside this batch (`/guides/medicine-abroad/` "A checklist before you commit", 178 words; the DTU General Engineering programme page's "What it is", 91), so it is not wired yet. The money page's three-question SU stepper (`grant-check.js`) was not built; the three routes as disclosures answer the same question without JavaScript.

Screenshots: `after/denmark__{apply,money,ib-conversion}--{phone,desktop}-{fold,full}{.before,}.*`.

**Gate:** 32 checks, all pass.
