# Portugal audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/pt.json`, `data/destinations/pt.json`, `data/evidence/pt.json`,
`data/application-routes/pt-cna-2027.json`, `data/application-routes/pt-catolica-direct-2027.json`,
`data/application-systems/pt-cna.json`. No context notes.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| EU/EEA nationals excluded from the international-student statute (Nova SBE, U.Porto, UMinho all say so) | CONFIRMED | https://www.novasbe.unl.pt/en/programs/apply/bachelors/international-students |
| 2026 national contest: substitution group 20–29 July, others 20 July–6 August; Despacho 9359-A/2026 | CONFIRMED (2027 calendar not published) | https://www.dges.gov.pt/pt/pagina/calendario-concurso-nacional-de-acesso-0 |
| Propina cap €697 (2025/26) | CONFIRMED; DGES has published nothing for 2026/27. Press reports say it stayed frozen for 2026/27 — added as an unconfirmed note | https://www.dges.gov.pt/pt/pagina/propinas |
| Nova SBE €697 EU / €7,500 international | CORRECTED year: Nova labels both as 2025/2026, not 2026/27 | https://www.novasbe.unl.pt/en/programs/bachelors/management/fees |
| Nova SBE €70 application, €750 enrolment; autumn 14 Apr–16 Jun 2026, spring 10 Nov–4 Dec 2026 | CONFIRMED | Nova SBE international page |
| Nova SBE admin/insurance €36.50 (EU) | CONFIRMED on the fees page (international page says €37.6 for its route) | same |
| U.Porto ISS €3,500–€16,500, 712 places, three phases (2026/27) | CONFIRMED | https://www.up.pt/portal/en/study/international-students/special-call-for-applications/ |
| Católica Lisbon fees "not verifiable" | CORRECTED: €780/month EU, €858/month non-EU, 10 instalments (2026-27); €180 application fee | https://www.clsbe.lisboa.ucp.pt/international-bachelors-degrees-business-administration/fees-and-scholarships |
| Católica Lisbon open to EU applicants in all rounds; 2026 rounds 3 Dec 2025–3 Jul 2026 | CONFIRMED, added to route | https://www.clsbe.lisboa.ucp.pt/international-bachelors-degrees-business-administration/how-apply |
| CNAES homologous-exam list by 31 May; equivalence certificate | NOT RE-READ (dges.gov.pt/en/node/172 now renders navigation only to a script) | — |
| Residence (CRUE at câmara municipal), NIF, SNS, living costs, work hours, bolsas conditions | UNVERIFIABLE (unchanged) | — |

## Corrections

### Nova SBE fee year
- Old: whyConsider "Nova SBE charged EU students €697 while charging international-statute students €7,500"; `tuitionNonEu` year 2026/27 for the Nova figure.
- New: labelled "(2025/26 figures)"; `tuitionNonEu` says Nova "labels [€7,500] as valid for 2025/26".
- Source: Nova SBE international page — "Annual tuition fee: 7500 € ** … ** Only valid for the 2025/2026 academic year"; fees page — "For Portuguese and European Union students, the tuition fees for 2025/2026 will be 697 €/year."

### Católica Lisbon fees and application fee
- Old: "fees were not verifiable during research"; application fee only Nova's.
- New: €780/month (EU) and €858/month (non-EU) over ten months, 2026-27; €180 application fee (€100 early bird in rounds 1–3), €450 conditional-offer fee, €470 enrolment fee. Added to `costs`, the institution note, and both feeContext entries.
- Source: Católica Lisbon fees page — "Monthly tuition fee for Portuguese and European Union students: €780*". Evidence `ev-pt-clsbe-fees-2026`.

### Propina 2026/27
- Added note: press reports (RTP, ECO, November 2025) say parliament kept the cap at €697 for 2026/27 in the 2026 State Budget; DGES's page still reads "para o ano letivo de 2025-2026 … mantendo-se assim em 697€". Not carried as a 2026/27 fact.

### Católica route
- Old ms-apply note: 2026 maths test 3 June, English certificate 3 July, documents 17 July.
- New: 2026 had four rounds 3 December 2025–3 June 2026 plus an extra round to 3 July; EU citizens can apply in every round; 2027 rounds unpublished.
- Source: how-apply page — "Students who are Portuguese or who have European Union citizenship can apply in all available rounds."

### Admissions URLs
- UMinho: old `https://www.uminho.pt/EN/education/admission` (404) → `https://www.uminho.pt/EN/education/course-admissions` ("Course Admissions").
- UC (Coimbra): old `https://www.uc.pt/en/driveit/` (404 "Page not found", read in Chrome) → `https://www.uc.pt/en/studyatuc/` (linked from the English home page as "Study at UC").

## Institutions

| Institution | Website | Admissions URL | Note |
|---|---|---|---|
| Nova SBE | OK | OK | CONFIRMED |
| Católica Lisbon | OK | OK | CORRECTED (fees) |
| ULisboa, IST, NOVA, ISCTE, U.Porto, UA, UAlg, UCP | OK | OK | Not re-verified beyond URL |
| UMinho | OK | FIXED | — |
| UC | OK (Chrome; 403 to scripts) | FIXED | — |

Removed: none.

## New institutions

None. No Portuguese institution in docs/research/IB_DISCOVERY.md has 300 or more IB transcripts.
