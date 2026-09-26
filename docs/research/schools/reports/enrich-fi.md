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
  `cutoff` 7, `requirementsUrl` 11. Needs use the per-option level syntax (`mathematics-ai@HL`) for "AI counts only
  at HL".
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
  based on grades)". E.g. Quantum "155,3 | 154,1" (max 172,1); International Business "123,5 | 138,4" (max 158,9). Economics's column header reads "max. 172,1 points" (checked twice verbatim; a first summarised read said 158,9).
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

## University of Jyväskylä (fi-jyu): 3 programmes

- Filled: `about` 3, `selection`/`selectionNote` 3, `places` 3 (30, 30, 25 on Studyinfo), `requirementsUrl` 3,
  `needs` 1 (Business: a passing maths grade; no IB grade given, so none recorded). No `cutoff`: JYU's 2026
  statistics PDF ("Kandidaatti- ja maisteriohjelmat, yhteishaun hakijatilasto kevät 2026",
  jyu.fi/fi/file-download/download/public/67770) covers only its Finnish-taught programmes.
- All three 2027 criteria are now served by Studyinfo with `tila: "julkaistu"`, so the note "Programme-specific
  admission criteria for 2027 were not yet public on Studyinfo on 25 September 2026" is out of date and is replaced.
- **Changed an accepted `ib` line (Early Childhood Education) — material.** It said only "Includes an online
  interview, 17–24 March 2027." Studyinfo's published 2027 criteria (valintaperuste `dd7ac29e…`) say: "Eligible
  applications will be ranked based on SAT and ACT test results." and "To be considered for the next phase based on
  an SAT test result, you must have achieved the minimum combined score of 1100" (ACT: "minimum total score of 22");
  "approximately three- to fourfold of highest scoring applicants in relation to the study seats will be invited" to
  the interview. IB grades are not used. The `ib` line now says an SAT or ACT is needed. JYU's own ECE page does not
  describe selection; it defers to Studyinfo.
- Business Innovation and Sustainability (valintaperuste `c51d3f51…`): group 1 certificate-based, 12 places (10
  first-time only), threshold "a passing grade from mathematics (basic or advanced syllabus)", max 149.9; groups 2–3
  SAT/ACT, 3 + 15 places, SAT 1100 / ACT 22.
- Immersive Software Engineering and AI (valintaperuste `bea83a38…`): online exam 10–11 Feb 2027 (TIM system), about
  100 invited to interview; 30 places.
- Replaced `notes[2]` with: only Business ranks on IB grades, and only 12 of 30 places.

## Laurea (fi-laurea): 6 programmes

- Filled: `about` 6, `selectionNote` 6, `selection` 5, `places` 6 (Studyinfo 2027: Business Management 30, Service
  Experience Management 30, Cyber Security online 45, Developing Digital Services online 40, Nursing 30, Social
  Services 30). `needs` 0. No `cutoff`: Laurea publishes none that I could find.
- All six 2027 hakukohteet share one criteria object (valintaperuste `21803208…`), whose only text is "Admission
  Criteria for Laurea Bachelor's degree programmes to be announced". So every selection line is labelled "2026
  criteria; 2027 not yet published", from Laurea's spring-2026 page: "In spring 2026, the International UAS Exam
  selection method will be used for the following Laurea Bachelor's Degree programmes: Business Management, Business
  Information Technology, Safety, Security and Risk Management." and "Laurea Nursing and Laurea Social Services will
  have their own joint entrance exam held at Laurea Tikkurila Campus."
- Gap: Service Experience Management has no `selection`. Neither its page nor the 2026 page names a method, and
  Studyinfo lists none, so I recorded only a `selectionNote` saying so.

## LUT University (fi-lut): 15 programmes

- Filled: `about` 15, `needs` 15, `points` 15 (24: "24 or more total points and the award of the IB Diploma"),
  `selection` 15 (`first-come`), `selectionNote` 15, `places` 15, `requirementsUrl` 15. No `cutoff`: admission is
  not competitive, so there is none.
- Selection, quoted from LUT's international rolling page: "If you meet all the requirements in the rolling admission
  process, you will receive admission without any competition, as long as there are places available in the
  programme of your choice." And: "Rolling admission is an application path for those who have completed or are close
  to completing their degree outside of Finland" — so a student in Denmark uses the international round.
- Places (Studyinfo, international + domestic rolling hakukohteet, 1 Sep 2026 – 30 Apr 2027): Chemical 20+10, Civil
  30+10, Computational Science and AI 50+10, Electrical 35+15, Electrical HEBUT 40+20, Energy 35+15, Energy HEBUT
  40+20, Environmental 20+5, Industrial Engineering and Management 30+15, Mechanical 35+15, Mechanical HEBUT 40+20,
  Software HEBUT 55+15, Technology and Engineering Science 50+20, Digital Business 45+30, Sustainable International
  Business 45+30. `places` is the sum; the international share is in `selectionNote`.
- Needs from LUT's IB table (headed "2026 Entry requirements", as the record's note already warns): technology
  "Higher 4" in maths (recorded as HL 4, with the page's own AA SL / Maths SL listing flagged in the note, as round 1
  asked), plus "Chemistry required" (Chemical), "Physics required" (Computational Science and AI) or "Chemistry or
  physics required" (the rest), no grade stated; business "Standard 5 or Higher 4" in maths and "At least one subject
  5" in humanities or natural sciences (recorded as any group 3 or group 4 subject at 5).
- Studyinfo's criteria objects for both rounds (`622e36ab…`, `66e23300…`) only point to LUT's eligibility page.

## Metropolia (fi-metropolia): 21 programmes

- Filled: `about` 21, `selection`/`selectionNote` 21, `places` 21 (January joint application), `requirementsUrl`
  21 (each programme's Studyinfo criteria page). `needs` 0. No `cutoff`: Metropolia publishes none I could find.
- Places are the joint-application figures only. The separate SAT/ACT and Edunation-pathway applications list 100
  places per programme, but Studyinfo says "The number of study places is only indicative, all applicants who meet the
  admission criteria will be accepted", so they are not added.
- **The 2027 criteria are now published on Studyinfo**, with a per-programme split of places. Quoted from the
  hakukohde for International Business and Analytics (`…95752`): "International UAS Exam: 50 % of study places",
  "Certificate-based selection on the basis of the matriculation examination, the international EB, IB and RP/DIA
  examination: 30 % of study places", vocational 20 %. Splits (UAS Exam / IB-type certificates): International
  Business and Analytics 50/30, International Business and Logistics 50/30; Electronics, Robotics, Smart Automation,
  Construction Site Management, Laboratory Science 80/10; Applied Gerontology, Occupational Therapy, Social Services
  70/10. Civil Engineering and Building Services, IT, Mechanical, Biomedical Laboratory Science, Nursing, Paramedic,
  Physiotherapy, Public Health Nursing: "International UAS Exam: 100 % of study places".
- **Changed accepted lines (round-2 fix N1 extended).** Round 2 found the certificate quota on five programme pages
  (IB and Analytics, IB and Logistics, Social Services, Construction Site Management, Applied Gerontology) and the
  record said "size not yet published". Studyinfo now gives the sizes, and shows the same quota for five more:
  Electronics, Robotics Engineering, Smart Automation, Laboratory Science and Occupational Therapy. Electronics' own
  page mentions only the UAS Exam and does not rule the quota out; per the brief I did not resolve towards "you
  can't". All ten `ib` lines now give the split; the institution `ib` now says ten programmes keep 10–30 % for
  certificates; `notes[1]` no longer says the criteria are unpublished (the IB document deadlines still are).
- Culture programmes (criteria `a6f5a121…`, `9075358b…`, `b166cacb…`): pre-assignment due with the application
  (21 Jan 2027, 15:00); top 60 (3D Game Art, exam week 15), top 55 (Game Design, week 16) or top 60 (Sustainable
  Fashion, 13–14 April 2027, includes mathematical reasoning) go on to the online entrance exam.

## TAMK (fi-tamk): 9 programmes

- Filled: `about` 9, `selection`/`selectionNote` 9, `places` 9, `requirementsUrl` 9. `needs` 0, `cutoff` 0.
- Places are the January joint-application figures on Studyinfo, with the split quoted from each hakukohde, e.g.
  Software Engineering "International UAS Exam 35; SAT Score 5"; Environmental 10 + 5; Textile 8 + 2; International
  Business 40 and Business in Finland 40 ("The intake is based on the International UAS Exam"); ECEC 20 and Bilingual
  Nursing 66 (UAS Exam only); Team Entrepreneurship 40; Media and Arts 80 ("Fine Art Lab: 24; Interactive Media: 33;
  Music and Event Production: 23. Applicant may apply only to one study path"). The engineering rolling admission
  (15 Nov 2026 – 28 Feb 2027) is not yet on Studyinfo, so its places are unknown and not counted.
- Team Entrepreneurship (criteria `287e2ede…`, published): pre-task by 21 Jan 2027 15:00, top 160 to an online group
  interview on "9 - 11 February 2027". Media and Arts (criteria `02b1d9cc…`): pre-task instructions "published on
  TAMK's website on 26 November 2026", due 21 Jan 2027, interviews "9 - 11 March 2027".
- **Still unverified:** the engineering rolling thresholds in the accepted `ib` lines ("English 5, HL Maths 5"; round
  2 smaller point 5). The Software Engineering page says only "Students are admitted based on grades achieved in the
  previous education or SAT scores + and an interview for eligible candidates"; I searched the page (including
  collapsed text), the how-to-apply page and the web and found no IB grades. So I recorded no `needs` for these three
  programmes and left the `ib` lines as they were. A reviewer should ask TAMK or re-check when the 2027 rolling
  criteria appear on Studyinfo (from 15 November).

## Tampere University (fi-tau): 11 programmes

- Filled: `about` 11, `selection`/`selectionNote` 11, `places` 11, `requirementsUrl` 11, `needs` 8 (the
  technology-table programmes), `cutoff` 4.
- Places (Studyinfo, "The intake is N students."): six Science and Engineering majors 10 each, Computing Sciences and
  Electrical Engineering 60, Administrative Sciences 10, Social Sciences 10, Technology (Urban) 20, Socially
  Sustainable Societies 30.
- Split by admission group, from each programme's published 2027 criteria: Science and Engineering majors and
  Computing "70% of the intake allocated in admission group I" (SAT/ACT; plus an interview for the majors),
  "30% in admission group II" (certificates, "Maximum total score is 172,1"); Administrative Sciences, Social
  Sciences and Technology (Urban) 49 % / 51 %; Socially Sustainable Societies 70 % / 30 % (max 149,9). Environmental
  Engineering's criteria state no split, and the record says so. With 10 places, group II is 3 places.
- Needs: the technology programmes say "you must fulfil the threshold criteria for technology and engineering". The
  national table (yliopistovalinnat.fi, 2026 scoring) gives the IB version directly in IB grades: "At least grade 2
  in advanced mathematics and chemistry or physics. One of the above-mentioned subjects must be completed with a
  minimum grade of 4." Advanced maths = AA SL/HL or AI HL. Administrative and social sciences: "there are no threshold
  criteria".
- Cut-offs: Tampere's "Bachelor's admission 2026 statistics" PDF, column "Admission group II, lowest admittance score":
  Administrative Sciences 65,6; Technology, Sustainable Urban Development 56,4; Social Sciences 54,5; Socially
  Sustainable Societies 78,7. Not used: "Computing and Electrical Engineering, Science and Engineering" 78,5 and
  "Natural Sciences and Mathematics, Science and Engineering" 92,7 — the 2027 programmes are renamed or split
  (Computing Sciences and Electrical Engineering; six separate majors), so the 2026 figure is not the same option.

## University of Eastern Finland (fi-uef): 8 programmes

- Filled: `about` 8, `selection`/`selectionNote` 8, `places` 8, `requirementsUrl` 8. `needs` 0 (the certificate
  groups point to yliopistovalinnat.fi's tables without naming a subject threshold), `cutoff` 0 (uef.fi still
  returns 403 to WebFetch; Studyinfo has no cut-offs).
- Places (Studyinfo, 2027): Data Engineering 40 per campus ("Admission group I: intake 30", "Admission group II:
  intake 10"), so 80; Information Technology 50 per campus (I 40, II 5 first-time open-university route, III 5
  open-university route), so 100; Human and Planetary Health 30; East Slavic 10; Lifelong Learning 25 (18 interview,
  3 open university, 4 certificates); Social Sciences 30; Sustainable Forest Bioeconomy 25; Urban Sustainability 30.
- **Human and Planetary Health `ib`: dropped the word "Draft".** Round 1/2 labelled the split a draft because the
  criteria had `julkinen: false`; the criteria object (`99679c5f…`) is served with `tila: "julkaistu"` and says
  "Subgroup 2a … 5 places … Subgroup 2b (Spring 2027 graduates): 5 places", "Applicants are not placed on the waiting
  list". The numbers are unchanged.
- **Contradiction inside Studyinfo (Urban Sustainability Studies).** The application option (`…95935`) says "a) for
  applicants who have graduated by the end of the application period: 8 student places, and b) for applicants who
  will graduate in spring 2027: 2 student places." Its criteria (`1020541b…`) say "a) … 5 student places, and b) … 5
  student places." The record gives both and says they disagree.
- Lifelong Learning (`1274ef0d…`) and Urban (`1020541b…`) certificate groups need "at least 54 certificate points"
  (administrative and social sciences table). IT, East Slavic, Social Sciences and Forest Bioeconomy use no IB
  grades; the existing `ib` lines already say so for IT, Social Sciences and Forest; East Slavic's is now in
  `selectionNote` (video interview, "The top 10 applicants … are admitted").

## University of Helsinki (fi-uh): 2 programmes

- Filled: `about` 2, `selection`/`selectionNote` 2 (labelled "2026 criteria; 2027 not yet published"),
  `requirementsUrl` 2. Not filled: `places`, `cutoff`, `needs`.
- The 2027 group-2 round (haku `…94897`, 9–23 March 2027) has no application options on Studyinfo yet (the haku
  returns 404; Liberal Arts' implementation has no `hakutiedot`). Helsinki says its criteria come "by the end of
  October 2026" (already in the record's note).
- Helsinki's statistics page (helsinki.fi/en/…/statistics-student-admissions) has "International bachelor's
  programmes" headings for 2024–2026, but WebFetch could not read the tables under them. The Science point-tables page
  returned 403. A browser check would likely yield 2026 cut-offs for both programmes.
- Note: the Liberal Arts page's group 2 dates, "Begins: 09 Mar 2027 at 08:00 Ends: 23 Mar 2027 at 15:00", match the
  record.

## University of Oulu (fi-uoulu): 4 programmes

- Filled: `about` 4, `needs` 4, `selection`/`selectionNote` 4, `places` 4, `requirementsUrl` 4. No `cutoff`: Oulu
  publishes none I could find.
- Places (Studyinfo 2027): Computer Science and Engineering 33 ("Student selection based on SAT test: 19 study
  places; Student selection based on matriculation examination: 14 study places"); Electronics and Communications 33
  (SAT 25, certificates 8); Software Engineering and Information Systems 33 (SAT 25, certificates 8); International
  Business Management 13 in January ("matriculation examination: 10 study places; … Talousguru competition: 3 study
  places") + 20 in rolling admission = 33.
- Minimum certificate scores from the criteria: CSE "you must obtain at least 86 certificate-based points" (max
  172.1); IBM "at least 75 certificate-based points" (max 149.9). SAT minimums: CSE 1250 / maths 670, ECE 1200 / 600,
  SEIS 1050 / 570.
- Needs: all four say "you must meet the field-specific threshold criteria". From yliopistovalinnat.fi (2026 tables,
  in IB grades): technology "At least grade 2 in advanced mathematics and chemistry or physics. One of the
  above-mentioned subjects must be completed with a minimum grade of 4."; business "At least grade 2 in mathematics
  (advanced or basic syllabus)".
- Also applied to JYU Business Innovation and Sustainability: its criteria's "a passing grade from mathematics (basic
  or advanced syllabus)" is the national business threshold, which the IB table states as grade 2, so its `needs` now
  carries grade 2.

## University of Turku (fi-utu): 2 programmes

- Filled: `about` 2, `needs` 2, `selection`/`selectionNote` 2, `places` 2 (20 and 30), `requirementsUrl` 2. No
  `cutoff`: Turku publishes applicant numbers (455 and 266 in 2026) but no lowest scores that I could find.
- Sustainable and Social Entrepreneurship (criteria `2542afb0…`, published): "Admission Group I (70%)" SAT, total
  1150 / maths 600; group II (30 %) certificates, maths "passed acceptably. Minimum score is 110 according to the
  national scoring guidelines". Maths `needs` = the national business IB threshold, grade 2.
- ICT (criteria `df03d3b9…`; utu.fi 2027 page): "Admission group I (60 %)" SAT, "Admission group II (40 %)"
  certificates on the technology table; utu.fi: "The minimum accepted grade in advanced mathematics in the Finnish
  matriculation examination is C or a comparable grade in the other tests."
- **Changed an accepted `ib` line (ICT)**, as round 2 (smaller point 2) asked: "a grade comparable to C in the Finnish
  exam" is now "advanced maths (AA, or AI at HL) at grade 4". The conversion is the national technology table's own
  pairing: its Finnish threshold "a minimum grade of C" is written for the IB as "a minimum grade of 4". The same
  table adds chemistry or physics at grade 2, recorded in `needs`.

## Summary

- Programmes enriched: 101 of 101 in 13 listed records; all 14 `fi-*` records pass `check-schools.mjs`.
- Filled: `about` 101, `selectionNote` 101, `selection` 100, `places` 97, `requirementsUrl` 94, `needs` 42,
  `cutoff` 17 (Aalto 7, Haaga-Helia 6, Tampere 4), `points` 15 (LUT only).
- Accepted facts changed, each quoted above: Arcada `notes[0]` (100 more places in the separate application); Haaga-Helia
  International Business `ib` (blended motivation letter due 28 Jan); JYU Early Childhood Education `ib` (SAT/ACT
  pre-selection, IB grades not used) and `notes[2]`; Metropolia `ib`, `notes[1]` and ten programme `ib` lines
  (published certificate quotas, five more programmes than round 2 found); UEF Human and Planetary Health `ib`
  ("Draft" dropped); Turku ICT `ib` (grade 4 in IB terms).
- Riskiest claims: (1) Aalto cut-offs pair "first-timers" and "others" rows from a statistics table read through
  WebFetch; re-check against the page. (2) Metropolia's certificate quota for Electronics, Robotics, Smart Automation,
  Laboratory Science and Occupational Therapy rests on Studyinfo only; Electronics' own page names only the UAS Exam.
  (3) JYU Early Childhood Education now tells IB students they need an SAT/ACT, from Studyinfo's criteria alone.
  (4) Needs converted with the national 2026 tables (yliopistovalinnat.fi) while the 2027 criteria cite those tables
  without restating them. (5) UEF Urban Sustainability's 2 vs 5 spring-graduate places: Studyinfo contradicts itself.
- Not found: cut-offs for Arcada, JYU, Laurea, LUT (non-competitive), Metropolia, TAMK, UEF, Helsinki, Oulu, Turku;
  Helsinki places (2027 options not yet on Studyinfo); TAMK engineering rolling thresholds ("English 5, HL Maths 5"
  remains unsourced); Laurea's 2027 selection methods (criteria "to be announced"); Aalto Finance and Technology,
  Business and Design places.
