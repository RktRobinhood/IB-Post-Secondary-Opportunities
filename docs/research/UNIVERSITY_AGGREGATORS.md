# Central university and programme sources

Researched 2026-10-29 against provider documentation. Recommendations below are engineering judgments; access and coverage claims link to the source that owns them.

## Recommendation

Use established sources as **versioned data dependencies**, with local snapshots and field-level provenance. There is no demonstrated single open source covering our complete need: English-taught first-year programmes, intake-specific IB subjects and scores, citizenship-specific tuition, and application milestones worldwide.

The strongest practical combination is:

1. Extend the IB recognition integration already present in this repository for institutional qualification recognition.
2. Use national programme feeds for catalogue and application facts where licensed access exists: particularly the Dutch Studiekeuzedatabase, Finnish Studyinfo, UK UCAS, and French Parcoursup.
3. Use ROR for institution identities and cross-database reconciliation. Its open licence makes this an immediately usable global dependency, but its content cannot replace programme research.
4. Keep responsible institution and admissions-authority evidence for missing or conflicting consequential rules. Request a licensed Studyportals feed only if its coverage and permitted republication justify the cost.

Do not interpret an institution appearing in a database as evidence that it offers an English-taught first-year programme for our target intake. Do not interpret missing IB requirements as no requirements.

## Existing reuse in this project

The project already consumes an aggregator: `data/ib-statements.json`, produced by `scripts/import-ib-statements.mjs`, contains institution matches, qualification recognition flags, statement links, and selected policy information. Its recorded retrieval date is 2026-09-23. See `docs/IB_STATEMENTS.md` for the existing collection approach and `docs/research/IB_DISCOVERY.md` for a previous discovery shortlist. These are local observations, not assertions that upstream permits unrestricted republication.

The existing evidence contract in `docs/DATA_MODEL.md` says aggregators may aid discovery but should not become the final authority for admissions rules merely because they aggregate them. A government-operated application portal or an institution-authored statement can be the responsible official source for the specific claim it publishes; that responsibility must be recorded per field.

## Source comparison

| Source | Useful content for us | Integration/access | What it does not establish |
| --- | --- | --- | --- |
| IB Recognition Statements Database | Institution-level IB Diploma/Course Results recognition, grades/subjects when supplied, credit, scholarship and policy links | Existing project harvest and importer; no documented public bulk API or blanket reuse licence located in this investigation | Complete programme-specific entry conditions for every intake |
| ROR | Stable institution identifiers, names, aliases, official links, country/location, external identifier crosswalks and organizational relationships | Public JSON REST API and full versioned JSON dump; CC0 | Degree catalogue, IB requirements, tuition, deadlines or teaching language |
| Wikidata | Cross-identifiers, names, websites and geographic/context metadata when recorded | Entity JSON, APIs, narrow SPARQL queries and dumps; structured data CC0 | Completeness, official accreditation or current admissions rules |
| Studiekeuzedatabase, Netherlands | Accredited Dutch higher-education programmes and standardized comparison information drawn from national sources | Free after agreement; API key; current REST JSON API V1; full CSV/XLSX/JSON downloads | That domestic entry-condition fields normalize every IB subject combination |
| Studyinfo / Opintopolku, Finland | National education offering and application data; appropriate place to investigate programme and application-option records | EDUFI explicitly documents unauthenticated Konfo External APIs for showing published offerings on other websites; Caller-Id required | A named blanket CC licence for all underlying descriptions, images and other data |
| UCAS Courses Data Service, UK | Provider/course data designed for course search republication | Licensed commercial service and API key, agreed purpose and attribution | Free anonymous API access or blanket reuse permission |
| Hochschulkompass / DAAD, Germany | Institution-maintained programme catalogue; DAAD exposes language and applicant-group deadline filters | HRK collaboration agreement; own search, embedded search or links | Permission to modify and blend all catalogue fields with our own data |
| Study in Denmark | Ministry-maintained English-taught programme overview | Public catalogue; no documented reusable feed located here | Complete current catalogue: the portal explicitly says the overview is being revised |
| Parcoursup open data, France | National programme identifiers, institutions, locations and links for offerings accessible through Parcoursup | Official export/API under Licence Ouverte v2.0 | All French programmes, English instruction, or IB-specific entry conditions |
| College Scorecard, US | Institution and field-of-study information; costs and student outcomes | Official federal catalogue provides bulk ZIPs and a data dictionary; provider also supports an API | International-student net prices or programme-specific IB admission thresholds |
| Studyportals / Bachelorsportal | Global programme discovery; provider offers fee, entry-requirement and market comparison products | Partnership/data access must be negotiated; no documented open catalogue API located | A public reusable API merely because programme pages are searchable |
| WHED | Institution/system/credential directory and Global WHED identifiers | Visitor access and MyWHED export features; substantial copying requires IAU consent | An open downloadable programme/admissions dataset |

## Evidence and access details

### IB recognition

IB states that the database contains more than 2,000 universities and that universities create and edit their own statements, including IB programmes, courses, grades and subjects where supplied. It also warns that policies may change and further requirements can apply. Missing institutions are not necessarily non-recognizers. This makes the database highly relevant, but policy presence and programme eligibility remain separate questions. [IB description](https://ibo.org/university-admission/find-countries-and-universities-that-recognize-the-ib/), [database](https://recognition.ibo.org/en-US).

### ROR

ROR supplies individual JSON records through `https://api.ror.org/v2/organizations`; its documentation recommends full dumps rather than using the API to retrieve the whole registry. Dumps are versioned and include CC0 metadata. Use JSON as the canonical format because CSV is a flattened subset. For this project, match a university using country plus official website domain and names, preserve the ROR ID, and retain ambiguous branch-campus matches for review. A research-organization record is identity evidence, not accreditation evidence. [API documentation](https://ror.readme.io/docs/rest-api), [dump and licence](https://ror.readme.io/docs/data-dump).

### Wikidata

Use known QIDs or cross-identifiers from a matched registry record to fetch individual entity JSON. Wikimedia documents query, linked-data, Action API, REST API and dump access, and identifies the structured namespaces as CC0. Keep references and qualifiers if using claims; a simplified truthy export can discard them. Images referenced by an item retain their separate image licences. [Wikidata data access](https://www.wikidata.org/wiki/Wikidata:Data_access).

### Netherlands: a strong programme-feed candidate

Landelijk Centrum Studiekeuze explicitly permits using its database in an app, website, dashboard or study-choice tool, subject to its delivery terms and attribution. Access is free after signing an agreement. [Provider FAQ and conditions links](https://lcsk.nl/faq/).

The current portal supports whole-database CSV/XLSX/JSON download and a REST JSON API. An authenticated portal account creates API keys. **Use V1: V0 ceased availability on 2026-06-01.** Older Studiekeuze123 pages still describe OData, so do not build against those historical examples. Official OpenAPI specification: `https://api.skdb.nl/v1/openapi.json`. [Current technical documentation](https://portal.skdb.nl/Documentatie/api-opzet/), [account/download/key workflow](https://portal.skdb.nl/Aan%20de%20slag/).

Pilot by joining our Dutch institution list to national institution identifiers, then programme IDs, then selecting bachelor-level English-language offerings. Inspect field semantics before deciding which admission and fee fields can satisfy our evidence contract.

### Finland: an official interface for display on other websites

EDUFI's current integration documentation distinguishes authenticated Kouta integration/administration APIs from **unauthenticated Konfo External APIs**. The latter are explicitly described as suited for retrieving published education offerings to display on one's own websites. The documented interface is `https://opintopolku.fi/konfo-backend/swagger/index.html#/External`. This is direct official support for our catalogue-display purpose; it is stronger than merely observing an internal frontend endpoint. A named blanket data licence for all descriptions/images was not located. Import the relevant structured catalogue facts and source links, rather than treating every upstream asset as freely licensed. [Official external-API purpose and authentication documentation](https://wiki.eduuni.fi/spaces/ophPPK/pages/190612447/Koulutustarjonta%2Bja%2BOpintopolku.fi%2Btietomallit%2Bja%2Brajapinnat).

Every API call must send a `Caller-Id` header. The format is organization OID plus a system name, separated by a dot; organizations without an OID may use their name without diacritics. Permitted characters are a–z, digits, dot, hyphen and underscore. The caller chooses its system name. Some HTTP operations also require CSRF handling; the published GET interface should be checked against its current specification. [Caller-Id guidance, updated 2025-02-06](https://wiki.eduuni.fi/x/0MeKCg).

Use the documented Konfo External read endpoints for the pilot. Do not confuse them with `kouta-external`, which also supports creation/modification and uses authenticated sessions. The old higher-education API overview is archived and should not override the current Konfo documentation.

The implementation investigation on 2026-10-29 confirmed this working query returned 188 records before matching to our identified institutions:

```text
https://opintopolku.fi/konfo-backend/external/search/toteutukset-koulutuksittain?opetuskieli=oppilaitoksenopetuskieli_4&koulutustyyppi=kandi,kandi-ja-maisteri,amk-alempi&lng=en&size=200&page=1&sort=name&order=asc
```

The detail route `/konfo-backend/external/toteutus/{oid}?koulutus=true&hakukohteet=true&haut=true` supplies related programme and application information. Language and bachelor-level filtering are upstream search constraints; a listed record still needs institution matching and intake checks. The pilot imports a catalogue snapshot and displays relevant programme links. It does not copy descriptions or replace verified fee/deadline evidence. The 188 count describes this observed response, not a permanent guarantee of the complete Finnish catalogue.

### United Kingdom: licensed UCAS dependency

UCAS has an official Courses Data Service agreement covering API access and permitted storage, adaptation and publication for an agreed purpose. It requires attribution and refreshing available data at least every 60 days. An API key and agreement are required. The licence restricts competitive admissions-service use, so the agreed purpose should explicitly cover our student planning and course-search experience. No price or existing project credentials were established here. [UCAS Courses Data terms](https://www.ucas.com/terms-and-conditions/sale-of-products-and-services/sale-of-products-and-services-courses-data-service).

### Germany: use the underlying catalogue once

Hochschulkompass says institutions enter and update their own programme information. DAAD's all-programmes search credits HRK as the data supplier and exposes course-language and admission-deadline filters. These are related interfaces over centrally supplied data, not independent corroborating sources. [Hochschulkompass catalogue](https://www.hochschulkompass.de/en/degree-programmes.html), [DAAD catalogue](https://www.daad.de/en/studying-in-germany/universities/all-degree-programmes/).

HRK offers collaboration to study-information websites. Published criteria include use for the agreed purpose, free public access, unchanged data unless HRK consents, and a condition that German university information on partner sites originates from Hochschulkompass. Our normalization and blending would need explicit accommodation in an agreement. A public search endpoint alone is insufficient evidence of permission. [Collaboration criteria](https://www.hochschulkompass.de/en/about-us/collaborative-partners.html).

### Denmark

Study in Denmark is ministry-managed and describes a catalogue of English-taught programmes across Danish higher-education sectors. It explicitly says the overview is being revised and directs programme questions to institutions. Existing scrapers in this workspace do not demonstrate a supported upstream API or current completeness. Use it for discovery and discrepancy checks; retain institution verification of the target intake. [Ministry programme portal](https://studyindenmark.dk/portal).

### France

The ministry's `fr-esr-cartographie_formations_parcoursup` dataset covers programme-map records for 2020–2026, offers export/API access and states Licence Ouverte v2.0. Its description says daily updates, but the displayed metadata date can be older; record the actual response and year rather than assuming 2027 coverage. Filter to identified institutions before investigating teaching language. Programmes using direct routes can fall outside Parcoursup. [Official dataset and API/export tabs](https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-cartographie_formations_parcoursup/).

### United States

The official federal catalogue publishes downloadable institution files, field-of-study files and a data dictionary, with a CC-BY licence field. Its metadata has inconsistent legacy dates, so the catalogue's modification timestamp should not be treated as the intake or reference year of every metric. The technical documentation explains that many fields are IPEDS-derived and have different cohorts. Cost averages, aid and outcomes need audience labels; US federal-aid cohorts do not describe every international student. Direct Scorecard webpage fetches returned HTTP 403 during this research; do not use unofficial proxy URLs as dependencies. [Federal dataset catalogue](https://catalog.data.gov/dataset/college-scorecard), [provider technical documentation](https://collegescorecard.ed.gov/assets/InstitutionDataDocumentation.pdf).

### Studyportals

Studyportals advertises a global catalogue including Bachelorsportal. Its institutional products include programme comparisons, tuition-fee analysis and custom reports. However, the inspected official pages document dashboards and commercial partnerships rather than a public licensed programme-catalogue API. Ask for a sample export and explicit field-level republication/caching rights before depending on it. Do not infer those rights from access to student-facing pages or analytics dashboards. [Provider overview](https://studyportals.com/), [Data & Insights](https://studyportals.com/for-institutions/data-and-insights/), [terms](https://studyportals.com/terms-of-service/).

### WHED

WHED documents institutions, educational systems and credentials. MyWHED includes export/printing services, but its terms prohibit copying all or substantial parts without prior IAU consent. Treat it as a useful recognition/reference directory or a negotiated data partnership, not a default bulk import. [IAU WHED terms](https://whed.net/Terms_of_use.html).

## How to consume feeds without rebuilding their products

This is a proposed implementation boundary:

- Keep an upstream-source manifest recording publisher, documentation, licence/agreement status, retrieval date, upstream version and expected fields.
- Store the upstream institution/programme identifiers separately from our durable IDs. Exact official website/domain matches are stronger than name-only fuzzy matches; campuses and awarding institutions need explicit treatment.
- Fetch into a staging snapshot, validate it, and compute a change report. Promote only supported fields to the current data model.
- Preserve both claims when a feed conflicts with an institution or authority. Mark the consequential field for review rather than selecting the more permissive value.
- Render only relevant student-facing facts and a source/check date. Avoid exposing registry plumbing as product content.
- Keep API keys outside client bundles and the repository. Build the public site from the last validated snapshot so an upstream outage cannot break student pages.

For an immediate programme-level pilot, Finland's Konfo External API explicitly supports publication on other websites without authentication. The Dutch source has a clear free agreement/account workflow for a larger comparison dataset. For immediate global identity enrichment, ROR is the clearest choice. None eliminates the need to verify our most specialized IB and intake rules.
