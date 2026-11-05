// Tài sản bóng rổ NBA (tập 2): bóng 8 múi, rổ (bảng kính + vành cam + lưới), nhà thi đấu (sàn gỗ, vùng sơn, khán đài, jumbotron),
// cúp MVP, phong bì PICK. Không dùng logo giải/đội: chỉ tên thành phố, màu, số.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
export const canvasTex = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.cv = cv; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };

// ---------- bóng NBA: cam nâu #C8541F, vân hạt, 8 múi: 2 đường tròn lớn vuông góc + 2 đường cong ----------
let ballTex = null;
function makeBallTex() {
  const W = 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const img = g.createImageData(W, H), d = img.data; const lw = 0.022;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lon = (x / W) * Math.PI * 2, lat = (0.5 - y / H) * Math.PI;
    // SphereGeometry: x=-cos(phi)sin(theta), y=cos(theta), z=sin(phi)sin(theta) ; phi=u*2pi, theta=v*pi
    const th = (y / H) * Math.PI, ph = lon; const px = -Math.cos(ph) * Math.sin(th), py = Math.cos(th), pz = Math.sin(ph) * Math.sin(th);
    let line = Math.abs(px) < lw || Math.abs(py) < lw; // 2 đường tròn lớn
    const ax = Math.acos(Math.min(1, Math.abs(pz))); if (Math.abs(ax - 0.92) < lw * 1.05) line = true; // 2 đường cong quanh trục ±z
    const n = (Math.sin(x * 1.7) * Math.sin(y * 2.3) + Math.sin(x * 0.9 + y * 1.3)) * 0.5; const pebble = (((x * 7 + y * 13) ^ (x * y)) & 7) / 7;
    const i = (y * W + x) * 4;
    if (line) { d[i] = 22; d[i + 1] = 14; d[i + 2] = 10; }
    else { const k = 0.9 + pebble * 0.12 + n * 0.03; d[i] = Math.min(255, 200 * k); d[i + 1] = Math.min(255, 84 * k); d[i + 2] = Math.min(255, 31 * k); }
    d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
let bumpTex = null;
export function basketball(D = 0.24) {
  ballTex ??= makeBallTex();
  bumpTex ??= canvasTex(256, 128, (g, W, H) => { const im = g.createImageData(W, H); for (let i = 0; i < W * H; i++) { const v = 120 + Math.random() * 120; im.data.set([v, v, v, 255], i * 4); } g.putImageData(im, 0, 0); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(D / 2, 48, 32), new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.78, bumpMap: bumpTex, bumpScale: 0.6 }));
  m.castShadow = true; m.userData.R = D / 2; return m;
}

// ---------- rổ: cột đệm + tay đỡ + bảng kính 1,83x1,07 viền đen, ô vuông trắng, vành cam cao 3,05 m, lưới trắng ----------
export function hoop(dir = 1, o = {}) { // dir: +1 = rổ ở x>0 (mặt bảng nhìn về -x)
  const G = new THREE.Group(); const rimY = 3.05, bbX = 0, rimX = -0.15 - 0.2286; // so với bảng
  const pad = std(o.pad || '#00471B', { roughness: 0.7 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.2), pad); base.position.set(2.6, 0.55, 0); G.add(base);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.35), pad); pole.position.set(2.6, 2.6, 0); G.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.3, 0.3), std('#1a1a1a', { metalness: 0.5 })); arm.position.set(1.35, 3.85, 0); arm.rotation.z = -0.12; G.add(arm);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.07, 1.83), new THREE.MeshPhysicalMaterial({ color: '#dfeef5', transmission: 0, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0 }));
  glass.position.set(bbX, rimY + 0.15 + 0.535 - 0.1, 0); G.add(glass);
  const fr = std('#141414', { roughness: 0.4 }); const gy = glass.position.y;
  for (const [y, z, h, w] of [[gy + 0.535, 0, 0.05, 1.88], [gy - 0.535, 0, 0.05, 1.88], [gy, 0.915, 1.12, 0.05], [gy, -0.915, 1.12, 0.05]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, w), fr); b.position.set(bbX, y, z); G.add(b); }
  const wm = std('#ffffff', { roughness: 0.5 }); const sq = (y, z, h, w) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.035, h, w), wm); b.position.set(bbX - 0.005, y, z); G.add(b); };
  sq(rimY + 0.15 + 0.45, 0, 0.05, 0.61); sq(rimY + 0.15, 0, 0.05, 0.61); sq(rimY + 0.375, 0.28, 0.45, 0.05); sq(rimY + 0.375, -0.28, 0.45, 0.05);
  const rimM = std('#e2531b', { roughness: 0.35, metalness: 0.4 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2286, 0.011, 10, 48), rimM); rim.rotation.x = Math.PI / 2; rim.position.set(rimX, rimY, 0); G.add(rim);
  const brk = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.12), rimM); brk.position.set(-0.08, rimY, 0); G.add(brk);
  // lưới: lưới ô dệt bằng các ống mảnh, phễu thu hẹp xuống
  const net = new THREE.Group(); net.position.set(rimX, rimY, 0); G.add(net); const nm = std('#f4f4f4', { roughness: 0.9 });
  const N = 12, rows = 5, len = 0.42; const pts = (k, j) => { const v = j / rows; const r = 0.2286 * (1 - 0.42 * v); const a = (k + (j % 2) * 0.5) / N * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * r, -v * len, Math.sin(a) * r); };
  const strand = (a, b) => { const v = b.clone().sub(a); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, v.length(), 4), nm); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); net.add(c); };
  for (let j = 0; j < rows; j++) for (let k = 0; k < N; k++) { strand(pts(k, j), pts(k, j + 1)); strand(pts(k + 1, j), pts(k, j + 1)); }
  G.userData = { rim: new THREE.Vector3(rimX, rimY, 0), net };
  G.traverse((x) => { if (x.isMesh && x !== glass) x.castShadow = true; });
  G.rotation.y = dir > 0 ? 0 : Math.PI; return G;
}
// toạ độ thế giới tâm vành rổ của 1 rổ
export const rimWorld = (h) => { h.updateMatrixWorld(true); return h.userData.rim.clone().applyMatrix4(h.matrixWorld); };

// ---------- sàn đấu ----------
const CL = 28.65, CW = 15.24;
function courtTexture(o) {
  return canvasTex(4096, 2414, (g, X, Y) => {
    const px = X / (CL + 4), M = 2 * px; // biên 2 m quanh sân
    // gỗ thích: ván dọc theo chiều dài
    g.fillStyle = o.apron; g.fillRect(0, 0, X, Y);
    for (let y = M; y < Y - M; y += px * 0.07) { for (let x = M; x < X - M;) { const l = px * (1.2 + Math.random() * 2.4); const v = Math.random(); g.fillStyle = `hsl(${31 + v * 5},${52 + v * 10}%,${66 + v * 9}%)`; g.fillRect(x, y, Math.min(l, X - M - x), px * 0.07 - 1); x += l; } }
    g.fillStyle = 'rgba(60,30,10,0.05)'; for (let i = 0; i < 9000; i++) g.fillRect(M + Math.random() * (X - 2 * M), M + Math.random() * (Y - 2 * M), px * 0.3, 1);
    const cx = X / 2, cy = Y / 2; const lw = px * 0.05;
    g.strokeStyle = '#ffffff'; g.lineWidth = lw * 1.0;
    g.strokeRect(M, M, CL * px, CW * px);
    g.beginPath(); g.moveTo(cx, M); g.lineTo(cx, Y - M); g.stroke();
    g.fillStyle = o.paint; g.beginPath(); g.arc(cx, cy, 1.83 * px, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = o.cream; g.font = `900 ${px * 0.62}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.mid, cx, cy + px * 0.05);
    for (const s of [-1, 1]) { const bx = s < 0 ? M : X - M, dir = -s; // baseline x, hướng vào sân
      const hx = bx + dir * 1.575 * px;
      // vùng sơn 4,88 x 5,79
      g.fillStyle = o.paint; const kx = s < 0 ? bx : bx - 5.79 * px; g.fillRect(kx, cy - 2.44 * px, 5.79 * px, 4.88 * px); g.strokeRect(kx, cy - 2.44 * px, 5.79 * px, 4.88 * px);
      const ftx = bx + dir * 5.79 * px; g.beginPath(); g.arc(ftx, cy, 1.83 * px, s < 0 ? -Math.PI / 2 : Math.PI / 2, s < 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke();
      // vạch 3 điểm: góc 0,91 m từ biên dọc, cung bán kính 7,24
      const cw = (CW / 2 - 0.91) * px, R3 = 7.24 * px; const a0 = Math.asin(cw / R3); const cxLen = Math.cos(a0) * R3;
      g.beginPath(); g.moveTo(bx, cy - cw); g.lineTo(hx + dir * cxLen, cy - cw);
      if (s < 0) g.arc(hx, cy, R3, -a0, a0); else g.arc(hx, cy, R3, Math.PI + a0, Math.PI - a0, true);
      g.lineTo(bx, cy + cw); g.stroke();
      // vòng bán nguyệt dưới rổ
      g.beginPath(); g.arc(hx, cy, 1.22 * px, s < 0 ? -Math.PI / 2 : Math.PI / 2, s < 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke();
      // chữ cuối sân trên biên ngoài
      g.save(); g.translate(s < 0 ? M * 0.5 : X - M * 0.5, cy); g.rotate(s < 0 ? -Math.PI / 2 : Math.PI / 2); g.fillStyle = o.cream; g.font = `900 ${px * 1.1}px Inter`; g.fillText(o.baseText, 0, 0); g.restore();
    }
    // biên dọc ngoài: chữ thành phố
    g.fillStyle = o.cream; g.font = `900 ${px * 1.0}px Inter`; g.fillText(o.sideText, cx, M * 0.5); g.save(); g.translate(cx, Y - M * 0.5); g.rotate(Math.PI); g.fillText(o.sideText, 0, 0); g.restore();
  });
}
function crowdTex(o) {
  return canvasTex(2048, 1024, (g, W, H) => { g.fillStyle = '#15181f'; g.fillRect(0, 0, W, H); const cw = 14, ch = 20;
    for (let y = 0; y < H; y += ch) { for (let x = (y / ch % 2) * 7; x < W; x += cw) { if (x % 300 < 18) continue; if (Math.random() < 0.03) continue;
      const r = Math.random(); g.fillStyle = r < 0.45 ? o.fanA[Math.floor(Math.random() * o.fanA.length)] : r < 0.55 ? o.fanB[Math.floor(Math.random() * o.fanB.length)] : `hsl(${Math.random() * 360},${15 + Math.random() * 35}%,${25 + Math.random() * 45}%)`;
      g.fillRect(x + 1, y + 8, cw - 3, ch - 9); g.fillStyle = ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f'][Math.floor(Math.random() * 5)]; g.beginPath(); g.arc(x + cw / 2, y + 5, 4, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#0c0e13'; g.fillRect(0, y + ch - 2, W, 2); }
    for (let x = 0; x < W; x += 300) { g.fillStyle = '#2b3140'; g.fillRect(x, 0, 18, H); } });
}
export function buildArena(scene, opts = {}) {
  const o = Object.assign({ paint: '#00471B', cream: '#EEE1C6', apron: '#00471B', mid: 'WHAT IF', baseText: 'MILWAUKEE', sideText: 'MILWAUKEE', fanA: ['#00471B', '#0b5a2a', '#EEE1C6', '#1d6b3a'], fanB: ['#98002E', '#c8102e'] }, opts);
  const G = new THREE.Group(); scene.add(G);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(CL + 4, CW + 4), new THREE.MeshStandardMaterial({ map: courtTexture(o), roughness: 0.32, metalness: 0.0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; G.add(floor);
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), std('#1a1d24', { roughness: 0.9 })); outer.rotation.x = -Math.PI / 2; outer.position.y = -0.01; G.add(outer);
  const hoops = [hoop(1, { pad: o.paint }), hoop(-1, { pad: o.paint })]; hoops[0].position.set(CL / 2 - 1.22, 0, 0); hoops[1].position.set(-(CL / 2 - 1.22), 0, 0); hoops.forEach((h) => G.add(h));
  // khán đài: 4 phía, dốc 30°, bắt đầu cách sân ~3,5 m; hàng ghế sàn tối
  // khán đài theo mẫu (Houston / Golden State): từng hàng ghế 3D màu đội, bậc bê tông sáng, khán giả low-poly ngồi thưa,
  // dải LED giữa 2 tầng. Khác hẳn tập 1 (khán đài texture chấm màu).
  stands(G, o, CL / 2 + 4.6, CW / 2 + 4.6);
  // jumbotron giữa sân
  const jt = canvasTex(1024, 640, () => {}); const J = new THREE.Group(); J.position.set(0, 11, 0); G.add(J);
  const jm = new THREE.MeshBasicMaterial({ map: jt, toneMapped: false }); const dark = std('#0e1014', { roughness: 0.5, metalness: 0.4 });
  for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(k % 2 ? 3.4 : 4.8, 3.0), jm); const ang = k * Math.PI / 2; const r = k % 2 ? 2.53 : 1.73; f.position.set(Math.sin(ang) * r, 0, Math.cos(ang) * r); f.rotation.y = ang; J.add(f); }
  const box = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.3, 3.4), dark); J.add(box);
  const ring = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.3, 3.7), dark); ring.position.y = -1.75; J.add(ring); const led = new THREE.Mesh(new THREE.BoxGeometry(5.34, 0.1, 3.74), new THREE.MeshBasicMaterial({ color: '#2fbf63' })); led.position.y = -1.68; J.add(led);
  const ringT = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.3, 3.7), dark); ringT.position.y = 1.82; J.add(ringT);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 30), dark); c.position.set(sx * 2.1, 17, sz * 1.4); J.add(c); }
  // trần tối + giàn đèn
  scene.background = new THREE.Color('#1b2333'); scene.fog = new THREE.Fog('#2a3346', 55, 140);
  // băng ghế 2 đội + bàn thư ký ở biên z = +B0
  const B0 = CW / 2 + 1.6;
  const table = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 0.7), [std('#111'), std('#111'), std('#111'), std('#111'), new THREE.MeshBasicMaterial({ map: ledTex(o) }), std('#111')]); table.position.set(0, 0.4, B0 + 0.3); table.rotation.y = Math.PI; G.add(table);
  const benches = []; for (const s of [-1, 1]) { const bg = new THREE.Group(); bg.position.set(s * 8.5, 0, B0 + 0.5); G.add(bg);
    for (let i = 0; i < 7; i++) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), std(s < 0 ? '#98002E' : o.paint)); ch.position.set((i - 3) * 0.62, 0.48, 0); bg.add(ch); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), std(s < 0 ? '#98002E' : o.paint)); bk.position.set((i - 3) * 0.62, 0.8, 0.25); bg.add(bk);
      const lg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), std('#222')); lg.position.set((i - 3) * 0.62, 0.23, 0); bg.add(lg); } benches.push(bg); }
  G.traverse((x) => { if (x.isMesh && x !== floor) x.castShadow = x.castShadow || false; });
  return { group: G, hoops, jumbo: { group: J, tex: jt }, benches, CL, CW, B0, crowd: G.userData.crowd };
}
let _led = null;
export const ledTexture = () => _led;
function ledTex(o) { return _led ??= canvasTex(2048, 128, (g, W, H) => { g.fillStyle = '#1f5f3a'; g.fillRect(0, 0, W, H); g.font = '900 78px Inter'; g.textBaseline = 'middle'; let x = 20; let k = 0;
  while (x < W) { const t = ['MILWAUKEE', 'WHAT IF', 'GIANNIS vs 5', 'MIAMI'][k++ % 4]; g.fillStyle = k % 2 ? o.cream : '#ffffff'; g.fillText(t, x, H / 2 + 4); x += g.measureText(t).width + 70; } }, [1, 1]); }

export function arenaLights(scene) {
  const hemi = new THREE.HemisphereLight('#ffffff', '#b8946a', 2.7); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff4e6', 3.2); key.position.set(-6, 26, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 12, bottom: -12, near: 1, far: 60 }); key.shadow.bias = -0.0004; key.shadow.radius = 3; scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight('#eef3ff', 1.6); fill.position.set(10, 14, 16); scene.add(fill);
  const rim = new THREE.DirectionalLight('#ffe2c0', 0.6); rim.position.set(0, 8, -20); scene.add(rim);
  return { hemi, key, fill, rim };
}

// cúp MVP: cúp vàng có quả bóng trên đỉnh
export function mvpTrophy(h = 0.6) {
  const g = new THREE.Group(); const gold = std('#d8ab2e', { metalness: 0.9, roughness: 0.22 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * h, 0.2 * h, 0.22 * h, 32), std('#1b1b1b', { roughness: 0.35 })); base.position.y = 0.11 * h; g.add(base);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.205 * h, 0.205 * h, 0.03 * h, 32), gold); plate.position.y = 0.23 * h; g.add(plate);
  const pts = [[0.12, 0], [0.05, 0.08], [0.04, 0.4], [0.07, 0.48], [0.03, 0.55]].map(([r, y]) => new THREE.Vector2(r * h, y * h));
  const col = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), gold); col.position.y = 0.24 * h; g.add(col);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13 * h, 32, 20), gold); ball.position.y = 0.92 * h; g.add(ball);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.131 * h, 0.006 * h, 6, 40), std('#8a6a12', { metalness: 0.8, roughness: 0.3 })); seam.position.copy(ball.position); g.add(seam);
  const seam2 = seam.clone(); seam2.rotation.y = Math.PI / 2; g.add(seam2); const seam3 = seam.clone(); seam3.rotation.x = Math.PI / 2; g.add(seam3);
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); return g;
}
// phong bì lượt chọn draft
let _pk = null;
export function pickEnvelope(label = 'PICK') {
  _pk ??= canvasTex(256, 160, (g, W, H) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c9bc98'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(W / 2, H * 0.55); g.lineTo(W, 0); g.stroke();
    g.fillStyle = '#00471B'; g.font = '900 52px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PICK', W / 2, H * 0.75); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.01), [std('#e9e0c8'), std('#e9e0c8'), std('#e9e0c8'), std('#e9e0c8'), new THREE.MeshStandardMaterial({ map: _pk, roughness: 0.8 }), std('#e9e0c8')]);
  m.castShadow = true; return m;
}

function stands(G, o, A, B) {
  const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const seatG = mergeGeometries([box(0.46, 0.07, 0.42, 0, 0.42, 0), box(0.46, 0.46, 0.06, 0, 0.66, -0.2)].map((g) => g.toNonIndexed()));
  const torsoG = box(0.4, 0.46, 0.26, 0, 0.72, -0.02).toNonIndexed(), headG = new THREE.IcosahedronGeometry(0.12, 0).translate(0, 1.1, 0), legG = box(0.38, 0.14, 0.42, 0, 0.5, 0.18);
  const seats = [], ppl = [];
  const seatCols = { lo: o.seat || '#0f6b35', hi: o.seatHi || '#0f6b35', acc: o.cream };
  const riserM = new THREE.MeshStandardMaterial({ color: '#b9b2a6', roughness: 0.9 });
  const ROW = 0.85, RISE = 0.44; let rnd = 7; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const sides = [[0, -B, 0, A], [0, B, Math.PI, A], [-A, 0, Math.PI / 2, B], [A, 0, -Math.PI / 2, B]];
  const shirts = [o.paint, '#2d6a45', o.cream, '#ffffff', '#5aa77a', '#98002E', '#5a7fc4', '#e2c25a', '#d9864f', '#8a6fb4', '#d8d8d8', '#333333', o.cream, '#ffffff'];
  const skins = ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f'];
  for (const [sx, sz, ry, half] of sides) {
    const g = new THREE.Group(); g.position.set(sx, 0, sz); g.rotation.y = ry; G.add(g); g.updateMatrixWorld(true);
    const rows = (start, n, y0, tier) => { for (let r = 0; r < n; r++) { const d = start + r * ROW, y = y0 + r * RISE, len = 2 * half + 2 * d;
      const riser = new THREE.Mesh(new THREE.BoxGeometry(len, y + 0.02, ROW), riserM); riser.position.set(0, (y + 0.02) / 2, -d - ROW / 2); riser.receiveShadow = true; g.add(riser);
      const nSeat = Math.floor(len / 0.56);
      for (let k = 0; k < nSeat; k++) { if (k % 16 === 7) continue; const x = -len / 2 + (k + 0.5) * 0.56; if (Math.abs(x) > half + d - 0.3) continue;
        const m = new THREE.Matrix4().makeTranslation(x, y + 0.02, -d - ROW * 0.45).premultiply(g.matrixWorld);
        const accent = tier === 'lo' && (r === 0 || (k % 16 === 6 || k % 16 === 8)); seats.push([m, accent ? seatCols.acc : seatCols[tier]]);
        if (R() < (tier === 'lo' ? 0.62 : 0.42)) ppl.push([m, shirts[Math.floor(R() * shirts.length)], skins[Math.floor(R() * skins.length)], R()]); } } };
    const fb = new THREE.Mesh(new THREE.PlaneGeometry(2 * half + 1.4, 1.1), new THREE.MeshBasicMaterial({ map: ledTex(o), toneMapped: false })); fb.position.set(0, 0.55, 0.02); g.add(fb);
    rows(0.6, 16, 1.1, 'lo');
    const fd = 0.6 + 16 * ROW, fy = 1.1 + 16 * RISE; // dải LED + lan can giữa 2 tầng
    const led = new THREE.Mesh(new THREE.PlaneGeometry(2 * half + 2 * (fd + 3), 1.1), new THREE.MeshBasicMaterial({ map: ledTex(o), toneMapped: false })); led.position.set(0, fy + 2.1, -fd - 2.2); g.add(led);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2 * half + 2 * (fd + 3), 3.2, 0.3), new THREE.MeshStandardMaterial({ color: '#203024', roughness: 0.7 })); wall.position.set(0, fy + 1.4, -fd - 2.4); g.add(wall);
    rows(fd + 2.6, 14, fy + 3.0, 'hi');
  }
  // gộp toàn bộ ghế + khán giả thành 1 lưới tĩnh có màu theo đỉnh (ít tam giác, nhanh trên CPU, không cần instancing)
  // gộp ghế + khán giả thành 1 lưới tĩnh; khán giả cử động trong vertex shader (nhún, giơ 2 tay cổ vũ, gục đầu ngủ)
  // thuộc tính: cp = (loại: 0 ghế, 1 thân, 1.5 đầu, 2/3 tay; pha; độ hăng; _), piv = khớp vai (thế giới), fax = hướng nhìn về sân
  const armG = box(0.09, 0.4, 0.09, 0, -0.2, 0).toNonIndexed();
  const P = [], C = [], CP = [], PV = [], FX = [];
  const v = new THREE.Vector3(), col = new THREE.Color(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const add = (geo, m, color, cp, piv, fax) => { col.set(color).convertSRGBToLinear(); const n = geo.attributes.position.count;
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(geo.attributes.position, i).applyMatrix4(m); P.push(v.x, v.y, v.z); C.push(col.r, col.g, col.b); CP.push(...cp); PV.push(piv.x, piv.y, piv.z); FX.push(fax.x, fax.y, fax.z); } };
  const zero = new THREE.Vector3();
  for (const [m, c] of seats) add(seatG, m, c, [0, 0, 0, 0], zero, zero);
  for (const [m, shirt, skin, r] of ppl) { m.decompose(pos, q, sc); const fax = new THREE.Vector3(0, 0, 1).applyQuaternion(q); const ph = r * 40, am = 0.55 + 0.45 * ((r * 7.3) % 1);
    add(torsoG, m, shirt, [1, ph, am, 0], zero, fax); add(headG, m, skin, [1.5, ph, am, 0], zero, fax);
    for (const sx of [-1, 1]) { const off = new THREE.Vector3(sx * 0.25, 0.94, -0.02); const sh = off.clone().applyMatrix4(m);
      const am4 = new THREE.Matrix4().makeTranslation(off.x, off.y, off.z).premultiply(m); const ow = off.clone().setY(0).applyQuaternion(q);
      const d = new THREE.Vector3(0, -1, 0), sgn = Math.sign(new THREE.Vector3().crossVectors(fax, d).dot(ow)) || 1;
      add(armG, am4, shirt, [sgn > 0 ? 2 : 3, ph, am, 0], sh, fax); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  geo.setAttribute('cp', new THREE.Float32BufferAttribute(CP, 4)); geo.setAttribute('piv', new THREE.Float32BufferAttribute(PV, 3)); geo.setAttribute('fax', new THREE.Float32BufferAttribute(FX, 3)); geo.computeVertexNormals();
  const U = { uT: { value: 0 }, uCheer: { value: 0.2 }, uSleep: { value: 0 } };
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cp; attribute vec3 piv; attribute vec3 fax; uniform float uT, uCheer, uSleep;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      if (cp.x > 0.5) { float ch = clamp(uCheer * cp.z * (0.7 + 0.6 * fract(cp.y * 0.37)), 0.0, 1.0); float w = uT * (5.0 + cp.z * 3.0) + cp.y;
        if (cp.x > 1.9) { float s = cp.x < 2.5 ? 1.0 : -1.0; float ang = s * (0.12 + ch * (2.5 + 0.35 * sin(w * 1.3)) + 0.06 * sin(uT * 1.7 + cp.y));
          vec3 r = transformed - piv; r = r * cos(ang) + cross(fax, r) * sin(ang) + fax * dot(fax, r) * (1.0 - cos(ang)); transformed = piv + r; }
        transformed.y += (0.012 + 0.12 * ch) * max(0.0, sin(w)) * (1.0 - uSleep);
        if (cp.x > 1.4 && cp.x < 1.6) { transformed += fax * 0.07 * uSleep; transformed.y -= 0.13 * uSleep; }
        if (cp.x > 1.9) transformed.y -= 0.05 * uSleep; }`); };
  mat.customProgramCacheKey = () => 'crowd';
  const all = new THREE.Mesh(geo, mat); all.matrixAutoUpdate = false; all.frustumCulled = false; G.add(all); G.userData.crowd = U;
  // trần: giàn đèn sáng
  const lm = new THREE.MeshBasicMaterial({ color: '#fff6dc' });
  for (let i = -3; i <= 3; i++) for (const zz of [-8, 8]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.8), lm); l.position.set(i * 6, 26, zz); G.add(l); }
  const truss = new THREE.MeshStandardMaterial({ color: '#2a3140', roughness: 0.8 });
  for (const zz of [-8, 8]) { const t = new THREE.Mesh(new THREE.BoxGeometry(44, 0.5, 0.5), truss); t.position.set(0, 26.4, zz); G.add(t); }
}
