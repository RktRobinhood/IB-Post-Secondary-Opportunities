# DTU — independent admissions and information-contract review

Review date: **4 November 2026**. Institution: `dk-dtu`. Opportunity:
`dk-dtu-general-engineering-2027-autumn`. Reservation:
`c5373ead-1163-4ee5-b801-f08c91da0950`. Reviewer: independent admissions
counsellor and information-parity critic; imagery belongs to a separate critic.
This is automated editorial review, not human verification of Evidence.

## Current verdict — final safe slice accepted; full parity deferred

**Final admissions/source: 8.5/10. Shared-attribution maintainer: 8.5/10.
Standardized safe-slice format: 8/10. Complete shared-information parity:
6/10, not complete.** Final actual source-anchor recheck passes on clean tree
`15b40a42e44d240c703284ccef43d60d233ebb7e`, based on
`da84dc729b655d7903d9e65c901fca9bfbdae48f`. Inspected the actual institution,
programme and credits HTML at `D:/ibp-tmp/absalon-release-20261030/dist` after
the dispatcher supplied this final build. The only runtime delta from the
visually accepted replacement-image tree is the IB evidence ordering.

The supported corrections and shared attribution repair are accepted for
release; the full university unit remains deferred to **15 January 2027** for
2027 confirmation and [issue #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71)
for common information consumers. The full gate and publication remain the
dispatcher's responsibility. The separate visual critic owns the 16 final
screenshots and 8/10 imagery/format acceptance; this source critic does not claim
that pixel review.

Round 1 was **not release-ready**: three gate failures and the official-image
browser failure superseded its historical source/code scores. Round 2 source
scored **7.5/10** because its date-source anchor pointed to a page without the
date. Both earlier snapshots remain documented below; neither is the final
accepted release tree.

## Historical round-1 verdict — safe corrections accepted; full parity deferred

**Final corrected admissions/source: 8.5/10. Shared attribution maintainer:
8.5/10. Standardized safe-slice format: 8/10. Complete shared-information
parity: 6/10, not accepted as complete.** The supported corrections and shared
photographer-credit repair are suitable for release. The university unit
remains deferred for 2027 confirmation and the common projection work in
[issue #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71).
This does not certify publication or the full release gate; the dispatcher owns
those separate checks.

Reviewed actual clean SSG output from proposed tree
`f67caa0a36b37678963c4edd98d207df34720964`, based on
`da84dc729b655d7903d9e65c901fca9bfbdae48f`. The dispatcher reported the successful
59-second clean build before this review. The exact HTML inspected was under
`D:/ibp-tmp/absalon-release-20261030/dist/`: `universities/dk-dtu/index.html`,
`programmes/dk-dtu-general-engineering-2027-autumn/index.html` and
`credits/index.html`. The directory's older name does not determine the
snapshot: the dispatcher supplied the current tree, and actual DTU corrections
and attribution are present in these files. No stale default `dist` was accepted.

## Initial state — not accepted

**Initial admissions/source score: 6/10; complete shared-information parity:
not accepted. Final scores pending stable worker records and dispatcher clean
SSG artefacts.** The original September records miss a consequential IB
authorization deadline, wrongly say DTU publishes no recipient code, and
describe 5 July final-result timing too broadly. A wrong deadline fails the
round. These findings were sent immediately to the worker and dispatcher.

Read `QA_CRITIC_LOOP.md`, `HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008,
`PAGE_TEMPLATES.md`, and `research/schools/PARITY.md`. Read the actual existing
institution, Programme, Opportunity and Danish legacy record, plus relevant
common eligibility and date-projection code. No Git, build, canonical-data or
other-institution edits were performed by this critic.

## Narrow independent official-source sample

All following HTML pages were read live on 4 November. The web transport
successfully returned the admissions hub and requirements; several other DTU
pages timed out there but returned HTTP 200 through direct `Invoke-WebRequest`.
Those failures are transport failures, not evidence that the pages disappeared.
The linked 2025 IB conversion PDF initially timed out through web and returned
HTTP 403 through bare Python. A normal browser User-Agent and Referer resolved
the transport failure: independent live PDF text extraction and an in-memory
render with bundled `pypdfium2` both succeeded. The actual one-page table was
visually inspected; no local PDF or image file was created.

- [DTU IB subject conversion table](https://www.dtu.dk/english/-/media/dtu-endk/education/bsc-programmes/general-engineering/ib-levels_2025.pdf),
  dated 19 February 2025: both AA and AI HL correspond to Mathematics A; both
  AA and AI SL correspond to B. Physics and Chemistry SL correspond to B,
  HL to A. English B SL corresponds to B; English B HL and the listed English
  A literature/language routes correspond to A. The table gives levels, not
  an additional DTU minimum subject grade.

- [Admission requirements](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/admission-requirements):
  full Diploma at 24+ points is distinguished from Course Results. The latter
  need additional A/B-level supplementation for this BSc, beyond the minimum
  18 points, grade 3 in six subjects and three HL subjects. Mathematics A,
  Physics B, Chemistry B and English B remain separate conditions. The English
  test exemption is conditional on the qualifying examination and passed
  English at Danish B/A level. The page now mentions both TOEFL 88 and revised
  scale 4.5, without a year for its 21 January transition wording; do not invent
  that year. Verification expiry and IELTS One Skill Retake exclusions matter.
- [Diploma after 5 July](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/how-to-apply/diploma-after-5-july):
  the IB-specific process requires coordinator authorization by 1 June for
  online retrieval. It explicitly publishes **173405 — Technical University of
  Denmark**. The older claim of no published recipient code is false. IB is
  excepted from the generic 5 July diploma rule; the 8 July noon submission
  allowance is specifically EB, not an IB deadline or a blanket waiver.
- [How to apply](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/how-to-apply):
  no-CPR applicants must upload one signed PDF signature page per application
  through UnistartDTU; DTU must receive it by 15 March noon or declines the
  application. Posting it is not accepted. Qualification translations are
  required outside the named languages. Optagelse application and DTU receipt
  are distinct actions.
- [Deadlines](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/deadlines-and-important-dates):
  annual March/April/July rules are not a newly announced 2027 calendar. The
  displayed reply date is 3 August. The 8 July attachment allowance requires
  DTU's specific request/permission. Old 2023/2025 standby text prevents copying
  the whole page forward indiscriminately. IB/EB exception language must survive
  both the canonical record and the actual date display.
- [Required documentation](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/how-to-apply/required-documentation):
  school results, translations, prior higher education, applicable tests and
  supplemental courses, representation authority and applicable ID/residence
  documents are distinguished. IB is exempt from the statement-of-hours form.
  Quota 2 personal statement is due at application; CV and relevant supporting
  evidence are additional requirements. The generic diploma wording needs the
  explicit IB exception from the dedicated page.
- [Fees](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/fees-funding-and-permits):
  the live page's metadata date is 3 November 2026. EUR 100 application fee,
  EUR 15,000 annual / EUR 7,500 semester tuition, residence-based exemptions,
  EUR 100 first-payment credit and 1 August autumn payment timing are distinct.
  Citizenship alone does not determine every non-EU applicant's liability.
  Current amounts need not imply a separately confirmed 2027 fee schedule.
- [Quotas](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/how-to-apply/quotas):
  quota 1 is GPA-ranked. Quota 2 uses motivation, relevant subject results,
  work, other education and other relevant activities. The future cutoff is
  unknown until admission concludes. Do not turn a historical 2026 cutoff into
  an entry floor or guarantee, or infer 2027 capacity from it.

## Initial runtime result

A real read-only `load()` followed by `datesFor(site, institution)` returned
one General Engineering Opportunity. It also returned the shared **1 March
2027** `ms-ibis` coordinator-registration milestone and **2 August 2027**
`ms-reply` acceptance milestone. The March milestone is a suggested personal
action, not an official deadline, but does not convey DTU's actual June rule;
the August reply is a wrong official-action date. `ms-documents` combines 5 July priority ordering with generic
documentation language. These are observed runtime issues, not speculation
from raw JSON; the worker was notified to use common scoped supersession.
The shared signature milestone's note also says to email/post and never upload,
which directly contradicts DTU's upload-only procedure; its local replacement
must supersede that instruction. The first probe used an incorrect loader property and failed before assessing
anything; the corrected probe used `site.institutionCatalogue.all`.

The live [General Engineering programme](https://www.dtu.dk/english/education/undergraduate/general-engineering)
supports one English programme, three years, Lyngby campus, four optional
specialisations, foundational science/programming, design-build group projects,
third-year choice and a final bachelor project. Exchange and company-project
options are described as choices, not guaranteed placements. MSc progression
depends on the chosen specialisation and each MSc's prerequisites.

## Acceptance work still required

Re-read the worker's stable records and Evidence; resolve institution-specific
IB subject/grade equivalence against the linked official table, or retain an
honest explicit gap rather than produce a false grant/rejection. Probe actual
`load()` / `assess()` / `datesFor()` using a real Evidence resolver. Check that
the shared generic 2 August reply and generic 5 July result milestone cannot
leak into DTU's IB route. Inspect the dispatcher's actual clean SSG institution
and Opportunity HTML before final scores.

The bounded English portfolio is one General Engineering BSc. Its four
specialisations must remain paths in that degree, not four invented application
choices. Common-model research should cover institution/campus, learning and
curriculum, support, progression, applicant-group costs and official routes.
The existing [issue #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71)
tracks common projection omissions. Stored structured curriculum, support,
detailed cost, outcomes, supplementary checklists or undated actions are not
fully presented merely because schema validation succeeds. Full information
parity must receive a separate honest score/outcome.

## Stable worker records — runtime recheck

Read all five stable entity/Evidence paths and the completed worker report.
The independent runtime uses `load()`'s real graph, `buildSubjectIndex()` with
the actual subjects, recognition schemes and institutions, and
`evidenceStatus(graph, refs)` rather than a fabricated verified resolver.

One 36-point full-Diploma profile with English B SL, Mathematics AA HL,
Physics/Chemistry SL and two other HL subjects receives `meets`. Substituting
Maths AI HL also receives `meets`. Changing Maths to SL produces
`possible-with-action` through DTU's sourced conditional supplementation.
Removing English produces `needs-review` on the mandatory English B gap, even
though Diploma exemption matches the separate test rule. Changing the award to
Course Results produces `needs-review`, with explicit individual qualification
confirmation and English-proof questions. No blanket Course Results acceptance
or rejection was observed.

`datesFor()` now returns 13 DTU-scoped steps: the upload-only March signature,
1 April supporting documents, June authorization with 173405, priority-only
5 July, 3 August reply and 1 September conditional documents all carry their
intended scope. The generic March suggestion, wrong August reply, postal
signature instruction and generic final-diploma wording are absent. Annual
dates retain provisional/year-unpublished flags. The undated qualification
action exists in the returned model; its presence there does not establish
visibility in the generated panel. Four nonmandatory selection-factor labels
reach the shared programme projection. No specialisation became a second
application choice.

One scope finding remains before acceptance: the stable Opportunity originally
omitted `language.intakeStatus`, which makes shared counts treat English as
confirmed for 2027. The report establishes current English teaching but
expressly lacks a dated 2027 portfolio confirmation. The existing common
`unconfirmed` state and explanatory note should carry that distinction unless
affirmative 2027 evidence exists. Sent to the dispatcher before clean review.
The EU/EEA/Swiss fee grouping also needs existing national
`ev-studyindenmark-fees` alongside the DTU tariff evidence; the current DTU page
alone says EU/EEA. This is a narrow provenance addition, not a new survey.

## Narrow shared-attribution maintainer review

Read the actual modified `src/lib/data.mjs`, `src/pages/meta.mjs`,
`scripts/test-images.mjs` and `scripts/test-programme-images.mjs`, plus the
existing shared image resolver. **Maintainer score: 8/10, pending the clean
built guard.** The correction retains the existing `author` field through the
official programme hero's common credit path. Missing named authors retain an
institution fallback. The credits table now separately exposes credit, usage
basis and publication source, with an honest absent-licence fallback. No DTU
string branch or new schema shape was introduced.

The existing accepted/rejected-image fixture now checks photographer, usage
basis and source while continuing to exclude rejected pictures. The added
data-driven guard checks all applicable official programme records against the
actual projected credit, programme HTML and credits HTML. This would catch the
reported loss of Mikkel Adsbøl's credit, including HTML escaping, without a
DTU-specific assertion. The final clean built guard remains dispatcher-owned;
this critic has not run it against stale default `dist`.

## Corrected intake-scope runtime

The dispatcher authorized a narrowly scoped correction after the findings
above. Re-read the actual final Opportunity: `language.intakeStatus` is now
`unconfirmed`, with current fully English teaching distinguished from unconfirmed
autumn 2027 delivery and a 15 January recheck. EU/EEA/Swiss cost provenance now
includes existing `ev-studyindenmark-fees`.

A fresh real-loader/profile run confirms **zero confirmed English programmes,
one pending** for DTU. The otherwise academically qualifying AA HL and AI HL
Diploma profiles now both receive `needs-review`, with no academic gaps and the
explicit `intake-language-unconfirmed` issue. The no-English profile retains
its mandatory English B gap. Course Results retains the individual
qualification-confirmation and language-proof unknowns as well as the intake
issue. The earlier `meets` observations above describe the earlier stable
snapshot, not the corrected final state.

**Provisional corrected safe-slice admissions/source score: 8.5/10.** Final
student-surface acceptance still awaits the dispatcher's actual clean SSG
notice. Full shared-information parity remains a separate unresolved outcome.

## Final actual clean-HTML and guard acceptance

The institution visibly counts **0 English programmes and 1 awaiting language
confirmation**. The sole programme card and programme opening both warn that
2027 teaching language is unconfirmed, distinguish current English delivery and
state the 15 January recheck. The actual page exposes full Diploma versus
individually confirmed supplementary Course Results as alternatives; it makes
no automatic Course Results grant or rejection.

Both pages show the scoped March application and signature-upload labels,
1 April supporting-document rule, June authorization with recipient 173405,
priority-only July 5, August 3 reply and September conditional-document rule.
The annual/provisional warning is visible. The wrong generic August 2 reply,
generic March coordinator suggestion, postal/never-upload signature instruction
and blanket July 5 IB final-diploma requirement are absent. No wrong deadline
was found in the final actual HTML. The 2026 cutoff remains explicitly
historical, rather than a new 2027 entry requirement. Four selection labels
are visible. Fresh source dates and the statement that sources have not been
checked by a person are visible.

The programme hero credits **Mikkel Adsbøl**. The actual institutional-photo
credits row names him and states the institution publication/linking basis and
copyright, with its official source link. A read-only
`DIST_DIR=D:/ibp-tmp/absalon-release-20261030/dist node scripts/test-programme-images.mjs`
from the clean checkout passed every programme-background guard, including
`published official programme photographs retain their named authors`.
This confirms the actual built author path beyond the code inspection above.
The shared repair is small, source-driven and guarded across records; its final
maintainer score is **8.5/10**.

Actual information-contract omissions prevent a complete parity pass. The
visible curriculum is the short summary, not stored `description/structure`;
institution support has source claims but no substantive local support block;
progression/outcomes and submission checklists lack their own decision blocks.
The undated qualification/missing-document action returned by `datesFor()` is
absent from these date panels. March 15 groups the signature label with the
application label but drops the signature's secondary note about receipt,
decline and postal rejection. The non-EU fee events do not appear in the
default page's dates; amounts/exemptions are reachable through the programme
evidence drawer rather than a proper applicant-group financial scenario.
The branch-specific Course Results source conflict is retained in records but
not fully explained by that drawer's five Opportunity-level sources. These
are real shared consumer gaps, not proof that the stored research is missing.

Keep the unit deferred, recheck the 2027 portfolio/timetable/tariff by
**15 January 2027**, and retain issue #71 for shared consumers. Raising the
complete-parity score most requires exposing the standard curriculum/support,
applicant-group finance and outcome fields, complete route checklists/undated
actions, and secondary same-day notes through common templates. No DTU-only
markup or unsupported research claim is warranted.

## Round 2 — narrow source corrections accepted; clean HTML pending

The dispatcher reports round-1 gate failures in eligibility action wording,
canonical IB-calendar provenance and a research-log guard, plus independent
visual rejection of the official programme hotlink. These prevent publication
of the earlier snapshot despite its historical source/code review above.

Independently re-read the three current data corrections. A fresh HTTP 200 read
of DTU's [conditional-admission page](https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/how-to-apply/conditional-admission)
supports the declared supplementary-study route, either quota, maximum two
level raises after July 5, and passed exam or English-test documentation through
Unistart by September 1. The generic qualification wording still needs the
separate IB-specific online-release exception already retained in this route.

`Institution.levelRaise.timing` now names supplementary-exam documentation only.
The conditional English-test September 1 timing lives in the language rule's
note, with `ev-dtu-conditional-20261104`. This preserves the source while avoiding
an English-test action being attached to a Maths gap. A fresh real
`load()`/`assess()` using the actual Evidence resolver confirms that the Maths
SL gap names only the supplementary exam, declaration and September deadline;
no irrelevant English action survives. Its overall outcome remains
`needs-review` because 2027 delivery is unconfirmed.

The results event now references `ev-ib-results-day-2027-05` as well as the
institution's online-release source. Read the canonical IB Evidence: it itself
explains that July 6, 2027 is inferred from prior years, not an affirmative
2027 announcement. The retained `provisional` state and new student-oriented
note preserve that limit; the event is not a separate DTU upload deadline.
Removing the word “inferred” from student-facing notes does not remove the
underlying evidence caveat. **All three narrow semantic edits pass independent
source review.** Final round-2 source/code scores await actual new clean HTML;
no round-1 image acceptance is carried over to the replacement automatically.

## Round-2 actual HTML — citation correction requested

**Round-2 admissions/source score: 7.5/10 pending the citation correction;
maintainer 8.5/10; complete parity 6/10.** The corrected rules are sound, but a
student following the date's source is still sent to a page that cannot support
the displayed date. This is a small, specific data-order correction.

The dispatcher supplied proposed tree
`5aed224144834dd50b3765e8c2ed432c8d134706`, based on `da84dc7`, after an
86.2-second clean build. Reopened the actual institution, programme and credits
HTML at the same clean `dist` path recorded above. The correct annual dates,
intake-language warning and local UC Davis attribution remain visible. The
programme hero now names UC Davis College of Engineering and CC BY 2.0; its alt
identifies UC Davis, and its credits row says General Engineering (DTU) while
crediting the actual external institution. Mikkel Adsbøl is absent from
published credits, consistent with withholding that candidate.

One citation correction was sent to the dispatcher before final acceptance:
the actual anchor labelled `Source for IB results released` still points to
DTU's late-diploma page. That page supports authorization/retrieval, not July 6.
The canonical provisional date Evidence is second in the array, while the
shared renderer selects the first. Reorder the two existing references so the
date's own source is first; retain DTU's source for the retrieval context.
This is not a date change or new broad research request. Final round-2
acceptance is pending that actual citation recheck.

## Final citation recheck — accepted

On final clean tree `15b40a42e44d240c703284ccef43d60d233ebb7e`, both the
institution and programme's actual anchor labelled `Source for IB results
released` now links to the canonical IB assessment/exams source. The event
still says **Provisional IB candidate results date**, explicitly denies being
a separate DTU upload deadline and retains its provisional warning. The weak
provenance and recheck need remain in canonical Evidence; reference ordering
does not manufacture a confirmed 2027 announcement.

Rechecked both actual pages: June authorization/173405, the 2027 language
warning, July 5 priority-only scope and August 3 reply remain present; the
wrong August 2 reply remains absent. The actual credits row still identifies
General Engineering (DTU), UC Davis College of Engineering and CC BY 2.0.
The shared attribution code is unchanged from the independently inspected
version and the passing round-2 all-programme author guard; four named official
AU programme credits keep that check non-vacuous after DTU's local replacement.

**Final safe-slice admissions/source 8.5/10, maintainer 8.5/10 and standardized
format 8/10: accepted. Full information parity stays 6/10 and deferred**, for
the observed shared omissions described above. No further source correction is
requested for this candidate. Do not promote this result to full intake
completion or human-verified Evidence.
