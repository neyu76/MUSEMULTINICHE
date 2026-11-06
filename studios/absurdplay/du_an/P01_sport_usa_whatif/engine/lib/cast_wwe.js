// Dàn nhân vật đấu vật giải trí. Đô vật = nhân vật UBC cởi trần (shirtless) + quần đấu (shorts ngắn) + bó gối + giày cổ cao (socks tới giữa bắp chân);
// nhận diện bằng màu quần/giày, tóc, râu, dáng (build 'big'), hình xăm (tattoo), phụ kiện (headband, wristband, armSleeve). Không logo, không mặt giống thật.
// Trước mỗi tập: tra web trang phục HIỆN TẠI của đô vật (màu quần/giày, tóc, râu, xăm), chiều cao thật (heightM), tên gọi trên sàn.
import * as THREE from 'three';
import { makeCharacter } from './nhanvat2.js';
import { attachToBone } from './mlb.js';

export const BASE_WWE = { edgeSoft: 1, skinMix: 1, brows: false, eyeScale: 2.2, shirtless: true, shorts: true, shortsTo: 0.38, sockAt: 0.42, number: null,
  build: 'big', shoulders: 'wide', smooth: { jersey: 12, pants: 10, socks: 6, shoes: 10, skin: 4, head: 8 }, puff: { jersey: 0, pants: 0.02, socks: 0.01, shoes: 0.03, skin: 0, hand: 0 } };
// quần dài kiểu "singlet"/quần bó dài: shortsTo 1 + sockAt 0.42 (giày cổ cao)
export const LONG_TIGHTS = { shortsTo: 1.0 };
// bó gối: 2 ống đệm quanh khớp gối (gắn xương calf)
export function kneepads(ch, color = '#141414') {
  const out = []; for (const s of ['l', 'r']) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.072, 0.14, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    m.castShadow = true; out.push(attachToBone(ch, 'calf_' + s, m, new THREE.Vector3(0, -0.02, 0.01))); }
  return out;
}
// áo choàng ra sân (đơn giản: tấm phẳng sau lưng gắn spine_03)
export function robe(ch, color = '#5a1a8a', trim = '#f2c230') {
  const g = new THREE.Group(); const back = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.1, 1, 6), new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide }));
  back.position.set(0, -0.45, -0.16); g.add(back); const tr = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.05, 0.02), new THREE.MeshStandardMaterial({ color: trim, metalness: 0.6, roughness: 0.3 })); tr.position.set(0, -1.0, -0.16); g.add(tr);
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; }); return attachToBone(ch, 'spine_03', g, new THREE.Vector3(0, 0.05, 0));
}
// tạo đô vật: o = { trunks, boots, pads, skin, hairStyle, hairColor, beardStyle, tattoo, heightM, build, ... }
export function wrestler(lib, o = {}) {
  const P = { ...BASE_WWE, pants: o.trunks || '#141414', socks: o.boots || '#141414', shoes: o.boots || '#141414', ...o };
  const ch = makeCharacter(lib, P); if (o.pads !== false) ch.pads = kneepads(ch, o.pads || o.trunks || '#141414'); if (o.robe) ch.robe = robe(ch, o.robe, o.robeTrim);
  return ch;
}
// ví dụ (THAY bằng đô vật thật của tập, có bảng nhận diện + nguồn); trọng tài: áo đen, quần đen
export const CAST_WWE = {
  champ: (lib, o = {}) => wrestler(lib, { trunks: '#1d1d1d', boots: '#1d1d1d', skin: '#c99a73', hairStyle: 'proc:buzz', hairColor: '#1b120c', beardStyle: 'full', beardColor: '#1b120c', tattoo: 'both', heightM: 1.91, ...o }),
  challenger: (lib, o = {}) => wrestler(lib, { trunks: '#c8102e', boots: '#f4f4f4', pads: '#c8102e', skin: '#efc6a2', hairStyle: 'proc:manbun', hairColor: '#6b4a2a', heightM: 1.85, build: 'fit', ...o }),
  ref: (lib, o = {}) => makeCharacter(lib, { edgeSoft: 1, skinMix: 1, brows: false, eyeScale: 2.2, jersey: '#141414', pants: '#141414', socks: '#141414', shoes: '#141414', collar: '#f4f4f4', skin: '#d9a582', hairStyle: 'proc:buzz', hairColor: '#3a3a3a', heightM: 1.78, ...o }),
};
