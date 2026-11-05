import { THREE, scene, ctex, lam, toon, outline, box, plane, R, setSeed, rnd, INK, woodTex, gravelTex, grassTex, stoneTex, signTex, DIG, stampTex, cloud, Char, imgTex, paintedMat } from './core.js';

export const P = { g: new THREE.Group() }; scene.add(P.g); const G = P.g;
setSeed(101);
// ---------- ground ----------
const grav = imgTex('mg/ground.jpg', [48, 48]);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), lam(0xffffff, { map: grav })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -20); ground.receiveShadow = true; G.add(ground);
const gr = grassTex(100, 48); gr.repeat.set(6, 20);
for (const sx of [-1, 1]) { const lawn = new THREE.Mesh(new THREE.PlaneGeometry(22, 120), lam(0xffffff, { map: gr })); lawn.rotation.x = -Math.PI / 2; lawn.position.set(sx * 34, 0.01, -10); lawn.receiveShadow = true; G.add(lawn);
  const hedge = box(1.2, 0.9, 120, toon(0x4e8f3a), sx * 22.6, 0.45, -10, G); }
// road in front (car scene)
const roadTex = ctex(512, 256, (g, w, h) => { g.fillStyle = '#6d6a66'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${R(70, 140)},${R(70, 130)},${R(70, 120)},0.6)`; g.fillRect(R(0, w), R(0, h), 3, 3); } g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let x = 0; x < w; x += 48) for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(x + (y / 32 % 2) * 24, y); g.lineTo(x + (y / 32 % 2) * 24, y + 32); g.stroke(); } }, [40, 2]);
const road = new THREE.Mesh(new THREE.PlaneGeometry(240, 9), lam(0xffffff, { map: roadTex })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, 18); road.receiveShadow = true; G.add(road);
const curb = box(240, 0.18, 0.4, lam(0xcfc6b4), 0, 0.09, 13.3, G);

// ---------- Eiffel tower ----------
const BRONZE = '#8a5a3a';
function latTex(rows = 1) { return ctex(256, 256 * rows, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#5a3824'; g.lineCap = 'square';
  const cell = 256; for (let r = 0; r < rows; r++) { const y0 = r * cell; g.lineWidth = 9; g.beginPath(); g.moveTo(10, y0); g.lineTo(w - 10, y0 + cell); g.moveTo(w - 10, y0); g.lineTo(10, y0 + cell); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(0, y0 + cell / 2); g.lineTo(w, y0 + cell / 2); g.stroke(); }
  g.lineWidth = 26; g.strokeStyle = BRONZE; g.beginPath(); g.moveTo(12, 0); g.lineTo(12, h); g.moveTo(w - 12, 0); g.lineTo(w - 12, h); g.stroke(); g.lineWidth = 6; g.strokeStyle = '#b9845a'; g.beginPath(); g.moveTo(6, 0); g.lineTo(6, h); g.moveTo(w - 18, 0); g.lineTo(w - 18, h); g.stroke(); }); }
const LAT = latTex(1);
function section(parent, p0, s0, p1, s1, tiles = 1) {
  const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1), d = b.clone().sub(a), L = d.length();
  const geo = new THREE.CylinderGeometry(s1 * Math.SQRT2, s0 * Math.SQRT2, L, 4, 1, true); geo.rotateY(Math.PI / 4);
  const t = LAT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, tiles);
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide }));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.45 });
  m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
export const TOWER = new THREE.Group(); TOWER.position.set(0, 0, -85); G.add(TOWER);
const legs = [];
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  const pts = [[sx * 12.5, 0, sz * 12.5, 2.6], [sx * 11.0, 4.5, sz * 11.0, 2.3], [sx * 9.6, 9, sz * 9.6, 2.0], [sx * 8.6, 12.4, sz * 8.6, 1.8]];
  for (let i = 0; i < pts.length - 1; i++) legs.push(section(TOWER, pts[i].slice(0, 3), pts[i][3], pts[i + 1].slice(0, 3), pts[i + 1][3], 2));
  const foot = box(5.6, 0.7, 5.6, lam(0xc9bda6), sx * 12.5, 0.35, sz * 12.5, TOWER);
}
// arches
for (let k = 0; k < 4; k++) { const ar = new THREE.Mesh(new THREE.TorusGeometry(10.2, 0.32, 8, 40, Math.PI), toon(0x7d5034)); ar.position.set(0, 1.0, 0); const ang = k * Math.PI / 2; const off = 11.4; ar.position.x = Math.sin(ang) * off; ar.position.z = Math.cos(ang) * off; ar.rotation.y = ang; ar.scale.set(0.82, 1.0, 1); ar.castShadow = true; outline(ar, 0.06); TOWER.add(ar); }
// platforms
function platform(y, s, h) { const pg = new THREE.Group(); const deck = box(s, h, s, lam(0x6e452c), 0, y, 0, pg);
  const rail = ctex(512, 64, (g, w, hh) => { g.fillStyle = BRONZE; g.fillRect(0, 0, w, hh); g.fillStyle = '#5a3824'; for (let x = 0; x < w; x += 24) g.fillRect(x, 6, 8, hh - 12); g.fillStyle = '#b9845a'; g.fillRect(0, 0, w, 6); }, [4, 1]);
  for (const [dx, dz, ry] of [[0, s / 2, 0], [0, -s / 2, 0], [s / 2, 0, Math.PI / 2], [-s / 2, 0, Math.PI / 2]]) { const r = new THREE.Mesh(new THREE.PlaneGeometry(s, h * 1.6), lam(0xffffff, { map: rail, side: THREE.DoubleSide })); r.position.set(dx, y + h * 0.3, dz + (dz ? Math.sign(dz) * 0.05 : 0)); r.rotation.y = ry; if (dx) r.position.x += Math.sign(dx) * 0.05; pg.add(r); }
  TOWER.add(pg); return pg; }
platform(12.9, 21, 1.4); platform(26, 12, 1.1);
section(TOWER, [0, 13.5, 0], 7.6, [0, 25.5, 0], 4.9, 3);
section(TOWER, [0, 26.6, 0], 4.5, [0, 40, 0], 2.6, 4);
section(TOWER, [0, 40, 0], 2.6, [0, 52, 0], 1.3, 4);
box(3.0, 2.4, 3.0, lam(0x7a4d33), 0, 53.2, 0, TOWER); box(3.6, 0.3, 3.6, lam(0x5a3824), 0, 54.5, 0, TOWER);
const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 7, 8), lam(0x5a3824)); spire.position.set(0, 58, 0); TOWER.add(spire);
const flag = plane(1.6, 1.0, new THREE.MeshLambertMaterial({ map: ctex(96, 64, (g) => { g.fillStyle = '#2b4f9c'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#fff'; g.fillRect(32, 0, 32, 64); g.fillStyle = '#d0262e'; g.fillRect(64, 0, 32, 64); }), side: THREE.DoubleSide }), TOWER); flag.position.set(0.85, 60.8, 0);
// rust patches on front-left leg lower section (facing +z & +x) + flakes
function rustTex() { return ctex(256, 256, (g, w, h) => { for (let i = 0; i < 14; i++) { const x = R(40, 216), y = R(40, 216), r = R(18, 48); const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(176,82,32,0.95)'); rg.addColorStop(0.6, 'rgba(150,66,24,0.8)'); rg.addColorStop(1, 'rgba(150,66,24,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(${R(120, 200)},${R(50, 90)},20,${R(0.4, 0.9)})`; g.fillRect(R(30, 226), R(30, 226), R(2, 6), R(2, 6)); } }); }
export const rusts = [];
const RUSTLAT = (() => { const t = latTex(1); const g = t.userData.g; setSeed(909); for (let i = 0; i < 26; i++) { const x = R(0, 256), y = R(0, 256), r = R(10, 34); const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(196,92,32,0.95)'); rg.addColorStop(1, 'rgba(196,92,32,0)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.globalCompositeOperation = 'source-over'; t.needsUpdate = true; return t; })();
for (const i of [3, 4, 5, 9, 10]) { const m = legs[i].material; const t = RUSTLAT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.copy(m.map.repeat); m.map = t; legs[i].customDepthMaterial.map = t; rusts.push(legs[i]); }
const flakeTex = ctex(32, 32, (g) => { g.fillStyle = '#9b4a1c'; g.beginPath(); g.moveTo(4, 10); g.lineTo(28, 4); g.lineTo(24, 26); g.lineTo(8, 28); g.closePath(); g.fill(); });
export const flakes = []; for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flakeTex })); s.scale.setScalar(R(0.12, 0.25)); s.userData = { x: R(-12.5, -8.8), y0: R(2, 8), z: R(-70.4, -69.4), v: R(0.8, 1.6), ph: R(0, 6), d: R(0, 1.4) }; G.add(s); flakes.push(s); }

// ---------- repair-cost board (flip counter) ----------
export const board = new THREE.Group(); board.position.set(0.5, 0, -64.5); board.rotation.y = 0; G.add(board);
for (const x of [-1.25, 1.25]) box(0.14, 2.6, 0.14, toon(0x6b4423), x, 1.3, 0, board, 0.01);
box(2.9, 1.5, 0.12, toon(0xffffff, { map: woodTex(28, 38, 4) }), 0, 1.75, 0, board, 0.012);
const hdr = plane(2.75, 0.42, lam(0xffffff, { map: signTex(1024, 160, '#2b4f9c', [{ t: 'TOWER REPAIRS', size: 92, col: '#ffffff', y: 84 }], 0) }), board); hdr.position.set(0, 2.25, 0.065);
const frT = plane(0.42, 0.42, lam(0xffffff, { map: signTex(128, 128, '#f3ead6', [{ t: '₣', size: 110, col: '#2b1d16', y: 68, font: '"DejaVu Sans", sans-serif' }], 0) }), board); frT.position.set(-1.12, 1.55, 0.066);
export const flaps = [0, 1, 2, 3, 4, 5].map(i => { const m = plane(0.3, 0.44, new THREE.MeshBasicMaterial({ map: DIG[0] }), board); m.position.set(-0.72 + i * 0.36, 1.55, 0.07); return m; });

// ---------- café table with newspaper (top-down insert) ----------
export const cafe = new THREE.Group(); cafe.position.set(-4, 0, -60); G.add(cafe);
const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.08, 40), lam(0xe9e4da)); tableTop.position.y = 1.05; tableTop.castShadow = tableTop.receiveShadow = true; outline(tableTop, 0.02); cafe.add(tableTop);
const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.05, 10), lam(0x2b2b2e)); tLeg.position.y = 0.52; cafe.add(tLeg);
for (const a of [0.6, 2.4, 4.2]) { const ch = new THREE.Group(); box(0.6, 0.06, 0.6, toon(0xc0302d), 0, 0.62, 0, ch, 0.01); box(0.6, 0.7, 0.06, toon(0xc0302d), 0, 1.0, -0.3, ch, 0.01); ch.position.set(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8); ch.rotation.y = -a - Math.PI / 2; cafe.add(ch); }
export const newsTex = ctex(1024, 1400, (g, w, h) => {
  g.fillStyle = '#f1ead8'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = 'bold 110px "DejaVu Serif", serif'; g.textAlign = 'center'; g.fillText('LE PETIT PARISIEN', w / 2, 140);
  g.fillRect(40, 175, w - 80, 6); g.font = 'bold 54px "DejaVu Serif", serif'; g.fillText('PARIS', 170, 240); g.fillText('MAY 1925', w - 210, 240); g.fillRect(40, 270, w - 80, 4);
  g.font = 'bold 118px "DejaVu Serif", serif'; g.fillText('THE TOWER', w / 2, 420); g.fillText('IS RUSTING!', w / 2, 545);
  g.font = 'bold 60px "DejaVu Serif", serif'; g.fillStyle = '#b02626'; g.fillText('REPAIRS WILL COST A FORTUNE', w / 2, 650); g.fillStyle = INK;
  // illustration: tower with rust
  g.fillStyle = '#e1d6bc'; g.fillRect(80, 710, 420, 560); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(80, 710, 420, 560);
  g.lineWidth = 10; g.beginPath(); g.moveTo(150, 1240); g.quadraticCurveTo(270, 1000, 290, 760); g.quadraticCurveTo(310, 1000, 430, 1240); g.stroke(); g.lineWidth = 5; for (let y = 820; y < 1240; y += 40) { g.beginPath(); g.moveTo(290 - (y - 760) * 0.28, y); g.lineTo(290 + (y - 760) * 0.28, y); g.stroke(); }
  g.fillStyle = 'rgba(176,82,32,0.85)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(R(200, 380), R(950, 1200), R(14, 30), 0, 7); g.fill(); }
  g.fillStyle = '#9a9488'; for (let c = 0; c < 2; c++) for (let i = 0; i < 18; i++) g.fillRect(540 + c * 0, 720 + i * 30, 420, 10);
  g.fillStyle = '#9a9488'; for (let i = 0; i < 3; i++) g.fillRect(80, 1300 + i * 26, w - 160, 9);
});
export const news = plane(1.3, 1.78, lam(0xffffff, { map: newsTex }), cafe); news.rotation.x = -Math.PI / 2; news.rotation.z = 0.12; news.position.set(0.05, 1.1, 0.05); news.receiveShadow = true;
export const ring = plane(0.55, 0.22, new THREE.MeshBasicMaterial({ map: ctex(256, 100, (g, w, h) => { g.strokeStyle = '#d0262e'; g.lineWidth = 7; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 8, h / 2 - 8, -0.05, 0, 7); g.stroke(); }), transparent: true, depthWrite: false }), cafe);
ring.rotation.x = -Math.PI / 2; ring.rotation.z = 0.12; ring.position.set(0.39, 1.111, -0.55);
const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.16, 20), lam(0xffffff)); cup.position.set(-0.75, 1.17, 0.5); outline(cup, 0.01); cafe.add(cup);
const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.115, 20), lam(0x5a3420)); coffee.rotation.x = -Math.PI / 2; coffee.position.set(-0.75, 1.252, 0.5); cafe.add(coffee);
const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.02, 24), lam(0xffffff)); saucer.position.set(-0.75, 1.1, 0.5); cafe.add(saucer);
const croissant = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.07, 8, 16, Math.PI * 1.2), toon(0xd9a04a)); croissant.rotation.x = -Math.PI / 2; croissant.position.set(-0.7, 1.13, -0.55); outline(croissant, 0.01); cafe.add(croissant);

// ---------- Parisian buildings ----------
function facadeTex(hue, floors = 6, cols = 6) { return ctex(512, 640, (g, w, h) => { g.fillStyle = `hsl(${hue}, 30%, 84%)`; g.fillRect(0, 0, w, h); const fh = h / (floors + 0.6);
  for (let f = 0; f < floors; f++) { const y = h - (f + 1) * fh; g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y + fh - 6, w, 6);
    for (let c = 0; c < cols; c++) { const x = c * w / cols + w / cols * 0.22, ww = w / cols * 0.56; g.fillStyle = f === 0 ? '#6b4a32' : '#3a4b62'; g.fillRect(x, y + fh * 0.18, ww, fh * 0.62); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, y + fh * 0.18 + 3, ww * 0.35, fh * 0.25); g.strokeStyle = '#f7f2e6'; g.lineWidth = 4; g.strokeRect(x, y + fh * 0.18, ww, fh * 0.62);
      if (f === 1 || f === 4) { g.strokeStyle = '#2b2b2e'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, y + fh * 0.62); g.lineTo(x + ww + 6, y + fh * 0.62); g.stroke(); for (let k = 0; k <= 6; k++) { g.beginPath(); g.moveTo(x - 6 + k * (ww + 12) / 6, y + fh * 0.62); g.lineTo(x - 6 + k * (ww + 12) / 6, y + fh * 0.8); g.stroke(); } } } }
  g.fillStyle = '#5d6b7b'; g.fillRect(0, 0, w, fh * 0.6); for (let c = 0; c < cols; c++) { g.fillStyle = '#e8e2d4'; g.fillRect(c * w / cols + w / cols * 0.3, fh * 0.12, w / cols * 0.4, fh * 0.4); } }); }
setSeed(303);
const facades = [facadeTex(38), facadeTex(32), facadeTex(44), facadeTex(28)];
function building(x, z, w, d, h, ry, i) { const b = new THREE.Group(); const mats = [lam(0xffffff, { map: facades[i % 4] }), lam(0xffffff, { map: facades[(i + 1) % 4] }), lam(0x5d6b7b), lam(0x5d6b7b), lam(0xffffff, { map: facades[(i + 2) % 4] }), lam(0xffffff, { map: facades[(i + 3) % 4] })];
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.y = h / 2; m.castShadow = m.receiveShadow = true; b.add(m);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1, 1, 4, 1), lam(0x55636f)); roof.rotation.y = Math.PI / 4; roof.scale.set(w * 0.72, 3, d * 0.72); roof.position.y = h + 1.5; b.add(roof);
  for (let k = 0; k < 3; k++) box(0.6, 1.6, 0.6, lam(0xb8846a), -w / 3 + k * w / 3, h + 2.3, 0, b);
  b.position.set(x, 0, z); b.rotation.y = ry; G.add(b); return b; }
let bi = 0; for (let z = 20; z > -110; z -= 17) { building(-58, z, 14, 16, R(17, 22), Math.PI / 2, bi++); building(58, z, 14, 16, R(17, 22), -Math.PI / 2, bi++); }
for (let x = -60; x <= 60; x += 17) building(x, -120, 16, 14, R(17, 22), 0, bi++);
for (let x = -60; x <= 60; x += 17) if (Math.abs(x) > 8) building(x, 40, 16, 14, R(17, 22), Math.PI, bi++);
// trees (topiary) + lamps
function tree(x, z, s) { const t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.25 * s, 2.6 * s, 6), toon(0x6b4a2c)); tr.position.y = 1.3 * s; t.add(tr); const c = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 12, 10), toon(0x4f9a3c)); c.position.y = 3.6 * s; c.scale.y = 1.15; c.castShadow = true; outline(c, 0.06); t.add(c); t.position.set(x, 0, z); G.add(t); }
for (let z = 14; z > -100; z -= 7) { tree(-25, z, 1); tree(25, z, 1); }
function lamp(x, z) { const l = new THREE.Group(); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 3.6, 8), toon(0x26282d)); post.position.y = 1.8; l.add(post); const head = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.14, 0.5, 6), toon(0x26282d)); head.position.y = 3.85; l.add(head); const glass = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c4 })); glass.position.y = 3.7; l.add(glass); outline(post, 0.015); l.position.set(x, 0, z); G.add(l); return l; }
for (let z = 10; z > -60; z -= 10) { lamp(-20, z); lamp(20, z); }
setSeed(77); for (let i = 0; i < 16; i++) cloud(G, R(-400, 400), R(120, 260), R(-600, -700), R(60, 110), i);
// painted Haussmann facade rows (Magnific), in front of the box buildings
{ const fa = imgTex('mg/facades_a.png'), fb = imgTex('mg/facades_b.png'); const fm = t => paintedMat(t, 0.6, 0xc8c8c8, { transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const row = (pts, ry) => pts.forEach(([x, z, k]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(76, 24.2), fm(k ? fb : fa)); m.position.set(x, 12.1, z); m.rotation.y = ry; G.add(m); });
  row([[-38, -111, 0], [38, -111, 1]], 0); row([[-49, -74, 1], [-49, 2, 0]], Math.PI / 2); row([[49, -74, 0], [49, 2, 1]], -Math.PI / 2); row([[-38, 31, 1], [38, 31, 0]], Math.PI); }
// skyline backdrop (far)
const skyline = ctex(4096, 512, (g, w, h) => { setSeed(55); for (let L = 0; L < 2; L++) { g.fillStyle = L ? '#c9cfd8' : '#b4bccb'; let x = 0; while (x < w) { const bw = R(60, 160), bh = R(80, 220) - L * 40; g.fillRect(x, h - bh, bw, bh); g.fillStyle = L ? '#a9b2c0' : '#97a1b2'; g.beginPath(); g.moveTo(x, h - bh); g.lineTo(x + bw / 2, h - bh - R(20, 50)); g.lineTo(x + bw, h - bh); g.fill(); g.fillStyle = L ? '#c9cfd8' : '#b4bccb'; x += bw + R(0, 10); } }
  g.fillStyle = '#e8ecf2'; g.beginPath(); g.arc(w * 0.7, h - 230, 60, Math.PI, 0); g.fill(); g.fillRect(w * 0.7 - 70, h - 230, 140, 140); });
const sk = new THREE.Mesh(new THREE.CylinderGeometry(420, 420, 120, 64, 1, true), new THREE.MeshBasicMaterial({ map: skyline, side: THREE.BackSide, transparent: true, fog: false, depthWrite: false })); sk.position.set(0, 50, -20); sk.renderOrder = -5; G.add(sk);

// ---------- road sign + car ----------
export const roadSign = new THREE.Group(); roadSign.position.set(4.8, 0, 14.4); G.add(roadSign);
box(0.12, 3.0, 0.12, toon(0x3a3d44), 0, 1.5, 0, roadSign, 0.01);
const arrowTex = signTex(800, 300, null, [{ t: 'VIENNA', size: 120, col: '#ffffff', y: 118, x: 330 }, { t: 'AUSTRIA · 1,000 KM', size: 52, col: '#ffe9a8', y: 222, x: 330 }], 0, (g, w, h) => { g.fillStyle = '#2b6db0'; g.beginPath(); g.moveTo(10, 20); g.lineTo(w - 150, 20); g.lineTo(w - 10, h / 2); g.lineTo(w - 150, h - 20); g.lineTo(10, h - 20); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); });
const arrowSign = plane(2.6, 0.98, new THREE.MeshLambertMaterial({ map: arrowTex, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide }), roadSign); arrowSign.position.set(1.0, 2.6, 0.08);
export const car = new THREE.Group(); G.add(car);
{ const red = toon(0x8e1f2a), blk = toon(0x1f1f24);
  box(3.6, 0.55, 1.6, red, 0, 0.75, 0, car, 0.02); box(1.3, 0.6, 1.3, red, 1.35, 1.25, 0, car, 0.02); // hood
  box(0.2, 0.55, 1.5, toon(0xb9bfc6), 2.05, 1.2, 0, car, 0.012); // grille
  
  const ws = plane(1.3, 0.75, new THREE.MeshLambertMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.45, side: THREE.DoubleSide }), car); ws.rotation.y = Math.PI / 2; ws.position.set(0.55, 1.85, 0);
  for (const [x, z] of [[1.35, 0.85], [-1.25, 0.85], [1.35, -0.85], [-1.25, -0.85]]) { const wh = new THREE.Group(); const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 10, 24), blk); wh.add(tyre); const hub = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), lam(0xd9d3c4, { side: THREE.DoubleSide })); wh.add(hub); for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.58, 0.02), blk); sp.rotation.z = k * Math.PI / 6; wh.add(sp); } wh.position.set(x, 0.45, z); car.add(wh); car.userData.wheels = (car.userData.wheels || []).concat([wh]);
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.36, 16, 1, false, Math.PI / 2, Math.PI), red); fender.rotation.x = Math.PI / 2; fender.position.set(x, 0.5, z); outline(fender, 0.015); car.add(fender); }
  for (const z of [0.5, -0.5]) { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff6cc })); hl.position.set(2.15, 1.25, z); car.add(hl); }
  const sc = new THREE.Group(); sc.position.set(-2.05, 1.2, 0); car.add(sc); car.userData.case = sc;
  box(0.6, 0.62, 1.1, toon(0x7a4b25), 0, 0, 0, sc, 0.015); box(0.62, 0.06, 1.12, toon(0x4a2e16), 0, 0.12, 0, sc);
  const billTex = ctex(128, 64, (g, w, h) => { g.fillStyle = '#9fcf86'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f6b2a'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#2f6b2a'; g.font = 'bold 34px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100', w / 2, h / 2); });
  car.userData.bills = []; for (let i = 0; i < 18; i++) { const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: billTex })); b.scale.set(0.42, 0.21, 1); b.visible = false; G.add(b); b.userData = { v: [R(-3, -1), R(1.5, 3.5), R(-1.5, 1.5)], d: R(0, 1.2), sp: R(-6, 6) }; car.userData.bills.push(b); }
  for (let i = 0; i < 6; i++) { const b = plane(0.36, 0.18, lam(0xffffff, { map: billTex, side: THREE.DoubleSide }), sc); b.position.set(R(-0.2, 0.2), 0.36, R(-0.4, 0.4)); b.rotation.set(R(-0.6, 0.6), R(0, 3), R(-0.6, 0.6)); }
}
car.position.set(-2, 0, 18.3);

// ---------- NOT FOR SALE sign (ending) ----------
export const nfs = new THREE.Group(); nfs.position.set(0.55, 0, -15.5); nfs.scale.setScalar(0.72); G.add(nfs);
box(0.14, 2.2, 0.14, toon(0x6b4423), -1.0, 1.1, -0.13, nfs, 0.01); box(0.14, 2.2, 0.14, toon(0x6b4423), 1.0, 1.1, -0.13, nfs, 0.01);
const nfsBoard = box(2.5, 1.2, 0.1, toon(0xffffff, { map: signTex(1024, 512, '#f6efdc', [{ t: 'EIFFEL TOWER', size: 96, y: 150 }, { t: 'NOT FOR SALE', size: 112, col: '#2b4f9c', y: 330 }], 18) }), 0, 1.9, 0, nfs, 0.012);
export const nfsStamps = [0, 1].map(i => { const m = plane(1.3, 0.65, new THREE.MeshBasicMaterial({ map: stampTex('SOLD'), transparent: true, depthWrite: false }), nfs); m.position.set(i ? 0.35 : -0.25, i ? 1.75 : 2.05, 0.07 + i * 0.002); m.rotation.z = i ? 0.18 : -0.2; m.visible = false; return m; });

// ---------- characters ----------
export const lustig = new Char('lustig', G), poisson = new Char('poisson', G), lustigCar = new Char('lustig', G);
