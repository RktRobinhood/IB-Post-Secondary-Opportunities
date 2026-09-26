# Follow-ups #41: Editor critique, round 4

This critique covers main at `09804d5`, which includes round 4 (`2975c5b`). It was written on 2026-09-26 by a critic who did not write or score rounds 1 to 3. The web was blocked, so every claim was checked against the repo's own records.

How I checked:
- I copied the checkout to a private scratch folder and built it there (602 pages). Both guards pass against that build: `research-log` read 598 pages, and `superlatives` passes too.
- I dumped the visible text (`htmlToText`) of every page. That is 95,755 lines, or 22,025 distinct ones. I read the 92,252 lines on pages outside `/trust/`, `/counsellors/`, `/about/` and `/credits/`.
- I ran `rankings()` over every distinct rendered line: 228 hit, and I sorted every one by hand.
- I grepped the same text for research vocabulary the guard does not name, such as "recorded", "named", "listed", "inferred", "checked", "we" and "this site".
- I wrote 102 new phrasings (52 ranking and 50 research-log) and ran each guard's own rule over them.
- I confirmed that all 103 hand-edited rows in "Every string changed in round 4" are in the data. I read 48 of them in full against their records.

## Score: 7 / 10

This is a strong 7. The surface students meet first is now clean. Every item in round 3's tables is fixed:
- **The 16 rankings.** All are gone.
- **The Destination route notes.** The 25 "Not researched…" notes are gone.
- **`/prepare/`.** Its file-path leak is gone.
- **The Evidence template.** The template change is honest (see (c)).

Across the build, I found no ranking or research-log text on the Destination cards, taglines or summaries, or in the context notes.

It is not an 8, for two reasons:
- **The rankings moved to a field the guard does not read.** Programme summaries are the first paragraph of the programme pages Danish students use most. They still carry "Maastricht's flagship business bachelor", "One of the few games degrees in Europe with a real industry behind it" and "the most oversubscribed engineering degree in the Netherlands". None of these has a source. Each would be caught by `rankings()` if the guard read `data/programmes/*.json`.
- **The research-log guard still catches the words critics quoted, not their synonyms.** Round 4 deleted "Listed so that the route is visible" on LV and JP. It left "Named so the route is visible" on AE, CN, HK and SG, and "Listed for completeness" on PT, IT and KR. It swapped "the model has no requirement kind" for "this site cannot state 'a qualification at this level', so it shows a full IB Diploma", on four Breda pages. About 20 rendered lines of this kind pass the guard.

Changes 1 and 2 below are about an hour of data edits. With them done, I would score this 8.

## (a) Round-4 rewrites, checked against their records

All 103 hand-edited rows are in the data. The one substring mismatch (SE `routes[2].what`) is a false alarm: the old and new texts share their first words. I read 48 rows in full against their own fields and Evidence:
- SE `deadlines[4]`, Erasmus `meta.notes[0]`, both attributions;
- every "Listed/Recorded because" rewrite;
- CN, JP, MT, PT, LT and HU notes;
- every "Verified" rewrite, the 8 guide gap lines, the Breda and Erasmus opportunity notes, and the 4 programme summaries;
- all 30 of Change 3, all 5 of Change 5, and all 3 of Change 6.

**38 are good.** None invents a fact. The best are:
- **Tighter wording from the record.** "A recent category in the Japanese system, with little documentation in English" (JP), "A real and commonly taken route that international guidance rarely mentions" (SE) and "The Netherlands has around eight…, AUC and UCR among them" all say less than before, and what they say is supported.
- **Sibling fixes.** The SI line now carries the "dorms only in Maribor" fact, which `housing` quotes from Study in Slovenia. The EE summary, NZ Otago and CA Waterloo rewrites are clean.
- **NTNU.** Its line now reads its own `notableFields` exactly.

**10 fall short:**

| # | Where | After | Problem |
|---|---|---|---|
| 1 | `data/opportunities/nl-breda-uas-{applied-data-science-and-ai,creative-business,creative-media-and-game-technologies,hotel-management}-2027-autumn.json` `requirements[0].note` | "…and this site cannot state 'a qualification at this level', so it shows a full IB Diploma, which is what this site's readers hold…" | The data model is still explaining itself to a student, with "the model" renamed "this site". It renders on four programme pages. |
| 2 | `data/destinations/nl.json` `sectorLandscape.routes[3].note` | "…which is why they are named here." | "Listed because" is back, as "named here because". |
| 3 | `data/countries/jp.json` `funding[0]` | "It is here because people ask about it; it is not available:" | The same pattern again. |
| 4 | `data/countries/lt.json` `application.deadlines[4].notes` | "Vilnius University comes first on this page." | This sentence says nothing. The same note still ends "…so the year is inferred." |
| 5 | `data/countries/mt.json` `application.deadlines[2].notes` | "It shows the IB deadline above for the concession it is:" | This is not an English sentence. |
| 6 | `data/countries/cn.json` `application.deadlines[11].notes` | "This date matters for where it sits, not because…" | It is vague. The point is the next sentence. |
| 7 | `data/context-notes/no-language-is-the-obstacle.json` `attribution` | "Samordna opptak's published rules, and a count of English-taught Norwegian bachelor programmes" | The old line said honestly that the survey was the project's own. The new one reads as if an outside count exists. None is recorded: `no.json` `language.englishTaughtBachelors` says "roughly fifteen" and cites no list. This is a small step backwards on truth. |
| 8 | `data/topics/distinctive-options.json` `options[5].whoItSuits` | "this is a fully funded route into a master's in Europe" | This overclaims. The record's own `cost` says scholarships "normally cover" tuition, which describes the scholarship, not every student. A student will read it as a promise. |
| 9 | `data/countries/ca.json` `institutions[5].englishBachelors` (McMaster) | renders "In English: Problem-based learning across health and science programmes." | The praise is gone, but the field still does not answer the question the label asks. |
| 10 | `data/countries/se.json` `institutions[7].note` (Jönköping) | "…with English-taught bachelor's especially through its international business school." | It reads badly. Use "…whose English-taught bachelor's are mostly in its international business school." |

## (b) What students still see

### Unsourced rankings and marketing on programme pages (the guard does not read `data/programmes/`)

| Rendered on | Source | Text |
|---|---|---|
| `/programmes/nl-maastricht-international-business-2027-autumn/` (twice: card and lede) | `data/programmes/nl-maastricht-international-business.json` `summary` | "Maastricht's flagship business bachelor" |
| `/programmes/nl-breda-uas-creative-media-and-game-technologies-2027-autumn/` (twice) | `data/programmes/nl-breda-uas-creative-media-and-game-technologies.json` `summary` | "One of the few games degrees in Europe with a real industry behind it" |
| `/programmes/nl-tudelft-aerospace-engineering-2027-autumn/` | `data/programmes/nl-tudelft-aerospace-engineering.json` `summary` | "It is the most oversubscribed engineering degree in the Netherlands". The record has no applicant numbers; the opportunity says only "440 places… every place is allocated by selection". |
| `/programmes/dk-cbs-international-business-2027-autumn/` | `data/programmes/dk-cbs-international-business.json` `summary` | "It is the most applied-to and the highest cut-off of any CBS bachelor". Nothing records the "most applied-to" figure. The cut-off is highest only among the six CBS English-taught bachelors on this site (11.1, then 10.7 and 10.2). |
| `/programmes/dk-sdu-interactive-technology-engineering-2027-autumn/` | `…/dk-sdu-interactive-technology-engineering.json` `summary` | "one of the few engineering degrees where a portfolio instinct is genuinely useful" |
| `/programmes/nl-utwente-creative-technology-2027-autumn/` | `…/nl-utwente-creative-technology.json` `summary` | "one of the few technical-university routes open to a student who did not take HL sciences" |
| `/destinations/us/` | `data/destinations/us.json` `jurisdictions[2].summary` | "MIT is its best-known practitioner" |
| `/guides/distinctive-options/` | `options[14].whoItSuits` | "with a qualification that reads clearly to European and American employers". This is an unsourced outcome claim, and `rankings()` does not word-match it. |

**Scoped comparisons in the same field.** These are defensible only if the page can prove them:
- AU Computer Science "the most competitive English-taught bachelor at AU on 2026 figures". This is true of the six AU cut-offs on the site (11.4 is the highest).
- AU IT Product Development "the most reachable of AU's three English-taught computing degrees". This is also true.
- AU Economics "the broadest of AU's English-taught degrees".
- SDU Mechatronics "SDU's largest English-taught engineering intake". Nothing records it.
- SDU Mechanical "the widest set of alternative science entry routes" and "the broadest set".

Put the true ones in `NOT_A_RANKING` with their reasons, and rewrite the rest.

### Research log that passes the guard

| Rendered on | Source | Text |
|---|---|---|
| `/destinations/{ae,cn,hk,sg}/` | `destinations/{ae,cn,hk,sg}.json` `sectorLandscape.routes[4|2|3|4].note` | "Named so the route is visible." / "…named so that the route is visible." |
| `/destinations/ca/` | `destinations/ca.json` `routes[2].note` | "Named here so that a student who meets the word knows where it sits." |
| `/destinations/gr/`, `/destinations/jp/` | `gr.json` `routes[1].note`, `jp.json` `routes[1].note` | "Named because they exist…", "Named because MEXT names it…" |
| `/destinations/kr/` | `kr.json` `routes[3]`, `[4]`, `[5].note` | "Named because it is a visible part of the sector and because it is an example of a route that exists and is not open to this reader", "which is exactly why it is worth naming. Not covered here beyond its existence.", "Listed for completeness." |
| `/destinations/pt/` ×2, `/destinations/it/`, `/timeline/` | `countries/pt.json` and `countries/it.json` deadline notes | "Listed for completeness." / "Listed for completeness only." |
| `/destinations/{ch,at,hu,lt}/`, `/universities/{ch-eth,at-uni-wien,lt-vu}/`, `/timeline/` | `countries/ch.json` (5 `year` labels and 1 note), `at.json`, `hu.json` and `lt.json` deadline notes | "so the year here is inferred", "the years here are inferred", "The years are inferred forward… because the page gives none", "inferred one cycle forward". Round 4 made "this site assumes the 2027 intake" the convention and missed these, because the rule only matches "inferred from". |
| `/programmes/nl-maastricht-{international-business,university-college-maastricht}-2027-autumn/` | the opportunity `requirements[0].alternativeRoute` | "that absence was checked rather than assumed" |
| every open-entry programme page, e.g. `/programmes/nl-maastricht-data-science-and-artificial-intelligence-2027-autumn/` | `src/pages/programme.mjs` l.189 | "As recorded here, places on this programme are not limited" |
| `/universities/dk-via/`, `/universities/dk-zealand/` | `data/institutions/dk-via.json` and `data/dk/via.json`; `dk-zealand.json` and `data/dk/zealand.json` | "so they are recorded as that one programme"; "…is recorded as meeting it". The second hides whose judgement this is, and the student needs to know that Zealand has not said so. |
| `/destinations/{ch,ie,be,is}/` | `ch.json` `costs`, `ie.json` ×2, `be.json` `year`, `ie.json` `deadlines[]`, `is.json` | "the only official figure recorded here", "Trinity College Dublin is recorded above", "recorded as the pattern for 2027", "No date is recorded here, deliberately", "no opening date to record" |
| `/timeline/` | `src/pages/timeline.mjs` l.189–190 | "212 dates we could not pin down" / "Looked for and not published" |

### Smaller things a student would notice

- **Cut-off answers.** 16 "In English:" answers on `/universities/` stop mid-sentence, because `firstClause()` in `src/pages/schools.mjs` cuts at 12 words and at every full stop. Examples:
  - ANU "…with a strong research-led first year and unusually.";
  - LASALLE "In English: BA.";
  - DigiPen "…BA in Game Design,.";
  - ESCP "…across three campuses in three.".

  This is the defect round 3 flagged on McMaster. It is a template bug, not #41 content, but it fails "would I say this to a student".
- **A slogan quoted as a description.** QUT's `englishBachelors` renders "Applied degrees branded 'the university for the real world'". That quotes a marketing line as the description.

## (c) The Evidence template: is the verification state still honestly visible?

**Yes.** It is clearer than before.
- **Where the state shows.** On a Destination page it is stated three times, in words:
  - in the header ("Read from the source, not yet checked by a person.");
  - in the disclosure's lead ("None has been signed off by a person yet, so confirm anything consequential…");
  - once at the foot of the disclosure.

  On a programme page, the lead says "…and whether a person has checked it", and the foot gives the state.
- **Every block shows it.** All 109 Evidence disclosures in the build render exactly one state label. That is "Not yet checked by a person." everywhere except the few Superseded, Past-its-review-date and Sources-disagree cases.
- **The labels come from the policy.** They come from `evidence-policy.mjs` `LABELS`, so the words match the rest of the site. `classify()` still falls to needs-review for anything not explicitly `verified`, and still overrides with `stale` past `reviewBy`. The honesty rule is intact.
- **Per-source labels.** These appear only when records disagree. None does today, which is correct.
- **Removing `interpretation` is right.** The per-record English `claim` still renders under a foreign-language excerpt; I checked SDU European Studies, where a Danish excerpt is followed by an English claim. The student loses nothing they needed.

**One weakness.** With several sources, the bare "Not yet checked by a person." after the list reads as if it belongs to the last source. Say it about all of them: "None of these sources has been checked by a person yet." For one source: "This source has not been checked by a person yet."

## (d) The guards

**`superlatives`: the rule is good; its reach is not.**
- **My probes:** on 52 new phrasings it caught 15. It missed marketing registers:
  - "internationally acclaimed", "globally respected", "a leader in", "at the forefront of", "cutting-edge";
  - "Ranked in the QS 200", "features in the THE World University Rankings";
  - "Number one in Denmark for…", "Voted best student city", "No other Danish school comes close", "Few places match";
  - "Its alumni include… a Nobel laureate", "Hugely popular with", "carries real weight with employers".
- **The live gap is reach.** Every live ranking in (b) is in `data/programmes/*.json` `summary` or `data/destinations/*.json` `jurisdictions[].summary`, and neither is read.
- **Exemptions.** `ALLOW` (4 entries) and `NOT_A_RANKING` (16 entries) are honest. Each gives a reason, and each fails when stale. `ALLOW[0]` now describes its count correctly.

**`research-log`: better method, same result.** Moving to vocabulary was the right idea. But the vocabulary list is still built from quoted cases:
- **Verbs.** It has "Recorded/Listed because/so", but not "Named", "for completeness", "recorded here", "recorded as" or "worth naming".
- **Inference.** It has "inferred from", but not "inferred" alone.
- **The model.** It has "this profile / project / catalogue", but not "this site cannot / shows / treats".

On my 50 new phrasings it caught 1. About 20 of those were in registers the site does not use, so treat that ratio as loose. The live misses in (b) are the real measure: about 20 distinct rendered lines on about 18 pages.

**The fix is a rule about sentences where the site explains its own coverage,** not more words:
- `\b(?:Named|Listed|Included|Recorded|Mentioned|Shown)\b[^.]{0,40}\b(?:so|because|for completeness)\b`
- `\b(?:recorded|named|listed) (?:here|above|below|on this page)\b`
- `\brecorded as\b`
- `\bto record\b`
- `\binferred\b`
- `\bthis site (?:cannot|can't|shows it|treats|records|has no)\b`
- `\b(?:checked|looked for)\b(?! 20\d\d)` in running text (the "— checked 2026-…" furniture is already exempt)
- `\bwe (?:could not|did not|have not|found)\b`

## Changes that would raise the score, ranked

1. **Take the rankings off the programme pages, and make the guard read them** (30 minutes):
   - `data/programmes/nl-maastricht-international-business.json` `summary`: "Maastricht's flagship business bachelor, taught entirely…" becomes "Maastricht's International Business bachelor, taught entirely…".
   - `data/programmes/nl-breda-uas-creative-media-and-game-technologies.json` `summary`: "One of the few games degrees in Europe with a real industry behind it, split into…" becomes "A games degree split into…".
   - `data/programmes/nl-tudelft-aerospace-engineering.json` `summary`: "It is the most oversubscribed engineering degree in the Netherlands, and the whole of the competition…" becomes "Every one of its 440 places (2026-27) is allocated by selection, and the whole of the competition…".
   - `data/programmes/dk-cbs-international-business.json` `summary`: "It is the most applied-to and the highest cut-off of any CBS bachelor, and…" becomes "Its 2026 quota 1 cut-off, 11.1, was the highest of CBS's six English-taught bachelors on this site, and…".
   - `data/programmes/dk-sdu-interactive-technology-engineering.json` `summary`: delete "It is one of the few engineering degrees where a portfolio instinct is genuinely useful."
   - `data/programmes/nl-utwente-creative-technology.json` `summary`: "which makes it one of the few technical-university routes open to a student who did not take HL sciences" becomes "so it is open to a student who did not take HL sciences".
   - `data/destinations/us.json` `jurisdictions[2].summary`: "MIT is its best-known practitioner:" becomes "MIT is one:".
   - `data/topics/distinctive-options.json` `options[14].whoItSuits`: "with a qualification that reads clearly to European and American employers" becomes "with both a US and a Chinese degree at the end".
   - **In the guard:** add `data/programmes/*.json` `summary` and `data/destinations/*.json` `jurisdictions[].summary` to "What it reads". Put the true AU and SDU comparisons in `NOT_A_RANKING` with their sources, and rewrite the others.
2. **Remove the synonyms of "Listed because"** (30 minutes):
   - **AE, CN, HK and SG route notes:** delete "Named so the route is visible." (SG `routes[4]` becomes "Not covered here.").
   - **CA `routes[2]`:** delete the first sentence.
   - **GR `routes[1]`:** "On the same ministry route; not covered further on this site."
   - **JP `routes[1]`:** "MEXT names it as one of the five routes open to international students."
   - **KR `routes[3]`:** "Not open to you:" followed by the rest of the note. **KR `routes[4]`:** end at "…a different ministry. Not covered on this site." **KR `routes[5]`:** delete "Listed for completeness."
   - **PT ×2 and IT deadline notes:** delete "Listed for completeness (only)."
   - **NL `routes[3]`:** end at "…ordinary programme listings."
   - **JP `funding[0]`:** "It is not open to you:".
   - **Breda ×4 `requirements[0].note`:** "BUas's bar is a havo- or vwo-equivalent diploma, one level below what a Dutch research university needs, and a full IB Diploma clears it."
   - **Maastricht ×2 `alternativeRoute`:** "This programme's own admission page publishes no route: it states…".
   - **`src/pages/programme.mjs` l.189:** "Places on this programme are not limited: everyone who meets the entry requirements is admitted."
   - **`dk-zealand` (both files):** "This site treats Mathematics: Applications and Interpretation or Analysis and Approaches, at SL or HL, as meeting it; Zealand does not say so, so confirm with Zealand."
   - **`dk-via` (both files):** "…chosen when you apply, so this site shows them as that one programme."
   - **CH:** "the only official figure on this page".
   - **IE ×2:** "Trinity College Dublin's figure is above".
   - **BE:** "2026 session, the pattern for 2027".
   - **IE HPAT:** "No date is given here, because…".
   - **IS:** "so there is no opening date".
   - **`timeline.mjs`:** "212 dates with no published day" / "Not published yet, or set by each institution rather than centrally."
3. **Put the year assumption in the site's convention everywhere:**
   - CH's five `year` labels: "…published with no year; this site assumes the 2027 intake".
   - The ETH note: "The page gives no years; this site assumes the autumn 2027 intake."
   - AT: "…so this site assumes the same window in 2027, and the day could move."
   - HU and LT: "…so this site assumes 2027."
   - LT `deadlines[4]`: also delete "Vilnius University comes first on this page."
4. **Widen `research-log`** with the sentence-level patterns in (d). Add this round's live misses and my 50 probes as fixtures, marking the out-of-register ones as negatives where they should pass.
5. **Fix the rewrites that fell short:**
   - MT `deadlines[2]`: "This is why the IB deadline above is a concession: if you are taking A-levels or a national diploma rather than the IB, you are applying to Maltese medicine in January."
   - CN `deadlines[11]`: "No Chinese university waits for this date. Every date on this page that has been established falls before it: …".
   - NO attribution: "Samordna opptak's published rules, and this site's own count of English-taught Norwegian bachelor programmes, September 2026."
   - `options[5].whoItSuits`: "this is a route into a master's in Europe where a scholarship can cover tuition, travel and living costs".
   - McMaster `englishBachelors`: "All programmes".
   - Jönköping: the text in (a) #10.
6. **Template polish:**
   - **`evidenceBlock` foot label:** "None of these sources has been checked by a person yet." (or "This source has not…").
   - **`src/pages/schools.mjs` `firstClause`:** stop cutting at 12 words mid-sentence, and do not split on the full stop inside "B.A.". Either show the whole first sentence or leave the tile out. See the 16 cases in (b).

With changes 1 and 2 done, this is an 8. With 3 and 4 as well, the next critic should find nothing in this class, which is what a 9 means here.
