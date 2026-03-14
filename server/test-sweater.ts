import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import fs from 'fs/promises';
import { analyzeProduct, generateRealisticBackground, generateMultiAngle } from './pipeline/gemini-image';
import { generateCopy } from './pipeline/copywriter';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const OUTPUT_DIR = path.join(__dirname, 'test-output', 'sweater-pipeline');
const ASPECT = ASPECT_CONFIGS['9:16'];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const productImage = path.join(__dirname, 'test-output', 'sweater.png');

  // 1. Gemini 상품 분석
  console.log('🔍 Step 1: Gemini 상품 분석...');
  const analysis = await analyzeProduct(productImage);
  console.log('분석 결과:', JSON.stringify(analysis, null, 2));

  // 2. 리얼 배경 합성
  console.log('\n🎨 Step 2: 리얼 배경 합성...');
  const bgDir = path.join(OUTPUT_DIR, 'backgrounds');
  const bgImages: string[] = [];
  for (const scene of analysis.suggestedScenes.slice(0, 2)) {
    console.log(`  배경: ${scene}`);
    const bgImg = await generateRealisticBackground(productImage, scene, '9:16', bgDir);
    bgImages.push(bgImg);
  }

  // 3. 다각도 뷰
  console.log('\n📐 Step 3: 다각도 뷰 생성...');
  const angleDir = path.join(OUTPUT_DIR, 'angles');
  const angleImages = await generateMultiAngle(productImage, ['front', '45-degree', 'side'], angleDir);
  console.log(`  ✅ ${angleImages.length}개 앵글`);

  // 4. AI 카피
  console.log('\n✍️ Step 4: AI 카피...');
  const aiCopy = await generateCopy(
    productImage,
    '울 블렌드 크루넥 니트',
    '₩59,900',
    [analysis.color, analysis.material, '크루넥', '오버핏']
  );
  console.log('카피:', JSON.stringify(aiCopy, null, 2));

  // 5. 영상 합성 - 3개 템플릿
  const allImages = [...bgImages, ...angleImages].filter(img => img !== productImage);
  const videoImages = allImages.length >= 3 ? allImages.slice(0, 5) : [productImage, ...allImages];

  for (const tmpl of ['trendy', 'simple', 'dynamic']) {
    console.log(`\n🎬 Step 5: ${tmpl} 영상 합성...`);
    const workDir = path.join(OUTPUT_DIR, `work_${tmpl}`);
    await fs.mkdir(workDir, { recursive: true });

    const videoPath = await composeVideo({
      images: videoImages,
      template: tmpl,
      aspect: ASPECT,
      productName: '울 블렌드 크루넥 니트',
      productPrice: '₩59,900',
      productFeatures: ['울 블렌드', '크루넥', '오버핏'],
      aiCopy,
      outputDir: workDir,
    });

    const finalPath = path.join(OUTPUT_DIR, `sweater-${tmpl}.mp4`);
    await fs.copyFile(videoPath, finalPath);
    const stat = await fs.stat(finalPath);
    console.log(`✅ ${finalPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  }

  console.log('\n🎉 완료!');
}

main().catch(err => { console.error('❌', err); process.exit(1); });
