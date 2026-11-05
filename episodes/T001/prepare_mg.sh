#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures into $E/mg
# backdrops = Nano Banana 2.1 paintings (kept at original saturation); the relief map is turned 90° so the route runs up the vertical frame
set -e
python3 -I -c "
from PIL import Image
Image.open('$SRC/art/postoffice_back.png').convert('RGB').save('$E/mg/postoffice_back.jpg', quality=95)
Image.open('$SRC/art/street_back.png').convert('RGB').save('$E/mg/street_back.jpg', quality=95)
Image.open('$SRC/art/relief_map.png').convert('RGB').rotate(90, expand=True).save('$E/mg/relief_map.jpg', quality=95)"
