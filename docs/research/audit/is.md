# Iceland audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/is.json`, `data/destinations/is.json`,
`data/evidence/is.json`, `data/application-routes/is-direct-2027.json`.

## Summary

| Fact | Verdict | Source |
| --- | --- | --- |
| HÍ international deadline 1 February; documents by 1 February; opens "around mid December" | CONFIRMED | english.hi.is application-deadline |
| HÍ 5 June undergraduate deadline: deadline page says "Icelandic and Nordic citizens", FAQ says international students living in Iceland | CONFIRMED — contradiction still live on 24 Sep 2026; entry kept undated | english.hi.is, FAQ |
| International Studies in Education BA: 180 ECTS, "all teaching is in English" | CONFIRMED | english.hi.is |
| "Exactly one" English-taught bachelor's in Iceland | CORRECTED: LHÍ describes its BA Contemporary Dance Practices as run completely in English | lhi.is incoming exchange |
| Seven universities; Hólar listed separately | CORRECTED: Hólar is now Háskóli Íslands á Hólum inside HÍ's university complex; holar.is redirects to hi.is | hi.is |
| Registration fee ISK 100,000 (75,000 spring); pay by 4 July or considered withdrawn | CONFIRMED | english.hi.is university-fees |
| HÍ non-EEA tuition from autumn 2027, amount TBD | CONFIRMED ("Tuition fee pr. ECTS — TBD") | english.hi.is |
| Non-EEA processing fee ISK 20,000 at HÍ | CONFIRMED | english.hi.is |
| LHÍ: registration fee ISK 100,000 for EEA; non-EEA tuition from autumn 2026 | CONFIRMED | lhi.is tuition-and-fees |
| RU EU/EEA autumn: opens 5 Feb, closes 30 Apr | CONFIRMED | ru.is |
| RU tuition ISK 656,000 (EEA) / 1,794,000 (non-EEA) | UNVERIFIABLE in this pass: amounts are in PDFs linked from ru.is, not read | ru.is |
| Akureyri: EU/EEA March to 5 June; non-EEA 1 Mar (Polar Law) / 1 Apr | CONFIRMED | unak.is |
| Bifröst–Akureyri merger | Abandoned (Oct 2025) per news reports (RÚV, Vísir), not an official page — both separate; moot, as both are removed for teaching no English bachelor's | ruv.is |
| Institutions with no English-taught bachelor's (RU, Akureyri, Bifröst, Agricultural University) | REMOVED from `institutions` | see Institutions |
| Danish SU: "full programme length plus up to twelve extra months" | CORRECTED: as if in Denmark; prescribed length only from 2027 for starters after 1 July 2025 | su.dk |
| Nordic students need only home-insurance confirmation | CONFIRMED | study.iceland.is |
| Nordic domicile registration: required if staying 6+ months | CONFIRMED (6-month split shown); "entitled at 3 months" not visible on the page | skra.is |
| Menntasjóður rules (Nordic citizens eligible, no SU at the same time, 22 ECTS, deadlines) | UNVERIFIABLE: menntasjodur.is returned an empty page to automated reading | menntasjodur.is |
| Living costs ISK 184,000 floor; housing prices; exchange rate | UNVERIFIABLE in this pass (not re-read) | — |

## Corrections

### A second English-taught bachelor's
- Old (summary): "there is exactly one bachelor's degree that is verifiably taught entirely in English". Tagline: "One English bachelor's degree in the whole country". LHÍ `englishBachelors`: null, "whether any is taught in English is unknown".
- New: two described as English-taught; tagline "Barely any bachelor's degrees in English"; LHÍ entry names Contemporary Dance Practices. Caveat kept: the statement is on LHÍ's exchange page, not a degree-admissions page.
- Source: https://www.lhi.is/en/althjoda-cooperation/incoming-exchange/ — "BA Contemporary Dance (… program [run] completely in English)"; "most BAlevel programs at LHÍ are done in Icelandic".

### Hólar merged into the University of Iceland
- Old: Hólar listed as a separate institution; destination "seven higher education institutions … four public and three private".
- New: Hólar removed from `institutions`; destination tagline, summary, whyConsider and sector landscape say six universities (three public, three private); route label `ms-others` no longer names Hólar; new evidence `ev-is-holar-in-hi`; Eurydice record's interpretation notes its count predates the merger.
- Source: https://hi.is/haskolinn/haskolasamstaeda/haskoli-islands-holum — page titled "Háskóli Íslands á Hólum" under "Háskólasamstæða"; https://holar.is/ redirects there.
- Not read on an official legal page: althingi.is refused automated access, so the law's commencement date is unconfirmed (press reports give 1 July; one says 2025, another 2026).

### Danish SU
- Old: "SU covers the prescribed programme length plus up to twelve extra months".
- New: SU as if in Denmark; prescribed length only for starters after 1 July 2025 (from 2027).
- Source: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du få SU og lån, som hvis du læser i Danmark".

### Fee wording
- "No tuition at six of the seven universities" → "five of the six" (Reykjavik University the exception), following the Hólar merger.

## Institutions

All remaining links resolve (checked 2026-09-24). LbhÍ's site is a JavaScript app with no server-rendered title, but returns 200 at the right address.

- **Removed: Hólar University** — merged into the University of Iceland's university complex as Háskóli Íslands á Hólum; no separate website (holar.is → hi.is). It had no IB statement. `data/official-images.json` still has an `is-holar` entry, which is outside this audit — remove it centrally.
- **Fixed: Iceland University of the Arts (LHÍ)** — English BA identified; note rewritten.
- **Removed: Reykjavik University, University of Akureyri, Bifröst University, Agricultural University of Iceland** — none admits undergraduates to a degree taught in English, and each requires Icelandic, so none is open to this site's reader at bachelor level:
  - RU: programme filter "undergraduate + English" returns nothing; programme pages say "Taught in Icelandic. Proficiency in Icelandic is a requirement" (earlier pass; RU's undergraduate page, re-found 24 Sep 2026, says its Computer Science undergraduate degrees are taught in Icelandic only).
  - Akureyri: Study in Iceland names Polar Law (a master's) as its only full-time English programme.
  - Bifröst: "the primary language of instruction is Icelandic"; Icelandic B2.2/C1.2 required.
  - Agricultural University: "language of instruction is Icelandic".
  They keep their mention in the profile's watch-outs, fees and language notes, which still tell a student why they are not options. None had an IB statement. `data/images.json` (`is-ru`, `is-unak`, `is-bifrost`) and `data/official-images.json` (`is-ru`, `is-unak`, `is-holar`) still carry entries for them — central cleanup. The page now lists two institutions, the University of Iceland and the Iceland University of the Arts.
- Checked, no change: University of Iceland.

## New institutions

None. No Icelandic institution appears in `docs/research/IB_DISCOVERY.md` with 300+ IB transcripts.

## Not verified

- RU tuition amounts (PDF), Menntasjóður rules, living-cost figures, housing dates.
- The legal date of the Hólar merger.
