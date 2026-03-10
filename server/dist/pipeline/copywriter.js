"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCopy = generateCopy;
const generative_ai_1 = require("@google/generative-ai");
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../src/logger");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
async function generateCopy(imagePath, productName, productPrice, productFeatures) {
    logger_1.logger.info(`Generating AI copy for: ${productName}`);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const imageData = await promises_1.default.readFile(imagePath);
    const base64Image = imageData.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const prompt = `당신은 한국의 프로 광고 카피라이터입니다.

상품 정보:
- 상품명: ${productName}
- 가격: ${productPrice}
- 특징: ${productFeatures.join(', ')}

첨부된 상품 사진을 분석하고, 아래 형식으로 정확히 응답하세요:

COPY1: (첫 번째 광고 카피 - 감성적, 20자 이내)
COPY2: (두 번째 광고 카피 - 기능 강조, 20자 이내)  
COPY3: (세 번째 광고 카피 - 구매 유도, 20자 이내)
HASHTAGS: #태그1 #태그2 #태그3 #태그4 #태그5

규칙:
- 한국어로 작성
- 짧고 임팩트 있게
- 이모지 적절히 사용
- 해시태그는 반드시 5개`;
    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType } },
    ]);
    const text = result.response.text();
    logger_1.logger.info(`AI response: ${text}`);
    return parseCopyResponse(text);
}
function parseCopyResponse(text) {
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
    if (hashMatch) {
        hashtags = hashMatch[1].match(/#[^\s#]+/g) || [];
    }
    // Fallback
    if (lines.length === 0) {
        lines.push('감각적인 디자인', '프리미엄 퀄리티', '지금 바로 만나보세요');
    }
    if (hashtags.length === 0) {
        hashtags = ['#추천', '#인기', '#트렌드', '#필수템', '#신상'];
    }
    return { lines: lines.slice(0, 3), hashtags: hashtags.slice(0, 5) };
}
//# sourceMappingURL=copywriter.js.map