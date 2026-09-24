# Latvia audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/lv.json`, `data/destinations/lv.json`, `data/evidence/lv.json`,
`data/application-routes/lv-direct-2027.json`. Latvia has no application-system or context-note files.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| No central admissions for internationals; apply to each university | CONFIRMED | https://studyinlatvia.lv/admission/entrance-requirements |
| AIC recognition of a foreign diploma is compulsory (via the university) | CONFIRMED | https://www.lu.lv/en/admission/for-international-students/degree/recognition-of-foreign-diplomas/ |
| AIC fee EUR 54.60 | CONFIRMED (legal basis updated) | https://aic.lv/en/recognition-of-foreign-diplomas/academic-recognition-of-foreign-credentials-in-latvia/ |
| AIC processing time "not stated" | CORRECTED: within a month | same |
| No national IB minimum / conversion table | CONFIRMED (none published) | LU and AIC pages above |
| RSU Sept 2027 windows: EU 1 Mar–1 Jul 2027; non-EU 1 Mar–1 May; AA countries 1 Apr | CONFIRMED | https://www.rsu.lv/en/study-here/admissions/when-apply |
| RSU IBSE window (1 Sep 2025 in table, read as 1 Sep 2026, provisional) | CONFIRMED (table unchanged) | same |
| RSU IB late-document concession still carries 2026 wording | CONFIRMED (still not restated for 2027) | same |
| RSU Feb 2027 windows (4 Sep–1 Dec 2026 etc.) | CONFIRMED | same |
| RSU 2026/27 tuition: Medicine 13,500, Dentistry 15,500; same for EU and non-EU | CONFIRMED | https://www.rsu.lv/en/study-here/admissions/tuition-fees |
| RSU International Business tuition | CORRECTED (added EUR 3,300/yr) | same |
| RSU application fee EUR 100; EUR 1,800 registration fee Med/Dent | CONFIRMED | same |
| SSE Riga: 6 Apr deadline, 17 Apr 10:00 test, 11–28 May interviews, 8 Jun EU results, 25 Jul EU registration, 23 Aug start, 150 admitted, grade 6/10 Maths & English, B2 | CONFIRMED | https://www.sseriga.edu/education/bachelor/admission |
| SSE Riga EU fee EUR 5,200 after EUR 2,400 Baltic-EU scholarship; non-EU 7,600; 47 students EUR 218,080 in 2025 | CONFIRMED | https://www.sseriga.edu/education/bachelor/tuition-fee |
| Turiba 1 Feb–1 Aug autumn window (no year), EUR 250 fee | CONFIRMED (still no year: keep provisional) | https://www.turiba.lv/en/admission/admission |
| Turiba accepted English certificates | CORRECTED (added PTE A 51, Linguaskill 160) | same |
| Tuition "under EUR 1,600" for some bachelor's; living EUR 450–700/month | CONFIRMED (undated on page) | https://studyinlatvia.lv/faq/fees-and-costs |
| Work: 20 h/week in term, 40 in holidays (bachelor's) | CONFIRMED | https://studyinlatvia.lv/faq/working-in-latvia |
| Non-EU graduates: 4 months after graduation | CONFIRMED | https://studyinlatvia.lv/faq/visa-and-residence-permit |
| EU residence: register with OCMA after 3 months ("Registration Card") | UNVERIFIABLE in detail | pmlp.gov.lv pages read did not state the document's name clearly |
| State-funded places open to EU citizens; admission on predicted grades | UNVERIFIABLE (unchanged) | — |
| Liepaja University as a separate institution | CORRECTED: merged into RTU on 1 March 2024; removed | https://eng.lsm.lv/article/society/education/29.01.2024-liepaja-university-to-become-rtu-liepaja-academy.a540777/ |

## Corrections

### AIC fee basis and processing time
- Old: "Recognition costs EUR 54.60, a figure in force since 14 July 2022. Processing time was not stated on the pages read."
- New: EUR 54.60, now set by Cabinet Regulation No. 281 of 13 May 2025; statement prepared within a month.
- Source: https://aic.lv/en/recognition-of-foreign-diplomas/academic-recognition-of-foreign-credentials-in-latvia/ — "The statement of the Academic Information Centre is prepared within a month."

### RSU International Business tuition added
- Old: RSU tuition listed Medicine and Dentistry only.
- New: adds International Business & Start-up Entrepreneurship EUR 3,300 a year (2026/2027).
- Source: https://www.rsu.lv/en/study-here/admissions/tuition-fees — International Business and Start-up Entrepreneurship "3,300 EUR" per year, three years.

### Turiba English certificates
- Old: IELTS 5.5, TOEFL iBT 72 … Duolingo 100 or LanguageCert B2.
- New: also PTE Academic 51 and Linguaskill 160.
- Source: https://www.turiba.lv/en/admission/admission — "Pearson Test of English Academic (PTE A) – (51 points)".

### RTU
- Old admissionsUrl `https://www.rtu.lv/en/studies` (403 to automated requests; a bot check in a browser). New `https://apply.rtu.lv/`, which resolves and lists the English programmes.
- Old englishBachelors "count not verified". New: eleven English-taught bachelor's on the portal (BBA at Riga Business School; BSc in civil, mechanical, environmental, materials and medical engineering, computer systems, smart electronic systems, telecommunications, finance management information systems, entrepreneurship and management).
- Note now records that the former Liepaja University is part of RTU.
- Source: https://apply.rtu.lv/ (programme list, read 2026-09-24).

### Liepaja University removed
- liepu.lv now redirects (302) to `https://www.rtu.lv/lv/liepaja`. It joined RTU on 1 March 2024 as RTU Liepaja Academy.
- Source: LSM, https://eng.lsm.lv/article/society/education/29.01.2024-liepaja-university-to-become-rtu-liepaja-academy.a540777/ — Liepaja University is to become "RTU Liepāja Academy". The RTU news page announcing 1 March could not be read (bot check).
- **Central follow-up:** `data/images.json` still has a `lv-liepu` key and `data/places/lv-liepaja.json` is now unused by any Latvian institution. Neither is in my files; please remove centrally if a check complains.

### LBTU
- Old: "A small number, mainly in veterinary medicine, food science and engineering".
- New: three English bachelor's (Biosystems Machinery and Technologies; Information Technologies for Sustainable Development; Sociology of Organisations and Public Administration) plus six-year Veterinary Medicine in English at EUR 9,600/yr. Note adds the 15 July non-visa deadline and EUR 160 EU application fee. No food-science bachelor in English was listed.
- Sources: https://www.lbtu.lv/en/bachelor-study-programmes ; https://www.lbtu.lv/en/veterinary_medicine — "9600 EUR"; https://www.lbtu.lv/en/how-to-apply — "160 EUR – EU/EEA citizens and Swiss nationals".

### Ventspils UAS
- Old: "Very few; count not verified". New: two — Computer Science and Start-Up Management, autumn only; EU applicants close 30 July, EUR 100 fee (as published for the 2026 intake).
- Source: https://en.venta.lv/studies/applications-for-international-degree-seeking-students — "accepted for studies in the Autumn (September) semester only."

### UL FinTech Business School (formerly BA)
- Old: "A small number … count not verified". New: three in English — Business Process Management, Finance Management Information Systems, International Finance.
- Source: https://ftbs.lu.lv/en/admission/study-programs/bachelors-programmes/ — "The language of instruction is indicated in parentheses".

### TSI
- Old: "Several … count not verified". New: seven listed on its English programme page (Computer Science incl. an AI double degree, Computer Engineering and Electronics, Robotics, Transport and Logistics, Aviation Engineering, Business and Management).
- Source: https://tsi.lv/study_programmes/. Caveat: the page did not label each one's language individually.

## Institutions

| Institution | Website | Admissions URL | Note |
|---|---|---|---|
| University of Latvia | OK | OK | English bachelor's list not readable from the overview page; left "not published" |
| RTU | 403/bot check | replaced with apply.rtu.lv | fixed |
| RSU | OK | OK | confirmed |
| SSE Riga | OK | OK | confirmed |
| Turiba | OK | OK | confirmed |
| UL FinTech Business School | OK | OK | English list added |
| LBTU | OK | OK | fixed |
| Ventspils UAS | OK | OK | fixed |
| Liepaja University | redirects to RTU | — | **removed** (merged into RTU, 2024) |
| Art Academy of Latvia | OK | none published | unchanged |
| JVLMA | OK | OK | page does not state teaching language; unchanged |
| TSI | OK | OK | English list added |

## New institutions

None. IB_DISCOVERY.md lists no Latvian institution with 300+ IB transcripts.

## Not verified
- rtu.lv content (bot check): RTU fees, deadlines and the Liepaja merger announcement on RTU's own site.
- The exact name of the EU registration document (the record says "Registration Card").
- Whether EU citizens can compete for state-funded places; whether Latvian institutions admit on predicted IB grades.
- The University of Latvia's English-taught bachelor's count.
