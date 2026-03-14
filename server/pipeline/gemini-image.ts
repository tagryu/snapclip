import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { logger } from '../src/logger';

/** Product analysis result from Gemini */
export interface ProductAnalysis {
  category: string;
  color: string;
  material: string;
  suggestedScenes: string[];
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  // Lazy import to avoid crash when package missing
  return { apiKey };
}

async function readImageAsBase64(imagePath: string): Promise<{ data: string; mimeType: string }> {
  const buffer = await fs.readFile(imagePath);
  const data = buffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return { data, mimeType };
}

// ─── Product Analysis ───

export async function analyzeProduct(imagePath: string): Promise<ProductAnalysis> {
  const client = getGeminiClient();
  if (!client) {
    logger.info('No GEMINI_API_KEY, using fallback product analysis');
    return fallbackAnalysis();
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
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
      logger.info(`Product analysis: ${JSON.stringify(parsed)}`);
      return {
        category: parsed.category || 'other',
        color: parsed.color || 'unknown',
        material: parsed.material || 'unknown',
        suggestedScenes: Array.isArray(parsed.suggestedScenes) ? parsed.suggestedScenes : [],
      };
    }

    logger.warn('Could not parse Gemini analysis response, using fallback');
    return fallbackAnalysis();
  } catch (err: any) {
    logger.warn(`Gemini product analysis failed: ${err.message}`);
    return fallbackAnalysis();
  }
}

function fallbackAnalysis(): ProductAnalysis {
  return {
    category: 'other',
    color: 'neutral',
    material: 'unknown',
    suggestedScenes: ['clean white surface with soft shadows', 'marble table with studio lighting', 'minimalist desk setup'],
  };
}

// ─── Realistic Background Generation ───

export async function generateRealisticBackground(
  productImagePath: string,
  scene: string,
  aspectRatio: string,
  outputDir: string
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });

  const client = getGeminiClient();
  if (!client) {
    logger.info('No GEMINI_API_KEY, skipping realistic background generation');
    return productImagePath; // Return original, pipeline will use gradient fallback
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
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
          if ((part as any).inlineData) {
            const imgData = (part as any).inlineData;
            const outputPath = path.join(outputDir, `realistic_bg_${Date.now()}.png`);
            const imgBuffer = Buffer.from(imgData.data, 'base64');
            await fs.writeFile(outputPath, imgBuffer);
            logger.info(`Realistic background generated: ${outputPath}`);
            return outputPath;
          }
        }
      }
    }

    logger.warn('Gemini did not return an image, using fallback');
    return productImagePath;
  } catch (err: any) {
    logger.warn(`Realistic background generation failed: ${err.message}`);
    return productImagePath;
  }
}

// ─── Multi-Angle View Generation ───

export async function generateMultiAngle(
  productImagePath: string,
  angles: string[],
  outputDir: string
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });

  const client = getGeminiClient();
  if (!client) {
    logger.info('No GEMINI_API_KEY, using fallback multi-angle simulation');
    return fallbackMultiAngle(productImagePath, angles, outputDir);
  }

  const results: string[] = [];

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
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
              if ((part as any).inlineData) {
                const imgData = (part as any).inlineData;
                const outputPath = path.join(outputDir, `angle_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);
                await fs.writeFile(outputPath, Buffer.from(imgData.data, 'base64'));
                results.push(outputPath);
                saved = true;
                logger.info(`Multi-angle ${angle} generated: ${outputPath}`);
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
      } catch (err: any) {
        logger.warn(`Multi-angle ${angle} failed: ${err.message}`);
        const fb = await createSimulatedAngle(productImagePath, angle, outputDir);
        results.push(fb);
      }
    }

    return results;
  } catch (err: any) {
    logger.warn(`Multi-angle generation failed entirely: ${err.message}`);
    return fallbackMultiAngle(productImagePath, angles, outputDir);
  }
}

/** Fallback: simulate different angles via crop/zoom transforms */
async function fallbackMultiAngle(
  imagePath: string,
  angles: string[],
  outputDir: string
): Promise<string[]> {
  const results: string[] = [];
  for (const angle of angles) {
    const result = await createSimulatedAngle(imagePath, angle, outputDir);
    results.push(result);
  }
  return results;
}

async function createSimulatedAngle(
  imagePath: string,
  angle: string,
  outputDir: string
): Promise<string> {
  const meta = await sharp(imagePath).metadata();
  const w = meta.width || 1080;
  const h = meta.height || 1080;
  const outputPath = path.join(outputDir, `sim_${angle.replace(/\s+/g, '_')}_${Date.now()}.png`);

  // Different crop/zoom regions to simulate angles
  let extract: { left: number; top: number; width: number; height: number };
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
      await sharp(imagePath).flop().resize(w, h, { fit: 'cover' }).png().toFile(outputPath);
      return outputPath;
    default:
      // Slight zoom
      extract = { left: margin, top: margin, width: w - margin * 2, height: h - margin * 2 };
  }

  await sharp(imagePath)
    .extract(extract)
    .resize(w, h, { fit: 'cover' })
    .png()
    .toFile(outputPath);

  return outputPath;
}
