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
const GRADIENTS = {
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
function createGradientSvg(width, height, style) {
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
async function removeBackground(inputPath, outputDir) {
    logger_1.logger.info(`Removing background: ${inputPath}`);
    try {
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
    catch (err) {
        logger_1.logger.warn(`Background removal failed, using original image: ${err.message}`);
        return inputPath;
    }
}
async function compositeWithBackground(foregroundPath, outputDir, style, targetWidth = 1080, targetHeight = 1080) {
    logger_1.logger.info(`Compositing with ${style} background`);
    const gradientSvg = createGradientSvg(targetWidth, targetHeight, style);
    const gradientBuffer = Buffer.from(gradientSvg);
    const padding = Math.round(targetWidth * 0.08);
    const maxFgWidth = targetWidth - padding * 2;
    const maxFgHeight = targetHeight - padding * 2;
    const foreground = await (0, sharp_1.default)(foregroundPath)
        .resize(maxFgWidth, maxFgHeight, { fit: 'inside', withoutEnlargement: false })
        .toBuffer();
    const fgMeta = await (0, sharp_1.default)(foreground).metadata();
    const fgW = fgMeta.width || maxFgWidth;
    const fgH = fgMeta.height || maxFgHeight;
    const left = Math.round((targetWidth - fgW) / 2);
    const top = Math.round((targetHeight - fgH) / 2);
    // Create a subtle drop shadow behind the product
    const shadowOffset = 8;
    const shadowBlur = 20;
    const shadowBuffer = await (0, sharp_1.default)(foreground)
        .modulate({ brightness: 0 }) // make it black
        .blur(shadowBlur)
        .ensureAlpha(0.3)
        .toBuffer();
    const filename = `composite_${Date.now()}_${path_1.default.basename(foregroundPath)}`;
    const outputPath = path_1.default.join(outputDir, filename);
    await (0, sharp_1.default)(gradientBuffer)
        .resize(targetWidth, targetHeight)
        .composite([
        { input: shadowBuffer, left: left + shadowOffset, top: top + shadowOffset },
        { input: foreground, left, top },
    ])
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