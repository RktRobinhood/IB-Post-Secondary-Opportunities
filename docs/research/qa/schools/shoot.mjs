// Shoots school pages (#43) for the critic: desktop and phone, light and dark,
// full page. CDP, no dependencies. The browser profile lives under
// PROFILE_ROOT (default D:/ibp-tmp — never C:) and is deleted afterwards.
//
//   node docs/research/qa/schools/shoot.mjs <out-dir> <base-url> <path> [<path> …]
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const [OUT, BASE, ...PATHS] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9000 + Math.floor(Math.random() * 900);
const ROOT = process.env.PROFILE_ROOT || 'D:/ibp-tmp';
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(ROOT, { recursive: true });
const profile = await fs.mkdtemp(path.join(ROOT, 'school-shoot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); up = true; } catch { await sleep(200); } }
  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); } else if (msg.method) for (const l of listeners) l(msg); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); return r.result?.value; };
  await send('Page.enable'); await send('Runtime.enable');

  for (const [mode, w, h, mobile] of [['desktop', 1280, 900, false], ['phone', 390, 844, true]]) {
    for (const scheme of ['light', 'dark']) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
      for (const p of PATHS) {
        const loaded = new Promise((r) => { const l = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
        await send('Page.navigate', { url: BASE.replace(/\/$/, '') + p });
        await Promise.race([loaded, sleep(20000)]);
        // Walk the page so lazy images and reveals fire, then come back up.
        await ev(`(async()=>{const H=document.documentElement.scrollHeight;for(let y=0;y<H;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}scrollTo(0,0);await Promise.all([...document.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,6000)})));return 1})()`);
        await sleep(600);
        const height = Math.min(await ev('document.documentElement.scrollHeight'), 9000);
        const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height, scale: 1 } });
        const name = `${p.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home'}--${mode}-${scheme}.jpg`;
        await fs.writeFile(path.join(OUT, name), Buffer.from(data, 'base64'));
        console.log('shot', name);
      }
    }
  }
  ws.close();
} finally {
  chrome.kill();
  await sleep(800);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
