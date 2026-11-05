# E03 — Chargers vs 11 mannequins (NFL) — trạng thái

Kịch bản đã duyệt: https://claude.ai/artifact/YQMJPhD8Anesi9mWkzFUob

## Đã xong (04/11)
- Giọng Magnific (Sport USA) → giong/goc.mp3 (51,07 s) → rut_nghi → am_thanh/giong.wav 48,69 s, 135 từ ≈ 166 từ/phút → words.json (+ words_tw.json cho tao_phu_de.py).
- Nhận diện (nguồn chargers.com, sportslogos.net, footballdb, Ourlads, Wikipedia): Herbert #10 1,98 m; Dicker #11 1,85 m; áo nhà xanh bột, số trắng viền vàng, quần trắng sọc vàng, mũ trắng lưới vàng, không tia sét.
- Engine mới: lib/ngoaitroi.js (sân ngoài trời ban đêm), lib/bongbau.js (Chargers, ma-nơ-canh, tư thế NFL, liven/qbSignal). nhanvat2.js thêm `backNameMax`.
- ep03.html (19 shot + điểm cắt phụ), ep03_gfx.html (khối xiên Anton, xanh bột/vàng), ep03_shots.js.
- tron_am_thanh.py: nhạc alvana funk/make-money (khựng ở "Except", tắt ở FINAL), SFX magnific + alvana.
- Cắt thử giao/E03_cat_thu.mp4 → người dùng yêu cầu nhân vật cử động hơn → thêm liven/qbSignal (shot 1,2,5,6,8,11,17,18 + mác SALE đung đưa).

## Lệnh
- Render đủ: `node render.js ep03.html out_f3 30 0 731 720 1280` và `... 731 1461 720 1280` (2 tiến trình).
- hinh.mp4: lanczos 1080x1920, eq=saturation=0.86:brightness=0.02, unsharp → tao_kdenlive.py mo_ta.json giao/E03_chargers_mannequins.kdenlive → melt → loudnorm 2 lượt.
