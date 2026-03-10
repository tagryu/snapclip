"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeVideo = composeVideo;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../src/logger");
const templates_1 = require("../templates");
const FONT_PATH = path_1.default.join(__dirname, '..', 'assets', 'fonts', 'Pretendard-Bold.otf');
const FPS = 30;
async function composeVideo(opts) {
    const { images, template: templateName, aspect, productName, productPrice, aiCopy, bgmPath, narrationPath, outputDir } = opts;
    await promises_1.default.mkdir(outputDir, { recursive: true });
    const tmpl = templates_1.templates[templateName];
    if (!tmpl)
        throw new Error(`Unknown template: ${templateName}`);
    const segments = tmpl.segments(images.length);
    const outputPath = path_1.default.join(outputDir, `output_${aspect.label.replace(':', 'x')}_${Date.now()}.mp4`);
    logger_1.logger.info(`Composing video: ${templateName}, ${aspect.label}, ${images.length} images`);
    // First, scale all images to target aspect ratio
    const scaledImages = [];
    for (let i = 0; i < images.length; i++) {
        const scaledPath = path_1.default.join(outputDir, `scaled_${i}.png`);
        await scaleImage(images[i], scaledPath, aspect.width, aspect.height);
        scaledImages.push(scaledPath);
    }
    // Build filter_complex
    const { filterComplex, lastLabel } = buildFilterComplex(scaledImages, segments, tmpl, aspect, productName, productPrice, aiCopy);
    return new Promise((resolve, reject) => {
        let cmd = (0, fluent_ffmpeg_1.default)();
        // Add image inputs
        for (const img of scaledImages) {
            cmd = cmd.input(img).inputOptions(['-loop', '1']);
        }
        // Add audio if present
        if (narrationPath) {
            cmd = cmd.input(narrationPath);
        }
        else if (bgmPath) {
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
            .on('start', (cmd) => logger_1.logger.info(`FFmpeg started: ${cmd}`))
            .on('progress', (p) => logger_1.logger.info(`FFmpeg progress: ${p.percent?.toFixed(1)}%`))
            .on('end', () => {
            logger_1.logger.info(`Video composed: ${outputPath}`);
            resolve(outputPath);
        })
            .on('error', (err) => {
            logger_1.logger.error(`FFmpeg error: ${err.message}`);
            reject(err);
        })
            .run();
    });
}
function buildFilterComplex(images, segments, tmpl, aspect, productName, productPrice, aiCopy) {
    const filters = [];
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
    filters.push(`[${currentLabel}]drawtext=${fontOpt}:text='${escapedName}':fontsize=${style.fontsize}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:${style.alignment}${boxOpts}:enable='between(t,0,${totalImageDur})'[txt1]`);
    // Price overlay on CTA portion
    filters.push(`[txt1]drawtext=${fontOpt}:text='${escapedPrice}':fontsize=${Math.round(style.fontsize * 1.2)}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:x=(w-text_w)/2:y=(h-th)/2${boxOpts}:enable='gte(t,${totalImageDur})'[txt2]`);
    // AI copy overlay
    filters.push(`[txt2]drawtext=${fontOpt}:text='${copyText}':fontsize=${Math.round(style.fontsize * 0.8)}:fontcolor=${style.fontcolor}:borderw=${style.borderw}:bordercolor=${style.bordercolor}:x=(w-text_w)/2:y=(h/2+60)${boxOpts}:enable='gte(t,${totalImageDur})'[final]`);
    return { filterComplex: filters.join(';'), lastLabel: 'final' };
}
async function scaleImage(input, output, width, height) {
    const sharp = (await Promise.resolve().then(() => __importStar(require('sharp')))).default;
    await sharp(input)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toFile(output);
}
//# sourceMappingURL=composer.js.map