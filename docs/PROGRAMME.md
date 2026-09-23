# Programme state

The live state of the work: what is done, what is in flight, what is next, and
what has been learned that nothing has acted on yet.

This file exists so the work survives an interrupted session. See
[PARALLEL_WORK.md](PARALLEL_WORK.md) for why, and for the rest of the
conventions fan-out work here runs under.

**Updated:** 2026-09-23. 14 of 35 Destinations at the floor; 430 dated events.

---

## Done

| Issue | What landed | Commit |
|---|---|---|
| #13 | The calendar reads the data. Scoped to what the student is looking at, shareable URL, Exploration List implemented | `ff659c8`, `ea35ca5` |
| #12 part 1 | Basemap, projection, clamping | `f83baf8` |
| #12 part 2 | Markers decorative and the list carrying their cues; keyboard camera; grouping and spiderfying; the explorer's duplicate map deleted | `6ae31b9` |
| #15 step 1 | Research depth stated on every Destination page | `b3bb839` |
| #15 step 2 | The publication floor — five checks, computed not asserted | `8057e2f` |
| #17 | Imagery approval state, a floor derived from the score distribution, a designed empty state, a scorer that knows what it got wrong | `2490dac` |
| #16 | The Application Jurisdiction model | `78d3e6d` |
| ADR 0002 | The IB scale as the lingua franca; Recognition Schemes; 201 requirements migrated | `f788173`, `f841942` |

### The data migrations

- **Deadlines.** 177 entries → 261, of which 199 carry a sortable date. Every
  entry now has an ISO date or one of six declared date states. `ff659c8`.
- **Requirements.** 201 requirements across 37 Opportunity records moved from an
  implicitly-Danish `level` onto a declared `levelScale`. `f841942`.

---

## In flight

- **#18, the style pass.** Partial work is on disk in `components.mjs`,
  `primitives.mjs` and both stylesheets, and the build is green. Scene
  variants `arrival` and `close()` exist; chapter CSS and the motion tokens
  were next.
- **The Netherlands Opportunity pilot.** Restarted from nothing.

Anything named here that is *not* in the git log was interrupted and needs
restarting from the brief. On 2026-09-23 a session usage limit killed six
agents at once; four had written nothing and two had written work that
survived because it was on disk. That is the whole argument for
[PARALLEL_WORK.md](PARALLEL_WORK.md)'s first rule, and it was tested within
an hour of being written.

---

## The queue, in order

### 1. Destinations still below the floor

**14 of 35 meet it.** `npm run floor -- --report` is the authority; it is
computed and cannot go stale. The order is worst-first, which is also roughly
the order issue #15 asked for.

Each one is a research pass against [RESEARCH_BRIEF.md](RESEARCH_BRIEF.md).

- At the floor: `ae au ca de gb ie jp kr nl no nz se sg us`
- Remaining worldwide: `cn hk`
- Remaining European: `at be ch cz ee es fi fr gr hu is it lt lu lv mt pl pt si`

A note on sequencing that cost time once: **a pass that edits
`data/countries/*.json` cannot run at the same time as the repo-wide link
sweep**, which owns every one of those files. Country research and cross-cutting
data sweeps are mutually exclusive; plan them in separate waves.

### 2. Opportunity coverage past Denmark (#15 step 4)

The largest piece of work in the repository, and it was blocked until
`f841942` — the requirement model could not express a non-Danish entry
requirement at all. It can now.

**The Netherlands is the pilot, in progress.** It is the first real user of
ADR 0002, and the question it answers for everything after it is whether a
Destination that publishes its rules in IB terms genuinely needs no Recognition
Scheme. If it does not, most of the world does not either, and the remaining
Destinations are research rather than modelling.

### 3. #18 — the style pass against the reference sites

Not started. It overlaps #12 at the world window, and the issue says to do it
with #12 and #19 in view rather than ahead of them. #12 is now done, so this
is unblocked.

### 4. #19 — the globe

Deliberately not started. The issue itself says to prototype a vertical slice
before committing to an engine, and asks the harder question of whether 3D is
better here at all — a globe is worse than a flat map for comparing European
Destinations, which is most of what these students do. The recommendation is to
answer that question before building, and to record the answer as an ADR
whichever way it goes.

### 5. #17 — the hero review

29 Destination heroes queued, worst first, through `npm run images:review`.
The only item in the programme that a person has to do.

### 6. Open follow-ups filed during this programme

- **#21** — seven dated claims cited to pages that do not carry them, mostly
  site roots. A homepage stays live forever and never carries the claim, so
  `npm run verify` can neither pass nor fail it.
- **#22** — eight contradictions the deadline migration surfaced. Each needs a
  person at the official page. The worst is Korea's, where the intake and the
  deadlines describe different years.
- **#23** — dated milestones still buried in `notes`, including several that
  are specifically IB-candidate deadlines.

---

## Model friction

Things the records could not say. Recorded here because more than one pass hit
most of them independently, which is the signal that they are the model's fault
and not the researcher's.

### ~~An Application Route milestone cannot say why it has no date~~ — fixed

**Hit independently by the Canada and United States passes; it cost Canada 16
milestones.** `country.application.deadlines[]` accepted the six date states;
`application-route.schema.json` did not, and `calendar.mjs` read a
`milestone.dateState` the schema rejected. So a researched finding — "there is
no OUAC deadline for international applicants", "each college sets its own
Early Decision date" — had to be moved back onto the country profile to be
sayable at all, and a route left holding it rendered "Date not published",
which is a lie about work that was done.

Rounds and milestones now take the same six states the profile does. The
milestones that were displaced can move back onto their routes.

### ~~An Application Route serves one jurisdiction or all of them~~ — fixed

`jurisdiction` was a single id. Canada's apply-direct route serves Quebec,
Alberta and Nova Scotia, so it had to carry none — which made it the
Destination-wide fallback, and the Destination-wide fallback is exactly what
the `route` floor check exists to catch. An Ontario institution nobody had
researched would have looked covered by it.

It now takes an id or a list, and Canada's route declares its three.

### ~~`appliesTo` has two incompatible readings~~ — resolved by deleting one

`publication-floor.mjs`'s `routeFor()` matched `route.appliesTo` against
institution ids while `validate.mjs` required Opportunity ids, so the most
precise way to bind a route to institutions could never be used without
failing the build. The floor's reading is gone, with a comment saying why:
offering a binding that cannot be used is worse than not offering it. Route
resolution is jurisdiction-based, and says so.

### `institutionGrouping` is a single axis

A country can be federal *and* sectoral at once. Ontario runs two central
services: the OUAC for its universities and ontariocolleges.ca for its
colleges. Only one axis can be declared. It does not bite yet because every
Canadian institution on file is a university, and it will the moment a college
is added.

### `feeContext.applicantGroup` is Europe-shaped

`eu-eea-ch` / `non-eu` / `nordic` / `domestic`. The American split is
resident/non-resident and public/private; the Australian one is
domestic/international. Records can express it with `any` and a summary, but
`data.mjs` only projects `eu-eea-ch` and `non-eu` into the comparison table, so
those fee rows do not reach it.

### `jurisdictions[].kind` has no value for a shared application service

The Common App is not a province, a state or a canton. `sector` and `authority`
were used and neither is quite right; `consortium` exists on
`application-system.authorityType` but not here.

### No `sourceClass` fits a rule-owner that is neither government nor institution

UHIP, created by Ontario's universities, owns its own rules. So does the
Fédération des cégeps. `official-rule-owner` was used with the reasoning in
`verifiedBy`.

---

## Things found that are not yet issues

- ~~**10 of 14 `ibPageUrl` values in `data/countries/ca.json` were 404s**~~ —
  swept repo-wide in `9785b82` and **the answer was the opposite field**. Of
  962 links: `ibPageUrl` 0 dead of 72, `website` 12 dead of 453, and
  `admissionsUrl` **64 dead of 437** — one in seven. Austria's eight fail with
  the same invented path shape at three different universities, which is what
  the fault looks like from the inside. Filed as #25. `npm run
  check:institutions` is the checker; it is deliberately not in `npm test`
  because it needs the network.
- **`data/countries/au.json` was quoting the wrong IB conversion table.** UAC
  publishes two on one page; the record had the IBAS schedule, which applies
  only to candidates who sat the IB *in Australia*. A Danish candidate is
  converted on the whole-diploma table. Corrected — but it is worth asking what
  else on the site quotes the domestic table of a two-table page.
- **`ibRecognition.conversionTable` is in the schema and no page renders it.**
  Australia's 22 rows are recorded and invisible. That is a gap in the site,
  not in the data.
- **Several sites refuse automated retrieval** and were read in a browser: the
  OUAC (403 to everything), `immi.homeaffairs.gov.au` (403, and it injects the
  visa charge by script so a scraped copy shows no price at all), `aut.ac.nz`,
  `mass.gov`, NYU, Michigan and Colby. An external link check will report
  several of these as dead when they are not. Recorded on the records; worth an
  allowlist in `check.mjs` eventually.
