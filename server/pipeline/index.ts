import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../src/logger';
import { preprocessImages } from './preprocess';
import { processBackground } from './background';
import { analyzeProduct } from './gemini-image';
import { generateImage } from './image-router';
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

    // 3. Gemini product analysis
    onProgress(30, 'analyzing');
    logger.info('Stage 3: Gemini product analysis');
    const productAnalysis = await analyzeProduct(composited[0]);
    logger.info(`Product analysis: ${JSON.stringify(productAnalysis)}`);

    // 4. Realistic background (hybrid: Gemini → Local → Sharp fallback)
    onProgress(38, 'realistic-background');
    logger.info('Stage 4: Realistic background generation');
    const realisticBgDir = path.join(workDir, 'realistic-bg');
    const scene = productAnalysis.suggestedScenes[0] || 'clean white surface with soft studio lighting';
    const realisticBgImage = await generateImage({
      type: 'background',
      productImagePath: composited[0],
      scene,
      aspectRatio: input.aspectRatio,
      outputDir: realisticBgDir,
    }) as string;
    // If realistic bg was generated (different from original), use it as first image
    if (realisticBgImage !== composited[0]) {
      composited[0] = realisticBgImage;
    }

    // 5. Multi-angle views (hybrid: Gemini → Local → Sharp fallback)
    onProgress(48, 'multi-angle');
    logger.info('Stage 5: Multi-angle generation');
    const multiAngleDir = path.join(workDir, 'multi-angle');
    const angleImages = await generateImage({
      type: 'multiAngle',
      productImagePath: composited[0],
      angles: ['front', '45-degree', 'side'],
      outputDir: multiAngleDir,
    }) as string[];
    // Add angle images to composited array for video segments
    for (const angleImg of angleImages) {
      composited.push(angleImg);
    }

    // 6. AI Copy generation (uses product analysis for better copy)
    onProgress(55, 'copywriting');
    logger.info('Stage 6: AI copy generation');
    const enrichedFeatures = input.productFeatures.length > 0
      ? input.productFeatures
      : [productAnalysis.material, productAnalysis.color].filter(f => f && f !== 'unknown');
    const aiCopy = await generateCopy(
      composited[0],
      input.productName,
      input.productPrice,
      enrichedFeatures.length > 0 ? enrichedFeatures : input.productFeatures
    );
    logger.info(`AI Copy: ${JSON.stringify(aiCopy)}`);

    // 7. TTS narration (optional)
    let narrationPath: string | undefined;
    if (input.voiceEnabled) {
      onProgress(60, 'tts');
      logger.info('Stage 7: TTS narration');
      narrationPath = await generateNarration(
        input.productName,
        aiCopy.lines,
        path.join(workDir, 'tts')
      );
    }

    // 8. Video composition
    onProgress(68, 'composing');
    logger.info('Stage 8: Video composition');
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
      productFeatures: input.productFeatures,
      bgmPath: await fileExists(bgmPath) ? bgmPath : undefined,
      narrationPath,
      outputDir: path.join(workDir, 'output'),
    });

    // 9. Generate thumbnail from first frame
    onProgress(85, 'thumbnail');
    const sharp = (await import('sharp')).default;
    const thumbnailPath = path.join(workDir, 'thumbnail.jpg');
    await sharp(composited[0])
      .resize(640, 360, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    // 10. Upload to R2
    onProgress(90, 'uploading');
    logger.info('Stage 10: Uploading');
    let videoUrl: string;
    let thumbnailUrl: string;
    try {
      videoUrl = await uploadVideo(videoPath, input.projectId);
      thumbnailUrl = await uploadThumbnail(thumbnailPath, input.projectId);
    } catch (err: any) {
      logger.warn(`Upload failed (using local server URLs): ${err.message}`);
      // Convert local paths to server-accessible URLs
      const tmpBase = path.join(os.tmpdir(), 'snapclip');
      const relVideo = path.relative(tmpBase, videoPath);
      const relThumb = path.relative(tmpBase, thumbnailPath);
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
      videoUrl = `${serverUrl}/output/${relVideo}`;
      thumbnailUrl = `${serverUrl}/output/${relThumb}`;
    }

    onProgress(100, 'complete');
    logger.info('Pipeline complete!');

    return {
      videoUrl,
      thumbnailUrl,
      durationSec: 15,
      aiCopy,
      productAnalysis,
    };
  } catch (err) {
    logger.error('Pipeline failed:', err);
    throw err;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}
