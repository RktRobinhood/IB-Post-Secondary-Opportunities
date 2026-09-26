# Same programme, several campuses: the sweep (issue #52)

**26 September 2026.** The owner: "Programmes with the same name at the same
university appear as separate cards that differ only by location. A student
cannot tell whether they are the same programme or different ones." The fix is
the family mechanism from #46 (`src/lib/families.mjs`,
[../variants/design.md](../variants/design.md)): one card per programme, its
campuses or paths inside, and a small table on each path's page saying what
differs between them. Campus is one more axis of a family.

## How the sweep was done

`node docs/research/programme-families/sweep-52.mjs` reads every programme at
every institution. It covers the 73 canonical programmes in `data/programmes/`
(with each Opportunity's campus) and the 571 programmes in the 90 listed school
records in `data/schools/`. It prints three kinds of pair within one
institution:

- **SAME / STEM:** the names reduce to the same subject once brackets, a dash
  suffix and degree words are removed. For example, "Energy Technology" and
  "Energy Technology (HEBUT double degree)".
- **EXACT:** the names are the same word for word. There are none.
- **NEAR:** one name contains the other, or two thirds of their words are
  shared.

It lists the pairs. Since round 2 the same rule is a guard, not a report:
`namesAlike()` in `src/lib/families.mjs` holds every pair at one institution
whose names are the same subject or near it, and each such pair must be one
family or carry `separateFrom` with its reason, on the record. The rule is
applied after campus and degree words are set aside: "BSc in", "Bachelor's
Programme in", "(Herning)", "at Herning", ", Campus Herning", any word that is
a town the institution teaches in, and "with professional experience". A
shared umbrella before a comma ("Sciences, Mathematics" and "Sciences,
Physics") also counts as near.

**Rule used for each decision.** Merge when the paths are one programme a
student would call by one name, and a student applying does the same things
for each (the same recorded requirements). The paths may differ in campus,
length, a double-degree certificate or places. The card and the table then
say how they differ. Keep them as separate cards when what a student must do
differs, or when each is a different subject that the name already says. That
is the owner's line: "Separate cards only when what a student must do
differs."

## Decisions

### Already one card before this issue (Denmark, #46)

| Institution | Card | Axis | Paths | What differs |
|---|---|---|---|---|
| Aarhus University | Economics and Business Administration | campus | Aarhus · Herning | Last cut-off: 36 and 30 IB points (2026). The requirements are the same. |
| SDU | Software Engineering | campus | Sønderborg · Vejle | Emphasis only: embedded and distributed systems, or user-facing software. The requirements are the same. |
| VIA | Software Technology Engineering | specialisation | Horsens · XR specialisation, Viborg | Campus, specialisation, start month. The requirements are the same. |
| SDU | Electronics / Mechanical Engineering / Mechatronics | credential | BSc · BEng | Length, internship, admission (see the open question below). |

**What changed for these cards:**

- The card line now reads "BSc · 3 yrs · 2 campuses", where it read "Aarhus or
  Herning". The rows under it name each campus once, with what differs.
- The page now says it plainly: "The same programme is offered at the Aarhus
  campus and the Herning campus."
- The table now also compares the teaching language and the Apply-by date. A
  column appears only when the paths differ on it.

### Merged in this pass (school records)

| Record | Card | Axis | Paths | Why one card |
|---|---|---|---|---|
| `fi-lut` | Electrical Engineering | credential | LUT degree · LUT + HEBUT double degree | The `needs`, `points` and first-come selection are the same. The HEBUT path adds a Hebei University of Technology certificate and is still studied in Finland. It has 60 places, against 50. |
| `fi-lut` | Energy Technology | credential | LUT degree (Lappeenranta) · LUT + HEBUT double degree (Lahti) | As above. The campus differs too, so the card reads "2 campuses". |
| `fi-lut` | Mechanical Engineering | credential | LUT degree · LUT + HEBUT double degree | As above. |
| `nl-hanze` | International Business | credential | 4 years · 3 years | One BBA in two lengths. Hanze's own line says IB Diploma holders may take the 3-year version. No requirement differs. |
| `at-modul` | BSc in International Management | credential | 3 years · 3½ years, with professional experience | The same BSc. The longer path adds professional experience (210 ECTS, seven semesters, from its page title). The fee differs by semester (€9,000 against €8,700), and the table shows it. |

### Kept as separate cards, each with `separateFrom` on its record

Every row below is now a `separateFrom` entry on the records, with the reason
in the student's terms. `check-schools` and `validate` fail if one goes
missing.

| Record | Programmes | Why separate |
|---|---|---|
| `nl-fontys` | Marketing Management (Venlo) · Marketing Management - Digital Business Concepts (Tilburg) | It is a different specialisation on a different campus. Only the Tilburg record names an intake conversation that checks your economics background, so what a student must do differs. |
| `se-lu` | Sciences, Mathematics · Sciences, Physics · Sciences, Physical Geography and Ecosystem Science | **Added in round 2.** All three URLs carry one programme code, `NGNAT`, so this is one programme with three tracks. Each track is applied to on its own, and the subject requirements differ: Mathematics needs Maths only; Physics also needs Physics and Chemistry; Physical Geography needs two of Biology, Chemistry and Physics. What a student must do differs, so they stay three cards. |
| `se-su` | Latin American Studies, Spanish · Portuguese | Only the Spanish specialisation records a requirement: Spanish at grade 4. |
| `se-gu` | Music, Classical Performance · Improvisation Performance | Each is applied to separately (codes K1KLA and K1IMP) and admitted on its own admission test. The records do not say whether the tests differ. This is a candidate specialisation family. |
| `se-uu` | Game Design and Graphics · Level Design · Programming · Project Management (Visby) | Four programmes, each with its own subject. Programming asks for more maths (AA at 3, or AI at 4). |
| `fi-tau` | Biomedical Engineering · Chemistry · Engineering Physics · Environmental Engineering · Materials Science · Automation and Robotics, "Science and Engineering" | Different subjects under a shared umbrella name. Each has its own places and application. |
| `fi-tau` | Administrative Sciences · Social Sciences · Technology, "Sustainable Urban Development" | Different degrees with different cut-offs (65.6 against 54.5 points in 2026). Technology also asks for maths and a science. |
| `de-hsrw` | Engineering · Engineering for Sustainability | Only the second is restricted: hochschulstart.de, ranking on the converted grade, and a self-assessment. |
| `de-hsrw` | International Business Administration (Kamp-Lintfort) · International Business and Management (Kleve) | **Added in round 2.** These are different programmes with their own names and pages, on different campuses. Nothing in the records says they share a curriculum. |
| `nl-vu-amsterdam` | Philosophy · Philosophy, Politics and Economics | Different degrees (BA against BSc). PPE is selective and has a maths requirement. |
| `dk-cbs` | Business Administration and Digital Management · … and Service Management; International Business · International Business and Politics | Different subjects, and the names say how they differ. #46 settled these as separate cards. |
| `at-imc-krems` | International Business Management · International Wine Business | **Added in round 2.** Different subjects: the wine business, against general international management. |
| `de-constructor` | Computer Science · Applied Computer Science | **Added in round 2.** Applied Computer Science is taught entirely online. Computer Science is on campus, with its own Cybersecurity specialisation. |
| `de-tum` | Management and Technology · Sustainable Management and Technology | **Added in round 2.** Straubing, fully in English, against Munich and Garching, where teaching mixes English and German. |
| `fi-metropolia` | International Business and Analytics · … and Logistics; Laboratory Science · Biomedical Laboratory Science | **Added in round 2.** Different subjects. The laboratory pair are also different degrees (Laboratory Services against Health Care) with different selection. |
| `nl-fontys` | Industrial Design Engineering (Venlo) · Industrial Engineering and Management (Eindhoven) | **Added in round 2.** Different subjects, on different campuses. |
| `nl-radboud` | International Business Administration · International Business Communication | **Added in round 2.** Different degrees (BSc against BA), each with its own maths rule. |

### A record fixed on the way (AU Herning)

The Herning Opportunity's selection note said "No 6.0 quota 1 GPA floor is
stated". Its own requirement, quoted from AU's Danish page ("Karakterkrav på
mindst 6,0 i kvote 1"), says 6.0. The requirement's note already records why
the two disagreed: AU's English page states no floor, and its Danish page
states 6.0. The note now says that. The claim in the Paths table, "the entry
requirements are the same on each", rests on the requirement, which matches
Aarhus.

## Open question for the owner

The SDU credential families (Electronics, Mechanical Engineering, Mechatronics)
are one card each, although admission differs between the two paths:

- The BSc needs the full Diploma and 31+ IB points.
- The BEng accepts DP Course Results and 26+ IB points.

That followed #46, where the card and the table name the difference on each
path. The owner's line in #52 is "separate cards only when what a student must
do differs", and read literally it would split those three families. They are
left as they are, because they were accepted in #46.

The round-1 critic agreed they should stay one card. Splitting them would put
two cards called "Electronics" on one page. The critic proposed restating the
rule as "a separate card only when what a student must do differs *and* one
row cannot say it". The owner has not yet confirmed that wording.

Since round 2, the card also stops hiding one difference. The Mechanical
Engineering BEng accepts a fourth subject combination (Geoscience A with
Biotechnology A) that the BSc does not. Its row now says "more subject
combinations", so a student who fits only that combination does not read the
BSc's Needs line as a closed door.

## What holds it

- **`npm run validate`** (`checkFamilies`):
  - No two cards at one Danish institution share a name, or a name once its campus and degree words are set aside.
  - Two programmes whose names are alike (`namesAlike`: the same subject or near it) must share a family or say `separateFrom`.
- **`scripts/check-schools.mjs`** (`checkSchoolFamilies`):
  - The same rules for school records.
  - The family's own checks: two or more members, exactly one primary, and distinct path labels and "differs" lines. A campus family must span campuses.
  - The script self-tests every shape of the complaint: "Civil Engineering (Lappeenranta)", "BSc in Economics", "Bachelor's Programme in Economics", "Economics, Campus Herning", "Economics at Herning", "Economics Venlo", "… with Professional Experience", "International Business and Politics", and "Sciences, Physics".
- **`scripts/test-card-names.mjs`** (`card-names`, built stage):
  - No two programme cards on any `/universities/<key>/` page share a name stem, unless their records declare them separate. The self-test includes "Civil Engineering (Lappeenranta)".
  - The "In English" tile equals the number of cards on the page.
  - Every row of a family card says what differs.
  - The home page's counter and "Show all" count cards.
  - Every path page of every family has the Paths table, one row per path, linking to the others.
  - A campus family says "The same programme is offered at …". A family of another kind whose paths span campuses says where each path is taught.
