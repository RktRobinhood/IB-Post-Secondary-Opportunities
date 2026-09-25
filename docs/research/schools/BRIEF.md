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

- `summary`: one line, up to 170 characters. What the place is and why an IB student might look.
  Concrete ("Finland's oldest university; two English bachelor's, both in Helsinki city centre"), not
  a slogan.
- `handoff`: the one targeted page to send the student to. **Never the homepage.** Use the list of
  English-taught bachelor's degrees if one exists. Otherwise use the course search, or the
  international admissions page.
- `ib`: what the institution asks of IB Diploma holders in general: points, subjects, and whether
  the Diploma covers English. Quote its numbers, and link the page that says so.
- `apply`: the portal, when it isn't only the institution's own (Studyinfo.fi, UCAS,
  Universityadmissions.se, Uni-assist, Parcoursup, and so on).
- `dates`: dates for the 2027 intake that apply to the whole institution: when applications open and
  close, test dates, when documents are due. Use ISO dates, and link the page each date comes from.
  **One wrong deadline fails the whole round of review.** If the 2027 date isn't published yet, leave
  it out; don't guess from 2026. When dates differ between EU/EEA and non-EU applicants, record the
  EU/EEA one with `who: "eu-eea-ch"`, and the other too if it matters.
- `programmes[]`: `name` as the institution writes it; `credential` (BSc, BA, BBA, LLB, and so on);
  `years`; `field` (from the enum); `url` for the programme's own page; `city` only when it differs
  from the institution's. `ib` only when the programme asks for more than the general rule, such as
  HL Maths or an entrance exam. `tuitionEuEea` when known. `closes` only when the programme's
  deadline differs from the institution's.
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

## Report

When your share is done, append one section to `docs/research/schools/progress.md`. Give it:
- how many schools you finished, split by scope;
- anything that contradicts `data/countries/`;
- anything you couldn't verify.

Keep it to one line per point.

Don't run git. The coordinating session commits.
