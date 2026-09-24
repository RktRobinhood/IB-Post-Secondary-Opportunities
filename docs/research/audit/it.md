# Italy audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/it.json`, `data/destinations/it.json`, `data/evidence/it.json`,
`data/application-routes/it-direct-2027.json`. Italy has no application-system or context-note files.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| No national application system or deadline for EU students (MUR circular 2026-27/2027-28) | CONFIRMED (not re-read; circular is valid for both years) | https://universitaly-private.cineca.it/uploads/universitaly-pubblico/Circolare_2026-2027_studenti_internazionali.pdf |
| Bocconi 2027-28: Early 2–29 Sep 2026, Winter 25 Nov 2026–26 Jan 2027, 15:00; test cut-offs 24 Sep 2026 and 21 Jan 2027; no spring round | CONFIRMED | https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/application-and-admissions/admissions |
| Bocconi fee €17,000 | CONFIRMED for 2026-27; 2027-28 "will be defined soon" (label added) | https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/fees |
| PoliMi 2026/27 fees: €880.04 first instalment, up to €3,943.04; €157.04 at ISEE ≤ €22,000; reduction below €27,740 | CONFIRMED | https://www.polimi.it/en/prospective-students/how-much-does-it-cost/laurea-laurea-magistrale-and-single-cycle-programmes |
| PoliMi 2027/28 Laurea call | UNVERIFIABLE (still not found) | — |
| TOLC €35, once a month per type, February–November | CONFIRMED | https://www.cisiaonline.it/area-tematica-tolc-cisia/home-tolc-generale/ |
| IMAT 2026 on 29 September 2026 (MUR notice 3 July 2026); 2027 date not published | CONFIRMED | https://corsi.unibo.it/singlecycle/MedicineAndSurgery/notice-board/imat-2026-exam-date-announced |
| "IB Diploma holders are explicitly exempt from the Dichiarazione di Valore" (national framing) | CORRECTED: one university's rule; the Diploma must still be apostilled | San Raffaele PDF (below) |
| Italian quotation attributed to San Raffaele | CORRECTED: the readable document is in English; quoted accurately now | same |
| No national IB minimum or conversion | CONFIRMED (none found) | — |
| EU visa exemption | CONFIRMED (MUR circular, previous read) | circular above |
| Residence (iscrizione anagrafica), SSN fee, non-EU work hours, living costs | UNVERIFIABLE (unchanged) | — |

## Corrections

### IB documents (whyConsider, ibRecognition.notes[0], steps[3])
- Old: "IB Diploma holders are explicitly exempt from the Dichiarazione di Valore paperwork that other foreign students must do", with an Italian quotation.
- New: IB holders are often exempt (San Raffaele says so outright), but the Diploma itself must be apostilled (in Switzerland); the DP Course Results certificate is not enough; each university sets its own document list.
- Source: https://www.unisr.it/attachments/Foreign-qualifications---study-visa/2597eb5d-c87f-4a6b-8d08-e6ec19c70075/d762f86d-f2d3-4ea4-bf6b-53fd5cd82d24.pdf — "The Declaration of Value or the Statement of Comparability are NOT required if the qualification obtained is an IB Diploma. The IB Diploma must be Apostilled in all cases." New evidence `ev-it-unisr-ib-documents` (PDF metadata says 2021; no academic year named).

### Bocconi fee year
- Old: "Bocconi is €17,000 a year." New: "€17,000 a year for 2026-27; its 2027-28 amount had not been set on 24 September 2026."
- Source: Bocconi fees page — "For 2026-27 a.y. … set at € 17,000 per year. The amount for a.y. 2027-28 will be defined soon."
- Bocconi institution note now names both 2027-28 rounds and labels the fee year.

### University of Trento
- Old admissionsUrl `https://www.unitn.it/en/ateneo/1381/admissions` — now UniTrento's "Page not found". New `https://www.unitn.it/en/node/1433` ("Admission to Undergraduate and Single-Cycle Master's Programmes", linked from the site menu).
- Old englishBachelors "A small but well-regarded English-taught offer". New: Comparative, European and International Legal Studies in English; Computer Science, Economics and Management, Biomolecular Sciences and a communications-engineering degree in English and Italian. notableFields: Cognitive Science replaced by Law.
- Source: https://www.unitn.it/en/study/courses — "Comparative, European and International Legal Studies … Language: English". Read in Chrome (Cloudflare check cleared by itself).

## Institutions

| Institution | Website | Admissions URL | Note / English offer |
|---|---|---|---|
| Bocconi | OK | OK | CORRECTED (fee year, rounds) |
| PoliMi, PoliTo, UniBo, Sapienza, UniPD, Luiss, Ca' Foscari | OK | OK | Not re-verified beyond URL |
| UniTN | OK (browser) | FIXED (404) | CORRECTED |
| Bicocca, UniMi, UniTo | Cloudflare challenge that did not clear in either browser; 403 to scripts | unchanged | UNVERIFIABLE today |

Removed: none.

## New institutions

- **Università Cattolica del Sacro Cuore** (Milan, Rome, Brescia, Piacenza; 911 IB transcripts). Nine three-year bachelor's taught in English plus English-taught Medicine (Rome, Bolzano). Applications for 2027/28 open autumn 2026; 31 IB points = priority applicant.
  - Source: https://international.unicatt.it/ucscinternational-undergraduate-programmes — "3-year undergraduate degrees taught in English Business and Finance … Psychology (Milan campus)"; "Applications for Academic Year 2027/2028 will open in Autumn 2026." Entry requirements: "31 points in the IB Diploma".
- Not added (under 300 transcripts): John Cabot (258), Istituto Marangoni (250), IED (233), Humanitas (222), NABA (177).
