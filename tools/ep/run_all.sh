#!/bin/bash
# bash tools/ep/run_all.sh <EP> [workers]     — whole episode, no GPU needed (~2 h for T015 on 10 workers; render is ~95 % of it)
# voice → mix + captions → stills sanity check → full render → assemble + Kdenlive + QA → preview → compare with reference (if present)
# Detached:  setsid nohup bash tools/ep/run_all.sh T015 > ~/rc_work/T015.run.log 2>&1 &
set -e; D=$(dirname "$0"); source "$D/env.sh" "$1"
bash "$D/sync_engine.sh" "$EPN"
bash "$D/voice_prep.sh" "$EPN"
bash "$D/audio_mix.sh" "$EPN"
bash "$D/stills.sh" "$EPN" sanity "0.6,14.9,27.5,45.0" 1
bash "$D/render.sh" "$EPN" ${2:-}
bash "$D/finalize.sh" "$EPN"
bash "$D/preview.sh" "$EPN"
REF=$RC/assets/reference/$EPN; [ -d "$REF" ] && python3 -I "$D/compare_ref.py" "$EP" "$REF" || echo "(no reference for $EPN in assets/)"
echo "DONE $EPN → $EP/deliver/$NAME.mp4"
