// Dàn nhân vật tập 2 (NBA). Nhận diện qua số áo, màu đồng phục, tóc, dáng — không dựng khuôn mặt thật, không logo.
import { makeCharacter } from './nhanvat2.js';

const BASE = { edgeSoft: 1, tank: true, shorts: true, sockAt: 0.74, shortsTo: 0.86, socks: '#f4f4f4', shoes: '#f4f4f4', skinMix: 1, brows: false, eyeScale: 2.3, frontNumberSize: 0.7, backNumberSize: 0.95, numberDrop: 0.16,
  smooth: { jersey: 12, pants: 14, socks: 6, shoes: 10, skin: 4, head: 8 }, puff: { jersey: 0.018, pants: 0.04, socks: 0.006, shoes: 0.02, skin: 0, hand: 0 } };
// Heat bản Association (trắng, sân khách khi Bucks mặc xanh): chữ HEAT đỏ viền đen, số đỏ viền đen, viền cổ đỏ, quần trắng sọc đỏ–đen
export const HEAT = { ...BASE, jersey: '#f4f4f2', pants: '#f4f4f2', numberColor: '#b0102a', numberOutline: '#111111', wordmark: 'HEAT', wordmarkColor: '#b0102a', collar: '#98002E', pantsStripes: ['#111111', '#b0102a', '#111111'], shoes: '#1c1c1c' };
export const BUCKS = { ...BASE, jersey: '#00471B', pants: '#00471B', numberColor: '#EEE1C6', numberOutline: '#0a2412', wordmark: 'MILWAUKEE', wordmarkColor: '#EEE1C6', collar: '#EEE1C6', pantsStripes: ['#EEE1C6'] };
const longArms = (ch, k) => { for (const n of ['upperarm_l', 'upperarm_r']) ch.bones[n].scale.setScalar(k); return ch; };
export const CAST = {
  // Giannis: cao nhất (~10 %), tay dài, da nâu sẫm, tóc đen xoăn cắt sát, râu ngắn, số 7 Heat
  giannis: (lib, o = {}) => longArms(makeCharacter(lib, { ...HEAT, skin: '#80533a', hair: 'Hair_Buzzed', hairColor: '#0e0a07', beard: true, beardColor: '#0e0a07', number: 7, backName: 'ANTETOKOUNMPO', scale: 1.1, ...o }), 1.08),
  // Tyler Herro: số 42 Bucks, tóc nâu vàng rẽ ngôi, da sáng, dáng gầy hơn
  herro: (lib, o = {}) => makeCharacter(lib, { ...BUCKS, skin: '#efc6a2', hair: 'Hair_SimpleParted', hairColor: '#b8915a', number: 42, backName: 'HERRO', scale: 0.98, ...o }),
  buck: (lib, o = {}) => makeCharacter(lib, { ...BUCKS, skin: '#8a5634', hair: 'Hair_Buzzed', hairColor: '#120c08', number: 0, ...o }),
  // fan mặc áo Heat đỏ số 34 (áo bán trước khi Giannis đổi số), mặc áo thun bên trong, quần jean
  fan34: (lib, o = {}) => makeCharacter(lib, { ...HEAT, shorts: false, tank: false, pants: '#3b4f74', socks: '#3b4f74', shoes: '#2a2a2a', pantsStripes: null, skin: '#e3b48c', hair: 'Hair_SimpleParted', hairColor: '#4a2e1a', number: 34, backName: 'ANTETOKOUNMPO', scale: 1.0, puff: { jersey: 0.03, pants: 0.02, socks: 0.006, shoes: 0.02, skin: 0, hand: 0 }, ...o }),
  ref: (lib, o = {}) => makeCharacter(lib, { ...BASE, tank: false, shorts: false, jersey: '#8d9096', pants: '#141414', socks: '#141414', shoes: '#141414', collar: '#141414', skin: '#c9905f', hair: 'Hair_Buzzed', hairColor: '#2a2a2a', number: 14, numberColor: '#141414', numberOutline: '#8d9096', frontNumberSize: 0.0001, ...o }),
};
