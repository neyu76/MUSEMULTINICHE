# Thư viện âm thanh miễn phí (CC0) — P01

Không đóng gói file âm thanh vào bộ hồ sơ (≈1,8 GB). Tải lại bằng:

```bash
mkdir -p assets/audio && cd assets/audio
git clone --depth 1 https://github.com/wyzowl/sfx-kit.git              # 320 SFX cho video, có điểm đồng bộ + mức âm (CC0)
git clone --depth 1 https://github.com/seyedpouramir/alvana-audio.git  # 1.213 SFX + 157 bản nhạc, đã chuẩn hoá -16 LUFS (CC0; riêng music/corporate là CC BY 4.0 → không dùng)
git clone --depth 1 https://github.com/EternityForest/Free-SFX.git     # 1.126 SFX .opus (CC0)
git clone --depth 1 https://github.com/facebookincubator/Meta-open-sound.git  # 1.583 SFX + nhạc cụ, có đấm/đá (CC0)
```

`thu_vien_am_thanh.json`: chỉ mục chung 4.399 file (id, đường dẫn, loại sfx/music, nhóm, tag, thời lượng, giấy phép, điểm đồng bộ nếu có).

Quy tắc: không dùng `alvana-audio/music/corporate/*` (CC BY, phải ghi công). Chưa có trong thư viện: tiếng đám đông sân vận động, còi trọng tài, tiếng la ó → tạo bằng Magnific Sound Effects (xem HO_SO_DU_AN).

## magnific_sfx/ (26 file, chủ dự án tạo bằng Magnific Sound Effects, 04/11/2026; buzzer, stadium_horn đã thay bản sạch đợt 2)
Đã xử lý: cắt lặng đầu, crowd_* lọc 60 Hz–11 kHz chuẩn −18 LUFS, nền khán giả −22 LUFS và nối vòng liền (crowd_ambience 12,8 s), tiếng ngắn −16 LUFS.
Đợt 2 thêm: sad_trombone, organ_charge, crowd_ooh_aah, crowd_chant_defense, crowd_clap_rhythm, backboard_bang, airball_chant, football_kick, stadium_crowd_outdoor, drumline, camera_flashes, crowd_silence_cough.
Khi dùng: copy thư mục vào /root/work/assets/audio/magnific_sfx (id `magnific/<tên>` trong thu_vien_am_thanh.json).
