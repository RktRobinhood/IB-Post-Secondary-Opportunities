# Finland audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/fi.json`, `data/destinations/fi.json`,
`data/evidence/fi.json`, `data/application-routes/fi-studyinfo-2027.json`,
`data/application-systems/fi-studyinfo.json`. The records had been researched on 22–23 September 2026;
this pass re-read the official pages behind every consequential fact.

## Summary

| Fact | Verdict | Source |
| --- | --- | --- |
| Joint application 7–21 January 2027, six choices | CONFIRMED | studyinfinland.fi, jyu.fi, tuni.fi |
| Closing time of the joint application (was "could not be confirmed") | CORRECTED: 15:00 Finnish time (UTC+2) | tuni.fi, metropolia.fi, jamk.fi, xamk.fi |
| Aalto still says 7–22 January | CONFIRMED (Aalto's page unchanged; kept as a warning) | aalto.fi |
| Aalto Round A results "by March 2027", provisional 31 March | CORRECTED: Aalto now publishes "by 31 March 2027"; no longer provisional | aalto.fi |
| Aalto Round B / JYU certificate results by 28 May 2027 | CONFIRMED; Tampere group II by 31 May added | aalto.fi, jyu.fi, tuni.fi |
| Helsinki Admission group 2 (IB) 9–23 March 2027, 15.00 UTC+2 | CONFIRMED | helsinki.fi |
| Åbo Akademi "had published no 2027 dates" | CORRECTED: bachelor round (Swedish) 9–23.3.2027 at 15.00 | abo.fi |
| JYU: attachments 28 Jan, predicted grades 1 Apr, final grades 13 Jul 2027 | CONFIRMED | jyu.fi |
| International UAS Exam: pre-ID 10–12 Mar, invitation 22 Mar, exam 23 Mar 12:00, results 14 Apr 2027 | CONFIRMED | uasinfo.fi |
| LUT rolling admission 1 Sep 2026–30 Apr 2027, non-competitive | CONFIRMED | lut.fi |
| LUT IB criteria: 24 points + Diploma; maths list; business SL 5/HL 4 + one subject 5 | CONFIRMED (table headed "2026 Entry requirements") | lut.fi |
| Certificate-scoring maxima 172.1 / 158.9 / 155.6 / 149.9; HL maths 7 = 39.7, SL 7 = 28.2 | CONFIRMED | yliopistovalinnat.fi |
| "2027 scoring tables not yet published" | CORRECTED: tables are headed "from 2026 on"; programme lists updated each Oct–Nov | yliopistovalinnat.fi |
| Health Sciences table may cover medicine | CORRECTED: English table lists only UEF Human and Planetary Health | yliopistovalinnat.fi |
| Tampere: IB lets you apply in groups I and II | CORRECTED (qualified): group I needs SAT/ACT | tuni.fi |
| Oulu: IB Diploma earned abroad qualifies for certificate selection | CONFIRMED ("in Finland or abroad") | oulu.fi |
| No tuition for EU/EEA/Swiss | CONFIRMED | studyinfinland.fi, helsinki.fi, haaga-helia.fi |
| Non-EU tuition €8,000–20,000; Helsinki €13,000; Haaga-Helia €11,000; Metropolia €11,500/12,000; LUT €12,000 (−€2,000 early bird) | CONFIRMED | studyinfinland.fi, helsinki.fi, haaga-helia.fi, metropolia.fi, lut.fi |
| Non-EU tuition: LAB, Arcada, Laurea, Vaasa, TAMK figures | UNVERIFIABLE in this pass (fee pages not found or not re-read); left as recorded | — |
| €100 application fee, non-EU only | CONFIRMED | aalto.fi, utu.fi, studyinfinland.fi |
| Living costs €900–1,200; Migri minimum €800/month (€9,600/yr) | CONFIRMED | studyinfinland.fi, migri.fi |
| Nordic citizens register with DVV, not Migri | CONFIRMED | migri.fi |
| Non-EU permit €600 e-service / €750 paper / €400 minor | CONFIRMED | migri.fi |
| Non-EU work: 30 h/week average, 120 h/month, 1,560 h/year | CONFIRMED | migri.fi |
| Kela: EU students' stay temporary; 10 h/week for 4 months opens student aid | CONFIRMED | kela.fi |
| Student healthcare fee €35.35/term (2026), and the "contradiction" about EU students | CORRECTED: Kela now says EU/EEA-insured students do not pay; send EHIC copy | kela.fi |
| TAMK TOEFL "35+" | CORRECTED: TOEFL iBT 3.5 on the new 1–6 scale (60 if taken before 21 Jan 2026) | tuni.fi/tamk |
| Danish SU: Nordic study = prescribed length + 12 months | CORRECTED: SU as if in Denmark; for starters after 1 July 2025, prescribed length only from 2027 | su.dk |
| Housing: HOAS waiting times | UNVERIFIABLE (HOAS front page shows rents, not the waiting-time sentence) | hoas.fi |

## Corrections

### Joint application closing time
- Old: "no closing time is recorded here. Treat the deadline as the 21st, early in the day."
- New: closes 21 January 2027 at 15:00 Finnish time (UTC+2); `timeOfDay` 15:00 added to the profile deadline and to route milestone `ms-joint-application`; new evidence `ev-fi-tampere-joint-application-2027`.
- Source: https://www.tuni.fi/en/tau/bachelors-programmes/applying — "7 Jan 2027 at 8.00 UTC+2 to 21 Jan 2027 at 15.00 UTC+2". Also https://www.metropolia.fi/en/study-at-metropolia/applying/joint-application — "7 January 2027 at 8 am - 21 January 2027 at 3 pm local time in Finland".

### Aalto Round A results
- Old: date 2027-03-31, `provisional: true`, "Aalto publishes only a month".
- New: `provisional: false`; Aalto now gives the day.
- Source: https://www.aalto.fi/en/admission-services/apply-to-bachelors-programmes-in-english — results for round A "by 31 March 2027".

### Åbo Akademi dates and English master's
- Old: "it had published no 2027 dates"; "Around 16 master's degrees are in English."
- New: bachelor round 9–23 March 2027 (Swedish-taught); nine international master's in English.
- Source: https://www.abo.fi/en/study/apply/application-guide-bachelors-level/ — "9-23.3.2027 – apply to the bachelor's degree programmes"; "9 international master's degree programmes taught in English".

### Scoring tables and health sciences
- Old: "The 2027 versions had not been published"; "Whether the Health Sciences table covers medicine and dentistry is unverified."
- New: tables apply "from 2026 on"; programme lists are updated every October–November; the English Health Sciences table lists only UEF's Human and Planetary Health.
- Source: https://yliopistovalinnat.fi/en/scoring-of-certificate-based-admissions-in-2026/technology-and-engineering — "Certificate-based admissions from 2026 on"; health_sciences page — "The information for the upcoming year will be updated every October-November."

### Tampere's two admission groups
- Old: "holding the IB lets you apply in both admission group I and group II on the same January form".
- New: same, but group I is ranked on SAT/ACT, so the second shot needs a test score (profile note and institution note).
- Source: https://www.tuni.fi/en/tau/bachelors-programmes/eligibility-criteria — "admission group I: admission based on the SAT or ACT test"; "you can apply in both admission groups I and II".

### Student healthcare fee
- Old: "Kela says every registered degree student pays the 70.70-euro annual healthcare fee, while the FSHS page says EU/EEA students … are exempt. Ask FSHS directly."
- New: Kela itself exempts students with EU/EEA social security coverage; send a copy of the EHIC.
- Source: https://www.kela.fi/student-healthcare-fee-higher-education — "If you have social security coverage in another EU or EEA country … you do not have to pay the healthcare fee."

### TAMK English test
- Old: "Its page also lists 'TOEFL iBT 35+', which looks like a section minimum".
- New: TOEFL iBT 3.5 on the new 1–6 scale; 60 for tests before 21 January 2026.
- Source: https://www.tuni.fi/en/tamk/apply/bachelors-degrees/how-to-apply — "TOEFL Academic (iBT): a minimum total score of 3.5".

### Danish SU in a Nordic country
- Old: "SU covers the prescribed length of the programme plus up to twelve extra months".
- New: SU and loans as if studying in Denmark; for anyone starting after 1 July 2025, from 1 January 2027 that is the prescribed length only (the extra 12 portions remain only for disability/single-provider supplements). su.dk's English "studies abroad" page still carries the old "another 12 months" sentence.
- Sources: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du få SU og lån, som hvis du læser i Danmark"; https://www.su.dk/su-reform/su-reform-in-english — "From 2027 you can receive educational grant portions (SU-klip) corresponding to the education's prescribed duration".

## Institutions

All 14 `website` and `admissionsUrl` links resolve to the right pages (checked 2026-09-24); the only redirects are trailing-slash changes, not updated. UEF's site (uef.fi) answers every automated request, including a browser, with a Cloudflare challenge; it was not bypassed.

Fixed:
- **Tampere (TAU)** — note qualified: group I needs SAT/ACT. 11 English-taught bachelor's confirmed on tuni.fi.
- **LUT** — 15 bachelor's confirmed; four are HEBUT double degrees (added). Criteria table still labelled 2026 (added).
- **Åbo Akademi** — 9 English master's, not ~16; all bachelor's in Swedish confirmed.
- **UEF** — `englishBachelors` was null: now "at least one: Human and Planetary Health (Kuopio)", from the national list; `notableFields` was empty and now holds only "Health sciences", the one field the national list confirms.
- **Laurea** — criteria page now reachable: entrance exam or SAT, IB eligible; no 2027 dates.
- **Arcada** — 2027 listing read: same four programmes, all in the 7–21 January 2027 joint application; the "completed in Finland" condition applies only to Reifeprüfung/DIA, not the IB.

Checked, no change: Helsinki (2 in English: Liberal Arts and Sciences, Science), Aalto (6 programmes, 11 options), Oulu (4; IBM certificate-based in January, SAT in October rolling round), Turku (7–21 January 2027; 2027 predicted-grade date not yet published), Jyväskylä (3), Metropolia, Haaga-Helia (rolling 30 Oct 2026–12 May 2027 confirmed), TAMK (SAT by 31 March 2027 confirmed).

Removed: none. **Åbo Akademi** teaches no bachelor's in English and was kept: its bachelor's are in Swedish, which a Danish student may be able to document, and it has an IB statement (`fi-aa` in `data/ib-statements.json`, outside this audit) that a removal would orphan. Coordinator's call. (Institutions that teach no English bachelor's *and* require Icelandic or Estonian were removed in the Iceland and Estonia audits.)

## New institutions

None. No Finnish institution in `docs/research/IB_DISCOVERY.md` reaches 300 IB transcripts (Hanken, the only one listed, has 177).

## Not verified

- UEF's own programme list, deadlines and fees (site blocks automated reading).
- Non-EU fees at LAB, Arcada, Laurea, Vaasa and TAMK.
- HOAS's "few weeks to over a year" waiting-time sentence.
- Aalto's programme-level IB thresholds (unchanged from the earlier pass).
