// Tóc cho nhân vật (gắn cứng vào xương Head):
//  - "mh:<tên>": tóc hệ thống MakeHuman (CC0) đã chuyển bằng cong_cu/chuyen_toc_mh.py → assets/hair_mh/<tên>.json
//    afro01, braid01, short01..04, long01, ponytail01, bob01, bob02
//  - "proc:<kiểu>": tóc dựng bằng code: buzz, fade, curlytop, afro, dreads, twists, cornrows, braids, hightop, manbun, mohawk
// Tham số chung: color, opts {len, n, thick, puff, fade, back}
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// chỉ giữ kiểu đã kiểm vừa đầu (04/11): afro01, short04. Các kiểu khác lệch vị trí → dùng proc:
const MH = ['afro01', 'short04'];
export async function loadMHHairs(root = './assets/hair_mh/') {
  const out = {}; const tl = new THREE.TextureLoader();
  await Promise.all(MH.map(async (n) => { try { const d = await (await fetch(root + n + '.json')).json(); if (d.tex) { const t = await tl.loadAsync(root + d.tex); const im = t.image; const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      const px = g.getImageData(0, 0, cv.width, cv.height); for (let i = 0; i < px.data.length; i += 4) { const l = (px.data[i] + px.data[i + 1] + px.data[i + 2]) / 765; px.data[i] = px.data[i + 1] = px.data[i + 2] = 150 + 105 * l; } g.putImageData(px, 0, 0);
      d.texture = new THREE.CanvasTexture(cv); d.texture.colorSpace = THREE.SRGBColorSpace; } out[n] = d; } catch (e) { /* bỏ qua */ } }));
  return out;
}

// ---- tóc MakeHuman: ánh xạ hộp đầu MH → hộp đầu nhân vật (bind pose) ----
export function mhHair(d, hb, color, o = {}) {
  const mn = new THREE.Vector3(...d.headBox.min), mx = new THREE.Vector3(...d.headBox.max), sz = mx.clone().sub(mn);
  const tmn = hb.min.clone(), tsz = hb.getSize(new THREE.Vector3());
  const k = new THREE.Vector3(tsz.x / sz.x, tsz.y / sz.y, tsz.z / sz.z).multiplyScalar(o.puff ?? 1.06);
  const P = new Float32Array(d.pos.length); const c = hb.getCenter(new THREE.Vector3()), mc = mn.clone().add(mx).multiplyScalar(0.5);
  for (let i = 0; i < d.pos.length; i += 3) { P[i] = c.x + (d.pos[i] - mc.x) * k.x; P[i + 1] = c.y + (d.pos[i + 1] - mc.y) * k.y + (o.dy ?? 0) * tsz.y; P[i + 2] = c.z + (d.pos[i + 2] - mc.z) * k.z + (o.dz ?? 0) * tsz.z; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2)); g.setIndex(d.idx); g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, side: THREE.DoubleSide, alphaTest: 0.35, transparent: false });
  if (d.texture) { m.map = d.texture; }
  const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; return mesh;
}

// ---- tóc dựng bằng code ----
const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
// điểm trên chỏm đầu (ellipsoid quanh hộp đầu): theta từ đỉnh, phi=0 phía trước (+z)
function cap(hb, k = 1.0) { const c = hb.getCenter(new THREE.Vector3()), s = hb.getSize(new THREE.Vector3());
  const R = new THREE.Vector3(s.x * 0.5 * k, s.y * 0.52 * k, s.z * 0.5 * k); const C = c.clone(); C.y += s.y * 0.04; C.z -= s.z * 0.02;
  const at = (th, ph, lift = 0) => { const d = new THREE.Vector3(Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)); return C.clone().add(new THREE.Vector3(d.x * (R.x + lift), d.y * (R.y + lift), d.z * (R.z + lift))); };
  const nrm = (th, ph) => new THREE.Vector3(Math.sin(th) * Math.sin(ph) / R.x, Math.cos(th) / R.y, Math.sin(th) * Math.cos(ph) / R.z).normalize();
  return { C, R, at, nrm, s }; }
// đường chân tóc: trước cao (theta nhỏ), sau thấp
const hairline = (ph, front = 0.78, back = 1.62) => front + (back - front) * (1 - Math.cos(ph)) / 2;
function shell(K, color, front, back, lift = 0.004, rough = 0.95) {
  const g = new THREE.SphereGeometry(1, 64, 40); const p = g.attributes.position; const keep = []; const ix = g.index;
  const thph = (i) => { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); return [Math.acos(Math.max(-1, Math.min(1, y))), Math.atan2(x, z)]; };
  for (let i = 0; i < ix.count; i += 3) { let ok = true; for (let j = 0; j < 3; j++) { const [th, ph] = thph(ix.getX(i + j)); if (th > hairline(ph, front, back)) ok = false; } if (ok) keep.push(ix.getX(i), ix.getX(i + 1), ix.getX(i + 2)); }
  for (let i = 0; i < p.count; i++) { const [th, ph] = thph(i); const v = K.at(th, ph, lift); p.setXYZ(i, v.x, v.y, v.z); }
  g.setIndex(keep); g.computeVertexNormals(); return g;
}
const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.92, side: THREE.DoubleSide }, o));
export function procHair(style, hb, color, o = {}) {
  const K = cap(hb, 1.0); const R = rnd(o.seed ?? 11); const parts = []; const S = K.s.y; // S ~ chiều cao đầu
  const add = (g) => parts.push(g.index ? g.toNonIndexed() : g);
  const front = o.front ?? 0.82, back = o.back ?? 1.6;
  const base = (lift = 0.006, f = front, b = back) => add(shell(K, color, f, b, lift * S));
  const spheres = (n, r, th0, th1, lift, f = front, b = back, jitter = 0.4) => { for (let i = 0; i < n; i++) { const ph = (R() * 2 - 1) * Math.PI; const th = th0 + Math.sqrt(R()) * (Math.min(th1, hairline(ph, f, b)) - th0);
      const rr = r * (0.75 + R() * 0.5); const p = K.at(th, ph, lift + rr * (0.3 + R() * jitter)); add(new THREE.IcosahedronGeometry(rr, 1).translate(p.x, p.y, p.z)); } };
  const strand = (th, ph, len, thick, down, out, curl = 0, seg = 8) => { const pts = []; let p = K.at(th, ph, 0); const n = K.nrm(th, ph);
    // sợi ở trước trán hất ra sau/hai bên để không che mặt
    const fr = Math.max(0, Math.cos(ph)); let dir = n.clone().multiplyScalar(out).add(new THREE.Vector3(Math.sign(Math.sin(ph) || 1) * fr * 0.5, -down, -fr * 1.2)).normalize(); for (let k = 0; k <= seg; k++) { pts.push(p.clone()); const w = k / seg;
      const d2 = dir.clone().add(new THREE.Vector3(Math.sin(k * 1.7 + ph * 3) * curl, -down * w * 0.8, Math.cos(k * 1.3 + th * 5) * curl)).normalize(); p = p.clone().addScaledVector(d2, len / seg); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg * 2, thick, 5, false)); add(new THREE.SphereGeometry(thick * 1.05, 6, 4).translate(pts[seg].x, pts[seg].y, pts[seg].z)); };
  switch (style) {
    case 'buzz': base(0.004); break;                                                   // cạo sát
    case 'fade': base(0.006, front, 1.45); break;                                      // hai bên sát, trên dày hơn
    case 'curlytop': base(0.01, front, 1.35); spheres(o.n ?? 260, S * (o.thick ?? 0.03), 0, 1.1, S * 0.012); break; // xoăn ngắn phía trên, hai bên fade
    case 'afro': base(0.02, front, 1.7); spheres(o.n ?? 520, S * (o.thick ?? 0.07), 0, 1.75, S * (o.puff ?? 0.09), front + 0.05, 1.75, 0.8); break;
    case 'hightop': base(0.01); { const c = K.at(0, 0, 0); const h = S * (o.len ?? 0.35); add(new THREE.CylinderGeometry(K.R.x * 0.85, K.R.x * 0.95, h, 24).translate(c.x, c.y + h * 0.35, c.z - K.R.z * 0.05)); } break;
    case 'dreads': case 'twists': case 'braids': { base(0.008, front, style === 'twists' ? 1.45 : back); const n = o.n ?? (style === 'twists' ? 90 : 70);
      const len = S * (o.len ?? (style === 'twists' ? 0.18 : style === 'braids' ? 0.9 : 0.75)), th = S * (o.thick ?? (style === 'twists' ? 0.028 : 0.022));
      for (let i = 0; i < n; i++) { const ph = (R() * 2 - 1) * Math.PI; const t = 0.05 + R() * (hairline(ph, front, back) - 0.12);
        if (style === 'twists') strand(t, ph, len * (0.7 + R() * 0.6), th, -0.25, 1.0, 0.25, 4); else strand(t, ph, len * (0.8 + R() * 0.4), th, 0.9 + Math.abs(Math.sin(ph)) * 0.2, 0.55, style === 'braids' ? 0.05 : 0.12, 10); } } break;
    case 'cornrows': { base(0.002, front, 1.5); const rows = o.n ?? 7; for (let r = 0; r < rows; r++) { const ph = ((r + 0.5) / rows - 0.5) * 1.6; // các hàng tết chạy từ trán ra gáy
        for (let k = 0; k < 22; k++) { const th = front * 0.95 - k * 0.11; const tt = Math.abs(th); const pp = th < 0 ? Math.PI - ph : ph; if (tt > hairline(pp, front, 1.5)) continue; const p = K.at(tt, pp, S * 0.006); add(new THREE.SphereGeometry(S * 0.04, 8, 6).scale(0.9, 0.8, 1.5).translate(p.x, p.y, p.z)); } } } break;
    case 'manbun': base(0.008, front, 1.55); { const p = K.at(0.9, Math.PI, S * 0.06); add(new THREE.SphereGeometry(S * 0.12, 16, 12).translate(p.x, p.y, p.z)); } break;
    case 'mohawk': base(0.003, front, 1.4); for (let k = 0; k < 14; k++) { const th = -0.7 + k * 0.12; const pp = th < 0 ? 0 : Math.PI; const p = K.at(Math.abs(th), pp, 0); add(new THREE.ConeGeometry(S * 0.05, S * (o.len ?? 0.22), 6).translate(p.x, p.y + S * 0.08, p.z)); } break;
    default: base(0.006);
  }
  const g = mergeGeometries(parts.map((x) => { const y = x.clone(); for (const k of Object.keys(y.attributes)) if (k !== 'position' && k !== 'normal') y.deleteAttribute(k); return y; })); g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, mat(color)); mesh.castShadow = true; return mesh;
}
