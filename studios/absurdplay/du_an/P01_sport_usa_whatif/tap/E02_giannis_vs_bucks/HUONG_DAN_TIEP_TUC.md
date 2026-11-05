# E02 — Giannis vs his old team (NBA) — trạng thái

Kịch bản đã duyệt: https://claude.ai/artifact/DQBQ5a7zsuXtxFR4MaMQQx

## Đã xong
- Giọng: đã bấm Generate trên Magnific (Sport USA, tag [energetic, fast-paced narrator]). Chờ người dùng tải mp3 và đính kèm → lưu vào giong/goc.mp3.
- Tài sản mới trong engine:
  - lib/nba.js: bóng NBA 8 múi (#C8541F), rổ (bảng kính, vành cam, lưới), sàn gỗ + vùng sơn xanh Bucks, khán đài, jumbotron (canvas vẽ theo shot), cúp MVP, phong bì PICK.
  - lib/cast2.js: Giannis #7 Heat (MIAMI, ANTETOKOUNMPO sau lưng, cao 1,1, tay dài), Herro #42 Bucks, Bucks, trọng tài, fan áo Heat #34.
  - lib/nhanvat2.js: thêm tank (áo ba lỗ), shorts (quần đùi rộng + tất), wordmark trên ngực, tên sau lưng (numMapB). Bản cũ: lib/nhanvat2.ep01.bak.js.
  - lib/bongro.js: stance, dribble, wingspan, holdChest, shoot, dunk, flex, seated (ngủ gục), slump, toss, defend.
- ep02.html (17 shot), ep02_gfx.html (đồ hoạ theo shot), ep02_shots.js (mốc shot TẠM, chốt lại theo words.json).

## Còn lại
1. Nhận mp3 → atempo ≈1.08 → faster-whisper small.en (initial_prompt: Giannis Antetokounmpo, Milwaukee Bucks, Tyler Herro, pterodactyl) → words.json.
2. Chốt ep02_shots.js theo mốc câu; xem lại khung hình nomb.
3. Cắt thử (test cut) cho người dùng duyệt → render đủ (motion blur) → Kdenlive/melt → QA → giao.

## Lưu ý kỹ thuật
- Máy quay ep02 dùng đường thẳng (path 2 điểm) thay vì lerpLookAt (lerpLookAt nội suy cầu, có lúc vòng ngược).
- Mọi nhân vật resetPose() ngay khi tạo để bắt tư thế gốc trước khi chạy clip.

## Cập nhật 04/11 (sau phản hồi người dùng)
- Bối cảnh làm lại theo mẫu NBA: khán đài ghế 3D + khán giả low-poly, sáng hơn (lib/nba.js `stands`).
- Áo Giannis: Heat bản Association TRẮNG (chữ HEAT đỏ viền đen, số 7 đỏ viền đen) — Heat Icon là đen "MIAMI", Association trắng "HEAT". Fan cuối: áo Heat trắng số 34.
- Giọng: giong/goc.mp3 → rut_nghi (46,72 → 44,30 s) → am_thanh/giong.wav 44,24 s, 164 từ/phút, không cần atempo. words.json đã sửa số/tên.
- ep02_shots.js đã chốt theo giọng (17 shot + 5 điểm cắt phụ).
- Bản cắt thử: giao/E02_cat_thu.mp4 (540x960 phóng lên 1080x1920, 15 hình/s nhân đôi, chưa motion blur, chưa nhạc/SFX). Chờ duyệt.
- dohoa_render.js: thêm Content-Type cho .js (trang đồ hoạ dùng module import).

## Hoàn thành 04/11
- giao/E02_giannis_vs_bucks.mp4 (44,3 s) + giao/E02_giannis_vs_bucks.kdenlive + giao/QA.md.
- Render 3D: `node render.js ep02.html <ra> 30 <f0> <f1> 720 1280` (≈4,4 s/khung/tiến trình, 2 tiến trình). Khán đài đã gộp thành 1 lưới tĩnh; motion blur bỏ lượt render tư thế trước khi khung liền trước vừa render.
- Âm thanh: `python3 tron_am_thanh.py` (nhạc CC0 alvana hiphop/legends + SFX CC0).
- Ghép: melt cần `width=1080 height=1920 progressive=1 frame_rate_num=30` trên consumer (không thì ra 720x576), sau đó loudnorm 2 lượt về −14 LUFS.

## Cập nhật 04/11 chiều — khán giả cử động
- lib/nba.js: khán giả có 2 tay; vertex shader nhún người, giơ 2 tay vẫy cổ vũ, gục đầu ngủ. Điều khiển bằng `A.crowd.uCheer` (0–1), `uSleep` (0–1), `uT` (giây).
- ep02.html: mức cổ vũ theo shot (bùng nổ sau mỗi cú úp rổ, cú ba điểm, tỉ số chung cuộc; im khi Bucks 1–6 và lúc "except"; ngủ ở shot ném phạt). Băng LED chạy chữ.
- Đã render lại toàn bộ và xuất lại giao/E02_giannis_vs_bucks.mp4 (−14,0 LUFS, −1,5 dBFS).
