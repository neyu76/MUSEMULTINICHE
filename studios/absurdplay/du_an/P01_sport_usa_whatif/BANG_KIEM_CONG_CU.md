# BẢNG KIỂM CÔNG CỤ, TÀI NGUYÊN, THÀNH PHẦN THIẾU — P01
Môi trường: máy ảo đám mây Ubuntu 24.04, 2 CPU, 7,8 GB RAM, **không GPU**, mạng qua danh sách tên miền cho phép · Ngày kiểm: 03/11/2026 · Phiên: Claude trên claude.ai (môi trường làm việc từ xa)

Trạng thái: **ĐÃ KIỂM** / **CÓ-CHƯA-HỢP** / **THIẾU** / **CẦN NGƯỜI DÙNG** · Mức cần: **B** bắt buộc · **N** nên có · **T** tùy chọn

## 1. Bảng kiểm
| Thành phần | Loại | Dùng cho bước | Mức | Phiên bản | Trạng thái | Bằng chứng (lệnh → kết quả) | Giới hạn đã biết |
|---|---|---|---|---|---|---|---|
| ffmpeg / ffprobe (libass, ebur128) | phần mềm | đo, phụ đề, ráp, xuất | B | 6.1.1 | ĐÃ KIỂM | đốt phụ đề ASS Montserrat lên khung 1080x1920, đặt cạnh mẫu → khớp vị trí và bề rộng ±6 px; đo loudness 23 video | — |
| Python + numpy, opencv, Pillow, librosa | thư viện | đo mẫu, QA | B | py 3.13, cv2 5.0, librosa 0.11 | ĐÃ KIỂM | `phan_tich_mau.py` chạy đủ 23 video; pyin F0 23 video | — |
| faster-whisper `small.en` | thư viện + mô hình | chép lời mẫu, mốc từng từ cho phụ đề | B | 1.x | ĐÃ KIỂM | chép 23 video; đối chiếu 9 chỗ nghi ngờ với phụ đề trên hình → đúng | tải lại mô hình cần `huggingface.co` |
| yt-dlp + curl_cffi | phần mềm | tải video mẫu | N | bản pip 11/2026 | ĐÃ KIỂM | tải 23/23 video + metadata | bản 1080p HEVC không có tiếng, phải lấy thêm bản h264 có tiếng |
| **three.js + Chromium headless (Playwright)** | engine 3D | dựng cảnh, nhân vật, máy, render khung | B | three 0.170, WebGL SwiftShader | ĐÃ KIỂM | `engine/render.js`: 60 khung 1080x1920, bóng đổ mềm, 2 nhân vật có animation → **0,46 s/khung** (~17 phút cho 75 s) | chỉ CPU; cảnh đông người hoặc hiệu ứng nặng sẽ chậm hơn |
| Thư viện animation UAL (Quaternius, **CC0**) | tài nguyên | xương + 46 clip (đi, chạy, nước rút, nhảy, đấm, ngã, ngồi, nói, nhảy múa…) | B | bản free 06/2025 | ĐÃ KIỂM | nạp GLTF, phát 5 clip trên 5 bản sao, render đúng | thiếu clip thể thao: ném, bắt bóng, rê bóng, sút, ăn mừng riêng |
| `engine/lib/nhanvat.js` (cầu thủ dựng trên mannequin) | code dự án | nhân vật | B | v0.1 | **CÓ-CHƯA-HỢP** | render áo/quần/tất màu đội, mũ bảo hiểm, mắt hoạt hình, tỉ lệ em bé (`engine/smoke_test/smoke_1s.jpg`) | mặt trống (không mũi, miệng), thân kiểu ma-nơ-canh, số áo chưa hiện → **thấp hơn mẫu rõ rệt** |
| Đồ họa HTML/CSS (`engine/dohoa.html`, `dohoa_render.js`) | code dự án | bug tỉ số, thẻ số liệu, chữ 3D pixel, tag | B | v0.1 | ĐÃ KIỂM | PNG trong suốt 1080x1920, **0,057 s/khung**; ghép lên hình 3D đúng | font gốc chưa biết; dùng Inter 900 + Silkscreen |
| Font: Montserrat (phụ đề), Inter 900, Anton, Oswald, Silkscreen, Space Mono | tài nguyên | phụ đề, đồ họa | B | apt + @fontsource (OFL) | ĐÃ KIỂM | render phụ đề và thẻ, đặt cạnh mẫu | font gốc chưa xác định |
| `cong_cu/tao_phu_de.py` | code | phụ đề ASS từ mốc từ | B | v0.1 | ĐÃ KIỂM | câu hook → 3 cụm "could the dallas cowboys / beat 50 babies in / a playoff game?", giống hệt cách ngắt của mẫu | — |
| **Kdenlive** | phần mềm dựng | project chỉnh sửa được | B | 23.08.5 | ĐÃ KIỂM | `cong_cu/tao_kdenlive.py` sinh project → Kdenlive mở được: bin 4 clip, track Hình 3D / Đồ họa / Giọng / Nhạc / Subtitles, monitor hiện ảnh ghép (`engine/smoke_test/kdenlive_open.png`) | phụ đề ASS hiển thị và render đúng nhưng **không hiện thành từng ô** trong track Subtitles; sửa chữ bằng file `.ass` |
| melt (MLT) | phần mềm render | xuất từ project | B | 7.22.0 | ĐÃ KIỂM | render `smoke.kdenlive` → 1080x1920, 30 fps, 2,005 s, có phụ đề + đồ họa alpha + 2 track tiếng | — |
| Blender | phần mềm 3D | đổi FBX→GLB (Mixamo/Meshy), sửa model | N | 4.0.2 | ĐÃ KIỂM (render) | EEVEE headless 13,8 s/khung; Workbench 2,2 s/khung | quá chậm để render cả video trên CPU; chỉ dùng để chuyển đổi/sửa model |
| **Giọng clone "Sport USA"** (Magnific Voice Generator, ElevenLabs v4) | web + Claude in Chrome | lời đọc | B | — | ĐÃ KIỂM (qua web) | 03/11: tạo 1 đoạn thử 45 từ trên web bằng Chrome của chủ dự án, tải về qua `pikaso.cdnpk.net` → 19,9 s, 140 từ/phút, F0 183 Hz (mẫu 182 Hz); tăng tốc atempo 1,12 → 157 từ/phút, F0 188 Hz | **API chưa mở** (trang API Key: "contact support to enable API access") → tạm làm qua web; giọng gốc chậm hơn mẫu, cần atempo ~1,12 |
| Nhạc nền: alvana-audio/music (CC0) | tài nguyên | nhạc dưới lời | B | 157 bản, −16 LUFS, có BPM + bản đồ nhịp | ĐÃ KIỂM (tải, đọc chỉ mục) | 03/11: git clone; nhóm hợp mẫu: hiphop 4, funk 6, upbeat 7, lofi 34 | chưa nghe thử bằng tai; corporate là CC BY → không dùng |
| SFX: sfx-kit, alvana-audio, Free-SFX, Meta-open-sound (đều CC0) | tài nguyên | âm thanh hành động | N | 4.242 SFX | ĐÃ KIỂM (tải, lập chỉ mục `tai_nguyen/am_thanh/thu_vien_am_thanh.json`) | whoosh 50, va chạm/đấm/đá 240+, riser 58, pop, đồng hồ, đánh máy, vỗ tay 2 | **thiếu** đám đông sân vận động, còi trọng tài, la ó |
| **Nhân vật v2**: Quaternius Universal Base Characters (CC0) + `engine/lib/nhanvat2.js` | tài nguyên + code | nhân vật | B | UBC Standard (2 thân: nam, nữ), 8 phụ kiện tóc/râu/lông mày | ĐÃ KIỂM | 03/11: tải từ itch.io (128 MB), dựng 3 nhân vật (cầu thủ có mũ + số áo, cầu thủ râu tóc, em bé đầu to) với áo/quần/tất màu đội, mắt hoạt hình, mũ có lưới; render đặt cạnh mẫu Cowboys (`smoke_test/nhanvat_v2_*.jpg`); 3,7–5 s/khung | thân người cơ bắp nên áo bó sát (mẫu áo rộng); bản Standard chỉ có 2/6 thân; viền mũ còn răng cưa ở cận cảnh |
| Universal Animation Library 2 (CC0) | tài nguyên | 43 động tác thêm (ném bóng, khoanh tay, lắc/gật đầu, bị đẩy lùi, trượt…) | B | Standard | ĐÃ KIỂM | cùng tên xương với UBC, phát trực tiếp không cần chuyển đổi | UAL1 (46 động tác) dùng tên xương khác (DEF-*), cần retarget khi dùng với UBC |
| TRELLIS (Microsoft, MIT) qua Hugging Face Space | dịch vụ miễn phí | vật thể/quái vật từ ảnh | N | trellis-community/TRELLIS | ĐÃ KIỂM | ảnh → .glb có màu trong 31 s (`assets/trellis/barrel.glb`) | hạn mức GPU miễn phí theo ngày; chất lượng phụ thuộc ảnh đầu vào |
| camera-controls (yomotsu, MIT) + simplex-noise (MIT) + `engine/lib/camera.js` | thư viện + code | máy quay: crane, push-in/pull-out, truck, orbit, top-down, bám nhân vật, rung tay; easing (smoothstep, cubic, whip) | B | camera-controls 2.10.1, simplex-noise 4 | ĐÃ KIỂM | clip thử 6 s / 4 shot (`smoke_test/ban_thu_v3_camera.mp4`): chuyển động khung trung vị 8,4 px/s (mẫu 3,7–14,8), đứng yên 22,9 % (ngưỡng ≤ 30 %) | chuyển động là hàm thuần theo t nên render song song vẫn khớp |
| Sân vận động `engine/lib/svd.js` | code | sân 120 yard có vạch số, khán đài 3 tầng (đám đông hạt màu, mặt tiền tối, dải phòng VIP sáng), băng LED chạy chữ, mái, tia sáng | B | v0.2 | ĐÃ KIỂM | render đặt cạnh mẫu 0:07 (`smoke_test/so_sanh_v3.jpg`); 1,5–1,8 s/khung cả cảnh | bão hòa gốc 171 (mẫu ≤ 144) → chỉnh màu hậu kỳ `eq=saturation=0.72:brightness=0.03` → 136 |
| Em bé `makeBaby` + tư thế `engine/lib/tuthe.js` | code | em bé: đầu ~1/4 chiều cao, tay chân ngắn mũm mĩm, thân tròn; tư thế ngồi bệt, bò, nằm đạp chân | B | v0.2 | ĐÃ KIỂM | render cận cảnh có mũ + lưới hồng, đặt cạnh mẫu 0:53 | mặt vẫn hơi người lớn ở cận cảnh |
| Meshy / Mixamo | dịch vụ | — | T | — | KHÔNG DÙNG | chủ dự án thấy chi phí Meshy cao (03/11) | — |
| Mở project trên máy chủ dự án | — | bàn giao | N | — | CHƯA KIỂM | — | kiểm khi gửi bản thử |

## 2. Thành phần còn thiếu — đề xuất
| Thành phần | Mục đích | Mức | Nguồn chính thức | Yêu cầu cấu hình | Chi phí | Vì sao chọn (phương án thay thế) | Ai làm |
|---|---|---|---|---|---|---|---|
| API giọng Sport USA | đọc kịch bản bằng giọng đã clone | B | nền tảng đang chứa giọng (nếu là ElevenLabs: `api.elevenlabs.io`) | thêm tên miền API vào Settings → Capabilities; tạo API key riêng chỉ có quyền TTS | theo gói bạn đang dùng | đúng giọng bạn chọn. Thay thế: bạn tự xuất mp3 trên web rồi gửi lên | bạn |
| Nhạc nền có giấy phép | lớp nhạc liên tục dưới lời | B | Pixabay Music, YouTube Audio Library (miễn phí); Epidemic Sound, Artlist (trả phí) | gửi 3–5 bản nhạc beat hip-hop/trap nhẹ; hoặc mở `pixabay.com`, `cdn.pixabay.com` | 0 USD hoặc theo gói | mẫu luôn có nhạc có beat dưới lời | bạn |
| Kho SFX | va chạm, whoosh, còi, đám đông | N | Pixabay Sound Effects, freesound.org (CC0) | gửi zip hoặc mở tên miền | 0 USD | SFX chọn lọc theo hành động | bạn (hoặc Claude tổng hợp tạm) |
| Nhân vật chất lượng cao | mặt, tóc, râu, đồng phục, animation thể thao | N/B | Meshy (meshy.ai, có API, tự rig + thư viện 500+ animation); Mixamo (mixamo.com, tải tay) | Meshy: gói Pro + API key + mở `api.meshy.ai`, `assets.meshy.ai`. Mixamo: bạn tải nhân vật/animation FBX rồi gửi, Claude đổi sang GLB bằng Blender | Meshy Pro ~20 USD/tháng (1.000 credit; 1 model ~30 credit, rig 5, animation 3 qua API); Mixamo 0 USD | khác biệt lớn nhất so với mẫu nằm ở nhân vật | bạn quyết định |

## 3. Phân công
| Claude tự làm được | Cần chủ dự án làm |
|---|---|
| Viết kịch bản theo công thức, căn mốc từ, sinh phụ đề | Cho biết nền tảng giọng Sport USA, mở tên miền API, đưa key (hoặc tự xuất mp3) |
| Dựng cảnh 3D, máy, animation, render khung | Chọn mức nhân vật (hiện có / Meshy / Mixamo) |
| Đồ họa truyền hình, chữ 3D, thẻ số liệu điền theo lời | Cung cấp nhạc nền + SFX có giấy phép (hoặc mở tên miền kho) |
| Ráp project Kdenlive, render bằng melt, đo QA | Mở thử project trên máy bạn khi nhận bản thử |

## 4. Giới hạn còn tồn tại sau thiết lập
- Không GPU: ~0,5 s/khung → ~20 phút render cho video 75 s; cảnh nặng có thể gấp 2–3 lần.
- Nhân vật hiện có (mannequin + phụ kiện) chưa có mặt, tóc, râu riêng như mẫu.
- Kho animation thiếu động tác thể thao chuyên biệt.
- Bản nhạc, font và kỹ thuật gốc của mẫu chưa xác định.

## 5. Bí mật và đăng nhập
- Chưa nhận khóa nào. Khi có, lưu ở `~/.secrets/<ten_dich_vu>_key` (quyền 600), không ghi vào tài liệu hay project.

| motion blur theo vận tốc | `realism-effects` 1.1.2 (MIT) + `postprocessing` 6.39 (Zlib) | Đạt sau vá (`engine/patches/va_realism_effects_three170.py`) | render khung trước rồi khung thật; không blur qua điểm cắt cảnh |
| máy quay đường cong | `lib/camera.js`: shot `path`/`lookPath` (CatmullRom centripetal, theo độ dài cung) + ease `smoother` | Đạt | dùng cho drone liền mạch, lướt thấp |
| đồng phục đội | `lib/nhanvat2.js`: `sleeveStripes`, `pantsStripes`, `collar`, `helmetStripe`, `maskThick`, `maskY`, `backNumberScale` | Đạt (ảnh thử `test_uni.html`) | sọc vẽ trong shader |
