# Photo round 2: iteration 2

This iteration fixes the round-2 critique (`critique.md`, 7/10). It feeds round 3.

- **Verdicts:** `docs/research/photo-review/iteration-2-verdicts.jsonl`, 72 lines.
- **Applied by:** `node scripts/apply-photo-review.mjs`. Iteration files sort after the regional files and after iteration 1, so these lines take precedence.
- **Dry run:** 19 replacements queued, and every approve line matches the file on its record. Nothing is reported missing except replacements that have not been fetched yet.

Reviewer: Claude (automated visual review, delegated by the site owner), 24 September 2026.

## What changed since round 2

1. `picture()` in `src/lib/data.mjs` now prefers an **approved** Commons photo over the institution's official share image. Approved campus photos are no longer hidden, and so every approved Commons photo now has to stand on its own. That is why `fr-escp` is rejected below.
2. The fetcher gave 26 institutions that had no photo a machine pick. All 26 are judged below.

## How each candidate was judged (same rules as iteration 1)

- **Crops.** Every candidate was downloaded and viewed as a **16:10 centre crop**. Home-page photos were also viewed as the **4:5 reel crop** and the **9:11 door crop**, both taken from the stored 16:10 picture, since that is what the page crops.
- **Rejected:** a car park, road, sign, banner, fence, railing, construction, event, graduation, logo or map that survives the crop as a band or a subject.
- **Tolerated:** incidental items at about 5% of the frame or less. Each one is named in its verdict.
- **Replacements:** Commons only, CC0, PD, CC BY or CC BY-SA, and at least 1200 px wide.
- **Place.** Every approval and every replacement is checked against the institution's own website, and the URLs are in `checkedAgainst`. A Commons page is never the check.
  - Pages that blocked fetching (HTTP 403 or 410) were read through search results. That applies to Durham, SETU, Leeds, City St George's, UTAS, Griffith and EDHEC.
  - Two checks are only partial. APU's site confirms the campus but never names the clock towers, so that match is by eye. Warwick's pages confirm the buildings but not the pond.

## 1. The 26 new machine picks

| Key | Verdict | Now | Why |
|---|---|---|---|
| dania | reject | panel | A **map of Florida colleges**. Commons has no photo of Campus Viborg. |
| au-utas | approve | Centenary Building | UTAS emblem on the stair tower (about 4%) tolerated. Every other UTAS file has a bigger logo. |
| au-griffith | reject | panel | Name sign and a bike. Kinaba/KGCB colleges are being demolished in 2026 (griffith.edu.au). The other files are signs, doors, a boom gate or a path. |
| au-curtin | **replace** | Curtin eastern walkway Henderson Court.jpg | The pick was a name sign behind a fence, with construction. |
| ca-york | approve | Lassonde (CSE) Building | |
| ca-tmu | reject | panel | Night road, cars and traffic lights. The alternatives are a banner, an aerial where the campus can't be picked out, and a 448 px file. |
| ca-carleton | approve | river aerial | A small parking lot at the edge (about 3%). |
| ca-manitoba | approve | Administration Building | |
| ca-guelph | **replace** | Johnston Hall … (2026).jpg | The pick had a row of parked cars across the building. |
| ca-usask | approve | College Building | |
| ch-eu-business-school | reject | panel | The pick is the old Yvorne château. The record is the Geneva campus, now Pont-Rouge and BAT 43, and Montreux is no longer listed. |
| es-ceu | reject | panel | A pediment close-up of the Colegio Mayor, a hall of residence. The alternatives have a banner, a P sign or scaffolding. |
| gb-qmul | approve | Queens' Building | Round 2 wanted Queen Mary searched. The pick is the right building. |
| gb-birmingham | **replace** | Birmingham MMB 31 … .jpg (Old Joe) | The pick had parked cars under Aston Webb and a white sky. |
| gb-leeds | approve | Parkinson Building | A lamp post, a small direction sign and traffic lights at the bottom (about 3%). The alternatives are worse: a bus, a poster column, a night road, or one window of the Great Hall. |
| gb-city-st-george-s | reject | panel | Sculpture and posters. Every College Building photo has motorbikes, railings or cars along its base. |
| gb-nottingham | **replace** | University Park MMB «76 Trent Building.jpg | The pick was Paton House, a minor villa. |
| gb-ual | **replace** | Granary Square fountain, London.jpg | The pick was a UAL logo shop-front. I did not use the critic's CSM file, which has road markings and a double yellow line. |
| it-cattolica | **replace** | Chiostro Unicatt.jpg (Bramante cloister) | The pick was the facade inscription under a white sky, with a balcony railing. |
| nl-thuas | approve | main building and square | Already in the home reel. |
| nl-auc | approve | Academic Building, Science Park 113 | Round 2 wanted AUC searched. The pick is right. |
| nl-ucu | **replace** | Kromhoutkazerne Voorzijde.jpg | The pick was the iron campus gate. |
| nl-rotterdam-uas | approve | Wijnhaven 99–107 | Facade lettering (about 2%) tolerated. Grey but the best on Commons. |
| nl-fontys | approve | Rachelsmolen | |
| nl-ucr | approve | Middelburg Stadhuis | UCR's own site calls the former city hall its Franklin building. |
| pl-swps | approve | Chodakowska 19/31 | |

**Totals:** 13 approved, 7 replaced, 6 rejected with no replacement.

**Hanze** (`nl-hanze`) has no image record. On Commons:
- the Van Olst tower shot is grey, with a road and a fountain;
- Van DoorenVeste carries its name in big letters;
- the campus aerial is 960 px.

I wrote no line for it, and its card keeps its panel.

## 2. Round 2's named fixes

| Key | Verdict | Now |
|---|---|---|
| fr-edhec | replace | Edhec Business School Lille campus.jpg (critic's pick). **Official image rejected:** giant EDHEC letters |
| no-oslomet | replace | Pilestredet 32, Oslo (OsloMet).jpg (critic's pick). Its facade lettering and two small street signs at the edges are tolerated, because every OsloMet file has a logo, a crossing or barriers. **Official rejected:** students with a laptop, no place |
| se-su | replace | Stockholms universitet, flygfoto 2014-09-20.jpg (critic's pick) |
| lv-rsu | reject, panel | Every Commons file has a fence or a car park, and the official image was already rejected |
| ee-ebs | reject, panel | The 2018 file is a grey street facade with a road |
| ee-tallinn-health-… | reject, panel | The only other file has sleet and road signs |
| be-thomas-more | reject, panel | Place unconfirmed, and it looks like a high street. **Official rejected:** a selfie under a Thomas More sign |
| gb-warwick | replace | Warwick university buildings panoramic … .jpg. The centre crop is the CS building over a lawn and pond |
| gb-oxford | replace | Radcliffe Camera Oxford 2018 01.jpg (from St Mary's tower, 2018, not the fenced 2025 series) |
| jp-apu | replace | Ritsumeikan APU.jpg (clock towers and blossom). The cleaner "- 01" file is 800 px |
| kr-snu | reject, no replacement | SNU's approved official image (the gate against the sky) shows instead. That image is re-approved, with snu.ac.kr in `checkedAgainst` |
| gb-loughborough | replace | Lufbra HazleriggBuilding.jpg |
| jp-meidai | replace | Toyoda Auditorium of Nagoya University 2006.jpg |
| fr-escp | reject, no replacement | 896 px, under the minimum. It would now beat ESCP's approved official image, so the official image shows instead |

Birmingham, UAL, UCU, Leeds, Queen Mary, Nottingham and AUC are covered in section 1.

## 3. Western Europe: official-site checks

These 24 are re-approved, each with the official page that names the building or campus in `checkedAgainst`:

be-ulb, fr-l-x, fr-emlyon, fr-aup, fr-sorbonne, fr-psl, gb-cambridge, gb-lse, gb-kcl, gb-durham, gb-bristol, gb-bath, gb-lancaster, ie-tcd, ie-ul (campus confirmed, building name not), ie-rcsi, ie-mtu, ie-atu, ie-setu, lu-uni-lu, nl-um, nl-rug, nl-tu-e, nl-buas.

**Replaced or rejected instead:**
- fr-edhec, be-thomas-more, gb-warwick and fr-escp are covered in section 2.
- ie-dcu and lu-mudec are **re-stated as reject plus replacement**, with dcu.ie and miamioh.edu added. An approve line would have overridden the pending replacement, and the apply step would then never have fetched it.
- ee-eka is left as iteration 1 wrote it.

Also noted: fr-l-x's Grand Hall closes for renovation from 2026 to 2029.

## 4. Home page: portrait crops

I viewed every door as 9:11 and every reel tile as 4:5, both taken from the stored 16:10 picture.

### Doors

| Door | Key | Verdict |
|---|---|---|
| Denmark | `dk-au` (au-2.webp) | **Fails.** Half sky, a grass bank and a wall. |
| Europe | `gb` | Passes. London at dusk. |
| World | `jp` | Passes. Fuji over Shinjuku. |

The other two doors are city panoramas, so Denmark should be one too. Proposals, best first:

1. **New Commons file:** `Københavns Universitets hovedbygning.jpg` (CC BY 3.0, 3552 px, https://commons.wikimedia.org/wiki/File:K%C3%B8benhavns_Universitets_hovedbygning.jpg).
   - It is the University of Copenhagen's main building on Frue Plads, seen from above with the red roofs of the old city behind.
   - It holds the 9:11 crop.
   - The place is confirmed at universitetshistorie.ku.dk (Frue Plads, main building 1836).
   - There is no KU image record yet, so the coordinator would add one.
2. **Existing, approved:** DTU's gallery picture `dtu-2` (students on the lawn at Lyngby). It is lively, and clean at both 9:11 and 4:5. It is a gallery entry, not a key, so the config would need to point at it or promote it.
3. **Existing key, no code change:** `ruc` (Trekroner lake, lawn and big sky). It is clean at 9:11 but quieter.

### Reel

These are the 12 tiles chosen today by `showcase()`:

| Tile | 4:5 verdict | Proposal |
|---|---|---|
| fi-aalto | **fails**: construction barriers, road signs, a crossing | **Fixed here.** Its main photo is replaced by *Aalto University undergraduate centre on a sunny afternoon in June 2023.jpg*, which holds both 16:10 and 4:5. The old photo broke the rule at 16:10 too. |
| ca-u-of-t | **fails**: grey snow, a parked car, a lamp post | **Fixed here.** Replaced by *University College, University of Toronto.jpg*, which holds both crops. |
| aau | **fails**: a railing sweeps across the lower third | Swap AAU's main photo with its approved gallery picture `aau-2` (waterfront with the footbridge, clean at 4:5 and 16:10). The coordinator should swap them inside the record, so the same picture is not shown twice. The official atrium image cannot stand in, because the reel skips external images. |
| via | **weak**: a small white pavilion on gravel | Drop VIA from the reel, or let the next Danish institution take the slot. `dtu`, `itu` and `ruc` are all clean at 4:5. |
| gb-kcl | borderline: road and a yellow line along the bottom (about 12%) | Acceptable. Replace it if the critic objects. |
| at-wu-vienna | borderline: steel handrails at the bottom | Acceptable, but these are railings. Replace it if the critic objects. |
| sdu, au-melbourne, nl-thuas, jp-waseda, cbs, sg-nus | pass | — |

**Next step:** once `apply-photo-review.mjs` has run, re-run the build and re-check the reel. Approving the 13 picks may change which institution `showcase()` chooses for some regions.

## Not done, and why

- Round 2's circular "checked against its own Commons page" entries in the **world** file were not re-checked. This iteration's brief covered Western Europe only, and they remain a gap.
- No verdict was written for **nl-hanze**, because it has no image record and nothing clean was found.

## Applied

Applied and checked by a separate agent for the coordinator, 24 September 2026. Written as the work happened.

### 1. The apply step

- `node scripts/apply-photo-review.mjs` had already been run once, at 18:14–18:16. That run fetched all 19 replacements in this file, plus `ucph` from `iteration-3-verdicts.jsonl` (see §3 below). Every one of those WebPs is dated 18:14–18:15.
- Re-running it for real changed nothing. `data/images.json` and `data/official-images.json` are byte-identical before and after. No EBUSY.
- **Counts:** 707 verdicts. 454 approved, 125 rejected, 109 replaced, 19 missing.
- **The 19 "missing" are not unfetched replacements.** Each one is a verdict for an institution that is no longer in the data, so it has no image or official record to land on:
  - 12 keys: `ee-eka`, `ee-tartu-ahsu`, `ee-tartu-applied-health-sciences-university`, `is-bifrost`, `is-lbhi`, `is-ru`, `is-unak`, `lu-mudec`, `lv-liepu`, `mt-mdx-malta`, `si-ag`, `si-fis`;
  - 7 official-image verdicts: `si-doba`, `si-fis`, `si-aluo`, `si-ag`, `is-ru`, `is-unak`, `is-holar`.
  - `lu-mudec` was removed from `data/destinations/lu.json` on 24 September: it is a study-abroad centre, not a degree route. `ee-eka` is listed there as having no English-taught bachelor's. So the round-2 §1 "wrong place waiting to ship" and "graffiti cubes" problems are gone because the records are gone, not because a replacement landed.
  - The fetcher correctly does nothing for these two. It only fetches institutions that are in the data. The apply script still prints "replace ee-eka / lu-mudec" and "the previous record is restored" on every run. That message is cosmetic: no record exists to restore.

### 2. Pipeline integrity (critique §1)

`scripts/test-image-records.mjs` was already in the gate as `image-records` (data stage, `scripts/lib/quality-gate.mjs`). It only compared `file` with `page`. It now also fails, for the main picture and every gallery picture, when:

- a picture has a Commons `file` but no author or licence to credit;
- the WebP at `src` is missing, or its bytes or dimensions differ from what the record says was stored. **This is the `ie-dcu` failure.**
- a review names a different file from the one the record holds;
- the latest verdict for an existing record is not applied. This covers a replacement that was never fetched, and an approve/reject that was never signed onto the record.

Verdicts whose record no longer exists are listed as a note, not a failure.

**Mutation-tested** on a scratch copy by re-creating the three round-2 faults:
- `ie-dcu` bytes set to the old 136974;
- a `file` renamed under its old `page`;
- a review left on the pre-replacement file.

All three fail, with messages that name the key. On the real data: **ok, 511 pictures in 492 records, 523 verdicts applied.**

**Credit against Commons (one-off, network, not in the gate):**
- Every one of the 511 Commons pictures was queried through the Commons API (`extmetadata`).
- Its artist and licence were cleaned exactly as `creditFrom()` cleans them, then compared with the record: **0 differences, 0 files missing on Commons.**
- `ie-dcu` now credits SSCOhA / CC BY-SA 4.0 and links `DCU_Glasnevin_Library_in_2009.jpg`. Those are that file's own author and licence.

### 3. Coordinator items

**Denmark door: done.** `homeDoors.denmark.image` in `data/site-config.json` is now `ucph`. It was `dk-au`, which is `au-2.webp`.
- Proposal 1 said there was "no KU image record". That was wrong: `ucph` already existed.
- `iteration-3-verdicts.jsonl` (one line, written at 18:14) rejected ucph's earlier main photo and replaced it with `Københavns Universitets hovedbygning.jpg`. The 18:14 apply run fetched it and signed it approved.
- Checked against the image standard:
  - CC BY 3.0, also GFDL, by Orf3us;
  - 3552 × 2664 on Commons, stored at 1400 × 875;
  - Commons category *Københavns Universitet (Frue Plads)*, geotag 55.6799, 12.5725, which is Frue Plads;
  - its credit matches Commons exactly (§2).
- The 4:5 and 9:11 crops both keep the facade and the red roofs (`applied-4.jpg`).
- **For the critic:** it is shot from Vor Frue's tower at a strong tilt, so the whole frame leans about 15°. It is vivid and unmistakably old Copenhagen, but it is not level.
  - The fallback is DTU's gallery picture `dtu-2`, students on the Lyngby lawn, which is clean at both crops. It would first have to be promoted to a key.
  - UCPH has no English-taught programmes in the data. The door opens the Denmark page, and the picture stands for Copenhagen, as London and Shinjuku do for the other two doors.

**AAU: main photo rejected, not swapped.** The railing is a band at 16:10 as well as at 4:5: it fills about a quarter of the frame. So the photo breaks the rule on AAU's own page too, not only in the reel.
- I did not promote `aau-2` (`AAU Cph.jpg`) to the main photo. It is AAU's Copenhagen campus. None of the four English-taught AAU bachelor's programmes in `data/dk/aau.json` is taught there (they are in Aalborg and Esbjerg), and the reel tile would caption it "Aalborg, Denmark". That breaks "nothing invented".
- Two lines were added to `iteration-3-verdicts.jsonl`:
  - `aau` commons-main: reject;
  - `aau` gallery:1: reject. This is the same railing file stored a second time: `aau.webp` and `aau-4.webp` are byte-identical.
- Applied. AAU's page now shows its approved official atrium image. The reel skips external images, so AAU drops out of the reel with no special case.
- New counts: 453 approved, 127 rejected, 108 replaced, 19 missing (as above).

**VIA out of the reel: done, with a small generic config.** `showcase()` had no way to leave an institution out.
- `data/site-config.json` now has `homeReel.skip`, a list of institution ids, with a `decision` note. `showcase()` in `src/pages/home.mjs` ignores any id on that list, and the next institution in the same group takes the tile.
- No country code or institution name appears in the code. The list is data, like `homeDoors`.
- The list is `["dk-via", "gb-kcl"]`.
  - `gb-kcl` was on it because its road and yellow line are a band along the bottom of the 4:5 crop, about 12%. The iteration's own rule rejects a road that survives the crop as a band. Manchester (Whitworth Hall) takes its tile.
- I tried also skipping `at-wu-vienna` (steel handrails at the bottom) and reverted it. The next Austrian pick, `at-jku`, is a road with parked cars and a give-way sign, which is worse. So WU stays, as a borderline tile.

**Reel now:** fi-aalto, ca-u-of-t, sdu, gb-manchester, au-melbourne, dk-au (`au-2`), nl-thuas, jp-waseda, cbs, at-wu-vienna, sg-nus, ruc.

Because `au-2` is no longer the door, Aarhus enters the reel with it. At 4:5 it is the same view the critique disliked on the door: sky, the ivy wall and the grass bank. It breaks no listed rule, so it stays. `au-3` (the IMF courtyard, ivy) holds 4:5 better, if the critic wants a swap.

### 4. What the built pages show (read as images)

- **Replaced main photos** (`applied-1.jpg`, `applied-2.jpg`): none breaks the rules as a band or as the subject. Borderline, all under about 5%:
  - `no-oslomet`: facade lettering, a no-entry sign, a "40" sign and tram wires at the edges;
  - `fr-edhec`: a row of short wooden bollards along the bottom, and a white sky;
  - `au-curtin`: a striped signpost at the left edge;
  - `jp-meidai`: a white standing board, and grey light;
  - `ie-dcu`: a bike rack in the corner;
  - `gb-ual`: the fountains are the subject, and the Granary is a band behind them.
- **New approved picks** (`applied-3.jpg`):
  - `au-utas`: the UTAS logo on the stair tower is prominent, more than the 4% the verdict says. Borderline logo.
  - `gb-leeds`: a lamp post and traffic lights.
  - `nl-rotterdam-uas`: a quay railing at the right edge.
  - The rest are clean.
- **Home page** (`applied-4.jpg`, `applied-5.jpg`): each photo is shown at 16:10, then at the 4:5 reel crop and the 9:11 door crop.
  - The doors are ucph, gb and jp.
  - Reel: fi-aalto and ca-u-of-t (both new) are clean. fi-aalto is half empty plaza with a lamp post. `sdu` has cars at 16:10, but they fall outside the 4:5 crop.

**Found in passing, not changed (outside this brief):**
- `ucph` gallery 2 is *Copenhagen Pride Parade 2023 51.jpg*: a UCPH banner at an event. The event and banner rules say no. I left it for the coordinator. **Correction (photo iteration 4):** this line first said the picture "carries a human approval". It did not: its review was signed by the automated reviewer, and no record holds a human approval. It was rejected in iteration 4.
- `at-jku` main (*Linz - JKU - Science Park 2.jpg*) is approved and live on the Austria page. A road and a car park take the bottom third, with parked cars and a give-way sign. It breaks the rules and should be rejected or replaced.
- `sdu` main shows parked cars at the bottom right at 16:10 (about 5%), on SDU's own page.

### 5. Gate

`SITE_BASE=/IB-Post-Secondary-Opportunities node scripts/qa.mjs`: **all 28 checks pass**. `freshness` reports its usual advisory note.
- The first attempt failed at `build` with EBUSY (the OneDrive lock) on one `dist/programmes/*` file. Git Bash had also rewritten `SITE_BASE` into a Windows path.
- It was re-run from PowerShell and passed.

### Files touched

- `scripts/test-image-records.mjs`: extended as described in §2.
- `scripts/apply-photo-review.mjs`: a replacement with no record left to restore now says so, instead of "the previous record is restored".
- `docs/research/photo-review/iteration-3-verdicts.jsonl`: the two AAU lines.
- `data/images.json`: the `aau` main and gallery 1 reviews, via the apply script.
- `data/site-config.json`: the Denmark door, and `homeReel.skip`.
- `src/pages/home.mjs`: `showcase()` reads `homeReel.skip`.
- `docs/research/qa/photos/round-2/applied-1..5.jpg`: the contact sheets.
