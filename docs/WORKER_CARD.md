# University worker card

Read this card for university data work. Save completed records as you go; work
in country batches. The work order and owner decisions are in GitHub issue #83.
Until #74 lands, update existing records only; do not add universities.

## Fill the record

- Identity: existing institution key, official name, country, city/campuses,
  recognition, intake, checked date, short summary and targeted official handoff.
  Check existing names and mergers before creating an identity.
- Scope: `listed` covers every relevant English-taught first-year degree;
  `catalogue` links the undergraduate listing with sourced faculties/flagships;
  `none` records affirmative evidence of no eligible provision, for internal use.
- Entry: IB Diploma and Course Results separately, points, subjects/levels/grades,
  English proof, tests/portfolio/interview, and how places are ranked. Keep an
  entry requirement separate from a past cut-off or a selection factor.
- Applying: portal/route, applicant group, opening/closing dates, predicted and
  final IB documents, tests and replies. Give each date its own source; distinguish
  a priority date, housing date and post-Diploma round from the actual deadline.
- Degrees: official name/credential, duration, subject, programme URL, campus and
  delivery mode, one-sentence description, curriculum, programme-specific entry
  and selection, fees/period/citizenship group and relevant deadlines. Include
  student support, living costs and outcomes when the institution publishes them.
- Images: inspect the actual local photograph, identify its subject honestly,
  and retain the source, credit and usage basis. Reuse suitable stored assets.
- Sources: official rule-owner/admissions pages, with the date actually checked.
  Keep relevant gaps and conflicting source guidance visible in the record.

Institution/programme authoring is moving to `data/schools/<key>.json` in #74.
Before that migration, preserve the existing canonical records and references
when updating them. Use an existing neighbouring record for field placement;
consult the schema only for an unfamiliar field. Optional specifications are
background, not a second required reading list.

## Exercise judgement

Unknown is not zero, rejection, no deadline or no English degree. Never infer a
date, fee, grade conversion or requirement from another institution or intake.
Label historical criteria and unconfirmed intake language explicitly. A source
link must reach the relevant programme or rule, rather than a homepage. Check
recognition and full-degree teaching language; exchange and top-up provision
alone do not establish a first-year option. Write short, concrete student copy.

## Check and finish

Run `node scripts/qa.mjs --stage data` while editing; run `npm test` for the full
release gate. `npm run build` generates the site; `npm run dev` previews it.
Inspect the changed university and programme pages at desktop and phone width.
Record useful facts/gaps in data and a short commit message, without a separate
university report. Routine data edits need no critic; template/design changes
follow issue #83's independent review. Finish with one issue branch and PR;
merge under #83's CI rules and leave a short completion comment on the issue.
