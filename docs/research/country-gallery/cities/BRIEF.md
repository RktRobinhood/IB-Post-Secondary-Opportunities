# Country carousels: the places you could study (October 2026)

The owner, 14 October 2026: the country carousels should "focus on the areas
of the country where there are universities so we can have like each city or
region represented as well as some touristy stuff… it's important to be
showing the areas that people could study in."

`worklist.json` lists, per country, every city that holds a university on the
site (with those universities) and the captions of the gallery it has now
(those are mostly nature and culture shots; they stay as the "touristy" part).

## What to find

For each country in your list, one photograph **per study city or region**:

- **Group first.** Neighbourhoods and campuses of one metropolis are one city
  (Singapore's districts → Singapore; Hong Kong's → Hong Kong, or Hong Kong
  Island and Kowloon). Where a country has more than **7** places, keep the
  7 that hold the most universities and fold small neighbouring towns into a
  region ("Twente: Enschede", "the Ruhr"). Fewer is fine for a country with
  one or two cities: then add a second view of the same city from a
  different angle (old town / waterfront / a street at night), up to 3.
- **What the picture is:** the recognisable face of that city as a place to
  live — old town, main square, waterfront, skyline, a lively street, a park
  students use. It may include a university building if that is the city's
  landmark. No maps, no aerial blurs, no empty car parks, no night shots so
  dark nothing reads, no people as the subject, no text or watermarks.
- **Quality:** Wikimedia Commons, freely licensed (CC BY, CC BY-SA, CC0,
  public domain), landscape, at least 1600 px wide, sharp. Prefer Quality or
  Featured images, daylight, colour.
- **Be aggressive, not precious:** every study city gets a photo if Commons
  has any decent one. Choose carefully only when there are several good
  candidates.

## How to search and check

Commons API (via WebFetch or curl), for example:

    https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch=Groningen%20Grote%20Markt&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800

Also useful: the city's Wikipedia article's lead image and the Commons
category "Category:<City>" / "Quality images of <City>". **Look at every
picture before choosing it:** download the 800 px thumbnail (`thumburl`) to
`D:/ibp-tmp/gallery/` with curl and Read it. Never pick unseen.

## Record each pick as you go (the session can end)

Append one line per photograph to your batch file `batch-<letter>.jsonl` in
this folder:

    {"country":"nl","city":"Groningen","commonsFile":"Grote Markt Groningen.jpg","caption":"Groningen's Grote Markt","theme":"city","why":"Brick gables and the Martinitoren over the main square, cafés open: the city's student heart.","licence":"CC BY-SA 4.0","width":4000,"height":2667}

- `commonsFile`: the file name without "File:".
- `caption`: under 40 characters, the place, no adjectives ("Ghent's Graslei
  at dusk", "Trondheim from Bakklandet").
- `why`: one line, what it shows.
- A study city with no usable photo: `{"country":"nl","city":"…","none":true,"tried":"…"}`.

Before starting, read your batch file if it exists and skip cities already
done. Temporary files only under `D:/ibp-tmp` (never C:). No git, no edits
outside your batch file. Reply at the end with: countries done, photos found,
cities with none.
