# Finland: programme enrichment to the Danish standard (#43)

Researcher's log for adding `about`, `needs`, `points`, `selection`, `selectionNote`, `cutoff`, `places` and
`requirementsUrl` to the 13 `listed` Finnish records (`data/schools/fi-*.json`). Retrieved 26 September 2026 with
WebFetch/WebSearch only. Studyinfo data read from its public service
(`opintopolku.fi/konfo-backend/toteutus|hakukohde|valintaperuste/<id>`); cited in records as the matching
`opintopolku.fi/konfo/en/...` page.

## Method notes (read first)

- **Studyinfo has no cut-off data for higher education.** konfo-backend's API (`/konfo-backend/swagger.yaml`) has no
  points-history endpoint; "alimmat hyväksytyt pisteet" exist there only for upper-secondary. Every `cutoff` below
  comes from the institution's own statistics page.
- **`julkinen: false` does not mean unpublished.** In Studyinfo's data, a selection-criteria object with
  `tila: "julkaistu"` (published) and `julkinen: false` is served to the public site. `julkinen` appears to mean
  "shared with other organisations in the editing tool". Round 1 and 2 read it as "draft". I have not changed any
  accepted "not yet published" wording on that basis alone; where the criteria text is now served, I use it and cite it.
- `cutoff.value` keeps the institution's own scale and its maximum, e.g. `155.3 first-timers, 154.1 others /172.1`.
  No cut-off is converted to IB points (no official table does that).
- `places` is the total for the 2027 intake where Studyinfo or the institution publishes it; the share an IB
  applicant competes for is in `selectionNote`.

## Aalto University (fi-aalto): 11 programmes

- Filled: `about` 11, `selection`/`selectionNote` 11, `needs` 10 (all but Design and Media), `places` 9,
  `cutoff` 8, `requirementsUrl` 11.
- Needs: from Aalto's IB page ("advanced mathematics with at least grade 6" for the technology options;
  "advanced mathematics with at least grade 6 or physics with at least grade 6" for Quantum; "advanced mathematics
  with at least grade 2 or basic mathematics with at least grade 4" for Economics and Finance; "basic or advanced
  mathematics with at least grade 2" for International Business). Which IB courses are advanced/basic comes from
  yliopistovalinnat.fi's 2026 technology table: advanced = AA HL/SL, AI HL; basic = AI SL.
- Places: Studyinfo hakukohteet, round A + round B. Chemical 20+15, Computer 22+18, Data Science 19+11, Digital
  Systems 27+18, Mechanical and Civil 27+18, Quantum 20+15, Economics 15+35, International Business 40+45 (round B:
  "Certificate-based admission (admission group II): 38 places", SAT/ACT 7). Design and Media: "The intake for the
  programme in 2027 is 43."
- Cut-offs: Aalto admission statistics, 2026 intake, columns "Lowest accepted score in Admission Group III quota for
  first-time applicants (admission based on grades)" and "Lowest accepted score in Admission Group III (admission
  based on grades)". E.g. Quantum "155,3 | 154,1" (max 172,1); International Business "123,5 | 138,4" (max 158,9).
  The 2025 figures use a different scale (max 105), so the scale may change again for 2027.
- Not filled: Finance `places`. Studyinfo is inconsistent: round A shows 15 places with a description copied from
  Economics ("Admission Group I: 12 places; Admission Group II: 2 places; Admission Group III: 36 places"), round B
  shows 0 places with "Certificate-based admission (admission group II): 73 places … (admission group III): 2 places".
  Aalto's FAQ says business places will be announced "by October 2026 at the latest". Technology, Business and Design:
  no places yet (same FAQ) and its Studyinfo implementation returned 404.
- Not filled: Mechanical and Civil Engineering `cutoff`. Its page (URL slug `computational-engineering`) continues
  the 2026 Computational Engineering option, which has 2026 figures (136,6 | 127,0), but the name changed, so I left
  it out.
- New fact for Design and Media's card: preliminary assignments are due "by 29 January 2027 at 3pm/15.00 (UTC+2)";
  intake assignments due 31 March; interviews 3–7 May 2027. The existing `ib` line is unchanged.

## Arcada (fi-arcada): 3 programmes

- Filled: `about` 3, `selection`/`selectionNote` 3, `needs` 2 (IT, Engineering: maths), `places` 3,
  `requirementsUrl` 3. No `cutoff`: Arcada publishes no lowest-accepted scores, and Studyinfo has none.
- Places are the 2027 total of both routes: joint application (Studyinfo and Arcada: "There are 25 study places, 20
  for those applying with a matriculation examination and five for those applying with a vocational qualification";
  IT 12 = 9 + 3; Engineering 8 = 6 + 2) plus the separate application (Arcada's separate-application page and
  Studyinfo: IT 28, International Business 55, Mechanical and Sustainable Engineering 17).
- **Changed an accepted note.** `notes[0]` said "Intakes are tiny: 45 places across the three degrees, most of them
  reserved for matriculation and IB applicants." That is true of the January joint application only. Arcada's
  separate-application page lists "Information Technology: 28 … International Business: 55 … Mechanical and
  Sustainable Engineering: 17" more places, and warns "Application may close earlier in case all study places have
  been filled". The note now gives the 35 January places open to the IB; the SAT/ACT/OMPT note now gives the 100
  separate-application places and the early-close warning.
- Maths `needs` repeat the round-2-accepted conversion (Arcada's "A in advanced math or C in basic math" on the UAS
  IB table: grade 2 in AA SL/HL or AI HL, grade 4 in AI SL).

## Haaga-Helia (fi-haaga-helia): 6 programmes

- Filled: `about` 6, `selection`/`selectionNote` 6, `cutoff` 6, `places` 6, `requirementsUrl` 5. `needs` 0 (no
  subject is required; the English proof is institution-wide and already in `ib`). No `points`: the 28-point
  minimum applies to the rolling route only, so it is in `selectionNote`, not in `points`.
- Places = autumn-2027 first-year places in the January joint application plus the October–May rolling admission
  (Studyinfo hakukohteet): Aviation 20 + 30, Business IT 20 + 30, Digital Business Innovations 20 + 24,
  International Business 50 full-time + 40 blended + 85 rolling, Hospitality 35 + 35, Sports 25 (joint only).
  Open Path, transfer, double-degree and GGU pathway places are left out.
- Cut-offs: Haaga-Helia's bachelor's admission statistics, "Studies starting in August 2026". Quoted: International
  Business "Certificate-based selection (matriculation examination): 95/198 (6.8.2026)"; Business IT
  "Certificate-based selection (Finnish Matriculation Examination, International Baccalaureate, …) 45 / 198
  (7.8.2026)"; Sports "The lowest accepted score after the examination: Entrance Examination: 45 (7.8.2026)".
  Aviation 60/198, Digital Business Innovations 50/198, Hospitality 53/198 (read from the same page).
- **Changed an accepted `ib` line** (International Business). It said the blended variant "uses an entrance exam at
  Pasila (8–11 or 15–18 March 2027)". Studyinfo's published 2027 criteria for the blended option (valintaperuste
  `445388a1…`, method "Interview and work experience") add a compulsory submission: "All applicants needs to submit
  motivation letter by 28.1.2027 at 3 pm Finnish time", with work experience scored (max 30 of 90 points). The line
  now names the letter and its deadline; the Pasila dates are unchanged.
- Rolling-admission criteria (valintaperuste `46b29c5f…`, published): "The applicants who satisfy all the admission
  criteria will be accepted in the order that they have submitted their complete application … and an applicant has
  passed the online interview." Hence `first-come` and `interview`.
- Sports criteria (valintaperuste `472fc8bc…`, published): advance assignment 20 points (minimum 10), top 75 invited
  to a 50-point online interview, pass mark 35 of 70.
