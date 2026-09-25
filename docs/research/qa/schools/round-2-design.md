# Curated school pages (#43): art director, round 2

Screenshots: `D:\ibp-tmp\shots-r2\`. The set is Aalto, Metropolia, Åbo Akademi, Oxford and the Finland country page, at desktop 1280 and phone 390, in light and dark: 20 images. I looked at every one. I cut the tall captures into full-resolution slices and zoomed into the phone hero eyebrows and the phone close band.

## Score: 7/10. Not accepted.

This is a real step up from round 1. The page now has a clear shape:

- a photograph;
- a fact strip that works: "Apply via" is the link, and IB transcripts is a stat;
- the programmes;
- two short topics beside a deadlines panel;
- one way on.

On the phone, deadlines now come straight after the programmes. Past dates fold away. The hero eyebrow reads cleanly. Dark mode holds together. Aalto's page makes you want to open the cards.

It is not an 8 yet, for four reasons:

- **A phone layout bug.** On Aalto and Metropolia at 390 px, the close button runs off the right edge of the screen. Metropolia's label is cut off before the ↗.
- **An owner rule is broken.** The hero photographs of Aalto, Metropolia and Åbo Akademi are the same photographs as their cards on the Finland page. Round 1 raised this.
- **The heaviest case is a wall.** Metropolia shows 21 look-alike cards, about 4,500 px of scrolling on a phone. "EU/EEA: Free" appears 21 times, and the credentials are raw codes ("BConstrMgmt", "BHealthCare", "BLabServices").
- **Below the hero there are still no pictures,** and the page says things more than once. Aalto gives its count of 11 three times, and Åbo Akademi says "nothing in English" five times.

## Changes, ranked

1. **Fix the two defects first.**
   - *Close button.* `.btn` sets `white-space: nowrap` (`site.css`, around line 807), so a long label overflows at 390 px. Add `.close .btn { white-space: normal; max-width: 100%; justify-content: center; text-align: center; }`, or cap the label length in the template. Check Aalto ("English-taught bachelor's programmes ↗") and Metropolia ("Spring Joint Application, English degrees ↗").
   - *Photographs.* Give each school page a hero photograph that is different from its country-page card, or get the owner's written exception for the card-to-page case and record it in `STATUS.md`. The `unique-images` guard compares bytes, which is probably why it passed: these look like different renditions of one photograph. Make the guard compare the source file or Commons title as well.

2. **Make the long list easy to scan (Metropolia, and anything over about 9 programmes).**
   - Group the cards under small field headings, such as "Engineering · 6" and "Health · 7". The field is already the card's eyebrow, so move it up to the heading and drop it from each card.
   - On the phone, above about 9 programmes, show each programme as a compact row: title, then the credential line, then ↗. Or show the first 6 and put the rest behind "All 21 programmes". Either choice must work with Back.
   - When every programme has the same tuition, say it once in the section lede: "21 bachelor's degrees in English, all free for EU/EEA citizens." Remove the chip from every card. Keep the chip only when programmes differ, or for an "Apply by" date.
   - Write credentials in plain words. "BHealthCare" becomes "Bachelor of Health Care", "BConstrMgmt" becomes "Bachelor of Construction Management", and so on. Put the mapping in data, not in a branch for one country.
   - Equalise card heights within a row, or use a tighter layout. Metropolia's second row has two short cards with large empty areas next to a tall one.
   - Every card opens the university's site, but nothing on it says so. Add a quiet foot to each card, such as "On metropolia.fi ↗".

3. **Say each thing once, and turn the empty case into a way forward (Åbo Akademi).**
   - *The count.* Aalto's "11" appears in the hero lede, the fact strip, and the section lede. Drop the section lede when it only repeats the fact strip, or make it add something new, such as the tuition line in change 2.
   - *Åbo Akademi.* The page says "nothing in English" in the hero, the fact strip, the heading, the line under it, and Worth knowing.
     - Retitle the section **"Taught in Swedish"**. The language comes from data.
     - Give it one line: "Every bachelor's is in Swedish. With Swedish A at grade 2 or Swedish B at grade 5, you can apply." For a Swedish or Finland-Swedish IB student, that is a real opening, not a dead end.
     - The four chips (Minority language rights and the others) have no label, so they read like programmes. Label them "Known for", or drop them when nothing is taught in English.
     - Add a second line to the close: "Need English? The other Finnish schools →", linking to the country page's `#institutions`.

4. **Put a picture in the middle, and make the close a place.** From the fact strip to the footer, every page is text on paper.
   - The ruled-paper background behind "Go on to …" is the obvious place for a second photograph: the campus or the city at a low-opacity wash, or a photo band above the close. Only the owner can relax the uniqueness rule, so this needs one new photograph per school, or at least per city.
   - The 4 px coloured top rule on the programme cards is too faint to count as colour. Use a 32–40 px field-tinted header band that holds the field name, so a grid of cards reads as a spread of subjects rather than a form.
   - Oxford is the thinnest case. Its section has one sentence and four small chips. Label the chips "Known for" and enlarge them to tiles (for example, "Medicine: BMAT-style test and interview"), or at least to body-size chips. That section is where a student decides the school is worth a look.

5. **Quieten the chrome.**
   - The orange "#" after every heading is still there on every page, including the Finland page. Round 1 asked for it to go. Show it only on hover, and never on touch.
   - In the deadlines panel, every entry is an underlined orange link, so the panel reads as a block of orange. Set the labels in ink, and keep the accent for the date or for the single "Finland: every national date" link.
   - The breadcrumb sits between the fact strip and the section heading, and on Metropolia's phone view it wraps to two lines. Move it above the hero or into the fact-strip band. Truncate the last crumb on phones.
   - "Go on to Aalto University" is followed by a subline and then a button that say the same thing ("English-taught bachelor's programmes" twice). Drop the subline, or make it say where you land, such as "The programme list on aalto.fi".
   - There is still about 120 px of blank paper plus a rule between the close and the pager. Tighten it.

6. **The way in (the Finland page) has not changed since round 1.** These cards are the only door to the new pages.
   - The card's one visible link is still the external "IB statement ↗". Add "See the school →", or make the title look like a link.
   - Phone cards still squeeze the photograph into a strip about 105 px wide. Use a top photo on phones.
   - Four descriptions still end in "…". Write them to fit.
   - The map pill and the map label still say "UOulu". Use "University of Oulu".

## Round-1 points: what was fixed

| Round-1 point | Status |
|---|---|
| Credential line under the title at body size; `p.ib` text shown | Fixed |
| 2-column grid for one or two programmes | Fixed in code (`grid--2`); not visible in this set |
| Photo or field band on programme cards | Partly. There is a 4 px top rule, which is too faint (change 4) |
| Drop "Each card opens its own page." | Fixed, but the new count lede repeats the fact strip (change 3) |
| Oxford: remove the orange button from the section | Fixed |
| Oxford: enlarge the "Known for" chips | Not fixed. They are small, and now they have no label (change 4) |
| No-English state: no raw string, a short fact value, a section title from data, always a close | Mostly fixed. The title is the negative "Nothing taught in English", not the language it is taught in (change 3) |
| Hide "Worth knowing" when it repeats the lede; hide an empty Links block | Fixed |
| Acronyms in the pager | Fixed on school pages. "UOulu" remains on the Finland map (change 6) |
| Phone: deadlines before the topics | Fixed |
| Fold past dates into one line | Fixed ("2 dates already passed") |
| Move the "Checked" stamp next to Sources | Not done. It heads the deadlines panel, which is acceptable |
| Cut five accordions to two; apply-via as the link; transcripts as a stat; Sources as one foot line | Fixed |
| Remove the orange "#" | Not fixed (change 5) |
| Hero eyebrow legible, no rule through a wrap | Fixed. It is cream, and the rule is dropped when the eyebrow wraps |
| Ruled lines behind the close on the phone | Fixed (plain on the phone). Still ruled on desktop |
| Gap before the pager; next-school thumbnail | Not fixed |
| Finland page: "See the school →", top photo on phones, chips that fit | Not fixed (change 6) |
| Hero photo reused from the country card | Not fixed (change 1) |
| Dark-mode footer unreadable (outside the change) | Fixed |

## Outside this change

- **Finland page map.** At both widths, in both themes, the map panel captures as a flat black rectangle. The pins float on nothing and no country outline shows. If this is only headless WebGL in the screenshot tool, the shoot script should wait for tiles, or capture a fallback. If real students see it too, it is a globe bug.
- **Haaga-Helia's card** on the Finland page is a monogram ("HH") on ruled paper, the only card there without a photograph.
- **The Finland page's own topic stack.** About 11 headings, each with an orange "#" and an accordion row. It needs the same cut that the school pages just had.
- **The "EU/EEA: Free" chip in dark mode** is teal on dark teal and only just readable. Check its contrast along with the `.tag--sand` work in programme families, phase B.
