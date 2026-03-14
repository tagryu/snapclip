"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsage = getUsage;
exports.generateImage = generateImage;
const logger_1 = require("../src/logger");
const gemini_image_1 = require("./gemini-image");
const local_image_1 = require("./local-image");
// ─── Daily Usage Tracking (in-memory, resets per day) ───
const dailyUsage = new Map();
function getGeminiDailyLimits() {
    return {
        free: parseInt(process.env.GEMINI_DAILY_LIMIT_FREE || '3', 10),
        basic: parseInt(process.env.GEMINI_DAILY_LIMIT_BASIC || '10', 10),
        pro: parseInt(process.env.GEMINI_DAILY_LIMIT_PRO || '30', 10),
    };
}
function canUseGemini(userId, plan) {
    const limits = getGeminiDailyLimits();
    const limit = limits[plan] ?? limits.free;
    const today = new Date().toISOString().slice(0, 10);
    const usage = dailyUsage.get(userId);
    if (!usage || usage.date !== today)
        return true;
    return usage.count < limit;
}
function recordGeminiUsage(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const usage = dailyUsage.get(userId);
    if (!usage || usage.date !== today) {
        dailyUsage.set(userId, { date: today, count: 1 });
    }
    else {
        usage.count++;
    }
}
/** For testing / monitoring */
function getUsage(userId) {
    return dailyUsage.get(userId);
}
async function generateImage(opts) {
    const userId = opts.userId || 'anonymous';
    const plan = opts.plan || 'free';
    // ── Try Gemini first (if quota remains) ──
    if (canUseGemini(userId, plan)) {
        try {
            let result;
            if (opts.type === 'background') {
                result = await (0, gemini_image_1.generateRealisticBackground)(opts.productImagePath, opts.scene || 'clean white surface with soft studio lighting', opts.aspectRatio || '16:9', opts.outputDir);
            }
            else {
                result = await (0, gemini_image_1.generateMultiAngle)(opts.productImagePath, opts.angles || ['front', '45-degree', 'side'], opts.outputDir);
            }
            recordGeminiUsage(userId);
            logger_1.logger.info(`Image generated via Gemini (user=${userId}, plan=${plan})`);
            return result;
        }
        catch (err) {
            logger_1.logger.warn(`Gemini image generation failed, trying local: ${err.message}`);
        }
    }
    else {
        logger_1.logger.info(`Gemini daily limit reached for user=${userId} plan=${plan}, using local model`);
    }
    // ── Try local model (ComfyUI/SDXL) ──
    try {
        let result;
        if (opts.type === 'background') {
            result = await (0, local_image_1.generateRealisticBackground_local)(opts.productImagePath, opts.scene || 'clean white surface with soft studio lighting', opts.aspectRatio || '16:9', opts.outputDir);
        }
        else {
            result = await (0, local_image_1.generateMultiAngle_local)(opts.productImagePath, opts.angles || ['front', '45-degree', 'side'], opts.outputDir);
        }
        logger_1.logger.info(`Image generated via local model (user=${userId})`);
        return result;
    }
    catch (err) {
        logger_1.logger.warn(`Local image generation also failed: ${err.message}`);
        // Sharp fallback is built into local-image.ts, so this shouldn't happen
        // but if it does, return original
        return opts.type === 'background' ? opts.productImagePath : [opts.productImagePath];
    }
}
//# sourceMappingURL=image-router.js.map