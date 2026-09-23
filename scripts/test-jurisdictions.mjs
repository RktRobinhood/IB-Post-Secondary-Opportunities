/**
 * Guards on the Application Jurisdiction model.
 *
 * The thing worth protecting here is not the grouping itself — it is that the
 * grouping stays *data*. The obvious implementation of #16 is a switch: group
 * Canada by province, the US by state, Switzerland by canton, everybody else by
 * nothing. That works until the thirty-sixth Destination, and it moves
 * editorial judgement about a country into a file no researcher ever opens.
 *
 * So the valuable tests here are the negative ones, and the most valuable is
 * the last: the model is read back off disk and refused if a country code has
 * appeared in it.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { GROUPINGS, groupInstitutions, groupingOf, routeSentence, variationRows } from '../src/lib/jurisdictions.mjs';
import { load } from '../src/lib/data.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n          ${e.message}`);
  }
};

console.log('\nApplication jurisdictions\n');

/* --- Fixtures. No real country appears in them, on purpose. --------------- */

const flat = {
  code: 'zz',
  name: 'Flatland',
  institutions: [{ name: 'A', key: 'zz-a' }, { name: 'B', key: 'zz-b' }],
};

const federal = {
  code: 'zy',
  name: 'Federalia',
  institutions: [
    { name: 'A', key: 'zy-a', jurisdiction: 'zy-north' },
    { name: 'B', key: 'zy-b', jurisdiction: 'zy-north' },
    { name: 'C', key: 'zy-c', jurisdiction: 'zy-south' },
  ],
};

function graphWith({ destination, routes = [] }) {
  return {
    destinations: new Map(destination ? [[destination.id, destination]] : []),
    applicationRoutes: new Map(routes.map((r) => [r.id, r])),
  };
}

/* --- The default is the honest one ---------------------------------------- */

check('a Destination that declares nothing renders as one group', () => {
  const { groups } = groupInstitutions(flat, graphWith({}));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].institutions.length, 2);
});

check('and it is recorded as undeclared, not as an examined finding', () => {
  assert.equal(groupingOf(null).declared, false);
  assert.equal(groupingOf({ institutionGrouping: 'none' }).declared, true);
});

check('an unknown grouping falls back rather than throwing or inventing one', () => {
  const g = groupingOf({ institutionGrouping: 'by-vibes' });
  assert.equal(g.id, 'none');
  assert.equal(g.declared, false);
});

/* --- Grouping -------------------------------------------------------------- */

check('a federal Destination groups by the jurisdiction its record declares', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [
          { id: 'zy-north', name: 'North', kind: 'province' },
          { id: 'zy-south', name: 'South', kind: 'province' },
        ],
      },
    })
  );
  assert.deepEqual(groups.map((g) => g.name), ['North', 'South']);
  assert.deepEqual(groups.map((g) => g.institutions.length), [2, 1]);
});

check('declared order is kept, because someone put them in an order for a reason', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [
          { id: 'zy-south', name: 'South', kind: 'province' },
          { id: 'zy-north', name: 'North', kind: 'province' },
        ],
      },
    })
  );
  assert.deepEqual(groups.map((g) => g.name), ['South', 'North']);
});

check('an institution whose jurisdiction nobody defined is shown, not dropped', () => {
  const { groups } = groupInstitutions(
    { ...federal, institutions: [...federal.institutions, { name: 'D', key: 'zy-d' }] },
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province' }],
      },
    })
  );
  const all = groups.flatMap((g) => g.institutions);
  assert.equal(all.length, 4, 'an institution disappeared');
  const unplaced = groups.find((g) => g.kind === 'unplaced');
  assert.ok(unplaced, 'the orphan was not called out');
  assert.equal(unplaced.defined, false);
});

/* --- Routes ---------------------------------------------------------------- */

check('a group finds the route scoped to its jurisdiction', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province' }],
      },
      routes: [
        { id: 'r-north', destination: 'zy', jurisdiction: 'zy-north', label: 'The Northern Service' },
        { id: 'r-other', destination: 'zy', jurisdiction: 'zy-south', label: 'The Southern Service' },
      ],
    })
  );
  assert.equal(groups[0].route.id, 'r-north');
});

check('a named route on the jurisdiction wins over one that merely matches', () => {
  const { groups } = groupInstitutions(
    federal,
    graphWith({
      destination: {
        id: 'zy',
        institutionGrouping: 'jurisdiction',
        jurisdictions: [{ id: 'zy-north', name: 'North', kind: 'province', applicationRoute: 'r-special' }],
      },
      routes: [
        { id: 'r-north', destination: 'zy', jurisdiction: 'zy-north' },
        { id: 'r-special', destination: 'zy' },
      ],
    })
  );
  assert.equal(groups[0].route.id, 'r-special');
});

check('"apply directly" is a route, and no route at all says nothing', () => {
  const direct = routeSentence({ institutions: [1, 2], route: { channel: 'direct', id: 'r' } });
  assert.match(direct, /directly/);
  assert.equal(routeSentence({ institutions: [1], route: null }), null,
    'an absent route was described as though it had been researched');
});

/* --- Variation ------------------------------------------------------------- */

check('per-jurisdiction variation comes out structured, not as prose', () => {
  const rows = variationRows({
    variations: [
      { field: 'healthcare', summary: 'Mandatory cover, about 750 a year.' },
      { field: 'workRights', label: 'Working', summary: '20 hours in term.' },
    ],
  });
  assert.deepEqual(rows.map((r) => r.label), ['Healthcare', 'Working']);
});

check('a group with no declared variation produces no rows rather than an empty table', () => {
  assert.deepEqual(variationRows({}), []);
});

/* --- The model is universal ------------------------------------------------ */

const site = await load();

check('no country code appears in the jurisdiction model', async () => {
  const src = await fs.readFile(path.join(ROOT, 'src', 'lib', 'jurisdictions.mjs'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const offenders = site.countries.map((c) => c.code).filter((c) => new RegExp(`['"\`]${c}['"\`]`).test(code));
  if (offenders.length) throw new Error(`country codes appear in the model: ${offenders.join(', ')}`);
});

check('every grouping explains what it means for the reader', () => {
  for (const [id, g] of Object.entries(GROUPINGS)) {
    assert.ok(g.label, `${id} has no label`);
    assert.ok(g.lede && g.lede.length > 30, `${id} does not say what the grouping means`);
    assert.equal(typeof g.keyOf, 'function', `${id} cannot group anything`);
  }
});

check('every declared jurisdiction on disk is used by at least one institution', () => {
  const orphaned = [];
  for (const d of site.graph.destinations.values()) {
    if (!Array.isArray(d.jurisdictions)) continue;
    const country = site.countries.find((c) => c.code === d.id);
    const used = new Set((country?.institutions || []).map((i) => i.jurisdiction).filter(Boolean));
    for (const j of d.jurisdictions) {
      if (!used.has(j.id)) orphaned.push(`${d.id}: "${j.name}" (${j.id}) has no institutions`);
    }
  }
  if (orphaned.length) throw new Error(orphaned.join('\n          '));
});

check('every institution jurisdiction resolves to a declared one', () => {
  const unknown = [];
  for (const c of site.countries) {
    const d = site.graph.destinations.get(c.code);
    const declared = new Set((d?.jurisdictions || []).map((j) => j.id));
    for (const i of c.institutions || []) {
      if (i.jurisdiction && !declared.has(i.jurisdiction)) {
        unknown.push(`${c.code}: "${i.name}" claims jurisdiction "${i.jurisdiction}", which is not declared`);
      }
    }
  }
  if (unknown.length) throw new Error(unknown.join('\n          '));
});

console.log(failures ? `\n${failures} failing\n` : '\nAll jurisdiction guards pass\n');
process.exit(failures ? 1 : 0);
