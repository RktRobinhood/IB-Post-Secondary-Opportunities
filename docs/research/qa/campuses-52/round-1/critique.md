# Issue #52, round 1: critique

**Critic, 26 September 2026.** Fresh eyes. I read every shot in `shots/`, the sweep, `fixes.md` and `scripts/test-card-names.mjs`, and checked the decisions against `data/programmes`, `data/opportunities` and `data/schools`. I rebuilt from `wt-52` and ran `validate`, `check-schools` and `card-names` (all pass). I mutation-tested both guards. I also shot `/universities/dk-sdu/`, the SDU Electronics BEng page, `/universities/at-modul/` and its professional-experience path, LUT, Hanze and Lund from the current build.

## Score: 6 / 10

The mechanism is right. The five merges are sound on the records, the Paths tables read cleanly on phone, and SDU's credential cards are the best thing in the round. It is not an 8 for three reasons:

1. The guard does not catch the exact shape of the owner's complaint.
2. The "systematic" sweep missed a case, and most of its "keep separate" decisions are held by nothing.
3. Every institution page now shows a degree count that contradicts its own cards.

## Reasons

### 1. The guard misses "same name plus a campus", which is the bug #52 was filed about

- **The built-page check (`card-names`) compares names exactly.** I copied `dist`, added a second LUT card called "Civil Engineering (Lappeenranta)" next to "Civil Engineering", and ran it with `DIST_DIR`. It passed: "ok 634 programme cards … no two at one institution share a name". The owner's words were "separate cards that differ only by location". A title with the campus in brackets is the most likely way that comes back, and this check cannot see it.
- **The data guard (`nameStem` in `checkSchoolFamilies` / `checkFamilies`) is narrower than the sweep.** It strips brackets and a dash suffix, but not "in", "programme", "Bachelor's", a comma suffix or "at <campus>". I probed it with pairs of programmes:

  | Pair | Result |
  |---|---|
  | "Economics" and "Economics (Herning)" | caught |
  | "BSc in Economics" and "Economics" | missed |
  | "Bachelor's Programme in Economics" and "Economics" | missed |
  | "Economics, Campus Herning" | missed |
  | "Economics at Herning" | missed |
  | "Economics Venlo" | missed |
  | "BSc in Management" and "… with Professional Experience" | missed |

- **The MODUL merge is therefore unguarded.** Delete its `family` block tomorrow and nothing fails.

### 2. The sweep is not systematic, and "the decisions are recorded on the records" is not true

- **Missed: Lund, "Sciences, Mathematics", "Sciences, Physics" and "Sciences, Physical Geography and Ecosystem Science" (`se-lu`).** All three URLs carry one programme code, `NGNAT-…`. They are one programme with three tracks, and the umbrella word leads the card title. The sweep's NEAR rule does not reach them: they share one word in three. Their subject requirements differ, so separate cards are probably right. But the case is absent from `campuses-52.md`, and no record says why they are separate.
- **Kept separate on paper only.** Of the ten "kept separate" rows in the doc, only Fontys carries `separateFrom`. That covers `se-gu`, `se-su`, `se-uu`, `fi-tau` ×2, `de-hsrw`, `nl-vu-amsterdam` and `dk-cbs`. Those nine decisions live only in a Markdown table. Nothing holds them, and a future editor has nothing on the record to read.
- **A record contradicts itself (AU Herning).** On the Herning Opportunity, `admission.selection[0]` says "No 6.0 quota 1 GPA floor is stated for this programme". The requirement list, from the Danish page, says 6.0, and the page renders "Quota 1: at least 28 IB points". The Paths table's headline claim, "The entry requirements are the same on each", rests on the requirement. It is probably correct, but the stale selection line should go, because the claim is only as good as the record.

### 3. The counts contradict the cards

Now that one card can hold several degrees, the "In English" tile, the lede and the home counter still count degrees. A student counts cards.

| Page | Says | Cards shown |
|---|---|---|
| AU | 6 degrees | 5 |
| SDU | 15 degrees | 11 |
| LUT | 15 degrees, and the lede says "15 English bachelor's" | 12 |
| Hanze | 17 degrees, and the lede says 17 | 16 |
| MODUL | 7 degrees | 6 |
| Home | "73 degrees", "Show all 67 cards (73 degrees)" | 67 |

AU is the worst case. The Herning row of its own Paths table says "the same degree", while the tile counts it as two. The home button, "67 cards (73 degrees)", admits the mismatch rather than fixing it.

### 4. Card rows sometimes say nothing, and the one line an IB student needs is missing

- **SDU Software Engineering.** The rows are bare: "Sønderborg" and "Vejle". The records have good `differs` lines (embedded, distributed systems and security with the larger intake; user-facing software and AI with a small intake), but the card does not use them. `fixes.md` says the rows name each campus "with what differs on it". Here they do not.
- **Hanze International Business.**
  - The rows are "4 years" and "3 years", which repeats the card line "BBA · 3–4 yrs".
  - On phone they render as bold 16 px links, heavier than the card's own meta line (my `universities__nl-hanze--phone-light` crop). That is dead weight in the most prominent spot.
  - The card's `ib` line shows "Applying after 1 May means a compulsory Study Choice Check". It drops the sentence that matters to the reader: "IB Diploma holders may take the 3-year version". That is one year less of study, rent and fees, and it is visible only on the path pages.
- **LUT.** Each row shows total places, 50 or 60. The records say 35 of 50 and 40 of 60 are in international rolling admission, "your route", and admission is "while places last". The operative number for this reader is the one that is not shown.

### 5. A cost comparison that misleads (MODUL)

The card and the Paths table show "€9,000 a semester" for the 3-year path and "€8,700 a semester" for the 3½-year path. Read at a glance, the longer path is cheaper. Over the recorded semesters it is 6 × €9,000 = €54,000 against 7 × €8,700 = €60,900. Whether the professional-experience semester is charged is not recorded, so do not print a total. Do put the number of semesters beside each fee, and check the source.

### 6. Energy Technology spans two cities and the page does not say so plainly

- **The card and the path page disagree on what the family is.** The card line reads "2 campuses". The path page says "LUT offers this as 2 paths", with Lappeenranta and Lahti only inside the row labels.
- **The plain sentence never appears for this family.** "The same programme is offered at …" is gated on `axis === 'campus'`, so a credential family that also changes city never gets it. For a student, moving city is the biggest difference between these two paths.
- **Neither page says the double degree is in Lahti.** The HEBUT row's "What is different" line says only "while studying in Finland", and the page's own "What it is" text does not name Lahti.

### 7. The evidence is partly stale

- **Only four shots are post-merge.** The desktop and dark shots were taken before the #43 merge; only four phone-light shots were re-taken.
- **The MODUL shots disagree with each other.** The desktop heading reads "2 ways to study BSc in International Management" and lists a 1 April deadline. The shipped phone page reads "2 ways to study International Management" and lists a 15 August deadline.
- **The Hanze shots disagree the same way.** The desktop shot lacks the "Before you apply" note that the phone shot has.

A reviewer judging the desktop shots is judging a page that no longer exists.

### What is good

- **The AU Herning Paths table is exactly right.** It leads with "The same programme is offered at the Aarhus campus and the Herning campus", has a cut-off column, and gives one line each on what differs.
- **SDU's credential cards** (Electronics, Mechanical Engineering, Mechatronics) put the admission difference on the card in one row each:
  - "BSc 3 yrs · Full Diploma · 31+ IB points"
  - "BEng 3½ yrs (internship) · Diploma or Course Results · 26+ IB points"

  The BEng page's table is headed "What it takes to get in differs between them, so check each one". That is counsellor-grade.
- **The phone Paths table stacks each path as a block** and reads well in both themes.
- **The merges are right on the records.**
  - LUT: the `needs`, `points` and first-come selection are identical on both paths.
  - Hanze: one BBA in two lengths.
  - MODUL: one BSc, with or without professional experience.
  - Fontys stays split: only the Tilburg record names an intake conversation, so the split is justified.

## The implementer's two open decisions

**SDU BSc/BEng: keep one card.** Splitting would put two cards called "Electronics" on one page, which breaks the owner's first acceptance line. Renaming them "Electronics (BEng)" brings back the pre-#46 state the owner already rejected. The owner's intent is that a student must see that what they must do differs, and the card already does that in one row per path. Ask the owner to confirm, with the rule restated as: "a separate card only when what a student must do differs *and* one row cannot say it".

One thing to fix inside the card: its "Needs" line is the BSc's. Mechanical Engineering's BEng accepts four subject combinations against the BSc's three. A student who fits only the fourth sees the BSc's needs and "+1 more". Either show the needs the paths share, or flag "BEng: more subject combinations" in the BEng row.

**LUT "15 degrees" above 12 cards: change it.** It reads as a mismatch, and the same mismatch sits on AU, SDU, Hanze, MODUL and the home page. The owner's rule makes a card the unit ("near-identical programmes are one card"). Count cards: "12 programmes". Let the double degree show as what it is, a path on three of the cards. If the extra degrees matter, say "12 programmes, 3 with a double-degree option", never a number that differs from what the student can count. Change the lede ("15 English bachelor's") too.

## Three changes that would raise the score most

1. **Make the guards catch what the owner complained about, and hold every decision on a record.**
   - `test-card-names.mjs`: compare `nameStem` rather than `normalName`. Widen `nameStem` to strip degree prefixes ("BSc in", "BA in", "Bachelor's Programme in"), "at <place>", a trailing ", <place>", and any word equal to one of the record's cities.
   - Add "Civil Engineering" + "Civil Engineering (Lappeenranta)" to the self-test.
   - Fold the sweep's NEAR rule into `checkSchoolFamilies` / `checkFamilies`: a NEAR pair must be one family or say `separateFrom`.
   - Then write `separateFrom` on the nine doc-only decisions, and on Lund's three "Sciences, …" tracks (with the Lund row added to `campuses-52.md`).
   - Remove the stale "No 6.0 floor" line from the Herning Opportunity.
2. **Count what the student sees.**
   - The "In English" tile, the school lede and the home counter count cards/programmes, not degrees: AU 5, SDU 11, LUT 12, Hanze 16, MODUL 6, home 67.
   - The home button becomes "Show all 67 programmes".
   - Add a built-stage assertion that the tile number equals the number of programme cards on the page.
3. **Every family row on a card must say what differs, and for this reader.**
   - SDU Software Engineering: use a short form of `differs` ("Sønderborg: embedded and security, larger intake"; "Vejle: user-facing software and AI, small intake").
   - Hanze: "3 years: open to you with the IB Diploma" on the card, and render the rows at meta weight, not bold 16 px.
   - MODUL: "€9,000 a semester, 6 semesters" and "€8,700 a semester, 7 semesters".
   - LUT: "35 of 50 places in your route" and "40 of 60".
   - On pages, print the plain campus sentence whenever a family's paths span campuses, whatever its axis ("The LUT degree is taught in Lappeenranta, the double degree in Lahti").
   - Then re-shoot all 36 shots from the merged build.
