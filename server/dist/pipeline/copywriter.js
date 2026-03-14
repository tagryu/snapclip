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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCopy = generateCopy;
const logger_1 = require("../src/logger");
async function generateCopy(_imagePath, productName, productPrice, productFeatures) {
    logger_1.logger.info(`Generating AI copy for: ${productName}`);
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            return await generateWithGemini(_imagePath, productName, productPrice, productFeatures);
        }
        catch (err) {
            logger_1.logger.warn(`Gemini failed, using fallback: ${err.message}`);
        }
    }
    else {
        logger_1.logger.info('No GEMINI_API_KEY, using dummy copy');
    }
    // Fallback dummy copy
    const featureText = productFeatures.length > 0 ? productFeatures[0] : '프리미엄 퀄리티';
    return {
        lines: [
            `✨ ${productName}, 감각적인 선택`,
            `💎 ${featureText}`,
            `🔥 지금 바로 만나보세요`,
        ],
        hashtags: ['#추천', '#인기', '#트렌드', '#필수템', '#신상'],
    };
}
async function generateWithGemini(imagePath, productName, productPrice, productFeatures) {
    const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const imageData = await fs.readFile(imagePath);
    const base64Image = imageData.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const prompt = `당신은 한국의 프로 광고 카피라이터입니다.
상품명: ${productName}, 가격: ${productPrice}, 특징: ${productFeatures.join(', ')}
COPY1~3 각 20자 이내 한국어, HASHTAGS 5개를 작성하세요.`;
    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType } },
    ]);
    const text = result.response.text();
    const lines = [];
    const copyMatches = text.match(/COPY\d:\s*(.+)/g);
    if (copyMatches) {
        for (const m of copyMatches) {
            const val = m.replace(/COPY\d:\s*/, '').trim();
            if (val)
                lines.push(val);
        }
    }
    let hashtags = [];
    const hashMatch = text.match(/HASHTAGS?:\s*(.+)/i);
    if (hashMatch)
        hashtags = hashMatch[1].match(/#[^\s#]+/g) || [];
    if (lines.length === 0)
        lines.push('감각적인 디자인', '프리미엄 퀄리티', '지금 바로 만나보세요');
    if (hashtags.length === 0)
        hashtags = ['#추천', '#인기', '#트렌드', '#필수템', '#신상'];
    return { lines: lines.slice(0, 3), hashtags: hashtags.slice(0, 5) };
}
//# sourceMappingURL=copywriter.js.map