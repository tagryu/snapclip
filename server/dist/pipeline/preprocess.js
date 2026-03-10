"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessImage = preprocessImage;
exports.preprocessImages = preprocessImages;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../src/logger");
const TARGET_WIDTH = 1080;
async function preprocessImage(inputPath, outputDir) {
    const filename = `preprocessed_${Date.now()}_${path_1.default.basename(inputPath)}`;
    const outputPath = path_1.default.join(outputDir, filename.replace(/\.[^.]+$/, '.png'));
    logger_1.logger.info(`Preprocessing image: ${inputPath}`);
    // Get image metadata
    const metadata = await (0, sharp_1.default)(inputPath).metadata();
    const { width, height } = metadata;
    if (!width || !height)
        throw new Error(`Cannot read metadata for ${inputPath}`);
    // Resize to target width, maintain aspect ratio
    let pipeline = (0, sharp_1.default)(inputPath)
        .resize(TARGET_WIDTH, undefined, { fit: 'inside', withoutEnlargement: false });
    // Auto-adjust brightness and contrast via normalise
    pipeline = pipeline.normalise();
    // Sharpen slightly for quality
    pipeline = pipeline.sharpen({ sigma: 1.0 });
    await pipeline.png({ quality: 95 }).toFile(outputPath);
    logger_1.logger.info(`Preprocessed: ${outputPath}`);
    return outputPath;
}
async function preprocessImages(inputPaths, outputDir) {
    await promises_1.default.mkdir(outputDir, { recursive: true });
    return Promise.all(inputPaths.map(p => preprocessImage(p, outputDir)));
}
//# sourceMappingURL=preprocess.js.map