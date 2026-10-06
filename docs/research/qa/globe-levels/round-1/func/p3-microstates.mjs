/* P3: a country without an outline in the borders (Malta, Luxembourg, Singapore, Hong Kong): node click, pin, Back, Forward, reload. */
import { setup, open, DESK, state, brief, nodeAt, click, still, sleep, ev, send, g, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(22), typeof s === 'string' ? s : brief(s));
await setup(DESK, { reduced: true });
for (const [region, code] of [['europe', 'mt'], ['europe', 'lu'], ['asia', 'sg'], ['asia', 'hk']]) {
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
  await open('/?map=globe');
  console.log(code, 'outline in borders?', await g(`return !!g.country('${code}');`));
  await g(`g.goToRegion('${region}'); return true;`); await still(); await sleep(400);
  let n = await nodeAt(`(c) => c._nation === '${code}'`);
  if (!n) { console.log('  no node for', code); continue; }
  await click(n.x, n.y); await still(); await sleep(400);
  out(`  click ${code}`, await state());
  n = await nodeAt(`(c) => c.classList.contains('world__pin')`);
  if (n) { await click(n.x, n.y); await still(); await sleep(400); out(`  pin ${n.place}`, await state()); }
  await ev('history.back()'); await sleep(800); await still(); out('  back', await state());
  await ev('history.back()'); await sleep(800); await still(); out('  back 2', await state());
  await ev('history.forward()'); await sleep(800); await still(); out('  fwd', await state());
  await ev('location.reload()'); await sleep(2500); await open(await ev('location.pathname+location.search+location.hash')); await still(); await sleep(400);
  out('  reload', await state());
}
console.log('logs', await logs());
