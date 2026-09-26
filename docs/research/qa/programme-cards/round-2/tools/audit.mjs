/* Round-2 critic: every rendered card's credential line vs the records in data/, and repeated photos per page. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '../../../../../..');
const D = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', p), 'utf8'));
const places = {}; for (const f of fs.readdirSync(path.join(ROOT, 'data/places'))) { try { const j = D('places/' + f); places[j.id] = j; } catch {} }
const ORIGIN = process.env.ORIGIN || 'http://localhost:4350';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').trim();
const out = {};
for (const route of pages) {
  const html = await (await fetch(ORIGIN + route)).text();
  const cards = html.split('<article class="card').slice(1).map((c) => {
    const title = dec((c.match(/card__title"><a[^>]*>([\s\S]*?)<\/a>/) || [])[1] || '');
    const href = (c.match(/card__title"><a href="([^"]+)"/) || [])[1];
    const cred = dec((c.match(/card__cred">([\s\S]*?)<\/p>/) || [])[1] || '');
    const img = (c.match(/data-backdrop="([^"]+)"/) || [])[1] || null;
    const paths = [...c.matchAll(/card__path"><a href="([^"]+)">([\s\S]*?)<\/a>(?:<span class="card__path-detail">([\s\S]*?)<\/span>)?/g)].map((m) => ({ href: m[1], label: dec(m[2]), detail: m[3] ? dec(m[3]) : null }));
    return { title, href, cred, img, paths };
  }).filter((c) => c.href && c.href.includes('/programmes/'));
  const issues = [];
  for (const c of cards) {
    const hrefs = c.paths.length ? c.paths.map((p) => p.href) : [c.href];
    const exp = hrefs.map((h) => {
      const oid = h.split('/').filter(Boolean).pop();
      const opp = D('opportunities/' + oid + '.json'); const prog = D('programmes/' + opp.programme + '.json');
      return { name: prog.name, abbr: prog.credential?.abbreviation, titleEn: prog.credential?.localTitleEn, years: prog.credential?.years, campus: places[opp.place]?.name, inst: opp.institution };
    });
    c.expected = exp;
    const parts = c.cred.split(' · ');
    const e = exp[0];
    const deg = e.abbr && /^B[A-Z]/.test(e.abbr) ? e.abbr : e.titleEn || e.abbr;
    if (!c.cred) issues.push(`${c.title}: NO credential line`);
    else if (exp.every((x) => x.abbr === e.abbr) && !parts.includes(deg)) issues.push(`${c.title}: line "${c.cred}" lacks degree "${deg}"`);
    if (/\((B[A-Za-z]+|MSc|BA|BSc)\)/.test(e.name)) { const nm = e.name.match(/\((B[A-Za-z]+)\)/)?.[1]; if (nm && nm !== e.abbr) issues.push(`${c.title}: name says ${nm}, record abbr ${e.abbr}`); }
    c.len = c.cred.length;
  }
  const byImg = {}; cards.forEach((c, i) => { (byImg[c.img] ||= []).push(i + 1 + ' ' + c.title); });
  const repeats = Object.entries(byImg).filter(([, v]) => v.length > 1);
  const titles = {}; cards.forEach((c) => { (titles[c.title] ||= []).push(c.cred); });
  out[route] = { n: cards.length, distinctImgs: Object.keys(byImg).length, repeats, dupTitles: Object.entries(titles).filter(([, v]) => v.length > 1), issues, cards };
}
fs.writeFileSync(path.join(import.meta.dirname, '..', 'audit.json'), JSON.stringify(out, null, 1));
for (const [r, o] of Object.entries(out)) {
  console.log(`\n== ${r}: ${o.n} cards, ${o.distinctImgs} distinct photos`);
  for (const [k, v] of o.repeats) console.log('  REPEAT', k, v.join(' | '));
  for (const i of o.issues) console.log('  ISSUE', i);
  for (const [t, v] of o.dupTitles) console.log('  SAME TITLE', t, '->', v.join(' / '));
}
