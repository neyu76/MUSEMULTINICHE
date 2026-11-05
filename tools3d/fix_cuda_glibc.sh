#!/bin/bash
# GPU ONLY. CUDA 12.8 headers + glibc ≥ 2.41 (Ubuntu 26.04): "exception specification is incompatible" for cospi/sinpi/rsqrt.
# Fix = add noexcept(true) to those 6 declarations in math_functions.h (what CUDA 12.9 ships), then build the texture extensions.
set -e; H=${H3D:-$HOME/h3d}; SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO=sudo
F=/usr/local/cuda-12.8/include/crt/math_functions.h
[ -f $F.orig ] || $SUDO cp $F $F.orig
$SUDO python3 -I - "$F" <<'PY'
import re, sys
p = sys.argv[1]; s = open(p).read(); n = 0
for fn in ('cospi', 'sinpi', 'rsqrt', 'cospif', 'sinpif', 'rsqrtf'):
    pat = re.compile(r'(extern\s+__DEVICE_FUNCTIONS_DECL__\s+__device_builtin__\s+(?:double|float)\s+' + fn + r'\((?:double|float)\s+x\))\s*;')
    s, k = pat.subn(r'\1 noexcept (true);', s); n += k
open(p, 'w').write(s); print('patched declarations:', n)
PY
export CUDA_HOME=/usr/local/cuda-12.8 PATH=/usr/local/cuda-12.8/bin:$HOME/.local/bin:$PATH CC=gcc-14 CXX=g++-14 NVCC_CCBIN=g++-14 TORCH_CUDA_ARCH_LIST=${TORCH_CUDA_ARCH_LIST:-8.6}
source $H/venv/bin/activate; cd $H/repo
(cd hy3dgen/texgen/custom_rasterizer && python setup.py install >/tmp/cr.log 2>&1 && echo "custom_rasterizer ok" || { grep -iE " error" /tmp/cr.log | head; exit 1; })
(cd hy3dgen/texgen/differentiable_renderer && python setup.py install >/tmp/dr.log 2>&1 && echo "differentiable_renderer ok" || { grep -iE "error" /tmp/dr.log | head; exit 1; })
