# toon-studio

Xưởng sản xuất hàng loạt tập cho kênh **animal-toon-eyes**. Bạn chỉ đưa **kịch bản / outline / brief** (dán vào chat, file
hoặc link Notion); Claude làm hết phần còn lại:

kịch bản → giọng đọc (ElevenLabs Mark) → ảnh Google Flow → tách nền (BiRefNet) → sơ đồ PIL → SFX (EDITORNGHIEPDU) + nhạc →
dựng (keyframed cut-out blocks, toon eyes) → QA → `<ID>_<slug>_FINAL.mp4` + preview → tích "Đã làm video" trên Notion.

## Dùng
Trong Claude Code (thư mục này hoặc thư mục kênh), cài plugin từ repo này rồi gọi:

```
/toon-studio:episode ATE01-005 <dán kịch bản | outline | brief | link Notion>
```

Nếu đưa outline/brief, Claude viết kịch bản (skill `script`) và đưa bạn duyệt trước khi tốn credit — trừ khi bạn bảo làm thẳng.

## CLI (WSL)
```
bin/studio new ATE01-005 sloth "Why Sloths Are So Slow" --from input.md
bin/studio voice ATE01-005            # take1.mp3 -> voice.wav + words.json (242 wpm, khớp script)
bin/studio cut ATE01-005 poses SL0 SL1 ; bin/studio cut ATE01-005 plates FOREST ; bin/studio cut ATE01-005 props
bin/studio crop ATE01-005 SL0:0.5:0.4 # đọc vị trí mắt
bin/studio build ATE01-005 --qa       # sơ đồ + EDL + render + QA
bin/studio deliver ATE01-005          # FINAL + preview
bin/studio status ATE01-005           # checklist từng bước
```

## Cài máy mới
`bash setup.sh --birefnet` (WSL/Ubuntu), sửa `local.json` nếu cần. Xem `plugins/toon-studio/skills/setup/SKILL.md`.

## Cấu trúc
`channel/` = luật của kênh (channel.json, style bible, recipe, prompt Flow) · `studio/` = công cụ pipeline ·
`vidclone/` = engine dựng/QA (copy từ repo vidclone) · `templates/episode/` · `examples/` (tập mẫu ATE01-004, ATE01-003) ·
`plugins/toon-studio/skills/` (episode, script, flow-art, setup). Chi tiết: `CLAUDE.md`.

Tập phim nằm ngoài repo, trong `work_dir` (channel.json). Không commit media.
