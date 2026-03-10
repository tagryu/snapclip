"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStatus = exports.videoQueue = void 0;
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const logger_1 = require("./logger");
const pipeline_1 = require("../pipeline");
const connection = {
    host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname || 'localhost',
    port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379', 10),
    password: new URL(process.env.REDIS_URL || 'redis://localhost:6379').password || undefined,
    maxRetriesPerRequest: null,
};
exports.videoQueue = new bullmq_1.Queue('video-generation', { connection });
// In-memory job status store
exports.jobStatus = new Map();
function startWorker() {
    const worker = new bullmq_1.Worker('video-generation', async (job) => {
        const jobId = job.id;
        const data = job.data;
        logger_1.logger.info(`Processing job ${jobId}`);
        exports.jobStatus.set(jobId, { status: 'processing', progress: 0, stage: 'starting' });
        try {
            const result = await (0, pipeline_1.runPipeline)(data, (progress, stage) => {
                exports.jobStatus.set(jobId, { status: 'processing', progress, stage });
            });
            exports.jobStatus.set(jobId, { status: 'done', progress: 100, stage: 'complete', result });
            return result;
        }
        catch (err) {
            logger_1.logger.error(`Job ${jobId} failed:`, err);
            exports.jobStatus.set(jobId, { status: 'failed', progress: 0, stage: 'error', error: err.message });
            throw err;
        }
    }, { connection, concurrency: 2 });
    worker.on('completed', (job) => logger_1.logger.info(`Job ${job.id} completed`));
    worker.on('failed', (job, err) => logger_1.logger.error(`Job ${job?.id} failed: ${err.message}`));
    return worker;
}
//# sourceMappingURL=queue.js.map