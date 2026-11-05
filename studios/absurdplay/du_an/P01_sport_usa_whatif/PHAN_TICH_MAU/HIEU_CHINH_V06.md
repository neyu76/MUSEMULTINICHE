# Hiệu chỉnh số đo mẫu — v0.6 (05/11/2026)
Đo lại trên khung 1080x1920 (bản có tiếng) của 2 video mẫu: McGregor / Anne Frank (71,8 s) và Cowboys vs 50 babies (61,5 s).
Các mục dưới đây **thay thế** số tương ứng trong TONG_HOP.md.

| Mục | TONG_HOP cũ | Đo lại | Cách đo |
|---|---|---|---|
| Phụ đề font/cỡ | Montserrat Bold/ExtraBold 60 | Inter ExtraBold ~46 px CSS (= cỡ ASS 66); "could the dallas cowboys" rộng 572 px, x 254–825, chân chữ 1309, lõi chữ cao 24–26 px | chồng chữ render thật lên khung mẫu; đo hộp pixel vàng |
| Chuyển cảnh | gần như toàn cắt cứng; 1 lóa ở cú xoay | McGregor 10–11 lóa, Cowboys 3 lóa (cú xoay 14,3 s, REPLAY 31,3 s, SAFETY 42,9 s); đỉnh 0,5–0,65 trong 2 khung; REPLAY dâng 4 khung tới 0,81 | độ trắng hoá từng khung quanh điểm cắt |
| Máy | đứng 6–30 % | luồng quang học (che dải phụ đề): đứng 54–71 %, đẩy chậm 14–27 %, ~2,7 cú lia nhanh/10 s — tức là nhiều khung gần đứng nhưng hầu như luôn có đẩy chậm + cú lia ngắn | `cong_cu/kiem_theo_mau.py` |
| Thẻ đồ hoạ | — | đứng yên, bật/tắt cứng đúng điểm cắt; thẻ x 90–990, dải tiêu đề 62 px; bug y 300–420, x 70–1010 | xem từng khung 30 fps |
| Màu | bão hòa 92–144 | McGregor 76 / Cowboys 112 (cùng thước kiem_theo_mau) | HSV trung vị 1 khung/giây |
| Nhạc | — | 103–108 BPM, cả hai Rê thứ (gợi ý kênh dùng một kiểu nhạc nền cố định — suy luận) | librosa (vidclone analyze) |
| Lời | 146–168 từ/phút | 160 / 161; nghỉ sau dấu câu 0,30–0,34 s | Whisper word timestamps |
