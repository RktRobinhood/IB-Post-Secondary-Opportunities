# Country audit (Europe, 20 destinations): critic round 5 (final)

Critic: **Admissions counsellor**, a fresh critic under `docs/QA_CRITIC_LOOP.md`. Date: 2026-09-24.
Scope: fi, is, no, se, ee, lv, lt, pl, cz, hu, gb, ie, nl, be, lu, de, at, ch, fr, si.

**What I did:**
- Read rounds 1 to 4, `round-3-fixes.md` and `round-4-fixes.md`, but scored on what I found myself.
- Ran `node src/build.mjs` so `dist/` was current, then reduced `dist/destinations/<cc>/index.html` to its visible text for the 20 codes.
- Ran `node scripts/test-deadline-labels.mjs`, `npm run validate`, and `test-calendar`, `test-destinations`, `test-sourcing` and `test-evidence-policy`.
- Checked facts against the live official pages with WebFetch, and with curl plus a text grep where WebFetch returned nothing useful. I read the Warsaw Senate resolution as a PDF.
- Ran git read-only. I edited nothing in `data/`, `src/` or `scripts/`.

## SCORE: 8 / 10: accepted

**The research is ready for students.** In five rounds, critics have checked 77 facts and found no wrong deadline or fee. This round checked 8 new facts in 8 countries, and all 8 are confirmed.

**The fault that held rounds 3 and 4 at 7 is fixed.** That fault was calendar labels that contradicted their own notes, one of them pointing the student the unsafe way. All 35 relabelled cards are consistent, and a guard now reads all 756 events and fails the build if one contradicts itself.

**Round 4's other named fixes have landed:**
- the Czech London sitting;
- the France, Netherlands, UK and Finland comparisons;
- the research-log clauses.

**Why this is 8 and not 9:** round 4 found unsupported ranking claims, but they were fixed one sentence at a time rather than as a class.
- The Lithuania comparison that round 4 asked to be removed is gone from the short version but is still the page's **headline**: "The widest English-taught choice in the Baltics". That headline also appears on `/europe/`.
- Two other comparisons are contradicted by official pages or by this site's own pages:
  - Lithuania says state-funded places are "a genuine advantage over Latvia".
  - Czechia calls Brno University of Technology "among the cheapest English-taught engineering degrees anywhere in Europe".

None of these is a date or a fee, and none sends a student past a deadline. They are overstatements I would correct in the meeting, not facts I would have to take back. They go in the follow-up issue below; they do not hold back acceptance.

## 1. Round 4's fixes: did they land?

| Round 4 fix | Status | Evidence in the built page |
|---|---|---|
| GB 15 Oct Oxford, Cambridge, medicine, dentistry, vet: `hard`, on both the route and the country card | **LANDED** | Both cards now read "Hard deadline. After this the door closes." The note says: "UCAS says it is unusual for these universities to consider a late application, so treat 18:00 UK time on 15 October as the end." |
| NL 1 May route card: `equal-consideration` | **LANDED** | Both 1 May cards say "Equal consideration". The note quotes the government rule ("a first application after 1 May may be refused") and matches the country card. |
| SI 10 July card: soft label | **LANDED** | It is now "Priority", and its note says "you are not rejected". |
| SI "Maribor, Primorska and Nova Gorica": no consequence | **LANDED** | The card has no badge and reads as an explanation. |
| IS, AT, HU and ten other "Set by each institution" cards: no consequence | **LANDED** | No undated explanation card carries "the door closes" any more. Checked on AT, BE and CH. |
| IE 26 Aug Round 1 offers | **LANDED** | The card is undated and reads "Not yet announced", with the note "in 2026 it was 26 August at 14:00". |
| IE 1 Feb note no longer says late applications "reopen" | **LANDED** | The note reads: "the last day to apply at all for restricted courses such as medicine. A late window, 5 March to 1 May at €65, takes other courses only". |
| IE 5 July IB card | **LANDED** | It is now the IB's own cut-off, with no "Not published by anyone" label. |
| CZ Charles 2nd Faculty: London as well as Berlin | **LANDED** | The watch-out reads: "the nearest dated overseas sittings are London (2 July 2027) and Berlin (13 July 2027)… Plan on London or Berlin". London has its own card ("four days before IB results are released on 6 July"), and the step list names both. |
| FR "lowest headline fee in Western Europe" | **LANDED** | It now reads "Public university tuition is €178 a year for a licence in 2026/27". |
| NL and GB "shorter than most of Europe" | **LANDED** | Both now say "three years, like Denmark's". |
| FI "the one country on this list"; NL "default choice for twenty years"; NL "more … than anywhere else" | **LANDED** | FI: "Finland converts your IB transcript into points on published tables…". NL: "a common choice" and "Hundreds of…". |
| LT "more … than Latvia or Estonia" | **PARTLY** | Removed from the short version. The same comparison is still in the page headline, the Vilnius University card and `/europe/`. See section 5. |
| Research-log clauses (DE, EE, FI, LV, LT, NL, the Wikipedia-field line, "during this research") | **LANDED** | DE: "The hidden deadline in the German system." with no edit history. EE: "Tallinn University's TOEFL minimum is not given here". NL: "Indicative: Nuffic's date, not the government's." Source lists: "Founding years are from Wikipedia." |
| Template: "Applications go through None." | **LANDED** on IS, CZ, BE and PL | See section 6 for what is left of the template problem. |

## 2. Guards

- `node scripts/test-deadline-labels.mjs`: **ok. It read 756 events, and every label agrees with its note.**
  - The guard does what round 4 asked for:
    - It fails a `hard` card whose note sounds soft ("you are not rejected", "may still be read…").
    - It fails a softer card whose note says "it is hard" or "the door closes".
    - It fails an undated "set by each…" card that is marked `hard`.
  - It names no country, so it will catch the next card like these.
- `npm run validate`: all records are valid. `test-calendar`, `test-destinations`, `test-sourcing` and `test-evidence-policy` all pass.
- I combined the regexes from rounds 2, 3 and 4 with the editor's extra terms (`lowest headline|shorter than most|…|only Berlin|…|One is:`). Run case-insensitively over the tag-stripped text of the 20 pages, it finds **0 matches**.
- I also ran a wider regex of my own over the same text (`page read|re-read|could not be|this profile|recorded here|lowest|cheapest|best|by far|only one|unique…`). Its matches are almost all legitimate: "None" as a fee answer, "there is no central portal", "the year here is inferred from the intake this profile covers". What remains is listed in sections 5 and 6.

## 3. Sampled facts (8 facts in 8 countries; none of them checked in rounds 1 to 4)

The sample is weighted towards cards whose label changed in round 4.

| # | Country | Claim on the page | Verdict | Evidence (URL, short quote) |
|---|---|---|---|---|
| 1 | LT (label changed) | LSMU primary deadline 6 July, system closed at 00:00, marked `priority`. An additional round for selected programmes from 7 July. Final deadline 30 July at 00:00, marked `equal-consideration`. The 2026 calendar is rolled forward and flagged as such. | **CONFIRMED** | lsmu.lt/en/admission/admission-process/: "July 6, 2026 … The online application system will be closed on 6 July at 00:00"; "July 7 … Additional admission to selected programmes"; "30 July at 00:00"; "Applications submitted after the deadline could be considered only in case of available study places". The labels match LSMU's own wording. |
| 2 | GB (label changed) | 30 June 2027 18:00, "Final date for applications to be sent to universities", marked `priority`: after it you go into Clearing, and the last day is 23 Sep 2027 | **CONFIRMED** | ucas.com/undergraduate/applying-university/ucas-undergraduate-when-apply: "Applications received by this deadline will be sent to universities and colleges" (30 June 2027, 18:00); "must be with us by 18:00 (UK time) today to meet the final deadline for 2027 entry" (23 September 2027). |
| 3 | NL (label changed) | Maastricht Data Science and AI: syllabus for the mathematics sufficiency check due 1 June 2027, 23:59 CET, for EU/EEA/Swiss applicants, only if asked. Now marked `hard`. | **CONFIRMED** | maastrichtuniversity.nl/…/data-science-and-artificial-intelligence/admission-requirements (read with curl): "1 June 2027, 23:59 CET … If applicable: deadline for submitting a syllabus for the mathematics sufficiency check procedure if you have an EU/EEA or Swiss nationality". The same page confirms 1 April (non-EU) and 1 May (EU). |
| 4 | IE (card rewritten) | IB free results requests: before 5 July the coordinator sends results to up to six institutions free; after that you request them through rrs.ibo.org at $19 each | **CONFIRMED** (from ibo.org search snippets; the page returns 403 to a fetch) | ibo.org/…/requesting-transcripts/: "If you are requesting before 5 July (for May examination sessions) … contact your Diploma Programme coordinator"; "up to six higher education institutions"; "$19 USD for each transcript". |
| 5 | CZ | The Charles 2nd Faculty exemption page, "stamped as updated in September 2026", still prints the 2026 waiver deadline of 30 April and the sittings of 27 May and 15 July | **CONFIRMED** | lf2.cuni.cz/en/applicants/how-to-apply/exemptions: "Submit the electronic application … by 30 April 2026"; "in Prague on 27 May or 15 July"; "Last update: 21 Sep 2026". |
| 6 | HU | CEU (Vienna) bachelor's: four rounds, closing 15 Oct 2026, 2 Feb, 15 Apr and 15 Jul 2027 at 23:59 CET; CEU's own aid in the first two rounds only; €500 registration fee; taught in Vienna | **CONFIRMED** | ceu.edu/admissions/bachelor: "Round 1 Deadline: October 15, 2026 (23:59, Central European Time)" … "Round 4 Deadline: July 15, 2027"; "Institutional (CEU) financial aid awards will be made in the first two rounds only"; "pay the registration fee of €500"; the Admissions Office is at "Quellenstrasse 51, 1100 Vienna". The page's heading still says "2026/2027", but the dates are for autumn 2027 entry. |
| 7 | CH | ETH Zurich: apply "from 1 December to 31 March, 23:59 Central European Time"; the page gives no year, so the years are inferred | **CONFIRMED** | ethz.ch/en/studies/bachelor/application/non-swiss-matriculation-certificate/how-to-apply.html: "Application period for applicants with non-Swiss upper secondary school-leaving certificates: from 1 December to 31 March, 23:59 Central European Time". No year is given, as the card says. |
| 8 | PL (label changed) | University of Warsaw Senate resolution 278 of 20 May 2026: 2027/28 admissions start no earlier than 2 Feb 2027 and last no later than 30 Sep 2027. Marked `indicative` as an outer bound. | **CONFIRMED** | monitor.uw.edu.pl, resolution 278, § 4(1): "Postępowanie rekrutacyjne rozpoczyna się nie wcześniej niż 2 lutego 2027 r. i trwa nie dłużej niż do dnia 30 września 2027 r., z zastrzeżeniem ust. 3-5". § 4(4) allows a further round in justified cases, which supports `indicative` rather than `hard`. Note: the monitor page records an amendment, resolution 315 of 24 June 2026. The site does not mention it. I did not check whether it changes § 4. |

**Result: 8 of 8 confirmed.** No deadline or fee is wrong, so the cap of 6 does not apply.

## 4. Pages read start to finish (LT, SI, PL, EE), plus parts of GB, IE, NL and CZ

- **PL:** The best page in this set to put in front of a student.
  - The short version leads with the actionable surprise: some English-taught Warsaw degrees are free for EU citizens.
  - The watch-outs are concrete. For example: "At the Medical University of Gdansk a grade 7 at Standard Level scores 60 points while a 6 at Higher Level scores 86." The medicine-in-Denmark warning is honest.
  - The calendar is candid about how little is published for 2027 without being a research log.
- **LT:** Useful and specific. It gives LSMU's midnight trap ("the last day you can actually submit is 5 July"), ISM's 1 August diploma rule and the fees due on acceptance. It is let down by two comparisons (section 5) that sit in the most visible places on the page: the headline and the first institution card.
- **SI:** Now internally consistent.
  - The short version, the watch-outs (10 / 5 / 1 / 1 English bachelor's) and the calendar agree.
  - The 10 July card reads correctly as "Priority".
  - Two lines still sound like research or overclaim:
    - "If one of those programmes is what you want, Slovenia is one of the best-value places in Europe."
    - "No page found gives IB-specific minimum points…" / "No page read on 2026-09-22 stated whether IB English A or B is accepted…"
- **EE:** Honest about how thin the menu is ("27 English-taught bachelor's degrees in the entire country"). The Tallinn 1 March card is correct. Weak points:
  - For TalTech, which the page calls "the single best-value option in the country", it has no deadline and only says "Email them directly". A counsellor would want a precedent date there, as the page gives for Tallinn University.
  - The Tallinn University card says "by far the most transparent institution in the country", which is an editorial ranking.
- **GB, IE, NL, CZ calendars:** The cards I read agree with their notes. The IE cards for 1 February, 5 July, 1 August and the TBC Round One now tell a coherent story. The NL 1 May pair is consistent. The CZ overseas-sittings cards are correct and dated.

## 5. Remaining unsupported or wrong ranking claims (the main reason this is not a 9)

Round 4 listed six comparisons. The editor fixed the sentences named, but not the rest of their kind. What is left, in order of consequence:

| Page | Where it renders | Claim | Problem |
|---|---|---|---|
| **LT** | Page headline (`data/countries/lt.json` `tagline`), and also on `dist/europe/` | "The widest English-taught choice in the Baltics, and free places exist" | This is the comparison round 4 asked to remove, and it was removed only from the summary. It has no source. Suggested: "Thirty-plus English-taught bachelor's at Vilnius alone, and free places exist". |
| **LT** | Vilnius University card (`lt.json` `institutions[…].note`) | "…with by far the widest English-taught choice in the Baltics" | Same problem. Make it "more than 30 English-taught bachelor's and integrated programmes". |
| **LT** | How applying works (`lt.json` `application.selectionNotes`) | EU citizens can compete for state-funded places: "this is a genuine advantage over Latvia" | **Contradicted.** The University of Latvia's admissions page lists a deadline for "State-funded study places (eligible EU/EEA/Swiss citizens…)" (lu.lv/en/admissions/degree-studies/). Cut the clause. The LV page says nothing either way about state-funded places, which is a separate gap. |
| **CZ** | Brno University of Technology card | "…this is among the cheapest English-taught engineering degrees anywhere in Europe" (€1,000 a year) | **Contradicted by this site.** The EE page says TalTech's Cyber Security Engineering and Integrated Engineering are free for EU citizens, and the DE, AT and Nordic pages say public tuition is zero. This is the same fault as the FR "lowest headline fee" line that round 4 removed. Keep the numbers and cut the ranking. |
| **SI** | Short version | "Slovenia is one of the best-value places in Europe" | Unsupported. The numbers beside it (free tuition, dorms at €120–250) make the point without it. |
| **EE** | TalTech and Tallinn University cards | "the single best-value option in the country"; "by far the most transparent institution in the country" | These are editorial rankings. Say what makes each one good: "two engineering bachelor's free for EU citizens"; "the only Estonian university that publishes its selection mechanics in full". |
| **Institution cards on several pages** | first lines of institution cards | Examples: DE "the most fully international English-taught campus in Germany"; NL "The strongest engineering school in the Netherlands" (Delft) and "The most international university in the country" (Maastricht); LT "The most liberal-arts-like university in Lithuania"; HU "the best IB-specific deal in Hungary"; CH "The world's best-known hospitality school"; GB headline "Still the best-known route out of the IB" | Individually harmless, but each is a ranking with no source. The site's own heading above these cards says "A spread of what [country] offers, not a ranking". |

## 6. Smaller items (not blocking)

- **Template, "Applications go through …":**
  - HU renders "Applications go through For English-taught programmes you apply directly to each university… only. ." That is a sentence inside a sentence, followed by a stray period.
  - AT ("…through Each university's own application portal…") and CH ("…through Each university applies directly…") have a capital letter mid-sentence.
  - This is for whoever maintains `src/`.
- **Residual research-log phrasing** that none of the regexes catch:
  - SI "No page read on 2026-09-22 stated…" and "No page found gives…";
  - HU "The DreamApply course page read on 23 September 2026 shows…";
  - LV "(Undated on the page read on 2026-09-22)";
  - FI "A claim that Finland is moving to full cost recovery… could not be confirmed on any official source and is not stated here as fact";
  - IS "…That could not be confirmed on any official page";
  - LV "…left as context rather than given an entry of its own";
  - FR "…so it is not recorded here";
  - BE: "Read in Dutch on the Flemish government's own site. The exam pages are now at vlaanderen.be/toelatingsexamens." appears five times in a row.
  - Add `page read|pages? found|could not be confirmed|not recorded here|left as context|re-read` to the guard, and rephrase these as "not confirmed here; check with …".
- **LT LSMU 6 July card (`priority`):** the label follows LSMU's own "could be considered", but the 7 July round is only for "selected programmes", and LSMU does not say which. The route-card note should add: "LSMU does not say which programmes; for Medicine treat 5 July as your deadline." The country card already says to submit before results day.
- **PL:** Warsaw's resolution 278 was amended by resolution 315 on 24 June 2026. If the amendment does not touch § 4, one line in the source note saying so would close the question.

## Follow-up issue (for the backlog; it does not block acceptance)

**Title:** Europe country pages: remove unsourced ranking claims from headlines and institution cards

1. `data/countries/lt.json`:
   - `tagline`: drop "The widest English-taught choice in the Baltics".
   - Vilnius University `institutions[].note`: drop "by far the widest English-taught choice in the Baltics".
   - `application.selectionNotes`: delete "this is a genuine advantage over Latvia". The University of Latvia offers state-funded places to eligible EU/EEA citizens: https://www.lu.lv/en/admissions/degree-studies/
2. `data/countries/cz.json`, Brno University of Technology note: delete "among the cheapest English-taught engineering degrees anywhere in Europe".
3. `data/countries/si.json` `summary`: delete "Slovenia is one of the best-value places in Europe".
4. Sweep the `institutions[].note` and `tagline` fields of the 20 countries for `\b(by far|the (best|strongest|most|widest|single best)|best-known|anywhere in Europe|advantage over)\b`. For each hit, either replace the ranking with the fact behind it or cite a source. Add the pattern to the built-text guard, with an allow-list for claims that cite a source.
5. Template: fix the "Applications go through …" sentence for HU, AT and CH (`src/`).
6. Extend the research-log guard with `page read|pages? found|could not be confirmed|not recorded here|left as context|re-read`, and rephrase the matches listed in section 6.

## Score reasoning, briefly

- **What a student acts on is right:** every deadline, fee and calendar label checked in this round is correct and consistent, and a guard now holds the labels to their notes.
- **Nothing tells a student a door is open when it is shut.** That was the test round 4 applied.
- **What is left is overstatement:**
  - one comparison round 4 asked to be removed, which survives in a headline;
  - one wrong comparison with Latvia;
  - one with Brno's fees;
  - a scatter of unsourced superlatives on institution cards.

I would correct these in passing, in a meeting. I would not withhold the pages from students because of them. **8: ship it, and file the follow-up above.**
