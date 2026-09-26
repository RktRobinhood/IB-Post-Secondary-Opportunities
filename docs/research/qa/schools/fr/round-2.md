# France school records (#43): admissions counsellor, round 2

**Score: 8/10. Accepted.** Every round-1 fix holds against the live pages; a fresh sample of 8 facts (5 of them deadlines or interview dates) found no wrong date, fee or rule. Checked 26 Sep 2026 in the owner's Chrome.

## Round-1 fixes checked

| Fix | Verdict |
|---|---|
| Eight dual-degree URLs under `/admissions/en/undergraduate/dual-bachelor-degrees/` load and name the right partner; Columbia, NUS, UBC, Berkeley, Sydney "must apply through" the partner | OK |
| Final round and Keio, HKU, ESCP duals, ESCP PEM on 2027-02-28 ("must submit their applications before 1 March 2027") | OK |
| ESSEC €15,400 + €2,000 a year, EU citizens, 2026 intake | OK |
| PSL I-BE³: 100% English, B2 English and A2 French, sessions to 11 Nov / 10 Jan / 15 Mar, €15,000 for EU students | OK |
| ESCP six campuses; MST Paris, Turin, London from September 2027 | OK |
| Narration removed; ESCP `ib` text | OK |

## Fresh sample

ESSEC interview windows and results (4 rounds); EDHEC interviews and results (5 rounds), €100 fee, €5,000 deposit; AUP rounds, €38,080 tuition, IB scholarship bands; emlyon €15,500 and the data science BSc window; ESCP €20,800, €80 fee, €3,500 deposit, IELTS 6.5; Polytechnique €105 fee, €15,900, Maths HL plus a science HL; PSL AI €0–14,900; Sciences Po €150 fee. All OK.

## Small fixes (applied by the coordinator before shipping)

1. `data/countries/fr.json` steps: "…13 January 2027 and 28 February 2027 (apply before 1 March)".
2. ESSEC one-off €2,653 service fee added to `fr-essec.json` and the fr.json note.
3. `fr-emlyon.json` note: Global BBA 2027 sessions unpublished; the data science BSc takes applications November 2026 to July 2027.

Left open: EDHEC King's BSc "£40,900 (yrs 1–2)" does not say a year or in total (not verified); `reports/batch-fr.md` has no Paris-Saclay evidence section. The Sciences Po main page also says the dual deadline "is set on 1 March 2027"; 28 February is the safe reading of both wordings.
