# Norway audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/no.json`, `data/destinations/no.json`,
`data/evidence/no.json`, `data/application-routes/no-samordna-2027.json`,
`data/application-systems/no-samordna.json`, `data/context-notes/no-*.json`.

Two findings change what a Danish student should conclude about Norway:

1. **Danish A counts as Norwegian.** Samordna opptak's IB page lists Danish A (HL or SL) at grade 3 or better as meeting the Norwegian requirement. The profile had this as an "open question worth an email" and framed the Norwegian-taught system as needing B2 Norwegian; it is formally open to any Danish IB student with Danish A.
2. **The 1 July / 6 July gap is solved.** The destination said "UNRESOLVED"; Samordna opptak tells graduating IB students to use the IB's Request for Results Service.

## Summary

| Fact | Verdict | Source |
| --- | --- | --- |
| Samordna: opens 1 Feb, closes 15 Apr 23:59, spring documentation 1 Jul, reorder 1 Jul, results 20 Jul, reply 24 Jul 23:59 | CONFIRMED as the 2026 pattern; 2027 calendar still not published (kept provisional) | samordnaopptak.no/tidsfrister |
| How IB results after 1 July are handled | CORRECTED (was unresolved): Request for Results Service with the coordinator | samordnaopptak.no IB laste-opp |
| Norwegian requirement for a Danish IB student ("open question", "reach B2") | CORRECTED: Danish A HL/SL grade 3+ meets it | samordnaopptak.no IB |
| English requirement: IB English grade 3+ or English as language of instruction | CONFIRMED | samordnaopptak.no IB |
| DP Course Results: "more than 20 points" | CORRECTED: "at least 20" (minst 20 poeng) incl. TOK/EE | samordnaopptak.no IB |
| IB → karakterpoeng table (43–45 = 60.0 … 20 = 26.0) | CONFIRMED; table is set by the Ministry | samordnaopptak.no poengberegning |
| Maths AI SL / Math Studies → S1+S2; AA SL/HL, AI HL → R1+R2; Physics SL → Fysikk 1, HL → 1+2 | CONFIRMED | samordnaopptak.no poengberegning |
| 2027 rules: no særskilt vurdering, lottery ties, ranking tests; bigger changes 2028 | CONFIRMED | samordnaopptak.no nye regler |
| UiO Technology Systems 1 Dec 2026 | CONFIRMED; added that all documents are due that day | uio.no |
| NMBU 1 Dec 2026 is "the normal position for a Danish IB student" | CORRECTED: 1 Dec route is for applicants from outside the Nordics without Norwegian; with Danish A, Samordna by 15 April | nmbu.no |
| NMBU "does not offer conditional admission" | UNVERIFIABLE: sentence not on the current page; removed from watch-outs | nmbu.no |
| NHH EU/EEA 1 Jan–15 Feb 2027 | CONFIRMED; added predicted grades by 15 Feb and final diploma by 6 Jul 2027 | nhh.no |
| UiA EU/EEA 1 March | CONFIRMED for Academic Esports and English; CORRECTED for music performance: 15 December | uia.no |
| Nord EU/EEA 1 Feb–15 Apr; documents for spring leavers 1 Jul | CONFIRMED | nord.no |
| KHiO: only Classical Ballet in English; deadline end of February | CONFIRMED (2026 date, 27 Feb) | khio.no |
| BI NOK 106,400/yr for EU/EEA (2026-27) | CONFIRMED | bi.no |
| Living cost NOK 15,488/month, 170,368/yr (2026-27) | CONFIRMED | studyinnorway.no, uio.no |
| Semester fee NOK 850–1,000 | CORRECTED: "approximately 1000 NOK per semester" | studyinnorway.no |
| Non-EU fees no longer cost-covering "since 1 August 2026"; institution fee cuts | UNVERIFIABLE: the amending act (LOV-2026-06-19-60) repeals § 2-6 first paragraph second sentence, but its commencement is "Kongen bestemmer"; the date and the institutions' cuts were not confirmed. UiO 2027/28 NOK 218,000 CONFIRMED | lovdata.no, uio.no |
| Register with the police within three months | CORRECTED: Nordic citizens do not register with the police; report a move to Skatteetaten if staying > 6 months | uio.no |
| Danish SU: Nordic study "does not consume your Danish klippekort" | CORRECTED: paid as if in Denmark (same klip); prescribed length only from 2027 | su.dk |
| Lånekassen: permanent residence (5 years) or worker status | CONFIRMED | lanekassen.no |
| No scholarships for EU/EEA bachelor students | UNVERIFIABLE: Study in Norway's scholarship page did not show the sentence when re-read | studyinnorway.no |
| Healthcare paragraph (EHIC as a tourist) | UNVERIFIABLE for a Danish student: the Helsenorge page cited is for students from *non-Nordic* EU/EEA countries | helsenorge.no |

## Corrections

### Danish A and the Norwegian requirement
- Old: "Open question worth an email: a Danish student holding an IB Diploma … Samordna opptak treats IB as its own entry, which suggests § 2-4 governs … needing Norwegian A or B." Summary: "If you are willing to reach B2 Norwegian, the entire free system opens up".
- New: note settled; summary, whyConsider, destination summary/whyConsider/language note and context note `no-language-is-the-obstacle` now say Danish A at grade 3 documents Norwegian. New evidence `ev-samordna-ib-requirements`.
- Source: https://www.samordnaopptak.no/universitet-og-hogskole/utdanning-fra-utlandet/land/ib/ — "Du dekker kravet i norsk hvis du har karakteren 3 eller bedre i: … Danish A på higher eller standard level".

### Results after the 1 July deadline
- Old (destination meta): "UNRESOLVED: how an applicant whose results arrive on 6 July meets a 1 July documentation deadline." Route `ms-documents`: "how the authority handles that is not established here".
- New: Request for Results Service; destination watch-out, route notes and `ev-samordna-frister` interpretation updated; new evidence `ev-samordna-ib-request-for-results`.
- Source: https://www.samordnaopptak.no/universitet-og-hogskole/utdanning-fra-utlandet/land/ib/laste-opp.html — "Hvis du er avgangselev i år, vil du ikke rekke å laste opp diplomet ditt innen innsendingsfristen 1. juli."

### NMBU route
- Old: "this deadline is for applicants who cannot document Norwegian at B2, which is the normal position for a Danish IB student."
- New: the 1 December route is for applicants "from outside the Nordic countries" who cannot document Norwegian; with Danish A, Samordna by 15 April.
- Source: https://www.nmbu.no/en/studies/application-procedures-study-programmes-taught-english — "If you have upper secondary education from outside the Nordic countries and cannot document proficiency in Norwegian".

### UiO documents
- Added: "You must submit all documents before the application deadline, or your application will not be considered" — so the 1 December route does not work for a May 2027 candidate.
- Source: https://www.uio.no/english/studies/programmes/technology-systems/admission/admission-no-norwegian.html

### UiA music deadline
- Old: one 1 March deadline for all UiA English bachelor's.
- New: added a 15 December 2026 entry (provisional, no year published) for Classical Music Performance and Electronic Music.
- Source: https://www.uia.no/english/studies/how-to-apply/index.html — "Application deadline for all applicants to music performance programmes" (15 December).

### NHH predicted grades
- Added: predicted grades by 15 February 2027, final diploma until 6 July 2027, decisions in May.
- Source: https://www.nhh.no/en/study-programmes/application-and-admission/admission-bsc-in-business-economics-and-data-science/application-process-bsc/ — "If eligible for a conditional offer, submit official predicted grades and final grade reports by 15 February 2027".

### Police registration
- Old: "Register with the police within three months of arrival".
- New: Nordic citizens do not register with the police; report the move to Skatteetaten.
- Source: https://www.uio.no/english/studies/international-students/on-arrival/policeregistration-eu.html — "Please note that Nordic citizens do not have to register with the Police."

### Danish SU
- Old: "Nordic study is treated like studying in Denmark and does not consume your Danish higher-education klippekort."
- New: paid as if studying in Denmark, from the same klip; prescribed length only for starters after 1 July 2025 (from 2027).
- Source: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du få SU og lån, som hvis du læser i Danmark".

### Smaller
- DP Course Results "more than 20 points" → "at least 20 points" ("minst 20 poeng").
- Semester fee "NOK 850–1,000" → "about NOK 1,000 per semester" (studyinnorway.no: "approximately 1000 NOK per semester").

## Institutions

All 14 links resolve (checked 2026-09-24). Redirects are cosmetic (trailing slash; khio.no without www; uib.no → www4.uib.no) and were not changed.

Fixed:
- **UiA** — four English bachelor's confirmed (Academic Esports, Classical Music Performance, Electronic Music, English); note corrected (music closes 15 December; the AACSB business-school line was irrelevant to these four and removed).
- **BI** — "the widest choice of English-taught bachelors in Norway" was wrong (UiA has four, BI three); fee labelled 2026-27.
- **NMBU** — note rewritten for the Danish A route; the "no conditional offers" claim could not be found.
- **UiO** — note adds that every document is due 1 December 2026, and that Norwegian-taught programmes are open with Danish A.
- **NTNU** — "completely inaccessible at bachelor level without Norwegian B2" → open in Norwegian with Danish A. ntnu.edu: "All undergraduate programmes at NTNU are taught in Norwegian".
- **UiS** — "Around 1 — Dance; language not confirmed" → one, Bachelor in Dance: "All undergraduate programmes at the University of Stavanger are taught in Norwegian, except from Bachelor in Dance."
- **NIH** — bachelor's go through Samordna opptak; English provision is master's and online courses.

Checked, no change: Nord (Biology in Bodø, English; deadlines confirmed), KHiO (Classical Ballet only), UiT ("currently does not offer any bachelor programmes taught in English").

Not checked beyond the link: INN (programme language not readable from the listing page), UiB, OsloMet.

Removed: none. NTNU, UiT and NIH teach no bachelor's in English, but with Danish A their Norwegian-taught bachelor's are open to the audience, and all three have IB statements in `data/ib-statements.json` (outside this audit).

## New institutions

None. No Norwegian institution reaches 300 IB transcripts in `docs/research/IB_DISCOVERY.md`.

## Not verified

- 2027 Samordna opptak calendar (not published; 2026 dates kept, provisional).
- Commencement date of the non-EU fee change and the fee cuts at Nord, UiS, INN, USN, OsloMet.
- INN's three English bachelor's; UiB's "three English-listed bachelors are Norwegian-language degrees"; OsloMet's English bachelor.
- Healthcare rules specific to a Nordic student; the "no scholarships for EU/EEA bachelor students" sentence.
