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
exports.runPipeline = runPipeline;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
const logger_1 = require("../src/logger");
const preprocess_1 = require("./preprocess");
const background_1 = require("./background");
const copywriter_1 = require("./copywriter");
const tts_1 = require("./tts");
const composer_1 = require("./composer");
const uploader_1 = require("./uploader");
const types_1 = require("./types");
async function runPipeline(input, onProgress) {
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'snapclip', input.projectId || (0, uuid_1.v4)());
    await promises_1.default.mkdir(workDir, { recursive: true });
    try {
        // 1. Preprocess images
        onProgress(10, 'preprocessing');
        logger_1.logger.info('Stage 1: Preprocessing images');
        const preprocessedImages = await (0, preprocess_1.preprocessImages)(input.images, path_1.default.join(workDir, 'preprocessed'));
        // 2. Background removal & compositing
        onProgress(25, 'background');
        logger_1.logger.info('Stage 2: Background removal');
        const bgDir = path_1.default.join(workDir, 'background');
        const composited = [];
        for (const img of preprocessedImages) {
            const result = await (0, background_1.processBackground)(img, bgDir, input.backgroundStyle);
            composited.push(result);
        }
        // 3. AI Copy generation
        onProgress(40, 'copywriting');
        logger_1.logger.info('Stage 3: AI copy generation');
        const aiCopy = await (0, copywriter_1.generateCopy)(composited[0], input.productName, input.productPrice, input.productFeatures);
        logger_1.logger.info(`AI Copy: ${JSON.stringify(aiCopy)}`);
        // 4. TTS narration (optional)
        let narrationPath;
        if (input.voiceEnabled) {
            onProgress(55, 'tts');
            logger_1.logger.info('Stage 4: TTS narration');
            narrationPath = await (0, tts_1.generateNarration)(input.productName, aiCopy.lines, path_1.default.join(workDir, 'tts'));
        }
        // 5. Video composition
        onProgress(65, 'composing');
        logger_1.logger.info('Stage 5: Video composition');
        const aspect = types_1.ASPECT_CONFIGS[input.aspectRatio];
        const bgmDir = path_1.default.join(__dirname, '..', 'assets', 'bgm');
        const bgmPath = input.bgmPath || path_1.default.join(bgmDir, 'default.mp3');
        const videoPath = await (0, composer_1.composeVideo)({
            images: composited,
            template: input.template,
            aspect,
            productName: input.productName,
            productPrice: input.productPrice,
            aiCopy,
            bgmPath: await fileExists(bgmPath) ? bgmPath : undefined,
            narrationPath,
            outputDir: path_1.default.join(workDir, 'output'),
        });
        // 6. Generate thumbnail from first frame
        onProgress(85, 'thumbnail');
        const sharp = (await Promise.resolve().then(() => __importStar(require('sharp')))).default;
        const thumbnailPath = path_1.default.join(workDir, 'thumbnail.jpg');
        await sharp(composited[0])
            .resize(640, 360, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toFile(thumbnailPath);
        // 7. Upload to R2
        onProgress(90, 'uploading');
        logger_1.logger.info('Stage 6: Uploading');
        let videoUrl;
        let thumbnailUrl;
        try {
            videoUrl = await (0, uploader_1.uploadVideo)(videoPath, input.projectId);
            thumbnailUrl = await (0, uploader_1.uploadThumbnail)(thumbnailPath, input.projectId);
        }
        catch (err) {
            logger_1.logger.warn(`Upload failed (using local paths): ${err.message}`);
            videoUrl = videoPath;
            thumbnailUrl = thumbnailPath;
        }
        onProgress(100, 'complete');
        logger_1.logger.info('Pipeline complete!');
        return {
            videoUrl,
            thumbnailUrl,
            durationSec: 9, // approximate
            aiCopy,
        };
    }
    catch (err) {
        logger_1.logger.error('Pipeline failed:', err);
        throw err;
    }
}
async function fileExists(p) {
    try {
        await promises_1.default.access(p);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=index.js.map