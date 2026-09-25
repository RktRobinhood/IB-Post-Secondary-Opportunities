/* Play with real input on the live site: spin, fling, zoom, click country / group / pin, reset; and three suspected bugs. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9365 });
const R = {};
const state = () => b.g('return { alt: +g.view.alt.toFixed(4), lat: +g.view.lat.toFixed(2), lon: +g.view.lon.toFixed(2), close: g.close.active, zoom: g.close.zoom && +g.close.zoom.toFixed(2), sy: Math.round(scrollY), card: document.querySelector(".world__card:not([hidden]) h3")?.textContent || null, engaged: document.querySelector(".world__stage").dataset.engaged || null };');
const listPoint = (re) => b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'nearest' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const pinPoint = (id) => b.evaluate(`(() => { const n = document.querySelector('.world__pin[data-place="${id}"] .world__pin-dot'); if (!n || n.closest('.world__pin').hidden) return null; const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);

/* 1. /europe/ play: drag, fling, wheel, country, group, pin, reset */
await b.open('/europe/');
await b.globeReady();
await sleep(800);
{
  const st = await b.stageRect();
  const cx = st.x + st.w * 0.5, cy = st.y + st.h * 0.6;
  const s0 = await state();
  // A slow drag then a fling
  const r = await record(b, 's3a-europe-drag-fling', 2500, async () => {
    await b.mouse('mouseMoved', cx, cy, { button: 'none' }); await b.mouse('mousePressed', cx, cy);
    for (let i = 1; i <= 12; i++) { await b.mouse('mouseMoved', cx - i * 10, cy); await sleep(16); }
    for (let i = 1; i <= 6; i++) { await b.mouse('mouseMoved', cx - 120 - i * 45, cy - i * 4); await sleep(12); }
    await b.mouse('mouseReleased', cx - 390, cy - 24);
  }, { sheet: 8 });
  const s1 = await state();
  R.fling = { lonMoved: +(s1.lon - s0.lon).toFixed(1), fs: r.frameStats };
  // Wheel in (held, since the press took hold)
  const r2 = await record(b, 's3b-europe-wheel-in', 2500, async () => { for (let i = 0; i < 10; i++) { await b.wheel(cx, cy, -150); await sleep(60); } }, { sheet: 8 });
  R.wheelIn = { after: await state(), fs: r2.frameStats };
  await b.shot('s3b-europe-wheeled');
  // Reset
  await b.evaluate(`document.querySelector('.world__controls button:last-child').click()`);
  await sleep(2500);
  R.afterReset = await state();
  // Click a country (Germany) with a real click on bare land
  const de = await b.g('return g.mineAt(51.0, 10.5);');
  const r3 = await record(b, 's3c-europe-germany', 3000, async () => { await b.click(st.x + de.x, st.y + de.y); }, { sheet: 8 });
  R.germany = { after: await state(), fs: r3.frameStats, cardText: await b.evaluate(`document.querySelector('.world__card:not([hidden])')?.innerText || null`) };
  await b.shot('s3c-europe-germany-card');
  // Click a group
  await b.evaluate(`document.querySelector('.world__controls button:last-child').click()`); await sleep(2500);
  const cl = await b.evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')][0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c.textContent, members: c._members?.map(m => m.name) }; })()`);
  if (cl) {
    await b.click(cl.x, cl.y); await sleep(2500);
    R.group = { cl, after: await state(), clustersAfter: await b.evaluate(`[...document.querySelectorAll('.world__cluster:not([hidden])')].map(c => c.textContent)`) };
    await b.shot('s3d-europe-group-clicked');
  }
  // Click a pin (Portugal)
  const pt = await pinPoint('pt');
  if (pt) { await b.click(pt.x, pt.y); await sleep(2500); R.pin = await state(); await b.shot('s3e-europe-pin-portugal'); }
  // Card action link target
  R.cardLinks = await b.evaluate(`[...document.querySelectorAll('.world__card:not([hidden]) a')].map(a => ({ text: a.textContent, target: a.target, href: a.getAttribute('href') }))`);
}

/* 2. Suspected bug: a wheel over a pin while the close map has the camera scrolls the page */
await b.open('/destinations/nl/');
await b.globeReady(); await sleep(1500);
{
  const p = await listPoint('/TU Delft/');
  await b.click(p.x, p.y);
  for (let i = 0; i < 80; i++) { const s = await state(); if (s.close && s.zoom > 14.7) break; await sleep(150); }
  await sleep(1500);
  const st = await b.stageRect();
  await b.click(st.x + st.w * 0.8, st.y + st.h * 0.8); // take hold on bare ground
  await sleep(300);
  const before = await state();
  const pin = await pinPoint('nl-tudelft') || await b.evaluate(`(() => { const n = [...document.querySelectorAll('.world__pin:not([hidden]) .world__pin-dot')][0]; const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await b.mouse('mouseMoved', pin.x, pin.y, { button: 'none' });
  for (let i = 0; i < 3; i++) { await b.wheel(pin.x, pin.y, 120); await sleep(120); }
  await sleep(500);
  const after = await state();
  R.wheelOverPinInClose = { before, after, pageScrolled: after.sy - before.sy };
  // same over the card
  const card = await b.evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  R.cardOpen = !!card;
}

/* 3. Suspected bug: in the close map, choosing a far place closes its own card */
await b.open('/programmes/');
await b.globeReady(); await sleep(1000);
{
  const p = await listPoint('/Delft/');
  await b.click(p.x, p.y);
  for (let i = 0; i < 100; i++) { const s = await state(); if (s.close && s.zoom > 14.7) break; await sleep(150); }
  await sleep(1200);
  const q = await listPoint('/Aarhus/');
  await b.click(q.x, q.y);
  const t = [];
  for (let i = 0; i < 12; i++) { const s = await state(); t.push({ ms: i * 250, card: s.card, zoom: s.zoom }); await sleep(250); }
  R.farPlaceInClose = t;
  await sleep(1500);
  R.farPlaceInClose.push({ end: await state() });
}

/* 4. Reduced motion: a list click to a campus is instant all the way down? */
await b.open('/destinations/nl/', { reduced: true });
await b.globeReady(); await sleep(1500);
{
  const p = await listPoint('/Leiden/');
  const t0 = Date.now();
  await b.click(p.x, p.y);
  const seq = [];
  for (let i = 0; i < 30; i++) { const s = await state(); seq.push({ ms: Date.now() - t0, alt: s.alt, close: s.close, zoom: s.zoom }); if (s.close && s.zoom > 14.7) break; await sleep(150); }
  R.reducedCampus = { seq: seq.filter((s, i, a) => !i || s.close !== a[i - 1].close || i === a.length - 1), frames: seq.length };
  await b.shot('s3f-reduced-leiden');
}
R.logs = b.logs.filter((l) => !/READ-usage/.test(l));
await fs.writeFile(new URL('./s3-play.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
