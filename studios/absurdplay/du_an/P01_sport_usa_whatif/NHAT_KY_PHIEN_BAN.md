# NHẬT KÝ PHIÊN BẢN — P01
Quy ước `vLỚN.NHỎ`: tăng LỚN khi sản phẩm khác đi rõ rệt; tăng NHỎ khi sửa lỗi, đổi ngưỡng, thêm công cụ.

| Phiên bản | Ngày | Áp dụng cho | Thay đổi | Lý do / bằng chứng | Ai quyết | Video đầu tiên dùng bản này |
|---|---|---|---|---|---|---|
| v0.1 | 03/11/2026 | hồ sơ, quy trình, skill, công cụ | Lập hồ sơ; phân tích 23 mẫu; quy trình nháp; cài và kiểm three.js headless, Kdenlive 23.08/melt, Whisper, font; công cụ `bang_shot.py`, `tao_phu_de.py`, `tao_kdenlive.py`, `engine/` | PHAN_TICH_MAU/TONG_HOP.md, BANG_KIEM_CONG_CU.md | Claude (chờ duyệt) | — |
| v0.6 | 05/11/2026 | skill, engine, công cụ, E04 | Hiệu chỉnh theo 2 video mẫu đo lại: phụ đề Inter ExtraBold 66/594 + font TTF; lóa trắng nhiều nhịp; lớp máy quay style; màu `hau_ky.py`; gói đồ hoạ cố định `goi_truyenhinh.js`; lưới mũ thấp; `hieuung.js`; QA `kiem_theo_mau.py`; mặc định 60–72 s, 158–164 từ/phút; playwright trong package.json | So sánh đo: samples/sportusa/BAO_CAO_SO_SANH_KIT_VS_MAU.md; E04 trước/sau đo cùng công cụ | người dùng yêu cầu "sửa kit luôn" | E04 (bản cắt thử v0.6) |
| v0.3 | 04/11/2026 | skill, engine, công cụ | E02 NBA hoàn thành; skill v0.3: nhận việc theo môn + tin mới nhất, không lặp bối cảnh, kiểm nhận diện có nguồn; lib/nba.js, cast2.js, bongro.js; khán giả cử động; tăng tốc render; sửa melt/whisper/dohoa_render | skill/sport-usa-whatif/SKILL.md, NHAT_KY_LOI.md, tap/E02_giannis_vs_bucks | Claude (người dùng duyệt video E02) | — |
