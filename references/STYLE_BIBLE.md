# RickClips — Style Bible (tổng hợp từ 18 video mẫu)

Phiên bản 2026-10-29. Nguồn: 18 video khác nhau (bỏ 7 bản trùng md5), tổng ~17,4 phút, đều 720×1280, 30 fps.
Ký hiệu: **[QS]** = quan sát/đo trực tiếp trên video; **[SL]** = suy luận, chưa kiểm chứng; **[CHỌN]** = quyết định của kênh khi thiếu dữ liệu gốc (có căn cứ đo, nhưng không khẳng định là cách kênh gốc làm). Ví dụ ghi dạng `V4@20s` = video V4 giây 20.
Bảng số liệu đầy đủ: `metrics/summary.csv`; ghi chép từng video: `per_video/V01.md … V18.md` (V1 = V01).

> **Ưu tiên khi lệch nhau (cập nhật 2026-10-31, skill bản 7):** Style Bible là bằng chứng ĐO TRÊN MẪU. Các quyết định dựng sau góp ý chủ kênh nằm trong `SKILL.md` và thắng ở phần thiết kế/quy trình: nhân vật đầu trắng méo nhẹ, viền xanh đen biến thiên, mắt chấm (thay mô tả §2.1 "đầu kem, tròng trắng"); KHÔNG dùng DOF làm mờ nền, render siêu lấy mẫu 2×; nhạc nền tạo bằng Magnific, bed −23 LUFS (thay −20 ở §10.3); SFX chọn lọc ~1 cue/1,5 s từ kho EditorNghiepDu; QA 21 mục (thêm độ nét, bão hòa, đứng hình, khung đen).

| ID | Video | Dài | Thể loại |
|---|---|---|---|
| V1 | The Window That Breaks Japan's Gambling Law | 45 s | luật/xã hội, có thật |
| V2 | Why Cashiers Keep Winning The Lottery | 58 s | gian lận có thật |
| V3 | Every Memory Has a Price | 78 s | hư cấu cảm động |
| V4 | An Unstoppable Spear vs an Unbreakable Shield | 45 s | ngụ ngôn/nghịch lý |
| V5 | He Could Spot Winning Tickets Just by Looking | 63 s | có thật (lỗ hổng vé cào) |
| V6 | The Job Nobody Wants in Japan | 61 s | xã hội có thật |
| V7 | The Town Built Around a Button | 66 s | hư cấu bí ẩn |
| V8 | The Ancient Jar That Warned an Empire | 65 s | lịch sử khoa học |
| V9 | Why the Second Draw Always Wins | 56 s | khoa học phản xạ |
| V10 | The Burglar Who Only Moved Furniture | 58 s | hư cấu hài |
| V11 | How a Mirror Rigged a Horse Race | 64 s | giai thoại lừa đảo |
| V12 | Your Brain's Secret Idea Zone | 39 s | khoa học não, ngôi thứ 2 |
| V13 | This Knight Found the Ultimate Loophole | 41 s | giai thoại trung cổ |
| V14 | How Painkillers Actually Work | 34 s | khoa học cơ thể |
| V15 | Why Humans Can't Pick Random Numbers | 47 s | thống kê (Benford) |
| V16 | The Scientist's Insane Time Test | 40 s | thí nghiệm thần kinh |
| V17 | Would You Upload Your Brain? | 57 s | công nghệ, kết bằng câu hỏi |
| V18 | What the Grave Bell Really Meant | 60 s | lịch sử đen, twist |

---

## 1. Thông số kỹ thuật [QS]
- 720×1280, 30 fps (cả 18). Thời lượng 34–78 s, trung vị 57 s. Ba nhóm: ngắn 34–47 s (khoa học 1 ý), chuẩn 56–66 s, dài 78 s (truyện cảm xúc).
- Loudness tích hợp: −14,1 LUFS (11 video) hoặc −15,1 ±0,6 (7 video); true peak −1,4 … −3,8 dBFS.
- **Gần như mono**: năng lượng kênh Side thấp hơn Mid 24–36 dB (trung vị −30 dB). → Mix mono hoặc stereo rất hẹp.
- Hình sáng: luma trung bình 120/255 (66–157); bão hòa 113 (77 = V17 pastel, 132 = V3 đêm neon).

## 2. Nhân vật
### 2.1 Thiết kế chuẩn (giống nhau ở mọi video) [QS]
- Đầu: lớn, màu kem/trắng ngà, hình bầu dục hơi bè ngang, viền mực nâu-đen dày; chiếm **~30–34% chiều cao người đứng** [QS — đo pixel 5 nhân vật đứng thẳng ở 4 video (V16@31,5 s ×2, V10@13,5 s, V9@13,5 s, V7@22,5 s): 31%, 31%, 33%, ~30% (đội mũ), 34%]. Thân viên nhộng ~28–30%; chân que ~37–38% khi máy ngang tầm mắt (máy nhìn từ trên xuống làm chân ngắn còn ~25%, như V7@22,5 s). Dựng: đầu 32%, thân 30%, chân 38% ở tư thế đứng, máy ngang.
- Bộ ảnh toàn thân người dùng cung cấp (37 ảnh, 14 video) **do AI tái tạo** — chính tài liệu ghi rõ nét, màu, phụ kiện, tỉ lệ có thể khác gốc. Dùng làm tham chiếu **trang phục/phụ kiện/dáng** (đối chiếu 6 ảnh với khung gốc: khớp nhận diện, trang phục); KHÔNG dùng làm chuẩn tỉ lệ hay kiểu render (ảnh là nét phẳng viền dày, còn video gốc biến thể A là 3D đổ bóng mềm).
- Mắt: tròng trắng viền mực + con ngươi đen có điểm sáng. Mí trên che theo biểu cảm. Mày ngắn dày. Miệng nhỏ; khi cười/sợ thì lộ hàng răng trắng chia vạch.
- Thân: ống/viên nhộng có khối, áo màu đặc bão hòa, chi tiết trang phục cụ thể (cà vạt, dây đeo thẻ, nơ, tạp dề, áo choàng, giáp). Tay chân là nét mực đen mảnh; bàn tay tròn nhỏ; giày nhỏ tối.
- Tóc/mũ là dấu hiệu nhận dạng chính: tóc nâu bát úp (người thường), tóc đỏ dựng (V3), tóc xoăn (V2), búi tóc (V18), mũ cảnh sát phẳng, mũ cao bồi, mũ quả dưa, mũ ngủ sọc, vương miện, mũ quan.
- Nhân vật lịch sử có thật vẽ cùng khuôn (Edison V12@21s: tóc chải + vest).
- Nhân vật phụ cũng có biểu cảm và hành động riêng (đám đông cười chỉ trỏ V11@4s, khán giả nhìn chằm chằm V7@57s).

### 2.2 Màu áo theo vai trò [QS → quy tắc]
| Vai | Dấu hiệu | Ví dụ |
|---|---|---|
| Nhân vật chính "người thường" | áo 1 màu tươi (cam, xanh, vàng, tím, đỏ), đôi khi dây thẻ/kính | V1 cam, V5 vàng+dây thẻ, V12 xanh, V14 tím |
| Quyền lực/công quyền | xanh navy hoặc đen + mũ/huy hiệu; vest đen cà vạt đỏ | cảnh sát V1/V7/V10, sếp V6 |
| Phản diện/bí ẩn | đen, trùm mũ, kính râm, cười nhe răng | chủ tiệm V3, người bán qua ô cửa V1 |
| Chuyên gia | áo blouse trắng, kính tròn, tóc búi | V16, V17, kiểm toán V15 |
| Hai phe | 2 màu đối lập nhất quán trên mọi vật (áo, cờ, huy hiệu, thùng) | đỏ ↔ teal V4 |
- Giữ nguyên màu/trang phục nhân vật suốt video; nhân vật xuất hiện lại trong cảnh hồi tưởng/mơ vẫn cùng thiết kế.

### 2.3 Biểu cảm & phản ứng [QS]
- Biểu cảm đổi theo đúng chữ, có khi 3 lần trong 1 khung giữ: V5@14–16 "celebrating → normal → gets suspicious"; V2@40–43 cười → sốc đúng chữ "officers".
- Bộ biểu cảm hay dùng: tỉnh bơ mí nửa khép (mặc định của người kể "biết chuyện"), cười nhe răng, mắt tròn con ngươi nhỏ + mồ hôi (sốc), nhăn "><" (đau V14@3s), mắt ứa lệ (V3@46s), cười gian dưới vòng sáng (V2@13s), mặt xanh lè (ghê, V5@3s).
- Hiệu ứng kèm: giọt mồ hôi, vạch đau đỏ quanh đầu (V14@1s), tia năng lượng vàng (V9@15s), "Z" ngủ (V8@33s), dấu "? ? ?" trôi (V12@25s), vòng sóng âm (V12@17s).
- Nhân vật nói thoại: miệng mấp máy theo câu (V6@14–15, V10@19–20).

## 3. Bối cảnh, phụ kiện, đồ vật
### 3.1 Ba biến thể render (chọn 1, giữ suốt video) [QS]
| Biến thể | Đặc điểm | Video |
|---|---|---|
| A. 3D tô mềm (mặc định, 16/18) | Khối 3D thật, ánh sáng có hướng + bóng đổ, texture vẽ tay, KHÔNG viền mực trên kiến trúc; đạo cụ nhỏ có thể có viền mảnh | V1–V5, V7–V16, V18 |
| B. Cel phẳng viền mực toàn cảnh | Tường, bàn, cửa đều có nét đen; màu đặc; nắng thành mảng cứng | V6 |
| C. Pastel hạt phim | Màu nhạt, nhiễu/grain, vignette, bối cảnh ít vật | V17 |
- [SL] Kênh dùng A cho hầu hết; B/C có thể là thử nghiệm hoặc studio khác → khi sản xuất: mặc định A.

### 3.2 Mật độ & tính "đọc được"
- Bối cảnh dày chi tiết, có địa danh/biển hiệu tiếng Anh đọc được ngay: "PRIZE HALL", "STATE LOTTERY PRIZE CLAIMS", "OUR WINNERS", "CAREER DEVELOPMENT ROOM", "BAIT · GAS", "Desert State Bank", "LONE STAR THRILLS". Bối cảnh nước ngoài thêm chữ bản xứ (kanji V1, V6).
- Kiến trúc ưu tiên "dễ đọc + đẹp" hơn chính xác lịch sử: chuyện Trung Hoa cổ (V8) dựng cung điện kiểu châu Âu, chỉ giữ mũ/áo quan Á Đông [QS]; lý do [SL].
- Mỗi bối cảnh có 1 màu chủ đạo dễ nhớ: tường xanh lá + gỗ (quầy vé số V2), đỏ-hồng (trong cơ thể V14), xanh tím neon (đêm Nhật V1), cam đào sa mạc (V15), tuyết xanh + đèn vàng (V18).

### 3.3 Đồ vật làm nhiệm vụ kể chuyện [QS] — quy tắc quan trọng nhất của đạo cụ
1. **Tài liệu cận đọc được** chứng minh tình tiết: giấy xá tội "One Crime… Next Week… Forgiven… 40 coins" (V13@3s), chứng tử "S. HOLT Oct. 21, 1894" (V18@40s), séc "STATE TREASURY $87,439" (V15@0s), vé "REEL BIG CASH" (V2@1s), bản vẽ "PIERCES ANYTHING / PIERCED BY NOTHING" (V4@34s), tờ rơi "*The procedure is 100% fatal" (V17@45s).
2. **Bộ đếm/đồng hồ** cho thời gian & số liệu: bảng lật "YEARS AT WAR 099→100" rồi "DAYS OF PEACE 001" (V4), đồng hồ bấm "0047→0048" (V7), bộ đếm "0299/0300" (V3), "NOW SERVING 4813" (V17), đồng hồ LED "CHRONO-2" (V16), lịch "NOV FRI 25" bị xé (V6).
3. **Đo lường cụ thể hóa con số trong lời**: thước dây đúng "1 inch" (V10@4s), cân "HAPPINESS" (V3@28s), bảng giá tội (V13@8s), bảng tỉ lệ cược (V11).
4. **Số liệu dựng bằng vật** (không dùng biểu đồ phẳng): chồng ảnh thành cột "CLERKS vs EVERYONE ELSE" (V2@45s), chồng séc thành biểu đồ (V15@35s), chữ số 3D khổng lồ như tòa nhà (V15@26s), khay 10×10 đồng xu (V15@32s), chồng giấy dày/mỏng = lượng ký ức (V16@33s), 2 đội quân xếp thành mũi tên (V4@22s).
5. **Vật lặp làm sợi chỉ cảm xúc/mô-típ**: con ếch (V3), ghế đỏ + mèo cam (V10), kính lúp (V15 ×3), nút đỏ (V7), chuông (V18).
6. **Ẩn dụ không gian cho khái niệm trừu tượng**: cơ thể = ngôi nhà, cơ quan = phòng, đau = chuông báo (V14); "phòng điều khiển trong đầu" có 2 cửa sổ tròn = mắt (V9@45s, V16@7s); giấc ngủ = chìm xuống nước có thước tầng (V12@24s); địa chấn = mặt cắt địa tầng (V8@62s); mộ = mặt cắt lòng đất (V18@4s).
7. **Nhân hóa tác nhân**: viên thuốc có mặt và tay chân (V14), não hồng ngồi vẽ (V16).

## 4. Ánh sáng & màu kể chuyện [QS]
| Tình huống | Ánh sáng/màu | Ví dụ |
|---|---|---|
| Ngày bình thường | trời xanh, mây trắng bông, nắng ấm có bóng đổ rõ | V4, V9, V13 |
| Nội thất ban ngày | ấm, đèn treo; nắng xiên thành mảng | V2, V6@10s |
| Đêm | xanh lam/tím + cửa sổ/đèn vàng ấm; mặt đường ướt phản chiếu | V1, V3, V18 |
| Bí mật/âm mưu | khung tối + 1 nguồn sáng duy nhất (ô cửa sổ, đèn bàn) dẫn mắt | V1@31s, V6@50s |
| Suy nghĩ thầm/tham lam | khung đen + vòng sáng tròn quanh mặt | V2@12s |
| Giấc mơ/tưởng tượng | đổi hẳn bảng màu: neon tím-hồng, trăng hồng khổng lồ | V2@17s |
| Ký ức hạnh phúc | hoàng hôn vàng ấm, lóa | V3@39s |
| Mất mát/buồn | xanh lạnh, 1 bên ấm 1 bên lạnh trong cùng khung | V3@66–77s |
| Bên trong cơ thể | đỏ-hồng bão hòa | V14 |
| Thời gian trôi | đổi giờ ngay trong 1 khung giữ (ngày→hoàng hôn→đêm→bình minh) | V4@18s, V18@46–52s |
| Cao trào | ánh sáng toàn cảnh đổi màu đột ngột | V7@45–48s |
| Chuyển cảm xúc lớn | lóa trắng toàn khung | V3@64s, V2@23s |
- Kết video thường ở hoàng hôn/bình minh ngược sáng (V13@39s, V18@53s) [QS, 2/18 rõ rệt].

## 5. Bố cục, góc máy, chuyển động camera
### 5.1 Số đo (optical flow, cửa sổ 0,5 s) [QS]
| Chỉ số | Trung vị | Khoảng |
|---|---|---|
| Đứng yên hoàn toàn | 1,5% thời lượng | 0–7% |
| Đẩy vào (push-in) | 39% | 22–68% |
| Lùi ra | 15% | 3–23% |
| Lia/trượt ngang | 20% | 3–34% |
| Ngửa/chúc/cẩu dọc | 20% | 3–48% |
| Đổi kiểu chuyển động | mỗi ~1,0 s (p75 1,5 s; p90 2,5 s) | |
| Tốc độ đẩy vào | ~10–15%/s phóng lớn (trung vị ≈12%/s) | V2 thấp ~5%/s, V14 rất cao |
| Cú máy nhanh có nhòe | ~10 lần/phút (1 lần mỗi ~6 s) | 1–17/phút |
- Máy KHÔNG bao giờ đứng yên lâu; "giữ khung" thực chất là đẩy rất chậm (V3@66–77s, V18@46–52s).

### 5.2 Ngữ pháp khung hình [QS]
- **Insert từ trên xuống (top-down)** cho mọi vật trên mặt phẳng: vé, ví, giấy tờ, bản đồ, khay, giường ngủ (V2@1,14,51s; V5@45s; V10@26s; V15@32s).
- **Một điểm tụ dọc hành lang/lối đi** để đẩy sâu: sảnh pachinko (V1@5s), thảm điện (V8@5s), hành lang cơ thể (V14@17s).
- **Đối xứng trái–phải** cho 2 phe/đối đầu (V4, V9@4s).
- **Cẩu lên cực cao** lộ quy mô (thành phố V1@4s, thị trấn tròn V7@5s, đám đông V7@53s, quân đội V8@14s).
- **Khung trong khung/POV**: lỗ mắt mèo (V10@22s), ống nhòm (V11@18s), ống ngắm đỏ (V5@48s), kính lúp (V15), cửa sổ tròn = mắt (V9, V16), màn hình máy tính/điện thoại (V6@24s, V17@20s).
- **Tiền cảnh** che 1 phần: vai người, chén (V8@20s), song sắt (V8@37s, V15@43s), quầy.
- **Cận cực đại** cho gag mặt & vật mấu chốt (nút V7@23s, đầu rồng V8@1s, bi rơi).
- **Phá bức tường thứ tư**: vật chĩa thẳng ống kính — súng (V9@0s), form ký (V17@56s).

## 6. Hành động & tương tác với vật [QS]
- Mỗi động từ trong lời có hành động thấy được: "smash" → bi đập đĩa + sóng (V12@16s); "tucking it" → nhét vé vào ví (V2@14s); "slides" → token trượt qua ô cửa (V1@42s); "trips… cable" → vấp rút phích (V17@23s); "dig him" → xúc đất (V18@44s).
- **Gag cụ thể hóa theo nghĩa đen**: não trong lọ bơm oxy ở trạm "AIR & WATER" (V17@9s); con ngựa 100-1 là ngựa kéo xe sữa (V11@33s); quỷ chui lên khi nói "to hell" (V13@34s).
- **Vật chuyển động có vật lý**: mảnh heo đất văng (V11@1s), giấy cược rơi như tuyết (V11@3s), tiền đổ xuống (V11@62s), vé bay (V5@27s), đạn bay chậm (V9@1s), người rơi tự do (V16@2s).
- **Vật biến mất theo chữ**: bàn ghế bị dọn chỉ còn lỗ ốc (V6@43–47s).

## 7. Chuyển cảnh & nhịp dựng [QS]
- **Cắt cứng hiếm nhưng CÓ** [QS — quét 2 ngưỡng trên 18 video + xem từng khung 27 điểm nghi vấn, 29/10/2026]: **6 cắt cứng ở 5/18 video**, tối đa 2/video, 13/18 video không có cắt nào:
  - V4@28,0 s (ngoài lò rèn giữ yên → trong lò rèn), V15@14,3 s (đẩy vào tòa nhà → cắt vào trong thang máy), V8@3,07 s (ngai vàng → cận nhà phát minh), V14@2,17 s (cùng nhân vật, nhảy sang hành động kế), V16@23,7 s (bản vẽ → lưới chân tháp), V16@35,9 s (văn phòng → tiệc nướng).
  - Kiểu dùng: (a) **ngoài → trong** cùng một địa điểm sau cú đẩy vào/giữ cảnh; (b) **nhảy hành động** cùng nhân vật; (c) đổi bối cảnh ở nhịp đếm/liệt kê nhanh. Không có cắt cứng trong 3 s cuối.
  - Báo cáo kiểm đếm do người dùng cung cấp ghi "0 cắt cứng (0/163)" — **sai ở cả 6 điểm**: 4 điểm bị ghi là hòa hình/zoom (V8@0:02 "hòa hình về nhà phát minh", V15@0:13 "zoom vào thang máy", V16@0:23 và @0:35 "hòa hình"), 2 điểm không có trong nhật ký (V4@0:28, V14@0:02).
- Đổi bối cảnh còn lại bằng:
  1. Cú máy nhanh có nhòe nối 2 không gian (V13@2,6s: lia dọc bảng giá → toàn cảnh sạp).
  2. **Hòa hình nhanh — kỹ thuật chính**: đo từng khung 3 lần ở V4 (@12,0 s, @23,9 s, @43,5 s) = 6–8 khung (0,2–0,27 s) ở 30 fps; báo cáo người dùng: 4–8 khung. Mặc định dựng **7 khung (0,23 s)**. Hòa hình 1–2 khung khi đổi sang/ra góc nhìn ống nhòm (V11@18,3 / 19,0 / 20,3 s).
  - Mật độ chuyển cảnh: báo cáo người dùng đếm 163 điểm / 831 s (≈1 điểm mỗi 5,1 s; 104 hòa hình, 59 chuyển cảnh động). Bộ dò hòa hình tự động (dissolve.py, mô hình trộn tuyến tính) cho cùng bậc độ lớn (~160 sự kiện, có lẫn đổi ánh sáng ngày/đêm) → chấp nhận **≈1 chuyển cảnh / 4–6 s** làm định hướng; **số theo từng video của báo cáo không dùng** vì tự mâu thuẫn (ví dụ V4: bảng tổng ghi 6 điểm, nhật ký liệt kê 8) và có phân loại sai (V4@0:32 thực là hòa hình, báo cáo ghi lia dọc; V4@0:37 thực là đẩy xuyên tờ giấy rách, báo cáo ghi hòa hình).
  3. Đẩy xuyên vật/màn hình (V17@11,6s: vào màn hình máy tính; V1@24s qua cửa; V8@49s vào trong bình).
  4. Lóa trắng (V3@64s, V2@23s) và iris tròn đen (V9@44s, V16@7s) cho chuyển cảnh "vào trong đầu/ký ức".
- Hình thay đổi (bối cảnh mới, vật mới, biểu cảm mới) khớp với cụm chữ: chữ đổi trung vị mỗi 0,3 s; ý mới (danh từ/động từ chính) có hình mới trong ±0,15 s [QS qua đối chiếu sheet 1 khung/giây; độ chính xác khung chưa đo tự động].

## 8. Chữ trên màn hình
### 8.1 Phụ đề từng từ [QS, đo 18/18]
- Căn giữa x=360, **đường chân chữ y=918/1280 (71,7% chiều cao)** — trùng tuyệt đối ở mọi video.
- Chiều cao chữ hoa/ascender ≈ **35 px** ở 720p (31–36). Trắng, viền đen dày, bóng mờ nhẹ; sans đậm.
- **Font [CHỌN, có đo]: Work Sans ExtraBold (800)**. So khớp hình chữ 101 từ phụ đề (18 video) với 89 kiểu chữ của 32 họ font: Work Sans 800 khớp nhất (IoU trung bình 0,69; Rubik 800 0,67; Montserrat 800 0,60; Poppins 700 chỉ 0,50 — hạng 34). Dựng lại 101 từ bằng libass: **bề rộng chữ = 1,005× mẫu (IQR 0,99–1,02), cao = 1,00×**. Tên font gốc của kênh vẫn chưa biết — có thể là font khác có hình gần giống. File: `fonts/WorkSans-latin-800.ttf` (OFL 1.1, được phép đóng gói).
- Mỗi lần hiện: 1 từ 69%, 2 từ 27%, ≥3 từ 4% (cụm danh từ ngắn "The two kingdoms", "for 100", "the shield"). Thời gian hiện trung vị 0,3 s.
- Không đổi màu, không highlight từ, không emoji [QS].
- **Hiệu chỉnh khi dựng (libass/ffmpeg `subtitles=…:fontsdir=fonts`)**: `Work Sans ExtraBold`, Bold=0, PlayRes 720×1280 → `Fontsize 75, ScaleX 99, Outline 5, Shadow 2.5, MarginV 344, Alignment 2` (1080×1920 → `113, 99, 7.5, 3.75, 516`). Đo lại: baseline 918, cao chữ 36, căn giữa 360 — khớp mẫu. Thông số cũ Poppins 87/333 bị thay. Hiệu chỉnh lại bằng `tools/analysis/caption_calibrate.sh` nếu đổi font.
### 8.2 Chữ trong cảnh (diegetic) [QS]
- Thông tin thêm luôn nằm trên vật trong cảnh (biển hiệu, giấy, màn hình, bảng đen, nhãn), KHÔNG làm thẻ chữ đè lên hình.
- Ngoại lệ: thuật ngữ khoa học in lớn trong cảnh như nhãn (HYPNAGOGIA V12@27s; "a hair / a slice" V17@42s; tầng "AWAKE / LIGHT SLEEP / DEEP SLEEP" V12@24s).

## 9. Giọng đọc [QS + SL]
- Một người đọc cho mọi video: F0 trung vị 177–215 Hz (trung vị 198 Hz) → cùng giọng nam trẻ năng lượng [QS đo; "cùng người" là SL nhưng rất khớp].
- Liền mạch: lời chiếm 56–83% thời lượng theo năng lượng dải giọng; không khoảng lặng sâu (không có cửa sổ nào thấp hơn đỉnh giọng 30 dB đủ dài) [QS].
- Phổ: năng lượng tập trung 1–2,5 kHz, rất ít dưới 300 Hz → giọng được cắt trầm, đẩy vùng hiện diện, nén mạnh [QS nhìn phổ V4, V12; mức xử lý cụ thể là SL].
- Thoại của nhân vật do chính người kể đọc trong câu ("Sorry, not a winner." V2; "After you." V9; "Tell me a story" V3) [QS chữ; cùng giọng là SL].
- **Nhịp 208–244 từ/phút, trung vị ~223 (18 video)** [QS — số từ kịch bản người dùng cung cấp ÷ thời lượng lời; ASR offline xác nhận lời chạy từ ~0,1 s đến hết video ở cả 16 video]. Theo video: V2 208, V15 211, V16 214, V8 217, V4 219, V5 219, V18 222, V12 223, V7 224, V17 226, V3 228, V11 229, V13 233, V9 234, V14 239, V10 244. V1 213, V6 222 (bản tái dựng từ phụ đề + ASR).
- Lời đọc số bằng chữ nhưng phụ đề hiện chữ số: "a hundred" → "100", "ten thousand" → "10,000" (V4) [QS: ASR nghe "a hundred", "ten thousand"; phụ đề hiện số].

## 10. Nhạc nền & SFX
### 10.1 Đo được [QS] (librosa trên 18 video; số liệu: `metrics/verification_2026-10-29/music_tempo_key.json`, `pause_floor.json`)
- 16 file mp3 người dùng gửi = bản trộn đầy đủ của video (tương quan 0,9996–0,9997) — không phải stem; tách nguồn không chạy được ở đây.
- **Không có nhịp trống đều** ở 16/18 video (độ đều nhịp ở dải trầm 0,00–0,11). Ngoại lệ: V17 (biến thể C) có nhịp đập nhẹ đều (0,35, ~99 BPM); V2, V16 hơi đều (~0,1).
- **Giọng thứ**: D minor đứng đầu ở 11/18 video (V4–V8, V10, V12, V15–V18), các video còn lại cũng phần lớn giọng thứ (A, C, E minor); chỉ V11, V13 nghiêng D major. (Ước lượng chroma; D minor/F major là cặp tương quan, không tách chắc.)
- **Mỗi video một nền nhạc riêng**: so khớp dải trầm giữa mọi cặp video không cao hơn mức ngẫu nhiên → không dùng lại một bài cho nhiều video.
- Thảm âm kéo dài (vạch phổ ngang ~530/880/1480 Hz ở V4, V12), không dừng suốt video.
- **Mức nhạc nghe được giữa các câu** ("sàn khoảng nghỉ" = phân vị 5 của độ to 50 ms trừ trung vị): −13,4 … −18,1 dB, trung vị −16 dB (V17 −9,2). Bản demo Spear trước đây đo −22,3 dB → nhạc demo nhỏ hơn mẫu ~6 dB.
- Tiếng sáng cao tần 4–12 kHz ngắn (shimmer/whoosh) tại lúc lóe sáng, cú máy nhanh (V4@3,7s); nhịp trầm trùng điểm nhấn lời [QS phổ].
- Mix mono, −14 / −15 LUFS.
### 10.2 Chưa xác minh [SL]
- Tên bài nhạc, nhạc cụ cụ thể, tên/thư viện SFX của kênh gốc.
### 10.3 Chuẩn sản xuất [CHỌN]
- Nhạc: `production/audio_kit.py bed` — tự tổng hợp (không vướng bản quyền), không nhịp trống, thảm âm + nốt mallet/gảy thưa nhịp tự do, mặc định **D minor**; 5 sắc thái: `mystery` (mặc định truyện bí ẩn/mưu mẹo), `playful` (khoa học vui), `tense` (cao trào/kinh dị nhẹ), `warm` (giọng trưởng, kết ấm), `pulse` (nhịp đập ~100 BPM — chỉ cho biến thể C kiểu V17). Mỗi video một bản (đổi `--seed`).
- Mức: voice −16 LUFS; **bed −20 LUFS trước ducking** (sidechaincompress threshold 0,03, ratio 4, attack 20, release 300); SFX −26 LUFS; master −14. Đã thử: sàn khoảng nghỉ −15,5 dB, độ đều nhịp 0,03, giọng D minor/F major — nằm trong dải mẫu. Thay quy tắc cũ "nhạc thấp hơn voice 18–22 dB" (đo ra quá nhỏ).
- SFX: `audio_kit.py sfx` (18 âm: whoosh, whoosh_fast, clang, ting, sparkle, flipclick, thump, boom, riser, pop, boing, bell, paper, coins, crowd_laugh, crickets, wind, flash) + bảng hành động→SFX trong `USAGE.json`; đặt theo mốc bằng `audio_kit.py events`. Chưa nghe duyệt bằng tai — người dùng nghe thử bộ mẫu trước khi dùng cho bản giao.

## 11. Kịch bản
### 11.1 Hook 0–4 s — 6 kiểu [QS; câu lấy từ kịch bản người dùng cung cấp cho 16 video, V1/V6 từ bản tái dựng]
| Kiểu | Mẫu câu | Video |
|---|---|---|
| Nghịch lý | "Gambling is illegal in Japan. Yet there's a gambling hall on almost every street." / "It's impossible to get fired in Japan, [so] companies found something way worse." / "A blacksmith sold a spear that could pierce anything to one king and a shield that nothing could pierce to his worst enemy." | V1, V6, V4 |
| Nhân vật + hành vi lạ | "He sold his happiest memory to a stranger behind a counter." / "He bet his life savings on the slowest horse in the race." / "A man snuck into a family's house every night and moved every single thing one inch to the left." / "They buried a man alive with a bell tied to his finger." / "A knight paid a priest to forgive a crime he hadn't committed yet." / "He put a bronze ball in a dragon's mouth and told the Emperor, 'If this ever falls out, run!'" / "He scanned a customer's lottery ticket, saw it had won a million dollars, and said, 'Sorry, man, not a winner.'" / "A scientist dropped people off a tower just to find out what happens to time right before you die." | V3, V11, V10, V18, V13, V8, V2, V16 |
| Quy tắc bí ẩn | "The fastest gun in the West had one rule: never draw first." / "There's a button in the middle of town, and nobody's allowed to press it." | V9, V7 |
| "Nếu bạn…" | "If you fall asleep holding two steel balls, you might wake up a genius." / "If you took your brain out and put it in a jar, you'd die." / "If you ever fake a number, there's a way to tell a human made it up." | V12, V17, V15 |
| Câu hỏi trực tiếp | "How do painkillers know where the pain is? You swallow one for a headache, and then what?" | V14 |
| Thách đố trực quan | "Look at these two scratch cards. One's a winner and one's garbage." | V5 |
- Phân bố: 8/18 mở bằng một nhân vật làm việc lạ ở thì quá khứ ("He…/A man…/They…") — kiểu mặc định.
### 11.2 Khung truyện (4 khuôn) [QS]
1. **Nghịch lý → cơ chế** (V1, V6, V4, V15): nêu nghịch lý → theo 1 người đi qua quy trình → "You see," → cơ chế lộ ra → câu chốt mỉa ("Nobody gambled.").
2. **Mưu mẹo/phi vụ có twist** (V2, V5, V10, V11, V13, V18): kẻ thông minh làm điều lạ → mọi người cười/nghi → kế hoạch thành → lật tình thế ở ~75–90% thời lượng → câu chốt vòng về đầu.
3. **Khoa học ngôi thứ hai** (V12, V14, V16, V17, V9): "If you…/You…" → thí nghiệm/minh họa vui → ẩn dụ không gian giải thích cơ chế → ứng dụng/câu hỏi.
4. **Truyện hư cấu cảm xúc/bí ẩn** (V3, V7): thế giới có luật lạ → nhân vật phá luật → cái giá → kết đắng hoặc mở.
- Cụm chuyển ý đặc trưng: **"You see,"** — có trong 11/16 kịch bản (V2, V3, V4, V8, V9, V10, V11, V12, V13, V16, V18), thường ngay sau hook hoặc trước cơ chế; "Here's the creepy part" (V17), "Normally… But…" (V12), "Then…", "So…".
- Câu cuối mở bằng "So…/And that's how…" ở 7/16 kịch bản (V2, V4, V10, V11, V15, V16, V17).
- Câu chốt: mỉa mai ngắn, thường có "nobody/anymore/all hers" (V1 "Nobody gambled.", V11 "nobody's laughing anymore.", V6 "…nobody can do nothing forever.", V18 "…was all hers."), hoặc câu hỏi trực tiếp cho người xem (V17 "So… sign up?").
- Kết vòng: cảnh cuối quay về bối cảnh/vật mở đầu (V2 quầy Kyle, V4 bảng đếm, V10 ghế đỏ + mèo, V7 nút).
### 11.3 Sự thật & hư cấu [QS]
- Kênh trộn: chuyện có thật/giai thoại (V1, V2, V5, V6, V8, V11, V13, V15, V16, V17, V18), ngụ ngôn (V4), hư cấu thuần (V3, V7, V10). Chuyện có thật được kịch tính hóa (tên, lời thoại bịa thêm).
- Quy tắc sản xuất: chuyện có thật → tra nguồn, giữ đúng sự kiện cốt lõi/năm/số liệu; phần kịch tính hóa ghi rõ trong meta. Hư cấu → không gắn tên người thật.

### 11.4 Bộ lọc chọn chuyện — phải TRỚ TRÊU / HÀI [CHỌN, góp ý chủ kênh 30/10/2026 + đối chiếu 18 mẫu]
- 18/18 mẫu đều xoay quanh một trớ trêu, không phải kể lại sự kiện: thu ngân nói "not a winner" với vé trúng (V2); kẻ lạ chỉ dời đồ 1 inch để mua rẻ lại căn nhà (V10); hiệp sĩ mua xá tội trước rồi cướp chính người bán (V13); tay súng nhanh nhất luôn rút sau (V9); thợ rèn bán giáo và khiên "vô địch" cho hai phe để chẳng ai dám đánh (V4); sòng bạc hợp pháp vì "chỉ đổi quà" (V1).
- Kiểu trớ trêu hay dùng: luật/hệ thống bị chính logic của nó đánh bại · kẻ bị cười nhạo hóa ra thắng · kết quả ngược hẳn ý định · nạn nhân tự giúp kẻ lừa · chi tiết đời thường đặt sai chỗ.
- Kiểm 4 câu trước khi viết: (1) Câu hook một mình đã vô lý/buồn cười? (2) Có nhân vật làm điều lạ khiến người xem muốn biết "tại sao"? (3) "You see," mở ra cơ chế làm người xem "à há"? (4) Câu chốt đảo ngược/mỉa, đọc riêng vẫn buồn cười? Thiếu 1 câu → đổi chuyện.
- Hài bằng: thoại ngắn của nhân vật, phản ứng đám đông (cười/xì xào), nhân vật tỉnh bơ trong tình huống vô lý, lặp lại có biến (làm lại lần 2).
- Loại: kể theo thứ tự thời gian chỉ có 1 điểm thú vị (bản Mona Lisa 30/10 bị loại vì lý do này); chuyện ở Việt Nam (chủ kênh yêu cầu ưu tiên chuyện nổi tiếng thế giới).

## 12. Phối hợp lời – hình – âm (bản đồ chức năng)
| Chức năng kể | Hình | Máy | Âm |
|---|---|---|---|
| Hook | hình lạ nhất của câu chuyện, nhân vật đang làm hành vi lạ | đang đẩy/cẩu sẵn từ khung 0 | nhịp thấp + whoosh |
| Giới thiệu luật/bối cảnh | biển hiệu, toàn cảnh địa điểm | cẩu lộ quy mô | nhạc nền ổn định |
| Phản ứng đám đông | đám đông chỉ trỏ cười | trượt ngang | tiếng cười đám đông [SL] |
| Leo thang | vật đếm tăng, đồ vật nhiều lên | đẩy nhanh dần | nhấn thấp |
| "You see," / cơ chế | vật giải thích (bản vẽ, mặt cắt, phòng-trong-đầu) | đẩy xuyên vào trong vật / top-down | shimmer khi lộ |
| Lật mặt | biểu cảm sốc, ánh sáng đổi, cảnh sát xuất hiện | cận nhanh | điểm nhấn mạnh |
| Câu chốt | nhân vật tỉnh bơ/đảo vai, cảnh vòng về đầu | đẩy chậm, giữ ~1 s | nhạc tiếp, không cắt đột ngột |

## 13. Biến thể theo tình huống
| Thể loại | Điều chỉnh |
|---|---|
| Khoa học/cơ thể | ẩn dụ không gian, nhân hóa tác nhân, nhãn thuật ngữ trong cảnh, màu đặc trưng (đỏ-hồng cơ thể, xanh nước giấc ngủ) |
| Lịch sử/cổ trang | kiến trúc lâu đài/làng mái ngói đỏ, giấy da có chữ, tòa nhà quy mô lớn, ánh sáng hoàng hôn |
| Tội phạm/lừa đảo | biển hiệu cửa hàng, tiền/giấy tờ cận, bảng ghim điều tra, rèm sáo noir |
| Cảm động | bảng màu ấm/lạnh tương phản, nhịp đẩy chậm hơn, vật lặp cảm xúc |
| Bí ẩn | bố cục hình học/đối xứng, bộ đếm, ánh sáng lạ trên trời |
| Hài | gag vật lý (ngã sấp, in mặt trên cát), vật lặp đồ, đảo vai cuối |

## 14. Thư viện kỹ thuật tái sử dụng (ID để gọi trong shot list)
- T01 Insert top-down tài liệu đọc được · T02 Bộ đếm/bảng lật số · T03 Thước đo cụ thể hóa số · T04 Số liệu bằng chồng vật · T05 Phòng điều khiển trong đầu (cửa sổ = mắt) · T06 Cơ thể/khái niệm = ngôi nhà/không gian · T07 Mặt cắt địa tầng/lòng đất · T08 X-quang trong suốt · T09 Khung đen + vòng sáng (suy nghĩ thầm) · T10 Cảnh mơ đổi bảng màu neon · T11 Lóa trắng chuyển cảnh · T12 Iris tròn · T13 Đẩy xuyên màn hình/cửa/vật · T14 POV khung tròn (mắt mèo, ống nhòm, kính lúp, ống ngắm) · T15 Cẩu cực cao lộ quy mô/đám đông · T16 Đổi giờ trong khung giữ · T17 Vật bay slow-mo (đạn, bi, giấy) · T18 Gag nghĩa đen · T19 Vật biến mất theo chữ · T20 Đối xứng 2 phe màu đối lập · T21 Tia năng lượng/lắc máy cho hành động bùng nổ · T22 Vật chĩa thẳng ống kính · T23 Mô-típ vật lặp & kết vòng · T24 Nhãn thuật ngữ trong cảnh.

## 15. Tiêu chí kiểm tra (đo được bằng `tools/qa_compare.py`)
| Hạng mục | Đạt | Cách đo |
|---|---|---|
| Định dạng | 720×1280 hoặc 1080×1920, 30 fps | ffprobe |
| Thời lượng | 34–78 s (mặc định 45–65) | ffprobe |
| Loudness | −14 … −15,5 LUFS, true peak ≤ −1 dBTP | ebur128 |
| Độ rộng stereo | Side − Mid ≤ −20 dB | audio2.py |
| Đứng yên | ≤ 5% cửa sổ 0,5 s | measure.py |
| Đẩy vào | 25–65% | measure.py |
| Đổi kiểu máy | trung vị chuỗi ≤ 1,5 s | measure.py |
| Cắt cứng | ≤ 2 / video, kiểu ngoài→trong hoặc nhảy hành động; hòa hình mặc định 7 khung | cuts3.py (+ frames.py xem khung) |
| Phụ đề | baseline 71,7% ±1%, cao chữ 2,7% chiều cao ±0,3%, căn giữa ±10 px | capgeo.py |
| Phụ đề 1 từ | 55–80% sự kiện | transcript từ SRT/ASS |
| Giọng | không khoảng lặng > 0,35 s giữa câu | silencedetect |
| Nhạc giữa câu | sàn khoảng nghỉ −13,5 … −18,5 dB | qa_compare.py |
| Hook | hình bất thường + chuyển động ngay khung 0 | xem tay |
| Lời → hình | mọi động từ chính có hành động ±0,15 s | bảng chữ → hành động |
| Vật kể chuyện | ≥ 2 trong T01–T04 mỗi video | shot list |
| Kết | câu chốt ≤ 6 từ + cảnh vòng về/đảo vai, giữ ≥ 1 s | xem tay |

## 16. Chưa xác minh / giới hạn
(Rà lại 29/10/2026 — chi tiết: references/VERIFICATION_2026-10-29.md. Người dùng xác nhận không có thêm dữ liệu gốc; phần thiếu được xử lý bằng quyết định [CHỌN] dưới đây.)
| Mục | Đã xác minh | Vẫn chưa biết | Xử lý [CHỌN] |
|---|---|---|---|
| Nhạc/SFX | không nhịp trống (16/18), giọng thứ, mỗi video nhạc riêng, mức nhạc giữa câu −16 dB | tên bài, nhạc cụ, tên SFX | `audio_kit.py`: nền D minor không nhịp, bed −20 LUFS, 18 SFX tổng hợp; QA đo sàn khoảng nghỉ |
| Lời | 16 kịch bản đúng video (ASR); V1, V6 tái dựng từ phụ đề + ASR (khớp ASR 66%, 73%); nhịp 208–244 từ/phút | từng từ của 18 bản | dùng 18 bản trong `scripts/` làm chuẩn làm việc; từ trong [ ] ở V1/V6 là suy ra |
| Font | hình chữ khớp Work Sans 800 (bề rộng 1,005×, cao 1,00× trên 101 từ) | tên font gốc | Work Sans ExtraBold, thông số mục 8.1 |
| Phần mềm dựng gốc | — | không xác định được từ file | không ảnh hưởng đầu ra; quy trình kênh: Blender (nếu có) hoặc engine three.js của KIT → Kdenlive (melt) |
| Tỉ lệ nhân vật | đầu 30–34% (đo 5 nhân vật) | — | dựng 32/30/38% |
| Chuyển cảnh | 6 cắt cứng / 5 video (xem từng khung); hòa hình 6–8 khung | số hòa hình chính xác từng video | dùng mật độ ≈1 chuyển cảnh / 4–6 s |
