/* P8: a press during a flight; one swipe out from a country; phone pinch in/out and tap. */
import { setup, open, DESK, PHONE, state, brief, click, wheel, pinch, tap, still, sleep, ev, send, g, shot, nodeAt, stageRect, logs, mouse, move } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(36), typeof s === 'string' ? s : brief(s));
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
await setup(DESK, {});
for (const delay of [300, 700, 1100]) {
  await fresh();
  const eu = await nodeAt(`(c) => c._region === 'europe'`);
  await click(eu.x, eu.y);
  await sleep(delay);
  const n = await nodeAt(`(c) => c._nation`);
  const target = n || { x: eu.x + 40, y: eu.y + 40, label: '(no node: land)' };
  await click(target.x, target.y);
  await sleep(200); await still(); await sleep(600);
  const s = await state();
  out(`E press ${delay}ms into the flight on ${target.label || target.place || 'node'}`, s);
  if (s.lv.level === 'region' && Math.abs(s.alt - 1) > 0.05) await shot(`midflight-stuck-${delay}`);
}
/* one swipe out from a country */
await fresh();
const sr = await stageRect();
await g(`g.goToCountry(g.country('de')); return true;`); await still(); await sleep(1200);
for (let i = 0; i < 8; i++) { await wheel(sr.cx, sr.cy, 30, 2); await sleep(20); }
await sleep(1200); await still();
out('one swipe out from Germany', await state());
/* a drag at the region level: does the level hold its frame? */
await g(`g.goToRegion('europe'); return true;`); await still(); await sleep(400);
await move(sr.cx, sr.cy); await mouse('mousePressed', sr.cx, sr.cy);
for (let i = 1; i <= 12; i++) { await mouse('mouseMoved', sr.cx - i * 25, sr.cy, { buttons: 1 }); await sleep(16); }
await mouse('mouseReleased', sr.cx - 300, sr.cy);
await sleep(1500); await still();
out('drag 300px left at Europe', await state());
await shot('drag-europe-300px');

/* phone: pinch in at world, pinch in again, pinch out, small pinch (settles back), tap a node */
await setup(PHONE, {});
await fresh();
const pr = await stageRect();
out('phone world', await state());
await pinch(pr.cx, pr.cy, 60, 200); await sleep(1500); await still();
out('phone pinch-in at world', await state());
await pinch(pr.cx, pr.cy, 60, 200); await sleep(1500); await still();
out('phone pinch-in at region', await state());
await pinch(pr.cx, pr.cy, 60, 200); await sleep(1500); await still();
out('phone pinch-in at country', await state());
await pinch(pr.cx, pr.cy, 200, 60); await sleep(1500); await still();
out('phone pinch-out at country', await state());
await pinch(pr.cx, pr.cy, 100, 115); await sleep(1500); await still();
out('phone tiny pinch (settle back)', await state());
await pinch(pr.cx, pr.cy, 250, 40); await sleep(1500); await still();
out('phone big pinch-out at region', await state());
const eu = await nodeAt(`(c) => c._region === 'europe'`);
await tap(eu.x, eu.y); await sleep(1500); await still();
out('phone tap Europe', await state());
const de = await nodeAt(`(c) => c._nation === 'gb'`);
if (de) { await tap(de.x, de.y); await sleep(1500); await still(); out('phone tap UK node', await state()); await shot('phone-uk'); }
console.log('logs', await logs());
