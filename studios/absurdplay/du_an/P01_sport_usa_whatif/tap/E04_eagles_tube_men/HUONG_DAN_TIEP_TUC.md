# E04 — Eagles vs 11 inflatable tube men (NFL) — trạng thái 04/11, 23:35

Kịch bản đã duyệt: https://claude.ai/artifact/AVhuNcGqUhBqkVKC94j5GE

## Đã xong
- Giọng: giong/goc.mp3 (51,12 s) → am_thanh/giong.wav 49,09 s → words.json, words_tw.json. Mốc shot: engine/ep04_shots.js (18 shot + SUB).
- Engine mới: lib/baixe.js (bãi xe ban ngày, xe, dây cờ, showroom, biển khuyến mãi), lib/nguoihoi.js (người hơi vẫy tay: ống dựng lại mỗi khung, amp/fold/lean/armReach),
  lib/bongbau.js thêm EAGLES/CAST4 (Barkley #26 1,83 m, McKee #16 1,98 m, Elliott #4 1,75 m), knockedDown, runCarry, celebrate.
- ep04.html, ep04_gfx.html (tờ rơi bán xe), tron_am_thanh.py (nhạc alvana upbeat/bouncing), chu/phu_de.ass, do_hoa/do_hoa.mov.
- Bản cắt thử giao/E04_cat_thu.mp4 đã gửi người dùng — CHỜ DUYỆT.

## 05/11 — áp kit v0.6 vào E04 (cần duyệt lại bản cắt thử)
- ep04_gfx.html viết lại bằng gói truyền hình cố định (lib/goi_truyenhinh.js): bug PHI | TUBE MEN | đồng hồ + down & distance, thẻ Inter, ▶ REPLAY ở đoạn quay chậm s10, 6 lần lóa (s6, s8, replay s10, s13, s15, s17). Bỏ thẻ 2D "2012" (s7) và "0 điểm" (s9) vì biển 3D trong cảnh đã nói.
- ep04.html: cận McKee s6 hạ điểm nhìn (mặt ~40 % chiều cao, ngoài dải phụ đề); vòng vàng dưới chân Barkley s3; vệt bóng cú sút s13; máy s16 đặt chéo (bản cũ bị thân người hơi vàng che kín). Máy mọi shot có lớp style (đẩy/lia/rung) từ lib/camera.js.
- Lưới mũ thấp (nhanvat2.js maskLow mặc định) → mắt McKee/Barkley lộ rõ.
- Phụ đề: chạy lại `python3 ../../cong_cu/tao_phu_de.py giong/words.json chu/phu_de.ass` (Inter ExtraBold 66/594) sau khi `cai_font.sh`.
- Hình: `python3 ../../cong_cu/hau_ky.py <khung> hinh.mp4` thay cho eq=saturation=0.86.
- 05/11 chủ dự án chọn đổi nhịp giọng: **đã dời mọi mốc theo hệ số 0,93** (`doi_nhip.py`: ep04_shots.js, giong/words*.json, mo_ta.json; bản gốc *.truoc_nhip) → 52,78 s, ~162 từ/phút; phụ đề chu/phu_de.ass đã làm lại theo mốc mới. Chưa render lại cảnh/đồ hoạ theo mốc mới (chủ dự án dặn chưa làm video) — khi làm: render ep04.html + ep04_gfx.html đủ 1584 khung (52,785 s × 30).
- **Việc còn lại khi có mp3 giọng E04 (Magnific):** `python3 ../../cong_cu/rut_nghi.py goc.mp3 am_thanh/giong.wav` → `python3 ../../cong_cu/doi_nhip.py --he-so 0.93 --giong am_thanh/giong.wav am_thanh/giong.wav` (KHÔNG chạy lại phần mốc) → `python3 tron_am_thanh.py` (đã đọc mốc từ shots.js) → ghép tiếng vào bản cắt thử → duyệt. Kiểm: giong.wav dài ≈ 52,78 s; nếu lệch > 0,1 s thì rút nghỉ khác lần trước → chạy lại Whisper để lấy words.json mới.

## Còn lại
1. (Đã hứa) Shot 13 (sút trúng cột) và shot 14 (người hơi ôm bóng chạy): máy gần hơn, bóng to hơn (football(0.34) cho 2 shot này).
2. Sau khi duyệt: render đủ `node render.js ep04.html out_f4 30 0 737 720 1280` + `... 737 1473 720 1280` (2 tiến trình, ~50 phút)
   → hinh.mp4 (lanczos 1080x1920, eq=saturation=0.86:brightness=0.02, unsharp) → tao_kdenlive.py mo_ta.json giao/E04_eagles_tube_men.kdenlive → melt → loudnorm 2 lượt → QA.md.
3. Giao + 3 tiêu đề viral + hashtag; cập nhật bảng "đã dùng" (E04 | NFL | Eagles 2–6 | 11 người hơi | bãi xe ban ngày | alvana upbeat/bouncing); push GitHub.
Nếu máy mới không có thư mục: clone absurdplay-kit, cài node_modules engine (npm i), tải lại thư viện âm thanh theo tai_nguyen/am_thanh/README.md.
