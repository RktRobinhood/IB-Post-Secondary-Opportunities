# Content critic, round 0 (admissions-counsellor view)

| Template | Score | One line |
|---|---|---|
| Country | 6/10 | Denmark is close to shippable. Spain buries its key numbers. Ghana shows empty headings. |
| University | 5/10 | Places come first, which is right, but the "what it asks" answer is empty, card facts are uneven, and sparse pages say nothing useful. |
| Programme | 6/10 | Has the right facts in the right order, but it repeats itself, has a leaking note and a garbled campus table. |

## Country (country.mjs, denmark.mjs, destinations.mjs)

| Issue | Where | Concrete fix |
|---|---|---|
| Empty section headings: "Money" and "Living there" have no body | gh | Don't render a block that has no `short`. Instead, say the gap in one line, e.g. "Fees not researched yet: check with each university". |
| The same fact appears 3 or more times. "15 March, 12:00 noon" is in the hero, What to watch, and How/when you apply. "No tuition for EU/EEA" is in Why it might suit you and in Money. | denmark | Give each fact one home. The hero keeps the date. "What to watch" uses its next item. Money says the non-EU fee range. |
| Contradictory dates. Hero says "28 July You get an answer". Apply says "Results come out on 6 July". | denmark | Name the event: "IB results 6 July · offers 28 July". |
| Hero facts are for counsellors, not students. Spain/Ghana lead with "6,048 / 181 IB transcripts". Spain has no deadline and no minimum score. | es, gh | Use the same hero slots on every country: next deadline · minimum IB · EU fee · institutions. Move transcripts to the counsellor detail. Where a slot is missing, show "Not published" rather than swapping in another stat. |
| The institution list appears twice (cards, then globe chips). On sparse pages the globe is a large blank area (gh phone-2, desktop-3). | es, gh | Hide the chip row when cards are present. Skip the globe when there are 3 or fewer institutions, or shrink it. |
| Gap labels are inconsistent and in the wrong order. "OUTLINE ONLY" is at the top on gh but "RESEARCHED IN DEPTH… 8 of 13 dates carry no published day" is at the bottom on es. gh also shows "All 1 thing to watch", which expands to the same line, and a "Checked 9 Oct" chip on an outline page. | es, gh | Put one coverage line under the hero on every page. Drop the "All N" expander when N=1. On outlines, say "Outline · 1 source" instead of "Checked". Also: es Language names Navarra, which is not among its 11 institutions. |

## University (university.mjs, institutions.mjs, schools.mjs)

| Issue | Where | Concrete fix |
|---|---|---|
| "What it asks of IB students: It publishes an IB recognition statement." This answers nothing. | dk-au, gh-ashesi | Show the floor and the range: "24 points + subjects per programme · last year 30–43". Use the recognition statement only as the source link. |
| Card badges are uneven. Some say "Last year: 43 IB points", some "Full Diploma", Cognitive Science has none. The "Needs …" line is on one card only. Fees appear on some IE paths and not on single degrees. Path rows are cut off with an ellipsis mid-fee ("€28…"). | dk-au, es-ie | Give every card the same badge slot, with "No cut-off published" when empty. Put the fee before the city in path rows so it survives the truncation. |
| Label/content mismatch. The "2 CAMPUSES" header sits above a list of degree paths. The path name and campus repeat ("Segovia or Madrid · Segovia or Madrid"). IE's flagship BBA is filed under "Other fields · 9". The IE type says "BUSINESS SCHOOL". | es-ie | Choose the header from the row type (paths vs campuses). Don't print the campus when it equals the path name. Give the BBA its own group, Business. Correct the type to University. |
| Tautology plus a dead end. "IN ENGLISH: Taught in English" and "In English: Taught in English." The deadline box says "check its admissions page" but there's no admissions link. "Every date in Ghana" leads to nothing. "Other schools in Ghana" is a button with no list. | gh-ashesi | When the count is unknown, drop the glance tile. Say "Programmes not listed yet". Always link the admissions URL. Hide "Every date in X" when X has 0 dates. Inline the 1 other school. |
| Deadline panel noise. Two rows share 15 March 12:00 (close / sign). Every row carries the labels "Note · Source · Hard deadline". | dk-au | Merge same-day rows ("Apply and sign by…"). Show Note/Source only on expand. |
| Sidebar repeats the cards. "KNOWN FOR" lists the programmes already shown. CAMPUSES lists Foulum/Roskilde, where no English degree runs. | dk-au, es-ie | Drop Known-for when there are 3 or more cards. List only campuses that host a listed programme. Relabel the results code as "Send IB results to: 000150". |

## Programme (programme.mjs, pages/programme.mjs, school-programme.mjs)

| Issue | Where | Concrete fix |
|---|---|---|
| A note from the wrong level leaks in and contradicts the page. On a degree "taught 100% in English", WORTH KNOWING says BBA/Biomedical Engineering are "mostly Catalan and Spanish". | es-ub | Show only notes scoped to this programme on programme pages. Pull institution notes only when they're tagged `appliesTo: all`. |
| The lede is duplicated. The hero lede is truncated ("…as they…") and then repeated in full under "What it is". | dk-au CS | The hero takes the first sentence only. "What it is" starts with sentence two. |
| Garbled campus sentence: "offered at the Segovia or Madrid campus and the Madrid, Singapore, Dubai; year 4 Madrid or New York campus". | es-ie BBA | Write it from path names: "Two ways to take it: Segovia/Madrid (€29,880) or the Global BBA across four cities (€45,120)". The table is already enough. |
| A cut-off with no meaning for IB. "5.000 of 14" means nothing to an IB student. The good news is hidden lower down ("lowest possible grade"). | es-ub | When cut-off = scale minimum, render "Last year: everyone eligible got in (160 places)". |
| Provenance conflicts. "Checked 22 September" sits beside "not yet checked by a person · Last read 23 September". Boilerplate "ALWAYS VERIFY" is on every page. | dk-au CS, all | Show one status line: "Read from source 23 Sep · not yet human-checked". Drop the warn box once the status line exists. |
| Danish-scale lines take space up front. "Danish requirement: English B / an average of 6.0 and 6.0" sits under each IB requirement. Sidebar INSTITUTION/COUNTRY repeats the breadcrumb, and the breadcrumb renders after the hero facts and notes on phone. | dk-au CS, es-ub | Move the Danish lines into "How these requirements read in IB terms". Drop the institution/country rows from the sidebar. Put the breadcrumb above the hero. |

**How missing data shows (all templates):** honest where a sentence exists, e.g. "Not published yet · 2026: 2–26 June" (es-ub), and "No bachelor's in English at University of Copenhagen". Broken-looking where a block simply drops its body: empty headings, a "2" globe dot on blank space, tautological tiles, and links to empty lists. Rule for the templates: every slot either has a value or says one plain line about why it's empty. It never renders a bare heading.
