# QUY TRÌNH RIÊNG — P01 Sport USA "What If" (v0.1, 03/11/2026, trạng thái: NHÁP — chờ duyệt)

## 1. Phương pháp sản xuất đã chọn
- **Phương pháp:** 3D thời gian thực điều khiển bằng code (three.js chạy trong Chromium headless, render từng khung theo thời gian cố định) + lớp đồ họa truyền hình HTML/CSS render PNG trong suốt + phụ đề ASS từ mốc từ + ráp trong project Kdenlive, xuất bằng melt.
- **Lý do (gắn số đo):** mẫu là 3D thời gian thực, tô phẳng, bóng mềm [QS]; mỗi câu một shot, trung vị 1,88 s [ĐO]; đồ họa phải xuất hiện đúng từ được đọc [QS] → cần điều khiển chính xác theo mốc thời gian, nên chọn engine lập trình được. Đồ họa là chữ/khối phẳng → HTML/CSS cho chất lượng chữ tốt nhất và render nhanh (0,057 s/khung) [ĐO].
- **Phương án đã cân nhắc và lý do loại:**
  - Blender EEVEE/Workbench: đẹp và quen thuộc nhưng 2,2–13,8 s/khung trên CPU [ĐO] → 1,5–8 giờ/video. Giữ Blender để chuyển đổi model.
  - Video AI (Veo/Kling…): không giữ được nhân vật, số áo, tỉ số nhất quán qua 40 shot; không khớp lời từng từ.
- **Giới hạn đã biết khiến sản phẩm có thể khác mẫu:** nhân vật (mặt, tóc, râu riêng) nếu chưa dùng Meshy/Mixamo; animation thể thao chuyên biệt; bản nhạc gốc.

## 2. Các bước
| # | Bước | Nhãn | Đầu vào | Công việc | Công cụ (đã kiểm) | Đầu ra | Tiêu chí qua bước (đo được) |
|---|---|---|---|---|---|---|---|
| 1 | Ý tưởng → kịch bản | [MỚI] | chủ đề (đội/sao + đối thủ phi lý) | viết theo công thức 8 nhịp (mục 4); tra số liệu thật có nguồn | WebSearch | `tap/E../kich_ban/kich_ban.md` + nguồn | 150–200 từ; hook "Could…?" 8–17 từ; cú xoay ở 20–45 %; "Final score" ở 85–95 %; câu chốt troll; **chủ dự án duyệt** |
| 2 | Giọng | [ĐIỀU CHỈNH] | kịch bản đã duyệt | gọi TTS giọng Sport USA (hoặc nhận mp3) | API TTS (CHỜ) | `giong/giong.wav` 48 kHz | 150–170 từ/phút; không lặng > 0,35 s; không lỗi đọc tên riêng |
| 3 | Căn mốc từ | [TÁI DÙNG] | giong.wav | Whisper có mốc từ, sửa tên riêng theo kịch bản | faster-whisper | `giong/words.json` | khớp 100 % chữ kịch bản |
| 4 | Shot list | [MỚI] | words.json | chia shot theo cụm lời (1 shot/1–2 cụm), mỗi shot ghi: bối cảnh, nhân vật, hành động, máy, đồ họa, SFX | bảng JSON | `hinh/shotlist.json` | mọi câu có hình; mọi danh từ/động từ chính có hành động hoặc đồ họa; trung vị shot 1,5–2,2 s |
| 5 | Tài sản | [MỚI] | shotlist | nhân vật (màu đội, số, mũ, mặt), bối cảnh (sân, khán đài, bối cảnh lịch sử), đạo cụ | three.js, nhanvat.js, (Meshy/Mixamo nếu duyệt) | `engine/assets/`, `engine/scenes/` | nhân vật nhất quán mọi shot; không logo đội/giải thật |
| 6 | Dựng cảnh, chuyển động, máy | [MỚI] | shotlist + tài sản | mỗi shot một hàm cảnh: vị trí, clip animation, đường máy (đẩy/lia/bay quanh), thời gian theo words.json | three.js | `engine/scenes/E..js` | % khung máy đứng yên ≤ 30 %; chủ thể nằm trên vùng phụ đề (y < 1250 px) |
| 7 | **Bản thử** | [TÁI DÙNG] | 3–4 shot khó nhất | render 8–12 s đủ chuỗi công cụ, ghép cạnh mẫu, chấm MAU_05 | toàn bộ | `tap/E../thu/` | **chủ dự án duyệt** |
| 8 | Render hình | [ĐIỀU CHỈNH] | cảnh đã duyệt | render từng shot thành mp4 (CRF 16) | render.js | `hinh/shot_XX.mp4` | đủ khung, không khung đen/đứng |
| 9 | Đồ họa + phụ đề | [MỚI] | words.json + shotlist | bug tỉ số, thẻ số liệu điền theo từ, chữ 3D, tag REPLAY; phụ đề ASS | dohoa_render.js, tao_phu_de.py | `do_hoa/*.mov` (alpha), `chu/phu_de.ass` | thẻ hiện ≤ 0,1 s sau từ tương ứng; phụ đề chân chữ y≈1310 px, 2–4 từ |
| 10 | Nhạc, SFX, mix | [ĐIỀU CHỈNH] | giọng + nhạc + SFX | nhạc liên tục thấp hơn lời 8–12 dB; SFX chỉ ở va chạm, lóa, ghi điểm, còi | ffmpeg | `am_thanh/*.wav` | nhạc giữa câu −8…−12 dB so với lời |
| 11 | Ráp project | [MỚI] | tất cả | `tao_kdenlive.py` → `.kdenlive`; render melt | Kdenlive 23.08, melt | `giao/E...kdenlive`, `giao/E...mp4` | mở được trong Kdenlive; melt render đúng thời lượng ±1 khung |
| 12 | QA | [TÁI DÙNG] | bản xuất | MAU_06 + ngưỡng mục 3; rút khung 2/giây xem tay; nghe toàn bộ | phan_tich_mau.py, ffmpeg | `giao/QA.md`, lưới khung | MAU_06 đạt |
| 13 | Bàn giao + cập nhật hồ sơ | [TÁI DÙNG] | — | zip project + media, HUONG_DAN_TIEP_TUC.md, nhật ký | — | `giao/` | phiên khác mở lại được |

## 3. Ngưỡng QA của dự án
| # | Chỉ số | Ngưỡng | Lấy từ | Cách đo |
|---|---|---|---|---|
| 1 | Khung hình | 1080x1920, 30 fps, H.264 yuv420p | mẫu [ĐO] | ffprobe |
| 2 | Thời lượng | 55–85 s (mục tiêu 65–78 s) | mẫu 55/74/82 s | ffprobe |
| 3 | Lời bắt đầu | ≤ 0,1 s | 23/23 mẫu = 0,0 s | words.json |
| 4 | Nhịp lời | 150–170 từ/phút | mẫu 146/160/168 | words.json |
| 5 | Lặng > 0,35 s trong phần lời | 0 | mẫu 0 | silencedetect −40 dB |
| 6 | Độ dài shot trung vị | 1,5–2,2 s; shot đầu ≤ 3 s | mẫu 1,56/1,88/2,72 | bang_shot.py + xem tay |
| 7 | Máy đứng yên | ≤ 30 % khung | mẫu 6/15/30 % | phan_tich_mau.py |
| 8 | Bão hòa / sáng (HSV) | 95–145 / 95–165 | mẫu 92–144 / 91–167 | phan_tich_mau.py |
| 9 | Phụ đề | vàng #F5F500, Montserrat ExtraBold 60, viền 3, chân chữ 1310 ±15 px, 2–4 từ | mẫu [ĐO] | đo mặt nạ màu như TONG_HOP |
| 10 | Loudness | −14 LUFS ±1, true peak ≤ −1 dBFS | mẫu trung vị −14,2 | ebur128 |
| 11 | Nhạc giữa câu | thấp hơn lời 8–12 dB | mẫu 6–11 dB | RMS khoảng giữa câu |
| 12 | Đồ họa theo lời | ≥ 80 % số liệu được đọc có thẻ/đồ họa | mẫu [QS] | đối chiếu shotlist |
| 13 | Nội dung | không logo/nhãn hiệu đội, giải thật; không thảm kịch có thật làm trò cười | quyết định đề xuất | xem tay |

## 4. Công thức kịch bản (format mới của mẫu)
1. **Hook (0 s):** "Could [prime/năm + tên sao hoặc đội] [kỹ năng đặc trưng làm động từ] [đối thủ phi lý]?"
2. **Credential (1–2 câu):** số liệu thật ("In 2016, … averaged …") hoặc lợi thế áp đảo ("The X have a roster full of professional athletes. The babies have zero football experience.").
3. **Meanwhile:** dữ kiện thật về đối thủ/sự kiện.
4. **Cú xoay:** "This should be the easiest win in NFL history, except…" / "But there's one problem." / "So, naturally, they call X."
5. **Luật chơi:** "He has 15 minutes, no directions, no backup." / "One-on-one. First basket wins."
6. **Tường thuật:** thì hiện tại, câu 3–8 từ, thuật ngữ thể thao áp vào bối cảnh phi lý; "Unfortunately, …" để bật gag; leo thang 3 nhịp.
7. **Kết quả:** "Final score, …" / "Final stat line, …".
8. **Câu chốt troll:** 1 câu về meme ngoài truyện mà fan đều biết.

## 5. Rủi ro và đoạn thử
| Rủi ro | Vì sao | Cách thử ở G6 |
|---|---|---|
| Nhân vật thua xa mẫu | mặt/tóc/râu riêng là điểm nhận diện | cận mặt phản ứng + trung cảnh 2 cầu thủ, đặt cạnh shot 9 và 26 của Cowboys |
| Đám đông + sân vận động làm render chậm | CPU-only | toàn cảnh 50 nhân vật có animation, đo s/khung |
| Đồ họa lệch lời | phải hiện đúng từ | thẻ điền dần 5 dòng theo lời (như LeBron 6,4–11,4 s) |
| Giọng clone đọc sai nhịp/ngữ điệu | nhịp 160 từ/phút, năng lượng cao | 3 câu hook + 1 đoạn tường thuật nhanh, đo từ/phút |
| Hành động thể thao thiếu clip | UAL không có ném/bắt | pha chuyền bóng hỏng (kiểu CeeDee "wide open") |

## 6. Ước tính chi phí và thời gian mỗi video (75 s)
| Hạng mục | Công cụ | Chi phí | Thời gian máy |
|---|---|---|---|
| Giọng | TTS Sport USA | ~1.100 ký tự/video theo gói bạn | < 1 phút |
| Nhân vật | hiện có / Meshy | 0 / ~150–250 credit Meshy cho 4–6 nhân vật mới (dùng lại được) | 0 / 10–20 phút |
| Render 3D | three.js CPU | 0 | 20–60 phút |
| Đồ họa + phụ đề | HTML + ASS | 0 | 2–3 phút |
| Ráp + xuất | Kdenlive/melt | 0 | 3–5 phút |


## 7. Cập nhật 03/11 (v0.2)
- Nhân vật: UBC + làm mượt Taubin vùng áo/quần (che cơ bắp, giống áo rộng của mẫu), viền màu mềm; em bé `makeBaby` + tư thế code.
- Máy quay: `lib/camera.js` (camera-controls + simplex-noise). Mỗi shot khai báo {t0,t1,from,to,ease,shake,orbit,follow}.
- Chỉnh màu hậu kỳ bắt buộc: `eq=saturation=0.72:brightness=0.03` (đưa bão hòa về dải mẫu 95–145).
