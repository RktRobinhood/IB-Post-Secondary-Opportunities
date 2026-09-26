# France school records (#43): admissions counsellor, round 1

**Score: 6/10. Not accepted.** 36 of 37 dated entries match their official pages. Fails on the Sciences Po final round ("before 1 March 2027" recorded as "by 1 March") and seven broken dual-degree links. Checked 26 Sep 2026 in the owner's Chrome; the ministry DAP page stopped at a Cloudflare check and was not passed.

## Deadlines

| Record | On record | On page | Verdict |
|---|---|---|---|
| sciences-po | R1 2026-11-04, R2 2027-01-13, interviews 8 Dec / 8 Mar / 13 Apr | same | OK |
| sciences-po | Final round 2027-03-01 | "if you apply before March 1, 2027" | **Wrong by a day** |
| sciences-po Keio, HKU, ESCP duals; escp PEM | closes 2027-03-01 | "must submit their applications before 1 March 2027" | **Wrong by a day** |
| l-x | opens 09-17; R1 10-20, R2 01-06, R3 02-08 at 2 pm | same | OK |
| essec | R1–R4 10-28, 01-12, 03-10, 04-22 | same | OK |
| edhec | opens 10-01; closes 11-03, 01-07, 02-11, 04-01, 06-08; King's BSc 2027-01-13 | same | OK |
| psl I-BE³ | 10-01, 11-11, 01-10, 03-15 | same | OK |
| aup | 2026-11-15, 2027-02-01, 2027-03-15 | "by 15 November / 1 February / 15 March" (no years) | OK |
| sorbonne, saclay, uga, unistra, psl AI | lastYear Parcoursup 2026 | parcoursup.gouv.fr/calendrier | OK |
| escp, emlyon, essec AI BSc | ownDeadline, no dates | not published | OK |

22 other facts checked (fees, IB subjects, English-taught status, routes, scope calls): all correct.

## Changes that would raise the score most

1. Sciences Po final round and the Keio, HKU, ESCP duals and ESCP PEM: 2027-03-01 → 2027-02-28, text "before 1 March 2027 (so by 28 February)"; the same in `data/application-routes/fr-direct-2027.json` and `data/countries/fr.json`.
2. Seven broken `url`s in fr-sciences-po.json (Keio, HKU, Columbia, NUS, UBC, Berkeley, Sydney): `/college/en/academics/dual-bachelor-degrees/<slug>/` → `/admissions/en/undergraduate/dual-bachelor-degrees/<slug>/`.
3. fr-escp.json: six European campuses (Berlin, London, Madrid, Paris, Turin, Warsaw), not five; fix the MST `separateFrom` reason.
4. Research narration out of student text: AUP "(standing date…)" labels; ESSEC AI "still 'TBD'"; PSL AI "2026 criteria; 2027 not yet published".
5. ESCP `ib.text`: "No IB-specific requirements published".
6. batch-fr.md lacks a fr-paris-saclay evidence section.

Also: `data/countries/fr.json` gives ESSEC as €15,900/€18,900 (page: €15,400 + €2,000 registration, EU citizens, 2026 intake) and says PSL has one English programme (I-BE³ makes two).

"Fix 1 and 2 and this reaches 8."
