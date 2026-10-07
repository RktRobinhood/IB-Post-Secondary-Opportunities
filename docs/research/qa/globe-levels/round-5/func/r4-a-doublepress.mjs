/* Round 4: follow-ups to q6. Sky click after arrival (is case 2 by design?),
   desk double-click on the DK coin, phone double-tap on DK at 80/150/300 ms,
   the same spot again 600 ms after Europe (desk, phone), and a deliberate drag mid-flight. */
import { setup, open, DESK, PHONE, state, brief, click, dblclick, tap, still, sleep, ev, send, g, nodeAt, stageRect, mouse, move } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(46), typeof s === 'string' ? s : brief(s));
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const settle = async () => { await sleep(2500); await still(); await sleep(300); };
await setup(DESK, {});
await fresh(); let sr = await stageRect();
let n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await settle(); out('a0 desk Europe settled', await state());
await click(sr.x + 40, sr.y + 40); await settle(); out('a1 then sky corner after arrival', await state());
await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
n = await nodeAt(`(c) => c._nation === 'dk'`); await dblclick(n.x, n.y); await settle();
out('b desk dblclick DK coin', await state());
for (const gap of [80, 150, 300]) {
  await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
  n = await nodeAt(`(c) => c._nation === 'dk'`); await click(n.x, n.y); await sleep(gap); await click(n.x, n.y); await settle();
  out(`c desk DK click, again at ${gap}ms`, await state());
}
await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
n = await nodeAt(`(c) => c._nation === 'nl'`); await dblclick(n.x, n.y); await settle();
out('d desk dblclick NL coin', await state());
/* deliberate drag mid-flight */
await fresh(); sr = await stageRect();
n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await sleep(500);
await move(sr.cx, sr.cy); await mouse('mousePressed', sr.cx, sr.cy);
for (let i = 1; i <= 10; i++) { await mouse('mouseMoved', sr.cx + i * 20, sr.cy, { buttons: 1 }); await sleep(20); }
await mouse('mouseReleased', sr.cx + 200, sr.cy); await settle();
out('e desk Europe, drag 200px at 500ms', await state());
await setup(PHONE, {});
for (const gap of [80, 150, 300]) {
  await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
  n = await nodeAt(`(c) => c._nation === 'dk'`); await tap(n.x, n.y); await sleep(gap); await tap(n.x, n.y); await settle();
  out(`f phone DK tap, again at ${gap}ms`, await state());
}
for (const code of ['nl', 'de', 'gb']) {
  await fresh(); await g(`g.goToRegion('europe'); return true;`); await settle();
  n = await nodeAt(`(c) => c._nation === '${code}'`); if (!n) { console.log('no', code); continue; }
  await tap(n.x, n.y); await sleep(150); await tap(n.x, n.y); await settle();
  out(`g phone double tap ${code}`, await state());
}
await fresh(); n = await nodeAt(`(c) => c._region === 'europe'`);
await tap(n.x, n.y); await sleep(600); await tap(n.x, n.y); await settle();
out('h phone Europe, same spot at 600ms', await state());
