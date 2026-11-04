# Dania admissions and information-parity critique — round 1

Run: `9d2ea2ec-47fd-4901-abf4-da2477d8205c`

Reviewer: independent admissions counsellor/source and shared-information critic.

Research date: 2026-11-04. **Final: admissions/source and safe correction quality 8/10 — accepted for the deferred slice. Full information parity 7/10 — not accepted as complete. Recheck 2026-12-01.** Historical pending statements below are superseded by the final assessment. This report owns no runtime, data, workflow state, Git or build changes. Imagery is reviewed separately.

Final inspected clean SSG tree: `916d339dac08b22e9f74f708b2bc536f5dad7d03` on base `e19ee09`. Narrow shared maintainer/copy correction: **9/10 — accepted after actual rebuilt HTML review**. The earlier v1 tree is historical.

## Standard and scope

Read QA_CRITIC_LOOP, HOURLY_UNIVERSITY_WORKFLOW, ADR 0008, PAGE_TEMPLATES and school PARITY. Review uses the relevant common information categories for every institution, not merely the shared visual shell. Existing canonical `dk-dania` and its one `dk-dania-cyber-security-2027-autumn` opportunity are the scope; no duplicate school record is appropriate. One wrong actionable deadline fails acceptance.

## Independent official source sample

Read live on 2026-11-04:

- [Dania's English programme catalogue](https://eadania.com/programmes/): its English-programmes link resolves to Cyber Security; the catalogue establishes September 2027 international entry. This supports the bounded existing offering scope, not revival of historical English AP degrees.
- [Dania Cyber Security](https://eadania.com/programmes/cyber-security/): confirms Viborg, English, September 2027, 195 ECTS, 3.25 years and internship. Its specific requirements remain English B and Mathematics B, while its language section also suggests C plus a test. That conflict needs explicit treatment. International applications close 15 March noon. Current students upload their latest transcript with the application; final diploma timing follows later admission instructions. Verification form and photo ID are listed. EU/EEA and stated Danish-residence exemptions differ from fee-paying applicants; the latter price remains unpublished. Some curriculum details remain pending. These are current programme facts, not proof of a complete future fee schedule or settled selection model.
- [Danish Agency IB admissions guidance](https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/optagelse-af-ib-elever/): six DP Course Results grades of at least 3, at least three HL subjects and 18+ points permit academy/professional-bachelor applications. A full Diploma of 24+ also permits applications, subject to specific requirements. This is a national rule, not an institutional statement or admission guarantee.

## Findings communicated during work

1. Inherited `priceYear: 2026/27` cannot establish fees for entry in autumn 2027. Preserve applicant-group exemptions and the unpublished amount honestly.
2. Remove inherited generic route assertions from the actionable Dania path: especially an invented 2 August reply date or a fixed July final-document deadline. The programme-specific instructions control.
3. Retain the English B versus C-plus-test conflict; do not turn an IB subject translation into proof of a general English-test waiver.
4. Source-backed curriculum, support, costs and submission requirements must be reviewed in actual shared projections. Issue 71 already tracks these common omissions; merely adding raw JSON does not establish information parity.

The worker acknowledged these points and plans a Dania-specific application route and honest source caveats. This acknowledgement is not evidence of the final implementation. Final records and built surfaces remain to be inspected.

## Stable runtime inspection

The worker confirmed the canonical records stable before these read-only probes. Actual `load()`, `assess()` and `datesFor()` calls used the repository's subject catalogue, recognition schemes and real Evidence resolver. All six subjects in the final probes are valid catalogue IDs. The Diploma probe has six grade-4 subjects; Course Results probes start with six grade-3 subjects and three HL subjects, without an invented Diploma total.

| Scenario | Actual result | Assessment |
|---|---|---|
| Diploma, 24 subject points, required subjects | Needs review; three mandatory rules matched | Explicit Evidence conflict prevents an unconditional eligibility claim |
| Course Results, 18 points, six grade-3 subjects, three HL | Needs review; three mandatory rules matched | National general-access rule is applied correctly |
| Course Results with one grade 2, 17 points | Needs review; award gap identifies both shortfalls | No false grant |
| Course Results with only two HL subjects | Needs review; award gap identifies missing HL | No false grant |
| Course Results with only five subjects | Needs review; award gap identifies missing subject | No false grant |

`entryAward()` returns `course-results-accepted`. The aggregate Evidence status is `conflicting`, checked 2026-11-04. The broad Needs review result does not erase the failing qualification conditions: they remain in the actual `gaps` array. No human verification is claimed.

Only `dk-dania-international-2027` appears in the actual programme's date projection. It contains the opening, provisional noon application close, and two undated actions. No generic July documentation or August reply date appears. Correct data does not prove all undated steps or secondary notes render; the clean SSG sample remains required.

The stable raw records now contain institution support, programme description and structure, curriculum link, applicant costs, submission items and progression. Direct shared projection inspection returns no institution `support`, programme `description`, `structure` or detailed `cost`; it does return the new quota-2 selection factor and EU fee status. This confirms issue 71 is material for Dania.

The [Accreditation Council's actual PDF](https://akkrediteringsraadet.dk/wp-content/filer/afgoerelser/Afgoerelsesbrev%20og%20rapport%20-%20IA%20-%20Dania%202024.pdf) was independently opened live on 2026-11-04. Its first-page extension letter is dated 18 December 2025 and confirms institutional accreditation through 12 March 2032. The worker correctly distinguishes this from a separate programme accreditation claim. The [Danish programme counterpart](https://eadania.dk/uddannelser/cybersikkerhed/) was also independently opened: its own language is Danish, so it cannot override explicit English-offering evidence; its opening date and award title are consistent with the stable record.

## Actual clean SSG review and final scores

The worker's ready notice and completed report `docs/research/imports/hourly/2026-11-04-dk-dania.md` were received and read. The coordinator then explicitly confirmed successful SSG build (54.7 seconds) of clean snapshot `f76314982f7d3a9afc418a4e85f8b7bd9366a5bd`, based on `e19ee09`, in `D:/ibp-tmp/absalon-release-20261030`; log `D:/ibp-tmp/dania-gate-v1.log`. This reviewer read the actual generated `dist/universities/dk-dania/index.html` and `dist/programmes/dk-dania-cyber-security-2027-autumn/index.html` there. Build existence was not assumed from a worker-rendered escaped string. The full release gate was still running when this content review concluded; this report does not certify its later result or publication.

| Common relevant category | Actual record and student-surface result |
|---|---|
| Identity, recognition, place | Correct canonical institution; current accreditation and Viborg visible; no duplicate |
| Offering scope, credential, intake | One English programme visible; professional bachelor, duration, credits, 2027 start and AP exit are explained |
| Curriculum and learning pattern | Short summary reaches the main programme topic; richer description/structure is unprojected. Curriculum excerpts survive in Evidence, which is useful but is not a dedicated learning explanation |
| Entry and selection | Diploma/Course Results distinction, thresholds, English/Maths equivalences and quota-2 factor visible. No historical cutoff is invented. Numeric capacity and scoring remain unresolved |
| Language proof | Open English-route question and conflicting Evidence are visible; test detail remains in Evidence rather than an application-proof section |
| Applicant-group costs | Institution note explains the fee gap; programme Evidence contains exemptions. No dedicated financial scenario or detailed cost projection |
| Application steps and documents | Correct scoped date and supporting Evidence; no clear checklist. Undated final-document and offer-reply actions exist in `datesFor()` but are omitted from the actual date panel |
| Progression and recognition | AP exit and institutional accreditation visible; detailed outcome/further-study pathway is unprojected |
| Imagery | Separate imagery critic owns visual/licence/crop acceptance; no imagery score inferred by this reviewer |
| Provenance and freshness | Sources, read dates, target intake, conflict and non-human-verification state visible. One common provisional-date wording defect remains below |

The actual primary panel has the February opening and March application event with its noon time, local time zone and explicit uncertainty. No inherited July document or August reply deadline leaks into either sampled page. The final-document and reply dates are honestly unknown in the record; their absence from the panel is a coverage/next-action gap rather than permission to invent dates. There was no numerically wrong actionable deadline in this final sample.

The shared provisional footer calls this annual undated rule “Last year’s date, not yet confirmed”; the programme freshness line likewise says provisional dates repeat last year's. The scoped source note correctly says no explicit year on the first-2027-intake page. That temporal provenance wording is imprecise and should use the actual annual/year-unpublished state. It does not change the date or remove its explicit warning, so it does not block safe-data acceptance. It is a common copy follow-up, not a reason for a Dania-only template branch.

**Admissions/source and safe correction quality: 8/10.** I would ship the scoped improvements with the documented unresolved conditions. They remove misleading inherited timing, distinguish qualification types, retain the source conflict and unpublished fees, and provide a specific recheck. This is acceptance of the safe deferred slice, not of settled 2027 admissions coverage.

**Full information parity: 7/10.** The actual common sections do not yet support a serious complete comparison across the required categories. Evidence-drawer availability is better than wholly hidden facts, but does not substitute for curriculum, support, financial, outcome and application-step explanations in their relevant surfaces. Existing issue 71 tracks the shared projection work; the worker correctly requests deferral rather than completion.

The three changes that would raise the scores most:

1. Repair the shared projections and appropriate common sections for supported description/structure, support, applicant costs, outcomes, submission items and undated actions, retaining source and intake scope; verify the actual resulting pages under issue 71.
2. Recheck the material admissions/curriculum unknowns on **1 December 2026** as recorded in the worker report; preserve unknown/conflict state until the responsible official source resolves them.
3. Make common provisional-date copy distinguish an undated annual rule from a historical date, using the existing state rather than suggesting a prior intake existed.

Round 1 is sufficient to accept the safe improvements with an explicit deferred outcome. Do not mark the university `complete`, inflate the parity score to the publication threshold, or claim human verification. Imagery acceptance, full-gate success, scoped commit/push and published-SHA verification remain the coordinator's separate responsibilities.

## Narrow shared correction — source review, awaiting final rebuild

The coordinator made a narrow shared correction after the v1 review above. Therefore v1's successful build/gate is historical and does not certify this changed runtime. Final rebuilt HTML confirmation is pending.

Independently inspected `src/lib/school-dates.mjs`, `src/lib/components.mjs`, `src/pages/meta.mjs`, `scripts/test-calendar.mjs` and `scripts/test-images.mjs` after the coordinator's saved notice. The date-panel tooltip/footer now say the date is unconfirmed; freshness tells the reader to check provisional dates without asserting that a previous intake existed. No date, model, eligibility rule or institution-specific branch is changed.

The credits fix excludes explicitly rejected records from Commons, institutional and discipline lists. This is appropriate because the credits page describes photographs used by the site; rejected subjects must not be presented as an institution's photograph. Approved attribution remains intact. The tests check the negative semantics and retained approved records across all three source groups. They do not require broadening the publication policy or changing imagery source records.

Read-only actual loader/render probes confirm the neutral provisional warning, retained noon application time, absence of prior-intake wording, withheld rejected Florida subject, retained Mike Reyher credit and retained Dania institutional source-page attribution. **Narrow maintainer/copy source review: 9/10 — accepted, subject to final rebuilt output confirmation.** No blocker found in these five files. The shared information-parity deferral remains unaffected.

## Final corrected SSG confirmation

After the coordinator explicitly confirmed the corrected successful SSG build (42.7 seconds), this reviewer independently read the two Dania generated pages and `credits/index.html` from `D:/ibp-tmp/absalon-release-20261030/dist`, final tree `916d339dac08b22e9f74f708b2bc536f5dad7d03` on base `e19ee09`.

Both Dania pages now use the neutral date-panel warning. The programme freshness line uses the intended provisional-date caution; neither page asserts that dates repeat a prior intake. Their actual date panels still show the same February opening and provisional March close at noon Copenhagen time, with the same source note; no July document or August reply deadline was added. On the actual credits page the rejected Florida subject is absent, while the Dania classroom subject and official Viborg source-page link, Mike Reyher attribution and NOC-Architel source remain present.

**Final narrow maintainer/copy score: 9/10 — accepted. Final admissions/source safe-slice score remains 8/10. Full information parity remains 7/10, deferred to 2026-12-01.** The common correction resolves the specific temporal-copy finding above without altering dates, model or eligibility behaviour. Full release guards were still running at the last coordinator notice; this reviewer does not assert a subsequent gate or publication result.
