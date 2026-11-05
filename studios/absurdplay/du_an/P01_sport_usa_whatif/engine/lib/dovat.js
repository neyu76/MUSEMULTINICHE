// Đồ vật dùng chung: bóng bầu dục, cúp vàng, tai nghe HLV, bảng kẹp giấy
import * as THREE from 'three';
const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
// bóng bầu dục: hình thoi nhọn 2 đầu (lathe), 2 sọc trắng gần đầu, đường may + dây buộc trắng
export function football(len = 0.28) {
  const R = len * 0.31, pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; const y = (u - 0.5) * len; const r = R * Math.pow(Math.sin(Math.PI * u), 0.82); pts.push(new THREE.Vector2(Math.max(r, 0.0005), y)); }
  const geo = new THREE.LatheGeometry(pts, 48);
  // tô màu theo đỉnh: nâu, sọc trắng tại |y| ~ 0.3*len
  const col = new Float32Array(geo.attributes.position.count * 3), c = new THREE.Color();
  for (let i = 0; i < geo.attributes.position.count; i++) { const y = geo.attributes.position.getY(i) / len; const stripe = Math.abs(Math.abs(y) - 0.31) < 0.028;
    c.set(stripe ? '#f4f1ea' : '#6e3416').convertSRGBToLinear(); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const g = new THREE.Group(); const body = new THREE.Mesh(geo, std('#ffffff', { vertexColors: true, roughness: 0.55 })); body.rotation.z = Math.PI / 2; g.add(body);
  const w = std('#f4f1ea', { roughness: 0.5 });
  const seam = new THREE.Mesh(new THREE.BoxGeometry(len * 0.36, R * 0.05, R * 0.06), w); seam.position.y = R * 0.99; g.add(seam);
  for (let k = -3; k <= 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(R * 0.06, R * 0.06, R * 0.32), w); l.position.set(k * len * 0.045, R * 1.0, 0); g.add(l); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.userData.R = R;
  return g; // trục dài theo x
}
// cúp vàng kiểu tiện tròn
export function trophy(h = 0.9) {
  const pts = [[0.2, 0], [0.2, 0.06], [0.12, 0.08], [0.09, 0.18], [0.05, 0.22], [0.04, 0.42], [0.08, 0.48], [0.18, 0.56], [0.24, 0.72], [0.26, 0.92], [0.25, 0.94]].map(([r, y]) => new THREE.Vector2(r * h, y * h));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), std('#d4a526', { metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide })));
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5 * h, 0.12 * h, 0.5 * h), std('#2b2b2b', { roughness: 0.4 })); base.position.y = -0.06 * h; g.add(base);
  for (const s of [-1, 1]) { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.1 * h, 0.018 * h, 10, 24, Math.PI * 1.2), std('#d4a526', { metalness: 0.85, roughness: 0.3 })); hd.position.set(s * 0.27 * h, 0.72 * h, 0); hd.rotation.z = s > 0 ? -Math.PI * 0.6 : Math.PI * 1.6; g.add(hd); }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// tai nghe HLV gắn vào xương đầu: vòng cung + 2 chụp tai + mic
export function headset(ch) {
  const head = ch.bones.Head; const hb = new THREE.Box3();
  ch.root.updateMatrixWorld(true);
  const p = head.getWorldPosition(new THREE.Vector3());
  const g = new THREE.Group(); const m = std('#1b1b1b', { roughness: 0.4 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.008, 8, 32, Math.PI), m); band.rotation.y = Math.PI / 2; band.position.y = 0.06; g.add(band);
  for (const s of [-1, 1]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 20), m); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.1, 0.05, 0); g.add(cup); }
  const mic = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.04, 0.01), new THREE.Vector3(0.09, -0.03, 0.07), new THREE.Vector3(0.04, -0.06, 0.1)]), 12, 0.005, 6), m); g.add(mic);
  g.position.copy(p).add(new THREE.Vector3(0, 0.05, 0.0)); ch.root.add(g); head.attach(g);
  return g;
}
export function clipboard() {
  const cb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.33, 0.012), std('#9c6b38')); const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), std('#f6f6f2')); paper.position.z = 0.007; cb.add(paper);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), std('#c0c0c0', { metalness: 0.8, roughness: 0.3 })); clip.position.set(0, 0.15, 0.01); cb.add(clip); cb.castShadow = true; return cb;
}
// khung tập đi (walker) nhôm 4 chân, 2 quả bóng tennis ở chân sau
export function walker(h = 0.82) {
  const g = new THREE.Group(); const m = std('#c9ced6', { metalness: 0.8, roughness: 0.3 }), r = 0.014;
  const tube = (a, b) => { const v = new THREE.Vector3().subVectors(b, a); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v.length(), 10), m); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); g.add(c); };
  const W = 0.27, D = 0.22;
  for (const sx of [-1, 1]) { tube(new THREE.Vector3(sx * W, 0, D), new THREE.Vector3(sx * W, h, D * 0.6)); tube(new THREE.Vector3(sx * W, 0, -D), new THREE.Vector3(sx * W, h, -D * 0.6)); tube(new THREE.Vector3(sx * W, h, D * 0.6), new THREE.Vector3(sx * W, h, -D * 0.6)); tube(new THREE.Vector3(sx * W, h * 0.45, D * 0.8), new THREE.Vector3(sx * W, h * 0.45, -D * 0.8));
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.8, r * 1.8, 0.12, 10), std('#2a2a2a')); grip.rotation.x = Math.PI / 2; grip.position.set(sx * W, h + 0.005, 0); g.add(grip);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 10), std('#d7ef3a', { roughness: 0.9 })); ball.position.set(sx * W, 0.03, -D); g.add(ball); }
  tube(new THREE.Vector3(-W, h * 0.8, D * 0.66), new THREE.Vector3(W, h * 0.8, D * 0.66));
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g; // mặt trước hướng +z
}
