/**
 * Screenshots of the globe for the critic loop, taken the same way every time.
 *
 *   node src/build.mjs          # with SITE_BASE unset: the shots load /assets/…
 *   node scripts/serve.mjs      # in another terminal
 *   node docs/research/qa/globe/shoot.mjs [round-dir]   # default round-0
 *
 * PREVIEW=http://localhost:NNNN points it at another server — useful when
 * other agents keep rebuilding dist/: copy dist/ somewhere and serve that.
 * Writes <round-dir>/*.png and report.json (globe state per page, the
 * reduced-motion check, the interaction checks, CPU ms per frame, console).
 *
 * Drives a headless Chrome over the DevTools protocol (Node's own WebSocket;
 * no dependency). Mid-flight shots are deterministic: the loop is paused and
 * the flight is stepped to an exact fraction, so "mid-dive, in the clouds" is
 * the same frame on every run rather than whatever a timer happened to catch.
 *
 * Set CHROME to the browser binary if it is not at the Windows default.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const ROUND = process.argv[2] || 'round-0';
const OUT = path.join(import.meta.dirname, ROUND);
const BASE = process.env.PREVIEW || 'http://localhost:4321';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9333;

await fs.mkdir(OUT, { recursive: true });
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'globe-shoot-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run',
  'about:blank',
], { stdio: 'ignore' });

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
const listeners = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    for (const l of listeners) l(msg);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const logs = [];
listeners.push((m) => {
  if (m.method === 'Runtime.consoleAPICalled') logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
});
await send('Runtime.enable');
await send('Page.enable');
// A tab made over the protocol starts in the background, where animations and
// requestAnimationFrame are throttled. Put it in front and give it focus.
await send('Page.bringToFront');
await send('Emulation.setFocusEmulationEnabled', { enabled: true });

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

async function open(route, { width = 1280, height = 800, mobile = false, dark = false, reduced = false, query = '' } = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' },
      { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
    ],
  });
  const loaded = new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  await send('Page.navigate', { url: `${BASE}${route}${query}` });
  await loaded;
}

/** Scroll the map into view and wait until the globe has drawn. */
async function globeReady(sel = '.world') {
  return evaluate(`(async () => {
    const f = document.querySelector('${sel}');
    const s = f.querySelector('.world__stage');
    scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - Math.max(8, (innerHeight - s.offsetHeight) / 2)));
    for (let i = 0; i < 120 && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 700));
    return f.dataset.globe;
  })()`);
}

/* Headless Chrome only advances CSS animations on frames something asks for,
   and an idle globe asks for none. Before a shot, drive frames for a moment so
   the card has finished arriving, as it would have in any real browser. */
const settle = (ms = 600) => evaluate(`new Promise((r) => {
  const t0 = performance.now();
  (function f() { if (performance.now() - t0 > ${ms}) r(true); else requestAnimationFrame(f); })();
})`);

async function shot(name) {
  await settle();
  const r = await send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(r.data, 'base64'));
  console.log(`  ${name}.png`);
}

const report = {};
const debugOf = `(await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug`;

try {
  // 1. /programmes/ at rest, desktop, light
  await open('/programmes/');
  report.programmes = await globeReady();
  await evaluate(`(async () => { const g = ${debugOf}; g.pause(); return true; })()`);
  await shot('01-programmes-rest');

  // 2. Mid-dive through the clouds: from the whole view into the Netherlands
  await evaluate(`(async () => {
    const g = ${debugOf};
    g.resume();
    Object.assign(g.view, { lat: 30, lon: -10, alt: 1.7 });
    g.goToCountry(g.country('nl'));
    g.pause();
    return true;
  })()`);
  for (const [k, frac] of [['02-dive-start', 0.3], ['03-dive-clouds', 0.72], ['04-dive-clouds-late', 0.84]]) {
    await evaluate(`(async () => { const g = ${debugOf}; g.stepTo(${frac}); return true; })()`);
    await sleep(120);
    await shot(k);
  }
  await evaluate(`(async () => { const g = ${debugOf}; g.stepTo(1); g.resume(); return true; })()`);
  await sleep(700);
  await shot('05-country-card');

  // 3. Close zoom with labels: Copenhagen
  await evaluate(`(async () => {
    const g = ${debugOf};
    g.resume();
    document.documentElement.setAttribute('data-motion', 'reduced');
    g.flyTo({ lat: 55.72, lon: 12.35, alt: 0.07 });
    await new Promise(r => setTimeout(r, 900));
    document.documentElement.removeAttribute('data-motion');
    return true;
  })()`);
  await shot('06-close-zoom-labels');

  // 4. A pin card
  report.pinCard = await evaluate(`(async () => {
    const g = ${debugOf};
    g.resume();
    document.documentElement.setAttribute('data-motion', 'reduced');
    const p = g.places.find(p => p.image) || g.places[0];
    g.goToPlace(p);
    await new Promise(r => setTimeout(r, 900));
    document.documentElement.removeAttribute('data-motion');
    const card = document.querySelector('.world__card');
    return { name: p.name, visibility: document.visibilityState, cardOpacity: getComputedStyle(card).opacity, anims: card.getAnimations().map(a => [a.animationName, a.playState, Math.round(a.currentTime)]) };
  })()`);
  await shot('07-pin-card');

  // 5. Reduced motion: a flight is instant
  report.reducedMotion = await evaluate(`(async () => {
    const g = ${debugOf};
    g.resume();
    document.documentElement.setAttribute('data-motion', 'reduced');
    g.flyTo({ lat: 10, lon: 100, alt: 1.2 });
    const v = { ...g.view };
    document.documentElement.removeAttribute('data-motion');
    return Math.abs(v.lat - 10) < 1e-6 && Math.abs(v.lon - 100) < 1e-6 && Math.abs(v.alt - 1.2) < 1e-6;
  })()`);

  // 6. Dark theme
  await open('/programmes/', { dark: true });
  await evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
  report.dark = await globeReady();
  await evaluate(`(async () => { const g = ${debugOf}; g.pause(); return true; })()`);
  await shot('08-programmes-dark');

  // 7. Phone
  await open('/programmes/', { width: 390, height: 844, mobile: true });
  report.phoneFirstScreen = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; })()`);
  await sleep(2500);
  await shot('09-phone-first-screen');
  report.phone = await globeReady();
  await shot('10-phone-globe');

  // 8. /europe/ and /world/ and a destination page
  for (const [route, name] of [['/europe/', '11-europe'], ['/world/', '12-world'], ['/destinations/nl/', '13-destination-nl']]) {
    await open(route);
    report[route] = await globeReady();
    await evaluate(`(async () => { const g = ${debugOf}; g.pause(); return true; })()`).catch(() => null);
    await shot(name);
  }

  // 9. Fallback: the flat map
  await open('/programmes/', { query: '?map=flat' });
  report.flat = await globeReady();
  await shot('14-flat-fallback');

  // 10. Interaction, with real input events rather than the debug hooks
  await open('/europe/');
  await globeReady();
  const rect = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
  const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  const state = () => evaluate(`(async () => { const g = ${debugOf}; return { alt: g.view.alt, lon: g.view.lon, lat: g.view.lat, scrollY, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || '' }; })()`);
  const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
  const wheel = (x, y, deltaY, modifiers = 0) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, modifiers });
  const inter = {};

  // A wheel passing over an untouched globe scrolls the page and leaves the camera alone.
  let before = await state();
  await wheel(cx, cy, 200);
  await sleep(400);
  let after = await state();
  inter.wheelUntouchedScrollsPage = after.scrollY > before.scrollY && Math.abs(after.alt - before.alt) < 1e-6;
  await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); return true; })()`);
  await sleep(300);
  const r2 = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
  const mx = r2.x + r2.w / 2, my = r2.y + r2.h * 0.55;

  // Ctrl + wheel zooms without taking hold.
  before = await state();
  await wheel(mx, my, -240, 2 /* ctrl */);
  await sleep(300);
  after = await state();
  inter.ctrlWheelZooms = after.alt < before.alt;

  // A drag spins it (and takes hold).
  before = await state();
  await mouse('mouseMoved', mx, my, { button: 'none' });
  await mouse('mousePressed', mx, my);
  for (let i = 1; i <= 8; i++) { await mouse('mouseMoved', mx - i * 25, my); await sleep(16); }
  await mouse('mouseReleased', mx - 200, my);
  await sleep(900);
  after = await state();
  inter.dragSpins = Math.abs(after.lon - before.lon) > 1;

  // Now held: a plain wheel zooms, and the page does not scroll.
  before = await state();
  await mouse('mouseMoved', mx, my, { button: 'none' });
  await wheel(mx, my, -200);
  await sleep(300);
  after = await state();
  inter.wheelWhenHeldZooms = after.alt < before.alt && after.scrollY === before.scrollY;

  // A click on a country flies there and opens its card.
  await evaluate(`(async () => { const g = ${debugOf}; g.flyTo({ lat: 52.2, lon: 5.3, alt: 0.9 }); await new Promise(r => setTimeout(r, 2600)); return true; })()`);
  // Bare land: a point where the canvas, not a pin or a group, is under the pointer.
  const spot = await evaluate(`(async () => {
    const g = ${debugOf};
    for (let fy = 0.4; fy < 0.9; fy += 0.05) for (let fx = 0.3; fx < 0.8; fx += 0.05) {
      const x = ${r2.x} + ${r2.w} * fx, y = ${r2.y} + ${r2.h} * fy;
      const e = document.elementFromPoint(x, y);
      const hit = g.pickAt(x, y);
      if (e && e.classList.contains('world__globe') && hit && hit.country) return { x, y, country: hit.country };
    }
    return null;
  })()`);
  inter.countryUnderClick = spot?.country || null;
  await mouse('mouseMoved', spot.x, spot.y, { button: 'none' });
  await mouse('mousePressed', spot.x, spot.y);
  await mouse('mouseReleased', spot.x, spot.y);
  await sleep(3500);
  after = await state();
  inter.countryClickCard = after.card;
  await shot('15-country-click');

  // Activating a list entry flies to it and opens its card.
  const entry = await evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Portugal/.test(a.textContent)); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await mouse('mouseMoved', entry.x, entry.y, { button: 'none' });
  await mouse('mousePressed', entry.x, entry.y);
  await mouse('mouseReleased', entry.x, entry.y);
  await sleep(3500);
  after = await state();
  inter.listClickCard = after.card;
  inter.listClickCamera = { lat: Math.round(after.lat), lon: Math.round(after.lon) };
  inter.url = await evaluate('location.pathname');
  await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); return true; })()`);
  await shot('16-list-click-card');
  report.interaction = inter;

  report.drawMs = await evaluate(`(async () => { const g = ${debugOf}; return +g.drawMs.toFixed(3); })()`);
  report.console = logs;
} finally {
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
}
