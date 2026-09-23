/**
 * Grouping a Destination's institutions by the thing that actually governs
 * their admission.
 *
 * `CONTEXT.md` has had the right word for this from the start: an **Application
 * Jurisdiction** is "the administrative area whose shared admissions rules or
 * services apply to an Opportunity. It may be a country, province, state,
 * territory, sector, or other authority boundary." The data model knew a
 * country is not always the unit. The pages did not (#16).
 *
 * Canada was the clearest case. One page spoke about "Canada" — one set of
 * deadlines, one application story, one flat list of fourteen institutions
 * spread across six provinces — while the record underneath it admitted the
 * truth in a string: `application.portal.name` read *"OUAC (Ontario) and
 * EducationPlannerBC (British Columbia); elsewhere you apply to each university
 * directly"*. Three Application Routes crammed into one portal name, with a
 * single URL pointing at the first of them. A student picking Toronto and a
 * student picking Vancouver are on two different paths with different dates,
 * and both were one bullet in one list.
 *
 * ## Why this file contains no country names
 *
 * The obvious implementation is a switch: group Canada by province, the US by
 * state, Switzerland by canton, everyone else by nothing. That works until the
 * thirty-sixth Destination, and it puts editorial judgement about a country
 * into a file no researcher opens.
 *
 * So the grouping is a *property of the record*. A Destination declares how its
 * institutions divide and names the divisions; every institution declares which
 * one it sits in; every Application Route declares which one it serves. This
 * file only joins them up. Adding a federal Destination adds data and no code,
 * and `scripts/test-jurisdictions.mjs` reads this file back to make sure it
 * stays that way.
 *
 * ## The default is the honest one
 *
 * A Destination that declares nothing is grouped as one unit — exactly what the
 * page did before. That is right for a genuinely centralised system, and for a
 * Destination nobody has looked at yet it is at least not a claim. What it is
 * not is a silent guess: `groupingOf()` reports `declared: false`, and the
 * publication floor can tell a country that has been examined and found to be
 * one jurisdiction from one that has never been asked.
 */

/** How a Destination's institutions divide. Declared, never inferred. */
export const GROUPINGS = {
  none: {
    label: 'One system',
    lede: 'One set of admissions rules covers the whole Destination.',
    keyOf: () => null,
  },
  jurisdiction: {
    label: 'By jurisdiction',
    lede: 'Admission is governed at the level below the country, and the route follows the jurisdiction.',
    keyOf: (inst) => inst.jurisdiction || null,
  },
  sector: {
    label: 'By sector',
    lede: 'The kind of institution decides how you apply, not where it is.',
    keyOf: (inst) => inst.sector || null,
  },
  city: {
    label: 'By city',
    lede: 'The rules do not vary, but the places do.',
    keyOf: (inst) => inst.city || null,
  },
};

export const DEFAULT_GROUPING = 'none';

/* --- Reading the declaration ---------------------------------------------- */

/**
 * Which grouping a Destination uses, and whether anyone actually said so.
 *
 * The second half matters as much as the first. An undeclared Destination and a
 * Destination examined and found to be one system render identically and mean
 * completely different things, and only one of them is finished.
 */
export function groupingOf(canonical) {
  const declared = canonical?.institutionGrouping;
  if (declared && GROUPINGS[declared]) return { id: declared, declared: true, ...GROUPINGS[declared] };
  return { id: DEFAULT_GROUPING, declared: false, ...GROUPINGS[DEFAULT_GROUPING] };
}

/** The declared jurisdictions of a Destination, indexed by id. */
export function jurisdictionsOf(canonical) {
  const list = Array.isArray(canonical?.jurisdictions) ? canonical.jurisdictions : [];
  return new Map(list.map((j) => [j.id, j]));
}

/* --- The join ------------------------------------------------------------- */

/**
 * Group a Destination's institutions, and hand each group the Application Route
 * that governs it.
 *
 * Returns one group even for an ungrouped Destination, so every caller renders
 * the same structure and no page needs a branch for "is this one grouped".
 *
 * Institutions that declare a group nobody defined are not dropped. They are
 * collected into a final group that says so — losing a university because its
 * `jurisdiction` has a typo would be a much worse failure than showing it in
 * the wrong place, and the group's own label makes the fault visible to whoever
 * is next in the record.
 */
export function groupInstitutions(country, graph) {
  const canonical = graph?.destinations?.get(country.code) || null;
  const grouping = groupingOf(canonical);
  const declared = jurisdictionsOf(canonical);
  const routes = [...(graph?.applicationRoutes?.values() || [])].filter((r) => r.destination === country.code);
  const institutions = Array.isArray(country.institutions) ? country.institutions : [];

  if (grouping.id === 'none') {
    return {
      grouping,
      groups: [
        {
          id: null,
          name: country.name,
          kind: 'destination',
          summary: null,
          variations: [],
          route: routes.find((r) => !r.jurisdiction) || routes[0] || null,
          institutions,
          defined: true,
        },
      ],
    };
  }

  const buckets = new Map();
  const orphans = [];

  for (const inst of institutions) {
    const key = grouping.keyOf(inst);
    if (!key) {
      orphans.push(inst);
      continue;
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(inst);
  }

  /* Declared order first, because a record's author put the jurisdictions in an
     order for a reason; anything undeclared follows, alphabetically. */
  const keys = [
    ...[...declared.keys()].filter((k) => buckets.has(k)),
    ...[...buckets.keys()].filter((k) => !declared.has(k)).sort(),
  ];

  const groups = keys.map((key) => {
    const meta = declared.get(key) || null;
    return {
      id: key,
      name: meta?.name || key,
      kind: meta?.kind || grouping.id,
      summary: meta?.summary || null,
      variations: Array.isArray(meta?.variations) ? meta.variations : [],
      route: routeForGroup(routes, key, meta),
      institutions: buckets.get(key),
      defined: Boolean(meta),
    };
  });

  if (orphans.length) {
    groups.push({
      id: null,
      name: 'Not yet placed',
      kind: 'unplaced',
      summary:
        `These institutions have not been assigned to one of ${country.name}'s ` +
        `${GROUPINGS[grouping.id].label.toLowerCase().replace(/^by /, '')} divisions yet, so which route they ` +
        `sit on is not recorded here. Check each one's own admissions page.`,
      variations: [],
      route: null,
      institutions: orphans,
      defined: false,
    });
  }

  return { grouping, groups };
}

/**
 * A route may serve one jurisdiction or several.
 *
 * `jurisdiction` started as a single id, and Canada broke it immediately: its
 * apply-direct route serves Quebec, Alberta and Nova Scotia, so it had to be
 * left unscoped — which turned it into the Destination-wide fallback, and the
 * Destination-wide fallback is what the `route` floor check exists to catch. An
 * Ontario institution nobody had researched would have looked covered by it.
 */
export function serves(route, key) {
  const j = route?.jurisdiction;
  if (Array.isArray(j)) return j.includes(key);
  return j === key;
}

function routeForGroup(routes, key, meta) {
  if (meta?.applicationRoute) {
    const named = routes.find((r) => r.id === meta.applicationRoute);
    if (named) return named;
  }
  return routes.find((r) => serves(r, key)) || null;
}

/* --- What a student is told ----------------------------------------------- */

/**
 * The sentence a group header carries: which route these institutions apply
 * through, in the terms the student will meet on the portal.
 *
 * Deliberately says nothing when there is no route recorded. "Apply directly"
 * is a researched finding about a jurisdiction, not the absence of research,
 * and the two must not be written by the same line of code.
 */
export function routeSentence(group) {
  const r = group.route;
  if (!r) return null;
  const name = r.label || r.applicationSystem || r.id;
  if (r.channel === 'direct') {
    return `${plural(group.institutions.length)} you apply to directly${r.label ? ` — ${r.label}` : ''}.`;
  }
  return `${plural(group.institutions.length)} you apply through ${name}.`;
}

function plural(n) {
  return n === 1 ? 'One institution' : `${n} institutions`;
}

/**
 * Per-jurisdiction variation in the things that actually differ — cost, health
 * cover, deadlines — as structured entries rather than prose the reader has to
 * disentangle from a note.
 */
export function variationRows(group) {
  return (group.variations || []).map((v) => ({
    label: v.label || titleCase(v.field || 'Varies here'),
    value: v.summary,
    source: v.source || null,
  }));
}

function titleCase(s) {
  return String(s).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}
