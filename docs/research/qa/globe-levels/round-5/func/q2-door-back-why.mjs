/* Q2: why door → door → Back ends on the world. Wraps the globe's public
   show()/reset() (what discover.js calls) to log the order of events in the
   popstate, without touching the source. */
import { setup, open, DESK, state, brief, click, still, sleep, ev, send } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(30), typeof s === 'string' ? s : brief(s));
const press = async (d) => { const r = await ev(`(() => { const b = document.querySelector('.preset[data-scope="${d}"]'); b.scrollIntoView({block:'center'}); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await click(r.x, r.y); };
await setup(DESK, {});
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
await ev(`(async () => {
  const w = (await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world'));
  const g = w.globe; window.__log = [];
  const L = (m) => window.__log.push(Math.round(performance.now()) + ' ' + m + ' lv=' + g.debug.lv.level + '/' + g.debug.lv.region);
  for (const k of ['show', 'reset']) { const f = g[k]; g[k] = function (...a) { L('before ' + k + ' ' + JSON.stringify(a[0] || null)); const r = f.apply(this, a); L('after ' + k + ' -> ' + r); return r; }; }
  addEventListener('popstate', (e) => L('late popstate listener, state=' + JSON.stringify(e.state)));
  return true;
})()`);
await press('nearby'); await sleep(800); await still();
await press('far'); await sleep(800); await still();
console.log('state of the nearby entry is checked on Back:');
await ev(`window.__log.length = 0, true`);
await ev('history.back()'); await sleep(2500); await still();
console.log((await ev('window.__log')).join('\n'));
out('after Back', await state());
