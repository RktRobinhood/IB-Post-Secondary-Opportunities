/* Rest views on the live site: shots, pins vs list, pins inside their country, link targets, idle frames, globe bytes. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9362 });
const out = {};
const audit = `
  const f = document.querySelector('.world');
  const st = f.querySelector('.world__stage').getBoundingClientRect();
  const list = [...f.querySelectorAll('.world__list a[data-place]')];
  const listIds = new Set(list.map(a => a.dataset.place));
  const placeIds = new Set(g.places.map(p => p.id));
  const missingPin = [...listIds].filter(id => !placeIds.has(id));
  const missingList = [...placeIds].filter(id => !listIds.has(id));
  const targets = {}; for (const a of list) { const k = (a.target || '(none)') + ' ' + (new URL(a.href, location.href).origin === location.origin ? 'same' : 'off'); targets[k] = (targets[k] || 0) + 1; }
  const vis = [...f.querySelectorAll('.world__pin')].filter(n => !n.hidden && n.style.opacity !== '0');
  const clusters = [...f.querySelectorAll('.world__cluster')].filter(n => !n.hidden).map(n => n.textContent);
  const wrong = [];
  for (const n of vis) {
    const p = g.places.find(q => q.id === n.dataset.place);
    const d = n.querySelector('.world__pin-dot').getBoundingClientRect();
    const h = g.pickAt(d.left + d.width / 2, d.top + d.height / 2);
    const want = p.country || p.id;
    if (!h) { wrong.push(p.id + ':space'); continue; }
    const km = Math.round(Math.hypot(h.lat - p.lat, (((h.lon - p.lon + 540) % 360) - 180) * Math.cos(p.lat * Math.PI / 180)) * 111);
    if (km > 40) wrong.push(p.id + ':' + km + 'km');
  }
  const labels = vis.filter(n => n.hasAttribute('data-label') || getComputedStyle(n.querySelector('.world__pin-label')).opacity !== '0').length;
  const sumCounts = g.places.reduce((s, p) => s + (p.count || 0), 0);
  const listSum = list.reduce((s, a) => s + (+a.querySelector('.world__count')?.textContent || 0), 0);
  return { rest: { lat: +g.rest.lat.toFixed(1), lon: +g.rest.lon.toFixed(1), alt: +g.rest.alt.toFixed(2) }, stage: [Math.round(st.width), Math.round(st.height)],
    places: g.places.length, list: list.length, missingPin, missingList, targets, pinsVisible: vis.length, visibleIds: vis.map(n => n.dataset.place), clusters, wrong, labels, sumCounts, listSum };`;

for (const route of ['/programmes/', '/europe/', '/world/', '/destinations/nl/', '/destinations/us/']) {
  try {
    await b.open(route);
    const t0 = Date.now();
    const st = await b.globeReady();
    out[route] = { globe: st, readyMs: Date.now() - t0 };
    await sleep(1500);
    await b.startFrames(); await sleep(3000); out[route].idle = await b.stopFrames();
    out[route].drawMs = await b.g('return +g.drawMs.toFixed(2);');
    await b.g('g.pause(); return 1;');
    Object.assign(out[route], await b.g(audit));
    const by = b.bytes().by;
    out[route].globeBytes = Object.fromEntries(Object.entries(by).filter(([k]) => /globe|geo\/|js\/(map|globe)|vendor|maplibre|openfreemap|eox/.test(k)));
    out[route].allKB = b.bytes().totalKB;
    await b.shot(`s1-rest${route.replace(/\//g, '_')}`);
    await b.g('g.resume(); return 1;');
  } catch (e) { out[route] = { ...(out[route] || {}), error: String(e) }; }
}
/* Dark */
await b.open('/world/', { dark: true });
await b.evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
await b.globeReady(); await sleep(800);
await b.shot('s1-world-dark');
out.logs = b.logs;
await fs.writeFile(new URL('./s1-rest.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close(); process.exit(0);
