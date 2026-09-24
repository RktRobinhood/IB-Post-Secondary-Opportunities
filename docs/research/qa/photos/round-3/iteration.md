# Photo round 3: iteration 3

This iteration fixes the round-3 critique (`critique.md`, 7/10). It feeds round 4.

- **Verdicts:** `docs/research/photo-review/iteration-4-verdicts.jsonl` (iteration 3 already had lines, so this is the next free number; it sorts after them and takes precedence).
- **Applied by:** `node scripts/apply-photo-review.mjs`.
- Reviewer: Claude (automated visual review, delegated by the site owner), 24 September 2026.
- Written as the work happened. A section marked *in progress* is not finished.

## Rules applied (same as rounds 1 and 2)

- Every picture viewed as a **16:10 centre crop** (what `.card__media` shows). Home-page tiles also at **4:5** (reel) and **9:11** (door).
- **Rejected:** a road, car park, sign, banner, railing, construction or event that survives the crop as a band or as the subject; people as the subject with no place.
- **Tolerated:** incidental items at about 5% of the frame or less, named in the verdict.
- **Replacements:** Commons only; CC0, PD, CC BY or CC BY-SA; at least 1200 px wide; the place checked against the institution's own website, URL in `checkedAgainst`. A Commons page is never the check.
- A gallery picture cannot be replaced by the apply script, only rejected; the gallery then shows one slide fewer.

## Live set at the start

Built with `node src/build.mjs` (152 pages). 466 hosted WebPs are referenced from `dist/`. By the verdict file that last judged each one:

| Last judged in | Pictures |
|---|---|
| Regional pass (central, nordic_baltic, west, south, world, denmark) | 380 |
| Iteration 1 | 30 |
| Iteration 2 | 55 |
| Iteration 3 | 1 |

The 380 regional-pass pictures are the sweep (item 4), less the 35 the round-3 critic already sampled and passed.

## 1–3. The critique's named fixes

| Key | Verdict | Now | Checked against |
|---|---|---|---|
| `at-jku` | **replace** | *JKU Campus Buildings.jpg* (CC BY-SA 2.0, 2044 px): campus lawn, Gigant sculpture, Keplergebäude and Management Center, blue sky, no cars. Clean at 16:10 and 4:5. | jku.at Keplergebäude and Management Center pages |
| `ucph` gallery:1 | **reject** | *Copenhagen Pride Parade 2023 51.jpg*: an event, with a banner as its subject. The gallery keeps Festhalen and the Frederiksberg main building. | — |
| `ch-unige` | **replace** | *Uni Bastions 01.jpg* (CC0, 4128 px): Uni Bastions from the park lawn. | unige.ch Uni Bastions page |
| `kr-skku` | **replace** | *Sungkyunkwan University Bicheondang and 600th Anniversary Hall.jpg* (CC BY-SA 4.0, 4069 px). | skku.edu Humanities and Social Sciences Campus directions |
| `hk-hkbu` | **replace** | *Academic and Administration Building of Hong Kong Baptist University.JPG* (CC BY-SA 4.0, 2736 px wide). The building is on the **Baptist University Road Campus**, not Ho Sin Hang; it is now called the Dr. Wu Yee Sun Building. | fass.hkbu.edu.hk contact page: "Dr. Wu Yee Sun Building (Previously the Academic & Administration Building (AAB)), Baptist University Road Campus" |
| `nl-uva` | **replace** | *Roeterseiland campus of the University of Amsterdam (September 2023).jpg* (CC BY-SA 4.0, 4080 px): the REC bridge building over the Nieuwe Achtergracht in summer sun. The UvA emblem on the chimney is part of the building (about 2%). Found in `Category:Roeterseiland`; clean, so no panel was needed. The Oudemanhuispoort courtyard (*Oudemannenhuis Universiteit van Amsterdam.JPG*) was the runner-up. | uva.nl REC B/C/D location page, Nieuwe Achtergracht 166 |

**The "previously approved by human review" claim is withdrawn.** It appeared in three places, and each is corrected:
- `denmark-verdicts.jsonl` line 26 (the ucph gallery:1 approval): the phrase is removed and the line says it is superseded;
- `data/images.json`: the review note on that gallery picture is rewritten by the apply step from the iteration-4 reject line;
- `round-2/iteration.md` §4 "Found in passing": that bullet said the picture "carries a human approval". It now carries a correction.
The round-3 critique quotes the phrase in order to refute it, and is left as the critic wrote it.

No other verdict or record claims a human approval (searched: "human review", "human approval", "previously approved").

*`at-wu-vienna` is re-judged in the reel after the apply step (§5).*

## 4. The sweep

**350 pictures** on 15 contact sheets (`sweep-1.jpg` … `sweep-15.jpg`, 24 to a sheet, each tile the stored WebP at 16:10, labelled `sheet.tile key [gN]`). The set is every picture referenced from `dist/` whose latest verdict is from the regional pass, less the 35 main photos the round-3 critic sampled and passed and the 5 named keys above. It includes the 12 Danish gallery pictures and the round-3 borderlines (`gb-ual` and `gb-kcl` are included although their last verdict is later). Sheet 1 holds the critic's named borderlines first.

I looked at every tile. The 57 that were close calls were then viewed again at 760 px wide, six to a sheet.

### Triage

| Outcome | Count | Keys |
|---|---|---|
| **Clean, re-approved** | 254 | Every other tile. Each gets an approve line in `iteration-4-verdicts.jsonl` that keeps its earlier reason and `checkedAgainst` and adds the sheet it was judged on, with any tolerated item named. |
| **Approved with a named tolerance** | (within the 254) | cz-czu (plaza, two cars at the edge, ~3%), at-mci (red ground-floor banners ~3%, gravel strip), hu-semmelweis (the building's own low fence ~5%), pl-agh (national/EU flags, not logo banners), lt-ism and lt-vilnius-tech (a few cars in an aerial, ~4–5%), lv-tsi (three cars and a booth ~3%), hk-eduhk (walkway and a short railing in the corner ~4%), nz-lincoln (paving and bikes ~5%), and facade lettering at 2–4% on baaa, sea, fi-lut, fi-utu, se-chalmers, es-upc, pt-iscte-iul, be-odisee, fr-essec, au-qut, sg-suss, nl-tilburg, it-bicocca. |
| **Weak but breaking no rule, kept** | (within the 254) | no-uis (an interior lounge), ee-tlu (abstract overhang), gr-auth (rooftops), gr-ntua (bare forecourt), ca (dark field before Convocation Hall), nz-aut (empty plaza), via (already skipped from the reel). |
| **Reject: gallery** | 1 | `sdu` gallery:1 (*Ingenioruddannelser.jpg*, slide 3): students on a Formula Student car, no place. |
| **Reject: main, rule broken** | 77 | Replacement searched for each (below). |
| **Borderline main, replace only if clearly better** | 18 | at-aau, at-boku, at-meduni-wien, cz-uwb, pl-wum, ee-ut, fi-arcada, fi-metropolia, fi-tamk, no-inn, no-uit, se-liu, es-comillas, es-uc3m, it-unito, nl-wur, cn-cuhk-shenzhen, sdu. |

`au-utas` (not in the sweep) is re-approved with its note corrected: the emblem is about 6–7% of the frame, not 4% (critique §3).

### The 77 rule-breaks

| Rule | Keys |
|---|---|
| Road, crossing or road markings as a band | gb-bristol, gb-kcl, at-uni-innsbruck, ch-unilu, cz-amu, pl-pums, pl-wroclaw-tech, fi-haaga-helia, lv-ba, lv-jvlma, lv-rtu, se-sse, pt-ualg, fr-paris-saclay, ie-dkit, no-bi, hk-hkapa, hk-hksyu, hk-hsuhk, jp-aiu, jp-handai, jp-kyudai, cn-sysu, au-rmit, kr-postech, us-amherst, ee-euas, be-howest |
| Car park or a row of parked cars | cz-muni, hu-bme, pt-ucp, lt-lmta, hu-metu, pl-sgh, fi-uef, fi-uoulu, be-uliege, it-polito, ee-eava, hu-univet, jp-kyoto-u (marked car-park surface), de-tu-berlin (paved forecourt with parking bollards, grey) |
| Banner, flag banner with logo, or advertising | au-adelaide, cz-usb, it-polimi, it-sapienza, it-unipd, hk-hkmu, us-nyu, be-uhasselt, ie-ucd, pt-u-porto (advertising kiosk and hoarding), fi-tau (logo pylon and commercial logos) |
| Sign, name board or lettering as the subject | absalon, pl-kozminski, be-kdg, nl-eur, cn-xjtlu, us-grinnell, ie-maynooth, jp-tohoku, nz-auckland, se-gu (wayfinding post and signs), at-modul (logo and slogan facade) |
| Railing or fence as a band | at-wu-vienna (ramp handrails; also the home reel), be-uantwerpen, cn-fudan, kr-hanyang (road guard rail) |
| Event | at-webster-vienna (night logo projection), at-uni-wien (crowd and barriers on the Ring), lt-vmu (marquees in the plaza) |
| People or an object as the subject, no place | lt-lcc (backs at a door), kr-ewha (a crowd with cones), ca-uvic (a fountain), gb-ual (fountain jets), gr-asfa (a mural), fr-sciences-po (a doorway with a plaque: a street address) |

Replacements were searched by ten parallel helpers, each writing its findings to `replacements-g1.md` … `replacements-g10.md` in this folder as it went. I view every proposed file myself at 16:10 before writing a verdict.

### Replacements: how they were checked

- Ten helpers searched Commons in parallel, one group each, and wrote to `replacements-g1.md` … `replacements-g10.md` as they went. Each section gives the file, licence, size, what the 16:10 crop shows (tolerated items named with their share of the frame), the official page, and every candidate rejected and why.
- I viewed every proposal myself at 16:10 before writing a verdict: `replacements-1.jpg` … `replacements-5.jpg` (the Commons files, centre-cropped). After the apply step the stored WebPs are on `applied-1.jpg` … `applied-4.jpg`.
- Licences: all CC0, public domain, CC BY or CC BY-SA. Widths run from 1536 px (it-polimi) to 10 049 px. `us-amherst` is a TIFF on Commons; the fetcher took Commons' JPEG thumbnail, as it does for every pin.

### I overruled five helper proposals

| Key | Proposed | Why not used |
|---|---|---|
| ie-dkit | *DKIT BlackBoxRestaurantWind1.jpg* | 85% sky, the wind turbine is the subject, the buildings a strip: the Granary-fountain weakness. |
| at-modul | *Restaurant am Kahlenberg.jpg* | Reads as a café terrace with parasols. modul.ac.at confirms the Kahlenberg buildings but not that this pavilion is not a let restaurant. |
| be-kdg | *KdG Campus Hoboken.jpg* | A campus sign panel, bike racks and bare sand make a clutter band; KdG replaces the building from September 2026. |
| lv-rtu | *Riga Zunds and RTU (34183652963).jpg* | The campus is a distant strip under a rooftop logo. |
| ee-eava | *Eesti Lennuakadeemia 360-13.jpg* | A 360° interior panorama that bends at 16:10. |

### Result of the sweep

**Replaced (68)**, each with an official page in `checkedAgainst`:

| Key | New photo |
|---|---|
| gb-bristol | Wills Memorial Building from below, blue sky |
| gb-kcl | Maughan Library towers, Chancery Lane |
| gb-ual | Granary Building (Central Saint Martins) facade; the low fountains are foreground |
| fi-uef | Carelia building, Joensuu, across a lawn |
| fi-uoulu | Linnanmaa campus wing |
| cz-muni | Bohunice University Campus aerial |
| hu-bme | Building K across the Danube (a thin distant line of cars on the quay, ~1.5%) |
| de-tu-berlin | Main building facade |
| at-wu-vienna | Library & Learning Center over a flowerbed; no railings at 16:10 or 4:5 |
| at-uni-innsbruck | Main building with the mountains behind |
| at-webster-vienna | Palais Wenkheim in daylight |
| cz-amu | DAMU, Karlova 26: courtyard and towers from above |
| cz-usb | Rectorate / Faculty of Philosophy across the campus park |
| pl-kozminski | Atrium (an interior; no clean exterior exists) |
| pl-pums | Collegium Anatomicum |
| pl-sgh | Building C, al. Niepodległości 128 (street furniture at the base ~3%) |
| pl-wroclaw-tech | Building E-1 across the park pond |
| lt-lcc | Learning Commons across a lawn (grey sky) |
| be-uliege | Institute of Zoology across the Meuse |
| nl-eur | Woudestein campus square and Erasmus Building from above |
| pt-ucp | Palma de Cima headquarters |
| pt-ualg | Gambelas campus, Faro |
| it-polimi | Rettorato from the Piazza Leonardo lawn (white sky) |
| it-sapienza | Rectorate with the Minerva statue |
| it-unipd | Palazzo Bo courtyard without banners |
| fr-paris-saclay | Château de Launay, Orsay (a flag-banner at the left edge ~1.5%) |
| fr-sciences-po | Reims campus courtyard (former Jesuit college) |
| au-adelaide | Bonython Hall |
| hk-hkapa | The Béthanie, Pok Fu Lam (no clean Wan Chai view exists) |
| hk-hkmu | Jockey Club Institute of Healthcare |
| hk-hksyu | Research Complex, Braemar Hill |
| hk-hsuhk | Student Hostel courtyard, Siu Lek Yuen |
| jp-aiu | Nakajima Library exterior across a lawn |
| cn-xjtlu | Central Building behind willows on the canal (hazy sky) |
| at-uni-wien | Arkadenhof of the main building |
| hu-univet | István utca campus, main building and park |
| lt-vmu | VMU multifunctional centre, V. Putvinskio g. 23 |
| fi-tau | Pinni B, Kanslerinrinne 1 |
| no-bi | BI Nydalen (a small logo panel ~1.5%) |
| it-polito | Castello del Valentino courtyard |
| pt-u-porto | Faculty of Architecture (Siza) |
| be-uantwerpen | Hof van Liere courtyard |
| ie-maynooth | St Joseph's Square and the chapel spire (a footpath ~6% bottom right) |
| ie-ucd | Lake and fountains with O'Reilly Hall |
| se-gu | Main building head-on (a P sign ~1%, a panel ~2%) |
| au-rmit | Old Melbourne Gaol gatehouse and lawn, City campus |
| ca-uvic | McPherson Library across the Petch fountain pond |
| cn-fudan | Jiangwan campus |
| cn-sysu | Swasey Hall, South Campus |
| jp-handai | Osaka University Hall across the pond, Toyonaka |
| jp-kyoto-u | Institute for Research in Humanities, Kitashirakawa (not the Clock Tower: every Clock Tower file has signs or asphalt) |
| jp-kyudai | Shiiki Hall, Ito campus |
| jp-tohoku | Headquarters Building 1, Katahira |
| kr-ewha | The ECC valley |
| kr-postech | Graduate Institute of Ferrous Technology (a close-up) |
| nz-auckland | The ClockTower (Old Arts Building) |
| us-grinnell | Carnegie Hall |
| us-nyu | Bobst Library (hazy sky) |
| us-amherst | Johnson Chapel on the Main Quad (Highsmith, CC0) |
| at-meduni-wien | Josephinum from its garden |
| cz-uwb | Bory campus over a lawn (companion to the old photo, without the road) |
| ee-ut | Main building colonnade (kerb and chain ~6%). The old file was also under the Free Art Licence, outside the allowed list |
| fi-metropolia | Myllypuro campus towers |
| no-uit | Norwegian College of Fishery Science facade |
| se-liu | Campus Norrköping (Kåkenhus) across the river |
| es-uc3m | Sabatini building courtyard, Leganés |
| it-unito | Rectorate courtyard without the panel |
| nl-wur | Atlas building over a lawn |

**Rejected with no replacement (19).** 18 now show the typographic panel; be-howest shows its approved official image.

| Key | Why nothing replaced it |
|---|---|
| absalon | Commons has four campus photos. The clean-looking Holbæk seminarium is no longer Absalon's campus, and Slagelse carries giant ABSALON letters. |
| ie-dkit, at-modul, be-kdg, lv-rtu, ee-eava | Proposals overruled (above). |
| fi-haaga-helia | Pasila sits on a road junction; every view has road, cars or tram wires. |
| se-sse | Every view of Sveavägen 65 has road, the metro lift or signs. |
| lt-lmta | The only fallback is a snowy grey square with bare trees and a parked car. |
| ch-unilu | Three photos of Frohburgstrasse 3; all have cars, P or POST signs. Its old file was also under the Free Art Licence. |
| hu-metu | The only other photo ≥1200 px has road, tram tracks, wires and parked cars. |
| lv-ba, lv-jvlma | Only street views with traffic, trolley wires or signs. |
| ee-euas | The campus has not moved (eek.ee: Suur-Sõjamäe 10a); the only other photo has lettering, snow banks and a pole. |
| be-howest | The Sint-Jorisstraat building is no longer Howest's (howest.be/en/campuses/bruges); Commons has nothing of Campus Brugge Station or Kortrijk Weide. |
| be-uhasselt | Every outside view has UHasselt banners, flags, lettering or cars. |
| gr-asfa | No daylight exterior of Pireos 256 on Commons. |
| kr-hanyang | The best alternative has people across the foreground (~6%), and its building could not be confirmed on hanyang.ac.kr. |
| es-comillas | A road band with a traffic mirror and a sign. It is the only daylight view of a Madrid Comillas building on Commons, and the old Cantabria building is no longer the university's. |

**Borderline, kept (8)**, each re-approved with the tolerance named: at-aau (car park ~6% in a lake aerial), at-boku (carved name on a facade close-up), pl-wum (the name twice in big letters, ~10%), fi-arcada (asphalt ~10%; the only Arcada photo), fi-tamk (car-free driveway ~20%), no-inn (signpost ~6%), cn-cuhk-shenzhen (calligraphy banners ~10%), sdu (cars ~5% at 16:10, outside the 4:5 crop).

## Counts

| | Count |
|---|---|
| Pictures judged this iteration | 356 (5 named, 350 swept, au-utas) |
| **Replaced** | **73** (5 named + 68 from the sweep) |
| **Rejected, no replacement** | **21** (19 main photos + 2 gallery pictures: ucph gallery:1, sdu gallery:1) |
| **Approved** | **263** (254 clean in the sweep + 8 borderline kept + au-utas with its note corrected) |
| Verdict lines in `iteration-4-verdicts.jsonl` | 357 |

## 5. Applied, built, checked

- `node scripts/apply-photo-review.mjs`: all 73 replacements landed through the fetcher (4 batches, 0 failures). Result across all verdict files: `{ approved: 428, rejected: 148, replaced: 112, missing: 19 }`. The 19 missing are the records no longer in the data (`ee-eka`, `lu-mudec`, …), unchanged since round 2.
- `node scripts/test-image-records.mjs`: ok, 511 pictures in 492 records agree with their Commons page, file on disk and review; 523 verdicts applied.
- `data/images.json` no longer contains "previously approved by human review".
- **Home page, re-checked** (`home-crops.jpg`: doors at 9:11 and reel tiles at 4:5, from the stored 16:10 WebPs):
  - `at-wu-vienna` now shows the Library & Learning Center over a flowerbed, with no handrails at 4:5 or 16:10. It keeps its reel tile; no skip was needed.
  - `homeReel.skip` in `data/site-config.json`: **`gb-kcl` removed**. It was skipped for its road band; its new Maughan Library photo is clean at 4:5, so King's takes the UK tile back from Manchester. `dk-via` stays skipped.
  - Doors (ucph, gb, jp) unchanged. Reel: fi-aalto, ca-u-of-t, sdu, gb-kcl, au-melbourne, au-2, nl-thuas, jp-waseda, cbs, at-wu-vienna, sg-nus, ruc. All clean at 4:5; `sdu`'s cars fall outside the crop.
- **Panels.** All destination pages: 61 of 455 card photos are panels (round 3: 44). The 17 new panels are rejects with nothing clean on Commons. The four test pages: nl 1/22, gb 1/22, se 1/14 (se-sse, new), jp 1/15. `/denmark/`: 3 (Absalon joins Zealand and Dania).
- **Gate:** `$env:SITE_BASE='/IB-Post-Secondary-Opportunities'; node scripts/qa.mjs` from PowerShell: **all 30 checks pass** (`freshness` advisory as usual). One plain build hit EBUSY and was re-run.

## Licences found in passing

Every replacement is CC0, public domain, CC BY or CC BY-SA. A scan of `data/images.json` found these outside the literal list:
- **Free Art Licence:** `ee-ut` (replaced) and `ch-unilu` (rejected). Both are gone from the site.
- **"Copyrighted free use"** (`at-plus`, `is-lhi`, `sg-nus`, `sg-ntu`), **"Attribution"** (`ch-unibas`) and **"No restrictions"** (`si-issbs`). These Commons tags are at least as permissive as CC BY, so they are left live. A later pass may want to confirm each tag on its Commons page.

## What could not be fixed

- **19 institutions now show a panel or their official image** because Commons has nothing clean (table above). Eight weak-but-legal borderlines remain.
- **Place checks.** The sweep judged bands and subjects, not places. 248 live main photos still have no official-site check (201 empty, 47 circular). This is drafted as a GitHub issue, not filed: `issue-official-site-checks.md`.
- Some replacements rest on a place match by eye or on the photographer's title, as their verdicts say: `jp-aiu` (the library exterior), `lt-lcc` (the Learning Commons), `pt-ualg` (Gambelas, placed by a geotagged photo from the same series), `cz-usb` (the rectorate block), `cn-fudan` (the building is not named on fudan.edu.cn).
- `jp-kyoto-u` is no longer the Clock Tower: no Commons view of the tower is free of signs or asphalt.

## Files touched

- `docs/research/photo-review/iteration-4-verdicts.jsonl` (new, 357 lines).
- `docs/research/photo-review/denmark-verdicts.jsonl`: line 26, the false "previously approved by human review" wording removed.
- `docs/research/qa/photos/round-2/iteration.md`: the "carries a human approval" bullet corrected.
- `data/images.json` and `src/assets/img/places/*.webp`: via the apply script (73 new WebPs).
- `data/site-config.json`: `homeReel.skip` no longer lists `gb-kcl`.
- This folder: `iteration.md`, `sweep-1..15.jpg`, `replacements-1..5.jpg`, `replacements-g1..g10.md`, `applied-1..4.jpg`, `home-crops.jpg`, `issue-official-site-checks.md`.
