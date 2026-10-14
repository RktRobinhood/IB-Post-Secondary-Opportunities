# Content critic, round 1 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Country | 6/10 | Denmark works and Ghana now says what's missing. Spain's hero still shows counsellor stats, and the Ghana globe is still a blank screen. |
| University | 6/10 | Sparse pages are now honest. Rich pages still mislabel paths as campuses, cut off fees and give a "what it asks" answer with nothing in it. |
| Programme | 7/10 | The ending, the hero and the official link are fixed. Still open: the es-ub note leak (the code that was meant to stop it has a bug), a garbled campus sentence, and two provenance lines that disagree. |

## Country

| Issue | Where | Concrete fix |
|---|---|---|
| The hero still leads with "6,048 / 181 IB transcripts". A student gets no deadline, no minimum and no fee. Denmark gets 15 March / 24 / 28 July. | es, gh | Use one slot set on every country: next deadline · minimum IB · EU fee · institutions. An empty slot says "Not published". Move transcripts into the Sources disclosure. |
| The globe on a 2-school page is a full screen of blank space with a "2" dot, and below it a chip row repeats the 2 cards. | gh phone-2 | Don't draw the globe or the chip row when there are 6 or fewer institutions. On rich pages, drop the chips whenever the cards are shown. |
| The coverage line is placed differently on each page. On gh it sits under the hero. On es it's at the bottom ("RESEARCHED IN DEPTH… 8 of 13 dates carry no published day"). | es | Always put it under the hero. |
| The only "watch" item on gh is a gap note ("Outline only. Check dates…"). It sits under "Is it for you?". "All 1 source" is still an expander. | gh | Put the gap note into the "Ask each university about" row. Apply the N=1 rule to Sources as well. |
| The same fact appears 3 times: 12:00 noon 15 March is in the hero, What to watch and How you apply. "28 July answer" and "Results come out on 6 July" sit side by side without saying what each date is. | denmark | Give each fact one home, and name the events: "IB results 6 July · offers 28 July". Data: es Language names Navarra, which is not among its 11 institutions. |

## University

| Issue | Where | Concrete fix |
|---|---|---|
| The only answer under "What it asks of IB students" is a chip, "Recognises the IB Diploma", even though the cards hold 24 + subjects and 30–43. | dk-au | Work it out from the programmes: "24 points + subjects per degree · last year 30–43". Keep the chip for when nothing else is known. |
| Labels don't match their contents. "2 CAMPUSES" sits above Dual/Single paths. "Segovia or Madrid · Segovia or Madrid" repeats itself. The BBA is filed under "Other fields · 9". The Global BBA fee is printed twice. The type reads "BUSINESS SCHOOL". | es-ie | Choose the header from the row axis. Don't print a campus that equals the path label. Give Business its own group. Print each fee once. |
| On phone, path rows are cut off before the fee ("BBA + Bache…"). | es-ie phone-2 | Put "€34,020 · 5 yrs" first in each row and the long official name last, or leave it out. |
| The deadline box says "check its admissions page", but there's no admissions link anywhere. "Other schools in Ghana" is a button for 1 school. | gh-ashesi | Always render the admissions/official URL. If the school has no URL, say "No admissions page recorded". Inline the sibling school when there are 3 or fewer. |
| Panels repeat each other. Two 15 March rows say the same thing, and every row shows "Hard deadline · Note · Source". KNOWN FOR repeats the cards. CAMPUSES lists Foulum/Roskilde. "000150" has no label. | dk-au | Merge rows that fall on the same day. Hide Known-for when there are 3 or more cards. List only campuses that host a listed degree. Label the code "Send IB results to: 000150". |

## Programme

| Issue | Where | Concrete fix |
|---|---|---|
| A degree "taught 100% in English" still shows WORTH KNOWING: "…most of the degree is in Catalan and Spanish". In `notesFor` (src/lib/schools.mjs:231), `mine` wins over `theirs`, and "English" in the note matches "English Studies". | es-ub | Return `mine && !theirs`. A note that matches `UNLISTED` never reaches a programme. |
| The paths lede is garbled: "offered at the Segovia or Madrid campus and the Madrid, Singapore, Dubai; year 4 Madrid or New York campus". The heading "Business Administration on 2 campuses" calls a different programme a campus. | es-ie BBA | When a path label isn't a city, use `N ways to study X` and drop the `campusSentence`. The table already tells the student this. |
| Two provenance lines disagree: "Checked 22 September" sits next to "not yet checked by a person · Last read 23 September". | dk-au CS | Show one status line, built from the newer of the two. |
| "5.000 of 14" means nothing to an IB student, and it sits in the hero. | es-ub | When the cut-off is the scale minimum, show "Last year: everyone eligible got in · 160 places". |
| Every IB requirement carries a "Danish requirement:" line. "How places are decided" says only "does not guarantee a place", although quota 1/2 is right above it. | dk-au CS | Move the Danish lines into "How these requirements read in IB terms". Lead the section with the quota sentence. |

**Absent data:** better. Gaps now show as "Its degrees are not listed here yet", "Not published yet · 2026: 2–26 June" and the "Ask each university about" chips. Those are honest and useful. Three places still look broken: the blank globe, the admissions page the deadline box points to but never links, and an "All 1" expander.
