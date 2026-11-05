// Render a three.js scene page frame by frame (deterministic time) to JPEG files.
// Usage: node render.js <page.html> <outDir> <fps> <startFrame> <endFrame(excl)> [width height]
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [page, outDir, fps = '30', f0 = '0', f1 = '1', W = '1080', H = '1920', list = ''] = process.argv.slice(2);
const frames = list ? list.split(',').map(Number) : Array.from({ length: Math.max(0, +f1 - +f0) }, (_, i) => +f0 + i);
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const srv = http.createServer((q, s) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); s.end(d); });
}).listen(0, async () => {
  const port = srv.address().port;
  const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  pg.on('console', m => console.log('C:', m.text()));
  pg.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(2); });
  await pg.goto(`http://127.0.0.1:${port}/${page}`);
  await pg.waitForFunction('window.ready === true', null, { timeout: 900000 });
  fs.mkdirSync(outDir, { recursive: true });
  const t0 = Date.now();
  for (const f of frames) {
    await pg.evaluate(t => window.renderFrame(t), f / +fps);
    const d = await pg.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.93));
    fs.writeFileSync(path.join(outDir, `f_${String(f).padStart(5, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
  }
  console.log('frames', frames.length, 'sec/frame', ((Date.now() - t0) / 1000 / Math.max(1, frames.length)).toFixed(3));
  await b.close(); srv.close();
});
