// Nhân vật cầu thủ dựng trên mannequin UAL (Quaternius, CC0): tô vùng áo/quần/tất/giày/da theo xương,
// gắn mũ bảo hiểm, mặt hoạt hình mắt to, số áo, tóc/râu. Dùng chung clip animation của UAL.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const REGION = (bone) => {
  if (/head|neck/.test(bone)) return 'skin';
  if (/forearm|hand|f_|thumb/.test(bone)) return 'skin';
  if (/upper_arm|shoulder|spine/.test(bone)) return 'jersey';
  if (/hips|thigh/.test(bone)) return 'pants';
  if (/shin/.test(bone)) return 'socks';
  if (/foot|toe/.test(bone)) return 'shoes';
  return 'jersey';
};

function numberTexture(num, fg, outline) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.font = '900 190px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 14; g.strokeStyle = outline; g.strokeText(String(num), 128, 140);
  g.fillStyle = fg; g.fillText(String(num), 128, 140);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function makeAthlete(gltf, o = {}) {
  const P = Object.assign({
    skin: '#8d5a3b', jersey: '#ffffff', pants: '#b8bcc4', socks: '#ffffff', shoes: '#f2f2f2',
    number: null, numberColor: '#0b2a5b', numberOutline: '#ffffff',
    helmet: null, mask: '#0b2a5b', hair: null, beard: null, scale: 1, headScale: 1, eyes: true,
  }, o);
  const root = SkeletonUtils.clone(gltf.scene);
  root.scale.setScalar(P.scale);
  const bones = {};
  root.traverse((n) => { if (n.isBone) bones[n.name] = n; });
  root.traverse((n) => {
    if (!n.isSkinnedMesh) return;
    n.castShadow = true; n.receiveShadow = true;
    const geo = n.geometry = n.geometry.clone();
    const si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
    const names = n.skeleton.bones.map((b) => b.name);
    const col = new Float32Array(si.count * 3); const tmp = new THREE.Color();
    for (let i = 0; i < si.count; i++) {
      let best = 0, bw = -1;
      for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
      tmp.set(P[REGION(names[best])]).convertSRGBToLinear();
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    n.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0 });
  });
  const head = bones['DEF-head'], chest = bones['DEF-spine.003'];
  if (head && P.headScale !== 1) head.scale.setScalar(P.headScale);
  const std = (c, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6 }, extra));
  // Kích thước theo đơn vị xương đầu (mannequin cao ~1.8 m, xương có scale riêng): đo trên mesh
  const H = 0.13; // bán kính đầu xấp xỉ (m)
  const add = (parent, mesh, x, y, z) => { mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh; };
  if (head) {
    const g = new THREE.Group(); head.add(g);
    // xương có thể bị scale trong file; bù để phụ kiện tính theo mét
    const ws = new THREE.Vector3(); head.getWorldScale(ws); g.scale.setScalar(1 / ws.x);
    if (P.eyes) {
      const eyeW = std('#ffffff', { roughness: 0.3 }), pup = std('#111111', { roughness: 0.2 });
      for (const s of [-1, 1]) {
        const e = add(g, new THREE.Mesh(new THREE.SphereGeometry(H * 0.32, 16, 12), eyeW), s * H * 0.36, H * 0.95, H * 0.78);
        e.scale.set(1, 1.25, 0.55);
        add(g, new THREE.Mesh(new THREE.SphereGeometry(H * 0.15, 12, 10), pup), s * H * 0.34, H * 0.93, H * 0.93).scale.set(1, 1.2, 0.5);
        add(g, new THREE.Mesh(new THREE.BoxGeometry(H * 0.42, H * 0.09, H * 0.08), std('#1a1a1a')), s * H * 0.36, H * 1.35, H * 0.86).rotation.z = s * -0.12;
      }
    }
    if (P.hair) { const hm = add(g, new THREE.Mesh(new THREE.SphereGeometry(H * 1.08, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), std(P.hair, { flatShading: true })), 0, H * 0.95, -H * 0.05); hm.scale.set(1, 0.9, 1.05); }
    if (P.beard) { const b = add(g, new THREE.Mesh(new THREE.SphereGeometry(H * 0.95, 14, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), std(P.beard, { flatShading: true })), 0, H * 0.75, H * 0.1); b.scale.set(1, 1.1, 1.05); }
    if (P.helmet) {
      const hm = add(g, new THREE.Mesh(new THREE.SphereGeometry(H * 1.25, 20, 14, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.66), std(P.helmet, { roughness: 0.25, metalness: 0.4 })), 0, H * 0.9, -H * 0.02);
      hm.scale.set(1, 1.05, 1.1);
      const mm = std(P.mask, { roughness: 0.4 });
      for (const y of [0.55, 0.25]) { const t = add(g, new THREE.Mesh(new THREE.TorusGeometry(H * 0.95, H * 0.07, 6, 20, Math.PI * 0.9), mm), 0, H * y, H * 0.2); t.rotation.set(Math.PI / 2, 0, Math.PI * 0.05); t.rotation.z = Math.PI * 1.05; }
    }
  }
  if (chest && P.number != null) {
    const g = new THREE.Group(); chest.add(g); const ws = new THREE.Vector3(); chest.getWorldScale(ws); g.scale.setScalar(1 / ws.x);
    const tex = numberTexture(P.number, P.numberColor, P.numberOutline);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), mat), 0, 0.0, 0.165);
    const back = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), mat), 0, 0.02, -0.16); back.rotation.y = Math.PI;
  }
  const mixer = new THREE.AnimationMixer(root);
  const clips = gltf.animations;
  let current = null;
  const play = (name, { loop = true, fade = 0.2, timeScale = 1 } = {}) => {
    const clip = clips.find((c) => c.name === name); if (!clip) throw new Error('No clip ' + name);
    const a = mixer.clipAction(clip); a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !loop; a.timeScale = timeScale;
    if (current && current !== a) current.crossFadeTo(a, fade, false); a.play(); current = a; return a;
  };
  return { root, mixer, bones, play };
}
