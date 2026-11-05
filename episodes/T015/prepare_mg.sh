#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures/models into $E/mg
# taverna backdrop = Nano Banana 2.1 painting, kept at original saturation (v5); hero jug = Hunyuan3D-2 GLB
set -e
cp "$SRC/art/jug.glb" "$E/mg/jug.glb"
python3 -I -c "
from PIL import Image
Image.open('$SRC/art/orig_taverna_back.png').convert('RGB').save('$E/mg/taverna_back_v5.jpg', quality=95)"
