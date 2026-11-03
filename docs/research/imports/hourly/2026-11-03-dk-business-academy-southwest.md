# Business Academy SouthWest: existing SEA identity and autumn 2027 audit

Reserved unit `dk-business-academy-southwest`, run
`a0f89352-bbe2-4e3d-ae8e-f06f9864d34c`, started
`2026-11-03T17:03:44.642Z`. The original worker failed before writing.
This recovery handled that same unit only; it did not reserve another unit,
replace the lock or start another institution. Sources read **3 November 2026**.
Configured intake remains **autumn 2027**, for the May 2027 IB session.

**Disposition for the dispatcher: reconcile this lead to existing `dk-sea` and
accept the supported improvements for review, with a specific admissions
deferral/recheck on 15 January 2027.** There is no second institution or new
English first-year opportunity to publish. The current English first-year list
is the existing two AP degrees. Final-document timing conflicts and the fee
table's applicability to autumn 2027 remain unresolved; do not call this an
intake-complete admissions review or silently reject May-session IB applicants.

## Identity, recognition and bounded scope

The [live official alumni page](https://www.s-e-a.dk/alumne) identifies
Erhvervsakademi Sydvest as now SEA - Syddansk Erhvervsakademi. Its footer names
Esbjerg, Sønderborg and Tønder, with CVR 31689791. This confirms the alias
without a duplicate record. The [Agency's recognised business-academy list](https://ufsn.dk/english/education/the-higher-education-system/business-academies/)
still names EA Business Academy SouthWest and links `easv.dk`; its
[Danish list](https://ufsn.dk/uddannelse/de-videregaaende-uddannelsesinstitutioner/erhvervsakademier/)
likewise uses Erhvervsakademi SydVest. These responsible-authority entries
establish the business-academy sector and recognition context; the institution
establishes its current name. Neither list establishes a programme's language.

The indexed press release at
`https://www.s-e-a.dk/nyheder/nyhed-template-2` describes the name change, but
direct opening returned 404. It is **not** the evidence used for the alias and
no exact effective date or legal-merger claim was imported from that index.

Reused the canonical institution, both Programme IDs, both autumn 2027
Opportunities, the historical `data/dk/sea.json`, original evidence in
`data/evidence/dk-colleges.json`, `DK_COLLEGES_ADDED.md`, the national catalogue
comparison and cached `.cache/sid-index.json` (29 October discovery leads).
The comparison's `institution-name-not-matched` rows are matching gaps, not
new institutions. The dispatcher owns discovery/queue alias reconciliation.
No shared discovery, progress, state, schema or code file was edited here.

The [current English landing page](https://www.s-e-a.dk/international) lists
four programmes in Esbjerg. These resolve to:

| Existing first-year Programme | Credential / length / campus | Official programme |
|---|---|---|
| `dk-sea-computer-science-ap` | AP, short cycle, 2.5 years, Esbjerg, English, August | [Computer Science](https://www.s-e-a.dk/uddannelser/computer-science) |
| `dk-sea-multimedia-design-ap` | AP, short cycle, 2 years, Esbjerg, English, August | [Multimedia Design](https://www.s-e-a.dk/uddannelser/multimedia-design) |

[Software Development](https://www.s-e-a.dk/uddannelser/software-development)
requires the Computer Science AP; [Web Development](https://www.s-e-a.dk/uddannelser/web-development)
requires Multimedia Design or Computer Science, or an assessment based on
prior AP/diploma study. These are 1.5-year top-ups, not school-leaver entries.
They remain outside the first-year Opportunity set. The AP pages currently
display a 5 July **2027** quota 1 headline, with August study start and English
instruction; that headline does not replace the international-examination
March application deadline. Full-degree guidance and FAQ still carry an August
2026 start, so no precise 2027 start day was inferred.

## Information contract and improvements

The work follows ADR 0008, `PAGE_TEMPLATES.md`, the school briefs, parity
contract and trust governance. Existing common schemas and the three shared
templates are unchanged. All new evidence is attested and `needs-review`;
no human or independent verification was invented.

| Category | Supported result or explicit gap |
|---|---|
| Identity, city, campuses, character | Current SEA name and historic alias retained; Esbjerg is the English study location; Sønderborg and Tønder are named as other institutional campuses. Practical teaching, business projects and internships are described. No ranking/student-count claim was added. |
| First-year scope | Existing two English AP programmes retained, with unchanged IDs, credential, length and campus; top-ups excluded from first-year scope for their published prior-study requirements. |
| Curriculum and learning | Computer Science: programming, system development, technology and organisational theory, electives, fifth-semester internship and final project. Multimedia: digital content/interfaces, web/media production, business assignments, fourth-semester internship and final assignment. Description and structure fields enriched. |
| Entry award | Existing national Diploma / Course Results distinction retained. Course Results access remains the national AP rule: six subjects, at least three HL, grade 3 in each and total 18; it does not waive programme subjects. SEA-specific Course Results guidance remains unpublished on the pages read. |
| Subjects | Computer Science retains Maths B and English B. Multimedia retains English B plus Maths/Managerial Economics/Business Economics C; the separate Mathematics C wording conflict remains explicit. School-signed subject-hours forms are linked; the pages describe 250 hours for Maths B and 125 for C. Whether IB records replace the form needs confirmation. |
| Selection | Quota 1 ranks on the converted school average, described by SEA for EU/EEA citizens. Quota 2 considers documented qualifications and the motivation letter. Added common-schema non-mandatory Selection Factors so the shared programme pages actually explain this. Weights, capacity and historical cutoff are not inferred. Other applicant groups should confirm their quota route. |
| Language proof | English B is separate from proof. Existing `satisfiedBy: [ib-diploma]` retained; Course Results exemption remains an open question. Current institution pages list IELTS 6.5, TOEFL internet 94/paper 560, Cambridge Proficiency/Advanced, Oxford Placement B2 with 75 per part, or CEFR B2/C1; tests under two years. Sitting/scale acceptance should be confirmed. The promotion catalogue's older TOEFL 83 does not override the institution. |
| Application | Existing national route remains first and supplies its provisional March deadline. Added one scoped supplementary document route for these two Opportunities, with current transcript/final diploma, motivation form, relevant supporting documents, English proof, passport and signature instructions; no disputed date exported. Its scoped milestones replace unsupported inherited document, delivery and reply assumptions. NemStudie carries correspondence/offer acceptance. |
| Predicted/final IB timing | Current transcript requested before graduation; a separate predicted-grade form/deadline and automatic acceptance of final May-session IB results are not published. The guide directs later-diploma applicants to SEA. Obtain an individual final-results arrangement. |
| Fees | EU/EEA/Swiss tuition exemption recorded; residence-based exceptions for other students retained in notes. Non-EU rate category recorded without a confirmed autumn 2027 amount. Published instalments retained with exact period and ambiguity below. No fee, waiver or deposit inferred from exchange guidance. |
| Support / housing | Study counselling, IT, SU, internship and study-abroad support linked. Full-degree students find housing themselves; exchange housing arrangements and prices are not imported into full-degree advice. |

The main admissions source is the
[Incoming Full Degree Students guide](https://www.s-e-a.dk/international/incoming-full-degree-students).
Its EU and non-EU sections differ. The [FAQ](https://www.s-e-a.dk/international/faq)
adds an incompatible international-examination document date. Both readings are
recorded as mutually conflicting Evidence; no deadline is chosen silently.

## Document and fee conflicts requiring recheck

The guide's EU section allows enclosures until **5 July at noon**; its non-EU
section gives **1 May at noon**. Both tell applicants receiving diplomas later
to contact SEA. The FAQ instead gives **1 April** for applicants with an
international qualifying examination. These pages include 2026 material and
do not confirm these as 2027 cycle dates. No automatic refusal, automatic late
final-results acceptance or new confirmed document milestone follows from them.
No university contact was made. The existing national deadline remains
provisional as previously recorded.

The scoped SEA route supersedes four specific national milestones, without
editing shared national data: `ms-documents` becomes an undated final-document
arrangement; `ms-ibis` becomes an undated SEA-specific delivery/recipient
arrangement; `ms-results` retains the canonical IB-calendar release date with
a note that it proves neither SEA's deadline nor late-results permission;
`ms-reply` becomes the undated deadline in the individual admission letter.
The inherited 2 August reply date and codes for other institutions no longer
reach the SEA pages. A separate provisional 5 July milestone retains national
priority reordering and explicitly says it is not SEA's document deadline.
The FAQ makes the offer letter and nemStudie confirmation instructions
responsible for the reply action; it supplies no public 2027 reply date.

The guide links the institution's
[one-page tuition table](https://www.easv.dk/app/uploads/2023/12/Tuition-fees-2024-2027.pdf).
It was downloaded, rendered with Poppler and visually read. Its heading is
**2024/2027**, with AP amounts:

| Charge period | EUR | DKK |
|---|---:|---:|
| First semester, including registration | 7,500 | 56,250 |
| Second semester | 4,900 | 36,750 |
| Second year, semesters 3 and 4 together | 8,000 | 60,000 |
| Computer Science fifth semester | 2,000 | 15,000 |
| Retaking first year, separate contingency | 8,000 | 60,000 |

No registration component was invented, no year-two instalment was doubled,
and no annual average or programme total was entered. The table's continuing
application to **autumn 2027** is unclear. Confirm that before budgeting or
adding a numeric 2027 Opportunity fee. The Study in Denmark Computer Science
lead's EUR 3,900 per term is older promotional context, not current authority.

## Actual image review and reuse

Opened all three stored WebP files with the image viewer on 3 November; this
was a new pixel inspection, not reliance on existing approval metadata.

| Stored image | Pixel finding / decision | Rights source |
|---|---|---|
| `src/assets/img/places/sea.webp`, 1400×875 | Recognisable red Esbjerg building, trees and lawn, readable small former EA facade mark. A small yellow access lift, cars and rails are peripheral; the building dominates. The older review qualified these features as not forming a band or subject, which is fair; its separate opening “No photo currently” was stale. Retain the crop. Historical branding is consistent with the recorded former name. | [Commons file](https://commons.wikimedia.org/wiki/File:Erhvervsakademi_Sydvest,_Esbjerg.jpg), Kent Madsen, CC BY-SA 2.0. Commons API re-read confirmed 4000×3000 original, author, licence and Flickr source. |
| `src/assets/img/programmes/programme-dk-sea-computer-science-ap.webp`, 960×600 | Technician crouched at an open server rack with connected laptop; equipment and activity remain legible. An illustrative systems photograph at NERSC, not claimed as SEA students/facilities. Retain. | [Commons file](https://commons.wikimedia.org/wiki/File:Technician_with_laptop_working_on_server_rack_at_NERSC.jpg), Derrick Coetzee, CC0; current source page re-read, 4288×2848 original. |
| `src/assets/img/programmes/programme-dk-sea-multimedia-design-ap.webp`, 960×600 | Hands sketching paper web-interface wireframes on a table; the activity reads clearly and small sketch text is not relied on. Illustrative interaction-design work, not SEA campus documentary photography. Retain. | [Commons file](https://commons.wikimedia.org/wiki/File:Paper_prototype_of_website_user_interface,_2015-04-16.jpg), Sage Ross, CC BY-SA 4.0; current source page re-read, 4775×3182 original. |

The existing manifest attribution/licences, approval state and image files
were preserved; no image was newly approved or copied. The SEA entry alone in
`data/images.json` has a corrected `review.note`: its stale opening “No photo
currently” was a demonstrated error. The replacement names this automated
pixel recheck and describes the peripheral cars/access lift/rails accurately;
it does not claim human verification. Existing suitable openly licensed assets
made replacement/source-ladder escalation unnecessary. Original rights pages
for the two subject photos were accessible through the web tool; the campus
file page needed the Commons API fallback. No designed fallback or unlicensed
image was introduced. Phone/desktop page screenshots are the dispatcher's
independent acceptance step, not a claim made by this pixel review.

Campus licence capture: `D:/ibp-tmp/sea-campus-commons-20261103.json`, HTTP 200,
re-read 3 November 2026, from
`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=size%7Cextmetadata&titles=File%3AErhvervsakademi%20Sydvest%2C%20Esbjerg.jpg`.
Page ID 154832627 gives 4000×3000, Artist Kent Madsen, CC BY-SA 2.0 and
Flickr origin `https://www.flickr.com/photos/designermadsen/53719818628/`.
The existing manifest's original retrieval date remains 24 September 2026;
today's rights check does not silently replace that history.

## Files, validation and projection limits

Changed only this institution's runtime data:

- `data/institutions/dk-sea.json`
- `data/programmes/dk-sea-computer-science-ap.json`
- `data/programmes/dk-sea-multimedia-design-ap.json`
- `data/opportunities/dk-sea-computer-science-ap-2027-autumn.json`
- `data/opportunities/dk-sea-multimedia-design-ap-2027-autumn.json`
- New `data/application-routes/dk-sea-international-documents-2027.json`
- New `data/evidence/dk-sea-20261103.json` (eight Evidence records)
- `data/images.json`: only `sea.review.note`, correcting the stale no-photo claim
- This hourly report.

Original evidence history, historical `data/dk/sea.json`, accepted image assets,
country records, discovery/queue/state, shared code, schema and templates were
not rewritten. Review date is 15 January 2027, before February applications.

Focused check `node D:/ibp-tmp/sea-focused-check.mjs` passed: **14 scoped
records** validate against existing schemas; scoped Evidence and conflict
references resolve; two existing English Opportunities retained; national
route remains first; no Course Results English exemption introduced. It loaded
the normal adapter and rendered three pages using the existing shared
templates into `D:/ibp-tmp/sea-focused/`. The institution HTML contains the
fee-period caveat, document conflict and qualification distinction; both
programme HTML outputs contain the new projected Selection Factors and
English subject requirement. No default `dist`, full gate, Git, external
message, contact, agreement or unrelated Downloads operation was used.

The final focused pass also inspected actual `datesFor` results and the three
rendered HTML strings. Neither the institution nor programme outputs contain
the unsupported 2 August reply, the generic assertion that results-service
delivery settles the document deadline, or other institutions' IB codes.
The scoped undated document, delivery and reply events are present in
`datesFor`. This corrected a real inherited-advice risk identified in the
independent review; the national March route remains first.

Temporary exact source captures for review are
`D:/ibp-tmp/sea-computer-science.html`, `sea-multimedia-design.html`,
`sea-incoming.html`, `sea-faq.html`; fee PDF and rendered PNG are
`D:/ibp-tmp/sea-tuition-2024-2027.pdf` and `.png`. The web tool timed out on
programme/guide/FAQ requests; narrow PowerShell GETs returned HTTP 200 and the
HTML was read directly. This is an access-method caveat, not unavailable
evidence. The exact extracted claims and their sources are retained in the new
Evidence file so review does not depend on temporary paths.

**Projection gaps stay open.** Issue #71 tracks
`Programme.description`, `Programme.structure` and typed `Institution.support`
not yet reaching their relevant shared pages. `admission.selection` alone also does not project; this pass
used the existing non-mandatory Requirement representation to make Selection
Factors visible without a private template. Typed support fields, detailed
supplementary submission items and full cost arrays are not all projected onto
the current programme page. Institution notes carry the consequential
fee/document/qualification caveats, with official sources also in the
programme evidence drawers. `Institution.places` remains the existing mapped
English-study location Esbjerg; other campuses are stated in the portrait and
notes, while an expanded mapped campus list needs normal place records.
Do not claim that all typed facts render, that desktop/phone parity is proven,
or that data completeness can be inferred from schema success. Undated
milestones supersede the unsafe generic dated events but are omitted by the
current shared date panel; the visible institution notes explicitly retain
the document conflict, unknown reply date and required delivery arrangement.
No new
unrepresentable sourced fact required a schema extension here.

Outstanding recheck: resolve international document dates and final IB
delivery for both applicant groups; confirm the Course Results language-test
exemption, relevant IB subject-hours documentation, current test sittings,
autumn 2027 fee schedule and published quota 2 criteria/capacity/cutoff when
available. Recheck 15 January 2027, or earlier on an official change. Current
scope and supported improvements are review-ready; these specific intake
questions remain deferred.

## Coordinator acceptance and clean release

The original worker stopped for workspace credits before writing research. Later
ticks preserved the exact original reservation; a fresh recovery worker resumed
this same institution. There was no second university or lock takeover.

The [independent admissions/image/shared-format review](../../qa/hourly-universities/dk-business-academy-southwest-round-1.md)
first rejected inherited national-route advice: a hard provisional 2 August
reply, other universities' IB recipient codes, and an implication that the
results service settled SEA's document conflict. The final scoped milestones
supersede those assumptions; undated arrangements remain explicit and the
national route's supported annual application dates are retained. The shared
IB-calendar guard also required the referenced inferred 2027 results day to
keep its provisional flag; that correction passed the focused IB guard.

Actual image review additionally exposed a Computer Science hero alt containing
the CC0 waiver instead of the scene. The coordinator changed only
`data/programme-images.json` entry `programme-dk-sea-computer-science-ap.description`
to an explicitly illustrative NERSC technician/server-rack description, retaining
the asset, source, author and rights metadata. The campus metadata correction
above also preserves the original approval and distinguishes automated recheck
from human verification.

All twelve final screenshots in
`docs/research/qa/hourly-universities/dk-business-academy-southwest-shots/`
were independently opened: university and both AP pages, desktop/phone and
light/dark, with full date disclosures expanded. Final safe-slice scores are
**admissions 8.5, imagery 8, shared format 8**. The rejected findings and final
rechecks remain in the review. No further runtime blocker was found; the
January intake recheck and common projection gaps stay open.

Official identity evidence also exposed an internal workflow gap: a published
legacy-name audit could otherwise immediately schedule existing `dk-sea` again.
The dispatcher recorded the generic `resolved_institution_key` reference on the
existing discovery row and added common alias-aware selection. Only confirmed
same-country, known, non-alias references are accepted; possible matches do not
suppress work. Current identity geography and the latest outcome across names
govern rechecks, while original ledger/run/lock history is preserved. A separate
[maintainer review](../../qa/hourly-universities/dk-business-academy-southwest-selector-round-1.md)
accepted this at **9.5/10**. Focused regressions cover original reservation
ownership, future deferral, due current-key rechecks, outcome precedence,
geography and invalid mappings, plus existing finish/reservation races. This is
internal queue metadata; public institution/programme schemas and templates
remain shared.

The final clean local release snapshot, on main base
`c68a554c9f4afce00b9e49c57ce170c6b5fd519c` at
`D:/ibp-tmp/absalon-release-20261030`, passed **all 43 checks** with
`SITE_BASE=/IB-Post-Secondary-Opportunities` on tree
`a39a82603d3f6395458c0a17aabb56f11b8147b0`. Only the final completed gate is
claimed; earlier incomplete runs were stopped while correcting the demonstrated
alt/calendar findings. Existing freshness advisory remains. Subsequent
acceptance/checkpoint/screenshot additions are documentation only. The Denmark
handoff reports 31/57 rendered detail paths, 48/57 own programme photographs
and 14/15 institution photographs, without claiming national completeness.

The common [projection follow-up #71](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/issues/71)
now explicitly includes typed university support as well as programme detail.
Missing typed projections, cost/submission detail and undated event disclosure
remain completion work under ADR 0008; the safe publication is not full intake
or information-parity completion. Exact publication/Pages/deferral are recorded
after deployment verification.

The final degree-metadata check confirmed sourced AP awards and 2.5-/2-year
lengths, but no total ECTS in the reviewed programme records or exact cached
official programme HTML. ECTS remains an explicit additional recheck gap; no
150/120-credit value was inferred from duration. The independent admissions
critic retained the bounded 8.5 acceptance with this gap stated.
