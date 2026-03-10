import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../src/logger';

// Gradient background definitions
const GRADIENTS: Record<string, { from: string; to: string }> = {
  dark:  { from: '#1a1a2e', to: '#16213e' },
  light: { from: '#f8f9fa', to: '#e9ecef' },
  pink:  { from: '#ff9a9e', to: '#fecfef' },
  blue:  { from: '#667eea', to: '#764ba2' },
  green: { from: '#11998e', to: '#38ef7d' },
};

function createGradientSvg(width: number, height: number, style: string): string {
  const g = GRADIENTS[style] || GRADIENTS.dark;
  return `<svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${g.from}"/>
        <stop offset="100%" style="stop-color:${g.to}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
  </svg>`;
}

export async function removeBackground(inputPath: string, outputDir: string): Promise<string> {
  logger.info(`Removing background: ${inputPath}`);

  // Dynamic import for ESM module
  const { removeBackground: rmbg } = await import('@imgly/background-removal-node');

  const inputBuffer = await fs.readFile(inputPath);
  const blob = new Blob([inputBuffer], { type: 'image/png' });

  const resultBlob = await rmbg(blob, { model: 'small' });
  const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

  const filename = `nobg_${Date.now()}_${path.basename(inputPath, path.extname(inputPath))}.png`;
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, resultBuffer);

  logger.info(`Background removed: ${outputPath}`);
  return outputPath;
}

export async function compositeWithBackground(
  foregroundPath: string,
  outputDir: string,
  style: string,
  targetWidth: number = 1080,
  targetHeight: number = 1080
): Promise<string> {
  logger.info(`Compositing with ${style} background`);

  const gradientSvg = createGradientSvg(targetWidth, targetHeight, style);
  const gradientBuffer = Buffer.from(gradientSvg);

  // Resize foreground to fit within background with padding
  const padding = Math.round(targetWidth * 0.1);
  const maxFgWidth = targetWidth - padding * 2;
  const maxFgHeight = targetHeight - padding * 2;

  const foreground = await sharp(foregroundPath)
    .resize(maxFgWidth, maxFgHeight, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  const fgMeta = await sharp(foreground).metadata();
  const left = Math.round((targetWidth - (fgMeta.width || maxFgWidth)) / 2);
  const top = Math.round((targetHeight - (fgMeta.height || maxFgHeight)) / 2);

  const filename = `composite_${Date.now()}_${path.basename(foregroundPath)}`;
  const outputPath = path.join(outputDir, filename);

  await sharp(gradientBuffer)
    .resize(targetWidth, targetHeight)
    .composite([{ input: foreground, left, top }])
    .png()
    .toFile(outputPath);

  logger.info(`Composited: ${outputPath}`);
  return outputPath;
}

export async function processBackground(
  inputPath: string,
  outputDir: string,
  style: string
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const noBgPath = await removeBackground(inputPath, outputDir);
  return compositeWithBackground(noBgPath, outputDir, style);
}
