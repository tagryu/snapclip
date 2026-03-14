import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { videoQueue, jobStatus, startWorker } from './queue';
import type { PipelineInput } from '../pipeline/types';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve generated videos from tmp dir
app.use('/output', express.static(path.join(os.tmpdir(), 'snapclip'), {
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
    const {
      productName, productPrice, productFeatures,
      images, template, aspectRatio,
      bgmPath, voiceEnabled, backgroundStyle
    } = req.body;

    if (!productName || !images?.length) {
      return res.status(400).json({ error: 'productName and images are required' });
    }

    const projectId = uuidv4();
    const input: PipelineInput = {
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

    const job = await videoQueue.add('generate', input, {
      jobId: projectId,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    jobStatus.set(projectId, { status: 'pending', progress: 0, stage: 'queued' });
    logger.info(`Job created: ${projectId}`);

    res.json({ projectId, jobId: job.id });
  } catch (err: any) {
    logger.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Check job status
app.get('/api/status/:id', (req, res) => {
  const entry = jobStatus.get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const response: Record<string, unknown> = {
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
  logger.info(`SnapClip server running on port ${PORT}`);

  // Start worker
  try {
    startWorker();
    logger.info('BullMQ worker started');
  } catch (err: any) {
    logger.warn(`Worker not started (Redis may not be available): ${err.message}`);
  }
});

export default app;
