import { logger } from './logger';
import { runPipeline } from '../pipeline';
import type { PipelineInput } from '../pipeline/types';

// In-memory job status store
export const jobStatus = new Map<string, {
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress: number;
  stage: string;
  result?: any;
  error?: string;
}>();

// In-memory queue (no Redis needed)
export const videoQueue = {
  async add(_name: string, data: PipelineInput, opts?: { jobId?: string; [key: string]: any }) {
    const jobId = opts?.jobId || data.projectId;
    // Process immediately in background
    setImmediate(() => processJob(jobId, data));
    return { id: jobId };
  },
};

async function processJob(jobId: string, data: PipelineInput) {
  logger.info(`Processing job ${jobId} (in-memory mode)`);
  jobStatus.set(jobId, { status: 'processing', progress: 0, stage: 'starting' });

  try {
    const result = await runPipeline(data, (progress, stage) => {
      jobStatus.set(jobId, { status: 'processing', progress, stage });
    });
    jobStatus.set(jobId, { status: 'done', progress: 100, stage: 'complete', result });
    logger.info(`Job ${jobId} completed`);
  } catch (err: any) {
    logger.error(`Job ${jobId} failed:`, err);
    jobStatus.set(jobId, { status: 'failed', progress: 0, stage: 'error', error: err.message });
  }
}

export function startWorker() {
  logger.info('In-memory worker ready (no Redis required)');
}
