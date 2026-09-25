# Curated school pages (#43): art director, round 1

Screenshots: `D:\ibp-tmp\shots-r1\` (fi-uh, gb-oxford, gr-ntua and the Finland page; desktop 1280 and phone 390, light and dark). I looked at all 16 images, with the phone captures cut into full-resolution slices.

## Score: 6/10. Not accepted.

The page is built right: a real photograph up top, a fact strip, then programmes, then what it asks, then deadlines, then one link on. Gaps are marked and sources are cited. Helsinki and Oxford work as pages. Two parts still fall short of "a place worth going":

- **The middle reads like homework.** Below the hero there are no more pictures. The programme cards are thin text boxes, and five accordions each end in a coloured "Source +" or "Link +" row.
- **The page breaks at its weakest.** NTUA shows raw data strings, an empty heading, and no way on. On a phone the deadlines sit below everything else.

## Changes, ranked

1. **Make "What you could study here" the visual heart.**
   - *Listed schools:* the credential line ("BA or BSc · 3 yrs") is grey fine print under a rule. Move it directly under the card title at body size.
   - Show the card's `text` line (`p.ib`) and the "Apply by" chip when the data has them.
   - With one or two programmes, use a 2-column grid across the full width, not two cards in a 3-column grid that leave a third of the row empty (desktop).
   - The cards have no photographs, and they sit next to a country page where every card has one. Give each card a photo, or at least a field-coloured header band so they do not look like form fields.
   - Drop the meta lede "Each card opens its own page."
   - *Catalogue schools (Oxford):* remove the orange "Undergraduate course listing ↗" button from this section. It repeats the dark button in the Next-step band, in a different colour. Enlarge the "Known for …" chips so they read as the point of the section rather than as tags.

2. **Fix the not-researched and no-English state (NTUA).** The page is currently a dead end.
   - Do not print the raw `englishBachelors` string ("In English: None. No English-taught bachelor's on the Study in Greece platform, checked 2026-09-24"). That includes the ISO date.
   - When the data says none, change the section title from "What you could study here" to "Taught in Greek" (from data), with one line.
   - The fact strip truncates to "None. No English-taught…". Show a short value such as "None", and do not leave an empty beige fourth cell on the phone.
   - "Worth knowing" repeats the hero lede word for word. Hide it when it equals the lede.
   - Hide the "Links" facts block when it has no items. It currently renders an empty heading.
   - Always render a close. Fall back to the university's website or to the country page, so the student is never stranded.
   - The pager shows acronyms ("UoC", "AUEB", and "UOulu" on the Finland pills). Use full names.

3. **Phone order: deadlines come too late.** At 390 px the Deadlines & sessions panel sits below five accordions and Sources, about 2,000 px down.
   - On narrow screens, put the panel straight after the programme section, or after "What it asks of IB students".
   - Move the "Checked 25 September 2026" stamp next to Sources.
   - Oxford's panel opens with two struck-through past dates. Fold past dates into one quiet line ("2 earlier dates") so the next live date comes first.

4. **Cut the accordion stack from five blocks to two.**
   - The orange "#" after every heading looks like a debug artefact. Remove it, or show it only on hover and never on touch.
   - "Where you apply: Through Studyinfo.fi. Link +" hides a single link behind an accordion, and the fact strip already says "Apply via". Make the fact-strip value the link and drop the topic.
   - "What it tells the IB" is an unclear heading. Its one number ("920 IB transcripts sent here in five years") belongs in the fact strip as a stat.
   - Sources can be one line at the foot.
   - That leaves "What it asks of IB students" and "Worth knowing".

5. **Hero eyebrow legibility.**
   - The small gold caps with a rule through them are hard to read on all three photographs. On NTUA desktop, "ATHENS · GREECE" nearly disappears into the trees. On Helsinki phone the eyebrow wraps to two lines and the rule crosses the second.
   - Set the eyebrow in white or cream on the existing scrim, and drop the `::after` rule when it wraps.

6. **Close, pager and the way in.**
   - The ruled-paper lines behind the close band's text are busy on a phone.
   - About 250 px of blank paper separates the close from a lone "Next: Aalto" box. Tighten it, and give the next school its thumbnail.
   - On the Finland page, the cards are the only way into these new pages, yet:
     - their one visible link is the external "IB statement ↗";
     - there is no cue that the card opens a page on this site;
     - on a phone the photograph is squeezed into a strip about 105 px wide;
     - every programme chip ends in "…".
   - Add "See the school →", use a top photo on phone cards, and write chips that fit.
   - The Helsinki hero is the same photograph as its country-page card. The owner's rule is "no image used twice anywhere", so either use a second photograph for the hero or get the owner's explicit exception for the card-to-page case.

## Outside this change, but seen on every dark screenshot

The dark-mode footer renders white text on a mint `--brand` background and is close to unreadable. `site.css` overrides the footer only under `:root[data-theme="dark"]`, not under `prefers-color-scheme: dark` for a reader who has not chosen a theme. This needs its own fix.
