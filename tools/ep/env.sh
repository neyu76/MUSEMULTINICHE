# source tools/ep/env.sh <EPISODE>      e.g.  source tools/ep/env.sh T015
# Sets the paths every pipeline script uses. Nothing here is machine-specific.
#   RC   repo root                      SRC  $RC/episodes/<EP>  (tracked sources + binaries unpacked from the asset zip)
#   WORK ${RC_WORK:-$HOME/rc_work}      EP   $WORK/<EP>         (frames, voice, audio, out, deliver, qa_out, logs)
#   E    $WORK/engine_<EP>              (engine_v4 + episode overlay + mg/ textures; built by sync_engine.sh)
RC=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
EPN=${1:-${EPN:-}}; [ -n "$EPN" ] || { echo "usage: <script> <EPISODE>  (folder name under episodes/)"; exit 2; }
SRC=$RC/episodes/$EPN; [ -d "$SRC" ] || { echo "no episode folder $SRC"; exit 2; }
WORK=${RC_WORK:-$HOME/rc_work}; EP=$WORK/$EPN; E=$WORK/engine_$EPN; KIT=$RC
# per-episode settings: NAME DUR TAKE TEMPO VOICE_OFFSET MUSIC
source "$SRC/episode.env"
NFRAMES=$(python3 -c "print(round($DUR*30))")
[ -x "$RC/.venv/bin/python3" ] && export PATH="$RC/.venv/bin:$PATH"
mkdir -p "$EP"/{voice,out,audio,frames,logs}
export RC EPN SRC WORK EP E KIT NAME DUR NFRAMES
