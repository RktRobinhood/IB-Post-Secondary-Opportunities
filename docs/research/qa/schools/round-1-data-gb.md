# UK school records (#43): admissions counsellor, round 1

Under review: the 22 records `data/schools/gb-*.json` and the United Kingdom section of
`docs/research/schools/progress.md`. Checked on 2026-09-25 against the official pages: UCAS, UAT-UK,
LNAT, UCAT, UKCISA and the universities' own sites. Where a site blocks scripted fetches (Oxford, UCL,
City St George's, UAL), I read it in a browser.

## Score: 7/10. Not accepted.

**No deadline is wrong.** I checked about 60 dates across 13 records. They cover every date in
Oxford, Cambridge, Imperial, LSE, UCL, Edinburgh, St Andrews, Glasgow, Bristol, Leeds, Birmingham, KCL
and City St George's, and they include the shared UCAS, UCAT, LNAT and UAT-UK dates. Every one matches
the official page, including the less obvious ones:
- LNAT by 31 December for KCL, LSE and UCL, and by 13 January for Bristol and Durham;
- Oxford's decisions on 12 January 2027;
- Cambridge's decisions on 27 January 2027;
- Leeds's decision deadline of 12 May 2027;
- Glasgow's and Bristol's international deadline of 30 June.

This is careful work.

It is not accepted because of these problems:
- one IB rule I would not repeat to a student (LSE Maths);
- one hand-off that does not open what it says (LSE);
- a fee-status sentence, repeated in 17 English records, that is wrong for two groups this
  school actually has: Irish citizens, and UK nationals who live in Denmark.

## Errors

| # | Record | Field | What the record says | What the official page says | Source |
|---|---|---|---|---|---|
| 1 | gb-lse | `ib.text` | "quantitative degrees prefer HL Maths AA but consider AI" | HL Maths AA is **required** for 8 degrees: Mathematics and Economics, Mathematics with Economics, Financial Mathematics and Statistics, Mathematics with Data Science, Actuarial Science (both versions), Mathematics, Statistics and Business, and Data Science. AA is only "preferred/desirable (but both streams considered)" for Economics, Economics with Economic History, Econometrics and Mathematical Economics, and Finance. A student with HL AI who applies to Data Science would be rejected. | https://www.lse.ac.uk/study-at-lse/Undergraduate/Entry-requirements |
| 2 | gb-lse | `handoff.url` | `…/search-courses?query&f.Study+Type%7Ctype=undergraduate` | The filter does not apply. The page shows "Showing 1-12 results of 257" with every Study type box unchecked, so master's, PhD and executive programmes are all included. Ticking "Undergraduate" gives 43 results at `https://www.lse.ac.uk/programmes/search-courses?f.Study+Type\|type=undergraduate&studyType=b6732bf8-36e3-4461-b325-c925ad870cb4`. | (the URL itself) |
| 3 | gb-oxford, gb-cambridge (worded "As an EU citizen…"); gb-birmingham, gb-bristol, gb-city-st-george-s, gb-imperial, gb-kcl, gb-lancaster, gb-leeds, gb-loughborough, gb-lse, gb-manchester, gb-nottingham, gb-qmul, gb-ucl, gb-warwick ("Without UK settled or pre-settled status you pay…"); gb-durham ("EU, EEA and Swiss nationals without Withdrawal Agreement rights pay overseas fees") | `notes` (fee status) | Without settled or pre-settled status, an EU student pays international or Overseas fees. | In England, the "Brexit temporary offer for courses starting before 2028" gives **Home** fee status to two groups who have lived in the EEA or Switzerland since before 31 Dec 2020 and meet a 3-year residence test: Irish citizens, and UK nationals and their family members. Autumn 2027 is the **last** intake it covers. For these students the note is false by about £20–60k a year. The sentence is right for other EU nationals. (Scotland is different: St Andrews states that Irish nationals living elsewhere in the EU are Overseas, so the Edinburgh, Glasgow and St Andrews notes stand.) | https://www.ukcisa.org.uk/student-advice/fees/full-list-of-categories-for-he-in-england/, with the category PDFs `/media/aahedhfg/brexit-tempy-offer-irish-citizens-public-eng-18.pdf` and `/media/gxnhkgrb/brexit-tempy-offer-uk-nationals-and-family-public-eng-20.pdf` |
| 4 | gb-ual | `notes[2]`, `ib.text` | "BA Architecture at Central Saint Martins will not continue as a standalone undergraduate degree beyond 2027"; `ib` quotes "Architecture 35" as a comparison. | "A standalone architecture qualification at Undergraduate level is no longer running at Central Saint Martins." For 2027/28, UAL points you to the Integrated MArch. The BA is not open to 2027 entrants at all, so it should not be the example in `ib`. | https://www.arts.ac.uk/subjects/architecture-spatial-and-interior-design/undergraduate/ba-hons-architecture-csm |
| 5 | gb-edinburgh | `notes[2]` | "£1,546 a month … as a single undergraduate in 2027" | "For 2026-2027, we estimate that it will cost an average of £1,546 each month…" (Economics MA page, 2027 entry). The researcher's progress line claims the opposite ("labelled for 2027 … not 2026/27"). That claim is false, so the gb.json note it "contradicts" was right. | https://study.ed.ac.uk/programmes/undergraduate/122-economics |
| 6 | gb-oxford | `ib.text` | "An IB taught in English exempts you from a separate English test." | "Other exemptions from this English Language requirement **will be considered** for those who: are studying … the International Baccalaureate programme, if it is taught in English". The exemption is considered, not automatic. Write "usually exempts you" or "Oxford will consider exempting you". | https://www.ox.ac.uk/admissions/undergraduate/applying/for-international-students/english-language-requirements-visas |

### Smaller points (fix while you are there)

- **gb-kcl `dates[1]`** is labelled "UCAS deadline for Medicine MBBS". KCL's own test table lists Dentistry (A205, A206, A202) with Medicine. The UCAT line in the same record already says "Medicine, Dentistry", so the deadline label should match.
- **gb-glasgow `apply`** says UCAS only. Glasgow's degree pages say international students can also apply through the Common App to Arts, Engineering, Law, Nursing, Science and Social Sciences. St Andrews got this treatment; Glasgow should too.
  - Source: https://www.gla.ac.uk/undergraduate/degrees/history/ ("Application deadlines" block).
- **gb-ucl `ib.text`** says "Levels 3–5 need a 6 or 7". English Level 5 is HL 7 only, with no SL route, and Level 4 at SL needs a 7. The shortening hides the fact that SL English A cannot meet Level 5.
- **gb-manchester `ib.text`** reads as if Maths, Chemical Engineering and Computer Science are the only courses that accept only AA. The page says "some courses, **such as** …". Add "e.g.".
- **gb-ual `handoff`** points to `/subjects`, which mixes MA, pre-degree and BA content. The researcher says this was a fallback. It needs a proper undergraduate course search before the record is final.
- **Past dates.** On the retrieval day (25 Sep), 14 records carry dates that had already passed: Oxford's LNAT registration (15 Sep), the UCAT booking deadline (16 Sep) and the UCAT last test day (24 Sep). The data is right. Make sure the page greys out or hides them, so a student does not read them as still open.

## What I checked and found right

- **Every date** in Oxford, Cambridge, Imperial, LSE, UCL, Edinburgh, St Andrews, Glasgow, Bristol, Leeds, Birmingham, KCL and City St George's.
  - Shared sources: https://www.ucas.com/undergraduate/applying-university/ucas-undergraduate-when-apply, https://www.ucat.ac.uk/about-ucat/ucat-test-dates/, https://lnat.ac.uk/registration/dates-and-deadlines/, https://esat-tmua.ac.uk/deadlines/.
- **`ib`**, correct in 17 records:
  - Oxford: 38/39/40 including core;
  - Cambridge: 41–42 with 776, and Churchill, Corpus and Selwyn above the minimum;
  - Imperial: 38–42, English A 4, English B SL 6 / HL 5;
  - UCL: 34/16 to 40/20, no HL below 5, best three of four HLs;
  - Edinburgh: Economics 37–40 with 666–766 and HL Maths 5, SL English 5;
  - St Andrews: 36 (655) to 38 (666 + SL 666), AA or AI, Medicine 38 with HL Chemistry;
  - Glasgow: History 34 (6,5,5), Economics 36 (6,6,5) with AA, English A 5 / English B SL 6, HL 5;
  - Bristol: 32–40 with 18 at HL, AA or AI;
  - Leeds: 31 minimum with 15–18 at HL, Ancient History 34/16;
  - Birmingham: 7,6,6 … 6,5,5 with 32 minimum;
  - KCL: 32/HL 15 … 40/HL 21, AAA 36/18, English A HL 4 / SL 5;
  - Manchester: 30–39, BSc Maths 37 with 766 and AA only;
  - Durham: 31 (555) to 38 (776);
  - Warwick: Maths 39 with 666 AA-only, Ancient History 34, Economics TMUA reduced offer;
  - Nottingham: 36 points or 766 HL, AAA 34;
  - QMUL: A&F 36/666, Applied AI 34/665;
  - Loughborough: ID 34 (655), SES 37–38.
- Every `ib` text makes it clear that the offer varies by course. Keep that.
- **Hand-offs**, 18 opened and 16 correct. Oxford (52 courses), Cambridge, Imperial (73), UCL (441), Edinburgh, St Andrews (151 undergraduate), Durham (174), KCL A–Z, QMUL, Nottingham, Bath, Birmingham, Manchester 2027, Warwick (196) and City St George's all open an undergraduate list or search. The two that fail are LSE (error 2) and UAL (weak).
- **Fees**, correct wherever quoted:
  - Oxford £39,620–£66,580 for 2027/28;
  - Cambridge £30,798–£70,554;
  - Imperial Maths £42,700, labelled 2026-27;
  - LSE £41,900;
  - UCL £40,800;
  - Edinburgh £31,100, fixed;
  - Glasgow £28,275 and £33,708;
  - St Andrews £33,250, labelled 2026-27;
  - KCL £35,900 with a £2,000 deposit;
  - Leeds £27,300, fixed;
  - Lancaster £26,300;
  - Loughborough £31,500 and £35,000;
  - Bath's three bands;
  - Nottingham £27,600 and £48,900;
  - QMUL £30,950, £34,750 and £56,650;
  - Bristol CS £34,700;
  - Manchester's "up to 7%";
  - UAL £30,890, labelled 2026.
- **Other claims:** St Andrews' direct application (£50) and Common App route, both counting as one of your five, are right. So is QMUL's Malta deadline of 1 Mar 2027.

## Systemic issues: change the brief before the next ~400 schools

1. **Fee status is a country rule. Research it once, per country, from the government or UKCISA-level source, not per school.**
   - This time, 17 schools each paraphrased the rule, and all 17 missed the same exceptions: Irish citizens, and UK nationals living in the EEA, under the temporary offer that ends with 2027 starts.
   - The same will happen with Ireland (the free-fees residence rules), the Netherlands (EU versus non-EU status), Denmark and Sweden.
   - Add to the brief: "Fee status belongs in `data/countries/<code>.json`, with its source and named exceptions. A school note may give the fee figure, but it must not restate who pays it."
   - This keeps to the "no country branches" rule, because it is data, not code.
2. **Never turn a per-programme list into a general sentence.** The LSE and Manchester errors come from summarising a table ("these require X, these prefer X, these accept either") into one line.
   - Add to the brief: "If the rule differs by programme, say so and name the strictest case ('HL Maths AA required for maths-heavy degrees, e.g. Data Science'). Never write 'prefer' when some programmes require it."
3. **A hand-off check means opening the page and confirming what it lists, not getting an HTTP 200.**
   - Add to the brief: "Record the result count and confirm it contains only bachelor's programmes. Query-string filters often do not apply (LSE)."
4. **A 'contradicts data/countries' claim must quote the page.** The Edinburgh line in progress.md reported a contradiction that is the wrong way round.
   - Add to the brief: "Each contradiction line gives the quoted words and the URL."
5. **Don't use a programme that is closed to the intake as an example** (UAL Architecture).
   - Add to the brief: "Examples in `ib` or `notes` must be programmes open to the intake."
6. **Past dates.** Decide whether records keep dates that have passed by the retrieval day, and say so in the brief. The UK set keeps them, and correctly so, but the page needs to treat them as closed.

## To reach 8

- Fix errors 1–6.
- For error 3, either reword all 17 notes with the exceptions ("Most EU citizens pay the international fee; Irish citizens and UK nationals living in the EU may qualify for Home fees for 2027 entry. Check your status.") or, better, move fee status to `gb.json` (systemic issue 1) and cut the sentence from the school notes.
- Re-check the LSE hand-off in a browser.
