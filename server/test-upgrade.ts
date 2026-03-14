import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import fs from 'fs/promises';
import { composeVideo } from './pipeline/composer';
import { ASPECT_CONFIGS } from './pipeline/types';

const BASE = path.join(__dirname, 'test-output', 'sweater-pipeline');
const ASPECT = ASPECT_CONFIGS['9:16'];

async function main() {
  const images = [
    path.join(BASE, 'backgrounds', 'realistic_bg_1773293805386.png'),
    path.join(BASE, 'backgrounds', 'realistic_bg_1773293817202.png'),
    path.join(BASE, 'angles', 'angle_front_1773293830032.png'),
    path.join(BASE, 'angles', 'angle_45-degree_1773293842926.png'),
    path.join(BASE, 'angles', 'angle_side_1773293856780.png'),
  ];

  const aiCopy = {
    lines: ['이 가격에 이 퀄리티?', '부드러운 울 블렌드', '특별한 혜택 지금만'],
    hashtags: ['#니트', '#겨울코디', '#데일리룩'],
    cta: '지금 바로 구매하세요!',
  };

  for (const tmpl of ['trendy', 'dynamic']) {
    console.log(`\n🎬 ${tmpl} 템플릿 테스트...`);
    const workDir = path.join(BASE, `upgrade_${tmpl}`);
    await fs.mkdir(workDir, { recursive: true });

    const videoPath = await composeVideo({
      images,
      template: tmpl,
      aspect: ASPECT,
      productName: '울 블렌드 크루넥 니트',
      productPrice: '₩59,900',
      productFeatures: ['울 블렌드 소재', '오버핏 실루엣', '4계절 착용'],
      aiCopy,
      outputDir: workDir,
    });

    const finalPath = path.join(BASE, `upgrade-${tmpl}.mp4`);
    await fs.copyFile(videoPath, finalPath);
    const stat = await fs.stat(finalPath);
    console.log(`✅ ${finalPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  }

  console.log('\n🎉 고도화 테스트 완료!');
}

main().catch(err => { console.error('❌', err); process.exit(1); });
