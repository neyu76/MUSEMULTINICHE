#!/bin/bash
# bash tools/ep/preflight.sh      — run before every episode / render on a worker VM.
# apt packages (melt, ffmpeg…) live outside ~ and can vanish when the VM is replaced; this re-installs them (setup.sh is idempotent).
set -e; RC=$(cd "$(dirname "$0")/../.." && pwd); cd "$RC"
if bash setup.sh --check >/tmp/rc_preflight.log 2>&1; then echo "PREFLIGHT OK"; exit 0; fi
grep -E "MISSING" /tmp/rc_preflight.log || true
echo "== re-running setup.sh"; bash setup.sh >/tmp/rc_preflight_setup.log 2>&1 || { tail -30 /tmp/rc_preflight_setup.log; exit 1; }
bash setup.sh --check | tail -3 && echo "PREFLIGHT OK (reinstalled)"
