---
name: invention-script-writer
description: Viết, sửa và QA kịch bản TikTok/Shorts dọc 30–43 s kiểu "How you invented X" (ngôi "you" phát minh đồ vật qua chuỗi lỗi→sửa, hài bựa, kết nước đôi khép vòng hook) theo công thức đo từ 5 video viral của kênh. Nhận topic/outline từ invention-topic-studio hoặc một đồ vật/brief; giao lời đọc sạch + bảng shot A-roll/B-roll có điểm cắt + QA. Dùng khi được yêu cầu viết/sửa/remake kịch bản, hook, nhịp, kết cho ngách này; không dựng, không gọi TTS, không đăng.
---

# Invention Script Writer — v1.1 (09/11/2026)

Chuyển thể từ `tiktok-script-all-in-one` (nguyên tắc chung: hook từ khung đầu, beat theo thay đổi, cắt có quan hệ, payoff đúng lời hứa, QA P0/P1/P2) và **chuyên hoá cho một format đã đo**. Trao đổi tiếng Việt; lời đọc tiếng Anh (trừ khi brief đổi ngôn ngữ).
Số đo gốc và lý do viral: `references/viral-analysis.md`. Mẫu bảng shot: `references/board-template.md`.

> **Không chép câu chữ kênh mẫu (chủ kênh 08/11, kit §1d):** công thức dưới đây là NHỊP và CẤU TRÚC đo từ video mẫu. Câu khen, câu kết, chữ chơi chữ phải là của kênh mình: câu khen lấy từ `PRAISE_WORDS` trong `niches/how-you-invented/channel.env` (vd "Bullseye.", "Gotcha.", "Big brain.", "Nailed it."), **không dùng "Clever!/Genius!/Much better!"**; câu kết "Now …" viết mới mỗi tập, không lặp câu kết của video mẫu.

## 1. Việc được giao → làm tới đâu

| Yêu cầu | Đầu ra |
|---|---|
| Viết tập từ topic/outline/đồ vật | Lời đọc hoàn chỉnh + bảng shot + QA, tự chọn hook, tự sửa tối đa 2 vòng |
| Chỉ hook | 3 hook khác cơ chế (mục 4), mỗi cái có hình khung 0 + câu kết nước đôi đi cặp |
| Sửa nhịp/hook/kết | Chỉ vùng được giao + phụ thuộc (timing, câu kết gọi lại hook) |
| Remake tập cũ của kênh | Giữ đồ vật, đổi động cơ/lỗi/câu chữ; không đăng lại bản gần giống |

Script-ready ≠ có giọng ≠ có video ≠ đã đăng. Không tự gọi TTS/render/đăng; chỉ chuẩn bị gói bàn giao cho kit (P02 hoặc Muse).

## 2. Brief tối thiểu (tự điền mặc định, chỉ hỏi khi đổi lớn)
Đồ vật · chuỗi bộ phận thật (5–6) · động cơ hook · từ nước đôi của câu kết · người bạn/người thứ ba · bối cảnh 1 địa điểm · thời đại (hiện đại mặc định; tiền sử khi đồ vật rất cổ) · thời lượng.
Mặc định đã chốt của kênh: tiếng Anh, giọng "bựa" (ass/shit + tối đa 1 "fucking"), 33–42 s, ~218 từ/phút, kết "Now …" khép vòng hook; giọng "Jack John" (ElevenLabs 7EzWGsX10sAS4c9m9cPf qua SonicVoice, model v4/v3) CÓ tag cảm xúc (mục 3b).
Thiếu chuỗi bộ phận thật → tự tra nguồn (mục 7) trước khi viết; không bịa cơ chế.

## 3. Công thức lời (đo 5/5 video viral)

```
[0,0 s]   HOOK ≤ 12 từ: động cơ/khó chịu cá nhân, ngôi "you", có 1 từ thô.  (+ "but <vật cản>" nếu hook là mong muốn)
[1–3,5 s] "So you <giải pháp thô sơ bằng vật tự nhiên>."
[5–9 s]   <câu khen riêng 1–2 chữ>                 ← ding ở câu khen (không để lặng)
          "But/Except <lỗi thấy được>, so you <bộ phận thật #2>."
          … 4–5 vòng, chu kỳ 5–7 s; mỗi "so you" = 1 bộ phận có thật của đồ vật hiện đại
[14–22 s] khen lần 2 (câu khen riêng khác lần 1)
[60–75 %] "your friend" phá (kèm "fucking"/"dumbass") → bộ phận cuối
[T−2,2 s] "Now <động cơ hook đã đạt, nói nước đôi>!"   ≤ 10 từ, kết thúc ~0,4 s trước hết video
```

Ngân sách: **số từ ≈ thời lượng × 3,63** (218 từ/phút; tag không tính). 33 s ≈ 120 từ, 36 s ≈ 131 từ, 42 s ≈ 152 từ. Viết 120–150 từ.

Quy tắc câu:
1. **Mọi câu mở bằng chữ nối**: So you / But / Except / Now / câu khen. Chữ nối là điểm cắt hình và là động cơ nhân quả; không dùng "Then", "Next", "After that".
2. Vế "so you" nêu **danh từ bộ phận cụ thể** (springs, hinges, latch, bolt, compressor, coils, thermostat, rows of tiny holes, a rod) — danh từ đó phải hiện trên hình đúng lúc đọc.
3. Vế lỗi là **thất bại vật lý nhìn thấy được**, nguồn lỗi đổi mỗi vòng, leo thang: cơ thể → môi trường → chấn thương → người thứ ba → chi phí/phi lý. Không hai vòng liền cùng loại.
4. **1–2 câu cơ chế thật** dạng "Now when you…, the X…, …" hoặc "As the X…, it…" (≤ 18 từ) — phần "học được"; đặt ngay trước câu khen.
5. **1 bước phi lý** (tuỳ chọn, 2/5 mẫu): nguồn năng lượng/giải pháp quá đà (nhà máy hạt nhân…) ở 30–50 % thời lượng.
6. Từ thô 2–5/video: tính từ chửi gắn vào người ("your fat ass", "your lazy ass", "your dumbass friend"); "fucking" tối đa 1, đặt ở vòng người bạn. Không nhắm vào chủng tộc, giới, khuyết tật, trẻ em; trẻ em (em họ) chỉ bị slapstick, không bao giờ trong câu nước đôi.
7. Câu ≤ 22 từ; không câu dạo đầu, không tự giới thiệu, không "wait till the end", không CTA.
8. Câu kết **dùng lại đúng động cơ/từ khoá của hook** (shower → shower, sweaty → blow, watch → come inside, meat → meat, shit → crust). Nước đôi ngụ ý, không mô tả tình dục trực tiếp.

## 3b. Tag cảm xúc cho giọng (chủ kênh 09/11 — giọng 7EzWGsX10sAS4c9m9cPf qua SonicVoice, model eleven_v4/v3)
- Hai file: `loi_doc.txt` = lời SẠCH (không tag) cho phụ đề và so khớp ASR; `loi_tts.txt` = cùng lời + tag, gửi TTS. Chữ phải trùng từng từ.
- Tag đặt ngay trước vế đổi cảm xúc, giữ tới tag sau; 6–10 tag/tập, không tag mỗi câu. Tag tả CÁCH NÓI, không tả hành động.
- Gợi ý theo vế: hook `[frustrated]`/`[disgusted]`/`[mischievously]` · "so you" `[excited]`/`[proudly]` · câu khen `[smug]`/`[laughs]` · "But/Except" `[annoyed]`/`[groans]` · câu cơ chế `[curious]` · vòng người bạn `[angry]`/`[shouting]` · kết `[mischievously]`/`[laughs]`.
- Vẫn VIẾT HOA 1–3 từ đắt (FAT ASS, FUCKING, EVERY DAY) như kit; `...` trước cú nảy. Tốc độ chỉnh bằng atempo ở `giong_chuan.py`. Model không phải v3/v4 thì bỏ hết tag (đọc thành tiếng), chỉ giữ chữ HOA.
- Ví dụ: `[frustrated] Your friend keeps barging in while you're naked, [mischievously] so you tell him to knock first. [smug] Big brain. [groans] But he knocks with his FAT fist…`

## 4. Hook — chọn 1 trong 4 cơ chế (đã thấy viral)

| Mã | Cơ chế | Ví dụ khung (không chép) | Kết đi cặp |
|---|---|---|---|
| F | Động cơ bựa/cấm kỵ, đồ vật chỉ là phương tiện | "You wanna <làm điều hư hỏng với friend>, but <vật cản>." | "Now you can <điều đó> every day." |
| B | Khó chịu cơ thể | "Your ass is <khó chịu>, so you…" | "Now <cơ thể/friend> + nước đôi động từ của đồ vật" |
| D | Toilet / vệ sinh | "You're taking a shit, but <rắc rối>…" | nước đôi về "inside/crust/wipe" |
| E | Friend thèm thứ của bạn (từ lóng) | "Your friend loves your <từ lóng>, but <vấn đề>." | "Now your friend is crazy for your <từ lóng>!" |

Khi viết cả tập: nháp nội bộ 3 hook khác mã, chấm theo kiểm tra dưới, chọn 1, ghi lý do. Kiểm: (a) khung 0 có hình động cơ? (b) ≤ 12 từ, có 1 từ thô? (c) chưa nói tên đồ vật? (d) có câu kết nước đôi khép vòng tự nhiên? (e) "so you" đầu tiên ≤ 3,5 s (≤ 12 từ trước nó)?

## 5. Bảng shot — A-roll / B-roll / điểm cắt

Đơn vị là **vế câu**. Quy tắc gán hình (đo 5/5):

| Vế | Hình | Máy |
|---|---|---|
| Hook | A-roll: động cơ/vấn đề thấy ở khung 0, mặt khoa trương, ≥ 2 lớp phụ (mồ hôi, sóng mùi, ruồi, tim) | rộng→đẩy vào, thấy mặt ngay |
| "so you <bộ phận>" | B-roll MACRO đồ vật: bộ phận bật ra/biến hình đúng lúc đọc danh từ | sát vật, trôi dọc vật |
| Câu cơ chế | B-roll + 1 đồ hoạ khoa học (mũi tên lực, dòng khí, mũi tên nhiệt, sóng) | quay quanh vật |
| Câu khen | Đồ vật hoàn chỉnh lấp lánh hoặc nhân vật tự hào | đẩy nhẹ |
| "But/Except <lỗi>" | A-roll: thất bại vật lý (ngã ngửa, gãy sập, kẹt, bị bắn văng, gió lật) + phản ứng 1–2 s | rộng/trung, bám theo vật bay |
| Vòng "your friend" | A-roll 2 người, friend gây chuyện, chữ chửi VIẾT HOA trên phụ đề | qua vai |
| "Now…" | Gọi lại khung mở đầu với động cơ đã đạt, hoặc rộng 2 người; có thể kéo lùi lộ gag phi lý | kéo lùi/rộng |

- **Cắt đúng chữ nối** (79 % mẫu trong ±0,35 s): mỗi "so you/But/Except/Now" là một thay đổi hình — cắt cứng hoặc máy trôi sang chủ thể mới. Chọn 1 kiểu cho cả tập: **CẮT** (10–14 shot, trung bình 2,3–3 s) hoặc **MÁY LIỀN** (2–5 cắt, máy trôi/cẩu giữa người ↔ vật).
- Tỉ lệ thời lượng mục tiêu: B-roll đồ vật 40–55 %, A-roll người 45–60 %.
- 1 địa điểm, ≤ 2 nhân vật chính (+ 1 người thứ ba nếu cần). Đồ vật là màu nhấn duy nhất trong khung.
- Cue phải cụ thể ("cắt từ chân hạ xuống sang cận lò xo kẹp ống quần"), không ghi "chuyển cảnh cuốn".
- Phụ đề: 1–3 từ/cụm, trắng đậm, giữa, ~60 % chiều cao; từ chửi/cảm xúc VIẾT HOA.
- Âm (đề xuất cho kit): ding ở câu khen, whoosh ở mỗi cắt, "uh-oh" ở But/Except, tiếng vật theo hành động; nhạc nền nhẹ dưới lời.

## 6. Quy trình viết (một lượt, tự QA)
1. Đọc topic/outline (ID, chuỗi bộ phận, nguồn, hook đề xuất). Không có thì dựng nhanh chuỗi 5–6 bộ phận có nguồn.
2. Chọn hook + kết đi cặp (mục 4). Ghi `hook_code`.
3. Viết lời theo khung mục 3; đếm từ; ước tính mốc từng chữ nối = (số từ trước nó / 3,67) + ~0,3 s ở hook và mỗi câu khen.
4. Lập bảng shot theo mục 5 + `references/board-template.md`.
5. QA mục 8; lỗi P0/P1 → sửa (tối đa 2 vòng) → QA lại vùng đổi.
6. Xuất file mục 9.

## 7. Sự thật và nguồn
- Mỗi bộ phận "so you" và câu cơ chế phải đúng (tra nguồn có thẩm quyền: trang kỹ thuật/nhà sản xuất/bách khoa/sách). Ghi `claim_id → URL` trong `facts.json`. Thứ tự lịch sử có thể rút gọn, nhưng **chức năng** từng bộ phận phải đúng.
- Câu phi lý (hạt nhân…) là CREATIVE, không cần nguồn; gắn nhãn.
- Không chép đồ vật + chuỗi lỗi + câu chữ của kênh khác; học cơ chế, viết tình huống riêng. Tập trùng đồ vật với kênh mẫu chỉ khi động cơ, lỗi và kết đều mới.

## 8. QA trước khi giao (ước tính trước audio, gắn nhãn ESTIMATED)

| Kiểm | Đạt | Mức lỗi nếu trượt |
|---|---|---|
| Số từ / thời lượng | 110–158 từ; 30–43 s ở 220 từ/phút | P0 nếu > 165 hoặc < 100 |
| Lời ở 0 s, hook ≤ 12 từ, có hình động cơ khung 0 | có | P1 |
| "so you" đầu tiên | ≤ 3,5 s (≤ 12 từ trước nó) | P1 |
| Số giải pháp "so you" | 5–6 | P1 nếu < 4 |
| Mỗi giải pháp = bộ phận thật, có nguồn | 100 % | P0 nếu sai cơ chế |
| Nguồn lỗi | không 2 vòng liền cùng loại; có ≥ 1 lỗi do người bạn/người thứ ba | P1 |
| Câu khen | 1–2, từ PRAISE_WORDS của kênh, có ding; dùng "Clever!/Genius!/Much better!" = chép kênh mẫu | P1 |
| Câu cơ chế | 1–2 | P2 |
| Từ thô | 2–5; "fucking" ≤ 1 | P2 (P0 nếu xúc phạm nhóm người/trẻ em) |
| Câu kết | bắt đầu ở T−1,8…−2,6 s, ≤ 10 từ, gọi lại từ khoá hook | P0 nếu không khép vòng |
| Mọi câu mở bằng chữ nối | ≥ 90 % | P2 |
| Bảng shot | mỗi chữ nối có thay đổi hình; mỗi danh từ bộ phận có B-roll | P1 |
| Khả thi sản xuất | 1 địa điểm, ≤ 3 người, mọi bộ phận dựng được bằng khối/lưới code hoặc asset có sẵn | P1 |

P0 = cản dùng; P1 = yếu rõ; P2 = chỉnh nhỏ. READY khi không còn P0/P1. Điểm "cuốn" là đánh giá biên tập, không phải dự đoán view.

## 9. File bàn giao
Trong thư mục tập (`tap/EXX_<ten>/` của kit P02, hoặc `outputs/<run_id>/<topic_id>/`):
- `loi_doc.txt` — chỉ lời đọc sạch (không mốc, không chú thích, không tag) — phụ đề + so khớp ASR.
- `loi_tts.txt` — `loi_doc.txt` + tag cảm xúc + chữ HOA (mục 3b) — đầu vào TTS.
- `KICH_BAN.md` — tiêu đề, `topic_id`, `hook_code`, lời, nhân vật, bối cảnh, bảng shot (`references/board-template.md`), màu nhấn, gag mở đầu.
- `facts.json` — claim_id, câu, nguồn, trạng thái.
- `script_qa.json` — số từ, thời lượng ước tính, mốc chữ nối, kết quả từng dòng mục 8, P0/P1 còn lại.
- `change_log.md` — phiên bản và thay đổi.
Có Notion và được giao thì cập nhật đúng record topic (giữ tiến độ cũ, chỉ đánh "Có script").

## 10. Câu gọi mẫu
```text
Dùng $invention-script-writer. Viết tập "How you invented <đồ vật>" từ topic <ID> (outline đính kèm), 34 s, hook kiểu F, xuất loi_doc.txt + KICH_BAN.md + QA.
Dùng $invention-script-writer. Chỉ cho 3 hook + kết đi cặp cho đồ vật <X>.
Dùng $invention-script-writer. Sửa nhịp script này cho "so you" đầu tiên trước 3 s và kết gọi lại hook; giữ chuỗi bộ phận.
```
