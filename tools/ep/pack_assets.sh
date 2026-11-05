#!/bin/bash
# bash tools/ep/pack_assets.sh <EP>   → ~/rc_work/rickclips_assets_<EP>.zip (+ .sha256)
# Binaries of one episode (art/ audio/ voice/) with repo-root paths + MANIFEST.txt, so a fresh machine restores them with
#   bash setup.sh --assets rickclips_assets_<EP>.zip      (upload the zip as GitHub release assets-<EP>, or to Drive)
set -e; source "$(dirname "$0")/env.sh" "$1"; cd "$RC"
Z=$WORK/rickclips_assets_$EPN.zip; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
find "episodes/$EPN/art" "episodes/$EPN/audio" "episodes/$EPN/voice" -type f 2>/dev/null | sort > "$T/list"
[ -s "$T/list" ] || { echo "no binaries under episodes/$EPN/{art,audio,voice}"; exit 1; }
xargs -d '\n' sha256sum < "$T/list" > "$T/MANIFEST.txt"
rm -f "$Z"; python3 -I - "$Z" "$T/MANIFEST.txt" "$T/list" <<'PY'
import sys, zipfile
z, man, lst = sys.argv[1:4]
with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as f:
    for p in open(lst).read().split("\n"):
        if p: f.write(p, p)
    f.write(man, "MANIFEST.txt")
PY
(cd "$WORK" && sha256sum "$(basename "$Z")" > "$(basename "$Z").sha256")
echo "$(wc -l < "$T/list") files → $Z ($(du -h "$Z" | cut -f1))"
