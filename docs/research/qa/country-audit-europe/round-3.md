# Country audit (Europe, 20 destinations): critic round 3

Critic: **Admissions counsellor**, a fresh critic (per `docs/QA_CRITIC_LOOP.md`). Date: 2026-09-24.
Scope: the uncommitted audit pass over fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si.

What I read:
- the `git diff` of `data/countries`, `data/destinations`, `data/application-routes`, `data/application-systems`, `data/context-notes` and `data/evidence`;
- the visible text of all 20 built pages, `dist/destinations/<cc>/index.html`. These were built at 16:18, after the last data edit at 16:18. I read five of them as a student would: IS, LT, HU, DE and SI. I read the IE page and `dist/timeline/` for specific entries.

I checked every fact below myself against the live official page, using WebFetch, or curl and a text grep when a page renders in JavaScript.

## SCORE: 7 / 10: not yet

**The facts are still right.** I checked 13 facts in 11 countries that rounds 1 and 2 did not check. Every date and fee matched its official page, so no wrong deadline or fee is stated as fact and the cap of 6 does not apply. Three rounds have now checked 58 facts between them without finding a wrong deadline or fee. The research is sound.

**What stops me shipping it is the text around those facts.** Four problems remain:

1. **The Iceland fix changed three fields and left four other sentences saying the opposite.**
   - The summary, `language.englishTaughtBachelors` and the University of Iceland's `englishBachelors` now count English Studies. They say "Three found" and "2 verified" at the University of Iceland.
   - The same built page still says:
     - "The one English-taught bachelor's, International Studies in Education…" (why it might suit you);
     - "one verified at the University of Iceland" (what to watch for);
     - "Accept early that your realistic target is one programme: International Studies in Education" (the steps);
     - "the honest routes are: take the one English BA" (language notes).
   - A student who wants English Studies is told in the steps to aim for a different degree.
   - The page's "short version" is also empty: "Read this part first, because it changes everything else." The page renders only the first sentence of `summary`, and on Iceland that sentence says nothing.
2. **Ireland still shows two contradictory cards for 20 January, on the country page and on the timeline.**
   - Round 2's fix 5 changed the route milestone. It now reads "Applying after this costs more. Not a barrier".
   - The country calendar entry for the same date, `ie.json` `application.deadlines[1]`, "Discounted application fee closes - 35 EUR becomes 50 EUR", is still `consequence: "hard"`. It renders "Hard deadline — After this the door closes."
   - The two cards sit next to each other on `dist/timeline/`, one saying the door closes and the other saying it is not a barrier.
   - The fee step is not a closing date. You can still apply until 1 February at €50 (CAO Handbook 2027, Table 1.1).
   - Round 2 also noted that the 5 July "Ask your IB coordinator" entry is labelled "Hard deadline", while its own note explains that you can still request results yourself after that date for $19. It is unchanged.
3. **A Hungary watch-out now contradicts Hungary's own calendar.**
   - The watch-out says: "Most 2027 deadlines were not published when this was researched. Only Semmelweis has a firm date (31 May 2027)."
   - The same page's calendar holds two more firm, non-provisional 2027 dates, and both are published:
     - Debrecen's 15 May 2027. I confirmed it on edu.unideb.hu: "the final application deadline will be May 15, 2027".
     - Pécs's 30 June 2027.
   - A student reading the watch-out would think Debrecen has no date yet.
4. **The research-log strip passes its guard but not its purpose.**
   - Round 2's grep (`this record|used to (be|sit|carry|say|share)|Promoted|previous record|earlier research|in no record|re-sourced|automated fetch`) now finds **0** matches in student-rendered text across all 20 countries. The only matches are in evidence `by` fields and `destinations/ee.json` `meta.notes`, which do not render.
   - But the same kind of sentence remains in other words. I count about 16 sentences about edits, in 11 countries, plus about 15 clauses that describe how a page was fetched. The next section lists them.

**Other checks:**
- Round 2's other fixes landed: Klagenfurt, USI, WHU and LUT.
- The rewrites I compared kept their facts: CH, SI, BE, CZ, GB and FI, before and after in `git diff`.

## Round 2's fixes: did they land?

| Round 2 fix | Status | Evidence |
|---|---|---|
| 1. Iceland count to three, English Studies added | **PARTLY** | `summary`, `language.englishTaughtBachelors` and UoI `englishBachelors` are updated. `whyItMightSuit` ("The one English-taught bachelor's"), `watchOuts` ("one verified"), the application steps ("your realistic target is one programme") and `language.notes` ("take the one English BA") are not. |
| 2. Klagenfurt note | LANDED | "Small campus university by a lake in Carinthia, with six bachelor's degrees taught entirely in English." |
| 3. USI note | LANDED | "Small Italian-speaking university on Lake Lugano…; Informatics and Data Science are taught in English, and Economics has an English track." |
| 4. Strip the edit-log text | **PARTLY** | The guard grep finds 0. Paraphrased versions remain; see the list below. |
| 4 (IE). IB-results entry | LANDED | The May 2026 booklet quote and "One reading this record does not make for you" are gone. The note now quotes the Handbook 2027 rule "a minimum of 12 days before the relevant offer round". |
| 5. IE discounted-fee milestone | **PARTLY** | The route milestone is now `indicative`. The country-calendar duplicate is still `hard`, so the contradiction has moved rather than gone. See finding 2. |
| 6. WHU voucher code | LANDED | "75 EUR until 31 March 2027 with its published voucher code, and 150 EUR from 1 April." |
| 6. LUT Maths AI to engineering | LANDED | "For its engineering programmes, Maths AI SL is not on the accepted list". |
| 6. AUC 2027 dates | NOT DONE | Low priority. This is a gap, not an error: nothing false is shown. |

## Sampled facts (13 items, 11 countries; none checked in rounds 1–2)

| # | Country | Claim as recorded | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | NO | NHH BSc, EU/EEA: 1 Jan–15 Feb 2027; conditional offer on predicted grades; final diploma by 6 July 2027 | CONFIRMED | nhh.no/en/…/application-process-bsc/: "1 January – 15 February 2027: Submit application, test results, and diploma"; final diploma "6 July 2027" |
| 2 | NO | BI tuition NOK 106,400 a year for EU/EEA (BBA, Data Science for Business, Digital Business) | CONFIRMED | bi.no/en/…/tuition-fee-bachelor-of-business-administration/: "International – EU/EEA/Switzerland 106 400" |
| 3 | HU | Debrecen: September 2027 applications close 15 May 2027; February 2027 intake closes 1 Nov 2026; application fee USD 150 | CONFIRMED | edu.unideb.hu/p/application-and-admission: "the final application deadline will be May 15, 2027"; "all programs: 1st November 2026"; "application fee of 150 USD" |
| 4 | LT | ISM: final diploma by 1 August in every round; 2027 rounds rolled forward from 2026 and flagged provisional | CONFIRMED | ism.lt/en/admission/: "Copy of Final diploma of Secondary Education submitted by the 1st of August"; the page still shows the 2026 rounds, and the record marks them `provisional: true` |
| 5 | LT | Mykolas Romeris: EU applicants 1 Jan–24 Jul (2026); EUR 50 fee | CONFIRMED | mruni.eu/en/admission_procedure/: "January 1st, 2026 – July 24th, 2026"; "for EU-citizens … 50 euros" |
| 6 | EE | Tallinn University: bachelor's application 1 Nov 2026–1 Mar 2027 | CONFIRMED | tlu.ee/en/application-deadlines: "November 1, 2026 – March 1, 2027" |
| 7 | PL | Poznan University of Medical Sciences: Fall 2027 MD admissions open 1 Sep 2026, deadline 20 Jul 2027, orientation 6–12 Sep 2027 | CONFIRMED | pums.edu.pl/admissions/application-calendar/: "20 Jul 2027"; "6 - 12 Sep 2027" |
| 8 | FI | Jyväskylä: attachments 28 Jan 2027; predicted IB grades 1 Apr 2027; final grades 13 Jul 2027 | CONFIRMED | jyu.fi/en/…/how-to-apply-for-international-bachelors-programmes: "28 January 2027"; "1 April 2027"; "13 July 2027" |
| 9 | AT | University of Vienna: admission period 13 Jul–31 Oct 2026; entrance-exam programmes apply 2 Mar–4 May 2026 (precedent) | CONFIRMED | studieren.univie.ac.at/en/admission/application-and-admission-periods/: "from 13 July to 31 October 2026"; "from 2 March to 4 May 2026" |
| 10 | BE | Flemish entrance exams: registration 1 Mar–17 May 2027; arts 2 Jul, tandarts 3 Jul, dierenarts 4 Jul 2027 | CONFIRMED (curl of the JavaScript page) | vlaanderen.be/toelatingsexamens: "Je kan je inschrijven van 1 maart tot en met 17 mei 2027"; "Arts: vrijdag 2 juli 2027 Tandarts: zaterdag 3 juli 2027 Dierenarts: zondag 4 juli 2027" |
| 11 | GB | UCAT: registration 20 May, booking 23 Jun, booking deadline 16 Sep, testing 13 Jul–24 Sep 2026. LNAT: Oxbridge 15 Sep/15 Oct; KCL/LSE/UCL sit by 31 Dec 2026; Bristol/Durham 13 Jan 2027; others register by 20 Jan and sit by 25 Jan 2027; international late applicants book by 25 Jul and sit by 31 Jul 2027 | CONFIRMED | ucat.ac.uk/about-ucat/ucat-test-dates/: "Last Test Day: 24 September 2026"; lnat.ac.uk/registration/dates-and-deadlines/: "Sit the LNAT before or on 31 December 2026" |
| 12 | CZ | CTU application fee CZK 950 | CONFIRMED | cvut.cz/en/entrance-procedures: "a fee of CZK 950 for the admission procedure" |
| 13 | DE | Mannheim: its English-studies bachelor's still require German at C1 from applicants without Abitur | CONFIRMED (the note is slightly loose) | uni-mannheim.de/en/…/english-studies/: "Almost all courses are taught in English"; "you must submit proof of proficiency in German at C1 level" |

I also checked the claim on the DE page that Ikast-Brande Gymnasium is on the KMK Annex 1 list. It is: the KMK agreement PDF, Anlage 1 (Stand 26.03.2026), lists DÄNEMARK: Ikast-Brande Gymnasium and Grenaa Gymnasium, from May 2022 and May 2025.

## Research-log text still rendering to students

None of these sentences matches round 2's regex. Each one tells the student about this site's editing history, or about how a page was fetched, instead of giving advice.

**Edit history (delete the sentence; keep the fact):**
- `si.json`, "Maribor, Primorska and Nova Gorica…": "Corrected on 23 September 2026. This file previously carried two entries saying…"
- `pl.json`: "…the IB and EB information page cited here previously does not."
- `pl.json`: "…the note here previously said otherwise, and that is corrected; the date is now an entry of its own."
- `hu.json`, Debrecen: "An earlier pass recorded this as not yet announced and carried the 2026 precedent of 15 June; Debrecen has since…"
- `hu.json`, Pécs: "This was missing from an earlier pass, which recorded…"
- `hu.json`, Corvinus: "This entry previously cited the fees and costs page, which says nothing about either deadline…"
- `lv.json`: "The earlier record cited the admissions hub page, which does not carry these dates; the source has been changed…"
- `lt.json`: "Vilnius University was missing from this calendar entirely, although…"
- `lt.json`, sector note: "Only Kauno kolegija was read in this pass."
- `be.json`: "The 1 March and 1 June figures this guide used to quote could not be found…" (the regex misses "used to quote")
- `be.json`, concours entry: "…the 23h59 matters and was missing from the earlier record."
- `ch.json`, ×2: "The source was corrected on 23 September 2026: this claim had been cited to…"
- `se.json`: "The source has been changed to a page that carries this date…"
- `nl.json`, BUas: "Which instrument BUas is applying was not established in this pass…"
- `lu.json`: "…uni.lu began returning HTTP 403 to the browser partway through this research."
- `is.json`, 5 June entry: "'Date not published' above is our wording, not the university's…" and "this is the publisher's contradiction and not ours".

**How the page was fetched (cut to "the official page still shows the 2026 calendar", or drop):**
- FR, ×5: "refuses automated retrieval with HTTP 403 — read in a browser"; "Re-read in a browser on 2026-09-24".
- LU, ×4: "read in a browser, uni.lu returns nothing to automated retrieval".
- LT: "invisible to a plain fetch - they had to be read in a browser"; "returned HTTP 500 to every automated request".
- IS: "returned HTTP 403 to automated retrieval on 23 September 2026".
- NL: "did not respond to automated retrieval".
- SI: "would not render to automated retrieval"; "returned HTTP 404".
- BE: "Driven in a browser, its academic-year selector…"

A wider guard would catch these. Use `previously (carried|cited|said)|cited here previously|earlier (record|pass)|this (file|pass)|used to quote|was missing from|through this research|automated (retrieval|request)|plain fetch|HTTP [0-9]{3}|in a browser|and not ours|our wording|Corrected on|source (has been|was) changed|source was corrected`. Run it over the built text, not the JSON. It currently finds about 40 lines over 17 of the 20 pages.

## Ranking claims in the most visible sentence

The "short version" is the one line every student reads. Two of them make claims their neighbours contradict:
- **DE:** "Germany is the one country in Europe where a single written rule decides whether your IB Diploma counts at all". The CH short version describes exactly that kind of rule: swissuniversities' 32 points and fixed six-subject structure.
- **IE:** "it treats your IB Diploma more precisely than anywhere else". NO, SE and FI all convert the IB on published tables too.

Both claims predate this pass. Lower priority, carried over from before this pass:
- NO Agder, "The best public-university option in Norway";
- DE TUM, "Germany's strongest technical university";
- EE Academy of Music and Theatre, "one of the largest EU-versus-non-EU price gaps anywhere on this list".

## Pages read as a student

- **IS:** the facts are good and the fees are careful. It fails on the internal contradiction (finding 1) and the empty short version. The 5 June entry is a paragraph about the site's own wording.
- **LT:** clear and useful. The steps say "1 July at Vilnius" as though it were fixed, but the calendar says Vilnius has published nothing for 2027. The steps should say "1 July in 2026". "Only Kauno kolegija was read in this pass" should go.
- **HU:** strong on money. The short version is good. It fails on the stale watch-out (finding 3).
- **DE:** the best of the five. The Annex 1 point for Ikast-Brande students is exactly what a counsellor would lead with. The short version overclaims (above).
- **SI:** honest about the language catch, and the "applying is not enrolling" watch-out is excellent. One edit-history sentence ("Corrected on 23 September 2026…").
- Small copy slip in **CH**: the EPFL 10 July note says "inside those four days", but the rewrite deleted the sentence that set up the four days, "it lands four days after IB results are released on 6 July". Put the clause back.

## Top fixes

1. **`data/countries/is.json`: make the whole page say three.**
   - `whyItMightSuit`: "The one English-taught bachelor's, International Studies in Education…" becomes "Two English-taught bachelor's at the University of Iceland — International Studies in Education (capped at 60) and English Studies — both 180 ECTS."
   - `watchOuts`: "one verified at the University of Iceland" becomes "two at the University of Iceland".
   - The application step "your realistic target is one programme: International Studies in Education" becomes "…is one of two programmes at the University of Iceland: International Studies in Education or English Studies".
   - `language.notes`: "take the one English BA" becomes "take one of the English BAs".
   - `summary`: delete the opening sentence "Read this part first, because it changes everything else." so that the short version becomes "Across Iceland's six universities only three bachelor's degrees are described as taught in English…".
   - Source: https://english.hi.is/english-studies/ba.
2. **`data/countries/ie.json` `application.deadlines[1]`, "Discounted application fee closes".** Change `consequence` from `hard` to `indicative`, or whatever the cost consequence is called. It must stop rendering "After this the door closes." Consider dropping this entry altogether, since the route milestone already carries the date.
   - Also: `deadlines[10]`, "Ask your IB coordinator… 5 July", from `hard` to a soft consequence. Its own note says that afterwards you request results yourself for $19.
   - Source: CAO Handbook 2027, Table 1.1: "Early online 35 20 January 2027 at 5pm"; normal online €50 to 1 February.
3. **`data/countries/hu.json` `watchOuts`.** Replace "Most 2027 deadlines were not published when this was researched. Only Semmelweis has a firm date (31 May 2027)…" with "Firm 2027 closing dates so far: Debrecen 15 May, Semmelweis 31 May, Pécs 30 June. Szeged and Corvinus have not published theirs."
   - Source: https://edu.unideb.hu/p/application-and-admission, "the final application deadline will be May 15, 2027".
4. **Finish the strip with the wider guard above.** Delete the 16 edit-history sentences listed, and cut the fetch-method clauses to "the official page still shows the 2026 calendar". Then run the wider regex over `dist/destinations/<cc>/` text and expect 0.
5. **Lower priority:**
   - Rewrite the DE short version: "In Germany one written rule, the KMK agreement, decides whether your IB Diploma counts, and it is about which six subjects you took, not how many points you scored."
   - Rewrite the IE short version: "…and it converts your IB score to CAO points on a published table…". Drop "more precisely than anywhere else".
   - Restore the EPFL "four days after IB results" clause in `ch.json`.

Fixes 1–3 are small, specific edits, and fix 4 is mechanical. With 1–4 done, I expect the next round to score 8 or above. The facts have now held up across three independent samples.
