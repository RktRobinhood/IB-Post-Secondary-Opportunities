/* P1: the walk with real clicks, history length per step, Back x4, Forward x4; deep links. */
import { setup, open, DESK, state, brief, nodeAt, click, still, sleep, ev, shot, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(18), typeof s === 'string' ? s : brief(s));
await setup(DESK, { reduced: true });
console.log(await open('/?map=globe'));
out('world', await state());
let n = await nodeAt(`(c) => c._region === 'europe'`);
await click(n.x, n.y); await still(); await sleep(400);
out('click europe', await state());
n = await nodeAt(`(c) => c._nation === 'dk'`);
await click(n.x, n.y); await still(); await sleep(400);
out('click dk', await state());
n = await nodeAt(`(c) => c.classList.contains('world__pin')`);
await click(n.x, n.y); await still(); await sleep(400);
out('click pin ' + n.place, await state());
for (let i = 0; i < 3; i++) { await ev('history.back()'); await sleep(900); await still(); out('back ' + (i + 1), await state()); }
for (let i = 0; i < 3; i++) { await ev('history.forward()'); await sleep(900); await still(); out('fwd ' + (i + 1), await state()); }
console.log('logs', await logs());

for (const h of ['#country=jp', '#region=asia', '#place=dk-baaa', '#country=sg', '#country=hk', '#country=mt', '#country=lu', '#region=north-america', '#country=ru', '#region=oceania', '#country=au']) {
  console.log(await open('/?map=globe' + h));
  await still(); await sleep(500);
  out('deeplink ' + h, await state());
}
console.log('logs', await logs());
