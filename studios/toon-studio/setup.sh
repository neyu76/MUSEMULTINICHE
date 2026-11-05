#!/bin/bash
# toon-studio toolchain (Ubuntu / Debian / WSL). Idempotent.
#   bash setup.sh              ffmpeg + tesseract + main venv (~/.toonstudio/venv)
#   bash setup.sh --birefnet   also the rembg venv for BiRefNet pose cut-outs (~/.toonstudio/rembg, model ~1 GB on first use)
#   bash setup.sh --check      report what is installed
# Machine paths go to local.json (gitignored): {"python": ..., "birefnet_python": ..., "work_dir": ...}
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="${STUDIO_VENV:-$HOME/.toonstudio/venv}"
RVENV="$HOME/.toonstudio/rembg"
PKGS="numpy scipy opencv-python-headless<5 pillow scikit-learn soundfile librosa pyloudnorm scenedetect faster-whisper"

check() {
  for b in ffmpeg ffprobe tesseract python3; do printf '%-10s %s\n' "$b" "$(command -v $b >/dev/null && echo ok || echo MISSING)"; done
  "$ROOT/bin/studio" --help >/dev/null 2>&1 && echo "studio     ok" || echo "studio     MISSING venv"
  [ -f "$ROOT/local.json" ] && { echo "local.json:"; cat "$ROOT/local.json"; } || echo "local.json none (defaults)"
}
[ "$1" = "--check" ] && { check; exit 0; }

if command -v apt-get >/dev/null; then
  SUDO=$([ "$(id -u)" = 0 ] || echo sudo)
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg tesseract-ocr fonts-dejavu-core python3-venv python3-pip >/dev/null
fi
# reuse an existing vidclone venv when there is one (same packages)
if [ ! -x "$VENV/bin/python" ] && [ -x "$HOME/.vidclone/venv/bin/python" ]; then
  echo "reusing ~/.vidclone/venv"; VENV="$HOME/.vidclone/venv"
fi
[ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q $PKGS
if [ "$1" = "--birefnet" ]; then
  [ -x "$RVENV/bin/python" ] || python3 -m venv "$RVENV"
  "$RVENV/bin/pip" install -q --upgrade pip
  "$RVENV/bin/pip" install -q "rembg[cpu]" pillow numpy
fi
chmod +x "$ROOT/bin/studio"
[ -f "$ROOT/local.json" ] || "$VENV/bin/python" - "$ROOT" "$VENV" "$RVENV" <<'PY'
import json, os, sys
root, venv, rvenv = sys.argv[1:4]
json.dump({"python": f"{venv}/bin/python", "birefnet_python": f"{rvenv}/bin/python"}, open(f"{root}/local.json", "w"), indent=1)
PY
check
