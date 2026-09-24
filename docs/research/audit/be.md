# Belgium (be) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/be.json`, `data/destinations/be.json`,
`data/evidence/be.json`, `data/application-routes/be-fl-direct-2027.json`, `be-fwb-direct-2027.json`.
Belgium has no application system or context-note files. The record was heavily researched on 2026-09-23. This pass re-read the sources that decide the answers and corrected what those sources contradicted.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Flanders EEA tuition EUR 1,181.40 (60 credits, 2026-27); non-EEA EUR 5,300-12,000, arts EUR 8,800-25,000 | CONFIRMED | studyinflanders.be tuition-fees |
| French-speaking minerval 2026-27: EUR 0 / 374 / 835 / 1,194 | CONFIRMED | actus.ulb.be new minerval scale |
| Flemish entrance exams 2 Jul (arts), 3 Jul (tandarts), 4 Jul (dierenarts) 2027; register 1 Mar-17 May 2027; diploma by 30 Sep | CONFIRMED (re-read in a browser) | vlaanderen.be/toelatingsexamens |
| ARES concours 2027 date and registration | UNVERIFIABLE, still unpublished ("Pour 2027, la date du concours n'est pas encore connue") | mesetudes.be/concoursmd/le-concours |
| FWB: full IB Diploma needs no equivalence | CONFIRMED (watchOuts) | equivalences.cfwb.be |
| ibRecognition note "an equivalence decision … is normally required" (FWB) | **CORRECTED**: it contradicted the watchOut and the source for a full IB Diploma | same |
| Step "for KU Leuven, 1 June for EEA citizens in the 2026-2027 cycle" | **CORRECTED**: the record's own deadline entry says no such date appears on any KU Leuven page | kuleuven.be apply page; application-windows tool |
| Jobstudent annual hours ("confirm the current limit"; "no official page retrieved") | **CORRECTED**: 650 hours a year at reduced contributions since 1 Jan 2025 | studentatwork.be (federal) |
| Non-EU student work limit | UNVERIFIABLE (not re-read; hedge kept) | n/a |
| KU Leuven English bachelor's ("including Business Administration and European Studies") | CONFIRMED, list extended (Business Administration, Business Engineering, European Studies, Engineering Technology, Philosophy, Theology). Source is a July 2023 brochure; the live programme-guide language filter did not apply in the browser | kuleuven.be brochure |
| KU Leuven "oldest Catholic university in the world and consistently the highest-ranked in Belgium" | **CORRECTED**: unsourced superlatives removed | n/a |
| UGent "very limited" | CONFIRMED (3 English-taught bachelor's listed for 2026-27) | studiekiezer.ugent.be |
| UAntwerpen "limited" | **CORRECTED**: exactly two (Social-Economic Sciences, Urban Sustainability Studies) | uantwerpen.be bachelors |
| VUB "a handful … shared with Vesalius College"; "widest English offer of the Flemish universities" | **CORRECTED**: three (Business Economics, Linguistics and Literary Studies, Social Sciences with UGent). Vesalius no longer exists under that name, and KU Leuven has more | vub.be programmes |
| UHasselt "Limited" | **CORRECTED**: none. All 18 academic bachelor's listed are in Dutch | uhasselt.be/en/study/programmes |
| Thomas More "the largest Flemish university of applied sciences" | **CORRECTED** to its own published claim: "the largest portfolio of English-taught professional bachelor programmes in Belgium" | thomasmore.be/en |

## Corrections

### FWB equivalence note (ibRecognition.notes[1], steps[2])
- Old: "an equivalence decision for your foreign secondary diploma is normally required before enrolment … The exact deadline and fee could not be confirmed".
- New: a full IB Diploma from an IB-recognised school needs no equivalence. Other diplomas, and IB Course Results without the Diploma, go through the equivalence service.
- Source: https://equivalences.cfwb.be/equivalences-secondaires/equivalence/demander-une-equivalence/jai-termine-mes-etudes-secondaires/ecoles-europeennes-et-internationales (as recorded in `ev-be-fwb-ib-equivalence`).

### KU Leuven deadline in steps[4]
- Old: "(for KU Leuven, 1 June for EEA citizens in the 2026-2027 cycle)".
- New: KU Leuven sets deadlines per programme and publishes them only through its application-windows tool.
- Source: https://www.kuleuven.be/english/apply/application-instructions/apply-to-kuleuven — "Every programme at KU Leuven has its own entry requirements, application procedure and deadlines" (quoted in the record's own deadline entry).

### Work rights and funding
- Old: "that ceiling is set by federal law and changes … No official page confirming the current hour limits was successfully retrieved".
- New: 650 hours a year at 2.71% instead of 13.07% contributions, since 1 January 2025.
- Source: https://www.studentatwork.be/en/hours-package-and-impact.html — "Since January 1, 2025 this package contains 650 hours."

### English-taught bachelor's per university
- UAntwerpen. Old: "Limited at bachelor level". New: "Two: Social-Economic Sciences and Urban Sustainability Studies". Source: https://www.uantwerpen.be/en/study/programmes/bachelors/ ("Language: Taught in English" on those two only).
- VUB. Old: "A handful, including social sciences and business routes shared with Vesalius College"; note "the widest English offer of the Flemish universities". New: three named; the note no longer compares. Source: https://www.vub.be/en/all-study-programmes-vub/bachelors-and-masters-programmes-vub (filter Bachelor + English → "3 results found").
- UHasselt. Old: "Limited". New: "None: every bachelor's programme is taught in Dutch". Source: https://www.uhasselt.be/en/study/programmes. All 11 listing pages were read, and every "Bachelor of …" row says Dutch.
- UGent. Wording now states the count: "three English-taught bachelor's listed for 2026-2027". Source: https://studiekiezer.ugent.be/en/zoek?otc=Ba&taal=EN — "3 programmes found".

## Institutions

All 14 were checked.
- **Thomas More**: www redirects to the bare domain; website and admissionsUrl updated to `https://thomasmore.be/en…`.
- **UMONS**: the admissionsUrl `web.umons.ac.be/fr/inscriptions/` redirects to `web.umons.ac.be/location/inscriptions/` ("Inscriptions - Université de Mons"); updated.
- **Odisee**: www.odisee.be is behind a Cloudflare bot check, which did not clear in a browser. UNVERIFIABLE. Its record makes no English-teaching claim (`englishBachelors: null`). A search found only exchange courses in English, so whether it teaches a full bachelor's in English is **not established**.
- **Vesalius / Brussels School of Governance**: links resolve to brussels-school.be; fully English-taught BA confirmed by the existing record.
- Removed: none. **Flag for the coordinator:** UHasselt teaches **no** bachelor's in English (verified today). UCLouvain, ULB, ULiège and UMONS are recorded as "essentially none"; that was not re-verified today. They are kept because the page deliberately says where the answer is no ("mostly not in English at bachelor level"). The Danish page keeps Copenhagen for the same reason. UCLouvain and ULiège also have entries in `data/ib-statements.json`, which this pass may not edit. If the rule is to list only institutions with an English-taught bachelor's, remove those five together with their ib-statements lines.

## New institutions

None. IB_DISCOVERY.md lists no Belgian institution with 300+ IB transcripts.
