import fs from 'node:fs';

/**
 * Which continent a Destination is in, for the globe's top level (the owner,
 * 6 October 2026: "by continent or region … when you click on a region, it
 * subdivides down to the country scale").
 *
 * Read from the Destination's own `region` and `scope` through the vocabulary
 * in data/geo/continents.json; nothing here names a country.
 */
const VOCAB = JSON.parse(fs.readFileSync(new URL('../../data/geo/continents.json', import.meta.url), 'utf8')).continents;

/** `{ id, name }` of a Destination's continent, or null when its record says nothing the vocabulary knows. */
export function continentOf(d) {
  if (!d) return null;
  const hit =
    VOCAB.find((c) => (c.regions || []).includes(d.region)) ||
    VOCAB.find((c) => (c.scopes || []).includes(d.scope));
  return hit ? { id: hit.id, name: hit.name } : null;
}
