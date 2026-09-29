# Issue #66 progress log: pt-ulisboa, pt-nova, pt-uminho

Research agent, started 2026-09-29. Appended as findings land so the work survives a session end.
Standard: list a programme only when an official page says the whole degree is taught in English and
first-year entry is open to EU/IB applicants. `none` needs affirmative evidence.

## Starting state (2026-09-29)

- pt-ulisboa: draft `listed`, four ISEG degrees. Blocked: central ULisboa "Full Programmes" page claims more.
- pt-nova: draft `listed`, NOVA IMS x3 + ENSP Global Public Health. Blocked: 30 NOVA FCT bachelor's "Available soon".
- pt-uminho: draft `none`. Blocked: International Business "most course units are taught in English".

## pt-ulisboa: resolved as `listed`, 4 ISEG programmes (2026-09-29)

Method: fetched (curl) every programme page linked from ULisboa's own catalogues and read the
"Language" field on each.

- Full Programmes page https://www.ulisboa.pt/en/info/full-programmes lists 25 first-cycle entries
  under "BSc - Licenciatura's Degree" (plus Architecture under integrated master). Its intro says
  "Programmes taught entirely in English", but the programme pages it links disagree for most entries.
- Per-programme "Language" field on ulisboa.pt/en/curso/...:
  - `EN`: ISEG Economics (economics-0), Finance (finance-0), Management (management-0), Applied
    Mathematics for Economics and Management (node/21223); Técnico GENI (node/20089, pt-ist record);
    Técnico Civil / Electrical and Computer / Environmental Engineering "(ULisboa and SHU)".
  - `PT/EN`: FA Design; all 16 FLUL (School of Arts and Humanities) entries (African, Archaeology,
    Arts and Humanities, Asian, Classical, Comparative, European, History, History of Art, Language
    Sciences, Languages Literatures and Cultures, Philosophy, Portuguese Studies, Culture and
    Intercultural Communication, Translation, Artistic Studies); FA Architecture integrated master.
- Excluded, with the affirmative reason:
  - FLUL x16: FLUL's own page https://www.letras.ulisboa.pt/pt/ensino/licenciaturas/2123-bachelor-s-degree-programs
    "The language of instruction at the School of Arts and Humanities is Portuguese. However, a growing
    number of classes are also taught in English." Portuguese is the teaching language.
  - FA Design and FA Architecture (MI): ULisboa field `PT/EN`; FA's international first-cycle page
    https://www.fa.ulisboa.pt/index.php/pt/component/sppagebuilder/page/70-candidaturas-estudante-internacional-1-ciclo-pt
    asks for "Documento comprovativo do domínio da língua Portuguesa (B1)". No page says the whole
    degree is English. (graduacao.fa.ulisboa.pt did not respond to fetches.)
  - SHU x3 (Técnico with Shanghai University, 240 ECTS): each page "Access takes place in Shanghai,
    where the selection process takes place"; Environmental Engineering "Vacancies 0". Not open to
    EU/IB first-year applicants in Portugal. (Técnico programmes belong to pt-ist anyway.)
- Completeness: the full ULisboa licenciatura catalogue https://www.ulisboa.pt/en/info/licenciaturas-degree-1st-cycle
  (115 programme pages) and integrated-master catalogue
  https://www.ulisboa.pt/en/info/integrated-masters-degree-1st-and-2nd-cycles (6) were fetched page by
  page. Every page other than the ones above says `Language PT` (two with no parsed field, Nutritional
  Sciences and Técnico Biomedical Engineering, re-read by hand: both `Language PT`).
- ISEG pages re-read today: Economics / Management / AppMath "Language English", Finance "Taught in
  English"; numerus clausus 30 / 60 / 32 / 30 unchanged. ISEG degrees page "In English" tab unchanged.
- Conclusion: the four-ISEG draft is exhaustive for complete English first-year routes outside Técnico.

## pt-nova: resolved as `listed`, 4 programmes unchanged (2026-09-29)

Method: NOVA's catalogue lists a "Teaching language" on every course unit, even where the programme
field says "Available soon". Fetched every bachelor's programme page in
https://guia.unl.pt/en/2026/programs (48 first-cycle + integrated entries) and every course-unit page
linked from it (about 1,500 unit pages), and tallied the unit languages.

- Completeness frame: DGES 2026 index https://www.dges.gov.pt/guias/indest.asp?reg=11 lists 48 NOVA
  national-contest courses: FCM 0901 (2), FCSH 0902 (16), FCT 0903 (22), Nova SBE 0904 (3), NOVA IMS
  0906 (3), ENSP 0908 (1), Law 0911 (1). Every one is accounted for below.
- NOVA FCT (22 CNA bachelor's, programme field "Available soon"): every listed unit on every FCT
  bachelor's is "Teaching language Português" (e.g. Aerospace 37/37, Biochemistry 49/49, Civil 37/37,
  Electrical and Computer 34/34, Mechanical 35/35, Micro and Nano 47/47). Mathematics and Geology for
  Sustainability list units only on their path pages (programs 1294/1295/1296 and 1231/1232): 45/45 and
  37-38/37-38 Português. (Geological Engineering, program 825, is in the catalogue but not in the DGES
  2026 index; its 36 units are Português too.)
  - Computer Science and Engineering (DGES 0903/9119, 170 places, one class): FCT page
    https://www.fct.unl.pt/ensino/curso/licenciatura-em-engenharia-informatica says "Curso lecionado em
    Português e Inglês" (EN page: "offered in both Portuguese and English"); the DI 50-year page
    https://lei50anos.di.fct.unl.pt/ says "totalmente bilíngue, com aulas teóricas e práticas em
    português e em inglês". But all 28 of its catalogue units say "Português"
    (https://guia.unl.pt/en/2026/fct/program/1053), and no page says the degree can be completed in
    English. Not listed; flagged as the one residual FCT question (see "Could not establish").
  - Ocean Studies ("Curso totalmente lecionado em Inglês", FCT page) is DGES 0904/L313, i.e. Nova SBE's
    Ocean Studies, already listed on pt-nova-sbe.
  - Older corroboration: FCT handbook (2022 PDF) "At NOVA School of Science and Technology, all courses
    are taught in Portuguese." Current FCT Erasmus page defers to programme pages.
- NOVA FCSH (16): programme field "Portuguese language" on each; units "Portuguese" wherever listed.
- NOVA Law: "Portuguese. Some Course Units can be taught in English"; units "Available soon". Not listed.
- NOVA Medical School: Nutrition Sciences "PT" (45 PT / 2 EN units); Medicine (integrated) "PT".
- ENSP Global Public Health: programme "English", 29/29 units "EN". Listed (unchanged).
- NOVA IMS (3): re-read today, each FAQ "The course is taught in English."; vacancies 2026-27 45 / 64 /
  45; last entry grades 16,95 / 15,83 / 15,00. Listed (unchanged).
- Nova SBE (3 incl. Ocean Studies): separate record pt-nova-sbe. Portuguese and Business (L113) is for
  non-native speakers of Portuguese: excluded as before.
- Hand-off: no NOVA-wide bachelor's-only list exists. https://www.unl.pt/en/ensino/cursos/ is a script
  page that points to the catalogue. Kept the catalogue (bachelor's section first).

## pt-uminho: International Business resolved as not an English route (2026-09-29)

- EEG page https://www.eeg.uminho.pt/en/study/Licenciaturas/Pages/international-business.aspx:
  "the language of instruction in most of the course units is English". 60 places (DGES 1000/9785).
- Each UC in its "Study Plan" opens (ASP.NET postback on the same page) a UC sheet with "Language of
  instruction". Read all 43 (script-driven postbacks, 2026-09-29). Mandatory UCs taught in
  **Portuguese**: Calculus for Economics and Management (code 1233, "Português"), Linear Algebra (1311),
  Microeconomics I (1234), Evolution of Management Thought (10838), Financial Accounting I (1315),
  Macroeconomics I (1239), International Tax Law (1416), Portuguese and European Economics (9739).
  "Portuguese/English": Econometrics I, Management Accounting I, Principles of Corporate Finance,
  International Marketing, Logistics, Strategic Management. "English": International Trade, Ethics and
  Social Responsibility, International Financial Management, International Negotiation, Political
  Economics of International Business. Blank field: Data Analysis and Programming, Introduction
  Corporate Law, Statistics, Introduction to Organisational Behaviour, International Monetary
  Economics, the project and the language options.
- Conclusion: at least eight compulsory units (48 ECTS) are Portuguese-only, so there is no complete
  English route. Excluded, with affirmative evidence.

## Record edits applied (2026-09-29)

- pt-ulisboa.json: retrieved 2026-09-29; summary now names Técnico's GENI as the other English degree;
  the redundant EU/EEA note (already in `ib`) replaced by a note that the Full Programmes page's
  humanities and design entries are Portuguese-taught; six sources added (Full Programmes, both
  catalogues, FLUL language statement, FA international page, one SHU page). Programmes unchanged.
- pt-nova.json: retrieved 2026-09-29; the redundant EU/EEA note replaced by the Computer Science and
  Engineering note; four sources added (DGES index, FCT bachelor's page, FCT LEI page, LEI catalogue
  page). Programmes and hand-off unchanged.
- `npm run validate` and `node scripts/check-schools.mjs`: pass (0 failing).

## pt-uminho: university-wide check (in progress)

- Central catalogue (2026/2027, "em atualização") lists 61 first-cycle + integrated master's courses
  over 4 pages; the list and each course's detail URL (CatalogoCursoDetail.aspx?itemId=...&catId=17)
  were captured for 52 of them before www.uminho.pt began returning HTTP 500 (~2026-09-29, evening).
  School sites (e.g. eeg.uminho.pt) stayed up.
- Plan: per course, open the first compulsory year-1 UC sheets and read "Língua de ensino"; one
  compulsory Portuguese-only UC is enough to rule a course out.

- First compulsory year-1 UC sheet with "Língua de instrução: Português/Portuguesa" found for 34 courses:
  - Licenciatura em Administração Pública (itemId=5979&catId=17): Economia Política
  - Licenciatura em Arqueologia (itemId=6028&catId=17): Civilização Grega
  - Licenciatura em Biologia Aplicada (itemId=5949&catId=17): Biologia Celular
  - Licenciatura em Biologia e Geologia (itemId=6118&catId=17): Biologia Molecular e da Célula
  - Licenciatura em Bioquímica (itemId=5950&catId=17): Biologia Celular
  - Licenciatura em Ciência de Dados (itemId=6192&catId=17): Algoritmia e Programação
  - Licenciatura em Ciência Política (itemId=6094&catId=17): Economia Política
  - Licenciatura em Ciências da Computação (itemId=5951&catId=17): Álgebra Linear CC
  - Licenciatura em Ciências do Ambiente e Sustentabilidade Global (itemId=6497&catId=17): Biologia Molecular e da Célula
  - Licenciatura em Contabilidade (itemId=5980&catId=17): Contabilidade Financeira I
  - Licenciatura em Direito (itemId=5969&catId=17): Direito Constitucional
  - Licenciatura em Direito (Pós-Laboral) (itemId=5970&catId=17): Direito Constitucional
  - Licenciatura em Economia (itemId=5981&catId=17): Álgebra Linear
  - Licenciatura em Educação Básica (itemId=6035&catId=17): Ciências da Natureza I
  - Licenciatura em Engenharia Aeroespacial (itemId=6191&catId=17): Ambiente e Energia
  - Licenciatura em Engenharia Física (itemId=6167&catId=17): Introdução à Física Experimental
  - Licenciatura em Engenharia Mecânica (itemId=6143&catId=17): Ambiente e Energia
  - Licenciatura em Estatística Aplicada (itemId=5952&catId=17): Algoritmia e Programação
  - Licenciatura em Estudos Culturais (itemId=6098&catId=17): Estudos Clássicos 1
  - Licenciatura em Estudos Portugueses (itemId=6036&catId=17): Introdução aos Estudos da Linguagem
  - Licenciatura em Filosofia (itemId=6037&catId=17): Antropologia Filosófica
  - Licenciatura em Física (itemId=6106&catId=17): Introdução à Física Experimental
  - Licenciatura em Geografia e Planeamento (itemId=6030&catId=17): Expressão Gráfica e Cartografia
  - Licenciatura em Geologia (itemId=6099&catId=17): Geologia Geral
  - Licenciatura em Gestão (itemId=5982&catId=17): Álgebra Linear
  - Licenciatura em História (itemId=6031&catId=17): Civilização Grega
  - Licenciatura em Línguas Aplicadas (itemId=6038&catId=17): Linguística Descritiva 1
  - Licenciatura em Línguas e Literaturas Europeias (itemId=6039&catId=17): Tecnologias de Comunicação em Humanidades
  - Licenciatura em Marketing (itemId=6132&catId=17): Introdução à Gestão
  - Licenciatura em Matemática (itemId=5953&catId=17): Álgebra Linear I
  - Licenciatura em Música (itemId=6040&catId=17): Fundamentos Teóricos da Música I
  - Licenciatura em Negócios Internacionais (itemId=5983&catId=17): Álgebra Linear
  - Licenciatura em Optometria e Ciências da Visão (itemId=5954&catId=17): Álgebra Linear e Geometria Analítica EC
  - Licenciatura em Proteção Civil e Gestão do Território (itemId=6124&catId=17): Expressão Gráfica e Cartografia
- Courses whose first 8 year-1 UC sheets have a blank language field (not evidence either way): Licenciatura em Artes Visuais; Licenciatura em Ciências da Comunicação; Licenciatura em Criminologia e Justiça Criminal; Licenciatura em Design de Produto; Licenciatura em Design e Marketing de Moda; Licenciatura em Educação; Licenciatura em Educação (Pós-Laboral); Licenciatura em Enfermagem; Licenciatura em Engenharia Biomédica; Licenciatura em Engenharia Civil; Licenciatura em Engenharia de Materiais; Licenciatura em Engenharia de Polímeros; Licenciatura em Engenharia de Telecomunicações e Informática; Licenciatura em Engenharia e Gestão de Sistemas de Informação; Licenciatura em Engenharia e Gestão Industrial; Licenciatura em Engenharia Eletrónica Industrial e Computadores; Licenciatura em Engenharia Informática; Licenciatura em Engenharia Química e Biológica; Licenciatura em Engenharia Têxtil; Licenciatura em Estudos Orientais: Estudos Chineses e Japoneses; Licenciatura em Psicologia
- (central catalogue went down again mid-run; Química, Relações Internacionais, Sociologia, Teatro, Arquitetura MI and Medicina MI not yet read there. School-site pages gave: Química 'Introdução à Química Física' Português; Relações Internacionais 'Economia Política' Português. Teatro: all 31 UC fields blank on the ELACH page.)
- Next: full scan of every compulsory UC (plan rows with a semester, excluding option sub-rows) for the blank-field courses.


**Correction to the list above:** Engenharia Aeroespacial and Engenharia Mecânica were matched on
"Ambiente e Energia", which is a UMinho free option, not a compulsory unit. They belong with the
blank-field group below.

## pt-uminho: result, still blocked (2026-09-29, end of session)

Compulsory-unit scan: for each course, parse the study plan (a row with a semester and a UC link is
compulsory; option sub-rows have no semester), open every compulsory UC sheet, read "Língua de
instrução". Checked on school sites (eng/ecum/eeg/elach/direito) while www.uminho.pt returned 500.

- **Ruled out, a compulsory UC is Portuguese (34 courses):** Administração Pública, Arqueologia,
  Biologia Aplicada, Biologia e Geologia, Bioquímica, Ciência de Dados (Algoritmia e Programação),
  Ciência Política, Ciências da Computação, Ciências do Ambiente e Sustentabilidade Global,
  Contabilidade, Direito, Direito (Pós-Laboral), Economia, Educação Básica, Engenharia Física (9 of 30
  compulsory UCs Português), Estatística Aplicada, Estudos Culturais, Estudos Portugueses, Filosofia,
  Física, Geografia e Planeamento, Geologia, Gestão, História, Línguas Aplicadas, Línguas e Literaturas
  Europeias, Marketing, Matemática, Música, Negócios Internacionais (8 compulsory UCs Português),
  Optometria e Ciências da Visão, Proteção Civil e Gestão do Território, Química, Relações
  Internacionais. (Hits that were not in the first plan row were confirmed compulsory from the parsed plan, except Proteção Civil's "Expressão Gráfica e Cartografia", the third year-1 S1 row, whose plan could not be re-read while www.uminho.pt was down.)
- **Not established, every compulsory UC's language field is blank (26 courses):** all Escola de
  Engenharia bachelor's (Aeroespacial 29/29 blank, Biomédica 35/35, Civil 33/33, Materiais 35/35,
  Polímeros 30/30, Telecomunicações e Informática 32/32, Eng. e Gestão de Sistemas de Informação 29/29,
  Eng. e Gestão Industrial 35/35, Eletrónica Industrial e Computadores 33/33, Informática 34/34,
  Mecânica 35/35, Química e Biológica 33/33, Têxtil 32/32), Design e Marketing de Moda 29/29,
  Design de Produto, Artes Visuais, Ciências da Comunicação, Criminologia e Justiça Criminal (only
  option UCs filled, all Português), Educação, Educação (Pós-Laboral), Enfermagem, Estudos Orientais
  (only options filled), Psicologia, Teatro (31/31 blank). Not read at all (server down): Sociologia,
  Mestrado Integrado em Arquitetura, Mestrado Integrado em Medicina.
- Other official pages read: DGES 2026 index labels no UMinho course "ensino em inglês"; UMinho
  language page https://alunos.uminho.pt/EN/incomingstudents/Pages/RequisitosL.aspx ("most course units
  are taught in Portuguese ... some specific study areas with lectures offered in English, but it is a
  minority"); international-contest dispatch RT-02/2026 Annex VI (language condition is "portuguesa ou
  inglesa, em que o ciclo de estudos é ministrado", with no per-course table). None of these names the
  language of the 26 blank-field courses.
- **Why still blocked:** `none` needs affirmative evidence for every first-cycle course; for 26 of 61
  the catalogue field is empty, which is not evidence. International Business is resolved (not
  English), so the draft's remaining gap is only these blank fields.
- **What would resolve it:** any one of (a) the UC sheets' "Língua de instrução" being filled when the
  2026/2027 catalogue ("em atualização") is completed; (b) UMinho's international undergraduate page
  or booklet (https://www.uminho.pt/EN/education/international-students/..., HTTP 500 all evening)
  stating per-course languages; (c) a school-level statement (Escola de Engenharia, ELACH, IE, ICS,
  ESE, Psicologia, EAAD, Medicina) that its first-cycle teaching is in Portuguese; (d) a written
  answer from UMinho's Serviços Académicos. Re-run: scratchpad scripts umcomp.py / eng-comp.json
  logic (parse plan rows, postback each lbNome, read the field).
- Draft edits made anyway (safe either way): International Business note now says most units are
  English but compulsory ones such as Calculus and Microeconomics I are Portuguese; the superseded
  booklet source replaced by the EEG programme page and the UMinho language-requirements page. Scope
  left as the draft's `none`; do not publish until the 26 are resolved.

## Final state (2026-09-29)

- pt-ulisboa: ready as `listed`, 4 ISEG programmes; exhaustive against both ULisboa catalogues.
- pt-nova: ready as `listed`, 4 programmes (3 NOVA IMS + ENSP Global Public Health); every NOVA
  national-contest course accounted for. Residual note: FCT Computer Science and Engineering is
  marketed as bilingual, but all 28 catalogue units are Português, so not listed.
- pt-uminho: still blocked (draft). International Business resolved as not English; 26 courses have
  blank UC language fields and 3 were unreadable. See the section above for what resolves it.
- Checks: `npm run validate` pass; `node scripts/check-schools.mjs` 0 failing;
  `npm run coverage -- --handoff pt` rewrote docs/research/schools/COVERAGE.md (it counts the on-disk
  pt-uminho draft as `none`, so its "13/13, 4 none" overstates the release until UMinho is resolved).
