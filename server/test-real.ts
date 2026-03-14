/**
 * Test with REAL product images — 5 templates + Gemini pipeline test
 */
import path from 'path';
import fs from 'fs/promises';
import { composeVideo } from './pipeline/composer';
import { analyzeProduct, generateRealisticBackground, generateMultiAngle } from './pipeline/gemini-image';
import { ASPECT_CONFIGS } from './pipeline/types';

const TEMPLATES = ['simple', 'trendy', 'luxury', 'cute', 'dynamic'];
const OUTPUT_DIR = path.join(__dirname, 'test-output');
const IMAGE_DIR = path.join(OUTPUT_DIR, 'images');
const ASPECT = ASPECT_CONFIGS['9:16'];

async function testGeminiPipeline() {
  console.log('\n🤖 Testing Gemini Image Pipeline...\n');

  const testImage = path.join(IMAGE_DIR, 'product_0.jpg');
  try { await fs.access(testImage); } catch { console.error(`Missing: ${testImage}`); return; }

  // 1. Product Analysis
  console.log('📊 Product Analysis...');
  const analysis = await analyzeProduct(testImage);
  console.log(`   Category: ${analysis.category}`);
  console.log(`   Color: ${analysis.color}`);
  console.log(`   Material: ${analysis.material}`);
  console.log(`   Scenes: ${analysis.suggestedScenes.join(', ')}`);

  // 2. Realistic Background
  console.log('\n🖼️  Realistic Background...');
  const bgDir = path.join(OUTPUT_DIR, 'gemini-bg');
  await fs.mkdir(bgDir, { recursive: true });
  const scene = analysis.suggestedScenes[0] || 'marble table with soft lighting';
  const bgImage = await generateRealisticBackground(testImage, scene, '9:16', bgDir);
  console.log(`   Result: ${bgImage}`);

  // 3. Multi-Angle
  console.log('\n📐 Multi-Angle Generation...');
  const angleDir = path.join(OUTPUT_DIR, 'gemini-angles');
  await fs.mkdir(angleDir, { recursive: true });
  const angles = await generateMultiAngle(testImage, ['front', '45-degree', 'side'], angleDir);
  for (const a of angles) {
    console.log(`   Angle: ${a}`);
  }

  // 4. Compose video with Gemini-enhanced images
  console.log('\n🎬 Composing Gemini-enhanced video...');
  const allImages = [bgImage !== testImage ? bgImage : testImage, ...angles];
  // Ensure we have at least 3 images
  while (allImages.length < 3) allImages.push(allImages[0]);

  const tmpDir = path.join(OUTPUT_DIR, 'tmp-gemini');
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const result = await composeVideo({
      images: allImages,
      template: 'luxury',
      aspect: ASPECT,
      productName: '프리미엄 스마트워치',
      productPrice: '₩299,000',
      aiCopy: {
        lines: ['감각적인 디자인, 스마트한 일상', '초경량 티타늄 프레임', '7일 배터리 지속'],
        hashtags: ['#스마트워치', '#프리미엄', '#테크'],
      },
      productFeatures: ['초경량 티타늄', 'AMOLED 디스플레이', '7일 배터리'],
      outputDir: tmpDir,
    });

    const finalPath = path.join(OUTPUT_DIR, 'real-gemini-luxury.mp4');
    await fs.copyFile(result, finalPath);
    const stat = await fs.stat(finalPath);
    console.log(`   ✅ ${(stat.size / 1024 / 1024).toFixed(1)}MB → ${finalPath}`);
  } catch (err: any) {
    console.error(`   ❌ ${err.message}`);
  }
}

async function main() {
  // Use the real downloaded images
  const images = [
    path.join(IMAGE_DIR, 'product_0.jpg'),
    path.join(IMAGE_DIR, 'product_1.jpg'),
    path.join(IMAGE_DIR, 'product_2.jpg'),
  ];
  
  // Verify images exist
  for (const img of images) {
    try { await fs.access(img); } catch { console.error(`Missing: ${img}`); process.exit(1); }
  }

  // Test Gemini pipeline first
  await testGeminiPipeline();

  for (const tmpl of TEMPLATES) {
    console.log(`\n🎬 ${tmpl}...`);
    const tmpDir = path.join(OUTPUT_DIR, `tmp-${tmpl}`);
    await fs.mkdir(tmpDir, { recursive: true });
    
    try {
      const result = await composeVideo({
        images,
        template: tmpl,
        aspect: ASPECT,
        productName: '프리미엄 스마트워치',
        productPrice: '₩299,000',
        aiCopy: {
          lines: ['감각적인 디자인, 스마트한 일상', '초경량 티타늄 프레임', '7일 배터리 지속'],
          hashtags: ['#스마트워치', '#프리미엄', '#테크'],
        },
        productFeatures: ['초경량 티타늄', 'AMOLED 디스플레이', '7일 배터리'],
        outputDir: tmpDir,
      });
      
      const finalPath = path.join(OUTPUT_DIR, `real-${tmpl}.mp4`);
      await fs.copyFile(result, finalPath);
      const stat = await fs.stat(finalPath);
      console.log(`   ✅ ${(stat.size / 1024 / 1024).toFixed(1)}MB → ${finalPath}`);
    } catch (err: any) {
      console.error(`   ❌ ${err.message}`);
    }
  }
}

main().catch(console.error);
