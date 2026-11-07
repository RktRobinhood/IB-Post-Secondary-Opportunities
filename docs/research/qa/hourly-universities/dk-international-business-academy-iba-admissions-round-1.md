# IBA admissions and source review — round 1

Reservation `dk-international-business-academy-iba`; run `fe8ee962-a593-4652-8c75-1f7f5fb0c6ea`; target autumn 2027. Independent Codex automated admissions counsellor/source critic. Source reads began 6 November 2026; artifact review resumed 7 November. This is source-read AI editorial review, not human verification.

**Final: admissions/source quality 8.3/10 — accepted for the partial online BA improvement. Full institution public information parity 6.4/10 — deferred to 15 January 2027.** The rejected projection checkpoint and subsequent correction are retained below. This reviewer owns this report only and does not edit data, code, Git, build output or SEA's accepted snapshot. Acceptance covers the actual records and current shared HTML inspected, not clean-release, browser/phone, publication or human verification.

## Responsible-source checks

- [Agency regional register](https://ufsn.dk/institutioner-og-drift/styring-af-uddannelsesudbud/regionalisering/regionale-daekningsomraader/): read the actual institution list. Erhvervsakademi IBA Kolding and Erhvervsakademi Sydvest are separate entries. A historical `possible_existing_keys` lead cannot establish that they are aliases.
- [IBA bachelor index](https://iba.dk/international/bachelor/): read main catalogue and navigation, including the separate full BA, top-ups, BSc and BME. Navigation still includes discontinued material; the index alone is not a current-intake exhaustive list.
- [Online BA programme](https://iba.dk/international/online-programmes/bachelor-honours-international-business-management-e-ba/): a first-year English BA (Hons) International Business Management offered with Leeds Beckett University, entirely online, 3–6 years/180 ECTS. The page publishes 6 September 2027 start and 22 August 2027 application/document deadline, without an exact closing time. Upper-secondary equivalence is required; the meeting is offered, rather than a compulsory interview. Fees apply to every nationality: DKK 155,000 total, comprising registration, modules and project; books are additional. It states no SU, scholarships or Danish student-visa entitlement. Its TOEFL iBT threshold is 79 with 19 in each section. Unfinished qualifications require transcripts and expected graduation date; this does not establish a separate final-IB delivery mechanism or permission to miss the document deadline.
- [September 2026 launch announcement](https://iba.dk/more-online-students-can-now-study-for-an-international-bachelors-degree-at-iba/): explicitly distinguishes the new direct upper-secondary route from the older top-up, calls it English and entirely online, and reports LBU validation in July and a later quality-team visit. Responsible IBA publications support this offering; no invented requirement for another institution's corroboration is imposed here.
- [Linked E-BA IBM application form](https://www.service4mobility.com/europe/BewerbungServlet?aust_prog=E-BA_IBM&identifier=KOLDING10&kz_bew_art=IN&kz_bew_pers=S&sprache=en): actual form title matches the full online degree, with prior higher education optional. Its TOEFL iBT option is 65, conflicting with the programme. The IELTS 6.0 option agrees. Its English-medium IB Diploma option is language evidence, not a Course Results entry rule. I only read the form; no submission, payment, personal data or consent was sent.
- [Application fee](https://iba.dk/international/application-fee/): updated June 2026, expressly includes the online full BA and provides 2027 payment links. DKK 750 plus service charge applies regardless of citizenship, with the stated IBA-graduate exemption. This is separate from tuition registration; payment must arrive by the application deadline. The service charge has no amount on this page.
- [BSc International Business Management](https://iba.dk/international/bachelor/bsc-in-international-business-management/): the actual 2027 page describes a three-year English Coventry award at IBA Kolding and upper-secondary entry, but its mandatory checklist demands AP/equivalent 120 ECTS/240 CATS. That is an unresolved programme-specific contradiction. The page publishes 1 March 2027 non-EU and 1 July 2027 EU/EEA/Swiss deadlines, both labelled 16:00 CET, and 6 September start. These must not become a resolved school-leaver application route until the contradiction is addressed. This conflict says nothing adverse about the separate online BA's first-year availability.
- [Business Management across Europe](https://iba.dk/international/bachelor/business-management-across-europe-double-degree-programme/): first-year English route starting in Kolding, then UCLL and another partner; published schedule remains 2026. Its non-EU header deadline is 1 June but procedure is 1 May. Neither may be rolled to 2027, and no deadline can be selected silently.
- [Informatics](https://iba.dk/international/bachelor/bachelor-of-science-informatics/): explicitly not offered from 2026 and requires prior IT higher education. It cannot be included as a current first-year route.
- [International Qualifications](https://iba.dk/international/international-qualifications/): introductory applicability and IB row read directly, including a narrow re-read on 7 November. This is guidance for Coventry courses, gives 24 points for undergraduate IB and an English-medium waiver, with course-specific/individual assessment. The 24-point rule must not be transferred to the Leeds Beckett BA.
- [Dedicated English requirements](https://iba.dk/international/english-language-requirements/): March 2022 Coventry guidance includes BSc IBM in its programme list but omits it from table column headings. The EU/EEA/Swiss limitation for IB-in-lieu-of-IELTS conflicts with broad English-medium guidance. It is not a universal waiver or an online LBU admission rule.

## Acceptance boundaries retained

The online BA is a supported English first-year 2027 offering. Neither the 2021 SU-place withdrawal, top-up history, BSc checklist contradiction nor BME's historical dates justify `scope: none`, a global no-English claim or treating all first-year availability as unknown. An internal pending scope can represent unfinished exhaustive portfolio classification only if it states the known BA plainly.

No reviewed responsible source establishes DP Course Results acceptance or rejection for the LBU BA. No national AP rule can silently supply that answer for a UK-awarded bachelor. A qualification/English unknown must remain actionable and must not calculate eligibility as met. The published application date remains useful while final-IB mechanics, reply timing and fee-service-charge amount are unresolved.

ADR 0008 and PAGE_TEMPLATES require separate acceptance of the real public projection. The parent's demonstrated unconditional “in Kolding”/Where fallback is a material attendance claim for a wholly online degree, despite correct online prose. A common delivery-mode/location projection may resolve it; narrative storage alone does not. Conversely, it is inaccurate to claim that the current schema cannot store any online or awarding-body explanation: existing teaching-style/flexibility/outcome fields already can.

Final review will inspect actual canonical records, discovery row and relevant public answers. Imagery, shared-format/phone review, maintainer acceptance, release checks, publication and CI remain separate responsibilities. Complete public information parity will be scored separately from a safe partial institution improvement.

## Stable raw-artifact checkpoint — 7 November

Read the actual worker report and assigned discovery row after the worker's readiness message, plus all new files:

- `data/institutions/dk-international-business-academy-iba.json`
- `data/programmes/dk-international-business-academy-iba-business-management-online.json`
- `data/opportunities/dk-international-business-academy-iba-business-management-online-2027-autumn.json`
- `data/application-routes/dk-international-business-academy-iba-online-2027.json`
- `data/evidence/dk-iba-20261107.json`

The source-backed online BA is now represented through canonical records rather than withheld because unrelated routes conflict. The Institution keeps Kolding as its provider location, while the Opportunity has `deliveryMode: online` and no physical Place. The Programme explicitly names the Leeds Beckett award and 3–6-year range, with the numeric three years explained as the full-time minimum. The direct route is limited to this Opportunity and autumn 2027.

The cost entries preserve DKK 155,000 **per programme** for EU/EEA/Swiss, non-EU and any applicant; no Danish zero-fee rule is inherited. DKK 750 plus unspecified service charge is a separate route fee, with the IBA-graduate exemption. The 22 August deadline applies to submission, documents and receipt of fee, with no invented time. Reply timing is `not-published`; final-IB delivery remains an explicit question.

Both mandatory entry and English rules retain questions for all applicants. No LBU IB points threshold, compulsory BA interview, automatic IB English exemption, Course Results rejection or national March deadline has been added. The published TOEFL 79/19 and form 65 readings have reciprocal conflict references. All six Evidence records remain `needs-review`, with distinct real retrieval/attestation dates; no human verification is asserted.

A read-only eligibility probe used the actual Opportunity and `loadCanonical` Evidence. Both an IB Diploma profile and a Course Results profile returned `needs-review` with no invented rejection gaps. `entryAward()` returned `not-established`; the Course Results profile additionally received the explicit unanswered-qualification-route question. This is meaningful behavioural confirmation of the unknown state, not source verification or a full release test.

The actual discovery row now has `scope: listed`, `partial-canonical-online-first-year-portfolio-deferred`, the Kolding reference, retained original catalogue leads, responsible official sources, no SEA alias target and explicit 15 January 2027 completion gaps. Listed here describes the available bounded provision; the row and Institution notes expressly do not certify an exhaustive portfolio. The worker's report makes the same distinction.

**Raw data/source assessment: 8.5/10.** This accepts the admissions content of the safe partial BA improvement. Actual public projection acceptance and the separate full-information-parity assessment remain pending the clean candidate. The 2027 portfolio must remain deferred rather than complete.

## Actual shared-projection checkpoint — not yet accepted

To inspect the real projection without building or writing output, invoked `load()` and the shared `university()` and `programme()` functions read-only, then read both returned HTML bodies as text. This is current-workspace HTML inspection, not a clean-release build, browser/phone inspection or publication check. The projected Programme uses the Opportunity ID ending `-2027-autumn`.

The institution actually displays the one-programme limitation, other-route scope conflicts, all-citizenship DKK 155,000 tuition, DKK 750 plus service charge/exemption, IB and TOEFL questions, and final-results uncertainty. The BA page actually displays Online in Where, an entirely-online opening naming Leeds Beckett and 3–6 years, the tuition total, the 22 August 2027 date and required actions, explicit IB/TOEFL open questions, an unresolved Course Results qualification notice, and source-disagreement/last-read status. The old physical-attendance wording is corrected in these inspected answers.

**Public admissions/source checkpoint: 7.7/10 — one correction required.** The faithful composite requirements summary, stored with `official: false`, is nevertheless rendered beneath **“In the institution's own words.”** That misattributes our paraphrase (including our IB/TOEFL interpretation) to IBA as original wording. Honor the existing `official` flag with a shared “Requirements summary” label for nonofficial restatements, or omit that restatement while retaining the already visible open questions. Do not change it to `official: true` or invent a quotation to satisfy the label.

This is the only immediate admissions/source blocker found in the inspected safe slice. Full public parity remains unaccepted separately: support, detailed learning structure, payment schedule and submission checklist are stored but do not all reach their corresponding shared student answers. The compact Length gives the full-time minimum of three years while the opening explains 3–6 years; a common future duration-range projection would improve comparison. These are completion/projection work, not a reason to hide the supported online BA or falsify unknown rules.


## Final correction verification and verdict — 7 November

Reinvoked the actual shared institution/programme renderers after the dispatcher correction. The Programme now labels the `official: false` paraphrase **“Requirements summary”**; the false original-wording label is absent. The Institution's new `#ib` section says to confirm how the qualification is assessed, links the actual BA and repeats its specific Diploma/Course Results open question. It does not import Coventry's 24 points, assert Diploma-only admission or promise Course Results entry. Online remains the BA's Where answer. The immediate checkpoint finding is resolved.

**8.3/10 admissions/source quality — accept the safe partial improvement.** I would use this page with a student as a source-backed online BA lead, explicitly requiring IBA/LBU confirmation of the unanswered entry/English/final-document questions. The site correctly gives a plausible opportunity before its requirements, keeps fees and date useful, preserves responsible-source conflicts, and does not decide the qualification question in the student's favour or against them. This is not a completed institution research pass.

**6.4/10 full public information parity — do not mark the institution complete.** ADR 0008/PAGE_TEMPLATES coverage remains split as follows:

| Relevant category | Actual inspected state |
|---|---|
| Identity, recognition and location | Separate IBA identity backed by the responsible Agency; provider city retained; online attendance explicitly distinguished. No SEA alias. Exact cited English Agency list and IBA about source were additionally read on 7 November, without altering the worker's older retrieval dates. |
| Offering and credentials | Confirmed BA first-year, English, LBU award, 180 ECTS and explained 3–6-year range. The full portfolio remains explicitly partial; BSc/BME/legacy programme questions are queued. |
| Entry and selection | Upper-secondary equivalence, qualification unknowns and work-experience factor reach public answers. No unsupported points threshold or mandatory interview is asserted. |
| English proof | IELTS route plus the TOEFL/form conflict and exemption question are visible; the conflicting rules are not silently resolved. |
| Costs | Total tuition/all citizenships reaches the BA answer; exact application fee, service-charge uncertainty and exemption reach institution notes and source details. A common direct projection of structured cost and payment schedule remains improvement work. |
| Application and documents | Correct direct form and 22 August 2027 deadline/actions are visible. The full checklist and undated reply/final-IB procedures need fuller shared answers; unspecified timing stays unknown. |
| Study experience, support and outcomes | Online/asynchronous/webinar description reaches the BA; detailed module structure, assessment, counselling, additional-needs support and progression data are not all projected into corresponding answers. |
| Images and responsive format | Separate critic's remit; this admissions review grants no pixel, crop, rights, phone or desktop acceptance. |
| Provenance/freshness | Source links, retrieval dates, current intake and conflict/non-human-verification labels are present. Evidence remains `needs-review`. |

Three changes would raise the overall standard most:

1. Resolve the online BA's IB Diploma/Course Results assessment, TOEFL discrepancy, final-IB delivery/reply timing and service-charge amount with responsible published guidance; keep scoped unknowns until it exists.
2. Complete the autumn 2027 portfolio: resolve the BSc's entry/checklist/application contradiction, BME's intake/partner costs and legacy Euro-Asia/AP language scope. Preserve historical dates as historical.
3. Extend common projections for structured costs/payment, documents, learning/support/progression and flexible duration; verify the same answers on the actual institution/programme and comparison/planning surfaces. No IBA-specific renderer is warranted.

These completion items retain the worker's **15 January 2027** recheck and deferred outcome. The actual raw records, row, report and corrected current-workspace HTML suffice for this bounded admissions acceptance. Clean-release gate, output-tree identity, discovery/map semantics, independent browser/phone/format review, commit, push and published CI verification remain the dispatcher's separate acceptance evidence. No claim about those outcomes is made here.

## Exact clean-output confirmation — 7 November

After the dispatcher identified accepted candidate tree `cbb6464ac5c2459ebf97c40c2bd977d51579c76d`, I read the actual clean output files under `D:/ibp-tmp/absalon-release-20261030/dist/`: `universities/dk-international-business-academy-iba/index.html`, `programmes/dk-international-business-academy-iba-business-management-online-2027-autumn/index.html` and the two IBA rows in `credits/index.html`. No build or output write was performed.

The exact student HTML retains Online attendance, the Leeds Beckett award and explained 3–6-year range; DKK 155,000 total for all citizenships; 22 August 2027 application/document/payment actions with no invented closing time; the specific `#ib` qualification question; visible TOEFL 79/19 versus 65 conflict; unresolved Course Results treatment; correct **“Requirements summary”** paraphrase label; partial-portfolio and final-IB questions; and responsible sources/freshness. No source-truth regression was found. Credits link the online BA and campus photographs to their exact IBA source pages and state linked, not copied usage. The campus row does not invent a photographer; the programme row names IBA as publisher/credit. Image/format acceptance remains separate.

I also read the actual tail of `D:/ibp-tmp/iba-gate-v2.log`: it ends **“All 43 checks pass”**, with freshness advisory only. The clean `data.json` identifies Autumn 2027 and generation at `2026-11-07T01:22:50.239Z`; its short `dataRevision` is `7cacfa7`, not a claim about the candidate tree or later published commit. Candidate-tree identity and publication remain dispatcher-owned evidence.

**The 8.3/10 safe-slice admissions/source acceptance applies to this inspected clean output. Full institution public parity remains 6.4/10 and deferred to 15 January 2027.** This confirmation is HTML/source review; it does not substitute for the separate twelve browser captures, human verification, commit/push or published CI checks.
