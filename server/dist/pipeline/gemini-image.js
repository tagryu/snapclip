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
exports.analyzeProduct = analyzeProduct;
exports.generateRealisticBackground = generateRealisticBackground;
exports.generateMultiAngle = generateMultiAngle;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const logger_1 = require("../src/logger");
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        return null;
    // Lazy import to avoid crash when package missing
    return { apiKey };
}
async function readImageAsBase64(imagePath) {
    const buffer = await promises_1.default.readFile(imagePath);
    const data = buffer.toString('base64');
    const ext = path_1.default.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return { data, mimeType };
}
// ─── Product Analysis ───
async function analyzeProduct(imagePath) {
    const client = getGeminiClient();
    if (!client) {
        logger_1.logger.info('No GEMINI_API_KEY, using fallback product analysis');
        return fallbackAnalysis();
    }
    try {
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(client.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const { data, mimeType } = await readImageAsBase64(imagePath);
        const prompt = `Analyze this product image and respond ONLY in this JSON format (no markdown, no code fences):
{"category":"<electronics|fashion|beauty|food|home|sports|toys|other>","color":"<primary color>","material":"<material>","suggestedScenes":["<scene1>","<scene2>","<scene3>"]}

For suggestedScenes, suggest 3 realistic photography backgrounds that would suit this product (e.g., "marble table with soft lighting", "minimalist white desk", "natural wood surface with plants").`;
        const result = await model.generateContent([
            prompt,
            { inlineData: { data, mimeType } },
        ]);
        const text = result.response.text().trim();
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            logger_1.logger.info(`Product analysis: ${JSON.stringify(parsed)}`);
            return {
                category: parsed.category || 'other',
                color: parsed.color || 'unknown',
                material: parsed.material || 'unknown',
                suggestedScenes: Array.isArray(parsed.suggestedScenes) ? parsed.suggestedScenes : [],
            };
        }
        logger_1.logger.warn('Could not parse Gemini analysis response, using fallback');
        return fallbackAnalysis();
    }
    catch (err) {
        logger_1.logger.warn(`Gemini product analysis failed: ${err.message}`);
        return fallbackAnalysis();
    }
}
function fallbackAnalysis() {
    return {
        category: 'other',
        color: 'neutral',
        material: 'unknown',
        suggestedScenes: ['clean white surface with soft shadows', 'marble table with studio lighting', 'minimalist desk setup'],
    };
}
// ─── Realistic Background Generation ───
async function generateRealisticBackground(productImagePath, scene, aspectRatio, outputDir) {
    await promises_1.default.mkdir(outputDir, { recursive: true });
    const client = getGeminiClient();
    if (!client) {
        logger_1.logger.info('No GEMINI_API_KEY, skipping realistic background generation');
        return productImagePath; // Return original, pipeline will use gradient fallback
    }
    try {
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(client.apiKey);
        // Use gemini-2.5-flash with image generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-image',
            generationConfig: {
                // @ts-ignore - responseModalities for image generation
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        const { data, mimeType } = await readImageAsBase64(productImagePath);
        const prompt = `Place this product on ${scene}. Photorealistic product photography, studio lighting, 4K quality. The product should look natural in the scene, not AI-generated. Keep the product exactly as shown. Aspect ratio: ${aspectRatio}.`;
        const result = await model.generateContent([
            prompt,
            { inlineData: { data, mimeType } },
        ]);
        // Extract generated image from response
        const response = result.response;
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        const imgData = part.inlineData;
                        const outputPath = path_1.default.join(outputDir, `realistic_bg_${Date.now()}.png`);
                        const imgBuffer = Buffer.from(imgData.data, 'base64');
                        await promises_1.default.writeFile(outputPath, imgBuffer);
                        logger_1.logger.info(`Realistic background generated: ${outputPath}`);
                        return outputPath;
                    }
                }
            }
        }
        logger_1.logger.warn('Gemini did not return an image, using fallback');
        return productImagePath;
    }
    catch (err) {
        logger_1.logger.warn(`Realistic background generation failed: ${err.message}`);
        return productImagePath;
    }
}
// ─── Multi-Angle View Generation ───
async function generateMultiAngle(productImagePath, angles, outputDir) {
    await promises_1.default.mkdir(outputDir, { recursive: true });
    const client = getGeminiClient();
    if (!client) {
        logger_1.logger.info('No GEMINI_API_KEY, using fallback multi-angle simulation');
        return fallbackMultiAngle(productImagePath, angles, outputDir);
    }
    const results = [];
    try {
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(client.apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-image',
            generationConfig: {
                // @ts-ignore - responseModalities for image generation
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        const { data, mimeType } = await readImageAsBase64(productImagePath);
        for (const angle of angles) {
            try {
                const prompt = `Generate a ${angle} view of this exact product. Same product, different viewing angle. Photorealistic product photography with clean background.`;
                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data, mimeType } },
                ]);
                const candidates = result.response.candidates;
                let saved = false;
                if (candidates && candidates.length > 0) {
                    const parts = candidates[0].content?.parts;
                    if (parts) {
                        for (const part of parts) {
                            if (part.inlineData) {
                                const imgData = part.inlineData;
                                const outputPath = path_1.default.join(outputDir, `angle_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);
                                await promises_1.default.writeFile(outputPath, Buffer.from(imgData.data, 'base64'));
                                results.push(outputPath);
                                saved = true;
                                logger_1.logger.info(`Multi-angle ${angle} generated: ${outputPath}`);
                                break;
                            }
                        }
                    }
                }
                if (!saved) {
                    // Fallback for this angle
                    const fb = await createSimulatedAngle(productImagePath, angle, outputDir);
                    results.push(fb);
                }
            }
            catch (err) {
                logger_1.logger.warn(`Multi-angle ${angle} failed: ${err.message}`);
                const fb = await createSimulatedAngle(productImagePath, angle, outputDir);
                results.push(fb);
            }
        }
        return results;
    }
    catch (err) {
        logger_1.logger.warn(`Multi-angle generation failed entirely: ${err.message}`);
        return fallbackMultiAngle(productImagePath, angles, outputDir);
    }
}
/** Fallback: simulate different angles via crop/zoom transforms */
async function fallbackMultiAngle(imagePath, angles, outputDir) {
    const results = [];
    for (const angle of angles) {
        const result = await createSimulatedAngle(imagePath, angle, outputDir);
        results.push(result);
    }
    return results;
}
async function createSimulatedAngle(imagePath, angle, outputDir) {
    const meta = await (0, sharp_1.default)(imagePath).metadata();
    const w = meta.width || 1080;
    const h = meta.height || 1080;
    const outputPath = path_1.default.join(outputDir, `sim_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);
    // Different crop/zoom regions to simulate angles
    let extract;
    const margin = Math.round(w * 0.08);
    switch (angle) {
        case 'front':
            // Center crop, slight zoom
            extract = { left: margin, top: margin, width: w - margin * 2, height: h - margin * 2 };
            break;
        case '45-degree':
            // Offset crop to the right
            extract = { left: Math.round(w * 0.12), top: margin, width: Math.round(w * 0.8), height: h - margin * 2 };
            break;
        case 'side':
            // Tighter crop, offset left
            extract = { left: Math.round(w * 0.15), top: Math.round(h * 0.05), width: Math.round(w * 0.7), height: Math.round(h * 0.9) };
            break;
        case 'back':
            // Flip horizontally as rough "back" simulation
            await (0, sharp_1.default)(imagePath).flop().resize(w, h, { fit: 'cover' }).png().toFile(outputPath);
            return outputPath;
        default:
            // Slight zoom
            extract = { left: margin, top: margin, width: w - margin * 2, height: h - margin * 2 };
    }
    await (0, sharp_1.default)(imagePath)
        .extract(extract)
        .resize(w, h, { fit: 'cover' })
        .png()
        .toFile(outputPath);
    return outputPath;
}
//# sourceMappingURL=gemini-image.js.map