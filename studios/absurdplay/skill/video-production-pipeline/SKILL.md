---
name: "video-production-pipeline"
description: "Quy trình chung để bắt đầu và sản xuất BẤT KỲ dự án video nào theo video mẫu: kiểm đầu vào → phân tích mẫu theo mốc thời gian ([QS]/[ĐO]/[SL]) → xây quy trình riêng → kiểm công cụ thật → bản thử cạnh mẫu → sản xuất, QA, bàn giao → lưu hồ sơ dự án. Dùng khi người dùng đưa video mẫu và muốn làm video tương tự, bắt đầu chủ đề/kênh video mới, hoặc tiếp tục một dự án có thư mục du_an/<MA_DU_AN>. Không chứa phong cách của dự án nào."
---

# Quy trình sản xuất video theo mẫu (chung) — v1.0

Skill này là lối vào. Toàn bộ quy trình nằm ở **`00_HUONG_DAN_CHO_CLAUDE.md`** của bộ `BO_HUONG_DAN_SAN_XUAT_VIDEO/`. Hãy đọc file đó trước khi làm bất cứ việc gì. Nếu không tìm thấy, hỏi người dùng đường dẫn hoặc yêu cầu họ đính kèm file.

## Nhớ ngay
1. **Không mang dự án cũ sang dự án mới:** phong cách, nhân vật, thời lượng, tỷ lệ khung, giọng, công cụ, ngưỡng QA đều lấy từ mẫu và yêu cầu của dự án *đang làm*. Thông số nào cũng phải có nguồn (YC / ĐO / CHỌN).
2. **Thứ tự:** G0 khởi động → G1 tiếp nhận (`HO_SO_DU_AN.md`) → G2 phân tích mẫu → G3 quy trình riêng → G4–G5 kiểm và thiết lập công cụ → G6 bản thử (**duyệt**) → G7 sản xuất, QA, bàn giao (kịch bản **duyệt** trước) → G8 lưu nhật ký và skill dự án.
3. **Công cụ chỉ "khả dụng" khi đã chạy tác vụ thật trong phiên này.**
4. **Xuất được file không có nghĩa là đạt.** Phải đo, xem và nghe lại bản cuối, đối chiếu với mẫu.
5. Không hỏi mật khẩu hay API key. Không dùng video mẫu của bên thứ ba trong sản phẩm. Báo đúng số đo; chưa kiểm thì nói chưa kiểm.

## Tài nguyên trong bộ
- `mau/MAU_01…08`: hồ sơ dự án, phân tích mẫu, quy trình riêng, bảng kiểm công cụ, chấm bản thử, QA bản cuối, nhật ký lỗi, nhật ký phiên bản.
- `cong_cu/phan_tich_mau.py`: đo tự động video mẫu (ffmpeg; numpy và opencv nếu có).
- `01_CAU_LENH_KHOI_DONG.md`: câu lệnh cho dự án mới, phiên tiếp theo và chuyển máy.

## Thay đổi
- v1.0 (02/11/2026): bản đầu, rút từ kinh nghiệm một dự án video 3D dọc; đã tách hết thông số riêng của dự án đó.
