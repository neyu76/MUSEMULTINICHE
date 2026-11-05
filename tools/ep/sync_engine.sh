#!/bin/bash
# bash tools/ep/sync_engine.sh <EP>
# Build $E = engine_v4 (node_modules symlinked) + episodes/<EP>/engine/*.js overlay + mg/ textures. Safe to re-run (only the overlay changes).
set -e; source "$(dirname "$0")/env.sh" "$1"
[ -d "$RC/engine_v4/node_modules/three" ] || { echo "run setup.sh first (engine_v4/node_modules missing)"; exit 1; }
mkdir -p "$E/mg"
rsync -a --exclude=node_modules --exclude=mg --exclude=paris.js --exclude=rooms.js --exclude=think.js "$RC/engine_v4/" "$E/"
ln -sfn "$RC/engine_v4/node_modules" "$E/node_modules"
cp "$SRC/engine/"*.js "$E/"; cp "$SRC/engine/"*.html "$E/" 2>/dev/null || true
cp "$RC/engine_v4/mg/"* "$E/mg/" 2>/dev/null || true
[ -x "$SRC/prepare_mg.sh" ] && bash "$SRC/prepare_mg.sh"
node --check "$E/main.js" 2>/dev/null || node -e "require('fs').readFileSync('$E/main.js')"
echo "engine ready: $E"
