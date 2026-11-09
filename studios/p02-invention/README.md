# p02-invention — lớp nâng cấp kit P02 "How you invented …" cho Muse (v1.1, 09/11/2026)

Kit gốc: `mailcontentnba76-cell/absurdplay-kit`, nhánh `du-an-moi` (công khai, tài khoản khác — không sửa trực tiếp ở đó).
Lớp này cài bằng `bash studios/p02-invention/cai_overlay.sh <thư mục kit>`: chỉ THÊM file + vá `engine/render.js` tại chỗ. Đã thử trên kit HEAD 9e91d80 (E08).

| File (trong `du_an/P02_oddtilt/`) | Thay bước kit | Việc |
|---|---|---|
| `cong_cu/giong_chuan.py` | B3 + B4 | giọng gốc → rút nghỉ 0,12 s → atempo tự tính tới 218 từ/phút → Parakeet → `words.json` → so khớp lời |
| `cong_cu/moc_shot.py` (câu khen riêng: `KHEN="a,b"`) | B6 + danh sách cue B13 | chia vế theo "so you / But / Except / Now / khen" → điểm cắt, loại shot A/B, `engine/moc/<tập>.js` cho cảnh import, `cues_auto.json` (whoosh/ding/uh_oh), kiểm công thức viral trên audio thật |
| `cong_cu/tron_am_auto.py` | B13 (không chép tron_am.py mỗi tập) | giọng + nhạc −19 dB + cue tự động + `cues_tay.json`; loudnorm 2 lượt −14 LUFS; thiếu SFX thì bỏ cue và báo |
| `cong_cu/tao_phu_de.py` | B5 | bản dùng chung, viết HOA thêm DUMBASS (`CAPS_THEM` để thêm từ) |
| `cong_cu/qa_tap.py` | B14 (mục 7) | QA video cuối: khung, fps, thời lượng, LUFS/TP, lặng, từ/phút, % cắt rơi đúng chữ nối, contact sheet 2 khung/giây |
| `cong_cu/render_nen.sh` | B12 | render nền N tiến trình, bỏ khung đã có, không chạy chồng — watchdog chỉ cần chạy lại |
| `cong_cu/va_render.py` → vá `engine/render.js` TẠI CHỖ | — | bỏ qua khung đã có (`SKIP_EXISTING=0` để làm lại), ghi `.tmp` rồi đổi tên, `CHROME_PATH`; giữ nguyên tính năng của kit (đọc `#acc` motion blur từ E06). v1.0 từng thay cả file — `cai_overlay.sh` v1.1 tự lấy lại bản kit rồi vá |

Đã thử (08/11): `moc_shot.py` trên DEMO door / E05 / E03 và mốc lời video tủ lạnh viral — điểm cắt sinh ra cho bản "cửa" trùng điểm cắt
thật của video viral trong ±0,4 s; `tron_am_auto.py` với âm tổng hợp → −14,5 LUFS; `qa_tap.py` trên video "cửa" viral; `render.js` + `render_nen.sh`
với trang thử (resume, không chạy chồng); `giong_chuan.py` với ASR giả (Parakeet thật chưa chạy ở máy này); `cai_overlay.sh` trên bản sao kit.
Chưa làm: thư viện gag dùng chung `lib/gag.js` (bật ra, ngã, gãy, bắn văng, mũi tên khoa học) — tách từ `e5_xe_dap.html` ở tập tới.

Muse: `muse/custom-skills/invention-chain/SKILL.md`. Cấu hình kênh: `niches/how-you-invented/`. Nội dung: `skills/invention-*`.
