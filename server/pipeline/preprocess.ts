import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../src/logger';

const TARGET_WIDTH = 1080;

export async function preprocessImage(inputPath: string, outputDir: string): Promise<string> {
  const filename = `preprocessed_${Date.now()}_${path.basename(inputPath)}`;
  const outputPath = path.join(outputDir, filename.replace(/\.[^.]+$/, '.png'));

  logger.info(`Preprocessing image: ${inputPath}`);

  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;

  if (!width || !height) throw new Error(`Cannot read metadata for ${inputPath}`);

  // Resize to target width, maintain aspect ratio
  let pipeline = sharp(inputPath)
    .resize(TARGET_WIDTH, undefined, { fit: 'inside', withoutEnlargement: false });

  // Auto-adjust brightness and contrast via normalise
  pipeline = pipeline.normalise();

  // Sharpen slightly for quality
  pipeline = pipeline.sharpen({ sigma: 1.0 });

  await pipeline.png({ quality: 95 }).toFile(outputPath);

  logger.info(`Preprocessed: ${outputPath}`);
  return outputPath;
}

export async function preprocessImages(inputPaths: string[], outputDir: string): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  return Promise.all(inputPaths.map(p => preprocessImage(p, outputDir)));
}
