# Business Academy Aarhus — independent recovery review, round 1

Review date: **3 November 2026**. Reviewer: separate admissions counsellor,
photo editor and shared-information-format critic. Institution: `dk-baaa`.
Intake: `2027-autumn`. Reservation: `98e8934b-42bb-4e0f-8132-b9665a30706e`.

This review follows the unfinished [30 October review](dk-baaa-round-1.md)
without changing it. It assesses the finished worker records, not the worker's
earlier intermediate state. It is an automated independent editorial review;
it does not mark Evidence as human-verified.

## Decision and scores

**Final recheck, round 2: admissions 8/10; imagery 8/10; shared format 8/10;
maintainer 8/10. Safe corrections and the shared date-grouping repair are
editorially accepted for coordinator release.** This does not certify a
completed 2027 intake or completed information parity. Release-gate and
publication verification remain the coordinator's separate responsibility.

**Historical round 1: admissions 7/10; imagery 8/10; shared format 7/10. Not accepted.**
The raw corrections merit 8, but actual screenshots expose a wrong displayed
vacant-place deadline. One wrong deadline fails the round. The photo subject,
crop and attribution pass; the shared date presentation needs correction.
This rejected state and its screenshots are preserved below; the round-2
section records the repair and actual pixel recheck.

The intake remains **deferred**, with a **1 February 2027** research recheck.
Safe corrections are reviewable independently of completing the unresolved IB
results process and refreshed fee-payment instructions. The shared information
contract also has the projection gap documented below; a shared shell is not
proof that all relevant information reaches the student.

## Actual records and runtime inspected

Read all seven worker-owned paths: the institution, programme, opportunity,
both new application routes, the 12-record Evidence file, and
`docs/research/imports/hourly/2026-10-30-dk-baaa.md`. Read the hourly workflow,
critic loop, [ADR 0008](../../../adr/0008-shared-templates-define-information-quality.md),
`docs/PAGE_TEMPLATES.md` and `docs/research/schools/PARITY.md`.

A fresh, read-only `load()` plus institution/programme rendering and `datesFor()`
projection on 3 November confirmed one published first-year programme, 120 ECTS
and two years; the programme's own UX image; the cutoff explicitly scoped to
2026; exactly one 1 August reply at 23:59; conditional 1 August vacancies at
12:00; no 2 August reply; unknown final-diploma and tuition-payment dates; and
conditional access inherited from the special route. Fresh generated HTML
contains both correct photo credits and source links. No `dist` build was run.

## Admissions source findings

Narrow fresh reads on **3 November 2026** reopened the official programme and
admissions pages plus both Commons source pages. A separate direct
`Invoke-WebRequest` read of the official important-dates page returned HTTP 200.
Existing 30 October captures under `D:/ibp-tmp/dk-baaa/` were read for attachments,
tuition, non-EU rules and supporting programme detail. Their retrieval dates
remain 30 October; this review does not rewrite them as new captures.

- [Multimedia Design](https://www.baaa.dk/programmes/multimedia-design/):
  the English first-year offering is a two-year AP, with 120 ECTS and 10 extra
  programming ECTS described separately. The current page publishes 30 August
  2027, Sønderhøj 30 and admission area 81565. The cohort warning excludes AP
  entrants from August 2026 onward from existing 1.5-year bachelor top-ups.
  The finished summary and institution prose preserve this warning. The
  [Digital Concept Development capture](https://www.baaa.dk/programmes/digital-concept-development/)
  describes final intake August 2027 for eligible prior-AP applicants. No
  replacement bachelor route is invented for the 2027 AP cohort.
- [Important dates](https://www.baaa.dk/programmes/guidelines-on-how-to-apply/apply-for-an-ap-degree-programme/important-dates/):
  the actual 3 November response explicitly heads its table August 2027.
  Acceptance is 1 August at 23:59; vacant-place applications with a non-Danish
  qualification close 1 August at noon, conditionally on places existing.
  The two actions retain separate labels, times and access conditions in JSON
  and runtime. March 15 remains labelled annual/provisional where the intake
  year is unpublished. No blanket national reply or final-document date leaks
  into this institution's dates.
- [Admissions](https://www.baaa.dk/programmes/guidelines-on-how-to-apply/apply-for-an-ap-degree-programme/admission-requirements/)
  separates passing the examination by 5 July from uploading the diploma later
  following admissions instructions. English C remains an independent subject
  condition. English B, or English C plus an accepted test, supplies language
  proof; test validity is two years. Test minima are retained without pretending
  that the planner verifies scores or test dates. No unsupported TOEFL scale
  transition date is assigned.
- [AP attachments](https://www.baaa.dk/programmes/guidelines-on-how-to-apply/attachment-requirements/ap-degree-programme/):
  later graduates use the latest transcript, then the diploma on receipt under
  instructions. The school verification form and ID are recorded. Quota 2's
  strongly weighted three-minute video, up to four projects, is selection
  evidence rather than a universal educational qualification. JSON and the
  visible selection explanation preserve that distinction.
- [Special conditions](https://www.baaa.dk/programmes/guidelines-on-how-to-apply/non-eu-applicants/):
  nationality or qualification country can engage the route; residence and
  completing school in Denmark affect exceptions. The route and runtime are
  explicitly conditional. The EUR 150 application fee has exemptions and its
  payment link still names 2026. The data does not equate every non-EU passport
  with tuition liability or reject every same-year IB applicant.
- [Tuition](https://www.baaa.dk/student-experience/practical-matters/tuition-fees/):
  EUR 6,000 per semester / EUR 24,000 total is a schedule valid from 2026,
  with Danish/EU/EEA and named residence exemptions. The non-EU cost entry keeps
  actual fee status unknown and makes the amount conditional on liability.
  The roughly EUR 550 compulsory trip is additional. Accreditation remains
  bounded to 30 September 2027 under the cited council decision, with no
  presumed renewal.

No wrong deadline was found in the raw records or `datesFor()` event list, but
the **round-1 rendered panel merged the noon vacancy deadline into the 23:59
acceptance row**, as documented below and corrected in round 2. An exact BAAA 2027 IB final-result process,
results-service code and document
deadline are not established. These are material open questions and prevent a
claim of completed intake coverage, not publication of the safe corrections.

## Shared information contract

The institution uses existing canonical JSON, evidence, routes and shared
projection; it introduces no private schema keys or institution-specific page.
Identity/recognition, bounded offering scope, credential, entry/selection,
language, applicant-group costs, documents/dates, progression and provenance
have sourced records with scope and freshness. The institution summary explains
small classes, projects and company work. The visible programme summary explains
UX/front-end study, company projects, a ten-week internship and the cohort
progression warning.

**Shared projection gap:** `src/lib/canonical.mjs`'s `project()` maps Programme
summary and credential facts, but does not carry `Programme.description` or
`Programme.structure` into the programme view model. For BAAA this drops the
stored teaching style, assessment, internship-support and study-abroad detail.
`src/pages/programme.mjs`'s `what` block renders summary plus degree, length and
field, with no consumer for those richer fields. The separate cost and outcome
facts are auditable in the evidence drawer, but are not dedicated decision
blocks on this programme page. This is a common consumer/representation gap,
not evidence that BAAA research is absent. A visible short summary is also not
equivalent to full curriculum/learning-pattern coverage. Institution support
information is reached through official guidance rather than a rich local
support block.

Tracked shared follow-up: [issue #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71).
Reuse
the common typed fields and consumers when resolving it; do not add a BAAA-only
layout. This review accepts neither full information-contract completion nor
removal of the unit from the unresolved-work queue.

## Actual imagery and screen review

Reopened both stored master images with `view_image` on 3 November:

- `src/assets/img/places/baaa.webp`: identifiable red-brick academy facade and
  entrance, with the institution name in the architecture. Pale sky and empty
  foreground limit its appeal, but the subject is the actual academy rather
  than a logo, event or car park. Its source is a historical 2009 photograph.
  [Commons](https://commons.wikimedia.org/wiki/File:Aarhus_Business_College_(Erhvervsakademiet,_Viby,_2009).jpg)
  confirms CarinaT, own work and CC BY-SA 3.0, matching the manifest and runtime
  credit.
- `src/assets/img/programmes/programme-dk-baaa-multimedia-design-ap.webp`:
  hands sketching an interface wireframe beside a phone; focused, legible
  discipline imagery. It is not represented as BAAA students or campus.
  [Commons](https://commons.wikimedia.org/wiki/File:UX_Designer_Optimising_Website_Designs.jpg)
  confirms Zuko.io Images and CC BY 2.0, matching the manifest and runtime
  credit. Existing responsive variants are present.

Opened all eight clean-built screenshots, with 1280px desktop and 390px phone
captures in both light and dark themes:

- [Institution desktop light](dk-baaa-shots/universities__dk-baaa--desktop-light.jpg),
  [dark](dk-baaa-shots/universities__dk-baaa--desktop-dark.jpg),
  [phone light](dk-baaa-shots/universities__dk-baaa--phone-light.jpg),
  [dark](dk-baaa-shots/universities__dk-baaa--phone-dark.jpg).
- [Programme desktop light](dk-baaa-shots/programmes__dk-baaa-multimedia-design-ap-2027-autumn--desktop-light.jpg),
  [dark](dk-baaa-shots/programmes__dk-baaa-multimedia-design-ap-2027-autumn--desktop-dark.jpg),
  [phone light](dk-baaa-shots/programmes__dk-baaa-multimedia-design-ap-2027-autumn--phone-light.jpg),
  [dark](dk-baaa-shots/programmes__dk-baaa-multimedia-design-ap-2027-autumn--phone-dark.jpg).

The institution hero keeps the recognizable named facade in both crops; its
dark overlay supports the white title. The phone crop remains identifiable.
The UX image reads both as the programme card and as a hero: hands, marker,
phone and wireframe remain visible, especially on phone. Both credits are
actually displayed, including on phone: CarinaT / CC BY-SA 3.0 and Zuko.io
Images / CC BY 2.0. The site also provides its photo-credits link. Dark and light
layouts preserve text contrast, coherent cards and working narrow columns,
without visible overflow. The institution photograph is usable rather than
exceptional; a stronger permitted current campus photograph is an optional
future improvement, not this round's blocker.

**Blocking rendered deadline:** every screenshot's deadline panel shows
`1 August 2027, 23:59 Copenhagen time` over both the study-place acceptance and
the vacant-place application labels. The latter must be **12:00**. A student
reading the summary could apply nearly twelve hours late. Its conditional
context also cannot be inherited from the unconditional offer-acceptance row.

`src/lib/school-dates.mjs`, `sameDay()` (lines 631–635 at review), groups on
date/endDate, consequence and provisional state without checking time or
conditional access. `dateItem()` prints the first event's `formatWhen(e)` once
then renders `e.also` as labels. Consequently correct distinct raw milestones
become one wrong actionable display. Fix the shared grouping to preserve
different times/time zones and relevant access scope, or show each event's own
time and condition within a group. Do not put a BAAA exception in the renderer.
Verify the resulting panel, not just the presence of `12:00` somewhere in HTML:
March deadlines already contain that string.

The round-1 changes that raise the score most are: correct the common date grouping;
inspect new desktop/phone pixels showing noon separately from 23:59; and retain
the tracked research/projection gaps rather than claim complete intake parity.

## Round 2 — repaired display, independent final recheck

**Admissions 8/10; imagery 8/10; shared format 8/10; maintainer 8/10.**

Read the corrected `sameDay()` implementation in `src/lib/school-dates.mjs`:
events share a heading only when their time, time zone, audience, Diploma-holder
scope, access state/reason, dates, consequence and provisional state agree.
This is a small common semantic correction with no institution identifier or
special BAAA branch. Read the three new rendered-panel regression checks in
`scripts/test-calendar.mjs`: noon versus 23:59 retains two correctly timed rows;
identical timing/scope still compacts; unknown timing, different zones and
different applicant access remain separate. The coordinator reported these
checks passing; this reviewer inspected their assertions rather than claiming
to have run the release gate.

Reopened **all eight** round-2 screenshots, with the full dates disclosure
explicitly expanded. The coordinator identifies their clean-build tree as
`617ee64070d37c06206efad35d0195d0153ad4a7`:

- [Institution desktop light](dk-baaa-shots-round-2/universities__dk-baaa--desktop-light.jpg),
  [dark](dk-baaa-shots-round-2/universities__dk-baaa--desktop-dark.jpg),
  [phone light](dk-baaa-shots-round-2/universities__dk-baaa--phone-light.jpg),
  [dark](dk-baaa-shots-round-2/universities__dk-baaa--phone-dark.jpg).
- [Programme desktop light](dk-baaa-shots-round-2/programmes__dk-baaa-multimedia-design-ap-2027-autumn--desktop-light.jpg),
  [dark](dk-baaa-shots-round-2/programmes__dk-baaa-multimedia-design-ap-2027-autumn--desktop-dark.jpg),
  [phone light](dk-baaa-shots-round-2/programmes__dk-baaa-multimedia-design-ap-2027-autumn--phone-light.jpg),
  [dark](dk-baaa-shots-round-2/programmes__dk-baaa-multimedia-design-ap-2027-autumn--phone-dark.jpg).

Every corrected panel now shows **1 August 2027, 23:59 Copenhagen time** only
for accepting the offered place, and **1 August 2027, 12:00 Copenhagen time**
on its own vacant-place row. The vacancy is found under the expanded full-date
list, without borrowing the reply heading. Its conditional access remains in
the source route/event and its available-place label. The March provisional
marker, main offers and August 30 start remain intact. The round-1 blocker is
closed by actual displayed text, not merely by raw-data assertions.

The corrected long panel fits both desktop and phone. Hero/card subjects,
overlays, credits, degree distinctions, cohort warning and narrow-screen
hierarchy retain the imagery findings above in both themes. The visible
historical cutoff remains labelled 2026 rather than a 2027 entry floor. No new
visual blocker appears. Full phone screenshots were inspected as pixels;
interaction, zoom and keyboard testing are not asserted by this visual review.

Also reread the final 12 Evidence records after the coordinator's narrow
wording changes. These preserve the source claims, 30 October retrieval dates
and `needs-review` state; they do not assert human verification. The common
canonical data and applicable routes still carry the relevant distinctions.
The scores therefore cover admissions/data quality and shared consumers as
well as photographs and the shell.

The accepted result is the safe improvement slice. Retain the **1 February
2027** IB-results/payment-instructions recheck and shared projection
[issue #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71).
Keep accreditation bounded to its published validity. Completing those sourced
answers and exposing the richer shared programme fields would raise the score
most; a more compelling permitted campus photograph would be optional.

## Ownership and limits

Only this recovery review is written by this reviewer. No data, image manifest,
schema, template, Git, hourly state, full release gate or default `dist` build
was changed or run. Coordinator validation and publication remain separate.
