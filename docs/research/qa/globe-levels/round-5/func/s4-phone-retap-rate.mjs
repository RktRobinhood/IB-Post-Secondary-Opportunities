/* Round 5: rate of a second tap on the Europe coin's spot opening a country (phone), plus timing of the level change vs the tap. */
import { setup, open, PHONE, state, tap, still, sleep, ev, send, nodeAt } from './lib.mjs';
const fresh = async () => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe'); };
await setup(PHONE, {});
for (const gap of [250, 400, 550, 650]) {
  const res = [];
  for (let i = 0; i < 4; i++) {
    await fresh(); const n = await nodeAt(`(c) => c._region === 'europe'`);
    const t0 = Date.now(); await tap(n.x, n.y); const t1 = Date.now();
    await sleep(Math.max(0, gap - (t1 - t0))); const t2 = Date.now(); await tap(n.x, n.y);
    await sleep(2500); await still(); const s = await state();
    res.push(`${s.lv.level === 'country' ? s.lv.country : s.lv.level}${s.card ? '' : '(no card)'}@${t2 - t0}`);
  }
  console.log(`phone Europe, again at ${gap}ms:`, res.join(', '));
}
