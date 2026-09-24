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

_(In progress; updated at the end.)_

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

<!-- APPEND-MARKER -->
