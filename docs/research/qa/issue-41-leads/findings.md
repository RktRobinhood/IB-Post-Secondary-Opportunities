# Issue #41 lead checks, 26 September 2026

The cloud session's web-search leads suggested six places where live country pages might be wrong. A local session read the official pages through Chrome on 2026-09-26. `qa --stage data` passed (26 checks) after the fixes.

| # | Item | Verdict | Official page | Fix |
|---|---|---|---|---|
| 1 | Lithuania: EU route | **Site partly wrong, fixed** | LAMA BPO, key information for international applicants (2026 round closed "Until 23 July, 12:00 PM (noon)"); vda.lt/en/admission/how-to-apply (EU/EEA citizens apply through LAMA BPO) | `data/countries/lt.json`: portal name and first step say fee-paying places are applied for at each university, state-funded places through LAMA BPO; the "no national deadline" claim is gone; a LAMA BPO card with no 2027 date (`not-published`); VDA note and admissions link point to the LAMA BPO route |
| 2 | Slovenia: Ljubljana Business and Economics | **Site wrong, fixed** | ef.uni-lj.si/en/study/bachelors-programmes/prijava-in-vpis: students schooled abroad "can choose the English-language version … without restrictions when enrolling" | `data/countries/si.json`, `data/destinations/si.json`: an EU applicant applies in the EU round and chooses English at enrolment |
| 3 | Malta: SEC Maltese | **Site correct**, clarified | University of Malta FAQ: the substitute language can be any "apart from English" | "(not English)" added in `data/countries/mt.json`, `data/destinations/mt.json` |
| 4 | Portugal: EU route | **Site correct** | DGES: EU citizens are outside the International Student Statute and apply through the Concurso Nacional | Nova SBE admissions link now its National Call page (`data/countries/pt.json`) |
| 5 | Hungary: CEU round | **Site correct** | CEU: Round 1 closes 15 October 2026 | none |
| 6 | Poland: "for foreigners" route | **Unclear**, no change | Wroclaw Tech: the "for foreigners" section is the fee-paying route; "every foreign candidate" sits the maths exam, as the site says; no IB exemption found | none; still open |

Still open on #41: Poland's EU-citizen route in general, Warsaw resolution 315, and the LSMU extra-round sentence.
