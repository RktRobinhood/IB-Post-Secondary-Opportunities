# Aarhus University — independent recovery acceptance, round 1

**Admissions 8.5/10 · imagery 8.5/10 · shared format 8/10 · maintainer 8.5/10 —
accepted for publication of the safe improvements, including final data cleanup
and refreshed wording pixels.** The clean gate's internal-ID excerpt leak,
asymmetric conflict reflection, and English-test label/rule findings have passed
independent recovery review below. The 2027 intake remains
deferred for the documented 2 December language recheck; this is not an intake
completion lock.

Reviewer: independent admissions counsellor / photo editor / shared-format critic /
maintainer. Reviewed 2026-10-30, `dk-au`, intake `2027-autumn`, same reserved run
`2e1a21e2-369f-4b29-b3f4-99deda7d4530`. This recovers the interrupted acceptance;
it does not start another university. The earlier `dk-au-round-1.md` is preserved.
No human verification is claimed.

## Material findings and their resolution

1. **Herning quota-1 floor: corrected.** Independently reopened the exact
   [Danish Herning programme page](https://bachelor.au.dk/economics-and-business-administration-auhe).
   It states a qualifying-examination average floor of 6.0 in quota 1 and an
   optional expectations meeting. The English page's omission is not an exemption.
   The current institution note now says all six currently English campus paths
   have the floor, scopes it to quota 1, and explicitly qualifies Cognitive
   Science's future language. The worker report and new Danish-source evidence
   now agree. The existing Herning requirement's value remains 6.0; recovery adds
   its responsible evidence without changing the rule.
2. **Quota-2 raw checklist contradiction: corrected.** Read the actual national
   route: `item-quota2` has no generic July `dueMilestone`; its note directs the
   applicant to the institution's quota-2 date. AU's supplemental item still
   references `ms-quota2`, 15 March 2027 at noon CET, marked provisional and
   year-unpublished. No unrelated national date was inferred from AU.
3. **Cognitive Science: conservatively represented.** The
   [responsible programme source](https://bachelor.au.dk/en/cognitivescience)
   currently lists English but anticipates Danish for 2027, with an expected
   update around 1 December 2026. Current data preserves English as the present
   language and marks the intake unconfirmed, with a sourced explanation and
   2 December recheck. It does not establish Danish A as an unconditional rule,
   English availability for 2027, cancellation, or applicant rejection.

## Consequential source sample

Narrow live reads on the review date supplement the saved evidence and prior
review, without another provider survey:

- [AU calendar](https://bachelor.au.dk/en/international-applicants/deadlines-important-dates):
  15 March noon for international/IB applications and quota-2 documentation;
  5 July noon for general documents; 3 August acceptance; 5 September conditional
  supplementary evidence. The annual page does not establish a 2027-dated
  calendar. Actual AU routes retain provisional/year-unpublished flags and the
  institution-scoped 3 August override.
- [AU fees](https://bachelor.au.dk/en/international-applicants/moreinfo/tuition-fees-and-application-fee):
  EUR 150 per paying applicant, no refund for applications after 1 November 2026,
  first-year tuition before semester start, and final qualification by 15 March
  for paying applicants. Data preserves residence exemptions and asks about
  individual paying status; its source's inconsistent address wording is stated
  as an unresolved question. It does not equate every non-EU passport with paying
  status. Historical 2026/27 tuition remains labelled historical.
- [AU English proof](https://bachelor.au.dk/en/international-applicants/moreinfo/language-requirements):
  an assessed IB English subject can meet English B; accepted tests are an
  alternative. IELTS 6.5 overall/6.0 each section and the source's new TOEFL scale
  match the current records. No undocumented test result or blanket
  English-medium-study waiver is inferred.
- [National Course Results FAQ, questions 4–5](https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/spoergsmaal-og-svar-om-diploma-programme-dp-course-results-og-ib-certificate-i-forhold-til-optagelse-paa-en-videregaaende-uddannelse-i-danmark/):
  qualification-level supplementation through HF subjects is distinct from GSK
  for specific entry subjects. The AU conflict remains explicit, with the
  responsible national qualification rule preserved.

Read the six actual AU Opportunities, institution, changed Cognitive Science
Programme, both new AU routes, hourly evidence (now 19 records), image manifest
and history, and the complete worker report. Degree projection still yields
180 ECTS/three years for all six paths. Retained selection floors are quota 1
conditions, while historical cutoffs retain their 2026 year.

## Shared representation and maintainer review

Read the actual optional schema field, shared projection, language helpers,
family grouping, cards, detail, institution and country counts, browser planner,
eligibility gate and Danish catalogue comparison, together with their focused
tests. The shared change has no AU-specific renderer branch.

- Omitted status retains existing listed-language behavior; explicit confirmed
  also works. Unconfirmed requires a nonblank note. Projection retains status,
  note and intake, and planner serialization carries the raw language object.
- Warnings reach shared cards independently of the requirements slot. Details
  qualify the language glance and use the existing warning region. A confirmed
  family lead cannot conceal a pending sibling's card warning.
- Actual loaded AU projection: **six paths, five cards, four confirmed English
  families and one family awaiting language confirmation**. The two business
  campuses count once. Institution, directory and Denmark English totals use
  the shared family count; pending-only families are separate. The catalogue
  comparison retains pending as a distinct state rather than matched/missing.
- The unconfirmed-language data issue takes precedence over both a positive
  fit and rejection. Fitting and mismatching applicants therefore receive
  needs-review; omission and confirmed states keep their existing behavior.

Independently reran the focused checks in this recovery: canonical **12**, catalogue
**12**, eligibility **339**, and Denmark catalogue **7**, all passing. These include
schema rejection of missing/blank notes, normal-state preservation, family
uniqueness, a pending sibling, warning propagation, aggregate separation,
planner serialization and uncertain outcomes for fitting/mismatching profiles.

Independently reviewed the subsequent narrow `scripts/test-card-names.mjs`
guard update. Its former invariant confused confirmed English counts with all
displayed cards. It now sums the explicitly labelled confirmed and pending
choices, preserves card uniqueness and family-page checks, and requires at least
the pending-family count of programme-card articles to contain the warning.
A mixed confirmed/pending family may correctly add another warning. Self-tests
cover 4 confirmed + 1 pending = 5 cards and warning detection. This is a shared
contract correction, with no AU exception. Release execution of that guard
remains the coordinator's responsibility.

## Additional clean-gate findings — repaired and independently checked

The coordinator's release gate surfaced three further issues after the first
screenshots. Read their actual final data and the worker's amended report:

- Herning's visible English-source excerpt no longer contains an internal
  evidence identifier. Its supported distinction remains clear; the identifier
  is confined to interpretation and structured references.
- AU's IB source and the national Course Results conflict now reference one
  another with `conflictsWith`, with a reasoned interpretation on both. Both
  remain needs-review. No conflict was erased or claimed resolved.
- All six accepted-test alternatives use existing supported `kind: test`, a
  concise label, and sourced scores/timing/verification conditions in the note.
  The earlier `language-programme` label was long and could not assess a numeric
  test result. Subject-or-test choice is retained.

The current profile/schema has no numerical test scores, component results,
sitting date or documentary verification. Read the actual shared OR-test
evaluation: it intentionally makes a test a conditional action. Independently
probed an otherwise-fitting Computer Science applicant without IB English,
recording both `English` and `IELTS Academic 9.0`: **Possible with action**, with
no matched English requirement, and with the published thresholds and explicit
AU document-confirmation limitation in the action. It is not a verified fit.
This native result is honest: the applicant must achieve and document the test,
and AU must confirm it. A fabricated mandatory question or a new score engine
is not required for this unit.

Read and independently reran `D:/ibp-tmp/dk-au/check-au-release-recovery.mjs`:
all six Opportunity and 19 Evidence schemas pass, concise mandatory labels and
the clean excerpt/reciprocal conflicts pass, five stable paths retain subject-fit
Meets, and test-only/generic-English profiles yield Possible with action without
matching English. Cognitive Science stays Needs review for all variants;
non-EU profiles retain their individual paying-status question. These probes
exercise rules without supplying an evidence-status callback; they do not
override additional production evidence gates or certify test documents.

Also read the actual narrow `test-unique-images.mjs` change: a family's expected
primary image uses `own.src || own.url`, correctly supporting hosted and linked
official records. It changes neither runtime imagery nor an allowlist, and keeps
the primary-path ownership comparison. README's scenario count now matches the
339 eligibility checks. These cleanup changes are accepted; the coordinator
must run the complete release gate against their final snapshot.

## Actual image inspection

Opened actual pixels in `D:/ibp-tmp/dk-au/images-before.png` and
`D:/ibp-tmp/dk-au/official-candidates.png`, and read the current manifest and image
history. The park/amphitheatre and ivy courtyards give AU a convincing sense of
place. The retained EEG experiment makes Cognitive Science recognizable; it is
not claimed as a campus-specific image. New AU photos replace a generic Helsinki
maths lecture, dominant world map and surgical scene with students working at
laptops/electronics/prototypes. The business image depicts Herning study activity
and its metadata names that campus; it must not become an Aarhus-campus caption.

Four new official URLs each have a single manifest owner, exact source page,
dimensions and institution-publisher attribution. They are linked, not copied;
no open licence or named photographer is invented. Retired Commons metadata and
prior reviews are preserved. Small laptop marks and background board writing do
not dominate these actual programme photographs. The undersized Aarhus business
candidate is correctly unused.

## Rendered desktop and phone acceptance

Opened all **16 actual JPG screenshots** from the initial clean Pages-base build,
at **1280px desktop / 390px phone**, in light and dark themes. After final data
cleanup, independently reopened **eight refreshed screenshots**, covering all
four pages, both dimensions and both themes: institution desktop-light/phone-dark;
Cognitive Science phone-light/desktop-dark; Computer Science phone-light/desktop-dark;
Herning desktop-light/phone-dark. The final files are preserved under
`docs/research/qa/hourly-universities/dk-au-shots/`, using these exact stems with
`--desktop-light.jpg`, `--desktop-dark.jpg`, `--phone-light.jpg` and
`--phone-dark.jpg` respectively:

- `universities__dk-au`
- `programmes__dk-au-cognitive-science-2027-autumn`
- `programmes__dk-au-computer-science-2027-autumn`
- `programmes__dk-au-economics-and-business-administration-herning-2027-autumn`

Representative artifacts:
[AU phone](dk-au-shots/universities__dk-au--phone-light.jpg),
[AU desktop](dk-au-shots/universities__dk-au--desktop-dark.jpg),
[Cognitive Science phone](dk-au-shots/programmes__dk-au-cognitive-science-2027-autumn--phone-light.jpg),
[Computer Science phone](dk-au-shots/programmes__dk-au-computer-science-2027-autumn--phone-light.jpg),
[Herning desktop](dk-au-shots/programmes__dk-au-economics-and-business-administration-herning-2027-autumn--desktop-light.jpg).

The AU glance visibly says four programmes plus one awaiting language
confirmation, and five family cards follow. Cognitive Science's warning is
outside its requirements summary and also appears on related-degree cards.
Its detail hero asks the student to confirm the language; the desktop glance
says unconfirmed, and the full alert remains clearly readable on the phone even
when secondary glance facts are collapsed. It precedes requirements rather than
depending on an expanded sources panel. No warning is clipped or overlapped.

The new Computer Science photograph retains recognizable students/equipment in
the wide hero and phone crop; Herning retains study activity in both and its
page names Herning. Institutional park imagery still leads discovery. The
photographic credits are visible. The business family appears once and its
two-campus path table becomes readable stacked rows on the phone. Long titles,
language-test alternatives and deadline notes wrap within their blocks in both
themes. No release-blocking crop, contrast or horizontal-overflow defect was
visible in this sample.

The format score stops at 8 because these detailed requirements pages remain
long on a phone and the full pending-language explanation occupies a substantial
block; its consequence justifies that prominence. The most valuable next change
is evidence-led: resolve the language after AU's expected update, then shorten
the warning to the confirmed outcome. Keep the Herning-specific photo provenance
and linked-source attribution intact in later image updates. Neither is a
prepublication repair request.

The final accepted-test wording is visible as the English-subject **or** accepted
test route, without the previous long italic alternative. Exact scores and
documentary limits remain in source evidence and the planner's conditional
action, not a claimed numeric assessment. A small duplicated “An accepted
English test” line is a nonblocking shared-renderer polish opportunity; it does
not obscure the OR or change the requirement. No internal evidence ID appears
in the default rendered wording inspected, and the actual Herning excerpt was
separately checked above.

The coordinator reports the final clean Pages-base snapshot
`9acddad29be743fdc889049a30827a8dc58b7862` passed **all 43** release checks, with
only the existing freshness advisory. This reviewer did not run that full gate;
the source/code/probe and pixel acceptance above is independent. No further
prepublication repair is requested. Publication/CI verification remains with
the coordinator.

## Limits and release responsibility

Editorial acceptance of safe improvements must not become a complete 2027 intake
lock. Recheck Cognitive Science on **2026-12-02**; keep **2027-01-15** for unpublished
2027/28 fees/calendar if still absent, and retain the paying-status and Course
Results questions. The coordinator owns clean release validation and publication.
The worker's stale-dist image-test failures are not represented as passing or as
proof against the new build. This reviewer ran no release gate or default build,
changed no data/code/state, and writes only this recovery report. Full release
gate, CI and published-commit evidence remain outside this review.
