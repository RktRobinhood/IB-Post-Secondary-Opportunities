/* The new /countries/ page (which /europe/ and /world/ now redirect to): rest, play, country card + its link, Back, group, phone. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9373 });
const R = {};
const st = () => b.g('return { alt: +g.view.alt.toFixed(4), lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), close: g.close.active, zoom: g.close.zoom && +g.close.zoom.toFixed(2), card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null, hash: location.hash, path: location.pathname.replace("/IB-Post-Secondary-Opportunities", ""), hlen: history.length, sy: Math.round(scrollY) };');
const listPoint = (re) => b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const pages = async () => (await (await fetch('http://127.0.0.1:9373/json/list')).json()).filter((t) => t.type === 'page').length;
const loadEvent = () => new Promise((r) => b.listeners.push(function once(m) { if (m.method === 'Page.loadEventFired') { b.listeners.splice(b.listeners.indexOf(once), 1); r(); } }));

/* Redirects keep the reader: /europe/ lands on /countries/#europe */
await b.open('/europe/');
await sleep(2000);
R.redirect = { url: await b.evaluate('location.pathname + location.hash'), hlen: await b.evaluate('history.length') };

await b.open('/countries/');
await b.globeReady(); await sleep(800);
R.rest = await st();
R.restVisible = await b.evaluate(`(() => ({ pins: [...document.querySelectorAll('.world__pin:not([hidden])')].map(n => n.dataset.place + ' op=' + (n.style.opacity || '1')), groups: [...document.querySelectorAll('.world__cluster:not([hidden])')].map(c => c.textContent + ':' + (c._members || []).length + ' op=' + (c.style.opacity || getComputedStyle(c).opacity)) }))()`);
R.restEurope = await b.g('const eu = g.places.filter(p => p.lon > -25 && p.lon < 45 && p.lat > 34); return { euPlaces: eu.length, euCount: eu.reduce((s, p) => s + (p.count || 0), 0), all: g.places.length, allCount: g.places.reduce((s, p) => s + (p.count || 0), 0), ids: g.places.map(p => p.id).join(" ") };');
{
  const s = await b.stageRect();
  const cx = s.x + s.w * 0.5, cy = s.y + s.h * 0.55;
  const r = await record(b, 's9a-countries-fling', 2500, async () => {
    await b.mouse('mouseMoved', cx, cy, { button: 'none' }); await b.mouse('mousePressed', cx, cy);
    for (let i = 1; i <= 12; i++) { await b.mouse('mouseMoved', cx + i * 10, cy); await sleep(16); }
    for (let i = 1; i <= 6; i++) { await b.mouse('mouseMoved', cx + 120 + i * 40, cy + i * 3); await sleep(12); }
    await b.mouse('mouseReleased', cx + 360, cy + 18);
  }, { sheet: 8 });
  R.fling = { fs: r.frameStats, after: await st() };
  await b.evaluate(`(document.querySelector('.world__btn[aria-label="Reset"]') || document.querySelector('.world__controls button:last-child')).click(), 1`);
  await sleep(3500);
  const p = await listPoint('/Netherlands/');
  await sleep(250);
  const h0 = (await st()).hlen;
  const r2 = await record(b, 's9b-countries-netherlands', 4500, async () => { await b.click(p.x, p.y); }, { sheet: 12 });
  const a2 = await st();
  R.nl = { fs: r2.frameStats, after: a2, pushed: a2.hlen - h0, links: await b.evaluate(`[...document.querySelectorAll('.world__card:not([hidden]) a')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), target: a.target }))`) };
  await b.shot('s9b-countries-netherlands-card');
  const go = await b.evaluate(`(() => { const a = document.querySelector('.world__card:not([hidden]) a'); if (!a) return null; const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  if (go) {
    const p0 = await pages();
    const nav = loadEvent();
    await b.click(go.x, go.y);
    await Promise.race([nav, sleep(6000)]);
    await sleep(800);
    R.cardLink = { at: await b.evaluate('location.pathname + location.hash'), newTabs: (await pages()) - p0 };
    const nav2 = loadEvent();
    await b.evaluate('setTimeout(() => history.back(), 30), 1');
    await Promise.race([nav2, sleep(6000)]);
    await sleep(1500);
    try { R.cardLink.backAt = await b.evaluate('location.pathname + location.hash'); await b.globeReady(); await sleep(2500); R.cardLink.afterBack = await st(); } catch (e) { R.cardLink.afterBack = String(e); }
    await b.shot('s9c-countries-after-back');
  }
}
/* Group on /countries/ (biggest): click; does it push history? */
await b.open('/countries/');
await b.globeReady(); await sleep(800);
{
  const cl = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent, ids: (c._members || []).map(m => m.id) }; })()`);
  const h0 = (await st()).hlen;
  const r = await record(b, 's9d-countries-group', 5000, async () => { await b.click(cl.x, cl.y); }, { sheet: 12 });
  const a = await st();
  R.group = { n: cl.n, members: cl.ids.length, fs: r.frameStats, after: a, pushed: a.hlen - h0, shown: await b.evaluate(`[...document.querySelectorAll('.world__pin:not([hidden]), .world__cluster:not([hidden])')].map(n => n.textContent.trim())`) };
  await b.shot('s9d-countries-group-end');
}
/* Reduced motion: list click lands at once */
await b.open('/countries/', { reduced: true });
await b.globeReady(); await sleep(800);
{
  const p = await listPoint('/Japan/');
  await sleep(200); await b.click(p.x, p.y); await sleep(150);
  R.reduced = await st();
}
/* Phone rest */
const PH = { width: 390, height: 844, mobile: true, dpr: 2 };
await b.open('/countries/', PH);
await b.globeReady(); await sleep(1000);
R.phoneRest = { ...(await st()), groups: await b.evaluate(`[...document.querySelectorAll('.world__cluster:not([hidden])')].map(c => c.textContent)`), pins: await b.evaluate(`[...document.querySelectorAll('.world__pin:not([hidden])')].length`) };
await b.shot('s9e-phone-countries-rest');
R.logs = b.logs.filter((l) => !/READ-usage|Expected value to be of type number/.test(l));
await fs.writeFile(new URL('./s9-countries.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
