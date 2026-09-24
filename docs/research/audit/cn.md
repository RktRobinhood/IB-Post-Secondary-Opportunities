# China (cn) audit: May 2027 IB session, autumn 2027 entry

Audit date: 2026-09-24. Files: `data/countries/cn.json`, `data/destinations/cn.json`,
`data/evidence/cn.json`, `data/application-routes/cn-common-app-2027.json`,
`cn-joint-direct-2027.json`, `cn-national-direct-2027.json`. No `cn-*` application systems or context notes exist.

**Main findings.** The destination record (written 2026-09-23) was sound; the country profile (2026-09-22) was
behind it. The profile never mentioned the **CSCA**, the national test every bachelor's applicant to a Chinese
university must sit from 2026/2027; it said minimum IB scores "could not be verified for any Chinese
institution" although XJTLU publishes 30 points; and it told readers there was "no data/evidence/cn.json".
All corrected. No tuition figure could be verified anywhere.

## Summary

| Fact | Verdict | Source |
|---|---|---|
| Duke Kunshan: ED 2 Nov 2026, RD 4 Jan 2027, 11:59pm ET; no application fee; test-optional; internationals must be non-Chinese citizens | CONFIRMED | admissions.dukekunshan.edu.cn/en/how-to-apply/ |
| Duke Kunshan RD acceptance 1 May 2027 | CONFIRMED (as recorded 2026-09-22; home page not re-read) | admissions.dukekunshan.edu.cn/en/ |
| NYU Shanghai: ED I 1 Nov, ED II 1 Jan, RD 5 Jan, 11:59 p.m. EST, no year printed (provisional) | CONFIRMED | shanghai.nyu.edu …/how-to-apply |
| NYU Shanghai application fee (was null) | **CORRECTED** (US$85, waivers available) | same |
| XJTLU: closes 31 May 2027 for most programmes | CONFIRMED; **added** as a profile deadline | xjtlu.edu.cn …/how-to-apply |
| XJTLU IB 30 points: "which entry year applies to the IB was not established" | **CORRECTED** (Year Two admits IB holders; Year Two needs 30 points, IELTS 6.5/TOEFL 90) | xjtlu.edu.cn …/ug/global/entry-requirements |
| Minimum IB scores "could not be verified for any Chinese institution" (profile) | **CORRECTED** | same |
| CSCA required of every bachelor's applicant to a Chinese university from 2026/2027; five sittings a year; csca.cn | CONFIRMED; **CORRECTED** in the profile (absent) | mn.china-embassy.gov.cn notice |
| CSCA for joint universities / English-taught programmes | UNVERIFIABLE (official notice silent; only agent sites claim an exemption) | — |
| BNBU periods 1 Sep–31 Dec and 10 Feb–15 May | CONFIRMED as printed, but the page refers to **2025 entry**; kept provisional, note added | ido.bnbu.edu.cn FAQ |
| CUHK-Shenzhen international window | **CORRECTED** (added: application system open September to April) | intladmissions.cuhk.edu.cn |
| Zhejiang 2026 window 1 Dec 2025–28 Feb 2026 | CONFIRMED as recorded (not re-read) | iczu.zju.edu.cn |
| campuschina.org does not resolve | CONFIRMED (still no response 2026-09-24) | — |
| Chinese Embassy in Denmark: no CGS notice | CONFIRMED (no scholarship link on the English or Chinese home page) | dk.china-embassy.gov.cn |
| Profile: "This Destination has no Evidence records at all" | **CORRECTED** (data/evidence/cn.json exists) | — |
| English proof "Not verified" | **CORRECTED** (XJTLU, NYU Shanghai, DKU rules) | XJTLU, NYU Shanghai, DKU pages |
| Tuition (any institution), living costs, CGS amounts | UNVERIFIABLE (no official page read carries a figure) | — |
| Work rights, X1/JW202/residence permit within 30 days | UNVERIFIABLE in this pass (left as written) | — |

## Corrections

### CSCA
- Old (profile): not mentioned; domestic admission "turns on Chinese language proficiency and, for some programmes, an entrance examination or interview".
- New: watch-out and IB note: from 2026/2027 every bachelor's applicant to a Chinese university sits the CSCA before applying; five sittings (January, March, April, June, December); registration at csca.cn.
- Source: https://mn.china-embassy.gov.cn/zytz/202510/t20251030_11743698.htm — "自2026/2027学年起，来华攻读学士学位的申请人须在提交申请前参加…" ("from 2026/2027, bachelor's applicants must sit … before applying").
- Evidence: `ev-cn-csca-embassy` attestation updated.

### XJTLU IB points and entry year
- Old (profile): "Minimum IB scores could not be verified for any Chinese institution." Evidence note: which entry year applies to the IB "was not established".
- New: IB holders are considered for Year Two, which asks for 30 points and IELTS 6.5 (5.5) or TOEFL iBT 90. Added the 31 May 2027 closing date to the profile deadlines.
- Source: https://www.xjtlu.edu.cn/en/admissions/ug/global/entry-requirements — "IB Diploma: 30 points"; Year Two for those who "have completed A-levels or International Baccalaureate".
- Evidence: `ev-cn-xjtlu-deadline` claim, supports and attestation updated.

### Application fees
- Old: `null`. New: DKU none; NYU Shanghai US$85; XJTLU RMB 10,000 deposit on acceptance.
- Sources: DKU — "There is no application fee"; NYU Shanghai how-to-apply — "$85.00"; XJTLU how-to-apply — "a non-refundable deposit of RMB 10,000".

### English proof
- Old: "The joint-venture universities apply their parent institution's requirements, where IB English is normally accepted. Domestic universities vary. Not verified."
- New: XJTLU Year Two IELTS 6.5/TOEFL 90; NYU Shanghai requires a test unless the last three years were in English-medium schooling; DKU encourages but does not require one; IB English substitution not established.
- Source: NYU Shanghai — "Results from English language testing are required for students whose native language is not English".

### Peking/Fudan/SJTU deadline entry and CGS entry (profile)
- Old: stated there was no `data/evidence/cn.json` and gave a long account of the campuschina.org failure.
- New: shortened; points to Zhejiang's 2026 window and the CSCA; campuschina.org re-checked (still unreachable).

### BNBU periods
- Old: "BNBU prints its periods without a year." New: adds that the page still refers to 2025 entry.
- Source: https://ido.bnbu.edu.cn/en/info/1006/1019.htm — references "2025-2026 International Student Application".

### Summary
- Profile summary shortened (two systems, CSCA). The destination summary was already short and true; kept.

## Institutions

All 14 websites resolve. Four timed out to a plain request (CUHK-Shenzhen, SYSU, UNNC, Wenzhou-Kean) but loaded for a fetcher.

| Institution | Check | Change |
|---|---|---|
| Tsinghua | applicant FAQ: teaching in Chinese, HSK 5 | englishBachelors ("Schwarzman-adjacent international programmes" is a master's; no English bachelor's found), note |
| Peking | resolves | none |
| Fudan | resolves | none (English MBBS not re-verified) |
| SJTU | resolves | none |
| NYU Shanghai | confirmed | none |
| Duke Kunshan | confirmed | none |
| XJTLU | confirmed | none |
| UNNC | "taught entirely in English" confirmed | none |
| CUHK-Shenzhen | international admissions on a separate site | admissionsUrl → https://intladmissions.cuhk.edu.cn/, note |
| BNBU (shortName "UIC Zhuhai", kept so the photo/statement keys do not break) | resolves | none |
| Wenzhou-Kean | resolves; English-medium implied ("100% of professional courses are introduced from the Kean University") | none |
| Zhejiang | resolves | none |
| Tongji | resolves | none |
| Sun Yat-sen | admissionsUrl pointed at the domestic admissions site | admissionsUrl → https://iso.sysu.edu.cn/en/application/selffunded/index.htm |

Removed: none.

## New institutions

None. `docs/research/IB_DISCOVERY.md` lists no Chinese institution with 150+ transcripts that is not already on the site.

## Not verified

- Any tuition figure; CGS amounts and the Danish Type A date; living costs; work rights; residence permit rules.
- Whether the joint universities require the CSCA.
- 2027 windows for Tsinghua, Peking, Fudan, SJTU, Zhejiang, Tongji, Sun Yat-sen, UNNC and Wenzhou-Kean.
