#!/bin/bash
# bash tools/ep/new_episode.sh <EP> <script.txt> [niche=rickclips]
# Scaffold a new episode from the T015 template (skill episode, step 2) with a channel's defaults:
#   episodes/<EP>/{engine,art,audio/sfx_el,voice}, script.txt, episode.env, core/chars2/cutaway.js, build_sfx.py, prepare_mg.sh
#   + the Char.set fx cache-key fix (animated fx independent of worker split) + the channel's resolution (WIDTH/HEIGHT).
# Then: write the set file + main.js (skill shots), voice, audio_mix, stills gate — see docs/MUSE_RUNBOOK.md.
set -e; RC=$(cd "$(dirname "$0")/../.." && pwd); cd "$RC"
EP=$1; SCRIPT=$2; CH=${3:-rickclips}
[ -n "$EP" ] && [ -f "$SCRIPT" ] || { echo "usage: new_episode.sh <EP> <script.txt> [niche]"; exit 2; }
[ -e "episodes/$EP" ] && { echo "episodes/$EP already exists"; exit 1; }
[ -f "niches/$CH/channel.env" ] || { echo "no niches/$CH/channel.env"; exit 1; }
source "niches/$CH/channel.env"
mkdir -p episodes/$EP/{engine,art,audio/sfx_el,voice}
cp episodes/T015/{build_sfx.py,prepare_mg.sh} episodes/$EP/
cp episodes/T015/engine/{core.js,chars2.js,cutaway.js} episodes/$EP/engine/
cp "$SCRIPT" episodes/$EP/script.txt
grep -nE '[0-9]' episodes/$EP/script.txt && echo "!! digits in script.txt — spell numbers out as spoken (alignment needs words)"
C=episodes/$EP/engine/core.js
sed -i "s/WIDTH = 1080, HEIGHT = 1920/WIDTH = ${WIDTH:-720}, HEIGHT = ${HEIGHT:-1280}/" "$C"
node -e '
const f=process.argv[1],fs=require("fs");let s=fs.readFileSync(f,"utf8");
const a=": v); if (k !== this.key)", b=": v) + (state.fx && Object.values(state.fx).some(Boolean) ? Math.round(t * 30) : \"\"); if (k !== this.key)";
if(!s.includes(a)){console.log("!! fx cache-key pattern not found — apply by hand (CLAUDE.md, determinism)");process.exit(0)}
fs.writeFileSync(f,s.replace(a,b));console.log("fx cache-key fix applied")' "$C"
node --check "$C"
cat > episodes/$EP/episode.env <<ENV
# $EP — channel $CH ($CHANNEL_NAME)
NAME=${EP}_${NAME_SUFFIX:-RickClips}   # rename to Title_Words_${NAME_SUFFIX:-RickClips}
DUR=0               # set after voice_prep: voice length + ~1.3 s
TAKE=take1
TEMPO=${TEMPO:-1.14}
VOICE_OFFSET=0.10
MUSIC=music1.mp3
CHANNEL=$CH
ENV
grep -n "WIDTH =" "$C"; echo "scaffolded episodes/$EP (channel $CH, ${WIDTH:-720}x${HEIGHT:-1280}); next: docs/MUSE_RUNBOOK.md §Episode"
