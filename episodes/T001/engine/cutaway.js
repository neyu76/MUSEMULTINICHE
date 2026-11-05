// Reusable cutaway toolkit (Style Bible T07 strata, T08 x-ray, + section cut). Samples: S01 4–9 s (grave strata),
// S02 49–55 s (inside the jar) and 62–64 s (strata + glowing fault), S04 27–29 s (powder bag cut open).
import { THREE, ctex, toon, outline, R, setSeed, INK } from './core.js';

// ---------- 1. strata: ground cross-section block, front face shows the layers ----------
// layers: [{h, col, dots:[col,...], roots}] top→bottom; returns {group, embed(obj,x,y), fault(pts)}
export function strata(parent, { w = 4, d = 1.2, layers, grass = true, seed = 7 } = {}) {
  setSeed(seed); const g = new THREE.Group(); parent.add(g);
  const H = layers.reduce((a, l) => a + l.h, 0), PXM = 256;
  const tex = ctex(Math.round(w * PXM), Math.round(H * PXM), (c, cw, ch) => { let y = 0;
    for (const L of layers) { const lh = L.h * PXM; c.fillStyle = L.col; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= cw; x += 24) c.lineTo(x, y + Math.sin(x * 0.013 + y) * 6); c.lineTo(cw, y + lh + 8); c.lineTo(0, y + lh + 8); c.fill();
      for (let i = 0; i < cw * lh / 900; i++) { c.fillStyle = (L.dots || ['rgba(0,0,0,0.15)'])[i % (L.dots || [1]).length]; c.beginPath(); c.ellipse(R(0, cw), y + R(4, lh - 4), R(3, 11), R(2, 7), R(0, 3), 0, 7); c.fill(); }
      if (L.roots) { c.strokeStyle = 'rgba(70,40,20,0.7)'; c.lineWidth = 3; for (let i = 0; i < cw / 60; i++) { let x = R(0, cw), yy = y; c.beginPath(); c.moveTo(x, yy); for (let k = 0; k < 6; k++) { x += R(-14, 14); yy += lh / 7; c.lineTo(x, yy); } c.stroke(); } }
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, y + lh - 3, cw, 3); y += lh; }
    c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(0, 0, cw, ch); });
  const side = toon(new THREE.Color(layers[0].col).multiplyScalar(0.7).getHex());
  const block = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [side, side, toon(grass ? 0x5aa64a : layers[0].col), side, new THREE.MeshLambertMaterial({ map: tex }), side]);
  block.position.y = -H / 2; block.receiveShadow = true; g.add(block);
  const front = d / 2 + 0.002;
  return { group: g, H, front,
    // place a buried object in the cut face: a dark cavity decal on the face, the object half sunk into it
    // (y measured down from the surface, negative); cavity = [w, h] in metres, defaults to the object's box + margin
    embed(obj, x, y, cavity) { const bb = new THREE.Box3().setFromObject(obj), s = bb.getSize(new THREE.Vector3());
      const [cw, ch] = cavity || [s.x + 0.12, s.y + 0.1];
      const cav = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), new THREE.MeshBasicMaterial({ color: 0x2a1608 })); cav.position.set(x, y, front + 0.001); g.add(cav);
      const rim = new THREE.Mesh(new THREE.PlaneGeometry(cw + 0.05, ch + 0.05), new THREE.MeshBasicMaterial({ color: 0x5a3418 })); rim.position.set(x, y, front + 0.0005); g.add(rim);
      obj.position.set(x, y, front - s.z * 0.15); g.add(obj); return obj; },
    // glowing crack across the face: pts in (x, y) on the front plane; returns material so the glow can be animated
    fault(pts, col = 0xffb347) { const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, front + 0.01)));
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.02, 8), m), halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.07, 8), m.clone()); halo.material.opacity = 0.35;
      g.add(core, halo); return { core, halo, set(k) { core.material.opacity = k; halo.material.opacity = 0.35 * k; core.visible = halo.visible = k > 0.01; } }; } };
}

// ---------- 2. section cut: slice any object/model with a plane and fill the cut faces (stencil caps) ----------
// Needs renderer.localClippingEnabled = true and a stencil buffer (core.js v5 sets both). Returns {plane, set(offset)}.
export function sectionCut(root, { normal = [0, 0, -1], offset = 0, capColor = 0xe9d9b8, hatch = true } = {}) {
  const plane = new THREE.Plane(new THREE.Vector3(...normal).normalize(), offset);
  const capTex = hatch ? ctex(256, 256, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(capColor).getHexString(); c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(60,40,20,0.25)'; c.lineWidth = 6; for (let i = -h; i < w; i += 28) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); } }, [4, 4]) : null;
  const meshes = []; root.traverse(o => { if (o.isMesh && !o.userData.cap) meshes.push(o); });
  meshes.forEach((m, i) => { const mats = Array.isArray(m.material) ? m.material : [m.material]; mats.forEach(mt => { mt.clippingPlanes = [plane]; mt.clipShadows = true; mt.side = THREE.DoubleSide; mt.needsUpdate = true; });
    // stencil writers: back faces +1, front faces −1 → inside of the solid stays non-zero on the plane
    const mk = (side, op) => { const s = new THREE.MeshBasicMaterial({ side, clippingPlanes: [plane], colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilFail: op, stencilZFail: op, stencilZPass: op });
      const w = new THREE.Mesh(m.geometry, s); w.renderOrder = 1; w.userData.cap = true; m.add(w); };
    mk(THREE.BackSide, THREE.IncrementWrapStencilOp); mk(THREE.FrontSide, THREE.DecrementWrapStencilOp); });
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshLambertMaterial({ color: hatch ? 0xffffff : capColor, map: capTex, stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp, side: THREE.DoubleSide }));
  cap.renderOrder = 2; cap.userData.cap = true; cap.onAfterRender = r => r.clearStencil();
  (root.parent || root).add(cap);
  const place = () => { const p = new THREE.Vector3(); plane.coplanarPoint(p); cap.position.copy(p); cap.lookAt(p.clone().sub(plane.normal)); };
  place();
  return { plane, cap, set(off) { plane.constant = off; place(); } };
}

// ---------- 3. x-ray: shell goes translucent, chosen inner parts draw on top ----------
export function xray(shell, inner = [], { opacity = 0.28, tint = 0xe6f4ff } = {}) {
  shell.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); Object.assign(o.material, { transparent: true, opacity, depthWrite: false }); if (o.material.color) o.material.color.lerp(new THREE.Color(tint), 0.5); o.renderOrder = 5; } });
  inner.forEach((o, i) => o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.depthTest = false; m.material.transparent = true; m.renderOrder = 20 + i; } }));
}
