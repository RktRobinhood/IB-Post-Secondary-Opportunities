# Country audit (Europe, 20 destinations): critic round 2

Critic: **Admissions counsellor**, a fresh critic (per `docs/QA_CRITIC_LOOP.md`). Date: 2026-09-24.
Scope: the uncommitted audit pass over fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si.

What I read:
- `git diff` of `data/countries`, `data/destinations`, `data/application-routes`, `data/application-systems`, `data/context-notes` and `data/evidence`;
- `docs/research/audit/<cc>.md` for the countries I sampled;
- the built pages `dist/destinations/{ie,gb,be,cz}/index.html` in full, and the "short version" block on ten built pages.

I checked every verdict below myself against the live page, using WebFetch, curl, or a search snippet from the official domain where the page refused automated fetches. I did not take any verdict from the audit reports.

## SCORE: 7 / 10: not yet

**The facts are right.** I sampled 20 changed facts in 15 countries, none of which round 1 had checked. Most were deadlines and fees, and every deadline and fee matched its official page. The cap of 6 does not apply. The factual core is ready to ship, and so are round 1's five named fixes:

- The Queen Mary, The Hague UAS and SWPS notes no longer rank by transcripts.
- The University of Iceland note no longer contradicts itself.
- Ireland's fee and date notes now cite the CAO Handbook 2027.

**Three things still stop me from repeating all of it in a meeting.**

1. **Iceland's headline count is wrong.** The profile says "only two bachelor's degrees are described as taught in English" and "Two at most". The University of Iceland's English Studies BA is 180 ECTS over three years, is open to international applicants, and every course on its programme page is listed with "Language of instruction: English". The audit never looked at it. A Danish IB student who likes English is exactly the student who would want it.
2. **The superlative pattern round 1 named has come back in two new notes.**
   - Klagenfurt is now "the Austrian public university with the most English-taught bachelor's".
   - USI is now "the Swiss public university with the most English-taught bachelor's".
   - Neither claim rests on a survey of the country. The Austrian audit compared three universities. The Swiss audit counted USI's two-and-a-track and did not count St Gallen's English tracks.
   - Round 1's fix 6 was to stop notes stating rankings the data does not hold. That fix was applied to the three named notes but not to the pattern.
3. **The strip of edit-log text is only partly done.** "Promoted out of…" and "was missing from this record" are gone. But about 30 sentences of the same kind remain in the deadline and calendar notes of 15 of the 20 countries, and they render on the student pages (`dist/destinations/<cc>/`) and on `dist/timeline/`. Most of this text predates this pass, but the pass said it had cleaned it up. Examples:
   - "Promoted to its own entry on 23 September 2026" appears 4 times on CH, 3 on SI, 2 on AT and 1 on LU.
   - "This record previously carried…" and "Corrected and re-sourced" on BE.
   - "Corrects a claim this record carried previously" on CZ.
   - "This is the date the earlier research recorded as missing" on GB.
   - "This record used to cite a Tilburg FAQ PDF" on NL.
   - "One reading this record does not make for you" on IE.
   - "…used to be described in this note" on LV, PL, FI, DE and LT.

Each of these is a small text edit. With them done I would expect round 3 to reach 8 or above.

**The first-sentence summary change works.** The "short version" is now one sentence on every page I checked: BE 9 words, GB 16, SE 17, LU 18, CZ 15, HU 27, AT 31, DE 35. NL and CH run to about 40 words. The rest sits under "More on <country>". This answers round 1's complaint about summary length.

## Round 1's fixes: did they land?

| Round 1 fix | Status | Evidence |
|---|---|---|
| 1. QMUL note | LANDED | `gb.json`: "A large Russell Group university in east London, with law, medicine and dentistry among its strengths." |
| 2. The Hague UAS note | LANDED | `nl.json`: "…with about 17 bachelor's degrees taught in English." |
| 3. SWPS note | LANDED | `pl.json`: "A private non-profit university. IB holders skip its entrance exams; Psychology costs EUR 7,400 a year in 2026/27." |
| 4. University of Iceland contradiction | LANDED | The "only place in the country" sentence is gone. But see finding 1: the "two" count it was reconciled to is itself an undercount. |
| 5. Ireland notes to the 2027 handbook, process history deleted | MOSTLY LANDED | Fee and date notes now cite the Handbook 2027. Two problems remain in `ie.json`: the IB-results entry still quotes the booklet's "If you are a May 2026 IB candidate…" and keeps "One reading this record does not make for you". Several notes also repeat "read on 24 September 2026; the Timetable of Events web page still shows the 2026 cycle", which is source commentary rather than student copy. |
| 6. Guard the ranking pattern | NOT DONE | Two new "the most" claims (Klagenfurt, USI). See the sample. |
| 7. Summaries | LANDED (by the page change) | The built page shows only the first sentence. |

## Sampled changed facts (20 items, 15 countries, none checked in round 1)

| # | Country | Claim as recorded | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | FR | EDHEC International BBA: first of five sessions 1 Oct–3 Nov 2026; fee €100 | CONFIRMED | edhec.edu/en/programmes/bba/admissions-and-tuition-fees/international-admissions (403 to fetch; official-domain search snippet): "from October 1st to November 3rd, 2026"; "Application fees are 100€" |
| 2 | FR | Polytechnique Bachelor round 2 closes 6 Jan 2027 23:59 CET; final round 8 Feb 2027 14:00 CET | CONFIRMED | programmes.polytechnique.edu/en/bachelor/admissions/admissions-criteria-and-procedure: "January 7, 2027 to February 8, 2027 at 2 PM (CET)" |
| 3 | FR | ESCP BSc non-EU €26,800 (2027 intake); fee €80 | CONFIRMED | escp.eu/programmes/bachelor-in-management-BSc: "Non-European Students … Total: €26,800"; "The application fee is €80" |
| 4 | FR | Polytechnique Bachelor non-EU €19,200; Sciences Po flat €14,900 outside the EEA | CONFIRMED (search snippets from the official pages) | programmes.polytechnique.edu/en/bachelor/costs-and-funding/tuition-fees; sciencespo.fr/en/admissions-and-financial-aid/tuition-fees/ |
| 5 | NO | University of Agder: EU/EEA deadline 1 March; music performance 15 December (all applicants) | CONFIRMED | uia.no/english/studies/how-to-apply/: "Application deadline for EU/EEA applicants" 1 March; "Application deadline for all applicants" to music performance 15 December |
| 6 | GB | UAT-UK (ESAT/TMUA/TARA) booking 20 Jul–28 Sep 2026 18:00 BST; January sitting booking 26 Oct–21 Dec 2026 18:00 GMT; tests 12–16 Oct and 4–8 Jan | CONFIRMED | esat-tmua.ac.uk/deadlines/: "Test booking closes for January 2027 21st December 2026 6pm GMT" |
| 7 | SE | Round 2: IB results must reach UHR by 5 July 2027 | CONFIRMED | universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/: "you have until 5 July to submit documentation"; ib-studies page: "make your results available to University Admissions by 5 July". The record honestly flags that the site's IB results day is 6 July. |
| 8 | CH | ETH living costs CHF 22,100 a year; CHF 28,100 including foreign-student study costs; rents averaged for 2024 | CONFIRMED | ethz.ch/…/cost-of-living.pdf: "TOTAL 22'100"; "All, except D-ARCH … 28'100" (Group 2); "average 2024" |
| 9 | CH | EPFL application fee CHF 150 for a foreign certificate | CONFIRMED (official-domain search snippet) | epfl.ch/education/admission/admission-2/bachelor-admission-criteria-and-application/how-to-apply: CHF 150 for holders of a foreign certificate |
| 10 | DE | TUM non-EU bachelor's usually €2,000 or €3,000 a semester from WS 2024/25; German school-leaving qualification exempt | CONFIRMED | tum.de/en/studies/fees/tuition: "usually 2,000 or 3,000 euros per semester" |
| 11 | DE | WHU application fee €75 until 31 Mar 2027, €150 after | CONFIRMED, imprecise | whu.edu/de/…/bewerbung-zulassung/: "75€ (nur mit Gutscheincode)" 1 Feb–31 Mar, "150€" 1 Apr–15 May. The €75 needs the published voucher code; say so. |
| 12 | IS | University of Iceland registration fee ISK 100,000 (spring-only ISK 75,000), raised from ISK 75,000 in February 2026 | CONFIRMED | english.hi.is/study/apply/university-fees: "100,000 ISK"; ruv.is 2026-02-12: "Samþykktu hækkun skráningargjalda í 100.000 krónur" |
| 13 | IS | "Only two bachelor's degrees are described as taught in English" / "Two at most" | **WRONG (undercount)** | english.hi.is/english-studies/ba: "Three years - 180 ECTS"; "Application status International students"; mandatory courses listed with "Language of instruction: English" |
| 14 | LV | RSU International Business & Start-up Entrepreneurship €3,300 a year (2026/27); SSE Riga non-EU €7,600 a year / €22,800 in total | CONFIRMED | rsu.lv/en/study-here/admissions/tuition-fees-studies-english: "3,300 EUR"; sseriga.edu/education/bachelor/tuition-fee: "full tuition fee of EUR 7600 per year" |
| 15 | LU | Uni.lu €400 a semester; minimum resources €1,517 a month / €18,211 a year (2025) | CONFIRMED (search snippet of uni.lu page; the page renders empty to fetch) | uni.lu/life-en/financial-support/cost-of-living/: "at least 18,211 € per academic year, or a minimum of 1,517 € per month" |
| 16 | LT | VMU: €300–1,000 a month; 70% of international students spent €300–700 (2025 survey) | CONFIRMED | vdu.lt/…/cost-of-living/: "need of 300-1000 EUR per month"; 34% + 36% in the €300–500 and €500–700 bands |
| 17 | HU | Szeged application fee €300 | CONFIRMED (medicine) | med.u-szeged.hu/english/online-application: General Medicine "300 EUR" (2026 cycle) |
| 18 | BE | Flemish tuition €1,181.40 for 60 credits (EEA, 2026-27) | CONFIRMED | kuleuven.be/…/tarieven26-27: "1181,40 euro"; "305,40 euro vast + 14,60 euro per studiepunt" |
| 19 | CZ | IB Diploma exempt from nostrification by law since 1 March 2025 (§ 48(4)(c)) | CONFIRMED | cvut.cz/en/assessment-of-education-for-applying-to-ctu: "Pursuant to Sec. 48.4.c of Act No. 111/1998 … with effect from March 1, 2025" |
| 20 | FI | LUT: 24-point floor; rolling admission 1 Sep 2026–30 Apr 2027; Maths AI SL not accepted; table headed "2026 Entry requirements" | CONFIRMED, with one gap | lut.fi/…/admission-criteria-international-baccalaureate: "24 or more total points and the award of the IB Diploma"; "2026 Entry requirements". The maths list is the one for engineering programmes, so the note should say "for engineering". |

Also checked:

- **AT, MedAT 2026.** 3 July, 13,248 candidates, 1,950 places. Confirmed on studium.at (secondary). The official medizinstudieren.at page is the one cited.
- **AT, Klagenfurt's six English bachelor's.** Confirmed at aau.at/en/international/international-profile/degree-programmes-in-english/, which lists all six. The superlative attached to them is covered under Ranking claims below.

## New institutions round 1 did not check (5)

| Institution | Full English bachelor's? | Note accurate? |
|---|---|---|
| University of Leeds (GB) | Yes | Fine. "One of the biggest Russell Group universities" is true and is not an IB ranking. |
| University of Nottingham (GB) | Yes | Fine |
| Amsterdam University College (NL) | Yes. auc.nl/about-auc: "taught entirely in English", "three-year Honours programme", "joint Bachelor's (Honours) degree issued by the UvA and VU", residential campus | Fine. One gap: its 2027 deadlines are published and not recorded: early-bird 1 Dec 2026, regular 1 Feb 2027, late 1 May 2027 (auc.nl how-to-apply). |
| University College Utrecht (NL) | Yes. uu.nl/…/application-and-admission: 3-year liberal arts and sciences, residential | Fine. "Selects on more than grades" is supported: "you may be invited for an interview … focus not only on your academic performance". |
| Fontys UAS (NL) | Yes. fontys.nl programme list (English filter): engineering and ICT in Eindhoven and Venlo; Circus, Dance and Music in Tilburg; International Business | Fine. "Engineering, ICT, business and the performing arts" matches. |

## Ranking claims in changed notes

- **Klagenfurt (AT):** "the Austrian public university with the most English-taught bachelor's". UNSUPPORTED. The six are real, but `docs/research/audit/at.md` compares only Klagenfurt, JKU and WU.
- **USI (CH):** "the Swiss public university with the most English-taught bachelor's". UNSUPPORTED.
  - USI has two English bachelor's plus an English track in Economics.
  - St Gallen advertises English tracks in its majors, and `ch.md` did not count them.
- **Estonian Academy of Music and Theatre (EE):** "one of the largest EU-versus-non-EU price gaps anywhere on this list". Unverifiable, and not changed in this pass. Low priority.
- **University of Agder (NO):** "The best public-university option in Norway". This is an opinion carried over from before this pass. Low priority. "Four genuine choices" is the fact worth keeping.

## Other findings on the built pages

- **IE, "Discounted application fee closes" route milestone.** It renders "Your own plan — Not published by anyone — a date worth setting yourself." That is false: CAO publishes it (Handbook 2027, Table 1.1). The route gives it `consequence: "personal"`, and the template turns that into "not published". The country calendar lists the same date again as a hard deadline, so a student sees two contradictory cards.
- **IE, "Ask your IB coordinator … 5 July 2027".** It is tagged "Hard deadline — After this the door closes". But its own note explains that after 5 July you can still request results yourself at $19. The label overstates it; a soft or cost consequence fits better.
- **BE.** Five deadline notes repeat "cannot be read by an ordinary automated fetch at all - this was read in a browser". That is research method, not student copy.
- **Nothing invented** in any deadline or fee field I read. Gaps are marked as gaps: SI's 2027 call "still not published on 2026-09-24", Round One TBC, AT's MedAT 2027 not published.

## Top fixes (these raise the score most)

1. **`data/countries/is.json`: `summary`, `language.englishTaughtBachelors`, and University of Iceland `englishBachelors`.** Add English Studies, BA (180 ECTS, all courses taught in English, open to international applicants).
   - Change "only two" to "only three found", and "Two at most" to "Three found".
   - Set the University of Iceland to "2 verified: International Studies in Education, BA; English Studies, BA".
   - The tagline "Barely any…" can stay.
   - Source: https://english.hi.is/english-studies/ba.
2. **`data/countries/at.json`, University of Klagenfurt `note`.** Replace with: "Small campus university by a lake in Carinthia, with six bachelor's taught entirely in English." Source: https://www.aau.at/en/international/international-profile/degree-programmes-in-english/.
3. **`data/countries/ch.json`, Università della Svizzera italiana `note`.** Replace with: "Small Italian-speaking university on Lake Lugano with roughly one lecturer per seven students; Informatics and Data Science are taught in English and Economics has an English track." Source: https://www.usi.ch/en/education/bachelor/bachelor-degrees-at-a-glance.
4. **Finish the edit-log strip.** In `data/countries/*.json` deadline `notes`, delete the process-history sentence and keep the student-facing rest:
   - `ch.json`: 4 × "Promoted to its own entry on 23 September 2026…", including "the previous record said…" and "it was in no record before".
   - `si.json`: 3 × "Promoted to its own entry…", plus "It was in no record before" and "The previous record here said only…".
   - `at.json`: 2 × "Promoted to its own entry…", plus "a date this record carried before 23 September 2026".
   - `lu.json`: "Promoted to its own entry on 23 September 2026; nothing here recorded…".
   - `lt.json`: "Promoted because…".
   - `be.json`: "This record previously carried…", "Corrected and re-sourced. This record previously said…", "The 1 March and 1 June figures this guide used to quote…", and the five "automated fetch … read in a browser" clauses.
   - `cz.json`: "Corrects a claim this record carried previously" and "The faculty dates this record used to attribute to it…".
   - `nl.json`: "This record used to cite a Tilburg FAQ PDF…".
   - `gb.json`: "This is the date the earlier research recorded as missing".
   - `fr.json`: "…which is what the earlier research recorded as…".
   - `lv.json`, `pl.json`, `fi.json`, `de.json`: "…used to be described in this note / used to sit in this sentence / This entry used to…".
   - `ie.json`, IB-results entry: delete the May 2026 booklet quote and "One reading this record does not make for you:". Keep the handbook 2027 quote and the advice.
   - The guard: grep the 20 files for `this record|used to (be|sit|carry|say|share)|Promoted|previous record|earlier research|in no record|re-sourced|automated fetch` and expect 0 matches in student-rendered fields.
5. **`data/application-routes/ie-cao-2027.json`, milestone "Discounted application fee closes".** Change `consequence` from `personal` to a cost or soft consequence. Stop the page claiming the date is "Not published by anyone". Source: CAO Handbook 2027, Table 1.1, "Early online 35 20 January 2027 at 5pm".
6. **Lower priority:**
   - `de.json` `costs.applicationFee`: WHU "75 EUR until 31 March 2027 with WHU's published voucher code, 150 EUR from 1 April". Source: https://www.whu.edu/de/programme/bachelor-programm/bachelor-in-internationaler-betriebswirtschaft/bewerbung-zulassung/.
   - `fi.json` LUT `note`: "Maths AI SL is not on its accepted list **for engineering programmes**".
   - `nl.json`: add AUC's 2027 dates (1 Dec 2026, 1 Feb 2027, 1 May 2027). Source: https://www.auc.nl/admissions-aid/how-to-apply/how-to-apply.html.
