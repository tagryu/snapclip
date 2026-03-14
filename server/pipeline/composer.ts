import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import sharpModule from 'sharp';
import { logger } from '../src/logger';
import { templates } from '../templates';
import type { AICopy, AspectConfig } from './types';

const execAsync = promisify(exec);
const FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Pretendard-Bold.otf');
const FPS = 30;

interface ComposerOptions {
  images: string[];
  template: string;
  aspect: AspectConfig;
  productName: string;
  productPrice: string;
  aiCopy: AICopy;
  productFeatures?: string[];
  bgmPath?: string;
  narrationPath?: string;
  outputDir: string;
  /** BPM for beat-sync cut timing (optional). Overrides segment durations. */
  bpm?: number;
}

/** Text overlay definition for a segment */
interface TextOverlayDef {
  lines: Array<{
    text: string;
    fontSize: number;
    color: string;
    yRatio: number; // 0.0 (top) to 1.0 (bottom)
    shadowColor?: string;
    shadowOffset?: number;
  }>;
  /** Delay in seconds before text appears (within segment) */
  fadeInDelay?: number;
}

/**
 * Create a transparent PNG with multi-line text using sharp + SVG.
 * Features: large text, drop shadows, outlines for readability.
 */
async function createTextOverlay(
  overlay: TextOverlayDef,
  width: number,
  height: number,
  outputPath: string
): Promise<string> {
  const textElements: string[] = [];

  for (const line of overlay.lines) {
    const escaped = line.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const y = Math.round(height * line.yRatio);
    const shadowColor = line.shadowColor || 'rgba(0,0,0,0.7)';
    const shadowOff = line.shadowOffset ?? 3;

    // Shadow text (offset for drop shadow effect)
    textElements.push(
      `<text x="${width / 2 + shadowOff}" y="${y + shadowOff}" ` +
      `font-family="Pretendard, Apple SD Gothic Neo, sans-serif" ` +
      `font-size="${line.fontSize}" font-weight="bold" ` +
      `fill="${shadowColor}" text-anchor="middle" dominant-baseline="middle">${escaped}</text>`
    );

    // Outline stroke
    textElements.push(
      `<text x="${width / 2}" y="${y}" ` +
      `font-family="Pretendard, Apple SD Gothic Neo, sans-serif" ` +
      `font-size="${line.fontSize}" font-weight="bold" ` +
      `fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="4" ` +
      `text-anchor="middle" dominant-baseline="middle">${escaped}</text>`
    );

    // Main text
    textElements.push(
      `<text x="${width / 2}" y="${y}" ` +
      `font-family="Pretendard, Apple SD Gothic Neo, sans-serif" ` +
      `font-size="${line.fontSize}" font-weight="bold" ` +
      `fill="${line.color}" text-anchor="middle" dominant-baseline="middle">${escaped}</text>`
    );
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    @font-face {
      font-family: 'Pretendard';
      src: url('file://${FONT_PATH}');
      font-weight: bold;
    }
  </style>
  ${textElements.join('\n  ')}
</svg>`;

  await sharpModule(Buffer.from(svg)).png().toFile(outputPath);
  return outputPath;
}

/**
 * Generate a simple BGM using FFmpeg sine wave synthesis.
 * Creates a lo-fi chill beat at -15dB.
 */
async function generateBGM(outputPath: string, durationSec: number): Promise<string> {
  // Layered sine waves to create a pleasant ambient pad
  const filter = [
    // Base pad chord (C major: C4 + E4 + G4)
    `aevalsrc='0.08*sin(261.63*2*PI*t)+0.06*sin(329.63*2*PI*t)+0.06*sin(392.00*2*PI*t)+0.04*sin(523.25*2*PI*t)':s=44100:d=${durationSec}[pad]`,
    // Subtle rhythm pulse
    `aevalsrc='0.03*sin(2*PI*110*t)*abs(sin(2*PI*2*t))':s=44100:d=${durationSec}[pulse]`,
    // Mix together
    `[pad][pulse]amix=inputs=2:duration=first`,
    // Fade in/out + low-pass filter for warmth
    `afade=t=in:d=1.5,afade=t=out:st=${durationSec - 2}:d=2`,
    `lowpass=f=3000`,
    // Volume to -15dB
    `volume=-15dB`,
  ].join(',');

  const cmd = `ffmpeg -y -filter_complex "${filter}" -t ${durationSec} -c:a aac -b:a 128k "${outputPath}"`;
  await execAsync(cmd, { timeout: 30000 });
  logger.info(`BGM generated: ${outputPath}`);
  return outputPath;
}

/**
 * Build per-segment text overlays based on copy data.
 * Returns exactly `segmentCount` overlays.
 * - 5 segments: classic layout
 * - 7 segments: dynamic fast-cut layout
 * - 8 segments: trendy fast-cut layout
 * - 9 segments: reels extended layout
 */
function buildSegmentTexts(
  productName: string,
  productPrice: string,
  aiCopy: AICopy,
  features: string[],
  fontColor: string,
  segmentCount: number = 5,
): TextOverlayDef[] {
  const hookLine = aiCopy.lines[0] || '감각적인 선택';
  const featureLines = features.length > 0 ? features.slice(0, 3) : [aiCopy.lines[1] || '프리미엄 퀄리티'];
  const benefit = aiCopy.lines[2] || '특별한 혜택';

  // Classic 5-segment layout
  const classic: TextOverlayDef[] = [
    {
      lines: [
        { text: productName, fontSize: 76, color: fontColor, yRatio: 0.38, shadowOffset: 4 },
        { text: hookLine, fontSize: 48, color: fontColor, yRatio: 0.52, shadowOffset: 3 },
      ],
    },
    {
      lines: [
        { text: '✨', fontSize: 64, color: fontColor, yRatio: 0.15 },
      ],
    },
    {
      lines: featureLines.map((f, i) => ({
        text: `• ${f}`,
        fontSize: 44,
        color: fontColor,
        yRatio: 0.32 + i * 0.1,
        shadowOffset: 3,
      })),
    },
    {
      lines: [
        { text: productPrice, fontSize: 80, color: '#FFD700', yRatio: 0.38, shadowOffset: 4 },
        { text: benefit, fontSize: 42, color: fontColor, yRatio: 0.53, shadowOffset: 3 },
      ],
    },
    {
      lines: [
        { text: '지금 바로 구매하세요!', fontSize: 64, color: '#FFD700', yRatio: 0.40, shadowOffset: 4 },
        { text: productName, fontSize: 36, color: fontColor, yRatio: 0.55, shadowOffset: 2 },
        { text: aiCopy.hashtags.slice(0, 3).join(' '), fontSize: 28, color: fontColor, yRatio: 0.65, shadowOffset: 2 },
      ],
    },
  ];

  if (segmentCount <= 5) return classic;

  // 7-segment layout (dynamic template)
  if (segmentCount === 7) {
    return [
      // 0: Impact opener — big hook text
      {
        lines: [
          { text: hookLine, fontSize: 84, color: fontColor, yRatio: 0.42, shadowOffset: 5 },
        ],
      },
      // 1: Product name
      {
        lines: [
          { text: productName, fontSize: 72, color: fontColor, yRatio: 0.40, shadowOffset: 4 },
        ],
      },
      // 2: Feature 1 — single feature, big
      {
        lines: [
          { text: featureLines[0] || '', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 3: Feature 2
      {
        lines: [
          { text: featureLines[1] || '프리미엄 퀄리티', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 4: Feature 3
      {
        lines: [
          { text: featureLines[2] || '최고급 소재', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 5: Price + benefit
      {
        lines: [
          { text: productPrice, fontSize: 88, color: '#FFD700', yRatio: 0.38, shadowOffset: 5 },
          { text: benefit, fontSize: 44, color: fontColor, yRatio: 0.55, shadowOffset: 3 },
        ],
      },
      // 6: CTA — urgency
      {
        lines: [
          { text: '지금 아니면 늦어요!', fontSize: 68, color: '#FFD700', yRatio: 0.38, shadowOffset: 4 },
          { text: productName, fontSize: 40, color: fontColor, yRatio: 0.54, shadowOffset: 2 },
          { text: aiCopy.hashtags.slice(0, 3).join(' '), fontSize: 28, color: fontColor, yRatio: 0.65, shadowOffset: 2 },
        ],
      },
    ];
  }

  // 8-segment layout (trendy template)
  if (segmentCount === 8) {
    return [
      // 0: Hook — big impactful text
      {
        lines: [
          { text: hookLine, fontSize: 88, color: fontColor, yRatio: 0.42, shadowOffset: 5 },
        ],
      },
      // 1: Product name
      {
        lines: [
          { text: productName, fontSize: 72, color: fontColor, yRatio: 0.40, shadowOffset: 4 },
          { text: productPrice, fontSize: 56, color: '#FFD700', yRatio: 0.55, shadowOffset: 3 },
        ],
      },
      // 2: Reveal — minimal
      {
        lines: [
          { text: '✨', fontSize: 56, color: fontColor, yRatio: 0.12 },
        ],
      },
      // 3: Feature 1
      {
        lines: [
          { text: featureLines[0] || '', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 4: Feature 2
      {
        lines: [
          { text: featureLines[1] || '프리미엄 퀄리티', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 5: Feature 3
      {
        lines: [
          { text: featureLines[2] || '최고급 소재', fontSize: 56, color: fontColor, yRatio: 0.42, shadowOffset: 3 },
        ],
      },
      // 6: Price + benefit
      {
        lines: [
          { text: productPrice, fontSize: 88, color: '#FFD700', yRatio: 0.38, shadowOffset: 5 },
          { text: benefit, fontSize: 44, color: fontColor, yRatio: 0.55, shadowOffset: 3 },
        ],
      },
      // 7: CTA — urgency
      {
        lines: [
          { text: '한정 수량 — 지금 구매!', fontSize: 64, color: '#FFD700', yRatio: 0.38, shadowOffset: 4 },
          { text: productName, fontSize: 36, color: fontColor, yRatio: 0.54, shadowOffset: 2 },
          { text: aiCopy.hashtags.slice(0, 3).join(' '), fontSize: 26, color: fontColor, yRatio: 0.65, shadowOffset: 2 },
        ],
      },
    ];
  }

  // Reels 9-segment layout
  const reelsTexts: TextOverlayDef[] = [
    // 0: Impact opener — just product name big
    { lines: [{ text: productName, fontSize: 84, color: fontColor, yRatio: 0.45, shadowOffset: 5 }] },
    // 1: Product name + price overlay
    {
      lines: [
        { text: productName, fontSize: 64, color: fontColor, yRatio: 0.35, shadowOffset: 4 },
        { text: productPrice, fontSize: 80, color: '#FFD700', yRatio: 0.50, shadowOffset: 4 },
        { text: hookLine, fontSize: 36, color: fontColor, yRatio: 0.62, shadowOffset: 2 },
      ],
    },
    // 2: Pan shot — minimal
    { lines: [{ text: '✨', fontSize: 48, color: fontColor, yRatio: 0.12 }] },
    // 3: Zoom out — feature highlight
    { lines: [{ text: featureLines[0] || '', fontSize: 48, color: fontColor, yRatio: 0.82, shadowOffset: 3 }] },
    // 4: Lifestyle — benefit
    { lines: [{ text: benefit, fontSize: 44, color: fontColor, yRatio: 0.80, shadowOffset: 3 }] },
    // 5: Detail cut 1
    { lines: [{ text: featureLines[1] || '디테일', fontSize: 40, color: fontColor, yRatio: 0.85, shadowOffset: 3 }] },
    // 6: Detail cut 2
    { lines: [{ text: featureLines[2] || '퀄리티', fontSize: 40, color: fontColor, yRatio: 0.85, shadowOffset: 3 }] },
    // 7: AI copy text
    {
      lines: aiCopy.lines.slice(0, 3).map((line, i) => ({
        text: line, fontSize: 44, color: fontColor, yRatio: 0.35 + i * 0.10, shadowOffset: 3,
      })),
    },
    // 8: CTA
    {
      lines: [
        { text: '지금 바로 구매하세요!', fontSize: 64, color: '#FFD700', yRatio: 0.38, shadowOffset: 4 },
        { text: productName, fontSize: 36, color: fontColor, yRatio: 0.52, shadowOffset: 2 },
        { text: aiCopy.hashtags.slice(0, 4).join(' '), fontSize: 26, color: fontColor, yRatio: 0.62, shadowOffset: 2 },
      ],
    },
  ];

  return reelsTexts;
}

/**
 * Generate transition sound effects — short sine-wave whoosh sounds for each transition.
 * Mixes them into a single audio file at the given transition points.
 */
async function generateSFX(
  outputDir: string,
  segments: Array<{ duration: number; transition?: string }>,
  templateName: string,
): Promise<string | undefined> {
  try {
    const sfxPath = path.join(outputDir, 'sfx_transitions.aac');
    const totalDuration = segments.reduce((s, seg) => s + seg.duration, 0);

    // Calculate transition timestamps
    const transitionTimes: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < segments.length - 1; i++) {
      cumulative += segments[i].duration;
      transitionTimes.push(cumulative);
    }

    if (transitionTimes.length === 0) return undefined;

    // Build a filter that generates whoosh sounds at each transition point
    // Each whoosh is a quick frequency sweep (800->200Hz over 0.15s)
    const whooshParts: string[] = [];
    const mixLabels: string[] = [];

    for (let i = 0; i < transitionTimes.length; i++) {
      const t = transitionTimes[i];
      // Short sine sweep: start freq varies by template for character
      const startFreq = templateName === 'trendy' ? 1200 : templateName === 'dynamic' ? 1000 : 800;
      const dur = 0.15;
      whooshParts.push(
        `aevalsrc='0.3*sin(2*PI*(${startFreq}-${startFreq - 200}*t/${dur})*t)*exp(-t/${dur}*3)':s=44100:d=${dur}[w${i}]`
      );
      // Pad with silence to position at correct time
      whooshParts.push(
        `[w${i}]adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[wd${i}]`
      );
      mixLabels.push(`[wd${i}]`);
    }

    // Mix all whooshes together, pad to total duration
    const mixInput = mixLabels.join('');
    whooshParts.push(
      `${mixInput}amix=inputs=${transitionTimes.length}:duration=longest,` +
      `apad=whole_dur=${totalDuration},volume=-20dB`
    );

    const filter = whooshParts.join(';\n');
    const filterFile = path.join(outputDir, 'sfx_filter.txt');
    await fs.writeFile(filterFile, filter);

    const cmd = `ffmpeg -y -filter_complex_script "${filterFile}" -t ${totalDuration} -c:a aac -b:a 64k "${sfxPath}"`;
    await execAsync(cmd, { timeout: 30000 });
    logger.info(`SFX generated: ${sfxPath} (${transitionTimes.length} transitions)`);
    return sfxPath;
  } catch (err: any) {
    logger.warn(`SFX generation failed (non-fatal): ${err.message}`);
    return undefined;
  }
}

/**
 * Get per-template text overlay filter expressions.
 * Returns the format filter and overlay filter for a given template + segment.
 */
function getTextAnimationFilters(
  templateName: string,
  segmentDuration: number,
): { formatFilter: string; overlayExpr: string } {
  switch (templateName) {
    case 'trendy':
      // Scale bounce: text starts small, overshoots, settles
      // Simulate via y-offset: start at +40px (visually "small"), overshoot to -10px, settle at 0
      return {
        formatFilter: 'format=yuva420p,fade=in:st=0:d=0.2:alpha=1',
        overlayExpr: `0:'if(lt(t,0.15),40*(1-t/0.15),if(lt(t,0.25),-10*(t-0.15)/0.1,0))'`,
      };

    case 'dynamic':
      // Slam from top: start at y=-100, slam to position with slight bounce
      return {
        formatFilter: 'format=yuva420p,fade=in:st=0:d=0.15:alpha=1',
        overlayExpr: `0:'if(lt(t,0.12),-100+100*(t/0.12),if(lt(t,0.2),8*(1-(t-0.12)/0.08),0))'`,
      };

    case 'luxury':
      // Slow elegant fade with slight upward drift
      return {
        formatFilter: 'format=yuva420p,fade=in:st=0.2:d=0.8:alpha=1',
        overlayExpr: `0:'if(lt(t,1.0),15*(1-t/1.0),0)'`,
      };

    case 'cute':
      // Bounce in with overshoot
      return {
        formatFilter: 'format=yuva420p,fade=in:st=0:d=0.25:alpha=1',
        overlayExpr: `0:'if(lt(t,0.2),50*(1-t/0.2),if(lt(t,0.3),-15*(t-0.2)/0.1,if(lt(t,0.4),5*(1-(t-0.3)/0.1),0)))'`,
      };

    case 'simple':
    default:
      // Clean fade (original behavior)
      return {
        formatFilter: 'format=yuva420p,fade=in:st=0:d=0.4:alpha=1',
        overlayExpr: '0:0',
      };
  }
}

export async function composeVideo(opts: ComposerOptions): Promise<string> {
  const {
    images, template: templateName, aspect,
    productName, productPrice, aiCopy,
    productFeatures = [],
    bgmPath, narrationPath, outputDir,
    bpm,
  } = opts;

  await fs.mkdir(outputDir, { recursive: true });

  const tmpl = templates[templateName];
  if (!tmpl) throw new Error(`Unknown template: ${templateName}`);

  const segments = tmpl.segments(images.length);

  // BPM beat-sync: override segment durations to align with beats
  if (bpm && bpm > 0) {
    const beatInterval = 60 / bpm; // seconds per beat
    for (const seg of segments) {
      // Snap each segment to nearest beat (minimum 1 beat)
      const beats = Math.max(1, Math.round(seg.duration / beatInterval));
      seg.duration = beats * beatInterval;
      // Re-generate zoompan with updated duration
      seg.effect = seg.effect.replace(/d=\d+/g, `d=${Math.round(seg.duration * FPS)}`);
    }
    logger.info(`BPM sync: ${bpm} BPM, beat interval=${beatInterval.toFixed(3)}s`);
  }
  const outputPath = path.join(outputDir, `output_${aspect.label.replace(':', 'x')}_${Date.now()}.mp4`);
  const { width, height } = aspect;
  const totalDuration = segments.reduce((s, seg) => s + seg.duration, 0);

  logger.info(`Composing video: ${templateName}, ${aspect.label}, ${images.length} images, ${totalDuration}s`);

  // Scale all source images
  const scaledImages: string[] = [];
  const uniqueIndices = [...new Set(segments.map(s => s.imageIndex))];
  const scaledMap = new Map<number, string>();

  for (const idx of uniqueIndices) {
    const scaledPath = path.join(outputDir, `scaled_${idx}.png`);
    await sharpModule(images[idx])
      .resize(width, height, { fit: 'cover' })
      .png()
      .toFile(scaledPath);
    scaledMap.set(idx, scaledPath);
  }

  // For each segment, create the scaled image reference
  for (let i = 0; i < segments.length; i++) {
    scaledImages.push(scaledMap.get(segments[i].imageIndex)!);
  }

  // Create per-segment text overlays
  const fontColor = tmpl.subtitleStyle.fontcolor;
  const segTexts = buildSegmentTexts(productName, productPrice, aiCopy, productFeatures, fontColor, segments.length);
  const overlayPaths: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const overlayPath = path.join(outputDir, `overlay_seg${i}.png`);
    await createTextOverlay(segTexts[i], width, height, overlayPath);
    overlayPaths.push(overlayPath);
  }

  // Generate BGM if no audio provided
  let actualBgmPath = bgmPath;
  if (!actualBgmPath) {
    actualBgmPath = path.join(outputDir, 'bgm_generated.aac');
    try {
      await generateBGM(actualBgmPath, totalDuration);
    } catch (err: any) {
      logger.warn(`BGM generation failed: ${err.message}`);
      actualBgmPath = undefined;
    }
  }

  // Build filter_complex
  const filters: string[] = [];
  const numSeg = segments.length;
  const colorGrade = tmpl.colorGrade || '';

  // Process each segment: zoompan + optional color grading
  for (let i = 0; i < numSeg; i++) {
    const seg = segments[i];
    const zpFilter = seg.effect.replace(/s=\d+x\d+/g, `s=${width}x${height}`);
    const gradeFilter = colorGrade ? `,${colorGrade}` : '';
    filters.push(`[${i}:v]${zpFilter}${gradeFilter},setpts=PTS-STARTPTS,format=yuv420p[v${i}]`);
  }

  // Per-segment text overlay compositing with per-template animation
  // Reels keeps its own slide-up animation; all others use getTextAnimationFilters
  const isReels = templateName === 'reels';
  for (let i = 0; i < numSeg; i++) {
    const overlayIdx = numSeg + i;
    if (isReels) {
      // Reels: slide-up from +30px with fade-in over 0.3s
      filters.push(
        `[${overlayIdx}:v]format=yuva420p,fade=in:st=0:d=0.3:alpha=1[otxt${i}]`
      );
      filters.push(
        `[v${i}][otxt${i}]overlay=0:'if(lt(t,0.3),30*(1-t/0.3),0)':shortest=1[vt${i}]`
      );
    } else {
      const anim = getTextAnimationFilters(templateName, segments[i].duration);
      filters.push(`[${overlayIdx}:v]${anim.formatFilter}[otxt${i}]`);
      filters.push(`[v${i}][otxt${i}]overlay=${anim.overlayExpr}:shortest=1[vt${i}]`);
    }
  }

  // xfade transitions between segments
  let currentLabel = 'vt0';
  let cumulativeOffset = 0;
  for (let i = 1; i < numSeg; i++) {
    const prevDuration = segments[i - 1].duration;
    const transition = segments[i].transition || 'fade';
    const tDur = segments[i].transitionDuration || 0.5;
    cumulativeOffset += prevDuration - tDur;
    const outLabel = `xf${i}`;
    filters.push(`[${currentLabel}][vt${i}]xfade=transition=${transition}:duration=${tDur}:offset=${Math.max(0, cumulativeOffset)}[${outLabel}]`);
    currentLabel = outLabel;
  }

  // Final label
  filters.push(`[${currentLabel}]null[final]`);

  // Generate transition SFX
  const sfxPath = await generateSFX(outputDir, segments, templateName);

  // Audio handling
  const hasNarration = !!narrationPath;
  const hasBgm = !!actualBgmPath;
  const hasSfx = !!sfxPath;
  const hasAudio = hasNarration || hasBgm || hasSfx;

  // Build input args
  const inputArgs: string[] = [];
  // Scaled images (one per segment)
  for (const img of scaledImages) {
    inputArgs.push('-loop', '1', '-i', img);
  }
  // Text overlays (one per segment)
  for (const overlay of overlayPaths) {
    inputArgs.push('-loop', '1', '-i', overlay);
  }

  let audioFilterParts: string[] = [];
  let audioInputIdx = numSeg * 2; // after scaled images + overlays

  if (hasBgm && actualBgmPath) {
    inputArgs.push('-stream_loop', '-1', '-i', actualBgmPath);
    const bgmIdx = audioInputIdx;
    audioInputIdx++;

    if (hasNarration) {
      inputArgs.push('-i', narrationPath!);
      const narrIdx = audioInputIdx;
      audioInputIdx++;

      audioFilterParts.push(`[${bgmIdx}:a]volume=-15dB[bgm]`);
      audioFilterParts.push(`[${narrIdx}:a]volume=0dB[narr]`);

      if (hasSfx) {
        inputArgs.push('-i', sfxPath!);
        const sfxIdx = audioInputIdx;
        audioInputIdx++;
        audioFilterParts.push(`[${sfxIdx}:a]volume=0dB[sfx]`);
        audioFilterParts.push(`[bgm][narr][sfx]amix=inputs=3:duration=first[aout]`);
      } else {
        audioFilterParts.push(`[bgm][narr]amix=inputs=2:duration=first[aout]`);
      }
    } else {
      if (hasSfx) {
        inputArgs.push('-i', sfxPath!);
        const sfxIdx = audioInputIdx;
        audioInputIdx++;
        audioFilterParts.push(`[${bgmIdx}:a]afade=t=in:d=1,afade=t=out:st=${totalDuration - 1.5}:d=1.5[bgm]`);
        audioFilterParts.push(`[${sfxIdx}:a]volume=0dB[sfx]`);
        audioFilterParts.push(`[bgm][sfx]amix=inputs=2:duration=first[aout]`);
      } else {
        audioFilterParts.push(`[${bgmIdx}:a]afade=t=in:d=1,afade=t=out:st=${totalDuration - 1.5}:d=1.5[aout]`);
      }
    }
  } else if (hasNarration) {
    inputArgs.push('-i', narrationPath!);
    const narrIdx = audioInputIdx;
    audioInputIdx++;

    if (hasSfx) {
      inputArgs.push('-i', sfxPath!);
      const sfxIdx = audioInputIdx;
      audioInputIdx++;
      audioFilterParts.push(`[${narrIdx}:a]volume=0dB[narr]`);
      audioFilterParts.push(`[${sfxIdx}:a]volume=0dB[sfx]`);
      audioFilterParts.push(`[narr][sfx]amix=inputs=2:duration=first[aout]`);
    } else {
      audioFilterParts.push(`[${narrIdx}:a]volume=0dB[aout]`);
    }
  } else if (hasSfx) {
    inputArgs.push('-i', sfxPath!);
    const sfxIdx = audioInputIdx;
    audioInputIdx++;
    audioFilterParts.push(`[${sfxIdx}:a]volume=0dB[aout]`);
  }

  // Combine video and audio filters
  const allFilters = [...filters, ...audioFilterParts];

  // Write filter to file
  const filterFile = path.join(outputDir, 'filter_complex.txt');
  await fs.writeFile(filterFile, allFilters.join(';\n'));

  const outputArgs = [
    '-map', '[final]',
    ...(hasAudio ? ['-map', '[aout]'] : []),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',  // Higher quality (was 23)
    '-r', String(FPS),
    '-pix_fmt', 'yuv420p',
    '-t', String(totalDuration),
    ...(hasAudio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    '-y', outputPath,
  ];

  const allArgs = [...inputArgs, '-filter_complex_script', filterFile, ...outputArgs];

  logger.info(`FFmpeg args count: ${allArgs.length}`);
  logger.debug?.(`FFmpeg full args: ${allArgs.join(' ')}`);

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', allArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) {
        logger.info(`Video composed: ${outputPath}`);
        resolve(outputPath);
      } else {
        logger.error(`FFmpeg stderr: ${stderr.slice(-1000)}`);
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    proc.on('error', reject);
  });
}
