# Spain audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/es.json`, `data/destinations/es.json`, `data/evidence/es.json`,
`data/application-routes/es-public-2027.json`, `data/application-routes/es-private-2027.json`. Spain has no
application-system or context-note files.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| IB Diploma exempt from the access test; no homologation (RD 534/2024 art. 6) | CONFIRMED | https://www.boe.es/buscar/act.php?id=BOE-A-2024-11858 |
| RD 534/2024 "as amended by RD 482/2025" | CORRECTED: also amended by RD 535/2026 (art. 23.2, vocational titles only; IB unaffected) | same |
| Access grade = grade in the foreign system (art. 23.3); UNEDasiss 5–10, up to 14 with PCE | CONFIRMED | same; https://unedasiss.uned.es/faqs |
| 24-point minimum for a UNEDasiss grade | UNVERIFIABLE (secondary sources only; unchanged, already flagged) | — |
| UNEDasiss window 4 Feb–1 Dec each year | CONFIRMED | https://unedasiss.uned.es/fechas_clave |
| 2026 precedents: PCE reg. 16 Mar–28 Apr, exams 25–29 May; Sept reg. 1–22 Jul, exams 2–8 Sep; admission 7 Jul 2026, documents 31 Jul, late documents 31 Oct | CONFIRMED (page still "Fechas clave 2026"; nothing for 2027/28) | same |
| UNED closure periods | CONFIRMED | same |
| UNEDasiss fees "could not be read" | CORRECTED: €70 access grade, €30.30 + €15.15 admin, PCE €35–€140 | https://unedasiss.uned.es/precios (image precios25.jpg) |
| UC3M EU/EEA tuition 2026/27 €16.92–€20.68/credit | CONFIRMED | https://www.uc3m.es/bachelor-degree/admission/application/enrollment/prices |
| Non-EU tuition (was blank) | CORRECTED: UC3M 2026/27 €113.71–€136.44/credit (€6,822.60–€8,186.40 a year) | https://www.uc3m.es/bachelor-degree/admission/application/enrollment/prices/non-eu |
| Private fees "not verifiable" | CORRECTED for Esade: BBA €21,300 for 2027/28; IE, Navarra, Deusto, Comillas still unverified | https://www.esade.edu/bachelor/en/programmes/business-administration |
| IE 2027-28 rounds (18 Sep, 6 Nov 2026, 15 Jan, 5 Mar 2027; from May) | CONFIRMED | https://www.ie.edu/university/admission/admission-process/admissions-rounds/ |
| Deusto application window | ADDED: 2–30 November 2026 | https://www.deusto.es/en/home/study/admissions/undergraduate |
| Navarra IB pathway: 37 Medicine (HL Bio, HL Chem 6), 34 Engineering (HL Maths 6) | CONFIRMED; added SL Physics 5 and 10 July results deadline | https://www.unav.edu/admision-y-ayudas/grado/bachillerato-internacional-ib |
| EU residence: register in the Registro Central de Extranjeros after 3 months | CONFIRMED | https://sede.policia.gob.es/portalCiudadano/_es/tramites_extranjeria_tramite_certificadoregistro_ciudadanoue.php |
| Living costs, becas generales conditions, non-EU work hours | UNVERIFIABLE (left blank / unchanged) | — |
| English-proof rules per university | UNVERIFIABLE (unchanged: "set by each university") | — |

## Corrections

### UNEDasiss fees
- Old: "The official price table is published as an image and could not be read during research, so no euro figure is given here."
- New: access grade €70; file opening €30.30 and secretarial fee €15.15 (never refunded); PCE €35 (one subject) to €140 (six); modalidad €25; language accreditation €25 per language.
- Source: https://unedasiss.uned.es/precios — image table: "Calificación de Acceso 70 euros … Apertura de expediente 30,30 euros". Page text: "En ningún caso procederá la devolución de los precios abonados en concepto de tasas de secretaría y apertura de expediente."
- Note: the image is named `precios25.jpg` and the page names no year; labelled "as published, read 24 September 2026". Evidence `ev-es-unedasiss-precios`.

### Non-EU tuition
- Old: `tuitionNonEu` null; note "Non-EU pricing … was not verified".
- New: UC3M 2026/27, non-EU without Spanish resident status: €113.71–€136.44 per credit, €6,822.60–€8,186.40 for 60 credits. Added as a `non-eu` feeContext in `destinations/es.json`.
- Source: https://www.uc3m.es/bachelor-degree/admission/application/enrollment/prices/non-eu — "UC3M will charge the specific enrollment fees in the chart below to international students without resident status." Evidence `ev-es-uc3m-prices-noneu-2026`.

### Access-rule amendments
- Old: "Real Decreto 534/2024 as amended by RD 482/2025".
- New: "amended by RD 482/2025 and RD 535/2026".
- Source: BOE consolidated text, "Última actualización publicada el 02/07/2026"; art. 23 note "Se modifica el apartado 2 por el art. 12 del Real Decreto 535/2026, de 30 de junio". Apartado 2 concerns Técnico Superior titles; art. 6 (IB) and 23.3 unchanged.

### Esade fees, languages and admissions URL
- Old admissionsUrl `https://www.esade.edu/bachelor/en/admissions` (404). New `https://esade.edu/en/programmes/undergraduate/admissions`.
- Old englishBachelors "English-taught bachelor in Business Administration, plus bilingual law and AI-focused degrees". New: Global Governance, Economics & Legal Order, Business and AI, and Transformational Leadership taught entirely in English; BBA has an English section; Law Spanish with English phased in.
- Source: https://www.esade.edu/bachelor/en/programmes/business-administration — "Intake: 475 (in two sections: bilingual section + English section) … 2027-2028 academic year tuition fees: €21,300". Global Governance page: "The degree is taught entirely in English". Law page: "taught in Spanish and progressively in English".

### UPF
- Old admissionsUrl `https://www.upf.edu/web/graus/en/admissions` (404). New `https://www.upf.edu/en/web/graus/admissio`.
- Old englishBachelors "Some fully English-taught bachelors, including Global Studies". New: International Business Economics fully in English; Global Studies in English for its first two years.
- Sources: https://www.upf.edu/en/web/econ/grau-international-business-economics — "All courses are taught in English." https://www.upf.edu/en/web/humanitats/informacio-estudiant-grau-estudis-globals — "The language of teaching during the first two years is English."

### Universidad de Navarra
- Old englishBachelors "A limited English-taught offer, with several bilingual degrees".
- New: no fully English-taught bachelor's; English "international programme" tracks inside Spanish degrees and bilingual business/economics degrees.
- Source: https://en.unav.edu/studies/degrees lists e.g. "Degree in Medicine + International Program", "Degree in Biology + International Science Program"; no degree is labelled as taught entirely in English.
- IB note: added SL Physics 5 for Engineering and the 10 July results deadline. Source: IB page — "Todos los grados de la Escuela 34 SL Física 5 HL Matemáticas 6"; "Las notas definitivas deben entregarse antes del 10 de julio".

### Universidad de Deusto
- Old admissionsUrl `https://www.deusto.es/en/home/estudios/admision` (now Deusto's 404 page). New `https://www.deusto.es/en/home/study/admissions/undergraduate`.
- Old englishBachelors "Several English-taught and trilingual bachelors, mainly in business and international relations". New: Business Management and Administration can be studied 100% in English; several engineering and data science degrees are bilingual.
- Added route milestone `ms-deusto-apply` (2–30 November 2026) to `es-private-2027`.
- Sources (read in the browser pane; host answers 403 to scripts): undergraduate admission — "open from 2 to 30 November 2026"; BMA page — "You will be able to study the BMA Bachelor's Degree entirely in English."

### Minor
- watchOuts[0] "late May 2026-style windows" reworded to "(25–29 May in 2026)".
- IE Round note marks the 18 September 2026 Early Round as already passed.

## Institutions

| Institution | Website | Admissions URL | Note / English offer |
|---|---|---|---|
| IE | OK | OK | CONFIRMED (English portfolio; own rounds). Fees still unverified |
| UC3M | OK | OK | CONFIRMED: degree finder lists ~15 English-taught bachelor's (International Studies, Aerospace, Data Science, Neuroscience…) |
| UPF | OK | FIXED (404) | CORRECTED |
| UNAV | OK (en.unav.edu; TLS fails for Windows curl, fine in WebFetch) | OK | CORRECTED |
| ESADE | OK | FIXED (404) | CORRECTED |
| UAB | OK | OK | Not re-verified beyond URL |
| Deusto | OK (browser) | FIXED (404) | CORRECTED |
| Comillas | OK | OK | Page describes own entrance exams and interview; English offer not re-verified |
| UAM, UCM, UPC | OK | OK | Not re-verified beyond URL |
| UB | Cloudflare challenge (403) in scripts and browser pane | unchanged | UNVERIFIABLE today; earlier note records it loads in an ordinary browser |

Removed: none.

## New institutions

- **Universidad CEU San Pablo** (Madrid; 699 IB transcripts). Dentistry and Physiotherapy taught in English; BBA and others bilingual. Source: https://www.uspceu.com/en/students/schools/medicine/the-school — "the Degrees Dentistry and Physiotherapy are taught in English". Added with `jurisdiction: "es-private"`; needs geocoding, photo and IB statement centrally.
- Not added: EU Business School (400) — its IB statement is filed under Switzerland ("All locations"). Saint Louis University Madrid (228) is under 300.
