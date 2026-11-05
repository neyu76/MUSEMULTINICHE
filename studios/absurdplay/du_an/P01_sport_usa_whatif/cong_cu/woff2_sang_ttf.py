"""Đổi font .woff2 (@fontsource) sang .ttf và đặt tên họ riêng để libass / melt / Kdenlive tìm được bằng tên.
libass KHÔNG đọc .woff2 → nếu chỉ có woff2 thì phụ đề rơi về DejaVu Sans (lỗi phát hiện 05/11/2026).
Cần: pip install fonttools brotli
Dùng: python3 woff2_sang_ttf.py <vao.woff2> <ra.ttf> "<Tên họ>"   (vd "Inter ExtraBold")
"""
import sys
from fontTools.ttLib import TTFont
src, dst, family = sys.argv[1], sys.argv[2], sys.argv[3]
f = TTFont(src); f.flavor = None
n = f['name']
for rec in list(n.names):
    if rec.nameID in (1, 4, 16, 17, 6):
        n.removeNames(nameID=rec.nameID)
ps = family.replace(' ', '')
for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
    n.setName(family, 1, pid, eid, lid); n.setName('Regular', 2, pid, eid, lid)
    n.setName(family, 4, pid, eid, lid); n.setName(ps, 6, pid, eid, lid)
f['OS/2'].usWeightClass = 400; f['OS/2'].fsSelection = 0x40  # REGULAR: tên họ đã mang độ đậm, tránh libass tự in đậm thêm
f['head'].macStyle = 0
f.save(dst)
print('ok', dst, family)
