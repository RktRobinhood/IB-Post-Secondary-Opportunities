# Country audit (Europe, 20 destinations): critic round 4

Critic: **Admissions counsellor**. I am a fresh critic, per `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si.

**What I read:**
- `round-1.md` to `round-3.md` and the editor's `round-3-fixes.md`.
- The built pages, `dist/destinations/<cc>/index.html`, reduced to their visible text with tags stripped.
  - They were built at 16:38, after the last data edit at 16:36, so they were not stale and I did not rebuild.
- `dist/timeline/` for the cards that affect these countries.
- `git diff`, read-only, for the phrases I flag, to see which are new and which predate this pass.

**How I checked facts:** against the live official page, using WebFetch. Where WebFetch's summary was doubtful I used curl and a text grep.

## SCORE: 7 / 10: not yet

**Round 3's four blocking fixes have all landed, and the facts are still sound.**
- I checked 11 new facts in 7 countries. Ten are confirmed; one is wrong, but it is not a date or a fee.
- Every **deadline and fee** matched its official page, so the cap of 6 does not apply.
- Four rounds have now checked 69 facts without finding a wrong date or fee.

**Why I still cannot give 8:**

1. **Five more calendar cards contradict their own notes.** This is the same fault that held round 3 at 7 over Ireland's 20 January card. Round 3 fixed the Ireland card, but the other cards like it were never looked for. One of the five is dangerous: on the UK page, the Oxford, Cambridge and medicine card tells a student that late applications "may still be read".
2. **One fact is wrong, and four ranking claims are wrong or unsupported.**
   - Czechia says Berlin is the only dated overseas sitting of Charles University's 2nd Faculty of Medicine exam. It is not: London, on 2 July 2027, is dated too.
   - France calls €178 "the lowest headline fee in Western Europe". The site's own Germany, Austria and Nordic pages say those countries charge EU students no tuition at all.
   - The Netherlands and UK pages say a three-year bachelor's is "shorter than most of Europe", but three years is the norm in most of Europe.
3. **About ten sentences are still written as a research log.** Each would have been caught by a guard written in slightly different words.

Each of these is a small, specific edit. The research underneath is ready to ship. The page text around it is one careful pass short.

## 1. Round 3's fixes: did they land?

| Round 3 fix | Status | Evidence in the built page |
|---|---|---|
| 1. Iceland says three everywhere | **LANDED** | Every place that states a count now says three: the short version, "Why it might suit you" ("The University of Iceland has two English-taught bachelor's…"), the watch-out ("Only three… two at the University of Iceland"), step 1 ("one of three English-taught programmes"), `language.notes` ("take one of the three English-taught BAs") and the language summary ("Three found"). The empty opening sentence is gone, and the short version now carries the fact. |
| 2. Ireland: 20 January and 5 July cards | **LANDED** | The country card reads "Discounted application fee ends… Missing it costs 15 EUR, not your place". It no longer renders "door closes", and it does not on `dist/timeline/` either. The 5 July card is now "Your own plan". |
| 3. Hungary watch-out | **LANDED** | "Firm 2027 closing dates so far: Debrecen 15 May, Semmelweis 31 May and Pécs 30 June 2027. Szeged and Corvinus have not published theirs". This matches the calendar. |
| 4. Strip the research log | **LANDED against the guard** | The wider regex finds **0** matches over the text of all 20 pages. Section 3 lists what it misses. |
| 5a. DE short version | LANDED | "In Germany one written rule, the KMK agreement, decides whether your IB Diploma counts at all…" |
| 5b. IE short version | LANDED | "…it converts your overall IB score into CAO points on a published table…" |
| 5c. EPFL "four days" clause | LANDED | "That is four days after IB results are released on 6 July." |
| Carried-over ranking claims (Agder, TUM, EE Academy) | LANDED | They are rewritten as facts. For example, Agder is now "A public university with four English-taught bachelor's to choose from." |

## 2. Guard over the built text

I ran round 3's wider regex, case-insensitively, over the tag-stripped text of the 20 pages. It found **0 matches**.

## 3. What the guard misses: research-log sentences still rendering

Each of these talks about the site's research or editing, not about the student's options:

- **DE**, 22 July DoSV card: "The hidden deadline in the German system, **and it was not on this calendar at all**." This is edit history. Cut the clause.
- **EE**: "Tallinn University's TOEFL minimum could not be read reliably — **the figure extracted from its page was corrupt**." Make it: "Tallinn University's TOEFL minimum is not given here; check it on its admissions page."
- **FI**: "The Administrative and Social Sciences table and the Education table **were not read**."
- **LV**, institution card: "no English-taught bachelor's degree **that we could find**: its English pages (read…"
- **LT**: "details were not verified **on the pages read**."
- **NL**, route card for 15 April: "**Carried from the promotion agency rather than the government page**, so treat the exact date as indicative." Make it: "Indicative: Nuffic's date, not the government's."
- **NL**, "Accept your place" card: "There is genuinely no date to publish here, **and that is the finding rather than a gap**". Cut the clause.
- **GB, LT, LV**, source lists: "Founding years… are taken from the English Wikipedia article linked in **that institution's wikipedia field**, not from a fetched university page." This exposes the data schema. Make it: "Founding years are from Wikipedia."
- **Many pages**: "was not verified during this research" / "in this research". There are about 15 of these, on AT, BE, CH, FR and LU. The gap is right to mark, but the wording is a research log. Replace it with "is not confirmed here; check with the university", the phrasing the EE fixes already use.

**Suggested extra guard terms:**
`not on this calendar|extracted from|could find|were not read|pages read|promotion agency|that is the finding|wikipedia field|during this research|in this research|this research could`

## 4. Internal contradictions: six pages checked (IS, IE, HU, SI, DE, NL), plus GB

In each case, the label on the card says one thing and the note underneath it says the opposite.

| Page | Card | Label on the card | What its own note says | Fix |
|---|---|---|---|---|
| **GB** (route `gb-ucas-2027`) | 15 Oct 2026, "Oxford, Cambridge, medicine, dentistry and veterinary medicine close". Both the route and the country card are affected. | "Equal consideration. Later ones may still be read, at the institution's discretion" | "…this is three months before everyone else **and it is hard**." UCAS itself says it is "unusual for them to consider late applications" for 15 October courses. | Make both cards `hard`. This is the one contradiction that points the student the unsafe way. |
| **NL** (route `nl-studielink-2027`) | 1 May 2027, "Applications close for everything else" | "Hard deadline. After this the door closes." | "Apply after it and the institution **may** refuse you." On the same page, the country card for the same date is "Equal consideration", and its note says "This is an equal-consideration date rather than a hard one". Both cards sit next to each other on `dist/timeline/` too. | Make the route card `equal-consideration`, so it matches the country card. |
| **SI** | "Have every document in by this day [10 July], or your decision slips from July to September" | "Hard deadline. After this the door closes." | "Miss it and **you are not rejected** — you move to the 'naknadno sprejeti' list decided by 18 September". The card's own title says the same. | Give it a soft consequence (indicative or priority). |
| **SI** | "Maribor, Primorska and Nova Gorica — the same national periods, not separate ones" | "Hard deadline. After this the door closes." | This is not a deadline. It explains that these universities "do not set their own application deadlines". | Make it a non-deadline note (no consequence), or fold it into the joint-call card. |
| **IS** (route `is-direct-2027`) | "Set by each institution: Bifröst, the Agricultural University and the University of the Arts" | "Hard deadline. After this the door closes." | "Each sets its own date. Check the institution's page." There is no date, so no door closes. | Give it no consequence. This is also true of the similar "Set by each institution" cards on AT and HU. |
| **IE** (route `ie-cao-2027`) | 1 Feb 2027, "Normal closing date" | "Hard deadline. After this the door closes." | "Late applications reopen in March at a higher fee". The calendar's own 5 March–1 May late window confirms it. | Lower priority. Keep it `hard`, but reword the note: "…closes for restricted courses; other courses reopen 5 March at €65". |
| **IE** (route) | 26 August 2027, 14:00, "Round 1 offers" | A dated, timed card | The note says "The 2026 date." The country card for the same event says "Not yet announced", and the Handbook 2027 says "(TBC)". | Lower priority. Mark the route milestone provisional, or show it as "late August (2026: 26 August)". |

- **HU and DE pass.** Their cards agree with their notes, their watch-outs and their short versions.
  - DE's 15 July and 20 July cards follow each other correctly.
  - HU's watch-out now matches its calendar.
- **Smaller slips:**
  - IE 5 July card: the label says "Not published by anyone", while its note quotes the IB's own "before 5 July"/"after 5 July" rule. It also advises "treat 4 July 2027 as the last safe day" on a card dated 5 July.
  - NL 1 June Maastricht maths card: the label says "Not published by anyone", but the date comes from Maastricht.

## 5. Sampled facts (11 facts, 7 countries; none of them checked in rounds 1–3)

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | GB | Main equal-consideration date 13 Jan 2027, 18:00 | CONFIRMED | ucas.com/events/2027-entry-deadline-…-475546: "13 January 2027", "18:00 (UK time)" |
| 2 | GB | 12 May 2026 open; 1 Sep submit; 15 Oct 2026 18:00 for Oxford, Cambridge, medicine, dentistry, vet | CONFIRMED | ucas.com/…/ucas-undergraduate-when-apply: "15 Oct (18:00 UK time) Equal consideration date for applications to the universities of Oxford and Cambridge…" |
| 3 | FR | Licence €178 for 2026/27; CVEC €105 | CONFIRMED | service-public.gouv.fr/particuliers/vosdroits/F2865: "Licence… 178 €"; "Le montant de la CVEC pour la rentrée 2026-2027 est de 105 €"; cvec.etudiant.gouv.fr agrees |
| 4 | FR | Sciences Po 2027 rounds close 4 Nov 2026, 13 Jan 2027, 1 Mar 2027 | CONFIRMED | sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/: "4 November 2026", "13 January 2027", "1 March 2027" |
| 5 | DE | DoSV WS 2026/27: 27.04 open; 31.05 / 15.07 closing; 15.06 / 20.07 paper documents; 22.07 Stichtag; 24.08 end of coordination; no WS 2027/28 table | CONFIRMED | hochschulstart.de/bewerben-beobachten/termine: "15.07.2026 - Ende der Bewerbungsphase (Ausschlussfrist)"; "22.07.2026 - Stichtag, bevor die Koordinierungsregeln greifen" |
| 6 | CZ | Charles 2nd Faculty of Medicine: apply 1 Nov 2026–30 Apr 2027; Prague exams 3 Jun and 22 Jul 2027; registration by 30 Apr; Berlin 13 Jul 2027 | CONFIRMED | lf2.cuni.cz/en/applicants/how-to-apply/key-dates-and-deadlines: "Applications are accepted from 1 November 2026 to 30 April 2027"; the table shows Berlin "13 July 2027" |
| 6b | CZ | "Only Berlin, on 13 July 2027, carries a day among its overseas sittings" (`cz.json` watch-out and the note on the overseas-sittings card) | **WRONG** | Same table, raw HTML: London "2 July 2027"; Dubai "17 January 2027, 11 April 2027"; Tel-Aviv "6 January 2027"; Bangkok, Doha and New Delhi are dated too. **London is a dated sitting a Danish student can reach**, and it is missing from the advice "Plan on Berlin, an online sitting, or travelling to Czechia". The claim predates this pass, but it is wrong today. |
| 7 | CZ | VŠE International Business: opens 1 Nov 2026; deadline 28 Feb; EUR 100 fee | CONFIRMED | ibb.vse.cz/admission-process/how-to-apply/: "The application will be open on 1 November, 2026"; "The deadline for applying is 28th February"; "application fee of EUR 100" |
| 8 | SI | Ljubljana precedent: first period 18 Feb–18 Mar 2026; 24 July decision if evidence is in by 10 July; evidence by 31 July; enrolment 24 Jul–14 Aug | CONFIRMED | uni-lj.si 2026_zlozenka_A5-EU_slo.pdf: "Prijava v prvem roku: od 18. februarja do 18. marca 2026"; "do 24. julija 2026 za vse, ki bodo do 10. julija 2026 oddali vsa zahtevana dokazila" |
| 9 | NL | UCM: non-EU 1 Feb 2027, EU/EEA 1 Apr 2027 (23:59 CET); enrolment tasks by 31 Aug 2027 | CONFIRMED | maastrichtuniversity.nl/…/university-college-maastricht/admission-requirements: "1 April 2027, 23:59 CET Deadline for applicants with an EU/EEA or Swiss nationality"; "31 August 2027, 23.59 CET" |
| 10 | AT | MedAT 2026: registration from 2 Mar 2026; 13,248 sat; 1,950 places | CONFIRMED (the 31 March close and the ~€110 fee were not visible on the home page) | medizinstudieren.at: "Ab dem 2. März 2026 beginnt die Anmeldephase"; "13.248 Kandidat:innen"; "insgesamt 1.950 Studienplätze" |

## 6. Ranking and comparison claims in student-facing lines

| Page | Claim | Problem |
|---|---|---|
| **FR** ("Why it might suit you", item 1) | "€178 a year… the lowest headline fee in Western Europe" | **False.** Germany, Austria, Norway, Finland and Sweden charge EU students no tuition, and their pages on this same site say so. Cut the ranking and keep "€178 a year for a licence in 2026/27". |
| **NL** ("Why it might suit you") and **GB** ("Why it might suit you") | "Three-year… bachelor's, so you finish a year earlier than in most of Europe" / "three-year English/Welsh degrees are shorter than most of Europe" | **False.** Under Bologna, most European bachelor's degrees take three years, Denmark's included. Make it "three years, like Denmark's" or drop it. |
| **FI** (short version) | "Finland is the one country on this list where your IB transcript is converted into a published, field-by-field points table…" | This is the same kind of claim round 3 removed from DE and IE. NO, SE and IE also convert on published tables. Make it "Finland converts your IB transcript into points on published tables that differ by field of study, and admits you on them directly." |
| **NL** (short version) | "…the default choice for Danish IB students for twenty years" | No source is given. Make it "a common choice for Danish IB students". |
| **NL** | "More fully English-taught bachelor's degrees than anywhere else on the continent" | Probably true, but no official source is given. Cite one, or say "hundreds". |
| **LT** (short version) | "more English-taught bachelor programmes than Latvia or Estonia" | No count is given for any of the three countries. Cite a count or drop the comparison. |

## 7. Pages read as a student and as a counsellor

- **IS:** Now consistent, careful and honest. The 5 June card is now advice.
  - Template defect: "Where to apply… Applications go through **None.** Study in Iceland states…" and "…a programme catalogue only. ." The same "Applications go through None" renders on CZ, BE and PL. This is a code or template problem, not a data one, but a student sees it.
  - The Iceland header reads "…and 1 of 6 deadlines carry no published date" and "8 dates on this page are carried over", above a calendar of 10 dates. The header counts do not match the calendar they introduce. The same is true on NL ("1 of 5 deadlines", then 27 dates) and SI ("10 of 10 deadlines carry no published date" over 13 dated events).
- **FR:** A good, clear page, and the Sciences Po and Polytechnique rounds are exactly what a counsellor needs. It is let down by the "lowest in Western Europe" line (section 6).
- **NL:** The strongest calendar on the site for the choices a student has to make: numerus fixus, the 15 April clock and the Maastricht dates. It fails on the 1 May double card (section 4) and on two overclaims in the opening lines (section 6).
- **GB:** The UCAS and admissions-test calendar is excellent and fully verified. It fails on the Oxford and Cambridge "Equal consideration" card (section 4). The Wikipedia-field line in its source list is jargon.
- **SI** (calendar) and **DE** (calendar): The facts are strong. SI has the two card mislabels, and DE has one leftover edit-history clause.

## Top fixes (in order of how much they raise the score)

1. **Make each calendar card's consequence agree with its note.**
   - The specific fixes:
     - GB 15 Oct (route and country cards): `hard`.
     - NL `nl-studielink-2027` 1 May: `equal-consideration`.
     - SI 10 July card: soft (indicative or priority).
     - SI "Maribor, Primorska and Nova Gorica": no consequence.
     - IS, AT and HU "Set by each institution": no consequence.
   - Then add a guard that fails the build when a `hard` card's note contains "not rejected", "reopen", "does not set" or "sets its own date", or when an `equal-consideration` card's note contains "it is hard". Round 3 fixed one card; this pass needs to fix the whole class.
2. **Czechia: correct "only Berlin carries a day".** Charles University's 2nd Faculty of Medicine now dates London (2 July 2027), Dubai, Tel-Aviv, Bangkok, Doha and New Delhi. Make the watch-out "Plan on London (2 July) or Berlin (13 July 2027), an online sitting, or travelling to Czechia", and fix the note on the overseas-sittings card to match. Source: https://www.lf2.cuni.cz/en/applicants/how-to-apply/key-dates-and-deadlines
3. **Remove the false comparisons:** FR "lowest headline fee in Western Europe", and NL/GB "shorter than most of Europe". Soften FI "the one country on this list", NL "default choice for twenty years" and the LT count comparison (section 6).
4. **Finish the strip.**
   - Remove the ten research-log clauses in section 3.
   - Change "not verified during/in this research" to "not confirmed here; check with the university".
   - Add the extra guard terms from section 3.
5. **Lower priority, template:**
   - "Applications go through None." (IS, CZ, BE, PL);
   - the header's deadline count, which disagrees with the calendar it introduces;
   - the doubled period.
   - These are for whoever maintains `src/`, not for data editors.

With fixes 1 to 3 done, I would score this 8. The research underneath is ready. Four rounds and 69 checks have found no wrong deadline or fee. What still stands between it and a student is how the site words the cards it shows them.
