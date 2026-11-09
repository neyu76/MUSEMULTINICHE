#!/usr/bin/env python3
"""Vá engine/render.js của kit TẠI CHỖ (không thay file) — giữ mọi tính năng mới của kit (vd đọc canvas #acc cho motion blur, E06).
Thêm: bỏ qua khung đã có (SKIP_EXISTING=0 để làm lại), ghi .tmp rồi đổi tên, CHROME_PATH. Chạy lại an toàn (có dấu VA_P02_INVENTION).
Dùng: python3 -I cong_cu/va_render.py <engine/render.js>
"""
import re, sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text()
if "VA_P02_INVENTION" in s:
    print("render.js đã vá"); sys.exit(0)
m = re.search(r"const frames = (list \? .*?\+f0 \+ i\));", s)
assert m, "không tìm thấy dòng const frames — kit đổi render.js, cần vá tay"
s = s.replace(m.group(0), "const all = " + m.group(1) + "\nconst fname = f => path.join(outDir, `f_${String(f).padStart(5, '0')}.jpg`);\n"
              "const frames = process.env.SKIP_EXISTING === '0' ? all : all.filter(f => !fs.existsSync(fname(f))); // VA_P02_INVENTION")
s = s.replace("const srv = http.createServer(", "if (!frames.length) { console.log('frames 0 (all exist)'); process.exit(0); }\nconst srv = http.createServer(", 1)
n = s.count("chromium.launch({ args:")
assert n == 1, "không tìm thấy chromium.launch"
s = re.sub(r"chromium\.launch\(\{ args: (\[[^\]]*\]) \}\)", r"chromium.launch({ args: \1, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })", s)
m = re.search(r"fs\.writeFileSync\(path\.join\(outDir, `f_\$\{String\(f\)\.padStart\(5, '0'\)\}\.jpg`\), (Buffer\.from\(d\.split\(','\)\[1\], 'base64'\))\);", s)
assert m, "không tìm thấy dòng ghi JPEG"
s = s.replace(m.group(0), "fs.writeFileSync(fname(f) + '.tmp', " + m.group(1) + "); fs.renameSync(fname(f) + '.tmp', fname(f));")
p.write_text(s); print("đã vá render.js (resume + ghi an toàn + CHROME_PATH)")
