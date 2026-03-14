import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { logger } from '../src/logger';

// ─── ComfyUI Configuration ───

interface ComfyUIConfig {
  host: string;
}

function getComfyConfig(): ComfyUIConfig | null {
  const host = process.env.COMFYUI_URL;
  if (!host) return null;
  return { host };
}

// ─── ComfyUI API Helpers ───

async function isComfyAvailable(config: ComfyUIConfig): Promise<boolean> {
  try {
    const res = await fetch(`${config.host}/system_stats`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function uploadImageToComfy(config: ComfyUIConfig, imagePath: string, filename: string): Promise<string> {
  const buffer = await fs.readFile(imagePath);
  const blob = new Blob([buffer], { type: 'image/png' });
  const form = new FormData();
  form.append('image', blob, filename);
  form.append('overwrite', 'true');

  const res = await fetch(`${config.host}/upload/image`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`ComfyUI upload failed: ${res.status}`);
  const data = await res.json() as { name: string };
  return data.name;
}

async function queueComfyWorkflow(config: ComfyUIConfig, workflow: object): Promise<string> {
  const res = await fetch(`${config.host}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });
  if (!res.ok) throw new Error(`ComfyUI queue failed: ${res.status}`);
  const data = await res.json() as { prompt_id: string };
  return data.prompt_id;
}

async function waitForResult(config: ComfyUIConfig, promptId: string, timeoutMs = 120000): Promise<Buffer> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${config.host}/history/${promptId}`);
    if (res.ok) {
      const history = await res.json() as Record<string, any>;
      const entry = history[promptId];
      if (entry?.outputs) {
        // Find the first image output
        for (const nodeId of Object.keys(entry.outputs)) {
          const output = entry.outputs[nodeId];
          if (output.images && output.images.length > 0) {
            const img = output.images[0];
            const imgRes = await fetch(
              `${config.host}/view?filename=${img.filename}&subfolder=${img.subfolder || ''}&type=${img.type || 'output'}`
            );
            if (imgRes.ok) {
              return Buffer.from(await imgRes.arrayBuffer());
            }
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('ComfyUI workflow timed out');
}

// ─── Background Replace Workflow ───

function buildBackgroundReplaceWorkflow(inputFilename: string, scene: string, aspectRatio: string): object {
  const negative = 'blurry, distorted, cartoon, watermark, text, low quality';
  const positive = `product photography, ${scene}, studio lighting, professional, 4K, clean background`;
  const dims = aspectRatio === '9:16' ? { w: 768, h: 1344 } :
               aspectRatio === '1:1'  ? { w: 1024, h: 1024 } :
                                        { w: 1344, h: 768 };

  return {
    '1': { class_type: 'LoadImage', inputs: { image: inputFilename } },
    '2': { class_type: 'CannyEdgePreprocessor', inputs: { image: ['1', 0], low_threshold: 100, high_threshold: 200, resolution: 1024 } },
    '3': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'sd_xl_base_1.0.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['3', 1] } },
    '5': { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['3', 1] } },
    '6': { class_type: 'ControlNetLoader', inputs: { control_net_name: 'control-lora-canny-rank256.safetensors' } },
    '7': { class_type: 'ControlNetApplyAdvanced', inputs: { positive: ['4', 0], negative: ['5', 0], control_net: ['6', 0], image: ['2', 0], strength: 0.65, start_percent: 0.0, end_percent: 0.85 } },
    '8': { class_type: 'EmptyLatentImage', inputs: { width: dims.w, height: dims.h, batch_size: 1 } },
    '9': { class_type: 'KSampler', inputs: { model: ['3', 0], positive: ['7', 0], negative: ['7', 1], latent_image: ['8', 0], seed: Math.floor(Math.random() * 2 ** 32), steps: 25, cfg: 7.0, sampler_name: 'euler_ancestral', scheduler: 'normal', denoise: 0.85 } },
    '10': { class_type: 'VAEDecode', inputs: { samples: ['9', 0], vae: ['3', 2] } },
    '11': { class_type: 'SaveImage', inputs: { images: ['10', 0], filename_prefix: 'snapclip_bg' } },
  };
}

// ─── Multi-Angle Workflow ───

function buildMultiAngleWorkflow(inputFilename: string, angle: string): object {
  const positive = `same product, ${angle} view, product photography, studio lighting, clean background, professional`;
  const negative = 'blurry, distorted, cartoon, watermark, text, different product';

  return {
    '1': { class_type: 'LoadImage', inputs: { image: inputFilename } },
    '2': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'sd_xl_base_1.0.safetensors' } },
    '3': { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: 'ip-adapter-plus_sdxl_vit-h.safetensors' } },
    '4': { class_type: 'CLIPVisionLoader', inputs: { clip_name: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors' } },
    '5': { class_type: 'IPAdapterApply', inputs: { ipadapter: ['3', 0], clip_vision: ['4', 0], image: ['1', 0], model: ['2', 0], weight: 0.8, noise: 0.2, weight_type: 'linear', start_at: 0.0, end_at: 1.0 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['2', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['2', 1] } },
    '8': { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 1024, batch_size: 1 } },
    '9': { class_type: 'KSampler', inputs: { model: ['5', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['8', 0], seed: Math.floor(Math.random() * 2 ** 32), steps: 25, cfg: 7.0, sampler_name: 'euler_ancestral', scheduler: 'normal', denoise: 0.75 } },
    '10': { class_type: 'VAEDecode', inputs: { samples: ['9', 0], vae: ['2', 2] } },
    '11': { class_type: 'SaveImage', inputs: { images: ['10', 0], filename_prefix: `snapclip_angle_${angle.replace(/\s+/g, '_')}` } },
  };
}

// ─── Sharp Fallbacks (always work) ───

async function fallbackSimulatedAngle(
  imagePath: string,
  angle: string,
  outputDir: string
): Promise<string> {
  const meta = await sharp(imagePath).metadata();
  const w = meta.width || 1080;
  const h = meta.height || 1080;
  const outputPath = path.join(outputDir, `sim_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);
  const margin = Math.round(w * 0.08);

  if (angle === 'back') {
    await sharp(imagePath).flop().resize(w, h, { fit: 'cover' }).png().toFile(outputPath);
    return outputPath;
  }

  let extract: { left: number; top: number; width: number; height: number };
  switch (angle) {
    case 'front':
      extract = { left: margin, top: margin, width: w - margin * 2, height: h - margin * 2 };
      break;
    case '45-degree':
      extract = { left: Math.round(w * 0.12), top: margin, width: Math.round(w * 0.8), height: h - margin * 2 };
      break;
    case 'side':
      extract = { left: Math.round(w * 0.15), top: Math.round(h * 0.05), width: Math.round(w * 0.7), height: Math.round(h * 0.9) };
      break;
    default:
      extract = { left: margin, top: margin, width: w - margin * 2, height: h - margin * 2 };
  }

  await sharp(imagePath)
    .extract(extract)
    .resize(w, h, { fit: 'cover' })
    .png()
    .toFile(outputPath);

  return outputPath;
}

// ─── Exported Functions ───

export async function generateRealisticBackground_local(
  productImagePath: string,
  scene: string,
  aspectRatio: string,
  outputDir: string
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });

  const config = getComfyConfig();
  if (!config) {
    logger.info('No COMFYUI_URL configured, skipping local image generation');
    return productImagePath;
  }

  if (!(await isComfyAvailable(config))) {
    logger.warn('ComfyUI server not reachable, skipping local background generation');
    return productImagePath;
  }

  try {
    const filename = `input_${Date.now()}.png`;
    const uploadedName = await uploadImageToComfy(config, productImagePath, filename);
    const workflow = buildBackgroundReplaceWorkflow(uploadedName, scene, aspectRatio);
    const promptId = await queueComfyWorkflow(config, workflow);
    const resultBuffer = await waitForResult(config, promptId);

    const outputPath = path.join(outputDir, `local_bg_${Date.now()}.png`);
    await fs.writeFile(outputPath, resultBuffer);
    logger.info(`Local realistic background generated: ${outputPath}`);
    return outputPath;
  } catch (err: any) {
    logger.warn(`Local background generation failed: ${err.message}`);
    return productImagePath;
  }
}

export async function generateMultiAngle_local(
  productImagePath: string,
  angles: string[],
  outputDir: string
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const config = getComfyConfig();
  if (!config || !(await isComfyAvailable(config))) {
    logger.info('ComfyUI not available, using Sharp fallback for multi-angle');
    return fallbackMultiAngle_local(productImagePath, angles, outputDir);
  }

  const results: string[] = [];
  try {
    const filename = `input_${Date.now()}.png`;
    const uploadedName = await uploadImageToComfy(config, productImagePath, filename);

    for (const angle of angles) {
      try {
        const workflow = buildMultiAngleWorkflow(uploadedName, angle);
        const promptId = await queueComfyWorkflow(config, workflow);
        const resultBuffer = await waitForResult(config, promptId);

        const outputPath = path.join(outputDir, `local_angle_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);
        await fs.writeFile(outputPath, resultBuffer);
        results.push(outputPath);
        logger.info(`Local multi-angle ${angle} generated: ${outputPath}`);
      } catch (err: any) {
        logger.warn(`Local multi-angle ${angle} failed: ${err.message}`);
        const fb = await fallbackSimulatedAngle(productImagePath, angle, outputDir);
        results.push(fb);
      }
    }
    return results;
  } catch (err: any) {
    logger.warn(`Local multi-angle generation failed entirely: ${err.message}`);
    return fallbackMultiAngle_local(productImagePath, angles, outputDir);
  }
}

async function fallbackMultiAngle_local(
  imagePath: string,
  angles: string[],
  outputDir: string
): Promise<string[]> {
  const results: string[] = [];
  for (const angle of angles) {
    results.push(await fallbackSimulatedAngle(imagePath, angle, outputDir));
  }
  return results;
}
