import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../src/logger';
import { templates } from '../templates';
import type { AICopy, AspectConfig, ASPECT_CONFIGS } from './types';

const FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Pretendard-Bold.otf');
const FPS = 30;

interface ComposerOptions {
  images: string[];
  template: string;
  aspect: AspectConfig;
  productName: string;
  productPrice: string;
  aiCopy: AICopy;
  bgmPath?: string;
  narrationPath?: string;
  outputDir: string;
}

export async function composeVideo(opts: ComposerOptions): Promise<string> {
  const {
    images, template: templateName, aspect,
    productName, productPrice, aiCopy,
    bgmPath, narrationPath, outputDir
  } = opts;

  await fs.mkdir(outputDir, { recursive: true });

  const tmpl = templates[templateName];
  if (!tmpl) throw new Error(`Unknown template: ${templateName}`);

  const segments = tmpl.segments(images.length);
  const outputPath = path.join(outputDir, `output_${aspect.label.replace(':', 'x')}_${Date.now()}.mp4`);

  logger.info(`Composing video: ${templateName}, ${aspect.label}, ${images.length} images`);

  // First, scale all images to target aspect ratio
  const scaledImages: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const scaledPath = path.join(outputDir, `scaled_${i}.png`);
    await scaleImage(images[i], scaledPath, aspect.width, aspect.height);
    scaledImages.push(scaledPath);
  }

  // Build filter_complex
  const { filterComplex, lastLabel } = buildFilterComplex(
    scaledImages, segments, tmpl, aspect, productName, productPrice, aiCopy
  );

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    // Add image inputs
    for (const img of scaledImages) {
      cmd = cmd.input(img).inputOptions(['-loop', '1']);
    }

    // Add audio if present
    if (narrationPath) {
      cmd = cmd.input(narrationPath);
    } else if (bgmPath) {
      cmd = cmd.input(bgmPath);
    }

    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0) + tmpl.ctaDuration;

    cmd
      .complexFilter(filterComplex, lastLabel)
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-r', String(FPS),
        '-pix_fmt', 'yuv420p',
        '-t', String(totalDuration),
        '-shortest',
      ])
      .output(outputPath)
      .on('start', (cmd) => logger.info(`FFmpeg started: ${cmd}`))
      .on('progress', (p) => logger.info(`FFmpeg progress: ${p.percent?.toFixed(1)}%`))
      .on('end', () => {
        logger.info(`Video composed: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`FFmpeg error: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

function buildFilterComplex(
  images: string[],
  segments: ReturnType<typeof templates.simple.segments>,
  tmpl: typeof templates.simple,
  aspect: AspectConfig,
  productName: string,
  productPrice: string,
  aiCopy: AICopy
): { filterComplex: string; lastLabel: string } {
  const filters: string[] = [];
  const { width, height } = aspect;
  const style = tmpl.subtitleStyle;

  // Apply zoompan to each image
  for (let i = 0; i < Math.min(images.length, segments.length); i++) {
    const seg = segments[i];
    // Adjust zoompan output size to target aspect
    const zpFilter = seg.effect
      .replace(/s=\d+x\d+/g, `s=${width}x${height}`);
    filters.push(`[${i}:v]${zpFilter},setpts=PTS-STARTPTS,format=yuva420p[v${i}]`);
  }

  // Concat segments with xfade transitions
  let currentLabel = 'v0';
  for (let i = 1; i < Math.min(images.length, segments.length); i++) {
    const seg = segments[i];
    const prevDuration = segments[i - 1].duration;
    const transition = seg.transition || 'fade';
    const tDur = seg.transitionDuration || 0.5;
    const offset = prevDuration - tDur;
    const outLabel = `xf${i}`;
    filters.push(`[${currentLabel}][v${i}]xfade=transition=${transition}:duration=${tDur}:offset=${Math.max(0, offset)}[${outLabel}]`);
    currentLabel = outLabel;
  }

  // CTA frame - colored background with text
  const totalImageDur = segments.reduce((s, seg) => s + seg.duration, 0);

  // Add text overlays
  const fontOpt = `fontfile=${FONT_PATH}`;
  const escapedName = productName.replace(/'/g, "'\\''");
  const escapedPrice = productPrice.replace(/'/g, "'\\''");
  const copyText = aiCopy.lines[0]?.replace(/'/g, "'\\''") || '';

  const boldFlag = style.bold ? ':font=Pretendard Bold' : '';
  const boxOpts = style.boxEnabled ? `:box=1:boxcolor=${style.boxcolor || 'black@0.5'}:boxborderw=10` : '';

  // Product name overlay
  filters.push(
    `[${currentLabel}]drawtext=${fontOpt}:text='${escapedName}':fontsize=${style.fontsize}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:${style.alignment}${boxOpts}:enable='between(t,0,${totalImageDur})'[txt1]`
  );

  // Price overlay on CTA portion
  filters.push(
    `[txt1]drawtext=${fontOpt}:text='${escapedPrice}':fontsize=${Math.round(style.fontsize * 1.2)}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:x=(w-text_w)/2:y=(h-th)/2${boxOpts}:enable='gte(t,${totalImageDur})'[txt2]`
  );

  // AI copy overlay
  filters.push(
    `[txt2]drawtext=${fontOpt}:text='${copyText}':fontsize=${Math.round(style.fontsize * 0.8)}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:x=(w-text_w)/2:y=(h/2+60)${boxOpts}:enable='gte(t,${totalImageDur})'[final]`
  );

  return { filterComplex: filters.join(';'), lastLabel: 'final' };
}

async function scaleImage(input: string, output: string, width: number, height: number): Promise<void> {
  const sharp = (await import('sharp')).default;
  await sharp(input)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toFile(output);
}
