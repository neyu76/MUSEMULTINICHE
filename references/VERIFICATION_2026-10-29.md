# Rà soát tài liệu bổ sung — 29/10/2026

Tài liệu người dùng gửi: 16 kịch bản (zip), 16 mp3, "Bộ nhân vật toàn thân" (PDF 39 trang, 37 ảnh), "Báo cáo kiểm đếm & phân tích chuyển cảnh 16 video" (PDF 7 trang).
Mã video theo `ids.txt` của KIT (V1–V18). Báo cáo chuyển cảnh và bộ nhân vật dùng cách đánh số riêng; bảng đối chiếu ở cuối.

## Tổng hợp trạng thái

| # | Mục còn thiếu trước đây | Tài liệu bổ sung | Kết quả kiểm | Trạng thái |
|---|---|---|---|---|
| 1 | Âm thanh: loại nhạc, tên SFX chỉ suy luận | 16 mp3 | mp3 = bản trộn đầy đủ của chính video (tương quan 0,9996–0,9997, lệch 0 ms, cùng thời lượng, 44,1 kHz stereo ~155–169 kbps). Không phải stem, không có nhãn. Tách nguồn không chạy được (trọng số demucs bị chặn). | **CHƯA ĐẠT** |
| 2 | Lời từ OCR (sai ở V13, V15, V16); chưa đo từ/phút từng video | 16 kịch bản | Kịch bản khớp đúng video: ASR offline (pocketsphinx) khớp 52–70% với đúng kịch bản, chỉ 7–14% với kịch bản khác; 76–98% chữ OCR có trong kịch bản. Không thấy đoạn lệch nội dung (các đoạn lệch ≥ 3 từ đều là lỗi nghe giống âm của ASR). Đo được nhịp 208–244 từ/phút, trung vị ~225. Chưa xác minh từng từ (mục lục kịch bản cũng tự ghi vậy). V1, V6 không có kịch bản. | **ĐẠT MỘT PHẦN** |
| 3a | Font gốc | không có | Không tài liệu nào nêu font. | **CHƯA ĐẠT** |
| 3b | Phần mềm dựng gốc | không có | Siêu dữ liệu video là bản YouTube mã hóa lại (AV1, "ISO Media file produced by Google", Lavf) → không suy ra được. | **CHƯA ĐẠT** (không xác định được từ file) |
| 3c | Tỉ lệ cơ thể ước lượng bằng mắt | 37 ảnh toàn thân | PDF tự ghi ảnh do **AI tái tạo**, tỉ lệ/màu/phụ kiện có thể khác. Đối chiếu 6 ảnh với khung gốc: khớp nhận diện và trang phục, nhưng kiểu render khác (nét phẳng viền dày ≠ 3D đổ bóng mềm). Tôi đo pixel trực tiếp trên khung gốc: 5 nhân vật / 4 video → đầu 30–34% chiều cao, thân ~30%, chân ~38% (máy ngang). | **ĐẠT** (bằng đo khung gốc; ảnh AI chỉ dùng tham chiếu trang phục) |
| 4 | Hòa hình nhanh có thể bị đếm thiếu; "0 cắt cứng" mới kiểm 6 điểm | Báo cáo chuyển cảnh | Quét cắt cứng toàn bộ 18 video ở 2 ngưỡng + xem từng khung 27 điểm nghi vấn: **6 cắt cứng ở 5 video** → kết luận "0/163 cắt cứng" của báo cáo **sai**. Đo độ dài hòa hình từng khung (3 lần, V4): 6–8 khung, khớp báo cáo "4–8 khung". Mật độ ≈1 chuyển cảnh/5 s phù hợp bậc độ lớn với bộ dò tự động. Số theo từng video trong báo cáo tự mâu thuẫn, không dùng. | **ĐẠT có điều chỉnh** (cắt cứng đã xác minh; số hòa hình theo từng video chưa đếm tay độc lập) |

## Mục 4 — chi tiết

### Cắt cứng đã xác nhận từng khung (1 bước nhảy, không có khung trộn)
| Video (KIT) | Thời điểm | Từ → sang | Báo cáo ghi |
|---|---|---|---|
| V4 Spear | 28,00 s | ngoài lò rèn (giữ yên) → trong lò rèn | không có trong nhật ký |
| V8 Jar | 3,07 s | ngai vàng → cận nhà phát minh | 0:02 "hòa hình" |
| V14 Painkillers | 2,17 s | mặt đau đầu → uống thuốc (cùng nhân vật) | không có |
| V15 Random | 14,30 s | đẩy vào tòa nhà → trong thang máy | 0:13 "zoom in" |
| V16 Time Test | 23,70 s | bản vẽ → lưới chân tháp | 0:23 "hòa hình" |
| V16 Time Test | 35,90 s | văn phòng → tiệc nướng | 0:35 "hòa hình" |

Điểm nghi vấn đã loại sau khi xem khung: V1@2,47/5,03; V2@21,63/57,27; V4@19,07/38,97; V5@0,1/5,2/21,27; V9@0,67; V10@53,8; V12@17,87; V14@10,33; V16@35,37/39,3; V17@17,4/18,27/21,43/22,3 (cú máy nhanh, lóe sáng, đổi ánh sáng, hòa hình); V11@18,27/19,03/20,3 = hòa hình 1–2 khung sang/ra góc ống nhòm.

### Lỗi trong báo cáo chuyển cảnh
- Kết luận "0 cắt cứng, 0,0%" sai (6 cắt, bảng trên).
- Tổng của bảng cộng đúng (163 = 104 + 59; 831 s), nhưng nhật ký từng video không khớp số trong bảng ở nhiều video. Ví dụ đếm theo nhật ký: V4 (báo cáo số 6) 8 điểm so với bảng 6; Jar 20 điểm so với 13; Burglar 14 so với 12; Upload Brain 9 hòa hình so với 8; Random Numbers 9 so với 8; Time Test 9 so với 8.
- Phân loại sai đã thấy ở V4: 0:32 thực là hòa hình (báo cáo ghi "tilt down"); 0:37 thực là đẩy xuyên tờ giấy rách (báo cáo ghi hòa hình); 0:12 thực là 2 lần hòa hình liền (12,0 s và 12,6 s).
- "4–8 khung (0,15–0,30 s)": ở 30 fps, 4–8 khung = 0,13–0,27 s.

## Mục 2 — số đo theo video
| Video | Số từ kịch bản | Khớp ASR (đúng / kịch bản khác cao nhất) | Từ/phút |
|---|---|---|---|
| V2 | 200 | 66,0% / 9,6% | 208 |
| V3 | 295 | 57,6% / 13,9% | 228 |
| V4 | 164 | 65,9% / 12,4% | 219 |
| V5 | 231 | 67,5% / 9,5% | 219 |
| V7 | 245 | 63,3% / 11,5% | 224 |
| V8 | 235 | 60,9% / 13,1% | 217 |
| V9 | 219 | 60,3% / 12,4% | 234 |
| V10 | 237 | 62,4% / 10,9% | 244 |
| V11 | 244 | 64,3% / 12,7% | 229 |
| V12 | 145 | 52,4% / 7,7% | 223 |
| V13 | 158 | 63,9% / 8,1% | 233 |
| V14 | 137 | 70,1% / 9,1% | 239 |
| V15 | 166 | 67,5% / 11,6% | 211 |
| V16 | 143 | 63,6% / 7,3% | 214 |
| V17 | 214 | 69,2% / 8,2% | 226 |
| V18 | 220 | 60,0% / 11,4% | 222 |
Ghi chú: lời đọc "a hundred", "ten thousand" nhưng phụ đề hiện "100", "10,000" (V4) → quy tắc: phụ đề dùng chữ số.

## Cần bổ sung để đóng các mục còn mở
1. Âm thanh: stem nhạc/SFX gốc, **hoặc** tên bản nhạc/thư viện SFX, **hoặc** bảng nhãn do người nghe ghi (mốc giờ → loại âm) cho ít nhất 3 video.
2. Lời: bản ghi đã nghe đối chiếu từng từ (hoặc phụ đề gốc .srt) nếu cần chính xác tuyệt đối; kịch bản cho V1, V6.
3. Font: tên font của chủ kênh (hoặc file project/preset phụ đề).
4. Phần mềm dựng: thông tin từ chủ kênh — không thể suy ra từ video tải về.

## Đối chiếu đánh số
Báo cáo chuyển cảnh 1–16 → KIT: 1 V17, 2 V12, 3 V15, 4 V16, 5 V14, 6 V4, 7 V13, 8 V8, 9 V10, 10 V2, 11 V18, 12 V5, 13 V3, 14 V9, 15 V7, 16 V11.
Bộ nhân vật V01–V16 → KIT: V01 V4, V02 V3, V03 V5, V04 V14, V05 V11, V06 V8, V07 V10, V08 V16, V09 V7, V10 V13, V11 V18, V12 V2, V13 V15, V14 V9, V15 V17, V16 V12.
Dữ liệu thô: `metrics/verification_2026-10-29/` (script_vs_asr.json, blend_events_V*.json).

## Bổ sung (29/10/2026, tối) — chủ kênh xác nhận không có thêm dữ liệu gốc
Các mục còn mở được xử lý bằng đo đạc thêm + quyết định [CHỌN]:

| Mục | Làm thêm | Kết quả | Trạng thái |
|---|---|---|---|
| Font | So khớp 101 từ phụ đề (18 video) với 89 kiểu chữ / 32 họ font (npm @fontsource); dựng lại bằng libass | Work Sans ExtraBold khớp nhất (IoU 0,69; Poppins Bold 0,50, hạng 34). Dựng lại: bề rộng 1,005× (IQR 0,99–1,02), cao 1,00×, baseline 918, căn giữa 360 | [CHỌN] Work Sans ExtraBold — hình khớp đo được; tên font gốc vẫn chưa biết |
| Nhạc | librosa: độ đều nhịp, giọng, so khớp nền giữa các video, sàn khoảng nghỉ | Không nhịp trống 16/18; giọng thứ (D minor 11/18); mỗi video nền riêng; sàn giữa câu −16 dB (−13,4…−18,1). Demo cũ −22,3 dB (nhạc quá nhỏ) | [CHỌN] `audio_kit.py` 5 sắc thái, bed −20 LUFS trước ducking (thử: −15,5 dB, đều nhịp 0,03) |
| SFX | — (không có nguồn) | Tên SFX gốc không xác định được | [CHỌN] 18 SFX tổng hợp + bảng hành động→SFX; cần người dùng nghe duyệt ở lần sản xuất đầu |
| Lời V1, V6 | Đọc phụ đề 4 khung/giây + ASR | V1 160 từ (khớp ASR 65,6% vs 9,5% kịch bản khác), V6 224 từ (73,2% vs 11,2%); nhịp 213, 222 từ/phút | Bản làm việc; từ trong [ ] là suy ra |
| Phần mềm dựng gốc | — | Không xác định được từ file | [CHỌN] Blender nếu có, nếu không engine three.js của KIT → Kdenlive; không ảnh hưởng tiêu chí đầu ra |
| Số hòa hình từng video | — | — | [CHỌN] dùng mật độ ≈1 chuyển cảnh / 4–6 s |

Công cụ mới: `tools/analysis/font_match.py`, `caption_calibrate.sh`, `production/audio_kit.py`; QA thêm "sàn nhạc giữa câu" (mẫu V4 15/15 đạt).
