import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { gzipSync, deflateSync, brotliCompressSync } from 'node:zlib';
import { normalizePage, fingerprint, inspectPage, fetchSource } from './source-audit.mjs';

const meaningful = '<h1>English-taught degree admission</h1><p>IB Diploma: 32 points, Mathematics HL grade 6. Applications close on 15 March 2027. Annual tuition €8,500.</p>';
const page = (noise, facts = meaningful) => `<!doctype html><title>Admission</title><header>${noise}</header><nav>${noise}</nav><main>${facts}<div class="cookie-banner">${noise}</div><div class="hero-carousel"><div>${noise}</div></div><script>${noise}</script><p>Page generated at ${noise}</p><p>Session token: ${noise}</p></main><footer>${noise}</footer>`;
const a = normalizePage(page('2026-11-15T10:01:09Z'));
const b = normalizePage(page('2026-11-16T11:02:10Z'));
assert.equal(a, b, 'load-time UI, timestamps and session tokens must not cause drift');
for (const facts of [meaningful.replace('32 points', '34 points'), meaningful.replace('15 March', '16 March'), meaningful.replace('8,500', '9,000')]) {
  assert.notEqual(fingerprint(a), fingerprint(normalizePage(page('2026-11-15T10:01:09Z', facts))), 'requirements, fees and hard dates must remain in the fingerprint');
}
assert.match(normalizePage('<main><header><h1>Admission deadline</h1></header><time datetime="2027-03-15">15 March 2027</time></main>'), /admission deadline[\s\S]*15 march 2027/);
assert.equal(normalizePage('<div role="main"><div>IB&nbsp;Diploma</div><div aria-hidden="true">123</div><p hidden>456</p><p>Math&shy;ematics</p></div>'), 'ib diploma\nmathematics');
const linked = (href) => `<main>${meaningful}<a href="${href}">Entry requirements PDF</a></main>`;
assert.equal(normalizePage(linked('/admissions/rules-2027.pdf?utm_source=banner&amp;sessionid=123#page=1')), normalizePage(linked('/admissions/rules-2027.pdf?sessionid=456&amp;utm_source=newsletter#page=2')), 'link tracking and session parameters do not cause drift');
assert.notEqual(normalizePage(linked('/admissions/rules-2027.pdf')), normalizePage(linked('/admissions/rules-2028.pdf')), 'a changed linked requirement PDF is meaningful');
assert.notEqual(normalizePage(linked('/admissions?year=2027')), normalizePage(linked('/admissions?year=2028')), 'admission-year query parameters remain meaningful');
const inspect = (overrides) => inspectPage({ url: 'https://university.example/admissions/ib', finalUrl: 'https://university.example/admissions/ib', status: 200, html: `<main>${meaningful}</main>`, ...overrides });
assert.equal(inspect({}).status, 'ok');
for (const code of [404, 410]) assert.equal(inspect({ status: code }).status, 'broken');
for (const code of [403, 429, 500]) assert.equal(inspect({ status: code }).status, 'unverified');
for (const ending of ['/', '/en/', '/en/home', '/index.html', '/search?q=ib', '/en/search-results/', '/?s=ib']) assert.equal(inspect({ finalUrl: `https://university.example${ending}` }).status, 'broken', ending);
assert.equal(inspect({ finalUrl: 'https://www.university.example/admissions/ib/' }).status, 'ok', 'canonical host and slash redirects are fine');
assert.equal(inspect({ finalUrl: 'https://university.example/admissions/international/ib' }).status, 'ok', 'a new detail URL is fine');
for (const html of ['<title>Page not found</title><main>Try searching.</main>', '<h1>404</h1>', '<main>Sorry, the requested page could not be found. Please use the search function.</main>', '<main>The page you are looking for does not exist. Please return to the homepage.</main>', '<title>Siden findes ikke</title>', '<html><head><title>University</title></head><body><p>Sorry, the requested page could not be found. Please use the search function to find a different page.</p></body></html>']) assert.equal(inspect({ html }).status, 'broken', html);
assert.equal(inspect({ html: `<main>${meaningful}<p>If your school is not found, contact admissions.</p></main>` }).status, 'ok', 'an ordinary mention of not-found is not an error page');
for (const html of ['<title>Just a moment...</title><main>Checking your browser before accessing this website.</main>', '<main id="app"></main><script>renderEverything()</script>']) assert.equal(inspect({ html }).status, 'unverified');
assert.equal(inspect({ contentType: 'image/jpeg', html: 'binary' }).status, 'unverified');

const server = http.createServer((req, res) => {
  if (req.url === '/gone') { res.writeHead(404); res.end('gone'); }
  else if (req.url === '/redirect') { res.writeHead(302, { location: '/' }); res.end(); }
  else if (req.url === '/pdf') { res.writeHead(200, { 'content-type': 'application/pdf' }); res.end('%PDF-1.7\nfixture bytes'); }
  else if (req.url === '/binary') { res.writeHead(200, { 'content-type': 'application/octet-stream' }); res.end('not a pdf'); }
  else if (req.url === '/loop') { res.writeHead(302, { location: '/loop' }); res.end(); }
  else if (req.url === '/redirect-unsupported') { res.writeHead(302, { location: 'file:///etc/passwd' }); res.end(); }
  else if (req.url === '/aborted') { res.writeHead(200, { 'content-type': 'text/html', 'content-length': 10000 }); res.write('<main>Partial response'); setTimeout(() => res.destroy(), 5); }
  else if (req.url === '/malformed') { req.socket.end('HTTP/1.1 200 OK\r\nContent-Length: 10\r\nContent-Length: 11\r\n\r\nnope'); }
  else if (['/gzip', '/deflate', '/br'].includes(req.url)) {
    const encoding = req.url.slice(1);
    const compress = { gzip: gzipSync, deflate: deflateSync, br: brotliCompressSync }[encoding];
    res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': encoding });
    res.end(compress(Buffer.from(`<main>${meaningful}</main>`)));
  }
  else if (req.url === '/bad-encoding') { res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip' }); res.end('not compressed'); }
  else if (req.url === '/expanded') { res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip' }); res.end(gzipSync(Buffer.from('a'.repeat(10000)))); }
  else if (req.url === '/huge') { res.writeHead(200, { 'content-type': 'text/html', 'content-length': 10000 }); res.end('a'.repeat(10000)); }
  else if (req.url === '/wait') { setTimeout(() => res.end('late'), 100); }
  else { res.writeHead(200, { 'content-type': 'text/html' }); res.end(`<main>${meaningful}</main>`); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
try {
  assert.equal((await fetchSource(base + '/admissions')).status, 'ok');
  assert.equal((await fetchSource(base + '/gone')).status, 'broken');
  assert.equal((await fetchSource(base + '/redirect')).status, 'broken');
  const pdf = await fetchSource(base + '/pdf');
  assert.equal(pdf.status, 'ok'); assert.equal(pdf.kind, 'pdf'); assert.equal(pdf.hash, fingerprint(Buffer.from('%PDF-1.7\nfixture bytes')));
  assert.equal((await fetchSource(base + '/binary')).status, 'unverified');
  const normal = await fetchSource(base + '/admissions');
  for (const encoding of ['gzip', 'deflate', 'br']) assert.equal((await fetchSource(base + '/' + encoding)).hash, normal.hash, encoding);
  assert.match((await fetchSource(base + '/loop', { maxRedirects: 2 })).reason, /redirects/);
  assert.match((await fetchSource(base + '/redirect-unsupported')).reason, /not an HTTP/);
  assert.match((await fetchSource(base + '/aborted')).reason, /complete|completion|aborted/);
  assert.equal((await fetchSource(base + '/malformed')).status, 'unverified', 'malformed responses must not crash an annual run');
  assert.equal((await fetchSource(base + '/bad-encoding')).status, 'unverified');
  assert.match((await fetchSource(base + '/huge', { maxBytes: 64 })).reason, /byte limit/);
  assert.match((await fetchSource(base + '/expanded', { maxBytes: 200 })).reason, /decoded response.*byte limit/);
  assert.match((await fetchSource(base + '/wait', { timeoutMs: 10 })).reason, /timed out/);
  assert.equal((await fetchSource('file:///not-a-source')).status, 'unverified');
  assert.equal((await fetchSource('https://[invalid]')).status, 'unverified');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
console.log('Source audit: noise stability, real fact changes, wrong redirects, soft 404s, refusal, PDFs, compressed/malformed/aborted responses, limits and timeouts pass.');
