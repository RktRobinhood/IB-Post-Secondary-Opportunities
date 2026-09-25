/**
 * Validates the canonical entity records against schemas/ and checks that every
 * cross-reference resolves.
 *
 *   node scripts/validate.mjs
 *   node scripts/validate.mjs --quiet   # only failures
 *
 * Two kinds of problem are reported separately, because they mean different
 * things: a *schema* error means a record is malformed and cannot be trusted;
 * a *reference* error means records disagree about what exists.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { SchemaSet } from '../src/lib/validate-schema.mjs';
import { assessSourcing, claimKindForField, isAuthoritative, CLAIM_KIND } from '../src/lib/source-classes.mjs';
import { checkContextNote } from '../src/lib/context-voice.mjs';
import { loadCanonical } from '../src/lib/canonical.mjs';
import { checkFamilies } from '../src/lib/families.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schemas');
const DATA = path.join(ROOT, 'data');
const QUIET = process.argv.includes('--quiet');

/** Folder name to entity key. Spelled out because "opportunities" does not
    singularise by dropping an "s". */
const SINGULAR = {
  destinations: 'destination',
  places: 'place',
  institutions: 'institution',
  programmes: 'programme',
  opportunities: 'opportunity',
  'application-systems': 'application-system',
  'application-routes': 'application-route',
  'context-notes': 'context-note',
  recognition: 'recognition-scheme',
  funding: 'funding-scheme',
};

/** Which folder holds which entity, and which schema validates it. */
const COLLECTIONS = [
  { dir: 'destinations', schema: 'destination.schema.json', kind: 'Destination' },
  { dir: 'places', schema: 'place.schema.json', kind: 'Place' },
  { dir: 'institutions', schema: 'institution.schema.json', kind: 'Institution' },
  { dir: 'programmes', schema: 'programme.schema.json', kind: 'Programme' },
  { dir: 'opportunities', schema: 'opportunity.schema.json', kind: 'Opportunity' },
  { dir: 'application-systems', schema: 'application-system.schema.json', kind: 'Application System' },
  { dir: 'application-routes', schema: 'application-route.schema.json', kind: 'Application Route' },
  { dir: 'context-notes', schema: 'context-note.schema.json', kind: 'Context Note' },
  { dir: 'recognition', schema: 'recognition-scheme.schema.json', kind: 'Recognition Scheme' },
  /* A grant whose eligibility turns on who the student is (docs/research/audience). */
  { dir: 'funding', schema: 'funding-scheme.schema.json', kind: 'Funding Scheme' },
];

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8');
  try {
    return { value: JSON.parse(raw) };
  } catch (err) {
    // Turn "Unexpected token } in JSON at position 8134" into a line and column.
    const pos = Number((err.message.match(/position (\d+)/) || [])[1]);
    if (Number.isFinite(pos)) {
      const before = raw.slice(0, pos);
      const line = before.split('\n').length;
      const col = pos - before.lastIndexOf('\n');
      return { error: `${err.message.split(' in JSON')[0]} at line ${line}, column ${col}` };
    }
    return { error: err.message };
  }
}

async function listJson(dir) {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

async function main() {
  /* Load schemas */
  const set = new SchemaSet();
  for (const f of await listJson(SCHEMA_DIR)) {
    const { value, error } = await readJson(path.join(SCHEMA_DIR, f));
    if (error) {
      console.error(`schemas/${f}: ${error}`);
      process.exit(1);
    }
    set.add(f, value);
  }

  const ids = { destination: new Set(), place: new Set(), institution: new Set(), programme: new Set(), opportunity: new Set(), 'application-system': new Set(), 'application-route': new Set() };
  const evidenceIds = new Set();
  const evidenceById = new Map();
  const records = [];
  const schemaErrors = [];
  const refErrors = [];
  let parsed = 0;

  /* Evidence first — everything else points at it. */
  for (const f of await listJson(path.join(DATA, 'evidence'))) {
    const rel = `data/evidence/${f}`;
    const { value, error } = await readJson(path.join(DATA, 'evidence', f));
    if (error) { schemaErrors.push(`${rel}: ${error}`); continue; }
    const items = Array.isArray(value) ? value : Object.values(value);
    for (const [i, ev] of items.entries()) {
      parsed++;
      const errs = set.validate(ev, 'evidence.schema.json', { path: `[${i}]` });
      for (const e of errs) schemaErrors.push(`${rel} → ${e.path}: ${e.message}`);
      if (ev?.id) { evidenceIds.add(ev.id); evidenceById.set(ev.id, ev); }
    }
  }

  /* Then the entities */
  for (const c of COLLECTIONS) {
    for (const f of await listJson(path.join(DATA, c.dir))) {
      const rel = `data/${c.dir}/${f}`;
      const { value, error } = await readJson(path.join(DATA, c.dir, f));
      if (error) { schemaErrors.push(`${rel}: ${error}`); continue; }
      parsed++;
      const errs = set.validate(value, c.schema);
      for (const e of errs) schemaErrors.push(`${rel} → ${e.path}: ${e.message}`);
      const key = SINGULAR[c.dir];
      if (value?.id) ids[key]?.add(value.id);
      records.push({ rel, kind: c.kind, dir: c.dir, value });
    }
  }

  /* A Place may belong to a country that has not migrated to a Destination
     record yet. Those country profiles are still a real destination, so their
     codes count — otherwise geocoding a country would break the build until
     someone migrated it, which is exactly backwards. */
  for (const f of await listJson(path.join(DATA, 'countries'))) {
    const { value } = await readJson(path.join(DATA, 'countries', f));
    if (value?.code) ids.destination.add(value.code);
  }

  /* Funding lines may reference a scheme in data/funding/ instead of restating it. */
  const fundIds = new Set(records.filter((r) => r.dir === 'funding').map((r) => r.value?.id));
  for (const f of await listJson(path.join(DATA, 'countries'))) {
    const { value } = await readJson(path.join(DATA, 'countries', f));
    (value?.funding || []).forEach((x, i) => {
      if (x && typeof x === 'object' && !fundIds.has(x.fund)) refErrors.push(`data/countries/${f} → funding[${i}].fund: no Funding Scheme with id "${x.fund}"`);
    });
  }

  /* Cross-references */
  const check = (rel, field, id, pool, label) => {
    if (id && !pool.has(id)) refErrors.push(`${rel} → ${field}: no ${label} with id "${id}"`);
  };

  for (const r of records) {
    const v = r.value;
    if (r.dir === 'institutions') {
      check(r.rel, 'destination', v.destination, ids.destination, 'Destination');
      (v.places || []).forEach((p, i) => check(r.rel, `places[${i}]`, p, ids.place, 'Place'));
    }
    if (r.dir === 'places') check(r.rel, 'destination', v.destination, ids.destination, 'Destination');
    if (r.dir === 'funding') check(r.rel, 'destination', v.destination, ids.destination, 'Destination');
    if (r.dir === 'destinations') (v.livingContext?.funding || []).forEach((x, i) => x?.fund && check(r.rel, `livingContext.funding[${i}].fund`, x.fund, fundIds, 'Funding Scheme'));
    if (r.dir === 'programmes') check(r.rel, 'institution', v.institution, ids.institution, 'Institution');
    if (r.dir === 'opportunities') {
      check(r.rel, 'programme', v.programme, ids.programme, 'Programme');
      check(r.rel, 'institution', v.institution, ids.institution, 'Institution');
      check(r.rel, 'destination', v.destination, ids.destination, 'Destination');
      check(r.rel, 'place', v.place, ids.place, 'Place');
      (v.applicationRoutes || []).forEach((x, i) =>
        check(r.rel, `applicationRoutes[${i}]`, x, ids['application-route'], 'Application Route')
      );
    }
    if (r.dir === 'application-routes') {
      check(r.rel, 'applicationSystem', v.applicationSystem, ids['application-system'], 'Application System');
      (v.appliesTo || []).forEach((x, i) => check(r.rel, `appliesTo[${i}]`, x, ids.opportunity, 'Opportunity'));
    }

    /* Evidence references, wherever they appear */
    walk(v, (node, pathStr) => {
      if (Array.isArray(node) && pathStr.endsWith('evidence')) {
        node.forEach((ref, i) => {
          if (typeof ref === 'string' && !evidenceIds.has(ref)) {
            refErrors.push(`${r.rel} → ${pathStr}[${i}]: no Evidence with id "${ref}"`);
          }
        });
      }
    });
  }

  /* --- Source classes -------------------------------------------------------
   *
   * The rule that going worldwide depends on: a secondary source may establish
   * context, may point us at the official page, and may never on its own make a
   * consequential claim verified. Enforced here rather than trusted to
   * editorial discipline, because "a school's guidance page said so" and "the
   * ministry said so" look identical once they are both JSON, and the
   * difference only becomes visible when a student has already acted on it.
   */
  const sourcingErrors = [];

  /* The question is asked per CLAIM, not per record. A promotion agency cited
     alongside the rule-owner is useful — it is usually the clearer explanation.
     A promotion agency cited alone for who pays tuition is the problem. So the
     classes backing each (entity, field) are pooled, and the claim passes if any
     one of them is permitted to establish it. */
  const byClaim = new Map();
  for (const [id, ev] of evidenceById) {
    if (!ev.sourceClass) {
      sourcingErrors.push(`${id}: no sourceClass — what this source may establish is undeclared`);
      continue;
    }
    for (const sup of ev.supports || []) {
      const key = `${sup.entity}.${sup.field}`;
      if (!byClaim.has(key)) byClaim.set(key, []);
      byClaim.get(key).push({ id, cls: ev.sourceClass, state: ev.verificationState });
    }
  }

  for (const [key, sources] of byClaim) {
    const field = key.slice(key.indexOf('.') + 1);
    const kind = claimKindForField(field);
    const { ok, reason } = assessSourcing(sources.map((s) => s.cls), kind);
    if (!ok) {
      sourcingErrors.push(`${key} is a ${kind} claim, and ${reason}
      cited by: ${sources.map((s) => s.id).join(', ')}`);
    }

    /* Separately: a non-authoritative source may never carry `verified` for a
       consequential claim, even where an authoritative one sits beside it. The
       sign-off has to be attached to the source that actually owns the rule. */
    if (kind === CLAIM_KIND.CONSEQUENTIAL) {
      for (const s of sources) {
        if (s.state === 'verified' && !isAuthoritative(s.cls)) {
          sourcingErrors.push(
            `${s.id}: marked verified for the consequential claim ${key}, but ${s.cls} is not authoritative. ` +
              `Sign off against the body that owns the rule.`
          );
        }
      }
    }
  }

  /* --- Context notes may not speak like rules -------------------------------
   * The reasoning lives next to the rule it enforces, in
   * src/lib/context-voice.mjs, so the two cannot drift apart. */
  for (const f of await listJson(path.join(DATA, 'context-notes'))) {
    const { value } = await readJson(path.join(DATA, 'context-notes', f));
    for (const note of [value].flat().filter((n) => n && n.id)) {
      for (const problem of checkContextNote(note)) sourcingErrors.push(problem);
    }
  }

  /* --- Programme families -------------------------------------------------
   * One programme offered as several paths shares one card. The rules, and
   * the check that a family's "admission" matches its members' requirements,
   * live in src/lib/families.mjs so the renderer and this file agree. */
  const familyErrors = checkFamilies(
    records.filter((r) => r.dir === 'programmes').map((r) => r.value),
    records.filter((r) => r.dir === 'opportunities').map((r) => r.value)
  );
  for (const e of familyErrors) refErrors.push(`programme families → ${e}`);

  /* Report */
  /* Graph integrity is asked of the loader rather than recomputed here.
   *
   * This file used to collect ids into Sets and never compare them, so a
   * duplicate id passed validation and then silently overwrote a record at
   * load time — two different modules each assuming the other one checked.
   * The loader is the only place that can see both files claiming an id, so it
   * is the only place that can name them, and asking it costs one call. */
  const integrityErrors = (await loadCanonical({ strict: false })).diagnostics
    .filter((d) => d.level === 'error')
    .map((d) => d.message);

  const total = schemaErrors.length + refErrors.length + sourcingErrors.length + integrityErrors.length;
  if (!QUIET) {
    console.log(`\nValidated ${parsed} records across ${COLLECTIONS.length} collections plus evidence.`);
    const counts = Object.entries(ids)
      .filter(([, s]) => s.size)
      .map(([k, s]) => `${s.size} ${k}`)
      .join(' · ');
    if (counts) console.log(`  ${counts} · ${evidenceIds.size} evidence\n`);
  }

  if (schemaErrors.length) {
    console.log(`${schemaErrors.length} schema error(s):`);
    for (const e of schemaErrors.slice(0, 50)) console.log(`  ✗ ${e}`);
    if (schemaErrors.length > 50) console.log(`  … and ${schemaErrors.length - 50} more`);
    console.log('');
  }
  if (refErrors.length) {
    console.log(`${refErrors.length} reference error(s):`);
    for (const e of refErrors.slice(0, 50)) console.log(`  ✗ ${e}`);
    if (refErrors.length > 50) console.log(`  … and ${refErrors.length - 50} more`);
    console.log('');
  }
  if (integrityErrors.length) {
    console.log(`${integrityErrors.length} graph integrity error(s) — a record would be lost or overwritten at load:`);
    for (const e of integrityErrors.slice(0, 50)) console.log(`  ✗ ${e}`);
    if (integrityErrors.length > 50) console.log(`  … and ${integrityErrors.length - 50} more`);
    console.log('');
  }
  if (sourcingErrors.length) {
    console.log(`${sourcingErrors.length} sourcing error(s) — what a source is allowed to establish:`);
    for (const e of sourcingErrors.slice(0, 50)) console.log(`  ✗ ${e}`);
    if (sourcingErrors.length > 50) console.log(`  … and ${sourcingErrors.length - 50} more`);
    console.log('');
  }

  if (total === 0 && parsed > 0) console.log('All records valid.\n');
  if (total === 0 && parsed === 0) console.log('No canonical records yet — nothing to validate.\n');
  if (total) process.exit(1);
}

/** Walk every node of a record, reporting a dotted path for each. */
function walk(node, visit, pathStr = '') {
  visit(node, pathStr);
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, visit, `${pathStr}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [k, child] of Object.entries(node)) {
      walk(child, visit, pathStr ? `${pathStr}.${k}` : k);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
