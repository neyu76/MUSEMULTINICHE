// Hiệu ứng trong cảnh kiểu kênh mẫu (v0.6, quan sát trên 2 video mẫu 05/11/2026). Mọi hàm là hàm thuần của t → render song song an toàn.
//   telestrator(scene)   vòng vàng vẽ dần dưới chân cầu thủ / quanh bóng (mẫu Cowboys: "WIDE OPEN", "OWN 35")
//   ballTrail(scene)     vệt quỹ đạo bóng sáng (mẫu: cú đá phạt hỏng, vệt xanh lá)
//   dust(scene)          hạt bụi trắng trôi lơ lửng trong không khí (mẫu McGregor: mọi cảnh trong nhà / phố)
//   Hồi tưởng đen trắng: làm ở hậu kỳ (cong_cu/hau_ky.py --den-trang a-b), không làm trong cảnh.
import * as THREE from 'three';

// Vòng telestrator: at(center, t, t0, {r, dur}) — vẽ dần trong `dur` giây từ t0, nhịp nhẹ sau đó. hide() để tắt.
export function telestrator(scene, { color = '#ffd400', width = 0.09, opacity = 0.95 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), mat); mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 5; mesh.visible = false; scene.add(mesh);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false }));
  inner.rotation.x = -Math.PI / 2; inner.renderOrder = 4; inner.visible = false; scene.add(inner);
  let key = '';
  return {
    mesh,
    at(center, t, t0, { r = 0.9, dur = 0.25 } = {}) {
      const k = Math.min(1, Math.max(0, (t - t0) / dur)); const th = Math.max(0.01, k * Math.PI * 2);
      const kk = `${r.toFixed(3)}|${th.toFixed(3)}`;
      if (kk !== key) { mesh.geometry.dispose(); mesh.geometry = new THREE.RingGeometry(Math.max(0.01, r - width), r, 64, 1, Math.PI / 2, th); key = kk; }
      const pulse = 1 + 0.04 * Math.sin((t - t0) * 7) * k;
      mesh.scale.setScalar(pulse); mesh.position.set(center.x, 0.02, center.z); mesh.visible = t >= t0;
      inner.scale.setScalar((r - width) * pulse); inner.position.set(center.x, 0.015, center.z); inner.visible = t >= t0 && k >= 1;
    },
    hide() { mesh.visible = false; inner.visible = false; },
  };
}

// Vệt bóng: update(posAt, tStart, tNow) — posAt(t) trả Vector3 vị trí bóng; vẽ ống từ tStart tới tNow (tối đa `len` giây gần nhất).
export function ballTrail(scene, { color = '#7dff4a', radius = 0.05, len = 1.6, opacity = 0.85 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); mesh.visible = false; mesh.renderOrder = 6; scene.add(mesh);
  return {
    mesh,
    update(posAt, tStart, tNow) {
      const a = Math.max(tStart, tNow - len); if (tNow - a < 0.03) { mesh.visible = false; return; }
      const pts = []; const n = 24; for (let i = 0; i <= n; i++) pts.push(posAt(a + (tNow - a) * i / n));
      mesh.geometry.dispose(); mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, radius, 8, false); mesh.visible = true;
    },
    hide() { mesh.visible = false; },
  };
}

// Bụi lơ lửng: dust(scene, {center, size:[x,y,z], count}) → update(t, center?) dời đám bụi theo máy/cảnh.
export function dust(scene, { center = new THREE.Vector3(), size = [8, 4, 8], count = 260, px = 3.2, color = '#ffffff', opacity = 0.7 } = {}) {
  const base = new Float32Array(count * 3), ph = new Float32Array(count);
  let s = 12345; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) { base[i * 3] = (rnd() - 0.5) * size[0]; base[i * 3 + 1] = rnd() * size[1]; base[i * 3 + 2] = (rnd() - 0.5) * size[2]; ph[i] = rnd() * 100; }
  const g = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size: px, sizeAttenuation: false, transparent: true, opacity, depthWrite: false });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
  return {
    points: pts,
    update(t, c = center) {
      for (let i = 0; i < count; i++) { const p = ph[i];
        pos[i * 3] = c.x + base[i * 3] + Math.sin(t * 0.35 + p) * 0.25;
        pos[i * 3 + 1] = c.y + ((base[i * 3 + 1] + t * 0.05 + Math.sin(t * 0.5 + p * 1.3) * 0.15) % size[1] + size[1]) % size[1];
        pos[i * 3 + 2] = c.z + base[i * 3 + 2] + Math.cos(t * 0.3 + p * 0.7) * 0.25; }
      g.attributes.position.needsUpdate = true;
    },
  };
}
