"""Chuyển tóc MakeHuman (định dạng three.js JSON v3 trong gói npm makehuman-data) sang JSON gọn cho engine:
{pos:[...], uv:[...], idx:[...], tex:"<tên>.png", headBox:{min,max}} + chép texture.
Chỉ chuyển các kiểu tóc HỆ THỐNG của MakeHuman (bộ "MakeHuman system assets", CC0).
Dùng: python3 chuyen_toc_mh.py <thư mục .../proxies/hair> <thư mục ra engine/assets/hair_mh>"""
import json, sys, os, shutil
SYSTEM = ['afro01', 'Braid01', 'short01', 'short02', 'short03', 'short04', 'long01', 'ponytail01', 'bob01', 'bob02']
# hộp đầu của lưới gốc MakeHuman (đơn vị dm): đo trên human_full_size.json, đỉnh y>6,35, |x|<1,3
MH_HEAD = {'min': [-0.879, 6.35, -0.392], 'max': [0.879, 8.491, 1.681]}

def parse(d):
    V = d['vertices']; UV = d['uvs'][0] if d['uvs'] else []; F = d['faces']; i = 0
    pos, uv, idx = [], [], []
    def vert(vi, ti):
        pos.extend(V[vi * 3:vi * 3 + 3]); uv.extend(UV[ti * 2:ti * 2 + 2] if UV else [0, 0]); return len(pos) // 3 - 1
    nuv = len(d['uvs']) if d['uvs'] else 0
    while i < len(F):
        t = F[i]; i += 1
        quad, mat, fuv, fvuv, fn, fvn, fc, fvc = [(t >> b) & 1 for b in range(8)]
        n = 4 if quad else 3
        vs = F[i:i + n]; i += n
        if mat: i += 1
        if fuv: i += nuv
        tvs = None
        if fvuv:
            tvs = F[i:i + n]; i += n * max(1, nuv)
        if fn: i += 1
        if fvn: i += n
        if fc: i += 1
        if fvc: i += n
        ids = [vert(vs[k], tvs[k] if tvs else 0) for k in range(n)]
        idx.extend([ids[0], ids[1], ids[2]])
        if quad: idx.extend([ids[0], ids[2], ids[3]])
    return pos, uv, idx

src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
for name in SYSTEM:
    p = os.path.join(src, name, name + '.json')
    if not os.path.exists(p): print('thiếu', name); continue
    d = json.load(open(p)); pos, uv, idx = parse(d)
    tex = d['materials'][0].get('mapDiffuse', '')
    tname = None
    if tex:
        tp = os.path.join(src, name, tex)
        if os.path.exists(tp): tname = name.lower() + '.png'; shutil.copy(tp, os.path.join(out, tname))
    json.dump({'name': name.lower(), 'pos': [round(x, 4) for x in pos], 'uv': [round(x, 4) for x in uv], 'idx': idx, 'tex': tname, 'headBox': MH_HEAD,
               'license': 'CC0 (MakeHuman system assets)'}, open(os.path.join(out, name.lower() + '.json'), 'w'))
    print(name, len(pos) // 3, 'đỉnh', len(idx) // 3, 'tam giác', tname)
