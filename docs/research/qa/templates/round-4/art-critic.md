# Art-director critique: templates, round 4

Scored fresh from the round-4 slices at both widths. Round 3 gave country 7, university 6, programme 7.

| Template | Score | One line |
|---|---|---|
| Country | **8** | Ships. Cards are clamped to two lines, and "How it works" now has real group h2s and rules. Spain's public/private split reads well. Only small duplications are left. |
| University | **7** | AU and IE look good, and the phone group headings are fixed. Ashesi is unchanged from round 3: it is still the weakest page in the set. |
| Programme | **8** | Ships. The meta box is gone, the paths are no longer cut off, and the sparse ending is now cards. **Siblings stay clearly separate at both widths:** a rust rule, a darker ground, and "Other degrees at X". |

## Programme

| Issue | Where | Fix |
|---|---|---|
| There are still two Sources styles: plain grey "Sources (2)" on DK, and "▸ Sources (2)" on ES | dk-au-cs desktop-3, phone-3 vs ub desktop-2 | Use one partial with the ▸ disclosure everywhere |
| On phone, the official link appears twice: "Check it on bachelor.au.dk ↗" inline and "The official page ↗" lower down | dk-au-cs phone-2; ie-bba phone-3; ub phone-2 | Drop the inline link and keep the button |
| The rail link breaks as "(4 / more)" and "(1 / more)" | dk-au-cs desktop-2; ie-bba desktop-2 | Shorten it to "All dates (+4)", or set `white-space:nowrap` on the count |
| UB's title is the raw official name ("Bachelor's degree in English Studies"), while IE's is shortened. "Grado (Spanish bachelor's degree)" takes 3 lines on phone | ub desktop-1, phone-1 | Strip the degree-type prefix from the h1 (the official name stays in the rail). The facts cell should read "Grado" |

## University

| Issue | Where | Fix |
|---|---|---|
| Ashesi is the same as round 3. The main column opens on "Also in Ghana" (another school), the hero has no line and there is no official-page button. ACM appears twice, as a card and in Next | gh-ashesi desktop-1, phone-1 | When there are no programmes, give the hero a one-line lede, use a main card "Ashesi's degrees ↗" (official site), and keep ACM in the pager only |
| On phone, the deadlines panel sits under all 16 cards, about 5,000px down | es-ie phone-6; dk-au phone-4 | Add a one-line "Next: 6 Nov · Round 1 · All dates ↓" strip under the facts on phone |
| "Other fields · 9" is the biggest group, so it is a catch-all that undoes the grouping. Orphan cards: Fashion Design, Applied Mathematics, Cognitive Science | es-ie desktop-3/5; dk-au desktop-2 | Group by the topic tags the cards already show (Business & economics, Computing & maths, Law & humanities). A lone last card spans 2 columns as a horizontal card |
| Card anatomy is uneven. Only EBA has a "Needs" line, and it ends in a double ellipsis ("Economics ......"). Some path rows are links and others plain text in the same style | dk-au desktop-1; es-ie desktop-2 (Design, Fashion) | Drop "Needs" from cards or show it on all of them. Fix the ellipsis join. Style non-link paths visibly differently, or link them all |

## Country

| Issue | Where | Fix |
|---|---|---|
| Spain's group subtitle repeats the heading as an underlined link-coloured line, and both groups carry an identical "How applying differs" expander | es desktop-1/3, phone-1/4 | Make the subtitle plain muted text with the count only ("6 institutions"). One expander per group, labelled for that group ("Applying to public universities") |
| Some headings sit over a lone expander: "What it is actually like / Read them", "Sources / All 2 sources" | denmark desktop-5/7, phone-6/8 | Fold each into a single expander row ("What students say +", "Sources (2) +") |
| Spain contradicts itself: the hero says "15 Jan · Next deadline", but the Deadlines row leads with 2 November 2026 | es desktop-1 vs desktop-6 | Feed the hero stat from the same sorted list |
| Ghana's band is "Sources" with one link, next to a two-item "On this page" table of contents. The cards have a rule with nothing above it | gh desktop-2, phone-2/3 | Below 3 sections, drop the table of contents and turn sources into one line. Remove the card rule when there is no description |
