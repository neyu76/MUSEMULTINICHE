#!/usr/bin/env bash
# Chép lớp nâng cấp p02-invention đè lên kit P02 (mailcontentnba76-cell/absurdplay-kit, nhánh du-an-moi).
# Dùng: bash studios/p02-invention/cai_overlay.sh <thư mục kit absurdplay-kit>
# Chỉ thêm file mới + thay engine/render.js (bản cũ lưu render.js.goc). Không xoá gì của kit. Chạy lại an toàn.
set -euo pipefail
KIT="${1:?đường dẫn kit absurdplay-kit}"; HERE="$(cd "$(dirname "$0")" && pwd)"
P="$KIT/du_an/P02_oddtilt"
[ -d "$P/engine" ] || { echo "không thấy $P/engine — kit đúng nhánh du-an-moi chưa?"; exit 1; }
[ -f "$P/engine/render.js.goc" ] || cp "$P/engine/render.js" "$P/engine/render.js.goc"
cp -r "$HERE/overlay/du_an/P02_oddtilt/." "$P/"
mkdir -p "$P/engine/moc"
for f in "$P"/cong_cu/{moc_shot,tron_am_auto,qa_tap,giong_chuan,tao_phu_de}.py "$P/engine/render.js"; do
  case "$f" in *.py) python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" "$f";; *.js) node --check "$f";; esac
done
bash -n "$P/cong_cu/render_nen.sh"; chmod +x "$P/cong_cu/render_nen.sh"
echo "OVERLAY OK → $P (cong_cu: moc_shot, giong_chuan, tron_am_auto, qa_tap, tao_phu_de, render_nen.sh; engine/render.js resume + CHROME_PATH)"
