# Lithuania audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/lt.json`, `data/destinations/lt.json`, `data/evidence/lt.json`,
`data/application-routes/lt-direct-2027.json`, `data/application-routes/lt-lama-bpo-2027.json`.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| EU/EFTA citizens can apply for state-funded places via LAMA BPO; IB needs no conversion | CONFIRMED | https://lamabpo.lt/en/bachelors-studies/international-students/ |
| LAMA BPO 2026 dates (1 Jun–23 Jul 12:00; offers 30 Jul; contracts to 1 Aug; two August rounds); 2027 not published | CONFIRMED | https://lamabpo.lt/en/bachelors-studies/key-dates-and-deadlines/ |
| VU: English Medicine/Dentistry not state-funded | CONFIRMED | https://www.vu.lt/en/admissions/state-funded-bachelor-s-admission |
| VU: fee EUR 100, up to three programmes, EU can get state-funded places, 5-year rule for non-EU | CONFIRMED | https://www.vu.lt/en/admissions/admissions-to-bachelor-studies |
| VU 2027 deadline not published | CONFIRMED (still 2026 wording) | same |
| LSMU calendar (still the 2026 one; 2027 dates remain provisional roll-forwards) | CONFIRMED | https://lsmu.lt/en/admission/admission-process/ |
| LSMU IB HL 5 exemption; IELTS >5.5 / B1; TOEFL typo still on page | CONFIRMED | same |
| LSMU fees EUR 150 / 250 / 1,500 deposit | CONFIRMED | same |
| LSMU 2026/27 tuition (Medicine 12,800/13,300 etc.) | CONFIRMED | https://lsmu.lt/en/admission/tuition-fees/ |
| ISM rounds (still 2026: 30 Apr, 31 May, 24 Jul, 14 Aug with "2025" typo), diploma by 1 Aug, EUR 100 fee, IB = English proof | CONFIRMED | https://www.ism.lt/en/admission/ |
| Bachelor's tuition "from 1.300 EUR" | CONFIRMED (undated) | https://studyin.lt/how-to-apply/tuition-fees/ |
| "Most universities close in June"; recognition "up to one month or longer" | CONFIRMED | https://studyin.lt/how-to-apply/application-procedure/ |
| Profile summary: "apply directly to each university rather than through one portal" | CORRECTED (state-funded places go through LAMA BPO) | LAMA BPO page above |
| Living costs (was empty) | CORRECTED (filled from VMU) | https://www.vdu.lt/en/international-cooperation/for-students/practical-information-for-incoming-students/important-before-arrival/cost-of-living/ |
| Study in Lithuania quote about SKVC-certified diploma | UNVERIFIABLE | not on the studyin.lt application page any more; the entry-requirements URL 404s |
| SKVC processing time and fee | UNVERIFIABLE | skvc.lt returns HTTP 500 |
| Work rights, EU registration details, healthcare | UNVERIFIABLE (unchanged; were already marked not confirmed) | — |

## Corrections

### Profile summary and first watch-out
- Old: "You apply directly to each university rather than through one portal" / "No central admissions portal for international students".
- New: fee-paying places are applied for directly; state-funded places go through LAMA BPO, the joint admission system. This brings the older profile into line with `data/destinations/lt.json`, which already said so.
- Source: https://lamabpo.lt/en/bachelors-studies/international-students/ — state-funded places for "citizens of Lithuania, the European Union (EU), or European Free Trade Association (EFTA) countries".

### Living costs
- Old: `livingCostMonthly` null.
- New: EUR 300–1,000 a month in Kaunas (VMU estimate; rent 100–700, food 150–300); 70% of VMU international students in its 2025 survey spent EUR 300–700.
- Source: VMU cost-of-living page — budget "300-1000 EUR per month". One university's estimate, labelled as such.

### VMU note
- Added: autumn 2027 intake opens at the beginning of November 2026.
- Source: https://www.vdu.lt/en/studies/degree-studies/ — "Autumn intake for the academic year 2027-2028 will be opened in the beginning of November 2026."

### MRU note
- Old: "English-taught law programmes that are rare in continental Europe" (not supported by any page read).
- New: the autumn 2026 EU window (1 January–24 July) and the EUR 50 application fee.
- Source: https://www.mruni.eu/en/admission_procedure/ — "Online applications for the academic year 2026-2027 are open from January 1st, 2026".

## Institutions

| Institution | Website | Admissions URL | Note |
|---|---|---|---|
| Vilnius University | OK (drops trailing slash) | OK | confirmed |
| KTU | OK | OK | English count not stated on the admissions page; unchanged |
| LSMU | OK | OK | confirmed |
| ISM | OK | OK | confirmed |
| VMU | OK | OK | note updated |
| VILNIUS TECH | OK | OK | requirements page states a 60% CGPA minimum and IELTS 5.5; count not stated; unchanged |
| MRU | OK | OK | note corrected |
| Klaipeda University | OK | OK | unchanged, not re-read in depth |
| LCC | OK | OK (`lcc.lt/visit-lcc`) | seven BA programmes listed. Its real application site, admissions.lcc.lt, returns 403 or a TLS error to automated requests, so the working link was kept |
| VDA, LMTA | OK | OK | unchanged |
| Kaunas UAS | OK | OK | unchanged |

Nothing was removed.

## New institutions

None. IB_DISCOVERY.md lists no Lithuanian institution with 300+ IB transcripts.

## Not verified
- SKVC recognition fee and processing time (skvc.lt HTTP 500).
- The Study in Lithuania quote in `ibRecognition.notes` about an SKVC-certified diploma: the page it came from could not be found again. Left in place.
- 2027 dates at every Lithuanian institution: none has published them yet. LSMU and ISM remain 2026 calendars carried forward and marked provisional.
- How LAMA BPO builds a competitive score from IB grades.
