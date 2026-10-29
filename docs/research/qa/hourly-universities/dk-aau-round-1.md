# AAU independent acceptance — round 1

Reviewed 29 October 2026 by a separate admissions counsellor / photo editor / format reviewer. Scope: existing `dk-aau`, four English first-year bachelor programmes and autumn-2027 opportunities, new evidence and sessions, and their actual images. Read the worker report, canonical diffs and shared projection code; independently opened the responsible live AAU pages and actual local pixels. No canonical writes, build or verification-state promotion by this reviewer.

**Final current-state scores: admissions 8/10; imagery 8/10; standardized format 8/10. Accepted as current published guidance with explicit future rechecks. This does not mean AAU has published a complete 2027 admissions package.**

## Failures found and corrected during review

- Admissions initially scored **6/10**: `load()` + `datesFor()` actually gave AAU the shared **2 August 2027** accept-place deadline, while AAU's IB guide says **5 August**. The coordinator added the existing-pattern institution-scoped `ms-aau-reply`, superseding the shared milestone. I rechecked actual panel HTML: 5 August is present, 2 August absent, annual-rule caveat present. All four programme projections now agree. A fresh two-load counterfactual, removing only this milestone in memory, changes only AAU among all 15 Danish institution date projections. The milestone remains provisional and `yearUnpublished`; it does not falsely certify a 2027-dated announcement.
- Imagery initially scored **7/10**: official Chemical Engineering `img_5599.jpg` has a large foreground railing, matching the reason AAU's older summerlake picture was rejected. The worker rejected this candidate. Its existing approved Vigreux-column programme backdrop still resolves for the degree hero/card; the rejected official candidate no longer enters the university gallery. The worker also scoped the already inspected official business group photograph to the business programme, replacing the generic Canary Wharf backdrop without changing a template.

## Admissions evidence and limits

The [AAU IB guide](https://www.en.aau.dk/education/apply/bachelor/international-baccalaureate-ib) confirms March application/signature timing, July documentation and results-service handling, offer/reply timing, four English programmes, and the fee-paying/current-IB-year restriction. The canonical caveat correctly asks about **actual tuition exemption**: non-EU citizenship alone does not establish that an applicant pays. A May-2027 tuition-paying IB candidate cannot plan same-year admission under AAU's current rule because final documents are required on 1 May. Diploma and conditional Course Results routes remain distinct; the unchanged national supplementation detail is not presented as an unconditional Course Results admission route.

Independently read all four responsible programme pages: [Applied Industrial Electronics](https://www.en.aau.dk/education/bachelor/applied-industrial-electronics), [Chemical Engineering and Biotechnology](https://www.en.aau.dk/education/bachelor/chemicalengineering-biotechnology), [Economics and Business Administration](https://www.en.aau.dk/education/bachelor/economics-and-business-administration), [Energy Engineering](https://www.en.aau.dk/education/bachelor/energy-engineering). The three Esbjerg engineering degrees and Aalborg business degree, English instruction, three-year qualifications, subject alternatives and selection descriptions agree. AIE's 2027 restriction is explicit. The Chemical 24/25-place conflict is preserved; 2026 cutoffs are historical. Energy's current quota-2 allocation is published.

[Finance and fees](https://www.en.aau.dk/education/apply/bachelor/finance-and-fees) supports the exemptions, EUR 150 application fee and explicitly 2026 two-semester tuition rates; no 2027 rate was invented. [Student figures](https://www.en.aau.dk/about-aau/key-figures/students) support 17,195 ordinary full-time students; [PBL guidance](https://www.en.aau.dk/education/why-study-at-aau/problem-based-learning) supports the softened study-method account.

The [open-day hub](https://www.aau.dk/uddannelser/moed-aau/abent-hus) explicitly dates Esbjerg to 25 February 2027 and Aalborg to 4 March 2027. [Aalborg detail](https://www.aau.dk/uddannelser/moed-aau/abent-hus/aalborg) supports the stated hours. Session records correctly avoid borrowing old Esbjerg hours or treating the old detailed programmes as 2027. Engineering/business campus scope is correct.

## Actual image review

Used `view_image` on all five fetched official 480×300 files under `D:/ibp-tmp/dk-aau/`, plus local AAU summerlake/Copenhagen images and the four initially resolved discipline backdrops under `src/assets/img/`. This was pixel inspection, not approval by metadata. Independently fetched all five official source pages: HTTP 200 and each image base URL present.

- Institution: bright, spacious official atrium is suitable. Rejected summerlake remains rejected. Copenhagen waterfront stays a separately attributed gallery image, not a substitute for the programmes' Aalborg/Esbjerg campus.
- AIE: oscilloscope backdrop clearly conveys measurement; official project-work photo is usable gallery material.
- Chemical: glass distillation equipment is relevant and legible; walkway candidate is rejected.
- Business: official student discussion photograph is warm and readable, and now resolves as its programme backdrop.
- Energy: turbine close-up clearly conveys the field; official laboratory photograph is suitable supplementary material.

Existing Commons author/licence credits remain attached (oscilloscope Peter Seligman / CC BY-SA 4.0; Vigreux Lazar.zenit / CC BY-SA 4.0; turbine Σ64 / CC BY 4.0). The turbine's Japanese provenance is not relabelled as AAU. Official photographs retain their recorded externally linked institution-share usage basis; this review grants no new licence or human sign-off.

## Format and follow-up

The records use existing institution/programme/opportunity/evidence/session structures, existing subject scales, applicant-scoped `openFor`, selection requirements and shared templates. No AAU-specific template branch was introduced. Actual in-memory projections establish the deadline correction and correct programme-image resolution. This is a data/standardized-format acceptance, not a new desktop/phone art-direction screenshot review; the coordinator retains release/render verification.

**No unresolved actionable blocker remains in this reviewed AAU unit.** Genuinely unpublished or unfinished source material remains scheduled for **15 January 2027**: 2027 tuition and cohort capacities; AIE quota split/detailed ranking; full intake-dated admissions calendar; final campus open-day schedules, language and registration. These are honest publication deferrals, not reasons to withhold the current useful record. New evidence remains `needs-review` with automated source-reading attestation; no human verification is asserted.

## Release cleanup recheck

Independently rechecked the removal of the duplicate legacy Business official-image entry. Actual shared programme-page HTML and programme-card HTML still contain the exact approved `https://www.aaudxp-cms.aau.dk/media/fktn4inj/ebm_aau-36.jpg` asset through the programme-scoped backdrop. Its source page, automated approval, 1920×1080 dimensions, 268,433-byte size and linked-only usage basis remain recorded. The old `picture()` lookup is now empty for Business, which does not remove its hero/card image because those use the programme backdrop. Image acceptance remains 8/10.

All four rendered programme pages still contain the same current-year tuition-paying restriction, 1 May document deadline and residence-exemption caveat. The proposed editorial change from “late IB results retrieved online” to “AAU accesses late IB results online” preserves the admissions meaning and is acceptable. At this recheck, however, the canonical IB evidence excerpt and all four in-memory page renders still contain the former wording; the coordinator was informed to verify that release-gate cleanup actually lands. No new image, date, admissions or human-verification claim is approved by this cleanup note.
