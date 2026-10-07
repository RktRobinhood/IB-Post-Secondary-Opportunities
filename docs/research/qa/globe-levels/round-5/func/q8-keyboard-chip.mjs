/* Q8: keyboard reach. Enter (with its "\r" text, as a real keyboard sends) on a
   country card's university chip; then Tab order from the page top to the stage. */
import { setup, open, DESK, state, brief, click, still, sleep, ev, send, g, nodeAt, logs } from './lib.mjs';
const out = (k, s) => console.log(k.padEnd(40), typeof s === 'string' ? s : brief(s));
const keyDown = async (key, code, vk, text) => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, text }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }); };
await setup(DESK, {});
await send('Page.navigate', { url: 'about:blank' }); await sleep(300); await open('/?map=globe');
await g(`g.goToRegion('europe'); return true;`); await sleep(900); await still();
const n = await nodeAt(`(c) => c._nation === 'gb'`); await click(n.x, n.y); await sleep(900); await still();
await ev(`document.querySelector('.world__stage').focus()`);
let t = 0, on = false;
for (; t < 12 && !on; t++) { await keyDown('Tab', 'Tab', 9); on = await ev(`!!document.activeElement?.closest('.world__card') && document.activeElement.tagName === 'BUTTON' && document.activeElement.textContent.trim().length > 3`); }
out(`Tabs from stage to first chip: ${on ? t : 'never'}`, await ev(`document.activeElement?.textContent?.trim()`));
await keyDown('Enter', 'Enter', 13, '\r'); await sleep(1000); await still();
out('Enter on chip', await state());
out('focus after Enter', await ev(`(document.activeElement?.className || '') + ' :: ' + (document.activeElement?.textContent || '').trim().slice(0, 50)`));
await keyDown('Escape', 'Escape', 27); await sleep(800); await still();
out('Escape', await state());
out('focus after Escape', await ev(`(document.activeElement?.className || '') + ' :: ' + (document.activeElement?.textContent || '').trim().slice(0, 50)`));
/* Space on a chip */
await g(`g.goToCountry(g.country('nl')); return true;`); await sleep(900); await still();
await ev(`[...document.querySelectorAll('.world__card:not([hidden]) button')].find(b => b.textContent.trim().length > 3)?.focus()`);
await keyDown(' ', 'Space', 32, ' '); await sleep(1000); await still();
out('Space on NL chip', await state());
/* Universities not among the chips: is there a keyboard way to them? */
out('NL card chip count / "+N on the map"', await ev(`(() => { const c = document.querySelector('.world__card:not([hidden])'); return c ? [...c.querySelectorAll('button')].length + ' buttons; text: ' + c.textContent.replace(/\s+/g, ' ').trim().slice(-60) : 'no card'; })()`));
console.log('logs', await logs());
