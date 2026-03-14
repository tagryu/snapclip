import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  const imgBuf = await fs.readFile(path.join(__dirname, 'test-output/sweater.png'));
  const data = imgBuf.toString('base64');
  const outDir = path.join(__dirname, 'test-output/sweater-pipeline/realistic');
  await fs.mkdir(outDir, { recursive: true });

  // 1. gemini-3-pro-image-preview (최신 고품질)
  const models = [
    { id: 'gemini-3-pro-image-preview', label: 'gemini3pro' },
    { id: 'gemini-2.5-flash-image', label: 'flash-v2' },
  ];

  const prompts = [
    {
      name: 'street-raw',
      text: `RAW photograph taken with Sony A7IV, 85mm f/1.4 lens. A real Korean male model in his 20s wearing this exact olive green knit sweater. Standing on a Seoul street in Seongsu-dong. Shot from chest up. Shallow depth of field, natural golden hour sunlight. Film grain, slight lens flare. NOT AI generated, NOT illustration, NOT 3D render. Must look like an actual iPhone photo shared on Instagram. The sweater texture and color must match the reference exactly.`
    },
    {
      name: 'cafe-candid',
      text: `Candid photograph shot on Fujifilm X-T5, 35mm f/1.4. A real Korean female model in her 20s wearing this exact olive green knit sweater, sitting in a Korean cafe (카페). She's looking at her phone, natural unposed moment. Warm indoor lighting, slight bokeh in background. The photo should look like it was taken by a friend, not a professional shoot. Realistic skin texture, natural makeup. The knit sweater must be identical to the reference image.`
    },
    {
      name: 'outdoor-lifestyle',
      text: `Street style photograph, shot on Canon R5, 50mm f/1.2. Korean male model early 20s wearing this exact olive green sweater with dark denim jeans and white sneakers. Walking through Bukchon Hanok Village in autumn. Motion blur on feet, sharp on upper body. Natural overcast lighting. Photo should be indistinguishable from a real fashion blog photo. No AI artifacts, no smooth plastic skin. Real skin pores and natural imperfections visible. Sweater must match reference exactly.`
    },
  ];

  for (const m of models) {
    console.log(`\n📸 Model: ${m.id}`);
    try {
      const model = genAI.getGenerativeModel({
        model: m.id,
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } as any,
      });

      for (const p of prompts) {
        console.log(`  🧑 ${p.name}...`);
        try {
          const result = await model.generateContent([
            p.text,
            { inlineData: { data, mimeType: 'image/png' } },
          ]);
          const parts = result.response.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if ((part as any).inlineData) {
                const outPath = path.join(outDir, `${m.label}_${p.name}.png`);
                await fs.writeFile(outPath, Buffer.from((part as any).inlineData.data, 'base64'));
                console.log(`  ✅ ${outPath}`);
                break;
              }
            }
          }
        } catch (e: any) {
          console.log(`  ❌ ${e.message?.slice(0, 150)}`);
        }
      }
    } catch (e: any) {
      console.log(`  ❌ Model init failed: ${e.message?.slice(0, 150)}`);
    }
  }

  console.log('\n🎉 Done!');
}

main();
