# Aarhus University — independent acceptance, round 1

Reviewer: independent admissions counsellor / photo editor / shared-format critic.
Review date: 2026-10-30. Institution: `dk-au`. Target intake: `2027-autumn`.

This report initially resolves the intake-language modelling question. It is not
final acceptance of the university unit. The worker is still completing its
AU-only records; the final changed-path report and desktop/phone artifacts have
not yet been supplied to this reviewer. No human verification is claimed.

## Intake-language decision

**The proposed data-only warning is insufficient with the current shared
renderers.** It can describe the source uncertainty in prose and prevent a
positive eligibility verdict, but it cannot prevent unsupported English-taught
claims elsewhere. If the conditional offering remains visible, the smallest
shared representation and rendering support for intake-language uncertainty is
justified. Do not convert the uncertainty into a confirmed Danish offering,
confirmed absence of an English offering, or applicant rejection.

### Responsible source checked

Opened only the responsible [AU Cognitive Science programme page](https://bachelor.au.dk/en/cognitivescience)
on 2026-10-30. Its current programme header names English. In two prominent
notices AU anticipates Danish teaching for the **2027 intake**, says that the
change would add Danish A alongside English B, and expects the change around
**1 December 2026**. The page was revised 7 October 2026. This is a conditional,
intake-specific notice, not proof that the switch has already happened. Its
general description of English teaching does not establish English teaching for
the 2027 intake without that qualification.

### Actual data and rendering inspected

- `data/opportunities/dk-au-cognitive-science-2027-autumn.json` currently records
  `language.instruction: "English"`, `fullyInLanguage: true`, and 2027 applicability.
  Those structured claims do not distinguish today's teaching language from the
  unresolved 2027 language. The inspected record predates the worker's final
  submission and is evidence of the model question, not a frozen final diff.
- `schemas/opportunity.schema.json` defines `language.instruction` as the language
  actually taught, and `fullyInLanguage: false` as partial teaching in that
  language. False therefore cannot honestly mean unconfirmed. A free-text
  `language.note` exists, but no confirmation/publication state exists.
  `schemas/common.schema.json` record metadata has dates and notes, not such a
  state.
- `src/lib/canonical.mjs`, `project()`, groups every canonical Opportunity into
  its Institution without an intake-language/publication filter. Its programme
  projection carries `language.instruction` (defaulting to English), but drops
  `language.note`. It carries `Programme.summary` separately.
- `src/lib/paths.mjs`, `programmeCard()`, does **not** render `p.summary`.
  Prefixing that summary cannot supply the proposed warning on these cards.
  Cards are generated through this shared function on the institution page;
  merely seeing the warning on the programme detail page would not establish
  card coverage.
- `src/pages/programme.mjs` renders its glance as `Taught in` followed by
  `p.language || 'English'`. An English instruction value plus an unprojected
  note therefore still produces an unqualified English claim.
- `src/pages/institutions.mjs` labels the institution glance `In English`,
  counting all programme cards. Its institution directory labels both country
  totals and institution totals as English-taught programmes, using all projected
  programmes. `src/pages/denmark.mjs` similarly labels its total as programmes
  taught in English. Institution notes or a detailed summary cannot qualify
  these independent aggregate claims.
- `src/lib/eligibility.mjs` returns an uncertain result for an unrecognised/other
  rule. A mandatory `kind: other` warning can therefore prevent a positive
  requirement-fit verdict. That is useful, but says nothing to the language
  count or discovery renderer. `openQuestion` has specific handling in language
  rules; the default other-rule branch uses the label, so the meaningful warning
  must be in a rendered label unless shared handling is added.

### Why the existing fields do not solve this on their own

Putting an explanatory sentence into `instruction` would be schema-valid because
it is a string, but it would use the actual-language field as a status field;
the aggregate English counts would remain unchanged. Omitting instruction is
invalid and/or invokes the English fallback. `fullyInLanguage: false` asserts
partial instruction rather than uncertainty. Evidence marked `needs-review`
describes verification, not whether a future offering's language is confirmed.
It must remain needs-review, but cannot carry this separate fact. An institution
warning alone does not reach every standalone card or count.

### Minimal shared requirement, if publishing the conditional opportunity

An example of the genuinely missing fact is: **“The language of this 2027
Opportunity is unconfirmed; AU currently teaches it in English and anticipates
Danish from 2027.”** A narrowly scoped shared field such as
`language.confirmation: "unconfirmed"` (with a documented confirmed default for
existing records), paired with the existing sourced note, would express that
fact without a university-specific branch. The exact field name is an
implementation decision, not a required redesign.

Shared consumers must then keep confirmed English provision distinct from
unconfirmed provision: counts must not silently include the latter as confirmed
English; detail language text and any visible conditional card must say the
2027 language needs confirmation. Any positive eligibility wording must remain
blocked/uncertain until the intake language and applicable requirements are
settled. Preserve the existing evidence and meaningful recheck date, recommended
2026-12-02, after AU's expected update. Do not invent Danish A as a currently
unconditional requirement.

If the coordinator elects to defer public presentation instead, retain the
conditional record as research through a real shared publication boundary; do
not delete the evidence or mark it as confirmed-none. The current loader has no
explicit canonical publication state, so prose alone does not achieve that
alternative either. Other evidenced AU English offerings can remain published.

## Final acceptance pending

No admissions/photo/format score is awarded yet. Final scores require the
worker's finished records, exact owned changed paths, source/deadline checks,
actual images with provenance, and desktop/phone screenshots. In particular,
the current modelling finding is unresolved and cannot receive an admissions
acceptance of 8/10 merely because a warning was proposed. One wrong deadline
fails the round under `docs/QA_CRITIC_LOOP.md`.

This reviewer changed only this review file. No data, schema, template, Git,
hourly state, full gate, or default `dist` mutation was performed.

## Review of implemented records and shared support

The implementation now uses optional `language.intakeStatus` with confirmed and
unconfirmed states. Unconfirmed requires a nonblank note; omission keeps the
existing behavior. The shared projection preserves status, note and intake.
Cards render their warning outside the bounded requirements slot, details use
the existing warning slot and replace an unqualified language glance, and the
browser planner exports the raw language record. The eligibility data-issue
gate takes priority over both positive outcomes and applicant rejection.
Family counts keep confirmed English choices separate from pending-only
families; a confirmed sibling does not hide a pending path's card warning.
The Danish catalogue comparison retains pending language as a distinct state.
No institution-specific layout condition was introduced.

Independently ran `scripts/test-canonical.mjs` (12 checks),
`scripts/test-catalogue.mjs` (12 checks), `scripts/test-eligibility.mjs`
(339 scenarios), and `scripts/test-denmark-catalogue.mjs` (7 checks). All pass.
Maintainer assessment of the code is **8.5/10**, contingent on the rendered
warnings fitting at desktop and phone width. The tests cover omitted and
confirmed states, a pending family sibling, aggregate separation, schema
rejection of a missing/blank note, planner serialization, and both fitting and
mismatching profiles remaining uncertain.

### Consequential admissions source sample

Read the implemented six AU Opportunities, both AU document/payment routes,
institution notes, new evidence and image metadata. Narrow live source checks:

- [AU fees](https://bachelor.au.dk/en/international-applicants/moreinfo/tuition-fees-and-application-fee):
  supports the EUR 150 fee, non-refund change after 1 November 2026, first-year
  payment timing, residence exemptions and the more restrictive completed-exam
  rule for paying applicants. The record does not assume every non-EU citizen
  pays. It identifies the page's differing address/classification wording as an
  unresolved individual question.
- [AU dates](https://bachelor.au.dk/en/international-applicants/deadlines-important-dates):
  supports 15 March noon application/quota-2 documents, 5 July noon general
  documents, 3 August reply and 5 September conditional supplementation. The
  imported 2027 dates are explicitly provisional because the source lists day
  and month without the intake year.
- [AU IB guidance](https://bachelor.au.dk/en/international-applicants/moreinfo/international-baccalaureate-ib):
  supports code 000150 and the online-results exception for same-year IB
  candidates, original Course Results for retakes, and the paying-applicant
  restriction. No unsupported predicted-grade deadline was added.
- [AU language guidance](https://bachelor.au.dk/en/international-applicants/moreinfo/language-requirements):
  supports an accepted IB English subject or a test, IELTS Academic 6.5 overall
  with 6.0 each section, and the newer TOEFL scale used in the notes.
- [Computer Science](https://bachelor.au.dk/en/computerscience): English/Aarhus,
  Mathematics A, the two quota-1 6.0 floors and quota-2 exemption match the data;
  2026 cutoff 11.4 and standby 10.5 are historical context.
- [Herning in English](https://bachelor.au.dk/en/economics-and-business-administration-auhe)
  and [Herning in Danish](https://bachelor.au.dk/economics-and-business-administration-auhe):
  both describe the English offering in Herning. The Danish page explicitly
  requires 6.0 in quota 1; the English page omits this floor. The retained floor
  is supported, and the optional expectations meeting must remain optional.
- [National Course Results FAQ](https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/spoergsmaal-og-svar-om-diploma-programme-dp-course-results-og-ib-certificate-i-forhold-til-optagelse-paa-en-videregaaende-uddannelse-i-danmark/):
  questions 4–5 distinguish HF subject raises to qualification level from GSK
  for specific subjects. The records preserve this responsible national rule
  and flag AU's conflicting GSK text instead of treating GSK as a proven
  qualification route.

### Findings sent for correction before acceptance

1. The institution still said only five of six offerings have a quota-1 floor
   and Herning states none, despite its own correctly retained Danish-sourced
   Herning floor. Worker asked to refresh that source and reconcile the prose;
   absence on the English page is not confirmed absence of a requirement.
2. The inherited national route's generic quota-2 checklist item still pointed
   at the July document milestone while the AU route correctly says 15 March.
   This item is not currently rendered by `src`, but contradictory raw export
   is avoidable. Accepted coordinator's minimal shared correction: remove that
   generic `dueMilestone`, explain that institution rules control, and preserve
   substantive documentation guidance; AU retains its actual March deadline.

### Actual image inspection so far

Opened `D:/ibp-tmp/dk-au/images-before.png` and
`D:/ibp-tmp/dk-au/official-candidates.png`, and inspected the manifest provenance.
The retained AU park/courtyard photographs have a strong sense of place. The
EEG image clearly conveys experimental cognitive science and remains credited
as a generic discipline image. The replacements for the Helsinki mathematics
lecture, world map and surgical usability scene show AU students working with
laptops/electronics/prototypes. They are a clear subject/place improvement.
The shared business-family image depicts Herning study activity, with that
campus stated in its metadata; it must not be captioned as an Aarhus-campus
view. Official images are linked with source pages and usage basis; previous
licence and attribution metadata is retained in the image-history file.

No final visual/photo score yet: desktop/phone rendered crops remain pending.
