#!/bin/bash
# bash tools/ep/render.sh <EP> [workers=nproc] [RANGES]     log: $EP/logs/render.out, per worker $EP/logs/w<i>.log
# Full delivery render, SS=2, 30 fps → $EP/frames/f_%05d.jpg. render.js skips frames already on disk, so this is resumable.
#   RANGES  "a-b c-d"  frame-index ranges to DELETE first and re-render (after a fix), e.g. "300-580 765-905"
# Missing frames are split into equal-count chunks (one per worker), so a partial re-render keeps all workers busy.
# Frames a killed worker left broken or all-black are dropped and re-rendered (up to 3 passes).
# Long job: run detached so a closed terminal/agent timeout does not kill it:
#   setsid nohup bash tools/ep/render.sh T015 > ~/rc_work/T015/logs/render.out 2>&1 &
# Speed reference (CPU only, SwiftShader; i7-12700K 20 threads, 32 GB): ~42 s/frame/worker at 1080×1920 SS=2 with 10 workers
#   → 1392 frames ≈ 100 min. Each worker is one Chromium (~1–1.5 GB RAM): workers ≈ min(threads/2, RAM_GB/2.5).
set -e; source "$(dirname "$0")/env.sh" "$1"
N=${2:-$(python3 -c "import os; print(max(1, min(os.cpu_count() // 2, int(os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES') / 2**30 / 2.5))))")}; RANGES=${3:-}
bash "$RC/tools/ep/sync_engine.sh" "$EPN" >/dev/null
OUT=$EP/frames
for r in $RANGES; do a=${r%-*}; b=${r#*-}; for i in $(seq $a $b); do rm -f "$OUT/$(printf 'f_%05d.jpg' $i)"; done; done
drop_bad() { python3 -I "$RC/tools/ep/drop_bad_frames.py" "$OUT"; }
for pass in 1 2 3; do
  drop_bad
  MISS=$(python3 -I -c "import os; print(' '.join(str(i) for i in range($NFRAMES) if not os.path.exists('$OUT/f_%05d.jpg' % i)))")
  n=$(echo $MISS | wc -w); echo "pass $pass: missing $n / $NFRAMES  $(date +%T)"; [ "$n" -eq 0 ] && break
  python3 -I -c "
m=[int(x) for x in '$MISS'.split()]; N=$N; k=-(-len(m)//N)
for c in range(N):
    ch=m[c*k:(c+1)*k]; runs=[]
    for i in ch:
        if runs and i==runs[-1][1]+1: runs[-1][1]=i
        else: runs.append([i,i])
    print(' '.join(f'{a/30:.4f}:{(b+1)/30:.4f}' for a,b in runs))
" > "$EP/logs/chunks.txt"
  cd "$E"; w=0
  while read -r line; do
    [ -z "$line" ] && continue
    ( for r in $line; do SS=2 node render.js "$OUT" ${r%:*} ${r#*:} 30; done ) > "$EP/logs/w$w.log" 2>&1 &
    w=$((w+1))
  done < "$EP/logs/chunks.txt"
  wait
done
drop_bad
echo "frames: $(ls "$OUT" | wc -l) / $NFRAMES  $(date +%T)"
