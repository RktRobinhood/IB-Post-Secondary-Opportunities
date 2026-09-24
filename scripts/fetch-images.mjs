/**
 * Finds a photograph for every institution and destination, downloads a
 * web-sized copy, and records who took it and under what licence.
 *
 * How a picture is chosen:
 *   1. Look the subject up on Wikipedia and follow it to its Wikidata item.
 *   2. Take the item's "image" (P18) — the community's own pick for the
 *      representative photo. This is far better than a Commons keyword search,
 *      which mostly returns nearby roadworks.
 *   3. Widen with the subject's Commons category (P373) and score every
 *      candidate on size, aspect ratio, filename and whether Commons has
 *      flagged it as a Quality or Featured picture.
 *   4. Download the winner at a web-sized width and record the credit.
 *
 * We self-host rather than hot-link: Wikimedia asks not to be used as a CDN,
 * hot-linked files break when they are renamed, and a local copy keeps the
 * site fast. Everything here is freely licensed and credited on /credits/.
 *
 *   node scripts/fetch-images.mjs                # fetch only what is missing
 *   node scripts/fetch-images.mjs --refresh      # re-pick everything
 *   node scripts/fetch-images.mjs --only=dtu,se
 *   node scripts/fetch-images.mjs --gallery=3 --only=dk-cbs  # more of the same place
 *
 * Picks live in data/images.json. To overrule a bad choice, set that entry's
 * "file" to any Commons filename, add "pin": true, and re-run with
 * --refresh --only=<key>. A pinned entry is fetched exactly as named and is
 * then left alone by every later run, including a bare --refresh, so a
 * judgement made by a person survives the next re-pick.
 *
 * To look at what this script chose and decide about it, use the review tool
 * rather than editing JSON by hand:
 *
 *   npm run images:review                     # the queue, worst first
 *   npm run images:review -- --show <key>     # one picture, with its Commons page
 *   npm run images:review -- --approve <key> --by "You" --note "what it shows"
 *
 * What this script may and may not decide
 * ---------------------------------------
 * It picks a *candidate* and scores it. It does not decide what is published.
 * That line is drawn in `src/lib/imagery.mjs`, and it matters in both
 * directions:
 *
 *   - Nothing here can approve a picture. The only review this file ever
 *     touches is one it carries forward from the previous record, through
 *     `carryReview`, and only onto the same photograph. There is no code path
 *     that writes a review state, and `scripts/test-images.mjs` reads this
 *     source back to keep it that way. An approval that a script could forge
 *     would not be worth recording.
 *
 *   - Nothing here can force a picture onto the page either. A score below the
 *     publication floor means the page renders its typographic panel instead,
 *     however hard the fetcher tried.
 *
 * So a run of this script leaves the site no worse: the worst it can do is
 * propose something a person has not looked at, and the floor holds the bottom
 * of that.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { EXT, normalise } from './lib/image-standard.mjs';
import { carryReview, isDecided, SCORER_VERSION } from '../src/lib/imagery.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'src', 'assets', 'img', 'places');
const PICKS = path.join(ROOT, 'data', 'images.json');
const UA = { 'User-Agent': 'ib-pathways/1.0 (school guidance site) contact-via-github' };

const args = process.argv.slice(2);
const REFRESH = args.includes('--refresh');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);

const WIDTH = 1800;

const REJECT_NAME =
  /logo|seal|coat[_ ]of[_ ]arms|wappen|\bmap\b|plan\b|diagram|chart|graph|icon|signature|portrait|bust|statue|plaque|banner|flag[_ ]of|locator|blank|\.svg|\.pdf|\.tiff?$|\.ogv|\.webm|\.gif$/i;

/** Scanned paper — diplomas, letters, posters — reads as a landscape photo to the scorer but is useless as a hero. */
const REJECT_PAPER =
  /diploma|certificate|manuscript|letter[_ ]|document|poster|stamp|postcard|newspaper|title[_ ]page|cover[_ ]page|handwrit|inscription|medal|coin|painting|portrait of|drawing|engraving|lithograph|\bseal\b/i;
const REJECT_LICENCE = /fair\s*use|non-?free|no\s*known|all\s*rights/i;

/* --- polite HTTP ---------------------------------------------------------- */

/* Wikimedia rate-limits anonymous API use fairly aggressively, and a burst of
   429s early on poisons the rest of the run. So: a floor between calls that
   grows when we get throttled and decays when we don't, plus long backoff. */
let lastCall = 0;
let minGap = 400;

async function j(url, tries = 6) {
  for (let n = 1; n <= tries; n++) {
    const gap = Date.now() - lastCall;
    if (gap < minGap) await sleep(minGap - gap);
    lastCall = Date.now();

    let res;
    try {
      res = await fetch(url, { headers: UA });
    } catch {
      await sleep(1500 * n);
      continue;
    }

    if (res.ok) {
      minGap = Math.max(400, minGap - 25);
      return res.json();
    }
    if (res.status === 429 || res.status >= 500) {
      minGap = Math.min(4000, minGap + 500);
      const retryAfter = Number(res.headers.get('retry-after')) || 0;
      await sleep(Math.max(retryAfter * 1000, 2000 * n));
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('gave up after retries');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const wp = (params) =>
  j(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`);
const wd = (params) =>
  j(`https://www.wikidata.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`);
const commons = (params) =>
  j(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`);

/* --- finding candidates --------------------------------------------------- */

/** Resolve a name (or a Wikipedia URL) to { title, qid }. */
async function resolveSubject(name, wikipediaUrl) {
  let title = null;
  if (wikipediaUrl) {
    const m = decodeURIComponent(wikipediaUrl).match(/\/wiki\/([^#?]+)/);
    if (m) title = m[1].replace(/_/g, ' ');
  }
  if (!title) {
    const s = await wp({ action: 'query', list: 'search', srsearch: name, srlimit: '1' });
    title = s.query?.search?.[0]?.title || null;
  }
  if (!title) return null;

  const p = await wp({ action: 'query', prop: 'pageprops', titles: title });
  const page = p.query?.pages?.[0];
  return { title, qid: page?.pageprops?.wikibase_item || null };
}

async function claim(qid, property) {
  const c = await wd({ action: 'wbgetclaims', entity: qid, property });
  return c.claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
}

/** Ask Commons for size, licence and metadata for a list of File: titles. */
async function imageInfo(titles) {
  if (!titles.length) return [];
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const d = await commons({
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: String(WIDTH),
    });
    for (const p of d.query?.pages || []) {
      const info = p.imageinfo?.[0];
      if (info) out.push({ title: p.title, info });
    }
  }
  return out;
}

async function categoryFiles(category) {
  const d = await commons({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmtype: 'file',
    cmlimit: '60',
  });
  return (d.query?.categorymembers || []).map((m) => m.title);
}

function cleanHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * What is wrong with a candidate, in words.
 *
 * Every entry here was written against a photograph that actually shipped. The
 * common thread in all of them is that the file passed every format test, every
 * licence test and every "is this a photograph" test, and was still the wrong
 * picture: a sign outside a campus instead of the campus, an award ceremony
 * instead of a building, somebody's wife instead of a seminary, an 1893 dance
 * poster instead of New Zealand.
 *
 * They are penalties rather than rejections on purpose. A rejection is a claim
 * that the file is never right, and these signals are not that certain —
 * "Campus 1477" is a modern photograph of Uppsala with a date in its name, and
 * a lecture theatre is a poor hero and a decent gallery slide. A penalty pushes
 * a doubtful picture towards the floor and lets the rest of the score argue
 * back, which is what a heuristic should do. The hard rejections above it are
 * reserved for files that are not photographs of a place at all.
 *
 * Each rule carries the name it reports under, so `data/images.json` records
 * *why* a score is low and `npm run images:review` can say so to a person,
 * instead of handing them a number with no argument attached.
 *
 * `ctx` is { name, blurb, cats, namesSubject } — `namesSubject` being whether
 * the filename contains a distinctive word from the subject's own name, which
 * is what separates "an aerial photograph of the university" from "an aerial
 * photograph of a yacht club in the same city".
 */
const PENALTIES = [
  {
    name: 'signage',
    points: -34,
    why: 'A photograph of the sign outside is a photograph of a sign. ATU was represented by "ATU Letterkenny Campus sign (2024).jpg" and Tampere by "Tampere yliopisto kyltti.jpg", both of which name the right institution and show a student nothing about being there.',
    test: ({ name, blurb }) =>
      /\bsign(?:age|post|board)?\b|\bnameplate\b|\bplacard\b|\bbillboard\b|\bkyltti\b|\bskilt\b|\bschild\b|\bstreet name\b/i.test(
        `${name} ${blurb}`
      ),
  },
  {
    name: 'a person rather than a place',
    points: -42,
    why: 'The Baltic Methodist Theological Seminary was represented by "Abikaasa Maire Lilleorg.jpg" — Estonian for "spouse". Yonsei was represented by two named historians. A photograph of a person is a photograph of a person however well it is composed, and the filename rarely admits it; the Commons categories usually do.',
    test: ({ name, blurb, cats }) =>
      /\babikaasa\b|\bspouse\b|\bwife\b|\bhusband\b|\bheadshot\b|\bselfie\b|\bborn \d{4}\b|\bb\. \d{4}\b/i.test(
        `${name} ${blurb}`
      ) ||
      /Portrait photographs|People of |Men of |Women of |Academics|Alumni of |Rectors|Politicians|Writers|Historians/i.test(
        cats
      ),
  },
  {
    name: 'event photography',
    points: -30,
    why: 'An event happens at a place; it is not a picture of the place. RWTH Aachen was represented by a Karlspreis award ceremony, Navarra by a TEDx talk, Copenhagen by two frames of the Pride parade, and Otago Polytechnic by a signing in Cape Town. In every one the room is incidental and the composition is about people looking at each other.',
    test: ({ name, blurb }) =>
      /\btedx?\b|conference|congress|symposium|seminar\b|ceremony|ceremonial|\baward(?!-winning)|\bprize\b|\bpreis\b|\bprix\b|graduation|commencement|parade|festival|carnival|protest|demonstration|\brally\b|inauguration|\bsigning\b|visiting professor|delegation|\bpanel\b|\bsummit\b|anniversary|\bgala\b|reception\b|\bconcert\b|tournament|championship/i.test(
        `${name} ${blurb}`
      ),
  },
  {
    name: 'aerial that shows no institution',
    points: -26,
    why: 'Canada led on "Aerial Britannia Yacht Club harbours" — a correctly licensed, well-exposed photograph of a marina, from a height at which nothing is recognisable and no university is in the frame. An aerial that names the subject is fine and often the best picture available; an aerial that names something else is a picture of somewhere else. "aerial" used to earn a bonus here, which is how that one won.',
    test: ({ name, blurb, namesSubject }) =>
      !namesSubject && /\baerial\b|bird'?s.eye|\bdrone\b|from above|overhead view|\bflyover\b/i.test(`${name} ${blurb}`),
  },
  {
    name: 'archival material',
    points: -36,
    why: 'New Zealand led on a scanned 1893 advertisement for a bus employees\' dance, and Malta on "RAILROAD TRACKS IN MALTA - NARA - 552477", a US National Archives scan. Archives digitise enormous quantities of material under free licences, so they are over-represented in any Commons search, and a scan of a document reads to a size-and-ratio scorer as a nice wide photograph.',
    test: ({ name, blurb }) =>
      /\bNARA\b|national archives|library of congress|bundesarchiv|\bRIA Novosti\b|glass (?:plate|negative)|daguerreotype|lantern slide|\bsic\b|\barchival\b|archive of|\bscan(?:ned)? (?:of|from)\b|historic photograph|from the collection of/i.test(
        `${name} ${blurb}`
      ),
  },
  {
    name: 'dated before 1950',
    points: -14,
    why: 'A place that was photographed in 1908 does not look like that now, and a student is choosing where to go next year. Deliberately mild, because a date in a filename is often the building\'s date rather than the photograph\'s — Uppsala\'s approved hero is called "Campus 1477.jpg" — so this nudges rather than decides.',
    test: ({ name }) => /\b1[5-8]\d{2}\b|\b19[0-4]\d\b/.test(name),
  },
  {
    name: 'an address, not a building',
    points: -22,
    why: 'PSL scored 12 on "60 rue Mazarine, Paris 6e.jpg": a street door in the sixth arrondissement, correctly geotagged, of nothing in particular. A filename that is a postal address and does not name the institution is a photograph taken to document a location rather than to show it.',
    test: ({ name, namesSubject }) =>
      !namesSubject && /^\d{1,4}[ ,-]/.test(name) &&
      /\b(?:rue|street|str\.|strasse|straße|straat|gade|gatan|via|calle|utca|ulica)\b/i.test(name),
  },
  {
    name: 'wayfinding or floor plan',
    points: -28,
    why: 'EPFL was represented by "Location of CH B3 31 room in EPFL campus.png", which is a diagram telling you where a seminar room is. It names the institution, it is wide, and it is a map. The hard NOT_A_PLACE rejection above catches the word "floor plan"; this catches the ones phrased as directions.',
    test: ({ name, blurb }) =>
      /location of\b|directions to\b|how to (?:find|get)|\bwayfinding\b|\bsite plan\b|\bcampus map\b|\broom [A-Z]?\d/i.test(
        // "…missing SDC location of creation" is a Commons maintenance
        // category on thousands of ordinary photographs, not a direction. It
        // used to trip this rule and sink some of the best candidates.
        `${name} ${blurb}`.replace(/\bSDC location of creation\b/gi, '')
      ),
  },
  {
    name: 'weather, works or darkness',
    points: -14,
    why: 'Pre-existing and unchanged: snow, fog, night and scaffolding all photograph well and all say the wrong thing about a place a student has never been.',
    test: ({ name }) => /night|snow|fog|construction|scaffold|crane|roadworks|demolition/i.test(name),
  },
  {
    name: 'indoors',
    points: -4,
    why: 'Pre-existing and unchanged, and kept small: a lecture theatre is a weak hero and a perfectly good gallery slide.',
    test: ({ name }) => /interior|lecture|classroom|corridor|canteen/i.test(name),
  },
];

/**
 * Score a candidate, and say which penalties fired.
 *
 * A negative return is a rejection: the file is not a photograph of a place at
 * all, and nothing further is worth computing. Everything else is a number that
 * `src/lib/imagery.mjs` measures against the publication floor — and a number
 * that only ever means "the scorer's confidence", never "a person approved
 * this". The scorer cannot approve anything.
 *
 * Bonuses were left exactly as they were, with one exception: "aerial" no
 * longer earns +16 for appearing in a filename. It was added when the aerials
 * in the catalogue happened to be of campuses, and it is the single line that
 * put a yacht club on the Canada page. Penalties were only added and never
 * relaxed, so a re-scored picture can move down and never up, which is the safe
 * direction for a floor derived from the scores already on disk.
 */
function scoreDetail({ title, info }, query, isPrimary) {
  const meta = info.extmetadata || {};
  const name = title.replace(/^File:/, '');
  const w = info.width || 0;
  const h = info.height || 0;
  const no = (reason) => ({ score: -1, flags: [reason] });

  if (!w || !h) return no('no dimensions');
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime || '')) return no('not a bitmap');
  if (REJECT_NAME.test(name) || REJECT_PAPER.test(name)) return no('rejected by filename');
  if (REJECT_LICENCE.test(cleanHtml(meta.LicenseShortName?.value))) return no('licence');
  if (w < 1000) return no('too small');

  // Scanned paper is usually catalogued under these categories even when the
  // filename gives nothing away.
  const cats = cleanHtml(meta.Categories?.value);
  if (/Documents|Diplomas|Certificates|Manuscripts|Paintings|Engravings|Portraits/i.test(cats)) return no('scanned paper');

  // Some files give nothing away in the filename and everything away in the
  // description. "OMX Stockholm 30.png" is a stock-market index chart, it is
  // named like a place, it passed every test above, and it spent a while as the
  // hero photograph on the home page of a site for seventeen-year-olds.
  //
  // So the description and categories are read too, for the things that are
  // plainly not photographs of somewhere.
  const blurb = `${cleanHtml(meta.ImageDescription?.value)} ${cats}`;
  const NOT_A_PLACE =
    /daily closings|stock (?:market|index|exchange chart)|share price|\bindex\b[^.]{0,20}\b(?:chart|graph|value)|histogram|scatter|pie chart|bar chart|line graph|infographic|schematic|floor ?plan|organisational chart|timeline of|population pyramid/i;
  if (NOT_A_PLACE.test(blurb)) return no('not a place');

  // Satellite and aerial survey imagery is a photograph of somewhere, passes
  // every test above, and is wrong for a hero: the Netherlands page led on a
  // Copernicus Sentinel-2 pass over Amsterdam, which reads as a weather map.
  // A student wants to see the place at eye level, not from orbit.
  const FROM_ORBIT =
    /satellite|sentinel-?\d|landsat|copernicus|european space agency|\bNASA\b|\bISS\b|from space|\borbit|true.?colou?r image|earth observation|remote sensing|orthophoto|\bSPOT ?\d/i;
  if (FROM_ORBIT.test(`${name} ${blurb}`)) return no('from orbit');

  let s = 0;
  const ratio = w / h;
  if (ratio < 1.1) s -= 45;                         // portraits crop badly in a hero
  if (ratio >= 1.3 && ratio <= 2.2) s += 32;
  if (ratio > 2.6) s -= 10;                          // panoramas lose their subject
  if (w >= 2000) s += 8;
  if (w >= 3200) s += 4;

  if (isPrimary) s += 45;                            // Wikidata's own pick

  const words = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const lower = name.toLowerCase();
  const matched = words.filter((t) => lower.includes(t));
  s += Math.min(3, matched.length) * 10;

  if (/campus|building|library|facade|exterior|hovedbygning|universit|hall|quad|main/i.test(name)) s += 16;

  if (/Featured pictures/i.test(cats)) s += 28;
  else if (/Quality images/i.test(cats)) s += 18;

  const ctx = { name, blurb, cats, namesSubject: matched.length > 0 };
  const flags = [];
  for (const rule of PENALTIES) {
    if (!rule.test(ctx)) continue;
    s += rule.points;
    flags.push(rule.name);
  }

  return { score: s, flags };
}


async function pickImage(target, { all = false } = {}) {
  const subject = await resolveSubject(target.query, target.wikipedia);
  const candidates = new Map();
  let primaryTitle = null;

  if (subject?.qid) {
    const p18 = await claim(subject.qid, 'P18');
    if (p18) primaryTitle = `File:${p18}`;

    const cat = await claim(subject.qid, 'P373');
    if (cat) {
      for (const t of await categoryFiles(cat)) candidates.set(t, false);
    }
  }
  if (primaryTitle) candidates.set(primaryTitle, true);

  // Last resort: a keyword search, which is noisy but better than nothing.
  if (candidates.size === 0) {
    const d = await commons({
      action: 'query',
      generator: 'search',
      gsrsearch: `filetype:bitmap ${target.query}`,
      gsrnamespace: '6',
      gsrlimit: '20',
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: String(WIDTH),
    });
    for (const p of d.query?.pages || []) if (p.imageinfo?.[0]) candidates.set(p.title, false);
  }

  const infos = await imageInfo([...candidates.keys()]);
  const ranked = infos
    .map((c) => ({ ...c, ...scoreDetail(c, target.query, candidates.get(c.title) === true) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return { best: ranked[0] || null, ranked: all ? ranked : [], subject, considered: infos.length };
}

/**
 * Fetch one named Commons file, chosen by a person rather than by the scorer.
 * The scoring rules are deliberately not applied: the point of pinning is that
 * a human looked at the page and disagreed with them. The only check left is
 * that the file exists and Commons will serve it as a bitmap, because a pin
 * pointing at a deleted or renamed file should say so rather than fall back to
 * a guess the editor never saw.
 */
async function pinnedImage(filename) {
  const title = filename.startsWith('File:') ? filename : `File:${filename}`;
  const [found] = await imageInfo([title]);
  if (!found) return { best: null, subject: null, considered: 0 };
  return { best: { ...found, score: null }, subject: null, considered: 1 };
}

/* --- download and credit -------------------------------------------------- */

function creditFrom(title, info) {
  const m = info.extmetadata || {};
  return {
    file: title.replace(/^File:/, ''),
    page: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
    author: cleanHtml(m.Artist?.value) || 'Unknown',
    licence: cleanHtml(m.LicenseShortName?.value) || 'See Wikimedia Commons',
    licenceUrl: m.LicenseUrl?.value || null,
    description: cleanHtml(m.ImageDescription?.value).slice(0, 220) || null,
  };
}

/**
 * Download, then normalise to docs/IMAGE_STANDARD.md before anything touches
 * the disk. We ask Commons for a thumbnail slightly wider than we store so the
 * 16:10 crop has pixels to work with, and never write the response body
 * straight out — that is how the back catalogue ended up with five PNGs
 * wearing a .jpg extension and a 5 MB file behind a letterbox crop.
 */
async function download(info, outPath) {
  const src = info.thumburl || info.url;
  const res = await fetch(src, { headers: UA });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp)/.test(type)) throw new Error(`unexpected content-type ${type}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('file suspiciously small');
  const stored = await normalise(buf);
  await fs.writeFile(outPath, stored.data);
  return stored;
}

/* --- what needs a picture ------------------------------------------------- */

async function targets() {
  const out = [];

  for (const f of await ls(path.join(ROOT, 'data', 'dk'))) {
    const inst = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'dk', f), 'utf8'));
    out.push({
      key: inst.id,
      kind: 'institution',
      label: inst.name,
      query: inst.name,
      wikipedia: inst.wikipedia || null,
    });
  }

  for (const f of await ls(path.join(ROOT, 'data', 'countries'))) {
    const c = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'countries', f), 'utf8'));
    out.push({
      key: c.code,
      kind: 'country',
      label: c.name,
      query: `${c.capital || c.name}`,
      wikipedia: null,
    });
    for (const inst of c.institutions || []) {
      out.push({
        key: `${c.code}-${slug(inst.shortName || inst.name)}`,
        kind: 'institution',
        label: inst.name,
        query: inst.name,
        wikipedia: inst.wikipedia || null,
      });
    }
  }

  const seen = new Set();
  return out.filter((t) => (seen.has(t.key) ? false : seen.add(t.key)));
}

async function ls(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
}

function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

/* --- main ----------------------------------------------------------------- */

/**
 * Collect further photographs of the same subject for the hero gallery.
 *
 * The winner is the best single picture; the runners-up are usually a different
 * building, a different season, or the same place from the other side, which is
 * exactly what a gallery wants. They are scored by the same rules, so an
 * eclipse does not get in through the side door.
 *
 *   node scripts/fetch-images.mjs --gallery=3 --only=dk-cbs,dk-sdu
 *
 * Deliberately not run across all 447 institutions: three extra photographs
 * each would add roughly 270 MB to a repository that is currently 100 MB, and
 * a country page already has a gallery made of its own institutions.
 */
async function gallery(picks, targets, want) {
  let added = 0;
  for (const t of targets) {
    process.stdout.write(`  ${t.key.padEnd(30)}`);
    const existing = picks[t.key];
    if (!existing) { console.log(' — no primary pick yet; run without --gallery first'); continue; }

    let ranked;
    try {
      ({ ranked } = await pickImage(t, { all: true }));
    } catch (err) {
      console.log(` — failed: ${err.message}`);
      continue;
    }
    const held = existing.gallery || [];
    const taken = new Set([existing.file, ...held.map((g) => g.file)]);
    const chosen = [];
    for (const cand of ranked) {
      if (chosen.length >= want) break;
      const file = cand.title.replace(/^File:/, '');
      if (taken.has(file)) continue;
      // Slide numbering starts at 2 because the hero itself is slide 1, and it
      // counts past the gallery already on disk so a second run does not
      // overwrite the photographs of the first.
      const name = `${t.key}-${held.length + chosen.length + 2}${EXT}`;
      try {
        const stored = await download(cand.info, path.join(IMG_DIR, name));
        chosen.push({
          ...creditFrom(cand.title, cand.info),
          src: `/assets/img/places/${name}`,
          width: stored.width, height: stored.height, bytes: stored.bytes,
          score: cand.score,
          ...(cand.flags?.length ? { flags: cand.flags } : {}),
          scorer: SCORER_VERSION,
          fetched: new Date().toISOString().slice(0, 10),
        });
        taken.add(file);
      } catch { /* a candidate that will not download is simply not used */ }
    }
    if (chosen.length) {
      // Append rather than replace. A gallery photograph is published exactly
      // as a primary one is and is reviewed exactly as one, so overwriting the
      // array would throw away those judgements — and the files they were about
      // are still on disk, so the next run would re-download and re-number them
      // as if they were new. Two of the current rejections live in galleries.
      picks[t.key] = { ...existing, gallery: [...held, ...chosen] };
      await fs.writeFile(PICKS, `${JSON.stringify(picks, null, 2)}
`);
      added += chosen.length;
      console.log(` +${chosen.length}  ${chosen.map((c) => c.file.slice(0, 26)).join(', ')}`);
    } else {
      console.log(' — nothing else usable');
    }
  }
  console.log(`\n${added} further photograph(s) added.`);
}

async function main() {
  await fs.mkdir(IMG_DIR, { recursive: true });

  let picks = {};
  try { picks = JSON.parse(await fs.readFile(PICKS, 'utf8')); } catch {}

  const galleryArg = args.find((a) => a.startsWith('--gallery'));
  if (galleryArg) {
    const want = Number(galleryArg.split('=')[1] || 3);
    const list = await targets();
    const wanted = ONLY.length ? list.filter((t) => ONLY.includes(t.key)) : list;
    console.log(`${wanted.length} target(s), up to ${want} further photograph(s) each\n`);
    await gallery(picks, wanted, want);
    return;
  }

  const list = await targets();
  const wanted = ONLY.length ? list.filter((t) => ONLY.includes(t.key)) : list;
  console.log(`${wanted.length} targets (${list.length} known)\n`);

  let got = 0, kept = 0, failed = 0;
  const misses = [];

  for (const t of wanted) {
    const file = `${t.key}${EXT}`;
    const dest = path.join(IMG_DIR, file);

    const pinned = picks[t.key]?.pin ? picks[t.key].file : null;
    // An entry a person has approved or rejected is a decision, not a guess.
    // It is protected from a re-pick exactly as a pin is, and for the same
    // reason: the ordinary way an editorial judgement gets lost is not malice,
    // it is somebody running the fetcher across all 471 entries on a Tuesday.
    const decided = isDecided(picks[t.key]);

    if (!REFRESH && picks[t.key] && (await exists(dest))) { kept++; continue; }
    // A pinned pick is a human overruling the scorer. `--refresh` re-picks
    // everything else; it must not quietly undo that judgement. Only an
    // explicit `--only=<key>` re-fetches a pinned entry, and even then it
    // re-fetches the same file — to pick up a better master on Commons.
    if (REFRESH && (pinned || decided) && !ONLY.includes(t.key) && (await exists(dest))) { kept++; continue; }

    process.stdout.write(`  ${t.key.padEnd(30)}`);
    try {
      const { best, considered } = pinned ? await pinnedImage(pinned) : await pickImage(t);
      if (!best) {
        console.log(pinned
          ? ` — pinned file not found on Commons: ${pinned}`
          : ` — nothing usable (${considered} considered)`);
        misses.push(t);
        failed++;
        continue;
      }
      const stored = await download(best.info, dest);
      const credit = creditFrom(best.title, best.info);
      // The one place an existing judgement can cross into a freshly built
      // record. `carryReview` copies a review or returns null; it has no way to
      // write one, so nothing in this file can sign an approval — which is what
      // makes "a person approved this" mean something. It also refuses to carry
      // a review onto a different photograph: an editor approved a picture, not
      // a page slot.
      const heldReview = carryReview(picks[t.key], credit.file);
      picks[t.key] = {
        ...credit,
        kind: t.kind,
        subject: t.label,
        src: `/assets/img/places/${file}`,
        // What we actually stored, not what Commons served. The manifest has
        // to describe the file on disk or the templates emit wrong dimensions.
        width: stored.width,
        height: stored.height,
        bytes: stored.bytes,
        score: best.score,
        // Which rules fired, so a low score arrives with its argument attached
        // rather than as a bare number nobody can act on.
        ...(best.flags?.length ? { flags: best.flags } : {}),
        // Which scorer produced that number. Scores from different scorers are
        // not comparable, and a reviewer should be told which one they are
        // looking at rather than left to guess.
        scorer: SCORER_VERSION,
        fetched: new Date().toISOString().slice(0, 10),
        ...(pinned ? { pin: true } : {}),
        ...(heldReview ? { review: heldReview } : {}),
      };
      console.log(` ${String(Math.round(stored.bytes / 1024)).padStart(4)} KB  ${picks[t.key].file.slice(0, 52)}`);
      got++;
      await fs.writeFile(PICKS, `${JSON.stringify(picks, null, 2)}
`);
    } catch (err) {
      console.log(` — failed: ${err.message}`);
      misses.push(t);
      failed++;
    }
  }

  await fs.writeFile(PICKS, `${JSON.stringify(picks, null, 2)}
`);
  console.log(`\nnew ${got} · kept ${kept} · failed ${failed}`);
  if (misses.length) {
    console.log('\nNo image for:');
    for (const m of misses) console.log(`  ${m.key}  (${m.label})`);
    console.log('\nAdd a "wikipedia" URL to that entry in the data file, or set the pick by hand in data/images.json.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
