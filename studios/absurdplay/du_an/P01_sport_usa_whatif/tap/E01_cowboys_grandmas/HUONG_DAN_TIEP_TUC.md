# E01 — tiếp tục / sửa
- Cảnh 3D: `engine/ep01.html` (21 shot, mốc theo `giong/words.json`); đồ họa: `engine/ep01_gfx.html`.
- Render 3D: `node engine/render.js ep01.html <ra> 30 <f0> <f1> 720 1280` (≈4–5 s/khung có motion blur; 2 tiến trình song song). Xem nhanh: thêm `#nomb`.
- Ghép: `hinh/hinh.mp4` (phóng 1080x1920 + eq=saturation=0.82:brightness=0.02 + unsharp), `do_hoa/do_hoa.mov` (qtrle alpha), `am_thanh/{giong,nhac,sfx}.wav`, `chu/phu_de.ass` → `python3 ../../cong_cu/tao_kdenlive.py mo_ta.json giao/E01_cowboys_grandmas.kdenlive` → `melt …` → +1 dB cho −14 LUFS.
- Mở trong Kdenlive: `giao/E01_cowboys_grandmas.kdenlive` (5 track: Nhạc, SFX, Giọng, Hình, Đồ họa + phụ đề ASS).
