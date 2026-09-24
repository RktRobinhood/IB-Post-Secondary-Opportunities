# Photo curation log

A record of photographs replaced or removed by hand-curation, newest session
first. Each replacement went through the fetcher's own code: the scorer
(`scoreDetail`), credit (`creditFrom`) and download/normalise (`download` →
`normalise()`) were sliced verbatim out of `scripts/fetch-images.mjs` by a
throwaway script, so every new record has the exact shape, dimensions, WebP
quality ladder and honest `score` the fetcher would have produced. Nothing was
approved: every replacement is an unreviewed machine pick that clears the floor
of 40 on score alone, and still needs a person's eye (`npm run images:review`).

Main (hero/card) records were given `"pin": true` so that a bare
`npm run images -- --refresh` does not re-pick the weaker photograph. Note that
re-fetching a pinned entry with `--only=<key>` sets its score to null (the
fetcher does not score pins), which withholds it until someone approves it.

## 2026-09-24 — country heroes and Danish institutions

Method: contact sheets of all 35 country photos and all 31 Danish institution
photos (main + gallery) were built with `sharp` and looked at; the weak ones
are listed below. Candidates came from Commons category listings and searches,
filtered to CC BY / CC BY-SA / CC0 / public domain, landscape, ≥1200 px, and
were previewed at the 16:10 centre crop the site uses.

### Replaced

| Key | Old file | New file | Why | Score | Commons page |
|---|---|---|---|---|---|
| `se` (country) | Campus 1477.jpg (`se.webp`) | Kornhamnstorg March 2026 01.jpg | Old picture was a car park and a black box building. New: Gamla stan waterfront in sunshine, a Featured Picture. The old one carried an approval by "editorial review"; it does not carry to the new file. | 72 | https://commons.wikimedia.org/wiki/File:Kornhamnstorg_March_2026_01.jpg |
| `at` (country) | Wien katedra sw Szczepana widok z wiezy 6.jpg (`at.webp`) | Technische Universität Wien mainbuilding mainentrance northview.jpg | Hazy grey rooftops and office blocks. New: TU Wien main building on Karlsplatz, blue sky. | 60 | https://commons.wikimedia.org/wiki/File:Technische_Universit%C3%A4t_Wien_mainbuilding_mainentrance_northview.jpg |
| `ch` (country) | Berne (47580625362).jpg (`ch.webp`) | Zürich view Quaibrücke 20200702.jpg | Hazy, framed by bare branches, a dog in the corner. New: Zürich old town and the Limmat from the Quaibrücke in summer, a Featured Picture. | 44 | https://commons.wikimedia.org/wiki/File:Z%C3%BCrich_view_Quaibr%C3%BCcke_20200702.jpg |
| `no` (country) | View from siloen.jpg (`no.webp`) | Oslo Opera House 2023 2.jpg | Grey rooftops of an Oslo residential district. New: the Opera House in sunshine with people on the roof. | 54 | https://commons.wikimedia.org/wiki/File:Oslo_Opera_House_2023_2.jpg |
| `us` (country) | Aerial view of White House and downtown, Washington, D.C LCCN2010630891.jpg (`us.webp`) | Healy Hall, Georgetown University, Georgetown, Washington, DC (39641784583).jpg | Hazy Library-of-Congress aerial of the Ellipse; not a place a student would study. New: Georgetown's Healy Hall, blue sky. | 70 | https://commons.wikimedia.org/wiki/File:Healy_Hall,_Georgetown_University,_Georgetown,_Washington,_DC_(39641784583).jpg |
| `sg` (country) | Raffles Place.jpg (`sg.webp`) | ArtScience Museum, Marina Bay Sands, Singapore.jpg | Fisheye-distorted office towers. New: ArtScience Museum and the Marina Bay skyline by day, a Featured Picture. | 54 | https://commons.wikimedia.org/wiki/File:ArtScience_Museum,_Marina_Bay_Sands,_Singapore.jpg |
| `pt` (country) | Lisboa837.png (`pt.webp`) | Lisboa April 2014-13a.jpg | Heavily over-processed HDR with an orange cast. New: Praça do Comércio and the Tagus in daylight. | 44 | https://commons.wikimedia.org/wiki/File:Lisboa_April_2014-13a.jpg |
| `dk-au` main | IMF AU.jpg (`au-2.webp`) | Aarhus Universitets hovedbygning set fra parken.jpg | The old main was fine but a side courtyard; the new one is AU's recognisable image, the main building and the University Park amphitheatre in sun. The old main moved to the gallery (next row). | 42 | https://commons.wikimedia.org/wiki/File:Aarhus_Universitets_hovedbygning_set_fra_parken.jpg |
| `dk-au#2` | Aarhus University, winter.jpg (`au-3.webp`) | IMF AU.jpg | Grey snow scene. Replaced with the former main photo, the ivy-covered courtyard in sun. | 85 | https://commons.wikimedia.org/wiki/File:IMF_AU.jpg |
| `dk-au#3` | Trappe til nordre ringgade.jpg (`au-4.webp`) | Aarhus Universitet (Jura) 01.jpg | A dark brick stairwell/tunnel. New: the Law building in autumn sun. | 70 | https://commons.wikimedia.org/wiki/File:Aarhus_Universitet_(Jura)_01.jpg |
| `aau#2` | Aalborg University from above.jpg (`aau-2.webp`) | AAU Cph.jpg | An aerial of fields from a plane window. New: AAU's Copenhagen campus on the harbour, blue sky. | 44 | https://commons.wikimedia.org/wiki/File:AAU_Cph.jpg |
| `cbs` main | Copenhagen business school.jpg (`cbs.webp`) | Shades (7530255902).jpg | Plain building beside a cycle path. New: CBS's Kilen building, facade shades in evening sun. | 44 | https://commons.wikimedia.org/wiki/File:Shades_(7530255902).jpg |
| `dtu#2` | DTU 03-05-06 03.jpg (`dtu-2.webp`) | 180904 studenter vid DTU 8361 (44186358965).jpg | A road and a car park in front of a distant building. New: students on the campus lawn in sunshine. | 44 | https://commons.wikimedia.org/wiki/File:180904_studenter_vid_DTU_8361_(44186358965).jpg |
| `dtu#3` | DTU exam building 101 photo 1.jpg (`dtu-3.webp`) | DTU, bygning 202, 2026 (1).jpg | Near-duplicate of the exam-hall slide after it (backs of students). New: DTU building 202, blue sky. | 44 | https://commons.wikimedia.org/wiki/File:DTU,_bygning_202,_2026_(1).jpg |
| `ruc#4` | Roskilde University.png (`ruc-4.webp`) | Roskilde ruc mpazdziora.JPG | Near-duplicate of the slide before it (same facade, same flagpole). New: the glass atrium looking out on campus. | 42 | https://commons.wikimedia.org/wiki/File:Roskilde_ruc_mpazdziora.JPG |
| `sdu` main | Syddansk Universitet Odense Campusvej mod syd.jpg (`sdu.webp`) | Syddansk universitet.Campus Kolding.Denmark.2014 (37).JPG | Dark brown concrete under a white sky. New: SDU's Campus Kolding (Henning Larsen), blue sky. | 42 | https://commons.wikimedia.org/wiki/File:Syddansk_universitet.Campus_Kolding.Denmark.2014_(37).JPG |
| `ucph#2` | Hoofdgebouw van de Universiteit van Kopenhagen … RP-F-F12400.jpg (`ucph-2.webp`) | Festhalen University of Copenhag.jpg | A sepia 19th-century stereoscope card (already rejected by a reviewer, so not shown). New: the main building's painted ceremonial hall. | 42 | https://commons.wikimedia.org/wiki/File:Festhalen_University_of_Copenhag.jpg |
| `ucph#4` | Copenhagen Pride Parade 2023 52.jpg (`ucph-4.webp`) | Royal Veterinary and Agricultural University - Main Building.jpg | A second Pride frame duplicating the approved one before it. New: the Frederiksberg Campus main building. | 42 | https://commons.wikimedia.org/wiki/File:Royal_Veterinary_and_Agricultural_University_-_Main_Building.jpg |

### Removed from galleries (file deleted)

| Key | File | Why | Commons page |
|---|---|---|---|
| `aau` (was `aau#3`) | Universitetsatrium, Rendsburggade 14, Aalborg.jpg (`aau-3.webp`) | Grey building, grey sky, empty road; no better Aalborg photo on Commons. | https://commons.wikimedia.org/wiki/File:Universitetsatrium,_Rendsburggade_14,_Aalborg.jpg |
| `cbs` (was `cbs#3`) | NextGen ungdomspanel Oresundskomiteen 20121011 99F (8198878111).jpg (`cbs-3.webp`) | A panel event, not a place. | https://commons.wikimedia.org/wiki/File:NextGen_ungdomspanel_Oresundskomiteen_20121011_99F_(8198878111).jpg |
| `itu` (was `itu#4`) | IT Universität Kopenhagen.jpg (`itu-4.webp`) | Low-quality, tightly cropped fragment of the atrium. | https://commons.wikimedia.org/wiki/File:IT_Universit%C3%A4t_Kopenhagen.jpg |
| `sdu` (was `sdu#2`) | Prof Baisya as visiting professor at University of South Denmark.png (`sdu-2.webp`) | Lecture slide (already rejected by a reviewer). | https://commons.wikimedia.org/wiki/File:Prof_Baisya_as_visiting_professor_at_University_of_South_Denmark.png |

Gallery addresses after a removal shift down (e.g. `sdu#3` is now `sdu#2`); reviews are tied to filenames, not addresses, so none were lost.

### Looked at and left alone, for a person to decide

- `hk` (approved): a dim, brown-brick close-up of the Run Run Shaw Building. A brighter
  colour photograph of the HKU Main Building exists
  (https://commons.wikimedia.org/wiki/File:Main_Building_HKU_20100926_03.JPG). Not replaced,
  because a reviewer approved the current one.
- `ca` (approved): CN Tower and a dark Convocation Hall against brown grass; acceptable.
- `nz` (approved): a small white lodge; bright and on-subject.
- `aau` main: AAU building behind a car park, blue sky. Commons has nothing better of the Aalborg campus.
- `cbs#2`, `ruc#2`: grey-sky campus photos; dull but accurate, no better replacement that clears the floor.
- `ruc#2`: "Trekroner Sø 06.jpg" (the campus across the lake, bright) would be better, but scores 12 (see below).

### A scorer false positive found on the way

The `wayfinding or floor plan` penalty (−28) in `scripts/fetch-images.mjs` tests
`/location of\b/` against the filename **and the Commons categories**. Commons
now adds the maintenance category "Files with coordinates missing SDC location
of creation" to many uploads, so ordinary photographs are penalised as floor
plans. This knocked several of the best candidates under the floor (Lund
University main building 32, Odense hovedindgangen 16, SDU Kolding 2015 16,
Trekroner Sø 06 12, Harvard Yard 16) and may be silently depressing re-picks
elsewhere. It was not changed here (source files were out of scope); the fix
is to test that rule against the filename and description only, or to strip
`SDC location of creation` from the categories before testing.
