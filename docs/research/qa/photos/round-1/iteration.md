# Photo round 1: iteration 1

This iteration fixes the round-1 critique (`critique.md`, 7/10). The verdicts are in
`docs/research/photo-review/iteration-1-verdicts.jsonl` (40 lines), and
`node scripts/apply-photo-review.mjs` applies them. Iteration files are sorted after the regional
files, so these lines take precedence.

Reviewer: Claude (automated visual review, delegated by the site owner), 24 September 2026.

## How each candidate was judged

- I downloaded every candidate and looked at it at a **16:10 centre crop**, which is the only crop
  the site makes.
- **Rejected:** any candidate where a car park, sign or name board, fence or hoarding, banner,
  watermark, camera stamp or railing survives that crop as a band or a subject.
- **Tolerated:** small incidental objects at the edge of the frame, such as a few bikes, a distant
  kerbside car or a small flag, at about 5% of the frame or less. Each tolerated item is named in
  its verdict.
- **Replacements:** Commons only, CC0, PD, CC BY or CC BY-SA, and at least 1200 px wide.
- **Place checks:** every replacement and every re-approved Central Europe file was checked against
  the institution's own website. The URL is in `checkedAgainst`.

## Replaced (commons-main reject + replacement)

| Key | Was | Now | Note |
|---|---|---|---|
| es-ie | CTBA skyline | Torre Caleido - CTBA - Madrid 02.jpg | I did not use the critic's pick, Caleido-IE-31102022: its crop keeps shop signs and a white sky |
| de-bcb | banner shot | ECLA of Bard campus, 2012.jpg | critic's pick; no signage |
| pt-nova | chapel | FCSH Edifício.jpg | critic's pick (Univ_Nova_Lisboa) is 1045 px, under the minimum. Colégio Almada Negreiros, Campolide |
| it-bocconi | through fence | SDA Bocconi new campus.jpg | critic's pick (SANAA 2) keeps a walkway railing across the bottom |
| it-unitn | blue fence | Law department.jpg | Faculty of Law at dusk (1291 px) |
| nz-otago-polytechnic | big sign | CORP event Orientation 2015 001.jpg | H Block with students; the best of the set |
| es-esade | name board | ESADE edifici 1 carrer cavallers.jpg | clean but plain; nothing better on Commons |
| hk-cityu | watermark | City U Main Campus 201104.jpg | AC1 main entrance with students |
| de-tum | 4 banners, P sign | Arcisstr. 21 TUM Muenchen-2.jpg | small flags at the edge are incidental |
| cz-cu | barred wing | Praha Karolinum nádvoří.jpg | Karolinum courtyard, Hus statue |
| cz-but | fence and road | Brno, rektorát VUT.jpg | rectorate at Antonínská 548/1 |

## Rejected with no replacement (the page shows its empty state)

| Key | Why | What was searched |
|---|---|---|
| hk-thei | car park fills about 40% of the frame | See below |
| zealand | road and two cars fill the bottom third | Commons has only the Roskilde file (already rejected); no official image |
| ae-zu | empty car park across the lower right quarter, and haze | the only ZU campus photo on Commons; no official image |
| sg-jcu-singapore | bus-window rail, motion blur | nothing else above 480 px; no official image |
| si-ameu | Velika kavarna café, Glavni trg 1; not AMEU's address at Slovenska ulica 17 | AMEU's own approved share image still publishes, so the page is not empty |

**hk-thei: the option I declined.** The critic's file,
`HK 柴灣 Chai Wan 永泰路 Wing Tai Road October 2025 N13P 13.jpg` (CC0, 4080 px), shows the THEi Chai Wan
towers under a blue sky. Its REDMI camera stamp sits at about 94% of the height, so the 16:10 crop
does remove it. The crop still keeps a green construction hoarding along the bottom sixth and a
site cabin with air-conditioners in the bottom-right corner, which is why I rejected it. If the
coordinator accepts that, the towers are the strongest THEi picture on Commons. The override is one
more line in this file: a commons-main reject of `Thei Chai Wan Campus 2018.jpg` with that file as
the replacement.

## Official share images

| Key | Verdict | Why |
|---|---|---|
| jp-handai | reject | blurred blossom, no building. The Commons record (medicine building, approved) shows instead. A Suita or Toyonaka campus photo would be better; not searched this iteration |
| de-whu | reject | slogan text on glass. The approved Commons Marienburg photo shows instead |
| lv-turiba | reject (re-judged, "crop") | the 16:10 crop is a blurred portrait of one student, 530 px tall. **Falls back to an unreviewed Commons file, "Turiba University Hostel.jpg"; someone should look at it** |
| se-ltu | reject (re-judged, "crop") | the 16:10 crop is a portrait of three students, 540 px tall. The Commons B-building shows instead |
| fr-emlyon | approve (re-judged, "crop") | the crop shows the Gerland campus block with nothing to remove; soft at 450 px |

The three re-judged images were every approval in the verdict files whose reason mentioned "crop".
The crop approvals for hk-thei, hk-cityu and sg-jcu-singapore are covered above.

## Central Europe replacements, now checked against the official sites

- **Approved, checkedAgainst filled in:** de-heidelberg, ch-eth, ch-webster-geneva, de-rwth,
  de-lmu, ch-epfl, ch-hsg, de-fu-berlin, cz-ctu, cz-aau, cz-vsb-tuo, hu-ceu, hu-oe,
  hu-zeneakademia, hu-mome, hu-sze, pl-put, at, ch-franklin.
- **Replaced:** de-tum, cz-cu and cz-but (table above).
- **Rejected:** si-ameu (above).
- **de-bcb** is covered under the replacements.

Caveats recorded in the verdicts:

- **hu-ceu:** the photo is right, but CEU's degree programmes are now taught in Vienna
  (Quellenstraße 51), and Budapest is a research and non-degree site. Commons has no Vienna
  building photo, only the 2019 inauguration events.
- **pl-put:** the photo is PUT's historic B1 building, but the official seat moved to
  ul. Jacka Rychlewskiego 1 on 1 January 2026. Do not caption it as the headquarters.
- **hu-oe:** dull, but every other Commons option has vans or cars in front.
- **ch-epfl:** the Commons plaza is plain, but EPFL's approved official image publishes first.
- **ch-hsg:** has a small university sign at the edge, but HSG's approved official image
  publishes first.

## Not changed, and why

**hu-sze** keeps its approval. The parked cars are a thin strip in the middle distance, and the
alternatives are worse: "Győr, Egyetem.jpg" has a fence across the bottom, and the library shot is
mostly paving and name boards.
