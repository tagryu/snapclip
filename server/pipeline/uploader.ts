import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../src/logger';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'snapclip';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export async function uploadFile(filePath: string, key: string): Promise<string> {
  logger.info(`Uploading ${filePath} → ${key}`);

  const body = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.mp4' ? 'video/mp4'
    : ext === '.png' ? 'image/png'
    : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
    : ext === '.mp3' ? 'audio/mpeg'
    : 'application/octet-stream';

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  const url = `${PUBLIC_URL}/${key}`;
  logger.info(`Uploaded: ${url}`);
  return url;
}

export async function uploadVideo(filePath: string, projectId: string): Promise<string> {
  const key = `videos/${projectId}/${path.basename(filePath)}`;
  return uploadFile(filePath, key);
}

export async function uploadThumbnail(filePath: string, projectId: string): Promise<string> {
  const key = `thumbnails/${projectId}/${path.basename(filePath)}`;
  return uploadFile(filePath, key);
}
