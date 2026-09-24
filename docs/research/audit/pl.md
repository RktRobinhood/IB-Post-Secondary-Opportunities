# Poland audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/pl.json`, `data/destinations/pl.json`, `data/evidence/pl.json`,
`data/application-routes/pl-direct-2027.json`. The Polish profile was researched in depth on 2026-09-23; this pass
spot-checked its load-bearing facts and filled institution gaps.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| IB and EB certificates automatically recognised for first-cycle and long-cycle admission (NAWA) | CONFIRMED | https://nawa.gov.pl/en/recognition/recognition-for-academic-purposes/applying-for-admission-to-first-long-cycle-studies |
| Full-time Polish-taught study at state universities free for EU/EEA; foreigners average EUR 2,000/yr; EUR 2,000–6,000 range | CONFIRMED | https://study.gov.pl/tuition-fees |
| UW 2026/27 fee schedule: American Studies and English Studies free for EU (non-EU 5,500 / 2,200), Archaeology 2,300, B&M 4,000, EPE etc. 4,300, Finance 4,200 | CONFIRMED (PDF layout hard to read; values line up) | https://rekrutacja.uw.edu.pl/files/pdf/tuition_fees_2026-2027_06.2026.pdf |
| UW IB conversion 7=100 … 2=30; results upload 14 July / 14 Sept 2026; no 2027 date | CONFIRMED | https://rekrutacja.uw.edu.pl/wazne-informacje-dla-kandydatow-z-dyplomem-matury-ib-lub-eb/ |
| PUMS Fall 2027: opens 1 Sep 2026, deadline 20 Jul 2027, orientation 6–12 Sep 2027; "13 Sep 2026" class-start typo still printed | CONFIRMED | https://pums.edu.pl/admissions/application-calendar/ |
| Jagiellonian School of Medicine timeline still 2026 (23 Feb–29 Apr, exam 23 May, ranking 1 Jun; 100 PLN TBC) | CONFIRMED (still provisional) | https://medschool.uj.edu.pl/prospective-students/md-program-in-english/application-timeline-and-forms/ |
| AGH schedule still 2026/27 (maths exam 14 Jul, results 17 Jul, enrolment 16–30 Sep for non-Polish certificates) | CONFIRMED (still provisional) | https://www.international.agh.edu.pl/en/studies/recruitment/deadlines-bachelor-studies |
| Wroclaw Tech 2026/27: 1–20 Jun registration, 2 Jul maths exam, fee 100/150 PLN; fees 8,600–12,700 PLN per semester (= annual figures on record) | CONFIRMED | https://rekrutacja.pwr.edu.pl/en/for-foreigners/fee-paying-basis-of-studies-and-scholarship-holders/admission/bachelor-studies/ |
| Gdansk IB table HL 100/86/71/57/43/29, SL 60/51/43/34/28/17; year not printed | CONFIRMED | https://rekrutacja.gumed.edu.pl/53907.html |
| Gdansk English programmes (MD, Pharmacy, Nursing, SDD master, Premedical); 2027 dates unpublished | CONFIRMED | https://admission.mug.edu.pl/ |
| UW "the only one found" with free English bachelor's for EU | CORRECTED (Warsaw Tech does too) | https://www.students.pw.edu.pl/Studies-Offer/B.Sc.-offer |
| English bachelor's at PW, SGH, WUM, AMU, UWr, PUT ("could not be verified") | CORRECTED (lists added) | see Institutions |
| Gdansk MD tuition 64,200 PLN; PUMS fees; JU dormitory rates; residence law; funding (art. 324) | UNVERIFIABLE today / not re-read | left as recorded 2026-09-23 |

## Corrections

### University of Warsaw note
- Old: "the only one found that gives EU citizens free tuition on several English-taught bachelor's while charging non-EU students".
- New: several English-taught bachelor's are free for EU citizens while non-EU students pay (no "only").
- Source: https://www.students.pw.edu.pl/Studies-Offer/B.Sc.-offer — Warsaw Tech's Electrical Engineering, Mechatronics, Aerospace and Power Engineering list the EU fee as "no charge".

### Warsaw University of Technology
- Old englishBachelors null; note said the list "could not be verified".
- New: 11 English-taught BSc programmes for 2026/27; four free for EU citizens; applications via irk.pw.edu.pl.
- Source: https://www.students.pw.edu.pl/Studies-Offer/B.Sc.-offer — "11 bachelor's courses across 9 faculties". The PLN/EUR fee figures were not copied because the table's per-semester or per-year basis was not certain.

### SGH
- Old: "programme names, count and fee amounts could not be verified". New: four in English — Global Business, Finance and Governance; International Economics; Management; Quantitative Methods in Economics and Information Systems.
- Source: https://www.sgh.waw.pl/en/first-cycle-study-programmes.

### Medical University of Warsaw
- Old: "programme list … could not be verified". New: English MD (6 years) and DDS (5 years).
- Source: https://www.wum.edu.pl/en/studies-in-english-wum — "6-year Medicine Program (MD)", "5-year Dentistry Program (DDS)".

### Adam Mickiewicz University, University of Wroclaw, Poznan University of Technology
- AMU: nine English bachelor's (e.g. International Relations, Chemistry, European Legal Studies, Liberal Arts and Sciences). Source: https://amu.edu.pl/en/admissions/bachelor-degree-programs.
- UWr: 12 English bachelor's (e.g. Biotechnology, Criminal Justice, International Relations – Global Studies, LLB International and European Environmental Law). Source: https://international.uni.wroc.pl/en/admission-full-degree-studies/programmes-english.
- PUT: ten English BSc (e.g. Architecture, Artificial Intelligence, Quantum Technologies). Source: https://put.poznan.pl/en/first-cycle-bsc-programmes.
- `notCheckedNotes` updated to say only fees and 2027 deadlines remain unverified for these.

### Redirects
- UW website `https://en.uw.edu.pl` → `https://en.uw.edu.pl/`; UJ → `https://en.uj.edu.pl/`; PW → `https://eng.pw.edu.pl/`; MUG → `https://gumed.edu.pl/en`; UWr `https://uni.wroc.pl/en` → `https://uwr.edu.pl/en/`; Wroclaw Tech admissions → trailing slash.

## Institutions

All 13 listed institutions resolve. None removed. Kozminski's English programme list still could not be read (the page carries only navigation); left null.

## New institutions

| Name | Short | City | Why |
|---|---|---|---|
| SWPS University | SWPS | Warsaw | 307 IB transcripts in five years (IB_DISCOVERY.md), the only Polish institution at 300+. Six English-taught bachelor's in Warsaw (Psychology, Computer Science, Design, English Studies ×2, Management and Leadership). IB holders are exempt from its entrance exams; Psychology EUR 7,400/yr in 2026/27; application fee PLN 85. Sources: https://english.swps.pl/academics/warsaw/ba-programs ; https://english.swps.pl/academics/warsaw/ba-programs/psychology — "IB diploma holders are exempt from entrance examinations". Founded 1996 per Wikipedia. Type recorded as "Research university" (it is a private non-profit university; the site has no private-university label). |

Needs central geocoding (place `pl-warsaw` exists), photo and IB statement.

## Not verified
- 2027 dates everywhere except PUMS and the UW/JU Senate outer bounds: still unpublished.
- Kozminski programmes and fees; SGH, PW, AMU, UWr, PUT fees.
- Everything listed in the record's `notCheckedNotes` that this pass did not touch (NAWA scholarships, residence registration procedure, NFZ premium, work-permit statement).
