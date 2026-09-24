# DK programme check (autumn 2027 entry)

Checked 2026-09-24 against the institutions' own pages and the national
cut-off list. Records: `data/dk/<institution>.json` (37 programmes). The
site's displayed field comes from `data/programmes/dk-*.json` → `field.primary`
(migrated), which is checked in item 5 alongside `data/dk` `field`.

## Summary

"fp" = `field.primary` in `data/programmes/dk-<id>.json`. The same values are
mirrored in `data/opportunities/dk-*-2027-autumn.json` (e.g. `startMonth`,
`minGrade`), so each correction needs making there as well as in `data/dk`.

| programme | status | what to change |
|---|---|---|
| aau-applied-industrial-electronics | OK | — |
| aau-chemical-engineering-and-biotechnology | OK | — (AAU itself says both 24 and 25 places) |
| aau-economics-and-business-administration | MISMATCH | fp engineering → business |
| aau-energy-engineering | MISMATCH | quota1Cutoff null → "All admitted", 2026 intake (KOT 26526) |
| au-cognitive-science | MISMATCH | fp computing → social-sciences |
| au-computer-science | MISMATCH | url → https://bachelor.au.dk/en/computerscience; drop Maths A minGrade 6 from entryRequirements (quota-1-only floor) |
| au-data-science | MISMATCH | url → https://bachelor.au.dk/en/datascience; drop Maths A minGrade 6; fp engineering → computing |
| au-it-product-development | MISMATCH | url → https://bachelor.au.dk/en/itproductdevelopment; drop Maths A minGrade 6 |
| au-economics-and-business-administration | MISMATCH | fp computing → business |
| au-economics-and-business-administration-herning | OK | — |
| cbs-business-administration-and-digital-management | MISMATCH | fp computing → business |
| cbs-business-administration-and-service-management | MISMATCH | fp computing → business |
| cbs-business-administration-and-sociology | MISMATCH | fp computing → business |
| cbs-international-business | MISMATCH | fp computing → business |
| cbs-international-business-and-politics | MISMATCH | fp computing → business |
| cbs-international-shipping-and-trade | OK | — |
| dtu-general-engineering | MISMATCH | quota1Cutoff null → 10.6 (standby 8.5), 2026; startMonth September → August |
| itu-data-science | MISMATCH | startMonth → August; "100 study places" → "100 admitted"; fp engineering → computing |
| itu-global-business-informatics | MISMATCH | startMonth → August; add "no grade requirement if passed at A level" for Maths and English; make fp and data/dk field agree |
| ruc-international-bachelor-natural-sciences | MISMATCH | quota1Cutoff null → "All admitted" (2026); fp computing → natural-sciences |
| ruc-international-bachelor-social-sciences | MISMATCH | quota1Cutoff null → 7.7 (2026); fp computing → social-sciences |
| ruc-bachelor-global-humanities | MISMATCH | quota1Cutoff null → 6.6 (2026); fp computing → humanities |
| sdu-artificial-intelligence | OK | — |
| sdu-computer-science-vejle | OK | — |
| sdu-software-engineering-vejle | MISMATCH (minor) | "18 admitted" → 47 (KOT) |
| sdu-interactive-technology-engineering | MISMATCH (minor) | "47 admitted" → 18 (KOT) |
| sdu-software-engineering-sonderborg | OK | — |
| sdu-mechatronics-bsc | MISMATCH (minor) | "98 admitted" → 47 (KOT) |
| sdu-mechanical-engineering-bsc | MISMATCH (minor) | "86 admitted" → 50 (KOT) |
| sdu-electronics-bsc | OK | — |
| sdu-engineering-innovation-and-business | OK | — |
| sdu-beng-mechatronics | MISMATCH (minor) | "47 admitted" → 98 (KOT) |
| sdu-beng-mechanical-engineering | MISMATCH (minor) | "51 admitted" → 85 (KOT) |
| sdu-beng-electronics | MISMATCH (minor) | "30 admitted" → 32 (KOT) |
| sdu-economics-and-business-administration-sonderborg | MISMATCH | quota 1 GPA floor 6.0 → 7.0 from 2027; delete "lowest floor" sentence; fp engineering → business |
| sdu-european-studies | OK | — |
| sdu-market-and-management-anthropology | MISMATCH | fp computing → social-sciences (why it shows as Computing & IT) |

Every URL loads (HTTP 200). The only redirects are the three AU ones above.
Every restricted-admission flag, language, campus, length, degree and
subject/level requirement matches except where listed.

## Cross-cutting finding: `field.primary` in `data/programmes/dk-*.json`

`data/dk/*.json` `field` values are sensible, but the migrated
`data/programmes/dk-*.json` `field.primary` is wrong for 16 of 37 records
(it does not follow the `keywords`/`data/dk` field). This is why "Market and
Management Anthropology" shows as Computing & IT.

| programmes file | field.primary now | should be |
|---|---|---|
| dk-aau-economics-and-business-administration | engineering | business |
| dk-au-cognitive-science | computing | social-sciences |
| dk-au-data-science | engineering | computing |
| dk-au-economics-and-business-administration | computing | business |
| dk-cbs-business-administration-and-digital-management | computing | business |
| dk-cbs-business-administration-and-service-management | computing | business |
| dk-cbs-business-administration-and-sociology | computing | business |
| dk-cbs-international-business-and-politics | computing | business |
| dk-cbs-international-business | computing | business |
| dk-itu-data-science | engineering | computing |
| dk-itu-global-business-informatics | computing | business (keyword says Business & economics; computing is defensible — pick one and make them agree) |
| dk-ruc-bachelor-in-global-humanities | computing | humanities |
| dk-ruc-international-bachelor-in-natural-sciences | computing | natural-sciences |
| dk-ruc-international-bachelor-in-social-sciences | computing | social-sciences |
| dk-sdu-economics-and-business-administration | engineering | business |
| dk-sdu-market-and-management-anthropology | computing | social-sciences |

---

# Per-programme checks

National list used for every cut-off: Uddannelses- og Forskningsstyrelsen,
"KOT Hovedtal 2026" (28 July 2026), https://ufsn.dk/media/dfsd5xtn/kot-hovedtal-2026.pdf
(xlsx: https://ufsn.dk/media/omyojnzg/kot-hovedtal-2026.xlsx; index page
https://ufsn.dk/statistik/soegning-og-optag-paa-videregaaende-uddannelser/grundtal-om-soegning-og-optagelse/kot-hovedtal/).
Note: the old ufm.dk statistics URLs now 404; the list has moved to ufsn.dk.

## AAU (`data/dk/aau.json`)

### aau-applied-industrial-electronics
1. URL: OK — loads, correct page (https://www.en.aau.dk/education/bachelor/applied-industrial-electronics).
2. Requirements: OK — English B; Mathematics A min. average 4.0; Physics B or Geoscience A. Matches entryRequirements and requirementsText.
3. Quota 1 cut-off: OK — "All admitted" 2026; KOT 26512 "Alle optaget, ledige pladser" (32 admitted). Restricted admission from 2027 per page: OK.
4. Language English, Esbjerg, 3 yrs/180 ECTS, BSc in Engineering (KOT: "BSc in Engineering (Applied Industrial Electronics)"), September: OK.
5. Field Engineering (programmes file: engineering): OK.

### aau-chemical-engineering-and-biotechnology
1. URL: OK — https://www.en.aau.dk/education/bachelor/chemicalengineering-biotechnology loads (the hyphenated variant .../chemical-engineering-and-biotechnology 404s; do not "fix" it).
2. Requirements: OK — English B; Mathematics A min. 4.0; Physics B+Chemistry B, or Physics B+Biotechnology A, or Geoscience A+Chemistry B.
3. Quota 1 cut-off: OK — 3.3 (2026); page "3.3 Quota in 2026"; KOT 26525 kvote 1 3,3 (standby: Alle optaget). Minor: page says both "24 Study places in 2026" and "In 2026 AAU offer 25 student places" — data says 24 (AAU is inconsistent; KOT: 48 admitted).
4. English, Esbjerg, 3 yrs/180 ECTS, BSc in Engineering, September: OK.
5. Field Engineering: OK.

### aau-economics-and-business-administration
1. URL: OK — https://www.en.aau.dk/education/bachelor/economics-and-business-administration.
2. Requirements: OK — English B; Mathematics B; History B or History of Ideas B or Contemporary History B or Social Studies B or International Economics B. No minimum grades.
3. Quota 1 cut-off: OK — 7.5 (2026); page fact box "7.5 Quota in 2026"; KOT 25712 kvote 1 7,5, standby 7,3. (Page body still carries stale 2024 text "minimum grade point average of 5,9"; ignore.)
4. English, Aalborg, 3 yrs/180 ECTS, BSc, September: OK.
5. Field: data/dk "Business & economics" OK; MISMATCH in data/programmes/dk-aau-economics-and-business-administration.json field.primary "engineering" → "business".

### aau-energy-engineering
1. URL: OK — https://www.en.aau.dk/education/bachelor/energy-engineering.
2. Requirements: OK — English B; Mathematics A min. 4.0; Physics B+Chemistry C, or Physics B+Biotechnology A, or Geoscience A+Chemistry C.
3. Quota 1 cut-off: MISMATCH — site null; correct: "All admitted" (2026 intake), KOT 26526 "Alle optaget, ledige pladser" (19 admitted, 139 applicants). Source https://ufsn.dk/media/dfsd5xtn/kot-hovedtal-2026.pdf. (The programme page itself shows no quota figure.)
4. English, Esbjerg, 3 yrs/180 ECTS, BSc in Engineering, September: OK. Specialisations Thermal Processes / Dynamic Systems: OK.
5. Field Engineering: OK.

## AU (`data/dk/au.json`)

AU pages were read directly (page footers dated Aug–Sep 2026, i.e. the pages
for the 2027 round). AU does not print ECTS or the degree title in the page
header; BSc / 3 yrs / 180 ECTS is AU's standard bachelor and is not contradicted.

Modelling note for the three Mathematics-A programmes (computer-science,
data-science, it-product-development): AU's "minimum GPA of 6.0 in
Mathematics A" is a condition **for being assessed in quota 1 only** ("In quota 2,
you must fulfil the above-mentioned admission requirements except the GPA
requirements of 6.0"). The records put `minGrade: 6` on Mathematics A inside
`entryRequirements.all`, which tells a student with Maths below 6 that they are
ineligible — they are not; they can still be admitted in quota 2. Flagged as a
MISMATCH on each of the three below.

### au-cognitive-science
1. URL: OK — https://bachelor.au.dk/en/cognitivescience (no redirect).
2. Requirements: OK — English B; Mathematics B; History B or History of Ideas B or Social Studies B or Contemporary History B; quota 1 GPA floor 6.0.
3. Quota 1 cut-off: OK — 10.7 (standby 10.5), page "Quota 1 2026: 10,7 (Standby: 10,5)"; KOT 22419 10,7 / 10,5.
4. English, Aarhus, week 35 (August), 3 yrs/180 ECTS, BSc: OK. Admission area 22419: OK.
5. Field: data/dk "Social sciences" OK; MISMATCH in data/programmes/dk-au-cognitive-science.json field.primary "computing" → "social-sciences".

### au-computer-science
1. URL: MISMATCH (redirect) — https://bachelor.au.dk/en/computer-science → 301 to https://bachelor.au.dk/en/computerscience. Update `url`, `source`, `quota1Cutoff.source`.
2. Requirements: subjects OK (English B; Mathematics A; quota 1 floors: GPA 6.0 and Mathematics A 6.0). MISMATCH (modelling) — `entryRequirements.all` Mathematics A `minGrade: 6` should not be an entry requirement; it is a quota-1-only floor (see note). Remove `minGrade` and keep the floor in extraRequirements/requirementsText (already there).
3. Quota 1 cut-off: OK — 11.4 (standby 10.5); KOT 22112 11,4 / 10,5.
4. English, Aarhus, August/September, BSc 3 yrs/180 ECTS: OK. Admission area 22112 OK.
5. Field Computing & IT (programmes file: computing): OK.

### au-data-science
1. URL: MISMATCH (redirect) — https://bachelor.au.dk/en/data-science → https://bachelor.au.dk/en/datascience. Update `url`, `source`, `quota1Cutoff.source`.
2. Requirements: subjects OK (English B; Mathematics A; quota 1 floors 6.0 overall and 6.0 in Maths A). MISMATCH (modelling) — remove Mathematics A `minGrade: 6` from `entryRequirements.all` (quota-1-only floor).
3. Quota 1 cut-off: OK — 11.2 (standby 10.1); KOT 22118 11,2 / 10,1.
4. English, Aarhus, August/September, BSc: OK.
5. Field: data/dk "Computing & IT" OK; MISMATCH in data/programmes/dk-au-data-science.json field.primary "engineering" → "computing".

### au-it-product-development
1. URL: MISMATCH (redirect) — https://bachelor.au.dk/en/it-product-development → https://bachelor.au.dk/en/itproductdevelopment. Update `url`, `source`, `quota1Cutoff.source`.
2. Requirements: subjects OK (English B; Mathematics A; quota 1 floors 6.0/6.0). MISMATCH (modelling) — remove Mathematics A `minGrade: 6` from `entryRequirements.all`.
3. Quota 1 cut-off: OK — 10.1 (standby 6.9); KOT 22128 10,1 / 6,9.
4. English, Aarhus, August/September, BSc: OK.
5. Field Computing & IT: OK.

### au-economics-and-business-administration
1. URL: OK — https://bachelor.au.dk/en/economics-and-business-administration.
2. Requirements: OK — English B; Mathematics B; History B or History of Ideas B or Social Studies B or Contemporary History B or International Economics B; quota 1 GPA floor 6.0.
3. Quota 1 cut-off: OK — 9.2 (standby 8.6); KOT 22615 9,2 / 8,6.
4. English, Aarhus, August/September, BSc: OK. Admission area 22615 OK.
5. Field: data/dk "Business & economics" OK; MISMATCH in data/programmes/dk-au-economics-and-business-administration.json field.primary "computing" → "business".

### au-economics-and-business-administration-herning
1. URL: OK — https://bachelor.au.dk/en/economics-and-business-administration-auhe.
2. Requirements: OK — English B; Mathematics B; History B or History of Ideas B or Contemporary History B or Social Science B or International Economics B. No 6.0 floor printed: OK.
3. Quota 1 cut-off: OK — 6.9 (standby 6.0); page "Quota 1 2026: 6,9 (Standby: 6)"; KOT 22935 6,9 / 6,0.
4. English, Herning, August/September, BSc: OK. Admission area 22935 OK.
5. Field Business & economics (programmes file: business): OK.

## CBS (`data/dk/cbs.json`)

Requirements source for all six: https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission
("See the specific entry requirements for English-taught bachelor programmes"),
cross-checked against each programme page's "Entry requirements" fact panel.
Cut-offs: same admission page, 2026 panel (study places / quota split /
1st-priority / total applications / GPA), and KOT 2026. CBS pages give level
"bachelor", language English; 3 yrs/180 ECTS (6 semesters) and Frederiksberg
are consistent with the structure tabs and KOT ("Frederiksberg, Study start:
Summer start"). All six URLs load with no redirect.

### cbs-business-administration-and-digital-management
1. URL: OK.
2. Requirements: OK — English B min. 6.0; Mathematics B; History B or International Economics B or Social Studies B or History of Ideas B or Contemporary History B; language requirement English A.
3. Quota 1 cut-off: OK — 9.8 (2026); KOT 13100 9,8. 210 places, 60/40, 2,210 applications (+24%): OK.
4. English, Frederiksberg, 3 yrs/180 ECTS, BSc, September: OK.
5. Field: data/dk "Business & economics" OK; MISMATCH in data/programmes/dk-cbs-business-administration-and-digital-management.json field.primary "computing" → "business".

### cbs-business-administration-and-service-management
1. URL: OK.
2. Requirements: OK — as DM (English B ≥6.0; Maths B; History-group B; English A).
3. Quota 1 cut-off: OK — 9.4; KOT 13080 9,4. 170 places, 70/30, 1,596 applications: OK.
4. OK.
5. Field: MISMATCH in data/programmes/dk-cbs-business-administration-and-service-management.json field.primary "computing" → "business" (data/dk OK).

### cbs-business-administration-and-sociology
1. URL: OK.
2. Requirements: OK — English B ≥6.0; Mathematics B ≥6.0; History-group B; English A.
3. Quota 1 cut-off: OK — 9.8; KOT 13075 9,8. 100 places, 60/40, 1,234 applications: OK.
4. OK.
5. Field: MISMATCH in data/programmes/dk-cbs-business-administration-and-sociology.json field.primary "computing" → "business" (data/dk OK).

### cbs-international-business
1. URL: OK.
2. Requirements: OK — English B ≥6.0; Maths B; History-group B; English A.
3. Quota 1 cut-off: OK — 11.1; KOT 13060 11,1. 245 places, 60/40, 3,069 applications: OK. (Earlier-year history 11.5/11.4 not re-verified.)
4. OK.
5. Field: MISMATCH in data/programmes/dk-cbs-international-business.json field.primary "computing" → "business" (data/dk OK).

### cbs-international-business-and-politics
1. URL: OK.
2. Requirements: OK — English B ≥6.0; Maths B; History-group B; English A.
3. Quota 1 cut-off: OK — 10.7; KOT 13070 10,7. 190 places, 60/40, 2,093 applications: OK.
4. OK.
5. Field: MISMATCH in data/programmes/dk-cbs-international-business-and-politics.json field.primary "computing" → "business" (data/dk OK). (Could arguably be social-sciences; business matches data/dk.)

### cbs-international-shipping-and-trade
1. URL: OK.
2. Requirements: OK — English B ≥6.0; Maths B; History-group B; English A.
3. Quota 1 cut-off: OK — 10.2; KOT 13280 10,2. 75 places, 50/50, 1,189 applications: OK.
4. OK. Mandatory exchange 2nd year (4th semester: Singapore/Hong Kong/Greece) and 3rd-year internship in a shipping company: OK.
5. Field Business & economics (programmes file: business): OK.

(CBS start month confirmed: intro week 24–28 August 2026, "You are enrolled at CBS with study start 1 September" — https://www.cbs.dk/en/study-programmes/bachelor-programmes/study-start. September OK for all six.)

## DTU (`data/dk/dtu.json`)

### dtu-general-engineering
1. URL: OK — https://www.dtu.dk/english/education/undergraduate/general-engineering and the admission-requirements subpage both load, no redirect.
2. Requirements: OK — Mathematics A, Physics B, Chemistry B, English B; English test (IELTS 6.5 / Cambridge 180 / TOEFL iBT 88) with IB Diploma listed as exempt. IB Diploma ≥24 points qualifies. Source: https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/admission-requirements
3. Quota 1 cut-off: MISMATCH — site null; correct 10.6 (standby 8.5), 2026 intake. KOT 15432 kvote 1 10,6 / standby 8,5; DTU's own table https://www.dtu.dk/uddannelse/ansoegning-og-optagelse/diplomingenioer-bachelor-optagelse/adgangskvotienter (2026: 10,6 / 8,5; 2025: 10,2 / 8,6). Suggested: `{"gpa":"10.6","year":"2026 intake","source":"https://www.dtu.dk/uddannelse/ansoegning-og-optagelse/diplomingenioer-bachelor-optagelse/adgangskvotienter"}`.
4. Start month: MISMATCH — site "September"; DTU page key facts: "Study start: August". Language English, Lyngby, 3 yrs ("The bachelor's programme in General Engineering takes three years")/180 ECTS, BSc (DTU: "Bachelor of Science (BSc) in General Engineering"; KOT: "BSc in Engineering (General Engineering)"): OK. Page also states 150 places (KOT: 175 admitted) and education area code 15432 — could be added.
5. Field Engineering: OK.

## ITU (`data/dk/itu.json`)

ITU start month (both): intro days 17–19 August 2026, "courses commence in week … 35" — https://en.itu.dk/Programmes/Student-Life/Study-Start. Site says September → MISMATCH on both; correct "August".

### itu-data-science
1. URL: OK — https://en.itu.dk/programmes/bsc-programmes/data-science.
2. Requirements: OK — Mathematics A average ≥6; English B average ≥6 (no grade requirement if English passed at A level).
3. Quota 1 cut-off: OK — 5.9 (2026); page "Admission figures 2026 … Admission GPA, quota 1 5.9"; KOT 14525 5,9.
   Minor MISMATCH in extraRequirements: "100 study places in 2026" — page says "Number of admitted students 100" (KOT: 99 admitted); applicants 595 (417 quota 2) OK. Reword to "100 students admitted in 2026".
4. Start month: MISMATCH — "September" → "August" (see above). English, Copenhagen (KOT: København S), 3 yrs/180 ECTS, BSc: OK.
5. Field: data/dk "Computing & IT" OK; MISMATCH in data/programmes/dk-itu-data-science.json field.primary "engineering" → "computing".

### itu-global-business-informatics
1. URL: OK — https://en.itu.dk/programmes/bsc-programmes/global-business-informatics.
2. Requirements: MISMATCH (incomplete) — ITU: "Mathematics corresponding to the Danish B-level with an average mark of at least 6 … (there is no grade requirement if you have passed Mathematics corresponding the Danish A-level)" and the same exemption for English at A level. `requirementsText` omits both A-level exemptions. Add them; and make sure `entryRequirements` Maths B `minGrade: 6` / English B `minGrade: 6` are not applied to a student holding the subject at A level. Danish A (pass, no mark, "new requirement"): OK.
3. Quota 1 cut-off: OK — 7.3 (2026); page and KOT 14515 7,3. 71 admitted; 92%/8% Denmark/international split OK (page gives it as nationality of admitted students; site says "had Danish qualifications" — near enough, could say "were Danish").
4. Start month: MISMATCH — "September" → "August". English, Copenhagen, 3 yrs/180 ECTS, BSc: OK.
5. Field: data/dk "Business & economics"; data/programmes/dk-itu-global-business-informatics.json field.primary "computing" — inconsistent with each other. Either is defensible (business informatics); make them agree (suggest business, as in data/dk).

## RUC (`data/dk/ruc.json`)

All three programme URLs and https://ruc.dk/en/specific-admission-requirements
load (no redirect). Programme pages: "Teaching language English | Study start Aug".
Guaranteed-admission thresholds (2026) and the non-EU/EEA exclusion confirmed at
https://ruc.dk/en/guaranteed-admission-qualified-applicants ("These GPA thresholds
apply to the 2026 intake"; nothing yet for 2027).

All three records have `quota1Cutoff: null`, but KOT 2026 publishes quota 1
results for all three — the guaranteed-admission GPA is not the cut-off.

### ruc-international-bachelor-natural-sciences
1. URL: OK — https://ruc.dk/en/bachelor/international-bachelor-natural-sciences-int. (`source` is the shared requirements page; fine.)
2. Requirements: OK — English B; Mathematics A; Physics B+Chemistry B, or Physics B+Biotechnology A, or Chemistry B+Geoscience A, or Chemistry B+Biology A+Physics C.
3. Quota 1 cut-off: MISMATCH — site null; correct "All admitted" (2026 intake), KOT 16015 "Alle optaget" (83 admitted, 455 applicants). Guaranteed admission at GPA 2.0 (2026): OK.
4. English, Roskilde, August, 3 yrs/180 ECTS, BSc: OK.
5. Field: data/dk "Natural sciences" OK; MISMATCH in data/programmes/dk-ruc-international-bachelor-in-natural-sciences.json field.primary "computing" → "natural-sciences".

### ruc-international-bachelor-social-sciences
1. URL: OK — https://ruc.dk/en/bachelor/international-bachelor-social-sciences-int.
2. Requirements: OK — English B; Mathematics B; History or Social Science or Contemporary History or History of Ideas B; minimum grade: GPA 6.0 overall OR 4.0 in English and Mathematics.
3. Quota 1 cut-off: MISMATCH — site null; correct 7.7 (2026 intake), KOT 16035 "International bachelor in social science" kvote 1 7,7 (107 admitted, 1,015 applicants). Guaranteed admission at 9.0 (2026): OK.
4. English, Roskilde, August, 3 yrs/180 ECTS, BSc: OK.
5. Field: data/dk "Social sciences" OK; MISMATCH in data/programmes/dk-ruc-international-bachelor-in-social-sciences.json field.primary "computing" → "social-sciences".

### ruc-bachelor-global-humanities
1. URL: OK — https://ruc.dk/en/bachelor/bachelor-global-humanities-int.
2. Requirements: OK — English B; History or History of Ideas or Contemporary History B; one additional language (beginner's A or advanced B), not English or the language of instruction.
3. Quota 1 cut-off: MISMATCH — site null; correct 6.6 (2026 intake), KOT 16025 kvote 1 6,6 (98 admitted, 684 applicants). Guaranteed admission at 8.5 (2026): OK.
4. English, Roskilde, August, 3 yrs/180 ECTS, BA: OK.
5. Field: data/dk "Humanities" OK; MISMATCH in data/programmes/dk-ruc-bachelor-in-global-humanities.json field.primary "computing" → "humanities".


## SDU (`data/dk/sdu.json`)

All 15 programme URLs and their `/adgangskrav` pages load with no redirect.
Each page's "Facts about the programme" box gives location, "Study start
September", "Tuition language English", quota split, expected places, "Required
GPA in 2026" and "Number admitted". Requirements come from each `/adgangskrav`
page ("In addition you must have passed: …").

**Cross-cutting: SDU's "Number admitted" figures disagree with the national
KOT 2026 list for seven programmes; the records copy SDU.** The cut-off status is
unaffected (all are "All qualified applicants accepted" / "Alle optaget"), only
the admitted counts in `extraRequirements` are wrong if KOT is right. KOT is the
official ministry count, so use it (or drop the counts):

| record | site (= SDU page) | KOT 2026 (OptOmrNr) |
|---|---|---|
| sdu-interactive-technology-engineering | 47 admitted | 18 (20640) |
| sdu-software-engineering-vejle | 18 admitted | 47 (20660) |
| sdu-mechatronics-bsc | 98 admitted | 47 (19020) |
| sdu-beng-mechatronics | 47 admitted | 98 (19120) |
| sdu-mechanical-engineering-bsc | 86 admitted | 50 (19025) |
| sdu-beng-mechanical-engineering | 51 admitted | 85 (19114) |
| sdu-beng-electronics | 30 admitted | 32 (19112) |

(The pattern — pairs swapped between Vejle ITE/SE and between the Sønderborg BSc/BEng
Mechatronics and Mechanical pages — suggests SDU's own pages carry the figures on the
wrong programme.)

### sdu-artificial-intelligence
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/artificial-intelligence-vejle (+ /adgangskrav).
2. Requirements: OK — English B; Mathematics A. Quota 1 floor 7.0; quota 2 = entrance examination.
3. Quota 1 cut-off: OK — 7.6 (2026); page "Required GPA in 2026: 7,6"; KOT 20600 7,6. 80/20, 30 expected places, 66 admitted: OK.
4. English, Vejle, September, BSc ("Bachelor of Science (BSc) in Artificial Intelligence"), 3 yrs/180 ECTS: OK.
5. Field Computing & IT: OK.

### sdu-computer-science-vejle
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — 7.8; page and KOT 20620 7,8. 88 admitted, no expected places published: OK.
4. English, Vejle, September, BSc in Computer Science: OK.
5. Field Computing & IT: OK.

### sdu-software-engineering-vejle
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — "All qualified applicants accepted"; KOT 20660 "Alle optaget". 30 expected places OK; MISMATCH "18 admitted" → KOT says 47 (see table).
4. English, Vejle, September, BSc in Engineering, 3 yrs/180 ECTS: OK.
5. Field Computing & IT (programmes file: engineering): OK.

### sdu-interactive-technology-engineering
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — all qualified accepted; KOT 20640 "Alle optaget". 30 expected places OK; MISMATCH "47 admitted" → KOT says 18.
4. English, Vejle, September, BSc in Engineering: OK.
5. Field Computing & IT / engineering: OK.

### sdu-software-engineering-sonderborg
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/softwareengineering-sb.
2. Requirements: OK — English B; Mathematics A; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — all qualified accepted; KOT 19035 "Alle optaget". 120 expected, 44 admitted: OK (KOT 44).
4. English, Sønderborg, September, BSc in Engineering: OK.
5. Field: OK.

### sdu-mechatronics-bsc
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — all qualified accepted; KOT 19020 "Alle optaget". 100 expected places OK; MISMATCH "98 admitted" → KOT 47.
4. English, Sønderborg, September, BSc in Engineering, 3 yrs/180 ECTS: OK.
5. Field Engineering: OK.

### sdu-mechanical-engineering-bsc
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B+Chemistry C, or Physics B+Biotechnology A, or Geoscience A+Chemistry C.
3. Quota 1 cut-off: OK — all qualified accepted; KOT 19025 "Alle optaget". 65 expected OK; MISMATCH "86 admitted" → KOT 50.
4. English, Sønderborg, September, BSc in Engineering: OK.
5. Field: OK.

### sdu-electronics-bsc
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; floor 7.0.
3. Quota 1 cut-off: OK — all accepted; KOT 19030 "Alle optaget". 30 expected, 24 admitted: OK (KOT 24).
4. English, Sønderborg, September, BSc in Engineering: OK.
5. Field: OK.

### sdu-engineering-innovation-and-business
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/innovation_and_business.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; floor 7.0.
3. Quota 1 cut-off: OK — all accepted; KOT 19010 "Alle optaget". 65 expected, 58 admitted: OK (KOT 58).
4. English, Sønderborg, September, BSc in Engineering: OK.
5. Field Engineering: OK.

### sdu-beng-mechatronics
1. URL: OK — https://www.sdu.dk/en/uddannelse/ingenioer/mekatronik.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; quota 1 floor 5.0.
3. Quota 1 cut-off: OK — all accepted; KOT 19120 "Alle optaget". 40 expected OK; MISMATCH "47 admitted" → KOT 98.
4. English, Sønderborg, September, BEng, 3.5 yrs/210 ECTS: OK.
5. Field: OK.

### sdu-beng-mechanical-engineering
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B+Chemistry C, or Physics B+Biotechnology A, or Geoscience A+Chemistry C, or Geoscience A+Biotechnology A; floor 5.0.
3. Quota 1 cut-off: OK — all accepted; KOT 19114 "Alle optaget". 65 expected OK; MISMATCH "51 admitted" → KOT 85.
4. English, Sønderborg, September, BEng ("Bachelor of Engineering in Mechanical Engineering"), 3½ yrs/210 ECTS: OK.
5. Field: OK.

### sdu-beng-electronics
1. URL: OK.
2. Requirements: OK — English B; Mathematics A; Physics B or Geoscience A; floor 5.0.
3. Quota 1 cut-off: OK — all accepted; KOT 19112 "Alle optaget". 40 expected OK; minor MISMATCH "30 admitted" → KOT 32.
4. English, Sønderborg, September, BEng, 3½ yrs/210 ECTS: OK.
5. Field: OK.

### sdu-economics-and-business-administration-sonderborg
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/ha-soenderborg.
2. Requirements: subjects OK — English B; Mathematics B; History or Social Sciences or History of Ideas or Contemporary History or International Economy B.
   MISMATCH (2027 change) — the /adgangskrav page now says: "Change of admission requirements from 2027 — If you are applying for the programme from 2027 onwards, please note that the grade requirement for quota 1 will change to 7,0." The record's extraRequirements says the floor is 6.0 and calls it "the lowest floor of any SDU BSc listed here". Correct for 2027 entry: quota 1 GPA floor 7.0; delete the "lowest floor" sentence. (The facts box still shows "GPA in quota 1: 6.0" — the 2026 value.) Source: https://www.sdu.dk/en/uddannelse/bachelor/ha-soenderborg/adgangskrav
3. Quota 1 cut-off: OK — 8.3 (2026); page and KOT 19215 8,3. 65 expected, 103 admitted: OK (KOT 103). Quota split 65/35.
4. English, Sønderborg, September, BSc, 3 yrs/180 ECTS: OK.
5. Field: data/dk "Business & economics" OK; MISMATCH in data/programmes/dk-sdu-economics-and-business-administration.json field.primary "engineering" → "business".

### sdu-european-studies
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/europaeiske_studier.
2. Requirements: OK — English B; Mathematics B; History or Social Sciences or History of Ideas or Contemporary History B; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — 8.2 (2026); page and KOT 19225 8,2. 45 expected, 76 admitted: OK (KOT 76).
4. English, Sønderborg, September, BSc in European Studies: OK.
5. Field Social sciences / social-sciences: OK.

### sdu-market-and-management-anthropology
1. URL: OK — https://www.sdu.dk/en/uddannelse/bachelor/market_management_anthropology.
2. Requirements: OK — English B; Mathematics B; History or Social Sciences or History of Ideas or Contemporary History B; quota 1 floor 7.0.
3. Quota 1 cut-off: OK — 8.7 (2026); page and KOT 17430 8,7. 40 expected, 48 admitted: OK (KOT 48). Split 75/25. Compulsory fieldwork abroad: OK. "Highest 2026 cut-off of any SDU English-taught bachelor" — true among the 15 listed.
4. English, Odense (KOT: Odense M), September, BSc, 3 yrs/180 ECTS: OK.
5. Field: data/dk "Social sciences" is right, but the site shows it as Computing & IT because data/programmes/dk-sdu-market-and-management-anthropology.json has field.primary "computing". MISMATCH → "social-sciences" (business would also be defensible — it sits in SDU Business School — but not computing).

