# Nền vẽ tay bằng Magnific (connector MCP) — quy trình đã chạy cho N02

## Model
- Nano Banana 2.1 (`imagen-nano-banana-2-1`), 2k, 65 credit/ảnh. GPT 2.5 (`gpt-2-mini`, biến thể flare/sunburst) cũng có, hỗ trợ nền trong suốt.
- Nhạc: `audio_music_generate` model `elevenlabs-music-generation-v2`, instrumental, đúng thời lượng video (52 s ≈ 1 040 credit).

## Mẫu prompt (giữ nguyên phần đuôi phong cách)
Đuôi chung: "soft painterly hand-painted textures, rich saturated colors, high-end animated explainer short look. Empty, no people, no characters, no furniture in front, no text, no letters."
- Tường sau / tường bên phòng: "Stylized 3D cartoon animation background, front elevation view straight-on of the back wall of <phòng, thời đại>: <giấy dán tường, ốp gỗ, tranh, đèn tường, cửa sổ + cảnh ngoài>. <ánh sáng + tâm trạng>." 16:9.
- Dãy nhà xa: "... straight-on front elevation of a continuous row of <kiểu nhà> ... The sky behind the buildings is a flat solid pure bright green (#00FF00)". 21:9 → tách nền xanh (key g − max(r,b)), cắt bỏ mặt đất.
- Mặt đất: "Seamless tileable top-down texture of <mặt đất> ... soft even daylight, no shadows of objects" 1:1 → trộn với bản cuộn nửa ô để liền mép, giảm tương phản 30%.
- Chữ đọc được (biển, báo, lịch, nhãn) KHÔNG để AI vẽ: giữ trong engine.

## Lấy file về máy render
- Máy chủ bị chặn tải CDN (pikaso.cdnpk.net) và chặn upload lên Magnific.
- Bản 1024 px: `creations_read` với `hq: "medium"` → ảnh lưu sẵn trong thư mục tool-results của phiên, chép ra.
- Bản gốc (ảnh 2k, nhạc mp3): trình duyệt trong app Claude desktop trên máy người dùng → mở URL CDN (xin quyền site pikaso.cdnpk.net) → `fetch` cùng origin + `<a download>` → file vào Downloads (có thể mang tên GUID `.tmp`; nhận diện theo dung lượng) → xin quyền thư mục Downloads → `device_stage_files`.

## Đưa vào engine
- `imgTex(url)` + `paintedMat(tex, k≈0.5–0.6)` (map + emissiveMap: giữ ánh sáng vẽ sẵn mà vẫn nhận đèn/bóng cảnh).
- Tường sau = 1 tấm phủ cả tường (cao = trần, rộng theo tỉ lệ ảnh); tường bên = lặp ngang. Bỏ cửa sổ/khung tranh 3D trùng với tranh vẽ; vật 3D có tương tác (rèm kéo, lịch lật, đồng hồ, lò sưởi, khung giấy chứng nhận) đặt trước tấm vẽ.
- Dãy nhà xa: tấm alphaTest 0.5 đặt trước các khối nhà cũ (che kín), cao ~24 đv.
