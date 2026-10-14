# Content critic, round 4 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Country | 7/10 | The hero no longer shows transcripts, Ghana's contents list matches what is on the page, and the Danish meta line is gone. The section ledes and the Spain hero still let a student down. |
| University | 6/10 | Deadlines, the derived "What it asks" line (30–43), the dropped Known-for block and the dropped Ghana button are all fixed. The IE path headers and the grouping are still wrong. |
| Programme | 7/10 | The provenance box is gone and the phone path cards show the fee. The Danish lines, the boilerplate ranking text and requirements-before-the-degree order are unchanged. |

## Country

| Issue | Where | Concrete fix |
|---|---|---|
| Section ledes still open with a field label: "Where to apply:", "Tuition, EU/EEA:", "Residency:", "English-taught bachelors:". | es | Strip a leading "Label:" from the lede. Prefer the first sentence with a number or a name. |
| The hero says "Next deadline 15 Jan", but the Deadlines lede on the same page says 2 Nov 2026 (IE's is 6 Nov). The hero also leaves out the minimum (24) and the fee. | es | Work out "next" from the same list the Deadlines section uses. Fill slots in this order: next deadline, minimum IB, EU fee, count. |
| A sparse card is just initials and a city, with nothing to read, even though the university record holds "All teaching in English" and transcript counts. | gh | When a card has no blurb or programme count, use the university's own hero facts as its single line. |

## University

| Issue | Where | Concrete fix |
|---|---|---|
| Path headers are still taken from the campus count. "2 CAMPUSES" sits over Single/Dual (Political Science, Design, Applied Maths) and over "Segovia or Madrid / Global BBA". The meta line switches between "Segovia or Madrid" and "2 campuses" for the same school. | es-ie | Take the header from the row axis ("2 PATHS"). Show one campus wording per school. |
| "Other fields · 9" is the biggest group and holds cards already tagged Business, Computing, Law and Economics. | es-ie | Allow groups of 2 or more. If "Other" would still be the largest group, don't group at all. |
| The hero spends a slot on "IB transcripts 1,092 in 5 yrs" while leaving out the next deadline and the last-year range. | dk-au, es-ie | Slot order: next deadline, last-year range or minimum, apply via, city. Move transcripts out of the hero. |
| On a page with no programmes, "Also in Ghana" (another school) comes before the school's own "What it asks". | Ashesi | Show the school's own blocks first and siblings last. |

## Programme

| Issue | Where | Concrete fix |
|---|---|---|
| Possibilities come last. "What it is" sits below the requirements and the ranking rules, while the hero line is a generated "A three-year degree in Aarhus" that repeats the kicker and the facts grid. | all | Use the first sentence of "What it is" as the hero line, and put "What it is" first in the body. |
| Every requirement still carries a "Danish requirement:" line, even inside the quota box. | dk-au CS | Move these lines into "How these requirements read in IB terms". |
| "How places are decided" falls back to "does not guarantee a place" when the quota rule sits just above. | dk-au CS | Lead with the ranking rule ("Quota 1 ranks on points; quota 2 on subjects + experience"). Use the fallback only when there is no rule. |
| "5.000 of 14" in the hero. The sparse page ends at "More at UB" and nothing else. Path "Segovia or Madrid" repeats as "Campus: Segovia or Madrid". | es-ub, IE BBA | When the cut-off is the scale minimum, say "Last year: every eligible applicant got in". Add "Similar degrees in English" from the same field. Hide a campus that equals its path label. |

## Data backlog

- Ashesi and ACM have no blurb, photo, official or admissions URL, or programme list. Ashesi's 181 transcripts equal the whole-country figure.
- es-ie: the type reads "BUSINESS SCHOOL". The BBA path label should be "Spain-based BBA". Next links to the Global BBA page, which this page already merges as a path.
- dk-au: Campuses still lists Foulum and Roskilde. Check where the 30 in "30–43" comes from (none of the cards shown is below 39).
- Denmark: "Results come out on 6 July" still contradicts "28 July · You get an answer". "What it is actually like" has no lede.
- Denmark: the Royal Danish Academy card's city reads "Nexø, Bornholm", but its blurb says Copenhagen.
- Spain: the Language section names Navarra, which has no card. The Money section has no figure in its lede.
- Ghana: the only source is the IBO database, and there is no How-it-works record.
- es-ub: the 2027 dates are not published yet, which is expected. The record needs a plain-English cut-off line.
