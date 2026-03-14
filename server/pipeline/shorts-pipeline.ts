import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { spawn } from 'child_process';
import { logger } from '../src/logger';
import { analyzeProduct } from './gemini-image';
import { generateCopy } from './copywriter';
import { generateVeoClips, generateVeoPrompts } from './veo-video';
import type { AICopy, ProgressCallback } from './types';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  return key;
}

export interface ShortsInput {
  /** Product images (1-10). Each becomes a video clip. */
  productImages: string[];
  productName: string;
  productPrice: string;
  productFeatures?: string[];
  aspectRatio?: '9:16' | '1:1' | '16:9';
  outputDir: string;
  onProgress?: ProgressCallback;
  /** Generate additional AI scene images (default false — use uploaded photos only) */
  generateAIScenes?: boolean;
  /** Number of AI scenes to generate if enabled (default 2) */
  aiSceneCount?: number;
  /** Seconds per clip in final video (default 5, max 8) */
  clipDuration?: number;
}

export interface ShortsOutput {
  videoPath: string;
  sceneImages: string[];
  clips: string[];
  aiCopy: AICopy;
  durationSec: number;
}

// ─── Step 1: Remove background ───

async function removeBackground(imagePath: string, outputPath: string): Promise<string> {
  logger.info('Removing background...');

  // Use sharp to convert, then try rembg via Python
  const pythonScript = `
from rembg import remove
from PIL import Image
inp = Image.open("${imagePath}")
out = remove(inp)
out.save("${outputPath}")
print("ok")
`;

  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', pythonScript], { timeout: 120_000 });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => {
      if (code === 0 && stdout.includes('ok')) {
        logger.info(`Background removed: ${outputPath}`);
        resolve(outputPath);
      } else {
        // Fallback: just copy original if rembg not available
        logger.warn(`rembg failed (${code}), using original image. ${stderr.slice(0, 200)}`);
        fs.copyFile(imagePath, outputPath).then(() => resolve(outputPath)).catch(reject);
      }
    });
    proc.on('error', reject);
  });
}

// ─── Step 2: Generate scene images with Nano Banana 2 ───

interface SceneImage {
  name: string;
  prompt: string;
  path: string;
}

async function generateSceneImages(
  productNoBgPath: string,
  category: string,
  productName: string,
  outputDir: string,
  count: number = 3,
): Promise<SceneImage[]> {
  const key = getApiKey();
  const model = 'gemini-3.1-flash-image-preview'; // Nano Banana 2

  const imgBuf = await fs.readFile(productNoBgPath);
  const imgB64 = imgBuf.toString('base64');

  // Scene templates per category
  const sceneTemplates: Record<string, Array<{ name: string; prompt: string }>> = {
    fashion: [
      { name: 'hook_closeup', prompt: `Ultra close-up fashion photography of this ${productName}. Dramatic moody lighting from the side. Rich fabric texture visible. Dark background with warm accent light. High-end fashion advertisement. Vertical 9:16.` },
      { name: 'lifestyle', prompt: `A stylish young person casually wearing this ${productName} in a cozy modern interior. Warm ambient lighting. Natural candid pose. Lifestyle fashion photography. Vertical 9:16.` },
      { name: 'outdoor', prompt: `Street style photography. A person wearing this ${productName} walking outdoors. Golden hour sunlight. Fashion editorial candid shot. Shallow depth of field. Vertical 9:16.` },
      { name: 'flatlay', prompt: `Aesthetic flat lay of this ${productName} neatly styled on a wooden surface with lifestyle accessories. Warm overhead lighting. Instagram-worthy product photography. Vertical 9:16.` },
    ],
    beauty: [
      { name: 'hook_closeup', prompt: `Extreme close-up beauty product photography of this ${productName}. Dewy water droplets. Soft pink/gold lighting. Clean background. Premium skincare advertisement. Vertical 9:16.` },
      { name: 'lifestyle', prompt: `A young woman in bathroom mirror applying this ${productName}. Natural morning light. Clean minimal bathroom. Beauty routine photography. Vertical 9:16.` },
      { name: 'flatlay', prompt: `Beautiful flat lay of this ${productName} with fresh flowers, marble surface, and soft towel. Spa atmosphere. Premium beauty product photography. Vertical 9:16.` },
    ],
    electronics: [
      { name: 'hook_closeup', prompt: `Dramatic close-up of this ${productName}. Dark background with colored accent lighting. Tech product photography. Reflective surface. Premium tech commercial. Vertical 9:16.` },
      { name: 'lifestyle', prompt: `Person using this ${productName} at a clean modern desk setup. Natural light from window. Tech lifestyle photography. Vertical 9:16.` },
      { name: 'detail', prompt: `Multiple angles of this ${productName} floating on dark gradient background. Detailed product features visible. Tech advertisement. Vertical 9:16.` },
    ],
    default: [
      { name: 'hook_closeup', prompt: `Professional close-up product photography of this ${productName}. Dramatic studio lighting. Rich detail visible. Premium advertisement. Vertical 9:16.` },
      { name: 'lifestyle', prompt: `This ${productName} in a beautiful lifestyle setting. Natural warm lighting. Aspirational scene. Product photography. Vertical 9:16.` },
      { name: 'styled', prompt: `Aesthetically styled photography of this ${productName} with complementary props. Warm tones. Instagram-worthy composition. Vertical 9:16.` },
    ],
  };

  const templates = sceneTemplates[category] || sceneTemplates.default;
  const selectedTemplates = templates.slice(0, count);

  const results: SceneImage[] = [];

  for (let i = 0; i < selectedTemplates.length; i++) {
    const tmpl = selectedTemplates[i];
    logger.info(`Generating scene ${i + 1}/${selectedTemplates.length}: ${tmpl.name}`);

    const payload = {
      contents: [{
        parts: [
          { text: tmpl.prompt },
          { inlineData: { mimeType: 'image/png', data: imgB64 } },
        ],
      }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    };

    try {
      const url = `${API_BASE}/models/${model}:generateContent?key=${key}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const result = await resp.json() as any;

      const parts = result.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p: any) => p.inlineData);

      if (imgPart) {
        const outPath = path.join(outputDir, `scene_${tmpl.name}.png`);
        const imgData = Buffer.from(imgPart.inlineData.data, 'base64');
        await fs.writeFile(outPath, imgData);
        results.push({ name: tmpl.name, prompt: tmpl.prompt, path: outPath });
        logger.info(`Scene ${tmpl.name}: ${(imgData.length / 1024).toFixed(0)}KB`);
      } else {
        logger.warn(`Scene ${tmpl.name}: no image returned`);
      }
    } catch (err: any) {
      logger.error(`Scene ${tmpl.name} failed: ${err.message}`);
    }

    // Rate limit spacing
    if (i < selectedTemplates.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}

// ─── Step 3: Compose final video with FFmpeg ───

async function composeClips(
  clips: string[],
  outputPath: string,
  clipDuration: number = 5,
): Promise<string> {
  if (clips.length === 0) throw new Error('No clips to compose');

  const transitions = ['fadewhite', 'slideup', 'wiperight', 'slideleft'];
  const transitionDur = 0.5;

  const inputs: string[] = [];
  const vFilters: string[] = [];
  const aFilters: string[] = [];

  for (let i = 0; i < clips.length; i++) {
    inputs.push('-i', clips[i]);
    vFilters.push(`[${i}:v]trim=0:${clipDuration},setpts=PTS-STARTPTS[v${i}]`);
    aFilters.push(`[${i}:a]atrim=0:${clipDuration},asetpts=PTS-STARTPTS,volume=${i === 0 ? '1' : '0.7'}[a${i}]`);
  }

  // Video xfade chain
  let curr = 'v0';
  for (let i = 1; i < clips.length; i++) {
    const t = transitions[i % transitions.length];
    const offset = clipDuration * i - transitionDur * i;
    const out = `xf${i}`;
    vFilters.push(`[${curr}][v${i}]xfade=transition=${t}:duration=${transitionDur}:offset=${offset}[${out}]`);
    curr = out;
  }

  // Audio concat
  const aLabels = clips.map((_, i) => `[a${i}]`).join('');
  aFilters.push(`${aLabels}concat=n=${clips.length}:v=0:a=1[aout]`);

  const totalDuration = clipDuration * clips.length - transitionDur * (clips.length - 1);
  const filterComplex = [...vFilters, ...aFilters].join(';\n');

  const args = [
    '-y', ...inputs,
    '-filter_complex', filterComplex,
    '-map', `[${curr}]`, '-map', '[aout]',
    '-c:v', 'libx264', '-crf', '20', '-r', '24', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(totalDuration),
    outputPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => {
      if (code === 0) {
        logger.info(`Final video: ${outputPath}`);
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg failed (${code}): ${stderr.slice(-500)}`));
      }
    });
    proc.on('error', reject);
  });
}

// ─── Main Pipeline ───

export async function generateShorts(input: ShortsInput): Promise<ShortsOutput> {
  const {
    productImages, productName, productPrice,
    productFeatures = [], aspectRatio = '9:16',
    outputDir, onProgress,
    generateAIScenes = false, aiSceneCount = 2,
    clipDuration = 5,
  } = input;

  if (productImages.length === 0) throw new Error('At least 1 product image required');

  await fs.mkdir(outputDir, { recursive: true });
  const clipsDir = path.join(outputDir, 'clips');
  await fs.mkdir(clipsDir, { recursive: true });

  // Step 1: Analyze product (use first image)
  onProgress?.(5, '상품 분석 중...');
  logger.info('=== Step 1: Product Analysis ===');
  const analysis = await analyzeProduct(productImages[0]);
  logger.info(`Category: ${analysis.category}, Color: ${analysis.color}`);

  // Step 2: Collect all images for video clips
  const allImages: Array<{ path: string; name: string }> = [];

  // User-uploaded images (the real photos — these are the priority)
  for (let i = 0; i < productImages.length; i++) {
    allImages.push({ path: productImages[i], name: `photo_${i + 1}` });
  }
  logger.info(`User photos: ${productImages.length}`);

  // Step 2b (optional): Generate additional AI scene images
  if (generateAIScenes) {
    onProgress?.(15, `AI 장면 추가 생성 중 (${aiSceneCount}장)...`);
    logger.info('=== Step 2b: AI Scene Generation (optional) ===');
    const scenesDir = path.join(outputDir, 'scenes');
    await fs.mkdir(scenesDir, { recursive: true });

    const noBgPath = path.join(outputDir, 'product_nobg.png');
    await removeBackground(productImages[0], noBgPath);

    const sceneImages = await generateSceneImages(
      noBgPath, analysis.category, productName, scenesDir, aiSceneCount,
    );
    for (const scene of sceneImages) {
      allImages.push({ path: scene.path, name: `ai_${scene.name}` });
    }
    logger.info(`AI scenes added: ${sceneImages.length}`);
  }

  // Step 3: Generate AI copy
  const pctBase = generateAIScenes ? 35 : 15;
  onProgress?.(pctBase, 'AI 카피 생성 중...');
  logger.info('=== Step 3: AI Copy ===');
  const aiCopy = await generateCopy(
    productImages[0], productName, productPrice,
    [analysis.color, analysis.material, ...productFeatures],
  );

  // Step 4: Generate Veo video clips from ALL images
  onProgress?.(pctBase + 10, `영상 클립 생성 중 (${allImages.length}개)...`);
  logger.info(`=== Step 4: Veo Video Generation (${allImages.length} clips) ===`);
  const veoPrompts = generateVeoPrompts(analysis.category, productName);

  const veoClips = await generateVeoClips(
    allImages.map((img, i) => ({
      imagePath: img.path,
      prompt: veoPrompts[i % veoPrompts.length],
      name: img.name,
    })),
    clipsDir,
    aspectRatio,
  );

  if (veoClips.length === 0) {
    throw new Error('No video clips generated (all filtered or failed)');
  }

  // Step 5: Compose final video
  onProgress?.(85, '최종 영상 합성 중...');
  logger.info('=== Step 5: Video Composition ===');
  const finalPath = path.join(outputDir, `shorts_${Date.now()}.mp4`);
  await composeClips(
    veoClips.map(c => c.clipPath),
    finalPath,
    clipDuration,
  );

  const totalDuration = clipDuration * veoClips.length - 0.5 * (veoClips.length - 1);
  onProgress?.(100, '완료!');

  return {
    videoPath: finalPath,
    sceneImages: allImages.map(s => s.path),
    clips: veoClips.map(c => c.clipPath),
    aiCopy,
    durationSec: totalDuration,
  };
}
