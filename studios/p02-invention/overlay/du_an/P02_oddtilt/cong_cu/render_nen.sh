#!/usr/bin/env bash
# Render nền, chạy lại an toàn (watchdog): chia khung thành N tiến trình, bỏ qua khung đã có (render.js overlay), không chạy chồng.
# Dùng: bash cong_cu/render_nen.sh <canh.html> <thư mục khung> <số khung> [N=2] [rộng=1080] [cao=1920]
#   ví dụ: bash cong_cu/render_nen.sh e06_chuong.html ~/p02_work/E06/r1080 1062 2
#   tham số cảnh được: "e09_x.html?mb=3" (số khung phụ motion blur nếu cảnh đọc q.get('mb')), "…?nb=1" (tắt blur — bản nháp)
# Trạng thái: bash cong_cu/render_nen.sh --dem <thư mục khung> <số khung>
set -uo pipefail
P="$(cd "$(dirname "$0")/.." && pwd)"
if [ "${1:-}" = "--dem" ]; then n=$(ls "$2"/f_*.jpg 2>/dev/null | wc -l); echo "$n/$3 khung"; pgrep -f "render.js .*$(basename "$2")" >/dev/null && echo "đang chạy" || echo "không chạy"; exit 0; fi
SCENE="${1:?canh.html}"; OUT="${2:?thư mục khung}"; NF="${3:?số khung}"; N="${4:-2}"; W="${5:-1080}"; H="${6:-1920}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
if pgrep -f "render.js .*$OUT" >/dev/null; then echo "đang render rồi ($OUT) — không chạy chồng"; exit 0; fi
have=$(ls "$OUT"/f_*.jpg 2>/dev/null | wc -l); [ "$have" -ge "$NF" ] && { echo "đủ $NF khung"; exit 0; }
rm -f "$OUT"/*.tmp
step=$(( (NF + N - 1) / N ))
for ((i=0; i<N; i++)); do a=$((i*step)); b=$(( (i+1)*step < NF ? (i+1)*step : NF ))
  case "$SCENE" in *\?*) URL="$SCENE&w=$W";; *) URL="$SCENE?w=$W";; esac
  ( cd "$P/engine" && JPEGQ="${JPEGQ:-0.97}" setsid nohup node render.js "$URL" "$OUT" 30 $a $b $W $H > "$OUT/log_$i.txt" 2>&1 & )
done
echo "khởi chạy $N tiến trình cho $((NF-have)) khung còn thiếu → $OUT (log_*.txt)"
