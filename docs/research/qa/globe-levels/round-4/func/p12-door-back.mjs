/* P12: confirm the door + Back desync with a long wait and a shot. */
import { setup, open, DESK, state, brief, click, still, sleep, ev, send, shot } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(30), typeof s === 'string' ? s : brief(s));
await setup(DESK, {});
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
const press = async (d) => { const r = await ev(`(() => { const b = document.querySelector('.preset[data-scope="${d}"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await click(r.x, r.y); };
await press('nearby'); await sleep(1000); await still(); out('nearby', await state());
await press('far'); await sleep(1000); await still(); out('far', await state());
await ev('history.back()'); await sleep(3500); await still(); await sleep(1000);
out('Back (3.5 s later)', await state());
await shot('door-back-desync');
