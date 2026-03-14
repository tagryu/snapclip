import { logger } from '../src/logger';
import { generateRealisticBackground, generateMultiAngle } from './gemini-image';
import { generateRealisticBackground_local, generateMultiAngle_local } from './local-image';

// ─── Daily Usage Tracking (in-memory, resets per day) ───

const dailyUsage = new Map<string, { date: string; count: number }>();

function getGeminiDailyLimits(): Record<string, number> {
  return {
    free: parseInt(process.env.GEMINI_DAILY_LIMIT_FREE || '3', 10),
    basic: parseInt(process.env.GEMINI_DAILY_LIMIT_BASIC || '10', 10),
    pro: parseInt(process.env.GEMINI_DAILY_LIMIT_PRO || '30', 10),
  };
}

function canUseGemini(userId: string, plan: string): boolean {
  const limits = getGeminiDailyLimits();
  const limit = limits[plan] ?? limits.free;
  const today = new Date().toISOString().slice(0, 10);
  const usage = dailyUsage.get(userId);
  if (!usage || usage.date !== today) return true;
  return usage.count < limit;
}

function recordGeminiUsage(userId: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const usage = dailyUsage.get(userId);
  if (!usage || usage.date !== today) {
    dailyUsage.set(userId, { date: today, count: 1 });
  } else {
    usage.count++;
  }
}

/** For testing / monitoring */
export function getUsage(userId: string): { date: string; count: number } | undefined {
  return dailyUsage.get(userId);
}

// ─── Hybrid Router ───

export interface GenerateImageOpts {
  type: 'background' | 'multiAngle';
  userId?: string;
  plan?: string;
  productImagePath: string;
  scene?: string;
  angles?: string[];
  aspectRatio?: string;
  outputDir: string;
}

export async function generateImage(opts: GenerateImageOpts): Promise<string | string[]> {
  const userId = opts.userId || 'anonymous';
  const plan = opts.plan || 'free';

  // ── Try Gemini first (if quota remains) ──
  if (canUseGemini(userId, plan)) {
    try {
      let result: string | string[];
      if (opts.type === 'background') {
        result = await generateRealisticBackground(
          opts.productImagePath,
          opts.scene || 'clean white surface with soft studio lighting',
          opts.aspectRatio || '16:9',
          opts.outputDir
        );
      } else {
        result = await generateMultiAngle(
          opts.productImagePath,
          opts.angles || ['front', '45-degree', 'side'],
          opts.outputDir
        );
      }
      recordGeminiUsage(userId);
      logger.info(`Image generated via Gemini (user=${userId}, plan=${plan})`);
      return result;
    } catch (err: any) {
      logger.warn(`Gemini image generation failed, trying local: ${err.message}`);
    }
  } else {
    logger.info(`Gemini daily limit reached for user=${userId} plan=${plan}, using local model`);
  }

  // ── Try local model (ComfyUI/SDXL) ──
  try {
    let result: string | string[];
    if (opts.type === 'background') {
      result = await generateRealisticBackground_local(
        opts.productImagePath,
        opts.scene || 'clean white surface with soft studio lighting',
        opts.aspectRatio || '16:9',
        opts.outputDir
      );
    } else {
      result = await generateMultiAngle_local(
        opts.productImagePath,
        opts.angles || ['front', '45-degree', 'side'],
        opts.outputDir
      );
    }
    logger.info(`Image generated via local model (user=${userId})`);
    return result;
  } catch (err: any) {
    logger.warn(`Local image generation also failed: ${err.message}`);
    // Sharp fallback is built into local-image.ts, so this shouldn't happen
    // but if it does, return original
    return opts.type === 'background' ? opts.productImagePath : [opts.productImagePath];
  }
}
