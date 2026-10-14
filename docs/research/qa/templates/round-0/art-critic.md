# Art-director critique — templates, round 0

Judged from the round-0 slices, desktop and phone. Note: `src/templates/programme.mjs` has already changed since these captures. "More at" now sits in its own `section--more` band with "End of …" and "Not this programme", but `.section--more` and `.more-end` have **no CSS yet**, so the band would still look the same as the content above it.

## Scores

| Template | Score | One line |
|---|---|---|
| Country | **6** | Denmark and Spain look like places you would want to go. Ghana looks broken. |
| University | **6** | AU and IE are strong, with a clear tinted band between the programmes and the reference material. Ashesi looks like an empty form. |
| Programme | **5** | The page has no visible end. Sibling programmes, sources and (on phone) the deadlines all run on as if they were part of it. |

## Programme

| Issue | Where | Fix |
|---|---|---|
| "More at AU/IE" uses the same h2, background and column as "What it is", so it reads as more of this programme | dk-au-cs desktop-3, phone-3/4; ie-bba desktop-3 | Style the new `.section--more`: full-bleed `--paper-2` tint, a top rule, `--s8` padding above. Set `.more-end` as a small-caps divider ("End of Computer Science") and make the cards smaller (a 4-up grid of compact tiles), so they read as a way out of the page and not as content. |
| On phone, Deadlines, the official-page button and the facts come *after* the siblings and sources, so the deadlines look like they belong to the last sibling card | dk-au-cs phone-5/6; ie-bba phone-6/7; site.css:3202 | Siblings are now outside `layout-aside`, so that is solved. Also at ≤768px, put `.dates-panel` and `.rail-action` straight after "What you need" (`order` or DOM), before "How places are decided". |
| "Where this comes from" / "Written from 2 official pages" sat under the sibling cards and looked like it belonged to them | dk-au-cs desktop-3/4; ie-bba phone-6 | It is already inside `.prose`. Keep it last in prose and add a hairline plus "Sources for this programme" so it stays tied to this programme. |
| The hero blurb is 4 lines, cut off mid-word ("as they..."), then repeated in full in "What it is" | dk-au-cs desktop-1, phone-1 | Use a one-line hero tagline (≤90 chars, no ellipsis). Keep the long text only in "What it is". |
| The title is repeated: hero "Business Administration", then h2 "Business Administration on 2 campuses" | ie-bba desktop-1/2, phone-2 | Change the paths h2 to "Two campuses, same entry" or similar. Never repeat the h1. |
| Sibling cards have about 140px of empty cream under the title (Cognitive/Data Science), and path rows are truncated with ellipses in 11px type | dk-au-cs desktop-3; ie-bba desktop-3 | Size cards to their content (`align-items:start`). Show at most 2 path rows at 13px+ with "+2 more", never mid-word "…". |

## University

| Issue | Where | Fix |
|---|---|---|
| A sparse page promises "What you could study here" and then delivers "In English: Taught in English. Its programmes are not listed here yet." The tile "IN ENGLISH / Taught in English" says the same thing twice | gh-ashesi desktop-1, phone-1 | If there are 0 programmes, rename the section ("Programmes: on Ashesi's own site") with one call-to-action button. Hide the "In English" tile when its value is not a count. |
| With no photo, the hero is a ruled-notebook pattern: the "homework" look, and the first thing seen | gh-ashesi desktop-1, phone-1 | Use the designed-backdrop fallback (colour field plus large monogram, as for cards) or a country photo. Never use the lined-paper pattern in a hero. |
| Prev/Next shows bare acronyms ("AAU", "BAAA") | dk-au desktop-2, phone-2 | Show the full name (as IE→"Universidad Carlos III" already does). |
| Programme cards are uneven: one dense card (EBA, with 3 tiny lines) next to near-empty ones, and the title sits on a photo fade that muddies the type | dk-au desktop-1/2, phone-1 | Use a fixed image height and put the title *below* the image on a solid surface. Cap "Needs"/path lines at 2, at ≥13px. |
| The deadlines panel repeats "Hard deadline · ▸ Note · Source" on every row, which makes it look like a form | dk-au desktop-2, phone-2 | Use one "Hard" dot in the margin. Move Note/Source into the row's disclosure. |
| On phone the footer is about 1.5 screens tall, longer than a sparse page's content | gh-ashesi phone-1; all phone | Collapse the footer columns into `<details>` at ≤600px. |

## Country

| Issue | Where | Fix |
|---|---|---|
| The sparse country shows empty headings ("Money", "Living there" with no text), "All 1 thing to watch", and a large blank globe area with one "2" dot | gh desktop-2, phone-1 | Don't render a topic with no body. Use singular copy ("The one thing to watch"). With ≤3 institutions, drop the globe and give the cards that room. |
| "How it works" is 12 identical heading + line + "+" rows: an accordion wall with no rhythm | denmark desktop-3/4 | Group into 3 bands (Getting in / Applying / Living), each with a small eyebrow and extra space between groups. Promote the 2–3 key facts (deadline, 24 points) into a pull strip. |
| Lined-paper monogram cards (AB, ZE, DA, CO, CEU) sit next to real photos and look like missing images. Ghana's "AU" clashes with Aarhus's "AU" | denmark desktop-2, phone-1; es desktop-2; gh desktop-2 | Use the designed-backdrop fallback (unique tint and pattern per school) and the full short name, not initials. Sort photo cards first. |
| The Ghana hero is lined paper, with no image | gh desktop-1, phone-1 | Use a country photo or the designed backdrop, as on the university page. |
| The eyebrow has a stray separator ("NORDICS · · MAY…", "WEST AFRICA  · MAY") | denmark desktop-1; gh desktop-1 | Filter empty parts before joining with " · ". |
| The rail ("Go deeper / On this page") ends halfway down, leaving the right third empty for the rest of the page | denmark desktop-3/4 | Make the rail `position:sticky; top:var(--s6)`. |
