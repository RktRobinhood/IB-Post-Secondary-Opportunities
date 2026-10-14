# Content critic, round 3 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Country | 7/10 | Better than round 2. Spain's route groups and card fees work, and Ghana's hero is now about places, not a data source. Hero slots and section ledes still let a student down. |
| University | 5/10 | Only Ashesi's "Also in Ghana" got fixed. Deadline noise, the bare requirement chip, the es-ie path headers and phone truncation are all unchanged. |
| Programme | 7/10 | The heroes are strong and Sources has one label now. The provenance box, the Danish lines and "5.000 of 14" are unchanged. |

## Country

| Issue | Where | Concrete fix |
|---|---|---|
| The hero spends a slot on "IB transcripts sent here" and shows no date, minimum or fee, even though the page holds them (Deusto 2 Nov, 24 points). | es, gh | Fill slots in a fixed order: next deadline, minimum IB, EU fee, then institutions. Drop empty slots. Transcripts never go in the hero. |
| Section ledes copy field labels and carry no figures: "Tuition, EU/EEA: Public universities charge per credit…", "Residency:", "Where to apply:", "The English-taught set is much smaller." | es, denmark | Strip any leading "Label:" from the lede. Prefer the first sentence that has a number or a name. |
| On this page lists "How it works", but Ghana has no such section. | gh | Build the table of contents from the sections actually rendered. |
| Meta text: "observations from people who have watched students go through this — observations, not rules". | denmark | Make the lede the first observation itself. |

## University

| Issue | Where | Concrete fix |
|---|---|---|
| Every deadline row ends "Hard deadline · Note · Source", and the two 15 March rows are not merged. | dk-au, es-ie | Show a tag only when it has content. Merge rows that share a date into one row with two lines. |
| "What it asks" is still a single chip ("Recognises the IB Diploma"), though the cards hold 28+ and 30–43. | dk-au, Ashesi | Work it out from the programmes: "28+ points + subjects per degree · last year 30–43". Use the chip only when no programme has data. |
| Path headers are taken from the campus count: "2 CAMPUSES" sits over Dual/Single, "Segovia or Madrid · Segovia or Madrid" repeats, and on phone the rows cut off before the fee. | es-ie | Take the header from the row axis. Hide a campus that equals the path label. Put the fee and years first in each row and the official name last. |
| The page repeats itself: "Also in Ghana" is followed by an "Other schools in Ghana" button that leads to the same school, and KNOWN FOR repeats the cards. | Ashesi, dk-au, es-ie | Drop the button when every sibling is already shown inline. Hide Known-for when there are 3 or more cards. |

## Programme

| Issue | Where | Concrete fix |
|---|---|---|
| Meta and contradiction: "Read from the source, not yet checked by a person. Last read 23 Sep" sits beside "Checked 22 September". | dk-au CS | Show one date line. Keep only "Provisional dates repeat last year's". |
| Every requirement carries a "Danish requirement:" line, even inside the quota box. | dk-au CS | Move these lines into "How these requirements read in IB terms". |
| "How places are decided" falls back to boilerplate ("does not guarantee a place") while the quota rule sits in the box above. | dk-au CS | Lead with the ranking rule: "Quota 1 ranks on points; quota 2 on subjects + experience". |
| "5.000 of 14" in the hero means nothing to an IB student. The sparse page ends at "More at UB" with two buttons and nowhere else to go. | es-ub | When the cut-off is the scale minimum, write "Last year: every eligible applicant got in · 160 places". Add "Similar degrees in English" from the same field, in any country. |

## Data backlog

- Ashesi: no official or admissions URL, description or photo. Its 181 transcripts equal the whole-country figure.
- Ghana cards (Ashesi, ACM) have no blurb and no programme count.
- es-ie: the type reads "BUSINESS SCHOOL". Business and BBA are filed under "Other fields". The Global BBA note repeats its fee. Next links to the Global BBA page, which this page already merges.
- es-ie BBA: the path label is "Segovia or Madrid" where it should be "Spain-based BBA".
- dk-au: Campuses lists Foulum and Roskilde. Cognitive Science has no last-year points.
- Denmark: "Results come out on 6 July" contradicts "28 July · You get an answer".
- Spain: "How your IB is read" says the figure is "not confirmed on a UNED page" (meta in the record). Language names Navarra, which has no card. Money has no figure.
- es-ub: the record has the ranking text but no plain-English line for the cut-off.
