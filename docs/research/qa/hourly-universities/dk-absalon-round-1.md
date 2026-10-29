# Absalon independent acceptance — round 1

**Admissions: 8/10. Imagery: 8/10. Shared format/art direction: 8/10. Maintainer: 9/10.** Accepted for publication of the scoped safe improvements after actual built desktop/phone review. Full autumn 2027 completion remains deferred to 15 January 2027.

Reviewer: separate Codex review agent, acting as admissions counsellor, photo editor and shared-format critic. Reviewed 30 October 2026 under `docs/QA_CRITIC_LOOP.md` and `docs/HOURLY_UNIVERSITY_WORKFLOW.md`. Only this review file is owned by the reviewer. No Git, reservation/progress edit, full gate or default build performed.

## Scope and actual artefacts

Read the actual institution, both 2027 engineering Opportunities, scoped application route, nine-item evidence file, Absalon official-image entry, and hourly report. Read shared quota-floor projection in `src/lib/canonical.mjs`, its eligibility treatment in `src/lib/eligibility.mjs`, milestone supersession in `src/lib/school-dates.mjs`, and shared programme-template contract. Inspected the actual generated HTML at `D:/ibp-tmp/dk/absalon/render-institution.html` and both `render-dk-absalon-*-2027-autumn.html` files, including the detail disclosures. This review does not rely on the worker's assertions of rendering success.

Opened the responsible sources listed below directly. No broad provider search was repeated. Viewed actual full campus pixels, the 480×300 crop, and both existing degree 480px WebP crops.

## Admissions judgement

No incorrect deadline found in the changed guidance. The specific [Robot admission page](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/admission-requirements-bachelor-engineering-robot) supports Danish GPA 5.0 for quota 1, GPA ranking, optional interviewing when that floor is met, interview-score ranking in quota 2, and the 65/35 split. The data scopes `minimum-average` to quota 1. Actual HTML says “Quota 1: at least 26 IB points” and “Below this, you can still be admitted in the other quota.” Shared eligibility code evaluates this as a quota caveat rather than a mandatory eligibility gap. The new floor has not become a universal 26-point entry threshold. Robot selection and Biotechnology's compulsory quota 2 interview remain distinct.

The [Biotechnology admission page](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/admission-requirements-bachelor-engineering) supports its additional chemistry/biotechnology choice, quota 2 interview, selection factors, and current English tests. Both programme pages support IELTS 6.5, TOEFL 4.5 / earlier-test 94, Cambridge 180 and two-year validity. The published Robot page still combines a precise quota interview section with later generic wording; preserving the specific quota rule and recording the ambiguity is defensible.

The [Robot application page](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/application-and-fee) and [Biotechnology equivalent](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/application-and-fee) put IB applicants at 15 March noon, including IB taken in Denmark. Their 5 July application date is for Danish entry examinations. They require application documents in March but permit individual missing-document instructions in nemStudie, and expressly mention EU summer finishers. The [engineering FAQ](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/admission-requirements/faq-bachelor-engineering) permits later exam evidence and a preliminary-results/expected-hours process before 5 July for completion before 1 September. The new route distinguishes those events, marks annual dates provisional for 2027, and supersedes the generic reply date with the admission letter's deadline. The actual date panels contain no fixed 2 August acceptance deadline. Individual reply advice remains visible in institution notes, although the undated reply event itself is not in the dated list.

Crucially, actual July milestone details state that same-year non-EU eligibility needs confirmation. The route does not promise a fee-paying summer IB student same-year admission. Exact final-IB delivery method, recipient code and final-result deadline remain unknown; this is a real completion limit, not permission to infer them.

Both fee pages support the deposit and published tuition figures, including advance first-year payment from the September 2026 intake. Actual institution notes expose the undated price year and the Robot mismatch. The [Robot structure](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/about-bachelor-engineering-robot-systems) puts a 30 ECTS internship in semester five; its fee table puts the low-fee semester in semester six. The update preserves the conflict instead of silently repairing it. EU/EEA exemption and the usual other-applicant deposit are appropriately phrased; individual residence exemptions are still a separate question.

The [accreditation authority](https://akkr.dk/akkreditering/arkiv-gennemforte-institutionsakkrediteringer/professionshojskolen-absalon/) supports the former UC Sjælland identity and positive 3 June 2021 decision. The [full-degree hub](https://en.phabsalon.dk/full-degree-programmes), [Kalundborg page](https://en.phabsalon.dk/campus-kalundborg) and [Education page](https://en.phabsalon.dk/full-degree/professional-bachelors-degree-education) support this bounded two-degree list: Education is partly Danish and based in Vordingborg. The existing national Course Results pathway is expressly distinguished from Absalon's own silence about Course Results in the detailed student projection. No new evidence record claims human verification: all nine remain `needs-review` with automated self-attestation.

## Photo-editor judgement

The selected campus photo is suitable at 8/10: contemporary silver Kalundborg buildings, vivid yellow flowers and clear sky give the institution a recognizable place. There are a few distant cars at the far left, but they do not define the picture. The 480×300 crop retains architecture and foreground colour; no dominant logo, sign, event or car park. It is a substantial improvement over the documented rejected old sign-led image. The official-image record accurately gives an institution-published linked-use basis, without claiming an open licence or a named photographer. The [official campus page](https://en.phabsalon.dk/campus-kalundborg) supplies the context and published image.

Actual images viewed:

- `D:/ibp-tmp/dk/absalon/campus-2.jpg` and `campus-2-480.png`.
- `src/assets/img/programmes/programme-dk-absalon-biotechnology-beng-480.webp`: researcher and lit algae reactor remain legible and arresting.
- `src/assets/img/programmes/programme-dk-absalon-robot-systems-beng-480.webp`: person, robot arm and shared tool remain in the crop; a clear collaboration subject.

The programme photographs are illustrative subjects rather than photographs of Absalon. Their existing source/credit basis is retained. The [DOE Commons record](https://commons.wikimedia.org/wiki/File:U.S._Department_of_Energy_-_Science_-_298_042_003_(9525866984).jpg) identifies the NREL algae reactor and carries a government-work public-domain review; the [Robot Commons record](https://commons.wikimedia.org/wiki/File:Human-Robot-Collaboration-Sawing-2016-Luka-Peternel.jpg) identifies Luka Peternel's 2016 Italian Institute of Technology experiment and CC BY-SA 4.0. Actual HTML carries the respective credits.

## Shared-format judgement

The actual HTML uses the shared university/programme structure: place and degree identity first, concise comparison facts, a dated route panel, translated IB subject requirements, selection details one disclosure down, sources and official handoff. Both degrees are present. No university-specific template/schema branch is needed or added. Current Robot unfinished-criteria wording is absent. Source disclosures retain the statement that no person has checked the sources.

The institution's expanded notes successfully carry pricing, English alternatives, non-EU completion uncertainty and the fee/internship conflict. Programme source disclosures expose current fee evidence; the shared programme view does not surface every `cost` or route supplementary field as a dedicated block. This is an existing shared projection limitation, not a reason for a special Absalon template. Do not describe hidden JSON fields as visibly presented.

Built desktop/phone screenshot inspection is complete: all twelve screenshots below were opened and their actual pixels examined, including original-resolution phone views. Both light and dark themes preserve text contrast, campus identity, degree subjects and credit lines. The two-column desktop content/rail becomes a legible single-column phone flow; facts, subject alternatives and the quota 1 floor fit. Disclosure controls keep longer evidence and notes one tap down. No image failed to load, and no newly introduced clipping or collision is visible. Format/art direction passes at 8/10. The broad desktop related-degree card crops are less expressive than their phone cards, and the institution hero introduction could be shorter; neither is an acceptance blocker for this data/image update.

Screenshot evidence, all actually inspected (1280px desktop / 390px phone):

| Page | Desktop light | Phone light | Desktop dark | Phone dark |
|---|---|---|---|---|
| Institution | [image](dk-absalon-shots/universities__dk-absalon--desktop-light.jpg) | [image](dk-absalon-shots/universities__dk-absalon--phone-light.jpg) | [image](dk-absalon-shots/universities__dk-absalon--desktop-dark.jpg) | [image](dk-absalon-shots/universities__dk-absalon--phone-dark.jpg) |
| Biotechnology | [image](dk-absalon-shots/programmes__dk-absalon-biotechnology-beng-2027-autumn--desktop-light.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-biotechnology-beng-2027-autumn--phone-light.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-biotechnology-beng-2027-autumn--desktop-dark.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-biotechnology-beng-2027-autumn--phone-dark.jpg) |
| Robot Systems | [image](dk-absalon-shots/programmes__dk-absalon-robot-systems-beng-2027-autumn--desktop-light.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-robot-systems-beng-2027-autumn--phone-light.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-robot-systems-beng-2027-autumn--desktop-dark.jpg) | [image](dk-absalon-shots/programmes__dk-absalon-robot-systems-beng-2027-autumn--phone-dark.jpg) |

## Narrow guard correction — maintainer 9/10

Independently read `scripts/lib/research-log.mjs` and `scripts/test-research-log.mjs` after the coordinator's gate finding. The correction adds the exact token `nemStudie` to the existing legitimate-name allowlist, beside other portal/product names, and adds one realistic positive fixture. Absalon's responsible [Robot admission page](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/admission-requirements-bachelor-engineering-robot) uses that spelling in its individual-document deadline advice. It is a real portal brand, not internal code accidentally leaked into student copy. The exception is shared and exact-token, with the existing research-log patterns and negative fixtures preserved. This is appropriate maintenance of the guard rather than broad weakening of it. No template or student-rendering change results.

Reviewer ran `node scripts/test-research-log.mjs`: passed, including positive/negative fixtures, all 2,775 existing primary-checkout rendered pages, and handed-off-line ownership. This read-only focused check did not build anything and is not a substitute for the coordinator's clean release gate.

## Actionable completion limits and highest-value next steps

1. **Keep the unit deferred to 15 January 2027.** Recheck programme pages for explicitly 2027 dates/rates. These safe improvements do not justify closing the whole 2027 unit as complete.
2. Resolve final IB delivery and same-year non-EU summer completion with responsible published guidance; preserve the visible caution until then. Follow the individual offer for acceptance.
3. Resolve the Robot internship/payment-semester discrepancy before presenting a settled payment plan. Keep the published total labelled as undated and changeable.

There is no admissions, image, format or maintainer blocker to publishing these scoped safe improvements. All requested editorial scores meet the threshold. Full release validation, publication and reservation closure remain coordinator work; this report does not claim their results. The deferred full-2027 limitations above still stand. This automated editorial review does not promote Evidence to human-verified status.
