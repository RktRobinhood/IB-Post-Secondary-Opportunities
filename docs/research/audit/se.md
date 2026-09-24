# Sweden audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/se.json`, `data/destinations/se.json`,
`data/evidence/se.json`, `data/application-routes/se-uhr-2027.json`,
`data/application-systems/se-uhr.json`, `data/context-notes/se-*.json`.

The single most consequential finding: the published destination record (which wins over the profile),
the route and the context note `se-january-is-the-deadline` all told an IB student that the January round
is *the* application. University Admissions says the opposite for anyone who has not finished the Diploma.
The profile already had this right; the other three records now agree with it.

## Summary

| Fact | Verdict | Source |
| --- | --- | --- |
| Round 1: opens 16 Oct 2026, closes 15 Jan 2027, fee/exemption/documents 1 Feb, bachelor results 8 Apr | CONFIRMED | universityadmissions.se key dates |
| Round 2: opens 15 Mar, closes 15 Apr, fee exemption 23 Apr, documents 21 Jun, results 9 Jul, reply 16 Jul, second results 22 Jul 2027 | CONFIRMED | universityadmissions.se key dates |
| IB candidates without a completed Diploma: do not apply in round 1 | CONFIRMED (profile) / CORRECTED (destination, route, context note said January was the IB applicant's deadline) | universityadmissions.se IB studies |
| IB results in round 2: documents by 21 June "predicted grades" | CORRECTED: IB/EB students completing this spring have until 5 July 2027 | universityadmissions.se key dates |
| IB Result Service date "5 July for May 2026; check 2027" | CORRECTED: 2027 dates page gives 5 July (2027) | universityadmissions.se |
| Semester start 30 Aug 2027 (Stockholm University) | CONFIRMED | su.se |
| IB → merit value table (24 = 13.18 … 43–45 = 20.00) | CONFIRMED (all 20 rows) | antagning.se |
| Merit points max 2.5 | CONFIRMED | antagning.se |
| "IB students cannot raise merit value through komvux" | CORRECTED: total points rise only by IB retakes, but komvux courses are added when they complete a requirement or give merit points | antagning.se |
| Maths mapping AI SL→3c, AA SL→4, AI HL→5, AA HL→specialisering; sciences → level 2 | CONFIRMED | universityadmissions.se IB 2021+ |
| History SL/HL → Samhällskunskap 1b | CORRECTED: History → Historia 1b; the IB Diploma covers Samhällskunskap 1b | universityadmissions.se IB 2021+ |
| Grade 4 minimum, grade 3 for HL Bio/Chem/Phys | CONFIRMED | universityadmissions.se |
| English: IB English A / B HL / B SL in English = English 7; B SL otherwise = English 6 | CONFIRMED | universityadmissions.se |
| IELTS 6.5 (no band < 5.5); TOEFL 90/W20 (to 20 Jan 2026) or 4.5, no section < 4 (from 21 Jan 2026) | CONFIRMED | universityadmissions.se |
| Swedish 3 met by Swedish/Danish/Norwegian A | CONFIRMED | universityadmissions.se |
| No tuition or application fee for EU/EEA/Swiss; must document citizenship | CONFIRMED | universityadmissions.se |
| Application fee 900 SEK per semester | CONFIRMED | universityadmissions.se |
| Uppsala non-EU fee 49,500–90,000 SEK per semester | CONFIRMED | uu.se |
| Lund budget 8,900–12,500 SEK/month (page updated 9 Sep 2026) | CONFIRMED | lunduniversity.lu.se |
| Non-EU: 15 h/week work cap for permits granted from 11 June 2026; 10,656 SEK/month (2026); 1,500 SEK fee | CONFIRMED | migrationsverket.se |
| Nordic citizen staying ≥ 1 year registers with Skatteverket | CONFIRMED | skatteverket.se |
| Danish SU "we have not verified the current conditions" | CORRECTED: Nordic rule — SU as if in Denmark; prescribed length only from 2027 for starters after 1 July 2025 | su.dk |
| SSE: 31 IB minimum, 39+ usual, SAT 1300 / ACT 28 / ITB 112 | CONFIRMED; added that SSE admits on predicted grades by 15 Jan 2027 with its own second application | hhs.se |
| English-taught bachelor counts (Lund 10, KTH 1, JU 7) | CONFIRMED; nine null counts filled | institution pages |
| CSN eligibility, housing queues (SSSB days), healthcare | UNVERIFIABLE in this pass (not re-read) | — |

## Corrections

### Which round an IB candidate uses (destination, route, context note)
- Old (destination watchOut): "The first admissions round closes on 15 January 2027 with documents due 1 February, and that is the round carrying the English-taught programmes." Old (context note): "for anyone applying from outside Sweden to an English-taught bachelor, the first round is the application and the second is a remainder sale."
- New: the first round carries the most English-taught programmes, but a May 2027 IB candidate applies in the second round (15 March–15 April 2027); SSE is the exception. Route gains the second-round milestones (23 Apr, 21 Jun, 5 Jul, 9 Jul, 16 Jul); context note rewritten; new evidence `ev-ua-se-ib-studies`; `ev-ua-se-autumn-dates` interpretation corrected.
- Source: https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/ib-studies/ — "If you haven't yet completed your IB Diploma programme, do not apply to the first admissions round."

### IB documentation date in the second round
- Old: the 21 June deadline "is the one that suits an IB candidate … what you send by this date is your predicted grades".
- New: new profile deadline and route milestone on 5 July 2027; 21 June is for other documents.
- Source: https://www.universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/ — "IB/EB programme … you have until 5 July to submit documentation of your completed upper secondary studies."
- Flag: 5 July is the day before the site's IB results day (6 July 2027, `data/ib-calendar.json`) and coincides with its transcript-request cut-off. Worth asking University Admissions how a result released on the 6th is treated.

### History mapping
- Old: "History SL/HL maps to Samhallskunskap 1b".
- New: History → Historia 1b; Samhällskunskap 1b is met by the IB Exam itself.
- Source: https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/ib-studies/for-ib-diplomas-2021-and-later/ — table rows "Historia 1b … History, SL/HL" and "Samhällskunskap 1b … IB Exam".

### Komvux and merit value
- Old: "IB students cannot raise their merit value through Swedish komvux courses".
- New: IB total rises only through retakes; komvux/upper-secondary courses count when they complete a requirement or earn merit points.
- Source: https://www.antagning.se/sv/betyg-och-behorighet/international-baccalaureate/ib-examen-2021-och-framat/rakna-ut-ditt-meritvarde/ — "Du kan höja dina total points genom retakes. Kurser från … kommunal vuxenutbildning räknas med om de krävs för behörighet".

### Danish SU
- Old: "in many cases take Danish SU abroad … we have not verified the current conditions here."
- New: Nordic rule, as in the Finland audit.
- Source: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du få SU og lån, som hvis du læser i Danmark".

### Summaries
- Profile and destination summaries now say that a May 2027 candidate applies in the second round, closing 15 April 2027. Destination `meta.notes` no longer claims the merit-value table is missing (it is on the profile).

## Institutions

All 14 institutions' `website` and `admissionsUrl` resolve (checked 2026-09-24); no redirects needed updating.

Fixed (English-taught bachelor's filled or corrected, from each institution's own page):
- **Uppsala** — eight international bachelor's (Uppsala and Visby). uu.se: "We offer eight international Bachelor's programmes".
- **Stockholm University** — seven. su.se: "There are seven Bachelor's programmes offered in English".
- **Chalmers** — none: "All the bachelor's programmes are conducted in Swedish". Kept, not removed: its bachelor's are open to a Dane with Danish A (Swedish 3), which the profile presents as a real option, and removing it would also need `data/ib-statements.json` (`se-chalmers`), which is outside this audit. Coordinator's call.
- **Gothenburg** — ten international bachelor's (gu.se lists eleven names under that sentence).
- **SSE** — note now says it admits on predicted grades in January, with a second application on its own portal by 15 January 2027.
- **Jönköping** — seven named; JU Direct application opens 16 October 2026, rolling.
- **Linköping** — one ("We currently offer one international bachelor programme taught in English"); name not on the page.
- **Umeå** — four, "All programmes are taught entirely in English"; names not on the page.
- **Malmö** — six named. **Luleå** — four named. **SLU** — one, Forest and Landscape (Alnarp).
- **Karolinska Institutet** — one: Bachelor's Programme in Biomedicine, "Language of instruction: English". Note rewritten (it said the language could not be confirmed).

Checked, no change: Lund (ten, confirmed by name), KTH (one, ICT).

Removed: none.

## New institutions

None. No Swedish institution appears in `docs/research/IB_DISCOVERY.md`'s shortlist with 300+ IB transcripts.

## Not verified

- Names of Linköping's one and Umeå's four English bachelor's.
- CSN eligibility wording, housing-queue lengths, healthcare paragraph (not re-read).
- How University Admissions treats an IB result released on 6 July against its 5 July date.
