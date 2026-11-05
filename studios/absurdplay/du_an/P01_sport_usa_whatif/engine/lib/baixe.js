// Bối cảnh tập 4: BÃI XE CỦA HÀNG XE HƠI BAN NGÀY — trời xanh nắng, mặt nhựa kẻ vạch sân bằng sơn trắng,
// dãy xe bóng loáng dán giá, dây cờ tam giác, showroom kính, biển khuyến mãi làm bảng điểm, cột gôn dựng tạm, hàng cây.
// Khác E01 (sân trong nhà), E02 (nhà thi đấu), E03 (sân đêm). Sân dọc trục x, rộng theo z.
import * as THREE from 'three';
import { goalPost } from './ngoaitroi.js';

const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
function canvasTex(w, h, draw, { repeat = null, aniso = 8 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); } t.userData.cv = c; return t;
}
export const LOT = { L: 60, W: 34 }; // phần "sân" kẻ vạch (m)

// mặt nhựa: nhiễu hạt, vạch sân 5 yard, số yard, ô đỗ xe hai bên, vết dầu
function asphalt() {
  return canvasTex(4096, 2304, (g, W, H) => {
    g.fillStyle = '#4a4d52'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160000; i++) { const v = 60 + Math.random() * 50; g.fillStyle = `rgba(${v},${v},${v + 4},0.35)`; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(20,20,22,0.22)'; g.beginPath(); g.ellipse(Math.random() * W, Math.random() * H, 30 + Math.random() * 80, 15 + Math.random() * 40, Math.random() * 3, 0, 7); g.fill(); }
    const pxm = W / 100; // 100 m ngang
    const cx = W / 2, cy = H / 2, fl = LOT.L * pxm, fw = LOT.W * pxm * 0.8;
    g.strokeStyle = 'rgba(245,245,240,0.92)'; g.lineWidth = pxm * 0.15; g.strokeRect(cx - fl / 2, cy - fw / 2, fl, fw);
    g.fillStyle = 'rgba(245,245,240,0.9)';
    for (let x = -LOT.L / 2; x <= LOT.L / 2 + 0.01; x += 4.572) g.fillRect(cx + x * pxm - pxm * 0.06, cy - fw / 2, pxm * 0.12, fw);
    g.font = `700 ${pxm * 1.6}px Anton, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const nums = ['G', 10, 20, 30, 40, 50, 40, 30, 20, 10, 'G']; let k = 0;
    for (let x = -LOT.L / 2 + 4.572; x < LOT.L / 2; x += 9.144) { const n = nums[++k] ?? ''; for (const [yy, r] of [[cy - fw / 2 + pxm * 2.2, Math.PI], [cy + fw / 2 - pxm * 2.2, 0]]) { g.save(); g.translate(cx + x * pxm, yy); g.rotate(r); g.fillText(String(n), 0, 0); g.restore(); } }
    // ô đỗ xe vàng hai bên sân
    g.strokeStyle = 'rgba(240,200,40,0.85)'; g.lineWidth = pxm * 0.12;
    for (const sy of [-1, 1]) for (let x = -45; x <= 45; x += 2.8) { const y0 = cy + sy * (fw / 2 + pxm * 4); g.beginPath(); g.moveTo(cx + x * pxm, y0); g.lineTo(cx + x * pxm, y0 + sy * pxm * 5.2); g.stroke(); }
  });
}

// xe hơi low-poly bóng: thân, cabin kính, bánh, đèn, giá dán kính
export function car(color = '#c8102e', price = '$9,999', seed = 1) {
  const g = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#1b2633', roughness: 0.05, metalness: 0.2, clearcoat: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.75, 1.8), paint); body.position.y = 0.62; g.add(body);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 1.78), paint); nose.position.set(1.75, 0.95, 0); nose.rotation.z = -0.18; g.add(nose);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.62, 1.62), glass); cab.position.set(-0.25, 1.28, 0); g.add(cab);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.6), paint); roof.position.set(-0.3, 1.62, 0); g.add(roof);
  for (const [x, z] of [[1.35, 0.85], [1.35, -0.85], [-1.35, 0.85], [-1.35, -0.85]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 20), std('#151515', { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.36, z); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 12), std('#c9ced6', { metalness: 0.9, roughness: 0.25 })); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.36, z); g.add(hub); }
  for (const z of [0.6, -0.6]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.38), new THREE.MeshBasicMaterial({ color: '#fffbe6' })); hl.position.set(2.16, 0.78, z); g.add(hl); }
  // giá dán kính lái (canvas)
  const tag = canvasTex(256, 160, (c, W, H) => { c.fillStyle = '#ffe14a'; c.fillRect(0, 0, W, H); c.fillStyle = '#d0021b'; c.font = '900 64px Anton, Impact'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(price, W / 2, H / 2 + 4); });
  const st = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshBasicMaterial({ map: tag })); st.position.set(0.88, 1.32, 0); st.rotation.y = Math.PI / 2; st.rotation.x = 0; st.rotation.z = -0.5; g.add(st);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g; // mũi xe hướng +x
}

// dây cờ tam giác giữa 2 điểm (đung đưa trong onTick)
function bunting(a, b, n, cols) {
  const g = new THREE.Group(); const flags = [];
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.5, 0)), b]), 20, 0.012, 4), std('#333'));
  g.add(line);
  const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.17, 0, 0), new THREE.Vector3(0.17, 0, 0), new THREE.Vector3(0, -0.45, 0)]); tri.computeVertexNormals();
  for (let i = 1; i < n; i++) { const k = i / n; const p = a.clone().lerp(b, k); p.y -= 0.5 * 4 * k * (1 - k);
    const f = new THREE.Mesh(tri, std(cols[i % cols.length], { side: THREE.DoubleSide, roughness: 0.7 })); f.position.copy(p); f.lookAt(p.clone().add(new THREE.Vector3(-(b.z - a.z), 0, b.x - a.x))); g.add(f); flags.push(f); f.userData.ph = i * 0.7; f.userData.r0 = f.rotation.clone(); }
  g.userData.flags = flags; return g;
}

function skyDay() {
  const t = canvasTex(2048, 1024, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2f7fd6'); gr.addColorStop(0.42, '#7fbaf0'); gr.addColorStop(0.5, '#cfe6fb'); gr.addColorStop(1, '#9fb0bf'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = Math.random() * W, y = H * (0.12 + Math.random() * 0.3), s = 40 + Math.random() * 90;
      for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(x + (k - 3) * s * 0.45, y + Math.sin(k * 1.7) * s * 0.18, s * 0.55, s * 0.32, 0, 0, 7); g.fill(); } }
  });
  return new THREE.Mesh(new THREE.SphereGeometry(450, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }));
}

export function buildCarLot(scene) {
  const G = new THREE.Group(); scene.add(G);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 56.25), new THREE.MeshStandardMaterial({ map: asphalt(), roughness: 0.9 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; G.add(ground);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), std('#5f9a46', { roughness: 1 })); grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; grass.receiveShadow = true; G.add(grass);
  // lề đường bê tông viền bãi
  const curbM = std('#cfcbc2', { roughness: 0.9 });
  for (const [w, d, x, z] of [[100, 0.4, 0, 28.3], [100, 0.4, 0, -28.3], [0.4, 56.6, 50.2, 0], [0.4, 56.6, -50.2, 0]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), curbM); c.position.set(x, 0.09, z); c.receiveShadow = true; G.add(c); }
  // dãy xe 2 bên (đỗ trong ô vàng), mũi xe hướng vào sân
  const cols = ['#c8102e', '#f4f4f4', '#1f3f8f', '#111111', '#e8b100', '#9aa3ad', '#0f7a5a', '#ff6a1a', '#5b2a86', '#f4f4f4', '#c8102e', '#2c66c4'];
  let k = 0; const prices = ['$9,999', '$12,499', 'DEAL!', '$7,777', '$15,990', 'SALE', '$11,111', '$8,888'];
  for (const sz of [-1, 1]) for (let x = -44; x <= 44; x += 2.8) { if (Math.abs(x) < 3 && sz > 0) continue; if ((x * 7 + sz * 3) % 11 === 0) continue;
    const c = car(cols[k % cols.length], prices[k % prices.length], k); k++; c.rotation.y = sz < 0 ? Math.PI / 2 : -Math.PI / 2; c.position.set(x, 0, sz * (LOT.W * 0.4 + 4 + 2.6)); G.add(c); }
  // showroom kính phía sau (z âm xa) + biển hiệu
  const sr = new THREE.Group(); sr.position.set(0, 0, -40); G.add(sr);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(46, 7, 12), std('#e9e6df', { roughness: 0.8 })); wall.position.y = 3.5; sr.add(wall);
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#8fb6d8', roughness: 0.05, metalness: 0.3, clearcoat: 1, transparent: true, opacity: 0.85 });
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(40, 5.2), glassM); gl.position.set(0, 2.8, 6.02); sr.add(gl);
  for (let x = -20; x <= 20; x += 4) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.4, 0.15), std('#c0c4ca', { metalness: 0.8, roughness: 0.3 })); m.position.set(x, 2.8, 6.05); sr.add(m); }
  const signT = canvasTex(2048, 256, (g, W, H) => { g.fillStyle = '#d0021b'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = '900 170px Anton, Impact'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MEGA DEALS AUTO', W / 2, H / 2 + 8); });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(30, 3.2, 0.4), [std('#d0021b'), std('#d0021b'), std('#d0021b'), std('#d0021b'), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false }), std('#d0021b')]); sign.position.set(0, 8.7, 6.1); sr.add(sign);
  // cột cờ + dây cờ tam giác quanh bãi
  const pole = (x, z, h = 7) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 10), std('#c9ced6', { metalness: 0.8, roughness: 0.3 })); p.position.set(x, h / 2, z); p.castShadow = true; G.add(p); return new THREE.Vector3(x, h - 0.2, z); };
  const BC = ['#d0021b', '#ffe14a', '#1f6fe0', '#ffffff', '#16a34a', '#ff7a00'];
  const tops = [[-48, -27], [-24, -27], [0, -27], [24, -27], [48, -27], [-48, 27], [-24, 27], [0, 27], [24, 27], [48, 27]].map(([x, z]) => pole(x, z));
  const BU = []; for (let i = 0; i < 4; i++) { BU.push(bunting(tops[i], tops[i + 1], 22, BC)); BU.push(bunting(tops[i + 5], tops[i + 6], 22, BC)); }
  for (let i = 0; i < 5; i++) { BU.push(bunting(tops[i], new THREE.Vector3(0, 9.5, 0).lerp(tops[i], 0.0).setY(6.5).setZ(0).setX(tops[i].x * 0.5), 14, BC)); }
  BU.forEach((b) => G.add(b));
  // biển khuyến mãi = bảng điểm (sau end zone trái), mặt hướng +x
  const sbT = canvasTex(1280, 720, () => {}); const sb = new THREE.Group(); sb.position.set(-LOT.L / 2 - 9, 0, -9); sb.rotation.y = Math.PI / 2 - 0.35; G.add(sb);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 5.4), new THREE.MeshBasicMaterial({ map: sbT, toneMapped: false })); face.position.set(0, 6.2, 0.26); sb.add(face);
  const fr = new THREE.Mesh(new THREE.BoxGeometry(10.2, 6.0, 0.5), std('#ffe14a', { roughness: 0.5 })); fr.position.y = 6.2; sb.add(fr);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 3.4, 12), std('#8a8f98', { metalness: 0.7, roughness: 0.35 })); p.position.set(s * 3.5, 1.7, -0.1); sb.add(p); }
  sb.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  // cột gôn dựng tạm 2 đầu (cùng kiểu E03 nhưng đặt trên đế bê tông)
  const gpL = goalPost(-1), gpR = goalPost(1); gpL.position.x = -LOT.L / 2; gpR.position.x = LOT.L / 2; G.add(gpL, gpR);
  for (const x of [-LOT.L / 2 - 1.8, LOT.L / 2 + 1.8]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), std('#b8b4ab')); b.position.set(x, 0.25, 0); b.castShadow = b.receiveShadow = true; G.add(b); }
  // hàng cây + đồi xa
  const treeM = std('#3f7d34', { roughness: 0.9 }), trunk = std('#6b4a2c');
  for (let i = 0; i < 70; i++) { const a = (i / 70) * Math.PI * 2, r = 85 + (i % 5) * 9; const x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r; if (z < -30 && Math.abs(x) < 30) continue;
    const t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), trunk); tr.position.y = 1.5; t.add(tr);
    const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + (i % 3), 1), treeM); cr.position.y = 5; t.add(cr); t.position.set(x, 0, z); t.scale.setScalar(1 + (i % 4) * 0.2); G.add(t); }
  G.add(skyDay());
  scene.fog = new THREE.Fog('#bcd3e8', 120, 420); scene.background = new THREE.Color('#7fbaf0');
  const tick = (t) => { for (const b of BU) for (const f of b.userData.flags) { f.rotation.copy(f.userData.r0); f.rotateX(0.35 * Math.sin(t * 3.1 + f.userData.ph)); } };
  return { group: G, sbTex: sbT, sbPos: new THREE.Vector3(-LOT.L / 2 - 9, 6.2, -9), tick };
}

// nắng trưa: mặt trời gắt có bóng rõ, trời xanh hắt sáng, phản xạ mặt nhựa ấm
export function dayLights(scene) {
  const hemi = new THREE.HemisphereLight('#cfe6ff', '#6b6152', 1.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3dc', 3.4); sun.position.set(-25, 42, 18); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 120 }); sun.shadow.bias = -0.0004; sun.shadow.radius = 2.5; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight('#bcd8ff', 0.9); fill.position.set(30, 18, -25); scene.add(fill);
  const follow = (x, z) => { sun.target.position.set(x, 0, z); sun.position.set(x - 25, 42, z + 18); };
  return { hemi, sun, fill, follow };
}
