// GÓI MLB (bóng chày) — sân, dụng cụ, mũ. Cùng kiểu với nba.js / svd.js. KHÔNG logo giải/đội: chỉ tên thành phố/đội dạng chữ, màu, số.
// Hệ toạ độ sân: home plate ở gốc (0,0,0); trục +z hướng về gò ném / ngoài sân (center field). Nhìn từ catcher (mặt hướng +z),
// bên PHẢI là -x → base 1 ở -x, base 3 ở +x. Người đánh tay phải đứng ô bên base 3 (x ≈ +0,95), quay mặt về home (-x).
// Kích thước thật: base cách nhau 27,43 m (90 ft); gò ném cách home 18,44 m (60 ft 6 in), cao 0,25 m; tường ngoài sân ~100–122 m.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTex } from './nba.js';

const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
export const FT = 0.3048;
export const BASE90 = 90 * FT;            // 27,43 m
export const MOUND_Z = 60.5 * FT;         // 18,44 m
const D = BASE90 / Math.SQRT2;            // nửa đường chéo hình vuông base
// vị trí 4 base (thế giới, y = 0)
export const BASES = {
  home: new THREE.Vector3(0, 0, 0),
  first: new THREE.Vector3(-D, 0, D),
  second: new THREE.Vector3(0, 0, 2 * D),
  third: new THREE.Vector3(D, 0, D),
  mound: new THREE.Vector3(0, 0.25, MOUND_Z),
};

// ---------- dụng cụ ----------
// bóng chày: trắng ngà, 2 đường may đỏ hình yên ngựa (vẽ trong texture)
let _ballTex = null;
export function baseball(Dm = 0.074) {
  _ballTex ??= canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#c4161c'; g.lineWidth = 5;
    for (const s of [0, 1]) { g.beginPath(); for (let i = 0; i <= 64; i++) { const u = i / 64; const x = (u + s * 0.5) * W; const y = H / 2 + Math.sin(u * Math.PI * 2) * H * 0.28 * (s ? -1 : 1); i ? g.lineTo(x % W, y) : g.moveTo(x % W, y); } g.stroke(); }
    g.lineWidth = 2; for (let i = 0; i < 64; i++) { const u = i / 64; for (const s of [0, 1]) { const x = ((u + s * 0.5) * W) % W, y = H / 2 + Math.sin(u * Math.PI * 2) * H * 0.28 * (s ? -1 : 1); g.beginPath(); g.moveTo(x - 4, y - 5); g.lineTo(x + 4, y + 5); g.stroke(); } }
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(Dm / 2, 32, 20), new THREE.MeshStandardMaterial({ map: _ballTex, roughness: 0.55 }));
  m.castShadow = true; m.userData.R = Dm / 2; return m;
}
// gậy gỗ: dài 0,86 m; gốc (cán) ở y = 0, đầu gậy ở +y. userData.grip = điểm cầm (gần cán), userData.tip = đầu gậy
export function bat(len = 0.86, color = '#c89b5e') {
  const pts = [[0.0, 0], [0.026, 0], [0.028, 0.012], [0.012, 0.03], [0.012, 0.30], [0.018, 0.48], [0.028, 0.66], [0.033, 0.80], [0.032, 0.84], [0.026, 0.86], [0.0, 0.862]]
    .map(([r, y]) => new THREE.Vector2(r * (len / 0.86), y * (len / 0.86)));
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), std(color, { roughness: 0.42 })); g.add(body);
  const tape = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.2, 16), std('#1b1b1b', { roughness: 0.8 })); tape.position.y = 0.13; g.add(tape);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.userData.grip = new THREE.Vector3(0, 0.08, 0); g.userData.grip2 = new THREE.Vector3(0, 0.17, 0); g.userData.tip = new THREE.Vector3(0, len, 0);
  return g;
}
// găng bắt bóng: khối da nâu hơi khum (đơn giản, nhìn rõ ở trung/cận cảnh)
export function glove(color = '#8a4b1f') {
  const g = new THREE.Group(); const m = std(color, { roughness: 0.75 });
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), m); palm.scale.set(1, 0.55, 1.25); palm.rotation.x = Math.PI / 2; g.add(palm);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.1, 4, 8), m); f.position.set((i - 1.5) * 0.045, 0.12, 0.02); f.rotation.x = -0.25; g.add(f); }
  const web = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), std('#5e3214', { roughness: 0.8 })); web.position.set(0.1, 0.12, 0.02); g.add(web);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g; // lòng găng hướng +z
}
// gắn vật vào xương (giữ nguyên vị trí thế giới hiện tại), như headset() trong dovat.js
export const attachToBone = (ch, boneName, obj, offset = new THREE.Vector3()) => {
  ch.root.updateMatrixWorld(true); const b = ch.bones[boneName];
  obj.position.copy(b.getWorldPosition(new THREE.Vector3()).add(offset)); ch.root.add(obj); b.attach(obj); return obj;
};
// mũ lưỡi trai: đỉnh tròn + lưỡi trai + nút; text = chữ cái viết tắt đội trên trán (KHÔNG logo thật)
export function cap(ch, { color = '#0c2340', brim = null, text = '', textColor = '#ffffff', y = 0.12, size = 0.112 } = {}) {
  const g = new THREE.Group(); const m = std(color, { roughness: 0.7 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(size, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), m); crown.scale.set(1, 0.78, 1.08); g.add(crown);
  const vis = new THREE.Mesh(new THREE.CylinderGeometry(size * 1.02, size * 1.02, 0.008, 28, 1, false, -Math.PI * 0.42, Math.PI * 0.84), std(brim || color, { roughness: 0.7 }));
  vis.scale.set(1, 1, 1.55); vis.position.set(0, 0.004, size * 0.32); vis.rotation.x = 0.12; g.add(vis);
  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), m); btn.position.y = size * 0.78; g.add(btn);
  if (text) { const t = canvasTex(256, 128, (c, W, H) => { c.fillStyle = textColor; c.font = '900 92px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W / 2, H / 2 + 4); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.95, size * 0.48), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.7 })); p.position.set(0, size * 0.36, size * 1.02); p.rotation.x = -0.32; g.add(p); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return attachToBone(ch, 'Head', g, new THREE.Vector3(0, y, 0.0));
}
// mũ bảo hiểm đánh bóng: vỏ bóng + tai che một bên (bên phía người ném) + lưỡi ngắn
export function batterHelmet(ch, { color = '#0c2340', side = 'l', y = 0.11, size = 0.12 } = {}) {
  const g = new THREE.Group(); const m = std(color, { roughness: 0.25, metalness: 0.1 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(size, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), m); shell.scale.set(1, 0.92, 1.1); g.add(shell);
  const flap = new THREE.Mesh(new THREE.SphereGeometry(size * 0.55, 16, 10, 0, Math.PI, 0, Math.PI * 0.7), m); flap.position.set((side === 'l' ? 1 : -1) * size * 0.9, -size * 0.45, 0); flap.rotation.z = (side === 'l' ? -1 : 1) * Math.PI / 2; g.add(flap);
  const vis = new THREE.Mesh(new THREE.CylinderGeometry(size, size, 0.008, 24, 1, false, -Math.PI * 0.35, Math.PI * 0.7), m); vis.scale.set(1, 1, 1.3); vis.position.set(0, 0.0, size * 0.25); g.add(vis);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return attachToBone(ch, 'Head', g, new THREE.Vector3(0, y, 0));
}
// mặt nạ + giáp ngực catcher (hộp lưới đơn giản trước mặt)
export function catcherGear(ch, color = '#1b1b1b') {
  const mask = new THREE.Group(); const m = std(color, { metalness: 0.6, roughness: 0.35 });
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.006, 6, 20, Math.PI), m); b.position.set(0, -0.06 + i * 0.045, 0.09); b.rotation.set(0, 0, Math.PI); b.scale.set(1, 0.4, 1); mask.add(b); }
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.18, 0.008), m); v.position.set(0, 0, 0.13); mask.add(v);
  attachToBone(ch, 'Head', mask, new THREE.Vector3(0, 0.02, 0.02));
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.06), std(color, { roughness: 0.7 })); chest.castShadow = true;
  attachToBone(ch, 'spine_03', chest, new THREE.Vector3(0, -0.12, 0.16));
  return { mask, chest };
}
// base (túi trắng), home plate (ngũ giác), cao su gò ném
export function baseBag() { const b = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.38), std('#f8f8f4', { roughness: 0.8 })); b.position.y = 0.04; b.castShadow = true; b.receiveShadow = true; return b; }
export function homePlate() {
  const s = new THREE.Shape(); const w = 0.216; s.moveTo(-w, 0); s.lineTo(w, 0); s.lineTo(w, 0.216); s.lineTo(0, 0.432); s.lineTo(-w, 0.216); s.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }), std('#f8f8f4', { roughness: 0.8 })); m.rotation.x = Math.PI / 2; m.position.set(0, 0.021, 0.432); m.receiveShadow = true; return m; // mũi nhọn hướng về catcher (-z)
}

// ---------- sân ----------
// mặt sân 1 texture lớn: cỏ sọc cắt, đất đỏ vòng trong, đường foul trắng, ô người đánh, vòng chờ
function fieldTexture(o) {
  const S = 160, N = 4096, M0 = 10; // vùng phủ 160 x 160 m; home cách mép trên 10 m; z tăng xuống dưới canvas (khớp mặt phẳng xoay -90° quanh x)
  return canvasTex(N, N, (g, X, Y) => {
    const px = X / S; const toC = (x, z) => [X / 2 + x * px, (M0 + z) * px];
    g.fillStyle = o.grassDark; g.fillRect(0, 0, X, Y);
    // sọc cắt cỏ kiểu bàn cờ chéo 6 m
    g.save(); g.translate(...toC(0, 0)); g.rotate(Math.PI / 4); for (let i = -40; i < 40; i++) for (let j = -40; j < 40; j++) if ((i + j) % 2 === 0) { g.fillStyle = o.grassLight; g.fillRect(i * 6 * px, j * 6 * px, 6 * px, 6 * px); } g.restore();
    // đất vòng trong: hình tròn bán kính 29 m quanh gò, chỉ trong vùng fair (giữa 2 đường foul)
    g.save(); g.beginPath(); g.moveTo(...toC(0, 0)); g.lineTo(...toC(120, 120)); g.lineTo(...toC(-120, 120)); g.closePath(); g.clip();
    g.fillStyle = o.dirt; g.beginPath(); g.arc(...toC(0, MOUND_Z), 29 * px, 0, Math.PI * 2); g.fill(); g.restore();
    // ô cỏ trong hình vuông base
    g.fillStyle = o.grassLight; g.save(); g.translate(...toC(0, D)); g.rotate(Math.PI / 4); const ins = (BASE90 - 3.2) * px; g.fillRect(-ins / 2, -ins / 2, ins, ins); g.restore();
    // vòng đất gò ném, home, quanh từng base
    g.fillStyle = o.dirt; for (const [x, z, r] of [[0, MOUND_Z, 2.74], [0, 0, 4.0], [BASES.first.x, BASES.first.z, 2.6], [BASES.second.x, BASES.second.z, 2.6], [BASES.third.x, BASES.third.z, 2.6]]) { g.beginPath(); g.arc(...toC(x, z), r * px, 0, Math.PI * 2); g.fill(); }
    // đường foul, ô người đánh hai bên home
    g.strokeStyle = '#ffffff'; g.lineWidth = 0.1 * px; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(...toC(0, 0)); g.lineTo(...toC(s * 115, 115)); g.stroke(); }
    for (const s of [-1, 1]) { const [bx, by] = toC(s * 0.95, 0.2); g.strokeRect(bx - 0.61 * px, by - 0.915 * px, 1.22 * px, 1.83 * px); }
    g.fillStyle = o.deck; for (const s of [-1, 1]) { g.beginPath(); g.arc(...toC(s * 11, -3), 1.5 * px, 0, Math.PI * 2); g.fill(); }
    // vệt sạn dọc chân tường (warning track), cung trong vùng fair (góc canvas 45°..135°)
    g.strokeStyle = o.dirt; g.lineWidth = 4.5 * px; g.beginPath(); g.arc(...toC(0, 0), (o.wallR - 2.3) * px, Math.PI / 4, Math.PI * 3 / 4); g.stroke();
  });
}
function wallTexture(o) {
  return canvasTex(4096, 256, (g, W, H) => { g.fillStyle = o.wall; g.fillRect(0, 0, W, H); g.fillStyle = o.wallTop; g.fillRect(0, 0, W, 18);
    g.font = '900 120px Inter'; g.textBaseline = 'middle'; g.textAlign = 'center';
    const marks = [['330', 0.04], ['375', 0.24], ['400', 0.5], ['375', 0.76], ['330', 0.96]]; g.fillStyle = '#ffffff'; for (const [t, u] of marks) g.fillText(t, u * W, H / 2 + 10);
    g.font = '900 70px Inter'; g.fillStyle = o.ad; for (const [t, u] of [[o.adText1, 0.14], [o.adText2, 0.37], [o.adText1, 0.63], [o.adText2, 0.86]]) g.fillText(t, u * W, H / 2 + 6); });
}
// bảng điểm: bảng hiệp (line score) vẽ canvas; set({away, home, innings:[[a,h],...], R, H, E, inning, outs, count})
function makeScoreboard(o) {
  const tex = canvasTex(1536, 768, () => {});
  const draw = (s = {}) => { const cv = tex.userData.cv, g = cv.getContext('2d'), W = cv.width, H = cv.height;
    g.fillStyle = '#0d1a14'; g.fillRect(0, 0, W, H); g.fillStyle = o.boardHead; g.fillRect(0, 0, W, 120);
    g.fillStyle = '#ffffff'; g.font = '900 78px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.title || o.boardTitle, W / 2, 64);
    const cols = 9, x0 = 330, cw = 100; g.font = '800 54px Inter'; g.fillStyle = '#f2d21b';
    for (let i = 0; i < cols; i++) g.fillText(String(i + 1), x0 + i * cw, 180); for (const [k, t] of ['R', 'H', 'E'].entries()) g.fillText(t, x0 + (cols + 0.4 + k) * cw, 180);
    const rows = [[s.away || 'AWAY', 0], [s.home || 'HOME', 1]]; g.font = '900 64px Inter';
    for (const [name, r] of rows) { const y = 300 + r * 140; g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.fillText(name, 40, y); g.textAlign = 'center';
      (s.innings || []).forEach((v, i) => { if (v[r] != null) g.fillText(String(v[r]), x0 + i * cw, y); });
      const RHE = r ? (s.homeRHE || []) : (s.awayRHE || []); RHE.forEach((v, k) => { g.fillStyle = '#f2d21b'; g.fillText(String(v), x0 + (cols + 0.4 + k) * cw, y); g.fillStyle = '#ffffff'; }); }
    g.font = '800 54px Inter'; g.fillStyle = '#ffffff'; g.textAlign = 'left'; g.fillText(`INN ${s.inning ?? ''}`, 40, 650); g.fillText(`OUT ${s.outs ?? 0}`, 420, 650); g.fillText(`BALL-STRIKE ${s.count ?? '0-0'}`, 760, 650);
    tex.needsUpdate = true; };
  draw(); return { tex, set: draw };
}
// khán đài kiểu sân bóng chày: các bậc cong quanh home từ base 1 vòng qua sau home tới base 3, + khán đài ngoài sân (bleachers) sau tường.
// khán giả = khối hộp màu (thân+đầu), gộp 1 lưới, nhún theo shader giống nba.js (uT, uCheer).
function standsBall(G, o) {
  const P = [], C = [], CP = []; const col = new THREE.Color(); const v = new THREE.Vector3();
  const torso = new THREE.BoxGeometry(0.42, 0.5, 0.28).translate(0, 0.72, 0).toNonIndexed(), head = new THREE.IcosahedronGeometry(0.12, 0).translate(0, 1.1, 0).toNonIndexed(), seat = new THREE.BoxGeometry(0.48, 0.08, 0.44).translate(0, 0.42, 0).toNonIndexed();
  const shirts = o.fans, skins = ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f']; let rnd = 11; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const add = (geo, m, c, cp) => { col.set(c).convertSRGBToLinear(); for (let i = 0; i < geo.attributes.position.count; i++) { v.fromBufferAttribute(geo.attributes.position, i).applyMatrix4(m); P.push(v.x, v.y, v.z); C.push(col.r, col.g, col.b); CP.push(...cp); } };
  const riserM = std('#a9a49a', { roughness: 0.9 }); const risers = [];
  const ring = (r0, rows, y0, a0, a1, fill) => { for (let r = 0; r < rows; r++) { const rr = r0 + r * 0.85, y = y0 + r * 0.42; const n = Math.floor((a1 - a0) * rr / 0.56);
    risers.push(new THREE.CylinderGeometry(rr + 0.43, rr + 0.43, y + 0.02, 48, 1, true, a0, a1 - a0).translate(0, (y + 0.02) / 2, 0));
    for (let k = 0; k < n; k++) { const a = a0 + (k + 0.5) / n * (a1 - a0); const x = Math.sin(a) * rr, z = Math.cos(a) * rr; const m = new THREE.Matrix4().makeRotationY(a + Math.PI).setPosition(x, y, z);
      add(seat, m, o.seat, [0, 0, 0, 0]); if (R() < fill) { const ph = R() * 40, am = 0.5 + 0.5 * R(); const sh = shirts[Math.floor(R() * shirts.length)]; add(torso, m, sh, [1, ph, am, 0]); add(head, m, skins[Math.floor(R() * skins.length)], [1.5, ph, am, 0]); } } } };
  // sau home: góc -135°..+135° quanh home, nhưng chỉ phía sau đường foul (|a| > 135° tính từ +z) → dùng góc quanh trục y với 0 = +z
  ring(22, 18, 1.0, Math.PI * 0.62, Math.PI * 1.38, 0.7);              // khán đài chính sau home, từ sau base 1 tới sau base 3
  // bleachers ngoài sân: sau tường
  ring(o.wallR + 4, 14, 3.2, -Math.PI * 0.2, Math.PI * 0.2, 0.55);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.setAttribute('cp', new THREE.Float32BufferAttribute(CP, 4)); geo.computeVertexNormals();
  const U = { uT: { value: 0 }, uCheer: { value: 0.2 }, uSleep: { value: 0 } }; const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cp; uniform float uT, uCheer, uSleep;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
    if (cp.x > 0.5) { float ch = clamp(uCheer * cp.z, 0.0, 1.0); transformed.y += (0.012 + 0.16 * ch) * max(0.0, sin(uT * (5.0 + cp.z * 3.0) + cp.y)) * (1.0 - uSleep); if (cp.x > 1.4) transformed.y -= 0.12 * uSleep; }`); };
  mat.customProgramCacheKey = () => 'crowd_mlb';
  const all = new THREE.Mesh(geo, mat); all.matrixAutoUpdate = false; all.frustumCulled = false; G.add(all);
  const rg = new THREE.Mesh(mergeGeometries(risers), riserM); rg.receiveShadow = true; G.add(rg);
  return U;
}
// buildBallpark(scene, opts) → { group, BASES, scoreboard:{tex,set}, crowd (uniforms), wallR, mound }
//  opts: grassLight, grassDark, dirt, wall, wallTop, seat, fans[], boardTitle, boardHead, adText1/2, night (bầu trời đêm), wallR (m)
export function buildBallpark(scene, opts = {}) {
  const o = Object.assign({ grassLight: '#4f9a3c', grassDark: '#43873a', dirt: '#b6774a', deck: '#9c6a44', wall: '#1f4d32', wallTop: '#f2c230', seat: '#1f3d7a', ad: '#f2c230',
    fans: ['#1f3d7a', '#ffffff', '#c8102e', '#e8e8e8', '#2b6cb0', '#f2c230', '#333333', '#7a8aa0'], boardTitle: 'WHAT IF PARK', boardHead: '#1f3d7a', adText1: 'WHAT IF', adText2: 'ABSURDPLAY', wallR: 110, night: false }, opts);
  const G = new THREE.Group(); scene.add(G);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: fieldTexture(o), roughness: 0.9 }));
  field.rotation.x = -Math.PI / 2; field.position.set(0, 0, 80 - 10); field.receiveShadow = true; G.add(field);
  // gò ném: chỏm cầu thấp + cao su trắng
  const mound = new THREE.Mesh(new THREE.SphereGeometry(5.5, 40, 12, 0, Math.PI * 2, 0, 0.47), std(o.dirt, { roughness: 0.95 })); mound.scale.y = 0.25 / (5.5 * (1 - Math.cos(0.47))); mound.position.set(0, -5.5 * Math.cos(0.47) * mound.scale.y, MOUND_Z); mound.receiveShadow = true; G.add(mound);
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.03, 0.15), std('#f8f8f4')); rubber.position.set(0, 0.255, MOUND_Z); G.add(rubber);
  for (const k of ['first', 'second', 'third']) { const b = baseBag(); b.position.x = BASES[k].x; b.position.z = BASES[k].z; b.rotation.y = Math.PI / 4; G.add(b); }
  G.add(homePlate());
  // tường ngoài sân: cung bán kính wallR quanh home, cao 3 m, đệm xanh có số khoảng cách; cột foul vàng
  const wallM = new THREE.MeshStandardMaterial({ map: wallTexture(o), roughness: 0.8, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(o.wallR, o.wallR, 3, 96, 1, true, -Math.PI / 4, Math.PI / 2), wallM); wall.position.y = 1.5; wall.rotation.y = 0; G.add(wall);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 24, 10), std('#f2c230', { roughness: 0.4 })); const a = s * Math.PI / 4; p.position.set(Math.sin(a) * o.wallR, 12, Math.cos(a) * o.wallR); G.add(p); }
  // lưới sau home (backstop) + 2 dugout
  const net = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 6, 32, 1, true, Math.PI * 0.75, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: '#222', transparent: true, opacity: 0.25, side: THREE.DoubleSide })); net.position.y = 3; G.add(net);
  for (const s of [-1, 1]) { const dg = new THREE.Group(); const back = new THREE.Mesh(new THREE.BoxGeometry(12, 2.4, 0.3), std('#2a2f38')); back.position.set(0, 1.2, -1.6); dg.add(back);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.25, 3.4), std(o.seat)); roof.position.set(0, 2.5, 0); dg.add(roof); const bench = new THREE.Mesh(new THREE.BoxGeometry(11, 0.45, 0.5), std('#6b4a2a')); bench.position.set(0, 0.22, -1.0); dg.add(bench);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.08, 0.08), std('#cfd4da', { metalness: 0.7 })); rail.position.set(0, 1.05, 1.5); dg.add(rail);
    dg.position.set(s * 17, -0.6, 4); dg.rotation.y = s * Math.PI * 0.32; G.add(dg); }
  // bảng điểm lớn sau bleachers giữa sân
  const sb = makeScoreboard(o); const board = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), new THREE.MeshBasicMaterial({ map: sb.tex, toneMapped: false })); board.position.set(0, 18, o.wallR + 22); board.rotation.y = Math.PI; G.add(board);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(25, 13, 0.6), std('#1a1d24')); frame.position.set(0, 18, o.wallR + 22.4); G.add(frame);
  const crowd = standsBall(G, o);
  // trời
  if (o.night) { scene.background = new THREE.Color('#0b1430'); scene.fog = new THREE.Fog('#0b1430', 120, 320); }
  else { scene.background = new THREE.Color('#8fc4ec'); scene.fog = new THREE.Fog('#bcdcf2', 150, 380); }
  G.traverse((x) => { if (x.isMesh && x !== field) x.castShadow = x.castShadow || false; });
  return { group: G, BASES, scoreboard: sb, crowd, wallR: o.wallR, mound };
}
// đèn: ngày = nắng xiên + trời; đêm = 6 tháp đèn pha + hemi mạnh. Cùng quy tắc ánh sáng v0.6 (hemi ≥ 2,5 + key có bóng).
export function ballparkLights(scene, { night = false } = {}) {
  const hemi = new THREE.HemisphereLight(night ? '#dfe8ff' : '#ffffff', '#6b8f4e', night ? 2.6 : 2.8); scene.add(hemi);
  const key = new THREE.DirectionalLight(night ? '#f4f6ff' : '#fff2dc', night ? 2.6 : 3.4); key.position.set(-30, 60, 25); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 40, bottom: -10, near: 1, far: 160 }); key.shadow.bias = -0.0004; key.shadow.radius = 3; scene.add(key); key.target.position.set(0, 0, 18); scene.add(key.target);
  const fill = new THREE.DirectionalLight('#eef3ff', 1.3); fill.position.set(25, 20, -20); scene.add(fill);
  const towers = [];
  if (night) for (const [x, z] of [[-45, 10], [45, 10], [-70, 60], [70, 60], [-40, 105], [40, 105]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 0.5), new THREE.MeshBasicMaterial({ color: '#fffbe8' })); t.position.set(x, 38, z); t.lookAt(0, 0, 30); scene.add(t); towers.push(t); }
  return { hemi, key, fill, towers };
}
