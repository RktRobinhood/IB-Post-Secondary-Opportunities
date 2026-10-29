# Absalon hourly university report — 30 October 2026

Reservation: `30e7b8c1-aa50-40a6-8970-73c61c105394`. Institution: `dk-absalon`. Destination: Denmark. Intake: autumn 2027. Worker: Codex Absalon hourly worker. Canonical records only; no university-specific template or schema change.

## Outcome for independent acceptance

**Safe current-source improvements are ready for separate acceptance. The institution-photo gap is resolved. Full 2027 completion remains deferred to 15 January 2027**, because the published annual calendar and fee table are not explicitly dated for 2027, the same-year non-EU final-IB process is unclear, and Robot Systems' fee table puts its low-fee semester in a different semester from its internship. Do not describe the unresolved details as confirmed 2027 rules.

No Git commands, full release gate, default dist build, hourly state/progress edit, university contact, agreement or unrelated Downloads ingestion was performed by this worker. The coordinator owns country parity, independent acceptance, release and reservation closure.

## Exact changed paths

- `data/institutions/dk-absalon.json`: refreshed sourced campus character and notes covering admissions, language, documents, fee groups and unresolved issues; review date added.
- `data/opportunities/dk-absalon-biotechnology-beng-2027-autumn.json`: current admission references, visible selection factors, English-test guidance, applicant-group fees with honest undated pricing, and scoped supplementary route.
- `data/opportunities/dk-absalon-robot-systems-beng-2027-autumn.json`: replaced unfinished-criteria guidance with current quota selection and quota-1-only Danish GPA floor; other scoped updates as above.
- `data/application-routes/dk-absalon-engineering-international-2027.json`: new route supplement, applying only to the two Absalon engineering Opportunities; document milestones and individual reply instructions supersede the national generic entries on Absalon pages.
- `data/evidence/dk-absalon-hourly-20261030.json`: nine current evidence items, all honestly self-attested and `needs-review`; prior evidence history is preserved in `dk-colleges.json`.
- `data/official-images.json`: only the `absalon` entry added; official linked Kalundborg campus photograph with actual pixel review.
- `docs/research/imports/hourly/2026-10-30-dk-absalon.md`: this report.

Unchanged: legacy `data/dk/absalon.json`, programme identity/credential files, shared templates, schemas, the rejected older Commons image record, degree-image records/assets, national route, central progress and reservation ledger.

## Identity, recognition and bounded programme completeness

The existing canonical institution is the correct identity: University College Absalon / Professionshøjskolen Absalon. The accreditation authority identifies its former name, University College Sjælland, and records positive institutional accreditation on 3 June 2021. No duplicate institution or school JSON was added.

Existing aggregate sources were used first: `docs/CENTRAL_SOURCE_PROGRESS.json`, `docs/research/DK_AUDIT_NATIONAL.md`, and `docs/research/DENMARK_CATALOGUE_COMPARISON.json`. The exact Study in Denmark Biotechnology row is `eb964190758740f48af7ace713ce6c92`, campus slug `kalundborg`. The Education row `90fc87349e304b7992fdfa5b92c4c3b7` is in Vordingborg and is not an exact eligible programme match. The cached national comparison marks Robot Systems as curated-only; this is not a rejection, since Absalon's own page explicitly announces its September 2027 first intake. No broad provider survey was repeated. A metadata scan found no relevant Absalon entry in `.cache/sources`.

The official full-degree handoff lists three fully or partly English offerings. Both fully English engineering degrees are already represented: Biotechnology BEng, 3.5 years / 210 ECTS under its existing 2025 study-programme evidence; Robot Systems BEng, seven semesters / 3.5 years, September 2027 first intake. Both have official programme/admissions links, engineering field, descriptions, campus and selection. Education begins in English but is partly Danish, requires Danish during study, and is in Vordingborg; the established fully English degree scope excludes it. Exchange biotechnology is not a first-year full degree. Kalundborg is the study place of both represented degrees, rather than Absalon's other campuses or administrative location.

## Consequential rules and what now renders

- The existing national distinction remains: an IB Diploma is different from DP Course Results; Course Results need at least 18 points, grade 3 in all six subjects and at least three HL subjects for the national professional-bachelor access rule. Absalon's own pages do not explicitly settle Course Results; the existing caution to confirm the individual application remains. No missing institutional wording was treated as rejection.
- Biotechnology still needs Mathematics A, Physics B or Geoscience A, Chemistry B or Biotechnology A, and English B; quota 2 applicants with international qualifications attend an interview. Its 65/35 quota split and documented assessment criteria now appear under the shared selection heading.
- Robot Systems still needs Mathematics A, Physics B or Geoscience A and English B. Its current specific page now gives quota 1 a minimum GPA of 5.0 on the Danish scale, ranking by GPA, and quota 2 ranking by interview scores, with 65/35 places. The GPA floor is encoded as `minimum-average` scoped to **Quota 1**, so it does not exclude quota 2. The shared recognition scheme renders it as at least 26 IB points and expressly says applicants below it can still be admitted through the other quota. The page's later generic section still says an interview may be requested; this tension is recorded without creating a universal interview hurdle. The old unfinished-criteria/video evidence remains historical on disk but is no longer a current reference on the Robot Opportunity.
- Both current admission pages list English B or, where the qualifying exam lacks it, IELTS 6.5, TOEFL 4.5 (94 for tests before 21 January 2026), or Cambridge C1 Advanced/C2 Proficiency 180. Results must be no older than two years at the application deadline. These appear in canonical English notes, institution notes and current evidence. The national IB-to-English equivalence is retained.
- IB applicants, including IB earned in Denmark, use Optagelse.dk by 15 March noon; the 5 July application deadline is for Danish-entry-exam applicants. The new scoped route treats 15 March as the available-document deadline and preserves the FAQ's 5 July noon preliminary-results/expected-hours process for later completion. The same FAQ generally exempts IB exams from the ordinary hours-verification form; individual later-completion requests can still ask for expected-hours evidence.
- Annual dates are **provisional for 2027**. The route suppresses the generic national 2 August reply date on Absalon pages; Absalon instead tells applicants to use the deadline in their offer. Exact final IB delivery method/code/deadline is not published on the pages read. EU summer finishers are expressly accommodated; the generic FAQ and EU-specific wording do not establish the same-year non-EU route, so that remains an open question.
- EU/EEA tuition exemption and ordinary non-EU application deposit DKK 3,750 are recorded. The deposit is paid before assessment, non-refundable unless admitted, then credited to tuition. Each programme's own fee page publishes total tuition DKK 500,302.58; its price year is explicitly undated for 2027. Semesters 1–5 and 7 are DKK 81,578.14 each and semester 6 DKK 10,833.75. First-year advance payment is explicitly labelled as a rule starting with September 2026, rather than invented as a new 2027 policy. The Robot Systems fee/internship semester conflict is preserved, not arithmetically corrected. Residence-based fee exemptions still need the individual terms; citizenship alone should not settle every case.

## Official sources opened on 30 October 2026

- [Accreditation authority: Absalon identity and positive 2021 decision](https://akkr.dk/akkreditering/arkiv-gennemforte-institutionsakkrediteringer/professionshojskolen-absalon/).
- [Full-degree programme handoff](https://en.phabsalon.dk/full-degree-programmes): three fully/partly English offerings, two fully English engineering choices retained.
- [About Absalon](https://en.phabsalon.dk/about-university-college-absalon): professional-bachelor institution and wider campus count.
- [Campus Kalundborg](https://en.phabsalon.dk/campus-kalundborg): 2021 campus, small international environment, both engineering degrees, official photograph.
- [Biotechnology](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology) and [specific admission requirements](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/admission-requirements-bachelor-engineering).
- [Robot Systems](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems), [programme structure](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/about-bachelor-engineering-robot-systems), and [specific admission requirements](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/admission-requirements-bachelor-engineering-robot).
- [Biotechnology application/fees](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/application-and-fee) and [Robot Systems application/fees](https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems/application-and-fee).
- [Engineering FAQ](https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology/admission-requirements/faq-bachelor-engineering): documents, later completion and IB form exemption; linked by both engineering admission pages.
- [Final-response guidance](https://en.phabsalon.dk/full-degree-programmes/bachelor-engineering-biotechnology/application-and-fee/final-response): annual 28 July result in nemStudie, with weekend rule.
- [Education](https://en.phabsalon.dk/full-degree/professional-bachelors-degree-education): mixed English/Danish, Vordingborg; the visible 15 March 2026 label was not rolled into 2027.

## Actual image audit

Viewed actual stored pixels through `view_image`, including each degree's **480×300 stored WebP**. The metadata alone was not used as proof of visual quality.

1. **Old institution asset:** `src/assets/img/places/absalon.webp` (1200×750). Actual view shows a path, trees, older building and prominent red Absalon sign. Rejection is preserved; it is also inconsistent with presenting the new 2021 campus as the current English-degree home.
2. **Selected official campus photograph:** exact image URL is recorded under `data/official-images.json` → `absalon`; [source page](https://en.phabsalon.dk/campus-kalundborg). Actual 1420×1070 photograph and a 480×300 centre crop were inspected. Silver campus buildings, yellow wildflowers and blue sky remain clear in the crop, without dominant signage, people, graphic overlays or unreadable text. Response 200, `image/jpeg`, **306,211 bytes**. `verifyOfficial` confirmed the image is published on the named official page. Owner/credit: University College Absalon; photographer not named on the page. Usage basis: institution-published photograph **linked, not copied**, per the existing image policy; no open licence is claimed. The chosen URL is a CMS tablet variant actually present on the page, not an invented resize. No image bytes were added to the repository.
3. **Other official candidates actually viewed:** full-degree hub hero (1162×507, 36,095 bytes) is a tight student portrait and was not selected as campus identity. Programme-page drone campus image (1278×959, 211,969 bytes) shows the site and industrial context but gives considerable area to parking and roads. The campus-page photograph is the cleaner institution view. Official source ladder succeeded; no fallback or new Commons search was necessary.
4. **Biotechnology retained:** `programme-dk-absalon-biotechnology-beng-480.webp` visibly shows a researcher beside an illuminated algae photobioreactor. The crop preserves the vessel and face and clearly conveys bioprocess work. It is an illustrative NREL photograph, not claimed as Absalon. [Commons source](https://commons.wikimedia.org/wiki/File:U.S._Department_of_Energy_-_Science_-_298_042_003_(9525866984).jpg) confirms U.S. Department of Energy attribution, original 3872×2592 and public-domain US government work. Existing credit/basis retained.
5. **Robot Systems retained:** `programme-dk-absalon-robot-systems-beng-480.webp` visibly shows a person and orange collaborative robot using a saw together; both tools/hands and robot arm remain inside the crop. It is an illustrative Italian Institute of Technology experiment, not claimed as Absalon. [Commons source](https://commons.wikimedia.org/wiki/File:Human-Robot-Collaboration-Sawing-2016-Luka-Peternel.jpg) confirms Luka Peternel, original 2800×1700 and CC BY-SA 4.0. Existing credit/licence retained.

Local inspection material (not publication assets): `D:/ibp-tmp/dk/absalon/campus-2.jpg`, `campus-2-480.png`, `campus-drone-480.png`, `full-hero-480.png`. The chosen 480px centre crop is `campus-2-480.png`. Coordinator may independently reopen the official image or these files.

## Focused validation actually performed

- `node scripts/validate.mjs`: final pass, 1803 records / 1064 evidence, all valid. An initial applicant-group enum mismatch in the new route was fixed to existing `any`; scope is enforced by the exact two Opportunity IDs.
- `node scripts/test-sourcing.mjs`: pass; no self-attestation promoted to independent verification.
- `node scripts/test-images.mjs`: pass.
- `node scripts/test-image-records.mjs`: pass; all 869 pictures in 575 records agree with files/reviews. The 12 absent historical verdict keys are existing informational notes, unrelated to Absalon.
- `node scripts/test-calendar.mjs`: pass, including scoped and superseding milestone checks.
- `verifyOfficial` on the exact campus URL/source page: pass, 1420×1070 / 306,211 bytes.
- In-memory shared rendering with `load()`, `university()` and `programme()`: pass for institution and both canonical programmes. Assertions confirm exactly two degrees, the actual campus URL resolves via `picture(site, 'dk-absalon')`, selection is visible, the old unfinished-criteria claim is absent from current Robot HTML, English tests and Course Results remain visible, preliminary-results milestone appears, no generic “Accept your place” fixed date survives, and the Robot quota floor translates to 26 IB points with the other-quota explanation. No dist build was run.

Rendered inspection HTML is in `D:/ibp-tmp/dk/absalon/render-institution.html`, `render-dk-absalon-biotechnology-beng-2027-autumn.html`, and `render-dk-absalon-robot-systems-beng-2027-autumn.html`. Desktop/phone screenshot acceptance and the full release gate belong to the coordinator's separate reviewer/release checkout; this worker does not claim those have happened.

## Open items and next check

**15 January 2027:** reopen the two admission/fee pages and FAQ for 2027-specific dates/rates, final-IB delivery details and same-year non-EU completion. Resolve Robot Systems' fifth-semester internship against the sixth-semester low-fee table before declaring a settled payment schedule. Check whether its specific quota interview wording and generic “may be asked” wording have been aligned. Until then retain the explicit caveats and individual-letter instructions. A future accreditation renewal should be checked around the end of the six-year 2021 cycle if material to the 2027 publication.

No true model gap was found: existing canonical requirements, quota-scoped floors, fee periods, provisional milestones, superseding route fields and image review records represent this update. The unseen `admission.selection` projection limitation was handled through existing `mandatory: false` selection requirements, as on AAU, without changing templates.

## Coordinator acceptance and clean release

Independent acceptance is **admissions 8/10, imagery 8/10, shared format/art 8/10,
maintainer 9/10**, recorded in
`docs/research/qa/hourly-universities/dk-absalon-round-1.md`. All twelve built
desktop/390px-phone screenshots in light/dark themes were actually inspected.
They are retained alongside that review in `dk-absalon-shots/`.

The first full gate found a false positive: the real admissions portal name
`nemStudie` matched the code-field wording guard. The coordinator added that
exact official name to the existing portal-name set in
`scripts/lib/research-log.mjs`, plus one positive fixture in
`scripts/test-research-log.mjs`. No template or student data was changed to
work around it. The independent reviewer accepted the narrow correction.
One repeated identical Robot evidence reference was also removed.

All **43 checks passed** on clean source tree
`632e09a9fae95957ab446efb63729302a504aa73`, cloned from current `main` and patched
with only this unit, using `SITE_BASE=/IB-Post-Secondary-Opportunities`.
Freshness remains an advisory. Subsequent pre-publication changes record review,
screenshots and checkpoint notes only.

Denmark's canonical handoff now has 15/15 sourced institutions, **28/57** paths
with rendered detail, **46/57** dedicated programme photographs and **14/15**
institution photographs; eleven institutions still have gaps. These are separate
readiness measures and do not establish full national coverage.

## Published outcome

- Publication commit: `0033b8bb47ade5b14f88117c08be10a4702f3313` on `origin/main`.
- [Build and deploy run 40972121479](https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities/actions/runs/40972121479)
  passed all 43 checks and deployed Pages successfully.
- All three live pages returned HTTP 200 with the current portal/document
  guidance and without a generic fixed 2 August reply date. The institution
  page contains the selected campus photograph; Robot Systems shows the scoped
  quota 1 IB floor and no former unfinished-criteria claim.
- Exact run `30e7b8c1-aa50-40a6-8970-73c61c105394` is closed as **deferred**,
  with that real publication commit and next check **2027-01-15**. This preserves
  the unresolved 2027 source limitations, without withholding useful guidance.
- Read-only next selection is `dk-au`; no second institution was reserved.
  The hourly automation remains active and accepted current content is retained.
- The preview server was stopped. Automatic approval review rejected removal
  of `D:/ibp-tmp/absalon-release-20261030`, citing policy. The temporary validated
  clone is retained; it does not own the primary reservation or run a worker.
