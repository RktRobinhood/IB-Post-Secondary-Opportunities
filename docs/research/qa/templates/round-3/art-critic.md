# Art-director critique: templates, round 3

Scored fresh from the round-3 slices at both widths. Round 2 gave country 7, university 6, programme 7.

| Template | Score | One line |
|---|---|---|
| Country | **7** | Ghana is clean now: no meta copy, "AS" instead of "AU", and no heading over a single line. Spain's public/private split gives the grid real structure. The cards are still paragraphs, and the "How it works" band reads as one long, even ladder. |
| University | **6** | IE's field groups are a real gain, and Ashesi now has a hero. Three round-2 faults are unfixed: card gaps, the empty right third, and orphan cards. Ashesi's first heading is still about a different school. |
| Programme | **7** | **The owner's complaint holds at both widths.** The rust rule, the deeper ground and "Other degrees at X" now run straight into the footer, and the sparse page finally has an ending. The provenance box, truncated paths and the split sources styles are all still there. |

## Programme

| Issue | Where | Fix |
|---|---|---|
| Meta box still present: "Read from the source, not yet checked by a person…" | dk-au-cs desktop-2, phone-3 | Fold it into the "Checked" pill as an amber dot, with the detail on expand. Delete the box |
| Path rows are still cut mid-word ("BBA + Bache…", "Bachelor in Intern…") | ie-bba desktop-3, phone-5/6 | Show the path label only ("Dual with Laws"), with no descriptor |
| The sparse ending is two bare chips, "UB" and "Spain", on 200px of band | ub-english desktop-2, phone-4 | Use one wide card with the university's photo or designed backdrop, titled "All degrees at Universitat de Barcelona" |
| Two sources treatments: a right-aligned "Sources (2) +" row on DK, and a "▸ Sources (2)" disclosure on ES | dk-au-cs desktop-2 vs ie-bba desktop-3 | One partial with one style: the accordion row used by "Degree and length" |

## University

| Issue | Where | Fix |
|---|---|---|
| Ashesi opens on "Also in Ghana": the main column is about another school, the hero has no line, there is no official-site button, and ACM appears twice (card and Next) | gh-ashesi desktop-1, phone-1 | Add a hero lede, put "Ashesi's degrees ↗" in a tinted main-column card, and move ACM to the pager only |
| Desktop cards still stretch, leaving 35–50px gaps between the title and the meta | es-ie desktop-1/2 (Political Science, Behavior, Economics); dk-au desktop-1 | `.card-grid{align-items:start}`, or pin the meta directly under the title and push only the topic line to the bottom |
| Below the rail, the right third is empty for ~2,500px. Orphans: Fashion Design, Applied Mathematics, Cognitive Science | es-ie desktop-2/3; dk-au desktop-2 | Once past the rail, let the grid run 3-up across the full width. Give a last odd card a horizontal span |
| Phone group headings ("Social sciences · 4") are barely larger than the card titles, so 16 cards run together as one strip | es-ie phone-1–4 | Make group headings h2 scale, with a hairline rule and extra space above |

## Country

| Issue | Where | Fix |
|---|---|---|
| Institution cards carry 3–6 line paragraphs. On phone, 14 of them read as a text wall | denmark phone-2–5; es phone-2–4 | Clamp to one line (`-webkit-line-clamp:1` or a short tagline field). The full text lives on the university page |
| Meta copy remains: "observations, not rules", "the parts of this page written for…", "not confirmed on a UNED page", "each mapped subject by subject" | denmark desktop-1/6; es desktop-7 | Rewrite as facts about the country, or cut. Provenance goes in the Sources expander |
| The "How it works" band is a ~2,000px run of h3, line and expander rows with identical rhythm. Group h2s ("Getting in") barely outrank the h3s | denmark desktop-5–7; es desktop-6–8 | Give each group h2 more space above, or a short contrasting ground, and set the h3 smaller and in the sans |
| Ghana's band holds only "Sources" and one link. The table of contents lists "How it works", which has no visible section | gh desktop-2, phone-3 | When there are no topics, drop the band and the table of contents, and put sources in a single line above the pager |
