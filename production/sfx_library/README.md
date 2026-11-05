# Thư viện SFX EditorNghiepDu cho RickClips

File âm thanh KHÔNG đóng gói ở đây (bản quyền theo tài khoản EditorNghiepDu của chủ kênh). Chỉ lưu bảng ánh xạ `sfx_map.json` (tên cue trong events.json → id SFX).

Quy trình (cần máy người dùng đã liên kết + MCP `editornghiepdu-sfx`):
1. `sfx_status` → kiểm Trial/All-Access, thư mục cache.
2. Tìm thêm âm bằng `sfx_search` với **1 từ khóa tiếng Anh** (truy vấn nhiều từ thường trả 0): whoosh, stamp, paper, pop, boing, ding, coins, riser, boom, shimmer, flip, camera, crickets, wind…
3. `sfx_resolve` các id trong `sfx_map.json` (≤ 20 id/lần) → file mp3 vào `%APPDATA%\DMT-EDITORNGHIEPDU\sfx-cache`.
4. Xin quyền thư mục cache (`device_request_folder_access`) → `device_stage_files` → chuyển mono 48 kHz, cắt lặng đầu (`silenceremove`) vào `audio/sfxlib/`, ghi `map.json`.
5. `python3 production/mix_lib.py` (trong thư mục audio của tập): đặt SFX theo events.json, cắt độ dài theo cue (CAP), xoay vòng biến thể; thiếu cue → tổng hợp bằng audio_kit.
6. SFX −27,5…−29 LUFS → cộng voice + nhạc đã duck → master −14 LUFS, limiter; QA sàn khoảng nghỉ.
