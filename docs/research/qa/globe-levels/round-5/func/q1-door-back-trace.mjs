/* Q1 (round 2): door + Back, traced. Polls the level every 100 ms after Back,
   and runs the three door/Back paths round 1 found. Real clicks on the doors. */
import { setup, open, DESK, PHONE, state, brief, click, still, sleep, ev, send, g, nodeAt, shot } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(34), typeof s === 'string' ? s : brief(s));
const press = async (d) => { const r = await ev(`(() => { const b = document.querySelector('.preset[data-scope="${d}"]'); b.scrollIntoView({block:'center'}); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await click(r.x, r.y); };
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const trace = async (ms = 3000) => ev(`(async () => { const g = ${'(await import(\'/assets/js/map.js\')).enhanceWorld(document.querySelector(\'.world\')).globe.debug'}; const seen = []; let last = ''; const t0 = performance.now(); while (performance.now() - t0 < ${ms}) { const k = g.lv.level + '/' + (g.lv.region||'') + '/' + (g.lv.country||'') + ' alt=' + g.view.alt.toFixed(2); if (k !== last) { seen.push(Math.round(performance.now() - t0) + 'ms ' + k); last = k; } await new Promise(r => setTimeout(r, 50)); } return seen.join(' -> '); })()`);
const order = () => ev(`(() => { window.__pops = []; addEventListener('popstate', () => window.__pops.push('late-listener'), {once:true}); return true; })()`);

for (const vp of [['desk', DESK], ['phone', PHONE]]) {
  await setup(vp[1], {});
  console.log('==', vp[0]);
  // A: Nearby -> Explore -> Back
  await fresh();
  await press('nearby'); await sleep(800); await still(); out('A nearby', await state());
  await press('far'); await sleep(800); await still(); out('A far', await state());
  await ev('history.back()'); console.log('  trace', await trace(3500));
  await still(); out('A Back', await state());
  if (vp[0] === 'desk') await shot('q1-nearby-far-back');
  // B: Right here -> Nearby -> Back
  await fresh();
  await press('here'); await sleep(800); await still(); out('B here', await state());
  await press('nearby'); await sleep(800); await still(); out('B nearby', await state());
  await ev('history.back()'); console.log('  trace', await trace(3500));
  await still(); out('B Back', await state());
  // C: Nearby -> click Netherlands node -> Back
  await fresh();
  await press('nearby'); await sleep(800); await still();
  await ev(`document.querySelector('.world__stage').scrollIntoView({block:'center'})`); await sleep(300);
  const n = await nodeAt(`(c) => c._nation === 'nl'`);
  if (n) { await click(n.x, n.y); await sleep(900); await still(); out('C nl', await state()); }
  else console.log('C: no nl node visible');
  await ev('history.back()'); console.log('  trace', await trace(3500));
  await still(); out('C Back', await state());
  // D: Nearby -> Back (to no door)
  await fresh();
  await press('nearby'); await sleep(800); await still();
  await ev('history.back()'); console.log('  trace', await trace(3000));
  await still(); out('D nearby, Back', await state());
  // E: Explore -> Back -> Forward
  await press('far'); await sleep(800); await still();
  await ev('history.back()'); await sleep(1500); await still(); out('E far, Back', await state());
  await ev('history.forward()'); await sleep(1500); await still(); out('E Forward', await state());
}
