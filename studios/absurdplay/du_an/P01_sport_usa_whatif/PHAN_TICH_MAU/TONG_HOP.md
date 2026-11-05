# TỔNG HỢP 23 VIDEO MẪU — @whatifbagel (P01)
> **05/11/2026: phụ đề, chuyển cảnh, máy, màu đã đo lại — dùng số trong `HIEU_CHINH_V06.md`, không dùng số cũ ở mục 1–2 cho các hạng mục đó.**
Ngày: 03/11/2026 · Mẫu: 23 video đăng 20/10–02/11/2026, đã bỏ trùng (23 md5 khác nhau) · Nhãn: [QS] quan sát · [ĐO] đo · [SL] suy luận

Nguồn số đo: `do_tu_dong/*/bao_cao.md` (phan_tich_mau.py), `shots/*/shots.json` (bang_shot.py), transcript Whisper có mốc từ, đo phụ đề trên 115 khung 1080p, librosa (F0, phổ nền). Mỗi video có file phân tích riêng ở thư mục này. Xem bằng mắt từng shot: 5 video (Cowboys vs 50 babies, McGregor/Anne Frank, LeBron/asteroid, Kawhi/Genghis Khan, Falcons vs Bucs). 18 video còn lại: xem qua ảnh ghép shot, chưa kiểm từng điểm cắt.

## 1. Bảng đặc điểm và ngưỡng
| Đặc điểm | Có ở | Dải (min / trung vị / max) | Quy tắc đề xuất | Ngưỡng QA đề xuất |
|---|---|---|---|---|
| Khung hình | 23/23 | 1080x1920, 30 fps [ĐO, bản 1080p] | dọc 9:16, 1080x1920, 30 fps | đúng tuyệt đối |
| Thời lượng nội dung | 23/23 | 55 / 74 / 82 s [ĐO] | 60–80 s; format mới (từ 22/10) 61–82 s | 55–85 s |
| Lời bắt đầu | 23/23 | 0,0 s [ĐO] | câu hook đọc ngay khung 0, không intro | lời ≤ 0,1 s |
| Hook = câu hỏi "Could …?" | 23/23 | câu đầu 8 / 11 / 17 từ [ĐO] | Could + [sao + mốc phong độ] + [kỹ năng thành động từ] + [đối thủ phi lý]? | câu đầu bắt đầu "Could" và kết "?" |
| Nhịp lời | 23/23 | 146 / 160 / 168 từ/phút [ĐO] | giọng đọc nhanh, đều, không ngắt dài | 150–170 từ/phút |
| Khoảng lặng > 0,35 s trong phần lời | 0/23 | 0 [ĐO] | không để lặng; nhạc nền luôn chạy | 0 |
| Cú xoay | 18/23 dùng cụm chuẩn | 21 / 37 / 87 % thời lượng lời [ĐO] | "except…", "But there's one problem.", "So, naturally, they call X." | có ở 20–45 % |
| Kết "Final score / Final stat line" | 14/23 | 83 / 91 / 96 % [ĐO] | đọc tỉ số/số liệu cuối như bản tin, rồi 1 câu chốt troll | kết quả ở 85–95 %, câu chốt ≤ 4 s |
| Số shot | 23/23 | 21 / 38 / 46 [ĐO, tự động] | ~1 shot cho mỗi 1–2 cụm lời | 30–50 shot / 70 s |
| Độ dài shot (lời ÷ số shot) | 23/23 | 1,56 / 1,88 / 2,72 s [ĐO] | đổi hình theo nhịp câu; shot ≤ 4 s trừ shot mở/kết | trung vị 1,5–2,2 s |
| Shot đầu | 23/23 | 1,0 / 1,6 / 6,4 s [ĐO] | cắt sang shot 2 ngay giữa câu hook | ≤ 3 s (trừ shot hook có máy bay) |
| Chuyển cảnh | 5/5 đã xem | gần như toàn cắt cứng; 1 lóa trắng 1–2 khung ở cú xoay (Cowboys 14,3 s) [QS] | cắt cứng; lóa trắng chỉ cho cú xoay | hòa hình = 0 |
| Máy | 23/23 | % đứng yên 6 / 15 / 30 %; chuyển động trung vị 3,7 / 7,3 / 14,8 px/s (ảnh rộng 180) [ĐO] | máy luôn trôi chậm (đẩy/lia/bay quanh), rất ít khung tĩnh hoàn toàn | % đứng yên ≤ 30 % |
| Màu | 23/23 | bão hòa 92 / 112 / 144; sáng 91 / 130 / 167 (HSV 0–255) [ĐO] | màu rực vừa, sáng; mỗi bối cảnh một tông chủ đạo | bão hòa 95–145, sáng 95–165 |
| Phụ đề | 23/23 | xem mục 2 [ĐO] | vàng, chữ thường, đậm, viền đen, giữa, 2–4 từ | vị trí ±15 px, cỡ ±10 % |
| Bug tỉ số / thẻ số liệu | 23/23 (đã xem 5/5 + ảnh ghép) | ~1 thẻ mỗi 2–3 shot [QS] | mọi con số được đọc ra đều có đồ họa | mỗi số liệu đọc ra có thẻ ≥ 80 % |
| Loudness bản TikTok | 23/23 | −20,3 / −14,2 / −13,7 LUFS; true peak −8,3 / −2,4 / +0,3 dBFS [ĐO] | xuất −14 LUFS, true peak ≤ −1 dBFS | −15 … −13 LUFS, TP ≤ −1 |
| Nhạc nền | 23/23 | nền giữa câu thấp hơn lời 6–11 dB; 12–78 % năng lượng nền < 150 Hz [ĐO] | luôn có nhạc có bass/kick dưới lời | nhạc giữa câu thấp hơn lời 8–12 dB |
| Giọng | 23/23 | F0 trung vị 121 / 182 / 250 Hz [ĐO, có thể lẫn quãng tám] | nam, năng lượng cao, kiểu bình luận viên | — |

## 2. Phụ đề (đo trên 115 khung 1080p của 20 video) [ĐO]
- **Màu** RGB ≈ (244, 243, 2): vàng thuần #F5F500 sau nén → dùng `#FFFF00`/`#F5F500`.
- **Vị trí:** căn giữa (tâm x trung vị 539 px); dải x-height 1276–1309 px → **đường chân chữ ≈ 1309 px = 68 % chiều cao**.
- **Cỡ:** x-height ≈ 33 px → tương đương **Montserrat Bold/ExtraBold 60 px** ở khung 1080x1920 (đã render thử, đặt cạnh mẫu: khớp vị trí và bề rộng ±6 px) [ĐO].
- **Viền:** đen ~3 px + đổ bóng mềm ~1–2 px [QS].
- **Kiểu:** chữ thường, giữ dấu câu, 2–4 từ mỗi lần, ngắt theo cụm nghĩa; số viết bằng chữ khi đọc ("forty-five thousand miles") [QS].
- **Font gốc:** chưa xác định; Montserrat là bản tương đương gần nhất đã kiểm [SL].

## 3. Ngôn ngữ hình (quan sát trên 5 video xem kỹ + ảnh ghép 23 video) [QS]
- **Kiểu render:** 3D thời gian thực, low-poly vừa, tô màu phẳng có bóng đổ mềm, không viền nét. Trông giống engine game hoặc WebGL, không phải render path-tracing [SL].
- **Nhân vật:** người 3D tỉ lệ thật (đầu ~1/7), mặt hoạt hình mắt trắng to, lông mày dày, biểu cảm rõ ở cận cảnh. Ngôi sao được làm riêng (râu, hình xăm, kiểu tóc, số áo, màu đội). Đám đông lính/cầu thủ/khán giả dùng bản sao cùng model. Animation kiểu thư viện mocap (chạy, đấm, ngã, ngồi, ăn mừng) [SL].
- **Bối cảnh:** sân vận động/nhà thi đấu có khán đài texture nhiều màu + băng LED chạy chữ; bối cảnh lịch sử low-poly (phố, tường thành, rừng); vũ trụ/Trái Đất. Có hiệu ứng thời tiết (mưa, tuyết, hạt bụi, pháo giấy).
- **Đồ họa kiểu truyền hình (bộ nhận diện của kênh):**
  1. Bug tỉ số trên cùng (~6 % từ đỉnh): 2 ô màu đội + tỉ số + hiệp/đồng hồ + ô vàng down&distance + dòng phụ nhỏ (giải · sân).
  2. Thẻ số liệu giữa trên (~15–25 % chiều cao): dải tiêu đề vàng/hồng/đỏ đội chữ nhỏ in hoa → ô navy/đen chữ trắng rất đậm cỡ lớn → dòng phụ vàng.
  3. Thẻ số liệu nhiều dòng, điền giá trị đúng lúc từ được đọc.
  4. Chữ 3D trong cảnh: vàng, kiểu pixel/retro, viền đen ("PRO ATHLETES", "THE PLAYOFFS", "WIDE OPEN", "FAKE RETREAT").
  5. Tag nhỏ: "▶ REPLAY", "STARTING QB", "REPLAY / PULL COUNTER".
  6. HUD/đạo cụ có chữ: chữ máy đánh hiện dần, đồng hồ đếm ngược, thước đo, bản đồ chiến thuật, bảng trắng viết tay, biển phố.
  7. Bảng tỉ số cuối "FINAL" lớn.
- **Cỡ cảnh:** chủ yếu toàn/trung; cận mặt dành cho phản ứng (sau gag hoặc trước cao trào); góc cao từ trên xuống cho đội hình/bản đồ.
- **Hình theo lời:** mỗi danh từ/động từ chính có hình tương ứng ngay trong shot đó ("spinning back kick" → đá xoay; "nobody rotates" → khủng long đứng im).
- **Logo watermark** TikTok + @whatifbagel là của nền tảng, không thuộc video gốc.

## 4. Vì sao kênh hiệu quả
| Giai đoạn | Yếu tố | Bằng chứng | Nhãn |
|---|---|---|---|
| 0–3 s | Câu hỏi ghép 2 thứ không liên quan + hình đối đầu ngay khung 0; lời từ 0,0 s | 23/23 | [ĐO]/[QS] |
| 0–3 s | Bug tỉ số/thẻ tiêu đề làm video trông như truyền hình thật | Cowboys, Packers, Falcons | [QS] |
| Giữa | Số liệu thật của ngôi sao tạo uy tín, rồi lật bằng một câu | cú xoay trung vị 37 % | [ĐO] |
| Giữa | Đổi hình mỗi ~1,9 s, mỗi câu có gag hình + đồ họa, không có giây nào đứng yên | trung vị shot 1,88 s; lặng 0 | [ĐO] |
| Kết | Tỉ số như bản tin + 1 câu troll ngoài truyện dựa trên meme fan biết | 23/23 | [QS] |
| Chia sẻ | Nhắm đúng nỗi đau của fan một đội/ngôi sao (Cowboys playoff, Packers vs Bears, Josh Allen vs Mahomes) → fan đối thủ gửi cho nhau | share rate tới 5,4 % | [ĐO]/[SL] |

Thứ hạng nhóm (view trung vị): Troll đội hay thua 1,4M > Sao vs lịch sử 512K > Sao vs hư cấu 177K ≈ Trận thật 188K [ĐO].

## 5. Biến thể
- **Format cũ (20–21/10, 3 video):** lập luận "To answer this… But there's one problem… Therefore…", ít đồ họa, máy đứng nhiều hơn. Kênh đã bỏ → **không dùng**.
- **Format mới (từ 22/10):** tường thuật trận có tỉ số. **Dùng format này.**
- **Bối cảnh:** sân đấu (nhóm troll) hoặc thế giới lịch sử (nhóm lịch sử); flashback đen trắng khi nhắc trận cũ.

## 6. Đặc điểm khó tái tạo nhất (đưa vào bản thử G6)
1. **Nhân vật** giống ngôi sao với mặt hoạt hình biểu cảm, số áo, râu/tóc riêng, kèm animation hành động thể thao (ném, bắt, rê, đá, đấm).
2. **Bối cảnh lớn** (sân vận động có đám đông, thành phố lịch sử) render đủ nhanh trên CPU.
3. **Đồ họa truyền hình điền theo lời** đúng từng từ.
4. **Máy luôn chuyển động** mà vẫn giữ chủ thể trong vùng an toàn, không bị phụ đề che.

## 7. Điều chưa chắc, cần chủ dự án xác nhận
- Phần mềm, engine, nguồn model, font đồ họa và bản nhạc gốc: **chưa biết**.
- Việc dùng tên/hình ảnh cầu thủ thật và logo đội/giải thật: mẫu có dùng (logo NFL/UFC). Đề xuất: tên thật trong lời là được (bình luận, châm biếm), nhưng **không dùng logo/nhãn hiệu đội, giải** trên hình, thay bằng màu đội + chữ.
- Chủ đề dark humor về thảm kịch (Holocaust, Astroworld, 11/9…): mẫu dùng; đề xuất tránh vì rủi ro bị hạn chế phân phối.
