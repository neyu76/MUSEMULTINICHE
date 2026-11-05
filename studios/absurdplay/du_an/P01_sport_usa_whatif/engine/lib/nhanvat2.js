// Nhân vật v2: Quaternius Universal Base Characters (CC0) + phụ kiện tóc/râu/lông mày (CC0)
// + đồng phục tô theo vùng xương (giữ texture da ở đầu/tay), số áo, mắt hoạt hình to, mũ bảo hiểm.
// Animation: UAL2 (cùng tên xương). Mọi phụ kiện được gắn vào khung xương của nhân vật.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
import { loadMHHairs, mhHair, procHair } from './toc.js';

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
  const mh = await loadMHHairs();
  return { male, female, clips: ual2.animations, acc, mh };
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
  m.userData.num = { numO: { value: new THREE.Vector3() }, numOB: { value: new THREE.Vector3() }, numR: { value: new THREE.Vector3(1, 0, 0) }, numUp: { value: new THREE.Vector3(0, 1, 0) }, numF: { value: new THREE.Vector3(0, 0, 1) }, numSF: { value: 1 }, numSB: { value: 1 }, numMap: { value: (() => { const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); t.needsUpdate = true; return t; })() }, numMapB: { value: null } };
  m.userData.faceU = { value: (() => { const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); t.needsUpdate = true; return t; })() };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.faceO = m.userData.faceO; sh.uniforms.faceR = m.userData.faceR; sh.uniforms.faceUp = m.userData.faceUp; sh.uniforms.faceF = m.userData.faceF; sh.uniforms.faceS = m.userData.faceS;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 outfit;\nattribute float puff;\nattribute float headm;\nattribute vec4 band;\nattribute vec4 tat;\nvarying vec4 vTat;\nattribute float torso;\nvarying vec3 vNumF, vNumB;\nuniform vec3 numO, numOB, numR, numUp, numF; uniform float numSF, numSB;\nvarying vec4 vBand;\nvarying vec4 vOutfit;\nvarying vec3 vFace;\nuniform vec3 faceO, faceR, faceUp, faceF; uniform float faceS;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOutfit = outfit; vBand = band; vTat = tat;\nfloat fnn = dot(normal, numF); vec3 np = position - numO; vec3 nb = position - numOB;\nvNumF = vec3(dot(np, numR) / numSF + 0.5, dot(np, numUp) / numSF + 0.5, torso * step(0.2, fnn));\nvNumB = vec3(-dot(nb, numR) / numSB + 0.5, dot(nb, numUp) / numSB + 0.5, torso * step(0.2, -fnn));\nvec3 fp = position - faceO; vFace = vec3(dot(fp, faceR) / faceS + 0.5, dot(fp, faceUp) / faceS + 0.5, headm * step(-0.2, dot(normal, faceF)));\ntransformed += normalize(objectNormal) * puff;');
    sh.uniforms.faceMap = m.userData.faceU; for (const [k, v] of Object.entries(m.userData.num)) sh.uniforms[k] = v; for (const [k, v] of Object.entries(m.userData.uni)) sh.uniforms['u_' + k] = v;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec4 vOutfit;\nvarying vec4 vTat;\nvarying vec4 vBand;\nvarying vec3 vFace;\nuniform sampler2D faceMap;\nuniform sampler2D numMap;\nuniform sampler2D numMapB;\nvarying vec3 vNumF, vNumB;\nuniform vec3 u_sc[3]; uniform int u_sn; uniform vec2 u_st; uniform vec3 u_pc[3]; uniform int u_pn; uniform float u_pw; uniform vec3 u_cc; uniform int u_cn;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.0, vOutfit.a);').replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.85, vOutfit.a);')
      .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vOutfit.rgb, vOutfit.a);\nif (vOutfit.a > 0.9) { if (u_sn > 0 && vBand.x > -1.0) { float q = (vBand.x - u_st.x) / u_st.y; for (int k = 0; k < 3; k++) if (k < u_sn && q >= float(k) && q < float(k + 1)) diffuseColor.rgb = u_sc[k]; }\n if (u_pn > 0 && length(vBand.yz) > 0.5) { float an = atan(vBand.z, vBand.y); float q = (an + u_pw * float(u_pn) * 0.5) / u_pw; for (int k = 0; k < 3; k++) if (k < u_pn && q >= float(k) && q < float(k + 1)) diffuseColor.rgb = u_pc[k]; }\n if (u_cn > 0 && vBand.w > 0.0) diffuseColor.rgb = u_cc; }\nif (vOutfit.a > 0.9) { vec4 nc = vec4(0.0); if (vNumF.z > 0.5 && all(greaterThan(vNumF.xy, vec2(0.0))) && all(lessThan(vNumF.xy, vec2(1.0)))) nc = texture2D(numMap, vNumF.xy); if (vNumB.z > 0.5 && all(greaterThan(vNumB.xy, vec2(0.0))) && all(lessThan(vNumB.xy, vec2(1.0)))) nc = texture2D(numMapB, vNumB.xy); diffuseColor.rgb = mix(diffuseColor.rgb, nc.rgb, nc.a); }\nif (vTat.w > 0.5 && vTat.x > 0.1 && vTat.x < 0.9) { float ta = atan(vTat.z, vTat.y); float q = vTat.x; float ink = max(step(0.6, sin(q * 22.0 + ta * 2.0 + sin(ta * 3.0) * 1.2)), step(0.97, abs(sin(q * 6.2832 * 2.0)))); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.22, ink * 0.9); }\nvec4 fcol = (vFace.z > 0.5 && vFace.x > 0.0 && vFace.x < 1.0 && vFace.y > 0.0 && vFace.y < 1.0) ? texture2D(faceMap, vFace.xy) : vec4(0.0);\ndiffuseColor.rgb = mix(diffuseColor.rgb, fcol.rgb, fcol.a);');
  };
  m.customProgramCacheKey = () => 'outfit';
  return m;
}

function numberTexture(num, fg, outline, word = null, wordColor = null, wordMax = 236) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let ny = 136, fs = 200;
  if (word) { ny = 160; fs = 170; let wf = 64; g.font = `900 ${wf}px Inter, Anton, sans-serif`; while (g.measureText(word).width > wordMax && wf > 18) { wf -= 2; g.font = `900 ${wf}px Inter, Anton, sans-serif`; }
    g.lineWidth = Math.max(4, wf * 0.16); g.strokeStyle = outline; g.strokeText(word, 128, 40); g.fillStyle = wordColor || fg; g.fillText(word, 128, 40); }
  g.font = `900 ${fs}px Anton, Impact, sans-serif`;
  g.lineWidth = 16; g.strokeStyle = outline; g.strokeText(String(num), 128, ny);
  g.fillStyle = fg; g.fillText(String(num), 128, ny);
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
function paintFace(mesh, eyeBox, P0) {
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
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; U.faceU.value = t;
  const draw = (o = {}) => { const P = Object.assign({}, P0, o); g.clearRect(0, 0, N, N);
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
    if ((P.blink || 0) > 0.02) { g.beginPath(); g.rect(-R(rx * 1.15), -R(ry * 1.2), R(rx * 2.3), R(ry * 2.4 * P.blink)); g.fillStyle = P.skin || '#a06a45'; g.fill(); g.beginPath(); g.moveTo(-R(rx), -R(ry * 1.2) + R(ry * 2.4 * P.blink)); g.lineTo(R(rx), -R(ry * 1.2) + R(ry * 2.4 * P.blink)); g.lineWidth = R(0.003); g.strokeStyle = '#120c08'; g.stroke(); }
    else if ((P.lid || 0) > 0.02) { g.beginPath(); g.ellipse(0, 0, R(rx * 1.04), R(ry * 1.06), 0, Math.PI, Math.PI * 2); g.lineTo(R(rx * 1.04), -R(ry) + R(ry * 2 * P.lid)); g.lineTo(-R(rx * 1.04), -R(ry) + R(ry * 2 * P.lid)); g.closePath(); g.fillStyle = P.skin || '#a06a45'; g.fill(); g.beginPath(); g.moveTo(-R(rx), -R(ry) + R(ry * 2 * P.lid)); g.lineTo(R(rx), -R(ry) + R(ry * 2 * P.lid)); g.lineWidth = R(0.0032); g.strokeStyle = '#120c08'; g.stroke(); }
    if (P.paintBrows !== false) {
      const by = -R(ry * 1.55 + (P.browRaise || 0) * ry), tilt = (P.browAngle ?? 0.18) * side;
      g.beginPath(); g.moveTo(-R(rx * 1.05), by + R(ry * 0.25) * (side > 0 ? 1 : -1) * tilt * 3); g.quadraticCurveTo(0, by - R(ry * 0.35), R(rx * 1.05), by - R(ry * 0.25) * (side > 0 ? 1 : -1) * tilt * 3);
      g.lineWidth = R(0.0065 * (P.browWeight || 1)); g.strokeStyle = P.browPaint || '#1b120c'; g.stroke();
    }
    g.restore();
  }
    if (P.mouth) { g.save(); g.translate(X(0), Y(-(P.mouthY ?? 0.062))); g.lineCap = 'round'; g.strokeStyle = '#2a120c'; g.lineWidth = R(0.0035); const w = R(P.mouthW ?? 0.018);
      if (P.mouth === 'smile') { g.beginPath(); g.arc(0, -w * 0.6, w, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
      else if (P.mouth === 'frown') { g.beginPath(); g.arc(0, w * 0.9, w, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); }
      else if (P.mouth === 'o') { g.beginPath(); g.ellipse(0, 0, w * 0.45, w * 0.6, 0, 0, Math.PI * 2); g.fillStyle = '#3a1410'; g.fill(); }
      else { g.beginPath(); g.moveTo(-w * 0.7, 0); g.lineTo(w * 0.7, 0); g.stroke(); } g.restore(); }
    t.needsUpdate = true; };
  draw(); return draw;
}

export function makeCharacter(lib, o = {}) {
  const P = Object.assign({ body: 'male', skin: null, jersey: '#ffffff', pants: '#b8bcc4', socks: '#ffffff', shoes: '#1b1b1b',
    shirtless: false, number: null, numberColor: '#0b2a5b', numberOutline: '#ffffff', hair: 'Hair_Buzzed', hairColor: '#1b120c',
    beard: false, brows: true, cartoonEyes: true, eyeScale: 1.7, helmet: null, mask: '#0b2a5b', scale: 1, headScale: 1, puff: { jersey: 0.022, pants: 0.012, socks: 0.004, shoes: 0.006, skin: 0.0 }, skinMix: 0.8, flat: true, face: 'painted', smooth: { jersey: 12, pants: 10, socks: 6, shoes: 0, skin: 4, head: 0 } }, o);
  const src = P.body === 'female' ? lib.female : lib.male;
  // chiều cao thật (mét) → tỉ lệ: thân gốc UBC nam cao 1,81 m, nữ 1,767 m (đo trên file gltf)
  if (P.heightM) P.scale = P.heightM / (P.body === 'female' ? 1.767 : 1.81);
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
    const si = g.attributes.skinIndex, sw = g.attributes.skinWeight; const a = new Float32Array(si.count * 4); const torso = new Float32Array(si.count); const band = new Float32Array(si.count * 4); for (let i = 0; i < si.count; i++) { band[i * 4] = -9; band[i * 4 + 3] = -1; } const pf = new Float32Array(si.count); const tat = new Float32Array(si.count * 4);
    const inv = new THREE.Matrix4().copy(n.matrixWorld).invert(); const bp = {};
    for (const b of n.skeleton.bones) bp[b.name] = b.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
    const lsc = new THREE.Vector3(); inv.decompose(new THREE.Vector3(), new THREE.Quaternion(), lsc);
    const UNI = { bp, ls: lsc.x, fwd: new THREE.Vector3(0, 0, 1).transformDirection(inv), outward: (sd) => { const v = new THREE.Vector3(1, 0, 0).transformDirection(inv); return (bp['thigh_' + sd].x - bp['pelvis'].x) * v.x + (bp['thigh_' + sd].y - bp['pelvis'].y) * v.y + (bp['thigh_' + sd].z - bp['pelvis'].z) * v.z > 0 ? v : v.negate(); } };
    const regOf = (i) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } } const r0 = REGION(n.skeleton.bones[best].name); return (r0 === 'skin' && /hand|index|middle|pinky|ring|thumb/.test(n.skeleton.bones[best].name)) ? 'hand' : r0; };
    if (P.smooth) smoothRegions(g, regOf, P.smooth);
    // dáng người: gầy / cân đối / to con / bụng phệ; vai rộng / hẹp (dịch đỉnh ở tư thế gốc theo trục xương)
    if (P.build || P.shoulders) {
      const B = { slim: { torso: 0.86, limb: 0.82, leg: 0.88 }, fit: { torso: 1, limb: 1, leg: 1 }, big: { torso: 1.16, limb: 1.14, leg: 1.1 }, belly: { torso: 1.1, limb: 1.04, leg: 1.05, belly: 0.22 } }[P.build || 'fit'] || { torso: 1, limb: 1, leg: 1 };
      const CH = { pelvis: 'spine_01', spine_01: 'spine_02', spine_02: 'spine_03', spine_03: 'neck_01', upperarm_l: 'lowerarm_l', upperarm_r: 'lowerarm_r', lowerarm_l: 'hand_l', lowerarm_r: 'hand_r', thigh_l: 'calf_l', thigh_r: 'calf_r', calf_l: 'foot_l', calf_r: 'foot_r' };
      const pos = g.attributes.position, up = new THREE.Vector3(0, 1, 0).transformDirection(inv), fw = UNI.fwd, sideV = new THREE.Vector3(1, 0, 0).transformDirection(inv);
      const yb = UNI.bp['spine_01'].clone().lerp(UNI.bp['spine_02'], 0.6), sh = UNI.bp['spine_03'];
      const shoulderK = P.shoulders === 'wide' ? 0.035 : P.shoulders === 'narrow' ? -0.03 : 0;
      for (let i = 0; i < pos.count; i++) { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
        const bn = n.skeleton.bones[best].name, ch2 = CH[bn]; _v.fromBufferAttribute(pos, i);
        if (ch2 && UNI.bp[bn] && UNI.bp[ch2]) { const A0 = UNI.bp[bn], A1 = UNI.bp[ch2]; const ax = A1.clone().sub(A0); const q = Math.min(1, Math.max(0, _v.clone().sub(A0).dot(ax) / ax.lengthSq()));
          const on = A0.clone().addScaledVector(ax, q); const k = /spine|pelvis/.test(bn) ? B.torso : /thigh|calf/.test(bn) ? B.leg : B.limb; _v.sub(on).multiplyScalar(k).add(on); }
        if (B.belly && /spine_0[12]|pelvis/.test(bn)) { const d = _v.clone().sub(yb); const f = d.dot(fw); const yy = d.dot(up) / UNI.ls; if (f > 0) _v.addScaledVector(fw, B.belly * UNI.ls * Math.exp(-(yy * yy) / 0.02) * Math.min(1, f / (0.08 * UNI.ls))); }
        if (shoulderK && /clavicle|upperarm|lowerarm|hand|index|middle|pinky|ring|thumb|spine_03/.test(bn)) { const x = _v.clone().sub(sh).dot(sideV); const wgt = /spine_03/.test(bn) ? Math.min(1, Math.abs(x) / (0.18 * UNI.ls)) : 1; _v.addScaledVector(sideV, Math.sign(x) * shoulderK * UNI.ls * wgt); }
        pos.setXYZ(i, _v.x, _v.y, _v.z); }
      g.computeVertexNormals(); }
    for (let i = 0; i < si.count; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
      let reg = REGION(n.skeleton.bones[best].name); let qT = -1;
      { const bn0 = n.skeleton.bones[best].name;
        if (P.tank && /upperarm/.test(bn0)) reg = 'skin';
        if (P.shorts && /calf/.test(bn0)) { const sd = bn0.slice(-1), A0 = UNI.bp['calf_' + sd], A1 = UNI.bp['foot_' + sd]; _v.fromBufferAttribute(g.attributes.position, i);
          const ax = A1.clone().sub(A0); const q = _v.clone().sub(A0).dot(ax) / ax.lengthSq(); reg = q < (P.sockAt ?? 0.5) ? 'skin' : 'socks'; }
        if (P.shorts && /thigh/.test(bn0)) { const sd = bn0.slice(-1), A0 = UNI.bp['thigh_' + sd], A1 = UNI.bp['calf_' + sd]; _v.fromBufferAttribute(g.attributes.position, i);
          const ax = A1.clone().sub(A0); const q = _v.clone().sub(A0).dot(ax) / ax.lengthSq(); qT = q; if (q > (P.shortsTo ?? 0.92)) reg = 'skin'; } }
      const isHand = /hand|index|middle|pinky|ring|thumb/.test(n.skeleton.bones[best].name);
      pf[i] = (P.shirtless && reg === 'jersey') ? (P.puff.skin || 0) : reg === 'head' ? (P.puff.head || 0) : isHand ? (P.puff.hand || 0) : (P.puff[reg] || 0);
      if (qT >= 0 && reg === 'pants') pf[i] *= 0.5 + 0.6 * Math.min(1, qT);
      if (isHand && P.gloves) { tmp.set(P.gloves).convertSRGBToLinear(); a.set([tmp.r, tmp.g, tmp.b, 1], i * 4); continue; }
      if (reg === 'jersey' && /spine_0[123]/.test(n.skeleton.bones[best].name)) torso[i] = 1;
      { const bnA = n.skeleton.bones[best].name; const sd = bnA.slice(-1); const armSide = (o) => o && (o === 'both' || o === sd);
        if (/^(upperarm|lowerarm)_/.test(bnA) && armSide(P.armSleeve) && (reg === 'skin' || /lowerarm/.test(bnA))) { tmp.set(P.armSleeveColor || '#111111').convertSRGBToLinear(); a.set([tmp.r, tmp.g, tmp.b, 1], i * 4); continue; }
        if (/^(upperarm|lowerarm)_/.test(bnA) && armSide(P.tattoo) && reg === 'skin' && P.skin) { const A0 = UNI.bp[bnA], A1 = UNI.bp[/upper/.test(bnA) ? 'lowerarm_' + sd : 'hand_' + sd]; _v.fromBufferAttribute(g.attributes.position, i);
          const ax = A1.clone().sub(A0); const q = _v.clone().sub(A0).dot(ax) / ax.lengthSq(); const r0 = _v.clone().sub(A0.clone().addScaledVector(ax, q)); const an = Math.atan2(r0.dot(UNI.fwd), r0.x);
          tat.set([q, Math.cos(an), Math.sin(an), 1], i * 4); } }
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
    g.setAttribute('outfit', new THREE.BufferAttribute(a, 4)); g.setAttribute('band', new THREE.BufferAttribute(band, 4)); g.setAttribute('torso', new THREE.BufferAttribute(torso, 1)); g.setAttribute('puff', new THREE.BufferAttribute(pf, 1)); g.setAttribute('tat', new THREE.BufferAttribute(tat, 4));
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
  if (P.hair && !P.hairStyle && (!P.helmet || P.hairWithHelmet)) addAcc(P.hair, P.hairColor);
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
  const hc = hb.getCenter(new THREE.Vector3()), hs = hb.getSize(new THREE.Vector3()); let faceDraw = () => {};
  const std = (c, x = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5 }, x));
  if (P.hairStyle && (!P.helmet || P.hairWithHelmet)) { const [kind, name] = P.hairStyle.split(':'); const hm = kind === 'mh' ? (lib.mh && lib.mh[name] ? mhHair(lib.mh[name], hb, P.hairColor, P.hairOpts || {}) : null) : procHair(name, hb, P.hairColor, P.hairOpts || {}); if (hm) { root.add(hm); bones['Head'].attach(hm); } }
  const place = (mesh, pos) => { mesh.position.copy(pos); root.add(mesh); head.attach(mesh); mesh.castShadow = true; return mesh; };
  if (P.cartoonEyes && P.face === 'painted' && bodyMesh) {
    let eb = new THREE.Box3(); root.traverse((n) => { if (n.isSkinnedMesh && /Eye/.test(n.material.name)) eb.expandByObject(n); });
    faceDraw = paintFace(bodyMesh, eb, P);
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
    // viền ô mặt: ống tròn che răng cưa của đường cắt
    { const rim = []; const ed = (ang, ay) => new THREE.Vector3(Math.sin(ang) * Math.sqrt(Math.max(0, 1 - ay * ay)) * R, ay * R, Math.cos(ang) * Math.sqrt(Math.max(0, 1 - ay * ay)) * R);
      for (let ay = -0.8; ay <= 0.30; ay += 0.1) rim.push(ed(-0.92, ay)); for (let a = -0.92; a <= 0.92; a += 0.1) rim.push(ed(a, 0.30)); for (let ay = 0.30; ay >= -0.8; ay -= 0.1) rim.push(ed(0.92, ay));
      const rm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim), 80, R * 0.045, 8, false), new THREE.MeshStandardMaterial({ color: P.helmet, roughness: 0.25, metalness: P.helmetMetal ?? 0.35 }));
      const rp = place(rm, center.clone()); rp.scale.set(1.08, 1.16, 1.22); }
    // lỗ tai
    for (const sd of [-1, 1]) { const e = place(new THREE.Mesh(new THREE.CircleGeometry(R * 0.11, 16), std('#111111')), new THREE.Vector3(center.x + sd * R * 1.075, center.y - R * 0.18, center.z + R * 0.05)); e.rotation.y = sd * Math.PI / 2; }
    // lưới chắn mặt
    const mm = std(P.mask, { roughness: 0.35 }); const tr = R * (P.maskThick ?? 0.075);
    const tube = (pts, r = tr) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 10, false), mm);
    const arc = (y, rad, a0, a1, zf = 1.3) => { const p = []; for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 16) p.push(new THREE.Vector3(Math.sin(a) * rad * 1.08, y, Math.cos(a) * rad * zf)); return p; };
    // v0.6: mặc định lưới THẤP như kênh mẫu (2 thanh ngang dưới mũi, mắt + lông mày lộ hoàn toàn). maskLow:false = lưới cũ 3 thanh che ngang mắt.
    const my = P.maskY ?? 0; const low = P.maskLow !== false && P.maskBars !== 1;
    const Y = low ? [-0.30, -0.47, -0.66] : [0.05, -0.32, -0.62]; // thanh trên (chỉ nối trụ), giữa, dưới
    const bars = P.maskBars === 1 ? [[-0.32, 0.98]] : low ? [[Y[1], 0.99], [Y[2], 0.86]] : [[Y[0], 1.0], [Y[1], 0.98], [Y[2], 0.86]];
    for (const [y, r0] of bars) place(tube(arc((y + my) * R, R * r0, -1.25, 1.25)), center.clone());
    if (P.maskBars !== 1) {
    place(tube([new THREE.Vector3(0, (Y[1] + my) * R, R * 1.29), new THREE.Vector3(0, (Y[2] + my) * R, R * 1.12)]), center.clone());
    for (const sd of [-1, 1]) place(tube([new THREE.Vector3(sd * R * 1.02, (Y[0] + my) * R, R * 0.4), new THREE.Vector3(sd * R * 0.98, (Y[1] + my) * R, R * 0.38), new THREE.Vector3(sd * R * 0.85, (Y[2] + my) * R, R * 0.36)]), center.clone()); }
  }
  if (P.headband) { // băng đô quanh trán
    const R = hs.x * 0.55; const hbm = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 10, 48), std(P.headband, { roughness: 0.8 })); hbm.scale.set(R, R * 1.05 * hs.z / hs.x, R * 1.6); hbm.rotation.x = Math.PI / 2 - 0.15;
    place(hbm, new THREE.Vector3(hc.x, hc.y + hs.y * 0.2, hc.z - hs.z * 0.03)); }
  if (P.wristband) { for (const sd of ['l', 'r']) { if (P.wristband.side && P.wristband.side !== sd && P.wristband.side !== 'both') continue; const lo = bones['lowerarm_' + sd], hd = bones['hand_' + sd]; root.updateMatrixWorld(true);
      const a0 = lo.getWorldPosition(new THREE.Vector3()), a1 = hd.getWorldPosition(new THREE.Vector3()); const ax = a1.clone().sub(a0); const len = ax.length();
      const wb = new THREE.Mesh(new THREE.CylinderGeometry(len * 0.17, len * 0.17, len * 0.22, 20, 1, true), std(P.wristband.color || '#ffffff', { roughness: 0.9, side: THREE.DoubleSide }));
      wb.position.copy(a0.clone().addScaledVector(ax, 0.78)); wb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax.normalize()); root.add(wb); lo.attach(wb); wb.castShadow = true; } }
  if (P.beardStyle) { const bm = beardMesh(P.beardStyle, hb, P.beardColor || P.hairColor || '#141010'); if (bm) { root.add(bm); head.attach(bm); } }
  if (P.glasses) { // kính tròn gọng mảnh trước mắt
    const gm = std(P.glasses, { roughness: 0.3, metalness: 0.6 }); const lr = hs.x * 0.11, fz = hb.max.z + hs.z * 0.02, gy = hc.y + hs.y * 0.06;
    for (const sd of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(lr, lr * 0.09, 8, 28), gm); place(ring, new THREE.Vector3(hc.x + sd * hs.x * 0.17, gy, fz)); }
    place(new THREE.Mesh(new THREE.CylinderGeometry(lr * 0.07, lr * 0.07, hs.x * 0.12, 6), gm), new THREE.Vector3(hc.x, gy + lr * 0.3, fz)).rotation.z = Math.PI / 2;
  }
  if (P.number != null && !P.shirtless && bodyMesh) { // số in thẳng lên áo (chiếu phẳng trước/sau trong shader)
    const cb = regionBox(root, /spine_0[23]/); const cc = cb.getCenter(new THREE.Vector3()), cs = cb.getSize(new THREE.Vector3());
    const inv = new THREE.Matrix4().copy(bodyMesh.matrixWorld).invert(); const ls = new THREE.Vector3(); inv.decompose(new THREE.Vector3(), new THREE.Quaternion(), ls);
    const U = bodyMesh.material.userData.num;
    U.numO.value.copy(new THREE.Vector3(cc.x, cc.y - cs.y * (P.numberDrop ?? 0.08), cc.z).applyMatrix4(inv));
    U.numOB.value.copy(new THREE.Vector3(cc.x, cc.y + cs.y * 0.05, cc.z).applyMatrix4(inv));
    U.numR.value.copy(new THREE.Vector3(1, 0, 0).transformDirection(inv)); U.numUp.value.copy(new THREE.Vector3(0, 1, 0).transformDirection(inv)); U.numF.value.copy(new THREE.Vector3(0, 0, 1).transformDirection(inv));
    U.numSF.value = cs.x * (P.frontNumberSize ?? 0.8) * ls.x; U.numSB.value = cs.x * (P.backNumberSize ?? 1.1) * ls.x;
    U.numMap.value = numberTexture(P.number, P.numberColor, P.numberOutline, P.wordmark, P.wordmarkColor); U.numMapB.value = P.backName ? numberTexture(P.number, P.numberColor, P.numberOutline, P.backName, P.wordmarkColor, P.backNameMax ?? 236) : U.numMap.value;
  }
  if (P.headScale !== 1) head.scale.setScalar(P.headScale);
  root.scale.setScalar(P.scale);
  const mixer = new THREE.AnimationMixer(root); let cur = null;
  const play = (name, { loop = true, fade = 0.2, timeScale = 1, at = 0 } = {}) => {
    const clip = lib.clips.find((c) => c.name === name); if (!clip) throw new Error('No clip ' + name);
    const a = mixer.clipAction(clip); a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !loop; a.timeScale = timeScale; a.time = at;
    if (cur && cur !== a) cur.crossFadeTo(a, fade, false); a.play(); cur = a; return a;
  };
  let lastFace = '';
  const face = (o = {}) => { const k = JSON.stringify(o); if (k !== lastFace) { lastFace = k; faceDraw(o); } };
  return { root, mixer, bones, play, skeleton, face, P };
}

// Em bé thật: đầu to (~1/4 chiều cao), tay chân ngắn mũm mĩm, thân ngắn, mặt tròn không lông mày.
// Dùng kèm POSES trong tuthe.js (ngồi, bò, nằm) vì thư viện động tác là của người lớn.
export function makeBaby(lib, o = {}) {
  const ch = makeCharacter(lib, Object.assign({ hair: null, brows: false, beard: false, eyeScale: 1.6, toonHead: true,
    puff: { jersey: 0.03, pants: 0.03, socks: 0.012, shoes: 0.012, skin: 0.012, hand: 0 }, skinMix: 0.85 }, o, { scale: 1 }));
  const b = ch.bones;
  // chỉ dùng scale ĐỀU cho từng xương (scale lệch trục làm méo xương con); độ mũm mĩm lấy từ puff
  const U = o.boneScale || { spine_01: 0.9, spine_02: 0.92, spine_03: 0.95, neck_01: 0.75, thigh_l: 0.72, thigh_r: 0.72, calf_l: 0.95, calf_r: 0.95,
    upperarm_l: 0.78, upperarm_r: 0.78, lowerarm_l: 0.95, lowerarm_r: 0.95 };
  for (const [n, v] of Object.entries(U)) if (b[n]) b[n].scale.setScalar(v);
  const chain = U.spine_01 * U.spine_02 * U.spine_03 * U.neck_01;
  b.Head.scale.setScalar((o.headRatio ?? 1.75) / chain);
  ch.root.scale.setScalar(o.scale ?? 0.5);
  ch.baby = true;
  return ch;
}

// râu dựng bằng code: goatee (râu dê), full (quai nón), stubble (lún phún), mustache (ria)
function beardMesh(style, hb, color) {
  const c = hb.getCenter(new THREE.Vector3()), s = hb.getSize(new THREE.Vector3());
  const R = new THREE.Vector3(s.x * 0.5, s.y * 0.52, s.z * 0.5), C = c.clone(); C.y += s.y * 0.04; C.z -= s.z * 0.02;
  const lift = { goatee: 0.022, full: 0.02, stubble: 0.008, mustache: 0.018 }[style] ?? 0.015;
  const inside = (th, ph) => { const a = Math.abs(ph);
    if (style === 'goatee') return (th > 2.25 && th < 2.75 && a < 0.42) || (th > 1.98 && th < 2.12 && a < 0.5);
    if (style === 'mustache') return th > 1.98 && th < 2.12 && a < 0.5;
    if (style === 'full' || style === 'stubble') return (th > 1.95 && th < 2.8 && a < 1.45 && !(th < 2.18 && a < 0.33)) || (th > 1.6 && th <= 1.95 && a > 1.05 && a < 1.45);
    return false; };
  const g = new THREE.SphereGeometry(1, 72, 48); const p = g.attributes.position, ix = g.index, keep = [];
  const tp = (i) => [Math.acos(Math.max(-1, Math.min(1, p.getY(i)))), Math.atan2(p.getX(i), p.getZ(i))];
  for (let i = 0; i < ix.count; i += 3) { let ok = true; for (let j = 0; j < 3; j++) { const [th, ph] = tp(ix.getX(i + j)); if (!inside(th, ph)) ok = false; } if (ok) keep.push(ix.getX(i), ix.getX(i + 1), ix.getX(i + 2)); }
  for (let i = 0; i < p.count; i++) { const [th, ph] = tp(i); const fwd = Math.max(0, Math.cos(ph)); const L = lift * s.y * (1 + 0.6 * fwd);
    p.setXYZ(i, C.x + Math.sin(th) * Math.sin(ph) * (R.x + L), C.y + Math.cos(th) * (R.y + L), C.z + Math.sin(th) * Math.cos(ph) * (R.z * (1 + 0.12 * fwd) + L)); }
  g.setIndex(keep); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide, transparent: style === 'stubble', opacity: style === 'stubble' ? 0.55 : 1 })); m.castShadow = true; return m;
}
