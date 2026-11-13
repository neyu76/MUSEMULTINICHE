# Mẫu bảng shot + ví dụ hoàn chỉnh

## Cột bắt buộc
```text
# | t EST (s) | Vế lời (neo chính xác) | Loại (A/B) | Hình / hành động | Cắt vào shot này (quan hệ) | Chữ/âm | claim_id / CREATIVE
```
- Mốc EST = số từ trước vế ÷ 3,67 + ~0,3 s sau hook và sau câu khen (lời ngắt, có ding/SFX lấp). Gắn nhãn ESTIMATED tới khi có words.json từ audio thật.
- Một câu qua nhiều shot: ghi neo (3–5 từ đầu vế), không chép lại cả câu.
- "Cắt vào" ghi quan hệ: cause→effect, action cut, reveal, contrast, callback.

## Ví dụ (đồ vật mới, không có trong 5 video mẫu): "How you invented the doorbell" — hook F, kiểu CẮT
> **Chỉ là ví dụ định dạng — KHÔNG dùng lại lời/đồ vật này cho tập thật** (E09 đã dùng chuông cửa). Điểm yếu của ví dụ cần tránh: vòng "kids yank the cord → electromagnet" chưa giải đúng lỗi.

Lời (`loi_doc.txt`, 125 từ, EST ≈ 35,4 s + đuôi 0,4 s):
> Your friend keeps barging in while you're naked, so you tell him to knock first. Big brain. But he knocks with his fat fist and cracks the door, so you bolt a heavy iron knocker on the outside. Except you can't hear it from the shower, so you hang a brass bell inside and run a pull cord through the wall. But the neighbor kids yank the cord all night, so you wire a battery to an electromagnet. Now when you press a button, the magnet snaps a tiny hammer against the bell, over and over. Nailed it. Except your dumbass friend holds the fucking button down for ten minutes, so you add a camera that shows who's there. Now your friend rings your bell every day!

| # | t EST | Vế lời | A/B | Hình / hành động | Cắt vào (quan hệ) | Chữ/âm | Claim |
|---|---|---|---|---|---|---|---|
| 1 | 0,0–2,5 | Your friend keeps barging in… | A | Nhân vật quấn khăn tắm, cửa bật mở, bạn đứng ngay khung cửa cười nhếch; nhân vật lấy khăn che, mặt hoảng, hơi nước bốc | — (khung 0 = động cơ) | "naked" | CREATIVE |
| 2 | 2,5–4,4 | so you tell him to knock first. Big brain. | A | Chỉ tay vào cửa, bạn gật; nhân vật khoanh tay tự hào | cause→effect | ding ở "Big brain." | CREATIVE |
| 3 | 5,2–8,2 | But he knocks with his fat fist… | A | Nắm đấm khổng lồ đập, ván cửa nứt toác, mảnh gỗ bay | action cut | uh-oh, "FAT FIST" | CREATIVE |
| 4 | 8,2–10,9 | so you bolt a heavy iron knocker… | B | Macro mặt cửa: vòng gõ sắt bật ra, 2 bu-lông xoáy vào | cause→effect | whoosh | C1 (door knocker) |
| 5 | 10,9–13,1 | Except you can't hear it from the shower | A | Trong buồng tắm, nước xối, nhân vật hát; ngoài cửa vòng gõ đập không ai nghe | contrast | sóng âm tắt dần | CREATIVE |
| 6 | 13,1–17,2 | so you hang a brass bell… pull cord | B | Macro: chuông đồng treo, dây kéo chạy xuyên lỗ tường, ròng rọc nhỏ | cause→effect | whoosh, "ding" | C2 (bell-pull) |
| 7 | 17,2–19,6 | But the neighbor kids yank the cord… | A | Ban đêm, 2 đứa trẻ đu dây, nhân vật bật dậy khỏi giường tóc dựng | action cut | Zzz vỡ | CREATIVE |
| 8 | 19,6–21,8 | so you wire a battery to an electromagnet. | B | Macro: pin + cuộn dây đồng quấn lõi sắt hiện từng vòng | cause→effect | whoosh | C3 |
| 9 | 21,8–27,2 | Now when you press a button… over and over. Nailed it. | B | Cắt lớp chuông: nhấn nút → mũi tên dòng điện → lõi hút cần búa → búa gõ chuông, cần bật về, lặp | reveal | đồ hoạ mũi tên dòng điện; ding | C4 (interrupter bell) |
| 10 | 27,5–30,8 | Except your dumbass friend holds the fucking button… | A | Bạn tì cả ngón cái lên nút, mặt khoái trá; nhân vật bịt tai, chuông rung bần bật | callback (friend) | "DUMBASS", "FUCKING" | CREATIVE |
| 11 | 30,8–33,2 | so you add a camera that shows who's there. | B | Macro: ống kính tròn mọc ra trên nút, màn hình trong nhà hiện mặt bạn | cause→effect | whoosh | C5 (video doorbell) |
| 12 | 33,2–35,4 | Now your friend rings your bell every day! | A | Gọi lại shot 1: cùng khung cửa, nhưng nhân vật mở cửa mời vào, bạn cười tít, tim bay | callback hook | confetti | CREATIVE |

Kiểm nhanh ví dụ: 125 từ; "so you" đầu 2,5 s; 5 giải pháp; nguồn lỗi = cơ thể (fat fist) → môi trường/khoảng cách (tiếng nước) → người thứ ba (trẻ con) → người bạn; 2 câu khen; 1 câu cơ chế; kết ở T−2,6 s gọi lại "barging in"; từ thô 3 (fat, dumbass, fucking).
