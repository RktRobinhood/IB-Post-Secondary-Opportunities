# DK programme check (autumn 2027 entry)

Checked 2026-09-24 against the institutions' own pages and the national
cut-off list. Records: `data/dk/<institution>.json` (37 programmes). The
site's displayed field comes from `data/programmes/dk-*.json` → `field.primary`
(migrated), which is checked in item 5 alongside `data/dk` `field`.

SUMMARY TABLE: to be added at the end of the run.

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

