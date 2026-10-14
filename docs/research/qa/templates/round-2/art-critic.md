# Art-director critique: templates, round 2

Scored fresh from the round-2 slices at both widths. Round 1 gave country 6, university 7, programme 7.

| Template | Score | One line |
|---|---|---|
| Country | **7** | Band titles now outrank the topics, and the Ghana globe is gone. Spain's globe zone renders as pins on blank cream, and some copy still talks about the site. |
| University | **6** | AU and IE still sell the place. Ashesi regressed: the main column is now a breadcrumb floating in ~200px of nothing. Card dead gaps from round 1 are unfixed. |
| Programme | **7** | **The owner's complaint holds without labels.** The rust rule, the deeper ground and the large "Other degrees at X" heading read as a separate place on both widths. The sparse page still has no ending, and the band's bottom edge is unfinished. |

## Programme

| Issue | Where | Fix |
|---|---|---|
| The sparse page just stops: "What it is" → sources → ~180px of cream → footer. Every other programme ends in the band | ub-english desktop-2, phone-4 | Always render the band. With 0 siblings, show one wide card linking to the university page ("All degrees at UB") on the same deeper ground |
| The pager cards sit flush on the band's bottom edge, followed by a ~95px strip of bare cream before the footer | ie-bba desktop-3/4, phone-6; dk-au-cs desktop-3, phone-6 | Give the band `padding-bottom: var(--s8)` and remove the margin below `main`, so the band runs straight into the footer |
| Meta copy: "Read from the source, not yet checked by a person…" box; "YOU ARE HERE" in the campus table | dk-au-cs desktop-2, phone-3; ie-bba desktop-2, phone-2 | Fold provenance into the existing "Checked {date}" pill: an amber dot for unverified, with detail on hover/expand. The highlighted row already marks the current campus, so drop the label |
| Two sources treatments: a boxed accordion "Where this comes from (2 sources)" on DK, and a quiet "Sources for this programme" line on ES | dk-au-cs desktop-3 vs ie-bba desktop-3 | One `sources-foot` partial in `programme.mjs`, with one label and one style |
| Path rows in sibling cards are truncated mid-word ("BB…", "Bachelo…") | ie-bba desktop-3, phone-5/6 | Show the path label only, with no descriptor after it |

## University

| Issue | Where | Fix |
|---|---|---|
| Ashesi has an empty main column: the breadcrumb sits alone in a cream void. There is no official-site link, and the only primary button leaves for "Other schools in Ghana" | gh-ashesi desktop-1, phone-1/2 | With 0 programmes, render one solid tinted card in the main column: one line plus a dark button "Ashesi's degrees ↗". Demote "Other schools" to a text link |
| Cards stretch to row height, leaving 40–100px gaps between title and meta | dk-au desktop-2; es-ie desktop-2/4 (Behavior, Economics) | `.card-grid{align-items:start}`; title → meta → paths → topic with fixed gaps |
| On desktop the 2-up grid plus a short rail leaves the right third empty for ~2,500px | es-ie desktop-3–5 | Below the rail's height, let the grid go 3-up full width, or make the rail sticky |
| An odd-count grid leaves an orphan card | dk-au desktop-3; es-ie desktop-3/5 | Make the last odd card span both columns in a horizontal layout |
| Meta copy: "The 14 official pages this was written from." | dk-au desktop-3, phone-5; es-ie desktop-6 | Heading "Sources" plus the expander only. Cut the sentence |

## Country

| Issue | Where | Fix |
|---|---|---|
| The globe zone is ~600px of blank cream with floating pins and zoom buttons (no Earth rendered) | es desktop-5, phone-6 | Ship a static map image as the fallback before WebGL renders. Verify the texture loads |
| Copy about the site: "Basics only for now", "it is the set on this site", "the Denmark pages are written for…" | gh desktop-2, phone-2; denmark desktop-7 | Rewrite as facts about the country, or cut |
| Ashesi's monogram "AU" still clashes with Aarhus's "AU" | gh desktop-2, phone-2 | Derive monograms from the distinctive word (e.g. "ASH") |
| The eyebrow has a stray gap: "NORDICS  · MAY…", "WEST AFRICA  · MAY…" | denmark desktop-1; gh desktop-1 | Build it from one array: `.filter(Boolean).join(' · ')` |
| Ghana gives a 3rem "How it works" heading to a single line | gh desktop-2 | With 1 or fewer topics, drop the h2 and set the line as the lede under the cards |
