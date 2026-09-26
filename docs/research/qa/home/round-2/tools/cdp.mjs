/* Round-4 critic harness (copied from round-2): a thin CDP driver against the LIVE site (same approach as ../shoot.mjs, ../round-1/cdp.mjs). */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const OUT = process.env.OUT || import.meta.dirname;
export const ORIGIN = process.env.ORIGIN || 'https://rktrobinhood.github.io';
export const BASEPATH = process.env.BASEPATH ?? '/IB-Post-Secondary-Opportunities';
export const BASE = ORIGIN + BASEPATH;
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ gpu = true, port = 9360, cpuThrottle = 0 } = {}) {
  const profile = await fs.mkdtemp('D:/ibp-tmp/home-crit2-');
  const flags = ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', '--ignore-gpu-blocklist'];
  if (gpu) flags.push('--use-angle=d3d11', '--enable-gpu', '--enable-gpu-rasterization');
  else flags.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  const chrome = spawn(CHROME, [...flags, 'about:blank'], { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 50 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(200); } }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0; const pending = new Map(); const listeners = []; const logs = [];
  ws.addEventListener('message', (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
    else if (msg.method) for (const l of [...listeners]) l(msg);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  listeners.push((m) => {
    if (m.method === 'Runtime.consoleAPICalled') logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
    if (m.method === 'Log.entryAdded') logs.push(`log ${m.params.entry.level}: ${m.params.entry.text} ${m.params.entry.url || ''}`);
  });
  /* Bytes: every finished response. */
  const net = []; const reqUrl = new Map();
  listeners.push((m) => {
    if (m.method === 'Network.requestWillBeSent') reqUrl.set(m.params.requestId, m.params.request.url);
    if (m.method === 'Network.loadingFinished') net.push({ url: reqUrl.get(m.params.requestId) || '?', bytes: m.params.encodedDataLength, t: Date.now() });
    if (m.method === 'Network.loadingFailed' && !m.params.canceled) logs.push(`netfail: ${m.params.errorText} ${reqUrl.get(m.params.requestId)}`);
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Page.bringToFront'); await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  if (cpuThrottle) await send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const open = async (route, { width = 1280, height = 800, mobile = false, dark = false, reduced = false, dpr = 1, query = '' } = {}) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
    const loaded = new Promise((r) => listeners.push(function once(m) { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); } }));
    net.length = 0;
    await send('Page.navigate', { url: `${BASE}${route}${query}` }); await loaded;
  };
  const keyOf = (u) => {
    let url; try { url = new URL(u); } catch { return u; }
    if (url.origin !== ORIGIN) return url.host + (/\/\d+\/\d+\/\d+/.test(url.pathname) ? ' (tiles)' : url.pathname.replace(/\/[^/]*\.pbf$/, '/*.pbf'));
    return url.pathname.replace(BASEPATH, '');
  };
  const bytes = (since = 0) => {
    const rows = net.filter((r) => r.t >= since);
    const by = {};
    for (const r of rows) { const k = keyOf(r.url); by[k] = (by[k] || 0) + r.bytes; }
    const sorted = Object.fromEntries(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round(v / 1024) + ' kB']));
    return { totalKB: Math.round(rows.reduce((s, r) => s + r.bytes, 0) / 1024), n: rows.length, by: sorted };
  };
  const globeReady = () => evaluate(`(async () => { const f = document.querySelector('.world'); if (!f) return 'no map'; const s = f.querySelector('.world__stage');
    scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - Math.max(8, (innerHeight - s.offsetHeight) / 2)));
    for (let i = 0; i < 200 && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 900)); return f.dataset.globe; })()`);
  const settle = (ms = 600) => evaluate(`new Promise((r) => { const t0 = performance.now(); (function f() { if (performance.now() - t0 > ${ms}) r(true); else requestAnimationFrame(f); })(); })`);
  const shot = async (name, { clip = null, fmt = 'png' } = {}) => {
    await settle();
    if (clip) { const sy = await evaluate('scrollY'); clip = { ...clip, y: clip.y + sy }; }
    const r = await send('Page.captureScreenshot', { format: fmt, ...(fmt === 'jpeg' ? { quality: 85 } : {}), ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
    await fs.writeFile(path.join(OUT, `${name}.${fmt === 'jpeg' ? 'jpg' : 'png'}`), Buffer.from(r.data, 'base64'));
    console.log(`  ${name}`);
  };
  const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
  const click = async (x, y) => { await mouse('mouseMoved', x, y, { button: 'none' }); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
  const wheel = (x, y, deltaY, modifiers = 0) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, modifiers });
  const touch = (type, pts) => send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const tap = async (x, y) => { await touch('touchStart', [{ x, y }]); await sleep(60); await touch('touchEnd', []); };
  const stageRect = () => evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
  const G = `(await import('${BASE}/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug`;
  const g = (body) => evaluate(`(async () => { const g = ${G}; ${body} })()`);
  /* Frame recorder in the page: rAF gaps and long tasks until stopFrames(). */
  const startFrames = () => evaluate(`(() => { window.__fr = { gaps: [], long: [], t: performance.now() }; let last = 0;
    (function f(n) { if (!window.__fr) return; if (last) window.__fr.gaps.push(n - last); last = n; requestAnimationFrame(f); })(performance.now());
    try { window.__po?.disconnect(); window.__po = new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__fr?.long.push({ at: Math.round(e.startTime - window.__fr.t), ms: Math.round(e.duration) }); }); window.__po.observe({ type: 'longtask' }); } catch {}
    return 1; })()`);
  const stopFrames = () => evaluate(`(() => { const f = window.__fr; window.__fr = null; const s = [...f.gaps].sort((a, b) => a - b);
    const q = (p) => s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1) : null;
    return { n: s.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: s.length ? +s[s.length - 1].toFixed(1) : null, over50: s.filter(x => x > 50).length, long: f.long }; })()`);
  const close = () => { try { ws.close(); } catch {} chrome.kill(); };
  return { send, evaluate, open, globeReady, settle, shot, mouse, click, wheel, touch, tap, stageRect, G, g, logs, close, listeners, bytes, startFrames, stopFrames };
}
