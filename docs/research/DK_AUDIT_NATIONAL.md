# Denmark national facts audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Scope: national-level facts on the Denmark pages and data
(`src/pages/denmark.mjs`, `data/destinations/dk.json`, `data/application-systems/dk-optagelse.json`,
`data/application-routes/dk-optagelse-international-2027.json`, `data/evidence/dk-national.json`,
`data/ib-conversion.json`, `data/ib-calendar.json`, `data/preparation.json` entries for dk, plus the dk context notes).
No code or data was edited. Each fact records the claim, location, verdict, correct value, source and retrieval date.

Verdicts: CONFIRMED / WRONG / OUTDATED / UNVERIFIABLE.

Note on the Eksamenshåndbogen: the page `ufsn.dk/.../eksamenshaandbogen/lande-og-eksaminer/` is an empty shell that loads an
iframe. The IB content lives at `https://ufmembedlandedb-g3c6dhagdga8bbhf.northeurope-01.azurewebsites.net/?handbookId=3&countryId=269&subjectId=N`
(N=1 Eksaminer, 2 Fagniveauer, 3 Karakterer). This is why `scripts/verify-evidence.mjs` finds "0 of 12 content words" on every
record pointing at the shell URL. It was read in a browser for this audit.

## Summary table

| # | Fact | Verdict | Correction / note |
|---|------|---------|-------------------|
| F1 | 15 March 12:00 CET deadline, all IB/international applicants, quota 1 and 2 | CONFIRMED | 2027 not yet published; keep provisional |
| F2 | Answer on 28 July | CONFIRMED | |
| F3 | Up to 8 programmes, ranked, one offer | CONFIRMED | |
| F4 | Optagelse.dk opens 1 February | CONFIRMED | pattern; 2027 unpublished |
| F5 | 24 points / IB Diploma = general access | CONFIRMED | evidence `ev-ufsn-ib-eksaminer` cites the wrong URL |
| F6 | Diploma may contain a 2 | CONFIRMED | |
| F7 | DP Course Results rules, supplering, GSK | CONFIRMED | |
| F8 | Conversion table (30→6.9, 36→9.3, 40→10.7 etc.) | CONFIRMED | all 28 rows + legacy + single grades match; "re-issued every year" should be "reviewed every year" |
| F9 | Retake D/R rule | CONFIRMED | |
| F10 | HL→A, SL→B, maths AA/AI, Global Politics, TOK, Geoscience, Danish | CONFIRMED | handbook silent on Danish A Lang & Lit |
| F11 | IB results 6 July (Danish rule owner) | CONFIRMED | can now be cited in `ib-calendar.json` |
| F12 | IB results 6 July 2027 (ibo.org) | UNVERIFIABLE | ibo.org behind Cloudflare |
| F13 | Results service: six institutions; codes 002600/000150/000148/000157 | CONFIRMED | KU wants IB access by 1 May |
| F14 | 5 July = documentation deadline for IB applicants | **WRONG** (national claim) | institution-specific: AU/AAU 5 July, KU at application/1 May, S-E-A 1 April. Priority changes until 5 July 12:00 CONFIRMED |
| F15 | Signature page "some institutions only" | **WRONG** | required of every applicant who does not sign with MitID; send to each institution by 15 March 12:00 |
| F16 | Optagelse.dk "uses MitID" (identity requirement) | **WRONG** | MitID optional; no-CPR applicants log in by email |
| F17 | Accept by 5 August (national hard milestone) | **WRONG** | institution-specific; KU 2 Aug, SDU 3 Aug, AAU 5 Aug (2026) |
| F18 | Cut-offs and vacant places on 28 July | CONFIRMED | |
| F19 | Quota 2 = up to 12 months' work etc. (as a national rule) | **WRONG** (overgeneralised) | that is Aalborg's criterion; nationally each institution publishes its own |
| F20 | Non-EU: AU 15 March & no same-year IB; AAU 1 May | CONFIRMED | |
| F21 | "No central application fee" | **WRONG** (by omission) | non-EU applicants pay ~€150–200 per institution by 15 March |
| F22 | Non-EU tuition €6,000–16,000/yr | CONFIRMED | |
| F23 | Permit fee DKK 3,060; DKK 7,426/month; max 89,112; 90 h/month | CONFIRMED (2026) | label as 2026; re-set 1 Jan 2027 |
| F24 | SU DKK 7,426/month (2026); loan DKK 3,799 | CONFIRMED | |
| F25 | EU equal status: 10–12 h/week, 10 weeks | CONFIRMED | cited URL is the parent page, not the one with the rule |
| F26 | SU reform 1 Jan 2027, 70→58, 24-month completion loan | CONFIRMED | |
| F27 | Nordic SU: prescribed duration + 12 months, not using klippekort | **WRONG / OUTDATED** | same as studying in Denmark (uses klip); post-reform = prescribed duration only |
| F28 | ~10% dimensioning cut 2025–2029 | CONFIRMED | cite ufm.dk not Eurydice |
| F29 | KU 78 programmes, all in Danish | CONFIRMED | |
| F30 | Aalborg four in English | CONFIRMED | current, not only "historically" |
| F31 | AAU: letters/recommendations not relevant in quota 2 | CONFIRMED | |
| F32 | 1.08 bonus abolished | CONFIRMED | |
| F33 | Budget DKK 8,450–13,700 | CONFIRMED | |
| F34 | SDU uniTEST for quota 2 | CONFIRMED | |

## Findings

### F1. Application deadline 15 March, 12:00 noon CET, for all IB/international applicants (quota 1 and 2)

- Claim: "Applications close at 12:00 noon CET on 15 March 2027 — not midnight"; applies to every applicant with an international qualification incl. IB taken in Denmark, quota 1 or 2.
- Where: `src/pages/denmark.mjs:62-65`, `:144`, `:251`, `:306`; `data/application-routes/dk-optagelse-international-2027.json:17,51-62`; `data/destinations/dk.json:27`; `data/evidence/dk-national.json:160`.
- Verdict: **CONFIRMED** (day, month and time). The year 2027 is not yet on any official page; the Agency's English page carries no year and KU/SDU only publish 2026 lists. The rule has been stable; keep `provisional`.
- Source: https://ufsn.dk/english/education/admission-and-guidance/how-to-apply-for-a-higher-education-programme-in-denmark/ — "15 March, 12 noon (CET)" applies to applicants with "an international upper secondary education including International Baccalaureate (IB)". KU 2026 list https://www.ku.dk/studier/bachelor/frister-og-vigtige-datoer — "Ansøgningsfrist i kvote 1 – for ansøgere med ekstra dokumentation 15. marts kl. 12" ("Ansøgere med en international eksamen (fx IB, EB og DIAP)").
- Retrieved: 2026-09-24.

### F2. You get an answer on 28 July

- Claim: "28 July — You get an answer"; "Offers go out and the quota 1 cut-off averages for every programme are published".
- Where: `src/pages/denmark.mjs:147`, `:270-272`, `:308`; `data/application-systems/dk-optagelse.json:32`; `data/application-routes/dk-optagelse-international-2027.json:18,105-114`.
- Verdict: **CONFIRMED** (fixed national answer day; 28 July 2027 is a Wednesday). No 2027-dated official page yet.
- Source: ufsn.dk English page (F1) — "28 July you will receive an answer to your application." KU — "Svar på din ansøgning 28. juli". SDU https://www.sdu.dk/da/uddannelse/ansoegning-optagelse/bachelor-diplomingenioer/frister — "28. juli: Du får endeligt svar på din ansøgning".
- Retrieved: 2026-09-24.

### F3. Up to 8 programmes, ranked; at most one offer

- Claim: "8 — Programmes you may list"; "up to eight programmes, listed in order of priority"; "at most one offer".
- Where: `src/pages/denmark.mjs:146`, `:252-254`, `:307`; `data/application-systems/dk-optagelse.json:18-21`; route `:11-12`.
- Verdict: **CONFIRMED**.
- Source: ufsn.dk English page — applicants may "apply for up to 8 programmes at the same time"; "The offer will be at the highest possible priority."
- Retrieved: 2026-09-24.

### F4. Optagelse.dk opens 1 February (provisional)

- Claim: portal "typically opens in early February" (milestone 2027-02-01, provisional).
- Where: `data/application-routes/dk-optagelse-international-2027.json:28-38`.
- Verdict: **CONFIRMED** as the established pattern (1 February in 2026 per KU and SDU). 2027 not yet published.
- Source: https://www.ku.dk/studier/bachelor/frister-og-vigtige-datoer — "Optagelse.dk åbner 1. februar".
- Retrieved: 2026-09-24.

### F5. 24 IB points / an IB Diploma gives general access to all higher education

- Claim: "24 — IB points for general access"; "An IB Diploma with 24 points opens every programme in Denmark — if you also meet that programme's subject requirements."
- Where: `src/pages/denmark.mjs:145`, `:182-183`; `data/destinations/dk.json:18,35`; `data/ib-conversion.json:23`; `data/evidence/dk-national.json:4,9`.
- Verdict: **CONFIRMED**, but the evidence record cites the wrong page. The quoted excerpt is on the "Optagelse af IB-elever" page, not the `lande-og-eksaminer` lookup recorded as `sourceUrl` of `ev-ufsn-ib-eksaminer` (whose Eksaminer tab says an "IB Diploma" gives access to all programmes and does not mention 24 points). Fix the `sourceUrl`.
- Source: https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/regler-og-raad/internationale-eksaminer/vejledning-om-ib/optagelse-af-ib-elever/ — "Elever med et IB Diploma med 24 point eller mere kan søge ind på alle videregående uddannelser i Danmark".
- Retrieved: 2026-09-24.

### F6. A full Diploma may contain a grade 2

- Where: `src/pages/denmark.mjs:445-447`; `data/ib-conversion.json:28`; `data/destinations/dk.json:35`.
- Verdict: **CONFIRMED**.
- Source: Eksamenshåndbogen IB, Eksaminer tab (subjectId=1, last edited 07-01-2026) — "Der kan indgå karakteren 2 i et IB Diploma, når de samlede krav for at få udstedt et IB Diploma er opfyldt."
- Retrieved: 2026-09-24.

### F7. DP Course Results: 18 points, 3 in all six, at least 3 HL; business academy / professional bachelor only; university bachelor only via supplering (two successive raises, one to A) or retake; GSK cannot raise the level

- Where: `data/ib-conversion.json:31-51`; `data/destinations/dk.json:35`; `src/pages/denmark.mjs:290-295`; `data/preparation.json` action `supplementary-course`; `data/evidence/dk-national.json:593-608`.
- Verdict: **CONFIRMED**.
- Source: "Optagelse af IB-elever" (F5 URL) — Course Results with "mindst 18 point" and all six "bestået med mindst karakteren 3" give access "på erhvervsakademi- og professionsbacheloruddannelser gennem kvote 1 og 2"; university bachelor by "at supplere med enkeltfag efter samme regler som hf'erne eller tage deres IB-eksamen om". GSK: the Agency page states GSK can meet specific requirements but not raise the qualification level (FAQ q.5, as quoted in `ev-ufsn-gsk-cannot-raise-level`).
- Retrieved: 2026-09-24.

### F8. IB-points-to-Danish-average conversion (18→2.4 … 30→6.9, 36→9.3, 40→10.7, 45→12.7)

- Where: `data/ib-conversion.json:61-174`; `data/destinations/dk.json:39-152`; `src/pages/denmark.mjs:42`.
- Verdict: **CONFIRMED** — all 28 rows match the official "Statistisk omregning 2026" table exactly. The 2020–2022 legacy table (`ib-conversion.json:175-291`, "Statistisk omregning 2024") and the single-grade table (7→12, 6→10, 5→7, 4→4, 3→02, 2→00, 1→-3) also match exactly.
- Wording caveats (minor):
  - The official page contradicts itself: above the table "Omregningsskalaen er gældende for sommeroptaget 2025", below it "Statistisk omregning 2026". The update log shows the IB tables were updated 19 Dec 2025 for the 2026 intake, so the site's label is fair.
  - The site says the table is "re-issued every year" (`denmark.mjs:372-374`; `ib-conversion.json:18`; `dk.json:37`). The source says it is *reviewed* annually and may or may not change ("en gang årligt en vurdering af, om ... giver anledning at ændre omregningstabellen"); the background page says tables are updated "som udgangspunkt hvert tredje år". Suggest "reviewed each year; the scale for summer 2027 is available by 1 March 2027".
- Source: Eksamenshåndbogen IB, Karakterer tab (https://ufmembedlandedb-g3c6dhagdga8bbhf.northeurope-01.azurewebsites.net/?handbookId=3&countryId=269&subjectId=3, last edited 23-01-2026) — "30 6,9 … 36 9,3 … 40 10,7 … Statistisk omregning 2026". Update log https://ufsn.dk/uddannelse/anerkendelse-og-dokumentation/find-vurderinger/eksamenshaandbogen/opdateringer/ — 19 Dec 2025 "Omregningstabellerne for ... International Baccalaureate ... er opdateret".
- Retrieved: 2026-09-24.

### F9. Retake rule (D/R code; original result converted)

- Where: `data/ib-conversion.json:53`; `data/destinations/dk.json:156`.
- Verdict: **CONFIRMED**.
- Source: Eksaminer tab — "R betyder, at ansøgeren har taget sin eksamen om ... I sidste tilfælde skal det første uddannelsesbevis (D) lægges til grund for karakteromregning."
- Retrieved: 2026-09-24.

### F10. Subject levels: HL→A, SL→B; maths AA/AI HL→Mathematics A, SL→B; Global Politics no fixed equivalence; TOK none; Geoscience A no IB equivalent; English; Danish

- Where: `src/pages/denmark.mjs:51-53`, `:98-99`; `data/ib-conversion.json:337-727`; `data/destinations/dk.json:36,167,170-171`.
- Verdict: **CONFIRMED** — every row of `subjectLevels.map`, both foreign-language tables and all four special cases match the Fagniveauer tab (last edited 07-01-2026).
- Nuances (not errors): (a) the handbook names only "Danish A1" and "Danish A Literature"; it is silent on *Danish A Language and Literature*, so the hub's "Danish A1 or Danish A Literature — at either level — you are fine" (`denmark.mjs:98`) is accurate but a Lang & Lit student is not covered. (b) For Danish A1 SL the source says universities accept it "til de fleste uddannelser"; the hub's "you are fine" is stronger than the data files' "normally accepted".
- Source: Fagniveauer tab (subjectId=2) — "Matematik A … Mathematics: Analysis and approaches (HL)* / Mathematics: Applications and interpretation (HL)*"; Global Politics: "op til de videregående uddannelsesinstitutioner at vurdere".
- Retrieved: 2026-09-24.

### F11. IB results released 6 July (Danish rule owner)

- Claim: "Results come out on 6 July"; route milestone 2027-07-06 (provisional).
- Where: `src/pages/denmark.mjs:62`, `:245`, `:265-268`; `data/application-routes/dk-optagelse-international-2027.json:90-103`; `data/ib-conversion.json:54`; `data/ib-calendar.json:15-26`; `data/preparation.json` action `results-service`.
- Verdict: **CONFIRMED** as the Danish authority's standing date (no year attached). `ib-calendar.json:23` says the date "carries no citation" — it can now cite the Eksamenshåndbogen. See F12 for ibo.org.
- Source: Eksaminer tab — "Resultaterne for IB-eksamen foreligger den 6. juli." / "Det endelige elektroniske IB-resultat foreligger tidligst 6. juli." Also: before release results can be sent "til op til seks videregående uddannelsesinstitutioner" via the IB coordinator.
- Retrieved: 2026-09-24.

### F12. IB results day 2027 on ibo.org

- Claim: 6 July 2027 (`ib-calendar.json` basis `inferred-from-precedent`, provisional).
- Verdict: **UNVERIFIABLE** on ibo.org — the IB news page returned HTTP 403 to WebFetch and a Cloudflare challenge in the browser (not bypassed). The Danish rule owner's standing "6. juli" (F11) supports the date; no 2027-dated IB statement found. Keep provisional.
- Retrieved: 2026-09-24.

### F13. IB results service: up to six institutions, via the coordinator; institution codes

- Claim: coordinator registers you; results go directly to up to six institutions; codes Copenhagen 002600, Aarhus 000150, Aalborg 000148, Southern Denmark 000157.
- Where: `src/pages/denmark.mjs:244-249`; route `:40-49`, `:145-153`; `data/preparation.json` action `results-service`.
- Verdict: **CONFIRMED** (six institutions; all four codes). Timing nuance: the site's "before 15 March" is safe advice, but the binding institution deadlines differ — KU requires IB-database access "senest 1. maj"; AU/AAU tie it to 5 July.
- Sources: Eksamenshåndbogen Eksaminer tab — "til op til seks videregående uddannelsesinstitutioner". KU https://www.ku.dk/studier/bachelor/ansoegning-og-optagelse/individuelle-forhold/ansoeg-med-en-ikke-dansk-eksamen — "Det gør du gennem din IB-koordinator senest 1. maj" (code 002600). AU https://bachelor.au.dk/en/international-applicants/moreinfo/international-baccalaureate-ib — "The Aarhus University institution code is: 000150". AAU https://www.en.aau.dk/education/apply/bachelor/international-baccalaureate-ib — "The Aalborg University institution code is: 000148". SDU https://www.sdu.dk/en/uddannelse/bachelor/bachelor-admission/admission-requirements/educational-background/international-baccalaureate — code 000157 (via search snippet).
- Retrieved: 2026-09-24.

### F14. "Until 5 July — top up your documentation … Everything other than your IB results must be in by then"; priorities can be changed until 5 July 12:00

- Where: `src/pages/denmark.mjs:259-263`, `:309`; `data/application-systems/dk-optagelse.json:29`; route `:77-89` (milestone `ms-documents`, `consequence: hard`).
- Verdict: split.
  - Reordering priorities until 5 July 12:00 — **CONFIRMED**. STIL: "Du kan ændre i prioriteringen frem til den 5. juli inden kl. 12.00."
  - 5 July as *the* national documentation deadline for IB applicants — **WRONG** as a national rule. Documentation deadlines are set by each institution, and optagelse.dk tells applicants to check them: "Husk at tjekke uddannelsesstedernes frister for upload af bilag." AU and AAU do use 5 July; KU expects the documents uploaded with the application by 15 March and IB access by 1 May; Erhvervsakademi SydVest/S-E-A sets 1 April for international exams ("at the latest 1. april for applicants with international qualifying exam"). Correction: "Many institutions accept documentation until 5 July, but some want it by 15 March or 1 April. Check each institution you list." Also `consequence: hard` on a single national date misleads.
- Sources: https://viden.stil.dk/spaces/STILVIDENOFFENTLIG/pages/12780007/ (updated 26-03-2026); KU page in F13; https://www.s-e-a.dk/faq/vidergaaende-uddannelser; AU page in F13 — "All requirements must be documented by 5 July at 12.00 noon".
- Retrieved: 2026-09-24.

### F15. Signature page: "Some institutions still require a signature page … Aalborg is explicit"

- Where: `src/pages/denmark.mjs:255-257`; `data/application-systems/dk-optagelse.json:28`; route `:64-76` (`ms-signature`, "Required by some institutions only"), `:154-164`; `data/destinations/dk.json:31`.
- Verdict: **WRONG** on who it applies to. It is a national optagelse.dk rule tied to how you sign, not an institution choice: applicants with MitID sign digitally in optagelse.dk; applicants **without MitID** must print the signature page, sign it and send it to each institution by email or post by the deadline (15 March 12:00 for international/quota 2 applicants). The "never uploaded, sent by post or email, application incomplete without it" part is correct.
- Correction: "If you sign with MitID, you sign inside optagelse.dk. If you do not have MitID, you must print the signature page, sign it by hand and email or post it to every institution you apply to by 15 March 12:00."
- Source: STIL optagelse.dk guide (F14) — "Du skal underskrive den enkelte ansøgning med dit MitID senest den 15. marts inden kl. 12 for kvote 2"; without MitID: "Send underskriftsiden til uddannelsesstedet på mail eller med post". AAU — "Print, sign, and email the Signature Page to bacheloroptag@aau.dk before the deadline 15 March."
- Retrieved: 2026-09-24.

### F16. "You apply on optagelse.dk, which uses MitID"; identityRequirement "MitID"

- Where: `src/pages/denmark.mjs:238-241`; `data/application-systems/dk-optagelse.json:23,25`.
- Verdict: **WRONG** as a requirement. MitID is optional. Applicants without a Danish CPR number log in with an email address and get a link to their application. Advice to sort MitID early is fine for students who have a CPR number.
- Correction: "Log in with MitID if you have one; without a Danish CPR number you log in with your email and must send a signed signature page instead (F15)."
- Source: STIL guide — "Klik Nej til at du har dansk CPR-nummer. Indtast din mailadresse og klik Ok".
- Retrieved: 2026-09-24.

### F17. Acceptance: "Early August — You have a few days to accept"; route milestone `ms-reply` 2027-08-05 `consequence: hard`

- Where: `src/pages/denmark.mjs:274-277`; `data/application-systems/dk-optagelse.json:32`; route `:115-126`.
- Verdict: prose "early August" **CONFIRMED**; the single national hard date 5 August is **WRONG** for most institutions. The deadline is institution-specific: KU 2 August, SDU 3 August, AAU 5 August (2026 values). A KU applicant planning to 5 August loses the place.
- Correction: make `ms-reply` institution-specific or set it to the earliest known (2 August, KU) with the note; national source says only "Early August".
- Sources: UFS årshjul https://ufsn.dk/uddannelse/studerende/optagelse-paa-de-videregaaende-uddannelser/vejledning-og-inspiration/aarshjul-vigtige-datoer-i-aarets-loeb/ — "Frist for accept af studieplads" in early August; KU — "Frist for at sige ja tak eller nej tak til tilbud om studieplads 2. august"; SDU — "3. August: Frist for at bekræfte studieplads"; AAU — "The deadline to accept or reject your offer is 5 August."
- Retrieved: 2026-09-24.

### F18. Cut-offs and vacant places on 28 July

- Claim: quota 1 cut-offs published with offers on 28 July; vacant places "the same week" / "this is also when vacant places appear".
- Where: `src/pages/denmark.mjs:271-272`; `dk-optagelse.json:32`; route `:110`.
- Verdict: **CONFIRMED** (the vacant-places list is published the same day, 28 July).
- Source: UFS årshjul — "Ansøgerne får svar på deres ansøgninger. Listen over uddannelser med ledige pladser bliver offentliggjort" (28 July). UFS note "Optagelsen 2026" dated 28 July 2026 publishes the quota-1 figures.
- Retrieved: 2026-09-24.

### F19. Quota 1 / quota 2 description

- Claim: quota 1 on converted average alone; quota 2 "weighs grades in the required subjects, up to twelve months of relevant work or study, and sometimes an admission test or an essay"; applying by 15 March puts you in both.
- Where: `src/pages/denmark.mjs:72-78`; `data/application-systems/dk-optagelse.json:31`; `data/preparation.json` action `work-experience`.
- Verdict: quota 1 and automatic dual consideration **CONFIRMED**. The "up to twelve months" quota 2 criterion is **not a national rule** — it is Aalborg's published criterion; nationally quota 2 criteria are "published by the educational institution(s)". The site elsewhere says this (context note `dk-quota-2-varies`), but the hub sentence and `decisionModel` state it as general. Treat as **WRONG (overgeneralised)**; say "for example, Aalborg counts up to 12 months".
- Sources: ufsn.dk English page — "Quota 2 admissions are allocated according to criteria published by the educational institution(s)"; "Applicants applying before the deadline 15 March, will automatically be considered in quota 1 as well if their grade point average can be converted". AAU IB page — quota 2 "considers grades in required subjects and up to 12 months of documented relevant work experience or education".
- Retrieved: 2026-09-24.

### F20. Non-EU (fee-paying) applicants: Aarhus needs documentation by 15 March and excludes same-year IB; Aalborg 1 May

- Where: `src/pages/denmark.mjs:281-287`; route `:185`.
- Verdict: **CONFIRMED** (both).
- Sources: AU — "you cannot apply if you earn your IB exam in the year of application as the documentation deadline for paying applicants is 15 March at 12:00 noon." AAU — "the documentation deadline for paying applicants is 1 May."
- Retrieved: 2026-09-24.

### F21. "There is no central application fee"

- Where: `src/pages/denmark.mjs:506`.
- Verdict: **WRONG by omission** (literally true, practically misleading). Non-EU/EEA bachelor applicants pay a per-institution application fee, due by 15 March: Aalborg €150, Roskilde €200 (DKK 1,490); others similar. A student reading "no central fee" is not warned that an unpaid fee stops the application being processed.
- Correction: "There is no fee on optagelse.dk, but most universities charge non-EU/EEA applicants an application fee of roughly €100–200 per institution, payable by 15 March."
- Sources: https://www.en.aau.dk/education/apply/bachelor/non-eu-eea-admission-requirements — "Amount: €150", "Deadline: Before 15 March"; https://ruc.dk/en/step-4-application-fee-and-tuition-fees — "200 EUR (1.490 DKK) per applicant".
- Retrieved: 2026-09-24.

### F22. Tuition for non-EU: roughly €6,000–16,000 / DKK 45,000–120,000 a year; free for EU/EEA/Swiss

- Where: `src/pages/denmark.mjs:106`, `:502-505`, `:590`; `data/destinations/dk.json:174-193`; `data/evidence/dk-national.json:365`.
- Verdict: **CONFIRMED** against Study in Denmark (no year on the source). Note the top of the range is a real price: RUC Natural Sciences is €16,000 for September 2026 entry.
- Source: https://studyindenmark.dk/study-options/tuition-fees-and-scholarships — "USD 8,000-21,000 / Euro 6,000-16,000 (DKK 45,000-120,000)". RUC fee page (F21).
- Retrieved: 2026-09-24.

### F23. Residence permit fee DKK 3,060; self-support DKK 7,426/month, max DKK 89,112; work 90 h/month Sept–May, full-time June–Aug

- Where: `src/pages/denmark.mjs:107`, `:506-507`, `:545-546`, `:559-562`, `:591`; `data/destinations/dk.json:186,206`; `data/evidence/dk-national.json:454`.
- Verdict: **CONFIRMED for 2026** (SIRI page updated 15-09-2026; fee rates published 7 Jan 2026). Caveat, not an error today: SIRI fees and the self-support amount are re-set every 1 January, so a student applying for a permit in spring 2027 will pay the **2027** fee and must show the 2027 amount. The site does not label DKK 3,060 as a 2026 figure; it should ("DKK 3,060 in 2026; re-set each January").
- Source: https://www.nyidanmark.dk/en-GB/Applying/Study/Higher%20education — "DKK 3,060"; "DKK 7,426 (2026 level) per month"; "DKK 89,112 (2026 level)"; "90 hours per month".
- Retrieved: 2026-09-24.

### F24. SU: DKK 7,426/month before tax (2026, living away from home, higher education); loan up to DKK 3,799

- Where: `src/pages/denmark.mjs:108`, `:510-512`, `:592`; `data/destinations/dk.json:209`; `data/evidence/dk-national.json:320`.
- Verdict: **CONFIRMED** (2026 rates). The cohort starts in autumn 2027 at 2027 rates, published around late 2026; the site correctly labels 2026.
- Sources: https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende — "Satsen for udeboende på videregående uddannelser er 7.426 kr. pr. måned før skat i 2026." https://www.su.dk/satser/satser-for-su-laan — "op til 3.799 kr."
- Retrieved: 2026-09-24.

### F25. EU citizens' equal status for SU: 10–12 hours a week, at least 10 continuous weeks, continuing while on SU; 40 hours/month usually not enough

- Where: `src/pages/denmark.mjs:109`, `:513-517`; `data/destinations/dk.json:210`.
- Verdict: **CONFIRMED**. (The site's cited URL `su.dk/foreign-citizen/gb-foreign-citizen/eu-rules` does not contain the hours rule; it is on the child page below.)
- Source: https://www.su.dk/foreign-citizen/gb-foreign-citizen/eu-rules/you-work-in-denmark — "As a general rule, you work at least 10–12 hours per week"; "a continuous period of at least 10 weeks"; "working exactly 40 hours per month is generally not sufficient".
- Retrieved: 2026-09-24.

### F26. SU reform from 1 January 2027: 70→58 portions, SU limited to prescribed duration, completion loan up to 24 months, applies to anyone starting on/after 1 July 2025

- Where: `src/pages/denmark.mjs:518-524`; `data/destinations/dk.json:30`; `data/evidence/dk-national.json:328`.
- Verdict: **CONFIRMED**.
- Source: https://www.su.dk/su-reform/su-reform-in-english — "The new rules come into effect on January, 1. 2027"; "students who start a new higher education ... on July 1, 2025 or later"; "completion loan (slutlån) for a maximum of 24 months".
- Retrieved: 2026-09-24.

### F27. SU abroad: "Nordic study … supported for the prescribed duration plus twelve months, without consuming your Danish klippekort"

- Where: `data/preparation.json` action `money-plan` (appliesTo "all", Danish-citizen advice), `why` field.
- Verdict: **WRONG / OUTDATED**. SU for a full degree in another Nordic country is paid "as if you study in Denmark" — i.e. it is drawn from the same SU-klip frame, not outside it. And for this cohort (starting after 1 July 2025) the reform removes the extra 12 months: SU covers the prescribed duration only. Outside the Nordics the cap is 48 klip (four years).
- Correction: "In another Nordic country you get SU and loans exactly as if you studied in Denmark — which, for anyone starting from 2025, means the prescribed length of the programme and no more. Elsewhere, at most four years (48 klip)."
- Source: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du få SU og lån, som hvis du læser i Danmark"; "kan du maksimalt få SU i fire år (48 klip)". Reform page (F26).
- Retrieved: 2026-09-24.

### F28. ~10% cut in university bachelor intake, 2025–2029

- Where: `src/pages/denmark.mjs:82-87`; `data/destinations/dk.json:29`; `data/evidence/dk-national.json:507-512` (cites Eurydice).
- Verdict: **CONFIRMED**. Replace the Eurydice citation with the ministry's own page.
- Source: https://ufm.dk/aktuelt/nyheder/2024/udmontning-af-sektordimensionering-pa-universiteterne — "Sektordimensioneringen udgør ... ca. 10 pct. i den første dimensioneringsperiode fra 2025-2029 sammenlignet med den gennemsnitlige tilgang i perioden 2018-2022."
- Retrieved: 2026-09-24.

### F29. University of Copenhagen: 78 bachelor programmes, all taught in Danish

- Where: `src/pages/denmark.mjs:94-96`; `data/context-notes/dk-language-reality.json:8`; `data/preparation.json` action `danish-language`; `data/institutions/dk-ucph.json`.
- Verdict: **CONFIRMED**.
- Source: https://www.ku.dk/studies/bachelor — "explore 78 bachelor's degree programmes - all are taught in Danish."
- Retrieved: 2026-09-24.

### F30. Aalborg teaches four bachelor programmes in English

- Where: `src/pages/denmark.mjs:95-96` ("has historically taught four").
- Verdict: **CONFIRMED** — four is the current number, not only historical (Applied Industrial Electronics, Energy Engineering, Chemical Engineering and Biotechnology in Esbjerg; Economics and Business Administration in Aalborg). "Historically" can be dropped.
- Source: https://www.en.aau.dk/education/apply/bachelor/faq — "Aalborg University offers four programmes in English".
- Retrieved: 2026-09-24.

### F31. Aalborg: motivational letters/recommendations not relevant in quota 2

- Where: `src/pages/denmark.mjs:79-81`; `dk-optagelse.json:38`; context note `dk-quota-2-varies`; `preparation.json` `work-experience`.
- Verdict: **CONFIRMED**.
- Source: AAU IB page — "Motivational letters and recommendations are not considered relevant."
- Retrieved: 2026-09-24.

### F32. The 1.08 bonus for starting within two years no longer exists

- Where: `src/pages/denmark.mjs:297-300`.
- Verdict: **CONFIRMED** (abolished from the 2020 intake). Quota 2 "twelve documented months" in the same paragraph: see F19.
- Source: UFM press release https://ufm.dk/aktuelt/pressemeddelelser/2020/karakterkravene-til-de-videregaende-uddannelser-falder (July 2020, grade requirements fall after the bonus was removed) — via search result titles; not fetched verbatim.
- Retrieved: 2026-09-24.

### F33. Study in Denmark budget DKK 8,450–13,700 per month

- Where: `src/pages/denmark.mjs:529-546`; `data/destinations/dk.json:196-203`.
- Verdict: **CONFIRMED** (line items match; totals are the site's arithmetic and add up).
- Source: https://studyindenmark.dk/live-in-denmark/bank-budget — "Rent Varies from 3000-6,500 DKK", "Food 2,000-3,500 DKK", "Other personal expenses 2,000 DKK".
- Retrieved: 2026-09-24.

### F34. SDU uses uniTEST for quota 2 (`preparation.json` admissions-test)

- Verdict: **CONFIRMED** — SDU 2026 dates list "20. March 12:00: Frist for tilmelding til uniTEST"; test held 27 March–25 April. Note the uniTEST registration deadline (20 March) falls after the 15 March application deadline.
- Source: https://www.sdu.dk/da/uddannelse/ansoegning-optagelse/bachelor-diplomingenioer/frister.
- Retrieved: 2026-09-24.

### Not audited (institution-level or outside admissions)

CBS essay and its three-month rule (`preparation.json` motivational-essay), EU registration certificate/CPR/health-card steps, housing sites, and the claim that Study in Denmark still quotes a 20-hours-a-week rule (a search snippet from studyindenmark.dk does still say "more than 20 hours a week", which supports the site).

_End of report. Audit completed 2026-09-24._
