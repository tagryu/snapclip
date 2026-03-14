import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const OUTPUT_DIR = path.join(__dirname, 'test-output', 'clothes-video');
const ASPECT = ASPECT_CONFIGS['9:16'];
const CLOTHES_DIR = path.join(__dirname, 'test-output', 'clothes');

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Resize clothes images to 9:16 aspect
  const srcImages = ['front.jpg', 'detail.jpg', 'side.jpg'];
  const resizedImages: string[] = [];

  for (const img of srcImages) {
    const src = path.join(CLOTHES_DIR, img);
    const dst = path.join(OUTPUT_DIR, `resized_${img.replace('.jpg', '.png')}`);
    await sharp(src)
      .resize(ASPECT.width, ASPECT.height, { fit: 'cover' })
      .png()
      .toFile(dst);
    resizedImages.push(dst);
    console.log(`✅ Resized: ${img}`);
  }

  const templates = ['trendy', 'simple', 'dynamic'];

  for (const tmpl of templates) {
    console.log(`\n🎬 Generating ${tmpl} template...`);
    const workDir = path.join(OUTPUT_DIR, `work_${tmpl}`);
    await fs.mkdir(workDir, { recursive: true });

    try {
      const videoPath = await composeVideo({
        images: resizedImages,
        template: tmpl,
        aspect: ASPECT,
        productName: '오버사이즈 코튼 티셔츠',
        productPrice: '₩39,900',
        productFeatures: ['100% 코튼', '오버핏', '유니섹스'],
        aiCopy: {
          lines: [
            '✨ 매일 입고 싶은 데일리룩',
            '💫 부드러운 코튼 100%',
            '🔥 지금 바로 SHOP NOW',
          ],
          hashtags: ['#오버핏', '#데일리룩', '#코튼티셔츠', '#유니섹스', '#신상'],
        },
        outputDir: workDir,
      });

      const finalPath = path.join(OUTPUT_DIR, `clothes-${tmpl}.mp4`);
      await fs.copyFile(videoPath, finalPath);
      const stat = await fs.stat(finalPath);
      console.log(`✅ Done: ${finalPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
    } catch (err: any) {
      console.error(`❌ Failed ${tmpl}: ${err.message}`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
