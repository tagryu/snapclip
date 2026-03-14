import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../src/logger';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const VEO_MODEL = 'veo-3.1-generate-preview';
const POLL_INTERVAL_MS = 12_000;
const MAX_POLL_ATTEMPTS = 20;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  return key;
}

interface VeoClipOptions {
  imagePath: string;
  prompt: string;
  aspectRatio?: '9:16' | '1:1' | '16:9';
  outputDir: string;
  clipName: string;
}

interface VeoClipResult {
  clipPath: string;
  durationSec: number;
  hasAudio: boolean;
}

/**
 * Submit an image-to-video request to Veo 3.1
 */
async function submitVeoJob(imagePath: string, prompt: string, aspectRatio: string): Promise<string> {
  const key = getApiKey();

  // Resize image to 720px for API
  const resizedBuf = await sharp(imagePath)
    .resize(720, undefined, { fit: 'inside' })
    .png()
    .toBuffer();

  const imgB64 = resizedBuf.toString('base64');

  const payload = {
    instances: [{
      prompt,
      image: { bytesBase64Encoded: imgB64, mimeType: 'image/png' },
    }],
    parameters: { aspectRatio, sampleCount: 1 },
  };

  const url = `${API_BASE}/models/${VEO_MODEL}:predictLongRunning?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Veo submit failed (${resp.status}): ${err.slice(0, 300)}`);
  }

  const result = await resp.json() as any;
  const opName = result.name as string; // e.g. "models/veo.../operations/abc123"
  const opId = opName.split('/').pop()!;
  logger.info(`Veo job submitted: ${opId} for ${path.basename(imagePath)}`);
  return opId;
}

/**
 * Poll a Veo operation until done, then download the video.
 */
async function pollAndDownload(opId: string, outputPath: string): Promise<VeoClipResult | null> {
  const key = getApiKey();
  const url = `${API_BASE}/models/${VEO_MODEL}/operations/${opId}?key=${key}`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    const resp = await fetch(url);
    if (!resp.ok) {
      logger.warn(`Veo poll failed (${resp.status}), retrying...`);
      continue;
    }

    const result = await resp.json() as any;
    if (!result.done) {
      logger.debug?.(`Veo op ${opId}: still processing (attempt ${attempt + 1}/${MAX_POLL_ATTEMPTS})`);
      continue;
    }

    const videoResp = result.response?.generateVideoResponse;
    const samples = videoResp?.generatedSamples;

    if (!samples || samples.length === 0) {
      const reasons = videoResp?.raiMediaFilteredReasons || ['unknown'];
      logger.warn(`Veo op ${opId} filtered: ${reasons.join(', ')}`);
      return null;
    }

    // Download video
    const videoUri = samples[0].video.uri;
    const dlUrl = `${videoUri}&key=${key}`;
    const dlResp = await fetch(dlUrl);
    if (!dlResp.ok) throw new Error(`Veo download failed: ${dlResp.status}`);

    const buffer = Buffer.from(await dlResp.arrayBuffer());
    await fs.writeFile(outputPath, buffer);

    logger.info(`Veo clip downloaded: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);

    return {
      clipPath: outputPath,
      durationSec: 8, // Veo default
      hasAudio: true,  // Veo 3.1 includes audio
    };
  }

  logger.error(`Veo op ${opId} timed out after ${MAX_POLL_ATTEMPTS} attempts`);
  return null;
}

/**
 * Generate a single video clip from an image using Veo 3.1.
 */
export async function generateVeoClip(opts: VeoClipOptions): Promise<VeoClipResult | null> {
  await fs.mkdir(opts.outputDir, { recursive: true });
  const outputPath = path.join(opts.outputDir, `${opts.clipName}.mp4`);

  const opId = await submitVeoJob(opts.imagePath, opts.prompt, opts.aspectRatio || '9:16');
  return pollAndDownload(opId, outputPath);
}

/**
 * Generate multiple video clips in parallel (respects rate limits with staggering).
 */
export async function generateVeoClips(
  clips: Array<{ imagePath: string; prompt: string; name: string }>,
  outputDir: string,
  aspectRatio: string = '9:16',
): Promise<VeoClipResult[]> {
  await fs.mkdir(outputDir, { recursive: true });

  // Submit all jobs with 2s stagger to avoid rate limits
  const jobs: Array<{ opId: string; name: string; outputPath: string }> = [];

  for (let i = 0; i < clips.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 2000));

    const clip = clips[i];
    const outputPath = path.join(outputDir, `clip_${clip.name}.mp4`);

    try {
      const opId = await submitVeoJob(clip.imagePath, clip.prompt, aspectRatio);
      jobs.push({ opId, name: clip.name, outputPath });
    } catch (err: any) {
      logger.error(`Failed to submit Veo job for ${clip.name}: ${err.message}`);
    }
  }

  // Poll all jobs in parallel
  const results = await Promise.all(
    jobs.map(async (job) => {
      const result = await pollAndDownload(job.opId, job.outputPath);
      if (!result) {
        logger.warn(`Clip ${job.name} failed or was filtered`);
      }
      return result;
    })
  );

  return results.filter((r): r is VeoClipResult => r !== null);
}

/**
 * Generate scene prompts for Veo based on product category.
 */
export function generateVeoPrompts(category: string, productDescription: string): string[] {
  const prompts: Record<string, string[]> = {
    fashion: [
      `Extreme close-up. Camera slowly racks focus across the fabric texture. Warm golden side light. Premium fashion commercial quality.`,
      `Person casually poses wearing the product. Natural lifestyle setting. Warm ambient light. Subtle movement. Fashion editorial style.`,
      `Outdoor fashion shot. Person walks confidently. Product moves gently in breeze. Golden hour sunlight. Cinematic slow motion.`,
    ],
    beauty: [
      `Extreme close-up beauty shot. Hand gently picks up the product. Dewy reflections. Soft diffused lighting. ASMR-quality detail.`,
      `Close-up of hand applying product on skin. Smooth gliding texture visible. Clean white background. Beauty commercial.`,
      `Product sits on marble surface. Camera slowly orbits. Soft reflections. Premium skincare commercial aesthetic.`,
    ],
    electronics: [
      `Dramatic reveal. Product emerges from shadow. LED indicators glow. Reflective surface catches light. Tech commercial.`,
      `Overhead shot. Hands interact with device. Clean desk setup. Modern tech lifestyle. Natural movements.`,
      `Close-up detail shot. Camera reveals product features. Smooth camera movement. Premium tech aesthetic.`,
    ],
    food: [
      `Close-up food photography. Steam gently rises. Fresh ingredients visible. Warm kitchen lighting. Appetizing detail.`,
      `Overhead shot. Hands arrange the product on plate. Natural food styling. Warm tones. Restaurant quality.`,
      `Side angle. Product in lifestyle setting. Natural daylight. Fresh, appetizing look. Food commercial.`,
    ],
    home: [
      `Slow pan across product in modern living space. Natural daylight through window. Minimalist aesthetic. Interior design style.`,
      `Close-up detail shot. Hands gently touch the product. Quality material visible. Warm ambient lighting.`,
      `Wide shot. Product in beautifully styled room. Camera slowly dollies forward. Magazine-quality interior.`,
    ],
  };

  const categoryPrompts = prompts[category] || prompts.home;

  // Prepend product description context
  return categoryPrompts.map(p =>
    `${productDescription}. ${p}`
  );
}
