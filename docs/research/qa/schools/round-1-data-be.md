# School records, Belgium (#43): admissions counsellor, round 1

Under review: the 14 records `data/schools/be-*.json` and the researcher's report
`docs/research/schools/reports/batch-be.md`. I checked them on 26 September 2026 against the institutions'
own pages, Study in Flanders and vlaanderen.be. I used WebFetch and WebSearch, plus plain `curl` for pages
that WebFetch could not parse (ulb.be, the KU Leuven application-window tool's embedded data, UGent's deadline
table). I did not use a browser. odisee.be returns 403 (bot protection) to every scripted read, so I could not
re-open anything Odisee-specific, and I have not counted that against the record.

## Score: 7/10. Not yet.

**One deadline is wrong.** UGent's note tells a student its standing deadline "is 1 June", but the page says
"Before 1 JUNE". A student who applies on 1 June is too late. The error is one day, in a note, for UGent's
Dutch-taught bachelor's. Under the rule, that still fails the round. The fix is one line.

All 10 entries in `dates` are right, as are UGent's programme `closes` and every other dated note I could open. That
includes VUB's 31 March and 31 July 2027 ("before 1 April 2027 (last day: 31 March)"), UAntwerp's 4 Nov 2026,
28 Feb, 31 May and 30 June 2027, Thomas More's 18 Jan and 24 May 2027, and BSoG's 1 Oct 2026. The researcher
handled yearless dates properly: every date whose page gives no year (UGent, BSoG, ULiège, UMONS) sits in
`notes` with the words "without naming a year", not in `dates`.

Beyond the deadline, two things stop me repeating these records to a student:

- **E2.** KU Leuven Engineering Technology gives the 2026 maths route. The 2027-28 rules are already on the
  page, and they drop SAT and ACT.
- **E3.** The KU Leuven hand-off lands on the programme guide's front page, not on a list of English-taught
  bachelor's.

The rest is careful, well-sourced work.

## Errors

| # | Record | Field | What it says | What the official page says | Source |
|---|---|---|---|---|---|
| E1 | `be-ugent` | `notes[1]` | "UGent's standing deadline is 1 June if you need no visa and 1 April if you do; the page names no year." | The deadlines table: "Submit application · Before 1 APRIL [visa] · Before 1 JUNE [no visa]"; the online application runs "October - May". The last day is **31 May**, or **31 March** with a visa. The same table gives a third deadline, "Hand in application before 1 APRIL" for anyone who also needs UGent's Preparatory Year of Dutch. | https://www.ugent.be/prospect/en/administration/application/application-degree/deadlines.htm |
| E2 | `be-ku-leuven` | `programmes[Engineering Technology].ib` | "Prove maths with SAT (730 maths), ACT (32) or OMPT-D (60%), or sit the non-binding positioning test on the Group T campus in early July." | The admission page now has a "2027 - 2028" tab ("Final version: 30/09/2026"): "Applicants must submit a valid OMPT-G test result with a minimum score of 60%." SAT and ACT are **not mentioned** in the 2027-28 part. IB holders "may be admitted without proof of the minimum required OMPT-G score" but must take "the starting test, which takes place on campus (Leuven) in the beginning of July". The record's wording is the 2026-27 tab, and it is not labelled as such. | https://onderwijsaanbod.kuleuven.be/opleidingen/e/SC_55554488/toelatingsvoorwaarden |
| E3 | `be-ku-leuven` | `handoff.url` | `kuleuven.be/programmes/search?Language=English&Degree+type=Academic+Bachelor's` | It 301-redirects to `onderwijsaanbod.kuleuven.be/opleidingen/e?Language=…`, which is the programme guide's landing page. There are no programme listings and no filter state, so the student lands on a generic page. That breaks the "never the homepage" rule in spirit. | Checked with `curl -I` and WebFetch |

**Why E2 matters.** A student reading our card would book a SAT for a route that no longer exists. The IB
route (the July starting test) is still there, so the harm is limited. The card still teaches the wrong
thing, though, and the 2027 page is live.

**Fixes.**
- **E1:** "…UGent's standing deadline is 31 May if you need no visa and 31 March if you do (the page says
  'before 1 June' / 'before 1 April' and names no year)."
- **E2:** "For 2027: OMPT-G (maths and science) at 60%, or, with an IB, the starting test in Leuven in early
  July. Participation is compulsory, and the result is not binding. SAT and ACT are no longer listed."
- **E3:** Point the hand-off at
  `https://www.kuleuven.be/english/prospective-students/choose-your-programme` ("7 bachelor's programmes
  taught in English"). Or, if a browser check confirms it filters, use the programme search page that
  actually renders.

## Smaller points (fix when convenient, not blocking)

1. **KU Leuven credentials don't match the degree titles.** Six of the seven are titled "Bachelor of …", not
   BSc or BA:
   - "Bachelor of Business Administration (Brussels)";
   - "Bachelor of Business Engineering (KU Leuven et al)";
   - "Bachelor of Engineering Technology (Leuven)";
   - "Bachelor of Philosophy (Leuven)";
   - "Bachelor of Theology and Religious Studies (Leuven)";
   - "Joint Bachelor in Sustainability".

   The record gives them BSc, BSc, BSc, BA, BA, BSc. Only European Studies is a Bachelor of Arts. "BA" for a
   Bachelor of Philosophy is an invented equivalence. Use "BBA" (a standard abbreviation), and the full title
   for the others. UCLouvain's "BSc" for the same Business Engineering degree is right: UCLouvain titles it
   "Bachelor of Science in Business Engineering".
2. **Flemish entrance exam dates for 2027 are published.** vlaanderen.be says: "De toelatingsexamens van 2027
   vinden plaats op vrijdag 2 juli (arts), zaterdag 3 juli (tandarts) en zondag 4 juli (dierenarts)", and
   registration runs "van 1 maart tot en met 17 mei 2027". UGent and UHasselt already name the exam. Put the
   dates there, as a test date or in the note.
3. **`be-umons` note 1 (engineering admission exam).** The page says CESS holders sit maths only, and "Other
   candidates will also have non-mathematical tests". The record's own `ib` says a full IB needs no
   equivalence in the French Community, and the page doesn't say which group IB holders are in. Say so
   ("the page does not say whether an IB counts as a CESS here; ask the faculty") rather than implying that
   IB holders sit history and geography.
4. **`be-uantwerpen` › Social-Economic Sciences.** The admission page requires "a compulsory proficiency test
   in mathematics" of applicants with non-EEA degrees. The record says only "Maths proficiency recommended".
   The IB is issued from Geneva, so ask UAntwerp whether it counts as an EEA degree. At minimum, name the
   test.
5. **`be-thomas-more` › Applied Computer Science "Also starts in February".** The start-date page lists it
   under "Bachelor's Degree without a guaranteed 3 year study path (3+ year)". Add "(may take longer than
   three years)".
6. **`be-odisee`.** Everything programme-level comes from 2025 web-archive copies, and the programme URL
   differs from the one Study in Flanders links (`…/bachelor-business-management-major-marketing`, "last
   updated 12/08/2026"). The labels are honest. A browser check of both URLs is still needed before
   commit, because I could not open either.
7. **`be-ugent`.** The Preparatory Year of Dutch deadline ("before 1 April") is worth one clause in the
   Dutch-route note. UGent's `ib` already sends Dutch-route students there.
8. **`be-kdg`, `be-howest`, `be-thomas-more`, `be-odisee`: "Professional bachelor".** This usage is fine.
   KdG's own pages title each degree "Professional bachelor of Nursing", and so on. Study in Flanders labels
   Odisee's degree "PBA (Professional Bachelor)". It is the Flemish degree type, not an invented
   abbreviation, and it tells a student something true (applied, not academic). Keep it consistent: every
   Flemish university of applied sciences, and never on a university's academic bachelor's.

## What I checked and found right

| Check | Scope | Result |
|---|---|---|
| Dates (`dates`, `closes`, dated notes) | 13 of 14 records (not Odisee, 403): all 10 `dates` entries, the one programme `closes`, and every dated note | **All right except E1.** VUB 2027-28 "will open on 15 November 2026"; the programme pages (Business Economics, Social Sciences) give "before 1 April 2027 (last day: 31 March)" and "before 1 August 2027 (last day: 31 July)". The general VUB deadline page still shows 2026, and the record correctly follows the programme pages. UAntwerp "will open on 4 November 2026"; Objective 1 is 28 Feb (non-EEA) and 31 May 2027 (EEA), Objective 2 is 31 May and 30 June 2027 ("hard copies sent to registrar"). Thomas More, Fall 2027: "Opening applications: 18 January 2027", "Application deadline for non-EEA candidates: 24 May 2027", "no application deadlines for bachelor programmes for EEA students". BSoG "Applications for Fall 2027 open 1 October 2026"; admission page "EEA citizens: 30 June" with no year (kept in a note); scholarship "Fall entry is March 1st". KU Leuven: I parsed the tool's embedded data. It has no 2027-28 rows, and the 2026-27 EEA deadlines are 1 April (BAES), 1 June (Eng Tech, Philosophy, TRS) and 1 July (BA, BE), so the note is exact. Howest (1 Jan opening; 1 July EEA 2026-27), KdG (no EEA deadline 2026-27), UCLouvain ("30 September 2026" for EU + IBO), ULB ("until 30 September"), ULiège ("before 31 August", no year) and UMONS ("up to and including 30th September", no year): all right, and all labelled with their year or the lack of one |
| `ib` lines and subject rules | All 14 institution lines; every programme `ib` at KU Leuven, VUB, UGent, UAntwerp, KdG, BSoG | Right apart from E2. KU Leuven BA: IB exempts from English "if at least half of their courses are taught in the English language", and the free online maths test is compulsory (the 2027-28 tab says the same). Business Engineering: "strongly advised to follow… Mathematics: analysis and approaches HL" (identical in both years); "joint degree with UCLouvain Saint-Louis". Philosophy: exemptions only for Australia/Canada/Ireland/NZ/UK/US degrees, so the IB does not exempt. TRS: may apply without TOEFL/IELTS. BAES: "All applicants must prove their English language proficiency", assignment, video pitch (max 120 s), possible interview; €2,450 EEA. BASUS applies via Jagiellonian IRK, labelled 2026. UAntwerp: IBIS verification, "can enrol directly"; English exemption "Language 1 (minimum grade 5) or Level A (minimum grade 3)"; IELTS 6.5, TOEFL 80. VUB: English-medium diploma or IELTS 6.5 / TOEFL 79; Linguistics "Dutch… C1", "French… B2", "online interview is always part". BSoG: "At least 27 IBDP points. No specific subjects required. English proficiency scores are not required", €90. KdG: English A or B at 5; €139.40 "deducted from your tuition fee"; Nursing "speaking… C1". Thomas More: "IB-Diploma" exempts; no application fee. Howest: IB English A/B HL 5; €50 non-refundable |
| Flemish and French language rules; entrance exam | UHasselt, UGent, VUB, UAntwerp, KdG Nursing; ULiège, UMONS, UCLouvain, ULB | Right. UHasselt: ITNA "ERK B2", CNaVT STRT, NT2 II, own test "€105 (B2)", "maar één maal" May to September; no preparatory year ("Other universities in Flanders do offer this"). UGent: Dutch B2 (C1 Applied Language Studies). The Flemish toelatingsexamen covers "arts, tandarts en dierenarts", so UGent's "Medicine, Dentistry and Vet" is right, and it appears only where relevant. French side: UCLouvain names the ARES exam for medicine and dentistry and a quota for vet, physio, speech therapy, psychology and education; ULB lists IB Geneva, the ARES exam and the Polytech exam; UMONS French test is written and oral, €50 a session |
| Programme completeness | KU Leuven (7), UGent (1), UCLouvain (1), ULB (2), Thomas More (9), UAntwerp (2), BSoG (3) | Complete, and nothing extra. KU Leuven: "7 bachelor's programmes taught in English", and all seven are on the programme guide. UCLouvain Saint-Louis: only Business Engineering is "Full english"; the rest are bilingual, trilingual or French. ULB: "Bachelor in BUSINESS ENGINEERING", "Bachelor in ECONOMICS", English 80% / French 15% / Dutch or German 5%, "B2 level in English… for every students". Thomas More: 19 full-programme tracks correctly condensed into 9 degrees (Geel, Mechelen, Sint-Katelijne-Waver); short programmes rightly excluded. UGent: one degree with three majors, registration "at the Vrije Universiteit Brussel", major chosen in year 3 |
| Programme URLs | All 38 | 37 return 200 and open the right programme (titles match). Odisee is 403 |
| Hand-offs | All 14 | Bachelor's only everywhere except E3. UGent's is the 2027 study guide filtered to English bachelor's (3 results) |
| Summaries | All 14 | All 150 characters or fewer (longest 149). The only flagged word is "all" at UHasselt, which quotes the FAQ: "All Bachelor programmes are taught in Dutch" |
| `none` scope | UHasselt (Dutch), ULiège (French), UMONS (French) | Each has `language` and a way in: Dutch certificates and the own test; B2 French (DELF/DALF/TEF/TCF) for non-EU at ULiège; UMONS's French test |
| Fee status | All notes | No country fee-status sentences. BSoG's "€7,500 a semester for EEA and non-EEA students alike" is particular to a private college, so it belongs there |

## For the brief (carry to the next countries)

- **"Before 1 June" means 31 May.** Where a page writes "before <date>", record the day before, and quote
  the page in the source title, as VUB's record already does.
- **Many programme pages now carry a 2027-28 tab.** Before copying a requirement, check whether the next
  year's tab exists and differs. E2 was on the page, one tab over.

## Summary

- Score: **7/10, not yet**. Fix E1–E3, then give it to a fresh critic.
- Errors: **1 wrong deadline** (E1, UGent "1 June" should be 31 May), **1 outdated 2027 requirement** (E2,
  KU Leuven Engineering Technology), **1 hand-off** that lands on a generic page (E3), plus 8 smaller points.
- Most important fix: **E1**. The rule is one wrong deadline and the round fails, and this one would make a
  student a day late.
