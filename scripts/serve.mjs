/**
 * A minimal static server for previewing dist/ locally.
 *
 *   node scripts/serve.mjs          # build once, then serve on 4321
 *   node scripts/serve.mjs --watch  # rebuild whenever data/ or src/ changes
 */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function build() {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'src', 'build.mjs')], { stdio: 'inherit' });
  return r.status === 0;
}

if (!fs.existsSync(DIST)) build();

if (process.argv.includes('--watch')) {
  let timer = null;
  for (const dir of ['data', 'src']) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => { console.log('\n— rebuilding —'); build(); }, 150);
    });
  }
  console.log('watching data/ and src/');
}

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, urlPath);
    try {
      if ((await fsp.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    } catch {
      if (!path.extname(file)) file = path.join(DIST, urlPath, 'index.html');
    }
    try {
      const body = await fsp.readFile(file);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      try {
        const body = await fsp.readFile(path.join(DIST, '404.html'));
        res.writeHead(404, { 'content-type': TYPES['.html'] });
        res.end(body);
      } catch {
        res.writeHead(404).end('Not found');
      }
    }
  })
  .listen(PORT, () => console.log(`\n  preview  http://localhost:${PORT}\n`));
