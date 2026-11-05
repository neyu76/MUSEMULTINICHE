// Nhân vật v2: Quaternius Universal Base Characters (CC0) + phụ kiện tóc/râu/lông mày (CC0)
// + đồng phục tô theo vùng xương (giữ texture da ở đầu/tay), số áo, mắt hoạt hình to, mũ bảo hiểm.
// Animation: UAL2 (cùng tên xương). Mọi phụ kiện được gắn vào khung xương của nhân vật.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';

const L = new GLTFLoader();
const _v = new THREE.Vector3();
const cache = {};
const load = (u) => (cache[u] ??= L.loadAsync(u));
const ROOT = './assets/';

export async function loadLibrary() {
  const [male, female, ual2] = await Promise.all([
    load(ROOT + 'ubc/Superhero_Male_FullBody.gltf'), load(ROOT + 'ubc/Superhero_Female_FullBody.gltf'), load(ROOT + 'ual2/UAL2_Standard.glb')]);
  const acc = {};
  for (const n of ['Hair_Buzzed', 'Hair_SimpleParted', 'Hair_Long', 'Hair_Buns', 'Hair_BuzzedFemale', 'Hair_Beard', 'Eyebrows_Regular', 'Eyebrows_Female'])
    acc[n] = await load(ROOT + 'ubc/' + n + '.gltf');
  return { male, female, clips: ual2.animations, acc };
}

const REGION = (b) => {
  if (/Head/.test(b)) return 'head';
  if (/neck/.test(b)) return 'skin';
  if (/lowerarm|hand|index|middle|pinky|ring|thumb/.test(b)) return 'skin';
  if (/upperarm|clavicle|spine/.test(b)) return 'jersey';
  if (/pelvis|thigh/.test(b)) return 'pants';
  if (/calf/.test(b)) return 'socks';
  if (/foot|ball/.test(b)) return 'shoes';
  return 'jersey';
};

function outfitMaterial(base) {
  const m = base.clone();
  m.userData.faceO = { value: new THREE.Vector3() }; m.userData.faceR = { value: new THREE.Vector3(1, 0, 0) }; m.userData.faceUp = { value: new THREE.Vector3(0, 1, 0) }; m.userData.faceF = { value: new THREE.Vector3(0, 0, 1) }; m.userData.faceS = { value: 1 };
  m.userData.uni = { sc: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color()] }, sn: { value: 0 }, st: { value: new THREE.Vector2(0.5, 0.07) }, pc: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color()] }, pn: { value: 0 }, pw: { value: 0.13 }, cc: { value: new THREE.Color() }, cn: { value: 0 } };
  m.userData.faceU = { value: (() => { const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); t.needsUpdate = true; return t; })() };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.faceO = m.userData.faceO; sh.uniforms.faceR = m.userData.faceR; sh.uniforms.faceUp = m.userData.faceUp; sh.uniforms.faceF = m.userData.faceF; sh.uniforms.faceS = m.userData.faceS;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 outfit;\nattribute float puff;\nattribute float headm;\nattribute vec4 band;\nvarying vec4 vBand;\nvarying vec4 vOutfit;\nvarying vec3 vFace;\nuniform vec3 faceO, faceR, faceUp, faceF; uniform float faceS;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOutfit = outfit; vBand = band;\nvec3 fp = position - faceO; vFace = vec3(dot(fp, faceR) / faceS + 0.5, dot(fp, faceUp) / faceS + 0.5, headm * step(-0.2, dot(normal, faceF)));\ntransformed += normalize(objectNormal) * puff;');
    sh.uniforms.faceMap = m.userData.faceU; for (const [k, v] of Object.entries(m.userData.uni)) sh.uniforms['u_' + k] = v;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec4 vOutfit;\nvarying vec4 vBand;\nvarying vec3 vFace;\nuniform sampler2D faceMap;\nuniform vec3 u_sc[3]; uniform int u_sn; uniform vec2 u_st; uniform vec3 u_pc[3]; uniform int u_pn; uniform float u_pw; uniform vec3 u_cc; uniform int u_cn;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.0, vOutfit.a);').replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.85, vOutfit.a);')
      .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vOutfit.rgb, vOutfit.a);\nif (vOutfit.a > 0.9) { if (u_sn > 0 && vBand.x > -1.0) { float q = (vBand.x - u_st.x) / u_st.y; for (int k = 0; k < 3; k++) if (k < u_sn && q >= float(k) && q < float(k + 1)) diffuseColor.rgb = u_sc[k]; }\n if (u_pn > 0 && length(vBand.yz) > 0.5) { float an = atan(vBand.z, vBand.y); float q = (an + u_pw * float(u_pn) * 0.5) / u_pw; for (int k = 0; k < 3; k++) if (k < u_pn && q >= float(k) && q < float(k + 1)) diffuseColor.rgb = u_pc[k]; }\n if (u_cn > 0 && vBand.w > 0.0) diffuseColor.rgb = u_cc; }\nvec4 fcol = (vFace.z > 0.5 && vFace.x > 0.0 && vFace.x < 1.0 && vFace.y > 0.0 && vFace.y < 1.0) ? texture2D(faceMap, vFace.xy) : vec4(0.0);\ndiffuseColor.rgb = mix(diffuseColor.rgb, fcol.rgb, fcol.a);');
  };
  m.customProgramCacheKey = () => 'outfit';
  return m;
}

function numberTexture(num, fg, outline) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.font = '900 200px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = outline; g.strokeText(String(num), 128, 136);
  g.fillStyle = fg; g.fillText(String(num), 128, 136);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// bounding box (world, bind pose) of vertices whose dominant bone matches re
function regionBox(root, re) {
  const box = new THREE.Box3(), v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse((n) => {
    if (!n.isSkinnedMesh) return;
    const p = n.geometry.attributes.position, si = n.geometry.attributes.skinIndex, sw = n.geometry.attributes.skinWeight;
    for (let i = 0; i < p.count; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
      if (re.test(n.skeleton.bones[best].name)) { v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld); box.expandByPoint(v); }
    }
  });
  return box;
}


// Làm mượt Laplace trên hình dạng gốc (bind pose) theo vùng: xoá cơ bắp/chi tiết để giống phong cách mẫu (áo rộng, thân trơn).
// Các đỉnh trùng vị trí (đường nối UV) được gộp để không bị nứt.
function smoothRegions(g, regionOf, iters) {
  const pos = g.attributes.position, nor = g.attributes.normal, idx = g.index, n = pos.count;
  const key = new Map(), gid = new Int32Array(n); let G = 0;
  for (let i = 0; i < n; i++) { const k = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`; let v = key.get(k); if (v === undefined) { v = G++; key.set(k, v); } gid[i] = v; }
  const gp = new Float32Array(G * 3), gc = new Int32Array(G), gIt = new Int32Array(G);
  for (let i = 0; i < n; i++) { const q = gid[i]; gp[q * 3] = pos.getX(i); gp[q * 3 + 1] = pos.getY(i); gp[q * 3 + 2] = pos.getZ(i); gIt[q] = Math.max(gIt[q], iters[regionOf(i)] || 0); }
  const nb = Array.from({ length: G }, () => new Set());
  for (let i = 0; i < idx.count; i += 3) { const a = gid[idx.getX(i)], b = gid[idx.getX(i + 1)], c = gid[idx.getX(i + 2)]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  const maxIt = Math.max(...Object.values(iters), 0);
  for (let it = 0; it < maxIt; it++) {
    const np = gp.slice();
    for (let q = 0; q < G; q++) {
      if (gIt[q] <= it || nb[q].size === 0) continue;
      let x = 0, y = 0, z = 0; for (const m of nb[q]) { x += gp[m * 3]; y += gp[m * 3 + 1]; z += gp[m * 3 + 2]; } const k = nb[q].size;
      const lam = 0.5; np[q * 3] += lam * (x / k - gp[q * 3]); np[q * 3 + 1] += lam * (y / k - gp[q * 3 + 1]); np[q * 3 + 2] += lam * (z / k - gp[q * 3 + 2]);
    }
    // bước co ngược (Taubin) để không teo
    const np2 = np.slice();
    for (let q = 0; q < G; q++) {
      if (gIt[q] <= it || nb[q].size === 0) continue;
      let x = 0, y = 0, z = 0; for (const m of nb[q]) { x += np[m * 3]; y += np[m * 3 + 1]; z += np[m * 3 + 2]; } const k = nb[q].size;
      const mu = -0.53; np2[q * 3] += mu * (x / k - np[q * 3]); np2[q * 3 + 1] += mu * (y / k - np[q * 3 + 1]); np2[q * 3 + 2] += mu * (z / k - np[q * 3 + 2]);
    }
    gp.set(np2);
  }
  for (let i = 0; i < n; i++) { const q = gid[i]; pos.setXYZ(i, gp[q * 3], gp[q * 3 + 1], gp[q * 3 + 2]); }
  g.computeVertexNormals();
  // pháp tuyến trơn qua đường nối
  const acc = new Float32Array(G * 3); for (let i = 0; i < n; i++) { const q = gid[i]; acc[q * 3] += nor.getX(i); acc[q * 3 + 1] += nor.getY(i); acc[q * 3 + 2] += nor.getZ(i); }
  for (let i = 0; i < n; i++) { const q = gid[i]; const v = new THREE.Vector3(acc[q * 3], acc[q * 3 + 1], acc[q * 3 + 2]).normalize(); nor.setXYZ(i, v.x, v.y, v.z); }
}

// Vẽ mắt/lông mày/miệng PHẲNG lên mặt (giống mẫu: mắt trắng to vẽ trên da, đồng tử nhỏ, mí trên đậm, lông mày dày).
// Tìm ánh xạ (x,y) mặt -> (u,v) bằng bình phương tối thiểu trên các đỉnh quanh mỗi mắt, rồi vẽ vào canvas cùng kích thước texture.
function paintFace(mesh, eyeBox, P) {
  // tấm mặt phẳng chiếu thẳng từ phía trước (toạ độ bind của mesh) -> không méo theo UV
  const ec = eyeBox.getCenter(new THREE.Vector3()), ew = eyeBox.getSize(new THREE.Vector3()).x;
  const S = 0.2; // tấm vuông 20 cm quanh giữa hai mắt
  const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
  const toL = (v) => v.clone().applyMatrix4(inv), dirL = (d) => d.clone().transformDirection(inv);
  const U = mesh.material.userData;
  const ls = new THREE.Vector3(); new THREE.Matrix4().copy(inv).decompose(new THREE.Vector3(), new THREE.Quaternion(), ls);
  U.faceO.value.copy(toL(ec)); U.faceR.value.copy(dirL(new THREE.Vector3(1, 0, 0))); U.faceUp.value.copy(dirL(new THREE.Vector3(0, 1, 0))); U.faceF.value.copy(dirL(new THREE.Vector3(0, 0, 1)));
  U.faceS.value = S * ls.x;
  const N = 1024, c = document.createElement('canvas'); c.width = N; c.height = N; const g = c.getContext('2d');
  const X = (x) => (x / S + 0.5) * N, Y = (y) => (0.5 - y / S) * N, R = (r) => r / S * N; // y lên trên -> canvas xuống dưới (flipY mặc định)
  const k = P.eyeScale / 1.7, rx = 0.019 * k, ry = 0.017 * k, sep = Math.max(ew * 0.29, rx * 1.05);
  for (const side of [-1, 1]) {
    const cx = side * sep, cy = (P.eyeY || 0) * ry;
    g.save(); g.translate(X(cx), Y(cy));
    g.beginPath(); g.ellipse(0, 0, R(rx), R(ry), 0, 0, Math.PI * 2); g.fillStyle = '#fbfbf7'; g.fill(); g.lineWidth = R(0.0012); g.strokeStyle = '#2a1a12'; g.stroke();
    const lx = R((P.look ? P.look[0] : side * -0.12) * rx * 0.5), ly = R(-(P.look ? P.look[1] : 0) * ry * 0.4);
    g.beginPath(); g.ellipse(lx, ly + R(ry * 0.08), R(rx * 0.36), R(ry * 0.42), 0, 0, Math.PI * 2); g.fillStyle = P.irisColor || '#3b2416'; g.fill();
    g.beginPath(); g.ellipse(lx, ly + R(ry * 0.08), R(rx * 0.2), R(ry * 0.24), 0, 0, Math.PI * 2); g.fillStyle = '#0a0a0a'; g.fill();
    g.beginPath(); g.arc(lx + R(rx * 0.12), ly - R(ry * 0.08), R(rx * 0.07), 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
    g.beginPath(); g.ellipse(0, 0, R(rx * 1.02), R(ry * 1.04), 0, Math.PI * 1.08, Math.PI * 1.92); g.lineWidth = R(0.0032); g.strokeStyle = '#120c08'; g.lineCap = 'round'; g.stroke();
    if (P.paintBrows !== false) {
      const by = -R(ry * 1.55 + (P.browRaise || 0) * ry), tilt = (P.browAngle ?? 0.18) * side;
      g.beginPath(); g.moveTo(-R(rx * 1.05), by + R(ry * 0.25) * (side > 0 ? 1 : -1) * tilt * 3); g.quadraticCurveTo(0, by - R(ry * 0.35), R(rx * 1.05), by - R(ry * 0.25) * (side > 0 ? 1 : -1) * tilt * 3);
      g.lineWidth = R(0.0065 * (P.browWeight || 1)); g.strokeStyle = P.browPaint || '#1b120c'; g.stroke();
    }
    g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  U.faceU.value = t;
}

export function makeCharacter(lib, o = {}) {
  const P = Object.assign({ body: 'male', skin: null, jersey: '#ffffff', pants: '#b8bcc4', socks: '#ffffff', shoes: '#1b1b1b',
    shirtless: false, number: null, numberColor: '#0b2a5b', numberOutline: '#ffffff', hair: 'Hair_Buzzed', hairColor: '#1b120c',
    beard: false, brows: true, cartoonEyes: true, eyeScale: 1.7, helmet: null, mask: '#0b2a5b', scale: 1, headScale: 1, puff: { jersey: 0.022, pants: 0.012, socks: 0.004, shoes: 0.006, skin: 0.0 }, skinMix: 0.8, flat: true, face: 'painted', smooth: { jersey: 12, pants: 10, socks: 6, shoes: 0, skin: 4, head: 0 } }, o);
  const src = P.body === 'female' ? lib.female : lib.male;
  const root = SU.clone(src.scene);
  const bones = {}; root.traverse((n) => { if (n.isBone) bones[n.name] = n; });
  const skeleton = (() => { let s; root.traverse((n) => { if (n.isSkinnedMesh && !s) s = n.skeleton; }); return s; })();
  root.updateMatrixWorld(true);
  const tmp = new THREE.Color(); let bodyMesh = null;
  root.traverse((n) => {
    if (!n.isSkinnedMesh) return;
    n.castShadow = true; n.receiveShadow = true; n.frustumCulled = false;
    const isBody = /Superhero/.test(n.material.name);
    if (/Hair/.test(n.material.name)) { if (P.face === 'painted') { n.visible = false; return; } n.material = n.material.clone(); n.material.color.set(P.browColor || '#2a2a2a'); }
    if (/Eye/.test(n.material.name) && P.cartoonEyes) { n.visible = false; return; }
    if (!isBody) return;
    bodyMesh = n;
    const g = n.geometry = n.geometry.clone();
    const si = g.attributes.skinIndex, sw = g.attributes.skinWeight; const a = new Float32Array(si.count * 4); const band = new Float32Array(si.count * 4); for (let i = 0; i < si.count; i++) { band[i * 4] = -9; band[i * 4 + 3] = -1; } const pf = new Float32Array(si.count);
    const inv = new THREE.Matrix4().copy(n.matrixWorld).invert(); const bp = {};
    for (const b of n.skeleton.bones) bp[b.name] = b.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
    const lsc = new THREE.Vector3(); inv.decompose(new THREE.Vector3(), new THREE.Quaternion(), lsc);
    const UNI = { bp, ls: lsc.x, fwd: new THREE.Vector3(0, 0, 1).transformDirection(inv), outward: (sd) => { const v = new THREE.Vector3(1, 0, 0).transformDirection(inv); return (bp['thigh_' + sd].x - bp['pelvis'].x) * v.x + (bp['thigh_' + sd].y - bp['pelvis'].y) * v.y + (bp['thigh_' + sd].z - bp['pelvis'].z) * v.z > 0 ? v : v.negate(); } };
    const regOf = (i) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } } const r0 = REGION(n.skeleton.bones[best].name); return (r0 === 'skin' && /hand|index|middle|pinky|ring|thumb/.test(n.skeleton.bones[best].name)) ? 'hand' : r0; };
    if (P.smooth) smoothRegions(g, regOf, P.smooth);
    for (let i = 0; i < si.count; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
      const reg = REGION(n.skeleton.bones[best].name);
      const isHand = /hand|index|middle|pinky|ring|thumb/.test(n.skeleton.bones[best].name);
      pf[i] = (P.shirtless && reg === 'jersey') ? (P.puff.skin || 0) : reg === 'head' ? (P.puff.head || 0) : isHand ? (P.puff.hand || 0) : (P.puff[reg] || 0);
      if (reg === 'skin' || reg === 'head' || (P.shirtless && reg === 'jersey')) { if (P.skin) { tmp.set(P.skin).convertSRGBToLinear(); a.set([tmp.r, tmp.g, tmp.b, P.skinMix], i * 4); } continue; }
      let col = P[reg];
      const bn = n.skeleton.bones[best].name;
      if (UNI) {
        _v.fromBufferAttribute(g.attributes.position, i); band[i * 4] = -9; band[i * 4 + 3] = -1;
        if (/upperarm/.test(bn)) { const sd = bn.slice(-1), A0 = UNI.bp['upperarm_' + sd], A1 = UNI.bp['lowerarm_' + sd];
          const ax = A1.clone().sub(A0); band[i * 4] = _v.clone().sub(A0).dot(ax) / ax.lengthSq(); }
        if (/thigh/.test(bn)) { const sd = bn.slice(-1), A0 = UNI.bp['thigh_' + sd], A1 = UNI.bp['calf_' + sd];
          const ax = A1.clone().sub(A0).normalize(); const d = _v.clone().sub(A0); const perp = d.sub(ax.clone().multiplyScalar(d.dot(ax)));
          const out = UNI.outward(sd); const an = Math.atan2(perp.dot(UNI.fwd), perp.dot(out)); band[i * 4 + 1] = Math.cos(an); band[i * 4 + 2] = Math.sin(an); }
        if (/spine_03|neck/.test(bn) && reg === 'jersey') band[i * 4 + 3] = (_v.y - (UNI.bp['neck_01'].y - 0.035 * UNI.ls)) / UNI.ls;
      }
      tmp.set(col).convertSRGBToLinear(); a.set([tmp.r, tmp.g, tmp.b, 1], i * 4);
    }
    // làm mềm ranh giới vùng màu (áo/quần/da) bằng vài lượt trung bình láng giềng -> bỏ răng cưa
    { const idx = g.index, nbr = Array.from({ length: si.count }, () => []);
      for (let i = 0; i < idx.count; i += 3) { const v = [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)]; for (const x of v) for (const y of v) if (x !== y) nbr[x].push(y); }
      for (let it = 0; it < (P.edgeSoft ?? 3); it++) { const b = a.slice(), q = pf.slice();
        for (let i = 0; i < si.count; i++) { const L = nbr[i]; if (!L.length) continue; let r = a[i*4], gg = a[i*4+1], bb = a[i*4+2], al = a[i*4+3], pp = pf[i];
          for (const j of L) { r += a[j*4]; gg += a[j*4+1]; bb += a[j*4+2]; al += a[j*4+3]; pp += pf[j]; } const k = L.length + 1;
          // màu chỉ trộn giữa các đỉnh có alpha > 0 (không pha da vào áo)
          if (a[i*4+3] > 0) { b[i*4] = r / k; b[i*4+1] = gg / k; b[i*4+2] = bb / k; } b[i*4+3] = al / k; q[i] = pp / k; }
        a.set(b); pf.set(q); } }
    { const hm = new Float32Array(si.count); for (let i = 0; i < si.count; i++) hm[i] = regOf(i) === 'head' ? 1 : 0; g.setAttribute('headm', new THREE.BufferAttribute(hm, 1)); }
    g.setAttribute('outfit', new THREE.BufferAttribute(a, 4)); g.setAttribute('band', new THREE.BufferAttribute(band, 4)); g.setAttribute('puff', new THREE.BufferAttribute(pf, 1));
    n.material = outfitMaterial(n.material); { const U = n.material.userData.uni, lin = (c) => new THREE.Color(c).convertSRGBToLinear();
      if (P.sleeveStripes) { P.sleeveStripes.forEach((c, k) => U.sc.value[k] = lin(c)); U.sn.value = P.sleeveStripes.length; U.st.value.set(P.sleeveStripeAt ?? 0.55, P.sleeveStripeW ?? 0.08); }
      if (P.pantsStripes) { P.pantsStripes.forEach((c, k) => U.pc.value[k] = lin(c)); U.pn.value = P.pantsStripes.length; U.pw.value = P.pantsStripeW ?? 0.11; }
      if (P.collar) { U.cc.value = lin(P.collar); U.cn.value = 1; } } n.material.roughness = 0.8; if (n.material.normalScale) n.material.normalScale.set(P.flat ? 0.0 : 0.45, P.flat ? 0.0 : 0.45); if (P.flat) { n.material.normalMap = null; n.material.roughness = 0.9; }
  });
  // phụ kiện: tóc, râu, lông mày -> gắn vào skeleton nhân vật
  const addAcc = (name, color) => {
    const a = SU.clone(lib.acc[name].scene);
    a.traverse((n) => {
      if (!n.isSkinnedMesh) return;
      const bs = n.skeleton.bones.map((b) => bones[b.name] || b);
      n.bind(new THREE.Skeleton(bs, n.skeleton.boneInverses), n.bindMatrix);
      n.material = /Eyebrow/.test(name) ? new THREE.MeshStandardMaterial({ color: color || '#141414', roughness: 0.9 }) : n.material.clone(); if (color && !/Eyebrow/.test(name)) n.material.color.set(color); n.castShadow = true; n.frustumCulled = false;
    });
    const meshes = []; a.traverse((n) => { if (n.isSkinnedMesh) meshes.push(n); });
    meshes.forEach((m) => root.add(m));
  };
  if (P.hair && !P.helmet) addAcc(P.hair, P.hairColor);
  if (P.beard) addAcc('Hair_Beard', P.beardColor || P.hairColor);
  if (P.brows) addAcc(P.body === 'female' ? 'Eyebrows_Female' : 'Eyebrows_Regular', P.browColor || '#141414');
  const head = bones['Head'], chest = bones['spine_03'];
  const hb = regionBox(root, /^Head$/);
  ch_toon: if (P.toonHead) {
    const hc0 = hb.getCenter(new THREE.Vector3()), hs0 = hb.getSize(new THREE.Vector3());
    const R = Math.max(hs0.x, hs0.z) * 0.62;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 24), new THREE.MeshStandardMaterial({ color: P.skin || '#c58c62', roughness: 0.85 }));
    shell.scale.set(1.0, 1.02, 0.98); const shellC = new THREE.Vector3(hc0.x, hc0.y + hs0.y * 0.04, hc0.z + hs0.z * 0.02); shell.position.copy(shellC); shell.castShadow = true;
    root.add(shell); bones['Head'].attach(shell);
    const ear = (k) => { const e = new THREE.Mesh(new THREE.SphereGeometry(R * 0.22, 12, 10), shell.material); e.scale.set(0.5, 1, 0.8); e.position.set(hc0.x + k * R * 0.98, hc0.y, hc0.z); root.add(e); bones['Head'].attach(e); };
    ear(1); ear(-1);
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(R * 0.16, R * 0.035, 6, 16, Math.PI), new THREE.MeshStandardMaterial({ color: '#5a2a1e' }));
    mouth.rotation.z = Math.PI; mouth.position.set(hc0.x, hc0.y - R * 0.38, hc0.z + R * 0.93); root.add(mouth); bones['Head'].attach(mouth);
    hb.setFromCenterAndSize(shellC, new THREE.Vector3(R * 2, R * 2 * 1.02, R * 2 * 0.98));
  }
  const hc = hb.getCenter(new THREE.Vector3()), hs = hb.getSize(new THREE.Vector3());
  const std = (c, x = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5 }, x));
  const place = (mesh, pos) => { mesh.position.copy(pos); root.add(mesh); head.attach(mesh); mesh.castShadow = true; return mesh; };
  if (P.cartoonEyes && P.face === 'painted' && bodyMesh) {
    let eb = new THREE.Box3(); root.traverse((n) => { if (n.isSkinnedMesh && /Eye/.test(n.material.name)) eb.expandByObject(n); });
    paintFace(bodyMesh, eb, P);
  } else if (P.cartoonEyes) {
    let eb = new THREE.Box3(); root.traverse((n) => { if (n.isSkinnedMesh && /Eye/.test(n.material.name)) eb.expandByObject(n); });
    if (eb.isEmpty()) eb.setFromCenterAndSize(new THREE.Vector3(hc.x, hc.y + hs.y * 0.08, hb.max.z - hs.z * 0.15), new THREE.Vector3(hs.x * 0.55, hs.y * 0.08, 0.02));
    const ec = eb.getCenter(new THREE.Vector3()), ew = eb.getSize(new THREE.Vector3()).x;
    const r = ew * 0.17 * P.eyeScale;
    for (const s of [-1, 1]) {
      const p = new THREE.Vector3(ec.x + s * ew * 0.29, ec.y, ec.z + r * 0.25);
      place(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), std('#ffffff', { roughness: 0.25 })), p).scale.set(1, 1.15, 0.6);
      place(new THREE.Mesh(new THREE.SphereGeometry(r * 0.5, 16, 12), std('#121212', { roughness: 0.15 })), p.clone().add(new THREE.Vector3(0, -r * 0.05, r * 0.42))).scale.set(1, 1.15, 0.5);
    }
  }
  if (P.helmet) {
    // Mũ bóng bầu dục: vỏ hơi dài về sau, ô mở mặt, hai má che tai kéo xuống hàm, sọc giữa, lỗ tai, lưới chắn mặt dày bắt vào hai má
    const R = hs.x * 0.66;
    const geo = new THREE.SphereGeometry(R, 96, 48, 0, Math.PI * 2, 0, Math.PI * 0.86);
    const pos = geo.attributes.position, idx = geo.index, keep = [];
    const cut = (x, y, z) => { const ang = Math.atan2(x, z), ay = y / R;
      if (Math.abs(ang) < 0.92 && ay < 0.30) return true;                // ô mặt
      if (Math.abs(ang) >= 0.92 && Math.abs(ang) < 2.05) return ay < -0.80; // má che tai xuống tới hàm
      return ay < -0.28;                                                  // gáy
    };
    for (let i = 0; i < idx.count; i += 3) { let cx = 0, cy = 0, cz = 0; for (let k = 0; k < 3; k++) { const j = idx.getX(i + k); cx += pos.getX(j); cy += pos.getY(j); cz += pos.getZ(j); } if (!cut(cx / 3, cy / 3, cz / 3)) keep.push(idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)); }
    geo.setIndex(keep); geo.computeVertexNormals();
    const st = P.helmetStripe || []; const col = new Float32Array(pos.count * 3); const cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) / R, y = pos.getY(i) / R; let c = P.helmet;
      if (st.length && y > -0.1) { const w = 0.045, x0 = -w * st.length / 2; for (let q = 0; q < st.length; q++) if (x >= x0 + q * w && x < x0 + (q + 1) * w) c = st[q]; }
      cc.set(c).convertSRGBToLinear(); col.set([cc.r, cc.g, cc.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const center = new THREE.Vector3(hc.x, hc.y + hs.y * 0.01, hc.z - hs.z * 0.06);
    const hm = place(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: P.helmetMetal ?? 0.35, side: THREE.DoubleSide })), center.clone());
    hm.scale.set(1.08, 1.16, 1.22);
    // lỗ tai
    for (const sd of [-1, 1]) { const e = place(new THREE.Mesh(new THREE.CircleGeometry(R * 0.11, 16), std('#111111')), new THREE.Vector3(center.x + sd * R * 1.075, center.y - R * 0.18, center.z + R * 0.05)); e.rotation.y = sd * Math.PI / 2; }
    // lưới chắn mặt
    const mm = std(P.mask, { roughness: 0.35 }); const tr = R * (P.maskThick ?? 0.075);
    const tube = (pts, r = tr) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 10, false), mm);
    const arc = (y, rad, a0, a1, zf = 1.3) => { const p = []; for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 16) p.push(new THREE.Vector3(Math.sin(a) * rad * 1.08, y, Math.cos(a) * rad * zf)); return p; };
    const my = P.maskY ?? 0; const bars = P.maskBars === 1 ? [[-0.32, 0.98]] : [[0.05, 1.0], [-0.32, 0.98], [-0.62, 0.86]];
    for (const [y, r0] of bars) place(tube(arc((y + my) * R, R * r0, -1.25, 1.25)), center.clone());
    if (P.maskBars !== 1) {
    place(tube([new THREE.Vector3(0, (0.05 + my) * R, R * 1.3), new THREE.Vector3(0, (-0.32 + my) * R, R * 1.27), new THREE.Vector3(0, (-0.62 + my) * R, R * 1.12)]), center.clone());
    for (const sd of [-1, 1]) place(tube([new THREE.Vector3(sd * R * 1.02, (0.05 + my) * R, R * 0.4), new THREE.Vector3(sd * R * 0.98, (-0.32 + my) * R, R * 0.38), new THREE.Vector3(sd * R * 0.85, (-0.62 + my) * R, R * 0.36)]), center.clone()); }
  }
  if (P.number != null && !P.shirtless) {
    const cb = regionBox(root, /spine_0[23]/); const cc = cb.getCenter(new THREE.Vector3()), cs = cb.getSize(new THREE.Vector3());
    const mat = new THREE.MeshBasicMaterial({ map: numberTexture(P.number, P.numberColor, P.numberOutline), transparent: true, polygonOffset: true, polygonOffsetFactor: -4 });
    const sz = cs.x * 0.5;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), mat); f.position.set(cc.x, cc.y - cs.y * 0.05, cb.max.z + (P.puff.jersey || 0) + 0.012); root.add(f); chest.attach(f);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(sz * (P.backNumberScale ?? 1.7), sz * (P.backNumberScale ?? 1.7)), mat); b.position.set(cc.x, cc.y, cb.min.z - (P.puff.jersey || 0) - 0.012); b.rotation.y = Math.PI; root.add(b); chest.attach(b);
  }
  if (P.headScale !== 1) head.scale.setScalar(P.headScale);
  root.scale.setScalar(P.scale);
  const mixer = new THREE.AnimationMixer(root); let cur = null;
  const play = (name, { loop = true, fade = 0.2, timeScale = 1, at = 0 } = {}) => {
    const clip = lib.clips.find((c) => c.name === name); if (!clip) throw new Error('No clip ' + name);
    const a = mixer.clipAction(clip); a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !loop; a.timeScale = timeScale; a.time = at;
    if (cur && cur !== a) cur.crossFadeTo(a, fade, false); a.play(); cur = a; return a;
  };
  return { root, mixer, bones, play, skeleton };
}

// Em bé thật: đầu to (~1/4 chiều cao), tay chân ngắn mũm mĩm, thân ngắn, mặt tròn không lông mày.
// Dùng kèm POSES trong tuthe.js (ngồi, bò, nằm) vì thư viện động tác là của người lớn.
export function makeBaby(lib, o = {}) {
  const ch = makeCharacter(lib, Object.assign({ hair: null, brows: false, beard: false, eyeScale: 1.6, toonHead: true,
    puff: { jersey: 0.075, pants: 0.07, socks: 0.05, shoes: 0.03, skin: 0.045 }, skinMix: 0.85 }, o, { scale: 1 }));
  const b = ch.bones;
  // chỉ dùng scale ĐỀU cho từng xương (scale lệch trục làm méo xương con); độ mũm mĩm lấy từ puff
  const U = { spine_01: 0.88, spine_02: 0.92, spine_03: 0.95, neck_01: 0.7, thigh_l: 0.62, thigh_r: 0.62, calf_l: 0.95, calf_r: 0.95,
    upperarm_l: 0.66, upperarm_r: 0.66, lowerarm_l: 0.95, lowerarm_r: 0.95 };
  for (const [n, v] of Object.entries(U)) if (b[n]) b[n].scale.setScalar(v);
  const chain = U.spine_01 * U.spine_02 * U.spine_03 * U.neck_01;
  b.Head.scale.setScalar((o.headRatio ?? 1.75) / chain);
  ch.root.scale.setScalar(o.scale ?? 0.5);
  ch.baby = true;
  return ch;
}
