/* P7: wheel, double-click, a click during a flight, keyboard only. Normal motion, real input. */
import { setup, open, DESK, state, brief, click, dblclick, wheel, key, still, sleep, ev, send, g, shot, nodeAt, stageRect, logs, move } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(34), typeof s === 'string' ? s : brief(s));
await setup(DESK, {});
const fresh = async (r = '/?map=globe') => { await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open(r); };
const sr = await (async () => { await fresh(); return stageRect(); })();

/* A. First click on land after load (no hover first). */
{
  out('A load', await state());
  await click(1150, 260); await sleep(900); await still();
  out('A first click on land (Russia?)', await state());
  await click(1150, 260); await sleep(900); await still();
  out('A second click same spot', await state());
}
/* B. Wheel before taking hold: page scrolls? */
await fresh();
{
  const y0 = await ev('scrollY');
  for (let i = 0; i < 5; i++) { await wheel(sr.cx, sr.cy, -100); await sleep(40); }
  await sleep(600); await still();
  out(`B wheel-in, not engaged (scrollY ${y0}->${await ev('scrollY')})`, await state());
  /* Ctrl+wheel (a trackpad pinch) without engaging */
  for (let i = 0; i < 10; i++) { await wheel(sr.cx, sr.cy, -12, 2); await sleep(16); }
  await sleep(500); await still();
  out('B ctrl+wheel (trackpad pinch) in', await state());
  /* one long trackpad swipe in at the region level: 60 small events over ~1.5 s */
  for (let i = 0; i < 60; i++) { await wheel(sr.cx, sr.cy, -8, 2); await sleep(25); }
  await sleep(600); await still();
  out('B long pinch-in gesture (1.5 s)', await state());
  /* two separate swipes out, 500 ms apart */
  for (let i = 0; i < 6; i++) { await wheel(sr.cx, sr.cy, 40, 2); await sleep(20); }
  await sleep(500);
  for (let i = 0; i < 6; i++) { await wheel(sr.cx, sr.cy, 40, 2); await sleep(20); }
  await sleep(800); await still();
  out('B two swipes out 0.5 s apart', await state());
  for (let i = 0; i < 6; i++) { await wheel(sr.cx, sr.cy, 60, 2); await sleep(20); }
  await sleep(800); await still();
  out('B wheel out at world', await state());
  out('B hint', await ev(`document.querySelector('.world__hint:not([hidden])')?.textContent || '(none)'`));
}
/* C. Double-click on a continent bubble, and on bare land at world. */
await fresh();
{
  const eu = await nodeAt(`(c) => c._region === 'europe'`);
  await dblclick(eu.x, eu.y); await sleep(900); await still();
  out('C dblclick Europe bubble', await state());
  await fresh();
  await dblclick(1100, 470); await sleep(900); await still();
  out('C dblclick bare land (India-ish)', await state());
  await fresh();
  /* two single clicks 280 ms apart on land: past the 250 ms timer, inside the 330 ms double window */
  await click(1100, 470); await sleep(280); await click(1100, 470); await sleep(900); await still();
  out('C two clicks 280ms apart on land', await state());
}
/* D. A click on another continent mid-flight. */
await fresh();
{
  const eu = await nodeAt(`(c) => c._region === 'europe'`);
  const as = await nodeAt(`(c) => c._region === 'asia'`);
  await click(eu.x, eu.y); await sleep(250);
  await click(as.x, as.y); await sleep(200);
  await still(); await sleep(400);
  out('D Europe then Asia 250ms later', await state());
  out('D history len', String(await ev('history.length')));
  await ev('history.back()'); await sleep(900); await still();
  out('D back', await state());
}
/* E. Mid-flight to Europe, click a node that is popping in (rapid). */
await fresh();
{
  const eu = await nodeAt(`(c) => c._region === 'europe'`);
  await click(eu.x, eu.y);
  await sleep(700);
  const n = await nodeAt(`(c) => c._nation`);
  if (n) { await click(n.x, n.y); await sleep(200); await still(); await sleep(400); out('E click a country node mid-flight', await state()); }
  else out('E', 'no country node yet at 700ms');
}
/* F. Keyboard only: Tab to the stage, then + + + − − 0, Escape at each level, arrows. */
await fresh();
{
  await ev(`document.activeElement?.blur(); window.scrollTo(0, 0)`);
  let tabs = 0, found = false;
  for (; tabs < 40 && !found; tabs++) { await key('Tab'); found = await ev(`document.activeElement?.classList.contains('world__stage') || false`); }
  out(`F Tab presses to reach the stage: ${found ? tabs : 'never'}`, await ev(`document.activeElement?.className + ' ' + (document.activeElement?.getAttribute('aria-label')||'')`));
  if (!found) await ev(`document.querySelector('.world__stage').focus()`);
  const seq = [['+', 'Equal', '+'], ['+', 'Equal', '+'], ['+', 'Equal', '+'], ['Escape'], ['Escape'], ['Escape'], ['Escape'], ['+', 'Equal', '+'], ['ArrowRight'], ['ArrowRight'], ['-', 'Minus', '-'], ['+', 'Equal', '+'], ['+', 'Equal', '+'], ['0', 'Digit0', '0']];
  for (const [k, code, text] of seq) {
    await key(k, code || k, text); await sleep(700); await still(); await sleep(200);
    out(`F key ${k}`, await state());
  }
  out('F focus after', await ev(`document.activeElement?.className`));
}
/* G. Tab through the pins at a country level: can a keyboard user choose a university? */
{
  await g(`g.goToCountry(g.country('dk')); return true;`); await still();
  const f = await ev(`(() => { const s = document.querySelector('.world__stage'); s.focus(); return [...document.querySelectorAll('.world__pin, .world__cluster')].filter(e => !e.hidden).map(e => e.tabIndex + ':' + (e.getAttribute('role')||'') ).slice(0,5).join(' '); })()`);
  out('G pin tabindex/role sample', f);
  const list = await ev(`(() => { const l = [...document.querySelectorAll('.world a, .world button')].filter(e => e.offsetParent).map(e => (e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,30)); return l.length + ' focusables: ' + l.slice(0, 20).join(' | '); })()`);
  out('G focusables in the figure', list);
}
console.log('logs', await logs());
