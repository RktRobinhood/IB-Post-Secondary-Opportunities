/**
 * Every outbound link the built site renders, opened and judged (#49).
 *
 *   node scripts/audit-links.mjs [dist] [--fresh]
 *
 * A status code is not enough: many university sites answer 200 with a
 * "page not found" body, or send a dead page to their homepage. Each link is
 * one of:
 *
 *   ok        the page opened and is not a not-found page
 *   dead      4xx/5xx other than a bot check, or the host does not answer
 *   soft-404  200, but the title or heading says the page was not found
 *   homepage  a specific page that redirects to the site's front page
 *   blocked   403/429/503 or a challenge page: a person must look (not a fault)
 *
 * Results are written as they come to docs/research/qa/links/results.jsonl,
 * and a re-run skips links already judged there, so a stopped audit resumes.
 * `--fresh` starts over. The summary, with the pages each bad link is on, goes
 * to docs/research/qa/links/report.md.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || path.join(ROOT, 'dist'));
const OUT = path.join(ROOT, 'docs/research/qa/links');
const RESULTS = path.join(OUT, 'results.jsonl');
const FRESH = process.argv.includes('--fresh');
const CONCURRENCY = 10;
const PER_HOST = 2;
const TIMEOUT = 25000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const NOT_FOUND = [
  /\b404\b/, /page (?:was )?not found/i, /page (?:you (?:are|were) looking for|requested) (?:could not|cannot|can't|doesn't|does not)/i,
  /(?:doesn't|does not|no longer) exist/i, /siden (?:blev ikke fundet|findes ikke|kunne ikke findes)/i,
  /seite (?:wurde )?nicht gefunden/i, /pagina (?:niet gevonden|non trovata|no encontrada|não encontrada)/i,
  /page introuvable/i, /sidan (?:kunde inte hittas|finns inte)/i, /siden finnes ikke/i, /sivua ei löytynyt/i,
  /nie znaleziono strony/i, /stránka nebyla nalezena/i, /oldal nem található/i,
];
const CHALLENGE = /just a moment|attention required|cf-browser-verification|captcha|access denied|are you a robot|verify you are human/i;

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

async function collect() {
  const links = new Map();
  for (const file of await walk(DIST)) {
    const page = '/' + path.relative(DIST, file).replace(/\\/g, '/').replace(/index\.html$/, '');
    const html = await fs.readFile(file, 'utf8');
    for (const m of html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const url = m[1].replace(/&amp;/g, '&');
      if (/rktrobinhood\.github\.io/i.test(url)) continue;
      const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (!links.has(url)) links.set(url, { url, pages: new Set(), text });
      links.get(url).pages.add(page);
    }
  }
  return links;
}

const isFront = (u) => { try { const x = new URL(u); return /^\/?(?:[a-z]{2}(?:-[a-z]{2})?\/?)?$/i.test(x.pathname) && !x.search; } catch { return false; } };

async function judge(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'en' } });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('html') ? (await res.text()).slice(0, 200000) : '';
    const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
    const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const final = res.url || url;
    let verdict = 'ok';
    if ([401, 403, 429, 503].includes(res.status) || CHALLENGE.test(title)) verdict = 'blocked';
    else if (res.status >= 400) verdict = 'dead';
    else if (NOT_FOUND.some((r) => r.test(title) || r.test(h1))) verdict = 'soft-404';
    else if (!isFront(url) && isFront(final) && new URL(final).host.replace(/^www\./, '') === new URL(url).host.replace(/^www\./, '')) verdict = 'homepage';
    return { url, status: res.status, final, title: title.slice(0, 120), verdict };
  } catch (e) {
    return { url, status: 0, final: null, title: String(e.cause?.code || e.name || e.message).slice(0, 80), verdict: 'dead' };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const links = await collect();
  if (FRESH) await fs.rm(RESULTS, { force: true });
  const done = new Map();
  try {
    for (const line of (await fs.readFile(RESULTS, 'utf8')).split('\n')) if (line.trim()) { const r = JSON.parse(line); done.set(r.url, r); }
  } catch {}
  const todo = [...links.keys()].filter((u) => !done.has(u));
  console.log(`${links.size} outbound links on ${DIST}; ${done.size} judged before, ${todo.length} to open`);
  const busy = new Map();
  let i = 0;
  let n = 0;
  async function worker() {
    while (i < todo.length) {
      const k = todo.findIndex((u, j) => j >= i && (busy.get(new URL(u).host) || 0) < PER_HOST);
      const at = k < 0 ? i : k;
      const url = todo.splice(at, 1)[0];
      const host = new URL(url).host;
      busy.set(host, (busy.get(host) || 0) + 1);
      const r = await judge(url);
      busy.set(host, busy.get(host) - 1);
      done.set(url, r);
      await fs.appendFile(RESULTS, JSON.stringify(r) + '\n');
      if (++n % 100 === 0) console.log(`  ${n} opened`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const rows = [...links.values()].map((l) => ({ ...l, ...done.get(l.url), pages: [...l.pages] }));
  const by = (v) => rows.filter((r) => r.verdict === v);
  const lines = [
    '# Outbound link audit (#49)', '',
    `Built site: \`${path.relative(ROOT, DIST) || DIST}\`, ${new Date().toISOString().slice(0, 10)}. ${rows.length} distinct outbound links.`, '',
    '| Verdict | Links |', '|---|---|',
    ...['ok', 'dead', 'soft-404', 'homepage', 'blocked'].map((v) => `| ${v} | ${by(v).length} |`), '',
  ];
  for (const v of ['dead', 'soft-404', 'homepage', 'blocked']) {
    const list = by(v).sort((a, b) => b.pages.length - a.pages.length);
    if (!list.length) continue;
    lines.push(`## ${v} (${list.length})`, '', '| Link | Status | Lands on / title | Pages |', '|---|---|---|---|');
    for (const r of list) lines.push(`| ${r.url} | ${r.status} | ${(r.final && r.final !== r.url ? r.final + ' · ' : '') + (r.title || '').replace(/\|/g, '/')} | ${r.pages.slice(0, 3).join(' ')}${r.pages.length > 3 ? ` +${r.pages.length - 3}` : ''} |`);
    lines.push('');
  }
  await fs.writeFile(path.join(OUT, 'report.md'), lines.join('\n'));
  console.log(['ok', 'dead', 'soft-404', 'homepage', 'blocked'].map((v) => `${v} ${by(v).length}`).join(' · '));
}

main().catch((e) => { console.error(e); process.exit(1); });
