# Research workflow — kênh "How you invented X"

Chuyển thể từ research-workflow của `tiktok-content-studio`: giữ giới hạn chi phí, coverage trung thực, hợp đồng dữ liệu; bỏ phần Survival. Thông số ngách lấy từ brief hiện hành.

## 1. Nguồn và vai trò
| Công cụ | Câu hỏi nghiên cứu | Giữ lại |
|---|---|---|
| vidIQ (outliers, search, transcript nếu có) | Đồ vật nào trong format invention/evolution đang outlier; hook nào; đồ vật nào bão hoà | URL, ngày lấy, số liệu thật trả về, nền tảng |
| Apify TikTok Scrape | Video TikTok "how you invented …", "invention of …": views/likes/ngày, đồ vật | video ID, URL, tác giả, ngày đăng/lấy, metrics, duration |
| Instagram Scraper / facebook reels scraper | Cùng format trên Reels; khử crosspost | URL, ID, metrics, cụm crosspost |
| reddit scraper | Câu hỏi "why does X have Y" → bộ phận gây tò mò | thread URL, subreddit, paraphrase không định danh |
| Web search | Fact chuỗi bộ phận; dự phòng khi thiếu plugin | URL, publisher, đoạn hỗ trợ, ngày truy cập |

Khám phá tool/schema/chi phí trước khi chạy. Giới hạn mặc định: ≤ 30 video/truy vấn, ≤ 5 truy vấn/công cụ, retry ≤ 1. Job trả phí chỉ trong ngân sách đã cho. Mỗi công cụ ghi vào `plugin_coverage.json`: query, time_window, sample_limit, run_id, status (success / no_results / unavailable / pending_budget / failed), records_used, finding, limitation. Không có công cụ → ghi unavailable, không bịa số.

Số liệu nền tảng nào giữ nguyên nền tảng đó (YouTube ≠ TikTok). Một snapshot views không chứng minh tăng trưởng. Không suy retention từ metadata.

## 2. Đánh giá ứng viên
1. Lập danh sách gấp 3 số topic cần (bank + mới).
2. Loại nhanh theo cổng: đã làm/đã đề xuất · không có ≥ 5 bộ phận thấy được · nội dung cấm.
3. Chấm thang 100 (`topic-dna.md` §3), ghi lý do từng tiêu chí.
4. Kiểm fact chuỗi bộ phận của ứng viên ≥ 75: mỗi bộ phận 1 nguồn có thẩm quyền mô tả **chức năng** (vì sao có nó). Thứ tự lịch sử thật là điểm cộng, không bắt buộc (format kể theo logic lỗi→sửa).
5. Kiểm trùng ngữ nghĩa giữa các topic trong đợt (không 2 topic cùng động cơ + cùng từ kết).

## 3. Khung outline (mỗi topic ready_for_script)
```text
TOPIC <id> — How you invented the <X>   | era | score | status
Hook <mã F/B/D/E>: <câu hook ≤ 12 từ>     (+ 2 hook dự phòng khác mã)
Gag mở đầu (khung 0): <hành động khoa trương + 2 lớp phụ>
Kết: "Now <...>"  ← gọi lại từ khoá <...>
Vòng | t EST | Lỗi (nguồn: cơ thể/môi trường/chấn thương/người thứ ba/chi phí) | Giải pháp = bộ phận | claim_id | B-roll biến hình
  0  | 0–3   | (hook)                         | giải pháp thô sơ (vật tự nhiên) | —   | ...
  1  | ~5    | ...                            | bộ phận 2                       | C1  | ...
  …  5–6 giải pháp; câu khen ở vòng 1 và 3–4; câu cơ chế 1–2; người bạn phá ở vòng 4–5; bước phi lý (tuỳ chọn) 30–50 %
Đồ hoạ khoa học: <...>   Màu nhấn duy nhất: <màu đồ vật>
Bối cảnh: <1 địa điểm>   Nhân vật: chính <...>, bạn <...>, người thứ ba <...>
Ước tính: 120–135 từ, 33–36 s
```

## 4. File xuất (`outputs/<niche>/<run_id>/`)
brief.json · COMMAND.txt · topic_data.json · outlines.md · fact_ledger.json · performance_sources.json · plugin_coverage.json · overlap_report.md · topic_tracker.csv · qa_report.json · HANDOFF.md · file_manifest.json (+ notion_sync.json khi lưu Notion) · ZIP.
`topic_tracker.csv`: topic_id, channel_id, object, score, status, topic_done, outline_done, facts_verified, script_done, video_done, published, version, updated_at, blocker, test_element, published_at, length_s, first_event_s, beats_per_10s, views_d3, views_d7, avg_watch_pct, ret_3s, ret_30s, us_share, new_followers, part2_decision. Chỉ đánh hoàn thành khi có artifact; số liệu D+3/D+7 do chủ kênh dán từ TikTok Studio (`references/series-and-data.md` §3).

## 5. QA trước khi giao
- Đủ N topic (hoặc nói rõ đã giao bao nhiêu và vì sao thiếu).
- Mỗi topic có đủ 4 thành phần (đồ vật, động cơ, chuỗi 5–6 bộ phận, từ kết) và outline đúng khung §3.
- Mọi claim_id resolve tới nguồn đã mở; fact chưa kiểm không gắn verified → status needs_evidence.
- Không trùng danh sách `topic-bank.md` §1–2; trùng §3 phải ghi phần mới.
- Coverage công cụ trung thực; số liệu không bịa.
- Cập nhật `topic-bank.md` §2 với các topic vừa đề xuất.
