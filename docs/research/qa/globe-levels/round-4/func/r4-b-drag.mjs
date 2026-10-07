/* Round 4: a deliberate drag during the World→Europe flight. Where does the camera end, and what next? */
import { setup, open, DESK, PHONE, state, brief, click, tap, still, sleep, ev, send, g, nodeAt, stageRect, mouse, move, shot, wheel, key } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(46), typeof s === 'string' ? s : brief(s));
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const settle = async () => { await sleep(2500); await still(); await sleep(300); };
await setup(DESK, {});
for (const at of [300, 900]) {
  await fresh(); const sr = await stageRect();
  const n = await nodeAt(`(c) => c._region === 'europe'`);
  await click(n.x, n.y); await sleep(at);
  await move(sr.cx, sr.cy); await mouse('mousePressed', sr.cx, sr.cy);
  for (let i = 1; i <= 6; i++) { await mouse('mouseMoved', sr.cx + i * 10, sr.cy, { buttons: 1 }); await sleep(20); }
  await mouse('mouseReleased', sr.cx + 60, sr.cy); await settle();
  out(`desk Europe, drag 60px at ${at}ms`, await state()); await shot(`r4-b-drag-${at}`);
}
/* then what does the student do: click Denmark coin? */
const n = await nodeAt(`(c) => c._nation === 'dk'`);
if (n) { await click(n.x, n.y); await settle(); out('  then click DK coin', await state()); } else console.log('  no DK coin visible');
/* phone: swipe mid-flight */
await setup(PHONE, {});
await fresh(); const pr = await stageRect();
const m = await nodeAt(`(c) => c._region === 'europe'`);
await tap(m.x, m.y); await sleep(400);
await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pr.cx, y: pr.cy }] });
for (let i = 1; i <= 6; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pr.cx + i * 12, y: pr.cy }] }); await sleep(20); }
await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await settle();
out('phone Europe, swipe 72px at 400ms', await state()); await shot('r4-b-phone-swipe');
