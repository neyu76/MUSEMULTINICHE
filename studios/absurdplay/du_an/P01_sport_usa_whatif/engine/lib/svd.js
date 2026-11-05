// Sân vận động bóng bầu dục kiểu truyền hình (theo mẫu): sân 120 yard có vạch số, khán đài hình bát nhiều tầng
// với đám đông là những "chấm người" nhiều màu, dải phòng VIP sáng đèn, băng LED chạy chữ quanh sân, mái có giếng trời.
import * as THREE from 'three';

const YD = 0.9144; // mét / yard

function canvasTex(w, h, draw, { repeat = [1, 1], aniso = 8 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); return t;
}

function fieldTexture(o) {
  return canvasTex(4096, 1820, (g, W, H) => {
    const px = W / 120; // px/yard
    for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? '#3f8c37' : '#479a3e'; g.fillRect(i * 5 * px, 0, 5 * px, H); }
    // end zones
    for (const [x, col, txt] of [[0, o.endLeft, o.endLeftText], [110, o.endRight, o.endRightText]]) {
      g.fillStyle = col; g.fillRect(x * px, 0, 10 * px, H);
      g.save(); g.translate((x + 5) * px, H / 2); g.rotate(x === 0 ? -Math.PI / 2 : Math.PI / 2);
      g.font = `900 ${px * 6.2}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = px * 0.5; g.strokeStyle = '#ffffff'; g.fillStyle = o.endTextColor || '#ffffff';
      g.fillText(txt, 0, 0); g.restore();
    }
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, px * 0.25); g.fillRect(0, H - px * 0.25, W, px * 0.25);
    for (let y = 10; y <= 110; y += 5) g.fillRect(y * px - px * 0.12, 0, px * 0.24, H);
    for (let y = 11; y < 110; y++) { if (y % 5 === 0) continue; for (const yy of [0.02, 0.36, 0.62, 0.96]) g.fillRect(y * px - px * 0.06, H * yy - px * 0.4, px * 0.12, px * 0.8); }
    g.font = `700 ${px * 2.2}px Oswald, Anton, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let y = 20; y <= 100; y += 10) {
      const n = y <= 60 ? y - 10 : 110 - y;
      for (const [yy, rot] of [[0.16, Math.PI], [0.84, 0]]) { g.save(); g.translate(y * px, H * yy); g.rotate(rot); g.fillText(String(n), 0, 0); g.restore(); }
    }
    // logo giữa sân: vòng tròn + chữ (không dùng logo thật)
    g.save(); g.translate(60 * px, H / 2); g.fillStyle = o.midColor; g.beginPath(); g.ellipse(0, 0, px * 8, px * 8, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = px * 0.6; g.strokeStyle = '#ffffff'; g.stroke(); g.fillStyle = '#ffffff';
    g.font = `900 ${px * 3}px Anton, Impact, sans-serif`; g.fillText(o.midText, 0, 0); g.restore();
  }, { aniso: 16 });
}

function crowdTexture(o) {
  // đám đông nhìn từ xa giống mẫu: hạt màu nhỏ dày đặc (áo + đầu), hàng ghế tối, lối đi dọc chia khu
  return canvasTex(2048, 1024, (g, W, H) => {
    g.fillStyle = o.seatColor; g.fillRect(0, 0, W, H);
    const cw = 6, ch = 8, aisle = 170;
    for (let y = 0; y < H; y += ch) {
      for (let x = (y / ch % 2) * 3; x < W; x += cw) {
        if (x % aisle < 10) continue; // lối đi
        if (Math.random() < 0.04) continue;
        const r = Math.random();
        const shirt = r < 0.5 ? o.teamA[Math.floor(Math.random() * o.teamA.length)] : r < 0.6 ? o.teamB[Math.floor(Math.random() * o.teamB.length)] : `hsl(${(220 + Math.random() * 120) % 360},${20 + Math.random() * 40}%,${30 + Math.random() * 45}%)`;
        g.fillStyle = shirt; g.fillRect(x, y + 3, cw - 1, ch - 3);
        g.fillStyle = ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f'][Math.floor(Math.random() * 5)];
        g.fillRect(x + 1, y, cw - 3, 3);
      }
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y + ch - 1, W, 1);
    }
    for (let x = 0; x < W; x += aisle) { g.fillStyle = '#3b4258'; g.fillRect(x, 0, 10, H); }
  }, { repeat: [1, 1] });
}

function facadeTexture(col = '#1b2236') {
  return canvasTex(512, 32, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 0, W, 3); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, H - 4, W, 4); });
}

function suiteTexture() {
  return canvasTex(512, 64, (g, W, H) => {
    g.fillStyle = '#1b2236'; g.fillRect(0, 0, W, H);
    for (let x = 4; x < W; x += 16) { const l = 70 + Math.random() * 25; g.fillStyle = `hsl(45,${60 + Math.random() * 30}%,${l}%)`; g.fillRect(x, 10, 12, 40); }
  });
}

export function ledTexture(text, bg = '#0b2a5b', fg = '#ffffff', accent = '#f2c230') {
  return canvasTex(2048, 96, (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.font = '900 62px Inter, Anton, sans-serif'; g.textBaseline = 'middle';
    let x = 20; let i = 0;
    while (x < W) { g.fillStyle = i++ % 2 ? accent : fg; g.fillText(text, x, H / 2 + 2); x += g.measureText(text).width + 40; g.fillStyle = accent; g.fillText('•', x - 28, H / 2); }
  });
}

// đường bao hình sân vận động (hình chữ nhật bo góc lớn) quanh tâm, bán trục a (dọc sân), b (ngang sân)
function ringPath(a, b, r, n = 160) {
  const pts = [];
  const cx = a - r, cz = b - r; // tâm cung góc
  const L = 2 * (2 * cx + 2 * cz) + 2 * Math.PI * r;
  for (let i = 0; i < n; i++) {
    let d = (i / n) * L; let p;
    const seg = [2 * cx, Math.PI * r / 2, 2 * cz, Math.PI * r / 2, 2 * cx, Math.PI * r / 2, 2 * cz, Math.PI * r / 2];
    const shapes = [
      (s) => new THREE.Vector2(-cx + s, b), (s) => { const t = Math.PI / 2 - s / r; return new THREE.Vector2(cx + r * Math.cos(t), cz + r * Math.sin(t)); },
      (s) => new THREE.Vector2(a, cz - s), (s) => { const t = -s / r; return new THREE.Vector2(cx + r * Math.cos(t), -cz + r * Math.sin(t)); },
      (s) => new THREE.Vector2(cx - s, -b), (s) => { const t = -Math.PI / 2 - s / r; return new THREE.Vector2(-cx + r * Math.cos(t), -cz + r * Math.sin(t)); },
      (s) => new THREE.Vector2(-a, -cz + s), (s) => { const t = Math.PI - s / r; return new THREE.Vector2(-cx + r * Math.cos(t), cz + r * Math.sin(t)); }];
    for (let k = 0; k < 8; k++) { if (d <= seg[k] || k === 7) { p = shapes[k](Math.min(d, seg[k])); break; } d -= seg[k]; }
    pts.push(p);
  }
  return pts;
}

// dải nghiêng: từ đường bao trong (offset0, y0) tới đường bao ngoài (offset1, y1)
function band(a, b, r, off0, y0, off1, y1, mat, uRepeat = 40) {
  const p0 = ringPath(a + off0, b + off0, r + off0), p1 = ringPath(a + off1, b + off1, r + off1);
  const n = p0.length, pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const A = p0[i % n], Bp = p1[i % n];
    pos.push(A.x, y0, A.y, Bp.x, y1, Bp.y); const u = (1 - i / n) * uRepeat; uv.push(u, 0, u, 1);
    if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; return m;
}

export function buildStadium(scene, opts = {}) {
  const o = Object.assign({ endLeft: '#0b2a5b', endRight: '#e0457b', endLeftText: 'DALLAS', endRightText: 'BABIES', endTextColor: '#ffffff',
    midColor: '#0b2a5b', midText: 'WILD CARD', teamA: ['#0b2a5b', '#1f3f78', '#c3c8d0', '#8a93a6', '#ffffff', '#5b6fb0', '#9aa7d6'], teamB: ['#e0457b', '#ff8fbf'], seatColor: '#262c40',
    led: 'NFC WILD CARD  •  PLAYOFFS  •  DALLAS', ledBg: '#0b2a5b', roof: true, haze: '#4a5068', sky: '#171c2b' }, opts);
  const G = new THREE.Group(); scene.add(G);
  const fl = 120 * YD, fw = 53.33 * YD;
  // mặt sân
  const fieldMat = new THREE.MeshStandardMaterial({ map: fieldTexture(o), roughness: 0.95 });
  const field = new THREE.Mesh(new THREE.PlaneGeometry(fl, fw), fieldMat); field.rotation.x = -Math.PI / 2; field.receiveShadow = true; G.add(field);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(fl + 30, fw + 30), new THREE.MeshStandardMaterial({ color: '#3d8435', roughness: 1 }));
  apron.rotation.x = -Math.PI / 2; apron.position.y = -0.01; apron.receiveShadow = true; G.add(apron);
  const A = fl / 2 + 8, Bh = fw / 2 + 8, R = 14;
  // tường + băng LED quanh sân
  const ledTex = ledTexture(o.led, o.ledBg);
  const led = band(A, Bh, R, 0, 0, 0, 1.6, new THREE.MeshBasicMaterial({ map: ledTex, side: THREE.DoubleSide }), 14);
  G.add(led);
  const crowdTex = crowdTexture(o);
  const crowdMat = new THREE.MeshStandardMaterial({ map: crowdTex, roughness: 1, side: THREE.DoubleSide });
  const suite = new THREE.MeshStandardMaterial({ map: suiteTexture(), emissive: '#ffffff', emissiveMap: null, emissiveIntensity: 0.0, side: THREE.DoubleSide, roughness: 0.6 });
  suite.emissiveMap = suite.map; suite.emissiveIntensity = 0.9;
  // tầng 1 (dốc), mặt tiền tối, dải phòng VIP sáng, tầng 2, băng LED, tầng 3 — giống bố cục mẫu
  const fac = new THREE.MeshStandardMaterial({ map: facadeTexture(), side: THREE.DoubleSide, roughness: 0.9 });
  G.add(band(A, Bh, R, 0, 1.6, 22, 13, crowdMat, 10));
  G.add(band(A, Bh, R, 22, 13, 22.5, 15.5, fac, 30));
  G.add(band(A, Bh, R, 22.5, 15.5, 23, 18.5, suite, 30));
  G.add(band(A, Bh, R, 23, 18.5, 23.5, 20, fac, 30));
  G.add(band(A, Bh, R, 23.5, 20, 44, 34, crowdMat, 12));
  G.add(band(A, Bh, R, 44, 34, 44.5, 36.5, new THREE.MeshBasicMaterial({ map: ledTexture(o.led, '#141a2b', '#ffffff', '#f2c230'), side: THREE.DoubleSide }), 20));
  G.add(band(A, Bh, R, 44.5, 36.5, 45, 39, suite, 30));
  G.add(band(A, Bh, R, 45, 39, 64, 54, crowdMat, 14));
  if (o.roof) {
    const roofMat = new THREE.MeshStandardMaterial({ color: '#1a1f2e', roughness: 0.8, side: THREE.DoubleSide });
    G.add(band(A, Bh, R, 64, 54, 30, 64, roofMat, 10));
    // giếng trời: lưới kính sáng
    const glass = canvasTex(1024, 512, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#fff7e0'); gr.addColorStop(1, '#ffe2a8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#6b6050'; g.lineWidth = 6; for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2 * (A + 30), 2 * (Bh + 30)), new THREE.MeshBasicMaterial({ map: glass, side: THREE.DoubleSide }));
    sky.rotation.x = Math.PI / 2; sky.position.y = 64; G.add(sky);
  }
  if (o.rays !== false) {
    const rayTex = canvasTex(64, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,240,200,0.55)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); const gx = g.createLinearGradient(0, 0, W, 0); });
    const rayMat = new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0.35 });
    for (let i = 0; i < 7; i++) {
      const ray = new THREE.Mesh(new THREE.PlaneGeometry(10, 90), rayMat);
      ray.position.set(-40 + i * 13, 34, -10 + (i % 3) * 8); ray.rotation.set(0.25, 0.4 * (i % 2 ? 1 : -1), -0.55); G.add(ray);
    }
  }
  scene.fog = new THREE.Fog(o.haze, 70, 240);
  scene.background = new THREE.Color(o.sky);
  return { group: G, ledTex, field };
}

// ánh sáng kiểu sân trong nhà: trời + nắng ấm qua mái + đèn phụ
export function stadiumLights(scene) {
  const hemi = new THREE.HemisphereLight('#f6f3ea', '#4b5d3a', 1.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d0', 2.0); sun.position.set(-30, 60, 25); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 150 }); sun.shadow.bias = -0.0004; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight('#cfdcff', 0.6); fill.position.set(30, 20, -20); scene.add(fill);
  return { hemi, sun, fill };
}
