import { Queue, Worker, Job } from 'bullmq';
import { logger } from './logger';
import { runPipeline } from '../pipeline';
import type { PipelineInput } from '../pipeline/types';

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname || 'localhost',
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379', 10),
  password: new URL(process.env.REDIS_URL || 'redis://localhost:6379').password || undefined,
  maxRetriesPerRequest: null as null,
};

export const videoQueue = new Queue('video-generation', { connection });

// In-memory job status store
export const jobStatus = new Map<string, {
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress: number;
  stage: string;
  result?: any;
  error?: string;
}>();

export function startWorker() {
  const worker = new Worker(
    'video-generation',
    async (job: Job) => {
      const jobId = job.id!;
      const data = job.data as PipelineInput;
      logger.info(`Processing job ${jobId}`);
      jobStatus.set(jobId, { status: 'processing', progress: 0, stage: 'starting' });

      try {
        const result = await runPipeline(data, (progress, stage) => {
          jobStatus.set(jobId, { status: 'processing', progress, stage });
        });
        jobStatus.set(jobId, { status: 'done', progress: 100, stage: 'complete', result });
        return result;
      } catch (err: any) {
        logger.error(`Job ${jobId} failed:`, err);
        jobStatus.set(jobId, { status: 'failed', progress: 0, stage: 'error', error: err.message });
        throw err;
      }
    },
    { connection, concurrency: 2 }
  );

  worker.on('completed', (job) => logger.info(`Job ${job.id} completed`));
  worker.on('failed', (job, err) => logger.error(`Job ${job?.id} failed: ${err.message}`));

  return worker;
}
