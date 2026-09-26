# School pages research brief (issue #43)

Every institution on the site gets its own curated page before any hand-off. Denmark and five Dutch
institutions already have one, built from the canonical records. This brief covers the other ~450
institutions: the ones in the country profiles, `data/countries/<code>.json`.

## The reader

An IB Diploma student at a school in Denmark, applying for autumn 2027 entry. About a fifth are Danish.
Most are EU/EEA citizens from elsewhere. Write for them.

## What to produce

For each institution in your share of `docs/research/schools/manifest.json`, write one file,
`data/schools/<key>.json`, that validates against `schemas/school.schema.json`. **Write each file as
soon as that institution is done.** Don't hold them until the end. A run that stops halfway must leave
its finished schools on disk. Skip any institution whose file already exists: a previous run finished
it.

The page is built from this file, so what you write is what the student reads.

### Decide the scope first

- **`listed`**: the institution teaches some bachelor's degrees in English, and you apply to a
  specific programme. This covers most of continental Europe, and English-taught tracks in Japan,
  Korea, China and the Gulf. List **every** English-taught bachelor's degree that first-year
  applicants can apply to for autumn 2027. Give each one a link to the programme's own page.
- **`catalogue`**: nearly every course is taught in English and there are too many to list. This is
  typical in the UK, Ireland, the US, Canada, Australia, New Zealand, Singapore and Hong Kong.
  Leave `programmes` empty. `handoff` is the undergraduate course search. Put the effort into
  `summary`, `ib`, `apply` and `dates` instead.
- **`none`**: no English-taught bachelor's degree for 2027. `handoff` is the page for international
  applicants. One note says what language the degrees are taught in.

These are examples, not rules by country. Decide from what the institution publishes.

### Fields

- `summary`: one line, **up to 150 characters**: it is the text on the school's card. Say what the
  place is and why an IB student might look. Make it concrete ("Finland's first university; two
  English bachelor's, taught on its Helsinki campuses"), not a slogan. Don't write
  "every", "all", "only", "largest", "oldest" or a rank unless a page you cite says exactly that.
- `courses` (catalogue scope): how many undergraduate courses its own listing counts, when it gives
  a number.
- `language` (none scope): the language its bachelor's degrees are taught in. Put the way in for a
  student who has that language (for example "Swedish A at grade 2 or Swedish B at grade 5") in
  `ib`.
- `handoff`: the one targeted page to send the student to. **Never the homepage.** Use the list of
  English-taught bachelor's degrees if one exists. Otherwise use the course search, or the
  international admissions page.
- `ib`: what the institution asks of IB Diploma holders in general: points, subjects, and whether
  the Diploma covers English. Quote its numbers, and link the page that says so. **Give thresholds
  in IB terms** (grade 6 in Maths AA HL), not in local grades a student can't read. Where some
  programmes select differently (an entrance exam, an audition), say so here or on the programme.
- `apply`: the portal, when it isn't only the institution's own (Studyinfo.fi, UCAS,
  Universityadmissions.se, Uni-assist, Parcoursup, and so on).
- `dates`: dates for the 2027 intake that apply to the whole institution: when applications open and
  close, test dates, when documents are due. Use ISO dates, and link the page each date comes from.
  **One wrong deadline fails the whole round of review.** If the 2027 date isn't published yet, leave
  it out; don't guess from 2026. When dates differ between EU/EEA and non-EU applicants, record the
  EU/EEA one with `who: "eu-eea-ch"`, and the other too if it matters. **Always record the IB
  deadlines when the institution sets them**: when predicted grades are due, and when final grades
  are due. A student comparing two pages must not conclude that one school has none.
- `programmes[]`:
  - `name`: as the institution writes it.
  - `credential`: a standard abbreviation a student knows (BSc, BA, BBA, BEng, LLB, BMus), or else
    the degree's full English title ("Bachelor of Health Care"). **Never an invented abbreviation**
    such as "BHealthCare".
  - `years` and `field`: `field` comes from the enum.
  - `url`: the programme's own page.
  - `city`: whenever it differs from the institution's city. Set it on every programme at a school
    with campuses in several towns.
  - `ib`: only when the programme asks more than the general rule, such as HL Maths or an entrance
    exam. **If a programme requires the local language at any level (Finnish B1, say), `ib` must
    say so.**
  - `tuitionEuEea`: when known.
  - `closes`: only when the programme's deadline differs from the institution's.
- `notes`: at most three facts a student wouldn't guess, one sentence each.
- `sources`: every page you relied on, each with its `retrieved` date.

## Standards

- **Official pages only**: the institution's own site, or the national admissions portal.
  Aggregators (Studyportals, Bachelorsportal, Mastersportal, Keystone) are for finding leads, never
  for citing.
- Every programme URL must open that programme's page. Check it. If a programme exists only in the
  local language, it doesn't belong here.
- Bachelor's degrees only: first-cycle programmes a school-leaver applies to. No master's, no
  foundation years, no exchange-only programmes.
- Short, concrete and true. No hedging paragraphs.
- The institution's `note` and `admissionsUrl` in `data/countries/` were researched earlier and are a
  starting point, not the truth. Where the institution's own page disagrees, trust the page, and say so
  in your report.
- **When official pages disagree** (an FAQ against a route's own page, say), trust the page for that
  specific route, cite both, and say they disagree. Never resolve a conflict towards telling a student
  they can't.
- **Unpublished rules are provisional.** Where this year's criteria aren't public yet and you are
  relying on last year's, say "2026 criteria; 2027 not yet published". Never present them as this
  year's rules.
- **Check completeness against national data** where it exists: Studyinfo.fi,
  Universityadmissions.se, Samordna opptak, the national course finder, and so on. That is how a
  list is known to be complete.
- **Fee status is a country rule** (EU/EEA against international, with its exceptions). It belongs
  on the country record, not in each school's notes. Keep a school note only for what is particular
  to that school.
- **Never collapse a per-course table into "prefers".** If some courses require a subject, name the
  strictest case.
- **Check the hand-off in a browser.** It must list bachelor's degrees only, not every level. Put the
  result count in your report.
- **Quote the page's own words** for every "contradicts data/countries/" claim in your report.
- **Use only examples open to the 2027 intake.** No discontinued courses.
- **Keep 2027-cycle dates that have already passed.** The page folds them away.
- **Bot checks:** if a site blocks automated reading and you read it another way, put the exact
  sentence each date came from in your report, so a reviewer can check it from the repository.

## Report

When your share is done, append one section to `docs/research/schools/progress.md`. Give it:
- how many schools you finished, split by scope;
- anything that contradicts `data/countries/`;
- anything you couldn't verify.

Keep it to one line per point.

Don't run git. The coordinating session commits.

## Enrichment: the Danish standard (26 September)

The owner wants every country's degrees as close to the Danish pages as possible. A Danish degree has its
own page: what it is, what you need in IB terms, how places are allocated, the last cut-off, its deadlines,
its sources. Each `listed` programme now gets such a page, built from these optional fields. Fill them from
the programme's own page (and its entry-requirements page), one programme at a time, and write the file
after each school:

- `about`: one or two plain sentences, 40–320 characters: what you study and what sets it apart. From the
  programme page, in your words. No slogans, no rankings.
- `needs[]`: every subject the programme requires, in IB terms: `anyOf` (ids from `data/ib-subjects.json`,
  e.g. `["mathematics-aa", "mathematics-ai"]`), `level` (HL / SL / any), `grade` when stated or converted by
  an official table (quote the table's URL in `sources`). Name the strictest case; never soften "required" to
  "preferred". A local-language requirement goes in `ib` (the field has no subject for it), as before.
- `points`: minimum IB points, only when stated for this programme (or for the institution and it applies).
- `selection[]` and `selectionNote`: how places are decided, in order of weight, and one line in the
  student's terms ("Ranked on IB grades with Finland's scoring table; the top 40 get in").
- `cutoff`: the last admitted score, only where the institution or national portal publishes it, with its
  intake year and URL. `ibPoints` only when an official table converts it. Never estimate.
- `places`: study places for 2027, or the latest published figure.
- `requirementsUrl`: the page that states the requirements, when it is not the programme page.
- Keep `ib` as the one-line summary the school page shows; the new fields carry the detail.
- Unpublished 2027 criteria: record last year's and say "2026 criteria; 2027 not yet published" in
  `selectionNote` or `ib`.

## Catalogue schools: flagships and faculties (owner, 26 September)

For an English-language university where the whole school is open to an IB student (the `catalogue`
scope: UK, Ireland, the US, Canada, Australia, New Zealand, Singapore, Hong Kong, most of the UAE), the
owner does not want every course listed ("overkill"). The record gives the student direction instead:

- **Flagships:** the few programmes the university is known for and excels in get a full programme page,
  to the Danish standard above (`about`, `needs` in IB terms, `points`, `selection`, deadlines). Pick them
  from what the university's own pages present as distinctive (an "areas of strength" page, a faculty's
  own claims, published figures), never from league tables or search summaries, and say which page
  in `sources`. Two to four per university is plenty.
- **Faculties:** every faculty, school or college that admits first-year students, each with one line on
  what it generally looks for from applicants (e.g. "Maths HL for every engineering degree; the
  personal statement weighs heavily"), from that faculty's own admissions page, and a link to it.
  The specifics stay on the university's site; the line is direction, not a requirement list.
- **Known for and the vibe:** `summary` says what the place is known for and what it is like (size,
  setting, residential or commuter), from the university's own "about" or "facts" pages.

The schema and the page for flagships and faculties are built after the programme pages (#43) land on
`main`; until then, research notes for them go in `docs/research/schools/leads/<cc>.md`.
