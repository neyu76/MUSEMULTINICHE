#!/bin/bash
# bash tools/ep/watchdog.sh <EP> [workers=1]     — schedule every 15 min while a render is active (the scheduler must live
# outside the VM: a VM replacement kills nohup/systemd jobs). Starts render.sh (resumable) if it is not running and not finished.
# Done when $EP/logs/render_loop.out contains "RENDER FINISHED" → remove the schedule.
set -e; source "$(dirname "$0")/env.sh" "$1"; W=${2:-1}
LOG=$EP/logs/render_loop.out; mkdir -p "$EP/logs" "$HOME/tmp"
exec 9>"$HOME/tmp/rc_watchdog_$EPN.lock"; flock -n 9 || exit 0
grep -q "RENDER FINISHED" "$LOG" 2>/dev/null && { echo "finished"; exit 0; }
pgrep -f "node render.js" >/dev/null && { echo "running: $(ls "$EP/frames" | wc -l) / $NFRAMES"; exit 0; }
echo "relaunch $(date) frames $(ls "$EP/frames" | wc -l) / $NFRAMES" | tee -a "$EP/logs/watchdog.txt"
setsid nohup env TMPDIR="$HOME/tmp" bash -c "for i in 1 2 3 4 5 6 7 8 9 10; do bash '$RC/tools/ep/render.sh' $EPN $W && break; sleep 60; done; echo RENDER FINISHED \$(date)" >> "$LOG" 2>&1 < /dev/null &
