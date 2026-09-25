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

const ROUND = process.argv[2] || 'round-1-fixes';
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
const rectOf = (sel) => evaluate(`(() => { const e = document.querySelector('${sel}'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
const g = (body) => evaluate(`(async () => { const g = ${debugOf}; ${body} })()`);
const waitFor = (cond, ms = 12000) => g(`for (let i = 0; i < ${ms / 100}; i++) { if (${cond}) return true; await new Promise(r => setTimeout(r, 100)); } return false;`);

try {
  /* 1. Rest views, desktop */
  for (const [route, name] of [['/programmes/', '01-programmes-rest'], ['/europe/', '02-europe-rest'], ['/world/', '03-world-rest'], ['/destinations/nl/', '04-destination-nl-rest']]) {
    await open(route);
    report[route] = { globe: await globeReady() };
    report[route].rest = await g(`g.pause(); const r = g.rest; return { lat: +r.lat.toFixed(1), lon: +r.lon.toFixed(1), alt: +r.alt.toFixed(2) };`);
    /* Which places are on screen and facing at rest, and which are not. */
    report[route].pinsVisible = await evaluate(`[...document.querySelectorAll('.world__pin:not([hidden]) .world__pin-label, .world__cluster:not([hidden])')].length`);
    if (route === '/world/') {
      report[route].visibleAtRest = await evaluate(`[...document.querySelectorAll('.world__pin:not([hidden])')].map(p => p.dataset.place)
        .concat([...document.querySelectorAll('.world__cluster:not([hidden])')].flatMap(c => (c._members || []).map(m => m.id)))`);
      report[route].canada = await g(`const p = g.places.find(p => p.id === 'ca'); return p && { lat: p.lat, lon: p.lon, inCountry: g.pickAt ? null : null };`);
    }
    await shot(name);
  }

  /* 2. The cloud dive on /programmes/: from rest to Delft (a city) — the
        journey climbs through the deck, dives, then hands to the close map. */
  await open('/programmes/');
  await globeReady();
  await g(`const p = g.places.find(p => p.name === 'Delft'); g.goToPlace(p); g.pause(); return true;`);
  for (const [k, frac] of [['05-programmes-dive-climb', 0.35], ['06-programmes-dive-clouds', 0.72], ['07-programmes-dive-late', 0.86]]) {
    await g(`g.stepTo(${frac}); return true;`);
    await sleep(100);
    await shot(k);
  }
  await g(`g.stepTo(1); g.resume(); return true;`);
  report.programmesDive = { handedOff: await waitFor('g.close.active', 25000) };
  await waitFor('g.close.zoom > 11.3', 8000);
  await sleep(1500);
  report.programmesDive.zoom = await g(`return +(g.close.zoom || 0).toFixed(2);`);
  report.programmesDive.seam = await g(`return g.seam();`);
  await shot('08-programmes-delft-city');

  /* 3. Stale card: zoom far out with the − button and the card must close */
  await g(`document.documentElement.setAttribute('data-motion','reduced'); g.handBack(); g.flyTo({ ...g.view, alt: 0.4 }); return true;`);
  await sleep(400);
  const before = await evaluate(`!document.querySelector('.world__card').hidden`);
  await g(`g.flyTo({ ...g.view, alt: 2.4 }); return true;`);
  await sleep(500);
  report.staleCard = { openBefore: before, closedAfterZoomOut: await evaluate(`document.querySelector('.world__card').hidden`) };
  await evaluate(`document.documentElement.removeAttribute('data-motion')`);

  /* 4. The Denmark group: clicking it dives to split it, and never calls
        twelve cities "one spot". */
  await open('/programmes/');
  await globeReady();
  const cl = await evaluate(`(() => { const c = [...document.querySelectorAll('.world__cluster:not([hidden])')].sort((a, b) => (b._members?.length || 0) - (a._members?.length || 0))[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, n: c._members.length }; })()`);
  if (cl) {
    await click(cl.x, cl.y);
    await sleep(3200);
    report.groupClick = { members: cl.n, card: await evaluate(`document.querySelector('.world__card:not([hidden]) .world__card-meta')?.textContent || ''`) };
    await shot('09-programmes-group-split');
  }

  /* 5. /europe/: Denmark is a Destination with its own section */
  await open('/europe/');
  await globeReady();
  await g(`document.documentElement.setAttribute('data-motion','reduced'); g.goToCountry(g.country('dk')); return true;`);
  await sleep(900);
  report.denmarkCard = await evaluate(`[...document.querySelectorAll('.world__card:not([hidden]) .world__card-go, .world__card:not([hidden]) .world__card-cue')].map(a => a.textContent + (a.href ? ' -> ' + new URL(a.href).pathname : ''))`);
  await evaluate(`document.documentElement.removeAttribute('data-motion')`);
  await shot('10-europe-denmark-card');

  /* 6. Close map: street level on a campus, from the Netherlands page */
  await open('/destinations/nl/');
  await globeReady();
  await g(`const p = g.places.find(p => /Delft/.test(p.name)); g.goToPlace(p); return true;`);
  report.campusDive = { handedOff: await waitFor('g.close.active', 15000) };
  await waitFor('g.close.zoom > 14.7', 8000);
  await sleep(2000);
  report.campusDive.zoom = await g(`return +(g.close.zoom || 0).toFixed(2);`);
  await shot('11-nl-tu-delft-street');
  // Zoom back out with the button until the globe has it again.
  report.campusDive.handBack = await g(`
    const btn = document.querySelector('.world__btn[aria-label="Zoom out"]');
    for (let i = 0; i < 16 && g.close.active; i++) { btn.click(); await new Promise(r => setTimeout(r, 600)); }
    return { active: g.close.active, alt: +g.view.alt.toFixed(3) };`);
  await sleep(600);
  await shot('12-nl-back-on-globe');

  /* 7. List click: the card is not under the masthead */
  await open('/programmes/');
  await globeReady();
  await evaluate(`scrollTo(0, document.querySelector('.world__list').getBoundingClientRect().top + scrollY - 200)`);
  const entry = await evaluate(`(() => { const a = [...document.querySelectorAll('.world__list a')].find(a => /Maastricht/.test(a.textContent)); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await click(entry.x, entry.y);
  await sleep(1500);
  report.listClick = await evaluate(`(() => { const s = document.querySelector('.world__stage').getBoundingClientRect(); const c = document.querySelector('.world__card:not([hidden]) h3'); const m = document.querySelector('.masthead, header'); return { stageTop: Math.round(s.top), cardTitleTop: c ? Math.round(c.getBoundingClientRect().top) : null, mastheadBottom: m ? Math.round(m.getBoundingClientRect().bottom) : null }; })()`);
  await sleep(2500);
  await shot('13-list-click-maastricht');

  /* 8. Dark theme */
  await open('/europe/', { dark: true });
  await evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
  await globeReady();
  await g(`g.pause(); return true;`);
  await shot('14-europe-dark');

  /* 9. Phone: rest, a pin card whose title and action are visible, the pin
        above the card, and a hold that lets go by itself. */
  for (const [route, name] of [['/programmes/', '15-phone-programmes'], ['/world/', '16-phone-world']]) {
    await open(route, { width: 390, height: 844, mobile: true });
    await globeReady();
    await sleep(600);
    await shot(name);
  }
  await open('/europe/', { width: 390, height: 844, mobile: true });
  await globeReady();
  const pin = await evaluate(`(() => { const p = [...document.querySelectorAll('.world__pin:not([hidden])')].find(p => /Portugal|Spain|Italy/.test(p.textContent)) || document.querySelector('.world__pin:not([hidden])'); const r = p.getBoundingClientRect(); return { x: r.left, y: r.top, id: p.dataset.place }; })()`);
  await tap(pin.x, pin.y);
  await sleep(3000);
  report.phoneCard = await evaluate(`(() => {
    const s = document.querySelector('.world__stage').getBoundingClientRect();
    const card = document.querySelector('.world__card:not([hidden])');
    if (!card) return { open: false };
    const c = card.getBoundingClientRect();
    const t = card.querySelector('h3').getBoundingClientRect();
    const go = card.querySelector('.world__card-go');
    const pin = document.querySelector('.world__pin[data-place="${pin.id}"]').getBoundingClientRect();
    return {
      open: true,
      titleVisible: t.top >= c.top && t.bottom <= c.bottom,
      actionVisible: !!go && go.getBoundingClientRect().bottom <= c.bottom + 1,
      innerScroll: card.scrollHeight > card.clientHeight + 1,
      pinAboveCard: pin.top + pin.height / 2 < c.top,
      engaged: document.querySelector('.world__stage').dataset.engaged === 'true',
    };
  })()`);
  await shot('17-phone-card');
  await sleep(4500);
  report.phoneCard.releasedAfter4s = await evaluate(`document.querySelector('.world__stage').dataset.engaged !== 'true' && document.querySelector('.world__stage').style.touchAction === 'pan-y'`);

  /* 10. Reduced motion: a flight is instant */
  await open('/europe/');
  await globeReady();
  report.reducedMotion = await g(`
    document.documentElement.setAttribute('data-motion', 'reduced');
    g.flyTo({ lat: 10, lon: 100, alt: 1.2 });
    const v = { ...g.view };
    document.documentElement.removeAttribute('data-motion');
    return Math.abs(v.lat - 10) < 1e-6 && Math.abs(v.lon - 100) < 1e-6 && Math.abs(v.alt - 1.2) < 1e-6;`);

  /* 11. Interaction with real input (as round 0) */
  const rect = await rectOf('.world__stage');
  const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  const state = () => g(`return { alt: g.view.alt, lon: g.view.lon, scrollY };`);
  const inter = {};
  let b0 = await state();
  await wheel(cx, cy, 200);
  await sleep(400);
  let a0 = await state();
  inter.wheelUntouchedScrollsPage = a0.scrollY > b0.scrollY && Math.abs(a0.alt - b0.alt) < 1e-6;
  await evaluate(`(() => { const s = document.querySelector('.world__stage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); })()`);
  await sleep(300);
  const r2 = await rectOf('.world__stage');
  const mx = r2.x + r2.w / 2, my = r2.y + r2.h * 0.55;
  b0 = await state();
  await mouse('mouseMoved', mx, my, { button: 'none' });
  await mouse('mousePressed', mx, my);
  for (let i = 1; i <= 8; i++) { await mouse('mouseMoved', mx - i * 25, my); await sleep(16); }
  await mouse('mouseReleased', mx - 200, my);
  await sleep(900);
  a0 = await state();
  inter.dragSpins = Math.abs(a0.lon - b0.lon) > 1;
  report.interaction = inter;

  /* 12. The flat fallback */
  await open('/programmes/', { query: '?map=flat' });
  report.flat = await globeReady();
  await shot('18-flat-fallback');

  report.console = logs;
} finally {
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
}
