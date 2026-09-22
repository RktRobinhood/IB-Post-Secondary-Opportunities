/**
 * A polite, cached HTTP GET for verification runs.
 *
 * Verification re-reads a few hundred university pages. Without a cache, every
 * tweak to the matching logic means hammering those servers again, which is
 * both slow and rude — so a fetched page is kept on disk and reused until it is
 * older than `maxAgeHours`. The cache lives in `.cache/` and is gitignored: it
 * is derived data, and a stale copy must never become the thing we cite.
 *
 * Politeness is not optional here. One request at a time per host, a delay
 * between them, and a user agent that says who we are and how to complain.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const CACHE = path.join(ROOT, '.cache', 'sources');

const UA =
  'IB-Pathways-Verifier/1.0 (+https://github.com/RktRobinhood/IB-Post-Secondary-Opportunities; educational, non-commercial)';

const DELAY_MS = 1200;
const lastHit = new Map();

const keyFor = (url) => crypto.createHash('sha1').update(url).digest('hex').slice(0, 20);

async function politeWait(host) {
  const since = Date.now() - (lastHit.get(host) || 0);
  if (since < DELAY_MS) await new Promise((r) => setTimeout(r, DELAY_MS - since));
  lastHit.set(host, Date.now());
}

/**
 * @returns {Promise<{ok: boolean, status: number|null, body: string, from: 'cache'|'network', error: string|null, finalUrl: string}>}
 */
export async function fetchCached(url, { maxAgeHours = 72, timeoutMs = 25000 } = {}) {
  await fs.mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, `${keyFor(url)}.json`);

  try {
    const cached = JSON.parse(await fs.readFile(file, 'utf8'));
    const ageHours = (Date.now() - new Date(cached.fetchedAt).getTime()) / 3_600_000;
    if (ageHours < maxAgeHours) return { ...cached, from: 'cache' };
  } catch {
    /* no usable cache entry — fall through and fetch */
  }

  let host;
  try {
    host = new URL(url).host;
  } catch {
    return { ok: false, status: null, body: '', from: 'network', error: 'malformed url', finalUrl: url };
  }
  await politeWait(host);

  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), timeoutMs);
  let result;
  try {
    const res = await fetch(url, {
      signal: control.signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
    });
    const body = await res.text();
    result = {
      ok: res.ok,
      status: res.status,
      body,
      error: res.ok ? null : `HTTP ${res.status}`,
      finalUrl: res.url || url,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    result = {
      ok: false,
      status: null,
      body: '',
      error: e.name === 'AbortError' ? 'timeout' : String(e.message || e),
      finalUrl: url,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }

  // A failure is cached too, briefly, so a run over 100 records does not retry
  // a dead host 100 times. It is written with the error intact so the report can
  // say *why* rather than just "no".
  await fs.writeFile(file, JSON.stringify(result));
  return { ...result, from: 'network' };
}

export async function clearCache() {
  await fs.rm(CACHE, { recursive: true, force: true });
}
