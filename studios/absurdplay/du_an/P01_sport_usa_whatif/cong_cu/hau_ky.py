"""Dựng hinh.mp4 từ khung render (v0.6): phóng lanczos 1080x1920, chỉnh màu theo mẫu, làm nét, hồi tưởng đen trắng.
Thay lệnh cũ `eq=saturation=0.86:brightness=0.02` (làm nhạt và sáng thêm — ngược hướng mẫu: E04 đo bão hòa 45, sáng 150, lạnh).
Màu mặc định đã thử trên E04: bão hòa 45→~90, sáng 150→~140, da giữ tự nhiên (nhiệt màu mạnh 4400–4600 K làm da cam, mây be → đã bỏ).
Dùng: python3 hau_ky.py <thư_mục_khung> <ra.mp4> [--fps 30] [--den-trang 12.5-14.0 --den-trang 30-31.2] [--mau "<filter ffmpeg>"]
       khung tên f_00000.jpg (render.js). --den-trang: đoạn hồi tưởng (giây) → đen trắng + tương phản + tối viền như mẫu McGregor 58–60 s.
"""
import argparse, subprocess
GRADE = "curves=all='0/0 0.5/0.45 1/0.95',eq=saturation=1.45:contrast=1.03,colortemperature=temperature=5800:mix=0.5"
ap = argparse.ArgumentParser(); ap.add_argument('frames'); ap.add_argument('out'); ap.add_argument('--fps', type=int, default=30)
ap.add_argument('--den-trang', action='append', default=[]); ap.add_argument('--mau', default=GRADE)
a = ap.parse_args()
vf = [f"scale=1080:1920:flags=lanczos", a.mau]
for r in a.den_trang:
    t0, t1 = r.split('-'); en = f"enable='between(t,{t0},{t1})'"
    vf += [f"hue=s=0:{en}", f"eq=contrast=1.15:{en}", f"vignette=angle=0.5:{en}"]
vf += ["unsharp=5:5:0.6", "format=yuv420p"]
cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(a.fps), '-i', f'{a.frames}/f_%05d.jpg', '-vf', ','.join(vf), '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', a.out]
print(' '.join(cmd)); subprocess.run(cmd, check=True)
