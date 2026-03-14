import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import { generateShorts } from './pipeline/shorts-pipeline';

async function main() {
  console.log('🎬 SnapClip Shorts Pipeline 테스트\n');

  const result = await generateShorts({
    productImagePath: '/Users/tag/.openclaw/media/inbound/d8e96b12-2d02-47d9-9cc9-8d97f5f989ac.png',
    productName: '케이블 니트 스웨터',
    productPrice: '₩49,900',
    productFeatures: ['케이블 니트', '오버핏', '남녀공용'],
    outputDir: path.join(__dirname, 'test-output', 'shorts-auto'),
    onProgress: (pct, stage) => {
      console.log(`  [${pct}%] ${stage}`);
    },
  });

  console.log('\n✅ 결과:');
  console.log(`  영상: ${result.videoPath}`);
  console.log(`  장면 이미지: ${result.sceneImages.length}장`);
  console.log(`  영상 클립: ${result.clips.length}개`);
  console.log(`  길이: ${result.durationSec}초`);
  console.log(`  AI 카피: ${result.aiCopy.lines.join(' | ')}`);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
