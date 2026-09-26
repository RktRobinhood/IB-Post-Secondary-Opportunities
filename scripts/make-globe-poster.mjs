/**
 * The still of the desk globe at rest that stands in a world window's stage
 * until the globe has drawn, and stays where it cannot draw (#53 round 2).
 *
 *   node src/build.mjs                       # SITE_BASE unset
 *   PORT=4415 node scripts/serve.mjs &
 *   CHROME=/path/to/chrome PREVIEW=http://127.0.0.1:4415 node scripts/make-globe-poster.mjs
 *
 * For each page that rests on the desk (home, /countries/) and each theme, it
 * opens the page with reduced motion (so the globe holds its resting pose, no
 * idle rocking), forces the stage to 1000 × 900, hides everything but the
 * globe, its ring and its stand, and captures the assembly's box on a
 * transparent background: −1.35…1.35 globe radii across, −1.35…1.8 down, the
 * box `.world__poster` is placed on in primitives.css. It writes
 * src/assets/img/globe/poster-<figure id>[-dark].webp, 600 × 700, with alpha.
 *
 * The alpha is kept lossless: the globe's halo is a long, faint falloff, and
 * a lossy alpha flattened it into a grey plate with a rim (#53 round 2).
 *
 * Remake it when the desk changes (globe.js: TILT, DESK_*, the pastel
 * shader) or when a page's resting pose moves (its places change where the
 * weight of the page is). A stale poster is a slightly different turn of the
 * same globe for the half second before the real one lands on it.
 *
 * Needs a headless Chrome with WebGL (SwiftShader is fine: `?map=globe`).
 * No dependency but sharp, which the image scripts already use.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'img', 'globe');
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4415';
const CHROME = process.env.CHROME || 'chromium';
const PORT = 9337;
const PAGES = [['/', 'discover-map'], ['/countries/', 'index-countries']];
const SW = 1000, SH = 900;

const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'poster-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars',
  '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); }
}
if (!version) throw new Error('Chrome did not start');
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) for (const l of events) l(msg);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

const HIDE = `
  html, body { background: transparent !important; }
  body * { visibility: hidden !important; }
  .world__stage, .world__stage * { visibility: visible !important; }
  .world__pins, .world__controls, .world__credit, .world__hint, .world__poster, .world__card { display: none !important; }
  .world__stage { position: fixed !important; left: 0 !important; top: 0 !important; width: ${SW}px !important; height: ${SH}px !important;
    aspect-ratio: auto !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; z-index: 9999; }
  .world__globe { -webkit-mask-image: none !important; mask-image: none !important; }
`;

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.bringToFront');
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `document.documentElement.setAttribute('data-motion', 'reduced');` });
  for (const dark of [false, true]) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
    for (const [route, id] of PAGES) {
      const loaded = new Promise((r) => events.push(function once(m) { if (m.method === 'Page.loadEventFired') { events.splice(events.indexOf(once), 1); r(); } }));
      await send('Page.navigate', { url: `${BASE}${route}?map=globe` });
      await loaded;
      await evaluate(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(HIDE)}; document.head.append(s); return true; })()`);
      const state = await evaluate(`(async () => {
        const f = document.getElementById(${JSON.stringify(id)});
        f.scrollIntoView({ block: 'center', behavior: 'instant' });
        for (let i = 0; i < 300 && f.dataset.globe !== 'on'; i++) await new Promise(r => setTimeout(r, 100));
        dispatchEvent(new Event('resize'));
        await new Promise(r => setTimeout(r, 2500));
        return f.dataset.globe;
      })()`);
      if (state !== 'on') throw new Error(`${route}: the globe did not draw (${state})`);
      /* The globe's radius on this stage, as globe.js deskAltFor() makes it. */
      const r = Math.min((SH * 0.92) / 2.75, (SW * 0.9) / 2.32);
      /* The stage is fixed at the viewport's corner; a clip is in page coordinates. */
      const sy = await evaluate('scrollY');
      const clip = { x: SW / 2 - 1.35 * r, y: sy + SH / 2 - 1.595 * r, width: 2.7 * r, height: 3.15 * r, scale: 1 };
      const shot = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: false });
      const file = path.join(OUT, `poster-${id}${dark ? '-dark' : ''}.webp`);
      await sharp(Buffer.from(shot.data, 'base64')).resize(600, 700).webp({ quality: 60, alphaQuality: 100, effort: 6 }).toFile(file);
      console.log(`  ${path.relative(ROOT, file)}  ${Math.round((await fs.stat(file)).size / 1024)} kB`);
    }
  }
} finally {
  ws.close();
  chrome.kill();
  await sleep(500);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
