/**
 * Schools: the institutions in the country profiles (data/countries/), each
 * with its own page on the site (issue #43).
 *
 * An institution in a profile used to be a card that linked to its homepage,
 * which left the student to find the English-taught degrees on a foreign site.
 * Each now has a record in data/schools/<key>.json (schemas/school.schema.json)
 * that says what it offers IB students and where exactly to go next, and a
 * page built from it by the same template as the canonical institutions.
 */
import fs from 'node:fs';
import path from 'node:path';
import { slugify } from './html.mjs';

/** The key a profile institution is known by: `fi-uh`, `gb-oxford`. */
export function schoolKey(countryCode, inst) {
  return `${countryCode}-${slugify(inst.shortName || inst.name)}`;
}

/** Every profile institution by key, read straight from data/countries/. */
export function schoolKeys(countriesDir) {
  const out = new Map();
  for (const f of fs.readdirSync(countriesDir).filter((f) => f.endsWith('.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(countriesDir, f), 'utf8'));
    for (const inst of c.institutions || []) out.set(schoolKey(c.code, inst), inst);
  }
  return out;
}

/** The school records in data/schools/, by key. Missing directory: none. */
export function loadSchools(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    out.set(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

/**
 * Is this link a homepage — the thing #43 forbids handing a student to?
 *
 * The root of the institution's own site is (`/`, `/en/`, `/en/home/`), and so
 * is the recorded website itself. The root of a different host is not: a
 * dedicated admissions site (admission.snu.ac.kr, future.utoronto.ca) or a
 * national portal is exactly the targeted page a student should land on.
 * Without a website to compare, any root counts, to be safe.
 */
export function isHomepage(link, website) {
  let u;
  try {
    u = new URL(link);
  } catch {
    return false;
  }
  const norm = (x) => x.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
  if (website && norm(link) === norm(website)) return true;
  const bare = u.pathname.replace(/\/+$/, '').replace(/\/index\.[a-z]+$/, '');
  const root = !bare || /^(\/[a-z]{2}(-[a-z]{2})?)?(\/home)?$/i.test(bare);
  if (!root || u.search || u.hash) return false;
  return website ? hostOf(link) === hostOf(website) : true;
}

/** A host name for the words beside a link: "helsinki.fi". */
export function hostOf(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
