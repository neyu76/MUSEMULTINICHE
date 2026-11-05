"""Image → textured 3D prop (GLB) with Hunyuan3D-2, sized for the RickClips CPU renderer.
usage: python gen_prop.py <image.png> <out.glb> [--faces 30000] [--no-texture]
Shape: Hunyuan3D-2mini Turbo (0.6B) + FlashVDM; texture: Hunyuan3D-Paint v2.0 Turbo; low-VRAM offload for a 12 GB card."""
import argparse, time, torch
from PIL import Image
from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline, FaceReducer, FloaterRemover, DegenerateFaceRemover

a = argparse.ArgumentParser(); a.add_argument('image'); a.add_argument('out'); a.add_argument('--faces', type=int, default=30000)
a.add_argument('--no-texture', action='store_true'); a.add_argument('--steps', type=int, default=5); a.add_argument('--seed', type=int, default=1234)
A = a.parse_args(); T = time.time(); log = lambda s: print(f'[{time.time() - T:6.1f}s] {s}', flush=True)

img = Image.open(A.image).convert('RGBA')
if img.getextrema()[3][0] == 255: img = BackgroundRemover()(img.convert('RGB')); log('background removed')
shape = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2mini', subfolder='hunyuan3d-dit-v2-mini-turbo', use_safetensors=True, device='cuda')
shape.enable_flashvdm(); log('shape model loaded')
mesh = shape(image=img, num_inference_steps=A.steps, octree_resolution=380, num_chunks=20000, generator=torch.manual_seed(A.seed), output_type='trimesh')[0]
log(f'shape: {len(mesh.faces)} faces')
del shape; torch.cuda.empty_cache()
mesh = FloaterRemover()(mesh); mesh = DegenerateFaceRemover()(mesh); mesh = FaceReducer()(mesh, max_facenum=A.faces); log(f'reduced: {len(mesh.faces)} faces')
if not A.no_texture:
    from hy3dgen.texgen import Hunyuan3DPaintPipeline
    paint = Hunyuan3DPaintPipeline.from_pretrained('tencent/Hunyuan3D-2', subfolder='hunyuan3d-paint-v2-0-turbo')
    paint.enable_model_cpu_offload(); log('paint model loaded (cpu offload)')
    mesh = paint(mesh, image=img); log('textured')
mesh.export(A.out); log(f'wrote {A.out}  peak VRAM {torch.cuda.max_memory_allocated() / 2**30:.1f} GB')
