# Enrichment brief: one country's degrees to the Danish standard

Stages 2 and 3 of [the country pipeline](../../COUNTRY_PIPELINE.md). Hand this
file to an agent together with one paragraph naming **its files** (for
example every `data/schools/se-*.json`, or a list of Dutch schools) and the
country's admission quirks. The field rules are in [BRIEF.md](BRIEF.md),
"Enrichment: the Danish standard"; this file adds how to run the batch.

You are enriching degree records for IB Pathways, a static site that guides IB
Diploma students (mostly EU/EEA citizens at a school in Denmark) to
English-taught bachelor's degrees. A Danish degree has a full page: what it
is, what you need, how places are decided, the cut-off, deadlines, sources.
The page template is shared by every country; what is missing elsewhere is
data. Bring your files up to that standard.

## Hard rules

- Run no git commands; the coordinating session commits.
- Write nothing to C:. Temp files go in `D:\ibp-tmp\<cc>\`.
- Edit only the files you were given, plus your section of
  `docs/research/schools/progress.md` and your photo file. Other agents are
  editing other countries at the same time.
- Write each school file as soon as it is done. A run can stop at any moment.
- Keep JSON with LF line endings and the file's existing indentation.
- **Never rename a programme** (`name`, `credential`, `city`): page and photo
  slugs are derived from them.
- Official sources only: the programme's page, its requirements page, the
  university's admissions pages, the national portal. Open each page
  yourself. Never build a URL from what it ought to be; never estimate a
  number. A bot-walled or unpublished page is said to be so in the record's
  notes.
- Data only; no code changes.

- **Do not spawn helper agents.** Work through your schools yourself. On 30
  September one country agent fanned out to five helpers and, with the other
  agents running, took the owner's 5-hour window from 0 to 70% in 35 minutes.

## Order of work

1. **Degree photos first**, for every programme (below). The owner judges a
   country by how its cards look.
2. **Programme detail**, school by school, per BRIEF.md: `about` (1–2
   sentences, 40–320 characters, your words), `selection[]` with the schema's
   values and `selectionNote` in the student's terms, `needs[]` in IB terms
   (strictest case; local-language requirements stay in `ib`), `points` /
   `cutoff` / `places` only when published, `requirementsUrl` when the
   requirements live on another page. Unpublished 2027 criteria: record
   2026's and say "2026 criteria; 2027 not yet published".
   For a `catalogue` school, stage 2 is two to four flagships from the
   university's own strengths pages (each with `flagshipSource`) plus its
   `faculties`, per BRIEF.md, "Catalogue schools: flagships and faculties".
3. Tighten the school `summary` to one or two plain sentences from the
   university's own about/facts page (not its homepage).

Finished examples of the target density: `data/schools/fi-aalto.json`,
`data/schools/es-*.json`, `data/schools/de-tum.json`.

## Degree photos

One Wikimedia Commons photograph per programme of **the discipline being
done**: hands, tools, instruments, a lab, a studio, a field site, ideally at
that institution.

- Licence CC0, public domain, CC BY or CC BY-SA; at least 1200 px wide at
  source; confirm both through the Commons API.
- **No subject already used.** Before picking, look at the accepted sets:
  the newest `docs/research/qa/degree-photos/*/contact-sheet-round-*.jpg` of
  every country and each `critique-round-*.md`. By Austria (the fifth
  country) most round-1 rejects were repeats of another country's subject
  (film crew, bioreactor, EEG cap, podcast microphone), not bad photos.
- No file already used: check `data/programme-images.json` and every
  `docs/research/programme-images/*.jsonl`.
- The critic rejects, every time: readable text or formulae at card size; logos
  or brand badges (product shots); event and crowd photography; children in
  frame; the generic person-at-a-monitor or code-on-screen shot; logos, maps,
  car parks, skylines. Vary settings: no country needs six lab benches; two
  degrees at one school must not look alike.
- Commons answers HTTP 429 to a generic user agent. Send one that names the
  project, e.g. `IB-Pathways/1.0 (https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities)`.
- **Check the crop, not the description.** A crop note that says a label or
  date stamp "falls outside the crop" or "under the veil" has been wrong four
  times (Sweden, Norway, Switzerland): the critic sees the stored 16:10 file.
  Open the stored crop's region at 480 px before claiming it.
- **When Commons is dry** (business, economics, computing and data degrees
  so far, in every country), go down this ladder before skipping:
  1. **The programme's own page**: its share image (`og:image`) or a
     photograph on the page, served by the institution. Write it as an
     official line (below). It is the university showing that degree, and
     linking to it is what it is published for.
  2. **The institution's press or media bank**, and its official Flickr
     account (often CC BY: then it is an open-licence photo like any other).
  3. **The institution's social media** (Instagram, LinkedIn, YouTube,
     Facebook) to *find* the right picture: a lab, a studio, a class at work.
     Use it only where the institution also serves it from its own site
     (step 1 or 2) or has published it under an open licence. Never link or
     copy from a social-media CDN: those links expire and are not licensed
     for reuse.
  An official photo is **not** held to the Commons taste rules (owner,
  1 October 2026): how a university pictures its own degree is its choice,
  and its picture, even a weak one, beats the designed placeholder. It must
  pass the quality floor only: a real photograph (not a logo, a text slab
  or a graphic), at least 720 px wide, landscape enough for 16:10, not the
  school's site template, not used elsewhere. Where a page offers several,
  the critic picks the most fitting; it does not veto the university's
  choice. `node scripts/harvest-official-photos.mjs <cc>` collects the
  candidates and a numbered sheet for every photo-less degree.
  Official line format: `{"scope": "school:<key>-<slug>", "officialUrl":
  "https://…", "sourcePage": "https://<the institution's page that shows
  it>", "why": "…", "cropNote": "…"}`. The importer checks the image is
  served, at least 960 px wide, and actually appears on `sourcePage`.
- If no good photo exists, skip the programme. A card on its school's photo
  beats a bad picture.
- Write one line per programme to
  `docs/research/programme-images/schools-<cc>.jsonl` as you go (format and
  scope naming in `docs/research/programme-images/README.md`; scope is
  `school:<institution-key>-<programme-slug>`, slug from `programmePaths` in
  `src/lib/schools.mjs`). Do not run the import script; the coordinator does.

## Text the gate will reject

- An `ib` line over 180 characters. One sentence; detail goes in
  `selectionNote`.
- A date in `ib` or a note earlier than the programme's Apply-by (a
  scholarship date, "1 Feb in 2026"): the page check reads it as a
  contradiction. Say "apply early" instead.
- A source that is a bare homepage. Cite the page that states the fact.
- A ranking in a summary ("the largest", "the oldest", "one of the best"). Say
  what makes the place worth a look: a founding year, a count, a setting.
- Research words in page text ("verified", "critic", "we checked"). Tell the
  student what to do, not how it was researched.

## Check and hand back

- Every few schools: `node scripts/validate.mjs` and
  `node scripts/check-schools.mjs`; fix what your files break.
- At the end: `DIST_DIR=D:/ibp-tmp/<cc>/dist node src/build.mjs`, then
  `node scripts/coverage-report.mjs`, and report your country's line from
  `docs/research/schools/COVERAGE.md`.
- Append a short section to `progress.md`: schools finished, programmes
  enriched, photos proposed, and every conflict or unverifiable point, one line
  each. These are read before release.
- Report: counts, files changed, check results, anything uncertain.
