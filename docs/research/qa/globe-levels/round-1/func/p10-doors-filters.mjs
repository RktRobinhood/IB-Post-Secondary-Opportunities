/* P10: the doors and Back; a filter then the globe; a dimmed university clicked; Reset/World with a filter on; /countries/. */
import { setup, open, DESK, PHONE, state, brief, click, still, sleep, ev, send, g, shot, nodeAt, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(40), typeof s === 'string' ? s : brief(s));
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
const clickSel = async (sel) => { const r = await ev(`(() => { const b = document.querySelector('${sel}'); if (!b) return null; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); if (!r) return false; await click(r.x, r.y); return true; };
await setup(DESK, {});
/* A. Doors in a row, then Back x3 */
await fresh();
for (const d of ['here', 'nearby', 'far']) {
  await clickSel(`.preset[data-scope="${d}"]`); await sleep(800); await still(); await sleep(300);
  out(`A door ${d}`, await state());
}
for (let i = 0; i < 3; i++) { await ev('history.back()'); await sleep(1200); await still(); out(`A back ${i + 1}`, await state()); }
/* B. Door Nearby, then a country on the globe, then Back x2 */
await fresh();
await clickSel(`.preset[data-scope="nearby"]`); await sleep(800); await still();
out('B nearby', await state());
let n = await nodeAt(`(c) => c._nation === 'nl'`);
await ev(`document.querySelector('.world__stage').scrollIntoView({ block: 'center' })`); await sleep(300);
n = await nodeAt(`(c) => c._nation === 'nl'`);
if (n) { await click(n.x, n.y); await sleep(800); await still(); out('B click NL', await state()); }
await ev('history.back()'); await sleep(1200); await still(); out('B back', await state());
await ev('history.back()'); await sleep(1200); await still(); out('B back 2', await state());
/* C. Door Right here then trail World: does the door stay pressed? */
await fresh();
await clickSel(`.preset[data-scope="here"]`); await sleep(800); await still();
out('C here', await state());
await clickSel(`.world__trail-btn`); await sleep(1000); await still();
out('C trail World', await state());
out('C presets pressed', await ev(`[...document.querySelectorAll('.preset')].map(b => b.dataset.scope + '=' + (b.getAttribute('aria-pressed') || b.className)).join(' ')`));
/* D. Search 'medicine', then the globe: Europe, a country, a dimmed university */
await fresh();
await ev(`(() => { const q = document.getElementById('f-q'); q.value = 'medicine'; q.dispatchEvent(new Event('input', { bubbles: true })); q.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await sleep(900);
out('D search medicine', await state());
await ev(`document.querySelector('.world__stage').scrollIntoView({ block: 'center' })`); await sleep(400);
n = await nodeAt(`(c) => c._region === 'europe'`); await click(n.x, n.y); await sleep(800); await still();
let s = await state(); out('D Europe', s);
console.log('   nodes', s.nodes.filter(x => x.kind === 'country').map(x => `${x.nation}:${x.n || '·'}`).join(' '));
n = await nodeAt(`(c) => c._nation === 'dk'`); await click(n.x, n.y); await sleep(800); await still();
s = await state(); out('D Denmark', s);
const dimPin = await ev(`(() => { const p = [...document.querySelectorAll('.world__pin[data-dim]')].find(p => !p.hidden); if (!p) return null; const r = p.querySelector('.world__pin-dot').getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2, id: p.dataset.place }; })()`);
if (dimPin) {
  /* dispatch the click on the element itself so pin overlap does not decide (that is P4) */
  await ev(`document.querySelector('.world__pin[data-place="${dimPin.id}"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`); await sleep(900); await still();
  s = await state(); out(`D dimmed university ${dimPin.id}`, s);
  await shot('filter-dim-university');
}
const litPin = await ev(`(() => { const p = [...document.querySelectorAll('.world__pin:not([data-dim])')].find(p => !p.hidden); return p?.dataset.place || null; })()`);
if (litPin) { await ev(`document.querySelector('.world__pin[data-place="${litPin}"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`); await sleep(900); await still(); out(`D lit university ${litPin}`, await state()); }
await ev('history.back()'); await sleep(1200); await still(); out('D back', await state());
await ev('history.back()'); await sleep(1200); await still(); out('D back 2', await state());
await ev('history.back()'); await sleep(1200); await still(); out('D back 3', await state());
await ev('history.back()'); await sleep(1200); await still(); out('D back 4', await state());
out('D search box', await ev(`document.getElementById('f-q').value`));
/* E. The Countries page */
await fresh('/countries/?map=globe');
out('E countries world', await state());
n = await nodeAt(`(c) => c._region === 'europe'`); if (n) { await click(n.x, n.y); await sleep(800); await still(); out('E Europe', await state()); }
n = await nodeAt(`(c) => c._nation === 'fr'`); if (n) { await click(n.x, n.y); await sleep(800); await still(); out('E France', await state()); await shot('countries-france'); }
await ev('history.back()'); await sleep(1200); await still(); out('E back', await state());
console.log('logs', await logs());
