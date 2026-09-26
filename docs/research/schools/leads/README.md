# School research leads

A **lead** is a URL on an institution's own site (or an official national portal) that a web search
returned, and that looks like the page a researcher will need. The files here were made on 26 September
2026 from a cloud session that could run web searches but could not open university pages. They are
there to make the next session with a browser fast.

| File | Institutions |
|---|---|
| [es.md](es.md) | Spain, 13 |
| [it.md](it.md) | Italy, 13 |
| [fr.md](fr.md) | France, 12 |
| [pt.md](pt.md) | Portugal, 12 |

## What a lead is not

- **Not a fact.** No page was opened. A URL was seen in a search result with the title quoted beside it;
  the page may have moved, be for another year, or say something else.
- **"Hints to verify"** are paraphrases of the search engine's own summaries. They are useful for knowing
  what to look for (a deadline, a minimum score, a scope question), and they are often wrong: some are
  from an earlier year, some mix up EU and non-EU routes, and two conflict with each other (flagged where
  seen). Never copy a hint into a record.
- **"Not found"** means the listed queries didn't turn anything up. It does not mean the page doesn't
  exist.

[BRIEF.md](../BRIEF.md) applies in full. Official pages only, quote the page's own words, 2027 dates
only when published, one wrong deadline fails the round.

## How the next session uses them

For each institution, in manifest order:

1. Skip it if `data/schools/<key>.json` already exists.
2. Read the country section first. It says whether there is a countrywide deadline (France's
   Parcoursup, Portugal's Concurso Nacional) or only regional or per-university ones (Spain, Italy),
   and which route an **EU/EEA** IB student actually takes. This matters most in **Portugal**, where
   "international student" pages are for non-EU applicants only.
3. Open each lead URL, types 1 to 5. Confirm it is the institution's page, for bachelor's, and for the
   2027 intake (or say "2026 criteria; 2027 not yet published").
4. Check each hint against the page. Keep what the page says, and drop the hint.
5. Where a type is marked "not found", search the site itself (its search box, the sitemap) before
   concluding it does not exist.
6. Write `data/schools/<key>.json` per BRIEF.md, validate it, and move on. Put anything learnt about a
   page that can't be fetched into the record's notes, as PARALLEL_WORK.md asks.

Scope calls flagged in the files (listed, catalogue or none) are guesses from search summaries. Decide
each one from the institution's own list.
