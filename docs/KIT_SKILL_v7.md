---
name: "ricks-clips-3d-shorts"
description: "Sản xuất video dọc 3D kể chuyện 34–78s phong cách Ricks Clips (nhân vật đầu tròn toon, camera luôn chuyển động, chữ từng từ) theo Style Bible 18 video mẫu: kịch bản → voice SonicVoice → shot list → dựng → Kdenlive → QA đo được."
---

# Ricks Clips – quy trình video dọc kể chuyện (34–78 s)

Tài liệu gốc của skill này là **Style Bible** (tổng hợp 18 video mẫu, 2026-10-29):
- KIT: `RickClips_KIT/references/STYLE_BIBLE.md` + `per_video/V01–V18.md` + `metrics/summary.csv` + `scripts/` (kịch bản gốc) + `VERIFICATION_2026-10-29.md` (mục nào đã/chưa xác minh).
- Project claude.ai "RickClips": `claude/rickclips_style_bible.md`, `claude/rickclips_sample_breakdowns.md`, `claude/rickclips_verification_2026-10-29.md` (đọc bằng Projects tool `project_read`).
Skill nêu quy tắc làm việc; Style Bible chứa bằng chứng (mốc thời gian từng video). Khi hai nơi lệch nhau, số đo trong Style Bible thắng.
Ký hiệu: [QS] quan sát/đo được trên mẫu; [SL] suy luận; [CHỌN] quyết định của kênh khi thiếu dữ liệu gốc (có căn cứ đo, không khẳng định là cách kênh gốc làm). Chủ kênh đã xác nhận không có thêm dữ liệu gốc (font, nhạc, phần mềm) → dùng các mục [CHỌN], không hỏi lại.

## 0. Kiểm tra môi trường TRƯỚC KHI làm (bắt buộc)
Không mặc định là chạy được. Kiểm tra và báo người dùng chính xác cái gì làm được ở đâu:
- Có `mcp__remote-devices__device_bash` (máy người dùng đã liên kết)? → chạy trên máy họ: `python --version`, `ffmpeg -version`, `blender --version`, `melt --version`, `nvidia-smi`.
- Máy chủ đám mây (đã kiểm 2026-10-29):
  - `sonicvoice.pro` truy cập được (`www.` bị chặn): `curl -sS -m 15 -o /dev/null -w '%{http_code}' https://sonicvoice.pro/api/v1/models` → 200.
  - Bị chặn: link nghe thử giọng (storage.googleapis.com, elevenlabs), HuggingFace (faster-whisper cài được nhưng không tải được model).
  - ASR offline CHẠY ĐƯỢC: `pip install --break-system-packages pocketsphinx` (model tiếng Anh có sẵn trong gói) → `tools/analysis/asr_pocketsphinx.py`; chính xác ~60% trên lời có nhạc nền → dùng để đối chiếu kịch bản/đo nhịp, không làm bản chép chuẩn. Trọng số whisper/vosk/demucs không tải được.
  - Không có GPU/Blender. `melt` CÀI ĐƯỢC: `apt-get update && apt-get install -y melt` → dùng kiểm chứng file .kdenlive.
  - Có OpenCV, tesseract, Playwright/Chromium, numpy/scipy (OpenCV không giải được AV1 → chuyển video mẫu sang H.264 trước khi đo). Font phụ đề nằm trong KIT: `fonts/WorkSans-latin-800.ttf` (luôn truyền `fontsdir`); Kdenlive trên máy người dùng: cài font này vào hệ thống. `pip install librosa` chạy được (đo nhạc).
  - 2 CPU: engine three.js render bản giao (siêu lấy mẫu 2×, mục 7) ~19 s/khung/tiến trình → video 50 s ≈ 4 giờ với 2 tiến trình; xem nhanh `SS=1` ~5 s/khung. Chạy nền bằng công cụ chạy nền (timeout tối đa 2 giờ/lệnh; hết giờ thì chạy lại cùng lệnh, `render.js` bỏ qua khung đã có), không dùng `&` trần; không `pkill -f` trùng chuỗi lệnh của chính shell. Khi một nửa xong sớm, mở thêm tiến trình cho nửa sau của đoạn còn lại. Không chạy việc nặng khác song song với render.
- Không có plugin Kdenlive: điều khiển gián tiếp bằng file MLT XML + `melt` (mục 9).
- Kho SFX **EditorNghiepDu** (MCP `editornghiepdu-sfx`, chạy trên máy người dùng đã liên kết): gọi `sfx_status` đầu tiên; có Trial/All-Access → dùng thư viện này cho SFX (mục 9.2). Không có → `audio_kit.py`.
- **Magnific (connector MCP `mcp__Magnific__*`, đã kết nối 2026-10-30)**: dùng cho nền vẽ tay, texture, nhạc nền. Quy trình + prompt mẫu + cách lấy file: `production/magnific_backgrounds.md` (tóm tắt mục 7). Kiểm `account_balance` trước; `simulate_cost` cho việc lớn.
- API tạo ảnh gọi thẳng (kiểm 2026-10-30): máy chủ chặn `api.openai.com`, `generativelanguage.googleapis.com`, `api.magnific.com`/`api.freepik.com` (proxy 403); gọi `fetch` từ trình duyệt trên máy người dùng bị CORS chặn. Khóa API Magnific vì vậy KHÔNG dùng được từ phiên này nếu không có `device_bash`. Đường khả thi (đang dùng): connector **Magnific MCP** `https://mcp.magnific.com` (OAuth, thêm ở claude.ai → Customize → Connectors → Add custom connector; có `images_generate`, `images_models_list`, upscale, relight…). Tên model trong connector: Nano Banana 2.1 = `imagen-nano-banana-2-1`; GPT 2.5 = `gpt-2-mini` (flare/sunburst). Ảnh AI chỉ giúp khâu TẠO ẢNH (nền vẽ tay, texture, sheet tham chiếu); không sửa camera/animation; Magnific upscale từng khung video gây nhấp nháy.
- Thiếu khả năng thì nói rõ giới hạn + phương án thay thế, KHÔNG khẳng định đã làm.

Tập mẫu đầy đủ (kịch bản, shot list, mốc từ, phụ đề, cue SFX, lệnh từng bước): `RickClips_KIT/examples/N02_Eiffel/README.md`. Cài môi trường phiên mới: `bash RickClips_KIT/setup.sh`.

## 1. Quy tắc cứng (đo trên 18/18 mẫu) [QS]
| Hạng mục | Chuẩn |
|---|---|
| Định dạng | 720×1280 (cả 18 mẫu gốc đều 720×1280 AV1), 30 fps |
| Thời lượng | 34–78 s; trung vị 57 s. Khoa học 1 ý: 34–47 s; truyện: 56–66 s; truyện cảm xúc tới 78 s |
| Loudness | −14 LUFS (chấp nhận −15,5), true peak ≤ −1 dBTP; **mix gần mono** (Side thấp hơn Mid ≥ 20 dB) |
| Máy | đứng yên ≤ 2% (trung vị 1,5%); đẩy vào ~40%, lùi ~15%, lia/trượt ~20%, ngửa/cẩu ~20%; đổi kiểu chuyển động mỗi ~1 s (p90 2,5 s); đẩy vào ~10–15%/s; cú máy nhanh có nhòe ~10 lần/phút |
| Chuyển cảnh | **cắt cứng hiếm**: 6 cắt ở 5/18 mẫu, tối đa 2/video, 13/18 không có (đã xem từng khung); đổi cảnh chủ yếu bằng **hòa hình 6–8 khung (mặc định 7 = 0,23 s)**, cú máy nhòe, đẩy xuyên vật/màn hình, lóa trắng, iris; ≈1 chuyển cảnh mỗi 4–6 s |
| Phụ đề | trắng viền đen, căn giữa, **chân chữ y = 71,7% chiều cao**, chữ cao ≈ 2,7% chiều cao (35 px @1280); 1 từ ~70%, 2 từ ~27%, ≥3 từ ~4%; mỗi lần hiện ~0,3 s |
| Giọng | 1 người đọc nam trẻ năng lượng (F0 ~180–215 Hz), liền mạch từ ~0,1 s tới hết video, nghỉ câu ≤ 0,3 s, **208–244 từ/phút (trung vị ~223)** đo trên 18 kịch bản |
| Nhạc | **không nhịp trống** (16/18), **giọng thứ** (D minor 11/18), mỗi video một nền riêng, thảm âm liên tục; nghe giữa câu ở **−16 dB** so với lời (dải −13,4…−18,1); nhấn trầm ở điểm nhấn, tiếng sáng cao tần ở lúc lóe/cú máy [QS]. Tên nhạc/SFX gốc chưa biết → nhạc Magnific hoặc `audio_kit.py`, SFX kho EditorNghiepDu [CHỌN] |
| Độ nét / màu | **nét gần như toàn khung**: tỉ lệ chi tiết mịn trung vị 0,88–0,93 (`sharpness.py`); bão hòa trung vị 65–133; không DOF làm mờ nền rõ rệt |

## 2. Đầu vào cần có
- Chủ đề hoặc kịch bản; ngôn ngữ; voice (mặc định: giọng nhân bản RickClips, mục 4).
- Kịch bản 18 mẫu ở `references/scripts/` (16 bản chủ kênh + V1, V6 tái dựng từ phụ đề + ASR, từ trong [ ] là suy ra) — dùng làm mẫu giọng văn.
- Chủ kênh muốn: tránh chuyện ở Việt Nam, ưu tiên chuyện nổi tiếng thế giới; chọn chuyện hài hước/trớ trêu (Style Bible §11.4), không kể lại đơn thuần. Hình phải nét, màu dịu không chói.
- Thiết kế nhân vật: ưu tiên SHEET của chủ kênh (mục 6.4); nếu không có, dùng thiết kế chuẩn mục 6.
- Nhạc/SFX: nhạc nền mặc định Magnific (mục 9.2), dự phòng `production/audio_kit.py`; SFX mặc định kho EditorNghiepDu (mục 9.2); nếu chủ kênh gửi nhạc/SFX có quyền dùng thì ưu tiên file đó.
- Mức tự chủ: tự quyết hay duyệt kịch bản/shot list trước.

## 3. Kịch bản (Style Bible §11)
### 3.1 Hook 0–4 s — chọn 1 trong 6 kiểu [QS, câu lấy từ kịch bản gốc]
1. **Nghịch lý**: "Gambling is illegal in Japan. Yet there's a gambling hall on almost every street." (V1), "A blacksmith sold a spear that could pierce anything to one king and a shield that nothing could pierce to his worst enemy." (V4)
2. **Nhân vật + hành vi lạ** (phổ biến nhất, 8/18): "He sold his happiest memory to a stranger behind a counter." (V3), "A man snuck into a family's house every night and moved every single thing one inch to the left." (V10), "They buried a man alive with a bell tied to his finger." (V18), "A knight paid a priest to forgive a crime he hadn't committed yet." (V13)
3. **Quy tắc bí ẩn**: "The fastest gun in the West had one rule: never draw first." (V9), "There's a button in the middle of town, and nobody's allowed to press it." (V7)
4. **"Nếu bạn…"**: "If you fall asleep holding two steel balls, you might wake up a genius." (V12), "If you ever fake a number, there's a way to tell a human made it up." (V15)
5. **Câu hỏi trực tiếp**: "How do painkillers know where the pain is? You swallow one for a headache, and then what?" (V14)
6. **Thách đố trực quan**: "Look at these two scratch cards. One's a winner and one's garbage." (V5)
Câu hook: trung vị 13 từ (mẫu 6–25; dài hơn khi có lời thoại trích), mặc định 10–16 từ; có 1 hình ảnh cụ thể dựng được ngay ở khung 0.

### 3.2 Bốn khuôn truyện [QS]
| Khuôn | Nhịp | Mẫu |
|---|---|---|
| Nghịch lý → cơ chế | nghịch lý → đi theo 1 người qua quy trình → "You see," → cơ chế → chốt mỉa | V1, V6, V4, V15 |
| Mưu mẹo có twist | kẻ thông minh làm điều lạ → bị cười/nghi → kế hoạch thành → **lật ở 75–90% thời lượng** → chốt vòng về đầu | V2, V5, V10, V11, V13, V18 |
| Khoa học ngôi thứ 2 | "If you…/You…" → thí nghiệm vui → ẩn dụ không gian giải thích → ứng dụng/câu hỏi | V12, V14, V16, V17, V9 |
| Hư cấu luật lạ | thế giới có luật lạ → nhân vật phá luật → cái giá → kết đắng/mở | V3, V7 |
- Cụm chuyển ý: **"You see,"** (11/16 kịch bản; đặt ngay sau hook hoặc trước cơ chế) · câu cuối mở bằng "So…/And that's how…" (7/16) · "Here's the (creepy) part" · "Normally… But…" · "Then…" · "So…".
- Câu chốt ≤ 6 từ, mỉa/đảo vai, hay dùng "nobody / anymore / all hers": "Nobody gambled." (V1), "nobody's laughing anymore." (V11); hoặc câu hỏi thẳng người xem ("So… sign up?" V17). Cảnh cuối vòng về bối cảnh/vật mở đầu.
- Viết: câu ngắn, động từ mạnh, mỗi câu ra ≥ 1 hành động thấy được; cứ 6–8 s có 1 phản ứng cảm xúc; thoại nhân vật ngắn chèn trong lời kể ("Sorry, not a winner." "After you.").
- Độ dài lời theo nhịp mẫu (trung vị ~223 từ/phút): 30 s ≈ 105–115 từ; 45 s ≈ 160–170; 60 s ≈ 215–230. Nhịp thật của giọng clone đo sau lần tạo đầu (mục 4).
- Số: viết số bằng chữ trong lời đọc khi người kể nói chữ ("a hundred"), nhưng phụ đề hiện chữ số ("100", "10,000") như mẫu V4.
- Sự thật/hư cấu: chuyện có thật → tra nguồn, giữ đúng năm/số liệu/sự kiện cốt lõi, ghi phần kịch tính hóa vào `meta.json`; hư cấu → không gắn tên người thật; giai thoại → nói "legend says"/"rumored".

## 4. Voice (SonicVoice)
API: base `https://sonicvoice.pro/api` (không www), header `X-API-Key`, BẮT BUỘC User-Agent riêng (urllib mặc định bị Cloudflare chặn 403). Khóa trong `~/.secrets/sonicvoice_key` (chmod 600) + biến `SONICVOICE_API_KEY`; không ghi khóa vào skill/bộ nhớ. (Khóa dịch vụ khác người dùng gửi, vd Magnific: cũng chỉ lưu `~/.secrets/<tên>_key` chmod 600.)
Luồng: `POST /v1/tts/jobs` → poll `GET /v1/tts/jobs/{id}` tới `succeeded` → tải `/audio` (WAV) + `/srt` (SRT theo cụm 1–3 s). Lỗi 5xx khi poll: thử lại.

**Giọng nhân bản của chủ kênh (mặc định)**:
- Liệt kê: `GET /v1/voices/mine/clones` (không nằm trong `/v1/voices`).
- `RickClips` = `uv_1883_936c76a0be06` (nam, EN, nhân bản từ audio video mẫu). Clone khác: `uv_1883_be901a000474`.
- Chạy với `provider=mini` (MiniMax), `language=English`. Nhịp phụ thuộc kịch bản: câu test 76 từ = 21,0 s (~217 từ/phút) ở speed 1.0, nhưng kịch bản N02 (173 từ) ra 178 từ/phút ở 1.0 → **đo nhịp sau lần tạo đầu; ngoài 208–244 từ/phút thì tạo lại với speed 1.1–1.2** (N02: 1.2 → 211 từ/phút, 48,7 s, vẫn tự nhiên). Nghỉ câu 0,26–0,30 s.
Dự phòng thư viện: Alex `yl2ZDV1MzN4HbQJbMihG` (ElevenLabs eleven_v3, speed giới hạn 0.7–1.2; speed 1.0 ≈ 180–200 từ/phút, 1.2 ≈ 215). Đã thử và chậm hơn mẫu: Liam `VCgLBmBjldJmfphyB8sZ`, Drew `q0IMILNRPxOgtBTS4taI`, Marcus `y0s2ExEMuum3muUnA6Zd`. Chi phí: ElevenLabs ×1,5 ký tự, MiniMax ×1. Thẻ ngắt nghỉ: `<#0.3#>`. Tiếng Việt: `provider=mini`, `language=Vietnamese`. Tìm giọng: `GET /v1/voices?provider=…&language=en&gender=male` (mã ngắn `en`/`vi`); không nghe thử được → tạo câu test ~90 ký tự với 3–4 giọng rồi đo nhịp.

Lệnh (Phụ lục A):
```
python sonicvoice_tts.py tts script.txt --voice uv_1883_936c76a0be06 --provider mini --language English --speed 1.2 --out voice
```
Hậu kỳ (`clean`): mono TRƯỚC khi đo; highpass (80 Hz trong script; mẫu cho thấy giọng ít năng lượng dưới ~300 Hz và đậm 1–2,5 kHz [QS phổ] → có thể nâng highpass 120–150 Hz + presence nhẹ 2–3 kHz [SL]); de-ess nhẹ; −16 LUFS + limiter.
Mốc từng từ: **căn cưỡng bức (forced alignment) bằng pocketsphinx** khi đã biết kịch bản: `Decoder.set_align_text(<lời đã viết số thành chữ>)` trên voice 16 kHz → mốc từng từ khớp khoảng lặng (`engine_v3/align_ps.py`; số như 1925 phải viết thành chữ trong văn bản căn). Đây là cách mặc định. Dự phòng: `silencedetect` + chia theo âm tiết (`production/align.py`, ±0,1 s). Có faster-whisper + model thì dùng `word_timestamps=True`.
Kiểm: không lặng bất thường, không cắt cụt, đúng thời lượng, −16 ±0,5 LUFS. Xuất `voice_preview.mp4` (nền màu + chữ từng từ) để người dùng duyệt nhịp/phát âm.
Không gọi được API: người dùng tạo voice trên studio web, tải WAV + SRT, đính kèm → chạy `clean` (chỉ cần ffmpeg).

## 5. Shot list
Trường mỗi shot: id, start, end, vo, set, action, shot, camera, light, sfx, trans, **tech** (mã T01–T24 Style Bible §14). Kèm khối `characters` cố định.
- Mỗi cụm lời (1–3 s) có hình mới; danh từ/động từ chính có hình tương ứng ±0,15 s.
- Hook: hình lạ nhất, máy đã chuyển động ở khung 0.
- Xen kẽ cỡ cảnh toàn → trung → cận chi tiết; không để 2 shot liền cùng cỡ và cùng góc. Cắt ở ranh giới cụm từ, không giữa từ.
- Mỗi video dùng ≥ 2 kỹ thuật "vật kể chuyện" T01–T04 (tài liệu cận đọc được, bộ đếm, thước đo, số liệu bằng vật).
- Mô-típ vật lặp (T23) để kết vòng: vật/bối cảnh mở đầu xuất hiện lại ở cảnh cuối.
- Bản đồ chức năng (Style Bible §12): Hook → hình lạ + máy chạy · Bối cảnh → biển hiệu + cẩu lộ quy mô · Đám đông → trượt ngang + cười · Leo thang → bộ đếm tăng, đẩy nhanh dần · "You see," → đẩy xuyên vào vật/ẩn dụ không gian · Lật mặt → cận sốc, đổi ánh sáng · Chốt → đẩy chậm (hoặc lùi chậm lộ toàn cảnh), giữ ≥ 1 s.

Thư viện kỹ thuật (chi tiết + ví dụ có mốc giờ trong Style Bible §3.3, §5, §14):
T01 insert top-down tài liệu đọc được · T02 bộ đếm/bảng lật số · T03 thước đo cụ thể hóa số · T04 số liệu bằng chồng vật · T05 phòng điều khiển trong đầu (cửa sổ tròn = mắt) · T06 khái niệm = ngôi nhà/không gian · T07 mặt cắt địa tầng/lòng đất · T08 X-quang trong suốt · T09 khung đen + vòng sáng (suy nghĩ thầm) · T10 cảnh mơ đổi bảng màu neon · T11 lóa trắng · T12 iris tròn · T13 đẩy xuyên màn hình/cửa/vật · T14 POV khung tròn (mắt mèo, ống nhòm, kính lúp, ống ngắm) · T15 cẩu cực cao lộ quy mô · T16 đổi giờ trong khung giữ · T17 vật bay slow-mo · T18 gag nghĩa đen · T19 vật biến mất theo chữ · T20 đối xứng 2 phe màu đối lập · T21 tia năng lượng + lắc máy · T22 vật chĩa thẳng ống kính · T23 vật lặp & kết vòng · T24 nhãn thuật ngữ trong cảnh.

## 5b. Chuyển lời thành HÀNH ĐỘNG (ưu tiên số 1)
1. Với mỗi câu: chữ mốc → AI → LÀM GÌ với VẬT GÌ → KẾT QUẢ thấy được → máy từ đâu tới đâu. Mỗi động từ có khoảnh khắc trên hình (±0,15 s). Ví dụ mẫu: "smash" → bi đập đĩa + vòng sóng (V12@16s); "tucking it" → nhét vé vào ví (V2@14s); "slides" → token trượt qua ô cửa (V1@42s).
2. Người làm việc với vật — vật không tự di chuyển. Chữ/thẻ trên màn hình KHÔNG thay hành động. Chuỗi hành động đủ bước (vd "nạp đạn rồi bắn vào tàu": kéo pháo → thông nòng → đẩy ra → châm ngòi → pháo giật, lửa đầu nòng → máy bám đạn → tàu thủng rung).
   - Tư thế có đối tượng (thông nòng, châm ngòi, bịt tai, né, ngã, xúc, cầm kẹp); dụng cụ cầm tay đủ dày (que ≥ 7% chiều cao đầu); thẻ 2D xoay ≤ 25° và đủ rộng cho tay/dụng cụ đưa ngang; nhân vật quay lưng về máy dùng `back: true` (không vẽ mặt).
   - Tay/vật không che chữ cần đọc (vd tay cầm phong bì ở mép, không đặt giữa dòng số).
3. Biểu cảm đổi đúng chữ, có thể 2–3 lần trong 1 khung giữ (V5@14–16s "celebrating → normal → suspicious").
4. Gag nghĩa đen khi lời cho phép (T18: não trong lọ bơm oxy ở trạm "AIR & WATER", V17@9s).
5. Khung dọc hẹp: ngang thấy ≈ ±0,2 × khoảng cách (fov 40°); 3 người đứng ngang cần fov 50–52° hoặc lùi xa; xếp người so le theo chiều sâu. Biển/chữ cần đọc phải nằm trọn trong khung (cột/khung giá đặt sau mặt chữ).
6. Trước render đủ: xuất khung đầu/giữa/cuối mỗi shot, hỏi "nghe chữ X có thấy hành động X?". Sau render: mỗi giây rút 2 khung, đặt cạnh mẫu cùng ý, lập bảng Đạt/Không đạt — còn Không đạt thì chưa giao.

## 5c. Máy quay
Số đo 18 mẫu ở mục 1. Bảng kiểu máy chi tiết (đo tay 207 đoạn trên 8 mẫu, bản trước): đẩy vào ~8–12%/s gần mọi câu; trượt ngang dài 2,7 s (tới 7 s) nối nhiều nhịp trên 1 đường; lùi/lùi+nâng 2,3 s lộ quy mô; vòng quanh 3,6 s cho vật anh hùng; từ trên xuống 1,9 s cho tay làm việc với vật; hạ/ngửa/chúc 1,2–1,6 s theo vật dọc; đẩy xuyên 1,6 s; bám vật bay/đi theo 0,6–3 s; cận cực đại 0,8–2,7 s cho gag.
Quy tắc:
- Mỗi shot 1 đường máy liên tục; nội suy bằng spline đơn điệu (Hermite Fritsch–Carlson), không Catmull-Rom (vọt quá mốc, quay ra trời).
- "Giữ khung" = đẩy rất chậm, không đứng yên. Nhấn một chữ: đẩy nhanh nhưng **mọi cú máy nhanh phải có dạng chuông tăng-giảm tốc rộng ≥ 0,45 s (FWHM)**. Đo 4 mẫu bằng optical flow: FWHM trung vị 0,32–0,98 s, chỉ 14–29% cú máy < 0,3 s; bản N02 đầu có 59% < 0,3 s → người xem thấy giật ở các cú rộng→cận. Lia cực nhanh (<1%) chỉ khi đổi thời đại.
- Engine v3/v4 (`core.js`): `setCam` = spline đơn điệu + **làm mượt Gaussian theo thời gian σ = 0,2 s** + ngoại suy tuyến tính ngoài mốc đầu/cuối (đầu shot đã chạy, cuối shot giữ đà qua hòa hình; KHÔNG để vận tốc 0 ở mốc đầu/cuối). Cú bay rộng→cận/cận→rộng trong cùng phòng: đặt mốc cách nhau 0,8–1,0 s, không 0,3–0,55 s.
- Đo trước khi render đủ: `node engine_v4/camprobe.js 0.2 cam.json` (tốc độ màn hình từng khung, không render) → `python3 tools/analysis/camanal.py cam.json`: không đỉnh nào FWHM < 0,3 s. Sau render: `tools/analysis/flowprof.py` trên video và mẫu cùng thang (180×320).
- Cảnh nền trơn (khung đen suy nghĩ, trời) làm bộ đo optical flow thấy "đứng yên" dù máy có đẩy → đẩy mạnh hơn (~5–8%/s) và/hoặc trượt ngang nhẹ ở các cảnh này.
- Đặt máy bằng hàm tính khung `aim(points, {az, el, k, pad})` (mọi điểm cần thấy nằm gọn khung dọc; mỗi đầu kèm bán kính ~0,48; `k < 1` để đẩy vào) thay vì gõ tọa độ tay.
- Ngữ pháp khung [QS]: top-down cho vật trên mặt phẳng; một điểm tụ dọc hành lang; đối xứng cho đối đầu; cẩu cực cao lộ quy mô; khung-trong-khung (T14); tiền cảnh che 1 phần (vai, chén, song sắt); vật chĩa ống kính (T22).
- Không thay chuyển động máy thật bằng zoom/lia ảnh tĩnh.

## 5d. Chuyển cảnh [QS]
- Cắt cứng: tối đa 2/video (mẫu: 6 cắt ở 5/18 video). Chỉ dùng cho (a) ngoài → trong cùng địa điểm sau cú đẩy vào/cảnh giữ yên (V4@28,0 s lò rèn; V15@14,3 s tòa nhà → thang máy), (b) nhảy hành động cùng nhân vật (V14@2,17 s), (c) nhịp liệt kê nhanh (V16@23,7 / 35,9 s). Không cắt trong 3 s cuối. (Lật trang lịch lớn bị `cuts3.py` báo nhầm là cắt — xem khung để xác nhận.)
- Cùng không gian → **máy bay liền** 0,6–1,0 s tăng-giảm tốc (bản cũ ghi 0,25–0,5 s → giật; xem 5c), nhòe chuyển động lúc nhanh nhất (`via` né vật cản, không xa hơn đích; diễn viên shot trước mang theo trong lúc bay).
- Đổi nơi/thời gian → **hòa hình 7 khung (0,23 s; mẫu đo 6–8 khung)** (shot trước có khung dư và vẫn đang chuyển động), hoặc cú máy nhòe xuyên qua vật. Đổi sang/ra góc ống nhòm/ống kính: hòa 1–2 khung + mặt nạ tròn (V11@18–20 s).
- Vào không gian kín/màn hình/vật → đẩy xuyên (T13): shot trước đẩy vào khe/màn hình, shot sau bắt đầu bên trong và tiếp tục đẩy.
- Vào đầu/ký ức/giấc mơ → iris tròn (T12) hoặc lóa trắng (T11).
- Soát trước render đủ: render 0,6 s đầu các shot có chuyển cảnh ở scale thấp, ghép khung cuối shot trước + đầu shot sau; sửa đường bay xuyên đầu người/vật hoặc vọt quá đích. 30 fps như mẫu (24 fps trông giật).
- Nhòe chuyển động: ước lượng px/khung = (góc quay + dịch chuyển/khoảng cách tới điểm nhìn) × px/rad; < 4 px → 1 khung (nét hoàn toàn); ≥ 4 px → số khung con = ceil(px/3), tối đa 12 (`renderAt(t, 12)`), trải đều trong màn trập 0,5 khung. Khung con giữa render đủ hậu kỳ ở độ phân giải đầy đủ; các khung con còn lại render thô ở nửa độ phân giải rồi chỉnh màu 2D cho khớp (`GRADE_CSS` + lớp vignette trong `main.js`, hiệu chỉnh bằng `window.__gradeTest(t)`: lệch độ sáng ≤ 3%) — nhanh hơn ~2,5× so với chạy hậu kỳ cho mọi khung con. `window.__blurPx(t)` cho px nhòe từng khung để ước thời gian render. **Không giới hạn 3 khung con**: cú lia nhanh với 3 khung ra 3 hình rời (chữ lặp, viền đúp — lỗi N02 v4).

## 6. Nhân vật (Style Bible §2)
- Tỉ lệ đứng, máy ngang (đo pixel 5 nhân vật / 4 video): **đầu 30–34% (dựng 32%), thân viên nhộng ~30%, chân ~38%**; máy nhìn từ trên làm chân ngắn còn ~25% — đó là phối cảnh, không đổi mô hình. Bộ ảnh toàn thân người dùng gửi là AI tái tạo: dùng cho trang phục/phụ kiện/dáng, không dùng làm chuẩn tỉ lệ hay kiểu render.
- Đầu **trắng** (#fdfdfb), gần tròn, rộng hơn cao một chút, **méo nhẹ có chủ đích** (biên độ 2–3%, mỗi nhân vật một kiểu, cằm phẳng hơn một bên); bóng đổ cel xanh xám ở góc dưới phải + loang nhẹ. **Viền xanh đen (#1b1e2e) dày ~5–6% bán kính đầu, biến thiên**: dày hơn phía khuất sáng (dưới-phải), mảnh phía sáng, rung nhẹ dọc nét (`inkFill` trong `chars2.js`). (Bản cũ: đầu kem, viền nâu đều → người dùng chê "quá tròn, quá trơn".)
- Mặt nhỏ, nằm giữa-thấp: **mắt chấm đen bầu dục** (không tròng trắng) có điểm sáng; tỉnh bơ = vạch mí ngang dày cắt phần trên con ngươi; mày = thanh ngắn dày; miệng nhỏ 1 nét; cười = miệng chữ D răng trắng chia vạch; sốc/tham = mắt trắng tròn + con ngươi nhỏ (hoặc ký hiệu tiền). Kính tròn mảnh quanh mắt chấm.
- Thân **con nhộng hẹp** (rộng ≈ 50–55% đầu), mép trên bo vuông, bụng phình theo `belly`; màu đặc + mảng tối cel bên phải + vệt sáng mờ bên trái; viền biến thiên. Tay chân = **"sợi mì" xanh đen đặc** (#23263b) dày ~4–4,5% chiều cao, thuôn nhẹ, cong mềm (Chaikin), đầu tay tròn cùng màu (không găng trắng); giày nhỏ tối có viền. Tay cảnh nhìn từ trên xuống cũng là sợi mì tối đầu tròn.
- Nhận dạng bằng tóc/mũ; màu theo vai: người thường = 1 màu tươi; công quyền = navy/đen + mũ/huy hiệu; phản diện = đen, trùm mũ/kính râm, cười nhe răng; chuyên gia = blouse trắng + kính tròn; 2 phe = 2 màu đối lập nhất quán trên mọi vật.
- Nhân vật lịch sử có thật vẽ cùng khuôn (Edison V12). Giữ nguyên thiết kế suốt video, kể cả cảnh hồi tưởng.
- Trang phục theo thời đại/nghề (áo choàng + tóc giả rắc phấn, váy xòe + búi cao, mũ hai sừng + cầu vai, khăn xếp + râu, mũ chóp cao, mũ trùm, giáp…) — thêm spec mới thay vì dùng lại sai bối cảnh.
- Mắt: nửa khép = tỉnh bơ; nghiêng mí = giận/buồn; sốc = mắt to tròn con ngươi nhỏ; sợ = con ngươi rung; ngất = mắt xoắn ốc; chỉ khi cười mới dùng mắt híp (>< hoặc ^^).
- Mỗi nhân vật trong khung đang LÀM gì đó (nói: miệng mấp máy + tay chỉ; sốc: mắt tròn con ngươi nhỏ + mồ hôi; cười: híp + răng; kiêu: chống nạnh; giận: mày V, chỉ tay). Lính cầm vũ khí, người làm việc cầm dụng cụ.
- Hiệu ứng phản ứng (bắt buộc cho câu có cảm xúc, ±0,15 s — ít nhất 1 hiệu ứng trên mặt + 1 dấu quanh đầu hoặc trên màn hình): cười lăn = 2 dòng nước mắt + vạch rung + rung người; giật mình = mắt tròn + mồ hôi văng + tia quanh đầu + tia manga toàn màn hình + rung máy + whoosh; lo = mồ hôi + miệng lượn sóng; mồ hôi, nước mắt, vạch đau đỏ quanh đầu (V14@1s), tia năng lượng vàng + lắc máy (V9@15s), "Z" ngủ, "? ? ?" trôi, vòng sóng âm, gân giận, đỏ mặt, mắt xoắn ốc.

### 6.4 Theo SHEET của chủ kênh
- Cắt từng nhân vật/vật ra nền trong suốt, kiểm tên bằng mắt. Nhân vật: xóa nét mặt vẽ sẵn, engine vẽ lại mặt động đúng nét sheet. Sprite nhỏ: phóng 4× Lanczos + làm nét, báo người dùng nếu cận mặt còn mềm. Bối cảnh/phụ kiện từ sheet: mẫu màu/hình cho dựng 3D; chỉ dùng trực tiếp làm chèn 2D cho cận cảnh nhìn thẳng.

## 7. Bối cảnh, đạo cụ, ánh sáng (Style Bible §3–4)
- Biến thể render — chọn 1, giữ suốt video: **A. 3D tô mềm (mặc định, 16/18 mẫu)**: khối 3D, ánh sáng có hướng + bóng đổ, texture vẽ tay, KHÔNG viền mực trên kiến trúc/địa hình; đạo cụ cầm tay/anh hùng được viền mảnh. B. Cel phẳng viền mực toàn cảnh (V6). C. Pastel hạt phim + vignette (V17).
- Dày chi tiết, biển hiệu tiếng Anh đọc được ngay ("PRIZE HALL", "OUR WINNERS", "BAIT · GAS"); nước ngoài thêm chữ bản xứ. Mỗi bối cảnh 1 màu chủ đạo dễ nhớ. Ưu tiên dễ đọc + đẹp hơn chính xác lịch sử.
- Đạo cụ chính: 3 lớp chi tiết (khối, viền/đai, chi tiết nhỏ), chất liệu đúng, bộ phận động có tên, vật rỗng thì rỗng, lỗ vỡ răng cưa, tỉ lệ đúng; đồ trang trí không chắn hành động.
- Thông tin luôn nằm TRÊN VẬT trong cảnh (giấy, biển, màn hình, bảng đen), không làm thẻ chữ đè hình. Chữ trên biển/lịch: cỡ chữ theo số ký tự (đo `measureText`), không tràn mép.
- Ánh sáng kể chuyện: ngày trời xanh mây trắng bóng rõ · nội thất ấm, nắng xiên thành mảng · đêm xanh/tím + cửa sổ vàng, đường ướt phản chiếu · bí mật = 1 nguồn sáng duy nhất dẫn mắt · suy nghĩ thầm = khung đen + vòng sáng · mơ = neon tím-hồng · ký ức đẹp = hoàng hôn vàng · mất mát = xanh lạnh (1 bên ấm 1 bên lạnh) · trong cơ thể = đỏ-hồng · cao trào = đổi màu toàn cảnh · thời gian trôi = đổi giờ trong khung giữ.
- Ngoại cảnh không để khối trắng trơn/cháy sáng; tấm nền vẽ đặt xa hơn mọi vị trí máy; sương nhẹ tạo chiều sâu; nhiều lớp (tiền cảnh, nhân vật, hậu cảnh).
- Texture vẽ tay: gạch có cạnh sáng/tối, đá lát có vân, vải có nếp; kiến trúc có khối thật (vòm khoét lỗ, cột có đầu cột, màn xếp nếp). Đạo cụ được cận cảnh cần mô hình chi tiết riêng. Bám đúng ảnh bối cảnh chủ kênh gửi.
- **Độ nét là ưu tiên số 1 [QS: mẫu nét gần như toàn khung, tỉ lệ chi tiết mịn 0,88–0,93, đo `sharpness.py`]**. Hậu kỳ engine v4 (`core.js`): RenderPass → N8AO (Low, halfRes, chỉ khung con giữa) → **DOF TẮT mặc định** (`POST.dof = false`) → Bloom rất nhẹ (0,12, ngưỡng 0,96) → HueSaturation **−0,2** → Brightness −0,02 / Contrast +0,06 → Vignette nhẹ (0,4/0,3) → SMAA. Không làm mờ nền bằng DOF; chiều sâu tạo bằng sương xa, ánh sáng, lớp tiền-trung-hậu cảnh.
  - **Siêu lấy mẫu 2×** (bắt buộc cho bản giao): `SS=2 node render.js …` render 1440×2560 rồi thu về 720×1280 (`renderer.setPixelRatio(SS)`, `drawImage(…, WIDTH, HEIGHT)` với `imageSmoothingQuality='high'`). Đo trên N02: chi tiết mịn 0,85 → 0,89 (mẫu 0,92), chậm ~2,8×/khung (đo thật N02: ~19 s/khung/tiến trình → video 50 s ≈ 4 giờ với 2 tiến trình; lệnh nền bị dừng sau 2 giờ → chạy lại cùng lệnh, `render.js` bỏ qua khung đã có; trước khi chạy lại xóa khung JPEG hỏng và chia lại phần còn thiếu theo `__blurPx` để 2 tiến trình xong cùng lúc). **Mất ngữ cảnh WebGL** (SwiftShader ở SS=2 hết bộ nhớ sau vài trăm khung → khung đen rồi các khung sau mất đèn/vật trong suốt, lỗi N02 lần render 2×): `render.js` bản 7 khởi động lại Chromium mỗi 120 khung (`RESTART`) và ngay khi `webglcontextlost`, bỏ khung lỗi và render lại. Sau mỗi lượt render: so từng khung với bản xem trước SS=1 (lệch trung bình > 8/255 ở 90×160 → render lại) và chạy QA đứng hình/khung đen. Xem nhanh: `SS=1`. Không dùng 1,5× (lấy mẫu lẻ còn mềm hơn 1×).
  - Nếu cần DOF cho 1 shot: postprocessing ≥ 6.3x hiểu `focusDistance/focusRange` theo **đơn vị thế giới (m)**, không phải [0,1]; `focalLength` cũ = `focusRange` → `focalLength: 0.035` nghĩa là vùng nét 3,5 cm, làm mờ CẢ KHUNG kể cả nhân vật (lỗi N02 v4: độ nét 27 so với 646 khi tắt). Dùng `worldFocusRange ≥ max(30, 8 × khoảng cách tới điểm nét)`, `bokehScale ≤ 1`, độ phân giải đầy đủ, điểm nét = điểm gần hơn giữa nhân vật và điểm máy nhìn (cận tài liệu → nét vào tài liệu). Đo lại độ nét trước khi render đủ.
  - **Màu không chói** [QS: bão hòa trung vị mẫu 65–133]: tranh Magnific giảm bão hòa ×0,8 trước khi đưa vào engine (giữ bản gốc `orig_*`); đèn spot gần giấy/vật sáng phải hạ (giấy `lam(0xbdb7ab)` thay trắng, đèn bàn 22 thay 30); không bloom lên mặt trắng nhân vật; điểm cháy sáng (V > 245) ≤ ~10% khung.
  - **Không đặt 2 mặt phẳng trùng nhau** (biển, tranh, decal trên tường): cách tường ≥ 0,05 đơn vị về phía máy; camera `near 0.1, far ≤ 1400` (near 0,05 + far 1500 làm sai độ sâu → sọc, chữ vỡ: lỗi biển HÔTEL DE CRILLON N02 v4).
  - Texture có chữ cho cận cảnh: canvas ≥ 1,5× số pixel nó chiếm trên màn hình (vd tài liệu cận toàn khung 900×1200, vẽ bằng `g.scale(1.5,1.5)`), anisotropy 8. Khung xuất JPEG chất lượng 0,97.
- Hậu kỳ engine v3 cũ (`POST.lib = false`, chỉ để tham khảo): DOF tự viết bán kính 7,5 px cũng làm video mờ quá → không dùng.
- **Nền vẽ tay bằng Magnific [CHỌN, đã dùng cho N02]**: mỗi bối cảnh 1 tấm tường sau (+1 tấm tường bên cho phòng lớn), dãy nhà xa (trời xanh lá → tách nền) và texture mặt đất; Nano Banana 2.1, 2k, 16:9 / 21:9 / 1:1; prompt "front elevation view straight-on … Empty, no people, no characters, no text" + đuôi phong cách chung (giữ nhất quán giữa các tấm). Đưa vào engine bằng `imgTex` + `paintedMat` (emissive 0,5–0,6); bỏ cửa sổ/khung 3D trùng tranh, giữ vật 3D có tương tác trước tấm vẽ; chữ đọc được vẫn do engine vẽ. Lấy file: `creations_read hq=medium` (1024 px) hoặc bản gốc qua trình duyệt máy người dùng → Downloads → `device_stage_files` (chi tiết `production/magnific_backgrounds.md`).
- Icon/bong bóng chữ: đám mây có viền biến thiên; chân dung trong đĩa tròn có viền; nhãn chữ nằm trong băng màu, cỡ đo bằng `measureText` để vừa ≤ 470/700 px bề ngang thẻ, lề ≥ 35 px; không để dòng chữ phụ cao < ~14 px ở 720p (đọc không được → bỏ).
- Trước render bản giao: render ảnh tĩnh + đoạn chuyển động ngắn, ghép cạnh khung mẫu, sửa từng điểm lệch rồi mới render đủ.

## 8. Engine dựng
- Có Blender: `blender -b file.blend -P scene_build.py` (script đọc `shot_list.json`; EEVEE, toon Shader-to-RGB + ColorRamp 2–3 bậc, Line Art cho nhân vật/đạo cụ 2–3 px @1080p; tay chân bằng bendy bones/curve bevel; easing Bezier + rung nhẹ Camera Shakify; khẩu hình Rhubarb khi nhân vật nói; motion blur shutter 0.5; PNG 30 fps, dư 8 khung đầu/cuối).
- Không có Blender (máy chủ): engine 2.5D **`RickClips_KIT/engine_v4/`** (v3 giữ để tham khảo) (three.js + Chromium SwiftShader `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`; `SS=2 node render.js out t0 t1 30` Playwright + server http nội bộ, bỏ qua khung đã có để chạy tiếp, tự khởi động lại trình duyệt; `stills.sh name t1,t2,…` ra lưới ảnh tĩnh có vạch vị trí phụ đề; `sheet.html` + `shot.js` xem sheet nhân vật). Cài thư viện: `npm i three@0.170 postprocessing@6.39.5 n8ao@2.0.1 gsap@3.15.0` trong thư mục engine; importmap trong `index.html` trỏ tới `node_modules`. `engine/` cũ là bản demo Spear.
  - Nhân vật = thẻ 2D billboard (xoay trục Y về máy) vẽ lại bằng canvas khi trạng thái đổi (`chars2.js`: TYPES, biểu cảm, items, fx); đổ bóng bằng `customDepthMaterial` alpha; đầu vẽ bằng đường cong tham số 90 điểm có méo + `inkFill` viền biến thiên.
  - Bối cảnh nội thất đặt ở offset x riêng (vd 200, 300…) trong group; vị trí vật trong group là LOCAL, chỉ mốc camera cộng offset (hàm `K(ox, keys)`) — cộng 2 lần làm nhân vật biến mất (lỗi đã gặp).
  - Kim loại: `MeshPhongMaterial` sáng + emissive nhẹ. Shader tự viết: `#include <colorspace_fragment>` trên dòng riêng. Mặt sau vật lật (trang lịch) cần tấm nền riêng để không lộ chữ ngược.
  - Vật/nhãn hiện: `pop(t0, t)` dùng ease GSAP `back.out(3)`; `EASE.slam/settle/io` cho đập, lắc lại, chuyển êm.
  - Đám đông/quân đội: InstancedMesh. Tua ngày-đêm: trộn 3 bộ màu trời + đèn + sao/trăng.
  - Bối cảnh `paris.js`/`rooms.js`/`think.js` là của tập N02 — tập mới dựng bối cảnh mới theo shot list, giữ `core.js` + `chars2.js`.

## 9. Chữ, ráp, mix, Kdenlive
### 9.1 Phụ đề (Style Bible §8)
- ASS, **Work Sans ExtraBold** [CHỌN — khớp hình chữ mẫu tốt nhất trong 89 kiểu chữ: bề rộng 1,005×, cao 1,00× trên 101 từ; tên font gốc chưa biết], Bold=0, trắng, viền đen, bóng nhẹ, căn giữa (Alignment 2). Thông số đã đo với libass: PlayRes 720×1280 → `Fontsize 75, ScaleX 99, Outline 5, Shadow 2.5, MarginV 344`; 1080×1920 → `113, 99, 7.5, 3.75, 516`. Kết quả: chân chữ y = 918 (71,7%), chữ cao 36 px, căn giữa 360. Luôn `subtitles=captions.ass:fontsdir=<KIT>/fonts`; trong project Kdenlive thêm `av.fontsdir` (gen_kdenlive.py đã làm) và chép `fonts/` cạnh `captions.ass`. Đổi font → hiệu chỉnh lại bằng `tools/analysis/caption_calibrate.sh`.
- Gom cụm: 1 từ mặc định; ghép 2–3 từ khi là cụm chức năng + từ ngắn ("sold a", "to one", "for 100", "The two kingdoms"). Mục tiêu 1 từ 55–80%. Số hiện bằng chữ số ("7,000").
- Mỗi cụm giữ tới khi cụm sau hiện; khoảng trống > 0,45 s thì tắt sau 0,2 s. Pop nhẹ `{\fscx88\fscy88\t(0,70,\fscx100\fscy100)}`.
- `engine_v3/captions_n02.py` (từ mốc căn cưỡng bức), `production/captions.py` (từ words.json) hoặc `srt_words.py` (Phụ lục B).
### 9.2 Mix
- **Nhạc theo giọng nội dung**: truyện giải thích hài hước → nền nhẹ, tinh nghịch (pizzicato, bassoon/clarinet, glockenspiel, accordion khi ở Pháp), 90–105 BPM, không trống nặng, không dồn căng, mức đều. Mặc định tạo bằng Magnific `audio_music_generate` (`elevenlabs-music-generation-v2`, instrumental, đúng thời lượng); tạo 2 bản, đo bằng librosa (tempo, độ đều mức to theo từng 2 s, độ sáng phổ) chọn bản đều và sáng hơn; khoảng lặng/ngắt nhịp trong nhạc nên rơi vào câu chốt hài ("Nothing."). Fade cuối 0,8 s.
- Nhạc dự phòng [CHỌN]: `python3 production/audio_kit.py bed --mood mystery|playful|tense|warm|pulse --dur <s> --key D --seed <n> --out music.wav` — tự tổng hợp, không nhịp trống, D minor. Chọn sắc thái: truyện bí ẩn/mưu mẹo → mystery; khoa học vui → playful; cao trào/rùng rợn → tense; kết ấm/cảm động → warm; `pulse` chỉ cho biến thể C. Mỗi video seed khác.
- Mức [CHỌN, đã đo]: voice −16 LUFS; **bed −23 LUFS trước ducking** cho truyện hài (lời rõ: lời cao hơn nhạc ~26 dB khi đang nói; bản cũ −20…−21), `sidechaincompress=threshold=0.03:ratio=4:attack=20:release=300` theo voice; SFX −27…−29 LUFS; cộng 3 stem (`amix normalize=0`) rồi đưa master về −14 LUFS + `alimiter`. Một lệnh: `python3 production/mix_final.py --voice … --music … --sfx sfx_lib.wav --dur <s>` (trong thư mục audio của tập; ra voice_pad / music_ducked / sfx_n / final_mix.wav). Đích đo: sàn khoảng nghỉ −13,5…−18,5 dB (mẫu −16; N02 v4 đo −18,2 — sát mép dưới, muốn nhạc rõ hơn giữa câu thì nâng bed 1–2 dB); sát −13,5 thì hạ bed 1 dB.
- **SFX có chọn lọc (bắt buộc)**: chỉ đặt khi âm thanh làm rõ diễn biến, tạo điểm nhấn hoặc tăng hài: (1) chuyển cảnh lớn (whoosh/flash/iris), (2) hành động vật lý có tác động thấy được (đóng dấu, đập, rơi, tiền), (3) gag/đảo vai (boing, dế kêu "im lặng khó xử"), (4) lóe ý tưởng/lộ ra (ting, sparkle). KHÔNG gắn tiếng cho mọi cử động, bước chân, giấy lật, nhãn hiện. Mật độ ≈ 1 cue / 1,5 s (N02: 93 → 33 cue cho 50 s); hai cue cách nhau ≥ 0,25 s; tiếng cơ khí lặp (bảng lật, lịch) tối đa 3 tiếng; chừa trống quanh câu chốt.
- SFX ưu tiên **kho EditorNghiepDu** khi MCP `editornghiepdu-sfx` có mặt: quy trình + bảng cue→id trong `production/sfx_library/` (README.md, sfx_map.json — 16 cue, 24 file, đã dùng cho N02). `sfx_search` chỉ trả kết quả với **1 từ khóa tiếng Anh** (nhiều từ → 0); `sfx_resolve` (≤ 20 id/lần) tải về cache trên máy người dùng `%APPDATA%\DMT-EDITORNGHIEPDU\sfx-cache` → xin quyền thư mục cache → `device_stage_files` → chuyển mono 48 kHz, cắt lặng đầu vào `audio/sfxlib/` + `map.json` → `python3 production/mix_lib.py <dur>` trong thư mục audio của tập (đặt theo events.json, cắt độ dài theo cue, xoay biến thể, fade 60 ms; thiếu cue thì tổng hợp). Không đóng gói file âm thanh của kho vào KIT; chỉ nằm trong stem `sfx.wav` của tập.
- SFX dự phòng [CHỌN]: `audio_kit.py sfx <dir>` (18 âm) và `audio_kit.py events events.json --dur <s> --out sfx.wav` (mỗi dòng: t, name, gain, args). Bảng hành động → SFX: cú máy nhanh/chuyển cảnh nhòe → whoosh/whoosh_fast; lóe sáng/ý tưởng → ting/sparkle; kim loại → clang; nhấn chữ quan trọng / đóng dấu → thump; sập/động đất → boom; leo thang trước lật → riser; vật/nhãn hiện → pop; gag → boing; chuông/điện báo → bell; giấy/vé → paper; tiền → coins; đám đông cười → crowd_laugh; đêm/im lặng khó xử → crickets; trống trải → wind; lóa trắng → flash; bảng lật số/lịch → flipclick.
- Master −14 LUFS, đỉnh ≤ −1 dBTP, **mono hoặc gần mono**. Xuất: khung → `video_clean.mp4` bằng `-vf unsharp=5:5:0.4:5:5:0 -c:v libx264 -preset slow -tune animation -crf 14`; bản cuối (đốt phụ đề) `-preset slow -tune animation -crf 16`, yuv420p, AAC 192k 48 kHz, 30 fps (`assemble.sh`). Đo N02: CRF 18 veryfast làm mất ~0,015 độ chi tiết mỗi lần nén; unsharp 0,4 đưa 0,867 → 0,897 (mẫu 0,88–0,93) không thấy quầng; 0,7 bắt đầu gắt — không vượt 0,5.
### 9.3 Project Kdenlive
- Xuất stem đã chỉnh mức (voice, music đã duck, sfx) + `video_clean.mp4` + `captions.ass`; `engine_v3/gen_kdenlive.py` sinh project (đường dẫn tương đối `media/`, `av.fontsdir`, gain tổng theo tổng stem đo được). Cách thủ công bằng melt:
  ```
  melt media/video_clean.mp4 -track media/voice.wav -track media/music_ducked.wav -track media/sfx.wav \
    -transition mix a_track=0 b_track=1 always_active=1 sum=1 -transition mix a_track=0 b_track=2 always_active=1 sum=1 -transition mix a_track=0 b_track=3 always_active=1 sum=1 \
    -filter avfilter.subtitles av.filename=media/captions.ass av.fontsdir=media/fonts -filter volume level=1.8 -profile vertical_hd_30 -consumer xml:project.kdenlive
  ```
  rồi sửa `<profile>` đúng kích thước, XÓA `<property name="track">N</property>` trong filter (nếu không phụ đề không hiện, âm lượng chỉ tác động track cuối), thêm `kdenlive:track_name`. Không dùng `<mlt producer="main_bin">` (melt phát bin câm); mix transition `a_track=0`; volume tổng dùng `level` (dB).
- Bắt buộc kiểm: `melt project.kdenlive -consumer avformat:test.mp4` → có phụ đề, thời lượng đúng, âm lượng ≈ −14 LUFS như bản cuối.
- Video/khung hình mẫu chỉ dùng nội bộ để so sánh: KHÔNG đóng gói vào sản phẩm giao.

## 10. QA trước khi giao
1. Tự động: `python3 -I RickClips_KIT/tools/analysis/qa_compare.py final.mp4 qa_out --captions captions.ass` — phải đạt hết 21 mục (định dạng, thời lượng, loudness, mono, máy đứng yên/đẩy/đổi nhịp, cắt cứng ≤ 2/video bằng `cuts3.py`, vị trí/cỡ/căn giữa phụ đề, khoảng lặng, sàn nhạc giữa câu, tỉ lệ phụ đề 1 từ, **độ nét theo tỉ lệ chi tiết mịn (không phụ thuộc cảnh tối/phẳng): trung vị ≥ 0,86, 10% mờ nhất ≥ 0,78; bão hòa ≤ 135** bằng `sharpness.py`; **không đứng hình > 0,5 s, khung đen ≤ 1%**; phương sai Laplacian tuyệt đối chỉ tham khảo vì rèm đỏ tối/mặt bàn phẳng cho số thấp dù nét). Kiểm thiếu khung trước khi ghép (khung thiếu ở ranh giới đoạn render làm ffmpeg cắt video ngắn lại).
1b. **Trước render đủ** (bắt buộc từ bản 7): render ~10 khung khó nhất (cận tài liệu, cận biển chữ, cú lia nhanh, toàn cảnh ngoài trời) bằng `render.js out 0 0 30 t1,t2,…`, đo tỉ lệ chi tiết mịn từng khung (≥ 0,85 với khung không chuyển động nhanh), xem bằng mắt ở 100% (không chỉ ảnh thu nhỏ — ảnh thu nhỏ giấu mờ), kiểm chữ không lặp/không sọc. Không đạt → sửa rồi mới render đủ.
2. Đo camera: `camanal.py` (trước render) / `flowprof.py` (sau render) — không cú máy nhanh nào FWHM < 0,3 s.
3. Xem tay (checklist):
- [ ] Rút khung mỗi 0,5–1 s: hình khớp lời; không khung đen/trống (máy nhìn ra trời); không shot > 3,5 s thiếu chuyển động mới; không ảnh tĩnh đem zoom.
- [ ] Hook: hình lạ nhất + máy chạy ngay khung 0; câu hook ~10–16 từ (tối đa ~25) thuộc 1 trong 6 kiểu.
- [ ] Chữ khớp từ đang đọc (lệch < 2 khung), không che mặt nhân vật.
- [ ] Bảng chữ → hành động: mọi động từ chính có hành động thấy được ±0,15 s; không vật nào tự di chuyển.
- [ ] ≥ 2 kỹ thuật vật kể chuyện T01–T04; tài liệu cận đọc được; chữ trên biển/lịch/icon không bị cắt, che, sọc hay lặp.
- [ ] Mỗi câu cảm xúc có hiệu ứng mặt + dấu quanh đầu/màn hình.
- [ ] Nhân vật đúng thiết kế mục 6 và nhất quán (màu, tỉ lệ, trang phục); không mặt bị khung cắt.
- [ ] Bối cảnh đúng biến thể render đã chọn, nét toàn khung, có chiều sâu (sương xa, lớp cảnh), biển hiệu đọc được, không khối trơn/cháy sáng, màu không chói, không đồ chắn máy.
- [ ] Ánh sáng đổi theo hồi truyện (bảng mục 7).
- [ ] Cắt cứng ≤ 2 và đúng kiểu; hòa hình 6–8 khung; cú máy bay liền không xuyên đầu người, không vọt quá đích. Mọi điểm `cuts3.py` báo phải xem bằng `frames.py`.
- [ ] Câu chốt ≤ 6 từ, cảnh vòng về/đảo vai, giữ ≥ 1 s.
- [ ] Âm thanh: SFX chỉ ở chỗ có lý do (mục 9.2), có khoảng trống; nhạc không lấn lời.
- [ ] Không giật: kiểm khung trùng/rớt bằng `ffmpeg -vf mpdecimate`.
- [ ] Ghép so sánh cạnh mẫu cùng ý (kèm ảnh trước/sau khi sửa); báo rõ điểm giống/khác; không cam kết giống 100%.

## 11. Phân tích video mẫu mới (khi chủ kênh gửi thêm)
1. Bỏ trùng bằng md5 + thời lượng.
2. `tools/analysis/analyze_sample.sh sample.mp4 out/` → measure.json (máy, màu, loudness), cuts3 (cắt cứng; điểm nghi vấn xem bằng `frames.py`), capgeo (phụ đề), audio2 (giọng, mono), OCR lời, sheet 1 khung/giây, phổ 15 s. Thêm `flowprof.py` để đo hình dạng tốc độ cú máy và `sharpness.py` để đo độ nét/màu.
3. Xem từng sheet, ghi bảng mốc thời gian theo mẫu `per_video/V01.md` (cột: t, quan sát, máy/chuyển cảnh; cuối: thủ pháp + số đo), đánh dấu [QS]/[SL].
4. Kiểm tay các "cắt" tự động bằng `frames.py` (12 khung liền + độ lệch từng khung: cắt = 1 bước nhảy, không có khung trộn; hòa hình = các khung trộn 2 cảnh). Không tin số cắt của `measure.json`.
4b. Có kịch bản gốc → đối chiếu bằng `asr_pocketsphinx.py` và đo từ/phút = số từ ÷ thời lượng lời. Tài liệu người khác gửi (báo cáo, ảnh AI) phải kiểm lại trên khung gốc trước khi đưa vào quy tắc.
5. Cập nhật Style Bible: quy tắc mới, biến thể mới, ví dụ có mốc giờ; cập nhật ngưỡng QA nếu số trung vị đổi; ghi mục "chưa xác minh".

## 12. Thay đổi so với bản trước
### 2026-10-30 (bản 7 — sửa video mờ/nhòe, màu dịu)
- DOF tắt mặc định (cài sai đơn vị thế giới làm mờ cả khung); siêu lấy mẫu 2×; nhòe chuyển động tới 12 khung con, không lặp hình; biển tách khỏi tường + near 0,1; chữ tài liệu 1,5× độ phân giải.
- Màu: HueSaturation −0,2, bloom 0,12, tranh Magnific bão hòa ×0,8, hạ đèn sát giấy.
- Siêu lấy mẫu 2× + nén slow/tune animation + unsharp nhẹ 0,4: N02 đạt 21/21 QA, độ chi tiết 0,887 (mẫu 0,88–0,93).
- QA thêm `sharpness.py` (độ nét + bão hòa so với 18 mẫu) và bước render thử khung khó trước khi render đủ.
### 2026-10-30 (bản 6 — Magnific + thư viện + âm thanh chọn lọc)
- Nền: tường/phố/mặt đất vẽ bằng Magnific (Nano Banana 2.1) cho cả 5 bối cảnh; quy trình lấy file khi máy chủ bị chặn CDN.
- Engine v4 (`RickClips_KIT/engine_v4/`): three 0.170 + pmndrs postprocessing + N8AO + GSAP (ease `back.out` cho vật/nhãn hiện). Satori chưa tích hợp.
- Âm thanh: SFX chọn lọc (≈1 cue/1,5 s), nhạc hài nhẹ tạo bằng Magnific, bed −23 LUFS. N02 v4 đạt 16/16 QA.
### 2026-10-30 (bản 5 — sau góp ý video N02 tháp Eiffel)
- Camera: làm mượt Gaussian σ 0,2 s + ngoại suy đầu/cuối; cú máy nhanh FWHM ≥ 0,45 s; bay trong phòng 0,6–1,0 s; thêm `camprobe.js`/`camanal.py`/`flowprof.py` đo trước và sau render.
- Nhân vật: thiết kế lại theo mẫu (đầu trắng méo nhẹ, viền xanh đen dày biến thiên, mắt chấm, thân con nhộng hẹp, tay chân sợi mì tối).
- Bối cảnh: grade + vignette + lớp vẽ tay cho texture; icon chữ trong băng nhãn đo vừa.
- Voice: đo nhịp từng kịch bản, speed 1.2 khi chậm; mốc từng từ bằng căn cưỡng bức pocketsphinx.
- SFX: kết nối kho EditorNghiepDu (`production/sfx_library/`, `mix_lib.py`); ghi nhận API tạo ảnh bị chặn và phương án Magnific MCP.
- Engine: `RickClips_KIT/engine_v3/`.
### 2026-10-29 (bản 4 — tự bổ sung phần dữ liệu gốc còn thiếu)
- Font: Poppins Bold 87/333 → **Work Sans ExtraBold 75/ScaleX 99/Outline 5/MarginV 344** (so khớp 101 từ, 89 kiểu chữ); font đóng gói trong KIT.
- Nhạc/SFX: đo được không nhịp trống, giọng thứ, mức giữa câu −16 dB; thêm `audio_kit.py` (5 sắc thái nền + 18 SFX + đặt theo mốc); bed −20 LUFS trước ducking thay "thấp hơn 18–22 dB"; QA thêm sàn khoảng nghỉ.
- Lời V1, V6 tái dựng → đủ 18/18 kịch bản; nhịp V1 213, V6 222 từ/phút.
- Phần mềm dựng gốc và số hòa hình từng video: ghi [CHỌN], không chặn sản xuất.
### 2026-10-29 (bản 3 — rà tài liệu người dùng bổ sung)
- Cắt cứng: "0 ở 16/18" → **6 cắt ở 5/18** (quét toàn bộ + xem từng khung). QA: `cuts3.py` thay `cuts2.py`; ngưỡng ≤ 2/video.
- Hòa hình: 0,2–0,4 s → **6–8 khung, mặc định 7**.
- Nhịp lời: ~190–215 → **208–244 từ/phút (trung vị 225)**; bảng độ dài lời cập nhật.
- Hook: 5 → 6 kiểu (thêm câu hỏi trực tiếp, V14); câu mẫu thay bằng câu kịch bản gốc.
- Tỉ lệ nhân vật: đầu 30–34% đo pixel.
### 2026-10-29 (bản 2)
- Dữ liệu từ 18 mẫu (trước: 8). Thêm Style Bible, thư viện T01–T24, khuôn truyện + kiểu hook, QA tự động; vị trí chân chữ 71,7%; mix mono; thời lượng 34–78 s.

## Phụ lục A: sonicvoice_tts.py
Mã đầy đủ nằm trong KIT: `RickClips_KIT/production/sonicvoice_tts.py` (lệnh: `balance | models | voices | tts | clean | words`; khóa qua biến `SONICVOICE_API_KEY`; User-Agent riêng; thử lại 429/5xx; `clean` = mono, highpass 80 Hz, de-ess, cắt lặng đầu/cuối, −16 LUFS + limiter 0.80).

## Phụ lục B: srt_words.py
Mã đầy đủ nằm trong KIT: `RickClips_KIT/production/srt_words.py` (mốc từng từ ước lượng từ SRT theo số ký tự + xuất ASS với style Work Sans ExtraBold 75/99/5/2.5/344). Chỉ dùng khi không căn cưỡng bức được.