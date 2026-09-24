/* Pins vs list: every place has a pin (or a group) at its own spot. */
import { launch, sleep } from './cdp.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9343 });
const out = {};
const audit = `(async () => {
  const g = ${'${G}'};
  const f = document.querySelector('.world');
  const st = f.querySelector('.world__stage').getBoundingClientRect();
  const list = [...f.querySelectorAll('.world__list a[data-place]')].map(a => ({ id: a.dataset.place, text: a.textContent.trim().replace(/\s+/g,' '), target: a.target, href: a.getAttribute('href') }));
  const pins = [...f.querySelectorAll('.world__pin')].map(n => {
    const r = n.getBoundingClientRect(); const d = n.querySelector('.world__pin-dot').getBoundingClientRect();
    return { id: n.dataset.place, hidden: n.hidden, op: n.style.opacity, x: d.left + d.width/2 - st.left, y: d.top + d.height/2 - st.top, w: d.width, label: n.hasAttribute('data-label') };
  });
  const clusters = [...f.querySelectorAll('.world__cluster')].filter(n => !n.hidden).map(n => { const r = n.getBoundingClientRect(); return { n: n.textContent, x: r.left + r.width/2 - st.left, y: r.top + r.height/2 - st.top }; });
  const groups = g.groups().map(gr => gr.members.map(m => m.id));
  // Where does each visible pin point on the earth? pick at its screen spot and compare to its lat/lon
  const err = [];
  for (const p of pins) if (!p.hidden) {
    const pl = g.places.find(q => q.id === p.id);
    const h = g.pickAt(p.x + st.left, p.y + st.top);
    if (!h) { err.push({ id: p.id, miss: 'space' }); continue; }
    const dLat = h.lat - pl.lat, dLon = ((h.lon - pl.lon + 540) % 360) - 180;
    err.push({ id: p.id, km: Math.round(Math.hypot(dLat, dLon * Math.cos(pl.lat * Math.PI/180)) * 111) });
  }
  return { view: { ...g.view }, W: st.width, H: st.height, list: list.length, places: g.places.length, pins, clusters, groups, err, listSample: list.slice(0, 3) };
})()`;
for (const route of ['/world/', '/programmes/', '/europe/', '/destinations/nl/', '/destinations/dk/']) {
  try {
    await b.open(route);
    const st = await b.globeReady();
    await b.evaluate(`(async () => { const g = ${b.G}; g.pause(); return 1; })()`);
    out[route] = { st, ...(await b.evaluate(audit.replace('${G}', b.G))) };
    await b.shot(`a-rest${route.replace(/\//g, '_')}`);
  } catch (e) { out[route] = { error: String(e) }; }
}
// World: spin to Australia and see if its pin appears
await b.open('/world/'); await b.globeReady();
out.worldAU = await b.evaluate(`(async () => { const g = ${b.G}; const f=document.querySelector('.world'); document.documentElement.setAttribute('data-motion','reduced'); g.flyTo({ lat: -30, lon: 140, alt: g.view.alt }); await new Promise(r=>setTimeout(r,500)); document.documentElement.removeAttribute('data-motion'); g.pause();
  const au = g.places.find(p=>p.id==='au'); return { view: {...g.view}, auHidden: au.node.hidden, groups: g.groups().map(gr=>gr.members.map(m=>m.id)), clusters:[...f.querySelectorAll('.world__cluster')].filter(n=>!n.hidden).map(n=>n.textContent + ':' + n.style.transform) }; })()`);
await b.shot('a-world-australia');
out.logs = b.logs;
await fs.writeFile(new URL('./a-pins.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, (k, v) => (k === 'pins' ? v.filter(p => !p.hidden).length + ' visible / ' + v.length : v), 1));
b.close(); process.exit(0);
