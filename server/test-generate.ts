/**
 * Test script: generates 5 MP4s (one per template) into server/test-output/
 * Usage: npx tsx test-generate.ts
 */
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const TEMPLATES = ['simple', 'trendy', 'luxury', 'cute', 'dynamic', 'reels'];
const OUTPUT_DIR = path.join(__dirname, 'test-output');
const ASPECT = ASPECT_CONFIGS['9:16'];

/** Generate a dummy product image with colored gradient */
async function createDummyImage(idx: number, width: number, height: number, outputDir: string): Promise<string> {
  const colors: Array<{from: string; to: string; label: string}> = [
    { from: '#FF6B6B', to: '#4ECDC4', label: 'Product Front' },
    { from: '#A8E6CF', to: '#DCEDC1', label: 'Product Side' },
    { from: '#FFD93D', to: '#FF6B6B', label: 'Product Detail' },
  ];
  const c = colors[idx % colors.length];

  const svg = `<svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c.from}"/>
        <stop offset="100%" style="stop-color:${c.to}"/>
      </linearGradient>
      <radialGradient id="spot" cx="50%" cy="45%" r="30%">
        <stop offset="0%" style="stop-color:white;stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <ellipse cx="${width/2}" cy="${height*0.45}" rx="${width*0.2}" ry="${height*0.2}" fill="url(#spot)"/>
    <rect x="${width*0.25}" y="${height*0.3}" width="${width*0.5}" height="${height*0.35}" rx="20" fill="white" opacity="0.85"/>
    <text x="${width/2}" y="${height*0.5}" font-family="sans-serif" font-size="48" fill="#333" text-anchor="middle" font-weight="bold">${c.label}</text>
  </svg>`;

  const imgPath = path.join(outputDir, `dummy_${idx}.png`);
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(imgPath);
  return imgPath;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const tmpDir = path.join(OUTPUT_DIR, 'tmp');
  await fs.mkdir(tmpDir, { recursive: true });

  // Create 3 dummy product images
  const dummyImages: string[] = [];
  for (let i = 0; i < 3; i++) {
    dummyImages.push(await createDummyImage(i, ASPECT.width, ASPECT.height, tmpDir));
  }

  const results: string[] = [];

  for (const tmplName of TEMPLATES) {
    console.log(`\n🎬 Generating: test-${tmplName}.mp4 ...`);
    const tmplOutputDir = path.join(OUTPUT_DIR, `work_${tmplName}`);
    await fs.mkdir(tmplOutputDir, { recursive: true });

    try {
      const videoPath = await composeVideo({
        images: dummyImages,
        template: tmplName,
        aspect: ASPECT,
        productName: '프리미엄 에어팟 케이스',
        productPrice: '₩29,900',
        productFeatures: ['실리콘 소재', '무선충전 호환', '12가지 컬러'],
        aiCopy: {
          lines: [
            '✨ 감각적인 디자인의 완성',
            '💎 프리미엄 실리콘 소재',
            '🔥 한정 특가 진행중',
          ],
          hashtags: ['#에어팟케이스', '#프리미엄', '#트렌드', '#필수템', '#신상'],
        },
        outputDir: tmplOutputDir,
      });

      // Copy to final name
      const finalPath = path.join(OUTPUT_DIR, `test-${tmplName}.mp4`);
      await fs.copyFile(videoPath, finalPath);
      results.push(finalPath);
      console.log(`✅ Done: ${finalPath}`);
    } catch (err: any) {
      console.error(`❌ Failed ${tmplName}: ${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log('Generated videos:');
  for (const r of results) {
    const stat = await fs.stat(r);
    console.log(`  ${r} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log('========================================');
}

main().catch(err => { console.error(err); process.exit(1); });
