# Batch be: Belgium school records (#43)

Researcher run started 2026-09-26. One line per point. WebFetch/WebSearch only (no browser), so hand-off counts are from fetched page text.

## be-ku-leuven (listed, 7 programmes)
- Scope: listed. KU Leuven's "Choose your programme" page says "Are you interested in one of our 7 bachelor's programmes taught in English?"; the seven found: Business Administration, Business Engineering (both Brussels), Engineering Technology, European Studies (joint BAES), Philosophy, Theology and Religious Studies, Joint Bachelor in Sustainability (BASUS).
- Hand-off: programme search filtered to English + Academic Bachelor's; it is a JS app, so the result count could not be read by fetch (the choose-your-programme page gives 7). Needs a browser check.
- Excluded: "Bachelor of Laws (Brussels et al)" appears in the application-window tool but is not in the English-taught list (trilingual/Dutch law); abridged Philosophy/TRS programmes (not for school-leavers).
- Contradicts data/countries/be.json englishBachelors ("Business Administration, Business Engineering, European Studies, Philosophy and Theology and Religious Studies"): it misses Engineering Technology and the Joint Bachelor in Sustainability.
- Dates: none recorded. The application-window tool's embedded data covers only 2024-25, 2025-26 and 2026-27 (checked in the page source 2026-09-26); 2026-27 EEA deadlines were 1 July (BA, BE), 1 June (Eng Tech, Philosophy, TRS), 1 April (BAES). The BAES apply page says the 2027-28 window "opens in fall 2026".
- Could not verify: BASUS 2027 intake (basus.info shows 2026/27 only; year 1 at Jagiellonian University, Kraków); Engineering Technology positioning-test date ("beginning of July", no day).
- IB/English: IB exempts from English test "if at least half of their courses are taught in the English language" (BA, BE, Eng Tech); Philosophy exempts only UK/US/etc. degrees; BAES requires a test from all ("All applicants must prove their English language proficiency").
