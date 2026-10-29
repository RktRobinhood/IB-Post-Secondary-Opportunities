# Central sources — independent review, round 1

Reviewed 2026-10-29 against `QA_CRITIC_LOOP.md` and
`TRUST_AND_GOVERNANCE.md`. Roles: maintainer **9/10**, admissions counsellor
**9/10**, editor **8/10**, visual critic **8/10**. **Accepted.** No blocking
defect found in the reviewed change.

Read the importer, projection/rendering modules, country/university/programme
wiring, Denmark comparison, focused test definitions, manifests and operating
documentation. Reprojected all **99** published Finnish snapshot entries in
memory against the cached raw harvest: every entry matched exactly. Both
harvest and snapshot retain **2026-10-29**; all selected offerings retain their
source modification date. This review did not run a build or mutate snapshots.

Sampled Aalto Chemical Engineering (300 ECTS, five-year combined path), Aalto
Design and Media (general qualification code 123, explicit IB flag false), LUT
rolling admission, and Arcada International Business against their raw detailed
records. Sole structured English instruction, published status, target-season
application options and institution IDs are preserved. General first-year codes
do not become IB eligibility. The public programme join requires an unambiguous
official offering/application ID within the institution. Combined credits say
“Complete study path” and duration says “overall”; curated admissions facts and
verification states are untouched.

The Danish report's index checksum, retrieval date, listing URLs and modification
dates match the dated cached payload. Both SDU Software Engineering campus rows
remain ambiguous, with campus slugs retained. Discovery name matches neither
publish offerings nor establish 2027 admissions.

Inspected actual `.cache/national-catalogue-preview.png` and
`.cache/studyinfo-preview.png`: readable, attributed details controls fit the
existing page language. The latter captures the earlier ten-listing Aalto
snapshot; the current country preview shows eleven. Neither image establishes
phone-width behavior, so the visual score is limited to the supplied desktop
evidence.

Useful follow-up: before joining broader award lists, avoid rendering alternative
qualifications with “+”. Helsinki Liberal Arts lists six possible award names
in the source, whereas its application says Arts **or** Science **or** Social
Sciences. That record currently has no programme-page join, so this is not a
present publication defect.
