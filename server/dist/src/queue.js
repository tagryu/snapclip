"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoQueue = exports.jobStatus = void 0;
exports.startWorker = startWorker;
const logger_1 = require("./logger");
const pipeline_1 = require("../pipeline");
// In-memory job status store
exports.jobStatus = new Map();
// In-memory queue (no Redis needed)
exports.videoQueue = {
    async add(_name, data, opts) {
        const jobId = opts?.jobId || data.projectId;
        // Process immediately in background
        setImmediate(() => processJob(jobId, data));
        return { id: jobId };
    },
};
async function processJob(jobId, data) {
    logger_1.logger.info(`Processing job ${jobId} (in-memory mode)`);
    exports.jobStatus.set(jobId, { status: 'processing', progress: 0, stage: 'starting' });
    try {
        const result = await (0, pipeline_1.runPipeline)(data, (progress, stage) => {
            exports.jobStatus.set(jobId, { status: 'processing', progress, stage });
        });
        exports.jobStatus.set(jobId, { status: 'done', progress: 100, stage: 'complete', result });
        logger_1.logger.info(`Job ${jobId} completed`);
    }
    catch (err) {
        logger_1.logger.error(`Job ${jobId} failed:`, err);
        exports.jobStatus.set(jobId, { status: 'failed', progress: 0, stage: 'error', error: err.message });
    }
}
function startWorker() {
    logger_1.logger.info('In-memory worker ready (no Redis required)');
}
//# sourceMappingURL=queue.js.map