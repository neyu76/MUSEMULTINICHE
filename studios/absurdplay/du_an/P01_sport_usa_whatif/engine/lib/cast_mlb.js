// Đồng phục + dàn nhân vật MLB. Nhận diện bằng màu, chữ thành phố/tên đội dạng chữ thường in trên ngực, số, mũ màu đội có chữ viết tắt —
// KHÔNG logo thật. Trước mỗi tập: tra web áo HIỆN TẠI (home trắng / road xám / alternate), số áo, tay đánh/ném (L/R), chiều cao thật (heightM).
import { makeCharacter } from './nhanvat2.js';
import { cap, batterHelmet, glove, attachToBone } from './mlb.js';
import * as THREE from 'three';

// áo cài cúc tay ngắn, quần tới gối + tất cao (shorts:true + shortsTo 1 = cả đùi là quần, sockAt 0 = cả bắp chân là tất)
export const BASE_MLB = { edgeSoft: 1, skinMix: 1, brows: false, eyeScale: 2.3, frontNumberSize: 0.42, backNumberSize: 0.95, numberDrop: 0.2,
  shorts: true, shortsTo: 1.0, sockAt: 0.0, smooth: { jersey: 12, pants: 10, socks: 6, shoes: 10, skin: 4, head: 8 }, puff: { jersey: 0.03, pants: 0.03, socks: 0.006, shoes: 0.02, skin: 0, hand: 0 },
  pants: '#f4f4f2', shoes: '#141414', backNameMax: 150 };
// áo quần dài kiểu hiện đại (quần phủ tới giày)
export const LONG_PANTS = { shorts: false };
// mẫu áo minh hoạ (màu tra 11/2026 — KIỂM LẠI trước khi dùng): home trắng chữ đội, road xám chữ thành phố
export const KITS = {
  LAD_HOME: { ...BASE_MLB, jersey: '#f6f6f4', wordmark: 'Dodgers', wordmarkColor: '#005A9C', numberColor: '#EF3E42', numberOutline: '#005A9C', socks: '#005A9C', pants: '#f6f6f4', collar: '#005A9C', capColor: '#005A9C', capText: 'LA', capTextColor: '#ffffff' },
  NYY_ROAD: { ...BASE_MLB, jersey: '#9ea2a2', wordmark: 'NEW YORK', wordmarkColor: '#0C2340', numberColor: '#0C2340', numberOutline: '#ffffff', socks: '#0C2340', pants: '#9ea2a2', collar: '#0C2340', capColor: '#0C2340', capText: 'NY', capTextColor: '#ffffff' },
  UMP: { ...BASE_MLB, shorts: false, jersey: '#1a2433', pants: '#7d828a', socks: '#141414', number: 0, numberColor: '#1a2433', numberOutline: '#1a2433', frontNumberSize: 0.0001, capColor: '#141414', capText: '', capTextColor: '#ffffff' },
};
// tạo cầu thủ MLB: kit + tuỳ chọn (skin, hairStyle, beardStyle, number, backName, heightM, build…) + mũ/mũ bảo hiểm + găng
//  head: 'cap' | 'helmet' | null ; glove: true → găng ở tay trái (tay ném trái thì đặt gloveHand:'r')
export function mlbPlayer(lib, kit, o = {}) {
  const P = { ...kit, ...o };
  const ch = makeCharacter(lib, P);
  const head = o.head ?? 'cap';
  if (head === 'cap') ch.cap = cap(ch, { color: P.capColor, text: P.capText, textColor: P.capTextColor });
  else if (head === 'helmet') ch.cap = batterHelmet(ch, { color: P.capColor, side: o.bats === 'L' ? 'r' : 'l' });
  if (o.glove) { ch.glove = glove(o.gloveColor); attachToBone(ch, 'hand_' + (o.gloveHand || 'l'), ch.glove, new THREE.Vector3(0, 0, 0.04)); }
  return ch;
}
// ví dụ dàn nhân vật (THAY bằng cầu thủ thật của tập, có bảng nhận diện + nguồn)
export const CAST_MLB = {
  slugger: (lib, o = {}) => mlbPlayer(lib, KITS.LAD_HOME, { skin: '#c99a73', hairStyle: 'proc:fade', hairColor: '#1b120c', number: 17, backName: 'SLUGGER', heightM: 1.93, head: 'helmet', ...o }),
  pitcher: (lib, o = {}) => mlbPlayer(lib, KITS.NYY_ROAD, { skin: '#efc6a2', hairStyle: 'proc:buzz', hairColor: '#5a3a22', beardStyle: 'full', beardColor: '#5a3a22', number: 45, backName: 'PITCHER', heightM: 1.98, glove: true, ...o }),
  ump: (lib, o = {}) => mlbPlayer(lib, KITS.UMP, { skin: '#d9a582', hairStyle: 'proc:buzz', hairColor: '#3a3a3a', build: 'belly', heightM: 1.83, ...o }),
};
