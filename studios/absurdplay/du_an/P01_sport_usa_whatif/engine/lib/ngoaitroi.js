// Sân vận động NGOÀI TRỜI BAN ĐÊM (tập 3) — khác hẳn E01 (sân mái vòm) và E02 (nhà thi đấu):
// trời đêm xanh thẫm có sao, 4 tháp đèn pha, khán đài nhôm bậc thang 2 bên, chòi bình luận sáng đèn,
// đường chạy đỏ 4 làn ôm quanh sân cỏ cắt ô bàn cờ, cột gôn vàng 2 đầu, bảng điểm kiểu trường trung học đứng trên 2 cột.
// Sân dọc trục x (dài 120 yard), rộng theo z. Khán đài nhà ở z âm, khán đài khách ở z dương.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const YD = 0.9144;
export const FL = 120 * YD, FW = 53.33 * YD; // 109,7 m × 48,8 m
const TR = { S: 46, R: 27, W: 4.9 }; // đường chạy: nửa đoạn thẳng, bán kính trong, bề rộng 4 làn
const std = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7 }, o));

function canvasTex(w, h, draw, { repeat = [1, 1], aniso = 8, wrap = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); } t.userData.cv = c; return t;
}

// cỏ cắt kiểu bàn cờ (sọc 5 yard × 2 dải dọc) — E01 chỉ có sọc ngang
function fieldTexture(o) {
  return canvasTex(4096, 1820, (g, W, H) => {
    const px = W / 120;
    for (let i = 0; i < 24; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#3b8436' : '#46943e'; g.fillRect(i * 5 * px, j * H / 4, 5 * px + 1, H / 4 + 1); }
    // nhiễu cỏ nhẹ
    for (let k = 0; k < 60000; k++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(20,60,20,0.08)' : 'rgba(170,230,140,0.07)'; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    for (const [x, bg, txt, fg, stroke] of [[0, o.endLeft, o.endLeftText, '#ffffff', o.endLeftStroke], [110, o.endRight, o.endRightText, o.endRightFg, null]]) {
      g.fillStyle = bg; g.fillRect(x * px, 0, 10 * px, H);
      // sọc chéo mảnh trong end zone (điểm nhận diện mới)
      g.save(); g.beginPath(); g.rect(x * px, 0, 10 * px, H); g.clip(); g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = px * 0.6;
      for (let d = -H; d < 10 * px + H; d += px * 2.2) { g.beginPath(); g.moveTo(x * px + d, 0); g.lineTo(x * px + d - H, H); g.stroke(); } g.restore();
      g.save(); g.translate((x + 5) * px, H / 2); g.rotate(x === 0 ? -Math.PI / 2 : Math.PI / 2);
      g.font = `900 ${px * 5.6}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (stroke) { g.lineWidth = px * 0.55; g.strokeStyle = stroke; g.strokeText(txt, 0, 0); }
      g.fillStyle = fg; g.fillText(txt, 0, 0); g.restore();
    }
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, px * 0.3); g.fillRect(0, H - px * 0.3, W, px * 0.3); g.fillRect(0, 0, px * 0.3, H); g.fillRect(W - px * 0.3, 0, px * 0.3, H);
    for (let y = 10; y <= 110; y += 5) g.fillRect(y * px - px * 0.12, 0, px * 0.24, H);
    const hz = [0.03, 0.4, 0.6, 0.97];
    for (let y = 11; y < 110; y++) { if (y % 5 === 0) continue; for (const yy of hz) g.fillRect(y * px - px * 0.06, H * yy - px * 0.4, px * 0.12, px * 0.8); }
    g.font = `700 ${px * 2.0}px Anton, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let y = 20; y <= 100; y += 10) { const n = String(50 - Math.abs(60 - y)); for (const [yy, rot] of [[H * 0.15, Math.PI], [H * 0.85, 0]]) { g.save(); g.translate(y * px, yy); g.rotate(rot); g.fillText(n.split('').join(' '), 0, 0); g.restore(); } }
    // vạch 2 điểm + chấm giữa sân
    g.fillRect(12 * px - px * 0.06, H / 2 - px * 0.5, px * 0.12, px); g.fillRect(108 * px - px * 0.06, H / 2 - px * 0.5, px * 0.12, px);
  }, { wrap: false, aniso: 16 });
}

// bầu trời đêm: gradient xanh thẫm → tím than gần chân trời, sao lấm tấm, quầng sáng thành phố
function skyDome() {
  const t = canvasTex(2048, 1024, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#050b1e'); gr.addColorStop(0.42, '#0d1d44'); gr.addColorStop(0.5, '#27407a'); gr.addColorStop(0.53, '#3b4f80'); gr.addColorStop(1, '#0c1226');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { const y = Math.random() * H * 0.45; g.fillStyle = `rgba(255,255,255,${(0.25 + Math.random() * 0.75) * (1 - y / (H * 0.45))})`; const r = Math.random() < 0.06 ? 2.2 : 1.1; g.fillRect(Math.random() * W, y, r, r); }
    // dải đồi/cây tối ở chân trời
    g.fillStyle = '#081024'; g.beginPath(); g.moveTo(0, H * 0.53); for (let x = 0; x <= W; x += 16) g.lineTo(x, H * (0.5 - 0.015 * Math.sin(x * 0.01) - 0.01 * Math.sin(x * 0.037) - (Math.random() < 0.08 ? 0.01 : 0))); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  }, { wrap: false });
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, toneMapped: false }));
  return m;
}

// vòng hình sân vận động (2 đoạn thẳng + 2 bán nguyệt) → mặt phẳng nằm
function ringShape(S, r0, r1, n = 48) {
  const outline = (r) => { const p = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; p.push(new THREE.Vector2(S + Math.cos(a) * r, Math.sin(a) * r)); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + Math.PI * i / n; p.push(new THREE.Vector2(-S + Math.cos(a) * r, Math.sin(a) * r)); } return p; };
  const sh = new THREE.Shape(outline(r1)); sh.holes.push(new THREE.Path(outline(r0).reverse()));
  const g = new THREE.ShapeGeometry(sh, 2); g.rotateX(-Math.PI / 2); return g; // ShapeGeometry nằm trên xz, y lên
}

// cột gôn vàng kiểu "cổ ngỗng": trụ cong ra sau, xà ngang 3,05 m, 2 trụ đứng cao 10,7 m, rộng 5,64 m
export function goalPost(dir = 1) {
  const g = new THREE.Group(); const m = std('#ffd21c', { roughness: 0.35, metalness: 0.2 }); const r = 0.09;
  const tube = (pts, rr = r) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 30, rr, 12, false), m);
  g.add(tube([[1.8, 0, 0], [1.8, 2.2, 0], [1.4, 2.95, 0], [0.0, 3.05, 0]], 0.12));
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 5.64, 12), m); bar.rotation.x = Math.PI / 2; bar.position.y = 3.05; g.add(bar);
  for (const s of [-1, 1]) { const u = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 10.7, 12), m); u.position.set(0, 3.05 + 5.35, s * 2.82); g.add(u);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.1), std('#ff6a1a', { side: THREE.DoubleSide })); fl.position.set(-0.08, 3.05 + 10.7 - 0.5, s * 2.82); g.add(fl); }
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.0, 16), std('#2b67b8')); pad.position.set(1.8, 1.0, 0); g.add(pad);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.rotation.y = dir > 0 ? 0 : Math.PI; return g; // xà ngang nằm tại x của group; trụ đỡ phía sau (x + 1.8 theo hướng dir)
}

// bảng điểm kiểu trường học: thân đen, viền vàng, 2 cột thép
export function scoreboard() {
  const g = new THREE.Group();
  const tex = canvasTex(1280, 640, () => {}, { wrap: false });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.set(0, 10.5, 0.36); g.add(face);
  const body = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 0.7), std('#15171c', { roughness: 0.5 })); body.position.y = 10.5; g.add(body);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.35, 0.8), std('#ffc20e', { roughness: 0.4 })); trim.position.y = 14.6; g.add(trim);
  const trim2 = trim.clone(); trim2.position.y = 6.4; g.add(trim2);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 7, 12), std('#8a8f98', { metalness: 0.7, roughness: 0.4 })); p.position.set(s * 5, 3.5, -0.2); g.add(p); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, tex };
}

// tháp đèn pha: cột thép + giàn 4×3 bóng phát sáng + quầng sáng cộng (sprite)
function lightTower(h = 30) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, h, 12), std('#6d737c', { metalness: 0.6, roughness: 0.45 })); pole.position.y = h / 2; g.add(pole);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.0, 0.4), std('#2c3038', { metalness: 0.5, roughness: 0.5 })); frame.position.set(0, h + 1.6, 0.4); g.add(frame);
  const bulbM = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const glowT = canvasTex(128, 128, (c, W, H) => { const gr = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.25, 'rgba(255,244,214,0.55)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }, { wrap: false });
  const glowM = new THREE.SpriteMaterial({ map: glowT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.48, 20), bulbM); b.position.set(-2.1 + i * 1.4, h + 0.5 + j * 1.15, 0.62); g.add(b);
  }
  const glow = new THREE.Sprite(glowM); glow.scale.set(16, 16, 1); glow.position.set(0, h + 1.6, 1.2); g.add(glow);
  return g; // mặt đèn hướng +z
}

// khán đài nhôm bậc thang + khán giả cử động (shader, cùng nguyên lý tập 2 nhưng không có ghế, người ngồi thẳng trên ván, mặc áo khoác/mũ len)
function bleachers(G, side, o) {
  const ROWS = o.rows ?? 16, ROW = 0.78, RISE = 0.42, LEN = o.len ?? 72, z0 = side * (TR.R + TR.W + 1.6);
  const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed();
  const alu = new THREE.MeshStandardMaterial({ color: '#c3c9d1', metalness: 0.75, roughness: 0.32 });
  const frameM = new THREE.MeshStandardMaterial({ color: '#7d848e', metalness: 0.7, roughness: 0.5 });
  const g = new THREE.Group(); g.position.set(0, 0, z0); g.rotation.y = side < 0 ? 0 : Math.PI; G.add(g); g.updateMatrixWorld(true);
  const plank = [], frame = [];
  for (let r = 0; r < ROWS; r++) { const y = 0.9 + r * RISE, d = r * ROW;
    plank.push(box(LEN, 0.05, 0.32, 0, y + 0.45, -d - 0.5)); // ván ngồi
    plank.push(box(LEN, 0.04, 0.42, 0, y, -d - 0.2)); // ván để chân
    plank.push(box(LEN, 0.4, 0.03, 0, y - 0.2, -d)); }
  for (let x = -LEN / 2; x <= LEN / 2 + 0.01; x += 4) { const H = 0.9 + ROWS * RISE + 0.6; const D = ROWS * ROW + 0.6;
    frame.push(box(0.12, H, 0.12, x, H / 2, -D)); frame.push(box(0.12, 0.9, 0.12, x, 0.45, 0));
    const len = Math.hypot(H, D); const b = new THREE.BoxGeometry(0.1, len, 0.1); b.rotateX(Math.atan2(D, H)); b.translate(x, H / 2, -D / 2); frame.push(b.toNonIndexed()); }
  // lan can sau + trước
  const H = 0.9 + ROWS * RISE, D = ROWS * ROW;
  frame.push(box(LEN, 0.06, 0.06, 0, H + 1.5, -D - 0.1)); frame.push(box(LEN, 0.06, 0.06, 0, 1.05, 0.05));
  for (let x = -LEN / 2; x <= LEN / 2; x += 2) { frame.push(box(0.05, 1.1, 0.05, x, H + 0.95, -D - 0.1)); }
  const pm = new THREE.Mesh(mergeGeometries(plank), alu); pm.receiveShadow = true; pm.castShadow = true; g.add(pm);
  const fm = new THREE.Mesh(mergeGeometries(frame), frameM); g.add(fm);
  // tường trước (băng rôn vải) dọc mép khán đài
  if (o.banner) { const bt = canvasTex(2048, 64, (c, W, Hh) => { c.fillStyle = o.bannerBg; c.fillRect(0, 0, W, Hh); c.font = '900 44px Anton, sans-serif'; c.textBaseline = 'middle'; c.fillStyle = o.bannerFg; c.textAlign = 'center';
      for (let k = 0; k < 6; k++) c.fillText(o.banner, (k + 0.5) * W / 6, Hh / 2 + 2); }, { wrap: false });
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 0.85), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 })); bn.position.set(0, 0.5, 0.12); g.add(bn); }
  // chòi bình luận trên đỉnh khán đài nhà
  if (o.pressBox) { const pb = new THREE.Group(); const bx = new THREE.Mesh(new THREE.BoxGeometry(22, 4, 4), std('#ece9e2', { roughness: 0.8 })); bx.position.y = 2; pb.add(bx);
    const win = canvasTex(1024, 128, (c, W, Hh) => { c.fillStyle = '#20242c'; c.fillRect(0, 0, W, Hh); for (let k = 0; k < 11; k++) { const gr = c.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(1, '#ffd98a'); c.fillStyle = gr; c.fillRect(k * W / 11 + 6, 14, W / 11 - 12, Hh - 28); } }, { wrap: false });
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(21, 1.8), new THREE.MeshBasicMaterial({ map: win, toneMapped: false })); wm.position.set(0, 2.3, 2.02); pb.add(wm);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(23, 0.3, 5), std('#3b4250')); roof.position.y = 4.15; pb.add(roof);
    pb.position.set(0, H + 1.6, -D - 2.6); g.add(pb); }
  // khán giả
  let rnd = o.seed || 11; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const P = [], C = [], CP = [], PV = [], FX = []; const v = new THREE.Vector3(), col = new THREE.Color();
  const fax = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
  const add = (geo, m, color, cp, piv) => { col.set(color).convertSRGBToLinear(); const n = geo.attributes.position.count;
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(geo.attributes.position, i).applyMatrix4(m); P.push(v.x, v.y, v.z); C.push(col.r, col.g, col.b); CP.push(...cp); PV.push(piv.x, piv.y, piv.z); FX.push(fax.x, fax.y, fax.z); } };
  const torsoG = box(0.42, 0.5, 0.28, 0, 0.27, 0), legG = box(0.38, 0.13, 0.42, 0, 0.0, 0.2), shinG = box(0.34, 0.45, 0.12, 0, -0.22, 0.4), headG = new THREE.IcosahedronGeometry(0.12, 1).translate(0, 0.68, 0).toNonIndexed();
  const hatG = new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.73, 0).toNonIndexed();
  const armG = box(0.1, 0.42, 0.1, 0, -0.21, 0);
  const zero = new THREE.Vector3();
  for (let r = 0; r < ROWS; r++) { const y = 0.9 + r * RISE + 0.5, d = r * ROW + 0.5;
    for (let x = -LEN / 2 + 0.4; x < LEN / 2 - 0.3; x += 0.6) {
      if (R() > o.fill) continue; const m = new THREE.Matrix4().makeTranslation(x + (R() - 0.5) * 0.1, y, -d).premultiply(g.matrixWorld);
      if (o.mannequinFans) { // khán đài khách: toàn ma-nơ-canh trắng ngồi im phăng phắc (không cử động)
        const w = '#eeebe5'; add(torsoG, m, w, [0, 0, 0, 0], zero); add(legG, m, w, [0, 0, 0, 0], zero); add(shinG, m, w, [0, 0, 0, 0], zero); add(headG, m, '#f6f3ee', [0, 0, 0, 0], zero);
        for (const sx of [-1, 1]) add(armG, new THREE.Matrix4().makeTranslation(sx * 0.26, 0.48, 0.02).premultiply(m), w, [0, 0, 0, 0], zero); continue; }
      const shirt = o.shirts[Math.floor(R() * o.shirts.length)], skin = o.skins[Math.floor(R() * o.skins.length)]; const ph = R() * 40, am = 0.55 + 0.45 * R();
      add(torsoG, m, shirt, [1, ph, am, 0], zero); add(legG, m, o.pants[Math.floor(R() * o.pants.length)], [1, ph, am, 0], zero); add(shinG, m, '#2b3140', [0, 0, 0, 0], zero);
      add(headG, m, skin, [1.5, ph, am, 0], zero); if (R() < 0.35) add(hatG, m, o.hats[Math.floor(R() * o.hats.length)], [1.5, ph, am, 0], zero);
      for (const sx of [-1, 1]) { const off = new THREE.Vector3(sx * 0.26, 0.48, 0.02); const sh = off.clone().applyMatrix4(m); const am4 = new THREE.Matrix4().makeTranslation(off.x, off.y, off.z).premultiply(m);
        const ow = new THREE.Vector3(sx, 0, 0).applyQuaternion(g.quaternion); const sgn = Math.sign(new THREE.Vector3().crossVectors(fax, new THREE.Vector3(0, -1, 0)).dot(ow)) || 1;
        add(armG, am4, shirt, [sgn > 0 ? 2 : 3, ph, am, 0], sh); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  geo.setAttribute('cp', new THREE.Float32BufferAttribute(CP, 4)); geo.setAttribute('piv', new THREE.Float32BufferAttribute(PV, 3)); geo.setAttribute('fax', new THREE.Float32BufferAttribute(FX, 3)); geo.computeVertexNormals();
  const U = o.U; const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cp; attribute vec3 piv; attribute vec3 fax; uniform float uT, uCheer, uSleep, uBoo;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      if (cp.x > 0.5) { float ch = clamp(uCheer * cp.z * (0.7 + 0.6 * fract(cp.y * 0.37)), 0.0, 1.0); float w = uT * (5.0 + cp.z * 3.0) + cp.y;
        float bo = clamp(uBoo * (0.6 + 0.8 * fract(cp.y * 0.71)), 0.0, 1.0);
        if (cp.x > 1.9) { float s = cp.x < 2.5 ? 1.0 : -1.0; float ang = s * (0.1 + ch * (2.5 + 0.35 * sin(w * 1.3)) + bo * (1.15 + 0.08 * sin(w * 2.0)) + 0.06 * sin(uT * 1.7 + cp.y));
          vec3 r = transformed - piv; r = r * cos(ang) + cross(fax, r) * sin(ang) + fax * dot(fax, r) * (1.0 - cos(ang)); transformed = piv + r; }
        transformed.y += (0.012 + 0.12 * ch) * max(0.0, sin(w)) * (1.0 - uSleep);
        if (cp.x > 1.4 && cp.x < 1.6) { transformed += fax * 0.07 * uSleep; transformed.y -= 0.13 * uSleep; transformed.y -= 0.05 * bo; }
        if (cp.x > 1.9) transformed.y -= 0.05 * uSleep; }`); };
  mat.customProgramCacheKey = () => 'crowd3';
  const all = new THREE.Mesh(geo, mat); all.matrixAutoUpdate = false; all.frustumCulled = false; G.add(all);
}

export function buildNightStadium(scene, opts = {}) {
  const o = Object.assign({ endLeft: '#1f86d1', endLeftText: 'LOS ANGELES', endLeftStroke: '#ffc20e', endRight: '#e4e1db', endRightText: 'MANNEQUINS', endRightFg: '#3a3f48' }, opts);
  const G = new THREE.Group(); scene.add(G);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(FL, FW), new THREE.MeshStandardMaterial({ map: fieldTexture(o), roughness: 0.92 })); field.rotation.x = -Math.PI / 2; field.receiveShadow = true; G.add(field);
  // cỏ quanh sân (trong đường chạy) + đường chạy đỏ + vạch làn + nền bê tông ngoài
  const infield = new THREE.Mesh(ringShape(TR.S, 0.01, TR.R, 48), std('#3a8c35', { roughness: 1 })); infield.position.y = -0.004; infield.receiveShadow = true; G.add(infield);
  const track = new THREE.Mesh(ringShape(TR.S, TR.R, TR.R + TR.W, 64), std('#b8402f', { roughness: 0.95 })); track.position.y = 0.0; track.receiveShadow = true; G.add(track);
  const lineM = new THREE.MeshBasicMaterial({ color: '#f2efe8' });
  for (let k = 0; k <= 4; k++) { const rr = TR.R + k * TR.W / 4; const l = new THREE.Mesh(ringShape(TR.S, rr - 0.03, rr + 0.03, 64), lineM); l.position.y = 0.008; G.add(l); }
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std('#5b5f63', { roughness: 1 })); apron.rotation.x = -Math.PI / 2; apron.position.y = -0.02; apron.receiveShadow = true; G.add(apron);
  // cột gôn
  const gpL = goalPost(-1), gpR = goalPost(1); gpL.position.x = -FL / 2; gpR.position.x = FL / 2; G.add(gpL, gpR);
  // băng ghế đội (nhôm) bên biên nhà
  const benchM = new THREE.MeshStandardMaterial({ color: '#c3c9d1', metalness: 0.75, roughness: 0.32 });
  for (let i = -2; i <= 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 0.45), benchM); b.position.set(i * 6.2, 0.46, -FW / 2 - 3.2); b.castShadow = b.receiveShadow = true; G.add(b);
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.4), benchM); l.position.set(i * 6.2 + s * 2.4, 0.23, -FW / 2 - 3.2); G.add(l); } }
  // khán đài: nhà (z âm) đông người cổ vũ; khách (z dương) toàn ma-nơ-canh ngồi im
  const U = { uT: { value: 0 }, uCheer: { value: 0.3 }, uSleep: { value: 0 }, uBoo: { value: 0 } };
  bleachers(G, -1, { U, fill: 0.86, seed: 31, pressBox: true, banner: 'BOLT UP  •  HOME', bannerBg: '#1f86d1', bannerFg: '#ffc20e',
    shirts: ['#1f86d1', '#2f9be8', '#ffc20e', '#ffffff', '#1d3a6b', '#5aaef0', '#f2f2f2', '#c9d9ea', '#ffc20e', '#2a2f3a', '#8fc3ee'], skins: ['#f1c9a5', '#c68c5f', '#8d5a3b', '#5a3a28', '#e8b98f'],
    pants: ['#2b3a55', '#3b3b3b', '#56627a'], hats: ['#ffc20e', '#1f86d1', '#ffffff', '#1d3a6b'] });
  bleachers(G, 1, { U, fill: 0.55, seed: 77, mannequinFans: true, banner: 'VISITORS', bannerBg: '#e4e1db', bannerFg: '#3a3f48', rows: 12 });
  // tháp đèn 4 góc, mặt đèn hướng vào giữa sân
  const LT = [];
  for (const [x, z] of [[-42, -40], [42, -40], [-42, 40], [42, 40], [0, -44], [0, 44]]) { const t = lightTower(x === 0 ? 34 : 30); t.position.set(x, 0, z); t.lookAt(0, 0, 0); t.rotation.x = 0; t.rotation.z = 0; t.rotation.y = Math.atan2(-x, -z); G.add(t); LT.push(t); }
  // bảng điểm sau end zone trái, hướng về sân
  const SB = scoreboard(); SB.group.position.set(-FL / 2 - 12, 0, -15); SB.group.rotation.y = Math.PI / 2; G.add(SB.group);
  G.add(skyDome());
  scene.fog = new THREE.Fog('#1a2a52', 90, 330);
  scene.background = new THREE.Color('#0b1430');
  return { group: G, crowd: U, sbTex: SB.tex, field, towers: LT };
}

// ánh sáng đèn pha đêm: sân sáng rực, nền trời tối; 2 nguồn chính tạo bóng chéo (giống đèn tháp), viền lạnh từ trời
export function nightLights(scene) {
  const hemi = new THREE.HemisphereLight('#e9efff', '#3a5a34', 1.5); scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff6e4', 3.6); key.position.set(-30, 40, -34); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 140 }); key.shadow.bias = -0.0004; key.shadow.radius = 3; scene.add(key); scene.add(key.target);
  const key2 = new THREE.DirectionalLight('#fff1dc', 2.0); key2.position.set(32, 38, 30); scene.add(key2);
  const rim = new THREE.DirectionalLight('#9fb8ff', 1.1); rim.position.set(0, 20, 50); scene.add(rim);
  // dời vùng đổ bóng theo nhân vật trong khung hình
  const follow = (x, z) => { key.target.position.set(x, 0, z); key.position.set(x - 30, 40, z - 34); };
  return { hemi, key, key2, rim, follow };
}
