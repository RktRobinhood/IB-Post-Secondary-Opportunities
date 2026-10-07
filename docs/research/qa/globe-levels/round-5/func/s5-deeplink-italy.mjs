/* Round 5: R4-9 (a deep-linked university's count), R4-10 (Maastricht ids), and Italy's Sapienza under the credits link on a phone. */
import { setup, open, DESK, PHONE, state, brief, tap, still, sleep, ev, send, g, shot } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(34), typeof s === 'string' ? s : brief(s).replace(/\?area=[^#]*#/, '?area=…#'));
await setup(DESK, {});
for (const r of ['/?map=globe#place=dk-baaa', '/?map=globe#place=nl-um', '/?map=globe&where=inst%3Anl-maastricht#place=nl-um', '/?map=globe#region=europe']) {
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); await sleep(1500); await still();
  out(r.replace('/?map=globe', ''), await state());
}
await setup(PHONE, {});
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
await g(`g.goToCountry(g.country('it')); return 1;`); await sleep(2500); await still(); await sleep(500);
const p = await ev(`(() => { const d = document.querySelector('.world__pin[data-place="it-sapienza"] .world__pin-dot').getBoundingClientRect(); const x = d.left + d.width / 2, y = d.top + d.height / 2; return { x, y, top: document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href') || '-' }; })()`);
console.log('phone Italy Sapienza dot', JSON.stringify(p)); await shot('s5-phone-italy');
await tap(p.x, p.y); await sleep(1500);
console.log('after tapping it:', await ev('location.pathname + location.hash'));
