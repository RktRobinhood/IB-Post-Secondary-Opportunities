# Luxembourg (lu) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/lu.json`, `data/destinations/lu.json`,
`data/evidence/lu.json`, `data/application-routes/lu-direct-2027.json`.
uni.lu serves pages to a browser only intermittently. It answered for two pages, then returned CloudFront 403.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| One September intake; 2027-28 applications open 1 Feb 2027; criteria "under review" | CONFIRMED (re-read in a browser) | uni.lu/en/admissions/bachelor-master/ |
| Application fee exists (step 5 of the process) | CONFIRMED | same |
| Application fee amount | UNVERIFIABLE (the 2022 news item says 50 EUR; uni.lu blocked it; left unset) | uni.lu news (blocked) |
| Programme closing dates for 2027 | UNVERIFIABLE (not yet published; 2026 precedent kept) | uni.lu programme pages (blocked) |
| Registration/tuition (was null: "fee pages could not be retrieved") | **CORRECTED** (400 EUR per semester, "fees may vary by programme") | uni.lu cost-of-living |
| Living cost (was null) | **CORRECTED** (at least 1,517 EUR a month / 18,211 EUR a year (2025); university housing from 450 EUR; about 2,700 EUR start-up) | uni.lu cost-of-living |
| Work rights ("hour limits … not verified") | **CORRECTED** (student CDD: 15 h/week average over a month in term, 40 h in holidays) | guichet.public.lu contrat-etudiant-cdd |
| LUNEX English bachelor's; admission (entrance qualification + English B2, apply any time) | CONFIRMED; list extended (osteopathy; nutrition, fitness and health) | lunex.lu/en/admissions |
| Sacred Heart and BBI not options (destination and profile) | CONFIRMED as recorded 2026-09-23 (not re-read) | n/a |
| AideFi eligibility, SU abroad | UNVERIFIABLE (left as written) | n/a |

## Corrections

### Tuition / registration
- Old: `tuitionEuEea`, `tuitionNonEu` null. The note said fee pages could not be retrieved, and that semester fees were "widely reported as being higher in the first year" (unconfirmed).
- New: 400 EUR per semester; the university says fees may vary by programme. No nationality distinction is shown. The unconfirmed "higher in the first year" note is removed.
- Source: https://www.uni.lu/life-en/financial-support/cost-of-living/ — "Registration at the University of Luxembourg 400 € / semester. Fees may vary by programme".

### Living costs
- Old: null.
- New: at least 1,517 EUR a month (18,211 EUR a year), the 2025 immigration resource figure the university quotes. University housing from 450 EUR a month, not guaranteed. About 2,700 EUR start-up.
- Source: same page — "at least 18,211 € per academic year, or a minimum of 1,517 € per month".

### Work rights
- Old: "The current hour limits and student-contract conditions were not verified".
- New: 15 hours a week on average over a month (60 hours) during term; 40 hours a week in the holidays; at least the age-adjusted minimum wage.
- Source: https://guichet.public.lu/en/entreprises/ressources-humaines/contrat-convention/jeunes-actifs/contrat-etudiant-cdd.html — "cannot exceed 15 hours on average over a period of one month or 4 weeks, i.e. a total of 60 hours".

## Institutions

- **uni.lu**: website and admissionsUrl resolve in a browser. A script gets HTTP 202 with an empty body. Unchanged.
- **LUNEX**: redirects. `lunex.lu/` → `lunex.lu/en`, `lunex.lu/admissions/` → `lunex.lu/en/admissions` (updated, including `ev-lu-lunex-admissions`). The programme list on the site includes Bachelor in Physiotherapy, Osteopathy, Sport and Exercise Science, International Sport Management, and Nutrition, Fitness and Health. `englishBachelors` has been extended.
- **MUDEC (Miami University Dolibois European Center)**: **removed**. `miamioh.edu/luxembourg/` now redirects to `miamioh.edu/global-initiatives/miami-in-luxembourg/`. The record's own note already said it is "a study-abroad centre, not a normal entry point for a Danish IB student", and it offers no degree a school leaver can apply to. It has no entry in `data/ib-statements.json`. `data/images.json` still has a `lu-mudec` photo key, which this pass may not edit; the coordinator may want to delete it.

## New institutions

None. IB_DISCOVERY.md lists no Luxembourg institution with 300+ IB transcripts.
