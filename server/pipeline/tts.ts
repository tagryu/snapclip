import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../src/logger';

const execAsync = promisify(exec);

export async function generateTTS(
  text: string,
  outputDir: string,
  voice: string = 'ko-KR-SunHiNeural'
): Promise<string> {
  logger.info(`Generating TTS: "${text.substring(0, 50)}..."`);

  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `tts_${Date.now()}.mp3`);

  // edge-tts CLI
  const escapedText = text.replace(/"/g, '\\"');
  const cmd = `edge-tts --voice "${voice}" --text "${escapedText}" --write-media "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 30000 });
    logger.info(`TTS generated: ${outputPath}`);
    return outputPath;
  } catch (err: any) {
    logger.error(`TTS failed: ${err.message}`);
    throw new Error(`TTS generation failed: ${err.message}`);
  }
}

export async function generateNarration(
  productName: string,
  copyLines: string[],
  outputDir: string
): Promise<string> {
  const script = `${productName}. ${copyLines.join('. ')}`;
  return generateTTS(script, outputDir);
}
