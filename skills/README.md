# skills/ — skill viết nội dung (Claude Code / Codex / Muse)

| Skill | Việc | Đầu vào → đầu ra |
|---|---|---|
| `invention-topic-studio` | Topic + outline cho kênh "How you invented X" | brief/số topic → topic_data.json, outlines.md, fact_ledger.json, tracker (+ Notion) |
| `invention-script-writer` | Kịch bản 30–43 s cùng kênh | topic/outline hoặc tên đồ vật → loi_doc.txt, KICH_BAN.md (bảng shot A/B + điểm cắt), facts.json, script_qa.json |

Cả hai chuyển thể từ `tiktok-content-studio` / `tiktok-script-all-in-one` của chủ kênh, chuyên hoá bằng số đo 5 video viral
(`invention-script-writer/references/viral-analysis.md`). Dựng video theo kit P02 (`invention-chain-shorts`).

Cài:
- Claude Code: chép thư mục skill vào `~/.claude/skills/` (hoặc `.claude/skills/` của dự án).
- Codex: chép vào thư mục skills của Codex (`agents/openai.yaml` là thông tin hiển thị).
- Muse: chép nội dung `SKILL.md` + thư mục `references/` vào custom skill; hoặc clone repo và trỏ tới `skills/<tên>/SKILL.md`.
