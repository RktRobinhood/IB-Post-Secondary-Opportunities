# United Kingdom (gb) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/gb.json`, `data/destinations/gb.json`,
`data/evidence/gb.json`, `data/application-routes/gb-ucas-2027.json`,
`data/application-systems/gb-ucas.json`, `data/context-notes/gb-*.json`.
Pages were read with a plain fetch. Where a site blocks bots (Oxford, UCL, City St George's, UAL) they were read in a browser.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| UCAS 2027 dates: open 12 May 2026, submit from 1 Sep, 15 Oct 18:00, 13 Jan 2027 18:00, Extra 25 Feb, 30 Jun 18:00, Clearing 2 Jul, final 23 Sep 2027 18:00 | CONFIRMED | ucas.com/undergraduate/applying-university/ucas-undergraduate-when-apply |
| UCAS application fee | **CORRECTED** (GBP 28.95 for 2026 entry, now GBP 34.50 for the 2027 cycle) | ucas.com/faqs/what-is-the-application-fee-for-the-2027-cycle |
| Five choices; at most four in medicine, dentistry or veterinary | CONFIRMED | ucas.com filling-your-ucas-undergraduate-application |
| Personal statement is three questions from 2026 entry | CONFIRMED | same |
| UCAS Tariff values for IB HL, SL, EE and TOK; CAS carries none; no Tariff for the Diploma as a whole | CONFIRMED | UCAS new-tariff-tables.pdf pp. 22-24 |
| No national IB minimum; LSE 37 (6,6,6) to 39 (7,6,6); offers may change year to year | CONFIRMED | lse.ac.uk entry requirements |
| Glasgow Economics 2027: 36 (6,6,5), HL English or Humanities and HL Maths AA | CONFIRMED | gla.ac.uk/undergraduate/degrees/economics |
| Glasgow international fees 2027/28 and 2026/27; EU students pay the international rate | CONFIRMED | gla.ac.uk/undergraduate/fees/intlfees |
| England home fee GBP 9,790 (2026-27) and GBP 10,050 (2027-28) | CONFIRMED | imperial.ac.uk tuition fees |
| Edinburgh living cost GBP 1,546/month (2026-27) | CONFIRMED | study.ed.ac.uk/undergraduate/fees-finance |
| Student visa GBP 558; apply up to 6 months before; up to 5 years at degree level | CONFIRMED | gov.uk/student-visa |
| Maintenance GBP 1,529 London / GBP 1,171 elsewhere, 9 months, 28 days ending within 31 days | CONFIRMED | gov.uk/student-visa/money |
| Immigration Health Surcharge GBP 776/year for students | CONFIRMED | gov.uk/healthcare-immigration-application/how-much-pay |
| Graduate visa 2 years to 18 months for applications on or after 1 Jan 2027 | CONFIRMED | gov.uk/graduate-visa |
| Term-time work limit | **CORRECTED** (was "not confirmed"; now 20 hours a week in term time) | gov.uk Immigration Rules Appendix Student ST 26.1 |
| UCAT 2026 cycle dates (20 May, 23 Jun, 13 Jul-24 Sep, booking deadline 16 Sep 15:00) | CONFIRMED | ucat.ac.uk/about-ucat/ucat-test-dates |
| UAT-UK (ESAT, TMUA, TARA) windows and test dates | **CORRECTED** (wording only: the recorded windows are *test booking* windows, not registration; dates unchanged) | esat-tmua.ac.uk/deadlines |
| LNAT 2027-entry dates (all rows incl. late international route) | CONFIRMED | lnat.ac.uk/registration/dates-and-deadlines |
| "One application ... with a single deadline" (whyConsider) | **CORRECTED** (there are two equal-consideration dates) | UCAS dates page |
| Tagline "now the most expensive" | **CORRECTED** to "one of the most expensive" (the US and some private options cost more) | editorial |
| Cambridge IB offer | UNVERIFIABLE on the recorded page (the page links to a "qualifications we accept" page; not needed for any stored figure) | undergraduate.study.cam.ac.uk |
| Danish SU for a UK degree | UNVERIFIABLE from a UK source (left as written, flagged to check with the school counsellor) | n/a |
| University merit scholarship amounts | UNVERIFIABLE nationally (left as written) | n/a |

## Corrections

### UCAS application fee
- Old: "UCAS application fee was GBP 28.95 for up to five choices for 2026 entry. The 2027-entry figure was not published on the pages read on 2026-09-22." (also in `application.selectionNotes`)
- New: "UCAS application fee: GBP 34.50 for up to five choices in the 2027 cycle (GBP 28.95 for 2026 entry)."
- Source: https://www.ucas.com/faqs/what-is-the-application-fee-for-the-2027-cycle — "For the 2027 cycle, the undergraduate and conservatoires application fee is £34.50."
- Evidence: new `ev-ucas-fee-2027`.

### Work rights
- Old: "The specific hours per week were not confirmed on the gov.uk pages read on 2026-09-22 ..."
- New: up to 20 hours a week in term time, full time in holidays (Appendix Student ST 26.1); exact limit on the visa.
- Source: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-student — "20 hours per week during term-time (full-time employment permitted outside of term-time)".

### UAT-UK labels
- Old: "registration for the October sitting" / "registration for the January sitting".
- New: "test booking for the October sitting" / "test booking for the January sitting". Dates unchanged (20 Jul-28 Sep 2026 18:00 BST; 26 Oct-21 Dec 2026 18:00 GMT). Added: accounts opened 1 June 2026; January registration reopens 5 October 2026.
- Source: https://esat-tmua.ac.uk/deadlines/ — "Test booking opens for October 2026 ... 20 July 2026 3pm BST".

### whyConsider[0]
- Old: "One application covers five courses across the whole country, with a single deadline".
- New: "One application covers up to five courses across the whole country".
- Source: UCAS dates page (15 October 2026 and 13 January 2027 are both equal-consideration dates).

### Graduate Route wording (watchOuts)
- Same fact, clearer: "18 months, not 2 years, for applications made on or after 1 January 2027".
- Source: https://www.gov.uk/graduate-visa — "18 months if you apply on or after 1 January 2027."

### Destination feeContext
- Old: "Amounts vary by university and by subject and are not established here", resting on the UCAS dates page (which says nothing about fees).
- New: gives Glasgow 2027/28 (GBP 28,275 arts and social sciences; GBP 33,708 science and engineering) as an example, backed by new `ev-gla-intl-fees-2027`.
- Source: https://www.gla.ac.uk/undergraduate/fees/intlfees/ — "EU students that meet our criteria for EU Fee Status will have an International tuition fee applied".

`ev-ucas-dates-2027` re-read and re-attested (retrievedAt 2026-09-24).

## Institutions

Checked all 16. Every website and admissionsUrl resolves to the right page (Oxford and UCL block scripts but load in a browser).

- **UCL**: admissionsUrl redirected. `https://www.ucl.ac.uk/prospective-students/undergraduate` → `https://www.ucl.ac.uk/study/prospective-students/undergraduate` (updated).
- Glasgow's `ibPageState: none-published` still holds (subject pages carry the IB requirement; the Economics page gives 36 (6,6,5) for 2027).
- Notes: accurate. All UK institutions teach every bachelor's degree in English.
- Removed: none.

## New institutions

From IB_DISCOVERY.md, the top six UK universities by IB transcripts (all 300+, all teach every degree in English). They are added to `data/countries/gb.json` with no place, photo or IB statement.

| Institution | shortName | IB transcripts (5 yrs) | website / admissionsUrl |
|---|---|---|---|
| Queen Mary University of London | QMUL | 1,815 | qmul.ac.uk / qmul.ac.uk/undergraduate/apply/ |
| University of Birmingham | Birmingham | 1,771 | birmingham.ac.uk / birmingham.ac.uk/study/undergraduate |
| University of Leeds | Leeds | 1,670 | leeds.ac.uk / leeds.ac.uk/undergraduate |
| City St George's, University of London | City St George's | 1,360 (as "City, University of London") | citystgeorges.ac.uk / .../prospective-students/apply/how-to-apply/undergraduate |
| University of Nottingham | Nottingham | 1,349 | nottingham.ac.uk / .../studywithus/ugstudy/find-uon.html |
| University of the Arts London | UAL | 1,329 | arts.ac.uk / arts.ac.uk/study-at-ual/apply/undergraduate |

City, University of London merged with St George's in 2024. The IB statement is under the old name, and the site lists it as City St George's.
Founding years are the year each institution gained its current status (Birmingham 1900, Leeds 1904, Nottingham 1948, City St George's 2024 merger, QMUL 1887 Queen Mary College lineage, UAL 1986), per the linked Wikipedia infoboxes, matching the file's existing practice (e.g. Manchester 2004).
Not added (cap of 6): Sheffield 1,233, Exeter 1,186, Southampton 943, Sussex 907, Westminster 832, Cardiff 820, and the rest down to SOAS 309.
