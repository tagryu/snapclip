import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../src/logger';
import { preprocessImages } from './preprocess';
import { processBackground } from './background';
import { generateCopy } from './copywriter';
import { generateNarration } from './tts';
import { composeVideo } from './composer';
import { uploadVideo, uploadThumbnail } from './uploader';
import { PipelineInput, PipelineOutput, ASPECT_CONFIGS, ProgressCallback } from './types';

export async function runPipeline(
  input: PipelineInput,
  onProgress: ProgressCallback
): Promise<PipelineOutput> {
  const workDir = path.join(os.tmpdir(), 'snapclip', input.projectId || uuidv4());
  await fs.mkdir(workDir, { recursive: true });

  try {
    // 1. Preprocess images
    onProgress(10, 'preprocessing');
    logger.info('Stage 1: Preprocessing images');
    const preprocessedImages = await preprocessImages(
      input.images,
      path.join(workDir, 'preprocessed')
    );

    // 2. Background removal & compositing
    onProgress(25, 'background');
    logger.info('Stage 2: Background removal');
    const bgDir = path.join(workDir, 'background');
    const composited: string[] = [];
    for (const img of preprocessedImages) {
      const result = await processBackground(img, bgDir, input.backgroundStyle);
      composited.push(result);
    }

    // 3. AI Copy generation
    onProgress(40, 'copywriting');
    logger.info('Stage 3: AI copy generation');
    const aiCopy = await generateCopy(
      composited[0],
      input.productName,
      input.productPrice,
      input.productFeatures
    );
    logger.info(`AI Copy: ${JSON.stringify(aiCopy)}`);

    // 4. TTS narration (optional)
    let narrationPath: string | undefined;
    if (input.voiceEnabled) {
      onProgress(55, 'tts');
      logger.info('Stage 4: TTS narration');
      narrationPath = await generateNarration(
        input.productName,
        aiCopy.lines,
        path.join(workDir, 'tts')
      );
    }

    // 5. Video composition
    onProgress(65, 'composing');
    logger.info('Stage 5: Video composition');
    const aspect = ASPECT_CONFIGS[input.aspectRatio];
    const bgmDir = path.join(__dirname, '..', 'assets', 'bgm');
    const bgmPath = input.bgmPath || path.join(bgmDir, 'default.mp3');

    const videoPath = await composeVideo({
      images: composited,
      template: input.template,
      aspect,
      productName: input.productName,
      productPrice: input.productPrice,
      aiCopy,
      bgmPath: await fileExists(bgmPath) ? bgmPath : undefined,
      narrationPath,
      outputDir: path.join(workDir, 'output'),
    });

    // 6. Generate thumbnail from first frame
    onProgress(85, 'thumbnail');
    const sharp = (await import('sharp')).default;
    const thumbnailPath = path.join(workDir, 'thumbnail.jpg');
    await sharp(composited[0])
      .resize(640, 360, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    // 7. Upload to R2
    onProgress(90, 'uploading');
    logger.info('Stage 6: Uploading');
    let videoUrl: string;
    let thumbnailUrl: string;
    try {
      videoUrl = await uploadVideo(videoPath, input.projectId);
      thumbnailUrl = await uploadThumbnail(thumbnailPath, input.projectId);
    } catch (err: any) {
      logger.warn(`Upload failed (using local paths): ${err.message}`);
      videoUrl = videoPath;
      thumbnailUrl = thumbnailPath;
    }

    onProgress(100, 'complete');
    logger.info('Pipeline complete!');

    return {
      videoUrl,
      thumbnailUrl,
      durationSec: 9, // approximate
      aiCopy,
    };
  } catch (err) {
    logger.error('Pipeline failed:', err);
    throw err;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}
