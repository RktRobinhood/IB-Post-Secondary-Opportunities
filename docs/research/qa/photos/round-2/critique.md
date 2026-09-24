# Photo round 2: photo editor's critique

**SCORE: 7 / 10.** Not yet. Under `docs/QA_CRITIC_LOOP.md` this needs another iteration and a fresh critic.

Critic: photo editor (Claude, round 2 of the photo loop, fresh agent), 24 September 2026.
Judged:
- the 147 main replacements (`round-2/replaced-1..5.jpg`);
- every verdict file in `docs/research/photo-review/` (iteration-1 is the last one read);
- `data/images.json` and `data/official-images.json`;
- a fresh `node src/build.mjs`, and what it renders on `dist/destinations/{nl,gb,se,jp}/index.html` and on the home page (`dist/index.html`: hero, three doors, twelve reel tiles).

I checked place through the Commons API (categories, description and geotag for about 45 files) and against official sites where it mattered.

## Verdict in one paragraph

The replacement pass is a real step up. It is the first time Nordic/Baltic and Western Europe have been looked at, and the new set has a lot to be proud of:
- Latvia's main building, NMBU in daffodils and SLU's yellow Biocentrum;
- Iceland's Aðalbygging, TU/e reflected in water, and Trinity's Campanile;
- King's College Chapel, Palazzo Poggi and Coimbra;
- Berkeley's Sather Tower, and Yonsei and Korea University in autumn.

**No card that a student can see today shows the wrong institution.** Three things still keep it off 8:
1. **The apply step silently failed on three keys.** The record now says "approved file X" while the site serves the old, rejected image, with the old credit.
2. **Many of the new photographs never reach a student.** An approved official share image always wins. The Commons replacements for Uppsala, Groningen, Lancaster, LSE, KCL and KI are hidden behind stock shots of people with laptops, and those show no place at all.
3. **Coverage.** 14 of the 73 cards on the four pages I built are typographic panels. On the Netherlands page it is 7 of 22, and on the UK page it is 6 of 22, including Birmingham, Leeds, Nottingham, Queen Mary and UAL. None of these institutions has an image record at all, although Commons has good photos of them.

A fourth, smaller problem: the "no car, sign, banner, railing" rule from iteration 1 was applied only to the keys the round-1 critic named. The new regional approvals still let through name boards, banners, road signs, cars and a graduation ceremony, and EDHEC's banner is even praised as a feature.

## 1. Pipeline integrity: approved file ≠ published file (must fix)

`data/images.json` has three records where `file` and `review.file` name the approved replacement, but `page`, `author`, `licence`, `description` and the WebP on disk are still the **rejected** original. The WebPs for `lu-mudec` and `ee-eka` are dated 22 September. The replacement was never fetched, and nothing checked that it had been.

| Key | Record says (approved) | Actually served | Student-visible? |
|---|---|---|---|
| `lu-mudec` | Differdange Castle7.JPG (the castle MUDEC is in) | **Farmer School of Business, Oxford, Ohio**, which the verdict itself rejects as "wrong place" | Not today: MUDEC is on no destination page. It is a wrong institution waiting to ship the day MUDEC is added. |
| `ee-eka` | EKA building with tower, 8005 px | the rejected photo of two graffiti cubes in a park | Not today: EKA is on no page |
| `ie-dcu` | DCU Glasnevin Library in 2009.jpg | the WebP *is* the library (bytes on disk 147020 ≠ record 136974), but the credit on `/destinations/ie/` names "SSCOhA" and links the **editathon** file | **Yes.** The CC BY-SA attribution is wrong on a live page |

Checks on the three records:
- For all 478 records I compared the basename of `file` with that of `page`: these three are the only mismatches.
- For all 478 records I compared the recorded `bytes` with the file on disk: `ie-dcu` is the only mismatch.

Fix: make `scripts/apply-photo-review.mjs` fail when a replacement has not been downloaded, or when `page`'s basename ≠ `file`. Then re-run it for these three.

## 2. Spot-checks: replacements (43, all regions)

Method: for each file I read its Commons categories, description and geotag. I checked the official site where the place was in doubt, and looked at the image on the contact sheet or the built page.

### Nordic and Baltic (not seen in round 1)

| Key | File | Place | Look | Verdict |
|---|---|---|---|---|
| ee-taltech | Tallinna Tehnikaülikooli peahoone.jpg | cat. Quarter of TalTech ✓ | Main building across the paved square | OK |
| ee-tlu | Tallinn University Mare.JPG | cat. University of Tallinn campus, Uus-Sadama 5 ✓ | Underside of a cantilever; half the frame is soffit | OK, dull. `checkedAgainst` is empty |
| ee-tallinn-health-… | Tallinna Tervishoiu Kõrgkool -Kännu 67.jpg | Kännu 67 = official main building (ttk.ee) ✓ | Parked cars, a kerb, a road sign and asphalt fill the lower third | **WEAK** (cars/car park) |
| ee-ebs | Estonian Business School.JPG | cat. EBS, geotag on A. Lauteri ✓ | A no-entry road sign and a fence in the right foreground; grey Stalinist block | **WEAK** (sign) |
| ee-eka | (see §1) | ✓ building | Graffiti cubes still served | **PIPELINE** |
| lt-vmu | VDU Grand Hall by Augustas Didzgalvis.jpg | cat. Central building of VMU ✓ | Busy aerial of the building and square; lively | OK |
| lt-ism | ISM by Augustas Didzgalvis.jpg | cat. ISM … in Vilnius ✓ | Aerial of red roofs and courtyard | OK |
| lt-mru | Fasadas wikipedijai.jpg | cat. MRU ✓ | Sunny, with a logo and flags on the building | OK |
| lv-lu | Latvijas Universitāte - ogre11.jpg | cat. LU main building, geotag ✓ | Gothic facade, lawn, blue sky | OK (strong) |
| lv-rsu | Dzirciema street.jpg | cat. RSU ✓ | Frame dominated by the "RĪGAS STRADIŅA UNIVERSITĀTE" name board and an "ATVĒRTI PASAULEI" slogan over a shopfront-like entrance | **WEAK** (name board and slogan) |
| lv-rtu | Riga Technical University.jpg | cat. RTU, Ķīpsala ✓ | Bollards across the bottom; RTU lettering | OK, borderline |
| no-oslomet | OsloMet (Storbyuniversitetet), Pilestredet.jpg | cat. Pilestredet 32 ✓ | Street with a car, a van and tram wires across the bottom | **WEAK** (cars) |
| no-uis | Universitetsbiblioteket i Stavanger.jpg | cat. University of Stavanger ✓ | Interior lounge with hanging chairs; warm | OK |
| no-inn | Høgskolen I Innlandet, studiested Hamar.jpg | cat. INN Hamar ✓ | Gabled buildings; road and signpost bottom right | OK |
| no-nmbu | UMB Aas NLH … .jpg | cat. NMBU, geotag Ås ✓ | Red brick with a daffodil lawn | OK (strong) |
| no-uit | Avdeling for arktisk biologi … 2022.jpg | cat. Breivika campus ✓ | A road takes the left third | OK, dull |
| se-su | Södra huset 2014.JPG | cat. Södra huset, geotag ✓ | **A meadow with distant white slabs.** It reads as a housing estate, not a university | **WEAK** |
| se-uu | Universitetshuset.jpg | cat. Universitetshuset ✓ | Strong | OK, but **never shown**: the official makerspace photo wins |
| se-slu | Biocentrum SLU January 2013 02.jpg | cat. SLU, geotag Ultuna ✓ | Yellow glass in snow and sun | OK |
| fi-tau | Tampere University Kampusareena Hervanta.jpg | cat. Tampere University ✓ | Carries a big logo pylon | OK, borderline |
| fi-metropolia | Myllypuro campus.jpg | cat. Metropolia ✓ | Grey striped building, empty forecourt | OK, dull |
| is-hi | UniversityIceland.JPG | cat. UI main building, geotag ✓ | Symmetrical, lawn, blue sky | OK |

### Western Europe (not seen in round 1)

| Key | File | Place | Look | Verdict |
|---|---|---|---|---|
| lu-mudec | (see §1) | served photo is Oxford, Ohio | | **WRONG PLACE (latent)** |
| lu-uni-lu | Belval Campus - University of Luxembourg.jpg | cat. Belval ✓ | Maison du Savoir tower with the blast furnaces; industrial but distinctive | OK |
| be-thomas-more | Thomas More Lier.jpg | Commons says only "School building in Lier". The Lier campus is Antwerpsestraat 99 (thomasmore.be), which I could not match | Posters, bunting and a shop-sign facade; looks like a high street | **WEAK**, place unconfirmed |
| be-uhasselt | Acienne Prison.jpg | cat. Hasselt University ✓ (uhasselt.be checked) | Old prison gate, students walking out; UHasselt banners | OK |
| be-ulb | Photo ULB - ULB Communication Department.jpg | cat. Bâtiment A (ULB) ✓ | Students on the lawn in front of Bâtiment A | OK (strong) |
| fr-edhec | EDHEC, quartier Arenas.jpg | cat. EDHEC, geotag Nice ✓ | A huge pink **EDHEC banner** dominates the upper right. The verdict *praises* the banner | **WEAK** (banner) |
| fr-escp | Escp-Berlin.jpg | cat. ESCP ✓, but the **Berlin** campus. The verdict rejected the Madrid photo for "not the French campus" | 896 px stored, soft. ESCP's approved official image shows first, so only the fallback is affected | OK as a fallback; inconsistent reasoning |
| fr-l-x | Le grand hall de l'Ecole polytechnique.jpg | cat. Paris-Saclay; © École polytechnique ✓ | A crowd walking at you through a white hall. It reads as a brochure, not a place | OK, borderline |
| fr-psl | ENS Ulm cour Ernests DSC00106.jpg | cat. ENS Paris ✓ | Leafy cloister | OK |
| gb-warwick | Amphitheatre, Warwick University.JPG | Commons: "on the **first day of the academic year**" ✓ | Packed crowd on steps; an event, not the place | **WEAK** (event) |
| gb-bristol | Wills Memorial Building … RaBoe 197.jpg | ✓ | A white car and traffic lights at the bottom | OK, borderline |
| gb-lancaster | Charles Carter Building.jpg | cat. Lancaster, geotag ✓ | Clean | OK, but **never shown**: the official library photo wins |
| nl-buas | … P1500430.jpg | Mgr. Hopmansstraat 2 = BUas campus (buas.nl) ✓ | Lawn, low building | OK |
| nl-um | 2021 Maastricht, Tapijnterrein (1).jpg | cat. Tapijnkazerne, geotag ✓ | Sunny lawns | OK |
| nl-tu-e | Overview of TU Eindhoven.jpg | cat. TU/e, geotag ✓ | Reflected in water | OK (strong) |
| ie-mtu | CIT Administrative Centre 6 June 2018.jpg | cat. Cork IT (now MTU) ✓ | Red brick against lawn | OK |
| ie-setu | Waterford Institute of Technology, 2021 08.jpg | cat. WIT, geotag ✓ | Curved glass | OK |
| ie-atu | ATU, Galway Campus, 2022-05-15 02.jpg | cat. GMIT, geotag ✓ | Trees and lawn | OK |
| ie-dcu | (see §1) | ✓ | Good photo, wrong credit | **CREDIT WRONG** |

### Rest of the world (sample)

| Key | Verdict |
|---|---|
| au-anu (Kambri precinct, cat. ✓) | OK |
| hk-lingnan (cat. HKLN campus ✓, aerial) | OK |
| ae-nyuad (geotag Saadiyat ✓, NYUAD lettering) | OK. The "check" cites the file's own Commons page |
| kr-snu | **WEAK**: still the gate across a road, with a bus. Flagged in round 1 and not fixed |

**Totals: 0 wrong place among the photos a student sees. 1 wrong place latent (lu-mudec), 1 wrong credit live (ie-dcu), 11 WEAK, the rest OK.**

**Verification gaps.** Nordic/Baltic was done properly: nearly every replacement names the official site. **Western Europe was not.** 29 of its 31 replacements have no official-site check (only be-uhasselt and lu-mudec have one). Most of the world replacements are "checked" against their own Commons file or category, which is circular. This is the same gap round 1 found for Central Europe.

## 3. What students actually see (built pages)

`node src/build.mjs` wrote 152 pages. Cards with a typographic panel instead of a photo:

| Page | Panels / cards | Which |
|---|---|---|
| `/destinations/nl/` | **7 / 22** | Hanze, The Hague UAS, Amsterdam University College, University College Utrecht, Rotterdam UAS, Fontys, University College Roosevelt |
| `/destinations/gb/` | **6 / 22** | Queen Mary, Birmingham, Leeds, City St George's, Nottingham, University of the Arts London |
| `/destinations/se/` | 0 / 14 | |
| `/destinations/jp/` | 1 / 15 | Temple University Japan |

Across the site it is 59 of 455 cards. The worst pages are ae (10/14), mt (3/6) and si (3/7).

**Is that acceptable?**
- For a small school with nothing usable on Commons (Temple Japan, UCR, which has only event photos), yes: the panel is the designed outcome.
- For Birmingham, Leeds, Nottingham, QMUL, UAL, UCU and AUC, **no**. None of them has a record in `images.json` or `official-images.json`, so they were never searched. They were added after the photo pass.
- A third of the Netherlands page blank reads as unfinished.

**Official images beat better Commons photos.** `picture()` in `src/lib/data.mjs` prefers any approved official share image. On these four pages:
- 8 of 15 NL photos are official;
- 7 of 14 SE photos are official;
- 4 of 16 GB photos are official.

Several of those show **no place at all**:

| Page | Official images with no place |
|---|---|
| NL | RUG: a student with a laptop among plants. HvA: a selfie-style portrait. Erasmus: a reader seen from above. UvA: a corridor |
| SE | Uppsala: a makerspace. Chalmers: a whiteboard. Gothenburg: a girl in headphones. Umeå: a portrait. KI: a sofa |
| GB | Manchester: three students in a bar |

Leiden's official image is a flag carrying the university logo, which is the subject of the photo. It also returned HTML, not an image, to a script fetch. It does load in a browser, but it is a hotlink.

As a result, approved replacements that are better pictures never show: `se-uu` (Universitetshuset), `nl-rug` (the Academiegebouw), `gb-lancaster`, `gb-lse`, `gb-kcl`, `se-ki`, `nl-leiden` (Rapenburg 73). A 17-year-old stops for Uppsala's Universitetshuset, not for a stock photo of students at a workbench.

**Other weak cards on these pages** (not new, but live):
- `gb-oxford`: a **graduation procession**. The events rule applies, and it is approved as "lively".
- `gb-loughborough`: a gate across a road with "KEEP CLEAR" markings.
- `jp-apu`: an aerial whose centre is a car park.
- `jp-meidai`: a bus in front.
- `jp-kyudai`: a road with cars.
- `jp-tohoku`: steps with a name sign.
- `se-lu`: BMC, plain industrial brick, for Lund of all places.
- `se-liu`: flagpoles and an empty turning circle.

**Home page.**
- The hero (TU Delft library) is excellent.
- Two of the doors are excellent: London at dusk and Fuji over Shinjuku.
- **The Denmark door (`au-2`) is the weakest of the three.** In the tall crop it shows half sky, a grass bank and a wall. Denmark is meant to be prominent.
- 4 of the 12 reel tiles break the brief:
  - `aau`: a metal **railing** sweeps across the lower third in the 4:5 crop;
  - `fi-aalto`: red-and-white **construction barriers** and a road sign;
  - `ca-u-of-t`: grey snow and a parked car;
  - `via`: a small white pavilion on gravel.

**Note:** the reel (600×750) and the doors (900×1100) are portrait crops. Not everything is 16:10. The reviewer judged only the 16:10 crop, which is how the AAU railing got through.

## Top fixes (in order of impact)

1. **Fix the apply step and re-run it** (§1). Fetch the approved files, and fail the build when `file` ≠ the basename of `page`, or when the recorded bytes ≠ the file on disk.
   - `lu-mudec` → https://commons.wikimedia.org/wiki/File:Differdange_Castle7.JPG (CC0; I viewed it: the castle with blossom, clean)
   - `ee-eka` → https://commons.wikimedia.org/wiki/File:Eesti_Kunstiakadeemia_hoone_v%C3%A4lisvaade_ristmikult.jpg
   - `ie-dcu`: rewrite the author, licence and page to https://commons.wikimedia.org/wiki/File:DCU_Glasnevin_Library_in_2009.jpg
2. **Stop people-only official images beating an approved campus photo.** Either reject official images that show no recognisable building or place (the rule already used for si-um and de-mannheim), or make `picture()` prefer an approved Commons photo whose review marks it as the place. Keys affected now: nl-rug, nl-auas-hva, nl-eur, nl-uva, se-uu, se-chalmers, se-gu, se-umu, se-ki, gb-manchester, gb-lancaster, gb-kcl, and nl-leiden (logo flag).
3. **Fill the panels on NL and GB.** These are candidates I viewed at 16:10, all clean:
   - Birmingham: https://commons.wikimedia.org/wiki/File:Birmingham_MMB_31_University_of_Birmingham.jpg (Old Joe over greenery)
   - UAL: https://commons.wikimedia.org/wiki/File:Central_saint_martins_kings_cross_campus.jpg (the Granary, blue sky, fountains)
   - University College Utrecht: https://commons.wikimedia.org/wiki/File:Kromhoutkazerne_Voorzijde.jpg

   For Leeds (Parkinson Building), Queen Mary (Queens' Building, Mile End), Nottingham (Trent Building, University Park), Hanze (Zernike campus) and AUC (Science Park), search their Commons categories. Avoid "Amsterdam University College, brug (1)", which has a railing. Also check each institution's own share image.
4. **Apply the 20% rule to the new regions.** For each key below, re-judge and prefer the official image or the named Commons file:
   - `fr-edhec` → https://commons.wikimedia.org/wiki/File:Edhec_Business_School_Lille_campus.jpg (curved glass of the Lille campus, no banner; viewed)
   - `no-oslomet` → https://commons.wikimedia.org/wiki/File:Pilestredet_32,_Oslo_(OsloMet).jpg (same building, no cars; viewed)
   - `se-su` → https://commons.wikimedia.org/wiki/File:Stockholms_universitet,_flygfoto_2014-09-20.jpg (aerial of the whole Frescati campus; viewed)
   - `lv-rsu`, `ee-ebs`, `ee-tallinn-health-university-of-applied-sciences`: Commons has nothing clean for these. "Estonian Business school.jpg" has a motorbike and flags; "Rīgas Stradiņa universitāte 01.JPG" has a fence in snow. Use the official share images, or accept a panel.
   - `be-thomas-more`: place unconfirmed and looks like a high street; use the official image.
   - `gb-warwick`: first-day crowd; choose a campus view.
5. **Remove the events and car parks that are still live.**
   - `gb-oxford`: graduation. Use a Radcliffe Square view from https://commons.wikimedia.org/wiki/Category:Radcliffe_Camera, but not the 2025 "1099146 …0001" series, which has construction fencing.
   - `jp-apu`: car park.
   - `kr-snu`: bus and road, carried over from round 1.
   - `gb-loughborough`: road markings.
   - `jp-meidai`: bus.
6. **Home page.**
   - Replace the Denmark door with a Danish photo that holds a **portrait** crop, e.g. Aarhus University's main building and park lawn, or KU's Frue Plads.
   - Swap the reel's `aau` and `fi-aalto` tiles for photos with no railing or barrier; the AAU official atrium is already approved.
   - Make the reviewer judge the 4:5 and 9:11 crops for every photo that can appear on the home page.
7. **Western Europe verification.** Fill `checkedAgainst` with an official page for the 29 unchecked West replacements, starting with be-thomas-more, fr-escp and gb-warwick, and replace the circular "checked against its own file page" entries in the world file.

If fixes 1–4 are made, the site stops hiding its best photographs and stops showing blank cards for well-known universities. I would expect the next round to reach 8.
