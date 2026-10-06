/* P11: double-click on a country node; fast + + +; Back pressed mid-flight; trail click mid-flight. */
import { setup, open, DESK, state, brief, click, dblclick, key, still, sleep, ev, send, g, nodeAt, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(36), typeof s === 'string' ? s : brief(s));
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
await setup(DESK, {});
await fresh();
await g(`g.goToRegion('europe'); return true;`); await still(); await sleep(500);
let n = await nodeAt(`(c) => c._nation === 'dk'`);
await dblclick(n.x, n.y); await sleep(900); await still(); await sleep(300);
out('dblclick DK node', await state());
for (const nat of ['gb', 'nl', 'de']) {
  await g(`g.goToRegion('europe'); return true;`); await still(); await sleep(500);
  n = await nodeAt(`(c) => c._nation === '${nat}'`);
  await dblclick(n.x, n.y); await sleep(900); await still(); await sleep(300);
  out(`dblclick ${nat} node`, await state());
}
await fresh();
await ev(`document.querySelector('.world__stage').focus()`);
await key('+', 'Equal', '+'); await sleep(80); await key('+', 'Equal', '+'); await sleep(80); await key('+', 'Equal', '+');
await sleep(800); await still(); await sleep(300);
out('fast + + + (80ms)', await state());
await key('-', 'Minus', '-'); await sleep(80); await key('-', 'Minus', '-');
await sleep(800); await still(); await sleep(300);
out('fast − − (80ms)', await state());
/* Back pressed mid-flight */
n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await sleep(1500); await still();
n = await nodeAt(`(c) => c._nation === 'it'`);
await click(n.x, n.y); await sleep(250);
await ev('history.back()'); await sleep(1200); await still(); await sleep(300);
out('Italy, Back 250ms into the flight', await state());
console.log('logs', await logs());
