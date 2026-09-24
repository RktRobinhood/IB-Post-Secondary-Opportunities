/* Round-1 critic harness: a thin CDP driver (same approach as ../shoot.mjs). */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const OUT = import.meta.dirname;
export const BASE = process.env.PREVIEW || 'http://localhost:4398';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function launch({ gpu = false, port = 9340 } = {}) {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'globe-crit-'));
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
  ws.addEventListener('message', (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); } else if (msg.method) for (const l of [...listeners]) l(msg); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  listeners.push((m) => {
    if (m.method === 'Runtime.consoleAPICalled') logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
    if (m.method === 'Log.entryAdded') logs.push(`log ${m.params.entry.level}: ${m.params.entry.text} ${m.params.entry.url || ''}`);
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  await send('Page.bringToFront'); await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const evaluate = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const open = async (route, { width = 1280, height = 800, mobile = false, dark = false, reduced = false, dpr = 1 } = {}) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
    const loaded = new Promise((r) => listeners.push(function once(m) { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); } }));
    await send('Page.navigate', { url: `${BASE}${route}` }); await loaded;
  };
  const globeReady = () => evaluate(`(async () => { const f = document.querySelector('.world'); const s = f.querySelector('.world__stage');
    scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - Math.max(8, (innerHeight - s.offsetHeight) / 2)));
    for (let i = 0; i < 150 && f.dataset.globe !== 'on' && f.dataset.globe !== 'off'; i++) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 700)); return f.dataset.globe; })()`);
  const settle = (ms = 600) => evaluate(`new Promise((r) => { const t0 = performance.now(); (function f() { if (performance.now() - t0 > ${ms}) r(true); else requestAnimationFrame(f); })(); })`);
  const shot = async (name, clip) => { await settle(); if (clip) { const sy = await evaluate('scrollY'); clip = { ...clip, y: clip.y + sy }; } const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }); await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(r.data, 'base64')); console.log(`  ${name}.png`); };
  const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
  const wheel = (x, y, deltaY, modifiers = 0) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY, modifiers });
  const stageRect = () => evaluate(`(() => { const r = document.querySelector('.world__stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
  const G = `(await import('/assets/js/map.js')).enhanceWorld(document.querySelector('.world')).globe.debug`;
  const close = () => { ws.close(); chrome.kill(); };
  return { send, evaluate, open, globeReady, settle, shot, mouse, wheel, stageRect, G, logs, close, listeners };
}
