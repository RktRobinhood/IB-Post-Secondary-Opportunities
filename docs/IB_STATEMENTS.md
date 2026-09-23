# IB recognition statements

What the IB Recognition Statements Database is, what this site takes from it,
and — more important — what it deliberately does not. Issue #38.

## The rule

**A touch, then a proper reference out.** The site's job is to show a student
that a university is real, recognises the IB, and is worth their time — then
hand them to the page with the detail. `docs/PRODUCT_VISION.md`, "It is a
pamphlet, not a reference work".

So from each statement we keep what makes an institution *enticing and true*
and link the rest. We never import a statement, and this file can never add an
institution the site does not already list. `scripts/test-ib-statements.mjs`
enforces both.

## What the database is

Read in a browser on 2026-09-23. `recognition.ibo.org` is a JavaScript
application that serves no text to a plain fetch, and `ibo.org` itself sits
behind a Cloudflare human check — see `scripts/lib/link-policy.json`. It does
serve normally to a person's browser, and so does the JSON it loads.

| | |
|---|---|
| Universities with a statement | **2,328**, in **91** countries |
| …of which in the United States | **1,187** (51%) — the US credit and advanced-standing data lives here |
| Everywhere else | about **1,140** — UK 128, Germany 115, Canada 87, Spain 66, Netherlands 46, India 42, Switzerland 35, Australia 32, France 31, Sweden 31 … Denmark 14 |
| Say they recognise the Diploma | 2,326 |
| Recognise DP Course Results | 857 |
| Give credit for IB courses | 1,332, almost all American |
| Offer full degrees taught in English | 1,916 |

"More than 2,000 universities" is true, and half of them are American. For a
student in Denmark the European and worldwide pool is roughly a thousand.

### Structure, for whoever re-reads it

- **Index.** `GET /en-US/university-search/?page=N&…` returns JSON: 50
  universities a page (`UniversityList`: statement id, name, country, state,
  and yes/no flags for DP, DP Courses, CP, MYP and credit), plus a
  `UniversityLanguage01` table of every statement's teaching languages. 47
  pages. The country filter parameter did not narrow the results when tried.
- **A statement.** `/en-US/university-statements/?id=<guid>` — **a stable
  URL**, and the `id` alone is enough; the `university=` and `country=`
  parameters the site adds are decoration. Server-rendered HTML whose labels
  are filled in by script, so values are found by their CSS classes
  (`ibo_totalnooftranscripts`, `UDPRecognise`, `UDPWebsite`…), not by label.
- **What a statement holds.** A description written by the university; whether
  it recognises the DP, DP Courses, CP and MYP; its Diploma admission policy in
  its own words; maths requirements; whether IB language subjects meet its
  language-proficiency requirement; scholarships; credit by subject for US
  institutions; teaching languages; the university's own links for each of
  these; map coordinates; and **the number of transcripts IB students sent it
  in the last five years**.
- **Who writes it.** The university. The IB publishes it. So a statement is
  `institutional-guidance` — authoritative about that institution — and not a
  claim the IB makes. Statements vary from a paragraph of real policy to "see
  our website".

## What "a touch" is

Per institution, in `data/ib-statements.json`:

| Field | Why it earns its place |
|---|---|
| `statementUrl` | The reference out. The whole point. |
| `recognises.diploma`, `recognises.courseResults` | The first question a student has, answered by the university. |
| `transcripts5y` | The single most persuasive number available: IB students actually send their results here. Aalborg 490, and it is concrete in a way no description is. It counts transcripts requested, not students admitted — the page must say "sent", never "admitted" or "enrolled". |
| `diplomaPolicy` | One quotation of at most 280 characters, cut at a sentence. Enough to tell a student what kind of thing they will find; not enough to stand in for it. |
| `links.ibAdmissions` | The university's own IB admissions page, as the university gave it to the IB. Often better than the `admissionsUrl` on file — see below. |
| `links.language`, `links.scholarships` | Two more references out, where given. |
| `match`, `websiteAgrees` | How the statement was tied to our institution, and whether the website it names agrees. |

**What is left out on purpose:** the university's description of itself,
maths requirements, subject-by-subject credit tables, CP and MYP, legalisation
rules. All of it is one click away on the statement.

**On the page: one line.** "IB students sent 490 transcripts here in five years
· Its IB statement ↗". Nothing in this work adds to the default length of a
Destination page (#37).

## Matching, and how it can be wrong

Our institutions have names; the database has names; neither has an identifier
the other knows. Matching is by name within a country, in three tiers:

- `exact` — a name, or a parenthesised or dash-separated part of one, is equal
  after accents and punctuation are stripped. 
- `reviewed` — a near match a person read and accepted ("Queen's University
  at Kingston" ↔ "Queen's University").
- `manual` — chosen by hand from candidates ("University of Sydney", not the
  UNSW statement that also ends in "Sydney").

A token-overlap score was tried first and is **not** used: with stop-words
removed, "University of Iceland" and "Iceland University of the Arts" are the
same set of words. Every match is then cross-checked against the website the
statement itself links to; a disagreement is printed by the importer and the
guard refuses to publish it unless a person has marked it `reviewed`.

The Evidence record for each says which of these happened.

## Coverage on 2026-09-23

- **315 of the 445** country-profile institutions have a statement, and all
  13 canonical institutions (Denmark and the Dutch pilot) — 328 entries.
  290 of them show a transcript count; the rest show the link alone
  (`IB_TRANSCRIPT_FLOOR` in `src/lib/data.mjs` is 25, because the Technical
  University of Munich reads 1 — a re-created record, not a signal).
- The busiest, by transcripts sent in five years: Toronto 17,126 · NUS
  14,183 · NTU 12,235 · UBC 11,611 · HKU 10,231 · Amsterdam 9,396 ·
  Melbourne 7,722 · SMU 6,594 · Sydney 6,118 · CUHK 5,187.
- **Four name matches were refused by hand**, and are worth knowing as the
  shape of what goes wrong: Sciences Po matched only its Poitiers campus
  statement (10 transcripts — it would have undersold Sciences Po badly); the
  Université libre de Bruxelles statement links to VUB's website, an error in
  the database itself; and two Ljubljana academies inherited the whole
  university's statement.
- **Twelve statements name a different website from ours and are the same
  institution** — Middlesex's UK parent, `studycharles.cz`, Bristol's older
  `bris.ac.uk`, Bocconi's `.eu`, PUMS under its Polish initials, and a typo
  in the database's own record for Nottingham Ningbo (`nottinhgm.edu.con`).
  Each was read and marked `reviewed`.
- **The rest have none.** That is a finding, not a gap to fill: much of Czechia,
  Greece, Hungary, Slovenia, the Baltics and Iceland's smaller institutions
  have not written one. An institution with no statement is not one that
  rejects the IB; the database is opt-in. The site must not render its absence
  as "does not recognise".
- **~387 English-teaching universities outside the US** in our 35 Destinations
  have a statement and are not on the site; about 1,150 more in the US. That
  is the discovery pool for #15 — ranked by `transcripts5y`, it is a list of
  where IB students actually apply.

## What this harvest does not carry yet

The first import used the **compact** harvest form: statement id, flags,
transcript count and the website host. The Diploma-policy quotation and the
institution's own IB-admissions link were read too, but not yet brought out
of the browser, so `diplomaPolicy` and `links.ibAdmissions` are empty for
now and the pages render without them. A full harvest file fills them with
no code change.

## Re-reading it

Automation cannot. `npm run verify` will report every one of these records as
`partial` forever, with the reason on the record, and that is correct. To
refresh: open the database in a browser, harvest again, and run
`node scripts/import-ib-statements.mjs <harvest>`; the 2026-09-23 compact harvest is kept at `data/harvests/ib-statements-2026-09-23.tsv` so the import can be re-run. Corrections to a
statement go to the university or to `recognition@ibo.org`, not to this repo.
