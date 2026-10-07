/* Q3: at the window (the event's target), does a capture listener added
   later run before a bubble listener added earlier? globe.js's popAt relies on it. */
import { ev } from './lib.mjs';
console.log(await ev(`(() => { const o = []; const a = () => o.push('bubble (added first)'); const b = () => o.push('capture (added second)');
  addEventListener('x-test', a); addEventListener('x-test', b, { capture: true });
  dispatchEvent(new Event('x-test')); removeEventListener('x-test', a); removeEventListener('x-test', b, { capture: true });
  return navigator.userAgent + ' :: ' + o.join(' -> '); })()`));
