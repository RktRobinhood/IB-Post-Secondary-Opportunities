# Programme state

The live state of the work: what is done, what is in flight, what is next, and
what has been learned that nothing has acted on yet.

This file exists so the work survives an interrupted session. See
[PARALLEL_WORK.md](PARALLEL_WORK.md) for why, and for the rest of the
conventions fan-out work here runs under.

**Updated:** 2026-09-23. 449 deadline entries across all 35 Destinations; 22 checks in one gate; #12, #13, #18, #21, #22, #23, #24, #26, #29, #30, #31, #32, #33 and #34 closed.

**Current programme: close every open issue.** Twelve were open when it started,
plus #34, filed from a mobile audit during it. The order and the reasoning are
under ["This programme"](#this-programme) below.

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
| #16 | The Application Jurisdiction model, worked through for Canada, the US, the UAE and Singapore | `78d3e6d` |
| #18 | Arrival, chapter and close; MapChapter alive; one motion token deleted rather than spent; ADR 0003 | `b628281`, `4d308d9` |
| #26 | The basemap at a visible opacity; a panel shape per viewport; 44px targets; pinch and double-tap | `b628281`, `82968ce` |
| #15 step 4 | The first Opportunities outside Denmark — 16 Dutch, and ADR 0002 confirmed | `4c79b8f`, `73897e2` |
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

### 3. #19 — the globe

A throwaway prototype is running to answer the issue's own question — *does
geographic motion help a student find a credible option faster than a static
map* — rather than to build a globe because the issue asked for one. The
answer lands as `docs/adr/0004`.

The baseline has moved a long way under this issue since it was written. The
flat map now has measured contrast, a keyboard camera, clustering,
spiderfying, a panel shape per viewport and touch gestures, so "what the map
becomes once it is correct" is a different question from the one #19 poses.

### 4. #24 — Course Results

Raised by the author. An IB student who does not complete the full Diploma
leaves with certificates for individual subjects, and that changes what is
open to them without closing everything.

The engine already models it — `evaluateRule` handles `ib-diploma` against
`profile.holdsDiploma`, and knows that a language exemption for Diploma
holders does not transfer to a Course candidate. **And none of it has ever
run**, because nothing sets `holdsDiploma`: there is no control for it, so
every diploma requirement evaluates to `unknown` for every student.

The hard half is data. 16 of 53 Opportunities record an `ib-diploma`
requirement and the other 37 say nothing either way, so the feature needs
three states rather than two — and "not established" must never render as
"Course Results are fine". That is the one way this can do real harm.

### 5. #25 — 64 dead admissions links

In progress. One in seven `admissionsUrl` values is a 404.

### 6. #17 — the hero review

29 Destination heroes queued, worst first, through `npm run images:review`.
The only item in the programme that a person has to do.

### 7. Open follow-ups filed during this programme

- **#21** — seven dated claims cited to pages that do not carry them, mostly
  site roots. A homepage stays live forever and never carries the claim, so
  `npm run verify` can neither pass nor fail it.
- **#22** — eight contradictions the deadline migration surfaced. Each needs a
  person at the official page. The worst is Korea's, where the intake and the
  deadlines describe different years.
- **#23** — dated milestones still buried in `notes`, including several that
  are specifically IB-candidate deadlines.
- **#25** — 64 dead `admissionsUrl` values of 437, the link a student follows
  at the moment they have decided to apply. `npm run check:institutions`.

---

## This programme

The goal is every open issue closed, and the site checked on a phone as well as
a laptop. Thirteen issues, grouped by what they actually are rather than by
their numbers, because three of them turned out to be the same act.

### Track A — the phone (#34)

**Filed during this programme, from measurement rather than impression.** The
audit is worth keeping because it contradicts the obvious diagnosis: at 375px
`document.scrollWidth` is 375 on every page tested. **Nothing overflows.** The
layout work was done. What fails is every control a thumb has to touch — selects
at 24px, checkboxes at 13px, chips and buttons at 30px, the header's icon
buttons at 36px — and eight type styles under 12px.

The worst instance is the site's primary call to action. `/planner/` renders raw
browser default selects, because the select styling is scoped to `.field select`
and the picker's selects live in `.picker__slot`, which is not a `.field`.

The 44px rule is not missing from the repository. It is at
`primitives.css:319-324`, written for #26, applied to `.world__btn` alone and
never generalised. So this is the deletion test again, in CSS: one control
policy that every control inherits, not 44px restated per component.

### Track B — the deadline passes (#21, #22, #23) — **done**

These read as three issues and were one act: **open the official page for
country X and fix its dates.** Grouping by symptom would have sent three
agents to the same page, so they were grouped by country, in two waves of
seven agents covering all 35 Destinations. **261 deadline entries became 449.**

What the grouping bought, beyond tidiness: an agent holding one country's
whole calendar can see that two of its pages disagree, and an agent holding
one symptom across thirty-five countries cannot.

The corrections that would have cost a student something:

- **Ireland said restricted-entry courses "cannot be added later".** They can,
  for €10, through a facility that opens 5 February. A student who believed
  that sentence and missed 1 February would have concluded medicine was gone.
- **Austria's MedAT test date was wrong** — 8 July recorded, 3 July published,
  confirmed by two official pages and a weekday check.
- **Bocconi's Early Session closes 29 September 2026**, six days after this
  programme ran, against a record saying Italian early rounds run "roughly
  October–January".
- **Japan's MEXT undergraduate scholarship is not offered to Danish
  nationals**, and **Korea's GKS Embassy Track invites 74 countries without
  Denmark.** Both were routes the site implied were open.
- **UBC's final-transcript deadline falls six days before IB results exist.**
- **Spain's 7 July admission deadline** and **Greece's eight-day ministry
  window** were absent from the records entirely.

Eight publisher self-contradictions are now Evidence pairs naming each other,
so the refusal to state a date is enforced by the model rather than by a
reader reaching the end of a note: Iceland, Luxembourg, Slovenia and Poznan,
with Ireland's HPAT, Athens's MD eligibility, NUS and Otago recorded on their
entries and still wanting pairs.

`test-sourcing.mjs` now refuses a dated claim cited to a bare site root —
#21's guard. It earns its place: two new instances appeared in Austria and
Switzerland *during the pass that fixed the original seven*.

### Track C — the architectural seams (#29, #30, #31, #32, #33)

All five are the same complaint in different places: **a policy that should live
in one module has been re-decided by its callers.** Duplicate Destination
identities (#29), a Denmark-shaped institution interface holding Dutch records
(#30), Evidence status classified six different ways (#31), a canonical loader
that fails open (#32), and a quality gate that is really a set union spread
across three files (#33).

These **cannot run in parallel.** Four of the five touch `src/lib/data.mjs` or
`src/lib/canonical.mjs`, and `PARALLEL_WORK.md`'s own rule is that code agents
run one per file. Order is dependency-first:

**#32 → #29 → #30 → #31 → #33.** The loader is fixed before anything trusts it;
identity is made unique before the catalogue is made destination-aware;
Evidence policy is centralised once the records it reads are stable; the gate is
built last so it can include everything the others added.

### The thing this programme did not look at, and should have — #37

Raised by the user from ordinary use, after a programme that closed thirteen
issues without anyone opening a Destination page and reading it as a student
would.

**The pages are ordered backwards.** `/destinations/de/` is 5,950 words and
52 phone screens, and "Where to study" — the universities — begins 79% of
the way down, after 41 screens of scrolling. The sources come *before* the
universities. It is the same on every Destination: "Where to study" is the
second-to-last section on Poland, Spain, Japan and Canada alike.

A student browsing is deciding whether this place is worth any effort at all,
and what decides that is seeing something concrete and appealing. The page
charges 2,200 words about an admissions system before naming one institution.
The reading is the cost you pay *once you are interested*.

Worth noticing about this programme's own blind spot: #34 measured the phone
carefully and found the layout correct, because it asked "does this reflow"
rather than "is this usable". A 52-screen page passes every check in the gate.
Nothing in `npm run qa` can see it, which is why #37 asks for a word and
screen budget with a guard behind it.

### Track D — what is left

- **#15** is the standing research programme, not a closeable issue. 449
  deadline entries and 307 Evidence records later, the Destinations are no
  longer sketches, but Opportunity coverage is still Denmark and the
  Netherlands.
- **#17** needs a person at the hero review queue — `npm run images:review`,
  99 to look at, worst first. It is the only item in this programme an agent
  cannot finish, and the machinery around it works: 7 pictures are withheld
  below the floor and render a designed empty state instead.
- **#35** landed (branch `fix-35-closed-routes`): `readerAccess` —
  `{ state: closed | conditional | open, reason, evidence }` — on an
  Application Route, its rounds and milestones, and a country-profile
  deadline. A closed route renders as one muted line, "Not open to you" first,
  with no `data-date`, no consequence badge, and sorted after every actionable
  date; `/timeline/` lists closed routes in their own group at the end. GKS
  Embassy Track and embassy MEXT undergraduate are expressed through it, and
  `scripts/test-calendar.mjs` fails if either, or any closed entry, renders as
  actionable. #36 was filed alongside it.

---

## Model friction

### ~~`sources` and `audience` were advertised and not honoured~~ — fixed

**Found by three passes working around them independently.** `sources` was in
`test-calendar.mjs`'s whitelist and `deadlineItem` could always render several,
but `fromCountryDeadline` read `source` alone — so a second URL was discarded
between the record and the page, and three agents put it inline in a note
instead. `audience` reached the event object and no template looked at it, so
"non-EU only" and "only if you substitute foreign exams" went into `label`; one
Portuguese entry has a 130-character label for this reason.

A field that is legal to write and does nothing produces no error. It produces
a workaround, repeated by everyone who meets it, each assuming they misread the
schema. Fixed in `8c069ae`.

### ~~A route the reader cannot take looks like a route with a date~~ — fixed in #35

**Hit by three of the four deadline passes independently, and the most
repeated shape across five countries.** Korea's GKS Embassy Track invites 74
countries and Denmark is not one of them; Japan's MEXT undergraduate
scholarship is not offered to Danish nationals at all. Both had to be smuggled
into `notes` across six fields apiece, and both still render as a date with a
deadline badge.

This is the failure mode with the worst consequence on the site. A wrong date
costs a student a round. A route they were never eligible for costs them the
months they spent preparing for it.

Fixed with `readerAccess` rather than `applicantGroup`. `applicantGroup` is a
fee-and-rule group (`eu-eea-ch`, `non-eu`, …) and cannot say "citizens of 74
named countries" or "only if already at university"; stretching it would have
made it mean two things. Friction left behind by the fix:

- **The 2027 GKS round is closed to a May 2027 IB candidate on both tracks**,
  because it needs a graduation certificate by 31 December 2026. That is a
  property of the *round year*, not of the route, and the University Track is
  still recorded as open (its label even says "the one a Danish citizen can
  use"). It is not marked closed here because that is a research judgment
  beyond #35; it is still only in prose.
- **`readerAccess` assumes one reader.** It is a statement about "an IB
  candidate in Denmark on an EU passport". If the site ever serves a second
  reader profile, this becomes a per-profile rule, and the natural shape is
  eligibility conditions evaluated against the Student Profile — the same move
  `applicantGroup` needs.
- **`ev-jp-embassy-denmark-unreadable` contradicts the Japan profile.** The
  Evidence record says the embassy's pages refused every request and nothing
  was read; the profile note says they opened in an ordinary browser and
  quotes them. The quotation now has its own record,
  `ev-jp-embassy-denmark-mext-types` (needs-review), but the unreadable record
  and the MEXT route's round notes ("whose pages we could not read") were left
  as they were.

### ~~IB results day is one fact stored 61 times~~ — fixed in #36

61 occurrences across 41 files, 22 of them route milestones with the identical
label. Unsourced everywhere, because `ibo.org` refuses both automated fetch and
a browser. It had already drifted once — `au.json` said 5–6 July where
everything else said 6 July.

**And the explanation written to reconcile that drift was invented.** Two
records said 5 July was when coordinators got school access. Nobody had read
that anywhere. When the IB's transcript page was finally opened by hand, 5 July
turned out to be the IB's own transcript-request cut-off — a real IB deadline
the site did not hold at all, not a wrong version of results day. Sixty-one
independent copies is how a plausible sentence survives: there was no single
record for it to be wrong *on*, and no other check in this repository can see a
sentence. Now in `data/ib-calendar.json`, enforced by
`scripts/test-ib-calendar.mjs`.

### No consequence for "after this it still works, and it costs you"

Found writing the IB transcript cut-off. Missing it does not close the door: you
request the transcript yourself instead of through your coordinator, at $19 per
institution and up to 14 working days. `CONSEQUENCE` has `hard` ("the door
closes"), `priority` ("later applications are considered after these") and
`personal` ("not published by anyone"), and all three misdescribe it. Recorded
as `hard` with the truth in the note, which is the workaround this list exists
to catch.

### A Destination-independent milestone has nowhere to live

Also found on the IB transcript cut-off, which applies to every Destination at
once. `allEvents` builds every event from a country profile or an Application
Route, `/timeline/` scopes itself by Destination server-side and again in
`calendar.js`, and `deadlineList` prints a Destination on every row. So the only
way such a date reaches a student today is by being copied onto each Destination
that needs it — which is the shape #36 was filed to end. It is recorded once in
`data/ib-calendar.json` and shown on the one Destination that already carried an
undated placeholder for it.

### No field for "this source cannot be machine-read, and here is why"

Three distinct modes turned up in a single pass and the data cannot tell them
apart, or tell any of them from lazy research: a bot wall (`ibo.org`,
`mur.gov.it`, CityU behind Imperva), a timeline published **as a PNG** (PolyU),
and text that exists only in an embedded JSON payload and not in the DOM
(Heriot-Watt Dubai). Each was read successfully by a person or by hand; each
will report `partial` from `npm run verify` forever, indistinguishable from a
record nobody checked.

### A deadline with a rolling tail has no shape

PolyU's main round closes 11 February 2027 and applications are then considered
"on a rolling basis till 14 May 2027". That is a deadline plus a grace period.
`date` and `endDate` mean a window, and a window is not what this is.

### `targetIntake` is one string per country, and the calendar falls back to it

`calendar.mjs` uses `intake: clean(entry.year) || country.targetIntake`, so a
free-text sentence can render as an intake label. Korea needs three intakes at
once — March 2027 gone, September 2027, March 2028 — and the record currently
works only because somebody rewrote a free-text field into a paragraph.
Australia and Japan want the same correction.

### A window can only carry one time of day

`timeOfDay` attaches to the entry, not to `date` or `endDate`, so an entry
running "20 July 15:00 → 28 September 18:00" can state one of them. Every
affected record works around it with a sentence — "The time is the closing
time" — in the two ESAT/TMUA registration windows, both Bocconi application
windows, and both Nova SBE windows. Wants either `endTimeOfDay` or splitting a
window into its open and close events.

### No `dateState` for "the publisher contradicts itself"

None of the six states means that, and none means "relative to your offer".
Iceland's 5 June used `not-published`, where "Date not published" is a lie
about work that was done: the date *is* published, twice, for two different
groups. The entry had to spend its first sentence correcting its own rendered
label.

`withdrawn` was added after the migration for exactly this kind of misfit —
see the comment at `publication-floor.mjs:99` — so there is precedent for a
seventh. Partly mitigated in `2cdbbfe` by moving the contradiction into two
Evidence records with `conflictsWith`, which downgrades the public result by
rule rather than by a sentence somebody has to read. The rendered label is
still wrong.

### A date cannot say which cycle it belongs to

`year` is a free string doing the work — "2026 UCAT cycle, used for 2027
entry", "2026 entry — 2027 calendar not yet published" — so nothing can filter
or count on it, and a past date sits in a 2027-entry calendar with only prose
to explain why it is there. This is load-bearing now: UCAT's real 2027-entry
dates are in its 2026 cycle, and Parcoursup's 2027 calendar does not exist.

### `not-yet-announced` cannot carry the shape of the rule

For IMAT and the two Parcoursup gates the useful thing to tell a student is
"it lands in early August / mid-March, and here is last year's actual date".
There is nowhere for that but a long note.

### `npm run verify` cannot reach a page that needs a browser

`parcoursup.gouv.fr/calendrier` and `thjonusta.hi.is` 403 to automated fetch
and serve normally in a browser. Both were read that way and recorded. The
consequence is that the verifier can never confirm those entries, so they sit
at `partial` forever — which is the same shape as #21's complaint about site
roots, arrived at from the other direction.


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

- **An institution page prints the same list twice.** `canonical.mjs` projects
  both `ibNotes` and `notes` from `inst.meta.notes`, so every institution page
  renders that list under "What this institution asks of IB students" and again
  under "Worth knowing". Visible on every one of the thirteen; found while
  fixing #30 and left alone because the fix is a decision about what the two
  headings are each *for*, not a rename.
- **Eleven of the thirty-two recorded cut-offs are not numbers.** SDU publishes
  "All qualified applicants accepted" and AAU "All admitted" — outcomes of the
  competition rather than scores in it — in the same `historicalCutoffs[].value`
  field as `11.4`. The Programme page used to read every one as a figure ("a
  Danish average of **All qualified applicants accepted**"); it now tests the
  value and writes a different sentence. The model would be better with a state
  for it, the way `dateState` works for dates.
- **`inst.quotaNotes` renders a heading named after a Danish mechanism.** "How
  it runs quota 2" is in the general institution template, gated on a field the
  canonical projection always sets to `null`, so it is dead today and would be
  wrong for a non-Danish Institution the day it is not.
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
