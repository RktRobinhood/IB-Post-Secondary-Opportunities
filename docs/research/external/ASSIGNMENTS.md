# Institution research assignments

Local data audit dated 2026-10-19. Use [RESEARCH_SPEC.md](RESEARCH_SPEC.md) with one assignment line below.

Copy the whole line inside a code block and attach or paste the spec. Each line requests one JSON file. Work in order: missing records, partial records, then descriptions. The line is JSON so names, punctuation and URLs survive copying.

The audit covers **603 distinct institutions**: 588 country-profile entries plus 20 canonical institutions, with 5 overlapping Dutch entries counted once. There are **167 full research tasks**, **41 partial tasks**, and **224 description-only tasks** (432 files in total).

Starting links and existing summaries are leads from local files, not freshly validated facts. A missing record can still have useful country-level research. Confirm the campus, awarding institution, first-year access and teaching language before listing programmes.

## What the gap labels mean

- `full`: establish scope and collect the complete institution research package.
- `flagships`: fewer than two researched flagships; normally reach two to four, or document why fewer fit.
- `faculties`: no first-year faculty guidance is recorded; a college with no faculty structure can document that.
- `ib-diploma`: the institution IB summary or page section is missing. Research general entry plus material programme exceptions.
- `sources`: the institution source section is missing.
- `programme-list` or `programme-detail`: research the list, or the targeted programmes’ description and selection rules.
- `overviews`: write a sourced paragraph only for the named `targets`; preserve exact names, credentials and campuses.

## Audit boundaries

This is a structural research queue, not a certification that other records are complete or current. Existing dates, subjects, fees and programme-list exhaustiveness still need verification when used. An absent points threshold, subject rule, cut-off, fee or local deadline does not automatically mean missing research: it may be unpublished, inapplicable or supplied by an application route. Those absences alone do not create tasks.

53 researched scope-none institutions are excluded from automatic repeat work. Photos, country-guide expansion and live-data integration are separate work. Canonical records are checked for explicit missing IB sections; their richer programme format is not judged using the school-record overview field.

**29 programme descriptions already exist in local result files but are absent from records.** They are held for local review/integration and omitted from external targets; their presence does not mean they have passed review. The machine audit lists them in audit.json.

Regenerate after research is reviewed or integrated: `node scripts/build-external-research-queue.mjs YYYY-MM-DD`. Returned packs are not automatically subtracted: collection is not acceptance. Mark your own progress beside the relevant entry or keep a list of completed filenames.

## Priority 1 Missing institution records

### Armenia

**American University of Armenia** — `am-american-university-of-armenia`; full.

```json
{"priority":1,"country":"Armenia","institution_key":"am-american-university-of-armenia","name":"American University of Armenia","country_code":"am","website":"http://aua.am/","admissions_url":"https://policies.aua.am/ArcPolicy/130","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Yerevan"},"targets":[]}
```

### Azerbaijan

**ADA University** — `az-ada-university`; full.

```json
{"priority":1,"country":"Azerbaijan","institution_key":"az-ada-university","name":"ADA University","country_code":"az","website":"https://www.ada.edu.az/","admissions_url":"https://www.ada.edu.az/en/admission/financial-aid","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Baku"},"targets":[]}
```

### Bahrain

**Euro University of Bahrain** — `bh-euro-university-of-bahrain`; full.

```json
{"priority":1,"country":"Bahrain","institution_key":"bh-euro-university-of-bahrain","name":"Euro University of Bahrain","country_code":"bh","website":"https://eub.edu.bh/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Manama"},"targets":[]}
```

**RCSI - Bahrain** — `bh-rcsi-bahrain`; full.

```json
{"priority":1,"country":"Bahrain","institution_key":"bh-rcsi-bahrain","name":"RCSI - Bahrain","country_code":"bh","website":"https://www.rcsi.com/bahrain","admissions_url":"https://www.rcsi.com/bahrain/undergraduate/application-information/scholarships","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Muharraq"},"targets":[]}
```

### Barbados

**University of the West Indies - Cave Hill** — `bb-university-of-the-west-indies-cave-hill`; full.

```json
{"priority":1,"country":"Barbados","institution_key":"bb-university-of-the-west-indies-cave-hill","name":"University of the West Indies - Cave Hill","country_code":"bb","website":"http://www.cavehill.uwi.edu/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bridgetown"},"targets":[]}
```

### Brazil

**American Academy - Brazil** — `br-american-academy-brazil`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-american-academy-brazil","name":"American Academy - Brazil","country_code":"br","website":"https://www.pucpr.br/american-academy-en/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Curitiba"},"targets":[]}
```

**Artmed School of Psychology** — `br-artmed-school-of-psychology`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-artmed-school-of-psychology","name":"Artmed School of Psychology","country_code":"br","website":"https://apsyedu.com.br/","admissions_url":"https://apsyedu.com.br/graduacao/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Portuguese; check each degree.","city_hint_unverified":"Porto Alegre"},"targets":[]}
```

**Faculdade Cultura Inglesa** — `br-faculdade-cultura-inglesa`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-faculdade-cultura-inglesa","name":"Faculdade Cultura Inglesa","country_code":"br","website":"https://www.faculdadeculturainglesa.com.br/","admissions_url":"https://www.culturainglesa.com.br/faculdade/graduacao","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Portuguese; check each degree.","city_hint_unverified":"São Paulo"},"targets":[]}
```

**FDV - Faculdade de Direito de Vitória** — `br-fdv-faculdade-de-direito-de-vitoria`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-fdv-faculdade-de-direito-de-vitoria","name":"FDV - Faculdade de Direito de Vitória","country_code":"br","website":"https://www.fdv.br/","admissions_url":"https://graduacao.fdv.br/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Portuguese; check each degree.","city_hint_unverified":"Vitória"},"targets":[]}
```

**Hayek Global College - Faculdade Internacional Brasilia** — `br-hayek-global-college-faculdade-internacional-brasilia`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-hayek-global-college-faculdade-internacional-brasilia","name":"Hayek Global College - Faculdade Internacional Brasilia","country_code":"br","website":"https://www.hayekcollege.com","admissions_url":"https://www.hayekcollege.com/college-admissions-guide","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Brasília"},"targets":[]}
```

**Instituto Mauá de Tecnologia** — `br-instituto-maua-de-tecnologia`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-instituto-maua-de-tecnologia","name":"Instituto Mauá de Tecnologia","country_code":"br","website":"https://www.maua.br","admissions_url":"https://maua.br/vestibular/bolsas-e-financiamentos","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Portuguese; check each degree.","city_hint_unverified":"São Caetano do Sul"},"targets":[]}
```

**PUC-Rio - Pontifícia Universidade Católica do Rio de Janeiro** — `br-puc-rio-pontificia-universidade-catolica-do-rio-de-janeiro`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-puc-rio-pontificia-universidade-catolica-do-rio-de-janeiro","name":"PUC-Rio - Pontifícia Universidade Católica do Rio de Janeiro","country_code":"br","website":"https://www.puc-rio.br/english/","admissions_url":"https://www.puc-rio.br/vestibular/202412/bolsas.html","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Rio de Janeiro"},"targets":[]}
```

**UNIFASE Petrópolis - Faculdade de Medicina de Petrópolis** — `br-unifase-petropolis-faculdade-de-medicina-de-petropolis`; full.

```json
{"priority":1,"country":"Brazil","institution_key":"br-unifase-petropolis-faculdade-de-medicina-de-petropolis","name":"UNIFASE Petrópolis - Faculdade de Medicina de Petrópolis","country_code":"br","website":"https://www.unifase-rj.edu.br/","admissions_url":"https://www.unifase-rj.edu.br/baccalaureate-fmp","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Spanish; check each degree.","city_hint_unverified":"Petrópolis"},"targets":[]}
```

### Bulgaria

**American University in Bulgaria** — `bg-american-university-in-bulgaria`; full.

```json
{"priority":1,"country":"Bulgaria","institution_key":"bg-american-university-in-bulgaria","name":"American University in Bulgaria","country_code":"bg","website":"https://www.aubg.edu/home-us/","admissions_url":"https://www.aubg.edu/admissions/bachelors/how-to-apply/international-baccalaureate/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Blagoevgrad"},"targets":[]}
```

### Cambodia

**American University of Phnom Penh** — `kh-american-university-of-phnom-penh`; full.

```json
{"priority":1,"country":"Cambodia","institution_key":"kh-american-university-of-phnom-penh","name":"American University of Phnom Penh","country_code":"kh","website":"http://aupp.edu.kh/","admissions_url":"https://www.aupp.edu.kh/admission-policies/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Phnom Penh"},"targets":[]}
```

### China

**Beijing Normal-Hong Kong Baptist University** — `cn-uic-zhuhai`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-uic-zhuhai","name":"Beijing Normal-Hong Kong Baptist University","country_code":"cn","website":"https://www.bnbu.edu.cn/en/","admissions_url":"https://ido.bnbu.edu.cn/en/info/1006/1019.htm","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught entirely in English, in a whole-person liberal arts model: business, culture and creativity, humanities and social science, science and technology.","city_hint_unverified":"Zhuhai, Guangdong"},"targets":[]}
```

**Duke Kunshan University** — `cn-dku`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-dku","name":"Duke Kunshan University","country_code":"cn","website":"https://www.dukekunshan.edu.cn/","admissions_url":"https://admissions.dukekunshan.edu.cn/en/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught in English, across a liberal arts and sciences curriculum with interdisciplinary majors. Graduates receive both a US degree and a Chinese degree.","city_hint_unverified":"Kunshan, Jiangsu"},"targets":[]}
```

**Fudan University** — `cn-fudan`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-fudan","name":"Fudan University","country_code":"cn","website":"https://www.fudan.edu.cn/en/","admissions_url":"https://iso.fudan.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"A small number of English-taught bachelor's programmes, historically including clinical medicine (MBBS) and some economics and international relations tracks. Verify directly.","city_hint_unverified":"Shanghai"},"targets":[]}
```

**NYU Shanghai** — `cn-nyu-shanghai`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-nyu-shanghai","name":"NYU Shanghai","country_code":"cn","website":"https://shanghai.nyu.edu/","admissions_url":"https://shanghai.nyu.edu/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught entirely in English, across business, data science, computer science, humanities, social science, neuroscience and interactive media arts. Awards an NYU degree and a Chinese degree.","city_hint_unverified":"Shanghai (Pudong)"},"targets":[]}
```

**Peking University** — `cn-pku`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-pku","name":"Peking University","country_code":"cn","website":"https://english.pku.edu.cn/","admissions_url":"https://www.isd.pku.edu.cn/en/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Very limited. Yuanpei College is PKU's liberal-arts honours college but teaches principally in Chinese. The Yenching Academy is a one-year master's programme, not an undergraduate route. Most international undergraduates study in Mandarin.","city_hint_unverified":"Beijing"},"targets":[]}
```

**Shanghai Jiao Tong University** — `cn-sjtu`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-sjtu","name":"Shanghai Jiao Tong University","country_code":"cn","website":"https://en.sjtu.edu.cn/","admissions_url":"https://isc.sjtu.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Limited. Some English-taught tracks exist in engineering and medicine; the SJTU-ParisTech Elite Institute of Technology teaches in French and Chinese. Verify directly.","city_hint_unverified":"Shanghai"},"targets":[]}
```

**Sun Yat-sen University** — `cn-sysu`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-sysu","name":"Sun Yat-sen University","country_code":"cn","website":"https://www.sysu.edu.cn/sysuen/","admissions_url":"https://iso.sysu.edu.cn/en/application/selffunded/index.htm","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Limited. Some English-taught medicine and business tracks; most undergraduate teaching is in Mandarin. Verify directly.","city_hint_unverified":"Guangzhou, Shenzhen and Zhuhai"},"targets":[]}
```

**The Chinese University of Hong Kong, Shenzhen** — `cn-cuhk-shenzhen`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-cuhk-shenzhen","name":"The Chinese University of Hong Kong, Shenzhen","country_code":"cn","website":"https://www.cuhk.edu.cn/en","admissions_url":"https://intladmissions.cuhk.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught in English, across science and engineering, management and economics, humanities and social science, data science, medicine and music. Awards a CUHK degree.","city_hint_unverified":"Shenzhen, Guangdong"},"targets":[]}
```

**Tongji University** — `cn-tongji`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-tongji","name":"Tongji University","country_code":"cn","website":"https://en.tongji.edu.cn/","admissions_url":"https://study.tongji.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"A small number of English-taught bachelor's programmes, historically in civil engineering and architecture. Verify directly.","city_hint_unverified":"Shanghai"},"targets":[]}
```

**Tsinghua University** — `cn-tsinghua`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-tsinghua","name":"Tsinghua University","country_code":"cn","website":"https://www.tsinghua.edu.cn/en/","admissions_url":"https://www.join-tsinghua.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"No fully English-taught bachelor's is listed. Tsinghua's applicant FAQ says undergraduate teaching is in Chinese, with some courses bilingual or in English, and asks for HSK 5 (or HSK 4 on entry and HSK 5 within a year).","city_hint_unverified":"Beijing"},"targets":[]}
```

**University of Nottingham Ningbo China** — `cn-unnc`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-unnc","name":"University of Nottingham Ningbo China","country_code":"cn","website":"https://www.nottingham.edu.cn/en/index.aspx","admissions_url":"https://www.nottingham.edu.cn/en/study-with-us/undergraduate/home.aspx","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught in English, awarding a University of Nottingham degree. Business, engineering, international studies, education and science.","city_hint_unverified":"Ningbo, Zhejiang"},"targets":[]}
```

**Wenzhou-Kean University** — `cn-wku`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-wku","name":"Wenzhou-Kean University","country_code":"cn","website":"https://www.wku.edu.cn/en/","admissions_url":"https://admission.wku.edu.cn/en","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, taught in English by an American faculty, awarding both a Kean University (New Jersey) degree and a Chinese degree. Business, computer science, architecture, psychology, biology and education.","city_hint_unverified":"Wenzhou, Zhejiang"},"targets":[]}
```

**Xi'an Jiaotong-Liverpool University** — `cn-xjtlu`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-xjtlu","name":"Xi'an Jiaotong-Liverpool University","country_code":"cn","website":"https://www.xjtlu.edu.cn/en/","admissions_url":"https://www.xjtlu.edu.cn/en/study/undergraduate","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Over 60 undergraduate programmes, all taught in English, across engineering, science, business, humanities, film and design. Graduates receive dual XJTLU and University of Liverpool degrees.","city_hint_unverified":"Suzhou, Jiangsu"},"targets":[]}
```

**Zhejiang University** — `cn-zju`; full.

```json
{"priority":1,"country":"China","institution_key":"cn-zju","name":"Zhejiang University","country_code":"cn","website":"https://www.zju.edu.cn/english/","admissions_url":"https://iczu.zju.edu.cn/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Limited at the main university; the ZJU-UoE Institute (with Edinburgh) and ZJU-UIUC Institute (with Illinois) at the Haining International Campus teach in English and award dual degrees.","city_hint_unverified":"Hangzhou"},"targets":[]}
```

### Colombia

**Colegio de Estudios Superiores de Administración** — `co-colegio-de-estudios-superiores-de-administracion`; full.

```json
{"priority":1,"country":"Colombia","institution_key":"co-colegio-de-estudios-superiores-de-administracion","name":"Colegio de Estudios Superiores de Administración","country_code":"co","website":"https://www.cesa.edu.co/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Spanish; check each degree.","city_hint_unverified":"Bogotá"},"targets":[]}
```

### Cyprus

**American University of Beirut – Mediterraneo** — `cy-american-university-of-beirut-mediterraneo`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-american-university-of-beirut-mediterraneo","name":"American University of Beirut – Mediterraneo","country_code":"cy","website":"https://www.aubmed.ac.cy/","admissions_url":"https://www.aubmed.ac.cy/Admissions/Pages/Undergraduate-Yearly-Tuition-and-Financial-Assistance.aspx","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Paphos"},"targets":[]}
```

**Cyprus University of Technology** — `cy-cyprus-university-of-technology`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-cyprus-university-of-technology","name":"Cyprus University of Technology","country_code":"cy","website":"https://www.cut.ac.cy/","admissions_url":"https://www.cut.ac.cy/studies/admissions/bachelor-programmes-admissions/international-students/?languageId=1","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Greek; check each degree.","city_hint_unverified":"Limassol"},"targets":[]}
```

**European University Cyprus** — `cy-european-university-cyprus`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-european-university-cyprus","name":"European University Cyprus","country_code":"cy","website":"https://euc.ac.cy","admissions_url":"https://euc.ac.cy/en/admissions/finance-aid/scholarship-aid","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Greek; check each degree.","city_hint_unverified":"Nicosia"},"targets":[]}
```

**University of Cyprus** — `cy-university-of-cyprus`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-university-of-cyprus","name":"University of Cyprus","country_code":"cy","website":"http://www.ucy.ac.cy/","admissions_url":"https://www.ucy.ac.cy/study/undergraduate-studies/admissions/?lang=en","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Nicosia"},"targets":[]}
```

**University of Limassol** — `cy-university-of-limassol`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-university-of-limassol","name":"University of Limassol","country_code":"cy","website":"https://www.uol.ac.cy/","admissions_url":"https://www.uol.ac.cy/en/requirements/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Limassol"},"targets":[]}
```

**University of Nicosia** — `cy-university-of-nicosia`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-university-of-nicosia","name":"University of Nicosia","country_code":"cy","website":"https://www.unic.ac.cy/nicosia/","admissions_url":"https://www.unic.ac.cy/admission-requirements/financial-information/scholarships-financial-aid/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Nicosia"},"targets":[]}
```

**University of Nicosia: Medical School** — `cy-university-of-nicosia-medical-school`; full.

```json
{"priority":1,"country":"Cyprus","institution_key":"cy-university-of-nicosia-medical-school","name":"University of Nicosia: Medical School","country_code":"cy","website":"https://www.med.unic.ac.cy/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Nicosia"},"targets":[]}
```

### Ecuador

**Universidad Internacional del Ecuador** — `ec-universidad-internacional-del-ecuador`; full.

```json
{"priority":1,"country":"Ecuador","institution_key":"ec-universidad-internacional-del-ecuador","name":"Universidad Internacional del Ecuador","country_code":"ec","website":"https://www.uide.edu.ec/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Spanish; check each degree.","city_hint_unverified":"Quito"},"targets":[]}
```

### Egypt

**American University in Cairo** — `eg-american-university-in-cairo`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-american-university-in-cairo","name":"American University in Cairo","country_code":"eg","website":"https://www.aucegypt.edu/academics/undergraduate-programs","admissions_url":"https://www.aucegypt.edu/admissions/undergraduate-requirements","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"New Cairo"},"targets":[]}
```

**British University in Egypt** — `eg-british-university-in-egypt`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-british-university-in-egypt","name":"British University in Egypt","country_code":"eg","website":"https://www.bue.edu.eg/","admissions_url":"https://srs.bue.edu.eg/bue/admission_2025_26/Partial_Scholarships.aspx?","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"El Shorouk"},"targets":[]}
```

**Cairo University** — `eg-cairo-university`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-cairo-university","name":"Cairo University","country_code":"eg","website":"https://cu.edu.eg/Home","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Giza"},"targets":[]}
```

**MSA University** — `eg-msa-university`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-msa-university","name":"MSA University","country_code":"eg","website":"https://msa.edu.eg/msauniversity/about-msa/welcome-to-msa/msa-flyer","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"6th of October City"},"targets":[]}
```

**New Giza University** — `eg-new-giza-university`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-new-giza-university","name":"New Giza University","country_code":"eg","website":"https://www.ngu.edu.eg","admissions_url":"https://ngu.edu.eg/ng-admissions/#3009","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Sheikh Zayed"},"targets":[]}
```

**Universities of Canada in Egypt** — `eg-universities-of-canada-in-egypt`; full.

```json
{"priority":1,"country":"Egypt","institution_key":"eg-universities-of-canada-in-egypt","name":"Universities of Canada in Egypt","country_code":"eg","website":"https://uofcanada.edu.eg/","admissions_url":"https://upei.uofcanada.edu.eg/scholarship-criteria/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"New Administrative Capital"},"targets":[]}
```

### Ghana

**Accra College of Medicine** — `gh-accra-college-of-medicine`; full.

```json
{"priority":1,"country":"Ghana","institution_key":"gh-accra-college-of-medicine","name":"Accra College of Medicine","country_code":"gh","website":"https://www.acm.edu.gh","admissions_url":"https://acm.edu.gh/undergraduate-admissions/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Accra"},"targets":[]}
```

**Ashesi University** — `gh-ashesi-university`; full.

```json
{"priority":1,"country":"Ghana","institution_key":"gh-ashesi-university","name":"Ashesi University","country_code":"gh","website":"https://www.ashesi.edu.gh/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Berekuso"},"targets":[]}
```

### Grenada

**St. George's University - Grenada** — `gd-st-george-s-university-grenada`; full.

```json
{"priority":1,"country":"Grenada","institution_key":"gd-st-george-s-university-grenada","name":"St. George's University - Grenada","country_code":"gd","website":"https://www.sgu.edu/","admissions_url":"https://www.sgu.edu/academic-programs/school-of-arts-sciences/admission/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"St George's"},"targets":[]}
```

### Guyana

**Texila American University** — `gy-texila-american-university`; full.

```json
{"priority":1,"country":"Guyana","institution_key":"gy-texila-american-university","name":"Texila American University","country_code":"gy","website":"https://tau.edu.gy/","admissions_url":"https://tau.edu.gy/admissions-requirement/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Georgetown"},"targets":[]}
```

### India

**Ahmedabad University** — `in-ahmedabad-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-ahmedabad-university","name":"Ahmedabad University","country_code":"in","website":"https://ahduni.edu.in/?utm_source=gmb&utm_medium=gmb-listing&utm_campaign=gmb-ahmedabad-university","admissions_url":"https://ahduni.edu.in/admission/undergraduate-admission/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ahmedabad"},"targets":[]}
```

**Amity University - Noida** — `in-amity-university-noida`; full.

```json
{"priority":1,"country":"India","institution_key":"in-amity-university-noida","name":"Amity University - Noida","country_code":"in","website":"https://amity.edu/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Noida"},"targets":[]}
```

**Ashoka University** — `in-ashoka-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-ashoka-university","name":"Ashoka University","country_code":"in","website":"https://www.ashoka.edu.in","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Sonipat"},"targets":[]}
```

**Atlas Skilltech University** — `in-atlas-skilltech-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-atlas-skilltech-university","name":"Atlas Skilltech University","country_code":"in","website":"https://atlasuniversity.edu.in/","admissions_url":"https://atlasuniversity.edu.in/admissions-policy/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**Azim Premji University** — `in-azim-premji-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-azim-premji-university","name":"Azim Premji University","country_code":"in","website":"http://www.azimpremjiuniversity.edu.in/","admissions_url":"https://azimpremjiuniversity.edu.in/undergraduate#eligibility-and-diversity","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bengaluru"},"targets":[]}
```

**Bennett University** — `in-bennett-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-bennett-university","name":"Bennett University","country_code":"in","website":"https://www.bennett.edu.in/","admissions_url":"https://www.bennett.edu.in/admission/admission-process/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Greater Noida"},"targets":[]}
```

**BITS Pilani** — `in-bits-pilani`; full.

```json
{"priority":1,"country":"India","institution_key":"in-bits-pilani","name":"BITS Pilani","country_code":"in","website":"https://www.bits-pilani.ac.in/","admissions_url":"https://www.bitsadmission.com/bitsat/download/Eligibility_for_Admissions.pdf","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Pilani"},"targets":[]}
```

**Christ University** — `in-christ-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-christ-university","name":"Christ University","country_code":"in","website":"https://christuniversity.in/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bengaluru"},"targets":[]}
```

**Indian School of Design and Innovation** — `in-indian-school-of-design-and-innovation`; full.

```json
{"priority":1,"country":"India","institution_key":"in-indian-school-of-design-and-innovation","name":"Indian School of Design and Innovation","country_code":"in","website":"http://www.isdi.in/","admissions_url":"https://atlasuniversity.edu.in/admissions-policy/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**Indian School of Hospitality** — `in-indian-school-of-hospitality`; full.

```json
{"priority":1,"country":"India","institution_key":"in-indian-school-of-hospitality","name":"Indian School of Hospitality","country_code":"in","website":"https://www.ish.edu.in/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Gurgaon"},"targets":[]}
```

**Kalinga Institute of Industrial Technology** — `in-kalinga-institute-of-industrial-technology`; full.

```json
{"priority":1,"country":"India","institution_key":"in-kalinga-institute-of-industrial-technology","name":"Kalinga Institute of Industrial Technology","country_code":"in","website":"https://kiitee.kiit.ac.in/","admissions_url":"https://kiitee.kiit.ac.in/eligibility-criteria/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bhubaneswar"},"targets":[]}
```

**Manav Rachna International Institute of Research and Studies** — `in-manav-rachna-international-institute-of-research-and-studies`; full.

```json
{"priority":1,"country":"India","institution_key":"in-manav-rachna-international-institute-of-research-and-studies","name":"Manav Rachna International Institute of Research and Studies","country_code":"in","website":"https://manavrachna.edu.in/mriirs","admissions_url":"https://apply.manavrachna.edu.in/mriirs","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Faridabad"},"targets":[]}
```

**Manav Rachna University** — `in-manav-rachna-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-manav-rachna-university","name":"Manav Rachna University","country_code":"in","website":"https://manavrachna.edu.in/mru","admissions_url":"https://manavrachna.edu.in/assets/campus/mru/pdf/Recognition%20of%20International%20Baccalaureate%20Diploma%20as%20Equivalent%20to%2010+2%20Level%20Examination.pdf","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Faridabad"},"targets":[]}
```

**Manipal University - Jaipur** — `in-manipal-university-jaipur`; full.

```json
{"priority":1,"country":"India","institution_key":"in-manipal-university-jaipur","name":"Manipal University - Jaipur","country_code":"in","website":"https://jaipur.manipal.edu/index.php","admissions_url":"https://jaipur.manipal.edu/indian-program-offered-eligibility.php#ug","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Jaipur"},"targets":[]}
```

**MET Institute of International Studies** — `in-met-institute-of-international-studies`; full.

```json
{"priority":1,"country":"India","institution_key":"in-met-institute-of-international-studies","name":"MET Institute of International Studies","country_code":"in","website":"https://www.met.edu/institute/institute_of_international_studies","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**MIT Institute of Design** — `in-mit-institute-of-design`; full.

```json
{"priority":1,"country":"India","institution_key":"in-mit-institute-of-design","name":"MIT Institute of Design","country_code":"in","website":"https://www.mitid.edu.in/admission/admission-process/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Pune"},"targets":[]}
```

**MIT World Peace University** — `in-mit-world-peace-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-mit-world-peace-university","name":"MIT World Peace University","country_code":"in","website":"https://mitwpu.edu.in/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Pune"},"targets":[]}
```

**Narsee Monjee College of Commerce and Economics** — `in-narsee-monjee-college-of-commerce-and-economics`; full.

```json
{"priority":1,"country":"India","institution_key":"in-narsee-monjee-college-of-commerce-and-economics","name":"Narsee Monjee College of Commerce and Economics","country_code":"in","website":"https://nmcollege.in/","admissions_url":"https://nmcollege.in/admissions/under-graduate","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**Pearl Academy** — `in-pearl-academy`; full.

```json
{"priority":1,"country":"India","institution_key":"in-pearl-academy","name":"Pearl Academy","country_code":"in","website":"https://www.pearlacademy.com","admissions_url":"https://www.pearlacademy.com/admissions/scholarships","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Delhi"},"targets":[]}
```

**Plaksha University** — `in-plaksha-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-plaksha-university","name":"Plaksha University","country_code":"in","website":"https://plaksha.edu.in","admissions_url":"https://plaksha.edu.in/admissions/undergraduate/international","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mohali"},"targets":[]}
```

**Russell Square International College** — `in-russell-square-international-college`; full.

```json
{"priority":1,"country":"India","institution_key":"in-russell-square-international-college","name":"Russell Square International College","country_code":"in","website":"https://www.rsicollege.org/","admissions_url":"https://www.rsicollege.org/admission-eligibility.html","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**S P Jain School of Global Management** — `in-s-p-jain-school-of-global-management`; full.

```json
{"priority":1,"country":"India","institution_key":"in-s-p-jain-school-of-global-management","name":"S P Jain School of Global Management","country_code":"in","website":"https://www.spjain.org/","admissions_url":"https://www.spjain.org/programs/undergraduate/scholarships","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Mumbai"},"targets":[]}
```

**Shoolini University** — `in-shoolini-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-shoolini-university","name":"Shoolini University","country_code":"in","website":"https://shooliniuniversity.com/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Solan"},"targets":[]}
```

**SRM Institute of Science and Technology** — `in-srm-institute-of-science-and-technology`; full.

```json
{"priority":1,"country":"India","institution_key":"in-srm-institute-of-science-and-technology","name":"SRM Institute of Science and Technology","country_code":"in","website":"https://www.srmist.edu.in/","admissions_url":"https://www.srmist.edu.in/admission-india/engineering/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Chennai"},"targets":[]}
```

**Symbiosis School for Liberal Arts** — `in-symbiosis-school-for-liberal-arts`; full.

```json
{"priority":1,"country":"India","institution_key":"in-symbiosis-school-for-liberal-arts","name":"Symbiosis School for Liberal Arts","country_code":"in","website":"https://www.ssla.edu.in/","admissions_url":"https://www.ssla.edu.in/eligibility3","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Pune"},"targets":[]}
```

**Universal AI University** — `in-universal-ai-university`; full.

```json
{"priority":1,"country":"India","institution_key":"in-universal-ai-university","name":"Universal AI University","country_code":"in","website":"https://www.universalai.in/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Karjat"},"targets":[]}
```

**University of Petroleum and Energy Studies** — `in-university-of-petroleum-and-energy-studies`; full.

```json
{"priority":1,"country":"India","institution_key":"in-university-of-petroleum-and-energy-studies","name":"University of Petroleum and Energy Studies","country_code":"in","website":"https://www.upes.ac.in","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Dehradun"},"targets":[]}
```

### Indonesia

**Bandung Institute of Technology** — `id-bandung-institute-of-technology`; full.

```json
{"priority":1,"country":"Indonesia","institution_key":"id-bandung-institute-of-technology","name":"Bandung Institute of Technology","country_code":"id","website":"https://www.che.itb.ac.id/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bandung"},"targets":[]}
```

**Jakarta International College** — `id-jakarta-international-college`; full.

```json
{"priority":1,"country":"Indonesia","institution_key":"id-jakarta-international-college","name":"Jakarta International College","country_code":"id","website":"https://www.jic.ac.id","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Jakarta"},"targets":[]}
```

**Sampoerna University** — `id-sampoerna-university`; full.

```json
{"priority":1,"country":"Indonesia","institution_key":"id-sampoerna-university","name":"Sampoerna University","country_code":"id","website":"https://www.sampoernauniversity.ac.id","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Jakarta"},"targets":[]}
```

### Israel

**Reichman University** — `il-reichman-university`; full.

```json
{"priority":1,"country":"Israel","institution_key":"il-reichman-university","name":"Reichman University","country_code":"il","website":"https://www.rris.runi.ac.il","admissions_url":"https://www.runi.ac.il/en/schools/rris/admissions/undergraduate/financial-aid-and-scholarships/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Herzliya"},"targets":[]}
```

### Jamaica

**University of the Commonwealth Caribbean** — `jm-university-of-the-commonwealth-caribbean`; full.

```json
{"priority":1,"country":"Jamaica","institution_key":"jm-university-of-the-commonwealth-caribbean","name":"University of the Commonwealth Caribbean","country_code":"jm","website":"https://ucc.edu.jm/here","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kingston"},"targets":[]}
```

**University of the West Indies - Jamaica** — `jm-university-of-the-west-indies-jamaica`; full.

```json
{"priority":1,"country":"Jamaica","institution_key":"jm-university-of-the-west-indies-jamaica","name":"University of the West Indies - Jamaica","country_code":"jm","website":"https://www.mona.uwi.edu/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kingston"},"targets":[]}
```

### Jordan

**American University of Madaba** — `jo-american-university-of-madaba`; full.

```json
{"priority":1,"country":"Jordan","institution_key":"jo-american-university-of-madaba","name":"American University of Madaba","country_code":"jo","website":"https://www.aum.edu.jo/","admissions_url":"https://www.aum.edu.jo/admissions/registration_pre_admission","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Madaba"},"targets":[]}
```

**Princess Sumaya University for Technology** — `jo-princess-sumaya-university-for-technology`; full.

```json
{"priority":1,"country":"Jordan","institution_key":"jo-princess-sumaya-university-for-technology","name":"Princess Sumaya University for Technology","country_code":"jo","website":"https://psut.edu.jo/","admissions_url":"https://www.psut.edu.jo/en/admission-platform","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Amman"},"targets":[]}
```

### Kazakhstan

**Nazarbayev University** — `kz-nazarbayev-university`; full.

```json
{"priority":1,"country":"Kazakhstan","institution_key":"kz-nazarbayev-university","name":"Nazarbayev University","country_code":"kz","website":"https://nu.edu.kz/admissions/typesofstudy/undergraduate","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Astana"},"targets":[]}
```

### Kuwait

**American University of Kuwait** — `kw-american-university-of-kuwait`; full.

```json
{"priority":1,"country":"Kuwait","institution_key":"kw-american-university-of-kuwait","name":"American University of Kuwait","country_code":"kw","website":"http://www.auk.edu.kw/","admissions_url":"https://www.auk.edu.kw/admissions-financial-aid/admissions/general-admission-policy","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Salmiya"},"targets":[]}
```

### Lebanon

**American University of Beirut** — `lb-american-university-of-beirut`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-american-university-of-beirut","name":"American University of Beirut","country_code":"lb","website":"https://www.aub.edu.lb","admissions_url":"https://www.aub.edu.lb/admissions/Pages/default.aspx","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Beirut"},"targets":[]}
```

**Beirut Arab University** — `lb-beirut-arab-university`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-beirut-arab-university","name":"Beirut Arab University","country_code":"lb","website":"https://www.bau.edu.lb","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Beirut"},"targets":[]}
```

**Lebanese American University** — `lb-lebanese-american-university`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-lebanese-american-university","name":"Lebanese American University","country_code":"lb","website":"https://www.lau.edu.lb/","admissions_url":"https://www.lau.edu.lb/apply/financial-aid/scholarships.php","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Beirut"},"targets":[]}
```

**Notre Dame University - Louaize** — `lb-notre-dame-university-louaize`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-notre-dame-university-louaize","name":"Notre Dame University - Louaize","country_code":"lb","website":"https://www.ndu.edu.lb","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Zouk Mosbeh"},"targets":[]}
```

**Phoenicia University** — `lb-phoenicia-university`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-phoenicia-university","name":"Phoenicia University","country_code":"lb","website":"https://pu.edu.lb/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Daoudiyeh"},"targets":[]}
```

**Saint Joseph University of Beirut** — `lb-saint-joseph-university-of-beirut`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-saint-joseph-university-of-beirut","name":"Saint Joseph University of Beirut","country_code":"lb","website":"https://www.usj.edu.lb/anglais/index.php","admissions_url":"https://www.usj.edu.lb/admission/conditions.php?lang=2","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Arabic and French; check each degree.","city_hint_unverified":"Beirut"},"targets":[]}
```

**University of Balamand** — `lb-university-of-balamand`; full.

```json
{"priority":1,"country":"Lebanon","institution_key":"lb-university-of-balamand","name":"University of Balamand","country_code":"lb","website":"http://www.balamand.edu.lb/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Koura"},"targets":[]}
```

### Macao

**Macao University of Tourism** — `mo-macao-university-of-tourism`; full.

```json
{"priority":1,"country":"Macao","institution_key":"mo-macao-university-of-tourism","name":"Macao University of Tourism","country_code":"mo","website":"https://www.utm.edu.mo/","admissions_url":"https://www.utm.edu.mo/iftadmission/financial-assistance-scholarship","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Chinese Traditional; check each degree.","city_hint_unverified":"Macao"},"targets":[]}
```

**Macau University of Science and Technology** — `mo-macau-university-of-science-and-technology`; full.

```json
{"priority":1,"country":"Macao","institution_key":"mo-macau-university-of-science-and-technology","name":"Macau University of Science and Technology","country_code":"mo","website":"https://www.must.edu.mo/en","admissions_url":"https://ugadmissions.must.edu.mo/page/id-2822.html?locale=en_US","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Cantonese and Mandarin; check each degree.","city_hint_unverified":"Taipa"},"targets":[]}
```

### Malaysia

**Heriot-Watt University - Malaysia** — `my-heriot-watt-university-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-heriot-watt-university-malaysia","name":"Heriot-Watt University - Malaysia","country_code":"my","website":"https://www.hw.ac.uk/malaysia/","admissions_url":"https://www.hw.ac.uk/malaysia/doc/scholarships-application-form-hwum.pdf","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Putrajaya"},"targets":[]}
```

**IMU University** — `my-imu-university`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-imu-university","name":"IMU University","country_code":"my","website":"https://www.imu.edu.my/","admissions_url":"https://www.imu.edu.my/support-services/application-requirements-procedures/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kuala Lumpur"},"targets":[]}
```

**Monash University - Malaysia** — `my-monash-university-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-monash-university-malaysia","name":"Monash University - Malaysia","country_code":"my","website":"https://www.monash.edu.my/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Subang Jaya"},"targets":[]}
```

**Newcastle University Medicine Malaysia** — `my-newcastle-university-medicine-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-newcastle-university-medicine-malaysia","name":"Newcastle University Medicine Malaysia","country_code":"my","website":"https://www.ncl.ac.uk/","admissions_url":"https://www.ncl.ac.uk/numed/study-with-us/how-to-apply/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Iskandar Puteri"},"targets":[]}
```

**RCSI & UCD - Malaysia** — `my-rcsi-ucd-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-rcsi-ucd-malaysia","name":"RCSI & UCD - Malaysia","country_code":"my","website":"https://www.rumc.edu.my/","admissions_url":"https://www.rcsiucd.edu.my/admissions/scholarships/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"George Town"},"targets":[]}
```

**Swinburne University of Technology - Sarawak** — `my-swinburne-university-of-technology-sarawak`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-swinburne-university-of-technology-sarawak","name":"Swinburne University of Technology - Sarawak","country_code":"my","website":"https://www.swinburne.edu.my/","admissions_url":"https://www.swinburne.edu.my/study/admission/academic-requirement.php","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kuching"},"targets":[]}
```

**Universiti Teknologi Malaysia** — `my-universiti-teknologi-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-universiti-teknologi-malaysia","name":"Universiti Teknologi Malaysia","country_code":"my","website":"https://www.utm.my","admissions_url":"https://admission.utm.my/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Iskandar Puteri"},"targets":[]}
```

**University of Reading - Malaysia** — `my-university-of-reading-malaysia`; full.

```json
{"priority":1,"country":"Malaysia","institution_key":"my-university-of-reading-malaysia","name":"University of Reading - Malaysia","country_code":"my","website":"https://www.reading.edu.my","admissions_url":"https://www.reading.edu.my/admissions/scholarships","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Iskandar Puteri"},"targets":[]}
```

### Mexico

**Universidad Anáhuac - Cancún** — `mx-universidad-anahuac-cancun`; full.

```json
{"priority":1,"country":"Mexico","institution_key":"mx-universidad-anahuac-cancun","name":"Universidad Anáhuac - Cancún","country_code":"mx","website":"https://www.anahuac.mx/cancun/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Spanish; check each degree.","city_hint_unverified":"Cancún"},"targets":[]}
```

**Universidad de Monterrey** — `mx-universidad-de-monterrey`; full.

```json
{"priority":1,"country":"Mexico","institution_key":"mx-universidad-de-monterrey","name":"Universidad de Monterrey","country_code":"mx","website":"https://www.udem.edu.mx","admissions_url":"https://www.udem.edu.mx/es/institucional/beca-para-alumnos-graduados-de-bachillerato-internacional-bi","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Spanish; check each degree.","city_hint_unverified":"Monterrey"},"targets":[]}
```

### Monaco

**International University of Monaco** — `mc-international-university-of-monaco`; full.

```json
{"priority":1,"country":"Monaco","institution_key":"mc-international-university-of-monaco","name":"International University of Monaco","country_code":"mc","website":"https://www.monaco.edu/","admissions_url":"https://www.monaco.edu/program/tuition_fees_admissions-requirements/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Monaco"},"targets":[]}
```

### Nepal

**Kathmandu University** — `np-kathmandu-university`; full.

```json
{"priority":1,"country":"Nepal","institution_key":"np-kathmandu-university","name":"Kathmandu University","country_code":"np","website":"https://www.ku.edu.np/","admissions_url":"https://doai.ku.edu.np/news-app/call-for-application-for-admission-in-undergraduate-program-academic-year-2024-b.e.-chemical-engineering?tags=Chemical%20Engineering&search_site_name=kudoai&show_on_home=0","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Dhulikhel"},"targets":[]}
```

### Nigeria

**Atiba University** — `ng-atiba-university`; full.

```json
{"priority":1,"country":"Nigeria","institution_key":"ng-atiba-university","name":"Atiba University","country_code":"ng","website":"https://atibauniversity.edu.ng/","admissions_url":"https://atibauniversity.edu.ng/admission/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Oyo"},"targets":[]}
```

**Babcock University** — `ng-babcock-university`; full.

```json
{"priority":1,"country":"Nigeria","institution_key":"ng-babcock-university","name":"Babcock University","country_code":"ng","website":"http://www.babcock.edu.ng/","admissions_url":"https://babcock.edu.ng/admission/undergraduate","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ikenne"},"targets":[]}
```

**MIVA Open University** — `ng-miva-open-university`; full.

```json
{"priority":1,"country":"Nigeria","institution_key":"ng-miva-open-university","name":"MIVA Open University","country_code":"ng","website":"https://miva.edu.ng/","admissions_url":"https://miva.edu.ng/direct-entry-at-miva-open-university/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Abuja"},"targets":[]}
```

**Pan-Atlantic University** — `ng-pan-atlantic-university`; full.

```json
{"priority":1,"country":"Nigeria","institution_key":"ng-pan-atlantic-university","name":"Pan-Atlantic University","country_code":"ng","website":"http://pau.edu.ng/","admissions_url":"https://pau.edu.ng/admissions/direct-entry/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Lagos"},"targets":[]}
```

### Oman

**German University of Technology in Oman** — `om-german-university-of-technology-in-oman`; full.

```json
{"priority":1,"country":"Oman","institution_key":"om-german-university-of-technology-in-oman","name":"German University of Technology in Oman","country_code":"om","website":"http://www.gutech.edu.om/","admissions_url":"https://www.gutech.edu.om/admissions-scholarships/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Muscat"},"targets":[]}
```

### Pakistan

**Indus Valley School of Art and Architecture** — `pk-indus-valley-school-of-art-and-architecture`; full.

```json
{"priority":1,"country":"Pakistan","institution_key":"pk-indus-valley-school-of-art-and-architecture","name":"Indus Valley School of Art and Architecture","country_code":"pk","website":"https://www.indusvalley.edu.pk/home","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Karachi"},"targets":[]}
```

### Panama

**Florida State University - Republic of Panama** — `pa-florida-state-university-republic-of-panama`; full.

```json
{"priority":1,"country":"Panama","institution_key":"pa-florida-state-university-republic-of-panama","name":"Florida State University - Republic of Panama","country_code":"pa","website":"https://pc.fsu.edu/","admissions_url":"https://admissions.fsu.edu/first-year/credit","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Panama City"},"targets":[]}
```

### Philippines

**Ateneo de Manila University** — `ph-ateneo-de-manila-university`; full.

```json
{"priority":1,"country":"Philippines","institution_key":"ph-ateneo-de-manila-university","name":"Ateneo de Manila University","country_code":"ph","website":"https://www.ateneo.edu","admissions_url":"https://www.ateneo.edu/ls/registrar/policies/crediting-ib-dp-exams","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Filipino; check each degree.","city_hint_unverified":"Quezon City"},"targets":[]}
```

**De La Salle University** — `ph-de-la-salle-university`; full.

```json
{"priority":1,"country":"Philippines","institution_key":"ph-de-la-salle-university","name":"De La Salle University","country_code":"ph","website":"https://www.dlsu.edu.ph/","admissions_url":"https://www.dlsu.edu.ph/admissions/undergraduate/#","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Manila"},"targets":[]}
```

### Qatar

**Carnegie Mellon University in Qatar** — `qa-carnegie-mellon-university-in-qatar`; full.

```json
{"priority":1,"country":"Qatar","institution_key":"qa-carnegie-mellon-university-in-qatar","name":"Carnegie Mellon University in Qatar","country_code":"qa","website":"https://qatar.cmu.edu","admissions_url":"https://www.qatar.cmu.edu/admission/tuition-and-financial-aid/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Doha"},"targets":[]}
```

**Georgetown University - Qatar** — `qa-georgetown-university-qatar`; full.

```json
{"priority":1,"country":"Qatar","institution_key":"qa-georgetown-university-qatar","name":"Georgetown University - Qatar","country_code":"qa","website":"https://www.qatar.georgetown.edu","admissions_url":"https://www.qatar.georgetown.edu/admissions/financial-aid/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Doha"},"targets":[]}
```

**Northwestern University - Qatar** — `qa-northwestern-university-qatar`; full.

```json
{"priority":1,"country":"Qatar","institution_key":"qa-northwestern-university-qatar","name":"Northwestern University - Qatar","country_code":"qa","website":"https://www.qatar.northwestern.edu","admissions_url":"https://www.qatar.northwestern.edu/admissions/undergraduate/tuition-aid.html","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Doha"},"targets":[]}
```

**Weill Cornell Medicine - Qatar** — `qa-weill-cornell-medicine-qatar`; full.

```json
{"priority":1,"country":"Qatar","institution_key":"qa-weill-cornell-medicine-qatar","name":"Weill Cornell Medicine - Qatar","country_code":"qa","website":"https://qatar-weill.cornell.edu/","admissions_url":"https://qatar-weill.cornell.edu/admissions/medical-program/six-year-medical-program/requirements","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Doha"},"targets":[]}
```

### Saudi Arabia

**Al Faisal University** — `sa-al-faisal-university`; full.

```json
{"priority":1,"country":"Saudi Arabia","institution_key":"sa-al-faisal-university","name":"Al Faisal University","country_code":"sa","website":"https://admissions.alfaisal.edu/en/","admissions_url":"https://admissions.alfaisal.edu/en/criteria","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Riyadh"},"targets":[]}
```

### South Africa

**NHL Stenden - South Africa** — `za-nhl-stenden-south-africa`; full.

```json
{"priority":1,"country":"South Africa","institution_key":"za-nhl-stenden-south-africa","name":"NHL Stenden - South Africa","country_code":"za","website":"https://stenden.ac.za/","admissions_url":"https://stenden.ac.za/admissions/admission-policies/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Port Alfred"},"targets":[]}
```

**University of Cape Town** — `za-university-of-cape-town`; full.

```json
{"priority":1,"country":"South Africa","institution_key":"za-university-of-cape-town","name":"University of Cape Town","country_code":"za","website":"https://www.uct.ac.za","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Cape Town"},"targets":[]}
```

**University of Johannesburg** — `za-university-of-johannesburg`; full.

```json
{"priority":1,"country":"South Africa","institution_key":"za-university-of-johannesburg","name":"University of Johannesburg","country_code":"za","website":"https://www.uj.ac.za/","admissions_url":"https://www.uj.ac.za/admission-aid/international-applicants/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Johannesburg"},"targets":[]}
```

**University of Pretoria** — `za-university-of-pretoria`; full.

```json
{"priority":1,"country":"South Africa","institution_key":"za-university-of-pretoria","name":"University of Pretoria","country_code":"za","website":"https://www.up.ac.za/article/2749381/our-story","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Pretoria"},"targets":[]}
```

**University of the Witwatersrand** — `za-university-of-the-witwatersrand`; full.

```json
{"priority":1,"country":"South Africa","institution_key":"za-university-of-the-witwatersrand","name":"University of the Witwatersrand","country_code":"za","website":"https://www.wits.ac.za/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Johannesburg"},"targets":[]}
```

### South Korea

**Chung-Ang University** — `kr-cau`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-cau","name":"Chung-Ang University","country_code":"kr","website":"https://neweng.cau.ac.kr/","admissions_url":"https://admission.cau.ac.kr/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Selected business, economics and international tracks. Check with the university.","city_hint_unverified":"Seoul and Anseong"},"targets":[]}
```

**Gwangju Institute of Science and Technology** — `kr-gist`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-gist","name":"Gwangju Institute of Science and Technology","country_code":"kr","website":"https://www.gist.ac.kr/en/","admissions_url":"https://www.gist.ac.kr/iuadm/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"The undergraduate College teaches in English with a common curriculum before major selection. Verify current policy.","city_hint_unverified":"Gwangju"},"targets":[]}
```

**Handong Global University** — `kr-handong`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-handong","name":"Handong Global University","country_code":"kr","website":"https://www.handong.edu/eng/","admissions_url":"https://admissions.handong.edu/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"A large share of teaching is in English, including the International Studies, Languages and Literature and Global Management tracks. Check with the university.","city_hint_unverified":"Pohang"},"targets":[]}
```

**Hanyang University** — `kr-hanyang`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-hanyang","name":"Hanyang University","country_code":"kr","website":"https://www.hanyang.ac.kr/web/eng","admissions_url":"https://go.hanyang.ac.kr/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Selected engineering, business and international studies tracks. Check with the university.","city_hint_unverified":"Seoul and Ansan"},"targets":[]}
```

**Kyung Hee University** — `kr-khu`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-khu","name":"Kyung Hee University","country_code":"kr","website":"https://www.khu.ac.kr/eng/","admissions_url":"https://iadmission.khu.ac.kr/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"College of International Studies and selected hospitality and business tracks. Check with the university.","city_hint_unverified":"Seoul and Yongin"},"targets":[]}
```

**Sogang University** — `kr-sogang`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-sogang","name":"Sogang University","country_code":"kr","website":"https://www.sogang.ac.kr/en/home","admissions_url":"https://admission.sogang.ac.kr/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Selected business, economics and international studies courses. Check with the university.","city_hint_unverified":"Seoul"},"targets":[]}
```

**Ulsan National Institute of Science and Technology** — `kr-unist`; full.

```json
{"priority":1,"country":"South Korea","institution_key":"kr-unist","name":"Ulsan National Institute of Science and Technology","country_code":"kr","website":"https://www.unist.ac.kr/","admissions_url":"https://admu-intl.unist.ac.kr/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"UNIST teaches its undergraduate programme in English and has published Fall 2027 admission guidelines for international applicants.","city_hint_unverified":"Ulsan"},"targets":[]}
```

### Thailand

**Chulalongkorn University** — `th-chulalongkorn-university`; full.

```json
{"priority":1,"country":"Thailand","institution_key":"th-chulalongkorn-university","name":"Chulalongkorn University","country_code":"th","website":"https://www.chula.ac.th/en/","admissions_url":"https://www.chula.ac.th/en/academics/admissions/undergraduate-admissions/#requirements-and-additional-information-for-undergraduate-admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Thai; check each degree.","city_hint_unverified":"Bangkok"},"targets":[]}
```

**CMKL University** — `th-cmkl-university`; full.

```json
{"priority":1,"country":"Thailand","institution_key":"th-cmkl-university","name":"CMKL University","country_code":"th","website":"https://www.cmkl.ac.th/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Bangkok"},"targets":[]}
```

### Trinidad and Tobago

**University of the West Indies - Trinidad and Tobago** — `tt-university-of-the-west-indies-trinidad-and-tobago`; full.

```json
{"priority":1,"country":"Trinidad and Tobago","institution_key":"tt-university-of-the-west-indies-trinidad-and-tobago","name":"University of the West Indies - Trinidad and Tobago","country_code":"tt","website":"https://sta.uwi.edu/","admissions_url":"https://sta.uwi.edu/admissions/undergrad/faqs_entrance_requirements.asp","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"St Augustine"},"targets":[]}
```

### Türkiye

**Abdullah Gül University** — `tr-abdullah-gul-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-abdullah-gul-university","name":"Abdullah Gül University","country_code":"tr","website":"https://w3.agu.edu.tr/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kayseri"},"targets":[]}
```

**Bahçeşehir University** — `tr-bahcesehir-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-bahcesehir-university","name":"Bahçeşehir University","country_code":"tr","website":"https://bau.edu.tr/","admissions_url":"https://applybau.com/international","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Turkish; check each degree.","city_hint_unverified":"Istanbul"},"targets":[]}
```

**Bilkent University** — `tr-bilkent-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-bilkent-university","name":"Bilkent University","country_code":"tr","website":"https://w3.bilkent.edu.tr/bilkent/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ankara"},"targets":[]}
```

**Boğaziçi University** — `tr-bogazici-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-bogazici-university","name":"Boğaziçi University","country_code":"tr","website":"https://bogazici.edu.tr/en","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Turkish; check each degree.","city_hint_unverified":"Istanbul"},"targets":[]}
```

**Istanbul Bilgi University** — `tr-istanbul-bilgi-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-istanbul-bilgi-university","name":"Istanbul Bilgi University","country_code":"tr","website":"https://www.bilgi.edu.tr/en/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Istanbul"},"targets":[]}
```

**Koç University** — `tr-koc-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-koc-university","name":"Koç University","country_code":"tr","website":"https://www.ku.edu.tr/en/","admissions_url":"https://international.ku.edu.tr/undergraduate-programs/tuition-and-scholarships/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Istanbul"},"targets":[]}
```

**Sabancı University** — `tr-sabanc-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-sabanc-university","name":"Sabancı University","country_code":"tr","website":"https://www.sabanciuniv.edu/en","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Istanbul"},"targets":[]}
```

**TED University** — `tr-ted-university`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-ted-university","name":"TED University","country_code":"tr","website":"https://www.tedu.edu.tr/en","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ankara"},"targets":[]}
```

**TOBB University of Economics & Technology** — `tr-tobb-university-of-economics-technology`; full.

```json
{"priority":1,"country":"Türkiye","institution_key":"tr-tobb-university-of-economics-technology","name":"TOBB University of Economics & Technology","country_code":"tr","website":"https://www.etu.edu.tr/en","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Turkish; check each degree.","city_hint_unverified":"Ankara"},"targets":[]}
```

### Uganda

**International University of East Africa** — `ug-international-university-of-east-africa`; full.

```json
{"priority":1,"country":"Uganda","institution_key":"ug-international-university-of-east-africa","name":"International University of East Africa","country_code":"ug","website":"https://iuea.ac.ug/","admissions_url":"https://iuea.ac.ug/admissions/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Kampala"},"targets":[]}
```

### United Arab Emirates

**American University in Dubai** — `ae-aud`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-aud","name":"American University in Dubai","country_code":"ae","website":"https://www.aud.edu/","admissions_url":"https://www.aud.edu/admissions/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"American-accredited degrees in business, engineering, architecture, communication, visual communication and interior design.","city_hint_unverified":"Dubai (Al Sufouh)"},"targets":[]}
```

**American University of Sharjah** — `ae-aus`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-aus","name":"American University of Sharjah","country_code":"ae","website":"https://www.aus.edu/","admissions_url":"https://www.aus.edu/admissions/bachelors-degrees","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, on an American model: architecture and design, arts and sciences, business, engineering.","city_hint_unverified":"Sharjah"},"targets":[]}
```

**Canadian University Dubai** — `ae-cud`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-cud","name":"Canadian University Dubai","country_code":"ae","website":"https://www.cud.ac.ae/","admissions_url":"https://www.cud.ac.ae/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Business, engineering, architecture, communication, environmental health and applied sciences, on a Canadian curriculum model.","city_hint_unverified":"Dubai (Sheikh Zayed Road)"},"targets":[]}
```

**Heriot-Watt University Dubai** — `ae-heriot-watt-dubai`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-heriot-watt-dubai","name":"Heriot-Watt University Dubai","country_code":"ae","website":"https://www.hw.ac.uk/dubai","admissions_url":"https://www.hw.ac.uk/dubai/study/apply","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes: engineering, construction, business, computer science, psychology, design and fashion — awarding the Scottish Heriot-Watt degree.","city_hint_unverified":"Dubai (Dubai Knowledge Park)"},"targets":[]}
```

**Khalifa University of Science and Technology** — `ae-khalifa`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-khalifa","name":"Khalifa University of Science and Technology","country_code":"ae","website":"https://www.ku.ac.ae/","admissions_url":"https://www.ku.ac.ae/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes, in engineering, computing, science, medicine and business, taught in English.","city_hint_unverified":"Abu Dhabi"},"targets":[]}
```

**Middlesex University Dubai** — `ae-middlesex-dubai`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-middlesex-dubai","name":"Middlesex University Dubai","country_code":"ae","website":"https://www.mdx.ac.ae/","admissions_url":"https://www.mdx.ac.ae/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"A broad range: business, law, psychology, computing, media, art and design, awarding the UK Middlesex University degree.","city_hint_unverified":"Dubai (Dubai Knowledge Park)"},"targets":[]}
```

**New York University Abu Dhabi** — `ae-nyuad`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-nyuad","name":"New York University Abu Dhabi","country_code":"ae","website":"https://nyuad.nyu.edu/en/","admissions_url":"https://nyuad.nyu.edu/en/apply/undergraduate.html","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"All programmes. A full liberal arts and science curriculum across arts and humanities, engineering, science, social science and interdisciplinary majors, awarding an NYU degree.","city_hint_unverified":"Abu Dhabi (Saadiyat Island)"},"targets":[]}
```

**Rochester Institute of Technology Dubai** — `ae-rit-dubai`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-rit-dubai","name":"Rochester Institute of Technology Dubai","country_code":"ae","website":"https://www.rit.edu/dubai/","admissions_url":"https://www.rit.edu/dubai/undergraduate-admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Engineering, computing, business and information technology, awarding the American RIT degree.","city_hint_unverified":"Dubai (Dubai Silicon Oasis)"},"targets":[]}
```

**Sorbonne University Abu Dhabi** — `ae-sorbonne-abu-dhabi`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-sorbonne-abu-dhabi","name":"Sorbonne University Abu Dhabi","country_code":"ae","website":"https://www.sorbonne.ae/","admissions_url":"https://www.sorbonne.ae/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Three bachelor's degrees taught in English: Physics, Mathematics (Data Science for Artificial Intelligence) and Records Management and Archival Science. Everything else is taught in French and needs a B2 French diploma.","city_hint_unverified":"Abu Dhabi (Al Reem Island)"},"targets":[]}
```

**SP Jain School of Global Management, Dubai** — `ae-sp-jain-dubai`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-sp-jain-dubai","name":"SP Jain School of Global Management, Dubai","country_code":"ae","website":"https://www.spjain.org/","admissions_url":"https://www.spjain.org/programs/undergraduate","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Bachelor of Business Administration and Bachelor of Data Science, taught across three or four campuses in Dubai, Mumbai, Singapore and Sydney.","city_hint_unverified":"Dubai (Dubai International Academic City)"},"targets":[]}
```

**United Arab Emirates University** — `ae-uaeu`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-uaeu","name":"United Arab Emirates University","country_code":"ae","website":"https://www.uaeu.ac.ae/en/","admissions_url":"https://www.uaeu.ac.ae/en/admission/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Most science, engineering, business and medicine programmes are taught in English; some humanities and law programmes are in Arabic.","city_hint_unverified":"Al Ain"},"targets":[]}
```

**University of Birmingham Dubai** — `ae-birmingham-dubai`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-birmingham-dubai","name":"University of Birmingham Dubai","country_code":"ae","website":"https://www.birmingham.ac.uk/dubai","admissions_url":"https://www.birmingham.ac.uk/dubai/study/undergraduate","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Business, economics, computer science, engineering, psychology and education, awarding the University of Birmingham degree.","city_hint_unverified":"Dubai (Dubai International Academic City)"},"targets":[]}
```

**University of Wollongong in Dubai** — `ae-uowd`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-uowd","name":"University of Wollongong in Dubai","country_code":"ae","website":"https://www.uowdubai.ac.ae/","admissions_url":"https://www.uowdubai.ac.ae/admissions","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Business, computer science, engineering, media and communication, and finance, awarding the Australian University of Wollongong degree.","city_hint_unverified":"Dubai (Dubai Knowledge Park)"},"targets":[]}
```

**Zayed University** — `ae-zu`; full.

```json
{"priority":1,"country":"United Arab Emirates","institution_key":"ae-zu","name":"Zayed University","country_code":"ae","website":"https://www.zu.ac.ae/main/en/","admissions_url":"https://www.zu.ac.ae/main/en/undergraduate-programs/admission-criteria","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"country profile only","english_taught_hint_unverified":"Business, communication and media, technological innovation, humanities and social sciences, taught in English.","city_hint_unverified":"Abu Dhabi and Dubai"},"targets":[]}
```

### US Virgin Islands

**University of the Virgin Islands** — `vi-university-of-the-virgin-islands`; full.

```json
{"priority":1,"country":"US Virgin Islands","institution_key":"vi-university-of-the-virgin-islands","name":"University of the Virgin Islands","country_code":"vi","website":"http://www.uvi.edu/","admissions_url":"https://www.uvi.edu/admissions/undergraduate/transfer-equivalencies.html","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Charlotte Amalie"},"targets":[]}
```

### Uzbekistan

**Tashkent Metropolitan University** — `uz-tashkent-metropolitan-university`; full.

```json
{"priority":1,"country":"Uzbekistan","institution_key":"uz-tashkent-metropolitan-university","name":"Tashkent Metropolitan University","country_code":"uz","website":"https://tmuni.org","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Tashkent"},"targets":[]}
```

### Vietnam

**Fulbright University - Vietnam** — `vn-fulbright-university-vietnam`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-fulbright-university-vietnam","name":"Fulbright University - Vietnam","country_code":"vn","website":"https://fulbright.edu.vn/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

**Ho Chi Minh City University of Technology** — `vn-ho-chi-minh-city-university-of-technology`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-ho-chi-minh-city-university-of-technology","name":"Ho Chi Minh City University of Technology","country_code":"vn","website":"https://hcmut.edu.vn/en","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

**RMIT University - Vietnam** — `vn-rmit-university-vietnam`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-rmit-university-vietnam","name":"RMIT University - Vietnam","country_code":"vn","website":"https://www.rmit.edu.vn/","admissions_url":"https://www.rmit.edu.vn/study-at-rmit/scholarships/future-undergraduate-student-scholarships","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

**Swinburne University of Technology - Ho Chi Minh City** — `vn-swinburne-university-of-technology-ho-chi-minh-city`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-swinburne-university-of-technology-ho-chi-minh-city","name":"Swinburne University of Technology - Ho Chi Minh City","country_code":"vn","website":"http://swinburne-vn.edu.vn/","admissions_url":"https://www.swinburne.edu.au/study/international/apply/entry-requirements/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

**Viet Nam National University, Ho Chi Minh City: School of Medicine** — `vn-viet-nam-national-university-ho-chi-minh-city-school-of-medicine`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-viet-nam-national-university-ho-chi-minh-city-school-of-medicine","name":"Viet Nam National University, Ho Chi Minh City: School of Medicine","country_code":"vn","website":"https://www.medvnu.edu.vn/","admissions_url":null,"ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"English and Vietnamese; check each degree.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

**Vietnam National University HCMC: International University** — `vn-vietnam-national-university-hcmc-international-university`; full.

```json
{"priority":1,"country":"Vietnam","institution_key":"vn-vietnam-national-university-hcmc-international-university","name":"Vietnam National University HCMC: International University","country_code":"vn","website":"https://hcmiu.edu.vn/","admissions_url":"https://tuyensinh.hcmiu.edu.vn/tuyen-sinh/admission-requirements-to-international-applicants/","ib_url":null,"mode":"full","gaps":["full"],"existing":{"state":"outline country profile only","english_taught_hint_unverified":"Taught in English.","city_hint_unverified":"Ho Chi Minh City"},"targets":[]}
```

## Priority 2 Partial institution research

### Australia

**Adelaide University** — `au-adelaide`; faculties, overviews.

```json
{"priority":2,"institution_key":"au-adelaide","name":"Adelaide University","country":"Australia","country_code":"au","website":"https://adelaide.edu.au/","admissions_url":"https://adelaide.edu.au/study/international-students/","ib_url":null,"mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Bachelor of Engineering (Civil) (Honours)","credential":"BEng (Hons)","url":"https://adelaide.edu.au/study/degrees/2027/bachelor-of-engineering-civil-honours/int/?student=future"},{"name":"Bachelor of Science","credential":"BSc","url":"https://adelaide.edu.au/study/degrees/2027/bachelor-of-science/int/?student=future"}],"handoff_url":"https://adelaide.edu.au/study/degrees/compare-degrees/","ib_summary_unverified":"Each degree sets a minimum IB total for 2027: Arts, Science and Business 25, Computer Science 26, Civil Engineering 28. Prerequisites such as SACE Mathematical Methods 'or equivalent' apply to some degrees."},"targets":[{"name":"Bachelor of Engineering (Civil) (Honours)","credential":"BEng (Hons)","url":"https://adelaide.edu.au/study/degrees/2027/bachelor-of-engineering-civil-honours/int/?student=future"},{"name":"Bachelor of Science","credential":"BSc","url":"https://adelaide.edu.au/study/degrees/2027/bachelor-of-science/int/?student=future"}]}
```

**Australian National University** — `au-anu`; flagships, overviews.

```json
{"priority":2,"institution_key":"au-anu","name":"Australian National University","country":"Australia","country_code":"au","website":"https://www.anu.edu.au/","admissions_url":"https://study.anu.edu.au/study-options","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":6,"programmes":[{"name":"Bachelor of Politics, Philosophy and Economics","credential":"Bachelor of Politics, Philosophy and Economics","url":"https://programsandcourses.anu.edu.au/2027/program/BPPE"}],"handoff_url":"https://study.anu.edu.au/all-programs-and-courses","ib_summary_unverified":"ANU converts your IB total to an entrance rank: 31 points is rank 80, 33 is 85, 35 is 90, 38 is 94, 41 is 97. Each program sets its rank and some add prerequisites. Results go to ANU through the IB."},"targets":[{"name":"Bachelor of Politics, Philosophy and Economics","credential":"Bachelor of Politics, Philosophy and Economics","url":"https://programsandcourses.anu.edu.au/2027/program/BPPE"}]}
```

**Curtin University** — `au-curtin`; flagships, overviews.

```json
{"priority":2,"institution_key":"au-curtin","name":"Curtin University","country":"Australia","country_code":"au","website":"https://www.curtin.edu.au/","admissions_url":"https://www.curtin.edu.au/study/international-students/","ib_url":"https://www.curtin.edu.au/study/applying/ib-diploma/","mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":4,"programmes":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.curtin.edu.au/study/offering/course-ug-bachelor-of-engineering-honours--bh-engr/"}],"handoff_url":"https://www.curtin.edu.au/study/applying/ib-diploma/","ib_summary_unverified":"A full IB Diploma of at least 24 points covers most degrees; indicative totals rise to 31 for Engineering and Pharmacy, 35 for Law and Physiotherapy, 36 for Actuarial Science and 39 for Medicine, plus prerequisites."},"targets":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.curtin.edu.au/study/offering/course-ug-bachelor-of-engineering-honours--bh-engr/"}]}
```

**Deakin University** — `au-deakin`; faculties, overviews.

```json
{"priority":2,"institution_key":"au-deakin","name":"Deakin University","country":"Australia","country_code":"au","website":"https://www.deakin.edu.au/","admissions_url":"https://www.deakin.edu.au/study","ib_url":null,"mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.deakin.edu.au/course/bachelor-engineering-honours-international"},{"name":"Bachelor of Science","credential":"BSc","url":"https://www.deakin.edu.au/course/bachelor-science-international"}],"handoff_url":"https://www.deakin.edu.au/international-students/choosing-your-degree/undergrad-degrees","ib_summary_unverified":"Deakin sets the IB score per course: open the course page and pick your qualification under 'Find the entry requirement for your country'."},"targets":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.deakin.edu.au/course/bachelor-engineering-honours-international"},{"name":"Bachelor of Science","credential":"BSc","url":"https://www.deakin.edu.au/course/bachelor-science-international"}]}
```

**Griffith University** — `au-griffith`; flagships, faculties.

```json
{"priority":2,"institution_key":"au-griffith","name":"Griffith University","country":"Australia","country_code":"au","website":"https://www.griffith.edu.au/","admissions_url":"https://www.griffith.edu.au/apply/international","ib_url":"https://www.griffith.edu.au/apply/undergraduate-study/international-baccalaureate-diploma","mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.griffith.edu.au/apply/international","ib_summary_unverified":"Griffith welcomes the IB Diploma; each degree lists a minimum ATAR or IB score on its Degree Finder page, plus any portfolio, interview or audition."},"targets":[]}
```

**Macquarie University** — `au-macquarie`; flagships, faculties.

```json
{"priority":2,"institution_key":"au-macquarie","name":"Macquarie University","country":"Australia","country_code":"au","website":"https://www.mq.edu.au/","admissions_url":"https://www.mq.edu.au/study","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.mq.edu.au/study/find-a-course/undergraduate","ib_summary_unverified":"Entry is on your IB total, converted by Macquarie to an international selection rank per program. The conversion tables are on its academic requirements page; Coursefinder lists each program's rank and prerequisites."},"targets":[]}
```

**Queensland University of Technology** — `au-qut`; flagships, faculties, overviews.

```json
{"priority":2,"institution_key":"au-qut","name":"Queensland University of Technology","country":"Australia","country_code":"au","website":"https://www.qut.edu.au/","admissions_url":"https://www.qut.edu.au/study","ib_url":null,"mode":"enrich","gaps":["flagships","faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.qut.edu.au/courses/bachelor-of-engineering-honours"}],"handoff_url":"https://www.qut.edu.au/study/international","ib_summary_unverified":"QUT sets entry thresholds per course and lists the International Baccalaureate Diploma as a qualifying Year 12 route. Check the course page and QUT's IB guide for the IB total; assumed knowledge is in Queensland terms."},"targets":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.qut.edu.au/courses/bachelor-of-engineering-honours"}]}
```

**University of Tasmania** — `au-utas`; flagships, faculties, overviews.

```json
{"priority":2,"institution_key":"au-utas","name":"University of Tasmania","country":"Australia","country_code":"au","website":"https://www.utas.edu.au/","admissions_url":"https://www.utas.edu.au/study/apply","ib_url":"https://www.utas.edu.au/study/apply/admission-requirements/international-baccalaureate","mode":"enrich","gaps":["flagships","faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[{"name":"Bachelor of Marine and Antarctic Science","credential":"Bachelor of Marine and Antarctic Science","url":"https://www.utas.edu.au/courses/sci-eng/courses/p3l-bachelor-of-marine-and-antarctic-science"}],"handoff_url":"https://www.utas.edu.au/study/undergraduate/a-z-listing","ib_summary_unverified":"UTAS recognises the IB Diploma as equivalent to Australian Year 12; an overall score of 24 meets the minimum for most undergraduate programs and some programs ask more. Results can be released by the IB directly."},"targets":[{"name":"Bachelor of Marine and Antarctic Science","credential":"Bachelor of Marine and Antarctic Science","url":"https://www.utas.edu.au/courses/sci-eng/courses/p3l-bachelor-of-marine-and-antarctic-science"}]}
```

**University of Technology Sydney** — `au-uts`; flagships, overviews.

```json
{"priority":2,"institution_key":"au-uts","name":"University of Technology Sydney","country":"Australia","country_code":"au","website":"https://www.uts.edu.au/","admissions_url":"https://www.uts.edu.au/for-students/undergraduate","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":1,"programmes":[{"name":"Bachelor of Engineering (Honours) (Flexible)","credential":"BEng (Hons)","url":"https://www.uts.edu.au/courses/bachelor-of-engineering-honours-flexible"}],"handoff_url":"https://www.uts.edu.au/for-students/undergraduate","ib_summary_unverified":"UTS accepts the full IB Diploma if the total, with bonus and penalty points, meets the course's entry standard. Assumed knowledge is written in HSC terms (Engineering: Maths Extension 1, Physics and English)."},"targets":[{"name":"Bachelor of Engineering (Honours) (Flexible)","credential":"BEng (Hons)","url":"https://www.uts.edu.au/courses/bachelor-of-engineering-honours-flexible"}]}
```

**University of Wollongong** — `au-uow`; flagships, faculties.

```json
{"priority":2,"institution_key":"au-uow","name":"University of Wollongong","country":"Australia","country_code":"au","website":"https://www.uow.edu.au/","admissions_url":"https://www.uow.edu.au/study/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uow.edu.au/study/courses/","ib_summary_unverified":"Entry is on a minimum IB score listed for each degree in UOW's course finder, plus any audition or interview. Meeting the score does not always guarantee a place; relevant IB subjects can earn adjustment points."},"targets":[]}
```

### Denmark

**Business Academy Aarhus** — `dk-baaa`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-baaa","name":"Business Academy Aarhus","country":"Denmark","country_code":"dk","website":"https://www.baaa.dk","admissions_url":"https://www.baaa.dk/programmes/guidelines-on-how-to-apply/apply-for-an-ap-degree-programme/admission-requirements/","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Multimedia Design","credential":"AP","url":"https://www.baaa.dk/programmes/multimedia-design/"}]},"targets":[]}
```

**Dania Academy** — `dk-dania`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-dania","name":"Dania Academy","country":"Denmark","country_code":"dk","website":"https://eadania.com","admissions_url":"https://eadania.com/programmes/cyber-security/","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Cyber Security","credential":"PBA","url":"https://eadania.com/programmes/cyber-security/"}]},"targets":[]}
```

**Royal Danish Academy – Architecture, Design, Conservation** — `dk-royal-danish-academy`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-royal-danish-academy","name":"Royal Danish Academy – Architecture, Design, Conservation","country":"Denmark","country_code":"dk","website":"https://royaldanishacademy.com/en","admissions_url":"https://royaldanishacademy.com/en/crafts-admission-professional-bachelor","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Crafts in Glass and Ceramics","credential":"PBA","url":"https://royaldanishacademy.com/en/programme/craft-glass-and-ceramics"}]},"targets":[]}
```

**SEA – Syddansk Erhvervsakademi** — `dk-sea`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-sea","name":"SEA – Syddansk Erhvervsakademi","country":"Denmark","country_code":"dk","website":"https://www.s-e-a.dk/international","admissions_url":"https://www.s-e-a.dk/international","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Computer Science","credential":"AP","url":"https://www.s-e-a.dk/uddannelser/computer-science"},{"name":"Multimedia Design","credential":"AP","url":"https://www.s-e-a.dk/uddannelser/multimedia-design"}]},"targets":[]}
```

**University College Absalon** — `dk-absalon`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-absalon","name":"University College Absalon","country":"Denmark","country_code":"dk","website":"https://en.phabsalon.dk","admissions_url":"https://en.phabsalon.dk/full-degree-programmes","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Biotechnology","credential":"BEng","url":"https://en.phabsalon.dk/full-degree/bachelor-engineering-biotechnology"},{"name":"Robot Systems","credential":"BEng","url":"https://en.phabsalon.dk/full-degree/bachelor-engineering-robot-systems"}]},"targets":[]}
```

**VIA University College** — `dk-via`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-via","name":"VIA University College","country":"Denmark","country_code":"dk","website":"https://en.via.dk","admissions_url":"https://en.via.dk/programmes/bachelor/admissions-eu","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Architectural Technology and Construction Management","credential":"PBA","url":"https://en.via.dk/programmes/bachelor/architectural-technology"},{"name":"Character Animation","credential":"PBA","url":"https://animationworkshop.via.dk/programmes-and-courses/bachelor-programmes/character-animation"},{"name":"Climate and Supply Engineering","credential":"BEng","url":"https://en.via.dk/programmes/bachelor/climate-supply-engineering"},{"name":"Computer Graphic Arts","credential":"PBA","url":"https://animationworkshop.via.dk/programmes-and-courses/bachelor-programmes/computer-graphic-arts"},{"name":"Construction Technology","credential":"AP","url":"https://en.via.dk/programmes/bachelor/construction-technology-ap-degree"},{"name":"Design, Technology and Business","credential":"AP","url":"https://en.via.dk/programmes/bachelor/design-technology-and-business-ap-degree"},{"name":"Global Business Engineering","credential":"BEng","url":"https://en.via.dk/programmes/bachelor/global-business-engineering"},{"name":"Graphic Storytelling","credential":"PBA","url":"https://animationworkshop.via.dk/programmes-and-courses/bachelor-programmes/graphic-storytelling"},{"name":"Mechanical Engineering","credential":"BEng","url":"https://en.via.dk/programmes/bachelor/mechanical-engineering"},{"name":"Software Technology Engineering","credential":"BEng","url":"https://en.via.dk/programmes/bachelor/software-technology-engineering"},{"name":"Software Technology Engineering – XR","credential":"BEng","url":"https://en.via.dk/programmes/bachelor/software-xr"}]},"targets":[]}
```

**Zealand – Academy of Technologies and Business** — `dk-zealand`; ib-diploma.

```json
{"priority":2,"institution_key":"dk-zealand","name":"Zealand – Academy of Technologies and Business","country":"Denmark","country_code":"dk","website":"https://zealand.com","admissions_url":"https://zealand.com/admission-full-time-degree/","ib_url":null,"mode":"enrich","gaps":["ib-diploma"],"existing":{"state":"canonical institution and programme records","programmes":[{"name":"Architectural Technology and Construction Management","credential":"PBA","url":"https://zealand.com/fuldtid/architectural-technology-and-construction-management/"},{"name":"Cybersecurity","credential":"PBA","url":"https://zealand.com/fuldtid/cybersecurity/"}]},"targets":[]}
```

### Hong Kong

**Hong Kong Shue Yan University** — `hk-hksyu`; flagships.

```json
{"priority":2,"institution_key":"hk-hksyu","name":"Hong Kong Shue Yan University","country":"Hong Kong","country_code":"hk","website":"https://www.hksyu.edu/en/home","admissions_url":"https://uao.hksyu.edu/en/student-admission/non-local_international","ib_url":null,"mode":"enrich","gaps":["flagships"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":4,"programmes":[],"handoff_url":"https://uao.hksyu.edu/en/study","ib_summary_unverified":"IB Diploma with at least 24 points; English shown by IB English grade 4 (HL or SL), IELTS 5.5 or TOEFL iBT 79. Non-local applicants also show Chinese proficiency; some programmes need Cantonese."},"targets":[]}
```

**Lingnan University** — `hk-lingnan`; flagships, overviews.

```json
{"priority":2,"institution_key":"hk-lingnan","name":"Lingnan University","country":"Hong Kong","country_code":"hk","website":"https://www.ln.edu.hk/","admissions_url":"https://www.ln.edu.hk/admissions/","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":5,"programmes":[{"name":"Animation and Digital Arts","credential":"BA (Hons)","url":"https://www.ln.edu.hk/daci/ada/admission/first-year-admission"}],"handoff_url":"https://www.ln.edu.hk/admissions/ug/programme","ib_summary_unverified":"The IB Diploma is a recognised qualification with no points minimum set. English: grade 4 in English A, or English B grade 4 at HL or 5 at SL. Ask the IBO to send your results to Lingnan."},"targets":[{"name":"Animation and Digital Arts","credential":"BA (Hons)","url":"https://www.ln.edu.hk/daci/ada/admission/first-year-admission"}]}
```

**Technological and Higher Education Institute of Hong Kong** — `hk-thei`; flagships, ib-diploma, sources.

```json
{"priority":2,"institution_key":"hk-thei","name":"Technological and Higher Education Institute of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://thei.edu.hk/","admissions_url":"https://thei.edu.hk/admission/undergraduate/","ib_url":null,"mode":"enrich","gaps":["flagships","ib-diploma","sources"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":6,"programmes":[],"handoff_url":"https://thei.edu.hk/admission/international-student-fee/programme-information/","ib_summary_unverified":"Non-local qualifications are assessed individually by each department; no IB points are published. English: IB English B grade 4 at HL or 5 at SL, or English A grade 4. Design programmes need a portfolio."},"targets":[]}
```

**The Hang Seng University of Hong Kong** — `hk-hsuhk`; flagships, overviews.

```json
{"priority":2,"institution_key":"hk-hsuhk","name":"The Hang Seng University of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://www.hsu.edu.hk/en/","admissions_url":"https://www.hsu.edu.hk/en/admissions/","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":5,"programmes":[{"name":"Actuarial Studies and Insurance","credential":"Bachelor of Science (Honours)","url":"https://msi.hsu.edu.hk/en/ain/programme-information/"}],"handoff_url":"https://admission.hsu.edu.hk/programmes/by-schools/","ib_summary_unverified":"IB Diploma of 24 points (three HL and three SL subjects, 12 or more from HL). English is shown by an IELTS 5.5 or TOEFL iBT 70 result; Actuarial Studies needs Maths grade 5. Most modules are taught in English."},"targets":[{"name":"Actuarial Studies and Insurance","credential":"Bachelor of Science (Honours)","url":"https://msi.hsu.edu.hk/en/ain/programme-information/"}]}
```

### Ireland

**Dundalk Institute of Technology** — `ie-dkit`; flagships, faculties.

```json
{"priority":2,"institution_key":"ie-dkit","name":"Dundalk Institute of Technology","country":"Ireland","country_code":"ie","website":"https://www.dkit.ie/","admissions_url":"https://www.dkit.ie/courses/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.dkit.ie/courses?course_type=20&study_mode=4452","ib_summary_unverified":"Six subjects with Maths and English (or Irish) for every honours degree; no third language. Some ask more: Mechanical Engineering Maths SL 6 or HL 4; Midwifery a lab science (2026-entry pages)."},"targets":[]}
```

### Japan

**Temple University, Japan Campus** — `jp-tuj`; flagships, faculties.

```json
{"priority":2,"institution_key":"jp-tuj","name":"Temple University, Japan Campus","country":"Japan","country_code":"jp","website":"https://www.tuj.ac.jp/","admissions_url":"https://www.tuj.ac.jp/ug/admissions","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.tuj.ac.jp/ug/academics","ib_summary_unverified":"Applicants need the full IB Diploma: predicted grades while at school, then the official IB transcript. Non-native speakers submit TOEFL, IELTS or a similar English test. No minimum IB score is published."},"targets":[]}
```

### New Zealand

**Auckland University of Technology** — `nz-aut`; faculties, overviews.

```json
{"priority":2,"institution_key":"nz-aut","name":"Auckland University of Technology","country":"New Zealand","country_code":"nz","website":"https://www.aut.ac.nz/","admissions_url":"https://www.aut.ac.nz/study","ib_url":"https://www.aut.ac.nz/study/entry-requirements","mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Bachelor of International Hospitality Management","credential":"Bachelor of International Hospitality Management","url":"https://www.aut.ac.nz/study/study-options/hospitality-tourism-and-events/courses/bachelor-of-international-hospitality-management"},{"name":"Bachelor of Sport, Exercise and Health","credential":"Bachelor of Sport, Exercise and Health","url":"https://www.aut.ac.nz/study/study-options/sport-and-recreation/courses/bachelor-of-sport-exercise-and-health"}],"handoff_url":"https://www.aut.ac.nz/international/study-options-for-international-students","ib_summary_unverified":"International Baccalaureate with successful completion of a minimum of 24 points meets the bachelor's entry requirement; some programmes ask more or add a portfolio, interview or English test."},"targets":[{"name":"Bachelor of International Hospitality Management","credential":"Bachelor of International Hospitality Management","url":"https://www.aut.ac.nz/study/study-options/hospitality-tourism-and-events/courses/bachelor-of-international-hospitality-management"},{"name":"Bachelor of Sport, Exercise and Health","credential":"Bachelor of Sport, Exercise and Health","url":"https://www.aut.ac.nz/study/study-options/sport-and-recreation/courses/bachelor-of-sport-exercise-and-health"}]}
```

**Massey University** — `nz-massey`; faculties, overviews.

```json
{"priority":2,"institution_key":"nz-massey","name":"Massey University","country":"New Zealand","country_code":"nz","website":"https://www.massey.ac.nz/","admissions_url":"https://www.massey.ac.nz/study/","ib_url":"https://www.massey.ac.nz/study/entry-requirements-to-study-at-massey/calculating-preferential-entry-scores-if-places-are-limited/","mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Bachelor of Veterinary Science (pre-selection semester)","credential":"BVSc","campus":"Palmerston North","url":"https://www.massey.ac.nz/study/all-qualifications-and-degrees/bachelor-of-veterinary-science-pre-selection-UBVSP/"},{"name":"Bachelor of Aviation","credential":"BAv","campus":"Palmerston North","url":"https://www.massey.ac.nz/study/all-qualifications-and-degrees/bachelor-of-aviation-UBAVT/"}],"handoff_url":"https://www.massey.ac.nz/study/international-students/qualifications-and-courses-for-international-students/","ib_summary_unverified":"A complete IB Diploma of 24 points is the entry requirement. If places are limited, your IB total is your rank score and the preferential entry score for most undergraduate degrees is 26."},"targets":[{"name":"Bachelor of Veterinary Science (pre-selection semester)","credential":"BVSc","campus":"Palmerston North","url":"https://www.massey.ac.nz/study/all-qualifications-and-degrees/bachelor-of-veterinary-science-pre-selection-UBVSP/"},{"name":"Bachelor of Aviation","credential":"BAv","campus":"Palmerston North","url":"https://www.massey.ac.nz/study/all-qualifications-and-degrees/bachelor-of-aviation-UBAVT/"}]}
```

**University of Waikato** — `nz-waikato`; faculties, overviews.

```json
{"priority":2,"institution_key":"nz-waikato","name":"University of Waikato","country":"New Zealand","country_code":"nz","website":"https://www.waikato.ac.nz/","admissions_url":"https://www.waikato.ac.nz/study/","ib_url":null,"mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Bachelor of Computer Science","credential":"Bachelor of Computer Science","url":"https://www.waikato.ac.nz/study/subjects/computer-science/"},{"name":"Bachelor of Laws","credential":"LLB","url":"https://www.waikato.ac.nz/study/options/subject-areas/law/"}],"handoff_url":"https://www.waikato.ac.nz/int/study/apply/international/","ib_summary_unverified":"A completed IB Diploma with a minimum of 24 points. Applicants also show English proficiency; the entry page lists the IB Diploma among the accepted evidence, with waivers for some."},"targets":[{"name":"Bachelor of Computer Science","credential":"Bachelor of Computer Science","url":"https://www.waikato.ac.nz/study/subjects/computer-science/"},{"name":"Bachelor of Laws","credential":"LLB","url":"https://www.waikato.ac.nz/study/options/subject-areas/law/"}]}
```

### Singapore

**National University of Singapore** — `sg-nus`; flagships, overviews.

```json
{"priority":2,"institution_key":"sg-nus","name":"National University of Singapore","country":"Singapore","country_code":"sg","website":"https://www.nus.edu.sg/","admissions_url":"https://www.nus.edu.sg/oam/apply-to-nus/international-qualifications","ib_url":"https://www.nus.edu.sg/oam/apply-to-nus/international-qualifications/international-baccalaureate-diploma","mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":6,"programmes":[{"name":"Computer Science","credential":"Bachelor of Computing (Honours)","url":"https://www.comp.nus.edu.sg/programmes/ug/cs/"}],"handoff_url":"https://nus.edu.sg/oam/undergraduate-programmes","ib_summary_unverified":"Open to IB Diploma holders of any nationality; English must be one of your IB subjects. May 2027 sitters apply on school-attested predicted results and NUS must receive the IB transcript by 6 July 2027."},"targets":[{"name":"Computer Science","credential":"Bachelor of Computing (Honours)","url":"https://www.comp.nus.edu.sg/programmes/ug/cs/"}]}
```

### Switzerland

**Franklin University Switzerland** — `ch-franklin`; faculties, overviews.

```json
{"priority":2,"institution_key":"ch-franklin","name":"Franklin University Switzerland","country":"Switzerland","country_code":"ch","website":"https://www.fus.edu/","admissions_url":"https://www.fus.edu/admissions-and-aid/applying-to-franklin/undergraduate-programs","ib_url":null,"mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[{"name":"Health Sciences","credential":"BS","url":"https://www.fus.edu/academics/undergraduate-programs/majors/health-sciences"},{"name":"International Relations","credential":"BA","url":"https://www.fus.edu/academics/undergraduate-programs/majors/international-relations"},{"name":"Environmental Sciences and Studies","credential":"BS or BA","url":"https://www.fus.edu/academics/undergraduate-programs/majors/environmental-studies"}],"handoff_url":"https://www.fus.edu/academics/undergraduate-programs/majors","ib_summary_unverified":"Admission rests on your school record, a personal statement and one evaluation letter; the IB can earn advanced-standing credit. Non-English-medium applicants need TOEFL 90, IELTS 6.5 or Duolingo 110."},"targets":[{"name":"Health Sciences","credential":"BS","url":"https://www.fus.edu/academics/undergraduate-programs/majors/health-sciences"},{"name":"International Relations","credential":"BA","url":"https://www.fus.edu/academics/undergraduate-programs/majors/international-relations"},{"name":"Environmental Sciences and Studies","credential":"BS or BA","url":"https://www.fus.edu/academics/undergraduate-programs/majors/environmental-studies"}]}
```

### United States

**Amherst College** — `us-amherst`; flagships, faculties.

```json
{"priority":2,"institution_key":"us-amherst","name":"Amherst College","country":"United States","country_code":"us","website":"https://www.amherst.edu/","admissions_url":"https://www.amherst.edu/admission","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.amherst.edu/academiclife/departments","ib_summary_unverified":"No IB points minimum is published. IB courses count as evidence of ambition and preparation but earn no credit or advanced standing. SAT or ACT scores are optional."},"targets":[]}
```

**Arizona State University** — `us-asu`; flagships, faculties, overviews.

```json
{"priority":2,"institution_key":"us-asu","name":"Arizona State University","country":"United States","country_code":"us","website":"https://www.asu.edu/","admissions_url":"https://admission.asu.edu/apply/international","ib_url":null,"mode":"enrich","gaps":["flagships","faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[{"name":"Electrical Engineering","credential":"Bachelor of Science in Engineering (BSE)","url":"https://degrees.asu.edu/bachelors/major/ASU00/ESEEEBSE/electrical-engineering"}],"handoff_url":"https://degrees.asu.edu/bachelors/major-list/letter/all","ib_summary_unverified":"No IB points minimum is published. ASU asks for a 3.00 (B) grade average from secondary school and a diploma, plus English proficiency; its page has an IB Diploma credential guide."},"targets":[{"name":"Electrical Engineering","credential":"Bachelor of Science in Engineering (BSE)","url":"https://degrees.asu.edu/bachelors/major/ASU00/ESEEEBSE/electrical-engineering"}]}
```

**Bowdoin College** — `us-bowdoin`; flagships, faculties.

```json
{"priority":2,"institution_key":"us-bowdoin","name":"Bowdoin College","country":"United States","country_code":"us","website":"https://www.bowdoin.edu/","admissions_url":"https://www.bowdoin.edu/admissions/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.bowdoin.edu/admissions/at-a-glance/","ib_summary_unverified":"No minimum IB score is set. IB applicants in their final year send predicted grades, and final results once they have graduated. SAT scores are optional."},"targets":[]}
```

**Colby College** — `us-colby`; flagships, faculties.

```json
{"priority":2,"institution_key":"us-colby","name":"Colby College","country":"United States","country_code":"us","website":"https://www.colby.edu/","admissions_url":"https://afa.colby.edu/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.colby.edu/academics/majors-and-minors/","ib_summary_unverified":"No IB score minimum is set; review is holistic. Colby asks for the most rigorous courses your school offers, at least 20 core academic units. SAT and ACT scores are optional."},"targets":[]}
```

**Grinnell College** — `us-grinnell`; flagships, faculties.

```json
{"priority":2,"institution_key":"us-grinnell","name":"Grinnell College","country":"United States","country_code":"us","website":"https://www.grinnell.edu/","admissions_url":"https://www.grinnell.edu/admission","ib_url":"https://www.grinnell.edu/admission/apply/international","mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.grinnell.edu/academics/majors-concentrations","ib_summary_unverified":"No minimum IB score is published. Official IB results are required as external exam results; SAT or ACT scores are optional. Fall 2027 applicants who need it show English proficiency."},"targets":[]}
```

**Harvard University** — `us-harvard`; faculties, overviews.

```json
{"priority":2,"institution_key":"us-harvard","name":"Harvard University","country":"United States","country_code":"us","website":"https://www.harvard.edu/","admissions_url":"https://college.harvard.edu/admissions/apply/first-year-applicants","ib_url":"https://college.harvard.edu/financial-aid/how-aid-works","mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Economics","credential":"Bachelor of Arts (AB)","url":"https://www.harvard.edu/programs/economics/"},{"name":"Computer Science","credential":"Bachelor of Arts (AB)","url":"https://www.harvard.edu/programs/computer-science/"}],"handoff_url":"https://college.harvard.edu/academics/liberal-arts-sciences/concentrations","ib_summary_unverified":"No IB points minimum is published. Your school sends predicted IB grades and you send final results in mid-July; Harvard still expects SAT or ACT scores from IB students."},"targets":[{"name":"Economics","credential":"Bachelor of Arts (AB)","url":"https://www.harvard.edu/programs/economics/"},{"name":"Computer Science","credential":"Bachelor of Arts (AB)","url":"https://www.harvard.edu/programs/computer-science/"}]}
```

**Macalester College** — `us-macalester`; flagships, faculties.

```json
{"priority":2,"institution_key":"us-macalester","name":"Macalester College","country":"United States","country_code":"us","website":"https://www.macalester.edu/","admissions_url":"https://www.macalester.edu/admissions/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":0,"faculty_count":0,"programmes":[],"handoff_url":"https://www.macalester.edu/admissions/academics-at-macalester/","ib_summary_unverified":"No minimum IB score is published. Applicants still in school include predicted IB results with their transcript; test scores (ACT or SAT) and English proficiency tests are optional."},"targets":[]}
```

**Massachusetts Institute of Technology** — `us-mit`; flagships, faculties, overviews.

```json
{"priority":2,"institution_key":"us-mit","name":"Massachusetts Institute of Technology","country":"United States","country_code":"us","website":"https://www.mit.edu/","admissions_url":"https://mitadmissions.org/","ib_url":"https://firstyear.mit.edu/academics-exploration/ap-transfer-credit/international-examinations/","mode":"enrich","gaps":["flagships","faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[{"name":"Electrical Engineering and Computer Science","credential":"Bachelor of Science (SB)","url":"https://www.eecs.mit.edu/academics/undergraduate-programs/"}],"handoff_url":"https://mitadmissions.org/discover/the-mit-education/majors-minors/","ib_summary_unverified":"No IB points minimum is published. Your school sends predicted IB grades if available; only admitted students send final results. SAT or ACT is required."},"targets":[{"name":"Electrical Engineering and Computer Science","credential":"Bachelor of Science (SB)","url":"https://www.eecs.mit.edu/academics/undergraduate-programs/"}]}
```

**New York University** — `us-nyu`; flagships, overviews.

```json
{"priority":2,"institution_key":"us-nyu","name":"New York University","country":"United States","country_code":"us","website":"https://www.nyu.edu/","admissions_url":"https://www.nyu.edu/admissions/undergraduate-admissions.html","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":4,"programmes":[{"name":"Business and Political Economy","credential":"Bachelor of Science (BS)","url":"https://www.stern.nyu.edu/programs-admissions/undergraduate/academics/bs-degree-business-and-political-economy/bpe-curriculum-overview"}],"handoff_url":"https://www.nyu.edu/admissions/undergraduate-admissions/majors-and-programs.html","ib_summary_unverified":"No IB points minimum is published. Finishing the IB Diploma qualifies you to apply as an international applicant; if results are not out, your school sends predicted scores and official results follow."},"targets":[{"name":"Business and Political Economy","credential":"Bachelor of Science (BS)","url":"https://www.stern.nyu.edu/programs-admissions/undergraduate/academics/bs-degree-business-and-political-economy/bpe-curriculum-overview"}]}
```

**Stanford University** — `us-stanford`; flagships, faculties, overviews.

```json
{"priority":2,"institution_key":"us-stanford","name":"Stanford University","country":"United States","country_code":"us","website":"https://www.stanford.edu/","admissions_url":"https://admission.stanford.edu/","ib_url":null,"mode":"enrich","gaps":["flagships","faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[{"name":"Computer Science","credential":"Bachelor of Science (BS)","url":"https://majors.stanford.edu/majors/computer-science"}],"handoff_url":"https://majors.stanford.edu/majors","ib_summary_unverified":"No courses or minimum scores are required for admission. Stanford reads IB results in the context of your school and country, with no GPA conversion; SAT or ACT scores are required."},"targets":[{"name":"Computer Science","credential":"Bachelor of Science (BS)","url":"https://majors.stanford.edu/majors/computer-science"}]}
```

**University of Illinois Urbana-Champaign** — `us-illinois`; faculties, overviews.

```json
{"priority":2,"institution_key":"us-illinois","name":"University of Illinois Urbana-Champaign","country":"United States","country_code":"us","website":"https://illinois.edu/","admissions_url":"https://www.admissions.illinois.edu/","ib_url":null,"mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Computer Science","credential":"Bachelor of Science (BS)","url":"https://siebelschool.illinois.edu/academics/undergraduate/degree-program-options"},{"name":"Accountancy","credential":"Bachelor of Science (BS)","url":"https://giesbusiness.illinois.edu/academics/majors-and-minors/accounting"}],"handoff_url":"https://admissions.illinois.edu/majors-academics/","ib_summary_unverified":"No IB points minimum: Illinois says it does not use the total diploma number. It reads your IB term grades for years 9 to 11 and in-progress year 12 courses, entered by hand in the Common App."},"targets":[{"name":"Computer Science","credential":"Bachelor of Science (BS)","url":"https://siebelschool.illinois.edu/academics/undergraduate/degree-program-options"},{"name":"Accountancy","credential":"Bachelor of Science (BS)","url":"https://giesbusiness.illinois.edu/academics/majors-and-minors/accounting"}]}
```

**University of Michigan-Ann Arbor** — `us-michigan`; flagships, overviews.

```json
{"priority":2,"institution_key":"us-michigan","name":"University of Michigan-Ann Arbor","country":"United States","country_code":"us","website":"https://umich.edu/","admissions_url":"https://admissions.umich.edu/","ib_url":null,"mode":"enrich","gaps":["flagships","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":1,"faculty_count":2,"programmes":[{"name":"Bachelor of Business Administration","credential":"Bachelor of Business Administration (BBA)","url":"https://michiganross.umich.edu/undergraduate/bba"}],"handoff_url":"https://admissions.umich.edu/academics-majors/majors-degrees","ib_summary_unverified":"No IB points minimum is published. Admission weighs the strength of your curriculum (IB Diploma counts as rigour) with grades, essays and optional SAT or ACT. IB HL exams earn credit only after admission."},"targets":[{"name":"Bachelor of Business Administration","credential":"Bachelor of Business Administration (BBA)","url":"https://michiganross.umich.edu/undergraduate/bba"}]}
```

**Yale University** — `us-yale`; faculties, overviews.

```json
{"priority":2,"institution_key":"us-yale","name":"Yale University","country":"United States","country_code":"us","website":"https://www.yale.edu/","admissions_url":"https://admissions.yale.edu/","ib_url":"https://admissions.yale.edu/standardized-testing","mode":"enrich","gaps":["faculties","overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[{"name":"Global Affairs","credential":"Bachelor of Arts (BA)","url":"https://jackson.yale.edu/academics/the-global-affairs-major/"},{"name":"Computer Science","credential":"BA or BS","url":"https://engineering.yale.edu/computer-science/"}],"handoff_url":"https://admissions.yale.edu/majors","ib_summary_unverified":"No IB points minimum is published. Predicted IB scores may be submitted but are not required. IB scores do not replace the SAT or ACT, which Yale requires."},"targets":[{"name":"Global Affairs","credential":"Bachelor of Arts (BA)","url":"https://jackson.yale.edu/academics/the-global-affairs-major/"},{"name":"Computer Science","credential":"BA or BS","url":"https://engineering.yale.edu/computer-science/"}]}
```

## Priority 3 Programme descriptions

### Australia

**Monash University** — `au-monash`; overviews.

```json
{"priority":3,"institution_key":"au-monash","name":"Monash University","country":"Australia","country_code":"au","website":"https://www.monash.edu/","admissions_url":"https://www.monash.edu/study","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://www.monash.edu/study/courses/find-a-course","ib_summary_unverified":"Each course sets an IB total for 2027 entry: Arts 26, Business 27, Science 28, Engineering 30. English at SL 4 or HL 3 is required, and some courses list maths or science prerequisites."},"targets":[{"name":"Bachelor of Science","credential":"BSc","url":"https://www.monash.edu/study/courses/find-a-course/science-s2000"},{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.monash.edu/study/courses/find-a-course/engineering-e3001"}]}
```

**RMIT University** — `au-rmit`; overviews.

```json
{"priority":3,"institution_key":"au-rmit","name":"RMIT University","country":"Australia","country_code":"au","website":"https://www.rmit.edu.au/","admissions_url":"https://www.rmit.edu.au/study-with-us","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":3,"programmes":[],"handoff_url":"https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study","ib_summary_unverified":"RMIT converts each degree's Australian entry score to IB: 65% is 25 points, 70% is 27, 75% is 29, 80% is 31, 85% is 33, 90% is 35. Totals include bonus and penalty points."},"targets":[{"name":"Bachelor of Business","credential":"Bachelor of Business","url":"https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-business-bp343"},{"name":"Bachelor of Computer Science","credential":"Bachelor of Computer Science","url":"https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-computer-science-bp094"}]}
```

**University of Melbourne** — `au-melbourne`; overviews.

```json
{"priority":3,"institution_key":"au-melbourne","name":"University of Melbourne","country":"Australia","country_code":"au","website":"https://www.unimelb.edu.au/","admissions_url":"https://study.unimelb.edu.au/how-to-apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://study.unimelb.edu.au/study-with-us/undergraduate-courses","ib_summary_unverified":"Each degree sets an IB total: 27 for Arts, 31 Science, 34 Commerce and Biomedicine, 37 Oral Health, plus English and maths or science at a grade 4. Predicted grades are accepted for a conditional offer."},"targets":[{"name":"Bachelor of Science","credential":"BSc","url":"https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-science/"},{"name":"Bachelor of Biomedicine","credential":"Bachelor of Biomedicine","url":"https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-biomedicine/"}]}
```

**University of Queensland** — `au-uq`; overviews.

```json
{"priority":3,"institution_key":"au-uq","name":"University of Queensland","country":"Australia","country_code":"au","website":"https://www.uq.edu.au/","admissions_url":"https://study.uq.edu.au/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://study.uq.edu.au/study-options/undergraduate","ib_summary_unverified":"Each program lists an IB score from last year's lowest offer: Science 30.25, Commerce 31, Engineering 32. Prerequisites are Queensland subjects (English, Maths Methods, Chemistry or Physics) with IB equivalents."},"targets":[{"name":"Bachelor of Science","credential":"BSc","url":"https://study.uq.edu.au/study-options/programs/bachelor-science-2461"},{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://study.uq.edu.au/study-options/programs/bachelor-engineering-honours-2455"}]}
```

**University of Sydney** — `au-sydney`; overviews.

```json
{"priority":3,"institution_key":"au-sydney","name":"University of Sydney","country":"Australia","country_code":"au","website":"https://www.sydney.edu.au/","admissions_url":"https://www.sydney.edu.au/study.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":7,"programmes":[],"handoff_url":"https://www.sydney.edu.au/study/study-options/undergraduate-courses.html","ib_summary_unverified":"Entry is on your total IB score, converted to an ATAR equivalent. 2027 totals: Arts 26, Science 29, Advanced Computing 34, Engineering 31, Commerce 38, Physiotherapy 40. Maths and science are assumed, not required."},"targets":[{"name":"Bachelor of Advanced Computing","credential":"Bachelor of Advanced Computing","url":"https://www.sydney.edu.au/courses/courses/uc/bachelor-of-advanced-computing.html"},{"name":"Bachelor of Commerce","credential":"Bachelor of Commerce","url":"https://www.sydney.edu.au/courses/courses/uc/bachelor-of-commerce.html"}]}
```

**University of Western Australia** — `au-uwa`; overviews.

```json
{"priority":3,"institution_key":"au-uwa","name":"University of Western Australia","country":"Australia","country_code":"au","website":"https://www.uwa.edu.au/home","admissions_url":"https://www.uwa.edu.au/study","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://www.uwa.edu.au/study/explore-courses/undergraduate","ib_summary_unverified":"UWA converts IB totals to an ATAR equivalent: 24 points is 70, 27 is 80, 30 is 85, 32 is 90, 35 is 94. English A needs SL 4 or HL 3; prerequisites are WA courses with published IB equivalents."},"targets":[{"name":"Bachelor of Science","credential":"BSc","url":"https://www.uwa.edu.au/study/courses/bachelor-of-science"},{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.uwa.edu.au/study/courses/bachelor-of-engineering-honours"}]}
```

**UNSW Sydney** — `au-unsw`; overviews.

```json
{"priority":3,"institution_key":"au-unsw","name":"UNSW Sydney","country":"Australia","country_code":"au","website":"https://www.unsw.edu.au/","admissions_url":"https://www.unsw.edu.au/study","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://www.unsw.edu.au/study/find-a-degree-or-course","ib_summary_unverified":"The 2027 international table gives each degree an IB total: Arts 29, Science 29, Engineering 35, Commerce 36, Law 36, Medical Studies/MD 40. It is a guide only; actual requirements may be higher or lower."},"targets":[{"name":"Bachelor of Engineering (Honours)","credential":"BEng (Hons)","url":"https://www.unsw.edu.au/study/undergraduate/bachelor-of-engineering-honours"},{"name":"Bachelor of Commerce","credential":"Bachelor of Commerce","url":"https://www.unsw.edu.au/study/undergraduate/bachelor-of-commerce"}]}
```

### Austria

**IMC Krems University of Applied Sciences** — `at-imc-krems`; overviews.

```json
{"priority":3,"institution_key":"at-imc-krems","name":"IMC Krems University of Applied Sciences","country":"Austria","country_code":"at","website":"https://www.imc.ac.at/en/","admissions_url":"https://www.imc.ac.at/en/study/application/online-application/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":8,"faculty_count":0,"programmes":[],"handoff_url":"https://www.imc.ac.at/en/study/bachelor/overview-of-our-bachelor-programmes/","ib_summary_unverified":"The ministry says an IB Diploma needs no equivalence check; IMC says it checks foreign certificates after you apply and may set extra exams. English is judged at your interview; no certificate needed."},"targets":[{"name":"Business Administration","credential":"Bachelor of Arts in Business","url":"https://www.imc.ac.at/en/study/bachelor/business/business-administration/"},{"name":"International Business Management","credential":"Bachelor of Arts in Business","url":"https://www.imc.ac.at/en/study/bachelor/business/international-business-management/"},{"name":"International Wine Business","credential":"Bachelor of Arts in Business","url":"https://www.imc.ac.at/en/study/bachelor/business/international-wine-business/"},{"name":"StartUp Management","credential":"Bachelor of Arts in Business","url":"https://www.imc.ac.at/en/study/bachelor/business/startup-management/"},{"name":"Tourism and Leisure Management","credential":"Bachelor of Arts in Business","url":"https://www.imc.ac.at/en/study/bachelor/business/tourism-and-leisure-management/"},{"name":"Chemistry","credential":"Bachelor of Science in Engineering","url":"https://www.imc.ac.at/en/study/bachelor/science-technology/chemistry/"},{"name":"Informatics","credential":"Bachelor of Science in Engineering","url":"https://www.imc.ac.at/en/study/bachelor/science-technology/informatics/"},{"name":"Medical and Pharmaceutical Biotechnology","credential":"Bachelor of Science in Engineering","url":"https://www.imc.ac.at/en/study/bachelor/science-technology/medical-and-pharmaceutical-biotechnology/"}]}
```

**Johannes Kepler University Linz** — `at-jku`; overviews.

```json
{"priority":3,"institution_key":"at-jku","name":"Johannes Kepler University Linz","country":"Austria","country_code":"at","website":"https://www.jku.at/en/","admissions_url":"https://www.jku.at/en/degree-programs/students/start-your-studies/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.jku.at/en/degree-programs/prospective-students/register-to-enroll/bachelors-degree-diploma-degree/","ib_summary_unverified":"Austria accepts the IB Diploma without an equivalence check (ministry); JKU adds no IB points rule. English-taught degrees need English B2: English A 4+, or B 5 (HL) / 6 (SL). C1: A 6+ or B HL 7."},"targets":[{"name":"Artificial Intelligence","credential":"BSc","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/"},{"name":"Biological Chemistry","credential":"BSc and Czech Bc (double degree)","campus":"Linz and České Budějovice","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-biological-chemistry/"},{"name":"Chemistry and Chemical Technology","credential":"BSc","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-chemistry-and-chemical-technology/"},{"name":"International Business Administration","credential":"BSc","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-international-business-administration/"},{"name":"Quantum Science and Technology","credential":"BSc","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-quantum-science-and-technology/"},{"name":"Transformation Studies. Art x Science","credential":"BA","campus":"Linz and Vienna","url":"https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-transformation-studies-art-x-science/"}]}
```

**MCI - The Entrepreneurial School** — `at-mci`; overviews.

```json
{"priority":3,"institution_key":"at-mci","name":"MCI - The Entrepreneurial School","country":"Austria","country_code":"at","website":"https://www.mci.edu/en/","admissions_url":"https://www.mci.edu/en/study-at-mci/application-admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.mci.edu/en/study/bachelor","ib_summary_unverified":"Austria accepts the IB Diploma without an equivalence check (ministry). Selection: online application (CV, motivation letter), then an online interview. No IB-specific or English test rule is published."},"targets":[{"name":"Business & Management","credential":"Bachelor of Arts in Business","url":"https://www.mci.edu/en/study/bachelor/business-management"},{"name":"Entrepreneurship, Tourism & Leisure Business","credential":"BA","url":"https://www.mci.edu/en/study/bachelor/entrepreneurship-tourism-leisure-business"},{"name":"Business Administration (Online)","credential":"Bachelor of Arts in Business","url":"https://www.mci.edu/en/study/bachelor/business-administration"}]}
```

**MODUL University Vienna** — `at-modul`; overviews.

```json
{"priority":3,"institution_key":"at-modul","name":"MODUL University Vienna","country":"Austria","country_code":"at","website":"https://www.modul.ac.at/","admissions_url":"https://www.modul.ac.at/study-at-mu/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://www.modul.ac.at/programs/bachelor-programs","ib_summary_unverified":"IB Diploma with at least 24 points, plus maths: AA or AI at 4 (SL) or 3 (HL); lower means a maths foundation course in semester 1. IB Certificates need a foundation semester and an entrance exam."},"targets":[{"name":"BSc in Applied Data Science","credential":"BSc","url":"https://www.modul.ac.at/programs/bachelor-programs/bsc-applied-data-science"},{"name":"BSc in Human Resources Management","credential":"BSc","url":"https://www.modul.ac.at/programs/bachelor-programs/bsc-hr-management"},{"name":"BSc in International Management","credential":"BSc","url":"https://www.modul.ac.at/programs/bachelor-programs/bsc-international-management"},{"name":"BSc in International Management with Professional Experience","credential":"BSc","url":"https://www.modul.ac.at/programs/bachelor-programs/bsc-international-management-with-professional-experience"},{"name":"BA in International Relations and Sustainability","credential":"BA","url":"https://www.modul.ac.at/programs/bachelor-programs/ba-international-relations-and-sustainability"},{"name":"BBA in Tourism and Hospitality Management","credential":"BBA","url":"https://www.modul.ac.at/programs/bachelor-programs/bba-tourism-and-hospitality-management"},{"name":"BBA in Tourism, Hotel Management and Operations","credential":"BBA","url":"https://www.modul.ac.at/programs/bachelor-programs/bba-tourism--hotel-management---operations"}]}
```

**University of Klagenfurt** — `at-aau`; overviews.

```json
{"priority":3,"institution_key":"at-aau","name":"University of Klagenfurt","country":"Austria","country_code":"at","website":"https://www.aau.at/en/","admissions_url":"https://www.aau.at/en/study/studying-at-aau/applying/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.aau.at/en/international/international-profile/degree-programmes-in-english/","ib_summary_unverified":"Austria accepts the IB Diploma without an equivalence check (ministry); AAU adds no IB rule. English-taught degrees need English B2, which an EU/EEA school-leaving English pass proves; no German needed."},"targets":[{"name":"Digital Media, Culture, and Communication","credential":"BA","url":"https://www.aau.at/en/studien/bachelor-digital-media-culture-and-communication/"},{"name":"Information and Communications Engineering","credential":"BSc","url":"https://www.aau.at/en/studien/bachelor-information-and-communications-engineering/"},{"name":"International Business and Economics","credential":"BSc","url":"https://www.aau.at/en/studien/bachelor-international-business-and-economics/"},{"name":"Robotics and Artificial Intelligence","credential":"BSc","url":"https://www.aau.at/en/studien/bachelor-robotics-artificial-intelligence/"},{"name":"Social Sciences","credential":"BA","url":"https://www.aau.at/en/studien/bachelor-social-sciences/"},{"name":"Worlds of English","credential":"BA","url":"https://www.aau.at/en/studien/bachelor-english-and-american-studies/"}]}
```

**University of Vienna** — `at-uni-wien`; overviews.

```json
{"priority":3,"institution_key":"at-uni-wien","name":"University of Vienna","country":"Austria","country_code":"at","website":"https://www.univie.ac.at/en/","admissions_url":"https://studieren.univie.ac.at/en/admission/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://aufnahmeverfahren.univie.ac.at/en/mathematical-foundations-of-data-science","ib_summary_unverified":"IB Diploma with at least 24 points (not an IB Certificate), including maths and a foreign language, three subjects at HL. German-taught bachelor's need German C1; IB German counts only as A2."},"targets":[{"name":"Mathematical Foundations of Data Science","credential":"BSc","url":"https://ssc-mathematik.univie.ac.at/en/studying/study-programmes-of-the-faculty-of-mathematics/bsc-mathematical-foundations-of-data-science/"}]}
```

**Vienna University of Economics and Business** — `at-wu-vienna`; overviews.

```json
{"priority":3,"institution_key":"at-wu-vienna","name":"Vienna University of Economics and Business","country":"Austria","country_code":"at","website":"https://www.wu.ac.at/en/","admissions_url":"https://www.wu.ac.at/en/programs/application-and-admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.wu.ac.at/en/programs/bachelors-programs","ib_summary_unverified":"A passed IB Diploma; beyond languages, WU sets no subject combination or minimum grades. Every bachelor's needs its selection procedure; the German ones need German C1 (German A HL 6, A SL 7 or B HL 7)."},"targets":[{"name":"Business and Economics (BBE)","credential":"BSc","url":"https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics/overview"}]}
```

**Webster Vienna Private University** — `at-webster-vienna`; overviews.

```json
{"priority":3,"institution_key":"at-webster-vienna","name":"Webster Vienna Private University","country":"Austria","country_code":"at","website":"https://webster.ac.at/","admissions_url":"https://webster.ac.at/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://webster.ac.at/academics/undergraduate.php","ib_summary_unverified":"The IB Diploma is accepted, with a minimum school GPA of 2.5 out of 4 or equivalent (no IB conversion given). IB English proves English: HL A 4, HL B 5, SL A 5 or SL B 6."},"targets":[{"name":"Business Administration","credential":"BSc","url":"https://webster.ac.at/academics/bsc-business-administration.php"},{"name":"Computer Science with an Emphasis in Artificial Intelligence","credential":"BSc","url":"https://webster.ac.at/academics/bsc-computer-science-artificial-intelligence.php"},{"name":"International Relations","credential":"BA","url":"https://webster.ac.at/academics/ba-international-relations.php"},{"name":"Psychology","credential":"BSc","url":"https://webster.ac.at/academics/bsc-psychology.php"},{"name":"Strategic Communication","credential":"BA","url":"https://webster.ac.at/academics/ba-strategic-communication.php"},{"name":"Comparative International Business Law","credential":"LLB","url":"https://webster.ac.at/academics/llb-comparative-international-business-law.php"}]}
```

### Belgium

**Ghent University** — `be-ugent`; overviews.

```json
{"priority":3,"institution_key":"be-ugent","name":"Ghent University","country":"Belgium","country_code":"be","website":"https://www.ugent.be/en","admissions_url":"https://www.ugent.be/prospect/en/administration/application","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://studiekiezer.ugent.be/en/zoek?aj=2027&otc=Ba&taal=EN","ib_summary_unverified":"The IB Diploma is on UGent's direct-admission list. Its Dutch-taught bachelor's need Dutch at B2 on enrolment (C1 for Applied Language Studies); Medicine, Dentistry and Vet need the Flemish entrance exam."},"targets":[{"name":"Bachelor of Science in Social Sciences","credential":"BSc","campus":"Brussels and Ghent","url":"https://studiekiezer.ugent.be/2027/bachelor-of-science-in-social-sciences-political-sciences-en"}]}
```

**Howest University of Applied Sciences** — `be-howest`; overviews.

```json
{"priority":3,"institution_key":"be-howest","name":"Howest University of Applied Sciences","country":"Belgium","country_code":"be","website":"https://www.howest.be/en","admissions_url":"https://www.howest.be/en/how-to-apply-as-an-international-student","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.howest.be/en/applications-for-english-taught-degree-programmes","ib_summary_unverified":"A diploma giving access to university at home, B2 English and a motivation letter. The IB counts for English if taught in English, or with English A/B HL at 5 or English B SL at 6. €50 fee."},"targets":[{"name":"Creative Technologies and Artificial Intelligence","credential":"Professional bachelor","campus":"Kortrijk","url":"https://www.howest.be/en/programmes/bachelor/creative-technologies-and-artificial-intelligence"},{"name":"Cybersecurity","credential":"Professional bachelor","campus":"Bruges","url":"https://www.howest.be/en/programmes/bachelor/cybersecurity"},{"name":"Digital Arts and Entertainment","credential":"Professional bachelor","campus":"Kortrijk","url":"https://www.howest.be/en/programmes/bachelor/digital-arts-and-entertainment"},{"name":"Digital Design and Development (DEVINE)","credential":"Professional bachelor","campus":"Kortrijk","url":"https://www.howest.be/en/programmes/bachelor/digital-design-and-development"},{"name":"Industrial Product Design","credential":"Professional bachelor","campus":"Kortrijk","url":"https://www.howest.be/en/programmes/bachelor/industrial-product-design"}]}
```

**Karel de Grote University of Applied Sciences and Arts** — `be-kdg`; overviews.

```json
{"priority":3,"institution_key":"be-kdg","name":"Karel de Grote University of Applied Sciences and Arts","country":"Belgium","country_code":"be","website":"https://www.kdg.be/en","admissions_url":"https://www.kdg.be/en/apply/apply-english-taught-bachelors-degree","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.kdg.be/en/apply/apply-english-taught-bachelors-degree","ib_summary_unverified":"Any diploma giving access to comparable study at home; no interview or test. English B2: an IB with English A or English B at 5 or higher counts as proof. €139.40 application fee, deducted from tuition."},"targets":[{"name":"Applied Computer Science","credential":"Professional bachelor","url":"https://www.kdg.be/en/applied-computer-science"},{"name":"International Business Management","credential":"Professional bachelor","url":"https://www.kdg.be/en/international-business-management"},{"name":"Multimedia & Creative Technologies","credential":"Professional bachelor","url":"https://www.kdg.be/en/bachelor-multimedia-creative-technologies"},{"name":"Nursing","credential":"Professional bachelor","url":"https://www.kdg.be/en/nursing"}]}
```

**KU Leuven** — `be-ku-leuven`; overviews.

```json
{"priority":3,"institution_key":"be-ku-leuven","name":"KU Leuven","country":"Belgium","country_code":"be","website":"https://www.kuleuven.be/english/kuleuven/","admissions_url":"https://www.kuleuven.be/english/apply/application-instructions/apply-to-kuleuven","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://onderwijsaanbod.kuleuven.be/opleidingen/e?Degree+type=Academic+Bachelor%27s&Language+of+instruction=English","ib_summary_unverified":"The IB Diploma gives access; no points minimum is published. It exempts you from an English test for most programmes if at least half your courses were in English. No 2027 deadlines yet."},"targets":[{"name":"Bachelor of Business Administration","credential":"BSc","campus":"Brussels","url":"https://www.kuleuven.be/programmes/bachelor-business-administration"},{"name":"Bachelor of Business Engineering","credential":"BSc","campus":"Brussels","url":"https://www.kuleuven.be/programmes/bachelor-business-engineering"},{"name":"Bachelor of Engineering Technology","credential":"BSc","url":"https://www.kuleuven.be/programmes/bachelor-engineering-technology"},{"name":"Bachelor of European Studies","credential":"BA","campus":"Leuven, Bologna, Kraków or Madrid","url":"https://ghum.kuleuven.be/baes"},{"name":"Bachelor of Philosophy","credential":"BA","url":"https://www.kuleuven.be/programmes/bachelor-philosophy"},{"name":"Bachelor of Theology and Religious Studies","credential":"BA","url":"https://www.kuleuven.be/programmes/bachelor-theology-religious-studies"},{"name":"Joint Bachelor in Sustainability","credential":"BSc","campus":"Kraków (year 1), then partner universities","url":"https://www.kuleuven.be/programmes/joint-bachelor-in-sustainability"}]}
```

**Odisee University of Applied Sciences** — `be-odisee`; overviews.

```json
{"priority":3,"institution_key":"be-odisee","name":"Odisee University of Applied Sciences","country":"Belgium","country_code":"be","website":"https://www.odisee.be/en","admissions_url":"https://www.odisee.be/en/international","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.studyinflanders.be/programmes?institution%5B%5D=7887&level%5B%5D=9602","ib_summary_unverified":"In January 2025: a diploma giving access to higher education at home, and English at B2; an IB taught fully in English (or bilingual) exempts you from a test. 2027 criteria not yet confirmed."},"targets":[{"name":"Bachelor of Business Management – Marketing","credential":"Professional bachelor","campus":"Brussels","url":"https://www.odisee.be/en/programmes/bachelor-business-management-marketing"}]}
```

**Thomas More University of Applied Sciences** — `be-thomas-more`; overviews.

```json
{"priority":3,"institution_key":"be-thomas-more","name":"Thomas More University of Applied Sciences","country":"Belgium","country_code":"be","website":"https://thomasmore.be/en","admissions_url":"https://thomasmore.be/en/admissions-application-procedure-general","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":9,"faculty_count":0,"programmes":[],"handoff_url":"https://thomasmore.be/en/study/programme-types/bachelors-degrees","ib_summary_unverified":"A diploma giving access to comparable higher education at home; the IB Diploma exempts you from an English test. No application fee, no numerus clausus; you can apply before you graduate."},"targets":[{"name":"Applied Computer Science","credential":"Professional bachelor","campus":"Geel","url":"https://thomasmore.be/en/educations/degree-students/applied-computer-science"},{"name":"Automotive Technology","credential":"Professional bachelor","campus":"Sint-Katelijne-Waver","url":"https://thomasmore.be/en/educations/degree-students/automotive-technology/automotive-technology/sint-katelijne-waver/full-programme"},{"name":"Electronics-ICT","credential":"Professional bachelor","campus":"Sint-Katelijne-Waver","url":"https://thomasmore.be/en/educations/degree-students/electronics-ict"},{"name":"Information Management and Multimedia: International Digital Experience Design","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/information-management-and-multimedia"},{"name":"International Business Management","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/international-business-management/international-business-and-trade/mechelen/full-programme"},{"name":"International Communication and Media","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/international-communication-and-media"},{"name":"International Journalism","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/international-journalism/international-journalism/mechelen/full-programme"},{"name":"International Media and Entertainment Business","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/international-media-and-entertainment-business/international-media-and-entertainment-business/mechelen/full-programme"},{"name":"International Tourism and Leisure","credential":"Professional bachelor","campus":"Mechelen","url":"https://thomasmore.be/en/educations/degree-students/international-tourism-and-leisure/international-tourism-and-leisure/mechelen/full-programme"}]}
```

**UCLouvain (Université catholique de Louvain)** — `be-uclouvain`; overviews.

```json
{"priority":3,"institution_key":"be-uclouvain","name":"UCLouvain (Université catholique de Louvain)","country":"Belgium","country_code":"be","website":"https://uclouvain.be/en","admissions_url":"https://uclouvain.be/en/enrolment","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://uclouvain.be/en/sites/st-louis-bruxelles/bachelorsprogrammes","ib_summary_unverified":"The IB Diploma is automatically recognised. French-taught bachelor's need proof of French (DELF, DALF, TCF) if you weren't schooled in French; Medicine and Dentistry need the ARES entrance exam."},"targets":[{"name":"Bachelor of Science in Business Engineering","credential":"BSc","campus":"Brussels","url":"https://uclouvain.be/en-prog-2026-bbeb1ba"}]}
```

**Université libre de Bruxelles** — `be-ulb`; overviews.

```json
{"priority":3,"institution_key":"be-ulb","name":"Université libre de Bruxelles","country":"Belgium","country_code":"be","website":"https://www.ulb.be/en","admissions_url":"https://www.ulb.be/en/enrolment","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://sbsem.ulb.be/studies/bachelors","ib_summary_unverified":"The IB (Geneva) is on ULB's eligibility list, so no equivalence is needed. The English versions ask every student for B2 English; French-taught ones may need a French proficiency test."},"targets":[{"name":"Bachelor in Business Engineering, option Anglais","credential":"Bachelor in Business Engineering","url":"https://www.ulb.be/en/programme/ba-ingee"},{"name":"Bachelor in Economics, option Anglais","credential":"Bachelor in Economics","url":"https://www.ulb.be/en/programme/ba-econe"}]}
```

**University of Antwerp** — `be-uantwerpen`; overviews.

```json
{"priority":3,"institution_key":"be-uantwerpen","name":"University of Antwerp","country":"Belgium","country_code":"be","website":"https://www.uantwerpen.be/en/","admissions_url":"https://www.uantwerpen.be/en/study/admission-and-enrolment/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uantwerpen.be/en/study/programmes/bachelors/","ib_summary_unverified":"An IB Diploma verifiable on IBIS gives direct access. IB with English passed at 'Language 1 (min. 5) or Level A (min. 3)' exempts you from an English test; otherwise IELTS 6.5 or TOEFL 80."},"targets":[{"name":"Social-Economic Sciences","credential":"Bachelor of Social-Economic Sciences","url":"https://www.uantwerpen.be/en/study/programmes/all-programmes/social-economic-sciences/"},{"name":"Urban Sustainability Studies","credential":"Bachelor in Urban Sustainability Studies","url":"https://www.uantwerpen.be/en/study/programmes/all-programmes/urban-sustainability-studies/"}]}
```

**Vesalius College** — `be-vesalius`; overviews.

```json
{"priority":3,"institution_key":"be-vesalius","name":"Vesalius College","country":"Belgium","country_code":"be","website":"https://www.brussels-school.be/","admissions_url":"https://www.brussels-school.be/admission-requirements-diploma","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.brussels-school.be/admission-requirements-diploma","ib_summary_unverified":"IB Diploma with at least 27 points; no specific subjects required and no English test. Admission is selective: motivation essay, CV and transcripts, plus a €90 application fee."},"targets":[{"name":"BA in Global Business and Entrepreneurship","credential":"BA","url":"https://www.brussels-school.be/education/ba-global-business-and-entrepreneurship"},{"name":"BA in International Affairs","credential":"BA","url":"https://www.brussels-school.be/education/ba-international-affairs"},{"name":"BA in International and European Law","credential":"BA","url":"https://www.brussels-school.be/education/ba-international-and-european-law"}]}
```

**Vrije Universiteit Brussel** — `be-vub`; overviews.

```json
{"priority":3,"institution_key":"be-vub","name":"Vrije Universiteit Brussel","country":"Belgium","country_code":"be","website":"https://www.vub.be/en","admissions_url":"https://www.vub.be/en/studying-vub/apply-and-enrol-vub/admission-requirements-and-deadlines","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-programmes","ib_summary_unverified":"The IB Diploma is on VUB's list of equivalent diplomas, so you are admitted directly. For English, send a school letter that English was the language of instruction, or IELTS 6.5 / TOEFL 79."},"targets":[{"name":"Business Economics","credential":"BSc","url":"https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/bachelor-business-economics"},{"name":"Linguistics and Literary Studies","credential":"BA","url":"https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/bachelor-linguistics-and-literary-studies"},{"name":"Social Sciences (with Ghent University)","credential":"BSc","url":"https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/social-sciences-vrije-universiteit-brussel-vub"}]}
```

### Canada

**Carleton University** — `ca-carleton`; overviews.

```json
{"priority":3,"institution_key":"ca-carleton","name":"Carleton University","country":"Canada","country_code":"ca","website":"https://carleton.ca/","admissions_url":"https://admissions.carleton.ca/","ib_url":"https://admissions.carleton.ca/applicant-type/international-baccalaureate-students/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://admissions.carleton.ca/programs/","ib_summary_unverified":"Full IB: three SL and three HL, at least 28 points; one grade of 3 is allowed if offset by a 5. Prerequisite subjects need a 4, and some degrees ask 5 or higher overall points, such as 32 for Aerospace Engineering."},"targets":[{"name":"Engineering","credential":"BEng","url":"https://admissions.carleton.ca/programs/engineering/"},{"name":"Journalism","credential":"BJ","url":"https://admissions.carleton.ca/programs/journalism/"},{"name":"Public Affairs and Policy Management","credential":"BPAPM","url":"https://admissions.carleton.ca/programs/public-affairs-and-policy-management/"}]}
```

**Concordia University** — `ca-concordia`; overviews.

```json
{"priority":3,"institution_key":"ca-concordia","name":"Concordia University","country":"Canada","country_code":"ca","website":"https://www.concordia.ca/","admissions_url":"https://www.concordia.ca/admissions.html","ib_url":"https://www.concordia.ca/admissions/undergraduate/requirements.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://www.concordia.ca/academics/undergraduate.html","ib_summary_unverified":"IB Diploma holders are admitted to the 120-credit Extended Credit Program, with transfer credit for HL courses graded 4+. Maths is required for BComm, BCompSc, BSc and BEng; business wants a predicted 29."},"targets":[{"name":"Commerce (John Molson School of Business)","credential":"BComm","url":"https://www.concordia.ca/jmsb/programs/undergraduate/bachelor.html"},{"name":"Film Production","credential":"BFA","url":"https://www.concordia.ca/academics/undergraduate/film-production.html"}]}
```

**Dalhousie University** — `ca-dal`; overviews.

```json
{"priority":3,"institution_key":"ca-dal","name":"Dalhousie University","country":"Canada","country_code":"ca","website":"https://www.dal.ca/","admissions_url":"https://www.dal.ca/admissions.html","ib_url":"https://www.dal.ca/admissions/how-to-apply/undergraduate-admissions/ib-applicants.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://www.dal.ca/study.html","ib_summary_unverified":"IB Diploma with at least 26 points including bonus points, plus your program's courses: English, and Maths, Chemistry, Physics or Biology at SL or HL. Maths AI SL is accepted for Maths."},"targets":[{"name":"Marine Biology","credential":"BSc or BA","url":"https://www.dal.ca/study/programs/undergraduate/marine-biology-bsc-ba.html"},{"name":"Computer Science","credential":"BCS","url":"https://www.dal.ca/study/programs/undergraduate/computer-science-bcs.html"}]}
```

**McGill University** — `ca-mcgill`; overviews.

```json
{"priority":3,"institution_key":"ca-mcgill","name":"McGill University","country":"Canada","country_code":"ca","website":"https://www.mcgill.ca/","admissions_url":"https://www.mcgill.ca/undergraduate-admissions/","ib_url":"https://www.mcgill.ca/undergraduate-admissions/apply/requirements/international/ib","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":9,"programmes":[],"handoff_url":"https://www.mcgill.ca/undergraduate-admissions/programs","ib_summary_unverified":"Diploma with 5+ in every HL and SL subject is the minimum for most programs; admitted ranges run from 28 to 42 subject points by faculty. Maths AI SL does not count as a prerequisite."},"targets":[{"name":"Mechanical Engineering","credential":"BEng","url":"https://www.mcgill.ca/undergraduate-admissions/program/mechanical-engineering"},{"name":"Bachelor of Commerce (Desautels Faculty of Management)","credential":"BCom","url":"https://www.mcgill.ca/desautels/programs/bcom/prospective-students"}]}
```

**McMaster University** — `ca-mcmaster`; overviews.

```json
{"priority":3,"institution_key":"ca-mcmaster","name":"McMaster University","country":"Canada","country_code":"ca","website":"https://www.mcmaster.ca/","admissions_url":"https://future.mcmaster.ca/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://future.mcmaster.ca/programs/","ib_summary_unverified":"IB Diploma with six subjects, three HL and three SL, plus TOK and EE; bonus points count in a total out of 45. A minimum 80% average is needed to apply; each program sets its own minimum."},"targets":[{"name":"Engineering","credential":"BEng","url":"https://future.mcmaster.ca/programs/engineering/"},{"name":"Honours Health Sciences","credential":"BHSc","url":"https://future.mcmaster.ca/programs/health-sciences/"}]}
```

**Queen's University at Kingston** — `ca-queen-s`; overviews.

```json
{"priority":3,"institution_key":"ca-queen-s","name":"Queen's University at Kingston","country":"Canada","country_code":"ca","website":"https://www.queensu.ca/","admissions_url":"https://www.queensu.ca/admission/","ib_url":"https://www.queensu.ca/admission/applying/admission-requirements/international-baccalaureat","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://www.queensu.ca/admission/applying/admission-requirements/international-baccalaureat","ib_summary_unverified":"Full IB Diploma: six subjects, three at HL, no mark below 3, total at least 28 excluding bonus points, plus program prerequisites. Maths AI SL is not accepted where Maths is a prerequisite."},"targets":[{"name":"Commerce","credential":"BCom","url":"https://smith.queensu.ca/bcom/index.php"},{"name":"Engineering","credential":"BASc","url":"https://www.queensu.ca/admission/study-engineering"}]}
```

**Simon Fraser University** — `ca-sfu`; overviews.

```json
{"priority":3,"institution_key":"ca-sfu","name":"Simon Fraser University","country":"Canada","country_code":"ca","website":"https://www.sfu.ca/","admissions_url":"https://www.sfu.ca/students/admission.html","ib_url":"https://www.sfu.ca/students/admission/admission-requirements/international-baccalaureate.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":8,"programmes":[],"handoff_url":"https://www.sfu.ca/students/admission/programs/a-z.html","ib_summary_unverified":"Full IB Diploma with at least three HL; program requirements may be met at HL or SL; predicted bonus points are not used. Maths AI SL does not meet a maths requirement. A full year of credit for the Diploma."},"targets":[{"name":"Computing Science","credential":"BSc or BA","url":"https://www.sfu.ca/students/admission/programs/a-z/c/computing-science.html"},{"name":"Interactive Arts and Technology","credential":"BA or BSc","campus":"Surrey","url":"https://www.sfu.ca/students/admission/programs/a-z/i/interactivearts-technology.html"}]}
```

**Toronto Metropolitan University** — `ca-tmu`; overviews.

```json
{"priority":3,"institution_key":"ca-tmu","name":"Toronto Metropolitan University","country":"Canada","country_code":"ca","website":"https://www.torontomu.ca/","admissions_url":"https://www.torontomu.ca/admissions/","ib_url":"https://www.torontomu.ca/admissions/undergraduate/requirements/international/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://www.torontomu.ca/programs/undergraduate/","ib_summary_unverified":"IB Diploma with 4 or higher in 3 HL and 3 SL subjects, prerequisites included, and a total of 28 or more; bonus points count only on final results, not predicted ones. Competitive programs may ask for more."},"targets":[{"name":"Mechatronics Engineering","credential":"BEng (Hons)","url":"https://www.torontomu.ca/programs/undergraduate/mechatronics-engineering/"},{"name":"Journalism","credential":"Bachelor of Journalism","url":"https://www.torontomu.ca/programs/undergraduate/journalism/"}]}
```

**University of Alberta** — `ca-ualberta`; overviews.

```json
{"priority":3,"institution_key":"ca-ualberta","name":"University of Alberta","country":"Canada","country_code":"ca","website":"https://www.ualberta.ca/en/index.html","admissions_url":"https://www.ualberta.ca/en/admissions/index.html","ib_url":"https://www.ualberta.ca/en/admissions/how-to-apply/ib-students/index.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://www.ualberta.ca/en/undergraduate-programs/index.html","ib_summary_unverified":"Six IB courses, five of them the subjects your program requires, no grade below 4. Past competitive diplomas ran from 30 to 37 points depending on program; IB grades are converted to percentages."},"targets":[{"name":"Computing Science","credential":"BSc","url":"https://www.ualberta.ca/en/undergraduate-programs/bachelor-of-science-with-major-computing-science.html"},{"name":"Engineering","credential":"BSc in Engineering","url":"https://www.ualberta.ca/en/engineering/programs/undergraduate/admissions/index.html"}]}
```

**University of British Columbia** — `ca-ubc`; overviews.

```json
{"priority":3,"institution_key":"ca-ubc","name":"University of British Columbia","country":"Canada","country_code":"ca","website":"https://www.ubc.ca/","admissions_url":"https://you.ubc.ca/applying-ubc/","ib_url":"https://you.ubc.ca/applying-ubc/requirements/international-baccalaureate/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://you.ubc.ca/programs/","ib_summary_unverified":"Full IB Diploma, at least 24 points including bonus points, though most programs ask more; English A at least grade 3. Maths AI SL is not accepted. Science and engineering list further subjects."},"targets":[{"name":"Computer Science (BSc, Vancouver)","credential":"BSc","url":"https://you.ubc.ca/ubc_programs/computer-science-vancouver-bsc/"},{"name":"Commerce (Sauder School of Business)","credential":"BCom","url":"https://you.ubc.ca/programs/commerce/"}]}
```

**University of Calgary** — `ca-ucalgary`; overviews.

```json
{"priority":3,"institution_key":"ca-ucalgary","name":"University of Calgary","country":"Canada","country_code":"ca","website":"https://www.ucalgary.ca/","admissions_url":"https://www.ucalgary.ca/future-students/undergraduate","ib_url":"https://calendar.ucalgary.ca/pages/nsfMYMG6AuknRgGAbSr1","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":10,"programmes":[],"handoff_url":"https://www.ucalgary.ca/future-students/undergraduate/explore-programs","ib_summary_unverified":"Full IB Diploma with three HL and no grade below 3; TOK, EE and CAS count in the total. Five program courses required; estimated competitive scores run 24-25 for Arts to 33-34 for Engineering."},"targets":[{"name":"Engineering (common first year)","credential":"BSc in Engineering","url":"https://www.ucalgary.ca/future-students/undergraduate/explore-programs/common-core-engineering"},{"name":"Commerce (Haskayne School of Business)","credential":"BComm","url":"https://haskayne.ucalgary.ca/future-students/bcomm"}]}
```

**University of Guelph** — `ca-guelph`; overviews.

```json
{"priority":3,"institution_key":"ca-guelph","name":"University of Guelph","country":"Canada","country_code":"ca","website":"https://www.uoguelph.ca/","admissions_url":"https://www.uoguelph.ca/admission/undergraduate","ib_url":"https://www.uoguelph.ca/admission/undergraduate/requirements/ib-ap/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":7,"programmes":[],"handoff_url":"https://www.uoguelph.ca/programs/undergraduate","ib_summary_unverified":"IB Diploma with 3 HL and 3 SL and a minimum score of 28 (many programs need more); program prerequisites must be taken in the final IB year; TOK and EE bonus marks are considered."},"targets":[{"name":"Bio-Medical Science","credential":"Bachelor of Science","url":"https://www.uoguelph.ca/programs/biomedical-science"},{"name":"Honours Agriculture","credential":"Bachelor of Science in Agriculture","url":"https://www.uoguelph.ca/programs/honours-agriculture"},{"name":"Hospitality and Tourism Management","credential":"Bachelor of Commerce","url":"https://www.uoguelph.ca/programs/hospitality-and-tourism-management"}]}
```

**University of Manitoba** — `ca-manitoba`; overviews.

```json
{"priority":3,"institution_key":"ca-manitoba","name":"University of Manitoba","country":"Canada","country_code":"ca","website":"https://umanitoba.ca/","admissions_url":"https://umanitoba.ca/admissions","ib_url":"https://umanitoba.ca/explore/undergraduate-admissions/requirements/ib-requirements","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":9,"programmes":[],"handoff_url":"https://umanitoba.ca/explore/programs-of-study","ib_summary_unverified":"Three HL and three SL courses with an overall minimum of 24 points; the program then asks an average over four courses, from 4 (70%) for Arts to 6 (85%) for Commerce, Health Sciences and Kinesiology."},"targets":[{"name":"Engineering","credential":"Bachelor of Science in Engineering","url":"https://umanitoba.ca/explore/programs-of-study/engineering-bsc"},{"name":"Computer Science","credential":"Bachelor of Science (Major)","url":"https://umanitoba.ca/explore/programs-of-study/computer-science-bsc"}]}
```

**University of Ottawa** — `ca-uottawa`; overviews.

```json
{"priority":3,"institution_key":"ca-uottawa","name":"University of Ottawa","country":"Canada","country_code":"ca","website":"https://www.uottawa.ca/en","admissions_url":"https://www.uottawa.ca/study/undergraduate-studies","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://www.uottawa.ca/study/undergraduate-studies/how-to-apply","ib_summary_unverified":"The IB Diploma counts as the equivalent of the Ontario high school diploma; each program sets its own minimum average and prerequisites. Check them in uOttawa's admission-requirements tool for your program."},"targets":[{"name":"Commerce (Telfer School of Management)","credential":"BCom","url":"https://telfer.uottawa.ca/en/bcom/"},{"name":"Political Science","credential":"Honours BSocSc","url":"https://catalogue.uottawa.ca/en/undergrad/honours-bsocsc-political-science/"}]}
```

**University of Saskatchewan** — `ca-usask`; overviews.

```json
{"priority":3,"institution_key":"ca-usask","name":"University of Saskatchewan","country":"Canada","country_code":"ca","website":"https://www.usask.ca/","admissions_url":"https://admissions.usask.ca/","ib_url":"https://admissions.usask.ca/requirements/ib.php","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":7,"programmes":[],"handoff_url":"https://admissions.usask.ca/programs/find-a-program.php","ib_summary_unverified":"Your Diploma total out of 45 (TOK and EE bonus points count) is converted to a percentage; each college sets a minimum total, 24 to 25, plus subject prerequisites, and some rank competitively."},"targets":[{"name":"Engineering","credential":"Bachelor of Science in Engineering","url":"https://admissions.usask.ca/colleges/engineering.php"},{"name":"Agriculture and Bioresources","credential":"Bachelor of Science in Agriculture","url":"https://admissions.usask.ca/colleges/agbio.php"}]}
```

**University of Toronto** — `ca-u-of-t`; overviews.

```json
{"priority":3,"institution_key":"ca-u-of-t","name":"University of Toronto","country":"Canada","country_code":"ca","website":"https://www.utoronto.ca/","admissions_url":"https://future.utoronto.ca/","ib_url":"https://future.utoronto.ca/requirements-international-high-schools","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://future.utoronto.ca/undergraduate-programs","ib_summary_unverified":"IB Diploma with English HL or SL; prerequisites at SL or HL; bonus points are not counted. Engineering asks a predicted 30 with 4+ in prerequisites; UTM a predicted 27+ for a provisional offer."},"targets":[{"name":"Computer Science (St. George)","credential":"BCS","url":"https://future.utoronto.ca/undergraduate-programs/computer-science/"},{"name":"Engineering Science","credential":"BASc","url":"https://future.utoronto.ca/undergraduate-programs/engineering-science/"}]}
```

**University of Victoria** — `ca-uvic`; overviews.

```json
{"priority":3,"institution_key":"ca-uvic","name":"University of Victoria","country":"Canada","country_code":"ca","website":"https://www.uvic.ca/","admissions_url":"https://www.uvic.ca/undergraduate/","ib_url":"https://www.uvic.ca/undergraduate/info-for/international-baccalaureate-ib-students/index.php","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://www.uvic.ca/undergraduate/programs/undergraduate-programs/index.php","ib_summary_unverified":"Full IB Diploma with three HL subjects and English at 3 or better; program pages give an estimated score of 26 to 30 points excluding bonus points. Maths AI SL is not accepted where Maths is required."},"targets":[{"name":"Engineering","credential":"BEng","url":"https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/engineering.php"},{"name":"Computer Science","credential":"BSc","url":"https://www.uvic.ca/undergraduate/programs/undergraduate-programs/pages/computer-science.php"}]}
```

**University of Waterloo** — `ca-waterloo`; overviews.

```json
{"priority":3,"institution_key":"ca-waterloo","name":"University of Waterloo","country":"Canada","country_code":"ca","website":"https://uwaterloo.ca/","admissions_url":"https://uwaterloo.ca/future-students/","ib_url":"https://uwaterloo.ca/future-students/admissions/admission-requirements","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://uwaterloo.ca/future-students/programs","ib_summary_unverified":"IB Diploma with six courses, three at HL; totals exclude diploma points. Totals run from 27 (Arts) to 32 (Computer Science); HL Analysis & Approaches 6 for Computer Science and Mathematics."},"targets":[{"name":"Computer Science","credential":"BCS or BMath","url":"https://uwaterloo.ca/future-students/programs/computer-science"},{"name":"Software Engineering","credential":"Bachelor of Software Engineering","url":"https://uwaterloo.ca/future-students/programs/software-engineering"}]}
```

**Western University** — `ca-western`; overviews.

```json
{"priority":3,"institution_key":"ca-western","name":"Western University","country":"Canada","country_code":"ca","website":"https://www.uwo.ca/","admissions_url":"https://welcome.uwo.ca/","ib_url":"https://welcome.uwo.ca/next-steps/requirements/international-baccalaureate.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":7,"programmes":[],"handoff_url":"https://welcome.uwo.ca/what-can-i-study/undergraduate-programs/index.html","ib_summary_unverified":"Complete IB Diploma with TOK and EE, at least six subjects (three HL), a total of 27 or more including EE and TOK, no mark below 4, and the required courses for your program."},"targets":[{"name":"Medical Sciences","credential":"BMSc","url":"https://welcome.uwo.ca/what-can-i-study/undergraduate-programs/medical-sciences.html"},{"name":"Engineering","credential":"BESc","url":"https://welcome.uwo.ca/programs/first-entry/eng.html"}]}
```

**York University** — `ca-york`; overviews.

```json
{"priority":3,"institution_key":"ca-york","name":"York University","country":"Canada","country_code":"ca","website":"https://www.yorku.ca/","admissions_url":"https://futurestudents.yorku.ca/","ib_url":"https://futurestudents.yorku.ca/requirements/international","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://futurestudents.yorku.ca/your-application/how-apply/international-student","ib_summary_unverified":"IB Diploma with six passes (three SL and three HL, or two SL and four HL); most programs consider 28 to 30 points, Schulich 36, plus program subjects. Maths AI SL counts only for some programs."},"targets":[{"name":"Engineering","credential":"BEng","url":"https://futurestudents.yorku.ca/program/engineering"},{"name":"Business Administration (BBA)","credential":"BBA","url":"https://futurestudents.yorku.ca/program/business-administration"},{"name":"Computer Science","credential":"BSc or BA","url":"https://futurestudents.yorku.ca/program/computer-science"}]}
```

### Estonia

**Baltic Methodist Theological Seminary** — `ee-baltic-methodist-theological-seminary`; overviews.

```json
{"priority":3,"institution_key":"ee-baltic-methodist-theological-seminary","name":"Baltic Methodist Theological Seminary","country":"Estonia","country_code":"ee","website":"https://emkts.ee/index.php/en/","admissions_url":"https://emkts.ee/index.php/en/admission/foreign-student","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.emkts.ee/index.php/en/admission/theology-and-mission","ib_summary_unverified":"No IB points or subjects are asked: send your secondary certificate, a motivation letter and a pastor's recommendation, then pass a Bible quiz and a face-to-face interview."},"targets":[{"name":"Theology and Mission","credential":"Bachelor's degree in Theology and Mission","url":"https://www.emkts.ee/index.php/en/admission/theology-and-mission"}]}
```

**Estonian Academy of Music and Theatre** — `ee-emta`; overviews.

```json
{"priority":3,"institution_key":"ee-emta","name":"Estonian Academy of Music and Theatre","country":"Estonia","country_code":"ee","website":"https://eamt.ee/en/","admissions_url":"https://eamt.ee/en/admissions/admission-dates/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://eamt.ee/en/admissions/departments-and-majors/","ib_summary_unverified":"No IB points or subjects are asked. Entry is by audition or portfolio plus interview; you upload your diploma with grades and proof of English."},"targets":[{"name":"Classical Music Performance","credential":"BA","url":"https://eamt.ee/en/departments/classical-music-performance/"},{"name":"Composition and Multimedia","credential":"BA","url":"https://eamt.ee/en/departments/composition-and-improvised-music/composition-and-multimedia/"},{"name":"Sound Engineering and Music Production","credential":"BA","url":"https://eamt.ee/en/departments/composition-and-improvised-music/recording-arts-and-music-production/"},{"name":"Jazz Music","credential":"BA","url":"https://eamt.ee/en/departments/composition-and-improvised-music/jazz-music/"}]}
```

**Estonian Business School** — `ee-ebs`; overviews.

```json
{"priority":3,"institution_key":"ee-ebs","name":"Estonian Business School","country":"Estonia","country_code":"ee","website":"https://ebs.ee/en","admissions_url":"https://ebs.ee/en/university/bachelors-studies/international-business-administration","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ebs.ee/en/university/bachelors-studies","ib_summary_unverified":"IB Diploma needs at least 24 points, EE and TOK at D or better, every HL course 3+ (HL total 12+) and one SL course may be a 2 (SL total 9+). English B2 must be proved by test, then a 20-minute interview."},"targets":[{"name":"International Business Administration","credential":"BA","url":"https://ebs.ee/en/international-business-administration-ba"},{"name":"Impactful Entrepreneurship","credential":"BA","url":"https://ebs.ee/en/impactful-entrepreneurship"},{"name":"Product and Technology Management","credential":"BA","url":"https://www.ebs.ee/en/university/bachelors-studies/product-and-technology-management"}]}
```

**Estonian Entrepreneurship University of Applied Sciences** — `ee-euas`; overviews.

```json
{"priority":3,"institution_key":"ee-euas","name":"Estonian Entrepreneurship University of Applied Sciences","country":"Estonia","country_code":"ee","website":"https://euas.eu/en","admissions_url":"https://euas.eu/admissions/bachelor_s_programs/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://euas.eu/admissions/bachelor_s_programs/","ib_summary_unverified":"No IB points or subjects are asked: send the IB Diploma and transcript, a motivation letter and an English test, then an online interview. An IB Diploma does not waive the English test."},"targets":[{"name":"Creativity and Business Innovation","credential":"BA","url":"https://euas.eu/program/creativity_and_business_innovation"},{"name":"Creativity and Business Innovations (Joint Programme)","credential":"BA","campus":"Tallinn, Vilnius and Porto","url":"https://euas.eu/program/creativity_and_business_innovations__joint_programme_"},{"name":"Artificial Intelligence Driven Software Technologies and Entrepreneurship","credential":"BSc","url":"https://euas.eu/program/artificial_intelligence_driven_software_technologies_and_entrepreneurship"},{"name":"Game Design and Development","credential":"BA","url":"https://euas.eu/program/game_design_and_development"}]}
```

**Estonian University of Life Sciences** — `ee-emu`; overviews.

```json
{"priority":3,"institution_key":"ee-emu","name":"Estonian University of Life Sciences","country":"Estonia","country_code":"ee","website":"https://www.emu.ee/en/","admissions_url":"https://www.emu.ee/en/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.emu.ee/en/veterinary-medicine-admission-requirements","ib_summary_unverified":"An IB Diploma taught in English meets the English rule; send results via IB's electronic transcript. Places go on the ISAT aptitude test and a motivation letter, not on IB points or subjects."},"targets":[{"name":"Veterinary Medicine","credential":"Long-cycle master's (6 years)","url":"https://www.emu.ee/en/veterinary-medicine"}]}
```

**Tallinn University** — `ee-tlu`; overviews.

```json
{"priority":3,"institution_key":"ee-tlu","name":"Tallinn University","country":"Estonia","country_code":"ee","website":"https://www.tlu.ee/en","admissions_url":"https://www.tlu.ee/en/admission-bachelors-studies","ib_url":"https://www.tlu.ee/en/proof-english-proficiency","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.tlu.ee/en/admission-bachelors-studies","ib_summary_unverified":"No IB points or subjects are asked: places go on an interview, portfolio or exam, with 65 of 100 as the floor. IB graduation documents count as proof of English. Send the Diploma and transcript."},"targets":[{"name":"Audiovisual Media","credential":"BA","url":"https://www.tlu.ee/en/bfm/audiovisual-media"},{"name":"Crossmedia","credential":"BA","url":"https://www.tlu.ee/en/bfm/crossmedia"},{"name":"Liberal Arts in Humanities","credential":"BA","url":"https://www.tlu.ee/en/liberal-arts-in-humanities"},{"name":"Liberal Arts in Social Sciences","credential":"BA","url":"https://www.tlu.ee/en/yti/liberal-arts-social-sciences"},{"name":"Politics and Governance","credential":"BA","url":"https://www.tlu.ee/en/yti/politics-and-governance"},{"name":"Law","credential":"BA","url":"https://www.tlu.ee/en/yti/law"}]}
```

**Tallinn University of Technology** — `ee-taltech`; overviews.

```json
{"priority":3,"institution_key":"ee-taltech","name":"Tallinn University of Technology","country":"Estonia","country_code":"ee","website":"https://taltech.ee/en","admissions_url":"https://taltech.ee/en/apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://taltech.ee/en/programmes","ib_summary_unverified":"Upload the IB Diploma (marked 'Diploma awarded'; course results do not count) and a transcript. IB or European Baccalaureate graduates need no English test. Each degree adds an online test or letter and an interview."},"targets":[{"name":"Integrated Engineering","credential":"BSc","url":"https://taltech.ee/en/bachelors-programmes/integrated-engineering"},{"name":"Cyber Security Engineering","credential":"BSc","url":"https://taltech.ee/en/bachelors-programmes/cyber-security-engineering"},{"name":"International Business Administration","credential":"BA","url":"https://taltech.ee/en/bachelors-programmes/international-business-administration"},{"name":"Law","credential":"BA","url":"https://taltech.ee/en/bachelors-programmes/law"}]}
```

**University of Tartu** — `ee-ut`; overviews.

```json
{"priority":3,"institution_key":"ee-ut","name":"University of Tartu","country":"Estonia","country_code":"ee","website":"https://ut.ee/en","admissions_url":"https://ut.ee/en/content/bachelors-and-masters-studies-university-tartu","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://ut.ee/en/content/bachelors-and-masters-studies-university-tartu","ib_summary_unverified":"Needs the IB Diploma awarded (course results alone do not qualify); an English-taught Diploma meets the English rule. Apply in your final year with current grades. Each degree adds its own test."},"targets":[{"name":"Business Administration","credential":"BA","url":"https://ut.ee/en/curriculum/business-administration"},{"name":"Science and Technology","credential":"BSc","url":"https://ut.ee/en/curriculum/science-and-technology"},{"name":"Medicine","credential":"Long-cycle master's (6 years)","url":"https://ut.ee/en/curriculum/medicine"}]}
```

### France

**École Polytechnique** — `fr-l-x`; overviews.

```json
{"priority":3,"institution_key":"fr-l-x","name":"École Polytechnique","country":"France","country_code":"fr","website":"https://www.polytechnique.edu/en","admissions_url":"https://programmes.polytechnique.edu/en/bachelor/about-the-bachelor/bachelor-of-science","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://programmes.polytechnique.edu/en/bachelor/admissions/admissions-criteria-and-procedure","ib_summary_unverified":"Maths HL (preferably AA) and at least one other science at HL. No minimum grades; English C1 by IELTS 6.5, TOEFL iBT 90 or Cambridge 176."},"targets":[{"name":"Bachelor of Science","credential":"BSc","url":"https://programmes.polytechnique.edu/en/bachelor/about-the-bachelor/bachelor-of-science"}]}
```

**EDHEC Business School** — `fr-edhec`; overviews.

```json
{"priority":3,"institution_key":"fr-edhec","name":"EDHEC Business School","country":"France","country_code":"fr","website":"https://www.edhec.edu/en","admissions_url":"https://www.edhec.edu/en/programmes","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.edhec.edu/en/programmes/bba/degrees","ib_summary_unverified":"The IB Diploma is accepted (not IB certificates or the CP); no minimum points stated. EDHEC advises maths, science, economics or humanities subjects."},"targets":[{"name":"Business Management Track","credential":"BBA","campus":"Lille or Nice","url":"https://www.edhec.edu/en/programmes/bba/degrees/business-management-track"},{"name":"Global Business Track","credential":"BBA","campus":"Nice, Los Angeles and Singapore","url":"https://www.edhec.edu/en/programmes/bba/degrees/global-business-track"},{"name":"International Business Analytics and Management BSc","credential":"BSc and BBA (double degree)","campus":"London (King's College) and Lille","url":"https://www.edhec.edu/en/international-business-analytics-and-management-bsc"}]}
```

**emlyon business school** — `fr-emlyon`; overviews.

```json
{"priority":3,"institution_key":"fr-emlyon","name":"emlyon business school","country":"France","country_code":"fr","website":"https://em-lyon.com/en","admissions_url":"https://em-lyon.com/en/programmes","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://em-lyon.com/en/bachelor-programs","ib_summary_unverified":"Open to students in their final IB year. Selection is online: your file and grades, then emlyon's digital tests and a recorded video interview."},"targets":[{"name":"Global BBA","credential":"BBA","url":"https://em-lyon.com/en/student/bachelor/global-bba"},{"name":"BSc in Data Science for Responsible Business","credential":"BSc","url":"https://em-lyon.com/en/student/bachelor/bsc-data-science"}]}
```

**ESCP Business School** — `fr-escp`; overviews.

```json
{"priority":3,"institution_key":"fr-escp","name":"ESCP Business School","country":"France","country_code":"fr","website":"https://escp.eu/","admissions_url":"https://escp.eu/programmes/bachelor-in-management-bsc","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://escp.eu/programmes/bachelor-in-management-BSc","ib_summary_unverified":"A high-school diploma such as the IB; no IB-specific requirements published. English: IELTS 6.5 or CAE 180 unless exempt. Online interview."},"targets":[{"name":"Bachelor in Management (BSc)","credential":"BSc","campus":"Year 1 in Berlin, London, Paris or Turin","url":"https://escp.eu/programmes/bachelor-in-management-BSc"},{"name":"Bachelor in Management, Science & Technology (BSc)","credential":"BSc","campus":"Paris, then Turin, then London","url":"https://escp.eu/programmes/bachelor-in-management-science-and-technology"},{"name":"Bachelor in Politics, Economics & Management","credential":"Dual bachelor's degree","campus":"Sciences Po Reims, then ESCP London and another ESCP campus","url":"https://escp.eu/programmes/bachelor-in-politics-economics-and-management"}]}
```

**ESSEC Business School** — `fr-essec`; overviews.

```json
{"priority":3,"institution_key":"fr-essec","name":"ESSEC Business School","country":"France","country_code":"fr","website":"https://www.essec.edu/en/","admissions_url":"https://www.essec.edu/en/program/global-bba-international/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.essec.edu/en/programs/our-bachelors/","ib_summary_unverified":"Apply with the IB as an international high-school diploma: transcripts of the last 3 years, English test (IELTS 6.5 or TOEFL iBT 90) unless taught in English, then an interview."},"targets":[{"name":"Global BBA","credential":"BBA","url":"https://www.essec.edu/en/program/global-bba-international/"},{"name":"BSc in Artificial Intelligence, Data & Management Sciences","credential":"BSc","campus":"Cergy and CentraleSupélec (Paris-Saclay)","url":"https://www.essec.edu/en/program/bsc-artificial-intelligence-data-management-sciences-international/"}]}
```

**Sciences Po** — `fr-sciences-po`; overviews.

```json
{"priority":3,"institution_key":"fr-sciences-po","name":"Sciences Po","country":"France","country_code":"fr","website":"https://www.sciencespo.fr/en/","admissions_url":"https://www.sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/","ib_url":"https://www.sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":11,"faculty_count":0,"programmes":[],"handoff_url":"https://www.sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/","ib_summary_unverified":"An IB student applies through Sciences Po's own international pathway, not Parcoursup. No set subjects or minimum points; predicted grades are assessed."},"targets":[{"name":"Bachelor of Arts, Asia-Pacific minor (Le Havre)","credential":"BA","campus":"Le Havre","url":"https://www.sciencespo.fr/college/en/campus-life/campus/le-havre/"},{"name":"Bachelor of Arts, Mediterranean and Middle East minor (Menton)","credential":"BA","campus":"Menton","url":"https://www.sciencespo.fr/college/en/campus-life/campus/menton/"},{"name":"Bachelor of Arts, North America minor or Africa minor (English track) (Reims)","credential":"BA","campus":"Reims","url":"https://www.sciencespo.fr/college/en/campus-life/campus/reims/"},{"name":"Dual BA with Keio University","credential":"Dual bachelor's degree","campus":"Le Havre, then Tokyo","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/keio-university/"},{"name":"Dual BA with the University of Hong Kong","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then Hong Kong","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/university-of-hong-kong/"},{"name":"Dual bachelor's in Politics, Economics & Management with ESCP","credential":"Dual bachelor's degree","campus":"Reims, then ESCP London and another ESCP campus","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/escp-business-school/"},{"name":"Dual BA with Columbia University","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then New York","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/columbia-university/"},{"name":"Dual BA with the National University of Singapore","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then Singapore","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/national-university-of-singapore-nus/"},{"name":"Dual BA with the University of British Columbia","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then Vancouver","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/university-of-british-columbia-ubc/"},{"name":"Dual BA with UC Berkeley","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then Berkeley","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/university-of-california-berkeley/"},{"name":"Dual BA with the University of Sydney","credential":"Dual bachelor's degree","campus":"Le Havre, Menton or Reims, then Sydney","url":"https://www.sciencespo.fr/admissions/en/undergraduate/dual-bachelor-degrees/university-of-sydney/"}]}
```

**The American University of Paris** — `fr-aup`; overviews.

```json
{"priority":3,"institution_key":"fr-aup","name":"The American University of Paris","country":"France","country_code":"fr","website":"https://www.aup.edu/","admissions_url":"https://www.aup.edu/admissions/undergraduate","ib_url":"https://www.aup.edu/admissions/undergraduate/financial-aid/ib-diploma-scholarships","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":8,"programmes":[],"handoff_url":"https://www.aup.edu/academics/undergraduate/majors-minors","ib_summary_unverified":"The IB Diploma waives the English test. Automatic scholarships by final score: 32–35 €7,000 a year up to full tuition at 44–45; 30+ points earn a year of credit."},"targets":[{"name":"Fashion Studies","credential":"BA","url":"https://www.aup.edu/academics/undergraduate/majors-minors/fashion-studies"},{"name":"International & Comparative Politics","credential":"BA","url":"https://www.aup.edu/academics/undergraduate/majors-minors/international-comparative-politics"},{"name":"Computer Science","credential":"BSc","url":"https://www.aup.edu/academics/undergraduate/majors-minors/computer-science"}]}
```

**Université PSL** — `fr-psl`; overviews.

```json
{"priority":3,"institution_key":"fr-psl","name":"Université PSL","country":"France","country_code":"fr","website":"https://psl.eu/en","admissions_url":"https://psl.eu/en/education/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://psl.eu/en/education/find-your-curriculum/bachelors-degree","ib_summary_unverified":"No set IB points. The AI bachelor's wants advanced maths and C1 English and runs through Parcoursup; the engineering bachelor's has its own portal."},"targets":[{"name":"International Bachelor of Science in AI","credential":"BSc","url":"https://psl.eu/en/education/international-bachelor-science-ai"},{"name":"International Bachelor of Environmentally Engaged Engineering","credential":"Bachelor's degree (licence level)","campus":"Sophia Antipolis","url":"https://psl.eu/formation/international-bachelor-environmentally-engaged-engineering-i-be3"}]}
```

### Germany

**Bard College Berlin** — `de-bcb`; overviews.

```json
{"priority":3,"institution_key":"de-bcb","name":"Bard College Berlin","country":"Germany","country_code":"de","website":"https://berlin.bard.edu/","admissions_url":"https://berlin.bard.edu/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://berlin.bard.edu/admissions/how-to-apply/application-requirements/","ib_summary_unverified":"The German BA needs an IB that meets Germany's KMK rule (six set subject groups, a 4 in each); BCB publishes it as an IB sheet. English at C1, waived after a year of English-taught school."},"targets":[{"name":"BA in Economics, Politics, and Social Thought","credential":"BA","url":"https://berlin.bard.edu/academics/economics-politics-and-social-thought/"},{"name":"BA in Humanities, the Arts, and Social Thought","credential":"BA","url":"https://berlin.bard.edu/academics/humanities-the-arts-and-social-thought/"},{"name":"BA in Artistic Practice and Society","credential":"BA","url":"https://berlin.bard.edu/academics/artistic-practice-and-society/"}]}
```

**Constructor University** — `de-constructor`; overviews.

```json
{"priority":3,"institution_key":"de-constructor","name":"Constructor University","country":"Germany","country_code":"de","website":"https://constructor.university/","admissions_url":"https://constructor.university/admission-aid/application-information-undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":19,"faculty_count":0,"programmes":[],"handoff_url":"https://constructor.university/programs/undergraduate-education","ib_summary_unverified":"Holistic review of grades, a motivation essay and a CV. If your IB does not give direct entry to a German university, admission can be conditional on SAT/ACT. IB English A at 6 or 7 proves your English."},"targets":[{"name":"Applied Computer Science","credential":"BSc","campus":"Online","url":"https://constructor.university/programs/undergraduate-education/applied-computer-science"},{"name":"Artificial Intelligence","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/artificial-intelligence"},{"name":"Biochemistry and Cell Biology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/biochemistry-cell-biology"},{"name":"Chemistry and Biotechnology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/chemistry-biotechnology"},{"name":"Computer and Information Technology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/computer-information-technology"},{"name":"Computer Science","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/computer-science"},{"name":"Earth Sciences and Sustainable Management of Environmental Resources","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/earth-sciences-and-sustainable-management-of-environmental-resources"},{"name":"Electrical and Computer Engineering","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/electrical-computer-engineering"},{"name":"Global Economics and Management","credential":"BA","url":"https://constructor.university/programs/undergraduate-education/global-economics-management"},{"name":"Industrial Engineering and Management","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/industrial-engineering-management"},{"name":"Integrated Social and Cognitive Psychology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/integrated-social-cognitive-psychology"},{"name":"International Business Administration","credential":"BA","url":"https://constructor.university/programs/undergraduate-education/international-business-administration"},{"name":"International Relations: Politics and History","credential":"BA","url":"https://constructor.university/programs/undergraduate-education/international-relations-politics-history"},{"name":"Management, Decisions and Data Analytics","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/management-decisions-and-data-analytics"},{"name":"Mathematics, Modeling and Data Analytics","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/mathematics-modeling-data-analytics"},{"name":"Medicinal Chemistry and Chemical Biology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/medicinal-chemistry-chemical-biology"},{"name":"Physics and Data Science","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/physics-and-data-science"},{"name":"Robotics and Intelligent Systems","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/robotics-intelligent-systems"},{"name":"Software, Data and Technology","credential":"BSc","url":"https://constructor.university/programs/undergraduate-education/software-data-and-technology"}]}
```

**Frankfurt School of Finance & Management** — `de-frankfurt-school`; overviews.

```json
{"priority":3,"institution_key":"de-frankfurt-school","name":"Frankfurt School of Finance & Management","country":"Germany","country_code":"de","website":"https://www.frankfurt-school.de/en/home","admissions_url":"https://www.frankfurt-school.de/en/study/bachelor","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.frankfurt-school.de/en/study/bachelor","ib_summary_unverified":"IB Diploma accepted; no points minimum and no numerus clausus. You are admitted on an online assessment centre: maths, cognitive and English tests and an interview. No English certificate is needed."},"targets":[{"name":"Bachelor in Business Administration","credential":"BSc","url":"https://www.frankfurt-school.de/en/study/bachelor/bachelor-in-business-administration"},{"name":"Bachelor in Artificial Intelligence & Data Engineering","credential":"BSc","url":"https://www.frankfurt-school.de/en/study/bachelor/bachelor-in-artificial-intelligence-and-data-engineering"},{"name":"Bachelor in Management, Philosophy & Economics","credential":"BSc","url":"https://www.frankfurt-school.de/en/study/bachelor/bachelor-in-management-philosophy-economics"},{"name":"Bachelor in Business Information Systems Engineering","credential":"BSc","url":"https://www.frankfurt-school.de/en/study/bachelor/bachelor-in-business-information-systems-engineering"}]}
```

**Free University of Berlin** — `de-fu-berlin`; overviews.

```json
{"priority":3,"institution_key":"de-fu-berlin","name":"Free University of Berlin","country":"Germany","country_code":"de","website":"https://www.fu-berlin.de/en/","admissions_url":"https://www.fu-berlin.de/en/studium/bewerbung/index.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.fu-berlin.de/en/studium/studienangebot/grundstaendige/nordamerikastudien_mono/index.html","ib_summary_unverified":"Apply to FU and request a VPD from uni-assist, which checks your IB against the KMK rule and converts it to a German grade. Restricted programmes rank most places on FU's own selection points."},"targets":[{"name":"North American Studies","credential":"BA","url":"https://www.fu-berlin.de/en/studium/studienangebot/grundstaendige/nordamerikastudien_mono/index.html"}]}
```

**Leuphana University Luneburg** — `de-leuphana`; overviews.

```json
{"priority":3,"institution_key":"de-leuphana","name":"Leuphana University Luneburg","country":"Germany","country_code":"de","website":"https://www.leuphana.de/en/","admissions_url":"https://www.leuphana.de/en/college/application.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://www.leuphana.de/en/college/bachelor.html","ib_summary_unverified":"The IB must meet Germany's KMK rule. 30% of places go on grade alone, the rest on grade, extracurricular points and an optional English study-skills test. English: IB English A HL at 6, or e.g. IELTS 6.5."},"targets":[{"name":"Cultural Studies: Organization, Society, and the Arts","credential":"BA","url":"https://www.leuphana.de/en/college/bachelor/cultural-studies.html"},{"name":"Digital Media","credential":"BA","campus":"Lüneburg and Hamburg","url":"https://www.leuphana.de/en/college/bachelor/ba-digital-media.html"},{"name":"Economics","credential":"BSc","url":"https://www.leuphana.de/en/college/bachelor/economics-major.html"},{"name":"Global Environmental and Sustainability Sciences","credential":"BSc","url":"https://www.leuphana.de/en/college/bachelor/bsc-global-environmental-and-sustainability-studies.html"},{"name":"International Business Administration & Entrepreneurship","credential":"BSc","url":"https://www.leuphana.de/en/college/bachelor/bsc-international-business-administration-entrepreneurship.html"},{"name":"Psychology","credential":"BSc","url":"https://www.leuphana.de/en/college/bachelor/psychology-major.html"},{"name":"Studium Individuale","credential":"BA","url":"https://www.leuphana.de/en/college/bachelor/ba-studium-individuale.html"}]}
```

**Rhine-Waal University of Applied Sciences** — `de-hsrw`; overviews.

```json
{"priority":3,"institution_key":"de-hsrw","name":"Rhine-Waal University of Applied Sciences","country":"Germany","country_code":"de","website":"https://www.hochschule-rhein-waal.de/en","admissions_url":"https://www.hochschule-rhein-waal.de/en/study/before-starting-university/application-process/bachelors-degrees","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":16,"faculty_count":0,"programmes":[],"handoff_url":"https://www.hochschule-rhein-waal.de/en/study/programmes-and-enrolment-modes/all-degree-programmes","ib_summary_unverified":"Apply through uni-assist; your IB must meet the KMK subject rule. IB English at 5 or more counts as B2 English. Open programmes admit everyone eligible; restricted ones rank on grade."},"targets":[{"name":"Agribusiness","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/agribusiness-ba"},{"name":"Bioengineering","credential":"BSc","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/bioengineering-bsc"},{"name":"Engineering","credential":"BSc","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/engineering-bsc"},{"name":"Engineering for Sustainability","credential":"BSc","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/engineering-for-sustainability-bsc"},{"name":"Environment and Energy","credential":"BSc","campus":"Kamp-Lintfort","url":"https://www.hochschule-rhein-waal.de/en/environment-and-energy-bsc"},{"name":"Gender and Diversity","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/gender-and-diversity-ba"},{"name":"Information and Communication Design","credential":"BA","campus":"Kamp-Lintfort","url":"https://www.hochschule-rhein-waal.de/en/information-and-communication-design-ba"},{"name":"Infotronic Systems Engineering","credential":"BSc","campus":"Kamp-Lintfort","url":"https://www.hochschule-rhein-waal.de/en/infotronic-systems-engineering-bsc"},{"name":"International Business Administration","credential":"BA","campus":"Kamp-Lintfort","url":"https://www.hochschule-rhein-waal.de/en/international-business-administration-ba"},{"name":"International Business and Management","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/international-business-and-management-ba"},{"name":"International Relations","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/international-relations-ba"},{"name":"International Taxation and Law","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/international-taxation-and-law-ba"},{"name":"Mobility and Logistics","credential":"BSc","campus":"Kamp-Lintfort","url":"https://www.hochschule-rhein-waal.de/en/mobility-and-logistics-bsc"},{"name":"Nature-Inspired Materials","credential":"BSc","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/nature-inspired-materials-bsc"},{"name":"Sustainable Agriculture","credential":"BSc","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/sustainable-agriculture-bsc"},{"name":"Sustainable Tourism","credential":"BA","campus":"Kleve","url":"https://www.hochschule-rhein-waal.de/en/sustainable-tourism-ba"}]}
```

**Technical University of Munich** — `de-tum`; overviews.

```json
{"priority":3,"institution_key":"de-tum","name":"Technical University of Munich","country":"Germany","country_code":"de","website":"https://www.tum.de/en/","admissions_url":"https://www.tum.de/en/studies/application","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":8,"faculty_count":0,"programmes":[],"handoff_url":"https://www.tum.de/en/studies/degree-programs?graduation=Bachelor&languageProficiency=English","ib_summary_unverified":"Your six IB subjects must meet the KMK rule; uni-assist converts your IB to a German grade (VPD). Nobody is ranked: five degrees use grade-based aptitude points with an interview or test band, three are open."},"targets":[{"name":"Aerospace","credential":"BSc","campus":"Garching and Ottobrunn","url":"https://www.tum.de/en/studies/degree-programs/detail/aerospace-bachelor-of-science-bsc"},{"name":"Bioeconomy","credential":"BSc","campus":"Straubing","url":"https://www.tum.de/en/studies/degree-programs/detail/bioeconomy-bachelor-of-science-bsc"},{"name":"Geodesy and Earth Observation","credential":"BSc","url":"https://www.tum.de/en/studies/degree-programs/detail/geodesy-and-earth-observation-bachelor-of-science-bsc"},{"name":"Information Engineering","credential":"BSc","campus":"Heilbronn","url":"https://www.tum.de/en/studies/degree-programs/detail/information-engineering-at-tum-campus-heilbronn-bachelor-of-science-bsc"},{"name":"Management and Data Science","credential":"BSc","campus":"Heilbronn","url":"https://www.tum.de/en/studies/degree-programs/detail/management-and-data-science"},{"name":"Management and Technology","credential":"BSc","campus":"Munich and Garching","url":"https://www.tum.de/en/studies/degree-programs/detail/management-and-technology-bachelor-of-science-bsc"},{"name":"Sustainable Engineering for Materials and Processes","credential":"BSc","campus":"Straubing","url":"https://www.tum.de/en/studies/degree-programs/detail/sustainable-engineering-for-materials-and-processes-bachelor-of-science-bsc"},{"name":"Sustainable Management and Technology","credential":"BSc","campus":"Straubing","url":"https://www.tum.de/en/studies/degree-programs/detail/sustainable-management-and-technology-bachelor-of-science-bsc"}]}
```

**University of Freiburg - University College Freiburg** — `de-ucf`; overviews.

```json
{"priority":3,"institution_key":"de-ucf","name":"University of Freiburg - University College Freiburg","country":"Germany","country_code":"de","website":"https://uni-freiburg.de/ucf/","admissions_url":"https://uni-freiburg.de/ucf/las/apply/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://uni-freiburg.de/ucf/las/apply/","ib_summary_unverified":"Ranked on your IB converted to a German grade, improved by up to 0.5 each for a 500-word essay and a 500-word motivation letter. English at B2; Freiburg itself must recognise your IB (KMK rule)."},"targets":[{"name":"Liberal Arts and Sciences","credential":"BA or BSc (by major)","url":"https://uni-freiburg.de/ucf/las/"}]}
```

**WHU - Otto Beisheim School of Management** — `de-whu`; overviews.

```json
{"priority":3,"institution_key":"de-whu","name":"WHU - Otto Beisheim School of Management","country":"Germany","country_code":"de","website":"https://www.whu.edu/en/","admissions_url":"https://www.whu.edu/en/programs/bachelor-program/bachelor-in-international-business-administration/application-admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.whu.edu/en/programs/bachelor-program/bachelor-in-international-business-administration/","ib_summary_unverified":"An IB Diploma qualifies (\"e.g., IB\"); no points minimum is published and you apply on predicted grades. WHU selects by its own analytical test, an online assessment and interviews."},"targets":[{"name":"Bachelor in International Business Administration","credential":"BSc","url":"https://www.whu.edu/en/programs/bachelor-program/bachelor-in-international-business-administration/"}]}
```

### Greece

**Aristotle University of Thessaloniki** — `gr-auth`; overviews.

```json
{"priority":3,"institution_key":"gr-auth","name":"Aristotle University of Thessaloniki","country":"Greece","country_code":"gr","website":"https://www.auth.gr/en/homepage/","admissions_url":"https://auth.gr/en/ugrad-en/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://apply.studyingreece.edu.gr/en/programmes?language=English","ib_summary_unverified":"No fixed IB score: most degrees take the IB Diploma and count 28 points in your favour; Sport asks 28 and Medicine adds an admission test. Three sciences need Maths, Physics and Chemistry passed."},"targets":[{"name":"Clean Energy Science and Engineering","credential":"BSc","url":"https://cese.auth.gr/program/bachelor"},{"name":"Materials Science and Engineering","credential":"Diploma with Integrated Master's (5 years)","url":"https://msen.auth.gr/program/integrated-master"},{"name":"Environmental Sciences and Engineering","credential":"Diploma with Integrated Master's (5 years)","url":"https://envsen.auth.gr/program"},{"name":"Sustainable Agriculture and Food Science","credential":"Diploma with Integrated Master's (5 years)","url":"https://safs.auth.gr/program"},{"name":"Sport and Exercise Sciences for Health and Performance","credential":"BSc","url":"https://sportsciences.auth.gr/program"},{"name":"Bachelor of Laws (LL.B.)","credential":"LLB","url":"https://aristotlelaw.edu.gr/the-programme/"},{"name":"Medicine (English-taught Medical Degree)","credential":"Medical Degree (Ptychion Iatrikes)","url":"https://aristotlemedical.edu.gr/courses-curiculum"}]}
```

**Athens University of Economics and Business** — `gr-aueb`; overviews.

```json
{"priority":3,"institution_key":"gr-aueb","name":"Athens University of Economics and Business","country":"Greece","country_code":"gr","website":"https://www.aueb.gr/en","admissions_url":"https://ibt.aueb.gr/apply-now/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://ibt.aueb.gr/apply-now/","ib_summary_unverified":"The IB Diploma is named as an accepted qualification, with no points or subjects stated; last two school years must be on site abroad, plus B2 English proof."},"targets":[{"name":"International Business and Technology","credential":"BSc","url":"https://ibt.aueb.gr/program/"}]}
```

**National and Kapodistrian University of Athens** — `gr-nkua`; overviews.

```json
{"priority":3,"institution_key":"gr-nkua","name":"National and Kapodistrian University of Athens","country":"Greece","country_code":"gr","website":"https://en.uoa.gr/","admissions_url":"https://en.uoa.gr/studies/undergraduate_programs","ib_url":"https://medicen.uoa.gr/admission-requirements/","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://en.uoa.gr/studies/undergraduate_programs","ib_summary_unverified":"The English-taught degrees take the IB Diploma directly. Medicine and Pharmacy ask 36 points with three HL subjects, two of them Physics, Chemistry or Biology; the BA asks an indicative 70% average."},"targets":[{"name":"Archaeology, History and Literature of Ancient Greece","credential":"BA","url":"https://baag.uoa.gr/overview/"},{"name":"Medicine (English-taught Medical Degree)","credential":"Medical Degree (6 years)","url":"https://medicen.uoa.gr/overview/"},{"name":"Integrated Master in Pharmacy (MPharm)","credential":"Integrated Master in Pharmacy (MPharm)","url":"https://mpharmnkua.uoa.gr/overview/"}]}
```

**The American College of Greece (Deree)** — `gr-acg-deree`; overviews.

```json
{"priority":3,"institution_key":"gr-acg-deree","name":"The American College of Greece (Deree)","country":"Greece","country_code":"gr","website":"https://www.acg.edu","admissions_url":"https://www.acg.edu/admissions/undergraduate-admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.acg.edu/academics/undergraduate/undergraduate-programs/","ib_summary_unverified":"The IB Diploma proves English. Admission is by transcripts, a teacher recommendation and an interview; programme specifications give 24 IB points as the standard minimum. Merit awards cut tuition 10% to 35%."},"targets":[{"name":"Biomedical Sciences","credential":"BSc","url":"https://www.acg.edu/academics/undergraduate/undergraduate-programs/school-of-science-and-technology/majors-biomedical-sciences/"},{"name":"International Relations and European Affairs","credential":"BA","url":"https://www.acg.edu/academics/undergraduate/undergraduate-programs/frances-rich-school-of-arts-humanities-and-social-sciences/majors/international-relations-and-european-affairs/"},{"name":"Music Performance","credential":"BA (Hons)","url":"https://www.acg.edu/academics/undergraduate/undergraduate-programs/frances-rich-school-of-arts-humanities-and-social-sciences/majors/music-performance/"}]}
```

**University of Crete** — `gr-uoc`; overviews.

```json
{"priority":3,"institution_key":"gr-uoc","name":"University of Crete","country":"Greece","country_code":"gr","website":"https://www.uoc.gr/en/home/","admissions_url":"https://www.uoc.gr/en/home/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://imed.med.uoc.gr/admissions/","ib_summary_unverified":"The English-taught Medicine takes the IB Diploma directly: three HL subjects, two of them from Physics, Chemistry, Biology or Maths, plus three SL; no points total is stated."},"targets":[{"name":"International Program in Medicine","credential":"Medical Degree (6 years)","campus":"Heraklion","url":"https://imed.med.uoc.gr/curriculum/"}]}
```

**University of Patras** — `gr-upatras`; overviews.

```json
{"priority":3,"institution_key":"gr-upatras","name":"University of Patras","country":"Greece","country_code":"gr","website":"https://www.upatras.gr/en/","admissions_url":"https://www.upatras.gr/en/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://meden.upatras.gr/en/application/","ib_summary_unverified":"The IB Diploma counts as your high school diploma (20% of the selection score); no points or subjects are stated. CV, English and an interview make up the rest."},"targets":[{"name":"English Medical Studies Program","credential":"Medical Degree (6 years)","url":"https://meden.upatras.gr/en/study-regulations/"}]}
```

**University of the Aegean** — `gr-aegean`; overviews.

```json
{"priority":3,"institution_key":"gr-aegean","name":"University of the Aegean","country":"Greece","country_code":"gr","website":"https://www.aegean.gr/en","admissions_url":"https://www.aegean.gr/en","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://eastmedstudies.aegean.gr/admissions/selection-criteria/","ib_summary_unverified":"The BA names the International Baccalaureate as an accepted qualification, with an indicative 70% average or equivalent; last two school years abroad; B2 English (IELTS 6.5)."},"targets":[{"name":"Eastern Mediterranean Studies. Archaeology, History, Culture","credential":"BA","campus":"Rhodes","url":"https://eastmedstudies.aegean.gr/programme/"}]}
```

### Hong Kong

**City University of Hong Kong** — `hk-cityu`; overviews.

```json
{"priority":3,"institution_key":"hk-cityu","name":"City University of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://www.cityu.edu.hk/","admissions_url":"https://www.cityu.edu.hk/admo/admissions/international-admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":10,"programmes":[],"handoff_url":"https://www.cityu.edu.hk/admo/admissions/international-admissions","ib_summary_unverified":"The IB Diploma is accepted for first-year entry; English A grade 4 (HL or SL), or English B grade 4 at HL or 5 at SL. Some programmes add subjects. Middle half of 2025 entrants: 32 to 38 points."},"targets":[{"name":"Bachelor of Veterinary Medicine","credential":"Bachelor of Veterinary Medicine","url":"https://www.cityu.edu.hk/admo/programmes/bachelor-veterinary-medicine"},{"name":"BSc Data Science","credential":"BSc","url":"https://www.cityu.edu.hk/admo/programmes/bsc-data-science"},{"name":"BA Creative Media","credential":"BA","url":"https://www.cityu.edu.hk/admo/programmes/ba-creative-media"}]}
```

**Hong Kong Baptist University** — `hk-hkbu`; overviews.

```json
{"priority":3,"institution_key":"hk-hkbu","name":"Hong Kong Baptist University","country":"Hong Kong","country_code":"hk","website":"https://www.hkbu.edu.hk/","admissions_url":"https://admissions.hkbu.edu.hk/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://admissions.hkbu.edu.hk/programmes.html","ib_summary_unverified":"No minimum total is set; the middle half of 2026 entrants had 30-34 points. IB English A grade 4 (English B: 4 at HL, 5 at SL). Chinese Medicine also asks for Biology or Chemistry and a Chinese qualification."},"targets":[{"name":"Communication (Journalism, PR and Advertising)","credential":"Bachelor of Communication (Hons)","url":"https://admissions.hkbu.edu.hk/programmes/school-of-communication/bachelor-of-communication-hons-journalism-and-digital-media-public-relations-and-advertising-year1.html"},{"name":"Chinese Medicine and Biomedical Science","credential":"Bachelor of Chinese Medicine and BSc","url":"https://admissions.hkbu.edu.hk/programmes/school-of-chinese-medicine/bachelor-of-chinese-medicine-and-bachelor-of-science-hons-in-biomedical-science-year1.html"},{"name":"Bachelor of Arts (Hons) in Film and Television","credential":"BA (Hons)","url":"https://admissions.hkbu.edu.hk/programmes/school-of-creative-arts/bachelor-of-arts-hons-in-film-and-television-year1.html"}]}
```

**Hong Kong Metropolitan University** — `hk-hkmu`; overviews.

```json
{"priority":3,"institution_key":"hk-hkmu","name":"Hong Kong Metropolitan University","country":"Hong Kong","country_code":"hk","website":"https://www.hkmu.edu.hk/","admissions_url":"https://www.hkmu.edu.hk/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://admissions.hkmu.edu.hk/ug/overseas/","ib_summary_unverified":"IB Diploma with an overall minimum of 24 points, and grade 4 or above in IB English. An interview is normally required. Programmes may add subjects."},"targets":[{"name":"Cyber and Computer Security","credential":"Bachelor of Science with Honours","url":"https://www.hkmu.edu.hk/st/engsc/bachelor-of-science-with-honours-in-cyber-and-computer-security-bschccsj1-jupas-code-9719-3-credit/"},{"name":"Electronic and Computer Engineering","credential":"Bachelor of Engineering with Honours","url":"https://www.hkmu.edu.hk/st/engsc/bachelor-of-engineering-with-honours-in-electronic-and-computer-engineering-benghecej1-jupas-code-9720-3-credit/"}]}
```

**The Chinese University of Hong Kong** — `hk-cuhk`; overviews.

```json
{"priority":3,"institution_key":"hk-cuhk","name":"The Chinese University of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://www.cuhk.edu.hk/english/","admissions_url":"https://admission.cuhk.edu.hk/application/overseas-other-qualifications-non-local-international-team/requirements/","ib_url":"https://admission.cuhk.edu.hk/application/overseas-other-qualifications-non-local-international-team/requirements/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":8,"programmes":[],"handoff_url":"https://admission.cuhk.edu.hk/programmes/list/","ib_summary_unverified":"Minimum 30 of 45 points and IB English grade 4. IB Chinese grade 4 is asked unless the faculty Dean exempts you. The 2027 IB sheet lists subject preferences per programme, not requirements."},"targets":[{"name":"Medicine (MBChB)","credential":"Bachelor of Medicine and Bachelor of Surgery","url":"https://admission.cuhk.edu.hk/programme/medun/"},{"name":"Computer Science and Engineering","credential":"BSc or BEng","url":"https://admission.cuhk.edu.hk/programme/bcsen/"},{"name":"Integrated BBA Programme","credential":"Bachelor of Business Administration","url":"https://admission.cuhk.edu.hk/programme/ibbac/"}]}
```

**The Education University of Hong Kong** — `hk-eduhk`; overviews.

```json
{"priority":3,"institution_key":"hk-eduhk","name":"The Education University of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://www.eduhk.hk/en/","admissions_url":"https://www.eduhk.hk/acadprog/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.apply.eduhk.hk/ug/programme_list","ib_summary_unverified":"The IB Diploma is accepted; English A grade 4, or English B grade 4 at HL or 5 at SL. Chinese grade 4 is also asked, with a case-by-case waiver for English-medium programmes. No points minimum is set."},"targets":[{"name":"Psychology","credential":"Bachelor of Social Sciences (Honours)","url":"https://www.apply.eduhk.hk/ug/programmes/psy"},{"name":"AI and Educational Technology","credential":"Bachelor of Science (Honours)","url":"https://www.apply.eduhk.hk/ug/programmes/aiet"},{"name":"Integrated Environmental Management","credential":"Bachelor of Science (Honours)","url":"https://www.apply.eduhk.hk/ug/programmes/iem"},{"name":"Personal Finance","credential":"Bachelor of Arts (Honours)","url":"https://www.apply.eduhk.hk/ug/programmes/bapf"},{"name":"Special Education","credential":"Bachelor of Arts (Honours)","url":"https://www.apply.eduhk.hk/ug/programmes/base"}]}
```

**The Hong Kong Academy for Performing Arts** — `hk-hkapa`; overviews.

```json
{"priority":3,"institution_key":"hk-hkapa","name":"The Hong Kong Academy for Performing Arts","country":"Hong Kong","country_code":"hk","website":"https://www.hkapa.edu/","admissions_url":"https://www.hkapa.edu/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.hkapa.edu/admissions/admissions-and-application/admission-requirements/admission-requirements-undergraduate-programmes","ib_summary_unverified":"IB Diploma with 24 points or more, plus English: English A SL 5 or HL 4, or English B SL 5 or HL 4. Places are decided by audition, interview or portfolio, set by each school."},"targets":[{"name":"Music","credential":"Bachelor of Music (Honours)","url":"https://www.hkapa.edu/music/study-with-us/programme/bachelor-of-music-honours-degree"},{"name":"Dance","credential":"Bachelor of Fine Arts (Honours)","url":"https://www.hkapa.edu/dance/study-with-us/programme/bachelor-of-fine-arts-honours-in-dance"},{"name":"Theatre and Entertainment Arts","credential":"Bachelor of Fine Arts (Honours)","url":"https://www.hkapa.edu/tea/study-with-us/programme/bachelor-of-fine-arts-honours-degree-in-theatre-and-entertainment-arts"}]}
```

**The Hong Kong Polytechnic University** — `hk-polyu`; overviews.

```json
{"priority":3,"institution_key":"hk-polyu","name":"The Hong Kong Polytechnic University","country":"Hong Kong","country_code":"hk","website":"https://www.polyu.edu.hk/","admissions_url":"https://www.polyu.edu.hk/study/ug/admissions/international-other-qualifications/international-other-qualifications-key-dates","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":11,"programmes":[],"handoff_url":"https://www.polyu.edu.hk/study/ug/admissions/international-other-qualifications","ib_summary_unverified":"Successful applicants typically reach 32 or more of 45; a predicted 30 or more may earn an interview. IB English or English Literature at grade 4 (HL or SL). Preferred subjects are listed per scheme."},"targets":[{"name":"Hotel and Tourism Management","credential":"BSc (Hons)","url":"https://www.polyu.edu.hk/study/ug/international/2027/js3310"},{"name":"Design","credential":"BA (Hons)","url":"https://www.polyu.edu.hk/study/ug/international/2027/js3569"},{"name":"Optometry","credential":"BSc (Hons)","url":"https://www.polyu.edu.hk/study/ug/international/2027/js3290"}]}
```

**The Hong Kong University of Science and Technology** — `hk-hkust`; overviews.

```json
{"priority":3,"institution_key":"hk-hkust","name":"The Hong Kong University of Science and Technology","country":"Hong Kong","country_code":"hk","website":"https://hkust.edu.hk/","admissions_url":"https://join.hkust.edu.hk/admissions/international-qualifications","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://join.hkust.edu.hk/our-programs","ib_summary_unverified":"No minimum total is set; the middle half of 2026 entrants had 35-41 points. Subjects are set per programme; IB English A needs grade 4 (English B: 4 at HL, 5 at SL). Your coordinator sends predicted grades."},"targets":[{"name":"Computer Science","credential":"BEng or BSc","url":"https://join.hkust.edu.hk/our-programs/school-of-engineering/computer-science"},{"name":"Quantitative Finance","credential":"BSc","url":"https://join.hkust.edu.hk/our-programs/school-of-business-and-management/quantitative-finance"},{"name":"Business and Management","credential":"BBA","url":"https://join.hkust.edu.hk/our-programs/school-of-business-and-management"}]}
```

**The University of Hong Kong** — `hk-hku`; overviews.

```json
{"priority":3,"institution_key":"hk-hku","name":"The University of Hong Kong","country":"Hong Kong","country_code":"hk","website":"https://www.hku.hk/","admissions_url":"https://admissions.hku.hk/apply/international-qualifications","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":14,"programmes":[],"handoff_url":"https://admissions.hku.hk/programmes/undergraduate-programmes","ib_summary_unverified":"Set per programme: an expected IB total from 34 (most arts, science, engineering) to 43 (MBBS), plus subject grades; English A 5 or English B 6. Many programmes interview shortlisted applicants."},"targets":[{"name":"Bachelor of Dental Surgery","credential":"Bachelor of Dental Surgery","url":"https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-dental-surgery"},{"name":"Bachelor of Medicine and Bachelor of Surgery","credential":"Bachelor of Medicine and Bachelor of Surgery","url":"https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-medicine-and-bachelor-of-surgery"},{"name":"Bachelor of Science in Surveying","credential":"BSc","url":"https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-science-surveying"}]}
```

### Iceland

**Iceland University of the Arts** — `is-lhi`; overviews.

```json
{"priority":3,"institution_key":"is-lhi","name":"Iceland University of the Arts","country":"Iceland","country_code":"is","website":"https://www.lhi.is/en","admissions_url":"https://www.lhi.is/en/namsframbod/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.lhi.is/en/namsleid/samtimadans-ba/","ib_summary_unverified":"LHÍ does not name the IB: it asks for a matriculation exam or a comparable foreign school-leaving exam. Selection is by videos, audition and interview; EU/EEA applicants' English is judged at interview."},"targets":[{"name":"Contemporary Dance Practices BA","credential":"BA","url":"https://www.lhi.is/en/namsleid/samtimadans-ba/"}]}
```

**University of Iceland** — `is-hi`; overviews.

```json
{"priority":3,"institution_key":"is-hi","name":"University of Iceland","country":"Iceland","country_code":"is","website":"https://english.hi.is/","admissions_url":"https://english.hi.is/study/apply/admission-requirements","ib_url":"https://english.hi.is/international-baccalaureate","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://english.hi.is/international-baccalaureate","ib_summary_unverified":"A full IB Diploma is accepted for bachelor's admission; the IB Career-related Programme is not. HÍ's IB page says no English test or translation is needed. No points minimum is published."},"targets":[{"name":"International Studies in Education","credential":"BA","url":"https://english.hi.is/international-studies-education/ba"},{"name":"English Studies","credential":"BA","url":"https://english.hi.is/english-studies/ba"}]}
```

### Ireland

**Atlantic Technological University** — `ie-atu`; overviews.

```json
{"priority":3,"institution_key":"ie-atu","name":"Atlantic Technological University","country":"Ireland","country_code":"ie","website":"https://www.atu.ie/","admissions_url":"https://www.atu.ie/courses","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://www.atu.ie/courses?ct%5B0%5D=23&nfq%5B0%5D=8&ftpt%5B0%5D=26","ib_summary_unverified":"Six subjects with English (or Irish) and usually Maths; no third language. Strictest: Sligo Engineering HL Maths 5. ATU asks non-native speakers for IELTS 6.5 'or equivalent'; CAO accepts IB English A SL 4."},"targets":[{"name":"Mechanical Engineering (Sligo)","credential":"BEng (Hons)","url":"https://www.atu.ie/courses/bachelor-of-engineering-honours-mechanical-engineering-sligo-full-time"},{"name":"Fine Art (Sligo)","credential":"BA (Hons)","url":"https://www.atu.ie/courses/bachelor-of-arts-honours-fine-art"}]}
```

**Dublin City University** — `ie-dcu`; overviews.

```json
{"priority":3,"institution_key":"ie-dcu","name":"Dublin City University","country":"Ireland","country_code":"ie","website":"https://www.dcu.ie/","admissions_url":"https://www.dcu.ie/registry/international-admissions-undergraduate-and-postgraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://www.dcu.ie/courses/undergraduate-courses-dcu?field_undergraduate_postgraduate_value=undergraduate","ib_summary_unverified":"Six subjects including English (or Irish) and Maths; no third language in general. Strictest: Actuarial Mathematics HL Maths 6; Global Business (Germany) HL German 5; Computer Science Maths SL 5 or HL 4."},"targets":[{"name":"Computer Science","credential":"BSc","url":"https://www.dcu.ie/courses/undergraduate/school-computing/computer-science"},{"name":"Actuarial Mathematics","credential":"BSc","url":"https://www.dcu.ie/courses/undergraduate/school-mathematical-sciences/actuarial-mathematics"},{"name":"Journalism","credential":"BA","url":"https://www.dcu.ie/courses/undergraduate/school-communications/journalism"}]}
```

**Maynooth University** — `ie-maynooth`; overviews.

```json
{"priority":3,"institution_key":"ie-maynooth","name":"Maynooth University","country":"Ireland","country_code":"ie","website":"https://www.maynoothuniversity.ie/","admissions_url":"https://www.maynoothuniversity.ie/study-maynooth/undergraduate-studies","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.maynoothuniversity.ie/study-maynooth/undergraduate-studies/courses","ib_summary_unverified":"Six subjects with English; Arts and Music add a third language, Business and Science Maths (SL 5 or HL 3). Strictest: Engineering HL Maths 5 plus a science; Music a video audition at grade 6 standard."},"targets":[{"name":"Bachelor of Music","credential":"BMus","url":"https://www.maynoothuniversity.ie/study-maynooth/undergraduate-studies/courses/bachelor-music"},{"name":"Bachelor of Engineering (Electronic Engineering)","credential":"BE","url":"https://www.maynoothuniversity.ie/study-maynooth/undergraduate-studies/courses/bachelor-engineering"},{"name":"Bachelor of Science","credential":"BSc","url":"https://www.maynoothuniversity.ie/study-maynooth/undergraduate-studies/courses/bachelor-science"}]}
```

**Munster Technological University** — `ie-mtu`; overviews.

```json
{"priority":3,"institution_key":"ie-mtu","name":"Munster Technological University","country":"Ireland","country_code":"ie","website":"https://www.mtu.ie/","admissions_url":"https://www.mtu.ie/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://www.mtu.ie/courses/course-search/?keywords=&courseStudyModeName=Full-time&courseType=Undergraduate&courseNFQLevelName=Level+8","ib_summary_unverified":"Six subjects with Maths and English (or Irish); no third language. Strictest: several BEng degrees HL Maths 5; Software Development Maths SL 6 or HL 3; Biomedical Science HL 5 in a lab science."},"targets":[{"name":"Fine Art","credential":"BA (Hons)","url":"https://www.mtu.ie/courses/mt821/"},{"name":"Mechanical and Manufacturing Engineering","credential":"BEng (Hons)","url":"https://www.mtu.ie/courses/mt834/"},{"name":"Software Development","credential":"BSc (Hons)","url":"https://www.mtu.ie/courses/mt800/"}]}
```

**National College of Art and Design** — `ie-ncad`; overviews.

```json
{"priority":3,"institution_key":"ie-ncad","name":"National College of Art and Design","country":"Ireland","country_code":"ie","website":"https://www.ncad.ie/","admissions_url":"https://www.ncad.ie/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":10,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ncad.ie/undergraduate/undergraduate-year-1/","ib_summary_unverified":"IB Diploma with 24 points (CAO's 2026 criteria; 2027 not yet published), with English and Irish; NUI exempts most students born or schooled abroad from Irish."},"targets":[{"name":"First Year Art & Design (Common Entry)","credential":"BA","url":"https://www.ncad.ie/undergraduate/first-year/"},{"name":"Graphic Design / Moving Image Design","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/graphic-design/"},{"name":"Textiles, Jewellery & Objects","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/textile-and-surface-design/"},{"name":"Fine Art and Applied Art","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-fine-art/"},{"name":"Education and Design or Fine Art","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-education/design-or-fine-art-and-education/"},{"name":"Fashion Design","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/fashion-design/"},{"name":"Product Design","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/product-design/"},{"name":"Visual Culture","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-visual-culture/ba-hons-visual-culture/"},{"name":"Illustration","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/illustration/"},{"name":"Interaction Design","credential":"BA","url":"https://www.ncad.ie/undergraduate/school-of-design/interaction-design/"}]}
```

**RCSI University of Medicine and Health Sciences** — `ie-rcsi`; overviews.

```json
{"priority":3,"institution_key":"ie-rcsi","name":"RCSI University of Medicine and Health Sciences","country":"Ireland","country_code":"ie","website":"https://www.rcsi.com/dublin","admissions_url":"https://www.rcsi.com/dublin/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.rcsi.com/dublin/undergraduate","ib_summary_unverified":"3 HL at 5 and 3 SL at 4, including English, Maths and a second language; most courses also a lab science. EU applicants apply through CAO and are ranked on IB points converted to CAO points."},"targets":[{"name":"Medicine","credential":"MB BCh BAO","url":"https://www.rcsi.com/dublin/undergraduate/medicine"},{"name":"Dentistry","credential":"BDS","url":"https://www.rcsi.com/dublin/undergraduate/dentistry"},{"name":"Pharmacy","credential":"BSc Pharmacy (Hons) and MPharm","url":"https://www.rcsi.com/dublin/undergraduate/pharmacy"},{"name":"Physiotherapy","credential":"BSc","url":"https://www.rcsi.com/dublin/undergraduate/physiotherapy"},{"name":"Advanced Therapeutic Technologies","credential":"BSc","url":"https://www.rcsi.com/dublin/undergraduate/advanced-therapeutic-technologies"}]}
```

**South East Technological University** — `ie-setu`; overviews.

```json
{"priority":3,"institution_key":"ie-setu","name":"South East Technological University","country":"Ireland","country_code":"ie","website":"https://www.setu.ie/","admissions_url":"https://www.setu.ie/courses","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://www.setu.ie/courses/all?type=CAO&level=8","ib_summary_unverified":"Six subjects with English (or Irish); Maths only where a course names it. Some ask more: Engineering Maths SL 6 or HL 4; Pharmacy HL 5 in Chemistry and in a second lab science (2026-entry pages)."},"targets":[{"name":"Veterinary Medicine","credential":"MVB","url":"https://www.setu.ie/courses/mvb-in-veterinary-medicine"},{"name":"Pharmacy","credential":"MPharm","url":"https://www.setu.ie/courses/master-of-pharmacy-mpharm"},{"name":"Engineering (Common Entry, Waterford)","credential":"BEng (Hons)","url":"https://www.setu.ie/courses/bachelor-of-engineering-hons-common-entry"}]}
```

**Technological University Dublin** — `ie-tu-dublin`; overviews.

```json
{"priority":3,"institution_key":"ie-tu-dublin","name":"Technological University Dublin","country":"Ireland","country_code":"ie","website":"https://www.tudublin.ie/","admissions_url":"https://www.tudublin.ie/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://www.tudublin.ie/study/find-a-course/search-results/?courseType=Undergraduate&courseLevel=8&courseEntry=1st+year+entry","ib_summary_unverified":"Six subjects with Maths and English (or Irish); no third language. Some ask more: Engineering (General Entry) HL Maths 5; Mathematics and Statistics Maths SL 6 or HL 4; Law and Journalism HL English 5."},"targets":[{"name":"Architecture","credential":"BArch (Hons)","url":"https://www.tudublin.ie/study/undergraduate/courses/architecture-tu832/"},{"name":"Drama (Performance)","credential":"BA (Hons)","url":"https://www.tudublin.ie/study/undergraduate/courses/drama-performance-tu962/"}]}
```

**Trinity College Dublin** — `ie-tcd`; overviews.

```json
{"priority":3,"institution_key":"ie-tcd","name":"Trinity College Dublin","country":"Ireland","country_code":"ie","website":"https://www.tcd.ie/","admissions_url":"https://www.tcd.ie/study/apply/admission-requirements/undergraduate/","ib_url":"https://www.tcd.ie/study/apply/admission-requirements/undergraduate/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.tcd.ie/courses/undergraduate/a-z-of-ug-courses/","ib_summary_unverified":"3 HL at 5 and 3 SL at 4 in one sitting, including English (SL 4), Maths and another language. Stricter courses: Mathematics needs HL Maths 6, Engineering HL Maths 5; Medicine HL 6 and 5 in two sciences."},"targets":[{"name":"Medicine","credential":"MB BCh BAO","url":"https://www.tcd.ie/courses/undergraduate/courses/medicine/"},{"name":"Engineering","credential":"BAI (Hons) / MAI","url":"https://www.tcd.ie/courses/undergraduate/courses/engineering/"},{"name":"Philosophy","credential":"BA (Hons)","url":"https://www.tcd.ie/courses/undergraduate/courses/philosophy/"}]}
```

**University College Cork** — `ie-ucc`; overviews.

```json
{"priority":3,"institution_key":"ie-ucc","name":"University College Cork","country":"Ireland","country_code":"ie","website":"https://www.ucc.ie/en/","admissions_url":"https://www.ucc.ie/en/study/undergrad/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.ucc.ie/en/study/undergrad/courses/","ib_summary_unverified":"Six subjects with English; a third language for most Arts, Law, Commerce, Medicine and Health degrees; Maths for Commerce and sciences. Strictest: Medicine HL 5 in Chemistry and in Physics or Biology, plus HPAT."},"targets":[{"name":"Medicine","credential":"MB BCh BAO (Hons)","url":"https://www.ucc.ie/en/ck701/"},{"name":"Engineering","credential":"BE (Hons)","url":"https://www.ucc.ie/en/ck600/"},{"name":"Commerce","credential":"BComm (Hons)","url":"https://www.ucc.ie/en/ck201/"}]}
```

**University College Dublin** — `ie-ucd`; overviews.

```json
{"priority":3,"institution_key":"ie-ucd","name":"University College Dublin","country":"Ireland","country_code":"ie","website":"https://www.ucd.ie/","admissions_url":"https://www.ucd.ie/global/study-at-ucd/undergraduate/entryrequirements/","ib_url":"https://www.ucd.ie/global/study-at-ucd/undergraduate/entryrequirements/internationalbaccalaureatediploma/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":10,"programmes":[],"handoff_url":"https://www.ucd.ie/myucd/courses/a-z-course-list/","ib_summary_unverified":"Six subjects including English; courses add Maths, a lab science or a third language. Strictest: Actuarial HL Maths 6; Engineering HL Maths 5 and HL science 4; Medicine a third language and HPAT."},"targets":[{"name":"Engineering","credential":"BE","url":"https://www.ucd.ie/courses/bsc-engineering"},{"name":"Veterinary Medicine","credential":"MVB","url":"https://www.ucd.ie/courses/mvb-veterinary-medicine"},{"name":"Actuarial and Financial Studies","credential":"BAFS","url":"https://www.ucd.ie/courses/bsc-actuarial-and-financial-studies"}]}
```

**University of Galway** — `ie-galway`; overviews.

```json
{"priority":3,"institution_key":"ie-galway","name":"University of Galway","country":"Ireland","country_code":"ie","website":"https://www.universityofgalway.ie/","admissions_url":"https://www.universityofgalway.ie/courses/undergraduate-courses/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.universityofgalway.ie/courses/undergraduate-courses/","ib_summary_unverified":"Six subjects including English; Arts, Commerce and Medicine add another language, Commerce Maths. Strictest: Engineering HL Maths 5; Medicine a language, a lab science and HPAT; Maths courses HL 5 or SL 7."},"targets":[{"name":"Medicine","credential":"MB BCh BAO","url":"https://www.universityofgalway.ie/courses/undergraduate-courses/surgery-obstetrics.html"},{"name":"Engineering (Undenominated)","credential":"BE + ME","url":"https://www.universityofgalway.ie/courses/undergraduate-courses/engineering-undenominated.html"},{"name":"Marine Science","credential":"BSc (Hons)","url":"https://www.universityofgalway.ie/courses/undergraduate-courses/marine-science.html"}]}
```

**University of Limerick** — `ie-ul`; overviews.

```json
{"priority":3,"institution_key":"ie-ul","name":"University of Limerick","country":"Ireland","country_code":"ie","website":"https://www.ul.ie/","admissions_url":"https://www.ul.ie/study/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":4,"faculty_count":4,"programmes":[],"handoff_url":"https://www.ul.ie/study/undergraduate/alphabetical-list-of-courses","ib_summary_unverified":"The Diploma with 24 points for every Level 8 course, with English, Maths and another language (Irish or other). Strictest: Financial Mathematics HL Maths 6; Medicine a science and HPAT."},"targets":[{"name":"Medicine (Undergraduate Entry)","credential":"BMBS","url":"https://www.ul.ie/study/undergraduate/undergraduate-entry-medicine-bmbs"},{"name":"Financial Mathematics","credential":"BSc","url":"https://www.ul.ie/study/undergraduate/financial-mathematics-bsc"},{"name":"Architecture","credential":"BArch","url":"https://www.ul.ie/study/undergraduate/architecture-barch"},{"name":"Irish Music","credential":"BA","url":"https://www.ul.ie/study/undergraduate/irish-music-ba"}]}
```

### Japan

**Akita International University** — `jp-aiu`; overviews.

```json
{"priority":3,"institution_key":"jp-aiu","name":"Akita International University","country":"Japan","country_code":"jp","website":"https://web.aiu.ac.jp/en/","admissions_url":"https://admission.aiu.ac.jp/en/ug/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://admission.aiu.ac.jp/en/ug/international_september/","ib_summary_unverified":"Applicants with the IB must have completed the curriculum and passed the six final exams, shown by certificates before enrolment. TOEFL iBT 61, IELTS 6.0 or similar, or three years of English-medium schooling."},"targets":[{"name":"International Liberal Arts","credential":"Bachelor's degree","url":"https://web.aiu.ac.jp/en/undergraduate/features/admission/"}]}
```

**Hokkaido University** — `jp-hokudai`; overviews.

```json
{"priority":3,"institution_key":"jp-hokudai","name":"Hokkaido University","country":"Japan","country_code":"jp","website":"https://www.global.hokudai.ac.jp/","admissions_url":"https://www.global.hokudai.ac.jp/admissions/undergraduate-admissions-overview/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.global.hokudai.ac.jp/admissions/undergraduate-admissions-overview/","ib_summary_unverified":"An IB Diploma held or expected by 30 September 2027 qualifies, with predicted grades accepted on the school's certificate. English proof is TOEFL iBT 79, IELTS 6.0 (ISP) or 6.5 (MJSP), unless you studied in English."},"targets":[{"name":"Integrated Science Program (ISP)","credential":"Bachelor of Science","url":"https://www.global.hokudai.ac.jp/admissions/integrated-science/"},{"name":"Modern Japanese Studies Program (MJSP)","credential":"Bachelor's degree","url":"https://www.global.hokudai.ac.jp/admissions/modern-japanese-studies/"}]}
```

**International Christian University** — `jp-icu`; overviews.

```json
{"priority":3,"institution_key":"jp-icu","name":"International Christian University","country":"Japan","country_code":"jp","website":"https://www.icu.ac.jp/en/","admissions_url":"https://www.icu.ac.jp/en/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.icu.ac.jp/en/admissions/undergraduate/engdoc/","ib_summary_unverified":"IB Full Diploma only (no course certificates or IBCP); predicted grades are accepted, with final results due as soon as released. IELTS 6.5 or TOEFL iBT 79 minimum. Assessed on documents, no interview for IB applicants."},"targets":[{"name":"Liberal Arts","credential":"BA","url":"https://www.icu.ac.jp/en/academics/undergraduate/major/"}]}
```

**Keio University** — `jp-keio`; overviews.

```json
{"priority":3,"institution_key":"jp-keio","name":"Keio University","country":"Japan","country_code":"jp","website":"https://www.keio.ac.jp/en/","admissions_url":"https://www.keio.ac.jp/en/admissions/faculty/examinations/pearl/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.keio.ac.jp/en/admissions/international-student/","ib_summary_unverified":"Both programmes take IB Diploma grades, final or predicted, with screening on documents and no interview. An English test (TOEFL iBT or IELTS) is required, waived for GIGA if your school taught in English."},"targets":[{"name":"PEARL (Economics)","credential":"BA","url":"https://www.econ.keio.ac.jp/en/undergraduate/pearl"},{"name":"GIGA Program","credential":"BA","url":"https://www.sfc.keio.ac.jp/en/academics/pmei/giga/"}]}
```

**Kyoto University** — `jp-kyoto-u`; overviews.

```json
{"priority":3,"institution_key":"jp-kyoto-u","name":"Kyoto University","country":"Japan","country_code":"jp","website":"https://www.kyoto-u.ac.jp/en","admissions_url":"https://www.iup.kyoto-u.ac.jp/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.iup.kyoto-u.ac.jp/apply/","ib_summary_unverified":"Applicants need an IB Diploma awarded by 30 September 2027; predicted grades are accepted and finals requested later. TOEFL iBT or IELTS Academic, or a school English evaluation; no minimum score is set."},"targets":[{"name":"International Undergraduate Program (iUP)","credential":"Bachelor's degree in your chosen major","url":"https://www.iup.kyoto-u.ac.jp/academics/majors-and-areas-of-study.html"}]}
```

**Kyushu University** — `jp-kyudai`; overviews.

```json
{"priority":3,"institution_key":"jp-kyudai","name":"Kyushu University","country":"Japan","country_code":"jp","website":"https://www.kyushu-u.ac.jp/en/","admissions_url":"https://www.kyushu-u.ac.jp/en/admission/faculty/foreign/foreign10/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.kyushu-u.ac.jp/en/admission/faculty/foreign/foreign10/","ib_summary_unverified":"Predicted IB grades are accepted with a school seal (conditional offer); finals due by 20 or 31 August 2027, by programme. Each programme scores set IB subjects, and IB taken in another language needs an English test."},"targets":[{"name":"Electrical Engineering and Computer Science","credential":"Bachelor's degree","url":"https://www.eng.kyushu-u.ac.jp/en/undergraduate/undergraduate-international-programs/electrical-engineering-and-computer-science/"},{"name":"Applied Chemistry","credential":"Bachelor's degree","url":"https://www.eng.kyushu-u.ac.jp/en/undergraduate/undergraduate-international-programs/applied-chemistry/"},{"name":"Mechanical and Aerospace Engineering","credential":"Bachelor's degree","url":"https://www.eng.kyushu-u.ac.jp/en/undergraduate/undergraduate-international-programs/mechanical-and-aerospace-engineering/"},{"name":"Civil Engineering","credential":"Bachelor's degree","url":"https://www.eng.kyushu-u.ac.jp/en/undergraduate/undergraduate-international-programs/civil-engineering/"},{"name":"Bioresource and Bioenvironment","credential":"Bachelor's degree","url":"https://www.agr.kyushu-u.ac.jp/english/course/iup/"},{"name":"Interdisciplinary Science and Innovation","credential":"Bachelor's degree","url":"https://kyoso.kyushu-u.ac.jp/en/pages/admission/from-abroad"}]}
```

**Nagoya University** — `jp-meidai`; overviews.

```json
{"priority":3,"institution_key":"jp-meidai","name":"Nagoya University","country":"Japan","country_code":"jp","website":"https://en.nagoya-u.ac.jp/","admissions_url":"https://admissions.g30.nagoya-u.ac.jp/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":10,"faculty_count":0,"programmes":[],"handoff_url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/","ib_summary_unverified":"Send school transcripts and predicted IB points (TOK/CAS not needed); the Diploma is due by 1 August 2027. No minimum score; STEM programmes recommend HL maths and science. English: IELTS 6.0 or TOEFL iBT 80 (4.0 new)."},"targets":[{"name":"Automotive Engineering","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/automotive/"},{"name":"Automotive Engineering","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/automotive_eeie/"},{"name":"Physics","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/physics/"},{"name":"Chemistry","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/chemistry/"},{"name":"Chemistry","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/chemistry_se/"},{"name":"Biological Science","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/biological_ss/"},{"name":"Biological Science","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/biological/"},{"name":"Social Science","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/social_sl/"},{"name":"Social Science","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/social/"},{"name":"Japan-in-Asia Cultural Studies","credential":"Bachelor's degree","url":"https://admissions.g30.nagoya-u.ac.jp/undergraduate/asia_cultural_studies/"}]}
```

**Ritsumeikan Asia Pacific University** — `jp-apu`; overviews.

```json
{"priority":3,"institution_key":"jp-apu","name":"Ritsumeikan Asia Pacific University","country":"Japan","country_code":"jp","website":"https://en.apu.ac.jp/home/","admissions_url":"https://en.apu.ac.jp/home/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://admissions.apu.ac.jp/course/","ib_summary_unverified":"IB Diploma accepted with predicted grades (eligibility is revoked if the Diploma is not awarded). English-basis applicants need IELTS 6.0, TOEFL iBT 75 or Duolingo 110, unless the Diploma was taught in English."},"targets":[{"name":"College of Asia Pacific Studies (APS)","credential":"Bachelor's degree","url":"https://admissions.apu.ac.jp/course/aps/"},{"name":"College of International Management (APM)","credential":"Bachelor's degree","url":"https://admissions.apu.ac.jp/course/apm/"},{"name":"College of Sustainability and Tourism (ST)","credential":"Bachelor's degree","url":"https://admissions.apu.ac.jp/course/st/"}]}
```

**Sophia University** — `jp-sophia`; overviews.

```json
{"priority":3,"institution_key":"jp-sophia","name":"Sophia University","country":"Japan","country_code":"jp","website":"https://www.sophia.ac.jp/eng/","admissions_url":"https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/","ib_summary_unverified":"An IB Diploma, final or predicted, replaces SAT/ACT; no minimum points or GPA is set. TOEFL iBT or IELTS Academic is required. Digital Green Technology asks Maths AA/AI HL plus a science HL."},"targets":[{"name":"Liberal Arts","credential":"BA","url":"https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/fla/"},{"name":"Sophia Program for Sustainable Futures (SPSF)","credential":"BA","url":"https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/spsf/"},{"name":"Digital Green Technology","credential":"Bachelor of Engineering","url":"https://adm.sophia.ac.jp/eng/admissions/ug_p/en_ug/dgtech/"}]}
```

**The University of Osaka** — `jp-handai`; overviews.

```json
{"priority":3,"institution_key":"jp-handai","name":"The University of Osaka","country":"Japan","country_code":"jp","website":"https://www.osaka-u.ac.jp/en","admissions_url":"https://www.osaka-u.ac.jp/en/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.osaka-u.ac.jp/en/admissions/faculty/english_program/index.html","ib_summary_unverified":"The IB Diploma is a listed qualification and predicted grades are accepted; offers can be conditional on IB results sent in July. An IB English A1 (SL or HL) or English B HL at grade 4 or above counts as English proof."},"targets":[{"name":"Human Sciences International Undergraduate Degree Program","credential":"Bachelor of Human Sciences","url":"https://iudp.hus.osaka-u.ac.jp/program/"}]}
```

**Tohoku University** — `jp-tohoku`; overviews.

```json
{"priority":3,"institution_key":"jp-tohoku","name":"Tohoku University","country":"Japan","country_code":"jp","website":"https://www.tohoku.ac.jp/en/","admissions_url":"https://admissions.tohoku.ac.jp/en/admissions/undergraduate/gateway_college/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://admissions.tohoku.ac.jp/en/admissions/undergraduate/gateway_college/","ib_summary_unverified":"IB Diploma with predicted grades accepted (conditional offer; finals due by 31 August 2027). 36 of 42 points with 2 for TOK and EE is the recommended score. IELTS 6.0, TOEFL iBT 80 or similar English proof."},"targets":[{"name":"Gateway College","credential":"Bachelor's degree","url":"https://admissions.tohoku.ac.jp/en/admissions/undergraduate/gateway_college/"}]}
```

**University of Tokyo** — `jp-utokyo`; overviews.

```json
{"priority":3,"institution_key":"jp-utokyo","name":"University of Tokyo","country":"Japan","country_code":"jp","website":"https://www.u-tokyo.ac.jp/en/","admissions_url":"https://design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/","ib_summary_unverified":"Route B takes the IB Diploma with 38 of 42 points across six subjects plus at least 2 for TOK and EE expected; these are expectations, not cut-offs. Predicted grades work only if finals fall after the deadline."},"targets":[{"name":"UTokyo College of Design","credential":"Combined bachelor's and master's (5 years)","url":"https://design.adm.u-tokyo.ac.jp/admissions/admissions-overview-2027/"}]}
```

**University of Tsukuba** — `jp-tsukuba`; overviews.

```json
{"priority":3,"institution_key":"jp-tsukuba","name":"University of Tsukuba","country":"Japan","country_code":"jp","website":"https://www.tsukuba.ac.jp/en/","admissions_url":"https://www.tsukuba.ac.jp/en/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.global.tsukuba.ac.jp/undergraduate/","ib_summary_unverified":"IB Diploma holders and expected holders (predicted grades) may apply; no minimum points. English proof: TOEFL iBT 61 or IELTS 5.0 (Engineering higher), waived after three years of English-medium school."},"targets":[{"name":"International Social Studies","credential":"Bachelor of Arts","url":"https://www.global.tsukuba.ac.jp/undergraduate/bachelor-arts-international-social-sciences/"},{"name":"Biological Sciences","credential":"Bachelor of Science","url":"https://www.global.tsukuba.ac.jp/undergraduate/biology/"},{"name":"Agro-Biological Resource Sciences","credential":"Bachelor of Bioresource Science","url":"https://www.global.tsukuba.ac.jp/undergraduate/bachelor-bio-resource-science/"},{"name":"Geoscience","credential":"Bachelor of Science","url":"https://www.global.tsukuba.ac.jp/undergraduate/bachelor-science-geoscience/"},{"name":"Interdisciplinary Engineering","credential":"Bachelor's degree","url":"https://www.ide.tsukuba.ac.jp/application-information"},{"name":"Global Issues","credential":"Bachelor of Arts and Science","url":"https://bpgi.tsukuba.ac.jp/exam/exam_info/"}]}
```

**Waseda University** — `jp-waseda`; overviews.

```json
{"priority":3,"institution_key":"jp-waseda","name":"Waseda University","country":"Japan","country_code":"jp","website":"https://www.waseda.jp/top/en/","admissions_url":"https://www.waseda.jp/inst/admission/en/undergraduate/english/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.waseda.jp/inst/admission/en/undergraduate/english/","ib_summary_unverified":"Predicted IB grades are accepted and no minimum score is set; 2026 successful applicants averaged 36.4 to 38.9 of 42 by school. An English test (TOEFL iBT or IELTS) is needed unless the guide exempts you."},"targets":[{"name":"Political Science and Economics","credential":"BA","url":"https://www.waseda.jp/fpse/pse/en/about/edp/"},{"name":"Transnational and Interdisciplinary Studies in Social Innovation (TAISI)","credential":"BA","url":"https://www.waseda.jp/fsss/sss/en/about/cjsp/"},{"name":"International Liberal Studies","credential":"BA","url":"https://www.waseda.jp/fire/sils/en/about/overview/"},{"name":"Global Studies in Japanese Cultures Program (JCulP)","credential":"BA","url":"https://www.waseda.jp/flas/cms/en/applicants-2/admission/jculp/"},{"name":"Fundamental Science and Engineering","credential":"BSc or BEng (by major)","url":"https://www.waseda.jp/fsci/en/about/departments/fundamental/"},{"name":"Creative Science and Engineering","credential":"BEng","url":"https://www.waseda.jp/fsci/en/about/departments/creative/"}]}
```

### Latvia

**BA School of Business and Finance** — `lv-ba`; overviews.

```json
{"priority":3,"institution_key":"lv-ba","name":"BA School of Business and Finance","country":"Latvia","country_code":"lv","website":"https://ftbs.lu.lv/en/","admissions_url":"https://ftbs.lu.lv/en/admission/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://ftbs.lu.lv/en/admission/study-programs/bachelors-programmes/","ib_summary_unverified":"No IB-specific page: the Diploma counts as a general secondary diploma. Each degree sets minimum grades on Latvia's 10-point scale; English B2 shows on your certificate or via IELTS 6.0."},"targets":[{"name":"Business Process Management","credential":"Professional Bachelor's degree","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/business-process-management-en/"},{"name":"Finance Management Information Systems","credential":"Professional Bachelor's degree","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/finance-management-information-systems-en/"},{"name":"International Finance","credential":"Professional Bachelor's degree","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/international-finance-en/"}]}
```

**Latvia University of Life Sciences and Technologies** — `lv-lbtu`; overviews.

```json
{"priority":3,"institution_key":"lv-lbtu","name":"Latvia University of Life Sciences and Technologies","country":"Latvia","country_code":"lv","website":"https://www.lbtu.lv/en","admissions_url":"https://www.lbtu.lv/en/how-to-apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.lbtu.lv/en/bachelor-study-programmes","ib_summary_unverified":"No IB-specific page: a secondary diploma that makes you eligible for university at home, an average of at least 65%, English B2 (or a test) and an online entrance test in the programme's subject."},"targets":[{"name":"Biosystems Machinery and Technologies","credential":"Bachelor Degree of Mechanical Engineering","url":"https://www.llu.lv/en/biosystems_machinery_and_technologies"},{"name":"Information Technologies for Sustainable Development","credential":"Professional Bachelor's degree","url":"https://www.llu.lv/en/information-technologies-for-sustainable-development"},{"name":"Sociology of Organizations and Public Administration","credential":"Bachelor Degree in Sociology","url":"https://www.llu.lv/en/sociology_of_organizations_and_public_administration"},{"name":"Veterinary Medicine","credential":"Long-cycle master's (6 years)","url":"https://www.lbtu.lv/en/veterinary_medicine"}]}
```

**Riga Stradins University** — `lv-rsu`; overviews.

```json
{"priority":3,"institution_key":"lv-rsu","name":"Riga Stradins University","country":"Latvia","country_code":"lv","website":"https://www.rsu.lv/en","admissions_url":"https://www.rsu.lv/en/study-here/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.rsu.lv/en/undergraduate-programmes","ib_summary_unverified":"No IB-specific page: the Diploma counts as secondary education, IB Higher Level grades are given priority, and the minimum grade is 5 of 7 in required subjects. English is shown by a test or by schooling in English."},"targets":[{"name":"Medicine","credential":"Doctor of Medicine (MD)","url":"https://www.rsu.lv/en/study-programme/medicine"},{"name":"Dentistry","credential":"Doctor of Dental Surgery (DDS)","url":"https://www.rsu.lv/en/study-programme/dentistry"},{"name":"International Business and Start-up Entrepreneurship","credential":"Bachelor of Social Sciences","url":"https://www.rsu.lv/en/study-programme/international-business-and-start-up-entrepreneurship"}]}
```

**Riga Technical University** — `lv-rtu`; overviews.

```json
{"priority":3,"institution_key":"lv-rtu","name":"Riga Technical University","country":"Latvia","country_code":"lv","website":"https://www.rtu.lv/en","admissions_url":"https://apply.rtu.lv/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":14,"faculty_count":0,"programmes":[],"handoff_url":"https://www.rtu.lv/en/studies/bachelor-studies","ib_summary_unverified":"No IB-specific page: send your diploma and transcripts (maths and physics grades are read). English B2 is proved by a test unless all schooling was in English; Riga Business School exempts IB holders."},"targets":[{"name":"Civil Engineering","credential":"BSc","url":"https://apply.rtu.lv/courses/course/12-bsc-civil-engineering"},{"name":"Engineering Technology, Mechanics and Mechanical Engineering","credential":"BSc","url":"https://apply.rtu.lv/courses/course/9-bsc-engineering-technology-mechanics-and-mechanical-engineering"},{"name":"Medical Engineering and Physics","credential":"Professional Bachelor's degree","url":"https://apply.rtu.lv/courses/course/13-bsc-medical-engineering-and-physics"},{"name":"Environmental Engineering","credential":"BSc","url":"https://apply.rtu.lv/courses/course/239-bsc-environmental-engineering"},{"name":"Materials Engineering","credential":"BSc","url":"https://apply.rtu.lv/courses/course/234-bsc-materials-engineering"},{"name":"Computer Systems","credential":"BSc","url":"https://apply.rtu.lv/courses/course/4-bsc-computer-systems"},{"name":"Telecommunication Technologies and Data Transmission Engineering","credential":"BSc","url":"https://www.rtu.lv/en/studies/all-study-programmes/open/telecommunication-technologies-and-data-transmission-engineering?id=205"},{"name":"Smart Electronic Systems","credential":"Professional Bachelor's degree","url":"https://apply.rtu.lv/courses/course/251-bsc-smart-electronic-systems"},{"name":"Finance Management Information Systems","credential":"Professional Bachelor's degree","url":"https://apply.rtu.lv/courses/course/307-bsc-finance-management-information-systems"},{"name":"Entrepreneurship and Management","credential":"BSc","url":"https://apply.rtu.lv/courses/course/6-bsc-entrepreneurship-and-management"},{"name":"Business Administration","credential":"BBA","url":"https://apply.rtu.lv/courses/course/317-bba-bachelor-business-administration-eu-eu-candidate-countries-eea-applicants"},{"name":"Computer Science","credential":"Bachelor of Natural Sciences","campus":"Liepāja","url":"https://apply.rtu.lv/courses/course/308-bs-computer-science"},{"name":"Marine Engineering (Maritime Transport)","credential":"Professional Bachelor's degree","url":"https://apply.rtu.lv/courses/course/310-bs-maritime-transport---marine-engineering"},{"name":"Navigation (Maritime Transport)","credential":"Professional Bachelor's degree","url":"https://apply.rtu.lv/courses/course/311-bs-maritime-transport---navigation"}]}
```

**Stockholm School of Economics in Riga** — `lv-sse-riga`; overviews.

```json
{"priority":3,"institution_key":"lv-sse-riga","name":"Stockholm School of Economics in Riga","country":"Latvia","country_code":"lv","website":"https://www.sseriga.edu/","admissions_url":"https://www.sseriga.edu/education/bachelor/admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.sseriga.edu/education/bachelor/admission","ib_summary_unverified":"Minimum 6 of 10 (or equivalent) in Maths and English; IB final exams can replace state exams, and predicted grades are accepted at application. Grades add no ranking points: test and interview decide."},"targets":[{"name":"Economics and Business","credential":"BSc (Bachelor of Social Sciences in Economics)","url":"https://www.sseriga.edu/education/bachelor"}]}
```

**Transport and Telecommunication Institute** — `lv-tsi`; overviews.

```json
{"priority":3,"institution_key":"lv-tsi","name":"Transport and Telecommunication Institute","country":"Latvia","country_code":"lv","website":"https://tsi.lv/","admissions_url":"https://tsi.lv/future-students/admission/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://tsi.lv/study_programmes/","ib_summary_unverified":"No IB-specific page: EU applicants send the secondary certificate and transcript (checked by the Academic Information Centre) and show English B2 by a test or EU school certificate; EU citizens sit no entrance test."},"targets":[{"name":"Computer Science","credential":"BSc Natural Sciences in Computer Science","url":"https://tsi.lv/study_programmes/computer-sciences/"},{"name":"Computer Science: AI Double Degree","credential":"TSI BSc + UWE Bristol BSc (Hons) double degree","url":"https://tsi.lv/study_programmes/computer-sciences-double-degree-artificial-intelligence/"},{"name":"Computer Engineering and Electronics","credential":"BSc Engineering","url":"https://tsi.lv/study_programmes/computer-engineering/"},{"name":"Robotics","credential":"BSc Engineering in Robotic Systems","url":"https://tsi.lv/study_programmes/robotics/"},{"name":"Transport and Logistics","credential":"Professional BSc Transport and Logistics","url":"https://tsi.lv/study_programmes/transport-and-business-logistics/"},{"name":"Aviation Engineering","credential":"BSc Engineering in Mechanical Engineering","url":"https://tsi.lv/study_programmes/aviation-transport/"},{"name":"Business and Management","credential":"BSc Social Sciences in Management","url":"https://tsi.lv/study_programmes/business-and-management-bachelor/"}]}
```

**Turiba University** — `lv-turiba`; overviews.

```json
{"priority":3,"institution_key":"lv-turiba","name":"Turiba University","country":"Latvia","country_code":"lv","website":"https://www.turiba.lv/en","admissions_url":"https://www.turiba.lv/en/admission/admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies","ib_summary_unverified":"No IB-specific page: send your secondary certificate (60% minimum on the last qualification) and pass an English test, a Maths test for Computer Systems or a Social Science test, and an online interview."},"targets":[{"name":"Computer Systems","credential":"Professional Bachelor's degree","url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies/computer-systems"},{"name":"Business Administration","credential":"Professional Bachelor's degree","url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies/business-administration"},{"name":"Business Logistics Management","credential":"Professional Bachelor's degree","url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies/business-logistics-management"},{"name":"International Communication Management","credential":"Professional Bachelor's degree","url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies/international-communication-management"},{"name":"Tourism and Hospitality Management","credential":"Professional Bachelor's degree","url":"https://www.turiba.lv/en/admission/study-programs/bachelor-studies/tourism-and-hospitality-management"}]}
```

**University of Latvia** — `lv-lu`; overviews.

```json
{"priority":3,"institution_key":"lv-lu","name":"University of Latvia","country":"Latvia","country_code":"lv","website":"https://www.lu.lv/en/","admissions_url":"https://www.lu.lv/en/admission/for-international-students/degree/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":12,"faculty_count":0,"programmes":[],"handoff_url":"https://www.lu.lv/en/admissions/degree-studies/","ib_summary_unverified":"No IB-specific page: the Diploma counts as a general secondary diploma. Each degree sets minimum grades on Latvia's 10-point scale; English B2 shows on your certificate or via IELTS 6.0."},"targets":[{"name":"Computer Science","credential":"BSc in Computer Science","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/computer-science-en/"},{"name":"Biotechnology and Bioengineering","credential":"Bachelor of Natural Sciences","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/biotechnology-and-bioengineering/"},{"name":"Business Administration","credential":"Bachelor of Social Sciences","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/business-administration-en/"},{"name":"Cultural and Social Anthropology","credential":"Bachelor of Social Sciences in Anthropology","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/cultural-and-social-anthropology-en/"},{"name":"English, European Languages and Business Studies","credential":"Bachelor of Humanities","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/english-european-languages-and-business-studies/"},{"name":"East-West Intercultural Studies","credential":"Bachelor's degree","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/asian-and-intercultural-studies/"},{"name":"Industrial Engineering and Management","credential":"Professional Bachelor's degree","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/industrial-engineering-and-management-en/"},{"name":"International Economics and Commercial Diplomacy","credential":"Bachelor of Social Sciences in Economics","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/international-economics-and-commercial-diplomacy-en/"},{"name":"Philology (French, German or Russian)","credential":"Bachelor of Humanities in Philology","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/philology-en/"},{"name":"Optometry","credential":"Bachelor of Health Sciences in Optometry","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/optometry-en/"},{"name":"Medicine","credential":"Doctor of Medicine (MD)","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/medicine-en/"},{"name":"Dentistry","credential":"Doctor of Dental Surgery (DDS)","url":"https://www.lu.lv/en/studies/study-programmes-1/bachelors-study-programmes/dentistry-en/"}]}
```

**Ventspils University of Applied Sciences** — `lv-ventspils-uas`; overviews.

```json
{"priority":3,"institution_key":"lv-ventspils-uas","name":"Ventspils University of Applied Sciences","country":"Latvia","country_code":"lv","website":"https://en.venta.lv/","admissions_url":"https://en.venta.lv/studies/applications-for-international-degree-seeking-students","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://en.venta.lv/studies/applications-for-international-degree-seeking-students","ib_summary_unverified":"No IB-specific page: a secondary diploma with an average of at least 60%, Maths and English above the pass mark, and English B2 shown by your EU school certificate or a test such as IELTS 5.5."},"targets":[{"name":"Computer Science","credential":"BSc","url":"https://apply.venta.lv/courses/course/9-bsc-computer-science"},{"name":"Business Administration","credential":"BSc","url":"https://apply.venta.lv/courses/course/6-bsc-business-administration"},{"name":"Start-Up Management","credential":"Professional Bachelor's degree","url":"https://apply.venta.lv/courses/course/3-bsc-start-up-management"}]}
```

### Luxembourg

**LUNEX University** — `lu-lunex`; overviews.

```json
{"priority":3,"institution_key":"lu-lunex","name":"LUNEX University","country":"Luxembourg","country_code":"lu","website":"https://lunex.lu/en","admissions_url":"https://lunex.lu/en/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://lunex.lu/en/study-overview/bachelor","ib_summary_unverified":"School diploma plus English at B2; your IB may need recognition by Luxembourg's authorities (LUNEX helps). An online English and/or science test decides direct entry or a pre-bachelor foundation course first."},"targets":[{"name":"Bachelor in Physiotherapy","credential":"Bachelor in Physiotherapy","url":"https://lunex.lu/en/study/bachelor-in-physiotherapy"},{"name":"Bachelor in Osteopathy","credential":"Bachelor of Health","url":"https://lunex.lu/en/study/bachelor-in-osteopathy"},{"name":"Bachelor in Sport and Exercise Science","credential":"Bachelor in Sport and Exercise Science","url":"https://lunex.lu/en/study/bachelor-in-sport-and-exercise-science"},{"name":"Bachelor in International Sport Management","credential":"Bachelor in International Sport Management","url":"https://lunex.lu/en/study/bachelor-in-international-sport-management"},{"name":"Bachelor in Nutrition, Fitness and Health","credential":"Bachelor in Nutrition, Fitness and Health","url":"https://lunex.lu/en/study/bachelor-in-nutrition-fitness-health"}]}
```

**University of Luxembourg** — `lu-uni-lu`; overviews.

```json
{"priority":3,"institution_key":"lu-uni-lu","name":"University of Luxembourg","country":"Luxembourg","country_code":"lu","website":"https://www.uni.lu/en/","admissions_url":"https://www.uni.lu/en/admissions/bachelor-master/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uni.lu/en/education/study-programme-overview/?fq_study-programs-taxonomies-type-of-studies%5B%5D=bachelor%7CBachelor%7CTypes+Of+Study&fq_study-programs-taxonomies-teaching-languages%5B%5D=en%7CEN+(monolingual)%7CTeaching+Languages","ib_summary_unverified":"Your IB needs an equivalence from Luxembourg's Ministry of Education; you request it and it takes weeks. You may apply before results. An English-taught IB proves English. No points minimum is published."},"targets":[{"name":"Bachelor in Computer Science","credential":"Bachelor in Computer Science","url":"https://www.uni.lu/fstm-en/study-programs/bachelor-in-computer-science/"},{"name":"Bachelor en Enseignement musical (Bachelor in Music Education)","credential":"Bachelor in Music Education","url":"https://www.uni.lu/fhse-en/study-programs/bachelor-en-enseignement-musical/"}]}
```

### Malta

**American University of Malta** — `mt-aum`; overviews.

```json
{"priority":3,"institution_key":"mt-aum","name":"American University of Malta","country":"Malta","country_code":"mt","website":"https://www.aum.edu.mt/","admissions_url":"https://www.aum.edu.mt/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":10,"faculty_count":0,"programmes":[],"handoff_url":"https://aum.edu.mt/Undergraduate","ib_summary_unverified":"IB Diploma with a minimum of 24 points, finished within five years of the start; an admission interview and proof of English (IELTS, TOEFL or PTE) apply. Some degrees add their own requirements."},"targets":[{"name":"Accounting","credential":"BSc","url":"https://aum.edu.mt/Program/Accounting"},{"name":"Business Administration","credential":"BSc","url":"https://aum.edu.mt/Program/BusinessAdministration"},{"name":"Business and Finance","credential":"BSc","url":"https://aum.edu.mt/Program/BusinessFinance"},{"name":"Civil Engineering","credential":"BSc","url":"https://aum.edu.mt/Program/CivilEngineering"},{"name":"Mechanical Engineering","credential":"BSc","url":"https://aum.edu.mt/Program/MechanicalEngineering"},{"name":"Electronics and Communication Engineering","credential":"BSc","url":"https://aum.edu.mt/Program/ElectronicsCommunicationsEngineering"},{"name":"Industrial Engineering","credential":"BSc","url":"https://aum.edu.mt/Program/IndustrialEngineering"},{"name":"Software Engineering","credential":"BSc","url":"https://aum.edu.mt/Program/SoftwareEngineering"},{"name":"Game Development","credential":"BSc","url":"https://aum.edu.mt/Program/GameDevelopment"},{"name":"Graphic Design and Animation","credential":"BA","url":"https://aum.edu.mt/Program/GraphicDesignAnimation"}]}
```

**Global College Malta** — `mt-gcm`; overviews.

```json
{"priority":3,"institution_key":"mt-gcm","name":"Global College Malta","country":"Malta","country_code":"mt","website":"https://gcm.edu.mt/","admissions_url":"https://gcm.edu.mt/admissions-process/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://gcm.edu.mt/admissions-process/","ib_summary_unverified":"Entry is worded as Maltese Matriculation \"or equivalent\": two Advanced, three Intermediate, Systems of Knowledge and English; or three Advanced levels. The IB is not named; ask GCM. IELTS 5.5 or similar English proof."},"targets":[{"name":"BA in Management","credential":"BA","url":"https://gcm.edu.mt/course/ba-in-management/"},{"name":"BA in Marketing","credential":"BA","url":"https://gcm.edu.mt/course/ba-in-marketing/"},{"name":"BA in Management with Human Resources","credential":"BA","url":"https://gcm.edu.mt/course/ba-in-management-with-human-resources-management/"},{"name":"BA in Management with Psychology","credential":"BA","url":"https://gcm.edu.mt/course/courses-bachelors-courses-ba-in-management-with-psychology/"},{"name":"BA in Tourism and Events Management","credential":"BA","url":"https://gcm.edu.mt/course/ba-in-tourism-and-events-management/"},{"name":"BA in Accounting and Finance","credential":"BA","url":"https://gcm.edu.mt/course/courses-bachelors-courses-bachelor-of-arts-in-accounting-and-finance/"},{"name":"BA Information Technology for Business","credential":"BA","url":"https://gcm.edu.mt/course/ba-information-technology-for-business/"}]}
```

**Institute of Tourism Studies** — `mt-its`; overviews.

```json
{"priority":3,"institution_key":"mt-its","name":"Institute of Tourism Studies","country":"Malta","country_code":"mt","website":"https://its.edu.mt/","admissions_url":"https://international.its.edu.mt/entry-requirements-and-application-process.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.its.edu.mt/programmes?mqf=6","ib_summary_unverified":"Entry is worded in MATSEC terms (three Advanced/Intermediate passes incl. one Advanced, 44 grade points, English and Maths). The IB is not named; ITS advises an MQRIC equivalency report and B2 English."},"targets":[{"name":"International Hospitality Management (Hons) with Specialisations","credential":"Bachelor (Honours)","url":"https://www.its.edu.mt/course?course_code=UG-IHM"},{"name":"Diving Safety Management (Full-Time)","credential":"BSc in Diving Safety Management","url":"https://www.its.edu.mt/course?course_code=UG-DSM"}]}
```

**Malta College of Arts, Science and Technology** — `mt-mcast`; overviews.

```json
{"priority":3,"institution_key":"mt-mcast","name":"Malta College of Arts, Science and Technology","country":"Malta","country_code":"mt","website":"https://mcast.edu.mt/","admissions_url":"https://mcast.edu.mt/int-students/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://mcast.edu.mt/full-time-programmes/","ib_summary_unverified":"Entry is set course by course (e.g. an MCAST Level 4 Advanced Diploma, or A-level and I-level passes). An IB Diploma is a non-Maltese qualification and needs an MQRIC statement; ask MCAST if your results meet a course."},"targets":[{"name":"Marine Engineering","credential":"BSc (Hons)","url":"https://mcast.edu.mt/full-catalogue/institute/iet/department/centre-for-maritime-studies-department/course/ms6-w01-23/"},{"name":"Cybersecurity","credential":"BSc (Hons)","url":"https://mcast.edu.mt/full-catalogue/institute/ict/course/it6-a07-23/"},{"name":"Game Art","credential":"BA (Hons)","campus":"Mosta","url":"https://mcast.edu.mt/full-catalogue/institute/ica/course/ca6-o03-23/"}]}
```

**St Martin's Institute of Higher Education** — `mt-st-martin-s`; overviews.

```json
{"priority":3,"institution_key":"mt-st-martin-s","name":"St Martin's Institute of Higher Education","country":"Malta","country_code":"mt","website":"https://www.stmartins.edu/","admissions_url":"https://www.stmartins.edu/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.stmartins.edu/appform/","ib_summary_unverified":"SMI states Maltese entry (Matriculation or A/I-level passes). International equivalents such as the IB are judged case by case by SMI and the University of London. Computing also needs Maths at SEC O level or equivalent."},"targets":[{"name":"Accounting and Finance","credential":"BSc (Hons), University of London","url":"https://www.london.ac.uk/study/courses/undergraduate/bsc-accounting-finance"},{"name":"Business Administration","credential":"BSc (Hons), University of London","url":"https://www.london.ac.uk/study/courses/undergraduate/bsc-business-administration-study-locally"},{"name":"Computer Science","credential":"BSc (Hons), University of London","url":"https://www.london.ac.uk/study/courses/undergraduate/bsc-computer-science"}]}
```

**University of Malta** — `mt-um`; overviews.

```json
{"priority":3,"institution_key":"mt-um","name":"University of Malta","country":"Malta","country_code":"mt","website":"https://www.um.edu.mt/","admissions_url":"https://www.um.edu.mt/study/admissionsadvice/","ib_url":"https://www.um.edu.mt/study/admissionsadvice/international/comparingib/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":14,"programmes":[],"handoff_url":"https://www.um.edu.mt/courses","ib_summary_unverified":"IB Diploma with 28+ points and 3+ in a language, a science and a humanistic subject, plus Maths, English and Maltese at SEC level (comparable IB subjects may count). Some courses add subjects."},"targets":[{"name":"Doctor of Medicine and Surgery","credential":"MD","url":"https://www.um.edu.mt/courses/overview/umdft-2026-7-o/"},{"name":"Mechanical Engineering","credential":"BEng (Hons)","url":"https://www.um.edu.mt/courses/overview/ubenghmecft-2026-7-o/"},{"name":"Information Technology (Artificial Intelligence)","credential":"BSc (Hons)","url":"https://www.um.edu.mt/courses/overview/ubscitharift-2026-7-o/"}]}
```

### Netherlands

**Rotterdam University of Applied Sciences** — `nl-rotterdam-uas`; overviews.

```json
{"priority":3,"institution_key":"nl-rotterdam-uas","name":"Rotterdam University of Applied Sciences","country":"Netherlands","country_code":"nl","website":"https://www.rotterdamuas.com/","admissions_url":"https://www.rotterdamuas.com/study-information/enrolment/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.rotterdamuas.com/programmes/bachelor/","ib_summary_unverified":"The IB Diploma meets the entry level (Dutch HAVO/VWO); no subject requirements. English: exempt if your schooling was entirely in English, otherwise IELTS 6.0, TOEFL iBT 80 or Cambridge 169."},"targets":[{"name":"International Business","credential":"BBA","url":"https://www.rotterdamuas.com/programmes/bachelor/international-business/"},{"name":"Fine Art","credential":"BA","url":"https://www.rotterdamuas.com/programmes/bachelor/fine-art/"},{"name":"Graphic Design","credential":"BA","url":"https://www.rotterdamuas.com/programmes/bachelor/graphic-design/"}]}
```

### New Zealand

**Lincoln University** — `nz-lincoln`; overviews.

```json
{"priority":3,"institution_key":"nz-lincoln","name":"Lincoln University","country":"New Zealand","country_code":"nz","website":"https://www.lincoln.ac.nz/","admissions_url":"https://www.lincoln.ac.nz/study/","ib_url":"https://www.lincoln.ac.nz/study/apply-and-enrol/apply/international-undergraduate-entry-criteria/","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.lincoln.ac.nz/study/study-programmes/programme-search/?term6=90","ib_summary_unverified":"The Diploma must be completed with at least 24 points; English language proof applies if English is not your first language. Biology, Chemistry and Maths are recommended preparation, not required."},"targets":[{"name":"Bachelor of Viticulture and Oenology","credential":"Bachelor of Viticulture and Oenology","url":"https://www.lincoln.ac.nz/study/study-programmes/programme-search/bachelor-of-viticulture-and-oenology/"},{"name":"Bachelor of Agricultural Science","credential":"Bachelor of Agricultural Science","url":"https://www.lincoln.ac.nz/study/study-programmes/programme-search/bachelor-of-agricultural-science/"},{"name":"Bachelor of Landscape Architecture","credential":"Bachelor of Landscape Architecture","url":"https://www.lincoln.ac.nz/study/study-programmes/programme-search/bachelor-of-landscape-architecture/"}]}
```

**Otago Polytechnic** — `nz-otago-polytechnic`; overviews.

```json
{"priority":3,"institution_key":"nz-otago-polytechnic","name":"Otago Polytechnic","country":"New Zealand","country_code":"nz","website":"https://www.op.ac.nz/","admissions_url":"https://www.op.ac.nz/international","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":17,"faculty_count":0,"programmes":[],"handoff_url":"https://www.op.ac.nz/international/courses-and-programmes","ib_summary_unverified":"Degree level lists completion of the IB Diploma with 24 points or more; IELTS Academic 6.0 with no band under 5.5 applies if English is not your first language. Some degrees add a portfolio or statement."},"targets":[{"name":"Bachelor of Veterinary Nursing","credential":"Bachelor of Veterinary Nursing","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-veterinary-nursing"},{"name":"Bachelor of Architectural Studies (Architectural Technology) or (Interior Architecture)","credential":"Bachelor of Architectural Studies","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-architectural-studies-architectural-technology-or-interior-architecture"},{"name":"Bachelor of Construction (Quantity Surveying)","credential":"Bachelor of Construction","campus":"Dunedin or Auckland","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-construction"},{"name":"Bachelor of Applied Management","credential":"Bachelor of Applied Management","campus":"Dunedin or Auckland","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-applied-management"},{"name":"Bachelor of Applied Management (Accounting)","credential":"Bachelor of Applied Management","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-applied-management-accounting-2"},{"name":"Bachelor of Visual Arts","credential":"Bachelor of Visual Arts","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-visual-arts"},{"name":"Bachelor of Design (Fashion)","credential":"Bachelor of Design","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-design-fashion"},{"name":"Bachelor of Design (Communication)","credential":"Bachelor of Design","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-design-communication"},{"name":"Bachelor of Design (Product)","credential":"Bachelor of Design","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-design-product"},{"name":"Bachelor of Information Technology","credential":"Bachelor of Information Technology","campus":"Dunedin or Auckland","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-information-technology"},{"name":"Bachelor of Engineering Technology","credential":"Bachelor of Engineering Technology","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-engineering-technology"},{"name":"Bachelor of Culinary Arts","credential":"Bachelor of Culinary Arts","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-culinary-arts"},{"name":"Bachelor of Social Services (Specialty)","credential":"Bachelor of Social Services","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-social-services"},{"name":"Bachelor of Midwifery","credential":"Bachelor of Midwifery","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-midwifery"},{"name":"Bachelor of Nursing","credential":"Bachelor of Nursing","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-nursing"},{"name":"Bachelor of Occupational Therapy","credential":"Bachelor of Occupational Therapy","campus":"Dunedin or Hamilton","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-occupational-therapy"},{"name":"Bachelor of Applied Science","credential":"Bachelor of Applied Science","url":"https://www.op.ac.nz/programmes/nzqa/bachelor-of-applied-science"}]}
```

**Unitec** — `nz-unitec`; overviews.

```json
{"priority":3,"institution_key":"nz-unitec","name":"Unitec","country":"New Zealand","country_code":"nz","website":"https://www.unitec.ac.nz/","admissions_url":"https://www.unitec.ac.nz/international","ib_url":"https://www.unitec.ac.nz/international/study-with-us/country-specific-criteria/","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":22,"faculty_count":0,"programmes":[],"handoff_url":"https://www.unitec.ac.nz/international/all-international-programmes/","ib_summary_unverified":"IB Diploma of at least 24 points, with at least 4 in an English-rich subject and 4 in maths (or numeracy by other means); IELTS Academic 6.0 applies if English is not your first language."},"targets":[{"name":"Bachelor of Accounting","credential":"Bachelor of Accounting","url":"https://www.unitec.ac.nz/career-and-study-options/business/accounting/bachelor-of-accounting/"},{"name":"Bachelor of Applied Science (Animal Behaviour and Welfare, and Biodiversity Management)","credential":"Bachelor of Applied Science","url":"https://www.unitec.ac.nz/career-and-study-options/environmental-and-animal-sciences/animal-management-and-welfare/bachelor-of-applied-science-animal-behaviour-and-welfare-and-biodiversity-management/"},{"name":"Bachelor of Applied Science (Animal Behaviour and Welfare)","credential":"Bachelor of Applied Science","url":"https://www.unitec.ac.nz/career-and-study-options/environmental-and-animal-sciences/animal-management-and-welfare/bachelor-of-applied-science-animal-behaviour-and-welfare/"},{"name":"Bachelor of Applied Science (Biodiversity Management)","credential":"Bachelor of Applied Science","url":"https://www.unitec.ac.nz/career-and-study-options/applied-science/bachelor-of-applied-science-biodiversity-management/"},{"name":"Bachelor of Architectural Studies","credential":"Bachelor of Architectural Studies","url":"https://www.unitec.ac.nz/career-and-study-options/architecture-interior-and-landscape/architecture-and-architectural-technology/bachelor-of-architectural-studies/"},{"name":"Bachelor of Business (Management)","credential":"Bachelor of Business","url":"https://www.unitec.ac.nz/career-and-study-options/business/management/bachelor-of-business-management/"},{"name":"Bachelor of Business (Marketing)","credential":"Bachelor of Business","url":"https://www.unitec.ac.nz/career-and-study-options/business/digital-marketing/bachelor-of-business-marketing/"},{"name":"Bachelor of Computing Systems","credential":"Bachelor of Computing Systems","url":"https://www.unitec.ac.nz/career-and-study-options/computing-and-information-technology/bachelor-of-computing-systems/"},{"name":"Bachelor of Construction (Construction Economics)","credential":"Bachelor of Construction","url":"https://www.unitec.ac.nz/career-and-study-options/construction/construction-management/bachelor-of-construction-construction-economics/"},{"name":"Bachelor of Construction (Construction Management)","credential":"Bachelor of Construction","url":"https://www.unitec.ac.nz/career-and-study-options/construction/construction-management/bachelor-of-construction-construction-management/"},{"name":"Bachelor of Construction (Property Development)","credential":"Bachelor of Construction","url":"https://www.unitec.ac.nz/career-and-study-options/construction/construction-management/bachelor-of-construction-property-development/"},{"name":"Bachelor of Design and Contemporary Art","credential":"Bachelor of Design and Contemporary Art","url":"https://www.unitec.ac.nz/career-and-study-options/creative-industries/art-and-design/bachelor-of-design-and-contemporary-art/"},{"name":"Bachelor of Engineering Technology (Civil)","credential":"Bachelor of Engineering Technology","url":"https://www.unitec.ac.nz/career-and-study-options/engineering/civil-engineering/bachelor-of-engineering-technology-civil/"},{"name":"Bachelor of Engineering Technology (Electrical)","credential":"Bachelor of Engineering Technology","url":"https://www.unitec.ac.nz/career-and-study-options/engineering/electrical-and-electronics-engineering/bachelor-of-engineering-technology-electrical/"},{"name":"Bachelor of Landscape Architecture","credential":"Bachelor of Landscape Architecture","url":"https://www.unitec.ac.nz/career-and-study-options/architecture-interior-and-landscape/landscape-architecture/bachelor-of-landscape-architecture/"},{"name":"Bachelor of Nursing","credential":"Bachelor of Nursing","url":"https://www.unitec.ac.nz/career-and-study-options/healthcare/nursing/bachelor-of-nursing/"},{"name":"Bachelor of Performing and Screen Arts (Acting for Screen and Theatre)","credential":"Bachelor of Performing and Screen Arts","url":"https://www.unitec.ac.nz/career-and-study-options/creative-industries/acting/bachelor-of-performing-and-screen-arts-acting-for-screen-and-theatre/"},{"name":"Bachelor of Performing and Screen Arts (Contemporary Dance)","credential":"Bachelor of Performing and Screen Arts","url":"https://www.unitec.ac.nz/career-and-study-options/creative-industries/contemporary-dance/bachelor-of-performing-and-screen-arts-contemporary-dance/"},{"name":"Bachelor of Performing and Screen Arts (Screen Arts)","credential":"Bachelor of Performing and Screen Arts","url":"https://www.unitec.ac.nz/career-and-study-options/creative-industries/screen-arts/bachelor-of-performing-and-screen-arts-screen-arts/"},{"name":"Bachelor of Social Practice","credential":"Bachelor of Social Practice","url":"https://www.unitec.ac.nz/career-and-study-options/social-work-and-community-development/bachelor-of-social-practice/"},{"name":"Bachelor of Teaching (Early Childhood Education)","credential":"Bachelor of Teaching","url":"https://www.unitec.ac.nz/career-and-study-options/early-childhood-education/bachelor-of-teaching-early-childhood-education/"},{"name":"Bachelor of Veterinary Nursing","credential":"Bachelor of Veterinary Nursing","url":"https://www.unitec.ac.nz/career-and-study-options/environmental-and-animal-sciences/veterinary-nursing/bachelor-of-veterinary-nursing/"}]}
```

**University of Auckland** — `nz-auckland`; overviews.

```json
{"priority":3,"institution_key":"nz-auckland","name":"University of Auckland","country":"New Zealand","country_code":"nz","website":"https://www.auckland.ac.nz/en.html","admissions_url":"https://www.auckland.ac.nz/en/study.html","ib_url":"https://www.auckland.ac.nz/en/study/applications-and-admissions/entry-requirements/undergraduate-entry-requirements/new-zealand-secondary-school-applicants/international-baccalaureate.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://www.auckland.ac.nz/en/study/study-options/find-a-study-option.html","ib_summary_unverified":"Full IB Diploma with 24+ points, English A (SL or HL) or English B HL 5, and any maths. Your IB total is your rank score: 26 for Arts and most Science, 27 Commerce, 32 Engineering."},"targets":[{"name":"Bachelor of Engineering (Honours)","credential":"BE(Hons)","url":"https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/bachelor-of-engineering-honours-behons.html"},{"name":"Bachelor of Science, Psychology major","credential":"BSc","url":"https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/psychology/undergraduate/bsc-psychology-from-2019.html"},{"name":"Bachelor of Education (Teaching)","credential":"BEd (Teaching)","url":"https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/bachelor-of-education-teaching-bedtchg.html"}]}
```

**University of Canterbury** — `nz-canterbury`; overviews.

```json
{"priority":3,"institution_key":"nz-canterbury","name":"University of Canterbury","country":"New Zealand","country_code":"nz","website":"https://www.canterbury.ac.nz/","admissions_url":"https://www.canterbury.ac.nz/study","ib_url":"https://www.canterbury.ac.nz/study/getting-started/admission-and-enrolment/admission-pathways/ib-international-baccalaureate-diploma","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":1,"programmes":[],"handoff_url":"https://www.canterbury.ac.nz/study/academic-study/qualifications","ib_summary_unverified":"The full IB Diploma must be awarded, with English Language A (SL or HL) or Language B HL, and any maths. The international Engineering (Honours) pathway needs HL 6 in Chemistry, Physics and Maths."},"targets":[{"name":"Bachelor of Engineering with Honours (international pathway)","credential":"BE(Hons)","url":"https://www.canterbury.ac.nz/study/academic-study/engineering/international-pathway-engineering"},{"name":"Bachelor of Forestry Science","credential":"BForSc","url":"https://www.canterbury.ac.nz/study/academic-study/qualifications/bachelor-of-forestry-science"}]}
```

**University of Otago** — `nz-otago`; overviews.

```json
{"priority":3,"institution_key":"nz-otago","name":"University of Otago","country":"New Zealand","country_code":"nz","website":"https://www.otago.ac.nz/","admissions_url":"https://www.otago.ac.nz/study","ib_url":"https://www.otago.ac.nz/study/entry-requirements/admission-from-international-baccalaureate","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":1,"programmes":[],"handoff_url":"https://www.otago.ac.nz/study/qualifications/apply-for-a-programme","ib_summary_unverified":"Full IB Diploma with 24 points, English Language A (SL or HL) or Language B HL, and any maths. IELTS or TOEFL cannot replace the English requirement. Limited-entry degrees select higher."},"targets":[{"name":"Health Sciences First Year (HSFY)","credential":"First year towards a health degree","url":"https://www.otago.ac.nz/study/qualifications/apply-for-a-programme/health-sciences-first-year-hsfy"},{"name":"Exercise and Sport Science","credential":"BSc","url":"https://www.otago.ac.nz/sopeses/study/undergraduate-study/exercise"}]}
```

**Victoria University of Wellington - Te Herenga Waka** — `nz-victoria-wellington`; overviews.

```json
{"priority":3,"institution_key":"nz-victoria-wellington","name":"Victoria University of Wellington - Te Herenga Waka","country":"New Zealand","country_code":"nz","website":"https://www.wgtn.ac.nz/","admissions_url":"https://www.wgtn.ac.nz/study","ib_url":"https://www.wgtn.ac.nz/study/apply-enrol/admissions/international-baccalaureate","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":6,"programmes":[],"handoff_url":"https://www.wgtn.ac.nz/study/programmes-courses/undergraduate","ib_summary_unverified":"Full IB Diploma with 24 points minimum, any maths, and English Language A (SL or HL) or Language B HL. Every bachelor's degree shares this entry rule; some add an audition or other requirement."},"targets":[{"name":"Bachelor of Laws","credential":"LLB","url":"https://www.wgtn.ac.nz/law/study/undergraduate"},{"name":"Political Science and International Relations","credential":"BA","url":"https://www.wgtn.ac.nz/hppi/psir"}]}
```

### Norway

**BI Norwegian Business School** — `no-bi`; overviews.

```json
{"priority":3,"institution_key":"no-bi","name":"BI Norwegian Business School","country":"Norway","country_code":"no","website":"https://www.bi.no/en/","admissions_url":"https://www.bi.no/en/programmes-and-individual-courses/bachelor-programmes/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.bi.no/en/programmes-and-individual-courses/bachelor-programmes/","ib_summary_unverified":"IB Diploma; English A at grade 3 or English B at grade 5. Still in your final year? Apply on official predicted grades and give BI access to your results through the IBO."},"targets":[{"name":"Bachelor in Business Administration (BBA)","credential":"BBA","url":"https://www.bi.no/en/programmes-and-individual-courses/bachelor-programmes/business-administration/"},{"name":"Bachelor in Data Science for Business","credential":"Bachelor of Data Science for Business","url":"https://www.bi.no/en/programmes-and-individual-courses/bachelor-programmes/Data-Science-for-Business/"},{"name":"Bachelor in Digital Business","credential":"Bachelor of Digital Business","url":"https://www.bi.no/en/programmes-and-individual-courses/bachelor-programmes/digital-business/"}]}
```

**Inland Norway University of Applied Sciences** — `no-inn`; overviews.

```json
{"priority":3,"institution_key":"no-inn","name":"Inland Norway University of Applied Sciences","country":"Norway","country_code":"no","website":"https://www.inn.no/english/","admissions_url":"https://www.inn.no/english/study-options/our-studies","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.inn.no/english/study-options/our-studies/the-game-school/","ib_summary_unverified":"The IB Diploma, with English, meets the entry requirement; Norwegian is not required for either game degree. With a Nordic school background you apply through Samordna opptak."},"targets":[{"name":"Bachelor in Game Art and Animation","credential":"Bachelor (180 ECTS)","campus":"Hamar","url":"https://www.inn.no/english/study-options/our-studies/game-art-and-animation/"},{"name":"Bachelor in Game Technology","credential":"Bachelor (180 ECTS)","campus":"Hamar","url":"https://www.inn.no/english/study-options/our-studies/game-technology/"}]}
```

**Nord University** — `no-nord`; overviews.

```json
{"priority":3,"institution_key":"no-nord","name":"Nord University","country":"Norway","country_code":"no","website":"https://www.nord.no/en","admissions_url":"https://www.nord.no/en/study-programmes/admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.nord.no/en/study-programmes/admission/bachelor","ib_summary_unverified":"The IB Diploma, with English, meets the entry requirement. Unless you are Norwegian or live in Norway, you apply through Søknadsweb, where Norwegian is not needed."},"targets":[{"name":"Bachelor of Biology","credential":"Bachelor of Biology","campus":"Bodø","url":"https://www.nord.no/en/studies/biology-bachelors-programme"},{"name":"Bachelor of Animal Science","credential":"Bachelor of Animal Science","campus":"Bodø, then Košice (Slovakia)","url":"https://www.nord.no/en/studies/animal-science-bachelors-programme"},{"name":"Film and TV Production","credential":"Bachelor (180 ECTS)","campus":"Levanger","url":"https://www.nord.no/en/studies/film-and-tv-production-bachelors-programme"},{"name":"Bachelor in CG Art and Animation","credential":"Bachelor (180 ECTS)","campus":"Levanger","url":"https://www.nord.no/en/studies/cg-art-and-animation-bachelors-programme"},{"name":"Bachelor in Games and Entertainment Technology","credential":"Bachelor (180 ECTS)","campus":"Levanger","url":"https://www.nord.no/en/studies/games-and-entertainment-technology-bachelor"},{"name":"Bachelor in Acting and Artistic Production","credential":"BA","campus":"Levanger","url":"https://www.nord.no/en/studies/acting-and-artistic-production-bachelors-programme"}]}
```

**Norwegian School of Economics** — `no-nhh`; overviews.

```json
{"priority":3,"institution_key":"no-nhh","name":"Norwegian School of Economics","country":"Norway","country_code":"no","website":"https://www.nhh.no/en/","admissions_url":"https://www.nhh.no/en/study-programmes/application-and-admission/admission-bsc-in-business-economics-and-data-science/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.nhh.no/en/study-programmes/application-and-admission/admission-bsc-in-business-economics-and-data-science/","ib_summary_unverified":"IB Diploma with Maths AA or AI (SL or HL), and English A at grade 3 or English B at grade 5. EU/EEA applicants can get a conditional offer on official predicted grades."},"targets":[{"name":"Bachelor in Business, Economics and Data Science","credential":"BSc","url":"https://www.nhh.no/en/study-programmes/bsc-in-business-economics-and-data-science/"}]}
```

**Norwegian University of Life Sciences** — `no-nmbu`; overviews.

```json
{"priority":3,"institution_key":"no-nmbu","name":"Norwegian University of Life Sciences","country":"Norway","country_code":"no","website":"https://www.nmbu.no/en","admissions_url":"https://www.nmbu.no/en/studies/application-procedures-study-programmes-taught-english","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.nmbu.no/en/studies/application-procedures-study-programmes-taught-english","ib_summary_unverified":"Still at school? Apply through Samordna opptak, which needs Norwegian at B2: Danish, Norwegian or Swedish A, or Norwegian B HL, at grade 3 covers it. English A at 3 or English B at 5."},"targets":[{"name":"International Environment and Development Studies","credential":"BSc","url":"https://www.nmbu.no/en/studies/bachelor/international-environment-and-development-studies"}]}
```

**Oslo National Academy of the Arts** — `no-khio`; overviews.

```json
{"priority":3,"institution_key":"no-khio","name":"Oslo National Academy of the Arts","country":"Norway","country_code":"no","website":"https://www.khio.no/en","admissions_url":"https://www.khio.no/en/study-information/apply-for-admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://khio.no/en/study-information/apply-for-admission#bachelors-programmes","ib_summary_unverified":"Ballet: no school-leaving qualification needed, the audition decides. KHiO's other bachelor's are taught in Norwegian and need Norwegian proficiency."},"targets":[{"name":"Bachelor's Programme in Classical Ballet","credential":"Bachelor (180 ECTS)","url":"https://khio.no/en/study-programmes/bakb"}]}
```

**University of Agder** — `no-uia`; overviews.

```json
{"priority":3,"institution_key":"no-uia","name":"University of Agder","country":"Norway","country_code":"no","website":"https://www.uia.no/english/","admissions_url":"https://www.uia.no/english/studies/how-to-apply/index.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uia.no/english/studies/how-to-apply/index.html","ib_summary_unverified":"The IB Diploma meets the entry requirement, and English at any grade that passes, SL or HL, covers English. The two music degrees add an entrance exam."},"targets":[{"name":"Academic Esports","credential":"Bachelor (180 ECTS)","campus":"Grimstad","url":"https://www.uia.no/english/studies/programmes/academic-esports-bachelor/"},{"name":"Classical Music Performance","credential":"Bachelor (180 ECTS)","campus":"Kristiansand","url":"https://www.uia.no/english/studies/programmes/classical-music-performance-bachelor/"},{"name":"Electronic Music","credential":"Bachelor (180 ECTS)","campus":"Kristiansand","url":"https://www.uia.no/english/studies/programmes/electronic-music-bachelor/"},{"name":"English","credential":"Bachelor (180 ECTS)","campus":"Kristiansand","url":"https://www.uia.no/english/studies/programmes/english-bachelor/"},{"name":"Global Development Studies","credential":"Bachelor (180 ECTS)","campus":"Kristiansand","url":"https://www.uia.no/english/studies/programmes/global-development-studies-bachelor/"}]}
```

**University of Oslo** — `no-uio`; overviews.

```json
{"priority":3,"institution_key":"no-uio","name":"University of Oslo","country":"Norway","country_code":"no","website":"https://www.uio.no/english/","admissions_url":"https://www.uio.no/english/studies/admission/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uio.no/english/studies/programmes/technology-systems/admission/","ib_summary_unverified":"Needs maths at R1 plus a science at 1+2 level: Maths AA (SL or HL) or AI HL covers both. Still at school? Apply via Samordna opptak, which needs Danish, Norwegian or Swedish A, or Norwegian B HL."},"targets":[{"name":"Technology Systems: Science and Engineering","credential":"Bachelor (180 ECTS)","campus":"Kjeller","url":"https://www.uio.no/english/studies/programmes/technology-systems/"}]}
```

**University of Stavanger** — `no-uis`; overviews.

```json
{"priority":3,"institution_key":"no-uis","name":"University of Stavanger","country":"Norway","country_code":"no","website":"https://www.uis.no/en","admissions_url":"https://www.uis.no/en/studietilbud","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-25","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uis.no/en/undergraduate-programmes","ib_summary_unverified":"Dance: the IB Diploma plus a two-round audition; no Norwegian needed. UiS's other bachelor's are taught in Norwegian and need Norwegian at B2, which Danish A at grade 3 covers."},"targets":[{"name":"Dance – Bachelor","credential":"Bachelor (180 ECTS)","url":"https://www.uis.no/en/studies/dance-bachelor"}]}
```

### Portugal

**Católica Lisbon School of Business & Economics** — `pt-catolica-lisbon`; overviews.

```json
{"priority":3,"institution_key":"pt-catolica-lisbon","name":"Católica Lisbon School of Business & Economics","country":"Portugal","country_code":"pt","website":"https://www.clsbe.lisboa.ucp.pt/","admissions_url":"https://www.clsbe.lisboa.ucp.pt/international-bachelors-degrees-business-administration/how-apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.clsbe.lisboa.ucp.pt/undergraduate-programs/undergraduate-programs","ib_summary_unverified":"Apply on predicted grades with IB Maths AA (SL or HL) or AI HL and a second listed exam, such as English or Business; below 14 of 20 overall gets no offer (2026 criteria)."},"targets":[{"name":"International Undergraduate Program in Business Administration","credential":"Licenciatura (bachelor's degree)","url":"https://www.clsbe.lisboa.ucp.pt/international-bachelors-degrees-business-administration/business"},{"name":"International Undergraduate Program in Economics & Finance","credential":"Licenciatura (bachelor's degree)","url":"https://www.clsbe.lisboa.ucp.pt/iups-economics-finance/economics-finance"},{"name":"International Undergraduate Program in Management & Data Analytics","credential":"Licenciatura (bachelor's degree)","url":"https://www.clsbe.lisboa.ucp.pt/international-undergraduate-program-management-data-analytics/management-data-analytics"}]}
```

**Instituto Superior Técnico** — `pt-ist`; overviews.

```json
{"priority":3,"institution_key":"pt-ist","name":"Instituto Superior Técnico","country":"Portugal","country_code":"pt","website":"https://tecnico.ulisboa.pt/en/","admissions_url":"https://tecnico.ulisboa.pt/en/education/study-at-tecnico/applications/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://tecnico.ulisboa.pt/en/education/courses/undergraduate-programmes/","ib_summary_unverified":"EU citizens apply through the national contest: IB final grade 50%, IB exams replacing entrance exams 50%. Each exam at least 100 of 200, overall at least 120 (2026 criteria)."},"targets":[{"name":"General Engineering (GENI)","credential":"Licenciatura (bachelor's degree)","url":"https://tecnico.ulisboa.pt/en/education/courses/undergraduate-programmes/general-engineering/"}]}
```

**ISCTE — Instituto Universitário de Lisboa** — `pt-iscte-iul`; overviews.

```json
{"priority":3,"institution_key":"pt-iscte-iul","name":"ISCTE — Instituto Universitário de Lisboa","country":"Portugal","country_code":"pt","website":"https://www.iscte-iul.pt/","admissions_url":"https://www.iscte-iul.pt/en/cursos/candidaturas","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.iscte-iul.pt/programmes/undergraduate","ib_summary_unverified":"EU citizens apply through the national contest: IB final grade 50%, IB exams replacing entrance exams 50%; at least 100 of 200 overall and 95 per exam (2026 criteria)."},"targets":[{"name":"Bachelor Degree in International Studies","credential":"Licenciatura (bachelor's degree)","url":"https://www.iscte-iul.pt/programmes/degree/0527"},{"name":"Bachelor Degree in Management (English-taught class)","credential":"BSc","url":"https://ibs.iscte-iul.pt/degree/code/9147/bachelor-degree-in-management"}]}
```

**Nova School of Business and Economics** — `pt-nova-sbe`; overviews.

```json
{"priority":3,"institution_key":"pt-nova-sbe","name":"Nova School of Business and Economics","country":"Portugal","country_code":"pt","website":"https://www.novasbe.unl.pt/en/","admissions_url":"https://www.novasbe.unl.pt/en/programs/apply/bachelors/national-call","ib_url":"https://www.novasbe.unl.pt/en/programs/apply/bachelors/international-students","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.novasbe.unl.pt/en/programs/bachelors","ib_summary_unverified":"EU citizens apply through Portugal's national contest: your IB grade, converted to 0–200, plus IB exams in place of Portuguese entrance exams; each exam at least 9.5 of 20 (2026 criteria)."},"targets":[{"name":"Bachelor's in Economics","credential":"BSc","campus":"Carcavelos","url":"https://www.novasbe.unl.pt/en/programs/bachelors/economics/overview"},{"name":"Bachelor's in Management","credential":"BSc","campus":"Carcavelos","url":"https://www.novasbe.unl.pt/en/programs/bachelors/management/overview"},{"name":"Bachelor's in Ocean Studies","credential":"BSc","campus":"Carcavelos","url":"https://www.novasbe.unl.pt/en/programs/bachelors/ocean-studies/overview"}]}
```

**Universidade Católica Portuguesa** — `pt-ucp`; overviews.

```json
{"priority":3,"institution_key":"pt-ucp","name":"Universidade Católica Portuguesa","country":"Portugal","country_code":"pt","website":"https://www.ucp.pt/pt-pt/homepage","admissions_url":"https://www.ucp.pt/pt-pt/candidatos-internacionais","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ucp.pt/education/undergraduate?f%5B0%5D=ucp_languages%3A216","ib_summary_unverified":"Apply to each faculty directly, not through the national contest: IB exams stand in for the Portuguese entrance exams, and each faculty sets its own exams, minimums and calendar."},"targets":[{"name":"Economics (Católica Porto School of Business and Economics)","credential":"BSc","campus":"Porto","url":"https://cpsbe.porto.ucp.pt/undergraduate/economics-degree"},{"name":"Management (Católica Porto School of Business and Economics)","credential":"BSc","campus":"Porto","url":"https://cpsbe.porto.ucp.pt/undergraduate/management-degree"},{"name":"BSc Systems and Cognitive Neuroscience","credential":"BSc","campus":"Lisbon","url":"https://fcse.lisboa.ucp.pt/undergraduate/bsc-systems-and-cognitive-neuroscience"},{"name":"Degree in Data Science and Technology (e-learning)","credential":"Licenciatura (bachelor's degree)","campus":"Online (Faculty of Philosophy and Social Sciences, Braga)","url":"https://ffcs.braga.ucp.pt/en/licenciaturas/programas/degree-data-science-and-technology-ead"}]}
```

**Universidade de Lisboa** — `pt-ulisboa`; overviews.

```json
{"priority":3,"institution_key":"pt-ulisboa","name":"Universidade de Lisboa","country":"Portugal","country_code":"pt","website":"https://www.ulisboa.pt/en","admissions_url":"https://www.ulisboa.pt/en/international-students","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-29","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.iseg.ulisboa.pt/en/to-study-2/degrees/","ib_summary_unverified":"EU citizens apply through the national contest: IB final grade (on a 0–200 scale) 50%, IB exams replacing entrance exams 50%. ISEG's English degrees need Maths AA (SL/HL) or AI HL."},"targets":[{"name":"Economics","credential":"Licenciatura (bachelor's degree)","url":"https://www.iseg.ulisboa.pt/en/study/undergraduate/economics/"},{"name":"Management","credential":"Licenciatura (bachelor's degree)","url":"https://www.iseg.ulisboa.pt/en/study/undergraduate/management/"},{"name":"Finance","credential":"Licenciatura (bachelor's degree)","url":"https://www.iseg.ulisboa.pt/en/study/undergraduate/finance/"},{"name":"Applied Mathematics for Economics and Management","credential":"Licenciatura (bachelor's degree)","url":"https://www.iseg.ulisboa.pt/en/study/undergraduate/applied-mathematics-for-economics-and-management/"}]}
```

**Universidade do Porto** — `pt-u-porto`; overviews.

```json
{"priority":3,"institution_key":"pt-u-porto","name":"Universidade do Porto","country":"Portugal","country_code":"pt","website":"https://www.up.pt/portal/en/","admissions_url":"https://www.up.pt/portal/en/study/bachelors-and-integrated-masters-degrees/applications-and-admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://programmes.fep.up.pt/bachelors/","ib_summary_unverified":"EU students from foreign systems apply through the national contest, on its deadlines: IB grade 50%, IB exams replacing entrance exams 50%; at least 12 of 20 per exam (2026 criteria)."},"targets":[{"name":"Bachelor in Economics (taught in English)","credential":"Licenciatura (bachelor's degree)","url":"https://programmes.fep.up.pt/bachelors/economics/"},{"name":"Bachelor in Business Administration (taught in English)","credential":"Licenciatura (bachelor's degree)","url":"https://programmes.fep.up.pt/bachelors/business-administration/"}]}
```

**Universidade dos Açores** — `pt-uac`; overviews.

```json
{"priority":3,"institution_key":"pt-uac","name":"Universidade dos Açores","country":"Portugal","country_code":"pt","website":"https://uac.pt/","admissions_url":"https://www.uac.pt/pt-pt/acesso-20252026","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-29","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://uac.pt/ensino/curso.php?f=FCT&id=5862&l=EN","ib_summary_unverified":"EU/EEA citizens use Portugal's national contest. The 2026 entrance-exam sets used biology, physics and chemistry, geography or mathematics; 2027 IB equivalences are not published yet."},"targets":[{"name":"Ocean Sciences","credential":"Licenciatura (bachelor's degree)","campus":"Ponta Delgada (year 1); Horta (years 2–3)","url":"https://uac.pt/ensino/curso.php?f=FCT&id=5862&l=EN"}]}
```

**Universidade NOVA de Lisboa** — `pt-nova`; overviews.

```json
{"priority":3,"institution_key":"pt-nova","name":"Universidade NOVA de Lisboa","country":"Portugal","country_code":"pt","website":"https://www.unl.pt/en","admissions_url":"https://www.unl.pt/en/study","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-29","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://guia.unl.pt/en/2026/programs","ib_summary_unverified":"EU citizens apply through the national contest: IB final grade 50%, IB exams replacing entrance exams 50%. NOVA IMS degrees need Maths AA (SL/HL) or AI HL."},"targets":[{"name":"Data Science","credential":"Licenciatura (bachelor's degree)","url":"https://novaims.unl.pt/en/education/programs/bachelor-s-degrees/data-science/"},{"name":"Information Management","credential":"Licenciatura (bachelor's degree)","url":"https://novaims.unl.pt/en/education/programs/bachelor-s-degrees/information-management/"},{"name":"Information Systems","credential":"Licenciatura (bachelor's degree)","url":"https://novaims.unl.pt/en/education/programs/bachelor-s-degrees/information-systems/"},{"name":"Global Public Health","credential":"BSc","url":"https://guia.unl.pt/en/2026/ensp/program/L350"}]}
```

### Singapore

**Curtin Singapore** — `sg-curtin-singapore`; overviews.

```json
{"priority":3,"institution_key":"sg-curtin-singapore","name":"Curtin Singapore","country":"Singapore","country_code":"sg","website":"https://curtin.edu.sg/","admissions_url":"https://www.curtin.edu.sg/how-to-apply/admission-criteria/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.curtin.edu.sg/courses/undergraduate/","ib_summary_unverified":"IB Diploma with at least 24 points from 6 subjects at one sitting, 3 at Higher Level and one of them English. Lower scores point to Curtin’s diploma route; English tests apply if not English-medium."},"targets":[{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-commerce/"},{"name":"Computing (Cyber Security)","credential":"Bachelor of Computing","url":"https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-computing-cyber-security/"},{"name":"Information Technology","credential":"Bachelor of Information Technology","url":"https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-information-technology/"}]}
```

**DigiPen Institute of Technology Singapore** — `sg-digipen-singapore`; overviews.

```json
{"priority":3,"institution_key":"sg-digipen-singapore","name":"DigiPen Institute of Technology Singapore","country":"Singapore","country_code":"sg","website":"https://www.digipen.edu.sg/","admissions_url":"https://www.digipen.edu.sg/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.digipen.edu.sg/admissions/undergraduate-degree-programs","ib_summary_unverified":"Apply through the SIT portal: IB Diploma with grade 5 in at least two HL subjects and one SL subject. The two Computer Science degrees also need HL Maths, Physics or Computing, or SL Maths."},"targets":[{"name":"Computer Science in Real-Time Interactive Simulation","credential":"Bachelor of Science","url":"https://www.digipen.edu.sg/academics/computer-science-degrees/bs-in-computer-science-in-real-time-interactive-simulation"},{"name":"Computer Science in Interactive Media and Game Development","credential":"Bachelor of Science","url":"https://www.digipen.edu.sg/academics/computer-science-degrees/bs-in-computer-science-in-interactive-media-and-game-development"},{"name":"User Experience and Game Design","credential":"Bachelor of Arts","url":"https://www.digipen.edu.sg/academics/art-and-design-degrees/ba-in-user-experience-and-game-design"}]}
```

**ESSEC Business School Asia-Pacific** — `sg-essec-asia-pacific`; overviews.

```json
{"priority":3,"institution_key":"sg-essec-asia-pacific","name":"ESSEC Business School Asia-Pacific","country":"Singapore","country_code":"sg","website":"https://www.essec.edu/en/campus/singapore/","admissions_url":"https://www.essec.edu/en/program/global-bba-international/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.essec.edu/en/program/global-bba/global-bba-international/admission/","ib_summary_unverified":"No IB points are published: the file is scored on 3 years of transcripts, a CV and an English test (IELTS 6.5, TOEFL iBT 90) unless your last 2 school years were in English, then a 30-minute interview."},"targets":[{"name":"Global BBA","credential":"BBA","url":"https://www.essec.edu/en/program/global-bba/global-bba-international/program/"}]}
```

**James Cook University Singapore** — `sg-jcu-singapore`; overviews.

```json
{"priority":3,"institution_key":"sg-jcu-singapore","name":"James Cook University Singapore","country":"Singapore","country_code":"sg","website":"https://www.jcu.edu.sg/","admissions_url":"https://www.jcu.edu.sg/courses-and-study/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":23,"faculty_count":0,"programmes":[],"handoff_url":"https://www.jcu.edu.sg/courses-and-study/course-level/undergraduate-your-first-degree","ib_summary_unverified":"Asks for 12 years of schooling and English at IELTS 6.0; no IB score or subject is published. Ask the admissions office which IB result it accepts for your course."},"targets":[{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-hospitality-And-tourism-management"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-international-business"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-majoring-in-human-resources-management"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-management"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-business-intelligence-And-information-systems"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-majoring-in-marketing-for-the-digital-age"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce-majoring-in-accounting"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce-majoring-in-banking-and-finance"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce-majoring-in-economics"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce-majoring-in-financial-management"},{"name":"Commerce","credential":"Bachelor of Commerce","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-commerce-majoring-in-international-trade"},{"name":"Business and Environmental Science","credential":"Bachelor of Business and Environmental Science","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-And-environmental-science"},{"name":"Business and Environmental Science","credential":"Bachelor of Business and Environmental Science","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-business-And-environmental-science-aquaculture"},{"name":"Psychology Studies","credential":"Bachelor of Arts","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-arts-psychology-studies"},{"name":"Psychological Science","credential":"Bachelor of Psychological Science","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-psychological-science"},{"name":"Data Science","credential":"Bachelor of Science","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-science-majoring-in-data-science"},{"name":"Aquaculture Science and Technology","credential":"Bachelor of Science","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-science-majoring-in-aquaculture-science-and-technology"},{"name":"Cybersecurity","credential":"Bachelor of Cybersecurity","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-cybersecurity"},{"name":"Information Technology","credential":"Bachelor of Information Technology","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-information-technology"},{"name":"Economics","credential":"Bachelor of Economics","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-economics"},{"name":"Tourism, Hospitality and Events","credential":"Bachelor of Tourism, Hospitality and Events","url":"https://www.jcu.edu.sg/courses-and-study/courses/course/bachelor-of-tourism,-hospitality-and-events"}]}
```

**LASALLE College of the Arts** — `sg-lasalle`; overviews.

```json
{"priority":3,"institution_key":"sg-lasalle","name":"LASALLE College of the Arts","country":"Singapore","country_code":"sg","website":"https://www.lasalle.edu.sg/","admissions_url":"https://www.lasalle.edu.sg/study/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":16,"faculty_count":0,"programmes":[],"handoff_url":"https://www.lasalle.edu.sg/study/programmes/","ib_summary_unverified":"The IB Diploma is a listed entry qualification with no points or subjects set; selection is by portfolio, audition or statement of purpose plus an online interview. IELTS 6.0 if not English-medium."},"targets":[{"name":"Acting","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/acting/"},{"name":"Animation Art","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/animation-art/"},{"name":"Art Histories and Curatorial Practices: Asia and the World","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/art-histories-and-curatorial-practices-asia-and-world/"},{"name":"Arts Management","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/arts-management/"},{"name":"Design Communication","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/design-communication/"},{"name":"Design for Social Futures","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/design-social-futures/"},{"name":"Fashion Design and Textiles","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/fashion-design-and-textiles/"},{"name":"Fashion Media and Industries","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/fashion-media-and-industries/"},{"name":"Film","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/film/"},{"name":"Fine Arts","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/fine-arts/"},{"name":"Interior Design","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/interior-design/"},{"name":"International Contemporary Dance Practices","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/international-contemporary-dance-practices/"},{"name":"Music","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/music/"},{"name":"Music Business","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/music-business/"},{"name":"Musical Theatre","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/musical-theatre/"},{"name":"Product Design","credential":"BA (Hons)","url":"https://www.lasalle.edu.sg/study/programmes/ba-hons/product-design/"}]}
```

**Nanyang Academy of Fine Arts** — `sg-nafa`; overviews.

```json
{"priority":3,"institution_key":"sg-nafa","name":"Nanyang Academy of Fine Arts","country":"Singapore","country_code":"sg","website":"https://www.nafa.edu.sg/","admissions_url":"https://www.nafa.edu.sg/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://www.nafa.edu.sg/admissions/bachelors-degree-admissions","ib_summary_unverified":"The IB Diploma is a listed entry qualification with no points or subjects set; you must authorise the IB to release your transcript to NAFA. Selection is by portfolio or audition plus interview."},"targets":[{"name":"Biophilic Design","credential":"Bachelor of Arts (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-arts-honours-biophilic-design"},{"name":"Design Practice","credential":"Bachelor of Arts (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-arts-honours-design-practice"},{"name":"Fine Art","credential":"Bachelor of Arts (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-arts-honours-fine-art"},{"name":"Performance Making","credential":"Bachelor of Arts (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-arts-honours-performance-making"},{"name":"Instrumental & Vocal Teaching","credential":"Bachelor of Education (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-education-(honours)-in-instrumental-vocal-teaching"},{"name":"Music","credential":"Bachelor of Music (Honours)","url":"https://www.nafa.edu.sg/programmes/bachelor-of-music-honours"}]}
```

**Nanyang Technological University** — `sg-ntu`; overviews.

```json
{"priority":3,"institution_key":"sg-ntu","name":"Nanyang Technological University","country":"Singapore","country_code":"sg","website":"https://www.ntu.edu.sg/","admissions_url":"https://www.ntu.edu.sg/admissions/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":5,"programmes":[],"handoff_url":"https://www3.ntu.edu.sg/oad2/website_files/IBDiploma/MinimumSubject.pdf","ib_summary_unverified":"You can apply before IB results are out but must give NTU direct IBO transcript access. Engineering asks HL Maths plus an HL science; business SL Maths; humanities good SL English. AA and AI both count."},"targets":[{"name":"Materials Engineering","credential":"Bachelor of Engineering","url":"https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-materials-engineering"},{"name":"Business","credential":"Bachelor of Business","url":"https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-business"}]}
```

**Singapore Institute of Management (SIM Global Education)** — `sg-sim-ge`; overviews.

```json
{"priority":3,"institution_key":"sg-sim-ge","name":"Singapore Institute of Management (SIM Global Education)","country":"Singapore","country_code":"sg","website":"https://www.sim.edu.sg/","admissions_url":"https://www.sim.edu.sg/degrees-diplomas/admissions/application-process","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":8,"programmes":[],"handoff_url":"https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing?academic=2%7C","ib_summary_unverified":"Entry rules belong to each partner. Buffalo asks school grades equal to about IB 4.5; Stirling takes the IB Diploma into Year 1; RMIT and Wollongong list A-levels and diplomas, other qualifications case by case."},"targets":[{"name":"Communication","credential":"Bachelor of Arts","url":"https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-arts-communication"},{"name":"Marketing","credential":"Bachelor of Arts (Honours)","url":"https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-arts-honours-marketing"}]}
```

**Singapore Institute of Technology** — `sg-sit`; overviews.

```json
{"priority":3,"institution_key":"sg-sit","name":"Singapore Institute of Technology","country":"Singapore","country_code":"sg","website":"https://www.singaporetech.edu.sg/","admissions_url":"https://www.singaporetech.edu.sg/admissions","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":7,"programmes":[],"handoff_url":"https://www.singaporetech.edu.sg/undergraduate-programmes","ib_summary_unverified":"Needs the IB Diploma with grade 5 in at least two HL subjects and one SL subject; May sitters apply on forecast results. Some degrees add English, maths, medical or portfolio conditions."},"targets":[{"name":"Diagnostic Radiography","credential":"Bachelor of Science with Honours","url":"https://www.singaporetech.edu.sg/undergraduate-programmes/diagnostic-radiography"},{"name":"Food Technology","credential":"Bachelor of Food Technology with Honours","url":"https://www.singaporetech.edu.sg/undergraduate-programmes/food-technology"}]}
```

**Singapore Management University** — `sg-smu`; overviews.

```json
{"priority":3,"institution_key":"sg-smu","name":"Singapore Management University","country":"Singapore","country_code":"sg","website":"https://www.smu.edu.sg/","admissions_url":"https://admissions.smu.edu.sg/admissions-requirements/ib-diploma","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":3,"faculty_count":7,"programmes":[],"handoff_url":"https://admissions.smu.edu.sg/programmes","ib_summary_unverified":"May sitters apply on teacher-attested predicted scores (self-declared ones are refused). Law needs grade 6 or 7 in English A; Economics and Computer Science need a good pass in IB Maths. Ask SMU for a minimum total."},"targets":[{"name":"Business Management","credential":"Bachelor of Business Management","url":"https://admissions.smu.edu.sg/programmes/lee-kong-chian-school-business"},{"name":"Accountancy","credential":"Bachelor of Accountancy","url":"https://admissions.smu.edu.sg/programmes/school-accountancy"},{"name":"Law","credential":"Bachelor of Laws (LLB)","url":"https://admissions.smu.edu.sg/programmes/yong-pung-how-school-law"}]}
```

**Singapore University of Social Sciences** — `sg-suss`; overviews.

```json
{"priority":3,"institution_key":"sg-suss","name":"Singapore University of Social Sciences","country":"Singapore","country_code":"sg","website":"https://www.suss.edu.sg/","admissions_url":"https://www.suss.edu.sg/full-time-undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":11,"faculty_count":0,"programmes":[],"handoff_url":"https://www.suss.edu.sg/admissions/application-process/international-students/international-ft-undergraduate-students","ib_summary_unverified":"Open to IB Diploma holders; you authorise the IB to release your transcript to SUSS. No IB points or subjects are listed; ask the admissions office what grades are competitive."},"targets":[{"name":"Accountancy","credential":"Bachelor of Accountancy","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-accountancy"},{"name":"Early Childhood Education","credential":"Bachelor of Early Childhood Education","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-early-childhood-education"},{"name":"Human Resource Management","credential":"Bachelor of Human Resource Management","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-human-resource-management"},{"name":"Public Safety and Security","credential":"Bachelor of Public Safety and Security","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-public-safety-and-security"},{"name":"Business Analytics","credential":"Bachelor of Science in Business Analytics","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-science-in-business-analytics"},{"name":"Finance","credential":"Bachelor of Science in Finance","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-science-in-finance"},{"name":"Information and Communication Technology","credential":"BSc","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-science-in-information-and-communication-technology"},{"name":"Marketing","credential":"BSc","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-science-in-marketing"},{"name":"Psychology","credential":"BSc","url":"https://www.suss.edu.sg/programmes/detail/bachelor-of-science-in-psychology"},{"name":"Supply Chain Management","credential":"BSc","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-science-in-supply-chain-management"},{"name":"Social Work","credential":"Bachelor of Social Work","url":"https://www.suss.edu.sg/programmes/detail/ft-bachelor-of-social-work"}]}
```

**Singapore University of Technology and Design** — `sg-sutd`; overviews.

```json
{"priority":3,"institution_key":"sg-sutd","name":"Singapore University of Technology and Design","country":"Singapore","country_code":"sg","website":"https://www.sutd.edu.sg/","admissions_url":"https://www.sutd.edu.sg/admissions/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.sutd.edu.sg/education/undergraduate/majors/","ib_summary_unverified":"No minimum IB total or subject is published; applications are reviewed on academic and non-academic record. May sitters apply on school-attested predicted results and must authorise the IB to release transcripts."},"targets":[{"name":"Architecture and Sustainable Design","credential":"BSc","url":"https://www.sutd.edu.sg/asd/education/undergraduate/"},{"name":"Computer Science and Design","credential":"BEng","url":"https://www.sutd.edu.sg/istd/education/undergraduate/"},{"name":"Design and Artificial Intelligence","credential":"BSc","url":"https://www.sutd.edu.sg/dai/education/undergraduate/"},{"name":"Engineering Product Development","credential":"BEng","url":"https://www.sutd.edu.sg/epd/education/undergraduate/"},{"name":"Engineering Systems and Design","credential":"BEng","url":"https://www.sutd.edu.sg/esd/education/undergraduate/"}]}
```

### Slovenia

**Alma Mater Europaea** — `si-ameu`; overviews.

```json
{"priority":3,"institution_key":"si-ameu","name":"Alma Mater Europaea","country":"Slovenia","country_code":"si","website":"https://www.almamater.si/en","admissions_url":"https://www.almamater.si/en/enrollment","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://www.almamater.si/en/tuition-and-fees/studies-en","ib_summary_unverified":"The IB Diploma counts as a Slovenian general matura with no recognition step. AMEU applications go through eVŠ; English-taught study is fee-paying for everyone, EU citizens included."},"targets":[{"name":"Physiotherapy","credential":"Bachelor of Applied Science","url":"https://almamater.si/en/physiotherapy-bachelor"},{"name":"Nursing","credential":"Bachelor of Applied Science","url":"https://www.almamater.si/en/nursing-ba"},{"name":"Social Gerontology","credential":"Professional bachelor (social gerontologist)","url":"https://www.almamater.si/en/social-gerontology-ba"},{"name":"Business Management","credential":"Bachelor of Business Operations Management","url":"https://www.almamater.si/en/business-management-ba"},{"name":"Archives Management","credential":"Professional bachelor (graduate archivist)","url":"https://www.almamater.si/en/archives-management-ba"},{"name":"Humanities","credential":"Bachelor (graduate in humanities)","url":"https://www.almamater.si/en/humanities-ba"},{"name":"Web and Information Technologies","credential":"Professional Bachelor of Engineering","url":"https://www.almamater.si/en/web-ba"}]}
```

**GEA College** — `si-gea`; overviews.

```json
{"priority":3,"institution_key":"si-gea","name":"GEA College","country":"Slovenia","country_code":"si","website":"https://gea-college.si/","admissions_url":"https://gea-college.si/mednarodna-pisarna/information-for-incoming-students/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://gea-college.si/en/study/faculty-of-entrepreneurship/entrepreneurship/programme-presentation/","ib_summary_unverified":"GEA says IB diplomas need no recognition procedure; general matura holders are eligible, with ranking on grades if places are limited. Proof of B2 in the language of study is asked for."},"targets":[{"name":"Entrepreneurship","credential":"BSc (Economics)","url":"https://gea-college.si/en/study/faculty-of-entrepreneurship/entrepreneurship/programme-presentation/"}]}
```

**University of Ljubljana** — `si-ul`; overviews.

```json
{"priority":3,"institution_key":"si-ul","name":"University of Ljubljana","country":"Slovenia","country_code":"si","website":"https://www.uni-lj.si/en","admissions_url":"https://www.uni-lj.si/en/study/bachelors-and-single-cycle-masters-study/call-for-enrolment","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ef.uni-lj.si/en/study/bachelors-programmes/university-degree-programme-in-business-and-economics","ib_summary_unverified":"The IB Diploma counts as a Slovenian general matura with no recognition procedure; the IB certificate alone does not. Places are ranked on converted grades; B2 English is needed."},"targets":[{"name":"University Degree Programme in Business and Economics","credential":"BA","url":"https://www.ef.uni-lj.si/en/study/bachelors-programmes/university-degree-programme-in-business-and-economics"}]}
```

**University of Maribor** — `si-um`; overviews.

```json
{"priority":3,"institution_key":"si-um","name":"University of Maribor","country":"Slovenia","country_code":"si","website":"https://www.um.si/en/home-page/","admissions_url":"https://moja.um.si/en/future-students/Strani/UM-application-deadlines-for-enrolment.aspx","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://moja.um.si/en/future-students/Strani/enrolment.aspx","ib_summary_unverified":"The IB Diploma counts as a Slovenian general matura with no recognition step, and its result stands in for school years 3–4 in the ranking. The IB certificate alone needs recognition."},"targets":[{"name":"Economic and Business Studies","credential":"BA","url":"https://www.epf.um.si/en/study-programmes/study-in-english/1st-cycle-bachelors-degree-study-programme/"},{"name":"Contemporary Tourism Practices","credential":"Bachelor of Applied Arts (B.A.A.)","campus":"Ljubljana","url":"https://www.ft.um.si/en/study/study-programmes/#contemporary-tourism-practices"},{"name":"Crisis Management","credential":"Professional bachelor's degree (VS)","campus":"Kranj","url":"https://www.fov.um.si/en/study/study-programmes/crisis-management/"}]}
```

**University of Nova Gorica** — `si-ung`; overviews.

```json
{"priority":3,"institution_key":"si-ung","name":"University of Nova Gorica","country":"Slovenia","country_code":"si","website":"https://www.ung.si/en/","admissions_url":"https://www.ung.si/en/admissions/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://ung.si/en/admissions/first-level-admissions/","ib_summary_unverified":"The IB Diploma counts as a Slovenian general matura with no recognition step, and the IB result stands in for school years 3–4 in the ranking. B2 English is the minimum for the English courses."},"targets":[{"name":"Physics and Astrophysics","credential":"Academic bachelor's degree (dipl. fiz.)","url":"https://ung.si/en/schools/school-of-science/programmes/1FAF/"}]}
```

**University of Primorska** — `si-up`; overviews.

```json
{"priority":3,"institution_key":"si-up","name":"University of Primorska","country":"Slovenia","country_code":"si","website":"https://www.upr.si/en","admissions_url":"https://www.upr.si/en/study--enrolment/bachelors-and-unified-masters-degree-study/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":10,"faculty_count":0,"programmes":[],"handoff_url":"https://www.upr.si/en/study--enrolment/bachelors-and-unified-masters-degree-study/study-programmes-in-english-language/","ib_summary_unverified":"The IB Diploma counts as a Slovenian general matura with no recognition step, and the IB result stands in for school years 3–4 in the ranking. The IB certificate alone needs recognition."},"targets":[{"name":"Anthropology","credential":"BA","url":"https://fhs.upr.si/en/undergraduate-study/anthropology/"},{"name":"Cultural Heritage","credential":"BA","url":"https://fhs.upr.si/en/undergraduate-study/cultural-heritage/"},{"name":"Management","credential":"Academic bachelor (BA equivalent)","url":"https://www.fm-kp.si/en/study/programmes_in_english/university_degree_programme_in_management"},{"name":"Bioinformatics","credential":"BSc","url":"https://www.famnit.upr.si/en/undergraduate-study/bioinformatics/"},{"name":"Computer Science","credential":"BSc","url":"https://www.famnit.upr.si/en/undergraduate-study/computer-science/"},{"name":"Mathematics","credential":"BSc","url":"https://www.famnit.upr.si/en/undergraduate-study/mathematics/"},{"name":"Mathematics and Computer Science","credential":"BSc","url":"https://www.famnit.upr.si/en/undergraduate-study/mathematics-and-computer-science/"},{"name":"Wood Innovation for Sustainability","credential":"Bachelor of Applied Science in Wood Engineering","url":"https://www.famnit.upr.si/en/undergraduate-study/wood-innovation-for-sustainability/"},{"name":"Tourism Destination Management","credential":"Bachelor of Tourism Management","campus":"Ljubljana","url":"https://www.turistica.si/en/study/undergraduate-studies/tourism-destination-management"},{"name":"Tourism Enterprise Management","credential":"Professional bachelor's degree (tourism)","campus":"Portorož","url":"https://www.turistica.si/en/study/undergraduate-studies/tourism-enterprise-management"}]}
```

### South Korea

**Ewha Womans University** — `kr-ewha`; overviews.

```json
{"priority":3,"institution_key":"kr-ewha","name":"Ewha Womans University","country":"South Korea","country_code":"kr","website":"https://www.ewha.ac.kr/ewhaen/index.do","admissions_url":"https://admission.ewha.ac.kr/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"http://rwcms.ewha.ac.kr/oisa/1442/subview.do","ib_summary_unverified":"Women applicants only. The guide names no IB score. For International Studies, proof of English (TOEFL iBT 80, IELTS 6.0 or New TEPS 326) or a school curriculum taught entirely in English is needed."},"targets":[{"name":"International Studies","credential":"Bachelor's degree","url":"https://scrantoncollege.ewha.ac.kr/escranton/is/about-is.do"},{"name":"Global Korean Studies","credential":"Bachelor of Arts","url":"https://scrantoncollege.ewha.ac.kr/escranton/gks/about-gks.do"}]}
```

**Korea Advanced Institute of Science and Technology** — `kr-kaist`; overviews.

```json
{"priority":3,"institution_key":"kr-kaist","name":"Korea Advanced Institute of Science and Technology","country":"South Korea","country_code":"kr","website":"https://www.kaist.ac.kr/en/","admissions_url":"https://admission.kaist.ac.kr/intl-undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/guide","ib_summary_unverified":"No minimum IB score is published. Send IB results (predicted grades give a conditional place until finals); strong maths and science is encouraged. An English test or exemption is needed."},"targets":[{"name":"Undergraduate entry (major chosen in year two)","credential":"Bachelor's degree","url":"https://kaist.ac.kr/en/html/edu/03.html"}]}
```

**Korea University** — `kr-ku`; overviews.

```json
{"priority":3,"institution_key":"kr-ku","name":"Korea University","country":"South Korea","country_code":"kr","website":"https://www.korea.ac.kr/","admissions_url":"https://oia.korea.ac.kr/oia2026/Admission-Guide.do","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://oia.korea.ac.kr/oia2026/Admission-Guide.do","ib_summary_unverified":"IB results are an optional document (KU's IB code is 002366), not a set requirement. A holistic document review decides; for International Studies, a TOEFL iBT or IELTS Academic score is mandatory."},"targets":[{"name":"International Studies (English Track)","credential":"Bachelor of International Studies","url":"https://int.korea.edu/kuis/under/intro.do"}]}
```

**Pohang University of Science and Technology** — `kr-postech`; overviews.

```json
{"priority":3,"institution_key":"kr-postech","name":"Pohang University of Science and Technology","country":"South Korea","country_code":"kr","website":"https://www.postech.ac.kr/eng/","admissions_url":"https://adm-iu.postech.ac.kr/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://adm-iu.postech.ac.kr/user/admission/guide/international.do","ib_summary_unverified":"No minimum IB score is published. If your school follows the IB, IB score reporting is mandatory; an English test or an English medium-of-instruction letter is needed. Fall 2027 guideline is due in January 2027."},"targets":[{"name":"Undergraduate School (undeclared major)","credential":"Bachelor's degree","url":"https://adm-iu.postech.ac.kr/user/comm/menu/b7f8c54d6eaff431c253db1c8b9bcb45/content/index.do"}]}
```

**Sungkyunkwan University** — `kr-skku`; overviews.

```json
{"priority":3,"institution_key":"kr-skku","name":"Sungkyunkwan University","country":"South Korea","country_code":"kr","website":"https://www.skku.edu/eng/","admissions_url":"https://admission.skku.edu/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://admission-global.skku.edu/eng/etc/bbs_list.html?ctg_cd=Undergraduate","ib_summary_unverified":"IB results are accepted as an academic reference with your transcript; no minimum IB score is published. English Track units ask for an English test (TOEFL, IELTS) unless you are from an English-speaking country."},"targets":[{"name":"Human Science and Society","credential":"Bachelor's degree","url":"https://skb.skku.edu/eng_sscience/hsc.do"},{"name":"Chemical Engineering","credential":"Bachelor's degree","campus":"Suwon","url":"https://enc.skku.edu/eng_enc/chemical_intro.do"},{"name":"Advanced Materials Science and Engineering","credential":"Bachelor's degree","campus":"Suwon","url":"https://enc.skku.edu/eng_enc/advanced_intro.do"},{"name":"Mechanical Engineering","credential":"Bachelor's degree","campus":"Suwon","url":"https://enc.skku.edu/eng_enc/mechanical_intro.do"},{"name":"Nano Engineering","credential":"Bachelor's degree","campus":"Suwon","url":"https://nano.skku.edu/e_sub01/sub01.php"},{"name":"Computer Science and Engineering","credential":"Bachelor's degree","campus":"Suwon","url":"https://sw.skku.edu/eng_sw/under_sw_intro.do"}]}
```

**Yonsei University — Underwood International College** — `kr-yonsei-uic`; overviews.

```json
{"priority":3,"institution_key":"kr-yonsei-uic","name":"Yonsei University — Underwood International College","country":"South Korea","country_code":"kr","website":"https://www.yonsei.ac.kr/sites/en_sc/index.do","admissions_url":"https://uic.yonsei.ac.kr/admission.php?mid=m04_02_01","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-10-07","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://uic.yonsei.ac.kr/undergraduate.php?mid=m02_01_01","ib_summary_unverified":"No minimum IB score is published. IB English A (Language and Literature, or Literature) counts as proof of English; submitting IB results is optional but recommended. Selection is a document review plus interview."},"targets":[{"name":"Underwood Division","credential":"Bachelor's degree","url":"https://uic.yonsei.ac.kr/undergraduate.php?mid=m02_01_01"},{"name":"Humanities, Arts and Social Sciences Division","credential":"Bachelor's degree","url":"https://uic.yonsei.ac.kr/undergraduate.php?mid=m02_02_01"},{"name":"Integrated Science and Engineering Division","credential":"Bachelor's degree","url":"https://uic.yonsei.ac.kr/undergraduate.php?mid=m02_03_01"}]}
```

### Sweden

**Jönköping University** — `se-ju`; overviews.

```json
{"priority":3,"institution_key":"se-ju","name":"Jönköping University","country":"Sweden","country_code":"se","website":"https://ju.se/en","admissions_url":"https://ju.se/en/study-at-ju/application-and-admission.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes.html","ib_summary_unverified":"Its own IB table: English B SL meets English 6; Maths AA SL at 3 or AI SL at 4 meets Maths 3c; sciences at 4. Final-year IB students get conditional offers on predicted grades via JU Direct."},"targets":[{"name":"Bachelor in International Economics","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/international-economics-autumn-2027-ku103.html"},{"name":"Bachelor in International Management","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/international-management-autumn-2027-ku101.html"},{"name":"Bachelor in International Marketing","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/international-marketing-autumn-2027-ku102.html"},{"name":"Graphic Design and Web Development","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/graphic-design-and-web-development-autumn-2027-ku018.html"},{"name":"Industrial Engineering and Management: Sustainable Supply Chain Management","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/industrial-engineering-and-management-sustainable-supply-chain-management-autumn-2027-ku019.html"},{"name":"Mechanical Engineering (BSc)","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/mechanical-engineering-bsc-autumn-2027-ku104.html"},{"name":"Prosthetics and Orthotics, BSc","credential":"BSc","url":"https://ju.se/en/study-at-ju/our-programmes/bachelor-programmes/prosthetics-and-orthotics-bsc-autumn-2027-ku013.html"}]}
```

**Karolinska Institutet** — `se-ki`; overviews.

```json
{"priority":3,"institution_key":"se-ki","name":"Karolinska Institutet","country":"Sweden","country_code":"se","website":"https://ki.se/en","admissions_url":"https://education.ki.se/bachelors-masters-studies","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://education.ki.se/bachelors-masters-studies/apply/apply-for-a-bachelors-programme","ib_summary_unverified":"Biology and Chemistry at grade 4 (3 at HL), and Maths AA SL at 4 or AA/AI HL at 3. A full IB Diploma gives general entry and IB English meets English 6. University Admissions assesses the IB, not KI."},"targets":[{"name":"Bachelor's Programme in Biomedicine","credential":"Bachelor of Medical Science","url":"https://education.ki.se/bachelors-masters-studies/programmes-and-courses/bachelors-programme-in-biomedicine"}]}
```

**KTH Royal Institute of Technology** — `se-kth`; overviews.

```json
{"priority":3,"institution_key":"se-kth","name":"KTH Royal Institute of Technology","country":"Sweden","country_code":"se","website":"https://www.kth.se/en","admissions_url":"https://www.kth.se/en/studies/bachelor","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.kth.se/en/studies/bachelor","ib_summary_unverified":"National rules apply: IB English meets English 6, and subjects count at grade 4 (3 at HL sciences). KTH wants complete school documents: no conditional admission, no predicted grades."},"targets":[{"name":"Information and Communication Technology","credential":"BSc","url":"https://www.kth.se/en/studies/bachelor/information-communication-technology/bsc-information-and-communication-technology-1.437049"}]}
```

**Linköping University** — `se-liu`; overviews.

```json
{"priority":3,"institution_key":"se-liu","name":"Linköping University","country":"Sweden","country_code":"se","website":"https://liu.se/en","admissions_url":"https://liu.se/en/education/application-and-admission","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://liu.se/en/education/degree-studies","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Bachelor's Programme in Experimental and Industrial Biomedicine","credential":"BSc","url":"https://liu.se/en/education/program/mgmb2"}]}
```

**Luleå University of Technology** — `se-ltu`; overviews.

```json
{"priority":3,"institution_key":"se-ltu","name":"Luleå University of Technology","country":"Sweden","country_code":"se","website":"https://www.ltu.se/en","admissions_url":"https://www.ltu.se/en/education","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ltu.se/en/education/master-and-bachelor-programmes/bachelor-programmes","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Computer Game Development and Programming","credential":"Bachelor (180 credits)","campus":"Skellefteå","url":"https://www.ltu.se/en/education/programme/tkdpg-computer-game-development-and-programming"},{"name":"Bachelor Programme in Computer Graphics for Games and Film","credential":"Bachelor (180 credits)","campus":"Skellefteå","url":"https://www.ltu.se/en/education/programme/tkdsg-bachelor-programme-in-computer-graphics-for-games-and-film"},{"name":"Bachelor Programme in Computer Game Design","credential":"Bachelor (180 credits)","campus":"Skellefteå","url":"https://www.ltu.se/en/education/programme/tksdg-bachelor-programme-in-computer-game-design"},{"name":"Bachelor Programme in Mineral Resource Engineering","credential":"BSc","campus":"Luleå","url":"https://www.ltu.se/en/education/programme/tkhmg-bachelor-programme-in-mineral-resource-engineering"},{"name":"Bachelor Programme in Music (Classical Musician, Composition, Church Music)","credential":"BFA","campus":"Piteå","url":"https://www.ltu.se/en/education/programme/kkmug-bachelor-programme-in-music"}]}
```

**Lund University** — `se-lu`; overviews.

```json
{"priority":3,"institution_key":"se-lu","name":"Lund University","country":"Sweden","country_code":"se","website":"https://www.lunduniversity.lu.se/","admissions_url":"https://www.lunduniversity.lu.se/study/admission-degree-studies/entry-requirements","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":5,"faculty_count":0,"programmes":[],"handoff_url":"https://www.lunduniversity.lu.se/study/study-opportunities-lund-university/bachelors-degree-studies","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Biomedicine","credential":"BSc","url":"https://www.lunduniversity.lu.se/study/biomedicine-bachelors-programme-MGBIM"},{"name":"Economy and Society","credential":"BSc","url":"https://www.lunduniversity.lu.se/study/economy-and-society-bachelors-programme-EGESO"},{"name":"Sciences, Mathematics","credential":"BSc","url":"https://www.lunduniversity.lu.se/study/sciences-mathematics-NGNAT-ENMA"},{"name":"Sciences, Physics","credential":"BSc","url":"https://www.lunduniversity.lu.se/study/sciences-physics-NGNAT-ENFY"},{"name":"Sciences, Physical Geography and Ecosystem Science","credential":"BSc","url":"https://www.lunduniversity.lu.se/study/sciences-physical-geography-and-ecosystem-science-NGNAT-INES"}]}
```

**Malmö University** — `se-mau`; overviews.

```json
{"priority":3,"institution_key":"se-mau","name":"Malmö University","country":"Sweden","country_code":"se","website":"https://mau.se/en/","admissions_url":"https://mau.se/en/study-education/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":6,"faculty_count":0,"programmes":[],"handoff_url":"https://mau.se/en/education/bachelors-studies/","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry and covers the English 6 and Civics 1b these programmes ask for: no extra subjects."},"targets":[{"name":"European Studies - Politics, Societies and Cultures, Bachelor's Programme","credential":"BA","url":"https://mau.se/en/study-education/programme/hgpsk/"},{"name":"Human Rights","credential":"BA","url":"https://mau.se/en/study-education/programme/sgmre/"},{"name":"Interaction Design","credential":"BSc","url":"https://mau.se/en/study-education/programme/tgide/"},{"name":"International Migration and Ethnic Relations","credential":"BA","url":"https://mau.se/en/study-education/programme/sgime/"},{"name":"International Relations","credential":"BA","url":"https://mau.se/en/study-education/programme/sgine/"},{"name":"Peace and Conflict Studies","credential":"BA","url":"https://mau.se/en/study-education/programme/sgfre/"}]}
```

**Stockholm School of Economics** — `se-sse`; overviews.

```json
{"priority":3,"institution_key":"se-sse","name":"Stockholm School of Economics","country":"Sweden","country_code":"se","website":"https://www.hhs.se/","admissions_url":"https://www.hhs.se/education/bachelor/bachelor-admissions/","ib_url":"https://www.hhs.se/education/bachelor/bachelor-admissions/international-applicant/","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":2,"faculty_count":0,"programmes":[],"handoff_url":"https://www.hhs.se/education/bachelor/","ib_summary_unverified":"At least 31 points, though 39 or more is usually needed; a pass in English B SL and Maths AI SL; and SAT 1300, ACT 28 or ITB-Business 112. Predicted IB grades are accepted."},"targets":[{"name":"Business and Economics","credential":"BSc","url":"https://www.hhs.se/education/bachelor/business-economics/"},{"name":"Retail Management","credential":"BSc","url":"https://www.hhs.se/education/bachelor/retail-management/"}]}
```

**Stockholm University** — `se-su`; overviews.

```json
{"priority":3,"institution_key":"se-su","name":"Stockholm University","country":"Sweden","country_code":"se","website":"https://www.su.se/english/","admissions_url":"https://www.su.se/english/education/how-to-apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://www.su.se/english/education/top-reasons-to-choose-su/our-courses-and-programmes","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Bachelor's Programme in International Business and Politics","credential":"BSc","url":"https://www.su.se/english/education/course-catalogue/si/sifpk"},{"name":"Bachelor’s Programme in Business, Ethics and Sustainability","credential":"BSc","url":"https://www.su.se/english/education/course-catalogue/sf/sfehk"},{"name":"International Bachelor's Programme in Political Science and Regional Studies","credential":"BSc","url":"https://www.su.se/english/education/course-catalogue/sp/spock"},{"name":"Bachelor's Programme in Latin American Studies with specialization in Spanish","credential":"BA","url":"https://www.su.se/english/education/course-catalogue/sp/hlask-span"},{"name":"Bachelor's Programme in Latin American Studies with specialization in Portuguese","credential":"BA","url":"https://www.su.se/english/education/course-catalogue/hl/hlask-port"},{"name":"Bachelor's Programme in Middle Eastern and North African Studies","credential":"BA","url":"https://www.su.se/english/education/course-catalogue/hm/hmesk"},{"name":"Bachelor's Programme in Earth Science, Distance Learning","credential":"BSc","campus":"Online (distance learning)","url":"https://www.su.se/english/education/course-catalogue/ng/ngdjk"}]}
```

**Swedish University of Agricultural Sciences** — `se-slu`; overviews.

```json
{"priority":3,"institution_key":"se-slu","name":"Swedish University of Agricultural Sciences","country":"Sweden","country_code":"se","website":"https://www.slu.se/en/","admissions_url":"https://www.slu.se/en/study/programmes-courses/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.slu.se/en/study/programmes-courses/bachelors-programmes/","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Forest and Landscape (BSc)","credential":"BSc","campus":"Alnarp","url":"https://www.slu.se/en/study/programmes-courses/bachelors-programmes/forest-and-landscape/"}]}
```

**Umeå University** — `se-umu`; overviews.

```json
{"priority":3,"institution_key":"se-umu","name":"Umeå University","country":"Sweden","country_code":"se","website":"https://www.umu.se/en/","admissions_url":"https://www.umu.se/en/education/application-and-admission/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":4,"faculty_count":0,"programmes":[],"handoff_url":"https://www.umu.se/en/education/studies/bachelors-programmes/","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Bachelor Programme in Industrial Design","credential":"BFA","url":"https://www.umu.se/en/education/programmes/bachelor-programme-in-industrial-design/"},{"name":"Bachelor of Science Programme in Life Science","credential":"BSc","url":"https://www.umu.se/en/education/programmes/bachelor-of-science-programme-in-life-science/"},{"name":"International Business and Economics Programme","credential":"Bachelor of Science in Business and Economics","url":"https://www.umu.se/en/education/programmes/international-business-and-economics-programme/"},{"name":"Architecture Programme","credential":"Master of Architecture","url":"https://www.umu.se/en/education/programmes/architecture-program/"}]}
```

**University of Gothenburg** — `se-gu`; overviews.

```json
{"priority":3,"institution_key":"se-gu","name":"University of Gothenburg","country":"Sweden","country_code":"se","website":"https://www.gu.se/en","admissions_url":"https://www.gu.se/en/study-in-gothenburg/apply","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":11,"faculty_count":0,"programmes":[],"handoff_url":"https://www.gu.se/en/study-in-gothenburg/programs-and-courses/bachelors-programs","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Bachelor's Program in Business and Economics","credential":"BSc","url":"https://www.gu.se/en/study-gothenburg/bachelors-programme-in-business-and-economics-s1eka"},{"name":"Bachelor's Program in Computer Science and AI","credential":"BSc","url":"https://www.gu.se/en/study-gothenburg/bachelors-programme-in-computer-science-and-ai-n1cai"},{"name":"Bachelor's Program in International Relations","credential":"BSc","url":"https://www.gu.se/en/study-gothenburg/bachelors-programme-in-international-relations-s1int"},{"name":"Bachelor's Program in Software Engineering and Management","credential":"BSc","url":"https://www.gu.se/en/study-gothenburg/software-engineering-and-management-bachelors-programme-n1sof"},{"name":"Bachelor of Fine Arts in Contemporary Traditions in Music","credential":"BFA","url":"https://www.gu.se/en/study-gothenburg/bachelor-of-fine-arts-in-contemporary-traditions-in-music-k1tra"},{"name":"Bachelor's Programme in Music, with a specialization in Classical Performance","credential":"BMus","url":"https://www.gu.se/en/study-gothenburg/bachelors-programme-in-music-with-a-specialization-in-classical-performance-k1kla"},{"name":"Bachelor's Programme in Music, with a specialization in Improvisation Performance","credential":"BMus","url":"https://www.gu.se/en/study-gothenburg/bachelors-programme-in-music-with-a-specialization-in-improvisation-performance-k1imp"},{"name":"Bachelor of Fine Arts in Opera","credential":"BFA","url":"https://www.gu.se/en/study-gothenburg/bachelor-of-fine-arts-in-opera-k1ope"},{"name":"BFA Programme in Craft with Specialisation in Crafting Futures","credential":"BFA","campus":"Dals Långed","url":"https://www.gu.se/en/study-gothenburg/bfa-programme-in-craft-with-specialisation-in-crafting-futures-k1crf"},{"name":"BFA Programme in Metal Art","credential":"BFA","campus":"Dals Långed","url":"https://www.gu.se/en/study-gothenburg/bfa-programme-in-metal-art-k1mgg"},{"name":"BFA Programme in Wood Oriented Furniture Design","credential":"BFA","campus":"Dals Långed","url":"https://www.gu.se/en/study-gothenburg/bfa-programme-in-wood-oriented-furniture-design-k1mdt"}]}
```

**Uppsala University** — `se-uu`; overviews.

```json
{"priority":3,"institution_key":"se-uu","name":"Uppsala University","country":"Sweden","country_code":"se","website":"https://www.uu.se/en","admissions_url":"https://www.uu.se/en/study/bachelors-studies/application/entry-requirements","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-30","programme_count":8,"faculty_count":0,"programmes":[],"handoff_url":"https://www.uu.se/en/study/bachelors-studies/bachelors-programmes","ib_summary_unverified":"No IB page of its own; the national rules apply. A full IB Diploma gives general entry, and IB English meets English 6. Subjects count at grade 4 (3 at HL Biology, Chemistry, Physics)."},"targets":[{"name":"Bachelor's Programme in Egyptology","credential":"BA","url":"https://www.uu.se/en/study/programme/bachelors-programme-egyptology"},{"name":"Bachelor's Programme in Energy Transition – Sustainability and Leadership","credential":"BSc","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-energy-transition-sustainability-and-leadership"},{"name":"Bachelor's Programme in Game Design and Graphics","credential":"BA","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-game-design-and-graphics"},{"name":"Bachelor's Programme in Game Design and Level Design","credential":"BA","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-game-design-and-level-design"},{"name":"Bachelor's Programme in Game Design and Programming","credential":"BA","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-game-design-and-programming"},{"name":"Bachelor's Programme in Game Design and Project Management","credential":"BA","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-game-design-and-project-management"},{"name":"Bachelor's Programme in Holocaust and Genocide Studies","credential":"BA","url":"https://www.uu.se/en/study/programme/bachelors-programme-holocaust-and-genocide-studies"},{"name":"Bachelor's Programme in Leadership – Quality Management – Improvement","credential":"BSc","campus":"Visby","url":"https://www.uu.se/en/study/programme/bachelors-programme-leadership-quality-management-improvement"}]}
```

### Switzerland

**EHL Hospitality Business School** — `ch-ehl`; overviews.

```json
{"priority":3,"institution_key":"ch-ehl","name":"EHL Hospitality Business School","country":"Switzerland","country_code":"ch","website":"https://www.ehl.edu/","admissions_url":"https://www.ehl.edu/en/study/bachelor-degree-in-hospitality/admissions-and-fees","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":1,"faculty_count":0,"programmes":[],"handoff_url":"https://www.ehl.edu/en/study/bachelor-degree-in-hospitality/admissions-and-fees","ib_summary_unverified":"Full IB Diploma, 28/42 minimum with priority from 30 (September 2026 to February 2029 intakes). Maths, a natural science and an HL in business, economics, science or maths are preferred. IB in English meets the C1 rule."},"targets":[{"name":"Bachelor in International Hospitality Management","credential":"BSc","url":"https://www.ehl.edu/en/study/bachelor-degree-in-hospitality"}]}
```

**EU Business School - Geneva campus** — `ch-eu-business-school`; overviews.

```json
{"priority":3,"institution_key":"ch-eu-business-school","name":"EU Business School - Geneva campus","country":"Switzerland","country_code":"ch","website":"https://www.euruni.edu/","admissions_url":"https://www.euruni.edu/en/Programs/Admissions.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":7,"faculty_count":0,"programmes":[],"handoff_url":"https://www.euruni.edu/en/Programs/Bachelor-s.html","ib_summary_unverified":"Its admission page lists an IB Diploma with at least 24 points. Bachelor's also need English at B2 (IELTS 6.0, TOEFL 80) unless you are a native speaker or equivalent, two references and an essay."},"targets":[{"name":"Bachelor of Business Administration","credential":"BBA","url":"https://www.euruni.edu/en/Bachelor-s/BBA-Bachelor-of-Business-Administration-Geneva.html"},{"name":"Bachelor of Arts in International Relations","credential":"BA","url":"https://www.euruni.edu/en/Bachelor-s/International-Relations-Geneva.html"},{"name":"Bachelor of Arts in Artificial Intelligence for Business","credential":"BA","url":"https://www.euruni.edu/en/Bachelor-s/Artificial-Intelligence-for-Business-Geneva.html"},{"name":"Bachelor of Arts in Sports Management","credential":"BA","url":"https://www.euruni.edu/en/Bachelor-s/Sports-Management-Geneva.html"},{"name":"Bachelor of Arts in Digital Business, Design & Innovation","credential":"BA","url":"https://www.euruni.edu/en/Bachelor-s/Digital-Business-Design-Innovation-Geneva.html"},{"name":"Bachelor of Arts in Leisure & Tourism Management","credential":"BA","url":"https://www.euruni.edu/en/Bachelor-s/Leisure-Tourism-Management-Geneva.html"},{"name":"Bachelor of Science in Business Finance","credential":"BSc","url":"https://www.euruni.edu/en/Bachelor-s/Bachelor-of-Science-in-Business-Finance-Geneva.html"}]}
```

**Universita della Svizzera italiana** — `ch-usi`; overviews.

```json
{"priority":3,"institution_key":"ch-usi","name":"Universita della Svizzera italiana","country":"Switzerland","country_code":"ch","website":"https://www.usi.ch/en","admissions_url":"https://www.usi.ch/en/education/bachelor/admission","ib_url":"https://www.usi.ch/en/education/bachelor/admission","mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.usi.ch/en/education/bachelor/bachelor-degrees-at-a-glance","ib_summary_unverified":"swissuniversities IB rule: 32/42 (2026/27), six subjects, three HL incl. maths or a science; Psychology, ESS, Global Politics and the arts don't count. Communication and Philosophy also need Italian."},"targets":[{"name":"Bachelor of Science in Informatics","credential":"BSc","url":"https://www.usi.ch/en/education/bachelor/informatics"},{"name":"Bachelor in Data Science","credential":"BSc","url":"https://www.usi.ch/en/education/bachelor/data-science"},{"name":"Bachelor in Economics (English track)","credential":"BA","url":"https://www.usi.ch/en/education/bachelor/economics"}]}
```

**University of St. Gallen** — `ch-hsg`; overviews.

```json
{"priority":3,"institution_key":"ch-hsg","name":"University of St. Gallen","country":"Switzerland","country_code":"ch","website":"https://www.unisg.ch/en/","admissions_url":"https://www.unisg.ch/en/studying/admission/admission-bachelor/admission-to-a-bachelors-degree-programme/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"listed","retrieved":"2026-09-26","programme_count":3,"faculty_count":0,"programmes":[],"handoff_url":"https://www.unisg.ch/en/studying/programmes/bachelor/assessment-year-in-economics-law-and-international-affairs/","ib_summary_unverified":"32/42; six subjects in HSG's groups, three HL incl. maths or a science. Psychology, ESS, Visual Arts and others don't count. Non-Swiss applicants sit HSG's online test, and a video interview if the test calls for it."},"targets":[{"name":"Major in Business Administration (BWL)","credential":"BA","url":"https://www.unisg.ch/en/studying/programmes/bachelor/major-in-business-administration-bwl/"},{"name":"Major in Economics (VWL)","credential":"BA","url":"https://www.unisg.ch/en/studying/programmes/bachelor/major-in-economics/"},{"name":"Major in International Affairs (BIA)","credential":"BA","url":"https://www.unisg.ch/en/studying/programmes/bachelor/major-international-affairs-bia/"}]}
```

**Webster University Geneva** — `ch-webster-geneva`; overviews.

```json
{"priority":3,"institution_key":"ch-webster-geneva","name":"Webster University Geneva","country":"Switzerland","country_code":"ch","website":"https://geneva.webster.edu/","admissions_url":"https://geneva.webster.edu/admissions/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-26","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://geneva.webster.edu/academics/undergraduate.php","ib_summary_unverified":"IB Diploma with 24 points (32+ for the Scholars Program). English waived with English A HL 4, English A SL 5, English B HL 5 or English B SL 6, or possibly for an English-medium school."},"targets":[{"name":"International Relations","credential":"BA","url":"https://geneva.webster.edu/academics/ba-international-relations.php"},{"name":"Finance","credential":"BS","url":"https://geneva.webster.edu/academics/bs-finance.php"},{"name":"Computer Science","credential":"BS","url":"https://geneva.webster.edu/academics/bs-computer-science.php"}]}
```

### United Kingdom

**City St George's, University of London** — `gb-city-st-george-s`; overviews.

```json
{"priority":3,"institution_key":"gb-city-st-george-s","name":"City St George's, University of London","country":"United Kingdom","country_code":"gb","website":"https://www.citystgeorges.ac.uk/","admissions_url":"https://www.citystgeorges.ac.uk/prospective-students/apply/how-to-apply/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://www.citystgeorges.ac.uk/prospective-students/courses/undergraduate","ib_summary_unverified":"Each course sets its own IB offer, from 31 points with SL English 5 and SL Maths 4 (Journalism) to 36 with 18 at HL, including 6 in Biology and Chemistry (Medicine)."},"targets":[{"name":"Medicine MBBS","credential":"MBBS","url":"https://www.citystgeorges.ac.uk/prospective-students/courses/undergraduate/medicine"},{"name":"Journalism","credential":"BA (Hons)","url":"https://www.citystgeorges.ac.uk/prospective-students/courses/undergraduate/journalism/2027"},{"name":"Optometry","credential":"MOptom (Hons)","url":"https://www.citystgeorges.ac.uk/prospective-students/courses/undergraduate/optometry"}]}
```

**Durham University** — `gb-durham`; overviews.

```json
{"priority":3,"institution_key":"gb-durham","name":"Durham University","country":"United Kingdom","country_code":"gb","website":"https://www.durham.ac.uk/","admissions_url":"https://www.durham.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.durham.ac.uk/search/?searchstax[query]=*&searchstax[page]=1&searchstax[facets][0]=tabs:sectiontype_ss:course&searchstax[facets][1]=and:DegreeCourseLevel_ss:Undergraduate&searchstax[model]=main%20site","ib_summary_unverified":"Offers are a total including three HL grades, from 31 (555) to 38 (776); an AAA course asks 36 with 666 at HL. Some courses name HL subjects and grades."},"targets":[{"name":"Natural Sciences","credential":"BSc (Hons)","url":"https://www.durham.ac.uk/study/courses/natural-sciences-cfg0/september-2027/"},{"name":"Archaeology","credential":"BA (Hons)","url":"https://www.durham.ac.uk/study/courses/archaeology-f400/september-2027/"},{"name":"Law","credential":"LLB (Hons)","url":"https://www.durham.ac.uk/study/courses/law-m101/september-2027/"}]}
```

**Imperial College London** — `gb-imperial`; overviews.

```json
{"priority":3,"institution_key":"gb-imperial","name":"Imperial College London","country":"United Kingdom","country_code":"gb","website":"https://www.imperial.ac.uk/","admissions_url":"https://www.imperial.ac.uk/study/apply/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.imperial.ac.uk/study/courses/?courseType=undergraduate","ib_summary_unverified":"38–42 points overall with 6–7 in the relevant HL subjects; many courses ask 7 in HL Maths. English A at grade 4 (SL or HL), or English B at SL 6 or HL 5, meets the English requirement."},"targets":[{"name":"Aeronautical Engineering","credential":"MEng","url":"https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/"},{"name":"Medicine","credential":"MBBS/BSc","url":"https://www.imperial.ac.uk/study/courses/undergraduate/medicine/"},{"name":"Chemistry","credential":"MSci","url":"https://www.imperial.ac.uk/study/courses/undergraduate/chemistry-msci/"}]}
```

**King's College London** — `gb-kcl`; overviews.

```json
{"priority":3,"institution_key":"gb-kcl","name":"King's College London","country":"United Kingdom","country_code":"gb","website":"https://www.kcl.ac.uk/","admissions_url":"https://www.kcl.ac.uk/study/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":9,"programmes":[],"handoff_url":"https://www.kcl.ac.uk/study/undergraduate/courses","ib_summary_unverified":"Offers give a total including ToK/EE or an aggregate of three HL grades, from 32 or HL 15 up to 40 or HL 21; AAA courses ask 36 or HL 18. English A at HL 4 or SL 5 meets the English requirement."},"targets":[{"name":"War Studies","credential":"BA","url":"https://www.kcl.ac.uk/study/undergraduate/courses/war-studies-ba"},{"name":"Law LLB","credential":"LLB","url":"https://www.kcl.ac.uk/study/undergraduate/courses/law-llb"},{"name":"Neuroscience","credential":"BSc","url":"https://www.kcl.ac.uk/study/undergraduate/courses/neuroscience-bsc"}]}
```

**Lancaster University** — `gb-lancaster`; overviews.

```json
{"priority":3,"institution_key":"gb-lancaster","name":"Lancaster University","country":"United Kingdom","country_code":"gb","website":"https://www.lancaster.ac.uk/","admissions_url":"https://www.lancaster.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.lancaster.ac.uk/study/undergraduate/courses/","ib_summary_unverified":"Offers run from 30 points with 15 from three HL subjects to 36 with 16, e.g. 32 with 16 at HL for International Relations; a required subject usually needs HL 6. IB English at SL or HL 5 proves your English."},"targets":[{"name":"Medicine and Surgery","credential":"MBChB","url":"https://www.lancaster.ac.uk/study/undergraduate/courses/medicine-and-surgery-mbchb-a100/2027/"},{"name":"Environmental Science","credential":"BSc Hons","url":"https://www.lancaster.ac.uk/study/undergraduate/courses/environmental-science-bsc-hons-f750/2027/"},{"name":"Linguistics","credential":"BA Hons","url":"https://www.lancaster.ac.uk/study/undergraduate/courses/linguistics-ba-hons-q100/2027/"}]}
```

**London School of Economics and Political Science** — `gb-lse`; overviews.

```json
{"priority":3,"institution_key":"gb-lse","name":"London School of Economics and Political Science","country":"United Kingdom","country_code":"gb","website":"https://www.lse.ac.uk/","admissions_url":"https://www.lse.ac.uk/study-at-lse/Undergraduate","ib_url":"https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply/entry-requirements","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://www.lse.ac.uk/programmes/search-courses?f.Study+Type%7Ctype=undergraduate&studyType=b6732bf8-36e3-4461-b325-c925ad870cb4","ib_summary_unverified":"37 points (666 at HL) to 39 (766). HL Maths AA is required for 8 maths-heavy degrees, e.g. Data Science and Actuarial Science. English A at HL (any grade) or SL 6, or English B HL 7, meets English."},"targets":[{"name":"Economics","credential":"BSc","url":"https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-economics"},{"name":"International Relations","credential":"BSc","url":"https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-international-relations"},{"name":"LLB Bachelor of Laws","credential":"LLB","url":"https://www.lse.ac.uk/study-at-lse/undergraduate/llb-bachelor-of-laws"}]}
```

**Loughborough University** — `gb-loughborough`; overviews.

```json
{"priority":3,"institution_key":"gb-loughborough","name":"Loughborough University","country":"United Kingdom","country_code":"gb","website":"https://www.lboro.ac.uk/","admissions_url":"https://www.lboro.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":8,"programmes":[],"handoff_url":"https://www.lboro.ac.uk/study/undergraduate/courses/","ib_summary_unverified":"The full Diploma with at least three HL subjects; each course sets points and HL grades, e.g. 34 (6,5,5 HL) for Industrial Design and 37–38 (6,6,6–7,6,6 HL) for Sport and Exercise Science."},"targets":[{"name":"Sport and Exercise Science","credential":"BSc (Hons)","url":"https://www.lboro.ac.uk/study/undergraduate/courses/sport-and-exercise-science/"},{"name":"Industrial Design","credential":"BA (Hons)","url":"https://www.lboro.ac.uk/study/undergraduate/courses/industrial-design/"},{"name":"Aeronautical Engineering","credential":"BEng (Hons)","url":"https://www.lboro.ac.uk/study/undergraduate/courses/aeronautical-engineering-beng/"}]}
```

**Queen Mary University of London** — `gb-qmul`; overviews.

```json
{"priority":3,"institution_key":"gb-qmul","name":"Queen Mary University of London","country":"United Kingdom","country_code":"gb","website":"https://www.qmul.ac.uk/","admissions_url":"https://www.qmul.ac.uk/undergraduate/apply/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.qmul.ac.uk/undergraduate/coursefinder/","ib_summary_unverified":"Each course sets points and three HL grades, e.g. 34 with 6,6,5 (Applied Artificial Intelligence) or 36 with 6,6,6 (Accounting and Finance, Economics); some also ask a minimum SL Maths grade."},"targets":[{"name":"Medicine (5 Year Programme)","credential":"MBBS","url":"https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2027/medicine-5-year-programme/"},{"name":"Applied Artificial Intelligence","credential":"BSc (Hons)","url":"https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2027/applied-artificial-intelligence/"},{"name":"Theatre and Performance","credential":"BA (Hons)","url":"https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2027/theatre-and-performance/"}]}
```

**University College London** — `gb-ucl`; overviews.

```json
{"priority":3,"institution_key":"gb-ucl","name":"University College London","country":"United Kingdom","country_code":"gb","website":"https://www.ucl.ac.uk/","admissions_url":"https://www.ucl.ac.uk/study/prospective-students/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":10,"programmes":[],"handoff_url":"https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses","ib_summary_unverified":"Offers run from 34 points (16 at HL) to 40 (20 at HL), no HL below 5. English A: 5 for English Levels 1–2, 6 for Level 3, HL 6 or SL 7 for Level 4, HL 7 for Level 5."},"targets":[{"name":"Arts and Sciences (Societies) BASc","credential":"BASc","url":"https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/arts-and-sciences-societies-basc"},{"name":"Architecture BSc","credential":"BSc","url":"https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/architecture-bsc"},{"name":"Economics BSc (Econ)","credential":"BSc (Econ)","url":"https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/economics-bsc-econ"}]}
```

**University of Bath** — `gb-bath`; overviews.

```json
{"priority":3,"institution_key":"gb-bath","name":"University of Bath","country":"United Kingdom","country_code":"gb","website":"https://www.bath.ac.uk/","admissions_url":"https://www.bath.ac.uk/topics/undergraduate-study-2027/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.bath.ac.uk/corporate-information/undergraduate-subjects-2027","ib_summary_unverified":"Offers give a total and three HL grades, e.g. 35 with 6,5,5 (Modern Languages) or 36 with 7,6,6 incl. HL Maths 6 (Accounting and Finance). With four HLs, your best three count."},"targets":[{"name":"Sport and Exercise Science","credential":"BSc (Hons)","url":"https://www.bath.ac.uk/courses/undergraduate-2027/sport-exercise-and-health/bsc-sport-and-exercise-science"},{"name":"Integrated Design Engineering","credential":"BEng (Hons)","url":"https://www.bath.ac.uk/courses/undergraduate-2027/mechanical-engineering/beng-integrated-design-engineering"},{"name":"Modern Languages (with study or work abroad)","credential":"BA (Hons)","url":"https://www.bath.ac.uk/courses/undergraduate-2027/modern-languages/ba-modern-languages-with-study-or-work-abroad"}]}
```

**University of Birmingham** — `gb-birmingham`; overviews.

```json
{"priority":3,"institution_key":"gb-birmingham","name":"University of Birmingham","country":"United Kingdom","country_code":"gb","website":"https://www.birmingham.ac.uk/","admissions_url":"https://www.birmingham.ac.uk/study/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://www.birmingham.ac.uk/study/undergraduate/subjects","ib_summary_unverified":"Offers are three HL grades plus a minimum of 32 points: 7,6,6 for A*AA courses, 6,6,6 for AAA, 6,6,5 for AAB, 6,5,5 for ABB. Liberal Arts and Natural Sciences set their own IB offers."},"targets":[{"name":"Medicine and Surgery","credential":"MBChB","url":"https://www.birmingham.ac.uk/study/undergraduate/subjects/medicine-courses/medicine-and-surgery-mbchb"},{"name":"Physics and Astrophysics","credential":"BSc","url":"https://www.birmingham.ac.uk/study/undergraduate/subjects/physics-and-astronomy-courses/physics-astrophysics-bsc"},{"name":"Sport, Exercise and Health Sciences","credential":"BSc","url":"https://www.birmingham.ac.uk/study/undergraduate/subjects/sport-sciences-courses/sport-exercise-and-health-sciences-bsc"}]}
```

**University of Bristol** — `gb-bristol`; overviews.

```json
{"priority":3,"institution_key":"gb-bristol","name":"University of Bristol","country":"United Kingdom","country_code":"gb","website":"https://www.bristol.ac.uk/","admissions_url":"https://www.bristol.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.bristol.ac.uk/study/undergraduate/search/","ib_summary_unverified":"Most courses ask at least 32 points, some up to 40 with 18 at HL; HL Maths AA or AI both count. English A Literature at SL 5 or HL 4 meets English profile E (used by Computer Science)."},"targets":[{"name":"BVSc Veterinary Science","credential":"BVSc","url":"https://www.bristol.ac.uk/study/undergraduate/2027/vet-science/bvsc-veterinary-science/"},{"name":"BEng Aerospace Engineering","credential":"BEng","url":"https://www.bristol.ac.uk/study/undergraduate/2027/aerospace/beng-aerospace-engineering/"},{"name":"BA Liberal Arts","credential":"BA","url":"https://www.bristol.ac.uk/study/undergraduate/2027/liberal-arts/ba-liberal-arts/"}]}
```

**University of Cambridge** — `gb-cambridge`; overviews.

```json
{"priority":3,"institution_key":"gb-cambridge","name":"University of Cambridge","country":"United Kingdom","country_code":"gb","website":"https://www.cam.ac.uk/","admissions_url":"https://www.undergraduate.study.cam.ac.uk/","ib_url":"https://www.undergraduate.study.cam.ac.uk/international-students/international-entry-requirements","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://www.undergraduate.study.cam.ac.uk/courses","ib_summary_unverified":"Minimum offers are 41–42 points out of 45 with 776 at HL. Some colleges ask 777 or a higher total, and you may need a 7 in named subjects; HL subjects count as A levels for subject requirements."},"targets":[{"name":"Natural Sciences","credential":"BA (Hons) and MSci","url":"https://www.undergraduate.study.cam.ac.uk/courses/natural-sciences"},{"name":"Classics","credential":"BA (Hons)","url":"https://www.undergraduate.study.cam.ac.uk/courses/classics"},{"name":"Economics","credential":"BA (Hons)","url":"https://www.undergraduate.study.cam.ac.uk/courses/economics"}]}
```

**University of Edinburgh** — `gb-edinburgh`; overviews.

```json
{"priority":3,"institution_key":"gb-edinburgh","name":"University of Edinburgh","country":"United Kingdom","country_code":"gb","website":"https://www.ed.ac.uk/","admissions_url":"https://study.ed.ac.uk/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://study.ed.ac.uk/programmes/undergraduate-a-z","ib_summary_unverified":"Each degree gives a points total and three HL grades, e.g. 34 with 655 for Ancient History, 37–40 with 666–766 plus HL Maths 5 for Economics. You need at least 5 in SL English unless a degree asks for more."},"targets":[{"name":"Computer Science","credential":"BSc (Hons)","url":"https://study.ed.ac.uk/programmes/undergraduate/57-computer-science"},{"name":"Veterinary Medicine (5-year programme)","credential":"BVM&S","url":"https://study.ed.ac.uk/programmes/undergraduate/356-veterinary-medicine-5-year-programme"},{"name":"Philosophy","credential":"MA (Hons)","url":"https://study.ed.ac.uk/programmes/undergraduate/311-philosophy"}]}
```

**University of Glasgow** — `gb-glasgow`; overviews.

```json
{"priority":3,"institution_key":"gb-glasgow","name":"University of Glasgow","country":"United Kingdom","country_code":"gb","website":"https://www.gla.ac.uk/","admissions_url":"https://www.gla.ac.uk/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.gla.ac.uk/undergraduate/degrees/","ib_summary_unverified":"Points plus three HL grades, e.g. History 34 (6,5,5) with English HL 6 (or a humanities HL 6 and English SL 6); Economics 36 (6,6,5) with HL Maths AA. English A 5 or English B SL 6/HL 5 covers English."},"targets":[{"name":"Veterinary Medicine & Surgery","credential":"BVMS","url":"https://www.gla.ac.uk/undergraduate/degrees/veterinarymedicine/"},{"name":"Computing Science","credential":"BSc (Hons)","url":"https://www.gla.ac.uk/undergraduate/degrees/computingscience/"},{"name":"Marine & Freshwater Biology","credential":"BSc (Hons)","url":"https://www.gla.ac.uk/undergraduate/degrees/marinefreshwaterbiology/"}]}
```

**University of Leeds** — `gb-leeds`; overviews.

```json
{"priority":3,"institution_key":"gb-leeds","name":"University of Leeds","country":"United Kingdom","country_code":"gb","website":"https://www.leeds.ac.uk/","admissions_url":"https://www.leeds.ac.uk/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://courses.leeds.ac.uk/course-search/undergraduate-courses","ib_summary_unverified":"At least 31 points with 15–18 from HL subjects, e.g. 34 with 16 at HL for Ancient History. English A at SL or HL 4, or English B at HL 5 or SL 6, meets the English requirement."},"targets":[{"name":"Medicine and Surgery","credential":"MBChB","url":"https://courses.leeds.ac.uk/5580/medicine-and-surgery-mbchb"},{"name":"Environmental Science","credential":"BSc","url":"https://courses.leeds.ac.uk/3314/environmental-science-bsc"},{"name":"Ancient History","credential":"BA","url":"https://courses.leeds.ac.uk/i988/ancient-history-ba"}]}
```

**University of Manchester** — `gb-manchester`; overviews.

```json
{"priority":3,"institution_key":"gb-manchester","name":"University of Manchester","country":"United Kingdom","country_code":"gb","website":"https://www.manchester.ac.uk/","admissions_url":"https://www.manchester.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://www.manchester.ac.uk/study/undergraduate/courses/2027/","ib_summary_unverified":"Typical offers are 30–39 points with three HL subjects (HL 7 counts as an A-level A*). Some courses, e.g. Maths, Chemical Engineering and Computer Science, accept only HL Maths: Analysis and Approaches."},"targets":[{"name":"Computer Science","credential":"BSc","url":"https://www.manchester.ac.uk/study/undergraduate/courses/2027/00560/bsc-computer-science/"},{"name":"Materials Science and Engineering","credential":"BSc","url":"https://www.manchester.ac.uk/study/undergraduate/courses/2027/09894/bsc-materials-science-and-engineering/"},{"name":"Medicine","credential":"MBChB","url":"https://www.manchester.ac.uk/study/undergraduate/courses/2027/01428/mbchb-medicine/"}]}
```

**University of Nottingham** — `gb-nottingham`; overviews.

```json
{"priority":3,"institution_key":"gb-nottingham","name":"University of Nottingham","country":"United Kingdom","country_code":"gb","website":"https://www.nottingham.ac.uk/","admissions_url":"https://www.nottingham.ac.uk/studywithus/ugstudy/find-uon.html","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":5,"programmes":[],"handoff_url":"https://www.nottingham.ac.uk/studywithus/ugstudy/See_all_courses.html","ib_summary_unverified":"Offers are either a points total or grades in three HL subjects, e.g. 36 points or 7,6,6 at HL for Economics (AAA courses: 34 points). HL 7 counts as an A-level A*, 6 as an A."},"targets":[{"name":"Medicine BMBS","credential":"BMBS","url":"https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Medicine-BMBS.html"},{"name":"Veterinary Medicine and Surgery","credential":"BVM BVS with BVMedSci","url":"https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Veterinary-Medicine-and-Surgery-BVM-BVS-with-BVMedSci-BVMBVS.html"},{"name":"History","credential":"BA (Hons)","url":"https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/History-BA-Hons.html"}]}
```

**University of Oxford** — `gb-oxford`; overviews.

```json
{"priority":3,"institution_key":"gb-oxford","name":"University of Oxford","country":"United Kingdom","country_code":"gb","website":"https://www.ox.ac.uk/","admissions_url":"https://www.ox.ac.uk/admissions/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing","ib_summary_unverified":"38, 39 or 40 points including core, depending on the course, with 6s and 7s at HL; many courses name HL subjects. If your IB is taught in English, Oxford will consider exempting you from an English test."},"targets":[{"name":"Philosophy, Politics and Economics (PPE)","credential":"BA","url":"https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/philosophy-politics-and-economics"},{"name":"Computer Science","credential":"BA or MCompSci","url":"https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/computer-science"},{"name":"English Language and Literature","credential":"BA","url":"https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/english-language-and-literature"}]}
```

**University of St Andrews** — `gb-st-andrews`; overviews.

```json
{"priority":3,"institution_key":"gb-st-andrews","name":"University of St Andrews","country":"United Kingdom","country_code":"gb","website":"https://www.st-andrews.ac.uk/","admissions_url":"https://www.st-andrews.ac.uk/study/undergraduate/apply/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":4,"programmes":[],"handoff_url":"https://www.st-andrews.ac.uk/subjects/course-search/?mod=false&form=master&num.ranks=10&profile=_default&query=!null&collection=standrews~sp-web-course--search&sort=metatitle&f.tabs%7Ctype=Undergraduate","ib_summary_unverified":"36 (HL 6,5,5) to 38 (HL 6,6,6 plus SL 6,6,6), depending on the degree. Where A-level Maths is required, HL Maths AA or AI is accepted. Medicine asks 38 with HL Chemistry."},"targets":[{"name":"International Relations","credential":"MA (Hons)","url":"https://www.st-andrews.ac.uk/subjects/international-relations/international-relations-ma/"},{"name":"Astrophysics","credential":"BSc (Hons)","url":"https://www.st-andrews.ac.uk/subjects/physics/astrophysics-bsc/"},{"name":"Medicine BSc (Hons) A100","credential":"BSc (Hons)","url":"https://www.st-andrews.ac.uk/subjects/medicine/medicine-bsc-a100/"}]}
```

**University of the Arts London** — `gb-ual`; overviews.

```json
{"priority":3,"institution_key":"gb-ual","name":"University of the Arts London","country":"United Kingdom","country_code":"gb","website":"https://www.arts.ac.uk/","admissions_url":"https://www.arts.ac.uk/study-at-ual/apply/undergraduate","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-30","programme_count":3,"faculty_count":6,"programmes":[],"handoff_url":"https://www.arts.ac.uk/search/course-finder?f.Course_level%7Clevel=Undergraduate","ib_summary_unverified":"On 2026-entry pages most BAs asked 24–25 points; applicants who meet that send a digital portfolio. IB English A at HL 5 or SL 6 proves your English."},"targets":[{"name":"Fine Art","credential":"BA (Hons)","url":"https://www.arts.ac.uk/subjects/fine-art/undergraduate/ba-hons-fine-art-chelsea"},{"name":"Graphic Communication Design","credential":"BA (Hons)","url":"https://www.arts.ac.uk/subjects/communication-and-graphic-design/undergraduate/ba-hons-graphic-communication-design-csm"},{"name":"Fashion Design Technology: Womenswear","credential":"BA (Hons)","url":"https://www.arts.ac.uk/subjects/fashion-design/undergraduate/ba-hons-fashion-design-technology-womenswear-lcf"}]}
```

**University of Warwick** — `gb-warwick`; overviews.

```json
{"priority":3,"institution_key":"gb-warwick","name":"University of Warwick","country":"United Kingdom","country_code":"gb","website":"https://warwick.ac.uk/","admissions_url":"https://warwick.ac.uk/study/undergraduate/","ib_url":null,"mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-09-25","programme_count":3,"faculty_count":3,"programmes":[],"handoff_url":"https://warwick.ac.uk/study/undergraduate/courses/","ib_summary_unverified":"Each course sets a total, from 34 (Ancient History) to 39 with 6,6,6 at HL including Maths AA (Mathematics). English A at SL or HL 4 meets English bands A–B; band C needs a 5."},"targets":[{"name":"Economics","credential":"BSc","url":"https://warwick.ac.uk/study/undergraduate/courses/bsc-economics"},{"name":"Computer Science","credential":"BSc","url":"https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science"},{"name":"Ancient History and Classical Archaeology","credential":"BA","url":"https://warwick.ac.uk/study/undergraduate/courses/ba-ancient-history-classical-archaeology"}]}
```

### United States

**University of California, Berkeley** — `us-uc-berkeley`; overviews.

```json
{"priority":3,"institution_key":"us-uc-berkeley","name":"University of California, Berkeley","country":"United States","country_code":"us","website":"https://www.berkeley.edu/","admissions_url":"https://admission.universityofcalifornia.edu/","ib_url":"https://admission.universityofcalifornia.edu/admission-requirements/ap-exam-credits/ib-credits.html","mode":"overview","gaps":["overviews"],"existing":{"scope":"catalogue","retrieved":"2026-10-07","programme_count":2,"faculty_count":4,"programmes":[],"handoff_url":"https://admissions.berkeley.edu/academics/academic-programs-majors-uc-berkeley-minors/","ib_summary_unverified":"No IB points minimum. Berkeley reads your record holistically and counts IB courses and results; IB English A at HL 5 or SL 6 shows English proficiency, otherwise TOEFL 90 or IELTS 6.5."},"targets":[{"name":"Electrical Engineering and Computer Sciences","credential":"Bachelor of Science (BS)","url":"https://eecs.berkeley.edu/academics/undergraduate/eecs-bs/"},{"name":"Spieker Undergraduate Business Program (Haas)","credential":"Bachelor of Science (BS)","url":"https://haas.berkeley.edu/undergrad/programs/spieker/"}]}
```
