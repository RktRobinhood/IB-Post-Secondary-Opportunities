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

const ROUND = process.argv[2] || 'round-2-fixes';
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
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
const wheel = (x, y, deltaY, modifiers = 0) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, modifiers });
const click = async (x, y) => { await mouse('mouseMoved', x, y, { button: 'none' }); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
const g = (body) => evaluate(`(async () => { const g = ${debugOf}; ${body} })()`);
const waitFor = (cond, ms = 15000) => g(`for (let i = 0; i < ${ms / 100}; i++) { if (${cond}) return true; await new Promise(r => setTimeout(r, 100)); } return false;`);

/* Bytes by kind, from the protocol (cross-origin tiles report no Resource Timing size). */
const bytes = new Map();
listeners.push((m) => {
  if (m.method === 'Network.responseReceived') bytes.set(m.params.requestId, { url: m.params.response.url, n: 0 });
  if (m.method === 'Network.loadingFinished' && bytes.has(m.params.requestId)) bytes.get(m.params.requestId).n = m.params.encodedDataLength;
});
const kind = (u) => /maplibre-gl/.test(u) ? 'maplibre' : /openfreemap/.test(u) ? 'street tiles+glyphs' : /eox\.at/.test(u) ? 'satellite' : /img\/globe/.test(u) ? 'globe textures' : /geo\//.test(u) ? 'geo' : 'page+other';
const tally = () => { const t = {}; for (const { url, n } of bytes.values()) { const k = kind(url); t[k] = (t[k] || 0) + Math.round(n / 1024); } bytes.clear(); return t; };
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

/* A page-side sampler: every frame's camera, the longest spell with no camera
   change (a freeze), the longest gap between frames (jank), and long tasks. */
const startSampler = () => evaluate(`(() => {
  const g0 = window.__g;
  window.__samples = []; window.__long = []; const gen = window.__gen = (window.__gen || 0) + 1;
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ type: 'longtask' }); } catch {}
  const t0 = performance.now();
  (function f() { const g = window.__g; window.__samples.push([performance.now() - t0, g.view.alt, g.close.active, g.close.zoom || 0]); if (window.__gen === gen && performance.now() - t0 < 12000) requestAnimationFrame(f); })();
  return true;
})()`);
const readSampler = () => evaluate(`(() => {
  const all = window.__samples;
  const arriveAt = all.findIndex((r, i) => i > 0 && r[2] && Math.abs(r[3] - (window.__targetZoom || 99)) < 0.05);
  /* Stillness after arrival is not a freeze: measure up to the arrival. */
  const s = arriveAt > 0 ? all.slice(0, arriveAt + 1) : all;
  let freeze = 0, start = 0, jank = 0;
  for (let i = 1; i < s.length; i++) {
    jank = Math.max(jank, s[i][0] - s[i - 1][0]);
    const same = Math.abs(s[i][1] - s[i - 1][1]) < 1e-5 && Math.abs(s[i][3] - s[i - 1][3]) < 1e-3;
    if (!same) start = s[i][0]; else freeze = Math.max(freeze, s[i][0] - start);
  }
  const arrive = arriveAt;
  return { frames: s.length, longestFreezeMs: Math.round(freeze), longestFrameGapMs: Math.round(jank), longTasks: window.__long.filter(d => d > 50).sort((a, b) => b - a).slice(0, 6), arrivedMs: arrive >= 0 ? Math.round(all[arrive][0]) : null, handOffMs: Math.round((all.find(r => r[2]) || [NaN])[0]) };
})()`);
const expose = () => g(`window.__g = g; return true;`);

try {
  /* 1. Rest: what each page loads with no gesture at all (cold cache) */
  for (const [route, name, opts] of [['/programmes/', '01-programmes-rest'], ['/destinations/nl/', '02-nl-rest'], ['/world/', '03-world-rest'], ['/destinations/nl/', '04-phone-nl-rest', { width: 390, height: 844, mobile: true }]]) {
    bytes.clear();
    await open(route, opts);
    const state = await globeReady();
    await sleep(3000);
    report[name] = { state, bytesAtRestKB: tally(), close: await g(`return g.close;`) };
    await shot(name);
  }

  /* 2. The dive, measured: /destinations/nl/ → TU Delft, cold */
  await open('/destinations/nl/');
  await globeReady();
  await expose();
  await evaluate(`window.__targetZoom = 15`);
  await startSampler();
  await g(`const p = g.places.find(p => /Delft/.test(p.name)); g.goToPlace(p); return true;`);
  await waitFor('g.close.active && g.close.zoom > 14.9', 14000);
  await sleep(600);
  report.diveNlDelft = await readSampler();
  report.diveNlDelft.bytesKB = tally();
  await shot('05-nl-tu-delft-street');

  /* 3. Bug A: wheel over the pin while in the close map — the page must not move */
  const pin = await evaluate(`(() => { const p = [...document.querySelectorAll('.world__pin:not([hidden])')].find(p => /Delft/.test(p.textContent)); const r = p.getBoundingClientRect(); return { x: r.left + 2, y: r.top + 2 }; })()`);
  /* Take hold first, as a reader who has been zooming has: a click on bare map. */
  const st = await evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.right - 60, y: r.bottom - 60 }; })()`);
  await click(st.x, st.y);
  await sleep(400);
  const y0 = await evaluate('scrollY');
  const z0 = await g(`return g.close.zoom;`);
  await mouse('mouseMoved', pin.x, pin.y, { button: 'none' });
  for (let i = 0; i < 3; i++) { await wheel(pin.x, pin.y, 120); await sleep(120); }
  await sleep(500);
  report.wheelOverPinInClose = { pageMovedPx: (await evaluate('scrollY')) - y0, zoomChange: +((await g(`return g.close.zoom;`)) - z0).toFixed(2) };

  /* 4. Reset from street level: the camera climbs out continuously */
  await g(`const p = g.places.find(p => /Delft/.test(p.name)); g.goToPlace(p, { push: false }); return true;`);
  await waitFor('g.close.active && g.close.zoom > 14.9', 8000);
  await sleep(800);
  await startSampler();
  await evaluate(`document.querySelector('.world__btn[aria-label="Back to the whole view"]').click()`);
  await sleep(4500);
  report.resetFromStreet = await evaluate(`(() => {
    const s = window.__samples; let worstJump = 0;
    for (let i = 1; i < s.length; i++) worstJump = Math.max(worstJump, s[i][1] / Math.max(1e-6, s[i - 1][1]));
    return { worstAltRatioInOneFrame: +worstJump.toFixed(2), endAlt: +s[s.length - 1][1].toFixed(2), endClose: s[s.length - 1][2] };
  })()`);
  await shot('06-nl-after-reset');

  /* 5. /programmes/: Delft (institution) then Aarhus (city) — the card stays, Aarhus is a city */
  await open('/programmes/');
  await globeReady();
  await expose();
  await evaluate(`window.__targetZoom = 15`);
  await startSampler();
  await g(`const p = g.places.find(p => p.name === 'Delft'); g.goToPlace(p); return true;`);
  await waitFor('g.close.active && g.close.zoom > 14.9', 15000);
  await sleep(600);
  report.diveProgrammesDelft = await readSampler();
  await shot('07-programmes-delft');
  await evaluate(`window.__targetZoom = 11.5`);
  await startSampler();
  await g(`const p = g.places.find(p => p.name === 'Aarhus'); g.goToPlace(p); return true;`);
  await waitFor('g.close.active && Math.abs(g.close.zoom - 11.5) < 0.1', 15000);
  await sleep(800);
  report.delftToAarhus = await readSampler();
  report.delftToAarhus.precision = await g(`return g.places.find(p => p.name === 'Aarhus').precision;`);
  report.delftToAarhus.zoom = await g(`return +(g.close.zoom || 0).toFixed(2);`);
  report.delftToAarhus.card = await evaluate(`document.querySelector('.world__card:not([hidden]) h3')?.textContent || null`);
  await shot('08-programmes-aarhus');

  /* 6. History: Back returns to Delft's card, Back again to no card; the page never leaves */
  const path0 = await evaluate('location.pathname');
  await evaluate('history.back()');
  await sleep(4500);
  const afterOne = await evaluate(`({ hash: location.hash, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null })`);
  await evaluate('history.back()');
  await sleep(5000);
  const afterTwo = await evaluate(`({ hash: location.hash, card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null, path: location.pathname })`);
  report.history = { afterOneBack: afterOne, afterTwoBacks: afterTwo, stayedOnPage: afterTwo.path === path0, closeActive: await g(`return g.close.active;`), alt: await g(`return +g.view.alt.toFixed(2);`) };
  await shot('09-programmes-after-back');

  /* 7. Group click (bug D): no group with the same members remains, and it did not end further out */
  await open('/programmes/');
  await globeReady();
  const cl = await evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, ids: c._members.map(m => m.id).sort().join(' ') }; })()`);
  const altBefore = await g(`return g.view.alt;`);
  await click(cl.x, cl.y);
  await sleep(6000);
  report.groupClick = await g(`
    const same = [...document.querySelectorAll('.world__cluster:not([hidden])')].some(c => c._members && c._members.map(m => m.id).sort().join(' ') === ${JSON.stringify(cl.ids)});
    return { members: ${JSON.stringify(cl.ids)}.split(' ').length, sameGroupStillShown: same, altBefore: ${altBefore}, altAfter: +g.view.alt.toFixed(3), close: g.close.active };`);
  await shot('10-programmes-group-click');

  /* 8. Phone: tap the biggest group on /programmes/ — it must not end further out */
  await open('/programmes/', { width: 390, height: 844, mobile: true });
  await globeReady();
  const pc = await evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, n: c._members.length }; })()`);
  const pAlt = await g(`return g.view.alt;`);
  await tap(pc.x, pc.y);
  await sleep(6500);
  report.phoneGroupTap = { members: pc.n, altBefore: +pAlt.toFixed(3), altAfter: await g(`return +g.view.alt.toFixed(3);`), close: await g(`return g.close.active;`) };
  await shot('11-phone-programmes-group');

  /* 9. Phone close map: attribution collapsed, one ⓘ */
  await open('/destinations/nl/', { width: 390, height: 844, mobile: true });
  await globeReady();
  await g(`const p = g.places.find(p => /Delft/.test(p.name)); g.goToPlace(p); return true;`);
  await waitFor('g.close.active && g.close.zoom > 14.9', 15000);
  await sleep(1200);
  report.phoneAttribution = await evaluate(`(() => {
    const a = document.querySelector('.maplibregl-ctrl-attrib'); const s = document.querySelector('.world__stage').getBoundingClientRect();
    const b = document.querySelector('.maplibregl-ctrl-attrib-button'); const cs = b && getComputedStyle(b);
    const r = a.getBoundingClientRect();
    return { expanded: a.classList.contains('maplibregl-compact-show'), coversPct: Math.round(100 * r.width * r.height / (s.width * s.height)), buttonRepeat: cs?.backgroundRepeat };
  })()`);
  await shot('12-phone-nl-street');

  /* 10. Reduced motion and the flat fallback */
  await open('/europe/');
  await globeReady();
  report.reducedMotion = await g(`
    document.documentElement.setAttribute('data-motion', 'reduced');
    g.flyTo({ lat: 10, lon: 100, alt: 1.2 });
    const v = { ...g.view };
    document.documentElement.removeAttribute('data-motion');
    return Math.abs(v.lat - 10) < 1e-6 && Math.abs(v.alt - 1.2) < 1e-6;`);
  await open('/programmes/', { query: '?map=flat' });
  report.flat = await globeReady();
  report.console = logs.filter((l) => !/READ-usage buffer/.test(l));
} finally {
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
}
