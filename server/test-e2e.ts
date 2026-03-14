/**
 * SnapClip E2E Test — generates a 15-second product video without Redis/Gemini/R2.
 *
 * Usage: npx tsx test-e2e.ts
 */
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import https from 'https';
import { URL } from 'url';
import { runPipeline } from './pipeline';
import type { PipelineInput } from './pipeline/types';

const OUTPUT_DIR = path.join(__dirname, 'test-output');

async function downloadImage(url: string, dest: string): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  return new Promise((resolve, reject) => {
    const follow = (u: string) => {
      https.get(u, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', async () => {
          await fs.writeFile(dest, Buffer.concat(chunks));
          resolve();
        });
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function createTestImage(dest: string, color: string, label: string): Promise<void> {
  // Create a simple test image with sharp
  const sharp = (await import('sharp')).default;
  const svg = `<svg width="800" height="800">
    <rect width="800" height="800" fill="${color}"/>
    <text x="400" y="400" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(dest);
}

async function main() {
  console.log('🎬 SnapClip E2E Test Starting...\n');

  // Prepare test images
  const imgDir = path.join(OUTPUT_DIR, 'images');
  await fs.mkdir(imgDir, { recursive: true });

  const images: string[] = [];

  // Try downloading from Unsplash, fallback to generated images
  const unsplashUrls = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',  // watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',  // headphones
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',  // camera
  ];

  for (let i = 0; i < 3; i++) {
    const imgPath = path.join(imgDir, `product_${i}.jpg`);
    try {
      console.log(`📥 Downloading image ${i + 1}/3...`);
      await downloadImage(unsplashUrls[i], imgPath);
      images.push(imgPath);
      console.log(`   ✅ Downloaded`);
    } catch (err: any) {
      console.log(`   ⚠️  Download failed, creating test image: ${err.message}`);
      const pngPath = path.join(imgDir, `product_${i}.png`);
      const colors = ['#e74c3c', '#3498db', '#2ecc71'];
      const labels = ['Product A', 'Product B', 'Product C'];
      await createTestImage(pngPath, colors[i], labels[i]);
      images.push(pngPath);
    }
  }

  console.log(`\n📸 ${images.length} images ready\n`);

  // Pipeline input
  const input: PipelineInput = {
    projectId: `e2e-test-${Date.now()}`,
    productName: '프리미엄 스마트워치',
    productPrice: '₩299,000',
    productFeatures: ['방수 IP68', 'AMOLED 디스플레이', '7일 배터리'],
    images,
    template: 'simple',
    aspectRatio: '9:16',
    voiceEnabled: false,
    backgroundStyle: 'dark',
  };

  console.log('🚀 Running pipeline...\n');

  const startTime = Date.now();
  const result = await runPipeline(input, (progress, stage) => {
    console.log(`   [${progress}%] ${stage}`);
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Pipeline completed in ${elapsed}s`);
  console.log(`📹 Video: ${result.videoUrl}`);
  console.log(`🖼️  Thumbnail: ${result.thumbnailUrl}`);
  console.log(`📝 Copy: ${result.aiCopy.lines.join(' | ')}`);
  console.log(`#️⃣  Tags: ${result.aiCopy.hashtags.join(' ')}`);

  // Resolve the actual file path (URL → local path, or keep as-is)
  let videoFile = result.videoUrl;
  if (videoFile.startsWith('http://localhost')) {
    // Extract relative path from URL: http://localhost:4000/output/xxx → tmpdir/snapclip/xxx
    const urlPath = new URL(videoFile).pathname.replace('/output/', '');
    videoFile = path.join(os.tmpdir(), 'snapclip', urlPath);
  }

  // Verify output
  const stat = await fs.stat(videoFile);
  console.log(`📊 File size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

  // Check duration with ffprobe
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoFile}"`
    );
    const duration = parseFloat(stdout.trim());
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    if (duration >= 12) {
      console.log('\n🎉 E2E TEST PASSED!');
    } else {
      console.log(`\n⚠️  Duration shorter than expected (${duration.toFixed(1)}s)`);
    }
  } catch {
    console.log('⏱️  Could not verify duration (ffprobe not available)');
  }

  // Copy output to a known location
  const finalOutput = path.join(OUTPUT_DIR, 'e2e-result.mp4');
  await fs.copyFile(videoFile, finalOutput);
  console.log(`\n📁 Final output: ${finalOutput}`);
}

main().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
