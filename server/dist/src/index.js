"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
const logger_1 = require("./logger");
const queue_1 = require("./queue");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
// Serve generated videos from tmp dir
app.use('/output', express_1.default.static(path_1.default.join(os_1.default.tmpdir(), 'snapclip'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        }
    }
}));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Submit video generation job
app.post('/api/generate', async (req, res) => {
    try {
        const { productName, productPrice, productFeatures, images, template, aspectRatio, bgmPath, voiceEnabled, backgroundStyle } = req.body;
        if (!productName || !images?.length) {
            return res.status(400).json({ error: 'productName and images are required' });
        }
        const projectId = (0, uuid_1.v4)();
        const input = {
            projectId,
            productName,
            productPrice: productPrice || '',
            productFeatures: productFeatures || [],
            images,
            template: template || 'simple',
            aspectRatio: aspectRatio || '9:16',
            bgmPath,
            voiceEnabled: voiceEnabled || false,
            backgroundStyle: backgroundStyle || 'dark',
        };
        const job = await queue_1.videoQueue.add('generate', input, {
            jobId: projectId,
            removeOnComplete: 100,
            removeOnFail: 50,
        });
        queue_1.jobStatus.set(projectId, { status: 'pending', progress: 0, stage: 'queued' });
        logger_1.logger.info(`Job created: ${projectId}`);
        res.json({ projectId, jobId: job.id });
    }
    catch (err) {
        logger_1.logger.error('Generate error:', err);
        res.status(500).json({ error: err.message });
    }
});
// Check job status
app.get('/api/status/:id', (req, res) => {
    const entry = queue_1.jobStatus.get(req.params.id);
    if (!entry) {
        return res.status(404).json({ error: 'Job not found' });
    }
    const response = {
        projectId: req.params.id,
        status: entry.status === 'done' ? 'completed' : entry.status,
        progress: entry.progress,
        stage: entry.stage,
    };
    if (entry.status === 'done' && entry.result) {
        response.outputUrl = entry.result.videoUrl;
        response.thumbnailUrl = entry.result.thumbnailUrl;
        response.copy = entry.result.aiCopy?.headline || '';
    }
    if (entry.error) {
        response.error = entry.error;
    }
    res.json(response);
});
const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, () => {
    logger_1.logger.info(`SnapClip server running on port ${PORT}`);
    // Start worker
    try {
        (0, queue_1.startWorker)();
        logger_1.logger.info('BullMQ worker started');
    }
    catch (err) {
        logger_1.logger.warn(`Worker not started (Redis may not be available): ${err.message}`);
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map