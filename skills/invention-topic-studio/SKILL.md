---
name: invention-topic-studio
description: Tìm, chấm điểm và lập outline topic cho kênh TikTok/Shorts "How you invented X" (ngôi "you" phát minh đồ vật qua chuỗi lỗi→sửa, hài bựa, kết nước đôi). Dùng DNA đo từ 5 video viral của kênh, nghiên cứu bằng các plugin/công cụ có sẵn (vidIQ, Apify TikTok, Reels, Instagram, Reddit, web), kiểm trùng với danh sách đã làm, kiểm fact chuỗi bộ phận, xuất topic_data + outline sẵn cho invention-script-writer; lưu Notion khi được giao. Không viết cả lô script, không dựng, không đăng.
---

# Invention Topic Studio — v1.1 (09/11/2026)

Chuyển thể từ `tiktok-content-studio` (giữ: brief → nghiên cứu có giới hạn chi phí → topic data + outline → QA → bàn giao/Notion; trạng thái trung thực) và **chuyên hoá cho format "How you invented X"**. Trao đổi tiếng Việt; tiêu đề/hook tiếng Anh.
Đọc kèm: `references/topic-dna.md` (vì sao viral + thang điểm), `references/topic-bank.md` (đã làm / ứng viên), `references/research-workflow.md` (nghiên cứu + file), `references/notion-packaging.md` (khi lưu Notion).

## 1. Chế độ
- **research_topics (mặc định):** brief → nghiên cứu → N topic đã chấm điểm + outline → QA → file (+ Notion nếu được giao). Không dừng ở prompt.
- **quick_pick:** "cho tôi 1 topic tiếp" → lấy ứng viên điểm cao nhất còn trống trong `topic-bank.md`, kiểm fact + outline, giao 1 topic. Không cần plugin trả phí.
- **prompt_only:** chỉ soạn COMMAND.txt cho lượt khác chạy.
- Viết script cho topic đã chọn → chuyển sang `$invention-script-writer` (nếu có), mang theo topic_data + outline.

## 2. Brief (tự điền mặc định, hỏi ≤ 3 câu chỉ khi đổi lớn)
Kênh/channel_id · số topic (mặc định 10) · thời đại (hiện đại mặc định, tiền sử khi đồ vật rất cổ) · mức thô (mặc định "bựa": ass/shit, ≤ 1 fucking) · ngôn ngữ (Anh) · thời lượng 33–36 s · ngân sách credit cho plugin trả phí (chưa có → chỉ dùng công cụ miễn phí/đã có dữ liệu).

## 3. Topic là gì ở kênh này
Một topic = **1 đồ vật + 1 động cơ bựa + 1 chuỗi 5–6 bộ phận thật + 1 từ nước đôi cho câu kết**. Thiếu một trong bốn thì chưa phải topic.
DNA bắt buộc (đo 5/5 video viral, chi tiết `topic-dna.md`):
1. Đồ vật ai cũng dùng hằng ngày/tuần, nhìn là biết.
2. Bản hiện đại có **≥ 5 bộ phận thấy được**, mỗi bộ phận giải một lỗi cụ thể (lò xo, khung kim loại, đệm, lưới…).
3. Mỗi bộ phận **biến hình được trên cùng một đồ vật** trong 3D (macro), dựng được bằng khối/lưới code.
4. Có **động cơ thô/cấm kỵ hoặc khó chịu cơ thể** gắn "your friend", và **câu kết nước đôi** gọi lại động cơ đó.
5. Có ≥ 3 **thất bại slapstick** (ngã, gãy, kẹt, bắn văng, ướt, cháy) và 1 chỗ cho người bạn/người thứ ba phá.
6. 1 địa điểm, ≤ 3 người.

## 4. Quy trình
1. **Đọc** brief, `topic-bank.md` (đã làm + đã đề xuất), tracker/Notion nếu có. Không đề xuất lại đồ vật đã làm trừ khi chủ kênh yêu cầu phần 2.
2. **Sinh ứng viên** (gấp 3 số cần): từ `topic-bank.md` + đồ vật trong nhà/xe/sân/bếp/phòng tắm/bãi biển/văn phòng. Viết mỗi ứng viên thành 1 dòng: đồ vật · chuỗi bộ phận · động cơ · từ kết.
3. **Tín hiệu nhu cầu** (giới hạn mẫu, ghi `plugin_coverage.json`):
   - vidIQ / Apify TikTok / Instagram / Reels: tìm "how you invented", "invention of <đồ vật>", "<đồ vật> evolution" — có video nào cùng đồ vật/cùng format đang outlier không; đồ vật nào đã bị làm nhiều (bão hoà).
   - Reddit: câu hỏi "why does <đồ vật> have <bộ phận>" (r/NoStupidQuestions, r/explainlikeimfive, r/mildlyinteresting) → bộ phận người ta tò mò = vòng mạnh.
   - Không có plugin → web search; ghi `status: unavailable`, không bịa số.
4. **Chấm điểm** theo thang 100 (`topic-dna.md` §3) + 3 cổng loại: fact chuỗi bộ phận kiểm được · không trùng · không nội dung cấm (mục 6).
5. **Kiểm fact** từng bộ phận ở nguồn có thẩm quyền (trang kỹ thuật/nhà sản xuất, bách khoa, bằng sáng chế, sách). Ghi `fact_ledger.json`.
6. **Outline** cho topic đạt (≥ 75 điểm): theo khung `research-workflow.md` §3 — hook (mã F/B/D/E) + kết đi cặp, 5–6 vòng có mốc EST, nguồn lỗi leo thang, câu cơ chế, gag mở đầu, B-roll biến hình từng bộ phận, màu nhấn, bối cảnh, nhân vật.
7. **QA** (`research-workflow.md` §5) → xuất file → Notion nếu được giao.

## 4b. Bổ sung v1.1 — nguyên tắc rút từ khóa What If Academy (diễn giải, áp vào ngách này; chi tiết `references/series-and-data.md`)
1. **Chủ đề là đòn bẩy số 1**, rồi mới tới cách thể hiện, rồi kế hoạch dựng. Chấm điểm ý tưởng mất vài phút, dựng sai ý tưởng mất nửa ngày render → luôn chấm trước, điểm thấp thì sửa phần rẻ nhất (động cơ, bối cảnh, từ kết) hoặc bỏ.
2. **4 nguồn ý tưởng:** video tốt nhất của kênh mình · video tham khảo (chỉ học cấu trúc) · câu hỏi trong bình luận · gợi ý tìm kiếm ("how was … invented", "why does … have …", "who invented …").
3. **Twin check 5 trục** trước khi giao topic: đồ vật · động cơ hook · chuỗi bộ phận/leo thang · câu kết · phong cách hình. Trùng ≥ 3 trục với một video đã có (của mình hoặc kênh khác), hoặc trùng cả đồ vật lẫn câu kết → đổi ≥ 2 trục hoặc bỏ. Tìm bằng 4 cách diễn đạt trên TikTok / YouTube Shorts / web; ghi kết quả vào `overlap_notes`.
4. **Nhóm chủ đề theo dữ liệu kênh tham chiếu** (`references/series-and-data.md` §1): đồ trong nhà/sân + động cơ bựa với "your friend" + thất bại slapstick đứng đầu; công trình lớn trừu tượng hoặc vật quá nhỏ đứng cuối.
5. **Bối cảnh và đơn vị kiểu Mỹ** (sân sau, garage, suburb, feet/°F) — người xem Mỹ là nhóm có thưởng Creator Rewards.
6. Mỗi topic ghi **một yếu tố mới sẽ thử** (`test_element`) để đọc lại sau khi đăng.

## 5. Đầu ra mỗi topic (tối thiểu)
`topic_id` · `proposed_title` ("How you invented the <X>") · `object` · `era` · `parts_chain[]` (bộ phận, lỗi nó giải, claim_id) · `motive` · `hook_code` + 3 `hook_options` · `payoff_line` (từ khoá gọi lại hook) · `failure_sources[]` · `absurd_beat` (tuỳ chọn) · `science_graphic` · `setting` · `cast` · `accent_color` · `score` (từng tiêu chí) · `demand_evidence` · `overlap_notes` (twin check 5 trục) · `test_element` · `caption` + `cover_text` (cùng một lời hứa với tiêu đề) · `series_option` (đơn / Part 1–2) · `status` (ready_for_script / needs_evidence / hold / drop) · `beat_outline[]` (t EST, vế, A/B, hình).

## 6. Không làm
- Không chép đồ vật + chuỗi lỗi + câu chữ của kênh khác; học cơ chế, tạo động cơ/lỗi/kết riêng.
- Không topic có nội dung tình dục trực tiếp, trẻ em trong câu nước đôi, xúc phạm nhóm người, hướng dẫn nguy hiểm làm theo được (vũ khí, chất nổ, điện cao thế), thương hiệu/logo thật.
- Không gọi "viral" khi không có số liệu; điểm là đánh giá biên tập.
- Không chạy job trả phí khi chưa có ngân sách; không đánh dấu script/video/đăng khi chưa có artifact.

## 7. Câu gọi mẫu
```text
Dùng $invention-topic-studio. Tìm 10 topic mới cho kênh How you invented, bối cảnh hiện đại, xuất topic_data + outline, lưu Notion.
Dùng $invention-topic-studio quick_pick. Cho 1 topic tiếp theo đã kiểm fact, kèm outline để viết script luôn.
Dùng $invention-topic-studio. Chấm điểm 5 đồ vật này: <danh sách>, loại cái nào dưới 75.
```
