/**
 * Stage an institution's photograph for review, certify it, and merge it.
 *
 * The photo pass (October 2026): every university gets a real picture. The
 * automated fetcher (fetch-official-images.mjs) finds an institution's own
 * share image where its pages publish one; where they do not, a person (or
 * an agent the owner delegated) finds one on the institution's own site, or a
 * freely licensed one on Wikimedia Commons, looks at it, and certifies it.
 *
 *   node scripts/stage-image.mjs look <key> [<imageUrl> <sourcePage>]
 *       Download the image (or the key's existing official-images.json
 *       entry when no URL is given) to D:/ibp-tmp/img-review/, measure it,
 *       and write <key>-preview.jpg to look at. Prints what it found.
 *   node scripts/stage-image.mjs approve <key> "<subject>" "<what it shows>" [--credit "Author · CC BY-SA 4.0"]
 *   node scripts/stage-image.mjs reject <key> "<why>"
 *       Write the decision to data/official-images.staged/<key>.json — one
 *       file per institution, so several reviewers never touch one file.
 *   node scripts/stage-image.mjs merge
 *       Fold every staged decision into data/official-images.json and remove
 *       the staged files. The coordinating session runs this.
 *
 * Images are linked where they are published, never copied (IMAGE_STANDARD.md:
 * official images are hot-linked). An approval is signed and dated.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const STORE = path.join(ROOT, 'data', 'official-images.json');
const STAGED = path.join(ROOT, 'data', 'official-images.staged');
const WORK = process.env.IMG_REVIEW_DIR || 'D:/ibp-tmp/img-review';
const MAX_BYTES = 2_000_000;
const BY = 'Claude (automated visual review, delegated by the site owner)';
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; ib-pathways/1.0; educational guidance site)', Accept: 'image/*,*/*;q=0.8' };
const today = () => new Date().toISOString().slice(0, 10);
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };

const [cmd, key, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest.splice(i, 2)[1] : null; };

async function look() {
  const store = readJson(STORE, {});
  const [imageUrl = store[key]?.url, sourcePage = store[key]?.sourcePage] = rest;
  if (!key || !imageUrl) throw new Error('look <key> <imageUrl> <sourcePage>, or a key already in official-images.json');
  if (!/^https:\/\//.test(imageUrl)) throw new Error('the image must be served over https');
  const res = await fetch(imageUrl, { headers: UA, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} for ${imageUrl}`);
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`not an image: ${type}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  fs.mkdirSync(WORK, { recursive: true });
  await sharp(buf).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 70 }).toFile(path.join(WORK, `${key}-preview.jpg`));
  const found = { url: res.url || imageUrl, sourcePage, type: type.split(';')[0], bytes: buf.length, dims: { h: meta.height, w: meta.width } };
  fs.writeFileSync(path.join(WORK, `${key}.json`), JSON.stringify(found, null, 1));
  const problems = [
    buf.length > MAX_BYTES && `too heavy to publish (${Math.round(buf.length / 1000)} KB > 2000 KB): find a smaller copy`,
    meta.width < 1000 && `narrow (${meta.width}px): a hero wants 1200px or more`,
    meta.width / meta.height < 1.2 && 'not landscape',
  ].filter(Boolean);
  console.log(JSON.stringify({ key, ...found, preview: path.join(WORK, `${key}-preview.jpg`), problems }, null, 1));
}

function decide(state) {
  const found = readJson(path.join(WORK, `${key}.json`), null);
  if (!found) throw new Error(`run "look ${key}" first`);
  const [a, b] = rest;
  const credit = flag('credit');
  const record = state === 'approved'
    ? {
        ...found,
        subject: a,
        ...(credit ? { creditText: credit } : {}),
        licence: credit
          ? `Freely licensed (${credit}); linked from its file page, not copied.`
          : 'Published by the institution on its own website; linked, not copied.',
        fetched: today(),
        review: { state, by: BY, at: today(), note: b },
      }
    : { ...found, fetched: today(), review: { state, by: BY, at: today(), note: a } };
  if (state === 'approved' && found.bytes > MAX_BYTES) throw new Error('too heavy to publish');
  fs.mkdirSync(STAGED, { recursive: true });
  fs.writeFileSync(path.join(STAGED, `${key}.json`), JSON.stringify(record, null, 1) + '\n');
  console.log(`${state}: ${key}`);
}

function merge() {
  const store = readJson(STORE, {});
  if (!fs.existsSync(STAGED)) return console.log('nothing staged');
  let n = 0;
  for (const f of fs.readdirSync(STAGED).filter((f) => f.endsWith('.json'))) {
    const k = f.replace(/\.json$/, '');
    store[k] = { ...(store[k] || {}), ...readJson(path.join(STAGED, f), {}) };
    n++;
  }
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2) + '\n');
  fs.rmSync(STAGED, { recursive: true, force: true });
  console.log(`merged ${n} decisions into data/official-images.json`);
}

if (cmd === 'look') await look();
else if (cmd === 'approve') decide('approved');
else if (cmd === 'reject') decide('rejected');
else if (cmd === 'merge') merge();
else console.log('usage: look | approve | reject | merge (see the header)');
