/**
 * Round 6 planner shots (issue #42): a profile set in the planner, then the
 * cards that show this round's fixes, on a phone (390 px) and on desktop.
 *
 *   DIST_DIR=<root-based build> PORT=4461 node scripts/serve.mjs   # another shell
 *   BASE_URL=http://localhost:4461 node docs/research/qa/conversion/round-6/shoot-planner.mjs
 *
 * Headless Chrome over the DevTools protocol, no dependency, as ../shoot.mjs.
 * CHROME, DEVTOOLS_PORT and PROFILE_ROOT as there. Writes JPEGs next to this
 * file and shots.json (each shot's visible text).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const OUT = import.meta.dirname;
const BASE = process.env.BASE_URL || 'http://localhost:4461';
const CHROME = process.env.CHROME || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const DEVTOOLS = Number(process.env.DEVTOOLS_PORT || 9336);

const profileDir = await fs.mkdtemp(path.join(process.env.PROFILE_ROOT || os.tmpdir(), 'r6-shoot-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DEVTOOLS}`, `--user-data-dir=${profileDir}`,
  '--hide-scrollbars', '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${DEVTOOLS}/json/version`)).json(); } catch { await sleep(200); }
}
if (!version) throw new Error('Chrome did not start');
const target = await (await fetch(`http://127.0.0.1:${DEVTOOLS}/json/new?about:blank`, { method: 'PUT' })).json();
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
  } else if (msg.method) for (const l of listeners) l(msg);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const errors = [];
listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
await send('Runtime.enable');
await send('Page.enable');

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

const S = (list) => list.map(([subject, level, grade]) => ({ subject, level, grade }));
/* The round-4 critic's profiles (round-4/planner-profiles.json), as the planner stores them. */
const PROFILES = {
  p1: { totalPoints: 34, applicantGroup: 'eu-eea-ch', award: 'diploma', subjects: S([['language-a-other', 'HL', 6], ['english-b', 'SL', 5], ['history', 'HL', 6], ['economics', 'HL', 6], ['biology', 'SL', 5], ['mathematics-ai', 'SL', 5]]) },
  p5: { totalPoints: 38, applicantGroup: 'eu-eea-ch', award: 'diploma', subjects: S([['language-a-other', 'SL', 6], ['english-b', 'SL', 4], ['economics', 'SL', 6], ['physics', 'HL', 7], ['chemistry', 'HL', 6], ['mathematics-aa', 'HL', 7]]) },
};

async function openPlanner(key, { width, height, mobile }) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const loaded = () => new Promise((r) => listeners.push(function once(m) {
    if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(once), 1); r(); }
  }));
  let l = loaded();
  await send('Page.navigate', { url: `${BASE}/planner/` });
  await l;
  await evaluate(`localStorage.setItem('ibp-profile-v2', ${JSON.stringify(JSON.stringify(PROFILES[key]))}); true`);
  l = loaded();
  await send('Page.reload', { ignoreCache: true });
  await l;
  await sleep(800);
}

const shots = {};
/** Capture a region from an element's top, `height` tall (viewport-wide). */
async function shot(name, selector, { height = 844, pad = 8, whole = false } = {}) {
  const box = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, vw: innerWidth, text: el.innerText };
  })()`);
  if (!box) { console.log(`  MISSING ${selector} for ${name}`); return; }
  const clip = whole
    ? { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.w + pad * 2, height: Math.min(box.h + pad * 2, 3000), scale: 1 }
    : { x: 0, y: Math.max(0, box.y - pad), width: box.vw, height, scale: 1 };
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72, clip, captureBeyondViewport: true });
  await fs.writeFile(path.join(OUT, `${name}.jpg`), Buffer.from(r.data, 'base64'));
  shots[name] = box.text;
  console.log(`  ${name}.jpg`);
}

/** Open a card's "Why this result" and every reason's "more", and tag it. */
const openCard = (id, tag) => evaluate(`(() => {
  const find = () => [...document.querySelectorAll('#p-results > li')].find((x) => x.querySelector('a[href*="${id}"]'));
  // "Does not currently meet" is hidden by default: show it when the card is one.
  if (!find()) document.querySelector('.chip[data-show="does-not-currently-meet"][aria-pressed="false"]')?.click();
  const li = find();
  if (!li) return false;
  li.id = '${tag}';
  li.querySelector('details.acc').open = true;
  return true;
})()`);

const PHONE = { width: 390, height: 844, mobile: true };
const DESKTOP = { width: 1280, height: 900, mobile: false };

try {
  // P1 on a phone, as a student first sees it: count, chips, the one-line legend.
  await openPlanner('p1', PHONE);
  await shot('p1-phone-top', '#p-count');
  await evaluate(`document.getElementById('p-meaning').open = true; true`);
  await shot('p1-phone-meaning-open', '#p-meaning', { whole: true });
  // A "one of" missing two subjects: two ✗ lines, each one short lead.
  await openCard('dk-aau-chemical-engineering-and-biotechnology', 'shot-aau-chem');
  await shot('p1-phone-aau-chem-why', '#shot-aau-chem', { whole: true });
  // A met card: ✓ leads are short, the conversion is one tap down.
  await openCard('dk-au-computer-science-2027', 'shot-au-cs');
  await shot('p1-phone-au-cs-why', '#shot-au-cs', { whole: true });

  // P1 on desktop.
  await openPlanner('p1', DESKTOP);
  await shot('p1-desktop-top', 'main', { height: 900 });
  await openCard('dk-aau-chemical-engineering-and-biotechnology', 'shot-aau-chem');
  await shot('p1-desktop-aau-chem-why', '#shot-aau-chem', { whole: true });

  // P5 (English B SL 4) at CBS: the Cambridge step that closes both comes first.
  await openPlanner('p5', PHONE);
  await openCard('dk-cbs-international-business-2027', 'shot-cbs');
  await evaluate(`document.querySelectorAll('#shot-cbs .why__more').forEach((d, i) => { if (i === 0) d.open = true; }); true`);
  await shot('p5-phone-cbs-ib-why', '#shot-cbs', { whole: true });
  await openPlanner('p5', DESKTOP);
  await openCard('dk-cbs-international-business-2027', 'shot-cbs');
  await evaluate(`document.querySelectorAll('#shot-cbs .why__more').forEach((d, i) => { if (i === 0) d.open = true; }); true`);
  await shot('p5-desktop-cbs-ib-why', '#shot-cbs', { whole: true });

  await fs.writeFile(path.join(OUT, 'shots.json'), `${JSON.stringify({ errors, shots }, null, 2)}\n`);
  if (errors.length) console.log('page errors:', errors);
} finally {
  ws.close();
  chrome.kill();
}
process.exit(0);
