# Estonia audit (May 2027 IB session, autumn 2027 entry)

Audit date: 2026-09-24. Files: `data/countries/ee.json`, `data/destinations/ee.json`,
`data/evidence/ee.json`, `data/application-routes/ee-direct-2027.json`.

The University of Tartu, TalTech and the Estonian University of Life Sciences still answer every automated
request with a Cloudflare challenge (also in a browser session; not bypassed), and so does Harno, the recognition body.
Their facts rest on the national list and the earlier pass's browser reads.

## Summary

| Fact | Verdict | Source |
| --- | --- | --- |
| National list: "about 28 to 30" English-taught bachelor's at eleven institutions | CORRECTED: 27 entries at ten institutions (one with no 2026/27 intake) | studyinestonia.ee |
| TalTech Cyber Security Engineering and Integrated Engineering free for EU/EEA; non-EU 7,000 / 6,000 | CONFIRMED | studyinestonia.ee |
| Fees: Tartu BA 4,200, Sci & Tech 6,000, Medicine 13,200; TalTech IBA and Law 5,000; TLU 4,200–5,400; EBS 7,730–8,100; EAMT 1,750 EU / 7,700 non-EU; EMÜ Vet 9,800; Methodist Seminary 2,600; EUAS 7,120 / 7,520; TTK 6,200; Aviation 8,100 / 3,780 | CONFIRMED (list carries no year; kept as 2026/27) | studyinestonia.ee |
| Tallinn University: bachelor's 1 Nov 2026 – 1 Mar 2027 | CONFIRMED | tlu.ee |
| TLU: 60% of maximum secondary result; exams several times; enrolment threshold 65/100 | CONFIRMED | tlu.ee |
| TLU: IB graduation documents accepted as English proof; IELTS 6.0 (5.5 each) | CONFIRMED | tlu.ee |
| TLU application fee €100, up to two programmes | CONFIRMED | tlu.ee |
| DreamApply shared by nine institutions | CONFIRMED (EKA, EAMT, EBS, Tartu, TalTech, TLU, EMÜ, EUAS, Aviation Academy) | estonia.dreamapply.com |
| EUAS: four English bachelor's; 2026 EU deadline 20 Sep | CONFIRMED | euas.eu |
| EAMT: 2027 dates published in December 2026 | CONFIRMED (added to institution note) | eamt.ee |
| EKA: every bachelor's in Estonian, B2 Estonian required | CONFIRMED → institution removed | artun.ee |
| Tartu Applied Health Sciences University: no English bachelor's | CONFIRMED (admission page lists master's only) → institution removed | tartuh.ee |
| Health insurance: students not covered by Haigekassa unless employed/permanent residence; bring EHIC | CONFIRMED | studyinestonia.ee |
| Living costs €300–500/month; dorms €150–350; private €350–750; food ~€300 | CONFIRMED (the page still carries them; the 2019 survey caveat stays) | studyinestonia.ee |
| Danish SU "capped at four years rather than programme length plus twelve months" | CORRECTED: capped at four years (48 klip), no extra SU if delayed; the Nordic comparison was outdated | su.dk |
| IB recognition (full Diploma only; no conversion; no minimum) | UNVERIFIABLE: Harno blocks automated access (unchanged) | — |
| Tartu, TalTech, EMÜ deadlines, fees beyond the list, entrance tests | UNVERIFIABLE (Cloudflare) | — |
| Residence registration within 3 months; ID card within 1 month | UNVERIFIABLE in this pass (police site blocks; not re-read) | — |
| Scholarships, Tartu waiver changes, work rules | UNVERIFIABLE in this pass (not re-read) | — |

## Corrections

### Size of the English-taught bachelor's list
- Old: "The official national listing contains only about 28 to 30 English-taught bachelor's degrees"; destination "about thirty … at eleven institutions".
- New: 27 on the list at ten institutions, one (Commercial Aviation Management) with no 2026/27 intake. Profile summary, watch-out, steps and language; destination summary, language and sector summary; `ev-ee-sie-bachelors-list` claim.
- Source: https://www.studyinestonia.ee/study/programmes/bachelors-programmes — "Overview of all Bachelor's programmes taught in English by Estonian universities" (counted row by row; e.g. "Commercial Aviation Management (no intake for 2026/2027)").

### Danish SU
- Old: "capped at four years rather than programme length plus twelve months".
- New: "capped at four years (48 SU-klip), with no extra SU if you are delayed".
- Source: https://www.su.dk/su-i-udlandet/su-til-en-hel-uddannelse-i-udlandet-/hvad-kan-du-faa — "kan du maksimalt få SU i fire år (48 klip)"; "du kan normalt ikke få ekstra SU, hvis du bliver forsinket".

## Institutions

All remaining links resolve, except the three Cloudflare-protected sites (ut.ee, taltech.ee, emu.ee), which return 403 to scripts and were read in a browser by the earlier pass; their URLs were not changed. EBS redirects ebs.ee → www.ebs.ee (cosmetic, not changed).

Removed:
- **Estonian Academy of Arts (EKA)** — does not admit undergraduates in English: "all our bachelor's degree programmes are taught in Estonian language and the level of language skills needs to be at least B2" (https://www.artun.ee/en/admissions/bachelor/). The profile's watch-out about it stays.
- **Tartu Applied Health Sciences University** — no English-taught bachelor's; its admission page lists only master's programmes (https://www.tartuh.ee/en/admission/), and it is not on the national list. The earlier pass had kept it "so its absence is a finding"; the destination's language note still records that finding.
- Neither had an IB statement. `data/images.json` still has `ee-eka`, `ee-tartu-ahsu` and `ee-tartu-applied-health-sciences-university` — central cleanup.

Fixed: **EAMT** — note now says its 2027 dates come in December 2026.

Checked, no change: Tallinn University, EBS, EUAS, Tallinn Health University of Applied Sciences (Assistant Pharmacist on the national list), Baltic Methodist Theological Seminary (on the national list; its own page still does not state the language), Estonian Aviation Academy, University of Tartu, TalTech, EMÜ (programme lists and fees confirmed via the national list only).

## New institutions

None. No Estonian institution appears in `docs/research/IB_DISCOVERY.md` with 300+ IB transcripts.

## Not verified

- Anything on ut.ee, taltech.ee, emu.ee and harno.ee (IB rules, deadlines, entrance tests, free-place conditions).
- Residence registration and ID-card steps, scholarships, work rules.
