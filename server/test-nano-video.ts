import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import fs from 'fs/promises';
import sharp from 'sharp';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const REALISTIC_DIR = path.join(__dirname, 'test-output/sweater-pipeline/realistic');
const OUTPUT_DIR = path.join(__dirname, 'test-output/sweater-pipeline/nano-video');
const ASPECT = ASPECT_CONFIGS['9:16'];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Nano Banana Pro로 생성한 이미지들
  const imageFiles = [
    'nano-street-male.png',    // 착용샷 거리
    'nano-lookbook-1.png',     // 룩북
    'nano-detail-1.png',       // 디테일
    'nano-cafe-female.png',    // 카페 여성
    'nano-flatlay-1.png',      // 플랫레이
  ];

  // Resize all to 9:16
  const resizedImages: string[] = [];
  for (const f of imageFiles) {
    const src = path.join(REALISTIC_DIR, f);
    const dst = path.join(OUTPUT_DIR, `resized_${f}`);
    try {
      await sharp(src).resize(ASPECT.width, ASPECT.height, { fit: 'cover' }).png().toFile(dst);
      resizedImages.push(dst);
      console.log(`✅ Resized: ${f}`);
    } catch (e: any) {
      console.log(`⚠️ Skip: ${f} - ${e.message}`);
    }
  }

  // Generate video with trendy template
  for (const tmpl of ['trendy', 'dynamic']) {
    console.log(`\n🎬 Generating ${tmpl} video...`);
    const workDir = path.join(OUTPUT_DIR, `work_${tmpl}`);
    await fs.mkdir(workDir, { recursive: true });

    const videoPath = await composeVideo({
      images: resizedImages,
      template: tmpl,
      aspect: ASPECT,
      productName: '울 블렌드 크루넥 니트',
      productPrice: '₩59,900',
      productFeatures: ['울 블렌드', '크루넥', '오버핏'],
      aiCopy: {
        lines: ['가을의 완성, 포근한 니트', '프리미엄 울 블렌드', '지금 바로 SHOP'],
        hashtags: ['#니트', '#가을코디', '#데일리룩', '#울니트', '#오버핏'],
      },
      outputDir: workDir,
    });

    const finalPath = path.join(OUTPUT_DIR, `nano-sweater-${tmpl}.mp4`);
    await fs.copyFile(videoPath, finalPath);
    const stat = await fs.stat(finalPath);
    console.log(`✅ ${finalPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  }

  console.log('\n🎉 Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
