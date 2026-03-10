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
exports.removeBackground = removeBackground;
exports.compositeWithBackground = compositeWithBackground;
exports.processBackground = processBackground;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../src/logger");
// Gradient background definitions
const GRADIENTS = {
    dark: { from: '#1a1a2e', to: '#16213e' },
    light: { from: '#f8f9fa', to: '#e9ecef' },
    pink: { from: '#ff9a9e', to: '#fecfef' },
    blue: { from: '#667eea', to: '#764ba2' },
    green: { from: '#11998e', to: '#38ef7d' },
};
function createGradientSvg(width, height, style) {
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
async function removeBackground(inputPath, outputDir) {
    logger_1.logger.info(`Removing background: ${inputPath}`);
    // Dynamic import for ESM module
    const { removeBackground: rmbg } = await Promise.resolve().then(() => __importStar(require('@imgly/background-removal-node')));
    const inputBuffer = await promises_1.default.readFile(inputPath);
    const blob = new Blob([inputBuffer], { type: 'image/png' });
    const resultBlob = await rmbg(blob, { model: 'small' });
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
    const filename = `nobg_${Date.now()}_${path_1.default.basename(inputPath, path_1.default.extname(inputPath))}.png`;
    const outputPath = path_1.default.join(outputDir, filename);
    await promises_1.default.writeFile(outputPath, resultBuffer);
    logger_1.logger.info(`Background removed: ${outputPath}`);
    return outputPath;
}
async function compositeWithBackground(foregroundPath, outputDir, style, targetWidth = 1080, targetHeight = 1080) {
    logger_1.logger.info(`Compositing with ${style} background`);
    const gradientSvg = createGradientSvg(targetWidth, targetHeight, style);
    const gradientBuffer = Buffer.from(gradientSvg);
    // Resize foreground to fit within background with padding
    const padding = Math.round(targetWidth * 0.1);
    const maxFgWidth = targetWidth - padding * 2;
    const maxFgHeight = targetHeight - padding * 2;
    const foreground = await (0, sharp_1.default)(foregroundPath)
        .resize(maxFgWidth, maxFgHeight, { fit: 'inside', withoutEnlargement: false })
        .toBuffer();
    const fgMeta = await (0, sharp_1.default)(foreground).metadata();
    const left = Math.round((targetWidth - (fgMeta.width || maxFgWidth)) / 2);
    const top = Math.round((targetHeight - (fgMeta.height || maxFgHeight)) / 2);
    const filename = `composite_${Date.now()}_${path_1.default.basename(foregroundPath)}`;
    const outputPath = path_1.default.join(outputDir, filename);
    await (0, sharp_1.default)(gradientBuffer)
        .resize(targetWidth, targetHeight)
        .composite([{ input: foreground, left, top }])
        .png()
        .toFile(outputPath);
    logger_1.logger.info(`Composited: ${outputPath}`);
    return outputPath;
}
async function processBackground(inputPath, outputDir, style) {
    await promises_1.default.mkdir(outputDir, { recursive: true });
    const noBgPath = await removeBackground(inputPath, outputDir);
    return compositeWithBackground(noBgPath, outputDir, style);
}
//# sourceMappingURL=background.js.map