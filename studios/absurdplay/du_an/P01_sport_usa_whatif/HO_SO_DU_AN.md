# HỒ SƠ DỰ ÁN — P01 Sport USA "What If" (theo mẫu @whatifbagel)
Phiên bản hồ sơ: v0.1 · Ngày lập: 03/11/2026 · Trạng thái: NHÁP (chờ chủ dự án xác nhận các câu hỏi ở mục 8)

> Nguồn: `YC` = chủ dự án yêu cầu · `ĐO` = đo trên mẫu (PHAN_TICH_MAU/TONG_HOP.md) · `CHỌN` = Claude chọn khi thiếu dữ liệu.

## 1. Mục tiêu
| Mục | Nội dung | Nguồn |
|---|---|---|
| Mục tiêu sản xuất | làm video giải trí cùng format với kênh @whatifbagel, sát mẫu nhất có thể | YC 03/11 |
| Đối tượng | người xem thể thao Mỹ (NFL, NBA), cả bóng đá châu Âu và UFC; hiểu meme fan | ĐO (chủ đề, hashtag) |
| Nền tảng | TikTok (Project "Sport USA") | YC/CHỌN |
| Ngôn ngữ lời / chữ | tiếng Anh (Mỹ) | ĐO |
| Số video, tần suất | chưa rõ; mẫu đăng 1–2 video/ngày | ĐO / hỏi |
| Thước đo thành công | view, share (mẫu: trung vị 441K view, share rate tới 5,4 %) | ĐO |

## 2. Thông số kỹ thuật
| Mục | Giá trị | Nguồn |
|---|---|---|
| Tỷ lệ khung, độ phân giải | 9:16, 1080x1920 | ĐO |
| fps | 30 | ĐO |
| Thời lượng | min 55 / mục tiêu 65–78 / max 85 s | ĐO |
| Loudness đích, true peak | −14 LUFS, ≤ −1 dBFS | ĐO (trung vị −14,2) + CHỌN biên an toàn |
| Mono / stereo | stereo, lời ở giữa | ĐO |
| Phụ đề | đốt vào hình; nguồn ASS sửa được trong project | ĐO + CHỌN |
| Định dạng giao | MP4 H.264 yuv420p + AAC 192 kbps | CHỌN |
| Project chỉnh sửa được | Kdenlive 23.08 (.kdenlive) + media | YC (ưu tiên Kdenlive) |

## 3. Phong cách
Quy tắc chi tiết, dải số đo và ngưỡng: `PHAN_TICH_MAU/TONG_HOP.md` mục 1–3 và `QUY_TRINH_DU_AN.md` mục 3. Tóm tắt:

| Nhóm | Quy tắc đã chốt (đề xuất) | Dải mẫu | Ngưỡng QA |
|---|---|---|---|
| Kịch bản | công thức 8 nhịp, hook "Could…?" ở 0 s, cú xoay 20–45 %, "Final score" 85–95 %, câu chốt troll | xem TONG_HOP | như QUY_TRINH mục 3 |
| Hình | 3D thời gian thực, tô phẳng, bóng mềm, nhân vật mắt hoạt hình to | [QS] | xem bản thử |
| Màu | bão hòa 95–145, sáng 95–165 (HSV) | 92–144 / 91–167 | như dải |
| Bố cục | toàn/trung là chính, cận mặt cho phản ứng; chủ thể trên vùng phụ đề | [QS] | y chủ thể < 1250 px |
| Chữ | phụ đề vàng Inter ExtraBold (ASS 66 ≈ 46 px), viền đen 4, chân chữ 1309 px, 2–4 từ (v0.6) | [ĐO lại 05/11] | ±6 px, bề rộng ±3 % |
| Máy | đẩy chậm gần như liên tục + cú lia nhanh ngắn; rung tay (v0.6) | đứng 54–71 %, đẩy 14–27 %, ~2,7 lia/10 s | kiem_theo_mau.py |
| Dựng | cắt cứng + lóa trắng 2 khung ở mọi nhịp kể chuyện; shot trung vị ~1,6–1,9 s; đồ hoạ 1 gói cố định, bật/tắt cứng (v0.6) | 3–11 lóa/video | kiem_theo_mau.py |
| Giọng | giọng clone **Sport USA**, 150–170 từ/phút, năng lượng cao | 146/160/168 | như dải |
| Nhạc | beat liên tục, nhiều bass, thấp hơn lời 8–12 dB | 6–11 dB | như dải |
| SFX | chọn lọc theo hành động | chưa đo được mật độ | — |

## 4. Nội dung
- Chủ đề được phép: 4 nhóm ở TONG_HOP; ưu tiên **Troll đội/cầu thủ hay thua** (trung vị 1,4M view) và **Sao vs lịch sử** (share rate cao nhất).
- Sự thật: số liệu của cầu thủ phải tra nguồn; phần hư cấu là rõ ràng (tình huống phi lý).
- Giọng văn: bình luận viên thể thao, thì hiện tại, câu ngắn, châm biếm.
- **Đề xuất không làm** (chờ xác nhận): logo/nhãn hiệu đội, giải thật trên hình; đùa về thảm kịch có thật (Holocaust, Astroworld, khủng bố…); gán hành vi phạm pháp bịa đặt cho người thật.

## 5. Tài nguyên của chủ dự án
| Tài nguyên | Đường dẫn / tài khoản | Quyền dùng | Ghi chú |
|---|---|---|---|
| Giọng clone "Sport USA" | tài khoản TTS của bạn (nền tảng: chưa rõ) | chờ xác nhận nguồn clone | YC 03/11: dùng giọng này |
| Nhạc, SFX | chưa có | — | cần cung cấp |
| Font | Montserrat, Inter, Anton, Oswald, Silkscreen, Space Mono (OFL) | dùng thương mại được | đã cài |
| Animation | Quaternius UAL (CC0) | tự do | đã cài |

## 6. Ngân sách và mức tự chủ
- Giới hạn chi phí: chưa đặt.
- Điểm duyệt: nội dung (kịch bản) + bản thử.
- YC 03/11: dừng sau phân tích và cài đặt; chờ chỉ dẫn tiếp.

## 7. Quyết định đã chốt
| Ngày | Quyết định | Lý do | Ai quyết |
|---|---|---|---|
| 03/11/2026 | Giọng: clone "Sport USA" | — | chủ dự án |
| 03/11/2026 | Giọng tạo trên web Magnific (ElevenLabs v4) qua Claude in Chrome, tăng tốc atempo 1,12 → 157 từ/phút | file thử sportusa_test_01; API Magnific chưa mở | chủ dự án duyệt |
| 03/11/2026 | Phần mềm dựng: Kdenlive | yêu cầu ưu tiên Kdenlive | chủ dự án |
| 03/11/2026 | Engine 3D: three.js headless | nhanh hơn Blender 5–30 lần trên CPU [ĐO] | Claude (đề xuất) |
| 03/11/2026 | Format kịch bản: format mới (tường thuật có tỉ số) | format cũ đã bị kênh bỏ, view thấp nhất | Claude (đề xuất) |

## 8. Câu hỏi còn mở
| # | Câu hỏi | Phương án mặc định nếu không trả lời | Trạng thái |
|---|---|---|---|
| 1 | Giọng Sport USA | Magnific web + Chrome, atempo 1,12 | ĐÃ CHỐT 03/11 |
| 2 | Nhân vật | Quaternius UBC + UAL2 (CC0, 0 đồng) + nhanvat2.js; TRELLIS cho vật thể | CHỜ DUYỆT ảnh so sánh 03/11 |
| 3 | Nhạc nền + SFX: bạn gửi file có giấy phép, hay mở tên miền Pixabay? | bạn gửi 3–5 bản nhạc + gói SFX | MỞ |
| 4 | Có dùng logo đội/giải thật và chủ đề thảm kịch như mẫu không? | không dùng | MỞ |
| 5 | Tập đầu tiên làm chủ đề gì? | "Troll đội hay thua" theo tin NFL tuần này | MỞ |

## 9. Trạng thái các video
| Mã tập | Tên | Trạng thái | Đường dẫn |
|---|---|---|---|
| — | (chưa có) | — | — |
