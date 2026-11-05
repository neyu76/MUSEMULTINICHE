# QA BẢN CUỐI VÀ BÀN GIAO — <MA_DU_AN> <tập> (<ngày>)

## A. Tự động (ngưỡng lấy từ QUY_TRINH_DU_AN.md §3)
| # | Chỉ số | Ngưỡng | Kết quả | Đạt? | Công cụ |
|---|---|---|---|---|---|
| 1 | Độ phân giải, fps, thời lượng | | | | ffprobe |
| 2 | Loudness, true peak | | | | ebur128 |
| 3 | Mono / stereo theo yêu cầu | | | | |
| 4 | Khung đen, khung đứng hình | | | | |
| 5 | Khung trùng / rớt | 0 | | | mpdecimate |
| 6 | Khoảng lặng bất thường | | | | silencedetect |
| 7 | Mức nhạc giữa câu | | | | |
| 8 | Màu, độ nét | | | | |
| 9 | Chữ: vị trí, cỡ | | | | |
| 10 | Máy: tỉ lệ đứng yên, cú máy giật | | | | |
| … | (các chỉ số riêng của dự án) | | | | |

## B. Xem và nghe toàn bộ (trên bản cuối ĐÃ có chữ)
Rút khung mỗi 0,5–1 s (ghi số mốc đã xem: <n>), nghe hết âm thanh.
- [ ] Mở đầu: hình và câu đầu đúng kiểu hook đã chốt; chuyển động ngay từ khung 0 (nếu mẫu có)
- [ ] Lời khớp hình; mọi hành động chính xuất hiện đúng lúc lời nhắc
- [ ] Chữ không che chủ thể, không che chữ cần đọc trên vật; tay hoặc dụng cụ không che thông tin đúng lúc được nhắc
- [ ] Chính tả, số liệu, tên riêng đúng
- [ ] Nhân vật, trang phục nhất quán; mạch logic (giờ, ngày/đêm, trước/sau) đúng
- [ ] Không vật thể xuyên nhau, không cảnh trống (máy nhìn ra khoảng không), không mép nền lộ
- [ ] Chuyển cảnh đúng kiểu và độ dài đã chốt
- [ ] Giọng: đúng giọng đã chốt, nhịp trong dải, không méo; nhạc không lấn lời; SFX có lý do
- [ ] Kết: câu chốt, cảnh kết, thời gian giữ cuối đúng quy tắc

## C. Project chỉnh sửa được
- [ ] Mở lại hoặc render lại bằng <phần mềm>: thời lượng <…>, loudness <…>, có chữ
- [ ] Media, font đi kèm; đường dẫn tương đối

## D. Bàn giao
| File | Đường dẫn | Ghi chú |
|---|---|---|
| Video cuối | | |
| Project + media (zip) | | |
| Stem âm thanh, phụ đề | | |
| Lưới 1 khung/giây | | |
| Báo cáo QA | | |
| Kịch bản + nguồn + phần kịch tính hóa | | |
| HUONG_DAN_TIEP_TUC.md | | |

## E. Báo cáo cho chủ dự án
- Số đo chính:
- Đã kiểm bằng mắt / tai: (số mốc, phạm vi)
- Khác biệt so với mẫu (và lý do):
- Giới hạn còn lại:
- Chi phí đã dùng:
- Việc nên làm tiếp:
