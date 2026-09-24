/* The dive in real time (screencast frames), and whether the unsharp mask does anything close in. */
import { launch, sleep, OUT } from './cdp.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const b = await launch({ port: 9350, gpu: true });
const { evaluate, mouse, G, send, listeners } = b;
const R = {};
await b.open('/europe/');
await b.globeReady();
const e = await evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Italy/.test(a.textContent)); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const frames = [];
listeners.push((m) => {
  if (m.method !== 'Page.screencastFrame') return;
  frames.push({ t: m.params.metadata.timestamp, data: m.params.data });
  send('Page.screencastFrameAck', { sessionId: m.params.sessionId });
});
await send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 });
await sleep(300);
await mouse('mouseMoved', e.x, e.y, { button: 'none' }); await mouse('mousePressed', e.x, e.y); await mouse('mouseReleased', e.x, e.y);
const t0 = Date.now() / 1000;
await sleep(3200);
await send('Page.stopScreencast');
R.frames = frames.length;
R.flightView = await evaluate(`(async () => ({ ...(${G}).view }))()`);
const dir = path.join(OUT, 'h-dive-frames');
await fs.mkdir(dir, { recursive: true });
frames.forEach((f, i) => fs.writeFile(path.join(dir, `${String(i).padStart(3, '0')}.jpg`), Buffer.from(f.data, 'base64')));
R.frameTimes = frames.map((f) => +(f.t - frames[0].t).toFixed(3));

// Unsharp mask: draw the same close view with and without it and compare pixels
async function closePixels(patch) {
  await b.open('/programmes/');
  if (patch) await evaluate(`(() => { const P = WebGLRenderingContext.prototype; const o = P.shaderSource; P.shaderSource = function (s, src) { return o.call(this, s, src.replace('c = clamp(c + (c - soft) * uSharp, 0.0, 1.0);', '')); }; return 1; })()`);
  await b.globeReady();
  await evaluate(`(async () => { const g = ${G}; document.documentElement.setAttribute('data-motion', 'reduced'); g.flyTo({ lat: 55.4, lon: 10.4, alt: 0.12 }); await new Promise(r => setTimeout(r, 600)); g.pause(); return 1; })()`);
  const st = await b.stageRect(); const sy = await evaluate('scrollY');
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: st.x, y: st.y + sy, width: st.w, height: st.h, scale: 1 } });
  await fs.writeFile(path.join(OUT, 'h-sharp-' + (patch ? 'off' : 'on') + '.png'), Buffer.from(r.data, 'base64'));
  return r.data;
}
const withSharp = await closePixels(false);
const without = await closePixels(true);
R.sharpIdentical = withSharp === without;
R.sharpLens = [withSharp.length, without.length];
console.log(JSON.stringify(R, null, 1));
await fs.writeFile(new URL('./h-motion.json', import.meta.url), JSON.stringify(R, null, 1));
b.close(); process.exit(0);
