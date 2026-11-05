# Công cụ đo video mẫu

`phan_tich_mau.py` là bước **đo thô** của G2: nó tự động đo những gì đo được. Phần xem, nghe và chép lời vẫn làm theo MAU_02.

## Cần có
| Thành phần | Bắt buộc | Kiểm |
|---|---|---|
| ffmpeg + ffprobe (có bộ lọc ebur128, silencedetect) | có | `ffmpeg -version` |
| Python 3.9+ | có | `python --version` |
| numpy + opencv-python-headless | nên có (đo màu, độ nét, chuyển động) | `python -c "import cv2, numpy"` |
| Pillow | tùy chọn (ghi mốc giây lên lưới) | `python -c "import PIL"` |

Cài thư viện: `python -m pip install numpy opencv-python-headless pillow`

## Dùng
```bash
python -X utf8 phan_tich_mau.py "<video mẫu>" "<thư mục ra>" [--fps-do 6] [--nguong-cat 0.3]
```
- `--fps-do`: số khung mỗi giây dùng để đo màu, độ nét, chuyển động. Mặc định 6.
- `--nguong-cat`: ngưỡng dò cắt cảnh (0–1). Mặc định 0,3. Hạ xuống 0,15–0,2 nếu muốn bắt cả chuyển cảnh nhẹ; sẽ có nhiều điểm báo nhầm hơn.

## Kết quả
| File | Nội dung |
|---|---|
| `bao_cao.md` | bảng tóm tắt để dán vào MAU_02 mục A và D |
| `do_luong.json` | toàn bộ số đo + chuỗi thời gian (màu, độ nét, chuyển động theo từng mẫu đo) |
| `luoi_1s_XX.jpg` | lưới 1 khung/giây (27 khung mỗi ảnh, có mốc giây) để xem bằng mắt |
| `nghi_cat/cat_<t>.jpg` | 12 khung liền quanh mỗi điểm nghi cắt, để phân biệt cắt cứng, hòa hình hay cú máy nhanh |

## Giới hạn (ghi vào phân tích nếu ảnh hưởng)
- **Dò cắt** dựa trên độ khác khung. Hòa hình dài và cú máy nhanh có thể bị bỏ sót hoặc báo nhầm, nên phải xem `nghi_cat/` và lưới.
- **Tỉ lệ chi tiết mịn** chỉ dùng để so *tương đối* giữa các video (cùng độ phân giải), không phải thang tuyệt đối.
- **Chuyển động khung** là chuyển động toàn ảnh (máy + vật), đo trên ảnh rộng 180 px. "Đứng yên" là < 2 px/s, chỉ là ước lượng.
- **Không đo được:** phần mềm hay font gốc, nguồn nhạc, kịch bản (cần ASR hoặc chép tay), vị trí phụ đề chính xác (đo tay trên khung có chữ).
- **Nhịp lời và cao độ giọng** cần thêm công cụ căn mốc từ hoặc ASR, kèm `librosa`. Cách đo xem mục 6.3 của file hướng dẫn chính.
