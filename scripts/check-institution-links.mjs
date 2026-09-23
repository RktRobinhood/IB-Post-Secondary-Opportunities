/**
 * Opens every institution link on file and says which ones are not there.
 *
 *   node scripts/check-institution-links.mjs                # everything
 *   node scripts/check-institution-links.mjs --field=ibPageUrl
 *   node scripts/check-institution-links.mjs --country=ca,nz
 *   node scripts/check-institution-links.mjs --refresh      # ignore the cache
 *   node scripts/check-institution-links.mjs --json=out.json
 *
 * ## Why this exists
 *
 * The Canada research pass found that **ten of fourteen `ibPageUrl` values in
 * `data/countries/ca.json` were 404s**. They were not wrong in an interesting
 * way; they were plausible. `future.utoronto.ca/ib/` is exactly the URL a
 * person would guess, which is exactly why nobody thought to open it. Nothing
 * caught them, because `npm run check` only verifies outbound links under
 * `--external`, that is not in `npm test`, and it checks *rendered* links —
 * and `ibPageUrl` is not rendered on a Destination page at all, so it was
 * invisible to the one check that could have seen it.
 *
 * A dead `ibPageUrl` is worse than a missing one. A student who follows it
 * concludes the site is stale. A student who does not follow it believes we
 * checked.
 *
 * ## Why this is NOT in `npm test`
 *
 * It needs the network, and a test suite that fails when the wifi does is a
 * test suite people stop running — and then stop trusting, which costs more
 * than the bug it was catching. It is wired up as `npm run check:institutions`
 * and belongs in the release checklist and in a research pass, next to a human
 * who can tell a dead link from a hotel network.
 *
 * ## The five verdicts, and why there are five
 *
 * A link checker that reports "broken" for anything it cannot fetch will be
 * switched off within a week, because several of the most authoritative sources
 * here refuse automated retrieval as policy: the OUAC 403s everything,
 * `immi.homeaffairs.gov.au` 403s and injects its visa charge by script, and NYU,
 * Michigan, Colby, AUT and mass.gov all sit behind bot walls. Those pages are
 * fine. They are just not fetchable by us.
 *
 * So a result is one of:
 *
 *   alive       2xx, and the body does not look like a failure page.
 *   redirected  2xx, but at a different URL than we asked for. Not broken;
 *               worth recording, because the old URL is living on borrowed time.
 *   dead        404, 410, a host that does not resolve, a soft 404 (below), or
 *               a redirect that dumped us on the site root when we asked for a
 *               page. Fix or remove.
 *   refused     The host is in `scripts/lib/link-policy.json` as refusing
 *               automated retrieval, AND somebody has recorded reading this
 *               exact URL directly, with a date. We know the page is real
 *               because a person said so; we simply cannot re-check it here.
 *   unknowable  Everything we genuinely cannot tell apart from dead: a refusing
 *               host with no direct-read record, a timeout, a 5xx, a TLS
 *               failure, or a 200 carrying almost no text (a JavaScript shell).
 *
 * The split between `refused` and `unknowable` is the load-bearing one. It
 * would have been easier to let the host list alone excuse a failure — but then
 * an invented URL on `admissions.umich.edu` would be excused forever, and
 * inventing URLs is the fault this script exists to catch. A refusing host buys
 * silence only for a URL somebody has actually opened.
 *
 * ## Soft 404s, and what this method cannot see
 *
 * Many university sites serve "page not found" with a 200. This looks for the
 * usual phrases, but only in the `<title>` and the first `<h1>` — never in the
 * body. Body matching was tried and it is unusable: an admissions page that
 * mentions "no longer available" about a scholarship, or a page whose cookie
 * banner says "404", reads as dead. A title and a heading are what the site
 * itself chose to call the page, and a site that serves a soft 404 almost
 * always titles it.
 *
 * What this cannot see, stated plainly so nobody trusts it further than it goes:
 *
 *   - A single-page app that returns a 200 shell and renders its 404 in the
 *     browser. Those land in `unknowable` via the thin-body rule if the shell
 *     is empty, and in `alive` if the shell is padded. Nothing short of a real
 *     browser fixes this.
 *   - A page that exists but is the *wrong* page — a live, well-titled IB page
 *     for the wrong campus, or a general international-qualifications page
 *     standing in for an IB one. Only reading it catches that.
 *   - A page behind a login, a geo-fence, or a consent interstitial that
 *     returns 200.
 *   - Content drift. A URL that resolves today said something different last
 *     year; that is `npm run verify`'s job, not this one's.
 *
 * ## Politeness
 *
 * Results are cached on disk by `scripts/lib/fetch-cache.mjs` and reused for
 * three days, so iterating on the matching rules costs nobody any traffic.
 * Requests are grouped by host and run strictly one at a time within a host,
 * with the cache's own delay between them; only the hosts run in parallel. Nine
 * hundred links across three hundred hosts is a handful of requests per host.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchCached } from './lib/fetch-cache.mjs';
import { pageTitle } from './lib/html-text.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const POLICY_FILE = path.join(ROOT, 'scripts', 'lib', 'link-policy.json');

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const flag = (name) => process.argv.includes(`--${name}`);

const ONLY_FIELDS = (arg('field') || '').split(',').filter(Boolean);
const ONLY_COUNTRIES = (arg('country') || '').split(',').filter(Boolean);
const JSON_OUT = arg('json');
const MAX_AGE_HOURS = flag('refresh') ? 0 : 72;
const HOST_CONCURRENCY = Number(arg('hosts') || 6);

/* --- What counts as a link ------------------------------------------------
 *
 * Two record shapes hold the same three links under different names. A country
 * profile's institution carries them flat (`website`, `admissionsUrl`,
 * `ibPageUrl`); a canonical Institution record nests them under `links`
 * (`website`, `admissions`, `ibPage`). `src/lib/canonical.mjs` already maps the
 * second onto the first, so both are reported under the country-record names —
 * a reader should not have to know which shape a record happens to be in.
 */
const COUNTRY_FIELDS = ['website', 'admissionsUrl', 'ibPageUrl'];
const CANONICAL_FIELDS = { website: 'website', admissions: 'admissionsUrl', ibPage: 'ibPageUrl' };

async function listJson(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

async function collectTargets() {
  const targets = [];

  for (const file of await listJson(path.join(DATA, 'countries'))) {
    const code = path.basename(file, '.json');
    if (ONLY_COUNTRIES.length && !ONLY_COUNTRIES.includes(code)) continue;
    const country = JSON.parse(await fs.readFile(path.join(DATA, 'countries', file), 'utf8'));
    for (const inst of country.institutions || []) {
      for (const field of COUNTRY_FIELDS) {
        const url = inst[field];
        if (typeof url !== 'string' || !url) continue;
        if (ONLY_FIELDS.length && !ONLY_FIELDS.includes(field)) continue;
        targets.push({
          url,
          field,
          scope: code,
          where: `countries/${file}`,
          institution: inst.name,
          /* A record may declare that a link was opened outside this checker.
             See the header: this is what buys a refusing host its silence. */
          readDirectly: (inst.linksReadDirectly || {})[field] || null,
        });
      }
    }
  }

  for (const file of await listJson(path.join(DATA, 'institutions'))) {
    const inst = JSON.parse(await fs.readFile(path.join(DATA, 'institutions', file), 'utf8'));
    const scope = inst.destination || 'canonical';
    if (ONLY_COUNTRIES.length && !ONLY_COUNTRIES.includes(scope)) continue;
    for (const [key, field] of Object.entries(CANONICAL_FIELDS)) {
      const url = inst.links?.[key];
      if (typeof url !== 'string' || !url) continue;
      if (ONLY_FIELDS.length && !ONLY_FIELDS.includes(field)) continue;
      targets.push({
        url,
        field,
        scope,
        where: `institutions/${file}`,
        institution: inst.name,
        /* The canonical schema is `additionalProperties: false`, so a canonical
           record cannot carry a `linksReadDirectly` field without a schema
           change this pass does not own. Its direct-read records live in
           `readDirectly` in the policy file instead, keyed by URL. */
        readDirectly: null,
      });
    }
  }

  return targets;
}

/* --- Verdicts -------------------------------------------------------------- */

/* Only ever matched against a <title> or the first <h1>. See the header for why
   body matching was removed. The German, French, Dutch, Danish and Spanish
   phrases are here because a third of these institutions serve their error page
   in their own language even when the requested page was the English one. */
const SOFT_404 = new RegExp(
  [
    'page not found',
    'page can’t be found',
    "page can't be found",
    'page cannot be found',
    'cannot be found',
    'could not be found',
    'not be found',
    'page does not exist',
    'page no longer exists',
    'no longer available',
    'nothing found',
    'error 404',
    '404 error',
    '^404',
    '404 \\|',
    '\\| 404',
    'file not found',
    'sorry, we (?:can’t|cannot|could not|couldn’t) find',
    'seite nicht gefunden',
    'seite wurde nicht gefunden',
    'page introuvable',
    'pagina niet gevonden',
    'pagina non trovata',
    'página no encontrada',
    'página não encontrada',
    'siden findes ikke',
    'siden blev ikke fundet',
    'sidan kan inte hittas',
    'nie znaleziono strony',
    'stránka nebyla nalezena',
  ].join('|'),
  'i'
);

/* A 200 that is really a bot wall. Cloudflare, Imperva, Akamai and Distil all
   announce themselves; matching their own wording is more reliable than
   guessing from body length. */
const CHALLENGE = new RegExp(
  [
    'just a moment',
    'attention required',
    'enable javascript and cookies to continue',
    'checking your browser before accessing',
    'access denied',
    'request unsuccessful\\. incapsula',
    'pardon our interruption',
    'are you a robot',
    'human verification',
    'you have been blocked',
  ].join('|'),
  'i'
);

const firstH1 = (html) => {
  const m = /<h1[^>]*>([\s\S]{0,400}?)<\/h1>/i.exec(html || '');
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
};

/** Rough count of characters a reader would actually see. Cheap on purpose. */
const visibleLength = (html) =>
  (html || '')
    .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;

const sameUrl = (a, b) => {
  try {
    const x = new URL(a);
    const y = new URL(b);
    const norm = (u) =>
      `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}${u.search}`.toLowerCase();
    return norm(x) === norm(y);
  } catch {
    return a === b;
  }
};

const isBareOrigin = (u) => {
  try {
    const x = new URL(u);
    return x.pathname.replace(/\/+$/, '') === '' && !x.search;
  } catch {
    return false;
  }
};

const hadPath = (u) => {
  try {
    return new URL(u).pathname.replace(/\/+$/, '') !== '';
  } catch {
    return false;
  }
};

/** Returns { verdict, reason }. Pure, so the rules can be read in one place. */
function judge(target, res, policy) {
  const refusing = policy.refusingHosts.get(hostOf(target.url));
  const readDirectly = target.readDirectly || policy.readDirectly.get(normaliseKey(target.url)) || null;

  const excuse = (reason) =>
    refusing && readDirectly
      ? { verdict: 'refused', reason: `${reason}; ${refusing.reason} Read directly on ${dateOf(readDirectly)}.` }
      : refusing
        ? {
            verdict: 'unknowable',
            reason: `${reason}; host refuses automated retrieval (${refusing.reason}) and no direct read is recorded for this URL`,
          }
        : null;

  if (res.status === null) {
    const e = String(res.error || '').toLowerCase();
    /* A host that does not resolve is gone, not shy. This is the one network
       failure that is safe to call dead: DNS has no bot policy. */
    if (/enotfound|getaddrinfo|dns/.test(e)) return { verdict: 'dead', reason: 'host does not resolve' };
    return excuse(res.error || 'network failure') || { verdict: 'unknowable', reason: res.error || 'network failure' };
  }

  if (res.status === 404 || res.status === 410) {
    /* Deliberately NOT excused by the host list. A refusing host that answers a
       clean 404 has told us something specific, and treating it as noise is how
       an invented URL survives on a walled domain. */
    return { verdict: 'dead', reason: `HTTP ${res.status}` };
  }

  if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 451 ||
      res.status === 405 || res.status === 406 || res.status === 400) {
    return (
      excuse(`HTTP ${res.status}`) || {
        verdict: 'unknowable',
        reason: `HTTP ${res.status} — refused the verifier, but no policy entry says this host does that`,
      }
    );
  }

  if (res.status >= 500) {
    return excuse(`HTTP ${res.status}`) || { verdict: 'unknowable', reason: `HTTP ${res.status} — server trouble, may be transient` };
  }

  if (res.status >= 300) return { verdict: 'unknowable', reason: `HTTP ${res.status} — redirect that did not resolve` };

  /* 2xx from here down. */
  const title = pageTitle(res.body);
  const h1 = firstH1(res.body);
  const heading = `${title}\n${h1}`.trim();

  if (CHALLENGE.test(heading)) {
    return excuse('served a bot challenge') || { verdict: 'unknowable', reason: `served a bot challenge ("${title || h1}")` };
  }

  if (heading && SOFT_404.test(heading)) {
    return { verdict: 'dead', reason: `soft 404 — the page calls itself "${(title || h1).slice(0, 70)}"` };
  }

  const final = res.finalUrl || target.url;
  if (!sameUrl(final, target.url)) {
    /* Landing on the site root after asking for a page is the other classic
       soft 404: the server would rather show you a homepage than admit the
       page is gone. Useless to a student either way. */
    if (isBareOrigin(final) && hadPath(target.url)) {
      return { verdict: 'dead', reason: `redirected to the site root (${final}) — the page it was asked for is gone` };
    }
    return { verdict: 'redirected', reason: `now at ${final}` };
  }

  if (visibleLength(res.body) < 500) {
    return {
      verdict: 'unknowable',
      reason: `200 with almost no text (${visibleLength(res.body)} chars) — probably a JavaScript shell this checker cannot render`,
    };
  }

  return { verdict: 'alive', reason: `HTTP ${res.status}` };
}

const hostOf = (u) => {
  try {
    return new URL(u).host;
  } catch {
    return '';
  }
};

const normaliseKey = (u) => {
  try {
    const x = new URL(u);
    return `${x.host.replace(/^www\./, '')}${x.pathname.replace(/\/+$/, '')}${x.search}`.toLowerCase();
  } catch {
    return String(u).toLowerCase();
  }
};

const dateOf = (v) => (typeof v === 'string' ? v : v?.on || 'an unrecorded date');

async function loadPolicy() {
  const raw = JSON.parse(await fs.readFile(POLICY_FILE, 'utf8'));
  return {
    refusingHosts: new Map((raw.hostsThatRefuseAutomatedRetrieval || []).map((e) => [e.host, e])),
    readDirectly: new Map((raw.readDirectly || []).map((e) => [normaliseKey(e.url), e])),
  };
}

/* --- Fetching -------------------------------------------------------------- */

async function fetchAll(urls, onProgress) {
  const byHost = new Map();
  for (const url of urls) {
    const h = hostOf(url) || '(malformed)';
    if (!byHost.has(h)) byHost.set(h, []);
    byHost.get(h).push(url);
  }

  const results = new Map();
  const hosts = [...byHost.keys()];
  let done = 0;

  /* One host at a time per worker, and strictly sequential within a host —
     `fetch-cache.mjs` keeps a per-host clock that concurrent callers would
     race, and a university is entitled to not be hit six ways at once. */
  await Promise.all(
    Array.from({ length: Math.min(HOST_CONCURRENCY, hosts.length) }, async () => {
      while (hosts.length) {
        const host = hosts.pop();
        for (const url of byHost.get(host)) {
          results.set(url, await fetchCached(url, { maxAgeHours: MAX_AGE_HOURS }));
          onProgress(++done);
        }
      }
    })
  );

  return results;
}

/* --- Report ---------------------------------------------------------------- */

const ORDER = ['dead', 'unknowable', 'redirected', 'refused', 'alive'];
const LABEL = {
  alive: 'alive',
  redirected: 'redirected',
  dead: 'DEAD',
  refused: 'refused (read directly)',
  unknowable: 'unknowable',
};

async function main() {
  const policy = await loadPolicy();
  const targets = await collectTargets();
  const urls = [...new Set(targets.map((t) => t.url))];

  console.log(
    `\n${targets.length} links on ${new Set(targets.map((t) => `${t.where}|${t.institution}`)).size} institutions ` +
      `· ${urls.length} distinct URLs · ${new Set(urls.map(hostOf)).size} hosts\n`
  );

  const fetched = await fetchAll(urls, (n) => {
    if (n % 25 === 0 || n === urls.length) process.stdout.write(`\r  fetched ${n}/${urls.length}  `);
  });
  process.stdout.write('\r' + ' '.repeat(40) + '\r');

  const rows = targets.map((t) => {
    const res = fetched.get(t.url);
    const { verdict, reason } = judge(t, res, policy);
    return { ...t, verdict, reason, status: res.status, finalUrl: res.finalUrl, from: res.from };
  });

  const counts = Object.fromEntries(ORDER.map((v) => [v, rows.filter((r) => r.verdict === v).length]));
  console.log('Verdicts');
  for (const v of ORDER) console.log(`  ${String(counts[v]).padStart(4)}  ${LABEL[v]}`);
  console.log('');

  /* Per field, because the three fields do not carry the same risk. A dead
     `website` is embarrassing; a dead `ibPageUrl` is the one that made a
     student believe we had checked. */
  console.log('By field');
  for (const f of COUNTRY_FIELDS) {
    const sub = rows.filter((r) => r.field === f);
    if (!sub.length) continue;
    const bits = ORDER.map((v) => `${sub.filter((r) => r.verdict === v).length} ${v}`).join(' · ');
    console.log(`  ${f.padEnd(14)} ${String(sub.length).padStart(4)}   ${bits}`);
  }
  console.log('');

  /* The number the Canada finding asked for. */
  const deadIb = rows.filter((r) => r.field === 'ibPageUrl' && r.verdict === 'dead');
  const unknownIb = rows.filter((r) => r.field === 'ibPageUrl' && r.verdict === 'unknowable');
  if (deadIb.length || unknownIb.length) {
    console.log('Dead ibPageUrl by scope  (unknowable in brackets)');
    const scopes = [...new Set([...deadIb, ...unknownIb].map((r) => r.scope))].sort();
    for (const s of scopes) {
      const d = deadIb.filter((r) => r.scope === s).length;
      const u = unknownIb.filter((r) => r.scope === s).length;
      console.log(`  ${s.padEnd(6)} ${String(d).padStart(3)} dead${u ? `   (${u} unknowable)` : ''}`);
    }
    console.log('');
  }

  for (const v of ['dead', 'unknowable', 'redirected']) {
    const sub = rows.filter((r) => r.verdict === v);
    if (!sub.length) continue;
    console.log(`${LABEL[v]} — ${sub.length}`);
    for (const r of sub.sort((a, b) => a.where.localeCompare(b.where) || a.institution.localeCompare(b.institution))) {
      console.log(`  ${r.where}  ${r.institution} · ${r.field}`);
      console.log(`    ${r.url}`);
      console.log(`    ${r.reason}`);
    }
    console.log('');
  }

  if (counts.refused) {
    console.log(`refused but read directly — ${counts.refused}`);
    for (const r of rows.filter((x) => x.verdict === 'refused')) {
      console.log(`  ${r.institution} · ${r.field} — ${r.url}`);
    }
    console.log('');
  }

  if (JSON_OUT) {
    await fs.writeFile(path.resolve(ROOT, JSON_OUT), JSON.stringify({ counts, rows }, null, 2));
    console.log(`Wrote ${JSON_OUT}\n`);
  }

  /* Non-zero on dead links only. `unknowable` is deliberately not a failure:
     it means the checker could not tell, and failing on "could not tell" is how
     a checker teaches people to ignore it. It is still printed in full, because
     a growing unknowable list is a real signal — it just is not a verdict. */
  if (counts.dead) {
    console.log(`${counts.dead} dead links. Each one is a page a student would be sent to and not find.\n`);
    process.exit(1);
  }
  console.log('No dead links.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
