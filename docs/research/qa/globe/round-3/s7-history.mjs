/* Owner's navigation rule on the live site: choosing a place/country pushes history; Back undoes it and never leaves the page.
   Also: Back from street level recorded; group framing; label audit. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9372 });
const R = {};
const st = () => b.g('return { alt: +g.view.alt.toFixed(4), lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), close: g.close.active, zoom: g.close.zoom && +g.close.zoom.toFixed(2), card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null, hash: location.hash, path: location.pathname.replace("/IB-Post-Secondary-Opportunities", ""), hlen: history.length };');
const listClick = async (re) => { const p = await b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await sleep(250); await b.click(p.x, p.y); };
const waitStill = async (max = 9000) => { let last = ''; let same = 0; const t0 = Date.now(); while (Date.now() - t0 < max) { const s = JSON.stringify(await st()); if (s === last) { if (++same >= 4) break; } else same = 0; last = s; await sleep(250); } return st(); };
const back = () => b.evaluate('history.back(), 1');

/* 1. /programmes/: Delft -> Aarhus -> Back -> Back -> Back */
await b.open('/programmes/');
await b.globeReady(); await sleep(800);
R.prog = { start: await st() };
await listClick('/Delft/'); R.prog.delft = await waitStill();
await listClick('/Aarhus/'); R.prog.aarhus = await waitStill();
await back(); R.prog.back1 = await waitStill();
await back(); R.prog.back2 = await waitStill();
await b.shot('s7-programmes-after-two-backs');

/* 2. /europe/: country click (Spain via real click on the land) then Back; then a group click: does it push? */
await b.open('/europe/');
await b.globeReady(); await sleep(800);
{
  const s = await b.stageRect();
  const es = await b.g('return g.mineAt(40.0, -3.7);');
  await b.click(s.x + es.x, s.y + es.y);
  R.europe = { country: await waitStill() };
  await back(); R.europe.back = await waitStill();
  const cl = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')][0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent }; })()`);
  if (cl) { const h0 = (await st()).hlen; await b.click(cl.x, cl.y); const s1 = await waitStill(); R.europe.group = { n: cl.n, pushed: s1.hlen - h0, after: s1 }; }
}

/* 3. Back from street level, recorded: NL page, TU Delft, then Back */
await b.open('/destinations/nl/');
await b.globeReady(); await sleep(800);
await listClick('/TU Delft/');
for (let i = 0; i < 60; i++) { const s = await st(); if (s.close && s.zoom > 14.9) break; await sleep(200); }
await sleep(2000);
R.nlStreet = await st();
R.labelsStreet = await b.evaluate(`[...document.querySelectorAll('.world__pin:not([hidden])')].map(n => n.textContent.trim()).filter(Boolean)`);
{
  const r = await record(b, 's7a-back-from-street', 5000, async () => { await back(); }, { sheet: 12 });
  R.backFromStreet = { frames: r.frames, fs: r.frameStats, samplesHead: r.samples.slice(0, 20).map(s => `${s.t}:${s.alt}${s.close ? 'C' + s.z : ''}`).join(' ') };
  R.backFromStreet.end = await st();
}

/* 4. Group framing on /programmes/: after the biggest group's click, how many of its members are on the stage? */
await b.open('/programmes/');
await b.globeReady(); await sleep(800);
{
  const cl = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent, ids: (c._members || []).map(m => m.id) }; })()`);
  const r = await record(b, 's7b-programmes-group', 7000, async () => { await b.click(cl.x, cl.y); }, { sheet: 12 });
  await sleep(1500);
  R.group = { n: cl.n, ids: cl.ids, fs: r.frameStats, end: await st() };
  R.group.onStage = await b.evaluate(`(() => { const s = document.querySelector('.world__stage').getBoundingClientRect(); const ids = ${JSON.stringify(cl.ids)};
    const out = { visiblePins: [], groups: [] };
    for (const n of document.querySelectorAll('.world__pin:not([hidden])')) { const r = n.getBoundingClientRect(); if (r.bottom > s.top && r.top < s.bottom && r.right > s.left && r.left < s.right) out.visiblePins.push(n.dataset.place); }
    for (const c of document.querySelectorAll('.world__cluster:not([hidden])')) out.groups.push({ n: c.textContent, ids: (c._members || []).map(m => m.id) });
    out.membersShown = ids.filter(id => out.visiblePins.includes(id) || out.groups.some(g => g.ids.includes(id))).length;
    return out; })()`);
  R.group.projected = await b.g(`const m = g.closeMap(); const ids = ${JSON.stringify(cl.ids)}; const s = document.querySelector('.world__stage').getBoundingClientRect(); return ids.map(id => { const p = g.places.find(q => q.id === id); const q = m.project([p.lon, p.lat]); return id + ':' + Math.round(q.x) + ',' + Math.round(q.y) + (q.x < 0 || q.x > s.width || q.y < 0 || q.y > s.height ? ' OFF' : ''); });`);
  await b.shot('s7b-programmes-group-end');
}

/* 5. Labels at rest (abbreviations) */
await b.open('/destinations/nl/');
await b.globeReady(); await sleep(800);
R.nlLabels = await b.g('return g.places.map(p => p.name);');
R.logs = b.logs.filter((l) => !/READ-usage|Expected value to be of type number/.test(l));
await fs.writeFile(new URL('./s7-history.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
