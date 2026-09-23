/**
 * Re-open every cited source and check it still says what we published.
 *
 *   node scripts/verify-evidence.mjs                       # report only
 *   node scripts/verify-evidence.mjs --field requirements  # the claims that matter most
 *   node scripts/verify-evidence.mjs --write               # record the findings
 *   node scripts/verify-evidence.mjs --id ev-sdu-dk-1140b4u --verbose
 *
 * WHAT THIS IS, AND WHAT IT IS NOT
 *
 * `verificationState: "verified"` means a person read the source and signed the
 * claim off. This script cannot produce that and does not try to. Automation is
 * not allowed to be the final authority on a rule that decides whether a
 * seventeen-year-old can apply somewhere, and a script that promotes its own
 * findings to "verified" is precisely that.
 *
 * What it produces instead is a `sourceCheck` block on each record: the page was
 * re-fetched on this date, here is the wording that supports the claim, quoted.
 * That is worth a great deal on its own — it turns human sign-off from "open
 * fourteen tabs and read them" into "does this quote say what we say it says",
 * which is the difference between a review that happens and one that does not.
 *
 * Three outcomes, and the middle one is the point:
 *
 *   supported    every consequential part of the claim was found on the page,
 *                and the wording is now quoted in the record.
 *   partial      some of it was found. Usually a restructured page rather than a
 *                wrong claim, but it needs eyes.
 *   unsupported  nothing was found, or the page is gone. This is the list that
 *                matters: these are live claims with nothing currently behind them.
 *
 * A miss is never acted on automatically. Nothing here downgrades, rewrites or
 * removes a claim — it only records what was seen, for a person to act on.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchCached } from './lib/fetch-cache.mjs';
import { loadLinkPolicy } from './lib/link-policy.mjs';
import { htmlToText, pageTitle, looksLikeSoftError, excerptAround } from './lib/html-text.mjs';
import { probesForRequirements, probesForMilestones, textProbes, probeCoverage, runProbes } from './lib/claim-probe.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const TODAY = new Date().toISOString().slice(0, 10);

/* Shared with scripts/check-institution-links.mjs, so that a host discovered by
   either tool is known to both. */
const LINK_POLICY = await loadLinkPolicy();

/* The IB subject catalogue, so a requirement written as `ibSubject: "mathematics-aa"`
   can be looked for under the name a page would actually print. */
const SUBJECT_CATALOGUE = await (async () => {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(DATA, "ib-subjects.json"), "utf8"));
    return new Map((raw.subjects || []).map((s) => [s.id, s]));
  } catch {
    return new Map();
  }
})();

/* --- arguments ------------------------------------------------------------ */
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const OPTS = {
  write: flag('write'),
  verbose: flag('verbose'),
  field: value('field'),
  id: value('id'),
  file: value('file'),
  limit: Number(value('limit', '0')) || 0,
  maxAgeHours: Number(value('max-age', '72')),
};

/* --- loading -------------------------------------------------------------- */
async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function loadEntities() {
  const byId = new Map();
  // context-notes was added to the model after this list was written, and its
  // absence made every record backing a cultural observation report "no record
  // exists, so this evidence backs nothing" — a confident false negative about
  // records that were perfectly sound.
  for (const dir of [
    'opportunities',
    'programmes',
    'institutions',
    'places',
    'destinations',
    'application-routes',
    'application-systems',
    'context-notes',
  ]) {
    const full = path.join(DATA, dir);
    let files;
    try {
      files = await fs.readdir(full);
    } catch {
      continue;
    }
    for (const f of files.filter((x) => x.endsWith('.json'))) {
      const rec = await readJson(path.join(full, f));
      if (rec?.id) byId.set(rec.id, rec);
    }
  }
  // Institutions also live nested under data/countries/*.json in this repo.
  //
  // And so does the country profile itself, which is the part this missed. A
  // country profile is keyed by `code` rather than `id`, so indexing only the
  // nested institutions left every Evidence record supporting a Destination's
  // own fields — `pl` / `application.deadlines`, `si` / `ibRecognition.notes` —
  // reporting "no record exists, so this evidence backs nothing".
  //
  // That is `unsupported`: the strongest negative this tool has, and the one
  // that means a published claim has nothing behind it. It was being applied to
  // records that were sound, which is worse than not checking them, because it
  // manufactures alarm and buries the real unsupported ones among it.
  //
  // This is the second time: the comment above records `context-notes` doing
  // exactly the same thing for the same reason. A list of directories that has
  // to be kept in step with the model by hand will fall out of step with it.
  try {
    for (const f of (await fs.readdir(path.join(DATA, 'countries'))).filter((x) => x.endsWith('.json'))) {
      const c = await readJson(path.join(DATA, 'countries', f));
      if (c?.code) byId.set(c.code, c);
      for (const inst of c.institutions || []) if (inst.id) byId.set(inst.id, inst);
    }
  } catch {
    /* optional */
  }
  return byId;
}

async function loadEvidenceFiles() {
  const dir = path.join(DATA, 'evidence');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  const chosen = OPTS.file ? files.filter((f) => f === OPTS.file) : files;
  const out = [];
  for (const f of chosen) {
    const doc = await readJson(path.join(dir, f));
    out.push({ file: f, path: path.join(dir, f), doc, records: doc.records || doc });
  }
  return out;
}

/* --- checking one record --------------------------------------------------- */

/**
 * One evidence record usually backs several claims at once — the institution
 * blurb, the programme summary AND the entry requirements all cite the same
 * page. Every one of them gets checked, and the record is only as good as its
 * weakest claim, because a record that is right about the prose and wrong about
 * the requirements is a record that will mislead somebody.
 */
/** `supports.field` may be a dotted path — "ibRecognition.minimumPoints". */
function valueAtPath(obj, pathExpr) {
  return String(pathExpr || '')
    .split('.')
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/**
 * Flatten whatever a field holds into something matchable. Several fields are
 * arrays of objects — a destination's `watchOuts`, its `feeContext` — and a
 * claim backed by one of those is still a claim worth checking.
 */
function asCheckableText(value, depth = 0) {
  if (value == null || depth > 3) return '';
  // A bare id is a reference to another record, not a statement about the
  // world. Word-matching "dk-optagelse" against a page measures nothing.
  if (typeof value === 'string') return /^[a-z]{2}(-[a-z0-9]+)+$/.test(value) ? '' : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((v) => asCheckableText(v, depth + 1)).join(' ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([k]) => !['id', 'evidence', 'meta', 'schemaVersion'].includes(k))
      .map(([, v]) => asCheckableText(v, depth + 1))
      .join(' ');
  }
  return '';
}

function claimsToCheck(record, entities) {
  const out = [];
  for (const support of record.supports || []) {
    if (OPTS.field && support.field !== OPTS.field) continue;
    const entity = entities.get(support.entity);

    if (support.field === 'milestones') {
      const groups = probesForMilestones(entity?.milestones);
      out.push(
        groups.length
          ? { type: 'requirements', field: support.field, entity: support.entity, groups }
          : { type: 'unresolved', field: support.field, entity: support.entity }
      );
      continue;
    }

    if (support.field === 'requirements') {
      if (entity?.requirements?.length) {
        const groups = probesForRequirements(entity.requirements, SUBJECT_CATALOGUE);
        /* Requirements exist but nothing could be looked for. That is not a
         * check that passed with nothing to find — it is a check that never
         * ran, and reporting it as "0 of 0 found" made it read like a soft
         * pass. It hid every Danish requirement for a while. */
        out.push(
          groups.length
            ? { type: 'requirements', field: support.field, entity: support.entity, groups }
            : { type: 'uncheckable', field: support.field, entity: support.entity, count: entity.requirements.length }
        );
      } else {
        out.push({ type: 'unresolved', field: support.field, entity: support.entity });
      }
      continue;
    }

    if (!entity) {
      out.push({ type: 'missing-entity', field: support.field, entity: support.entity });
      continue;
    }
    const text = asCheckableText(valueAtPath(entity, support.field)) || record.claim || '';
    if (text.trim()) {
      out.push({ type: 'text', field: support.field, entity: support.entity, text, probes: textProbes(text) });
    } else {
      out.push({ type: 'unresolved', field: support.field, entity: support.entity });
    }
  }
  return out;
}

const WORST = { supported: 0, partial: 1, unsupported: 2 };
const worseOf = (a, b) => (WORST[b] > WORST[a] ? b : a);

async function checkRecord(record, entities) {
  const res = await fetchCached(record.sourceUrl, { maxAgeHours: OPTS.maxAgeHours });
  if (!res.ok || !res.body) {
    /* "We could not fetch it" and "it is not there" are different facts, and
     * conflating them was costing real pages. The distinction is not this
     * tool's to define — scripts/lib/link-policy.mjs holds it, shared with the
     * link checker, which had it right while this had it backwards. A host
     * either tool discovers is now known to both. */
    const verdict = LINK_POLICY.classify(record.sourceUrl, res.status, res.error);
    return {
      /* Only a page that is GONE is "a claim with nothing behind it". A host
       * that refuses us may be serving the source perfectly well to everyone
       * else, so the honest outcome is "a person has to look" — which is what
       * `partial` means here — rather than a verdict we are not entitled to. */
      outcome: verdict.kind === 'gone' ? 'unsupported' : 'partial',
      reason: verdict.reason,
      reachable: false,
      gone: verdict.gates,
      refusal: verdict.kind,
      details: [],
    };
  }

  // A PDF is not HTML and this tool cannot read one. Saying "wrong page" about
  // a perfectly good tuition-fee PDF would be a lie dressed as a finding, so it
  // is reported for what it is: live, and needing a person.
  if (/^%PDF-/.test(res.body.slice(0, 8)) || /\.pdf($|\?)/i.test(record.sourceUrl)) {
    return {
      outcome: 'partial',
      reason: 'the source is a PDF, which this tool cannot read — it needs a human read',
      reachable: true,
      claims: [],
      details: [],
    };
  }

  const title = pageTitle(res.body);
  // NOT norm()'d — htmlToText already tidies spaces, and its newlines carry the
  // page's table structure, which the requirement probes depend on. Flattening
  // them here silently disabled every table-layout match.
  const text = htmlToText(res.body);
  if (looksLikeSoftError(text, title)) {
    return { outcome: 'unsupported', reason: `page reports it does not exist ("${title}")`, reachable: false, details: [] };
  }
  if (text.length < 400) {
    /* Same category as a 403: the host is not serving its content to us. A
     * page that renders in JavaScript is usually fine in a browser, and several
     * of the records that land here say so in their own ids. "A person has to
     * look" is the honest outcome; "nothing behind this claim" is not ours to
     * say. Worth adding the host to scripts/lib/link-policy.json so the link
     * checker knows it too. */
    return {
      outcome: 'partial',
      reason: 'page serves almost no readable text to a plain fetch (JavaScript-rendered) — read it in a browser',
      reachable: true,
      refusal: 'javascript-rendered',
      details: [],
    };
  }

  // A REFERENCE record is a page consulted about an institution rather than
  // evidence for one published sentence — an admissions hub, a key-figures
  // page. There is no wording to match, so the meaningful question is narrower
  // and still worth asking: is it live, and is it still about this institution?
  if (record.role === 'reference') {
    const subject = (record.supports || []).map((s) => entities.get(s.entity)).find(Boolean);
    const names = [subject?.name, subject?.shortName, subject?.localName].filter(Boolean);
    const hit = names.map((n) => text.indexOf(n)).find((i) => i >= 0);
    return {
      outcome: names.length && hit == null ? 'partial' : 'supported',
      reason: names.length
        ? hit != null
          ? `reference page is live and still names ${names[0]}`
          : `reference page is live but no longer names ${names[0]}`
        : 'reference page is live',
      reachable: true,
      excerpt: hit != null ? excerptAround(text, hit, names[0].length) : null,
      pageTitle: title,
      claims: [],
      details: [],
    };
  }

  const targets = claimsToCheck(record, entities);
  if (!targets.length) {
    return { outcome: 'partial', reason: 'page is live, but no checkable claim is attached', reachable: true, pageTitle: title, claims: [] };
  }

  const claims = [];
  for (const target of targets) {
    if (target.type === 'requirements') {
      const details = [];
      let met = 0;
      let best = null;
      for (const g of target.groups) {
        const hit = runProbes(g.probes, text);
        details.push({ requirement: g.requirement, role: g.role, found: hit.found, matched: hit.label, weak: hit.weak });
        if (hit.found) {
          met++;
          if (!best) best = excerptAround(text, hit.index, hit.length);
        }
      }
      // Three kinds of group, scored differently, because conflating them is
      // how a checker produces confident nonsense:
      //   required        every one must be found.
      //   one-of          a branch of "either this or that" — ANY one suffices.
      //   informational   a provisional date we already label as unconfirmed;
      //                   checked and reported, but it cannot fail the record.
      const need = details.filter((d) => d.role === 'required');
      const branches = details.filter((d) => d.role === 'one-of');
      const needOk = need.length > 0 && need.every((d) => d.found);
      const branchesOk = branches.length === 0 || branches.some((d) => d.found);

      // A record whose only claims are informational — provisional dates the
      // site already labels unconfirmed — has nothing to decide on. Reporting
      // it as "unsupported" said the opposite of what was true: not "we checked
      // and found nothing behind this", but "there was never anything here to
      // check". Several destinations whose entire calendar is provisional read
      // as unsourced for that reason alone.
      const decisive = need.length + branches.length;
      const outcome =
        decisive === 0
          ? 'partial'
          : needOk && branchesOk
            ? 'supported'
            : met > 0
              ? 'partial'
              : 'unsupported';
      claims.push({
        field: target.field,
        entity: target.entity,
        decisive: true,
        outcome,
        reason: `${met} of ${target.groups.length} recorded requirement(s) found on the page`,
        excerpt: best,
        details,
      });
    } else if (target.type === 'text') {
      // A descriptive claim — an institution blurb or a programme summary — is
      // OUR prose, written from the source rather than copied from it. Scoring
      // it by word overlap and calling a low score "unsupported" is nonsense:
      // it measures how much we paraphrased, not whether we were right.
      //
      // So overlap is used for one narrow thing it is actually good at: telling
      // us we cited the WRONG PAGE. If almost none of the claim's content words
      // appear, the page is probably about something else entirely, and that is
      // worth a person's attention. Anything above that floor passes, because
      // judging a paraphrase is a job for a reader, not a word counter.
      const cov = probeCoverage(target.probes, text);
      const ratio = cov.total ? cov.hit / cov.total : 0;
      const outcome = ratio >= 0.25 ? 'supported' : 'partial';
      let excerpt = null;
      if (cov.first) {
        const m = cov.first.re.exec(text);
        if (m) excerpt = excerptAround(text, m.index, m[0].length);
      }
      claims.push({
        field: target.field,
        entity: target.entity,
        decisive: false,
        outcome,
        reason:
          outcome === 'supported'
            ? `page is on-topic for this claim (${cov.hit}/${cov.total} content words present)`
            : `page may be the wrong one — only ${cov.hit} of ${cov.total} content words appear`,
        excerpt,
        details: [],
      });
    } else if (target.type === 'uncheckable') {
      claims.push({
        field: target.field,
        entity: target.entity,
        decisive: true,
        outcome: 'partial',
        reason:
          `${target.count} requirement(s) recorded on ${target.entity}, and none of them is in a form this ` +
          `tool can look for. Nothing was checked — this is not a pass.`,
        excerpt: null,
        details: [],
      });
    } else if (target.type === 'missing-entity') {
      // We are citing a source for something that is not in the data at all.
      // That is a broken record, and it is decisive.
      claims.push({
        field: target.field,
        entity: target.entity,
        decisive: true,
        outcome: 'unsupported',
        reason: `no record exists for "${target.entity}", so this evidence backs nothing`,
        excerpt: null,
        details: [],
      });
    } else {
      // The entity exists but the field is empty or not text. Nothing to match
      // against — which is a gap in our own record, not a failure of the source,
      // and certainly not grounds for calling a live page unsupported.
      claims.push({
        field: target.field,
        entity: target.entity,
        decisive: false,
        outcome: 'partial',
        reason: `"${target.field}" holds nothing matchable on ${target.entity}, so only a person can check this one`,
        excerpt: null,
        details: [],
      });
    }
  }

  // Decisive claims set the verdict. A descriptive claim can only pull a record
  // down to "partial", never to "unsupported" — being unable to confirm a
  // paraphrase is not the same as having nothing behind an entry requirement.
  const decisive = claims.filter((c) => c.decisive);
  const base = (decisive.length ? decisive : claims).map((c) => c.outcome).reduce(worseOf, 'supported');
  const descriptiveDoubt = claims.some((c) => !c.decisive && c.outcome !== 'supported');
  const outcome = base === 'supported' && descriptiveDoubt ? 'partial' : base;
  const worst = claims.find((c) => c.outcome === outcome) || claims[0];
  return {
    outcome,
    reason: claims.length === 1 ? claims[0].reason : `${claims.length} claims checked; weakest: ${worst.field} — ${worst.reason}`,
    reachable: true,
    /* The decisive claim's excerpt, not the first one's.
     *
     * A record backing an institution blurb AND its entry requirements was
     * quoting the blurb — which on a university page is the navigation menu.
     * The requirements claim on the same record had "English B Mathematics A
     * with a minimum average grade of 4.0" sitting right there. A reviewer
     * reads this quotation to decide whether the record is sound, so it has to
     * be the sentence the record actually turns on. */
    excerpt:
      claims.find((c) => c.decisive && c.excerpt)?.excerpt ||
      claims.find((c) => c.excerpt)?.excerpt ||
      null,
    pageTitle: title,
    claims,
    details: claims.flatMap((c) => c.details),
  };
}

/* --- main ------------------------------------------------------------------ */
async function main() {
  const entities = await loadEntities();
  const files = await loadEvidenceFiles();

  const totals = { supported: 0, partial: 0, unsupported: 0, skipped: 0 };
  const problems = [];
  let done = 0;

  for (const f of files) {
    let changed = false;
    for (const record of f.records) {
      if (OPTS.id && record.id !== OPTS.id) continue;
      if (OPTS.field && !(record.supports || []).some((s) => s.field === OPTS.field)) continue;
      if (record.verificationState === 'verified' && !OPTS.id) {
        totals.skipped++;
        continue;
      }
      if (OPTS.limit && done >= OPTS.limit) break;
      done++;

      const result = await checkRecord(record, entities);
      totals[result.outcome]++;

      if (OPTS.verbose || result.outcome !== 'supported') {
        problems.push({ file: f.file, id: record.id, url: record.sourceUrl, ...result });
      }

      if (OPTS.write) {
        record.sourceCheck = {
          checkedAt: TODAY,
          outcome: result.outcome,
          reason: result.reason,
          method: 'automated re-fetch and wording match (scripts/verify-evidence.mjs)',
          ...(result.excerpt ? { excerpt: result.excerpt } : {}),
          ...(result.claims?.length ? { claims: result.claims } : {}),
        };
        // Only a source that is GONE gates the engine. A source that merely
        // refuses robots is recorded in the sourceCheck and left alone — see
        // the note where `gone` is set.
        if (result.gone) record.verificationState = 'unavailable';
        changed = true;
      }

      process.stderr.write(
        `\r  checked ${done}  ✓${totals.supported} ~${totals.partial} ✗${totals.unsupported}   `
      );
    }
    if (changed && OPTS.write) {
      await fs.writeFile(f.path, JSON.stringify(f.doc, null, 2) + '\n');
    }
  }
  process.stderr.write('\r' + ' '.repeat(60) + '\r');

  /* --- report ------------------------------------------------------------- */
  console.log(`\nEvidence source check — ${TODAY}\n`);
  console.log(`  supported    ${String(totals.supported).padStart(4)}   the cited page still carries the wording`);
  console.log(`  partial      ${String(totals.partial).padStart(4)}   some of the claim was found`);
  console.log(`  unsupported  ${String(totals.unsupported).padStart(4)}   nothing found, or the page is gone`);
  if (totals.skipped) console.log(`  skipped      ${String(totals.skipped).padStart(4)}   already verified by a person`);

  const bad = problems.filter((p) => p.outcome === 'unsupported');
  const mid = problems.filter((p) => p.outcome === 'partial');

  if (bad.length) {
    console.log(`\nUnsupported — a published claim with nothing currently behind it:\n`);
    for (const p of bad) {
      console.log(`  ✗ ${p.id}`);
      console.log(`      ${p.reason}`);
      console.log(`      ${p.url}`);
      const missing = (p.details || []).filter((d) => !d.found && d.role !== 'informational').map((d) => d.requirement);
      if (missing.length) console.log(`      not found: ${missing.join(' · ')}`);
    }
  }
  if (mid.length) {
    console.log(`\nPartial — live page, incomplete match. Usually a restructured page:\n`);
    for (const p of mid) {
      const missing = (p.details || []).filter((d) => !d.found && d.role !== 'informational').map((d) => d.requirement);
      console.log(`  ~ ${p.id}  ${p.reason}`);
      if (missing.length) console.log(`      not found: ${missing.join(' · ')}`);
      if (OPTS.verbose && p.excerpt) console.log(`      “${p.excerpt}”`);
    }
  }
  if (OPTS.verbose) {
    for (const p of problems.filter((x) => x.outcome === 'supported')) {
      console.log(`\n  ✓ ${p.id}\n      ${p.reason}\n      “${p.excerpt || ''}”`);
    }
  }

  console.log(
    OPTS.write
      ? `\nWritten. Each record now carries a sourceCheck block with the date, the outcome and the supporting wording.\nThis is not sign-off: verificationState only moves to "verified" when a person reads the quote and agrees.\n`
      : `\nNothing written. Re-run with --write to record these findings on the evidence records.\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
