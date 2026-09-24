# Hungary audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/hu.json`, `data/destinations/hu.json`, `data/evidence/hu.json`,
`data/application-routes/hu-direct-2027.json`.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Only the IB Diploma counts as the érettségi; conversion 7=100 … 2=39, SL at 2/3; Results Summary with "Diploma awarded" accepted in exam year | CONFIRMED (2026A guide; no 2027A guide yet, the URL 404s) | https://www.felvi.hu/felveteli/jelentkezes/felveteli_tajekoztato/FFT_2026A/kulfoldi_vegzettsegek/orszagok_szerint/ibo |
| Central felvi deadline usually 15 February; 2027 not published | CONFIRMED | https://www.felvi.hu/felveteli/jelentkezes/mikor_es_mire/Mikor_lehet_jelentkezni |
| "Five medical schools teach medicine, dentistry and pharmacy in English" | CORRECTED: four universities teach medicine (Semmelweis, Debrecen, Pécs, Szeged); the fifth "school" was the veterinary university | institutions' own pages below |
| Semmelweis: 9,340 EUR/semester; deadline 31 May 2027; certificate by 21 Aug; USD 400 / 2,000 deposit / 230; no IB mention | CONFIRMED | https://semmelweis.hu/admission/programs/medicine/ |
| Szeged IB exemption (5 in two HL sciences), predicted grades for conditional offer, ~200 intake | CONFIRMED | https://www.med.u-szeged.hu/english/prospective-students/medical-programme-md |
| Szeged 7,900 EUR/semester 2026/27, 800 deposit, EUR 300 discounts | CONFIRMED | https://www.med.u-szeged.hu/fs/fees-and-discounts/tuition-fees-for |
| Debrecen 2026/27 USD 16,900 / 17,500 / 8,000; USD 150 + 350 exam | CONFIRMED | https://edu.unideb.hu/p/tuition-fee-application-entrance-fee |
| Debrecen Sept 2027 final deadline 15 May 2027; Sept 2026 Med/Dent closed early | CONFIRMED | https://edu.unideb.hu/p/application-and-admission |
| Pécs 2027/28 fees (USD 16,750 / 17,350; EUR 8,400; BSc 7,000); USD 200/250/220 | CONFIRMED | https://admissions.medschool.pte.hu/tuition-fees-and-costs |
| Pécs 2027/28 window 1 Nov 2026–30 Jun 2027 | CONFIRMED | https://admissions.medschool.pte.hu/application-form |
| Univet 2026/27 EUR 12,480; 200/250/220; EUR 800 deposit | CONFIRMED | https://univet.hu/en/education/admission/fees-and-costs/ |
| Corvinus accepts IB Diploma; IB English SL5/HL4 and IB Maths SL5/HL4; proof by 1 August | CONFIRMED | https://www.uni-corvinus.hu/post/landing-page/application/admissions-requirements/?lang=en |
| Corvinus non-EEA fee EUR 6,000–6,600 | CORRECTED to EUR 6,600–7,000 | https://www.uni-corvinus.hu/post/landing-page/application/fees-and-costs/?lang=en |
| Corvinus application fee EUR 95 | CORRECTED to EUR 100 | same |
| Corvinus 10% early-admission discount | UNVERIFIABLE today (not on the fees page) | — |
| CEU Fall 2027 rounds 15 Oct, 2 Feb, 15 Apr, 15 Jul; EUR 500 registration; IB English 5; Data Science IB Maths HL5/SL6; Vienna | CONFIRMED (also an EUR 30 application fee) | https://www.ceu.edu/admissions/bachelor |
| Stipendium Hungaricum has no EU sending partner | CONFIRMED | https://stipendiumhungaricum.hu/partners/ |
| EEA students register within 93 days; certificate has no expiry | CONFIRMED | https://studyinhungary.hu/living-in-hungary/menu/formalities/visa.html |
| Registration fee HUF 1,000; issued immediately; valid indefinitely | CONFIRMED | https://oif.gov.hu/egt-allampolgar-regisztracios-igazolas |
| SU capped at 4 years outside the Nordics | CONFIRMED | https://www.su.dk/english/studies-abroad |
| Living-cost figures from Study in Hungary (undated) | Not re-read | — |

## Corrections

### "Five medical schools"
- Old (profile summary, first reason to consider, language summary; destination summary): "five medical schools teach medicine, dentistry and pharmacy fully in English".
- New: four universities (Semmelweis, Debrecen, Pécs, Szeged) teach medicine in English, most also dentistry and pharmacy; Univet teaches veterinary medicine.
- Basis: the site's own list. Each of the four medical schools' pages above confirms its English medicine programme, and Univet's pages describe veterinary medicine only. Szeged's dentistry and pharmacy pages were not read, hence "most".

### Corvinus fees
- Old: non-EEA "6,000 to 6,600 a year"; application fee "95 euros".
- New: non-EEA EUR 6,600–7,000; application fee EUR 100 (also in the steps list).
- Source: Corvinus fees page — "Non-EEA applicants: 6,600–7,000 EUR annually"; "100 EUR applies to self-funded international students".

### BME
- Old: englishBachelors null; admissions pages "could not be verified"; admissions URL redirected.
- New: 13 English-taught BSc degrees plus a single-cycle Architecture MSc; EUR 150 application fee; admissionsUrl is now the final URL `https://www.bme.hu/en/application_and_admission`.
- Sources: https://xplore.bme.hu/available-programmes/ ; https://www.bme.hu/en/application_and_admission — "The application fee is €150".

### ELTE
- Old: admissionsUrl null, englishBachelors null.
- New: admissionsUrl `https://www.elte.hu/en/international-degree-programs`; English bachelor's named at Economics (International Business Economics, Finance and Accounting) and Informatics (Computer Science; Mechanical Engineering in Szombathely); no full count.
- Sources: https://gtk.elte.hu/en/studies/ba?_locale=en ; https://www.inf.elte.hu/en/bachelor-programmes-0.

### Óbuda University
- Old admissionsUrl `https://uni-obuda.hu/admission/` now 301-redirects to the home page. New: `https://uni-obuda.hu/how-to-apply/`. Website → `https://uni-obuda.hu/`.
- Old: "Whether it teaches bachelor's degrees in English could not be verified". New: yes, for example Mechatronics Engineering (7 semesters, English).
- Source: https://bgk.uni-obuda.hu/en/bsc-mechatronical-engineering/ — "Language: English".

### Redirects
- SZTE website `https://www.u-szeged.hu/` → `https://u-szeged.hu/`.

## Institutions

All 14 resolve. None removed. CEU stays listed with its Vienna location note (confirmed). MOME, Liszt Academy, METU and SZE were not re-read and remain "could not be verified".

## New institutions

None. IB_DISCOVERY.md lists no Hungarian institution with 300+ IB transcripts.

## Not verified
- 2027 deadlines at Szeged, Corvinus and Univet (Univet's 1 Jan–30 Jun window remains provisional).
- Corvinus early-admission discount; Szeged's EUR 300 application fee.
- The 2027 felvi.hu guide (FFT_2027A) is not published yet; the IB conversion is the 2026A version.
- Whether EU students need a TAJ card; dormitory access for fee-paying international students.
