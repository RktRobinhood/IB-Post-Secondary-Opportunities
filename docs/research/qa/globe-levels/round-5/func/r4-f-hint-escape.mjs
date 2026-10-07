/* Round 4: (a) #country=ru gives the hint; (b) Escape on a university card: level, URL, and what Back does next. */
import { setup, open, DESK, state, brief, click, key, still, sleep, ev, send, g, nodeAt } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(40), typeof s === 'string' ? s : brief(s));
await setup(DESK, {});
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe#country=ru');
out('a #country=ru hint', await ev(`[...document.querySelectorAll('.world [role=status], .world__hint, .world__toast')].map(e => e.textContent.trim()).filter(Boolean).join(' | ') || '(no hint text found)'`));
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
await g(`g.goToRegion('europe'); return true;`); await sleep(1500); await still();
let n = await nodeAt(`(c) => c._nation === 'dk'`); await click(n.x, n.y); await sleep(1500); await still();
n = await nodeAt(`(c) => c.dataset?.place === 'dk-au'`); await click(n.x, n.y); await sleep(1200); await still();
out('b Aarhus University', await state());
await ev(`document.querySelector('.world__stage').focus()`); await key('Escape'); await sleep(1200); await still();
out('b Escape', await state());
await ev('history.back()'); await sleep(2000); await still(); out('b Back', await state());
