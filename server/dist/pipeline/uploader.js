"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.uploadVideo = uploadVideo;
exports.uploadThumbnail = uploadThumbnail;
const client_s3_1 = require("@aws-sdk/client-s3");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../src/logger");
const s3 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});
const BUCKET = process.env.R2_BUCKET_NAME || 'snapclip';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
async function uploadFile(filePath, key) {
    logger_1.logger.info(`Uploading ${filePath} → ${key}`);
    const body = await promises_1.default.readFile(filePath);
    const ext = path_1.default.extname(filePath).toLowerCase();
    const contentType = ext === '.mp4' ? 'video/mp4'
        : ext === '.png' ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                : ext === '.mp3' ? 'audio/mpeg'
                    : 'application/octet-stream';
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
    }));
    const url = `${PUBLIC_URL}/${key}`;
    logger_1.logger.info(`Uploaded: ${url}`);
    return url;
}
async function uploadVideo(filePath, projectId) {
    const key = `videos/${projectId}/${path_1.default.basename(filePath)}`;
    return uploadFile(filePath, key);
}
async function uploadThumbnail(filePath, projectId) {
    const key = `thumbnails/${projectId}/${path_1.default.basename(filePath)}`;
    return uploadFile(filePath, key);
}
//# sourceMappingURL=uploader.js.map