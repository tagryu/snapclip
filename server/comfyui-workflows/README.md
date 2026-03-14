# ComfyUI Setup for SnapClip

## Quick Start

### 1. Install ComfyUI
```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
```

### 2. Required Models

Download and place in `ComfyUI/models/`:

**Checkpoint:**
- `checkpoints/sd_xl_base_1.0.safetensors` — [HuggingFace](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)

**ControlNet (for background replacement):**
- `controlnet/control-lora-canny-rank256.safetensors` — [HuggingFace](https://huggingface.co/stabilityai/control-lora)

**IP-Adapter (for multi-angle generation):**
- `ipadapter/ip-adapter-plus_sdxl_vit-h.safetensors` — [HuggingFace](https://huggingface.co/h94/IP-Adapter)
- `clip_vision/CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` — [HuggingFace](https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K)

### 3. Required Custom Nodes

Install via ComfyUI Manager or manually:
- [ComfyUI ControlNet Aux](https://github.com/Fannovel16/comfyui_controlnet_aux) — Canny edge preprocessor
- [ComfyUI IPAdapter Plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus) — IP-Adapter nodes

### 4. Start ComfyUI
```bash
python main.py --listen 0.0.0.0 --port 8188
```

### 5. Configure SnapClip
In `server/.env`:
```
COMFYUI_URL=http://localhost:8188
```

## Cloud GPU (Optional)

For RunPod/Vast.ai, set `COMFYUI_URL` to your cloud instance URL.

## Workflows

- `background-replace.json` — SDXL + ControlNet Canny for product background replacement
- `multi-angle.json` — IP-Adapter + SDXL for generating different product views

These are reference workflows. The actual workflows are built programmatically in `server/pipeline/local-image.ts`.

## Without ComfyUI

SnapClip works without ComfyUI — it falls back to Sharp-based image simulation. The quality is lower but it always works.

Fallback chain: **Gemini API → ComfyUI/SDXL → Sharp simulation**
