# CBS admissions critique — round 1

Run: `5be178ef-8ed5-4662-838b-7e41c3226857`

Reviewer: independent admissions counsellor/source and eligibility critic

Research date: 2026-11-04

Final verdict: **8/10 admissions and safe-data correction quality — accepted for the deferred slice. Complete autumn-2027 coverage is not accepted. Shared information parity: 7/10; narrow common copy maintainability: 9/10. Recheck 2027-01-15.**

The earlier pending statements below are historical and are superseded by the final assessment at the end.

This review owns only this report. No runtime, state, Git, default build or release-gate changes were made. The separate photo/art-direction review owns imagery and screenshot acceptance. The acceptance standard is QA_CRITIC_LOOP, HOURLY_UNIVERSITY_WORKFLOW, ADR 0008, PAGE_TEMPLATES and school PARITY.

## Independent official source sample

The [CBS admissions page](https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission) was read live on 2026-11-04, then checked against the worker's `D:/ibp-tmp/dk-cbs/admission.txt`. Sampled findings: the explicit 2027 March qualification-document deadline applies to applicants already graduated by 15 March; it is not a general deadline for current May IB students. Same-year results use CBS code 000151. The annual reply rule is 1 August 23:59, with no intake year stated. English B subject eligibility and English A language proof are separate. The six-programme table has a Mathematics B grade floor only for Sociology; it has no extra foreign-language A requirement for IBP. Course Results require supplementation, but CBS mentions GSK and 60 ECTS with exceptions. These findings support targeted correction, not an assurance that late IB results waive applicant-specific deadlines.

The [national Course Results FAQ](https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/spoergsmaal-og-svar-om-diploma-programme-dp-course-results-og-ib-certificate-i-forhold-til-optagelse-paa-en-videregaaende-uddannelse-i-danmark/) was independently read live on 2026-11-04. Questions 1–5 confirm the six-subject/three-HL/grade-3 threshold, national HF/self-study level-raising rules and exceptions, and the distinction between GSK for a specific subject and raising the general qualification. It expressly excludes GSK for the latter. That conflicts with CBS's current supplementary-route wording; it does not justify an automatic institution-wide refusal or unconditional grant.

The six programme pages were independently opened live on 2026-11-04. They establish the six named English BSc identities and their different study focus:

- [Digital Management](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-business-administration-and-digital-management)
- [Service Management](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-business-administration-and-service-management)
- [Sociology](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-business-administration-and-sociology)
- [International Business](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-international-business)
- [International Business and Politics](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-international-business-and-politics)
- [International Shipping and Trade](https://www.cbs.dk/en/study-programmes/bachelor-programmes/bsc-international-shipping-and-trade)

The linked regulations were separately opened. All six old `/2025/ba/.../newest` links redirect to 2026/2027 regulations. Those pages explicitly establish three years, 180 ECTS and EQF/NQF 6; credits were not inferred from duration. Current targets are [DM 1345](https://studieordninger.cbs.dk/2026/ba/1345), [Service 1357](https://studieordninger.cbs.dk/2026/ba/1357), [Sociology 1344](https://studieordninger.cbs.dk/2026/ba/1344), [IB 1355](https://studieordninger.cbs.dk/2026/ba/1355), [IBP 1356](https://studieordninger.cbs.dk/2026/ba/1356), and [Shipping 1346](https://studieordninger.cbs.dk/2026/ba/1346). A trial IBP 1241 URL was inaccessible; the actual linked 1254/newest succeeded. No repeated inaccessible-source requests were made.

## Historical findings communicated before final handoff

1. The original mandatory top-level `ib-diploma` rule would reject Course Results regardless of completed HF or higher education. The worker replaced it with a one-of rule: Diploma or individually assessed further qualifications. This prevents automatic grant/denial, pending final projection review.
2. The replacement exposes a shared-engine limitation: `entryAward()` scans only top-level award kinds. Actual Course Results output also says that nothing is recorded about whether Course Results or the Diploma is required. That generic silence statement is misleading beside a sourced conflict. This was sent to the worker and dispatcher as a shared-model/deferred concern.
3. Initial new regulation Evidence called the current linked regulations 2025. Independent redirect checks found 2026/2027; the worker was asked to correct URLs and caveats. This is not an intake-2027 curriculum guarantee.
4. Live IBP entry requirements do not include a separate foreign-language A. Worker confirmed the canonical record already has no such requirement; the older research note is historical, not the current actual rule.

## Read-only actual eligibility probes

Direct `assess()` calls read the actual six CBS Opportunity files with the shared subject index and institution equivalences. No test file or runtime was written. Initial 42 probes covered Diploma, Course Results totals, supplementary qualification annotations, English B SL and Mathematics AA SL grade 4. A second pair used internally consistent six-subject profiles totalling 18 and 17 respectively. Supplement annotations were deliberately extra profile data: the current engine does not interpret completed HF/60 ECTS, which is why review is required.

| Actual scenario | Result across six degrees | Assessment |
|---|---|---|
| Full Diploma; English A SL 5; Mathematics AA SL 5; Economics HL 5 | Meets requirements, all six | Appropriate; no admission promise |
| Full Diploma; English B SL 5 instead of English A | Possible with action, English-language gap | Correct subject/proficiency distinction |
| Full Diploma; Mathematics AA SL 4 | Sociology does not currently meet; other five meet | Correct Sociology-specific grade floor |
| Course Results with possible HF or 60 ECTS further study | Needs review | Safe unresolved pathway, no automatic rejection or grant |
| Six Course Results grades of 3 (18 total), three HL | Needs review | Supplementary-route conflict remains unresolved |
| Same profile with one grade 2 (17 total) | Needs review | No erroneous grant; current model does not independently enforce the Course Results threshold within the review branch |

All Course Results probes also produced the generic `entry-award-not-established` silence warning described above. Final runtime and reader-facing samples are still required.

## Final handoff review

Pending worker report, final runtime and dispatcher projection paths. No acceptance or completion recommendation has yet been issued. Recheck date recorded in the data is 2027-01-15; unresolved material pathways and projection gaps must remain explicit rather than being counted as complete research.

## Additional findings before the final build

5. The current new route initially grouped postal and emailed signature pages under 15 March noon. The official CBS instructions give postal pages a 14 March postmark deadline. This was a failing deadline until corrected. The worker changed the actual route to CBS email instructions with the postal exception stated separately; a read-only `load()` + `datesFor()` sample confirms the corrected wording.
6. The standard-assessment heading expressly limits the IB tables to the 2026 admission round. This is a stronger limit than an undated annual rule. The worker has now added `req-2027-ib-assessment-confirmation` to all six Opportunities and made the Evidence caveat explicit. This changes the final Diploma verdict to review, appropriately, until the published 2027 assessment is available.
7. Direct shared `load()` projection inspection confirms issue 71 affects CBS: canonical institution `support` and programme `description`, `structure`, curriculum links and detailed applicant cost/application-fee fields are absent from the projected institution/programme facts. Their existence in JSON does not satisfy ADR 0008. The shared `datesFor()` projection is much better: only the CBS-specific route appears; the holder-only March document event is flagged, the reply is 1 August 23:59 and no other institution's result code or generic 2 August reply leaks into this list. Undated results-access steps exist in the dates array but require final surface inspection.

These are historical findings, not permission to score an unfinished build. Final outcome remains pending.

## Final runtime and report received

The final worker report at `docs/research/imports/hourly/2026-11-04-dk-cbs.md` was read after the worker confirmed runtime stability. It recommends deferral to 2027-01-15 and records the material source limits. Regulation dates and signature instructions now reflect the independent corrections above.

The dispatcher made a narrow common copy correction in `src/lib/eligibility.mjs` and `src/pages/programme-facts.mjs`. This reviewer independently inspected it: the unknown award state now asks for qualification-route and additional-study confirmation, rather than asserting no source/evidence exists. No award classification or assessment logic was changed. This is acceptable for the unconfirmed and conditional pathways. A broader common projection/classification change remains separate work.

After that correction, 24 independent direct actual-file `assess()` calls (six degrees × Diploma/Course Results × EU/non-EU) all returned `needs-review`, with no hard gaps in the otherwise qualifying subject profile. Diploma/EU had only the 2027-assessment question. Diploma/non-EU also had the conditional residence-permit document question. Course Results had the disputed supplementary route, 2027 assessment, and a generic route-confirmation question; no false silence claim remained. The generic warning is redundant but safe. For Course Results/non-EU the engine skips the additional permit question when the entry rule is already unknown; the conditional March rule remains in the actual dates projection. This limits the completeness of personalised guidance and does not establish a grant or rejection.

Worker `*.render.html` files are HTML-escaped strings, useful for text checks but not browser screenshots. Final dispatcher-built HTML and surface sampling remain pending before scores.

The dispatcher then shortened the six confirmation labels to `CBS IB assessments cover 2026; confirm qualification and subject mappings for 2027`. Independently checked all six labels: the mandatory unknown remains, the target intake is explicit, and the Evidence retains the stronger 2026-only source scope. This is a concise presentation of the same unresolved question.

Independent maintainability/semantic score for the narrow common copy fix: **9/10, accepted**. The read-only diff contains shared wording and one corresponding existing assertion update; it introduces no institution-name branch, enum, private field, duplicated template or assessment-logic change. The generic confirmation wording remains true for both absent and conditional evidence. The dispatcher reports all 339 existing eligibility scenarios passing; this reviewer independently ran the 24 real CBS scenarios above, rather than claiming a separate full-suite run.

## Final independent assessment

**Admissions/safe-data correction quality: 8/10, accepted for publication as a deferred improvement. Shared information parity against ADR 0008: 7/10, not complete. Narrow common copy semantics/maintainability: 9/10, accepted.** This is not acceptance of complete 2027 admissions coverage and must not be used to finish the reserved unit as complete.

The final saved fix was independently inspected: `data/evidence/dk-cbs-20261104.json` now has 22 records. The CBS table and new CBS-scoped national FAQ snapshot have reciprocal conflict references. The snapshot faithfully represents the national source this reviewer read live on 2026-11-04, supports only the six CBS entry-award requirements, and leaves the shared national record unchanged. It does not turn either GSK or 60 ECTS into an automatic grant or refusal. All six shortened prior-education labels continue to require individual CBS qualification confirmation. A fresh independent set of 24 actual-file assessments after this final metadata/label fix again returned `needs-review`, without false grants or hard award refusals.

Actual SSG HTML was independently read from `D:/ibp-tmp/absalon-release-20261030/dist`, tree supplied by dispatcher as `f9ecfd3fcd842f4095ed835ded26e82d9ac0849a`, built with `/IB-Post-Secondary-Opportunities`. This includes `universities/dk-cbs/index.html` and all six `programmes/dk-cbs-*-2027-autumn/index.html` pages. The later saved metadata/label change was reviewed directly; it preserves these date and unknown-route semantics. The dispatcher is running its corrected clean gate on tree `8e79492dcf5dcda82d67cbb0b37d79fcc1dd0ff6`. This reviewer did not run or claim that full gate.

All seven sampled HTML pages carry the correct recipient code and reply event, with the already-held qualification event marked holder-only. None contains another institution's recipient code or the generic 2 August reply. All six programme pages carry the 2026-to-2027 qualification/mapping confirmation and the revised common award-confirmation explanation. Historical cut-offs remain identified as 2026 in the detailed selection explanation. The official bachelor catalogue was also independently opened live and its fifteen-entry list checked against the six English BSc identities. One actual phone screenshot was viewed for context (`dk-cbs-shots/programmes__dk-cbs-international-business-2027-autumn--phone-light.jpg`); imagery and the full 28-screenshot visual score belong to the separate art-direction critic.

The material remaining projection gaps are confirmed in actual output, not inferred from schema:

- Programme learning structure, curriculum links and institution support bodies do not reach the main shared pages.
- Applicant fee amounts appear in programme Evidence text but not a complete structured cost scenario; the university page omits the detailed tariff.
- The undated online-results authorisation action is absent from the actual HTML dates panel.
- Same-day date grouping shows both the application and email-signature labels but retains only the first event's note. CBS's signature email destination and separate postal exception are lost. Because the displayed label explicitly says email, the page does not display the wrong postal deadline; it still fails checklist/detail completeness.
- Personalised Course Results guidance remains review-only and cannot establish completed HF/GSK/60 ECTS qualification routes or independently enforce every threshold. The conditional permit deadline is available in route data but not repeated for every already-unknown Course Results profile.

These gaps remain under issue 71 and the documented shared award/projection work. They prevent a parity or complete-coverage acceptance. The safe corrected slice is worth publishing: it removes dangerous inherited timing and qualification assurances while retaining useful programme identities, sourced detail and honest uncertainty. No currently sampled displayed deadline is known wrong.

**Recommended outcome: deferred, next check 2027-01-15.** Re-read the promised 2027 CBS standard assessments before application opening, settle the Course Results route conflict and residence-permit/final-IB timing from official guidance, and complete common projection work. Do not silently remove the mandatory 2027 question or mark the institution complete on the strength of raw JSON or passing guards alone.
