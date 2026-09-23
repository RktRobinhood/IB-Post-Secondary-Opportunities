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
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { EXT, normalise } from './lib/image-standard.mjs';

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

function score({ title, info }, query, isPrimary) {
  const meta = info.extmetadata || {};
  const name = title.replace(/^File:/, '');
  const w = info.width || 0;
  const h = info.height || 0;
  if (!w || !h) return -1;
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime || '')) return -1;
  if (REJECT_NAME.test(name) || REJECT_PAPER.test(name)) return -1;
  if (REJECT_LICENCE.test(cleanHtml(meta.LicenseShortName?.value))) return -1;
  if (w < 1000) return -1;

  // Scanned paper is usually catalogued under these categories even when the
  // filename gives nothing away.
  const cats0 = cleanHtml(meta.Categories?.value);
  if (/Documents|Diplomas|Certificates|Manuscripts|Paintings|Engravings|Portraits/i.test(cats0)) return -1;

  // Some files give nothing away in the filename and everything away in the
  // description. "OMX Stockholm 30.png" is a stock-market index chart, it is
  // named like a place, it passed every test above, and it spent a while as the
  // hero photograph on the home page of a site for seventeen-year-olds.
  //
  // So the description and categories are read too, for the things that are
  // plainly not photographs of somewhere.
  const blurb = `${cleanHtml(meta.ImageDescription?.value)} ${cats0}`;
  const NOT_A_PLACE =
    /daily closings|stock (?:market|index|exchange chart)|share price|\bindex\b[^.]{0,20}\b(?:chart|graph|value)|histogram|scatter|pie chart|bar chart|line graph|infographic|schematic|floor ?plan|organisational chart|timeline of|population pyramid/i;
  if (NOT_A_PLACE.test(blurb)) return -1;

  // Satellite and aerial survey imagery is a photograph of somewhere, passes
  // every test above, and is wrong for a hero: the Netherlands page led on a
  // Copernicus Sentinel-2 pass over Amsterdam, which reads as a weather map.
  // A student wants to see the place at eye level, not from orbit.
  const FROM_ORBIT =
    /satellite|sentinel-?\d|landsat|copernicus|european space agency|\bNASA\b|\bISS\b|from space|\borbit|true.?colou?r image|earth observation|remote sensing|orthophoto|\bSPOT ?\d/i;
  if (FROM_ORBIT.test(`${name} ${blurb}`)) return -1;

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
  s += Math.min(3, words.filter((t) => lower.includes(t)).length) * 10;

  if (/campus|building|library|aerial|facade|exterior|hovedbygning|universit|hall|quad|main/i.test(name)) s += 16;
  if (/night|snow|fog|construction|scaffold|crane|roadworks|demolition/i.test(name)) s -= 14;
  if (/interior|lecture|classroom|corridor|canteen/i.test(name)) s -= 4;

  const cats = cleanHtml(meta.Categories?.value);
  if (/Featured pictures/i.test(cats)) s += 28;
  else if (/Quality images/i.test(cats)) s += 18;

  return s;
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
    .map((c) => ({ ...c, score: score(c, target.query, candidates.get(c.title) === true) }))
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
    const taken = new Set([existing.file, ...(existing.gallery || []).map((g) => g.file)]);
    const chosen = [];
    for (const cand of ranked) {
      if (chosen.length >= want) break;
      const file = cand.title.replace(/^File:/, '');
      if (taken.has(file)) continue;
      const name = `${t.key}-${chosen.length + 2}${EXT}`;
      try {
        const stored = await download(cand.info, path.join(IMG_DIR, name));
        chosen.push({
          ...creditFrom(cand.title, cand.info),
          src: `/assets/img/places/${name}`,
          width: stored.width, height: stored.height, bytes: stored.bytes,
          score: cand.score,
          fetched: new Date().toISOString().slice(0, 10),
        });
        taken.add(file);
      } catch { /* a candidate that will not download is simply not used */ }
    }
    if (chosen.length) {
      picks[t.key] = { ...existing, gallery: chosen };
      await fs.writeFile(PICKS, JSON.stringify(picks, null, 2));
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

    if (!REFRESH && picks[t.key] && (await exists(dest))) { kept++; continue; }
    // A pinned pick is a human overruling the scorer. `--refresh` re-picks
    // everything else; it must not quietly undo that judgement. Only an
    // explicit `--only=<key>` re-fetches a pinned entry, and even then it
    // re-fetches the same file — to pick up a better master on Commons.
    if (REFRESH && pinned && !ONLY.includes(t.key) && (await exists(dest))) { kept++; continue; }

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
      picks[t.key] = {
        ...creditFrom(best.title, best.info),
        kind: t.kind,
        subject: t.label,
        src: `/assets/img/places/${file}`,
        // What we actually stored, not what Commons served. The manifest has
        // to describe the file on disk or the templates emit wrong dimensions.
        width: stored.width,
        height: stored.height,
        bytes: stored.bytes,
        score: best.score,
        fetched: new Date().toISOString().slice(0, 10),
        ...(pinned ? { pin: true } : {}),
      };
      console.log(` ${String(Math.round(stored.bytes / 1024)).padStart(4)} KB  ${picks[t.key].file.slice(0, 52)}`);
      got++;
      await fs.writeFile(PICKS, JSON.stringify(picks, null, 2));
    } catch (err) {
      console.log(` — failed: ${err.message}`);
      misses.push(t);
      failed++;
    }
  }

  await fs.writeFile(PICKS, JSON.stringify(picks, null, 2));
  console.log(`\nnew ${got} · kept ${kept} · failed ${failed}`);
  if (misses.length) {
    console.log('\nNo image for:');
    for (const m of misses) console.log(`  ${m.key}  (${m.label})`);
    console.log('\nAdd a "wikipedia" URL to that entry in the data file, or set the pick by hand in data/images.json.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
