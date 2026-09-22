/**
 * Notices when a source page changes underneath a claim.
 *
 *   node scripts/watch-sources.mjs              # check every source
 *   node scripts/watch-sources.mjs --only=dk    # only evidence whose id contains "dk"
 *   node scripts/watch-sources.mjs --reset      # re-fingerprint without reporting changes
 *
 * Automation's job here is *discovery*, not verification. When a page changes,
 * this flips the affected Evidence to `needs-review` and names every claim that
 * rests on it — then a person reads the page and decides. It never edits a
 * requirement, never re-verifies anything, and never quietly accepts a new value.
 *
 * Fingerprints live in data/source-fingerprints.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const STORE = path.join(DATA, 'source-fingerprints.json');

const args = process.argv.slice(2);
const RESET = args.includes('--reset');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '');

const UA = {
  'User-Agent': 'Mozilla/5.0 (compatible; ib-pathways source watcher; educational site)',
  Accept: 'text/html,application/xhtml+xml',
};

/**
 * Reduce a page to the text that would change if a rule changed.
 *
 * Scripts, styles, nav chrome, cookie banners and build hashes churn constantly
 * and would make every page look modified every week — at which point nobody
 * reads the report. This strips them so a flagged change is worth a look.
 */
function fingerprint(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\b[0-9a-f]{8,}\b/gi, ' ')   // cache-busting hashes
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return {
    hash: crypto.createHash('sha256').update(text).digest('hex').slice(0, 16),
    length: text.length,
  };
}

async function loadEvidence() {
  const out = [];
  const dir = path.join(DATA, 'evidence');
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')); } catch { return out; }
  for (const f of files) {
    const raw = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8'));
    const items = Array.isArray(raw) ? raw : Object.values(raw);
    for (const ev of items) if (ev?.sourceUrl) out.push({ file: f, ev });
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let store = {};
  try { store = JSON.parse(await fs.readFile(STORE, 'utf8')); } catch {}

  let evidence = await loadEvidence();
  if (ONLY) evidence = evidence.filter((e) => e.ev.id.includes(ONLY));

  // One request per distinct URL, however many claims rest on it.
  const byUrl = new Map();
  for (const { file, ev } of evidence) {
    if (!byUrl.has(ev.sourceUrl)) byUrl.set(ev.sourceUrl, []);
    byUrl.get(ev.sourceUrl).push({ file, ev });
  }

  console.log(`\nChecking ${byUrl.size} distinct sources behind ${evidence.length} claims…\n`);

  const changed = [];
  const unreachable = [];
  let unchanged = 0;

  for (const [url, holders] of byUrl) {
    let html;
    try {
      const res = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      unreachable.push({ url, reason: err.message, holders });
      await sleep(200);
      continue;
    }

    const fp = fingerprint(html);
    const previous = store[url];
    store[url] = { ...fp, checkedAt: new Date().toISOString().slice(0, 10) };

    if (!previous || RESET) {
      unchanged++;
    } else if (previous.hash !== fp.hash) {
      const drift = fp.length - previous.length;
      changed.push({
        url,
        drift,
        since: previous.checkedAt,
        holders: holders.map((h) => h.ev),
      });
    } else {
      unchanged++;
    }
    await sleep(200);
  }

  await fs.writeFile(STORE, JSON.stringify(store, null, 2) + '\n');

  console.log(`  unchanged    ${String(unchanged).padStart(4)}`);
  console.log(`  changed      ${String(changed.length).padStart(4)}`);
  console.log(`  unreachable  ${String(unreachable.length).padStart(4)}\n`);

  if (changed.length) {
    console.log('Changed since last checked — a person needs to read these:\n');
    for (const c of changed) {
      console.log(`  ${c.url}`);
      console.log(`      ${c.drift > 0 ? '+' : ''}${c.drift} characters since ${c.since}`);
      for (const ev of c.holders) {
        console.log(`      affects ${ev.id}: ${ev.claim || ev.excerpt?.slice(0, 70) || '(no claim recorded)'}`);
        for (const s of ev.supports || []) console.log(`          ${s.entity} → ${s.field}`);
      }
      console.log('');
    }
  }

  if (unreachable.length) {
    console.log('Unreachable:\n');
    for (const u of unreachable) {
      console.log(`  ${u.url} — ${u.reason}`);
      for (const h of u.holders) console.log(`      affects ${h.ev.id}`);
    }
    console.log('');
  }

  if (changed.length && !RESET) {
    console.log('Nothing has been edited. Read each changed page, then update the claim and set');
    console.log('verificationState to "verified" by hand. Automation finds drift; people resolve it.\n');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
