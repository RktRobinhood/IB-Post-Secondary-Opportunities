/* Round 4: door → door → Back on a phone, with real taps (scroll settles before the tap). */
import { setup, open, PHONE, state, brief, tap, still, sleep, ev, send } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(30), typeof s === 'string' ? s : brief(s));
const press = async (d) => { await ev(`document.querySelector('.preset[data-scope="${d}"]').scrollIntoView({block:'center', behavior:'instant'})`); await sleep(700); const r = await ev(`(() => { const r = document.querySelector('.preset[data-scope="${d}"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await tap(r.x, r.y); };
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
const step = async () => { await sleep(900); await still(); await sleep(300); };
await setup(PHONE, {});
for (const [a, b] of [['nearby', 'far'], ['here', 'nearby'], ['here', 'far']]) {
  await fresh();
  await press(a); await step(); out(`${a}`, await state());
  await press(b); await step(); out(`  then ${b}`, await state());
  await ev('history.back()'); await sleep(2500); await still(); out('  Back', await state());
}
