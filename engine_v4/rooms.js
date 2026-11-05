import { THREE, scene, ctex, lam, toon, outline, box, plane, R, setSeed, INK, woodTex, parquetTex, wallpaperTex, signTex, stampTex, Char, imgTex, paintedMat } from './core.js';
function painted(parent, url, x, y, z, w, h, ry = 0, rep = 1, k = 0.55) { const t = imgTex(url, rep !== 1 ? [rep, 1] : null); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), paintedMat(t, k)); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; parent.add(m); return m; }

// generic room: back wall z=-d/2, side walls x=±w/2, floor y=0, ceiling y=h; open front
function room(ox, w, d, h, wall, floorTex) {
  for (const t of [wall, floorTex]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  const g = new THREE.Group(); g.position.set(ox, 0, 0); scene.add(g); g.visible = false;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 8), lam(0xffffff, { map: floorTex })); fl.rotation.x = -Math.PI / 2; fl.position.z = 4; fl.receiveShadow = true; g.add(fl);
  const wm = lam(0xffffff, { map: wall });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); back.position.set(0, h / 2, -d / 2); back.receiveShadow = true; g.add(back);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(d + 8, h), wm); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * w / 2, h / 2, 4); sw.receiveShadow = true; g.add(sw); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 8), lam(0xf3ece0)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, h, 4); g.add(ceil);
  // skirting + cornice
  box(w, 0.22, 0.06, lam(0xf3ece0), 0, 0.11, -d / 2 + 0.03, g); box(w, 0.18, 0.1, lam(0xf3ece0), 0, h - 0.09, -d / 2 + 0.05, g);
  for (const s of [-1, 1]) { box(0.06, 0.22, d + 8, lam(0xf3ece0), s * (w / 2 - 0.03), 0.11, 4, g); }
  return g;
}
function windowPane(parent, x, y, z, w, h, viewTex, ry = 0) { const wg = new THREE.Group(); wg.position.set(x, y, z); wg.rotation.y = ry; parent.add(wg);
  const v = plane(w, h, new THREE.MeshBasicMaterial({ map: viewTex }), wg); v.position.z = 0.01;
  const fm = toon(0xf7f2e6); box(w + 0.24, 0.14, 0.12, fm, 0, h / 2, 0.05, wg, 0.01); box(w + 0.24, 0.14, 0.12, fm, 0, -h / 2, 0.05, wg, 0.01); box(0.14, h, 0.12, fm, -w / 2, 0, 0.05, wg, 0.01); box(0.14, h, 0.12, fm, w / 2, 0, 0.05, wg, 0.01); box(0.08, h, 0.08, fm, 0, 0, 0.05, wg); box(w, 0.08, 0.08, fm, 0, h * 0.15, 0.05, wg);
  box(w + 0.5, 0.1, 0.35, fm, 0, -h / 2 - 0.08, 0.15, wg, 0.01); return wg; }
function frame(parent, x, y, z, w, h, tex, ry = 0) { const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; parent.add(f); box(w + 0.16, h + 0.16, 0.06, toon(0xc99a3a), 0, 0, 0, f, 0.012); const p = plane(w, h, lam(0xffffff, { map: tex }), f); p.position.z = 0.035; return f; }
function nightView(tower = true) { return ctex(512, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141a45'); gr.addColorStop(1, '#3b3f7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect(R(0, w), R(0, h * 0.6), 2, 2); g.fillStyle = '#fdf5d0'; g.beginPath(); g.arc(w * 0.78, h * 0.18, 34, 0, 7); g.fill();
  if (tower) { g.strokeStyle = '#d9a24a'; g.lineWidth = 7; g.beginPath(); g.moveTo(w * 0.28, h); g.quadraticCurveTo(w * 0.42, h * 0.62, w * 0.45, h * 0.22); g.quadraticCurveTo(w * 0.48, h * 0.62, w * 0.62, h); g.stroke(); g.lineWidth = 3; for (let y = h * 0.35; y < h; y += 30) { const k = (y - h * 0.22) / (h * 0.78); g.beginPath(); g.moveTo(w * 0.45 - k * 0.17 * w, y); g.lineTo(w * 0.45 + k * 0.17 * w, y); g.stroke(); } }
  g.fillStyle = '#1d2050'; for (let x = 0; x < w; x += 70) { const bh = R(80, 160); g.fillRect(x, h - bh, 66, bh); g.fillStyle = '#f2d27a'; for (let k = 0; k < 4; k++) g.fillRect(x + 10 + (k % 2) * 28, h - bh + 20 + Math.floor(k / 2) * 40, 14, 20); g.fillStyle = '#1d2050'; } }); }
function dayView(kind) { return ctex(512, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5e9be0'); gr.addColorStop(1, '#cfe3f3'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; for (const [x, y] of [[90, 120], [330, 80]]) { g.beginPath(); g.arc(x, y, 30, 0, 7); g.arc(x + 35, y - 10, 38, 0, 7); g.arc(x + 75, y, 28, 0, 7); g.fill(); }
  if (kind === 'vienna') { g.fillStyle = '#7d6a5a'; g.beginPath(); g.moveTo(w * 0.55, h * 0.12); g.lineTo(w * 0.62, h * 0.55); g.lineTo(w * 0.48, h * 0.55); g.closePath(); g.fill(); g.fillStyle = '#c9b39a'; g.fillRect(w * 0.44, h * 0.55, w * 0.22, h * 0.45); g.fillStyle = '#3f6e5a'; g.beginPath(); g.arc(w * 0.2, h * 0.68, 50, Math.PI, 0); g.fill(); }
  for (let x = 0; x < w; x += 90) { const bh = R(140, 230); g.fillStyle = `hsl(${R(20, 45)}, 30%, ${R(70, 82)}%)`; g.fillRect(x, h - bh, 86, bh); g.fillStyle = '#b35a3e'; g.beginPath(); g.moveTo(x - 6, h - bh); g.lineTo(x + 43, h - bh - 40); g.lineTo(x + 92, h - bh); g.fill(); g.fillStyle = '#5d6b7b'; for (let k = 0; k < 4; k++) g.fillRect(x + 14 + (k % 2) * 36, h - bh + 30 + Math.floor(k / 2) * 55, 20, 30); } }); }
function curtain(col) { return ctex(256, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, 'rgba(0,0,0,0.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.28)'); g.fillStyle = gr; g.fillRect(x, 0, 32, h); } g.fillStyle = '#e2b33b'; g.fillRect(0, h - 26, w, 14); }); }

// =================== HOTEL SUITE (x = 200) ===================
setSeed(501);
export const H = { g: room(200, 9, 10, 4.6, wallpaperTex('#8e2433', '#a8394a'), parquetTex(30, 44)) };
const hg = H.g;
H.g.children[0].material.map.repeat.set(4, 6);
H.g.children[1].material.map.repeat.set(4, 2);
// table along z
const tbl = box(1.8, 0.1, 6.2, toon(0xffffff, { map: woodTex(22, 30, 8, true) }), 0, 0.88, -0.3, hg, 0.015);
for (const [x, z] of [[-0.75, 2.6], [0.75, 2.6], [-0.75, -3.2], [0.75, -3.2]]) box(0.12, 0.85, 0.12, toon(0x4a2a16), x, 0.43, z, hg, 0.01);
const cloth = box(0.5, 0.012, 6.0, lam(0x2f6e4f), 0, 0.94, -0.3, hg);
// chairs
for (const [x, z] of [[-1.05, 1.6], [-1.05, 0.0], [-1.05, -1.6], [1.05, 0.8], [1.05, -0.8]]) { const ch = new THREE.Group(); box(0.5, 0.08, 0.5, toon(0xb8862f), 0, 0.55, 0, ch, 0.01); box(0.06, 0.55, 0.06, toon(0x6b3f1e), 0, 0.27, 0, ch); ch.position.set(x + Math.sign(x) * 0.35, 0, z + 0.45); hg.add(ch); }
// back wall: window w/ curtains, easel chalkboard
painted(hg, 'mg/hotel_back.jpg', 0, 2.3, -4.97, 9, 5.06);
for (const sd of [-1, 1]) painted(hg, 'mg/hotel_side.jpg', sd * 4.47, 2.3, 4, 18, 4.6, -sd * Math.PI / 2, 18 / 8.2);
export const curtains = [-1, 1].map(s => { const c = plane(1.15, 2.9, lam(0xffffff, { map: curtain('#6e1622'), side: THREE.DoubleSide }), hg); c.position.set(0 + s * 1.35, 2.25, -4.8); c.userData.s = s; return c; });

const easel = new THREE.Group(); easel.position.set(-1.55, 0, -4.3); hg.add(easel);
for (const x of [-0.6, 0.6]) { const l = box(0.08, 2.6, 0.08, toon(0x6b4423), x, 1.3, 0, easel, 0.01); l.rotation.z = -x * 0.08; }
export const chalk = ctex(768, 576, (g, w, h) => { g.fillStyle = '#2d3b33'; g.fillRect(0, 0, w, h); });
const chalkBoard = box(1.6, 1.2, 0.06, [lam(0x6b4423), lam(0x6b4423), lam(0x6b4423), lam(0x6b4423), lam(0xffffff, { map: chalk }), lam(0x6b4423)], 0, 1.9, 0, easel, 0.015);
export function drawChalk(k1, k2) { const g = chalk.userData.g, w = 768, h = 576; g.fillStyle = '#2d3b33'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6440'; g.lineWidth = 24; g.strokeRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(40, 60, 200, 10); g.font = 'bold 140px "DejaVu Sans", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
  const s1 = '7,000'; const n1 = Math.floor(s1.length * k1); g.fillStyle = '#f4f1e6'; g.fillText(s1.slice(0, n1), 70, 220);
  g.font = 'bold 120px "DejaVu Sans", sans-serif'; const s2 = 'TONS'; const n2 = Math.floor(s2.length * k2); g.fillText(s2.slice(0, n2), 70, 390);
  if (k2 >= 1) { g.strokeStyle = '#f2c94c'; g.lineWidth = 8; g.beginPath(); g.moveTo(60, 470); g.quadraticCurveTo(380, 450, 700, 480); g.stroke(); }
  chalk.needsUpdate = true; }
drawChalk(0, 0);
// chandelier + lights
const chand = new THREE.Group(); chand.position.set(0, 4.2, -0.3); hg.add(chand);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0x8a6a2a })); ring.rotation.x = Math.PI / 2; chand.add(ring);
for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff1c4 })); b.position.set(Math.cos(i) * 0.55, 0.08, Math.sin(i) * 0.55); chand.add(b); }
box(0.03, 0.7, 0.03, toon(0xe2b33b), 0, 0.4, 0, chand);
export const hLight = new THREE.PointLight(0xffd9a0, 18, 14, 1.6); hLight.position.set(0, 3.1, -0.3); hg.add(hLight);
export const hSpot = new THREE.SpotLight(0xfff0d0, 0, 12, 0.32, 0.5, 1.2); hSpot.castShadow = true; hSpot.shadow.mapSize.set(1024, 1024); hSpot.position.set(1.6, 4.4, 2.6); hg.add(hSpot); hg.add(hSpot.target);
export const hKey = new THREE.DirectionalLight(0xfff1d6, 1.2); hKey.position.set(-3, 6, 6); hKey.castShadow = true; hKey.shadow.mapSize.set(2048, 2048); const kc = hKey.shadow.camera; kc.left = -6; kc.right = 6; kc.top = 6; kc.bottom = -6; kc.far = 30; hg.add(hKey); hKey.target.position.set(0, 0, -1); hg.add(hKey.target);
// frames on side walls
// door + plaque on left wall near front
const door = box(0.1, 2.6, 1.3, toon(0x5a3420), -4.45, 1.3, 3.2, hg, 0.012);
export const plaque = plane(0.95, 0.62, lam(0xffffff, { map: signTex(512, 336, '#d9b23e', [{ t: 'HÔTEL DE', size: 54, y: 82 }, { t: 'CRILLON', size: 92, y: 168 }, { t: 'SUITE ROYALE', size: 46, y: 262 }], 16) }), hg); plaque.rotation.y = Math.PI / 2; plaque.position.set(-4.40, 1.75, 2.15);
// table props
export const model = new THREE.Group(); model.position.set(0.55, 0.95, -2.7); hg.add(model);
{ const mt = ctex(256, 512, (g, w, h) => { g.strokeStyle = '#2b1d16'; g.lineCap = 'round'; const draw = (col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(30, 500); g.quadraticCurveTo(105, 300, 122, 40); g.moveTo(226, 500); g.quadraticCurveTo(151, 300, 134, 40); g.stroke(); g.beginPath(); for (let y = 120; y < 500; y += 46) { const k = (y - 40) / 460, x0 = 128 - 12 - k * k * 86, x1 = 128 + 12 + k * k * 86; g.moveTo(x0, y); g.lineTo(x1, y); } g.stroke(); g.beginPath(); g.moveTo(60, 500); g.quadraticCurveTo(128, 380, 196, 500); g.stroke(); g.beginPath(); g.moveTo(128, 40); g.lineTo(128, 6); g.stroke(); }; draw('#2b1d16', 22); draw('#9a6a44', 12); g.fillStyle = '#9a6a44'; g.strokeStyle = '#2b1d16'; g.lineWidth = 6; g.fillRect(52, 300, 152, 18); g.strokeRect(52, 300, 152, 18); g.fillRect(80, 180, 96, 14); g.strokeRect(80, 180, 96, 14); });
  const card = plane(0.36, 0.72, new THREE.MeshLambertMaterial({ map: mt, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }), model); card.position.y = 0.38; card.castShadow = true; box(0.4, 0.03, 0.2, toon(0x5a3a1e), 0, 0.015, 0, model, 0.006); model.userData.card = card; }
export const weight = new THREE.Group(); hg.add(weight);
{ const wgeo = new THREE.CylinderGeometry(0.28, 0.4, 0.42, 4); wgeo.rotateY(Math.PI / 4); const wm = new THREE.Mesh(wgeo, toon(0x45484f)); wm.position.y = 0.21; wm.castShadow = true; outline(wm, 0.015); weight.add(wm);
  const lab = plane(0.42, 0.22, lam(0xffffff, { map: signTex(256, 128, null, [{ t: '7000 T', size: 74, col: '#f4f1e6', y: 66 }], 0) , transparent: true }), weight); lab.position.set(0, 0.2, 0.3); lab.rotation.x = -0.28;
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), toon(0x45484f)); hd.position.y = 0.42; weight.add(hd); }
export const nameCard = (() => { const c = new THREE.Group(); const t = signTex(320, 120, '#fbf6e8', [{ t: 'A. POISSON', size: 50, y: 62 }], 6); for (const s of [-1, 1]) { const p = plane(0.5, 0.19, lam(0xffffff, { map: t, side: THREE.DoubleSide }), c); p.rotation.y = -Math.PI / 2; p.rotation.z = 0; p.position.set(0, 0.08, 0); p.rotation.x = 0; p.rotation.order = 'YXZ'; p.rotation.set(s * 0.45, -Math.PI / 2, 0); p.position.x = s * 0.04; } c.position.set(0.6, 0.95, 0.8); hg.add(c); return c; })();
// top-down payment props: envelopes + sleeve/hand cards
const envTex = (label, col) => ctex(512, 320, (g, w, h) => { g.fillStyle = '#e9d6a8'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.lineWidth = 6; g.beginPath(); g.moveTo(5, 5); g.lineTo(w / 2, h * 0.55); g.lineTo(w - 5, 5); g.stroke(); g.fillStyle = '#8fc070'; for (let i = 0; i < 3; i++) g.fillRect(40 + i * 10, 20 - i * 6, w - 80, 40); g.fillStyle = col; g.font = 'bold 64px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, h * 0.78); });
export const env1 = plane(0.62, 0.39, lam(0xffffff, { map: envTex('1,000,000 ₣', '#2b5d2b') }), hg); env1.rotation.x = -Math.PI / 2; env1.visible = false;
export const env2 = plane(0.5, 0.31, lam(0xffffff, { map: envTex('BRIBE', '#b02626') }), hg); env2.rotation.x = -Math.PI / 2; env2.visible = false;
function armTex(col) { return ctex(512, 128, (g, w, h) => { g.fillStyle = '#23263b'; g.beginPath(); g.moveTo(0, 44); g.quadraticCurveTo(w * 0.5, 50, w - 70, 50); g.lineTo(w - 70, 78); g.quadraticCurveTo(w * 0.5, 80, 0, 86); g.closePath(); g.fill(); g.beginPath(); g.arc(w - 66, 64, 26, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 52, w - 90, 5); g.fillStyle = col; g.fillRect(0, 36, 40, 56); }); }
export const armP = plane(1.2, 0.3, lam(0xffffff, { map: armTex('#a8693a'), transparent: true, alphaTest: 0.1 }), hg); armP.rotation.x = -Math.PI / 2; armP.visible = false;
export const armL = plane(1.2, 0.3, lam(0xffffff, { map: armTex('#24252b'), transparent: true, alphaTest: 0.1 }), hg); armL.rotation.x = -Math.PI / 2; armL.visible = false;
// characters
export const hc = { lustig: new Char('lustig', hg), poisson: new Char('poisson', hg), d1: new Char('d1', hg), d2: new Char('d2', hg), d3: new Char('d3', hg), d4: new Char('d4', hg), n1: new Char('n1', hg), n2: new Char('n2', hg), n3: new Char('n3', hg), n4: new Char('n4', hg), n5: new Char('n5', hg) };
export const SEATS = [[-1.05, 1.6], [-1.05, 0.0], [-1.05, -1.6], [1.05, 0.8], [1.05, -0.8]]; // d1,d2,d3, poisson, d4
export const hStamp = plane(0.5, 0.25, new THREE.MeshBasicMaterial({ map: stampTex('SOLD'), transparent: true, depthWrite: false }), hg); hStamp.visible = false;
export const deedTD = plane(0.5, 0.66, lam(0xffffff, { map: signTex(400, 528, '#fbf6e8', [{ t: 'DEED', size: 64, y: 70 }, { t: 'EIFFEL TOWER', size: 34, y: 125, col: '#555' }], 6, (g, w) => { g.fillStyle = '#9a9488'; for (let i = 0; i < 6; i++) g.fillRect(40, 180 + i * 40, w - 80, 10); }) }), hg); deedTD.rotation.x = -Math.PI / 2; deedTD.visible = false;

// =================== LUSTIG ROOM (night, x = 300) ===================
setSeed(601);
export const L = { g: room(300, 6, 6, 3.6, wallpaperTex('#24434a', '#2c5058'), woodTex(26, 30, 6, false)) };
const lg = L.g; L.g.children[0].material.map.repeat.set(3, 4); L.g.children[1].material.map.repeat.set(3, 1.5);
painted(lg, 'mg/study.jpg', 0, 1.8, -2.985, 6.43, 3.6, 0, 1, 0.5);
const desk = box(2.2, 0.1, 1.0, toon(0xffffff, { map: woodTex(24, 30, 5) }), -0.3, 0.9, -2.2, lg, 0.012);
for (const [x, z] of [[-1.3, -1.8], [0.7, -1.8], [-1.3, -2.6], [0.7, -2.6]]) box(0.08, 0.88, 0.08, toon(0x4a2a16), x, 0.44, z, lg);
const lampG = new THREE.Group(); lampG.position.set(-1.05, 0.95, -2.45); lg.add(lampG);
{ const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), toon(0x2f6e4f)); st.position.y = 0.28; lampG.add(st); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.22, 16, 1, true), toon(0x2f8f5a, { side: THREE.DoubleSide })); sh.position.y = 0.6; lampG.add(sh); outline(sh, 0.01); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff1c4 })); bulb.position.y = 0.52; lampG.add(bulb); }
export const lLamp = new THREE.SpotLight(0xffd9a0, 22, 8, 0.9, 0.6, 1.4); lLamp.position.set(-1.05, 1.5, -2.45); lLamp.castShadow = true; lLamp.shadow.mapSize.set(1024, 1024); lg.add(lLamp); lLamp.target.position.set(-0.2, 0.9, -1.8); lg.add(lLamp.target);
export const letterTex = ctex(900, 1200, (g, w, h) => { g.scale(1.5, 1.5); w = 600; h = 800; g.fillStyle = '#fbf8ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b4f9c'; g.font = 'bold 40px "DejaVu Serif", serif'; g.textAlign = 'center'; g.fillText('RÉPUBLIQUE FRANÇAISE', w / 2, 90); g.fillStyle = INK; g.font = 'bold 52px "DejaVu Serif", serif'; g.fillText('MINISTRY OF', w / 2, 175); g.fillText('POSTS & TELEGRAPHS', w / 2, 240);
  g.fillRect(60, 270, w - 120, 4); g.font = 'italic 36px "DejaVu Serif", serif'; g.fillText('Deputy Director-General', w / 2, 320); g.font = '30px "DejaVu Serif", serif'; g.fillText('V. Lustig', w / 2, 362); g.fillStyle = '#9a9488'; for (let i = 0; i < 7; i++) g.fillRect(70, 430 + i * 38, w - 140, 9); g.fillStyle = '#b02626'; g.font = 'bold 30px "DejaVu Sans", sans-serif'; g.fillText('CONFIDENTIAL', w / 2, 735); });
export const letter = plane(0.6, 0.8, lam(0xbdb7ab, { map: letterTex }), lg); letter.rotation.x = -Math.PI / 2; letter.position.set(-0.1, 0.956, -2.05); letter.rotation.z = -0.08;
export const seal = plane(0.3, 0.3, new THREE.MeshBasicMaterial({ map: ctex(256, 256, (g, w, h) => { g.fillStyle = '#b8232b'; g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 110 : 124; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); g.strokeStyle = '#ffd7d7'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 78, 0, 7); g.stroke(); g.fillStyle = '#ffe9e9'; g.font = 'bold 48px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RF', w / 2, h / 2 + 4); }), transparent: true, depthWrite: false }), lg); seal.rotation.x = -Math.PI / 2; seal.position.set(0.05, 0.958, -1.82); seal.visible = false;
export const stack = []; for (let i = 0; i < 9; i++) { const s = box(0.6, 0.012, 0.8, lam(0xfbf8ee), 0.75, 0.96 + i * 0.013, -2.2, lg); s.rotation.y = R(-0.08, 0.08); s.visible = false; stack.push(s); }
export const lc = { lustig: new Char('lustig', lg) };

// =================== VIENNA ROOM (x = 400) ===================
setSeed(701);
export const V = { g: room(400, 6, 6, 3.6, wallpaperTex('#9fb8c9', '#b6cbd8', 'stripe'), parquetTex(32, 52)) };
const vg = V.g; V.g.children[0].material.map.repeat.set(3, 4); V.g.children[1].material.map.repeat.set(3, 1.5);
painted(vg, 'mg/vienna.jpg', 0, 1.8, -2.985, 6.43, 3.6, 0, 1, 0.5);
export const vLight = new THREE.DirectionalLight(0xfff4e0, 1.6); vLight.position.set(2, 5, 3); vLight.castShadow = true; vLight.shadow.mapSize.set(1024, 1024); const vc = vLight.shadow.camera; vc.left = -4; vc.right = 4; vc.top = 4; vc.bottom = -4; vg.add(vLight); vLight.target.position.set(0, 0, -1); vg.add(vLight.target);
const side = box(0.9, 0.08, 0.7, toon(0xffffff, { map: woodTex(24, 34, 4) }), -1.4, 0.75, -2.2, vg, 0.01); box(0.08, 0.72, 0.08, toon(0x4a2a16), -1.4, 0.37, -2.2, vg);
for (let i = 0; i < 7; i++) { const n = box(0.62, 0.035, 0.46, lam(0xf1ead8), -1.4 + R(-0.05, 0.05), 0.8 + i * 0.037, -2.2 + R(-0.04, 0.04), vg); n.rotation.y = R(-0.2, 0.2); }
export const calPages = []; export const calendar = new THREE.Group(); calendar.position.set(-1.45, 2.1, -2.97); vg.add(calendar);
box(0.8, 0.95, 0.04, lam(0xb02626), 0, 0, 0, calendar, 0.01);
const calTex = (top, big, col = '#b02626') => signTex(320, 360, '#fbf8ee', [{ t: top, size: 50, col: '#ffffff', y: 38 }, { t: big, size: big.length > 3 ? 88 : (big.length === 3 ? 116 : 170), y: 210 }], 6, (g, w) => { g.fillStyle = col; g.fillRect(0, 0, w, 76); });
export const CAL_DAYS = ['MAY|27', 'MAY|28', 'MAY|29', 'MAY|30', 'MAY|31', 'JUNE|1', 'JUNE|2'].map(s => calTex(...s.split('|')));
export const CAL_MONTHS = ['JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV'].map(m => calTex('1925', m, '#2b4f9c'));
export const calPage = plane(0.72, 0.81, lam(0xffffff, { map: CAL_DAYS[0] }), calendar); calPage.position.z = 0.03;
export const calFlip = plane(0.72, 0.81, lam(0xffffff, { map: CAL_DAYS[0] }), calendar); { const bk = plane(0.72, 0.81, new THREE.MeshBasicMaterial({ color: 0xd9d2c0 }), calFlip); bk.rotation.y = Math.PI; bk.position.set(0, 0, -0.001); bk.geometry.translate(0, -0.405, 0); } calFlip.position.z = 0.035; calFlip.geometry.translate(0, -0.405, 0); calFlip.position.y = 0.405;
const clock = new THREE.Group(); clock.position.set(0.0, 2.75, -2.97); vg.add(clock);
{ const face = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), lam(0xfbf8ee)); face.position.z = 0.02; clock.add(face); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 32), toon(0xc99a3a)); clock.add(rim); }
export const hands = [0.18, 0.24].map((l, i) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.02, l, 0.01), new THREE.MeshBasicMaterial({ color: 0x2b1d16 })); h.geometry.translate(0, l / 2, 0); h.position.z = 0.035; clock.add(h); return h; });
const arm = new THREE.Group(); arm.position.set(1.4, 0, -1.6); vg.add(arm); box(1.1, 0.5, 0.9, toon(0x2f6e4f), 0, 0.45, 0, arm, 0.015); box(1.1, 0.9, 0.2, toon(0x2f6e4f), 0, 0.95, -0.4, arm, 0.015);
export const vc2 = { lustig: new Char('lustig', vg) };

// =================== POISSON HOME (x = 500) ===================
setSeed(801);
export const PH = { g: room(500, 6, 6, 3.4, wallpaperTex('#c99a45', '#d8b062'), woodTex(28, 36, 6, false)) };
const pg = PH.g; PH.g.children[0].material.map.repeat.set(3, 4); PH.g.children[1].material.map.repeat.set(3, 1.5);
painted(pg, 'mg/parlor.jpg', 0, 1.7, -2.985, 6.07, 3.4, 0, 1, 0.5);
export const pLight = new THREE.PointLight(0xffc98a, 16, 9, 1.5); pLight.position.set(-1.2, 2.4, -0.8); pg.add(pLight);
export const pKey = new THREE.DirectionalLight(0xffe8c8, 0.9); pKey.position.set(-2, 5, 4); pKey.castShadow = true; pKey.shadow.mapSize.set(1024, 1024); const pc = pKey.shadow.camera; pc.left = -4; pc.right = 4; pc.top = 4; pc.bottom = -4; pg.add(pKey); pKey.target.position.set(0, 0, -1); pg.add(pKey.target);
const fireplace = new THREE.Group(); fireplace.position.set(0.6, 0, -2.75); pg.add(fireplace);
box(1.8, 1.2, 0.5, toon(0xd9cdb6), 0, 0.6, 0, fireplace, 0.015); box(1.0, 0.75, 0.52, toon(0x2b2220), 0, 0.42, 0.01, fireplace); box(2.1, 0.12, 0.62, toon(0xbfb29a), 0, 1.26, 0.02, fireplace, 0.01);
const fireTex = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 110, 5, 64, 90, 60); gr.addColorStop(0, '#fff2a8'); gr.addColorStop(0.4, '#ff9b2e'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(20, 128); g.quadraticCurveTo(30, 40, 64, 10); g.quadraticCurveTo(98, 40, 108, 128); g.fill(); });
export const fire = plane(0.6, 0.55, new THREE.MeshBasicMaterial({ map: fireTex, transparent: true, depthWrite: false }), fireplace); fire.position.set(0, 0.36, 0.28);
export const deedFrame = new THREE.Group(); deedFrame.position.set(0.6, 2.05, -2.93); pg.add(deedFrame);
{ const inner = new THREE.Group(); deedFrame.add(inner); box(0.9, 1.05, 0.05, toon(0xc99a3a), 0, 0, 0, inner, 0.012); const pp = plane(0.76, 0.9, lam(0xffffff, { map: signTex(380, 450, '#fbf6e8', [{ t: 'DEED', size: 60, y: 60 }, { t: 'EIFFEL TOWER', size: 34, y: 112, col: '#555' }, { t: 'OWNER:', size: 28, y: 190, col: '#555' }, { t: 'A. POISSON', size: 40, y: 236 }], 6, (g) => { g.save(); g.translate(190, 350); g.rotate(-0.2); g.strokeStyle = '#d0262e'; g.lineWidth = 9; g.strokeRect(-110, -42, 220, 84); g.fillStyle = '#d0262e'; g.font = 'bold 64px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOLD', 0, 4); g.restore(); }) }), inner); pp.position.z = 0.03;
  const backP = plane(0.9, 1.05, lam(0x8a6a44, { side: THREE.DoubleSide }), inner); backP.position.z = -0.03; backP.rotation.y = Math.PI; deedFrame.userData.inner = inner; }
const armc = new THREE.Group(); armc.position.set(-1.6, 0, -1.7); pg.add(armc); box(1.0, 0.5, 0.9, toon(0x8e1f2a), 0, 0.45, 0, armc, 0.015); box(1.0, 0.9, 0.2, toon(0x8e1f2a), 0, 0.95, -0.4, armc, 0.015);
export const phc = { poisson: new Char('poisson', pg) };
