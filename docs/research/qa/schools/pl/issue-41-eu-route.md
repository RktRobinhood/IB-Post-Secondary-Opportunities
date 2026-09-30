# Issue #41: which route and fee applies to an EU/EEA IB applicant in Poland

Research agent, started 2026-09-30. Appended as findings land so the work survives a session end.
Official sources only: the statute (isap.sejm.gov.pl), study.gov.pl, nawa.gov.pl, and each
university's own admissions pages. Quotes are under 15 words; otherwise a precise paraphrase.

## Question

Polish "for foreigners" admissions pages are often the fee-paying route. EU/EEA citizens may study
"on the terms applicable to Polish citizens". For an EU/EEA IB student applying to an English-taught
bachelor's or long-cycle programme: which route do they use, and do they pay the Polish fee, the
foreigner fee, or nothing?

## Starting state (2026-09-30)

- `data/countries/pl.json`: `summary`, `whyConsider[1..2]`, `application.steps[0..1]`,
  `costs.tuitionEuEea`, `costs.tuitionNonEu`, `funding[0..3]` already say Polish-taught study is
  free for EU citizens and English-taught fees vary. Wroclaw Tech deadlines and the maths-exam
  watch-out are all sourced from the **fee-paying** foreigners page.
- `data/destinations/pl.json`: `feeContext` has one `eu-eea-ch` entry with `feeStatus: "no-fee"`.
- `data/evidence/pl.json`: `ev-studygovpl-polish-taught-free`, `ev-uw-tuition-2026-27`.

## Findings

### 1. The statute (read 2026-09-30)

Source: Ustawa z dnia 20 lipca 2018 r. - Prawo o szkolnictwie wyższym i nauce, Dz.U. 2018 poz. 1668.
ISAP record https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20180001668 (opened in a browser;
plain HTTP clients get an Incapsula bot wall there). The consolidated "tekst ujednolicony" PDF linked
from that record as `D20181668Lj.pdf` was downloaded from the Sejm's own ELI API mirror of the same
file, https://api.sejm.gov.pl/eli/acts/DU/2018/1668/text/U/D20181668Lj.pdf (API documented at
https://api.sejm.gov.pl/eli.html, linked "API" from the ISAP page). Footer date on the pages:
2026-08-03; based on t.j. Dz.U. 2024 poz. 1571 plus amendments to 2026 poz. 912. ELI metadata
`changeDate` 2026-09-16.

- **Art. 79(1)** lists what a public university *may* charge for. Point 3: "kształceniem na
  studiach w języku obcym" (education on studies in a foreign language). Point 5: "kształceniem
  cudzoziemców na studiach stacjonarnych w języku polskim" (foreigners on full-time Polish-language
  study). Point 3 is not limited to foreigners: it is a fee a university may charge anyone,
  Polish citizens included.
- **Art. 79(3)**: each public university sets its own conditions for waiving these fees.
- **Art. 80(2)**: the university fixes its fees and amounts before recruitment starts.
  Art. 80(5): fee amounts must be published in its BIP (public information bulletin).
- **Art. 324(2)**: fees "o których mowa w art. 79 ust. 1 pkt 5, nie pobiera się od" (are not
  charged to) point 1: a citizen of an EU state, Switzerland or an EFTA/EEA state "i członków ich
  rodzin, mieszkających na terytorium Rzeczypospolitej Polskiej". The exemption covers **only point 5**
  (the foreigner fee for full-time Polish-language study). It does **not** cover point 3, the
  foreign-language fee.
  - Reading note: grammatically "mieszkających" (living in Poland) can attach to the family members
    alone or to both. The statute does not settle it; universities' paraphrases differ (see Wroclaw
    Tech below). study.gov.pl states the EU exemption without any residence condition.
- **Art. 324(1)**: a foreigner *may* be exempted from the point 2, 3 and 5 fees by agreement, by a
  rector's administrative decision, or by a minister/NAWA decision. Discretionary, not a right.
- **Art. 324(3)**: maintenance grant and student loan only for EU citizens who are workers,
  self-employed, retain residence on that basis, or hold permanent residence (already in the record).
- **Art. 69-70**: admission to first-cycle / long-cycle study is by one recruitment whose conditions
  each university fixes by Senate resolution (art. 70(1)); a foreign document entitling the holder to
  university study (art. 69(2) pt 4, art. 326a) is a valid basis. The act contains **no separate
  "foreigners' route"** for EU citizens and no phrase "on terms applicable to Polish citizens".
- **Art. 70(5a) and art. 323(1a)**: the B2 language check and the rector's-decision admission basis
  are written for foreigners who are **not** EU citizens ("niebędących obywatelami UE"). Art. 323(1)
  pt 6 (admission of a foreigner by rector's administrative decision) is the legal basis universities
  use for their separate foreigners' recruitment.

**Conclusion from the statute.** An EU/EEA/Swiss citizen is by law exempt only from the foreigner
fee on full-time *Polish-language* study. For an *English-taught* programme at a public university
the statute lets the university charge a foreign-language fee to everyone, Poles included, and gives
EU citizens no exemption from it. So for English-taught study the question "EU rate or foreigner
rate?" is answered by each university's own fee resolution, not by the statute.

### 2. study.gov.pl (NAWA's national portal), read 2026-09-30

- https://study.gov.pl/tuition-fees: full-time Polish-language study at state HEIs is free for Poles
  and for foreigners studying "on terms applicable to Polish citizens"; "These include citizens of
  the EU/EEA" and Karta Polaka holders. No residence condition is stated. The page does not say
  English-taught study is free for EU citizens; it says all other foreigners pay, quoting EUR 2,000
  average and 2,000-6,000 range. No last-updated date on the page.
- https://study.gov.pl/define-your-status (re-read with curl, exact wording checked): "You can study
  on the same terms as Polish citizens" if you are, among others, an "EU/EEA national". Tuition on
  those terms at public HEIs: "you do it free of charge"; this "requires a sound knowledge of Polish
  and participation in the recruitment procedure". Under "Studying on terms of your choice": EU/EEA
  citizens "can also choose if they want to study like Polish students or as foreigners" (they must
  have enough funds to support themselves). Those on foreigners' terms "have to pay fees as defined
  by higher education institutions" and do not compete with Polish candidates. Nothing on
  English-taught programmes specifically.

**Reading.** The national portal ties "free, on Polish terms" to Polish-language study and the
ordinary recruitment. It does not claim English-taught study is free for EU citizens. It says an
EU citizen may *choose* either set of terms, so a university's "for foreigners" page is one option
for an EU citizen, not the only one.

### 3. University of Warsaw (pl-uw), read 2026-09-30

- Route: one route for everyone. FAQ https://rekrutacja.uw.edu.pl/en/faq/: "There is one limit of
  places for each field of study for all candidates (Polish and international)". English-taught
  programmes are registered in the same IRK (https://rekrutacja.uw.edu.pl/en/admission-rules-and-application-deadlines-for-studies-provided-in-english-for-the-academic-year-2026-2027/
  says to filter IRK by "Studies in English"). No separate fee-paying foreigners' recruitment.
- Fee: 2026/27 PDF https://rekrutacja.uw.edu.pl/files/pdf/tuition_fees_2026-2027_06.2026.pdf
  (linked from https://rekrutacja.uw.edu.pl/en/application-and-tuition-fees/). Columns are "Citizens
  of EU/EFTA (EEA parties) and Switzerland" vs "Citizens of Non-EU/EFTA ...". Poles are EU citizens,
  so the EU column is the Polish price. Bachelor/long-cycle rows re-read: American Studies EU free /
  non-EU 5,500 EUR; English Studies EU free / non-EU 2,200 EUR; International Studies in Philosophy
  EU free / non-EU 1,500 EUR; Psychology (long-cycle) 25,200 PLN EU / 27,600 PLN non-EU. Single
  price for everyone on the others (e.g. Archaeology 2,300 EUR, Business and Management 4,000 EUR,
  International Relations 4,300 EUR). So at UW an EU citizen pays exactly what a Pole pays.
- Polish-language study: https://rekrutacja.uw.edu.pl/en/admission-procedure-for-other-candidates/
  ("Terms of studying") says the Polish-language fee is not charged to EU/EFTA citizens "and
  members of their families, if residing in the territory of Poland". UW reads the art. 324(2)
  residence clause as applying to the EU citizen too. It also opens: "Foreigners studying at the
  University of Warsaw pay for studies."

**UW verdict:** EU route = the ordinary IRK route (same as Poles). English-taught fee = the EU/Polish
column, which is free on three bachelor's and a single shared price on the rest.

### 4. Jagiellonian University (pl-uj), read 2026-09-30

- Route: every non-Polish citizen, EU citizens included, goes through **admission for foreigners**.
  https://internationalstudents.uj.edu.pl/en_GB/studenci/oplaty: "All candidates without Polish
  citizenship ... participate in admission according to the same rules as foreigners". Same point
  on https://welcome.uj.edu.pl/en_GB/admission/fees and https://welcome.uj.edu.pl/en_GB/admission/admission2025
  (Polish citizens "cannot take part in admission for foreigners").
- Fee, EU citizen on an English-taught programme: pays. https://welcome.uj.edu.pl/en_GB/admission/fees
  lists who is exempt from fees for full-time study **in Polish** (EU/EEA/Swiss citizens "and their
  family members residing in Poland" first), then states the exemption does not apply to "full-time
  studies in foreign languages (except for NAWA scholarship holders)". The international students
  page: "All international students undertake first-, second-, and long-cycle studies on a
  fee-paying basis"; foreign-language fees run from PLN 16,000 to EUR 15,500 (MD) for year one.
- Fee, Polish citizen: https://rekrutacja.uj.edu.pl/en_GB/studia-i-stopnia/oplaty (Polish text)
  says full-time Polish-language study is free for Polish citizens and "niektóre studia prowadzone w
  językach obcych są płatne" (some foreign-language programmes are paid). Amounts per programme
  are in the IRK catalogue and BIP. Not established here: whether any English-taught UJ bachelor's
  is free for Poles but charged to EU citizens (that would need the per-programme IRK entries /
  Rector's fee ordinance, not read).

**UJ verdict:** EU route = the foreigners' recruitment (compulsory for non-Poles). English-taught fee
= the programme's published fee; the EU exemption does not reach foreign-language study.

### 5. Warsaw University of Technology (pl-pw), read 2026-09-30

- Route: the IRK front page https://irk.pw.edu.pl/en-gb/ (linked from the B.Sc. admission page
  https://www.students.pw.edu.pl/How-to-Apply/Admission-to-B.Sc) splits first-cycle entry into
  "Candidates - Polish citizens" and "Candidate - foreigners" ("candidates without Polish
  citizenship"). An EU citizen without Polish citizenship therefore registers in the foreigners'
  branch, handled by the International Students Office. The central English admissions page
  https://eng.pw.edu.pl/Admissions/Undergraduate-level sends "Studies in English" to
  https://www.students.pw.edu.pl/Studies-Offer/B.Sc.-offer.
  - Older faculty pages say EU citizens apply through the Polish system instead: WEiTI
    https://www.elka.pw.edu.pl/eng/Students/General-Information-on-Studies/Studies-for-English-speaking-students2/Admission
    ("https://rekrutacja.pw.edu.pl/ – for EU citizens"), published 25/09/2017; MiNI
    https://ww4.mini.pw.edu.pl/application-process/option-1-eu-citizens/ (titled "Option 1 (Polish
    Citizens)", revised 27 July 2023). Treated as superseded by the current IRK split; not relied on.
- Fee: the 2026/27 B.Sc. offer page prints two prices per programme: "Tuition fees for non-EU
  citizens are in EUR. Tuition fees for EU/EFTA citizens are in PLN." Per semester, EU:
  Architecture 6,680 zł; Electric and Hybrid Vehicles 4,710 zł; Environmental Engineering and
  Environmental Protection 3,500 zł; Civil Engineering 4,125 zł; Computer Science 7,800 zł;
  Computer Science and Information Systems 5,850 zł; Electrical Engineering, Mechatronics,
  Aerospace Engineering and Power Engineering "EU: no charge". Non-EU pays EUR 2,340-6,830.
- The EU price is the Polish price. MiNI tuition page https://ww4.mini.pw.edu.pl/application-process/tuition-fees/
  cites one Rector's decision (98/2025, for 2025/26) setting fees "payable by Polish citizens and
  citizens of European Union member states ... living in the territory of the Republic of Poland",
  giving CS and Information Systems 5,850 PLN per semester, the same figure as the EU column above.
  The residence phrase again mirrors art. 324(2); the offer page's "EU" column states no residence
  condition.

**PW verdict:** EU route = IRK foreigners' branch (by citizenship), but the fee is the EU/Polish PLN
rate, and four programmes cost EU citizens nothing. Confirms the country record's claim.

### 6. AGH University of Krakow (pl-agh), read 2026-09-30

- Route: candidates without Polish citizenship go through the Department for International
  Students (https://www.international.agh.edu.pl/en/studies/recruitment/recruitment-rules-bachelor);
  Polish citizens use https://rekrutacja.agh.edu.pl/ ("Recruitment of Polish citizens").
  https://www.international.agh.edu.pl/en/studies/fees: "As an international student, you will be
  admitted to the AGH University on a fee-payment basis." The EU/EEA/Swiss exemption listed there
  (with "members of their family residing in the Republic of Poland") is for "full-time studies in
  Polish language" only.
- Fee, primary source: Rector's ordinance 39/2026 of 21 May 2026, linked from
  https://rekrutacja.agh.edu.pl/oplaty/ :
  https://rekrutacja.agh.edu.pl/wp-content/uploads/2026/05/zarzadzenie_rektora_39_2026_oplaty_2026_2027.pdf
  - § 1 covers students "posiadających obywatelstwo polskie"; English-taught fees for them are in
    annex 2. § 2 covers "studentów zagranicznych nieposiadających obywatelstwa polskiego"
    (foreign students without Polish citizenship, EU citizens included); their Polish- and
    English-taught fees are in annex 3.
  - Annex 2 (Polish citizens, English-taught, 2026/27)
    https://rekrutacja.agh.edu.pl/wp-content/uploads/2026/05/zarzadzenie_rektora_39_2026_oplaty_2026_2027_zalacznik_2.pdf
    lists a first-cycle fee for **Computer Science only** (3,000 EUR per semester). No other
    English-taught bachelor's appears, so no fee is set for Poles on them.
  - Annex 3 (non-Polish citizens)
    https://rekrutacja.agh.edu.pl/wp-content/uploads/2026/05/zarzadzenie_rektora_39_2026_oplaty_2026_2027_zalacznik_3.pdf
    charges every English-taught programme; the international fees page gives the bachelor's
    figures: Space Engineering 1,250 EUR, Mechanical Engineering and Geology of Natural Resources
    1,725 EUR, Mechatronic Engineering 1,800 EUR, Computer Science for Embedded Systems 2,500 EUR,
    Computer Science 3,000 EUR, all per semester.
  - Inference (not printed as a sentence): on English-taught bachelor's other than Computer Science,
    a Polish citizen pays nothing while an EU citizen pays the annex 3 fee. On Computer Science both
    pay 3,000 EUR per semester.

**AGH verdict:** EU route = international (foreigners') recruitment. English-taught fee = the
foreigner fee; no separate EU price, and it can be higher than what a Pole pays.

### 7. Wroclaw University of Science and Technology (pl-wroclaw-tech), read 2026-09-30

**This is the case the issue was about, and the record is wrong for it.**

- Route: two foreigners' routes. "Fee-paying basis of studies and scholarship holders"
  (https://rekrutacja.pwr.edu.pl/en/for-foreigners/fee-paying-basis-of-studies-and-scholarship-holders/admission/bachelor-studies/)
  and "Free of charge studies" (https://rekrutacja.pwr.edu.pl/en/for-foreigners/free-of-charge-studies/).
  Both run in the same IRK and the same timetable: the bachelor page has rows for "candidates
  qualified for tuition-free studies" and asks tuition-free candidates to upload the document proving
  the right (e.g. "EU ID"). The Senate admission resolution for the paying route is titled for
  "cudzoziemców na studia odpłatne oraz stypendystów" (listed at
  https://rekrutacja.pwr.edu.pl/dla-cudzoziemcow-akty-prawne/).
- Fee, English-taught, EU citizen: **none**. The free-of-charge page: "English-taught programmes
  are subject to tuition fees for all foreign nationals*", with the footnote "*Does not apply to
  citizens of the Member States of the European Union, the Swiss Confederation, the United Kingdom
  ..., the Member States of the European Free Trade Association (EFTA) ... – and their family
  members residing in the territory of the Republic of Poland, in accordance with ZW115/2025."
  The scholarship page
  https://rekrutacja.pwr.edu.pl/en/for-foreigners/fee-paying-basis-of-studies-and-scholarship-holders/admission/scholarship-programs-and-tuition-free-studies/:
  "WUST does not charge the tuition fees for education at full-time studies from foreigners being
  citizens of EU/EFTA countries" (no residence condition in that sentence).
- Primary source: ZW 115/2025 of 25.09.2025, "Zasady pobierania opłat", annex PDF
  https://rekrutacja.pwr.edu.pl/wp-content/uploads/2025/10/ZW_115_2025-z-Zasady-pobierania-oplat-na-studiach-wyzszych-na-PWr-4.pdf
  (listed as in force for 2026/27 on the legal-acts page). § 1 pt 8 defines "cudzoziemiec" as a
  person without Polish citizenship who is **not** an EU/Swiss/UK/EFTA-EEA citizen "i członków ich
  rodzin mieszkających na terytorium Rzeczypospolitej Polskiej". § 2(1) pt 3 charges for
  "kształceniem cudzoziemców na studiach w języku obcym" (foreign-language study by
  cudzoziemcy only). Chapter III, full-time students who are not cudzoziemcy: they pay only for
  repeated courses and extra courses. So an EU citizen on a full-time English-taught programme is
  charged like a Pole: nothing.
- The 2026/27 fee table (ZW 72/2026, annex z2 "od cudzoziemców") at
  https://rekrutacja.pwr.edu.pl/en/for-foreigners/fee-paying-basis-of-studies-and-scholarship-holders/after-admission/payments/
  is headed "Tuition fees for Foreign Students": it is the non-EU price list. The country record
  presents these figures (e.g. Applied Computer Science, Management) as what an EU citizen pays and
  says EU citizenship "buys no discount" here. That is wrong.
- Residence clause: the same art. 324(2) ambiguity ("mieszkających" after "członków ich rodzin").
  The PWr footnote attaches "residing in ... Poland" to the family members; the scholarship-page
  sentence has no residence condition. Advice for the record: tell EU applicants to choose the
  free-of-charge route and upload their EU ID, and to confirm with the Foreign Student Admissions
  Office if they are not yet resident.
- Side note (outside #41, not changed): the 2026 bachelor page says the maths-with-logic exam
  "applies to all foreign candidates" and is "without exception", while a 2025 notice on the same
  page exempts IB/EB holders and EU/OECD/EFTA certificates. The country record follows the 2026
  wording. Whether "foreign candidate" there includes EU citizens on the free route is not stated.

**PWr verdict:** EU route = the "free of charge studies" foreigners' route (same IRK, same dates).
English-taught fee = nothing for EU/EEA/Swiss citizens, per the university's own fee rules.

### 8. SGH Warsaw School of Economics (pl-sgh), read 2026-09-30

- Route: two admissions, split by citizenship: "Admission for Polish citizens" and admission for
  international applicants
  (https://www.sgh.waw.pl/en/educational-offer/first-cycle-studies/admissions-to-undergraduate-studies-in-english-for-international-applicants).
  The Polish-language section of that page names the entrance exam as being for "kandydatów
  nieposiadających obywatelstwa polskiego"; the English exam page
  https://www.sgh.waw.pl/en/entrance-exam-international-applicants-undergraduate-studies-english:
  "All international candidates are required to take the entrance examination". So an EU citizen
  applies as an international applicant and sits SGH's online test.
- Fee: https://www.sgh.waw.pl/en/table-fees-undergraduate-studies ("Fees in academic year
  2026/2027"). Full-time Polish-language study: Polish citizens "Not applicable" (free);
  international students EUR 2,350 per semester. Full-time study in English: one row, "EUR 2,500
  (one-time fee per semester)", with no split by citizenship, so Poles, EU citizens and non-EU
  citizens pay the same. The page quotes art. 324(2) for the Polish-language exemption only
  (EU/EEA/Swiss citizens "and members of their families residing in the territory of the Republic of
  Poland"). Same figure on https://www.sgh.waw.pl/en/fees-undergraduate-studies (Rector's
  Regulation No. 15 of 12 March 2026).

**SGH verdict:** EU route = international admission with entrance exam. English-taught fee =
EUR 2,500 per semester, the same price everyone pays, Poles included.

### 9. Other listed institutions, read 2026-09-30

- **Poznan University of Technology (pl-put)**: English-taught is **free for EU citizens**.
  Rector's Ordinance No. 18 of 11 May 2026 (fees for 2026/27)
  https://put.poznan.pl/sites/default/files/2026-05/Ordinance%20No.%2018.pdf, § 1 pt 3: fees for
  "education in degree programmes conducted in a foreign language, excluding Polish citizens and
  foreigners referred to in Article 324(2)". § 2(5): those foreigners "shall pay fees on the same
  basis as Polish citizens". Page https://put.poznan.pl/en/admission-for-international/studies-free-of-charge:
  "Tuition fees for international students in full-time studies conducted in Polish and English are
  not charged for" EU/EEA/Swiss citizens "and their family members residing in" Poland (same
  residence-clause ambiguity). The EUR/PLN figures on
  https://put.poznan.pl/en/admission-for-international/first-cycle/fees are the non-EU price.
- **University of Wroclaw (pl-uwr)**: separate EU price. https://international.uni.wroc.pl/en/admission-full-degree-studies/tuition-fees
  (2026/27 first-year rates) has columns "EU candidate + Pole's Card" and "non-EU candidate", e.g.
  Biotechnology BA 3,000 vs 4,200 EUR, Business and Administration BA 2,400 vs 3,900 EUR per year.
  Whether the EU column equals what a Pole pays was not checked.
- **Adam Mickiewicz University (pl-amu)**: one price for everyone on foreign-language study.
  https://amu.edu.pl/en/admissions/tuition-fees: students in first-year full-time foreign-language
  study in 2026/27 pay a semester fee from 1,900 to 4,000 PLN; no citizenship split.
  https://amu.edu.pl/en/admissions/full-study-programs-online-enrollment-system/financial-conditions
  lists the EU exemption under "For students undertaking studies in Polish" only.
- **Medical universities, English divisions**: one price for everyone, no EU rate.
  MUG https://admission.mug.edu.pl/1455.html: MD 32,100 PLN per semester, with no citizenship
  split; the only Polish discount is the Orientation Week fee (2,050 instead of 3,100 PLN "applies only
  to candidates from Poland"). UJ School of Medicine https://medschool.uj.edu.pl/practical-info/tuition-fees/:
  flat EUR fees per year (e.g. 15,500-17,000). WUM https://ed.wum.edu.pl/pl/node/1043: EUR
  application/confirmation fees, no EU split. PUMS https://pums.edu.pl/admissions/medicine-program/tuition-costs-of-living/:
  485,000 PLN total, no EU split. The UJ fees page (section 4) confirms the EU exemption does not
  reach foreign-language study.
- **Kozminski and SWPS** are private (niepubliczne). Art. 79 and the art. 324(2) exemption govern
  public universities; private ones set fees for everyone. Not re-read in detail.
- **NAWA** https://nawa.gov.pl/en/students/foreign-students: points to study.gov.pl for fees; no
  separate statement on EU citizens and English-taught fees.

## Summary (2026-09-30)

1. The law gives EU/EEA/Swiss citizens free tuition only on full-time **Polish-language** study at
   public universities (art. 324(2) exempting the art. 79(1) pt 5 fee). The **foreign-language** fee
   (art. 79(1) pt 3) may be charged to anyone, Poles included, and the statute gives EU citizens no
   exemption from it.
2. Which route an EU citizen uses, and what they pay for English-taught study, is set by each
   university. Three patterns, all found among the listed universities:
   - **Free for EU citizens, like Poles**: Wroclaw Tech (all full-time English-taught, per ZW
     115/2025), Poznan Tech (all, per Ordinance 18/2026), plus some programmes at Warsaw (UW: American
     Studies, English Studies, International Studies in Philosophy) and Warsaw Tech (Electrical
     Engineering, Mechatronics, Aerospace Engineering, Power Engineering).
   - **EU/Polish rate, lower than the non-EU rate**: UW and Warsaw Tech on their other programmes,
     University of Wroclaw.
   - **Same fee as non-EU, EU citizenship buys nothing**: Jagiellonian, AGH (where a Pole may pay
     less), SGH (everyone pays the same), AMU, the medical universities, private universities.
3. Route: at most universities an EU citizen without Polish citizenship applies through the
   foreigners' recruitment (UJ, AGH, SGH, Warsaw Tech's IRK split); UW has one route for all. Where
   a university runs a fee-paying and a free foreigners' route (Wroclaw Tech), the EU citizen belongs
   on the free one. study.gov.pl says an EU citizen may choose Polish-citizen terms or foreigner terms.
4. Residence: statute and several universities write "citizens ... and members of their families,
   living in Poland". Whether "living in Poland" binds the EU citizen or only the family members is
   not settled in the sources read. study.gov.pl states no residence condition; UW's wording applies
   it to the EU citizen. Tell applicants to ask where it matters.

## Record problems found (before the fix)

- `countries/pl.json` `costs.tuitionNonEu`: "At AGH, Wroclaw Tech, ... the published schedules print
  a single price for everyone, so EU citizenship buys no discount" - wrong for Wroclaw Tech (free for
  EU) and misleading for AGH (Poles can pay less than EU citizens).
- `countries/pl.json` `costs.tuitionEuEea`: lists Wroclaw Tech prices (17,200-25,400 PLN) as EU
  prices. They are the non-EU ("cudzoziemcy") list.
- `countries/pl.json` `whyConsider[3]`: "Wroclaw Tech from about 3,950 to 5,850 euros" presented as
  the EU cost.
- `countries/pl.json` `summary`, `application.steps[1]`, `funding[1]`: only UW named as free; Wroclaw
  Tech, Poznan Tech and Warsaw Tech programmes missing; no advice on picking the right route.
- `countries/pl.json` Wroclaw Tech deadlines and `institutions[6]` cite only the fee-paying page.
- `destinations/pl.json` `feeContext[eu-eea-ch]` `feeStatus: "no-fee"`, summary names only UW.
  `whyConsider[2]` fine.
- No evidence entry for the statute's foreign-language fee rule or for Wroclaw Tech / Poznan Tech.

## Changes made (2026-09-30)

- `data/evidence/pl.json`: seven new records, all `needs-review` with an attestation:
  `ev-sejm-pl-foreign-language-fee` (statute art. 79 / 324), `ev-studygovpl-eu-choose-terms`,
  `ev-pwr-zw115-eu-not-charged`, `ev-put-ordinance18-eu-as-polish`,
  `ev-agh-ordinance39-fees-by-citizenship`, `ev-uj-foreign-language-no-exemption`,
  `ev-sgh-fees-2026-27`. Each supports `pl` / `feeContext`.
- `data/destinations/pl.json`: `summary` last sentence; `whyConsider[2]`; new `watchOuts[1]` (a
  "for foreigners" page is often the non-EU price); `feeContext[eu-eea-ch]` summary rewritten, its
  `feeStatus: "no-fee"` removed (no enum value fits "none to international rate"), new evidence ids
  added there and in `evidence`; a `meta.notes` entry explaining the missing feeStatus.
- `data/application-routes/pl-direct-2027.json`: new first `supplementarySteps` line telling an
  EU/EEA/Swiss applicant to check which route and fee are theirs.
- `data/countries/pl.json`: `summary`; `whyConsider[1]`, `whyConsider[3]`; new `watchOuts[1]`
  (route choice and the residence wording); `application.steps[1]`; Wroclaw Tech deadline notes
  (registration opens: one timetable for both routes; tuition deadline relabelled "fee-paying route
  only"); `costs.tuitionEuEea.value` (three patterns, Wroclaw Tech prices removed from the EU
  line); `costs.tuitionNonEu.value` (Wroclaw Tech and Poznan Tech price lists marked non-EU only);
  new `costs.notes[0]` (why it varies: art. 79 / 324); `funding[1]`; institutions `englishBachelors`
  / `note` for Wroclaw Tech, PUT, SGH, AMU, UWr, AGH; 12 new `sources`; `notCheckedNotes` for SGH and
  the four technical/general universities updated, two added (residence clause; UJ Polish-citizen
  English fees).

## Gates (2026-09-30)

- `node scripts/validate.mjs`: all records valid.
- `npm run build`: ok (1363 pages).
- `SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: all checks pass except
  `school-pages` (nl-rug, nl-radboud, nl-hanze "Apply by" dates) and `research-log` (nl-radboud
  "critic", no-uia "verified"). Neither touches a Poland record; both come from other countries'
  records.

## Still open

- Residence clause (see Summary point 4).
- UJ: which English-taught programmes are free for Poles but charged to EU citizens.
- UWr: whether its "EU candidate" price equals the Polish price.
- Kozminski and SWPS fees (private) not re-read.
- All fee rules read are for 2026/27 entry; 2027/28 ordinances were not yet published.
