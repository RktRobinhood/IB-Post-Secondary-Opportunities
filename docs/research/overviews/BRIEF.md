# Programme overviews (October 2026)

The owner, 14 October 2026, on a programme page: "What it is" was one
sentence; "I'm expecting more like a short paragraph, kind of like the
course description… something people would expect in a pamphlet."

Every school programme gets an `overview`: a short paragraph a student would
read in a university's prospectus. The one-line `about` stays as it is (it
feeds cards and the page's opening line); the overview is what the "What it
is" block shows.

## Your batch

`batch-NN.tsv` lists, per programme: the school key, the programme's exact
name, credential, its official page (`url`) and the existing one-liner
(`about`). Write one result line per programme to `batch-NN.results.jsonl`
in this folder, **appending as you go, one programme at a time** (the session
can end; whatever is written is kept). Before starting, read your results
file if it exists and skip programmes already done.

    {"key":"at-aau","name":"Digital Media, Culture, and Communication","overview":"…","sources":["https://…"]}

`key` and `name` must match the TSV exactly.

## What an overview says

3–5 sentences, about 380–750 characters, plain English, second person or
neutral ("You study…", "The programme…"). Cover, in this order, what the
page supports:

1. **What you study**: the core subjects and themes of the first years, by name.
2. **How it is taught**: projects, labs, studio work, fieldwork, an internship
   or placement, a semester abroad, a thesis or final project.
3. **What makes it this programme**: tracks, specialisations, minors,
   partner organisations, the city or industry it is tied to.
4. **Where it leads**: the jobs graduates go into or the master's it prepares for.

Rules:
- **Only what the sources say.** Read the programme's official page (the
  `url`; if it is thin, the university's own curriculum, study guide or
  faculty page for the same degree). Never invent modules, careers or
  partners. If a point is not on the pages, leave it out; three good
  sentences beat five padded ones.
- **Your own words.** Paraphrase; never copy more than six words in a row
  from the page. No marketing: no slogans, superlatives, rankings,
  "world-class", "unique", "exciting", "cutting-edge", "dynamic".
- **Not the rest of the page.** No entry requirements, IB scores, deadlines,
  fees, scholarships, language tests, application steps or credit totals in
  ECTS — the page shows those elsewhere.
- **No meta language.** Not "This page…", "According to the website…",
  "More information…". Don't name the university again in the first words
  (the page already says whose degree it is).
- **Don't open with the one-liner.** The overview is read right after the
  `about` sentence; don't repeat it. It may build on it.
- English only, even when the source page is in another language
  (translate the substance).
- No line breaks, no lists, no markdown; straight quotes; one paragraph.
  Keep apostrophes ("master's", "Europe's"): write each line with
  `JSON.stringify` (e.g. a small node one-liner), which escapes correctly.

### When the university's own pages are thin (owner, 14 October 2026)

The overview is the one block a programme page must have. Where the
university's pages give too little for three good sentences (an
admissions-only page, a title and two lines, a dead site), **write an
informed paragraph anyway**:

- Start from whatever the university does say (its subjects, its faculty,
  its city, its other programmes' pages) and keep its tone.
- Fill the rest from what such a degree typically covers: search for the
  same degree's curriculum at the university (study guide, course
  catalogue, module list, PDF) and, failing that, how comparable
  programmes in that country describe it. Write in general terms
  ("Typical first-year courses include…", "Graduates usually go into…"),
  never inventing specifics for this university (no named modules,
  partners, labs or exchange agreements it does not state).
- Mark the line `"basis":"informed"` and list what you read in `sources`.

Do this only for the overview. Do not fill other fields, and do not pad a
programme whose own page already supports a good paragraph.

If no page can be read at all (dead link, bot wall that will not pass, a
login), write `{"key":…,"name":…,"overview":null,"tried":"<what you tried>"}`
and move on.

## How to read pages

Use WebFetch first. If a site blocks it (403, Cloudflare, an empty
JavaScript shell), open it in the built-in browser in **your own tab**
(`tabs_create`, pass its `tabId` on every call) and use `get_page_text`;
Cloudflare checks usually pass by themselves after 10–15 seconds. Close
your tab at the end. Several programmes of one school often share a
curriculum site — reuse what you learn.

## Who does what

You write only your batch's results file. No git, no edits under `data/` or
`src/`. The coordinating session merges results into the records
(`node scripts/merge-overviews.mjs`), builds and gates.

When done, reply with: programmes written, programmes null (and why, in one
line each), and anything odd (a programme that no longer exists, a URL that
now points to another degree).
