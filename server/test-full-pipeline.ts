/**
 * Full pipeline test with Gemini AI - clothes product
 */
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import fs from 'fs/promises';
import { analyzeProduct, generateRealisticBackground, generateMultiAngle } from './pipeline/gemini-image';
import { generateCopy } from './pipeline/copywriter';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const CLOTHES_DIR = path.join(__dirname, 'test-output', 'clothes');
const OUTPUT_DIR = path.join(__dirname, 'test-output', 'full-pipeline');
const ASPECT = ASPECT_CONFIGS['9:16'];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const productImage = path.join(CLOTHES_DIR, 'front.jpg');
  
  // 1. Gemini 상품 분석
  console.log('🔍 Step 1: Gemini 상품 분석...');
  const analysis = await analyzeProduct(productImage);
  console.log('분석 결과:', JSON.stringify(analysis, null, 2));

  // 2. 리얼 배경 합성
  console.log('\n🎨 Step 2: 리얼 배경 합성...');
  const bgDir = path.join(OUTPUT_DIR, 'backgrounds');
  const scenes = analysis.suggestedScenes.length > 0 
    ? analysis.suggestedScenes 
    : ['clean marble surface with soft studio lighting', 'minimalist boutique interior', 'natural sunlit wooden shelf'];
  
  const bgImages: string[] = [];
  for (const scene of scenes.slice(0, 2)) {
    console.log(`  배경 생성 중: ${scene}`);
    const bgImg = await generateRealisticBackground(productImage, scene, '9:16', bgDir);
    bgImages.push(bgImg);
    console.log(`  ✅ ${bgImg}`);
  }

  // 3. 다각도 뷰 생성
  console.log('\n📐 Step 3: 다각도 뷰 생성...');
  const angleDir = path.join(OUTPUT_DIR, 'angles');
  const angleImages = await generateMultiAngle(productImage, ['front', '45-degree', 'side'], angleDir);
  console.log(`  ✅ ${angleImages.length}개 앵글 생성`);

  // 4. AI 카피 생성
  console.log('\n✍️ Step 4: AI 카피 생성...');
  const aiCopy = await generateCopy(
    productImage,
    '프리미엄 오버핏 코튼 티셔츠',
    '₩39,900',
    ['100% 오가닉 코튼', '오버핏 실루엣', '유니섹스', analysis.color, analysis.material]
  );
  console.log('카피:', JSON.stringify(aiCopy, null, 2));

  // 5. 영상 합성
  console.log('\n🎬 Step 5: 영상 합성...');
  const allImages = [...bgImages, ...angleImages].filter(img => img !== productImage);
  // Use at least 3 images
  const videoImages = allImages.length >= 3 ? allImages.slice(0, 5) : [productImage, ...allImages];
  
  const workDir = path.join(OUTPUT_DIR, 'work');
  await fs.mkdir(workDir, { recursive: true });

  const videoPath = await composeVideo({
    images: videoImages,
    template: 'trendy',
    aspect: ASPECT,
    productName: '프리미엄 오버핏 코튼 티셔츠',
    productPrice: '₩39,900',
    productFeatures: ['100% 오가닉 코튼', '오버핏', '유니섹스'],
    aiCopy,
    outputDir: workDir,
  });

  const finalPath = path.join(OUTPUT_DIR, 'clothes-ai-trendy.mp4');
  await fs.copyFile(videoPath, finalPath);
  const stat = await fs.stat(finalPath);
  
  console.log('\n========================================');
  console.log(`✅ AI 영상 생성 완료!`);
  console.log(`📁 ${finalPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  console.log('========================================');
}

main().catch(err => { console.error('❌ Pipeline failed:', err); process.exit(1); });
