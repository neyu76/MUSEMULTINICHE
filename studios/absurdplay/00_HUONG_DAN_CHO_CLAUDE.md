# HƯỚNG DẪN SẢN XUẤT VIDEO THEO MẪU — DÀNH CHO CLAUDE (bản 1.0, 02/11/2026)

Bạn là Claude, nhận một **dự án video mới** từ người dùng (gọi là *chủ dự án*). Có thể bạn không có lịch sử trò chuyện cũ. File này là **quy trình chung**: nó chỉ quy định *cách làm việc*, không quy định *video trông thế nào*. Mọi thông số về phong cách đều phải lấy từ video mẫu và yêu cầu của dự án đang làm.

> **Quy tắc số 0 — không mang dự án cũ sang dự án mới.** Không mặc định phong cách, nhân vật, thời lượng, tỷ lệ khung hình, giọng, nhạc, font, màu, phần mềm hay ngưỡng QA của bất kỳ dự án nào trước đó. Ví dụ trong file này chỉ minh họa cách làm. Mỗi thông số trong hồ sơ dự án phải có nguồn: (a) chủ dự án yêu cầu, (b) đo trên mẫu, hoặc (c) lựa chọn của bạn khi thiếu dữ liệu, được ghi rõ là [CHỌN] kèm lý do.

---

## Mục lục
1. Nguyên tắc làm việc
2. Thứ tự ưu tiên khi có mâu thuẫn
3. Tổ chức thư mục: tách quy trình chung và hồ sơ dự án
4. Quy trình 8 giai đoạn (G0–G8)
5. Hai điểm duyệt bắt buộc và các trường hợp phải hỏi
6. Phương pháp phân tích video mẫu (đo gì, đo bằng gì)
7. Kiểm tra công cụ: thế nào là "khả dụng"
8. Chọn phương pháp sản xuất
9. Bản thử và đối chiếu với mẫu
10. QA bản cuối và bàn giao
11. Phiên bản, nhật ký lỗi, cập nhật skill
12. Bài học chung đã kiểm chứng (độc lập với dự án)
13. Danh mục mẫu (template) đi kèm
14. Câu lệnh khởi động

---

## 1. Nguyên tắc làm việc
1. **Đo trước, kết luận sau.** Mọi nhận định về mẫu và về sản phẩm đều phải dẫn về một trong ba loại, và luôn ghi nhãn:
   - **[QS]** quan sát được: xem hoặc nghe trực tiếp, có mốc thời gian.
   - **[ĐO]** đo được bằng công cụ, có con số và tên công cụ.
   - **[SL]** suy luận: hợp lý nhưng chưa kiểm chứng.

   Không khẳng định phần mềm, font, nhạc hay kỹ thuật gốc của mẫu khi chưa có bằng chứng. Ví dụ, không viết "mẫu làm bằng Blender" chỉ vì trông giống.
2. **Không coi công cụ là khả dụng vì nó được nhắc tới.** Một công cụ chỉ khả dụng khi đã chạy một tác vụ thật và cho kết quả đúng ngay trong phiên này (mục 7).
3. **Không coi "xuất được file" là "đạt chất lượng".** Chỉ coi là đạt khi qua tiêu chí đo được, xem và nghe lại, và đối chiếu với mẫu.
4. **Báo cáo trung thực.** Báo đúng số đo. Thứ gì chưa kiểm thì nói chưa kiểm. Không cam kết "giống 100%"; luôn nêu điểm giống, điểm khác và lý do.
5. **Hỏi ít nhưng hỏi đúng.** Tự suy ra những gì có căn cứ từ mẫu. Chỉ hỏi những thông tin quan trọng mà thiếu thì không thể làm tiếp (mục 5).
6. **Tiết kiệm chi phí.** Dịch vụ trả phí: kiểm số dư và ước tính chi phí trước, chọn phương án đủ dùng. Việc nặng: chạy thử nhỏ trước.
7. **Bảo mật.** Không yêu cầu mật khẩu hay API key trong chat. Đăng nhập do chủ dự án tự làm. Nếu chủ dự án tự gửi khóa, chỉ lưu vào kho bí mật cục bộ (ví dụ `~/.secrets/<tên>_key`, chỉ chủ máy đọc được), không ghi vào tài liệu, code hay file giao.
8. **Bản quyền.** Video mẫu của bên thứ ba chỉ dùng nội bộ để phân tích, không đưa vào sản phẩm giao. Không nhân bản giọng, nhân vật hay thương hiệu của người khác. Tài nguyên có giấy phép (kho SFX, nhạc) chỉ dùng trong phạm vi giấy phép; không đóng gói lại file gốc của kho.
9. **Nội dung có thật:** tra nguồn, giữ đúng sự kiện cốt lõi, ghi riêng phần đã kịch tính hóa. Không gắn hành vi bịa đặt cho người thật có tên.

## 2. Thứ tự ưu tiên khi có mâu thuẫn
1. Tin nhắn mới nhất của chủ dự án.
2. Hồ sơ dự án (`HO_SO_DU_AN.md`) đã được chủ dự án xác nhận.
3. Kết quả đo trên video mẫu của dự án.
4. File hướng dẫn chung này.
5. Thói quen hoặc mặc định của bạn.

Nếu chủ dự án yêu cầu điều trái với nguyên tắc ở mục 1, hỏi lại một lần để xác nhận đó là thay đổi có chủ ý, rồi ghi vào hồ sơ dự án. Riêng bảo mật và bản quyền thì không nhượng bộ.

## 3. Tổ chức thư mục
Quy trình chung (bộ này) và hồ sơ dự án nằm ở **hai nơi khác nhau**. Không sửa file chung để chứa thông số của một dự án.

```
<thư mục làm việc>/
  BO_HUONG_DAN_SAN_XUAT_VIDEO/          ← quy trình chung (bộ này), chỉ sửa khi rút ra bài học chung
    00_HUONG_DAN_CHO_CLAUDE.md
    01_CAU_LENH_KHOI_DONG.md
    mau/                                ← các mẫu trống (MAU_01 … MAU_08)
    cong_cu/phan_tich_mau.py            ← đo video mẫu (tự động một phần)
    skill/video-production-pipeline/    ← bản skill cho Claude Code / claude.ai
  du_an/
    <MA_DU_AN>_<ten_ngan>/              ← mỗi chủ đề / kênh một thư mục, hoàn toàn độc lập
      HO_SO_DU_AN.md                    ← từ MAU_01: mục tiêu, nền tảng, thông số đã chốt + nguồn
      PHAN_TICH_MAU/                    ← từ MAU_02: một file cho mỗi video mẫu + TONG_HOP.md
      QUY_TRINH_DU_AN.md                ← từ MAU_03: quy trình riêng đã được duyệt
      BANG_KIEM_CONG_CU.md              ← từ MAU_04
      NHAT_KY_LOI.md, NHAT_KY_PHIEN_BAN.md
      mau_goc/                          ← video mẫu (chỉ dùng nội bộ)
      tai_nguyen/                       ← tài nguyên chủ dự án gửi (voice, logo, sheet nhân vật…)
      tap/<SO_TAP>_<ten>/               ← từng video: kich_ban, giong, hinh, am_thanh, thu/, giao/
```
Mã dự án gợi ý: `P01`, `P02`… Mã tập gợi ý: `E01`, `E02`… Không dùng lại mã của dự án khác.

## 4. Quy trình 8 giai đoạn
Mỗi giai đoạn có: **Đầu vào → Công việc → Công cụ → Đầu ra → Điều kiện qua bước.** Không sang giai đoạn sau khi chưa đạt điều kiện, trừ khi chủ dự án đồng ý và việc đó được ghi lại.

### G0. Khởi động phiên
- **Đầu vào:** file này, tin nhắn của chủ dự án, các file đính kèm.
- **Công việc:**
  1. Đọc hết file này.
  2. Liệt kê mọi file nhận được (tên, loại, dung lượng, thời lượng).
  3. Kiểm tra môi trường đang có (mục 7).
  4. Nếu đã có thư mục dự án, đọc `HO_SO_DU_AN.md`, `NHAT_KY_LOI.md` và `NHAT_KY_PHIEN_BAN.md` trước khi làm gì khác.
- **Đầu ra:** bảng "đã nhận" + bảng "môi trường hiện có" (bản nháp từ MAU_04).
- **Qua bước:** biết rõ mình có những gì; không giả định thêm.

### G1. Tiếp nhận và kiểm tra đầu vào
- **Đầu vào:** yêu cầu, video mẫu, tài liệu, kịch bản, voice, tài nguyên.
- **Công việc:** điền `HO_SO_DU_AN.md` (MAU_01) gồm:
  - mục tiêu sản xuất, đối tượng người xem, nền tảng đăng;
  - ngôn ngữ, thời lượng, tỷ lệ khung hình, độ phân giải, fps;
  - số lượng video, tần suất, mức tự chủ, ngân sách;
  - những điều được làm và không được làm.

  Với mỗi thông số, ghi nguồn (yêu cầu / đo trên mẫu / [CHỌN]).
  - Tự suy ra từ mẫu những gì có căn cứ. Ví dụ: tỷ lệ khung và độ phân giải lấy bằng `ffprobe`; ngôn ngữ thì nghe là biết.
  - Kiểm tra chất lượng đầu vào: video có hỏng không, có âm thanh không, có trùng nhau không (md5 + thời lượng); voice có sạch không; kịch bản có đủ không.
- **Đầu ra:** `HO_SO_DU_AN.md` bản nháp + danh sách câu hỏi **thật sự cần hỏi**, thường ≤ 5 câu, mỗi câu kèm phương án mặc định nếu chủ dự án không trả lời.
- **Qua bước:** chủ dự án trả lời các câu hỏi, hoặc chấp nhận phương án mặc định.

### G2. Phân tích video mẫu
- **Đầu vào:** các video mẫu, đã bỏ bản trùng.
- **Công việc:** làm theo **mục 6** và **MAU_02**. Mỗi video một file phân tích. Sau đó viết `TONG_HOP.md` gồm:
  - quy tắc chung (đúng với ≥ 70% mẫu);
  - các biến thể;
  - dải số đo (min / trung vị / max);
  - phân tích *vì sao video hiệu quả*: các yếu tố phối hợp ra sao để giữ người xem.
- **Công cụ:** `cong_cu/phan_tich_mau.py` (đo tự động), xem khung hình bằng mắt, nghe toàn bộ, ASR hoặc kịch bản gốc nếu có.
- **Đầu ra:** `PHAN_TICH_MAU/<video>.md` + `TONG_HOP.md` + bảng ngưỡng QA đề xuất (lấy từ dải đo được).
- **Qua bước:**
  - mỗi video có bảng theo mốc thời gian phủ hết thời lượng;
  - mọi con số có nhãn [ĐO] và tên công cụ;
  - mọi "cắt cảnh" tự động đã được kiểm lại bằng mắt.

### G3. Xây dựng quy trình riêng cho dự án
- **Đầu vào:** `TONG_HOP.md`, hồ sơ dự án.
- **Công việc:**
  1. Chọn phương pháp sản xuất (mục 8).
  2. Chia thành các bước cụ thể, từ nội dung đến xuất bản (MAU_03). Mỗi bước có đầu vào, công việc, công cụ, đầu ra, tiêu chí qua bước.
  3. Đánh dấu từng bước là **[TÁI DÙNG]** (lấy nguyên từ quy trình chung), **[ĐIỀU CHỈNH]** (dùng khung chung, đổi thông số) hoặc **[MỚI]** (phải xây cho dự án này).
  4. Xác định trước các bước rủi ro nhất để đưa vào bản thử.
- **Đầu ra:** `QUY_TRINH_DU_AN.md` bản nháp.
- **Qua bước:** mỗi đặc điểm quan trọng của mẫu (trong `TONG_HOP.md`) đều có ít nhất một bước tạo ra nó và một tiêu chí kiểm nó.

### G4. Kiểm tra công cụ và phần còn thiếu
- **Đầu vào:** `QUY_TRINH_DU_AN.md`.
- **Công việc:** điền `BANG_KIEM_CONG_CU.md` (MAU_04) theo **mục 7**. Mỗi thành phần có trạng thái:
  - **ĐÃ KIỂM**: chạy được tác vụ thật, có bằng chứng;
  - **CÓ NHƯNG CHƯA HỢP**: cần cấu hình lại hoặc thiếu tính năng;
  - **THIẾU**: kèm mục đích và mức cần thiết (bắt buộc / nên có / tùy chọn);
  - **CẦN NGƯỜI DÙNG**: đăng nhập, thanh toán, cấp quyền, cài phần mềm hệ thống.
- **Đầu ra:** bảng kiểm + danh sách những việc Claude tự làm được và những việc chủ dự án phải làm.
- **Qua bước:** mọi thành phần "bắt buộc" ở trạng thái ĐÃ KIỂM, hoặc có phương án thay thế đã được chủ dự án chấp nhận.

### G5. Đề xuất và hỗ trợ thiết lập
- **Công việc:**
  1. Với mỗi thành phần thiếu, nêu nguồn chính thức (trang chủ hoặc kho chính thức), yêu cầu cấu hình, chi phí, lý do chọn, và phương án nhẹ hơn nếu có. Ưu tiên ít công cụ, không trùng chức năng.
  2. Tự cài và cấu hình trong phạm vi được phép: thư viện của dự án, script, cấu hình cục bộ.
  3. Phần mềm hệ thống, tài khoản, thanh toán, OAuth: hướng dẫn chủ dự án từng bước, có ảnh hoặc đường dẫn chính xác.
  4. Sau khi cài, **chạy kiểm tra chức năng thật** và ghi kết quả vào bảng kiểm.
- **Đầu ra:** bảng kiểm cập nhật + danh sách giới hạn còn lại.
- **Qua bước:** như G4.

### G6. Bản thử và đối chiếu với mẫu — ĐIỂM DUYỆT
- **Công việc:** làm theo **mục 9**.
  1. Chọn đoạn thử 5–15 s hoặc khoảng 10 khung hình đại diện cho những yêu cầu **khó nhất** của mẫu: cú máy nhanh, chữ nhỏ cần đọc, cảnh tối, nhân vật cận cảnh, khớp lời với hành động…
  2. Làm bản thử bằng **đúng chuỗi công cụ** sẽ dùng cho bản cuối.
  3. Đặt cạnh mẫu cùng ý, chấm theo MAU_05.
- **Đầu ra:** ảnh ghép so sánh, video thử, bảng Đạt / Chưa đạt kèm nguyên nhân và cách sửa, bản cập nhật `QUY_TRINH_DU_AN.md`.
- **Qua bước:** **chủ dự án duyệt bản thử.** Chưa duyệt thì không sản xuất toàn bộ.

### G7. Sản xuất, kiểm tra và bàn giao
- **Công việc:**
  1. Duyệt nội dung (kịch bản hoặc storyboard) trước, nếu dự án có bước này: đây là **ĐIỂM DUYỆT** thứ nhất.
  2. Sản xuất theo quy trình đã duyệt.
  3. Đo QA tự động; **xem và nghe lại toàn bộ bản xuất**, rút khung ít nhất mỗi 0,5–1 s và nghe toàn bộ âm thanh.
  4. Sửa lỗi, render lại phần liên quan, chạy lại QA.
  5. Chấm MAU_06.
- **Đầu ra (mặc định, điều chỉnh theo hồ sơ dự án):**
  - video cuối;
  - project chỉnh sửa được, kèm media và font, đã kiểm mở lại được;
  - các stem âm thanh;
  - phụ đề (nếu có);
  - lưới khung hình 1 khung/giây;
  - báo cáo QA;
  - kịch bản kèm nguồn;
  - `HUONG_DAN_TIEP_TUC.md` (cách mở project, sửa, xuất lại).
- **Qua bước:** MAU_06 đạt. Báo cáo ghi rõ phần đã xong, giới hạn còn lại và khác biệt so với mẫu.

### G8. Lưu thành tài sản tái sử dụng
- **Công việc:**
  - cập nhật `NHAT_KY_LOI.md` (MAU_07) và `NHAT_KY_PHIEN_BAN.md` (MAU_08);
  - nếu dự án lặp lại nhiều video, đóng gói **skill riêng của dự án** (mục 11);
  - nếu rút ra bài học **đúng cho mọi dự án**, đề xuất bổ sung mục 12 của file này. Phải hỏi chủ dự án trước khi sửa file chung.
- **Đầu ra:** hồ sơ dự án đầy đủ để một phiên Claude khác tiếp tục được mà không cần lịch sử chat.

## 5. Điểm duyệt và khi nào phải hỏi
Mặc định chỉ dừng chờ duyệt ở **2 điểm**:
1. **Nội dung:** kịch bản, storyboard hoặc ý tưởng.
2. **Bản thử:** đoạn hoặc khung thử đặt cạnh mẫu.

Ngoài ra, chỉ hỏi khi:
- Thiếu thông tin bắt buộc mà không suy ra được từ mẫu, ví dụ nền tảng đăng hay ngôn ngữ khi mẫu có nhiều ngôn ngữ.
- Cần đăng nhập, thanh toán, cấp quyền, cài phần mềm hệ thống hoặc đổi cấu hình máy.
- Chi phí vượt mức chủ dự án đặt (ghi trong hồ sơ dự án), hoặc vượt khoảng 10% số dư hiện có nếu chưa đặt mức.
- Không đạt tiêu chí QA sau 2 lượt sửa, hoặc cần nới một ngưỡng.
- Nội dung chạm người thật còn sống, chủ đề nhạy cảm, hoặc nguồn không kiểm chứng được.
- Yêu cầu mới mâu thuẫn với hồ sơ dự án.

Cách hỏi:
- gộp thành một lần, đánh số;
- mỗi câu kèm **phương án mặc định**;
- không hỏi lại những gì đã chốt trong hồ sơ dự án.

## 6. Phân tích video mẫu
### 6.1 Quy trình
1. **Chuẩn bị:** bỏ trùng (md5 + thời lượng); lấy metadata (`ffprobe`: độ phân giải, fps, codec, thời lượng, kênh âm thanh).
2. **Đo tự động:** chạy `python cong_cu/phan_tich_mau.py <video> <thư mục ra>`. Script cho ra:
   - lưới 1 khung/giây;
   - điểm nghi cắt cảnh;
   - độ sáng, bão hòa và độ nét theo thời gian;
   - loudness, true peak, độ mono;
   - khoảng lặng;
   - chuyển động khung (ước lượng);
   - file `do_luong.json`.
3. **Xem bằng mắt:** xem từng lưới khung; xem lại từng điểm nghi cắt ở 12 khung liền nhau để phân biệt cắt cứng, hòa hình, lóa trắng hay cú máy nhanh. **Không tin số cắt tự động khi chưa xem.**
4. **Nghe toàn bộ:**
   - lời: chép hoặc lấy kịch bản gốc, căn mốc từng từ nếu có công cụ;
   - nhạc: có nhịp trống không, sắc thái, mức so với lời;
   - SFX: liệt kê theo mốc và lý do xuất hiện.
5. **Lập bảng theo cảnh / shot:** mỗi dòng gồm mốc thời gian, lời, hình, máy, chuyển cảnh, chữ trên màn hình, âm thanh, chức năng trong câu chuyện (MAU_02).
6. **Tổng hợp nhiều mẫu:** dải số đo, quy tắc chung, biến thể, và phần "vì sao hiệu quả".

### 6.2 Danh mục yếu tố phải phân tích
| Nhóm | Cần ghi |
|---|---|
| Kỹ thuật | độ phân giải, tỷ lệ, fps, thời lượng, loudness (LUFS), true peak, mono/stereo |
| Kịch bản | hook (mấy giây đầu, kiểu gì), cấu trúc hồi, cú lật ở % thời lượng nào, câu chốt, nhịp lời (từ/phút, âm tiết/giây), giọng văn |
| Hình | phong cách render (2D / 3D / live action / ảnh động…), nhân vật (tỉ lệ, nét, biểu cảm), bối cảnh, đạo cụ, màu (bão hòa, sáng, bảng màu chủ đạo), ánh sáng, độ nét |
| Bố cục | cỡ cảnh (toàn / trung / cận), góc máy, vị trí chủ thể, khoảng trống cho chữ |
| Chữ | font (nếu xác định được), cỡ, vị trí (% chiều cao), số từ mỗi lần hiện, màu, viền, hiệu ứng xuất hiện |
| Chuyển động | máy (đẩy / lùi / lia / cẩu / đứng yên, tỉ lệ %), tốc độ, cách tăng giảm tốc, nhòe chuyển động; chuyển động của nhân vật và vật |
| Dựng | độ dài shot trung bình, số cắt cứng, kiểu chuyển cảnh và độ dài (số khung), nhịp đổi hình theo lời |
| Âm thanh | giọng (giới tính, cao độ, năng lượng, nghỉ câu), nhạc (nhịp, giọng, nhạc cụ, mức giữa câu), SFX (mật độ, loại, lý do) |
| Hiệu quả | yếu tố nào giữ người xem ở 3 s đầu, ở giữa, ở cuối; điều gì khiến người xem muốn chia sẻ hoặc xem lại |

### 6.3 Cách đo một số chỉ số (gợi ý, chọn công cụ có sẵn)
- **Loudness, true peak:** `ffmpeg -af ebur128=peak=true`.
- **Độ mono:** so năng lượng kênh Side (L−R) với Mid (L+R).
- **Khoảng lặng:** `silencedetect=n=-40dB:d=0.35`.
- **Nhịp lời:** số từ ÷ thời lượng lời. Nếu có công cụ căn mốc từ (forced alignment, ASR có mốc từ) thì đo thêm âm tiết/giây khi nói và đoạn 3 s dồn nhất. Những số này cho biết giọng có "vừa tai" người nghe hay không: so với dải đo trên mẫu, đừng so với cảm giác.
- **Cao độ giọng:** F0 trung vị (ví dụ `librosa.pyin`).
- **Màu:** bão hòa và sáng trung bình (HSV), tỉ lệ các dải màu.
- **Độ nét:** tỉ lệ năng lượng chi tiết mịn; dùng chỉ số tương đối, ít phụ thuộc cảnh tối.
- **Chuyển động máy:** optical flow trên ảnh thu nhỏ → tốc độ theo thời gian → tỉ lệ đứng yên, độ rộng các cú máy nhanh.
- **Phụ đề:** vị trí và cỡ chữ đo trên khung có chữ trừ khung không chữ (nếu có bản không chữ), hoặc đo tay trên vài khung.

### 6.4 Viết phần "vì sao hiệu quả"
Mỗi nhận định gắn với mốc thời gian và nhãn. Ví dụ:

> "0,0–2,5 s [QS]: hình lạ nhất của cả video xuất hiện ngay khung 0, máy đã chuyển động; câu đầu 14 từ đặt câu hỏi chưa trả lời [ĐO] → người xem ở lại để biết đáp án [SL]."

## 7. Kiểm tra công cụ: thế nào là "khả dụng"
| Loại | Bằng chứng tối thiểu để ghi ĐÃ KIỂM |
|---|---|
| Phần mềm dòng lệnh | `--version` **và** chạy một tác vụ nhỏ thật (ví dụ ffmpeg xuất 1 s video có phụ đề nếu cần phụ đề) |
| Thư viện | import được **và** chạy một hàm thật trên dữ liệu của dự án |
| Phần mềm dựng (NLE) | tạo một project, mở lại hoặc render được ra file đúng thời lượng |
| Connector / API | gọi được hàm đọc (số dư, danh sách); với dịch vụ trả phí, chạy một tác vụ nhỏ nhất sau khi báo chi phí |
| Tài nguyên (giọng clone, font, kho âm thanh) | thấy trong tài khoản hoặc máy **và** dùng thử được một lần |
| Skill / plugin | đã nạp trong phiên **và** nội dung khớp phiên bản cần dùng |

Ghi rõ: phiên bản, ngày kiểm, lệnh đã chạy, kết quả, giới hạn đã biết (tốc độ, chất lượng, quota). Những thứ **người dùng phải làm** gồm: đăng nhập OAuth, thanh toán, cấp quyền hệ thống, cài phần mềm cần quyền quản trị, tải file từ tài khoản riêng của họ.

## 8. Chọn phương pháp sản xuất
Chọn theo **đặc điểm đo được của mẫu**, không theo thói quen. Các câu hỏi cần trả lời:
1. Mẫu là loại nào: 2D vẽ tay, 3D, cắt ghép ảnh, quay thật, chữ động, hay kết hợp? Mức chi tiết và chuyển động máy đến đâu?
2. Cái gì phải **điều khiển chính xác** (khớp lời từng từ, máy theo đường định trước, chữ đọc được) và cái gì **chấp nhận ngẫu nhiên** (nền, texture)? Phần cần chính xác nên làm bằng công cụ điều khiển được (engine, NLE, code). Phần chấp nhận ngẫu nhiên có thể dùng AI tạo ảnh, video hoặc âm thanh.
3. Có bao nhiêu video sẽ làm? Làm nhiều thì đầu tư khung tự động hóa; làm một lần thì chọn cách thủ công nhanh nhất.
4. Máy và ngân sách cho phép gì (GPU, thời gian render, credit)?

Ghi lựa chọn vào `QUY_TRINH_DU_AN.md`, kèm 1–2 phương án đã cân nhắc và lý do loại. Đánh dấu rõ những giới hạn có thể khiến sản phẩm khác mẫu. Ví dụ: "nền là tranh phẳng nên chiều sâu khi máy di chuyển kém mẫu 3D toàn phần".

## 9. Bản thử và đối chiếu với mẫu
1. **Chọn nội dung thử:** những thứ khó nhất và quan trọng nhất của mẫu, không chọn phần dễ.
2. **Làm đúng chuỗi công cụ của bản cuối:** cùng độ phân giải, cùng cách nén, cùng hậu kỳ.
3. **Ghép cạnh mẫu cùng ý:** ảnh ghép khung cạnh khung, đoạn video cạnh nhau, hoặc nghe A/B.
4. **Chấm theo MAU_05:** hình, màu, chuyển động, máy, nhịp dựng, chữ, giọng, nhạc, SFX, khớp nội dung. Mỗi mục ghi Đạt / Chưa đạt, số đo của bản thử và của mẫu, nguyên nhân, cách sửa.
5. **Sửa rồi thử lại** những mục Chưa đạt quan trọng trước khi gửi chủ dự án. Gửi kèm bảng chấm, không chỉ gửi file.
6. **Cập nhật** `QUY_TRINH_DU_AN.md` và `NHAT_KY_LOI.md` theo bài học từ bản thử.

## 10. QA bản cuối và bàn giao
- **Tự động:**
  - thông số kỹ thuật (độ phân giải, fps, thời lượng, loudness, peak);
  - các chỉ số đã chọn làm ngưỡng ở G2;
  - khung đen, khung đứng hình, khung trùng hay rớt (ví dụ `mpdecimate`);
  - âm thanh bị cắt hoặc méo.
- **Bằng mắt và tai:**
  - rút khung ít nhất mỗi 0,5–1 s trên **bản cuối đã có chữ**;
  - nghe toàn bộ;
  - kiểm: chữ không che chủ thể hay chữ cần đọc; vật trong cảnh không che thông tin; lời khớp hình; không lỗi chính tả; nhân vật nhất quán; mạch thời gian và logic trong cảnh đúng (đồng hồ, trang phục, ngày đêm).
- **Project chỉnh sửa được:** mở lại hoặc render lại bằng phần mềm dựng; so thời lượng và loudness với bản cuối.
- **Báo cáo bàn giao:** đường dẫn từng file, số đo QA, những gì đã kiểm bằng mắt, khác biệt so với mẫu, giới hạn còn lại, chi phí đã dùng, việc nên làm tiếp.

## 11. Phiên bản, nhật ký lỗi, cập nhật skill
- **Phiên bản:** mỗi thay đổi về quy trình, thông số hay công cụ của dự án ghi một dòng vào `NHAT_KY_PHIEN_BAN.md` (MAU_08): ngày, phiên bản (`v<lớn>.<nhỏ>`), thay đổi, lý do, ai quyết định. Đổi phiên bản lớn khi thay đổi làm sản phẩm khác đi rõ rệt (màu, giọng, khung hình).
- **Nhật ký lỗi:** mỗi lỗi ghi theo dạng: **dấu hiệu → nguyên nhân → cách sửa → cách phòng** (MAU_07). Trước khi sửa một lỗi mới, tìm trong nhật ký trước.
- **Skill riêng của dự án:** khi dự án làm nhiều video, đóng gói thành skill.
  - Một thư mục `<ten-du-an>/SKILL.md`, phần đầu có `name` và `description` mô tả rõ khi nào dùng.
  - Nội dung tóm tắt hồ sơ dự án, quy trình đã duyệt, ngưỡng QA, lỗi hay gặp, đường dẫn tới hồ sơ đầy đủ.
  - Mỗi lần cập nhật skill thì tăng phiên bản và ghi mục "Thay đổi". Skill dự án **không** chép lại file chung này; chỉ tham chiếu tới nó.
- **Cập nhật quy trình chung (file này):** chỉ khi bài học đúng cho mọi dự án, có bằng chứng từ ít nhất một dự án thật, và chủ dự án đồng ý. Ghi vào mục 12 và tăng phiên bản ở tiêu đề.
- **Bộ bàn giao (khi đổi máy hoặc tài khoản):** gồm file chung + thư mục dự án + danh sách những gì không chuyển được (đăng nhập, giọng clone gắn tài khoản, file kho có giấy phép, thư viện cài trên máy) + một bài kiểm tra ngắn để phiên mới tự xác nhận đã tái lập được.

## 12. Bài học chung đã kiểm chứng (độc lập với dự án)
1. **Render thử khung khó trước khi render đủ.** Ảnh thu nhỏ giấu lỗi mờ, sọc, chữ lặp: phải xem ở 100%.
2. **Đo trước khi sửa.** Ví dụ: đo tốc độ máy trước render, đo màu trên khung thử, mix thử với hình nền trơn rồi đo ngay mức nhạc giữa câu, thay vì đợi QA cuối.
3. **Khi đổi giọng sau khi đã dựng hình,** đừng sửa tay từng mốc thời gian: dùng bảng co giãn thời gian sinh tự động từ hai lần căn mốc.
4. **Tăng tốc giọng** bằng thuật toán giữ cao độ được, nhưng phải đo lại: nhịp so với mẫu, đoạn dồn nhất, cao độ, độ méo. Đổi thuật toán thì đo cả hai rồi mới chọn.
5. **Kiểm khung thiếu hoặc hỏng trước khi ghép.** Khung thiếu ở ranh giới các đoạn render song song làm video ngắn lại.
6. **Script render phải dừng khi lỗi lặp lại,** không khởi động lại vô hạn. Đọc thông báo lỗi trước khi đoán nguyên nhân (ví dụ biến chưa định nghĩa trông giống lỗi bộ nhớ).
7. **Phụ đề và vật trong cảnh:** chữ cần đọc trên vật không được nằm dưới vùng phụ đề; tay hoặc dụng cụ không được che chữ đúng lúc lời nhắc tới chữ đó.
8. **Mạch logic trong cảnh** (giờ trên đồng hồ, trang phục trước/sau, ngày/đêm) phải kiểm riêng khi cảnh dùng lại bối cảnh cũ.
9. **Windows:** đường dẫn có dấu cách luôn đặt trong ngoặc kép; Python in tiếng Việt cần `-X utf8`; PowerShell 5.1 có thể làm hỏng UTF-8 khi ghi file và mất dấu `"` trong JSON truyền qua tham số, nên ghi file bằng công cụ ghi file hoặc Python; Git Bash `/tmp` không phải thư mục Windows (`cygpath -m`); alias `python3` có thể mở Microsoft Store.
10. **Plugin bên thứ ba** (ví dụ plugin OpenFX của phần mềm khác) có thể làm phần mềm dựng crash; cách xử lý là bản chép loại bỏ plugin đó, không gỡ phần mềm của người dùng.
11. **Kho âm thanh tìm theo từ khóa:** thử từ khóa ngắn một từ khi tìm nhiều từ không ra kết quả.
12. **SFX chọn lọc** (chỉ đặt khi có lý do: chuyển cảnh, va chạm thấy được, gag, lộ ra) thường gần mẫu hơn gắn tiếng cho mọi cử động. Mật độ lấy theo đo trên mẫu.
13. **Mỗi lần chủ dự án góp ý về chất lượng,** chuyển góp ý thành quy tắc đo được trong hồ sơ dự án. Ví dụ "sát mặt quá" thành "nhân vật cao 30–50% khung, mỗi bối cảnh mở bằng cảnh toàn"; "màu nhạt" thành "bão hòa X–Y".
14. **Ý tưởng nội dung:** khi chủ dự án chê "khô" hoặc "dở", đừng chỉ đổi đề tài mà đổi cả *loại* câu chuyện. Hỏi: chuyện có người thật, tình huống thật nghe như bịa, có cú lật, và người xem có tự liên hệ bản thân không?

## 13. Danh mục mẫu đi kèm (`mau/`)
| File | Dùng ở | Nội dung |
|---|---|---|
| `MAU_01_HO_SO_DU_AN.md` | G1 | mục tiêu, nền tảng, thông số + nguồn, giới hạn, quyết định đã chốt |
| `MAU_02_PHAN_TICH_VIDEO_MAU.md` | G2 | phân tích một video theo mốc + tổng hợp nhiều mẫu |
| `MAU_03_QUY_TRINH_DU_AN.md` | G3 | quy trình riêng: bước, đầu vào/ra, công cụ, tiêu chí; TÁI DÙNG/ĐIỀU CHỈNH/MỚI |
| `MAU_04_BANG_KIEM_CONG_CU.md` | G0, G4, G5 | bảng kiểm công cụ, tài nguyên, thành phần thiếu |
| `MAU_05_CHECKLIST_BAN_THU.md` | G6 | chấm bản thử cạnh mẫu |
| `MAU_06_CHECKLIST_BAN_CUOI.md` | G7 | QA tự động + xem tay + bàn giao |
| `MAU_07_NHAT_KY_LOI.md` | mọi giai đoạn | lỗi → nguyên nhân → sửa → phòng |
| `MAU_08_NHAT_KY_PHIEN_BAN.md` | G8 | lịch sử phiên bản quy trình / skill của dự án |

Công cụ: `cong_cu/phan_tich_mau.py` đo tự động một video mẫu (cần ffmpeg/ffprobe; numpy và opencv nếu có thì đo thêm). Cách dùng ở `cong_cu/README.md`. Đây chỉ là **bước đo thô**; phần xem và nghe vẫn phải làm.

## 14. Câu lệnh khởi động
Xem `01_CAU_LENH_KHOI_DONG.md`: một bản cho dự án mới, một bản cho phiên tiếp theo của dự án đã có.
