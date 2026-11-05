# BẢNG KIỂM CÔNG CỤ, TÀI NGUYÊN, THÀNH PHẦN THIẾU — <MA_DU_AN>
Môi trường: <hệ điều hành, CPU/GPU/RAM, shell> · Ngày kiểm: <...> · Phiên: <Claude Code / claude.ai / khác>

Trạng thái:
- **ĐÃ KIỂM**: chạy tác vụ thật thành công trong phiên này.
- **CÓ-CHƯA-HỢP**: có nhưng cần cấu hình lại hoặc thiếu tính năng.
- **THIẾU**: chưa có.
- **CẦN NGƯỜI DÙNG**: phải đăng nhập, thanh toán, cấp quyền hoặc cài bằng quyền quản trị.

Mức cần: **B** bắt buộc · **N** nên có · **T** tùy chọn

## 1. Bảng kiểm
| Thành phần | Loại (phần mềm / thư viện / connector / API / skill / tài nguyên) | Dùng cho bước | Mức cần | Phiên bản | Trạng thái | Bằng chứng (lệnh đã chạy → kết quả) | Giới hạn đã biết |
|---|---|---|---|---|---|---|---|
| ffmpeg / ffprobe | phần mềm | đo, ráp, xuất | B | | | `ffmpeg -version`; xuất 1 s có phụ đề → OK | |
| Python + thư viện đo | thư viện | phân tích, QA | N | | | | |
| <công cụ tạo hình> | | | | | | | |
| <công cụ giọng / TTS> | | | | | | | |
| <nhạc, SFX> | | | | | | | |
| <phần mềm dựng có project> | | | | | | | |
| <connector / API trả phí> | | | | | | số dư: … | |

## 2. Thành phần còn thiếu — đề xuất
| Thành phần | Mục đích | Mức cần | Nguồn chính thức | Yêu cầu cấu hình | Chi phí | Vì sao chọn (và phương án thay thế) | Ai làm |
|---|---|---|---|---|---|---|---|

## 3. Phân công
| Claude tự làm được | Cần chủ dự án làm (từng bước) |
|---|---|
| | |

## 4. Giới hạn còn tồn tại sau thiết lập
- (ví dụ: không có GPU nên render chậm; dịch vụ X không xuất được Y…)

## 5. Bí mật và đăng nhập
- Không ghi khóa hay mật khẩu vào file này. Chỉ ghi *nơi lưu* (ví dụ `~/.secrets/<tên>_key`) và *ai đăng nhập*.
