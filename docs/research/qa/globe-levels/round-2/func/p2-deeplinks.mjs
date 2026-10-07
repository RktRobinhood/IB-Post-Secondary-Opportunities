/* P2: deep links on a fresh load (about:blank between), then one Back. */
import { setup, open, DESK, state, brief, still, sleep, ev, send, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(28), typeof s === 'string' ? s : brief(s));
await setup(DESK, { reduced: true });
const list = (process.argv[2] || '#country=dk,#country=jp,#region=asia,#place=dk-baaa,#place=dk,#country=sg,#country=hk,#country=mt,#country=lu,#region=north-america,#country=ru,#region=oceania,#country=au,#country=nz,#region=europe').split(',');
for (const h of list) {
  await send('Page.navigate', { url: 'about:blank' }); await sleep(400);
  const r = await open('/?map=globe' + h);
  await still(); await sleep(500);
  out('deeplink ' + h + ' (' + r + ')', await state());
}
console.log('logs', await logs());
