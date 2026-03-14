import { logger } from '../src/logger';
import type { AICopy } from './types';

export async function generateCopy(
  _imagePath: string,
  productName: string,
  productPrice: string,
  productFeatures: string[]
): Promise<AICopy> {
  logger.info(`Generating AI copy for: ${productName}`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await generateWithGemini(_imagePath, productName, productPrice, productFeatures);
    } catch (err: any) {
      logger.warn(`Gemini failed, using fallback: ${err.message}`);
    }
  } else {
    logger.info('No GEMINI_API_KEY, using dummy copy');
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

async function generateWithGemini(
  imagePath: string,
  productName: string,
  productPrice: string,
  productFeatures: string[]
): Promise<AICopy> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const fs = await import('fs/promises');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
  const lines: string[] = [];
  const copyMatches = text.match(/COPY\d:\s*(.+)/g);
  if (copyMatches) {
    for (const m of copyMatches) {
      const val = m.replace(/COPY\d:\s*/, '').trim();
      if (val) lines.push(val);
    }
  }
  let hashtags: string[] = [];
  const hashMatch = text.match(/HASHTAGS?:\s*(.+)/i);
  if (hashMatch) hashtags = hashMatch[1].match(/#[^\s#]+/g) || [];

  if (lines.length === 0) lines.push('감각적인 디자인', '프리미엄 퀄리티', '지금 바로 만나보세요');
  if (hashtags.length === 0) hashtags = ['#추천', '#인기', '#트렌드', '#필수템', '#신상'];

  return { lines: lines.slice(0, 3), hashtags: hashtags.slice(0, 5) };
}
