# Programme state

The live state of the work: what is done, what is in flight, what is next, and
what has been learned that nothing has acted on yet.

This file exists so the work survives an interrupted session. See
[PARALLEL_WORK.md](PARALLEL_WORK.md) for why, and for the rest of the
conventions fan-out work here runs under.

**Updated:** 2026-09-23.

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

Nothing is in flight that is not either committed or named below. Anything
here that is *not* in the git log was interrupted and needs restarting from
the brief.

---

## The queue, in order

### 1. Destinations still below the floor

`npm run floor -- --report` is the authority; it is computed and cannot go
stale. The order is worst-first, which is also roughly the order issue #15
asked for.

Each one is a research pass against [RESEARCH_BRIEF.md](RESEARCH_BRIEF.md).
Done so far: `au ca nz us` and, before this programme, `de gb ie nl no se`.

### 2. Opportunity coverage past Denmark (#15 step 4)

The largest piece of work in the repository, and it was blocked until
`f841942` — the requirement model could not express a non-Danish entry
requirement at all. It can now. The pilot should be one Destination that is
already at the floor, taken to the same depth as Denmark: Institution records,
Programme records, Opportunity records with requirements in IB terms.

The Netherlands is the natural first, being the most-asked-about non-Danish
destination and already at the floor with a route and evidence.

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

### An Application Route milestone cannot say why it has no date

**Hit independently by the Canada and United States passes; it cost Canada 16
milestones.** `country.application.deadlines[]` accepts the six date states;
`application-route.schema.json` does not, and `calendar.mjs` reads
`milestone.dateState` that the schema rejects. So a researched finding — "there
is no OUAC deadline for international applicants", "each college sets its own
Early Decision date" — has to be moved back onto the country profile to be
sayable at all, and a route left holding it renders as "Date not published",
which is a lie about work that was done.

Routes are the migration target. They need the same six states.

### An Application Route serves one jurisdiction or all of them, never several

`jurisdiction` is a single id. Canada's apply-direct route serves Quebec,
Alberta and Nova Scotia, so it carries no jurisdiction and becomes the
destination-wide fallback — which weakens the `route` floor check, because
`routeFor()` falls back to any unscoped route and a genuinely unresearched
institution then looks covered. An array, or resolution through the
Destination's `jurisdictions[].applicationRoute`, fixes both.

### `appliesTo` has two incompatible readings

`publication-floor.mjs`'s `routeFor()` matches `route.appliesTo` against
institution ids; `validate.mjs` requires every entry to be an Opportunity id.
The most precise way to bind a route to institutions therefore cannot be used
without failing the build, and route resolution is effectively
jurisdiction-only. One of the two has to give.

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

- **10 of 14 `ibPageUrl` values in `data/countries/ca.json` were 404s** —
  invented URLs that nothing checks, because `npm run check` only verifies
  outbound links under `--external`. All ten are now replaced with pages that
  were opened and read. **The other 34 country records have not been swept**,
  and there is no reason to think Canada was unusual. This is the highest-value
  unfiled item here.
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
