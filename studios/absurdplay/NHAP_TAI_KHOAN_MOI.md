# Chuyển dự án AbsurdPlay (P01 Sport USA) sang tài khoản Claude khác

Gói này gồm 3 file:

| File | Là gì | Dùng ở đâu |
| --- | --- | --- |
| `sport-usa-whatif.zip` | Skill chính của dự án (quy tắc nhận việc, công thức troll viral, nhận diện cầu thủ, nhân vật luôn cử động, chuỗi công cụ, lỗi đã gặp, bảng "đã dùng" E01–E04) | Cài vào tài khoản mới: Settings → Capabilities → Skills → Upload skill |
| `video-production-pipeline.zip` | Skill chung cho mọi dự án video (quy trình G0–G6, mẫu hồ sơ) | Cài giống trên (tuỳ chọn) |
| `AbsurdPlay_P01_bo_ho_so.zip` | Bộ hồ sơ đầy đủ: engine 3D (three.js, mô hình nhân vật CC0, tóc, đồ hoạ), công cụ Python, tài liệu dự án, phân tích kênh mẫu (chỉ văn bản), kịch bản + mốc lời + phụ đề + bộ trộn âm của E01–E04 | Đính kèm vào cuộc trò chuyện đầu tiên ở tài khoản mới (hoặc tải lên Project) |

**Không có trong gói (theo yêu cầu):** toàn bộ âm thanh — hiệu ứng (SFX), tiếng sân đấu Magnific, thư viện nhạc, file giọng. Cũng không có video mẫu của kênh khác, ảnh trích từ video mẫu, video đã xuất, node_modules.

## Các bước ở tài khoản mới

1. **Cài skill:** Settings → Capabilities → bật Code execution / Skills → Upload `sport-usa-whatif.zip` (và `video-production-pipeline.zip`).
2. **Tạo Project** tên "Sport USA" (tuỳ chọn): tải `AbsurdPlay_P01_bo_ho_so.zip` vào phần kiến thức của Project, hoặc để dành đính kèm ở bước 3.
3. **Mở phiên mới**, đính kèm `AbsurdPlay_P01_bo_ho_so.zip` và gửi:

```
Đây là dự án AbsurdPlay (P01 Sport USA) chuyển từ tài khoản khác. Dùng skill sport-usa-whatif.
Giải nén file đính kèm vào /root/work/, làm theo mục "Khởi động" trong SKILL.md: dựng engine (npm install),
chạy thử render 3 khung, chạy cong_cu/cai_font.sh (font TTF cho phụ đề), kiểm tra ffmpeg / melt / faster-whisper. Âm thanh không có trong gói — tải lại thư viện
CC0 theo tai_nguyen/am_thanh/README.md và liệt kê cho tôi những tiếng Magnific cần tạo lại.
Trả lời tôi bằng tiếng Việt. Xong thì đợi tôi nói "NFL" hoặc "NBA" để làm kịch bản mới.
```

4. **Kết nối lại những thứ không chuyển được:**
   - **Claude in Chrome** (tiện ích trình duyệt) đăng nhập vào tài khoản Claude mới, và trình duyệt vẫn đăng nhập Magnific → Claude tạo giọng "Sport USA" như cũ. Hoặc bạn tự tạo giọng rồi đính kèm mp3.
   - **GitHub** (tuỳ chọn): kết nối GitHub ở tài khoản mới và cấp quyền repo `absurdplay-kit` để Claude tự lưu tiến độ cuối mỗi tập.
   - **Tiếng sân đấu Magnific** (26 tiếng: crowd_cheer, crowd_boo, ref_whistle, buzzer, football_kick, sad_trombone…): tạo lại bằng Magnific Sound Effects và đính kèm khi Claude hỏi.

## Làm tiếp E04
E04 "Eagles vs 11 inflatable tube men" đang chờ duyệt bản cắt thử. Ghi chú đầy đủ: `du_an/P01_sport_usa_whatif/tap/E04_eagles_tube_men/HUONG_DAN_TIEP_TUC.md`. Cần đính kèm lại file giọng E04 (mp3 trong Magnific) vì gói không chứa âm thanh.
