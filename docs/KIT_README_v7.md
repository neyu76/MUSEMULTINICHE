# RickClips KIT — bản 7 (2026-10-31)

Bộ công cụ + tài liệu để làm video dọc 3D kể chuyện phong cách Ricks Clips (34–78 s, 720×1280, 30 fps).
Đi kèm skill `ricks-clips-3d-shorts` (bản 7, file `skill/SKILL.md`). Skill nêu quy trình; KIT chứa mã chạy được và bằng chứng đo trên 18 video mẫu.

## Bắt đầu nhanh (phiên Claude mới)
```bash
unzip RickClips_KIT_v7.zip -d ~ && bash ~/RickClips_KIT/setup.sh      # cài thư viện + kiểm môi trường + render thử 1 khung
mkdir -p ~/.secrets && printf '%s' '<KHÓA SONICVOICE>' > ~/.secrets/sonicvoice_key && chmod 600 ~/.secrets/sonicvoice_key
```
Sau đó đưa kịch bản (hoặc chủ đề) và yêu cầu Claude làm theo skill `ricks-clips-3d-shorts`.

## Cấu trúc
| Thư mục | Nội dung |
|---|---|
| `skill/SKILL.md` | Skill bản 7 (bản sao để cài vào tài khoản khác hoặc đọc khi skill chưa cài). |
| `references/STYLE_BIBLE.md` | **Đọc đầu tiên.** Quy tắc phong cách đo từ 18 video mẫu (nhân vật, bối cảnh, ánh sáng, máy, chuyển cảnh, chữ, giọng, nhạc, kịch bản, T01–T24, tiêu chí QA). Phần thiết kế/quy trình đã thay sau góp ý → theo SKILL.md (ghi chú đầu file). |
| `references/ALL_SAMPLE_BREAKDOWNS.md`, `per_video/V01–V18.md` | Phân tích từng video theo mốc thời gian + số đo. |
| `references/scripts/` | Kịch bản 18 video mẫu (mẫu giọng văn). `metrics/` số đo gốc. `VERIFICATION_2026-10-29.md` mục nào đã/chưa xác minh. |
| `engine_v4/` | **Engine dựng hiện dùng**: three.js 0.170 + postprocessing 6.39.5 + N8AO 2.0.1 + GSAP 3.15.0 (phiên bản khóa trong `package.json`). `render.js` (SS=2 siêu lấy mẫu, tự khởi động lại khi mất WebGL, chạy tiếp khung còn thiếu), `stills.sh` (lưới ảnh tĩnh), `camprobe.js`, `align_ps.py` (mốc từng từ), `captions_n02.py`, `assemble.sh`, `gen_kdenlive.py`. Bối cảnh `paris.js / rooms.js / think.js` + tranh nền `mg/` là của tập N02 — tập mới dựng bối cảnh mới, giữ `core.js` + `chars2.js`. |
| `engine_v3/`, `engine/` | Bản cũ (tham khảo). |
| `production/` | `sonicvoice_tts.py` (giọng), `mix_final.py` (mix cuối 1 lệnh), `mix_lib.py` + `sfx_library/` (SFX kho EditorNghiepDu), `audio_kit.py` (nhạc/SFX tổng hợp dự phòng), `magnific_backgrounds.md` (vẽ nền bằng Magnific), `captions.py`, `srt_words.py`, `align.py`. |
| `tools/analysis/` | `qa_compare.py` (21 mục QA), `sharpness.py` (độ nét + màu), `camanal.py` / `flowprof.py` (độ mượt máy), `cuts3.py`, `frames.py`, `capgeo.py`, `analyze_sample.sh` (phân tích video mẫu mới), `caption_calibrate.sh`, `font_match.py`, `asr_pocketsphinx.py`. |
| `fonts/` | Work Sans ExtraBold (font phụ đề đã hiệu chỉnh, OFL 1.1). |
| `examples/N02_Eiffel/` | Tập mẫu đạt 21/21 QA: kịch bản, shot list, mốc từ, phụ đề, cue SFX, lệnh từng bước. |
| `new_scripts/` | Kịch bản đã viết/đã loại (kèm lý do). |
| `setup.sh` | Cài + kiểm môi trường; `bash setup.sh --check` chỉ kiểm. |

## Không có trong KIT (cố ý)
- Video/khung hình mẫu của kênh gốc (chỉ dùng nội bộ để so sánh).
- File âm thanh của kho SFX EditorNghiepDu (tải lại qua MCP của kho trên máy đã đăng ký).
- Khóa API (SonicVoice, Magnific…) — chỉ lưu trong `~/.secrets/` của phiên làm việc.

## Chuẩn đầu ra (QA tự động phải đạt hết)
`python3 -I tools/analysis/qa_compare.py final.mp4 qa_out --captions captions.ass` → 21/21: định dạng, thời lượng, −14 LUFS, mono, máy luôn chuyển động, cắt cứng ≤ 2, phụ đề đúng vị trí/cỡ, khoảng lặng, sàn nhạc giữa câu, độ nét (chi tiết mịn ≥ 0,86), bão hòa ≤ 135, không đứng hình/khung đen, tỉ lệ phụ đề 1 từ.
