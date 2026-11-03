# SEA / former Business Academy SouthWest — independent round 1

Reviewer: independent admissions counsellor, photo editor and shared-information-format/art-direction critic. Reviewed 3 November 2026. Reservation: `dk-business-academy-southwest`, run `a0f89352-bbe2-4e3d-ae8e-f06f9864d34c`; existing canonical institution `dk-sea`.

## Current final decision — safe improvements accepted; unit deferred

**Final scores: admissions 8.5/10, imagery 8.0/10, shared format/art direction 8.0/10. Accepted for scoped publication after reviewing the final worker report, corrected runtime and all twelve clean-build desktop/phone light/dark screenshots.** The dispatcher reports all 43 release checks passing for final Pages-base tree `a39a82603d3f6395458c0a17aabb56f11b8147b0`.

The university work unit remains **deferred to 15 January 2027** for official document/final-IB arrangements, fee confirmation and issue 71 shared information-projection gaps. These scores accept the safe improvements; they do not certify complete admissions research or complete information parity. Publication and CI verification belong to the dispatcher. The initial rejection and pre-screenshot checkpoints below are retained as historical review evidence; the final decision and screenshot inventory are recorded at the end.

## Historical initial checkpoint — acceptance was withheld

At the initial checkpoint, the recovery worker was finishing and the final worker report and clean-build screenshots had not yet been reviewed. The inherited route assigned an unsupported SEA reply date. One wrong deadline failed the admissions round, producing the historical 6/10 score below. That blocker was corrected and independently rechecked before the current final acceptance.

## Artifacts actually inspected

- `data/institutions/dk-sea.json`.
- `data/programmes/dk-sea-computer-science-ap.json` and `dk-sea-multimedia-design-ap.json`.
- Both corresponding `2027-autumn` Opportunity records.
- `data/application-routes/dk-sea-international-documents-2027.json`, inherited `dk-optagelse-international-2027.json`, and `data/evidence/dk-sea-20261103.json`.
- `data/images.json` entry `sea`, both SEA entries in `data/programme-images.json`, and the three actual WebP files listed below.
- Shared adapters/templates and an in-memory `load()` + `datesFor(site, SEA)` projection. No build, gate, Git mutation, runtime edit, queue/state change or unrelated file write was performed by this reviewer.

Contract: `docs/QA_CRITIC_LOOP.md`, `docs/HOURLY_UNIVERSITY_WORKFLOW.md`, ADR 0008, `docs/PAGE_TEMPLATES.md` and `docs/research/schools/PARITY.md`.

## Independent official-source sample

Read existing canonical evidence and the relevant existing manifests first. Narrow live reads on 3 November 2026 then checked:

- [SEA alumni identity](https://www.s-e-a.dk/alumne): direct Python HTTP read succeeded; the page explicitly identifies Erhvervsakademi Sydvest as now SEA. The footer includes the Esbjerg address and other locations. Browser retrieval timed out; that failure is not described as a successful browser capture. The old rename-news URL was not used as fresh evidence.
- [Computer Science](https://www.s-e-a.dk/uddannelser/computer-science) and [Multimedia Design](https://www.s-e-a.dk/uddannelser/multimedia-design): direct Python reads succeeded. Both say English, Esbjerg and August, AP degrees of 2.5 and 2 years. Their international deadline is 15 March at noon, distinct from the 5 July 2027 quota 1 headline. Both separately require Danish English B and publish an IB-exam exemption from the English test. Course Results are not expressly covered by that exemption. Computing requires Maths B; Multimedia's main admission text permits Maths/Managerial Economics/Business Economics C, while its separate mathematics heading singles out Maths C. The record preserves that source nuance.
- [Incoming full-degree guidance](https://www.s-e-a.dk/international/incoming-full-degree-students): browser read succeeded. The guide permits a transcript before graduation, lists EU 5 July / non-EU 1 May enclosure dates, asks students with later diplomas to contact SEA, and links a tariff labelled 2024–2027. EU/EEA/Swiss and specified residence-permit exemptions are supported. It does not establish an autumn 2027 fee for a new starter.
- [SEA FAQ](https://www.s-e-a.dk/international/faq): direct Python read succeeded after browser timeout. It gives 1 April for international-exam summer enclosures and retains a 26 August 2026 start. This conflicts with the guide's group-specific document dates. No specific 2027 final-IB permission, predicted-grade deadline or confirmed reply date can be derived. Housing help is limited to Erasmus/exchange students.
- [Agency IB entry guidance](https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/optagelse-af-ib-elever/): browser read independently supports the national AP Course Results rule: at least 18 points, all six subjects at least 3, at least three HL. This establishes the qualifying award, not a SEA English-test waiver or automatic satisfaction of subjects.

These are independent samples, not a claim to have freshly re-read every cited source or visually re-read the fee PDF. No contact, agreement or human verification occurred. Existing old evidence retrieval dates remain old; today's sample does not silently refresh them.

## Historical initial admissions blocker found in actual projection

The in-memory dates list at initial review includes inherited `ms-reply`, `2027-08-02`, consequence `hard`, with an earliest-known date based on other universities. SEA has not published that deadline in the sampled sources. It also includes `ms-ibis` with other universities' IB codes and `ms-results` saying “After the Danish documentation deadline, which is why the results service exists.” The SEA supplement initially has only documents/steps and does not supersede these milestones. This could imply that generic authorisation settles SEA's unresolved final-results arrangement.

Required correction before accepting even the safe slice: use an existing shared route representation scoped to SEA to remove the unsupported reply date and other-university codes, and preserve the explicit unresolved SEA document/final-results question. Do not choose 1 April, 1 May or 5 July as a confirmed 2027 SEA document cutoff. Do not invent a reply date or turn the uncertainty into rejection.

## Historical initial image review performed on actual pixels

The findings and pending items in this section describe the initial checkpoint. The corrected metadata, campus API evidence and final screenshot inspection are recorded in the later recheck and final-acceptance sections.

- `src/assets/img/places/sea.webp`: red Esbjerg campus under leafy branches, clear blue sky, broad lawn and path. Attractive real-place image with a strong identifiable building. Small parked cars at the far left, railings and a yellow access lift at the right are peripheral; the EA facade mark is incidental. They are not the photographic subject. The old `sea.review.note` starts “No photo currently.” and should be corrected to describe this actual image; its peripheral features should be acknowledged. Manifest source: [Commons campus photo](https://commons.wikimedia.org/wiki/File:Erhvervsakademi_Sydvest,_Esbjerg.jpg), Kent Madsen, CC BY-SA 2.0. Independent current licence read remains pending after tool fetch failure; do not claim a live licence confirmation yet.
- `src/assets/img/programmes/programme-dk-sea-computer-science-ap.webp`: plaid-shirted technician with a laptop at an open server rack. Clearly legible practical computing activity, though it suggests infrastructure more than software development. Illustrative NERSC scene; it is not SEA campus/student evidence. [Commons source](https://commons.wikimedia.org/wiki/File:Technician_with_laptop_working_on_server_rack_at_NERSC.jpg) independently read on 3 November: Derrick Coetzee, CC0, matching the manifest.
- `src/assets/img/programmes/programme-dk-sea-multimedia-design-ap.webp`: warm wooden desk, hands and paper website interface sketches. Clear and relevant design process, with shallow depth of field and no distracting text or logo. Illustrative WINTR/wikiedu.org prototyping scene; it is not SEA students. [Commons source](https://commons.wikimedia.org/wiki/File:Paper_prototype_of_website_user_interface,_2015-04-16.jpg) independently read on 3 November: Sage Ross, CC BY-SA 4.0, matching the manifest.

Existing files resolve locally. An in-memory call of the actual shared `university()` and `programme()` adapters confirms the university HTML references the campus image and both programme images, and each programme references its own picture and the sibling's. Both programme pages contain the document-conflict and historically scoped tariff evidence. Final browser image loading, attribution and crops await the clean-build screenshots. No new asset is proposed or required by this review.

## Shared-information contract

The common adapter uses programme `summary` and credentials in its visible “What it is” projection, but does not visibly project the new canonical `description`/`structure` teaching, placement and study-abroad fields. Institution `support` fields likewise do not become a dedicated visible support answer in the inspected adapter. This is the existing shared information gap tracked by issue 71, not authorization for SEA-specific fields, pages or template branches.

Keep the source and projection gaps distinct. Stored curriculum/support evidence and a passing shared-shell/schema check do not establish complete information parity under ADR 0008. A deferred outcome may publish safe supported improvements while these gaps remain open.

## Historical scores at provisional checkpoint

| Role | Score | Status and reason |
|---|---:|---|
| Admissions | 6/10 | Rejected pending removal of unsupported inherited 2 August reply date and generic late-results implication. Core programme/subject/document-conflict research is careful. |
| Imagery | Pending | Actual pixels are suitable for retained use; final licence sample, on-page crops, attribution and resolution still pending. |
| Shared format / art direction | Pending | Common adapters inspected; actual clean-build desktop/phone screenshots outstanding. Complete information coverage remains deferred under issue 71. |

Most valuable changes: correct the SEA route projection; show the consequential final-results/fee unknowns in the relevant shared surface; retain explicit description/structure/support projection work and 15 January 2027 recheck rather than declaring whole-university completion.

## Historical corrected-runtime recheck — screenshots were still pending

This recheck occurred after the runtime correction and before final screenshot delivery. Its pending statements were resolved by the final independent acceptance below.

The recovery worker's final report at `docs/research/imports/hourly/2026-11-03-dk-business-academy-southwest.md` has now been read. It explicitly proposes safe improvements with a deferred 15 January 2027 recheck and records the common projection limitations; it does not claim intake completion.

Independently reran in-memory `load()` + `datesFor()` and rendered the actual shared university and both programme adapters after the route correction:

- The unsupported 2 August date, other universities' IB codes and generic results-service assurance are absent from all three HTML outputs.
- SEA's undated document arrangement, delivery arrangement and offer-letter reply milestones supersede the corresponding national milestones. The remaining 5 July event is priority ordering only, with an explicit statement that it is not SEA's document deadline. The 6 July IB-calendar fact explicitly does not grant late-document permission.
- The university's actual HTML includes the unknown public reply date and required delivery arrangement in its notes. Both programme pages retain the document conflict in their evidence and the release-date caveat. The undated milestones themselves are not shown by the current dates panel; this shared projection limitation is stated in the worker report and remains a completion gap.
- Both programme pages include the new Selection Factors through the existing non-mandatory Requirement representation, without a special template. The national route remains first and unmodified.

The worker corrected only `data/images.json` → `sea.review.note`, removing the stale no-photo statement and acknowledging peripheral cars/access lift/rails. The original wording qualified its exclusions as “as a band or the subject”; the criticism is not that it asserted a completely featureless frame.

Campus rights fallback evidence is now available and was inspected: `D:/ibp-tmp/sea-campus-commons-20261103.json`, a current worker-captured Commons API response for page 154832627. It identifies the 4000×3000 original, Kent Madsen, CC BY-SA 2.0 and the Flickr source. This supports retained rights alongside the manifest's original 24 September 2026 retrieval. Reviewer file-page attempts failed; this is review of the actual current API capture, not a claim of a successful independent file-page read. The exact API URL is retained in the worker report.

The admissions blocker above is corrected. Final acceptance scores remain pending the promised clean-build screenshots; whole-university completion remains deferred because the official 2027 document/fee questions and shared information gaps remain open.

An additional actual-HTML accessibility defect was found: the Computer Science image's manifest description was a CC0 waiver, so the hero used licence boilerplate as its alt text. The dispatcher corrected only `data/programme-images.json` → `programme-dk-sea-computer-science-ap.description` to describe the illustrative NERSC technician scene. A new in-memory programme render independently confirms the scene description is now the hero alt; author, source, licence and approval metadata remain intact. The dispatcher restarted the clean snapshot to include this correction rather than reusing a pre-fix build.

The dispatcher also reported a calendar-consistency check finding: the scoped 6 July IB event needed `provisional: true`, because the shared `2027-05/results-day` calendar basis is inferred from precedent. The flag was added with the canonical pointer and no-late-permission caveat retained. The dispatcher owns the full gate; this report does not claim that gate passed until actual final results are supplied.

## Final independent acceptance — safe improvements only

**Accepted for scoped publication; the university work unit remains deferred to 15 January 2027.** The corrected data and retained imagery are safe improvements. This acceptance does not certify complete admissions research or complete shared information parity.

The dispatcher supplied final clean Pages-base tree `a39a82603d3f6395458c0a17aabb56f11b8147b0` and reported all 43 release checks passing, with only the existing freshness advisory. That validation was run by the dispatcher, not by this reviewer. The twelve screenshots below were actually opened and visually inspected after the final route, alt-text and provisional-calendar corrections. These are 1280-pixel desktop and 390-pixel phone captures, in both themes, with the all-dates disclosure expanded. No runtime edits followed that snapshot according to the dispatcher's handoff.

All files are in `docs/research/qa/hourly-universities/dk-business-academy-southwest-shots/`:

| Page | Desktop light | Desktop dark | Phone light | Phone dark |
|---|---|---|---|---|
| SEA | [View](dk-business-academy-southwest-shots/universities__dk-sea--desktop-light.jpg) | [View](dk-business-academy-southwest-shots/universities__dk-sea--desktop-dark.jpg) | [View](dk-business-academy-southwest-shots/universities__dk-sea--phone-light.jpg) | [View](dk-business-academy-southwest-shots/universities__dk-sea--phone-dark.jpg) |
| Computer Science | [View](dk-business-academy-southwest-shots/programmes__dk-sea-computer-science-ap-2027-autumn--desktop-light.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-computer-science-ap-2027-autumn--desktop-dark.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-computer-science-ap-2027-autumn--phone-light.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-computer-science-ap-2027-autumn--phone-dark.jpg) |
| Multimedia Design | [View](dk-business-academy-southwest-shots/programmes__dk-sea-multimedia-design-ap-2027-autumn--desktop-light.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-multimedia-design-ap-2027-autumn--desktop-dark.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-multimedia-design-ap-2027-autumn--phone-light.jpg) | [View](dk-business-academy-southwest-shots/programmes__dk-sea-multimedia-design-ap-2027-autumn--phone-dark.jpg) |

| Role | Final score | Reason |
|---|---:|---|
| Admissions counsellor | **8.5/10** | Would repeat the supported AP scope, requirements, qualification distinction and uncertainty to a student. The wrong inherited reply date is removed. Screenshots show March application timing, July priority ordering and a separately qualified provisional IB release; no disputed document date is promoted to a confirmed deadline. English B and the Course Results test-waiver question remain distinct and readable. Fee numbers remain historically scoped. Official 2027 document/late-final-results and fee confirmation are still deferred. |
| Photo editor | **8.0/10** | All three real images load in their shared heroes/cards, with visible linked author/licence credits. Campus makes a concrete, attractive place; paper prototyping makes the design subject visible. The technician is relevant and legible, with corrected illustrative alt text, though it depicts infrastructure rather than the core programming focus and its desktop hero crop is tight. Retained photos are suitable; the subject scenes are not presented as documentary SEA student photographs. |
| Shared format / art direction | **8.0/10** | Photographs and two concrete possibilities lead. Phone type, cards, subject alternatives, evidence warning, official handoff and dates wrap without horizontal content loss; light/dark hierarchy is consistent. Expanded dates show no 2 August reply. Sources and long requirements remain one tap down. This score accepts the safe visible slice, not completeness: curriculum/structure, typed support, detailed document items/costs and undated actions still lack their full shared projection under issue 71. |

The three changes with the most value in a future pass are: (1) resolve SEA's official 2027 document/final-IB delivery and fee scope at the dated recheck; (2) deliver the already-recorded curriculum, placement, support, document and cost facts through the common adapters/templates tracked by issue 71, including visible undated next actions; (3) when suitable licensed material is available, consider a more software-focused Computer Science photograph. These are retained completion work, not new institution-specific schema/layout requirements or reasons to invent facts today.

No further acceptance blocker was found in the final safe slice. Keep the original rejected checkpoint above as the actual round history. Publish with a **deferred** ledger outcome and the specific recheck reason; do not use these scores or the passing gate to mark the institution intake-complete. Publication/CI verification and any machine-readable acceptance record are the dispatcher's responsibility.

### Final degree-metadata clarification

ECTS was not established in this review. The two canonical programme records and the exact cached official programme HTML (`D:/ibp-tmp/sea-computer-science.html` and `D:/ibp-tmp/sea-multimedia-design.html`) contain no ECTS field/word. The reviewed sources support AP credentials and durations of 2.5 years for Computer Science and 2 years for Multimedia Design. Do not derive 150/120 ECTS from those durations or another academy's record. Add sourced ECTS confirmation to the degree-metadata recheck gaps; no ECTS value was added or accepted in runtime data. The stated **8.5/10 admissions acceptance of the bounded safe slice still holds**, with this explicit additional gap and the deferred completion outcome unchanged.
