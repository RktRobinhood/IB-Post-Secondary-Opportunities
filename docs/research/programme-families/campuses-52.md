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

It lists the pairs. The decisions are recorded on the records. Nothing is
decided by a rule in code.

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
| `fi-lut` | Energy Technology | credential | LUT degree, Lappeenranta · LUT + HEBUT double degree, Lahti | As above. The campus differs too, so the card reads "2 campuses". |
| `fi-lut` | Mechanical Engineering | credential | LUT degree · LUT + HEBUT double degree | As above. |
| `nl-hanze` | International Business | credential | 4 years · 3 years | One BBA in two lengths. Hanze's own line says IB Diploma holders may take the 3-year version. No requirement differs. |
| `at-modul` | BSc in International Management | credential | 3 years · 3½ years, with professional experience | The same BSc. The longer path adds professional experience (210 ECTS, seven semesters, from its page title). The fee differs by semester (€9,000 against €8,700), and the table shows it. |

### Kept as separate cards (and why)

| Record | Programmes | Why separate |
|---|---|---|
| `nl-fontys` | Marketing Management (Venlo) · Marketing Management - Digital Business Concepts (Tilburg) | It is a different specialisation on a different campus. Only the Tilburg record names an intake conversation that checks your economics background, so what a student must do differs. Each record says so in `separateFrom`, which the guard requires for a pair with one subject stem. |
| `se-su` | Latin American Studies, Spanish · Portuguese | Only the Spanish specialisation records a requirement: Spanish at grade 4. The names already say how they differ. |
| `se-gu` | Music, Classical Performance · Improvisation Performance | Each is admitted on its own admission test, as a separate application (codes K1KLA and K1IMP in the URLs). The records do not say whether the tests differ, so this is a **candidate specialisation family**. Merge it if the next research pass finds the same test. |
| `se-uu` | Game Design and Graphics · Level Design · Programming · Project Management (Visby) | These are four programmes, each with its own subject. Programming asks for more maths (AA at grade 3, or AI at 4), so what a student must do differs for it. |
| `fi-tau` | Automation and Robotics · Biomedical Engineering · Chemistry · Engineering Physics · Environmental Engineering · Materials Science, "Science and Engineering" | These are different subjects that share an umbrella name. The card title is the subject, and folding them together would hide it. |
| `fi-tau` | Administrative Sciences · Social Sciences · Technology, "Sustainable Urban Development" | These are different degrees (Bachelor of Administrative Sciences, of Social Sciences, BSc Tech) with different cut-offs. Technology asks for maths and a science. The names lead with how they differ. |
| `de-hsrw` | Engineering · Engineering for Sustainability | These are different programmes. Only the second is restricted and needs hochschulstart.de and a self-assessment. |
| `nl-vu-amsterdam` | Philosophy · Philosophy, Politics and Economics | These are different programmes and different degrees (BA against BSc). |
| `dk-cbs` | Business Administration and Digital Management · … and Service Management; International Business · International Business and Politics | These are different subjects under different names; #46 already settled them as separate cards ([design.md](../variants/design.md)). Their recorded requirements are identical, so the names alone carry the difference, and they do. |

## Open question for the owner

The SDU credential families (Electronics, Mechanical Engineering, Mechatronics)
are one card each, although admission differs between the two paths:

- The BSc needs the full Diploma and 31+ IB points.
- The BEng accepts DP Course Results and 26+ IB points.

That followed #46, where the card and the table name the difference on each
path. The owner's line in #52 is "separate cards only when what a student must
do differs", and read literally it would split those three families. They are
left as they are, because they were accepted in #46. Whether to split them is
the owner's call.

## What holds it

- **`npm run validate`** (`checkFamilies`): no two cards at one Danish
  institution share a name. Two programmes with one subject stem must share a
  family or say `separateFrom`.
- **`scripts/check-schools.mjs`** (`checkSchoolFamilies`): the same rules for
  school records, plus the family's own checks. There must be two or more
  members, exactly one primary, and distinct path labels and "differs" lines.
  A campus family must span campuses. The script self-tests the rule.
- **`scripts/test-card-names.mjs`** (`card-names`, built stage): no two
  programme cards on any `/universities/<key>/` page share a name, and no two
  home-page cards share a name and an institution. Every path page of every
  family has the Paths table, one row per path, linking to the others. A
  campus family says "The same programme is offered at …".
