# Greece audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/gr.json`, `data/destinations/gr.json`, `data/evidence/gr.json`,
`data/application-routes/gr-minedu-foreign-2027.json`, `gr-public-english-2027.json`, `gr-private-direct-2027.json`.
No application-system or context-note files.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| "Only a handful" of English-taught public bachelor's; NKUA "the only one with a real English-taught undergraduate offering" | **CORRECTED**: 20 English-taught bachelor's at ten public universities listed in September 2026 | https://apply.studyingreece.edu.gr/en/programmes?prog_type=Bachelor&page=1&language=English |
| AUTh "none confirmed" English bachelor's | **CORRECTED**: seven (Clean Energy, Materials Science, Environmental Sciences, Sustainable Agriculture, LL.B., Sport and Exercise Sciences, Medicine) | same; https://cese.auth.gr/admissions |
| AUEB "none confirmed" | **CORRECTED**: International Business and Technology, entirely in English, €6,000 | https://ibt.aueb.gr/faq/ |
| Crete, Patras, Aegean "none confirmed" | **CORRECTED**: Crete Medicine €15,000; Patras Medicine €12,000; Aegean Eastern Mediterranean Studies (Rhodes) €4,500 | @SiG listing |
| English-taught fee range €6,000–€17,000 | CORRECTED to €4,500–€17,000 | @SiG listing |
| Athens MD €17,000 for 2026-27, EU and non-EU | CONFIRMED | https://medicen.uoa.gr/tuition-fees/ |
| Athens MD: 36 IB points incl. three HL; diploma "July 2025 or earlier" contradiction | CONFIRMED (contradiction still on the page) | https://medicen.uoa.gr/admission-requirements/ |
| Athens BA Ancient Greece €6,000; deadline "1 August" for 2026-2027 only | CONFIRMED (no 2027-28 date) | https://baag.uoa.gr/admission-fees/ |
| Ministry foreign-nationals window 2–9 July 2026, courier 10 July; 2027 not announced | CONFIRMED (not re-read; nothing for 2027 is due before June 2027) | existing evidence |
| Living costs, work rights, housing, Greek-taught fees for EU, DOATAP step | UNVERIFIABLE (unchanged) | — |

## Corrections

### The English-taught offer (tagline, summary, whyConsider, language, costs, destination)
- Old country tagline "Public universities teach in Greek; the English routes are few and paid"; destination tagline "A few English-taught programmes…"; "There are only a handful of them … between EUR 6,000 and EUR 17,000 a year".
- New: "Mostly taught in Greek, with a growing set of paid English-taught degrees" / "About twenty English-taught degrees, and a Greek-taught route that needs B2 Greek"; about twenty programmes at €4,500–€17,000.
- Source: Study in Greece @SiG, filters Bachelor's + English, two pages read in a browser. Example card: "Clean Energy Science and Engineering | Aristotle University of Thessaloniki | … | English | … | 8,000€ per year". Evidence `ev-gr-sig-english-bachelors` (sourceClass promotion-agency; its interpretation lists all 20 programmes and fees). The unverified "since a 2022 law change" was dropped from the summary.

### AUTh
- Old englishBachelors "None confirmed. AUTh lists 41 undergraduate programmes but no English-taught bachelor was identified". New: seven English-taught programmes; note gives €6,000–€8,000 (Medicine €12,000) and the rolling application.
- Source: https://cese.auth.gr/admissions — "September 2027 entry · 40 places · applications open"; "Applications are submitted year-round and evaluated in order of receipt". Added to the `gr-public-english-2027` route note. Evidence `ev-gr-auth-cese-admissions-2027`.

### AUEB
- Old englishBachelors "None confirmed"; admissionsUrl the home page. New: International Business and Technology; admissionsUrl `https://ibt.aueb.gr/apply-now/`.
- Source: https://ibt.aueb.gr/faq/ — "Since iBT is taught entirely in English"; apply page: "Applications are now open."

### University of Crete, University of Patras, University of the Aegean
- Old "None confirmed on the pages read". New: Crete — International Program in Medicine, €15,000; Patras — Medical Degree, €12,000; Aegean — Eastern Mediterranean Studies (Rhodes), €4,500. Source: @SiG listing only (programme pages render their details by script).

### NKUA note
- Old: "the only one with a real English-taught undergraduate offering". New: names its three programmes and fees without the exclusivity claim.

### URLs
- University of Piraeus: `https://www.unipi.gr/unipi/en/` now 301-redirects to a Greek 2025 internship announcement. New website/admissionsUrl `https://www.unipi.gr/en/home/`.
- University of Ioannina: `https://www.uoi.gr/en/` fails TLS (certificate covers `uoi.gr` only). New `https://uoi.gr/en/`.

## Institutions

| Institution | Website | Admissions URL | English bachelor's |
|---|---|---|---|
| NKUA | OK | OK | CONFIRMED (3), note CORRECTED |
| AUTh | OK | OK | CORRECTED (7) |
| UoC | OK | OK (home page) | CORRECTED (Medicine) |
| NTUA | OK | OK (home page) | None on @SiG |
| AUEB | OK | FIXED | CORRECTED (1) |
| IHU | OK | OK | None on @SiG (master's only) |
| Aegean | OK | OK (home page) | CORRECTED (1) |
| UPatras | OK | OK (home page) | CORRECTED (Medicine) |
| UOI | FIXED | FIXED | None on @SiG |
| ACG / Deree | OK | OK | All English (private); not re-read |
| ASFA | OK | OK | None |
| UNIPI | FIXED | FIXED | None on @SiG |

**Not removed, flagged for a decision:** NTUA, IHU, UOI, ASFA and UNIPI teach no bachelor's in English (none on the @SiG listing). They were never English-taught, so "no longer admits in English" does not strictly apply, and the Greece page deliberately covers the ministry's Greek-taught route (B2 Greek). If the site should list only institutions with an English-taught bachelor's, remove these five centrally (only `gr-acg-deree` has an IB statement, so `data/ib-statements.json` is unaffected; check `data/images.json` and `data/places/`).

## New institutions

None from docs/research/IB_DISCOVERY.md (no Greek institution with 300+ IB transcripts). For the record, public universities with English-taught bachelor's not on the site: University of West Attica (AI and Data Science; Applied Philosophy in Business), University of Macedonia (Accounting and Finance), University of Western Macedonia (Economics and Sustainable Development; Creative Writing, online), University of Thessaly (Medicine).
