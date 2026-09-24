# France audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/fr.json`, `data/destinations/fr.json`, `data/evidence/fr.json`,
`data/application-routes/fr-direct-2027.json`, `data/application-routes/fr-parcoursup-2027.json` (checked, unchanged).
`npm run validate`: all records valid.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Public tuition 2026/27: licence €178 (reduced €118), master €255, doctorate €398, engineering €2,620; CVEC €105 | CONFIRMED | service-public.gouv.fr F36520 |
| Non-EU licence fee "€2,850 … 2026 decree reported about €2,902, not confirmed" | CORRECTED (€2,902 licence, €3,950 master, decree 2026-385 of 19 May 2026) | Université Lyon 1 |
| Parcoursup 2027 calendar | CONFIRMED not published (page still shows 2026: 19 Jan–12 March, 1 April, 2 June–11 July) | parcoursup.gouv.fr/calendrier, read in a browser |
| Parcoursup: up to 10 unranked wishes; EU citizens must use Parcoursup | CONFIRMED | service-public F23476 (unchanged record); ministry DAP page |
| EU citizens do not use the DAP "not verified" | CORRECTED (now verified) | ministry DAP 2026-2027 page |
| Sciences Po 2027 rounds 4 Nov 2026 / 13 Jan / 1 March 2027; interviews 8–18 Dec, 8–19 March, 13–23 April; €150 fee; no subject requirements | CONFIRMED | Sciences Po foreign secondary schools page |
| Sciences Po fees €0–14,900 (EEA, income-based), €14,900 flat non-EEA | CONFIRMED | Sciences Po tuition fees |
| École Polytechnique Bachelor rounds 20 Oct 2026 / 6 Jan / 8 Feb 2027 14:00; fee €105; tuition €15,900 EU / €19,200 non-EU | CONFIRMED (rounds and fee added to country deadlines) | polytechnique.edu |
| ESCP BSc €20,800 EU / €26,800 non-EU (2027 intake); €80 fee; IELTS 6.5 | CONFIRMED | escp.eu |
| ESSEC, EDHEC, emlyon fees "could not be verified" | CORRECTED | ESSEC, EDHEC, emlyon pages |
| Non-EU work 964 hours a year "not verified" | CORRECTED (verified) | service-public F2713 |
| Living cost null | CORRECTED (Campus France €600–800 a month) | Campus France FAQ |
| AUP tuition | UNVERIFIABLE (not shown on its pages to a fetcher) | — |
| French-language proof for French-taught licences | UNVERIFIABLE (varies; left as is) | — |
| Sciences Po €42,000 zero-fee threshold | UNVERIFIABLE (left, already flagged in the record) | — |
| EU residence, CAF, health (ameli), CROUS | UNVERIFIABLE this pass (not re-read) | — |

## Corrections

### 1. Non-EU public-university fees
- Old: "€2,850 a year for a licence and €3,879 for a master's according to etudiant.gouv. A 2026 decree was reported to raise the licence figure to about €2,902 for 2026/27, but this was not confirmed on an official page." Year "2024/25 … 2026/27 figure unverified".
- New: "€2,902 a year for a licence and €3,950 for a master's in 2026/27, set by decree no. 2026-385 of 19 May 2026; universities may exempt up to 30% of them." Year "2026/27".
- Source: https://www.univ-lyon1.fr/formation/inscription-et-scolarite/etudiantes-et-etudiants-internationaux-droits-dinscription-differencies-et-exonerations
- Quote: "Licence : 2 902 €" … "Master : 3 950 €"

### 2. DAP note
- Old: "EU citizens with a foreign diploma are not required to use the DAP 'dossier vert' procedure … this was not verified on an official page during research and should be confirmed."
- New: EU/EEA/Swiss citizens apply through Parcoursup like French students; the DAP is for other nationalities.
- Source: https://www.enseignementsup-recherche.gouv.fr/fr/dossier-vert-demande-d-admission-prealable-dap-pour-une-premiere-inscription-en-premiere-annee-de-46347
- Quote: "Les candidats ressortissants Suisse ou d'un pays de l'Union européenne … doivent se connecter à Parcoursup."

### 3. Non-EU work limit
- Old: "964 hours a year … but this figure was not verified on an official page during research."
- New: same figure, verified, with no separate work authorisation.
- Source: https://www.service-public.gouv.fr/particuliers/vosdroits/F2713?lang=en
- Quote: "The student can work a maximum of 964 hours per year (60% the annual legal working time)."

### 4. Living cost
- Old: `livingCostMonthly` null; "Living costs were not verified … deliberately left blank."
- New: about €600–800 a month (Campus France), Paris more.
- Source: https://www.campusfrance.org/en/faq/what-is-the-cost-of-life-in-france — "600 to 800 Euros". Campus France is a promotion agency, so the note says it is a guide, not a survey.

### 5. Business-school fees and deadlines
- ESSEC: old note "fees and deadlines could not be verified". New: Global BBA €15,900 year one, €18,900 years two to four (2026/27 intake), €5,500 deposit; English track at Cergy. 2027 deadlines not on page. Source: https://www.essec.edu/en/program/global-bba-international/
- EDHEC: old note "fees and deadlines could not be verified". New: Global Business track €23,900 a year, Business Management €15,900; first of five sessions 1 Oct–3 Nov 2026; fee €100. Source: https://www.edhec.edu/en/programmes/bba/admissions-and-tuition-fees/international-admissions — "Application deadline: from 1st October to 3rd November 2026". Added as a country deadline and a route milestone (`ms-fr-edhec-s1`).
- emlyon: old note "fees were not verified". New: Global BBA first-year entry €15,500 a year (2027 intake), French and English tracks. Source: https://em-lyon.com/en/student/bachelor/global-bba
- Application fee field now lists Polytechnique €105 and EDHEC €100 alongside Sciences Po and ESCP.

### 6. École Polytechnique rounds on the country page
- The rounds were on the route but missing from `countries/fr.json` deadlines. Added three entries (20 Oct 2026 23:59 CEST, 6 Jan 2027 23:59 CET, 8 Feb 2027 14:00 CET).
- Quote: "January 7, 2027 to February 8, 2027 at 2 PM (CET)"

### Evidence
- Re-read and bumped: `ev-fr-sciencespo-rounds-2027`, `ev-fr-polytechnique-rounds-2027`, `ev-fr-parcoursup-calendar-2026` (browser), `ev-fr-mesr-eu-parcoursup` (browser). Their `attestation` now names this pass; the earlier attester names on these four were overwritten.
- Added `ev-fr-edhec-sessions-2027`, `ev-fr-differentiated-fees-2026`, `ev-fr-service-public-student-work`.

## Institutions

All 24 links resolve (HTTP 200). EDHEC's pages refuse automated fetchers (403), but curl with a browser user agent gets 200. None removed.

| Institution | Check | Change |
|---|---|---|
| Sciences Po | Confirmed | none |
| École Polytechnique | English BSc, fees confirmed | none |
| ESCP | Confirmed; five campuses, three per student | none |
| ESSEC | English track confirmed | `englishBachelors` and note (fees) |
| EDHEC | Global Business track in English | `englishBachelors` and note (fees, first session) |
| emlyon | French and English tracks | `englishBachelors` and note (fee) |
| AUP | Link fine; tuition not readable | none |
| Sorbonne | Licences in French | none |
| Paris-Saclay | Search results say licences need French at B2–C1; the "international bachelor track in the sciences" could not be confirmed | none — UNVERIFIABLE |
| PSL | One fully English undergraduate programme (International BSc in AI); Sustainability Sciences reaches 100 % English by year 3 | `englishBachelors` made specific (was "partly in English") |
| UGA | English-track Bachelor in Management (IAE) and a distance International Bachelor in Economics exist | none |
| Unistra | Not re-checked beyond links | none |

## New institutions

None. The only French school in `IB_DISCOVERY.md` is Parsons Paris, with 162 transcripts, below the 300 threshold.

## Not verified

- AUP tuition, and deadlines at ESCP (rolling), ESSEC, emlyon and AUP.
- 2027 Parcoursup calendar. Not published; expected November or December 2026.
- French-language requirements for French-taught licences.
- CROUS grant eligibility for EU nationals, the Sciences Po zero-fee income threshold, and the residence and health text.
