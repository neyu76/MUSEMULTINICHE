#!/bin/bash
# RickClips — install everything on a clean Ubuntu (tested: Ubuntu 26.04, x86_64, no GPU). Idempotent.
#   bash setup.sh                         apt + Node + Python venv (pinned) + npm ci + Chromium + fonts, then checks
#   bash setup.sh --assets <assets.zip>   …and unpack the asset zip into the repo + verify MANIFEST.txt (SHA256)
#   bash setup.sh --check                 checks only
# Needs sudo (or root) for apt. Does NOT install anything GPU-related: Hunyuan3D-2 is tools3d/install_hunyuan3d.sh (NVIDIA only).
set -e
RC=$(cd "$(dirname "$0")" && pwd); cd "$RC"
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO=sudo
ok(){ echo "  [OK]   $*"; }; bad(){ echo "  [MISSING] $*"; FAIL=1; }
MODE=install; ASSETS=""; FAIL=0
while [ $# -gt 0 ]; do case "$1" in --check) MODE=check;; --assets) ASSETS=$2; shift;; esac; shift; done
NODE_MAJOR=22            # reference: node v22.22.1, npm 9+
if [ $MODE = install ]; then
  echo "== apt"
  export DEBIAN_FRONTEND=noninteractive
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg melt fonts-dejavu-core fontconfig rsync git curl unzip ca-certificates \
       python3 python3-venv python3-dev build-essential libsndfile1 >/dev/null
  ok "ffmpeg $(ffmpeg -version | head -1 | awk '{print $3}'), melt $(melt --version 2>&1 | head -1 | awk '{print $2}')"
  echo "== Node $NODE_MAJOR"
  if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt $NODE_MAJOR ]; then
    curl -fsSL https://deb.nodesource.com/setup_$NODE_MAJOR.x | $SUDO -E bash - >/dev/null && $SUDO apt-get install -y -qq nodejs >/dev/null
  fi
  ok "node $(node -v)"
  echo "== Python venv (.venv, pinned)"
  [ -x .venv/bin/python3 ] || python3 -m venv .venv
  .venv/bin/pip install -q --upgrade pip
  if [ -f requirements.lock ]; then .venv/bin/pip install -q -r requirements.lock; else .venv/bin/pip install -q -r requirements.txt; fi
  ok "pip: $(.venv/bin/pip list 2>/dev/null | grep -iE '^(numpy|pillow|opencv-python-headless|scipy|librosa|pocketsphinx) ' | awk '{printf "%s %s, ", $1, $2}')"
  echo "== npm ci (engine_v4: three 0.170.0, postprocessing 6.39.5, n8ao 2.0.1, gsap 3.15.0, playwright 1.64.1)"
  (cd engine_v4 && npm ci --no-audit --no-fund >/dev/null)
  echo "== Chromium for Playwright (+ its system libraries)"
  (cd engine_v4 && $SUDO npx playwright install-deps chromium >/dev/null 2>&1 || true; npx playwright install chromium >/dev/null)
  echo "== fonts (Work Sans for captions/Kdenlive)"
  mkdir -p ~/.local/share/fonts && cp fonts/*.ttf ~/.local/share/fonts/ && fc-cache -f >/dev/null
fi
if [ -n "$ASSETS" ]; then
  echo "== assets: $ASSETS"
  python3 -I -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$ASSETS" "$RC"
  (cd "$RC" && sha256sum --quiet -c MANIFEST.txt) && ok "all files match MANIFEST.txt" || bad "SHA256 mismatch (see above)"
fi
echo "== checks"
for c in node npm ffmpeg ffprobe melt rsync; do command -v $c >/dev/null && ok $c || bad $c; done
[ -x .venv/bin/python3 ] && .venv/bin/python3 -c "import cv2, numpy, PIL, scipy, librosa, pocketsphinx" 2>/dev/null && ok "python venv imports" || bad "python venv (.venv) — run bash setup.sh"
[ -d engine_v4/node_modules/three ] && [ -d engine_v4/node_modules/playwright ] && ok "engine_v4/node_modules" || bad "engine_v4/node_modules — run bash setup.sh"
fc-list | grep -qi "Work Sans" && ok "Work Sans font" || bad "Work Sans font"
for f in episodes/T015/art/jug.glb episodes/T015/voice/take2.mp3 episodes/T015/audio/music1.mp3 engine_v4/mg/ground.jpg; do [ -f $f ] && ok "asset $f" || bad "asset $f — bash setup.sh --assets rickclips_assets_T015.zip"; done
echo "== test render (1 frame, SS=1, kit engine_v4)"
(cd engine_v4 && SS=1 timeout 300 node render.js /tmp/rc_setup_test 0 0 30 0.7 2>&1 | grep -E "done|err" | tail -2) && [ -f /tmp/rc_setup_test/still_0.70.jpg ] && ok "engine renders (/tmp/rc_setup_test/still_0.70.jpg)" || bad "engine render"
[ $FAIL = 0 ] && echo "SETUP OK" || { echo "SETUP INCOMPLETE"; exit 1; }
