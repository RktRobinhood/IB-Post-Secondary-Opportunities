# Switzerland audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/ch.json`, `data/destinations/ch.json`, `data/evidence/ch.json`,
`data/application-routes/ch-direct-2027.json`. `npm run validate`: all records valid.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| swissuniversities: 32/42 points (no bonus), six categories, three HL including maths or a natural science; still "valid for 2026/27" | CONFIRMED (2027/28 not yet published) | swissuniversities IB page |
| Category contents: natural sciences and humanities lists | CORRECTED (computer science and philosophy were listed inside categories 4 and 5; they are sixth-subject only) | swissuniversities IB page |
| ETH exam-free rule: 38/42, HL maths + science + Language A, three SL from a closed list | CONFIRMED (ETH PDF is still the 2025/26 edition) | ETH admission requirements PDF |
| ETH entrance exam: apply by 31 March 2026, register 15 Sept–15 Oct, exam 18–28 Jan 2027, CHF 550/800, in German | CONFIRMED | ETH entrance examination page |
| ETH application 1 Dec–31 March 23:59 CET; fee charged, amount not stated | CONFIRMED | ETH how to apply |
| ETH tuition CHF 730 / 2,190 per semester | CONFIRMED | ETH tuition fees |
| EPFL: 38/42, HL maths, physics, chem/bio/CS; 6/7 in maths and physics; French B2; mid-Nov–30 April; CHF 150; 10 July documents; 30 Sept backstop; IB holders accepted beginning of August; 3,000 cap | CONFIRMED | EPFL admission criteria and how to apply |
| UZH: 1 Jan–30 April (no visa), 28 Feb (visa), July window Swiss certificates only; German C1 | CONFIRMED | UZH deadlines, UZH bachelor |
| Living cost "could not verify" (null) | CORRECTED (ETH: CHF 22,100 a year living, 28,100 with Group 2 fees) | ETH cost-of-living PDF |
| Health insurance "could not be verified" | CORRECTED (EU students who do not work need not take Swiss insurance; EHIC) | Federal Office of Public Health |
| Work rights "around 15 hours … could not confirm" | CORRECTED / CONFIRMED (15 h/week in term without permit, full time in breaks) | ETH employment for EU/EFTA |
| Application fees "no amount could be verified" | CORRECTED (EPFL CHF 150, HSG CHF 268, EU Business School CHF 200) | EPFL, HSG, EUBS pages |
| St Gallen foreign-student cap "could not be verified" | CORRECTED (places limited by law; selection by online test and video interview) | HSG admission page |
| English-taught bachelor's "mostly at small private institutions" | CORRECTED (USI 3; HSG English Assessment Year) | USI, HSG |
| Residence permit B for EU students | UNVERIFIABLE this pass (not re-read) | — |
| Funding lines | UNVERIFIABLE this pass (not re-read) | — |

## Corrections

### 1. swissuniversities categories
- Old: "(4) natural sciences - biology, chemistry, physics or computer science; (5) humanities and social sciences - geography, history, economics, business management or philosophy"
- New: "(4) natural sciences - biology, chemistry or physics; (5) humanities and social sciences - geography, history, or economics / business and management". The existing sentence that computer science and philosophy count only as the sixth subject now agrees with the list.
- Source: https://www.swissuniversities.ch/en/themen/zulassung/zulassung-universitaere-hochschulen/international-baccalaureate
- Quote: "Natural sciences (biology, chemistry or physics)"

### 2. Living cost
- Old: `livingCostMonthly` null; "this research could not verify an official figure".
- New: about CHF 1,840 a month in Zurich (CHF 22,100 a year), CHF 28,100 a year including ETH Group 2 tuition and study costs.
- Source: https://ethz.ch/content/dam/ethz/main/education/finanzielles/files-en/cost-of-living.pdf
- Quote: "Study and Living Costs International students (approximate)" (table total "22'100")

### 3. Health insurance
- Old: "EU students may in some circumstances be exempted … the rules and the premium could not be verified".
- New: EU/EFTA students who are not working are not required to take Swiss insurance and use the EHIC; working triggers compulsory Swiss insurance.
- Source: https://www.bag.admin.ch/en/health-insurance-foreign-students-in-switzerland
- Quote: "not required to take out Swiss health insurance, provided that they are not working"

### 4. Work rights
- Old: "around 15 hours a week … This research could not confirm the rule from an official page".
- New: up to 15 hours a week in term without a work permit, full time in breaks; more needs a permit. Working ends EHIC cover.
- Source: https://ethz.ch/en/studies/international/after-arrival/employment/eu.html
- Quote: "You need a work permit if you work more than 15 hours per week"

### 5. Application fees
- Old: `applicationFee: null`; "no amount could be verified".
- New: EPFL CHF 150 (foreign certificate), St Gallen CHF 268, ETH amount unstated, UZH none listed for ordinary deadline, EU Business School CHF 200.
- Sources: EPFL how to apply; https://www.unisg.ch/en/studying/admission/admission-bachelor/admission-to-a-bachelors-degree-programme/ — "The application fee is CHF 268."

### 6. English-taught bachelor's and St Gallen
- Old: "English-taught bachelor's exist, but they are mostly at small private institutions"; HSG `englishBachelors: null`, quota "could not be verified", `admissionsUrl` was the homepage.
- New: USI Informatics and Data Science in English, Economics with an English track; HSG Assessment Year in economic sciences entirely in English; HSG foreign places limited by law, selected by online aptitude test and video interview, 1 Oct–30 April. HSG `admissionsUrl` now the bachelor admission page.
- Sources: https://www.usi.ch/en/education/bachelor/bachelor-degrees-at-a-glance — "an English-language track (in parallel with the Italian-language track)"; HSG page — "can be taken either entirely in English or entirely" in German.

### 7. Summary and destination text
- Country summary rewritten shorter; removed the unclear "Switzerland is not outside the EU by accident" sentence and named the public English exceptions.
- Destination sector landscape: "accredited private institution" → "private institution", because Webster Geneva and EU Business School are not on the swissuniversities list of accredited institutions (Franklin is).

### Route
- Added milestone `ms-submit-epfl` (30 April 2027, provisional): EPFL and UZH closing date, with new evidence.

### Evidence
- Re-read and bumped: `ev-ch-swissuniversities-ib`, `ev-ch-eth-how-to-apply`, `ev-ch-eth-tuition`.
- Added `ev-ch-epfl-how-to-apply`, `ev-ch-uzh-deadlines`, `ev-ch-eth-cost-of-living`, `ev-ch-usi-bachelor-languages` (`needs-review`, `read-source`).

## Institutions

| Institution | Check | Change |
|---|---|---|
| ETH, EPFL, UZH | Links fine; bachelor's in German/French | none |
| UNIGE, Unibas, UniBE, UNIL, UniFR, Unilu | Links fine; notes make no English claim; language offer not re-checked one by one | none |
| HSG | `admissionsUrl` pointed at the homepage | fixed to bachelor admission page; `englishBachelors` and note filled |
| USI | English offer confirmed | `englishBachelors` and note made specific |
| Franklin | Link fine; fall 2027 EA 1 Dec, EU deadline 15 July; state-accredited per swissuniversities | none |
| EHL | Link fine; fees only in PDFs | none |
| Webster Geneva | `webster.ch` serves a `*.webster.edu` certificate, so browsers show a security error; HTTP redirects to geneva.webster.edu | `website` → https://geneva.webster.edu/, `admissionsUrl` → https://geneva.webster.edu/admissions/undergraduate/; note gives CHF 17,500 per semester (2026/27) and 24 IB points |

None removed.

## New institutions

- **EU Business School — Geneva campus** (400 IB transcripts, statement listed under Switzerland). English-taught BBA and six other bachelor's at Geneva (Pont-Rouge). IB 24 points; CHF 15,400 per semester (2026/27); application fee CHF 200. Not on swissuniversities' list of accredited institutions (eduQua and US business-school accreditations only), and the note says so. `website` https://www.euruni.edu/, `admissionsUrl` https://www.euruni.edu/en/Programs/Admissions.html. Needs geocoding (Geneva / Lancy) and a photo.

Glion (211) is below the 300 threshold.

## Not verified

- ETH application fee amount.
- Public tuition outside ETH, and EHL and Franklin fees.
- Language offers at the cantonal universities other than UZH.
- EU residence (permit B) and funding text.
