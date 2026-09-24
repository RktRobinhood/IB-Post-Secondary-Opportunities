# Australia (au) audit: May 2027 IB session, autumn 2027 entry (July 2027 or February 2028 start)

Audit date: 2026-09-24. Files: `data/countries/au.json`, `data/destinations/au.json`,
`data/evidence/au.json`, `data/application-routes/au-*.json`, `data/application-systems/au-uac.json`
(no Australian context notes exist). The Home Affairs pages refuse plain requests and were read in a
browser. The University of Tasmania, QUT and Macquarie sites are behind a Cloudflare bot check and could
not be read.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| UAC conversion "for offers made from August 2026": 24 = 64.60, 30 = 79.30, 35 = 90.75, 40 = 96.85, 45 = 99.95; IBAS 24.00 = 64.40 | CONFIRMED | uac.edu.au/future-applicants/admission-criteria/ib-applicants |
| UAC accepts an IB Diploma with no location condition | CONFIRMED | uac.edu.au/future-applicants/international-year-12-students |
| UAC charge AUD 82 early-bird / AUD 215 (2026-27 cycle; saving AUD 133 by 30 Sep 2026) | CONFIRMED | same page ("save $133") |
| VTAC: only international Australian Year 12 students | CONFIRMED | vtac.edu.au/guides/quickstart/international |
| SATAC: IB Diploma "(in Australia only)"; others apply directly | CONFIRMED | satac.edu.au/international-applicants |
| TISC citizenship rule; QTAC unresolved | not re-read (unchanged, still flagged) | — |
| Student visa 500: from AUD 2,500; living costs AUD 29,710; parental income AUD 87,856; travel AUD 2,000 from outside Australia; 48 hours a fortnight; Direction 115 from 14 Nov 2025; stay up to 6 years | CONFIRMED | immi.homeaffairs.gov.au student-500 (browser) |
| Temporary Graduate 485, Post-Higher Education Work: usually 2-3 years; 35 or under; Student visa within 6 months | CONFIRMED | immi.homeaffairs.gov.au temporary-graduate-485 (browser) |
| UNSW 2026 international rates per UOC (Arts 985, Design 1,000, Architecture 1,090, Accounting/Actuarial 1,180), 48 UOC a year | CONFIRMED (2026 only; no 2027 or 2028 rates published) | unsw.edu.au international fees |
| University of Adelaide listed as a current institution | **CORRECTED** (merged into Adelaide University, which opened January 2026) | adelaide.edu.au news, 5 Jan 2026 |
| Monash "campuses in Malaysia and Italy you can transfer between" | **CORRECTED** (a campus in Malaysia and a study centre in Prato, Italy) | monash.edu locations (search index) |
| "Typical" tuition AUD 47,000-57,000 at a research university | UNVERIFIABLE beyond UNSW (left as the UNSW-derived range it already states) | — |
| Application fees "no fee or AUD 100-150" | UNVERIFIABLE per institution (already flagged in the record) | — |
| English thresholds | UNVERIFIABLE per institution (already flagged) | — |
| ANU 2027/2028 semester dates | not re-read | — |

## Corrections

### University of Adelaide becomes Adelaide University
- Old: "University of Adelaide", founded 1874, www.adelaide.edu.au, note on the Group of Eight and affordability.
- New: "Adelaide University", founded 2026, https://adelaide.edu.au/, admissions https://adelaide.edu.au/study/international-students/. The note now says it opened in January 2026, replacing the University of Adelaide and UniSA. `shortName` "Adelaide", `place` and `jurisdiction` kept, so existing image keys still match. The `au-sa-nt` jurisdiction summary names it. Evidence: new `ev-adelaide-university-2026`.
- Why kept rather than removed: the institution a student would apply to still exists under a new name at the same address. The University of Adelaide takes no new students. www.adelaide.edu.au redirects to adelaide.edu.au, which presents "Adelaide University ... seven campuses".
- Source: https://adelaide.edu.au/about/news/2026/a-bold-new-future-for-australian-higher-education-begins-today/ — "Adelaide University officially opens its doors"; "its foundation institutions, the University of South Australia and the University of Adelaide".
- Check: `data/images.json` still has the `au-adelaide` photograph from the old University of Adelaide campus. Adelaide University's city campus is the same site, but the photo credit and caption should be reviewed centrally.

### Monash note
- Old: "it also has campuses in Malaysia and Italy you can transfer between."
- New: "it also has a campus in Malaysia and a study centre in Prato, Italy."
- Source: monash.edu "International locations" (search index; monash.edu refuses plain requests). The page lists "four campuses in Australia, one in Malaysia, and affiliated institutes in China, India and Italy".

## Institutions

Checked (14): Melbourne, Sydney, ANU, UQ, Monash, UNSW, UWA, Adelaide, UTS, RMIT, QUT, UOW, Macquarie, Deakin. All teach bachelor's degrees in English.

- URLs: all resolve. Melbourne, Monash and Deakin return 403 to scripts but load in a browser. QUT and Macquarie show a Cloudflare check that was not bypassed; their URLs are unchanged.
- Fixed: Adelaide (replaced by its successor), Monash note.
- Removed: the University of Adelaide as an entity (merged; see above).

## New institutions

From `IB_DISCOVERY.md`, Australia, 300+ transcripts (three qualify):

| Institution | Transcripts | Jurisdiction | Checked on site | Source |
|---|---|---|---|---|
| University of Tasmania (Hobart) | 6,313 | **au-tas (new)**, direct route | **Site behind Cloudflare.** Verified only through utas.edu.au pages in a search index, which say a completed IB Diploma meets its general entry requirements and it can collect results from the IB. Note that `IB_DISCOVERY.md` says the count almost certainly reflects Australian IB candidates. | utas.edu.au/study/apply/admission-requirements/international-baccalaureate |
| Griffith University (Brisbane, Gold Coast) | 392 | au-qld | "more than 200 degrees" for international students; IB Diploma converted to a Combined Rank | griffith.edu.au/international; /apply/undergraduate-study/international-baccalaureate-diploma (browser) |
| Curtin University (Perth) | 302 | au-wa | full IB Diploma, 24 points minimum in six subjects; indicative 31-39 for competitive courses; internationals apply directly | curtin.edu.au/study/applying/ib-diploma/; /study/international-students/ |

Structural change: jurisdiction `au-tas` added to `data/destinations/au.json` on `au-direct-2027`. Whether Tasmania has a shared admissions route open to an offshore IB candidate was **not** established, and the record says so. `node scripts/test-floor.mjs` reports Australia meets the floor.
