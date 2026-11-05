# Bộ hướng dẫn sản xuất video theo mẫu (dùng chung) — v1.0 (02/11/2026)

Bộ này giúp một Claude mới, ở tài khoản hay cuộc trò chuyện mới, tự làm được những việc sau với bất kỳ chủ đề video nào: kiểm tra đầu vào, phân tích video mẫu, xây quy trình phù hợp, kiểm và thiết lập công cụ, làm bản thử cạnh mẫu, rồi sản xuất và bàn giao. Bộ này **không chứa phong cách** của dự án nào.

## Cách dùng (cho người dùng)
1. Mở chat mới, đính kèm hoặc chỉ đường dẫn thư mục này (ít nhất file `00_HUONG_DAN_CHO_CLAUDE.md`) cùng video mẫu.
2. Sao chép câu lệnh ở `01_CAU_LENH_KHOI_DONG.md` (mục A cho dự án mới), điền thông tin, gửi.
3. Claude sẽ dừng hỏi ý kiến bạn ở 2 điểm: **duyệt nội dung** và **duyệt bản thử**, cùng một số trường hợp như cần đăng nhập, thanh toán, chi phí lớn (mục 5).
4. Trong Claude Code: chép `skill/video-production-pipeline/` vào `.claude/skills/` của thư mục làm việc. Trên claude.ai: nén thư mục skill thành zip rồi tải lên mục Skills, và đưa kèm các file của bộ vào Project.

## Nội dung
| Đường dẫn | Vai trò |
|---|---|
| `00_HUONG_DAN_CHO_CLAUDE.md` | **file chính:** nguyên tắc, quy trình G0–G8, phân tích mẫu, kiểm công cụ, bản thử, QA, phiên bản, bài học chung |
| `01_CAU_LENH_KHOI_DONG.md` | câu lệnh cho dự án mới / phiên tiếp theo / chuyển máy |
| `mau/MAU_01…08` | mẫu trống: hồ sơ dự án, phân tích mẫu, quy trình riêng, bảng kiểm công cụ, chấm bản thử, QA bản cuối, nhật ký lỗi, nhật ký phiên bản |
| `cong_cu/phan_tich_mau.py` + `README.md` | đo tự động video mẫu (đã chạy thử) |
| `skill/video-production-pipeline/SKILL.md` | bản skill (lối vào, trỏ về file chính) |
| `du_an/_MAU_THU_MUC_DU_AN/` | cấu trúc thư mục cho mỗi dự án mới |

## Quy ước tách bạch
- **Chung** (thư mục này): chỉ sửa khi có bài học đúng cho mọi dự án, kèm bằng chứng, và bạn đồng ý. Tăng phiên bản ở tiêu đề file chính.
- **Riêng** (`du_an/<MA_DU_AN>/`): mọi thông số, phong cách, công cụ, ngưỡng QA của một dự án. Dự án làm nhiều video thì có thêm skill riêng (mẫu ở MAU_08).
