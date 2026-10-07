/**
 * Functionality critic's probe driver (round 1). One headless Chrome kept
 * alive, driven over HTTP so scenarios can be tried one at a time:
 *
 *   PROFILE_ROOT=D:/ibp-tmp node driver.mjs          (listens on :9352)
 *   POST /send  {"method": "...", "params": {...}}    a raw DevTools call
 *   POST /eval  {"expr": "..."}                       Runtime.evaluate (await, by value)
 *   POST /shot  {"name": "x", "clip": null}           JPEG into this folder
 *   POST /quit
 *
 * Same launch flags as ../../shoot.mjs; Chrome on port 9351.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const OUT = import.meta.dirname;
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9361;
const profile = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || 'D:/ibp-tmp', 'func-'));
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
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const logs = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method === 'Runtime.exceptionThrown') logs.push(`exception: ${msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text}`);
  else if (msg.method === 'Runtime.consoleAPICalled' && /error|warn/.test(msg.params.type)) logs.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
await send('Runtime.enable');
await send('Page.enable');
await send('Page.bringToFront');
await send('Emulation.setFocusEmulationEnabled', { enabled: true });

const server = http.createServer(async (req, res) => {
  let body = '';
  for await (const c of req) body += c;
  const j = body ? JSON.parse(body) : {};
  let out;
  try {
    if (req.url === '/send') out = await send(j.method, j.params || {});
    else if (req.url === '/eval') {
      const r = await send('Runtime.evaluate', { expression: j.expr, awaitPromise: true, returnByValue: true });
      out = r.exceptionDetails ? { error: r.exceptionDetails.exception?.description || r.exceptionDetails.text } : r.result.value;
    } else if (req.url === '/shot') {
      const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, ...(j.clip ? { clip: { ...j.clip, scale: 1 } } : {}) });
      await fs.writeFile(path.join(OUT, `${j.name}.jpg`), Buffer.from(r.data, 'base64'));
      out = `${j.name}.jpg`;
    } else if (req.url === '/logs') { out = logs.splice(0); }
    else if (req.url === '/quit') {
      res.end('bye');
      ws.close(); chrome.kill(); await sleep(800);
      await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
      process.exit(0);
    }
  } catch (e) { out = { error: String(e.message || e) }; }
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(out ?? null));
});
server.listen(9362, '127.0.0.1', () => console.log('driver on 9362'));
