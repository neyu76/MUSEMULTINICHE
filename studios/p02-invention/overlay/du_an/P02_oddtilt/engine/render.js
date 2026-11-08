// Render a three.js scene page frame by frame (deterministic time) to JPEG files.
// Usage: node render.js <page.html> <outDir> <fps> <startFrame> <endFrame(excl)> [width height] [frameList]
// overlay p02-invention: CHROME_PATH=<chromium> uses an existing browser; existing frames are skipped (SKIP_EXISTING=0 to redo);
// each JPEG is written to .tmp then renamed, so a killed process never leaves a half file (safe for a watchdog that re-runs the same range).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [page, outDir, fps = '30', f0 = '0', f1 = '1', W = '1080', H = '1920', list = ''] = process.argv.slice(2);
const all = list ? list.split(',').map(Number) : Array.from({ length: Math.max(0, +f1 - +f0) }, (_, i) => +f0 + i);
const fname = f => path.join(outDir, `f_${String(f).padStart(5, '0')}.jpg`);
const frames = process.env.SKIP_EXISTING === '0' ? all : all.filter(f => !fs.existsSync(fname(f)));
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
if (!frames.length) { console.log('frames 0 (all exist)'); process.exit(0); }
const srv = http.createServer((q, s) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); s.end(d); });
}).listen(0, async () => {
  const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'], ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  pg.on('console', m => console.log('C:', m.text()));
  pg.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(2); });
  await pg.goto(`http://127.0.0.1:${port}/${page}`);
  await pg.waitForFunction('window.ready === true', null, { timeout: 900000 });
  fs.mkdirSync(outDir, { recursive: true });
  const t0 = Date.now();
  for (const f of frames) {
    await pg.evaluate(t => window.renderFrame(t), f / +fps);
    const d = await pg.evaluate((qq) => document.querySelector('canvas').toDataURL('image/jpeg', qq), +(process.env.JPEGQ || 0.93));
    fs.writeFileSync(fname(f) + '.tmp', Buffer.from(d.split(',')[1], 'base64')); fs.renameSync(fname(f) + '.tmp', fname(f));
  }
  console.log('frames', frames.length, 'sec/frame', ((Date.now() - t0) / 1000 / Math.max(1, frames.length)).toFixed(3));
  await b.close(); srv.close();
});
