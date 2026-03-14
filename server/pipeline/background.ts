import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../src/logger';

interface GradientDef {
  stops: Array<{ offset: string; color: string }>;
  angle?: number; // degrees for linear gradient direction
}

const GRADIENTS: Record<string, GradientDef> = {
  dark: {
    stops: [
      { offset: '0%', color: '#0f0c29' },
      { offset: '50%', color: '#302b63' },
      { offset: '100%', color: '#24243e' },
    ],
  },
  light: {
    stops: [
      { offset: '0%', color: '#ffecd2' },
      { offset: '100%', color: '#fcb69f' },
    ],
  },
  pink: {
    stops: [
      { offset: '0%', color: '#ff9a9e' },
      { offset: '50%', color: '#fad0c4' },
      { offset: '100%', color: '#ffecd2' },
    ],
  },
  blue: {
    stops: [
      { offset: '0%', color: '#667eea' },
      { offset: '100%', color: '#764ba2' },
    ],
  },
  green: {
    stops: [
      { offset: '0%', color: '#11998e' },
      { offset: '100%', color: '#38ef7d' },
    ],
  },
  // New premium styles
  gold: {
    stops: [
      { offset: '0%', color: '#1a1a1a' },
      { offset: '40%', color: '#2d2214' },
      { offset: '70%', color: '#3d2e1a' },
      { offset: '100%', color: '#1a1a1a' },
    ],
  },
  pastel: {
    stops: [
      { offset: '0%', color: '#fbc2eb' },
      { offset: '50%', color: '#a6c1ee' },
      { offset: '100%', color: '#fbc2eb' },
    ],
  },
  neon: {
    stops: [
      { offset: '0%', color: '#0a0a0a' },
      { offset: '30%', color: '#1a0033' },
      { offset: '60%', color: '#330033' },
      { offset: '100%', color: '#0a0a0a' },
    ],
  },
};

function createGradientSvg(width: number, height: number, style: string): string {
  const g = GRADIENTS[style] || GRADIENTS.dark;
  const stopsXml = g.stops.map(s => `<stop offset="${s.offset}" style="stop-color:${s.color}"/>`).join('\n      ');

  // Radial glow in center for premium feel
  return `<svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        ${stopsXml}
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="45%">
        <stop offset="0%" style="stop-color:white;stop-opacity:0.08"/>
        <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" style="stop-color:black;stop-opacity:0"/>
        <stop offset="100%" style="stop-color:black;stop-opacity:0.5"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
  </svg>`;
}

export async function removeBackground(inputPath: string, outputDir: string): Promise<string> {
  logger.info(`Removing background: ${inputPath}`);

  try {
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
  } catch (err: any) {
    logger.warn(`Background removal failed, using original image: ${err.message}`);
    return inputPath;
  }
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

  const padding = Math.round(targetWidth * 0.08);
  const maxFgWidth = targetWidth - padding * 2;
  const maxFgHeight = targetHeight - padding * 2;

  const foreground = await sharp(foregroundPath)
    .resize(maxFgWidth, maxFgHeight, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  const fgMeta = await sharp(foreground).metadata();
  const fgW = fgMeta.width || maxFgWidth;
  const fgH = fgMeta.height || maxFgHeight;
  const left = Math.round((targetWidth - fgW) / 2);
  const top = Math.round((targetHeight - fgH) / 2);

  // Create a subtle drop shadow behind the product
  const shadowOffset = 8;
  const shadowBlur = 20;
  const shadowBuffer = await sharp(foreground)
    .modulate({ brightness: 0 }) // make it black
    .blur(shadowBlur)
    .ensureAlpha(0.3)
    .toBuffer();

  const filename = `composite_${Date.now()}_${path.basename(foregroundPath)}`;
  const outputPath = path.join(outputDir, filename);

  await sharp(gradientBuffer)
    .resize(targetWidth, targetHeight)
    .composite([
      { input: shadowBuffer, left: left + shadowOffset, top: top + shadowOffset },
      { input: foreground, left, top },
    ])
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
