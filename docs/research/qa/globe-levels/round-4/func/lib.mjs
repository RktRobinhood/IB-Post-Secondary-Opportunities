/* Client helpers for driver.mjs: the probes' vocabulary (real input events). */
const D = 'http://127.0.0.1:9372';
const BASE = process.env.PREVIEW || 'http://127.0.0.1:4321';
const post = async (p, j) => (await fetch(D + p, { method: 'POST', body: JSON.stringify(j || {}) })).json();
export const send = (method, params) => post('/send', { method, params });
export const ev = async (expr) => { const r = await post('/eval', { expr }); if (r && r.error) throw new Error(r.error); return r; };
export const shot = (name, clip = null) => post('/shot', { name, clip });
export const logs = () => post('/logs');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const G = `(await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe`;
export const g = (body) => ev(`(async () => { const g = ${G}.debug; ${body} })()`);

export const DESK = { width: 1366, height: 860, mobile: false };
export const PHONE = { width: 390, height: 844, mobile: true };
export async function setup({ width, height, mobile }, { dark = false, reduced = false } = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await send('Emulation.setEmulatedMedia', { features: [
    { name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' },
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ] });
}
export async function open(route, sel = '.world') {
  await send('Page.navigate', { url: `${BASE}${route}` });
  await sleep(1500);
  return ev(`(async () => {
    for (let i = 0; i < 100 && !document.querySelector('${sel}'); i++) await new Promise(r => setTimeout(r, 100));
    const f = document.querySelector('${sel}');
    const s = f.querySelector('.world__stage') || f;
    scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - Math.max(8, (innerHeight - s.offsetHeight) / 2)));
    for (let i = 0; i < 200 && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 1200));
    return f.dataset.globe + (f.dataset.globeOff ? ': ' + f.dataset.globeOff : '') + (f.hasAttribute('data-levels') ? ' levels' : '');
  })()`);
}
export const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
export const move = (x, y) => mouse('mouseMoved', x, y, { button: 'none' });
export const click = async (x, y, clickCount = 1) => { await move(x, y); await mouse('mousePressed', x, y, { clickCount }); await mouse('mouseReleased', x, y, { clickCount }); };
export const dblclick = async (x, y) => { await click(x, y, 1); await sleep(60); await click(x, y, 2); };
export const wheel = (x, y, deltaY, modifiers = 0) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, button: 'none', modifiers });
export const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
export async function pinch(cx, cy, from, to, steps = 8) {
  const pts = (d) => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }];
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(from) });
  for (let i = 1; i <= steps; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(from + (to - from) * i / steps) }); await sleep(30); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
export async function key(k, code = k, text) {
  const kc = { Escape: 27, '+': 187, '-': 189, '0': 48, ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, ArrowDown: 40, Tab: 9, Enter: 13, '=': 187 }[k] || 0;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: kc, text: text ?? (k.length === 1 ? k : undefined) });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: kc });
}
export const still = () => ev(`(async () => { const g = ${G}.debug; let last = ''; for (let i = 0; i < 100; i++) { await new Promise(r => setTimeout(r, 140)); const k = [g.view.lat, g.view.lon, g.view.alt].map(v => v.toFixed(4)).join(); if (k === last) return true; last = k; } return false; })()`);
export const stageRect = () => ev(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);

export const state = () => ev(`(async () => {
  const g = ${G}.debug;
  const vis = (e) => !e.hidden && e.offsetParent !== null && getComputedStyle(e).opacity > 0.05;
  const nodes = [...document.querySelectorAll('.world__cluster')].filter(vis).map((c) => ({ kind: c.dataset.kind, n: c.querySelector('.world__cluster-n').textContent, nation: c._nation || '', region: c._region || '', label: c.hasAttribute('data-label') ? c.querySelector('.world__cluster-label').textContent : '' }));
  const pins = [...document.querySelectorAll('.world__pin')].filter(vis).map((p) => ({ id: p.dataset.place, dim: p.hasAttribute('data-dim') }));
  const cards = document.querySelector('#results, .results, [data-results]');
  return {
    lv: { ...g.lv },
    trail: document.querySelector('.world__trail:not([hidden])')?.textContent.replace(/\\s+/g, ' ').trim() || '',
    card: document.querySelector('.world__card:not([hidden]) h3')?.textContent || null,
    cardMeta: document.querySelector('.world__card:not([hidden]) .world__card-meta')?.textContent || null,
    cardHref: document.querySelector('.world__card:not([hidden]) a.world__card-link')?.getAttribute('href') || null,
    nodes, pins: pins.length, dimPins: pins.filter((p) => p.dim).length,
    url: location.pathname + location.search + location.hash,
    hlen: history.length,
    alt: +g.view.alt.toFixed(3),
    close: g.close.state + '/' + g.close.active,
    reset: !document.querySelector('.world__btn[aria-label="Back to the whole view"]')?.hidden,
    zin: !document.querySelector('.world__btn[aria-label="Zoom in"]')?.disabled,
    zout: !document.querySelector('.world__btn[aria-label="Zoom out"]')?.disabled,
    count: document.getElementById('prog-count')?.parentElement?.textContent?.replace(/\\s+/g, ' ').trim() || null,
  };
})()`);
export const nodeAt = (pred) => ev(`(() => { const c = [...document.querySelectorAll('.world__cluster, .world__pin')].filter((c) => !c.hidden && c.offsetParent && getComputedStyle(c).opacity > 0.05).find(${pred}); if (!c) return null; const r = (c.querySelector('.world__cluster-n') || c.querySelector('.world__pin-dot')).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: (c.querySelector('.world__cluster-label') || c.querySelector('.world__pin-label'))?.textContent || '', place: c.dataset.place || '' }; })()`);
export const brief = (s) => `${s.lv.level}/${s.lv.region}/${s.lv.country} | trail="${s.trail}" | card=${s.card} [${s.cardMeta}] ${s.cardHref || ''} | pins=${s.pins} dim=${s.dimPins} | nodes=${s.nodes.length} | alt=${s.alt} close=${s.close} reset=${s.reset} +${s.zin} -${s.zout} | hlen=${s.hlen} | ${s.url} | count=${s.count}`;
