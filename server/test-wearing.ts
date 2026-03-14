import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } as any,
  });

  const imgBuf = await fs.readFile(path.join(__dirname, 'test-output/sweater.png'));
  const data = imgBuf.toString('base64');

  const prompts = [
    { name: 'model-male', prompt: 'A young Korean male model wearing this exact olive green knit sweater. Full body shot, urban street with autumn vibes, natural lighting, fashion editorial photography. The sweater must look exactly like the reference.' },
    { name: 'model-female', prompt: 'A young Korean female model wearing this exact olive green knit sweater. Upper body shot, cozy cafe interior, warm natural lighting, Instagram fashion photography style. The sweater must match the reference exactly.' },
    { name: 'model-casual', prompt: 'A young Korean model casually wearing this olive green knit sweater with jeans. Lifestyle photography, walking in a park with autumn leaves, candid natural pose. The sweater must be identical to the reference.' },
  ];

  const outDir = path.join(__dirname, 'test-output/sweater-pipeline/wearing');
  await fs.mkdir(outDir, { recursive: true });

  for (const p of prompts) {
    console.log(`🧑 Generating: ${p.name}...`);
    try {
      const result = await model.generateContent([
        p.prompt,
        { inlineData: { data, mimeType: 'image/png' } },
      ]);
      const parts = result.response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if ((part as any).inlineData) {
            const outPath = path.join(outDir, `${p.name}.png`);
            await fs.writeFile(outPath, Buffer.from((part as any).inlineData.data, 'base64'));
            console.log(`✅ ${outPath}`);
            break;
          }
        }
      }
    } catch (e: any) {
      console.log(`❌ ${p.name}: ${e.message?.slice(0, 200)}`);
    }
  }
  console.log('\nDone!');
}

main();
