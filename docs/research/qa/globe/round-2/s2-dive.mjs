/* The dive, in real time, with real input: list click -> globe flight -> clouds -> MapLibre handoff -> street level; and back out. */
import { launch, sleep } from './cdp.mjs';
import { record } from './rec.mjs';
import fs from 'node:fs/promises';
const b = await launch({ port: 9363 });
const R = {};
const listPoint = (re) => b.evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => ${re}.test(a.textContent)); a.scrollIntoView({ block: 'nearest' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const brief = (r) => ({ frames: r.frames, fs: r.frameStats, firstCloseMs: r.firstCloseMs, minAlt: r.minAlt, maxZ: r.maxZ, hints: r.hints, loadingWaitMs: r.loadingWaitMs, bytes: r.bytes });
const btn = (label) => b.evaluate(`(() => { const e = document.querySelector('.world__btn[aria-label="${label}"]') || [...document.querySelectorAll('.world__controls button')].find(x => x.textContent.trim().toLowerCase() === '${label}'.toLowerCase()); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);

/* A. /destinations/us/ cold: rest alt 0.56 so the close map is not preloaded. Real click on a list entry. */
await b.open('/destinations/us/');
await b.globeReady();
await sleep(1500);
{
  const p = await listPoint('/Michigan/');
  const st = await b.stageRect();
  // Bring the stage into view first, like a reader who scrolls back up after clicking below
  const r = await record(b, 's2a-us-michigan-cold', 9000, async () => { await b.click(p.x, p.y); });
  R.usCold = brief(r);
  R.usCold.stageTopAfter = (await b.stageRect()).y;
  await b.shot('s2a-us-michigan-arrived');
  R.usCold.card = await b.evaluate(`(() => { const c = document.querySelector('.world__card:not([hidden])'); return c ? { title: c.querySelector('h3')?.textContent, go: [...c.querySelectorAll('a')].map(a => ({ text: a.textContent, target: a.target, href: a.href })) } : null; })()`);
}

/* B. /destinations/nl/: TU Delft, all the way down, then Reset from street level, then wheel out. */
await b.open('/destinations/nl/');
await b.globeReady();
await sleep(2500);
{
  const p = await listPoint('/TU Delft/');
  const r = await record(b, 's2b-nl-delft', 8000, async () => { await b.click(p.x, p.y); });
  R.nlDelft = brief(r);
  R.nlDelft.seam = await b.g('return g.seam();');
  await b.shot('s2b-nl-delft-street');
  /* Pan on the close map by dragging (real mouse) */
  const st = await b.stageRect();
  const cx = st.x + st.w * 0.6, cy = st.y + st.h * 0.6;
  await b.mouse('mouseMoved', cx, cy, { button: 'none' });
  await b.mouse('mousePressed', cx, cy);
  for (let i = 1; i <= 10; i++) { await b.mouse('mouseMoved', cx - i * 20, cy - i * 6); await sleep(16); }
  await b.mouse('mouseReleased', cx - 200, cy - 60);
  await sleep(800);
  R.nlDelft.afterPan = await b.g('return { close: g.close.active, zoom: g.close.zoom, card: !document.querySelector(".world__card").hidden };');
  /* Reset from street level */
  const reset = await btn('Reset');
  const r2 = await record(b, 's2c-nl-reset-from-street', 4500, async () => { await b.click(reset.x, reset.y); });
  R.resetFromStreet = brief(r2);
  R.resetFromStreet.firstSamples = r2.samples.slice(0, 6);
  await b.shot('s2c-nl-after-reset');
}
/* C. Dive again, then wheel out (real wheel, held) from street level to space */
{
  const p = await listPoint('/TU Delft/');
  await b.click(p.x, p.y);
  for (let i = 0; i < 80; i++) { const z = await b.g('return g.close.zoom || 0;'); const a = await b.g('return g.close.active;'); if (a && z > 14.7) break; await sleep(150); }
  await sleep(1200);
  const st = await b.stageRect();
  const cx = st.x + st.w * 0.55, cy = st.y + st.h * 0.55;
  await b.click(cx, cy); // take hold (on the close map a bare click only closes the card)
  const r3 = await record(b, 's2d-nl-wheel-out', 6000, async () => {
    for (let i = 0; i < 40; i++) { await b.wheel(cx, cy, 240); await sleep(90); }
  });
  R.wheelOut = brief(r3);
  R.wheelOut.handback = r3.samples.filter((s, i, a) => i && a[i - 1].close !== s.close).map((s) => ({ t: s.t, alt: s.alt, close: s.close }));
  R.wheelOut.end = await b.g('return { alt: g.view.alt, close: g.close.active };');
  await b.shot('s2d-nl-wheeled-out');
}
/* D. Wheel all the way in from space to street, manual, over Amsterdam */
{
  const st = await b.stageRect();
  // point at Amsterdam on screen
  const ams = await b.g('const s = g.mineAt(52.37, 4.9); return s;');
  const cx = st.x + ams.x, cy = st.y + ams.y;
  const r4 = await record(b, 's2e-nl-wheel-in', 9000, async () => {
    for (let i = 0; i < 70; i++) { await b.wheel(cx, cy, -200); await sleep(90); }
  });
  R.wheelIn = brief(r4);
  R.wheelIn.transitions = r4.samples.filter((s, i, a) => i && a[i - 1].close !== s.close).map((s) => ({ t: s.t, alt: s.alt, close: s.close, z: s.z }));
  R.wheelIn.end = await b.g('return { alt: g.view.alt, close: g.close.active, zoom: g.close.zoom };');
  await b.shot('s2e-nl-wheeled-in');
}

/* E. /programmes/: list click on Delft (a city) from rest: the cloud dive and the city handoff */
await b.open('/programmes/');
await b.globeReady();
await sleep(1500);
{
  const p = await listPoint('/Delft/');
  const r = await record(b, 's2f-programmes-delft', 8000, async () => { await b.click(p.x, p.y); }, { sheet: 16 });
  R.progDelft = brief(r);
  R.progDelft.stageTop = (await b.stageRect()).y;
  await b.shot('s2f-programmes-delft-arrived');
  /* then another city far away: Delft -> Aarhus via the list, starting in the close map */
  const q = await listPoint('/Aarhus/');
  const r2 = await record(b, 's2g-programmes-delft-to-aarhus', 7000, async () => { await b.click(q.x, q.y); }, { sheet: 12 });
  R.delftToAarhus = brief(r2);
  await b.shot('s2g-programmes-aarhus-arrived');
}
R.logs = b.logs.filter((l) => !/READ-usage buffer/.test(l));
R.readUsageWarnings = b.logs.filter((l) => /READ-usage buffer/.test(l)).length;
await fs.writeFile(new URL('./s2-dive.json', import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
b.close(); process.exit(0);
