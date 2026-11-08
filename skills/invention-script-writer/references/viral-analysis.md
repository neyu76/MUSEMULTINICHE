# Phân tích 5 video viral của kênh — "How you invented X" (08/11/2026)

Nguồn: 5 file mp4 chủ kênh gửi (trampoline, quạt, cửa, tủ lạnh, giấy vệ sinh).
Đo bằng: faster-whisper "small" lấy mốc từng từ; ffmpeg scene-cut ngưỡng 0,3; ebur128; contact sheet 2 khung/giây xem toàn bộ.
Nhãn: [ĐO] = số đo · [QS] = quan sát hình · [SL] = suy luận. Claude không nghe nhạc/SFX nên phần âm chỉ có số đo tín hiệu.
Số view/like từng video: không có → "viral" là theo chủ kênh, chưa so được video nào hơn video nào.

## 1. Bảng số đo [ĐO]

| | Trampoline | Quạt | Cửa | Tủ lạnh | Giấy VS | Dải / trung vị |
|---|---|---|---|---|---|---|
| Thời lượng (s) | 36,4 | 30,1 | 33,1 | 43,2 | 35,8 | 30–43 / 35,8 |
| Số từ | 132 | 110 | 121 | 158 | 132 | 110–158 / 132 |
| Từ/phút | 220 | 222 | 222 | 221 | 224 | 220–224 |
| Lời bắt đầu | 0,0 s | 0,0 | 0,0 | 0,0 | 0,0 | luôn 0,0 |
| "so you" đầu tiên | 3,3 s | 1,3 | 2,6 | 3,4 | 1,0 | 1,0–3,4 / 2,6 |
| Số lần "so you" (giải pháp) | 5 | 5 | 5 | 5 | 6 | 5–6 |
| Số "But/Except" sau hook | 4 | 4 | 4 | 4 | 5 | 4–5 |
| Chu kỳ vòng lỗi→sửa | ~6 s | ~5,5 | ~6 | ~7,5 | ~5,5 | 5–7,5 |
| Câu khen (Clever/Genius/Much better) | 1 (13,1 s) | 2 (8,9 / 21,5) | 2 (4,8 / 22,6) | 2 (6,3 / 17,2) | 2 (7,0 / 14,7) | 1–2 |
| Khoảng nghỉ dài nhất | 0,66 s sau hook | 0,56 | 0,52 sau "Clever!" | 0,70 sau "Genius!" | 0,52 sau "Clever!" | ≤ 0,7 |
| Câu kết "Now…" bắt đầu | còn 2,6 s | 2,2 | 1,8 | 2,3 | 1,8 | còn 1,8–2,6 s |
| Đuôi sau từ cuối | 0,46 s | 0,42 | 0,38 | 0,36 | 0,48 | ~0,4 s |
| Từ thô (ass/shit/fat/lazy/dumbass/fucking/poop) | 3 | 3 | 2 | 2 | 5 | 2–5 |
| "fucking" | 1 | 1 | 1 | 0 | 0 | 0–1 |
| Cắt cứng | 5 | 2 | 13 | 7 | 11 | 2–13 |
| Shot trung bình | 6,0 s | 9,9 | 2,3 | 5,4 | 2,9 | — |
| Loudness bản tải | −16,2 | −12,4 | −12,2 | −12,1 | −12,4 LUFS | — |

**Điểm cắt rơi vào chữ nối** [ĐO]: 30/38 điểm cắt (79 %) nằm trong ±0,35 s quanh "so you", "But", "Except" hoặc "Now"; tính cả đầu cụm câu thì 32/38 (84 %).
Video ít cắt (quạt 2, trampoline 5) thay cắt bằng máy trôi/cẩu liên tục, nhưng hình vẫn đổi đúng ở mỗi chữ nối.

Khoảng nghỉ: chỉ có nghỉ 0,3–0,7 s ở 3 chỗ: sau câu hook, sau câu khen, sau một câu giải thích cơ chế. Không có khoảng lặng nào > 0,7 s.

## 2. Khung lời chung (5/5) [ĐO]

```
0,0 s   HOOK: động cơ/vấn đề cá nhân, ngôi "you", thô — "You wanna…", "Your ass is sweaty", "You're taking a shit", "You just shit", "Your friend loves your meat"
        (+ "but" vật cản trong 1,0–1,6 s nếu hook là mong muốn)
1–3,4 s "So you [giải pháp thô sơ bằng vật tự nhiên]"  (tấm vải + 4 cọc, lá to, tấm da, hộp đá, chiếc lá)
4,8–9 s "Clever!" / "Genius!"  + nghỉ 0,5–0,7 s
        "But/Except [lỗi thấy được], so you [bộ phận thật thứ 2]"
        … lặp 4–5 vòng, chu kỳ 5–7,5 s, mỗi "so you" = 1 bộ phận có thật của đồ vật hiện đại
14–22 s khen lần 2 "Much better!" / "Genius!"
60–75 % lỗi do "your friend" (thường kèm "fucking"/"dumbass")
cuối    "Now [động cơ ở hook đã đạt] — câu nước đôi"   (≤ 10 từ, còn ~2 s)
```

Chuỗi bộ phận thật (đây là phần "học được" khiến người xem ở lại):
- Trampoline: tấm vải + 4 cọc → lò xo → khung kim loại → đệm che lò xo → lưới quanh mép.
- Quạt: lá → 4 lá gắn trục quay tay → mô-tơ (nguồn: nhà máy hạt nhân — câu phi lý) → lồng bảo vệ → bánh răng đảo chiều.
- Cửa: tấm da treo → ván ghép → bản lề → chốt (latch) → then cài trong (bolt).
- Tủ lạnh: hộp đá → chất lỏng chạy trong ống (bay hơi hút nhiệt) → máy nén → dàn ngưng (coil) → cách nhiệt + gioăng cửa → thermostat.
- Giấy VS: lá → bột gỗ ép giấy mềm → 2 lớp ép → cuộn quanh lõi giấy → hàng lỗ xé → trục treo cạnh bồn.

Câu giải thích cơ chế (1–2 câu/video, thường ngay trước khen): "Now when you land, the springs stretch and pull the sheet back up, launching you higher." · "As the liquid evaporates, it absorbs the heat…".

Nguồn lỗi leo thang (không lặp loại): cơ thể ("fat ass" làm gãy khung, "lazy ass" chán thay đá, tay mỏi) → môi trường (gió lật tấm da) → chấn thương (chân kẹt lò xo, ngón tay xuyên giấy dính phân) → người thứ ba (em họ bị bắn văng, bạn thò tay vào cánh quạt, bạn làm rơi cuộn giấy vào bồn) → chi phí (máy nén chạy tốn điện → thermostat).

Kết (5/5 là kết B, không ai dùng "Congratulations"): câu "Now…" khép vòng hook bằng nghĩa nước đôi:
"watch your friend shower every day" · "blow your friend all day" · "your friend can come inside" · "your friend is crazy for your meat" · "you don't need to let it crust".

## 3. Hình ảnh [QS, contact sheet 2 khung/giây]

| Thành phần | Quan sát |
|---|---|
| Khung đầu | Động cơ/vấn đề đã thấy bằng hình ở 0 s: nhìn qua hàng rào sang cửa sổ nhà tắm; người đẫm mồ hôi quạt lá; người rặn trên bồn; bạn mắt tim chảy dãi nhìn miếng thịt. Mặt nhân vật đủ gần để đọc biểu cảm. |
| A-roll (người) | Rộng/trung: động cơ, thất bại (ngã ngửa, khung gãy sập, bị bắn văng, gió lật), phản ứng, người bạn gây chuyện. |
| B-roll (đồ vật) | Macro sát đồ vật: bộ phận mới hiện đúng lúc đọc danh từ (lò xo, bản lề, chốt, then, ống + mũi tên nhiệt cam, lỗ xé, trục treo). Đồ vật thay đổi thấy được ở mỗi vòng. |
| Nhịp A/B | "so you …" → B-roll đồ vật; "But/Except …" → A-roll người/thất bại; câu khen → đồ vật hoàn chỉnh hoặc nhân vật tự hào; "Now…" → khung rộng 2 người hoặc gọi lại khung mở đầu. |
| Máy | Luôn chuyển động: đẩy vào, trôi ngang, cẩu theo cú nhảy, ngước theo người bị bắn. Không có shot đứng yên. |
| Gag phi lý | Tháp làm mát hạt nhân: quạt (lời "nuclear power plant"), cửa (kéo lùi lộ 2 tháp trên nóc chòi ở câu kết). |
| Phụ đề | Trắng đậm, viền/bóng tối, 1–3 từ/cụm, giữa ngang, ~60 % chiều cao; từ chửi/cảm xúc VIẾT HOA ("DUMBASS"). |
| Bối cảnh | 1 địa điểm/video (sân sau, chòi đá giữa đồng, bếp, phòng tắm), nhân vật ăn mặc đời thường. |

## 4. Vì sao 5 video này giữ người xem [SL, gắn mốc ĐO]

| Giây | Cơ chế | Bằng chứng |
|---|---|---|
| 0–1,5 | Câu đầu thô + ngôi "you" + hình động cơ ngay khung 0 → bất ngờ và thấy mình trong đó; chưa nói đồ vật nào → tò mò "rồi làm ra cái gì?" | lời ở 0,0 s 5/5 |
| 1–3,5 | Giải pháp đầu đến rất sớm (trung vị 2,6 s) → câu chuyện chạy ngay, không dạo đầu | "so you" đầu 1,0–3,4 s |
| 5–9 | Câu khen mỉa + nghỉ 0,5–0,7 s = nhịp "đánh trống" duy nhất, người xem kịp cười | 9/9 câu khen có nghỉ sau |
| Giữa | Vòng lỗi→sửa 5–7,5 s luôn mở câu hỏi "lỗi tiếp là gì?" và luôn có hình mới đúng chữ nối; mỗi vòng dạy 1 bộ phận có thật ("à, vì thế mới có lò xo/then cài") | 4–5 vòng, 79 % cắt đúng chữ nối |
| 60–75 % | "your friend" quay lại phá + "fucking/dumbass" → cú hích năng lượng ở đoạn dễ lướt | 4/5 video |
| Cuối | Câu nước đôi gọi lại hook, ngắn 1,8–2,6 s, kết gọn ~0,4 s → dễ xem lại, dễ gắn thẻ bạn bè/bình luận | 5/5 kết B |
| Toàn video | 30–43 s, 220 từ/phút không lặng, 1 địa điểm, đồ vật ai cũng dùng | — |

## 5. Giới hạn của phân tích
- Không có số liệu view/retention/share → chưa xếp hạng được yếu tố nào mạnh nhất; cần analytics TikTok để xác nhận.
- Không nghe được nhạc/SFX; transcript là ASR chưa sửa tay (vài chữ có thể sai, không ảnh hưởng mốc thời gian).
- Phát hiện cắt bằng ngưỡng 0,3 có thể bỏ sót whip pan; video ít cắt được xem bằng mắt trên contact sheet.
