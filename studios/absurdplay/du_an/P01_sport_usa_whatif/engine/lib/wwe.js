// GÓI WWE / đấu vật giải trí — võ đài, nhà thi đấu, lối ra sân, màn hình lớn, đèn sân khấu, đồ vật (đai vô địch, ghế gấp, bàn bình luận, micro).
// KHÔNG logo WWE/show/đô vật thật; chữ trên màn hình/váy đài là chữ thường do tập đặt (vd "WHAT IF", tên đô vật dạng chữ).
// Hệ toạ độ: tâm thảm đài ở (0, MAT_Y, 0); lối ra sân (ramp) theo trục -z, sân khấu + màn hình ở z = -RAMP_L.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTex } from './nba.js';

const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, o));
export const RING = 6.1;          // cạnh trong giữa các cột góc (20 ft)
export const MAT_Y = 1.22;        // mặt thảm cao 4 ft
export const ROPE_Y = [0.46, 0.84, 1.22]; // 3 dây so với mặt thảm
export const RAMP_L = 24;
const H = RING / 2;

// ---------- dây đài: ống cong qua 3 điểm (2 cột + điểm giữa) để nhún được ----------
function ropeGeo(a, b, sag = 0) { const m = a.clone().lerp(b, 0.5); m.y -= sag; return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 24, 0.03, 8, false); }
// ropes.push(side, level, amount): kéo căng dây ra ngoài (khi đô vật dựa/bật dây); gọi mỗi khung
function makeRopes(G, color) {
  const mat = std(color, { roughness: 0.45 }); const corners = [[-H, -H], [H, -H], [H, H], [-H, H]];
  const ropes = []; for (let s = 0; s < 4; s++) for (let l = 0; l < 3; l++) { const [x0, z0] = corners[s], [x1, z1] = corners[(s + 1) % 4];
    const a = new THREE.Vector3(x0, MAT_Y + ROPE_Y[l], z0), b = new THREE.Vector3(x1, MAT_Y + ROPE_Y[l], z1); const m = new THREE.Mesh(ropeGeo(a, b, 0.02), mat); m.castShadow = true; G.add(m); ropes.push({ m, a, b, s, l }); }
  const out = (s) => [new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0)][s];
  return { list: ropes, push(side, level, amount = 0, at = 0.5) { for (const r of ropes) if (r.s === side && (level == null || r.l === level)) { const m = r.a.clone().lerp(r.b, at).addScaledVector(out(r.s), amount); m.y -= 0.02;
    r.m.geometry.dispose(); r.m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([r.a, m, r.b]), 24, 0.03, 8, false); } } };
}
// váy đài (apron) + thảm: chữ trên váy đài, màu thảm
function apronTex(o) { return canvasTex(2048, 256, (g, W, Hh) => { g.fillStyle = o.apron; g.fillRect(0, 0, W, Hh); g.fillStyle = o.apronText; g.font = '900 140px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.apronLabel, W / 2, Hh / 2 + 8); }); }
function matTex(o) { return canvasTex(1024, 1024, (g, W, Hh) => { g.fillStyle = o.mat; g.fillRect(0, 0, W, Hh); g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 6; g.strokeRect(40, 40, W - 80, Hh - 80);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`; g.fillRect(Math.random() * W, Math.random() * Hh, 3, 3); }
  if (o.matLabel) { g.fillStyle = o.matText; g.globalAlpha = 0.85; g.font = '900 120px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.matLabel, W / 2, Hh / 2); g.globalAlpha = 1; } }); }
// màn hình lớn (titantron) — set(text, sub, colors) đổi chữ ra sân của từng đô vật
function makeScreen(o) { const tex = canvasTex(1920, 1080, () => {});
  const set = (title = o.screenTitle, sub = '', bg = o.screenBg, fg = '#ffffff', glow = o.accent) => { const cv = tex.userData.cv, g = cv.getContext('2d'), W = cv.width, Hh = cv.height;
    const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, bg); gr.addColorStop(1, '#05060a'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    g.strokeStyle = glow; g.lineWidth = 14; for (let i = 0; i < 9; i++) { g.globalAlpha = 0.25; g.beginPath(); g.moveTo(0, Hh * (i / 8)); g.lineTo(W, Hh * (1 - i / 8)); g.stroke(); } g.globalAlpha = 1;
    g.fillStyle = fg; g.font = '900 230px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = glow; g.shadowBlur = 40; g.fillText(title, W / 2, Hh * 0.45);
    g.shadowBlur = 0; g.font = '800 90px Inter'; g.fillStyle = o.accent; g.fillText(sub, W / 2, Hh * 0.72); tex.needsUpdate = true; };
  set(); return { tex, set }; }
// buildRingArena(scene, opts) → { group, ring:{posts, ropes, mat}, ramp, screen:{tex,set}, crowd (uniforms), spots[], MAT_Y, RING }
//  opts: mat, apron, apronLabel, apronText, ropeColor, post, pad (màu đệm cột góc), accent, screenTitle, screenBg, seat, fans[]
export function buildRingArena(scene, opts = {}) {
  const o = Object.assign({ mat: '#e9e6df', matLabel: '', matText: '#c9c3b8', apron: '#121218', apronLabel: 'WHAT IF', apronText: '#ffffff', ropeColor: '#d21f2a', post: '#202227', pad: '#121218',
    accent: '#f2c230', screenTitle: 'WHAT IF', screenBg: '#2a0c4d', seat: '#1b1d24', fans: ['#d21f2a', '#ffffff', '#f2c230', '#1d4ed8', '#333333', '#8a8f98', '#111111', '#e8e8e8'] }, opts);
  const G = new THREE.Group(); scene.add(G);
  // nền nhà thi đấu tối + sàn quanh đài (thảm đen) + rào chắn
  scene.background = new THREE.Color('#07080c'); scene.fog = new THREE.Fog('#0a0b12', 40, 110);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), std('#141518', { roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; G.add(floor);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(RING + 4, RING + 4), std('#0b0b0e', { roughness: 0.9 })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.005; pad.receiveShadow = true; G.add(pad);
  for (const s of [-1, 1]) for (const ax of ['x', 'z']) { const len = RING + 6; const b = new THREE.Mesh(new THREE.BoxGeometry(ax === 'x' ? len : 0.25, 1.1, ax === 'x' ? 0.25 : len), std('#1c1d22', { roughness: 0.5 })); b.position.set(ax === 'z' ? s * (H + 3) : 0, 0.55, ax === 'x' ? s * (H + 3) : 0);
    if (!(ax === 'x' && s < 0)) G.add(b); } // chừa lối vào phía -z
  // khối đài + váy đài + thảm
  const apronM = new THREE.MeshStandardMaterial({ map: apronTex(o), roughness: 0.8 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(RING + 0.6, MAT_Y, RING + 0.6), [apronM, apronM, std(o.mat), std('#000'), apronM, apronM]); base.position.y = MAT_Y / 2; base.castShadow = true; base.receiveShadow = true; G.add(base);
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(RING + 0.6, RING + 0.6), new THREE.MeshStandardMaterial({ map: matTex(o), roughness: 0.85 })); mat.rotation.x = -Math.PI / 2; mat.position.y = MAT_Y + 0.003; mat.receiveShadow = true; G.add(mat);
  // 4 cột góc + 3 đệm góc (turnbuckle) mỗi cột
  const posts = []; for (const [x, z] of [[-H, -H], [H, -H], [H, H], [-H, H]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, MAT_Y + 1.5, 12), std(o.post, { metalness: 0.6, roughness: 0.35 })); p.position.set(x, (MAT_Y + 1.5) / 2, z); p.castShadow = true; G.add(p); posts.push(p);
    for (const y of ROPE_Y) { const tb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.2), std(o.pad, { roughness: 0.7 })); tb.position.set(x * 0.985, MAT_Y + y, z * 0.985); tb.rotation.y = Math.atan2(x, z); G.add(tb); } }
  const ropes = makeRopes(G, o.ropeColor);
  // bậc thép ở 2 góc
  for (const [x, z, r] of [[H + 1.0, H + 0.4, -Math.PI / 4], [-H - 1.0, -H - 0.4, Math.PI * 3 / 4]]) { const st = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4 * (i + 1), 0.4), std('#8b9097', { metalness: 0.7, roughness: 0.3 })); b.position.set(0, 0.2 * (i + 1), -i * 0.4); st.add(b); } st.position.set(x, 0, z); st.rotation.y = r; G.add(st); }
  // lối ra sân (ramp) + sân khấu + màn hình lớn
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, RAMP_L), std('#1b1c21', { roughness: 0.4, metalness: 0.2 })); ramp.position.set(0, 0.45, -H - 3 - RAMP_L / 2); ramp.receiveShadow = true; ramp.castShadow = true; G.add(ramp);
  const edgeM = new THREE.MeshBasicMaterial({ color: o.accent }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, RAMP_L), edgeM); e.position.set(s * 2.1, 0.92, ramp.position.z); G.add(e); }
  const stage = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 6), std('#121318', { roughness: 0.5 })); stage.position.set(0, 0.6, -H - 3 - RAMP_L - 3); G.add(stage);
  const screen = makeScreen(o); const scr = new THREE.Mesh(new THREE.PlaneGeometry(17, 9.6), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); scr.position.set(0, 1.2 + 5.6, stage.position.z - 2.6); G.add(scr);
  const sideL = []; for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 12), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })); m.position.set(s * 12, 7, stage.position.z - 2.0); m.rotation.y = -s * 0.35; G.add(m); sideL.push(m); }
  // bàn bình luận cạnh đài (+x)
  const desk = commentaryTable(); desk.position.set(H + 4.2, 0, 1.5); desk.rotation.y = -Math.PI / 2; G.add(desk);
  // khán đài 4 phía (chừa lối ra sân): hộp người gộp 1 lưới + nhún bằng shader
  const crowd = standsRing(G, o);
  // giàn đèn trên đài
  const truss = std('#22252c', { metalness: 0.6, roughness: 0.4 }); for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(RING + 4, 0.4, 0.4), truss); t.position.set(0, 9, s * (H + 1)); G.add(t); }
  G.traverse((x) => { if (x.isMesh && x.castShadow == null) x.castShadow = false; });
  return { group: G, ring: { posts, ropes, mat }, ramp, stage, screen, crowd, MAT_Y, RING, H };
}
function standsRing(G, o) {
  const P = [], C = [], CP = []; const col = new THREE.Color(), v = new THREE.Vector3();
  const torso = new THREE.BoxGeometry(0.42, 0.5, 0.28).translate(0, 0.72, 0).toNonIndexed(), head = new THREE.IcosahedronGeometry(0.12, 0).translate(0, 1.1, 0).toNonIndexed(), seat = new THREE.BoxGeometry(0.48, 0.08, 0.44).translate(0, 0.42, 0).toNonIndexed();
  const sign = new THREE.BoxGeometry(0.5, 0.32, 0.02).translate(0, 1.55, 0.1).toNonIndexed(); const skins = ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f']; let rnd = 5; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const add = (geo, m, c, cp) => { col.set(c).convertSRGBToLinear(); for (let i = 0; i < geo.attributes.position.count; i++) { v.fromBufferAttribute(geo.attributes.position, i).applyMatrix4(m); P.push(v.x, v.y, v.z); C.push(col.r, col.g, col.b); CP.push(...cp); } };
  const risers = [];
  for (const [ry, len] of [[0, 1], [Math.PI / 2, 1], [Math.PI, 1], [-Math.PI / 2, 1]]) for (let r = 0; r < 16; r++) { const d = H + 6 + r * 0.85, y = r * 0.42, w = 2 * d;
    const m0 = new THREE.Matrix4().makeRotationY(ry);
    if (ry === Math.PI) { const hw = (w - 8) / 2; for (const sx of [-1, 1]) risers.push(new THREE.BoxGeometry(hw, y + 0.02, 0.85).translate(sx * (4 + hw / 2), (y + 0.02) / 2, d + 0.42).applyMatrix4(m0)); } // chừa lối ra sân 8 m
    else risers.push(new THREE.BoxGeometry(w, y + 0.02, 0.85).translate(0, (y + 0.02) / 2, d + 0.42).applyMatrix4(m0));
    for (let k = 0; k < Math.floor(w / 0.56); k++) { const x = -w / 2 + (k + 0.5) * 0.56; if (ry === Math.PI && Math.abs(x) < 4) continue; // lối ra sân (-z): ry = π → khán đài ở -z
      const m = new THREE.Matrix4().makeRotationY(Math.PI).setPosition(x, y, d + 0.42).premultiply(m0); add(seat, m, o.seat, [0, 0, 0, 0]);
      if (R() < 0.75) { const ph = R() * 40, am = 0.5 + 0.5 * R(); add(torso, m, o.fans[Math.floor(R() * o.fans.length)], [1, ph, am, 0]); add(head, m, skins[Math.floor(R() * skins.length)], [1.5, ph, am, 0]); if (R() < 0.08) add(sign, m, R() < 0.5 ? '#ffffff' : o.accent, [1, ph, am, 0]); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.setAttribute('cp', new THREE.Float32BufferAttribute(CP, 4)); geo.computeVertexNormals();
  const U = { uT: { value: 0 }, uCheer: { value: 0.3 }, uSleep: { value: 0 } }; const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cp; uniform float uT, uCheer, uSleep;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
    if (cp.x > 0.5) { float ch = clamp(uCheer * cp.z, 0.0, 1.0); transformed.y += (0.015 + 0.18 * ch) * max(0.0, sin(uT * (5.0 + cp.z * 3.0) + cp.y)) * (1.0 - uSleep); if (cp.x > 1.4) transformed.y -= 0.12 * uSleep; }`); };
  mat.customProgramCacheKey = () => 'crowd_wwe'; const all = new THREE.Mesh(geo, mat); all.matrixAutoUpdate = false; all.frustumCulled = false; G.add(all);
  const rg = new THREE.Mesh(mergeGeometries(risers), std('#15161b', { roughness: 0.9 })); rg.receiveShadow = true; G.add(rg);
  return U;
}
// đèn: hemi + đèn chính trên đài có bóng + 4 đèn spot màu xoay; lights.spot(t) cập nhật màu/hướng; lights.dark(k) tối khán đài khi ra sân
export function ringLights(scene, { accent = '#f2c230' } = {}) {
  const hemi = new THREE.HemisphereLight('#ffffff', '#30323a', 2.6); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff6ea', 3.2); key.position.set(-4, 16, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); key.shadow.bias = -0.0004; key.shadow.radius = 3; scene.add(key); key.target.position.set(0, MAT_Y, 0); scene.add(key.target);
  const fill = new THREE.DirectionalLight('#e6ecff', 1.4); fill.position.set(6, 9, 10); scene.add(fill);
  const spots = []; const cols = ['#ff2d55', '#2d7dff', accent, '#ffffff'];
  for (let i = 0; i < 4; i++) { const s = new THREE.SpotLight(cols[i], 60, 40, 0.35, 0.6, 1.4); s.position.set((i % 2 ? 1 : -1) * 6, 9, (i < 2 ? 1 : -1) * 6); s.target.position.set(0, MAT_Y, 0); scene.add(s); scene.add(s.target); spots.push(s); }
  return { hemi, key, fill, spots,
    spot(t, target = null) { spots.forEach((s, i) => { const a = t * (0.6 + i * 0.13) + i * 1.6; s.target.position.set(Math.sin(a) * 2.2, MAT_Y, Math.cos(a * 0.8) * 2.2); if (target) s.target.position.lerp(target, 0.6); s.target.updateMatrixWorld(); }); },
    dark(k) { hemi.intensity = 2.6 * (1 - 0.6 * k); fill.intensity = 1.4 * (1 - 0.7 * k); } };
}
// ---------- đồ vật ----------
// đai vô địch: dải da + mặt kim loại vàng có chữ (không logo thật); trục dài theo x
export function champBelt({ label = 'WORLD CHAMPION', strap = '#141414', plate = '#d8ab2e' } = {}) {
  const g = new THREE.Group(); const sm = std(strap, { roughness: 0.6 });
  const strapM = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.012), sm); g.add(strapM);
  const tex = canvasTex(512, 256, (c, W, Hh) => { const gr = c.createRadialGradient(W / 2, Hh / 2, 10, W / 2, Hh / 2, W / 2); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.5, plate); gr.addColorStop(1, '#7a5a12'); c.fillStyle = gr; c.fillRect(0, 0, W, Hh);
    c.fillStyle = '#5a3d08'; c.font = '900 46px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; const words = label.split(' '); words.forEach((w, i) => c.fillText(w, W / 2, Hh / 2 + (i - (words.length - 1) / 2) * 52));
    c.strokeStyle = '#fff2b0'; c.lineWidth = 8; c.strokeRect(10, 10, W - 20, Hh - 20); });
  const pm = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.85, roughness: 0.25 });
  const plateM = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), [std(plate, { metalness: 0.9, roughness: 0.25 }), pm, std(plate, { metalness: 0.9, roughness: 0.25 })]); plateM.rotation.x = Math.PI / 2; plateM.scale.set(1.35, 1, 1); plateM.position.z = 0.012; g.add(plateM);
  for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 24), std(plate, { metalness: 0.9, roughness: 0.25 })); side.rotation.x = Math.PI / 2; side.position.set(s * 0.33, 0, 0.012); g.add(side); }
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); return g;
}
// ghế gấp kim loại (mở / gập: folded = true)
export function steelChair(folded = false) {
  const g = new THREE.Group(); const m = std('#9aa0a8', { metalness: 0.75, roughness: 0.3 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.4), m); const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.03), m);
  const legs = []; for (const [x, z] of [[-0.19, 0.18], [0.19, 0.18], [-0.19, -0.18], [0.19, -0.18]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 8), m); l.position.set(x, 0.23, z); legs.push(l); g.add(l); }
  if (folded) { seat.position.set(0, 0.42, 0.02); seat.rotation.x = Math.PI / 2; back.position.set(0, 0.62, 0); legs.forEach((l) => { l.rotation.x = 0.0; l.position.z *= 0.1; l.position.y = 0.4; l.scale.y = 1.7; }); }
  else { seat.position.y = 0.46; back.position.set(0, 0.68, -0.19); const bl = (x) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), m); b.position.set(x, 0.66, -0.19); g.add(b); }; bl(-0.19); bl(0.19); }
  g.add(seat, back); g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); return g;
}
// bàn bình luận (cũng là "bàn để đập") — mặt bàn + khăn phủ + 2 màn hình nhỏ
export function commentaryTable() {
  const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.75), std('#1a1a1f')); top.position.y = 0.78; g.add(top);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.74, 0.02), std('#0e0f14')); skirt.position.set(0, 0.39, 0.37); g.add(skirt);
  for (const x of [-1.1, 1.1]) for (const z of [-0.32, 0.32]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.76, 0.05), std('#2a2a2a')); l.position.set(x, 0.38, z); g.add(l); }
  for (const x of [-0.6, 0.6]) { const mon = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.03), std('#0a0a0a')); mon.position.set(x, 0.96, -0.15); mon.rotation.x = -0.2; g.add(mon); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: '#2d7dff' })); sc.position.set(x, 0.96, -0.133); sc.rotation.x = -0.2; g.add(sc); }
  g.traverse((x) => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } }); g.userData.topY = 0.805; return g;
}
// micro cầm tay (đô vật nói trên đài)
export function microphone() { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.18, 12), std('#141414')); h.position.y = -0.09; g.add(h);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), std('#9aa0a8', { metalness: 0.7, roughness: 0.35 })); head.position.y = 0.015; g.add(head); g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); return g; }
