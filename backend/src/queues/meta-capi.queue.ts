import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import type { MetaCapiJobData } from '../types/meta-capi.types.js';

export const QUEUE_NAME = 'meta-capi';

const queueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
    },
  },
};

export const metaCapiQueue = new Queue<MetaCapiJobData>(QUEUE_NAME, queueOptions);

export const metaCapiQueueEvents = new QueueEvents(QUEUE_NAME, { connection: redis });

metaCapiQueueEvents.on('completed', ({ jobId }) => {
  logger.debug({ msg: 'Meta CAPI job completed', jobId });
});

metaCapiQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ msg: 'Meta CAPI job failed', jobId, reason: failedReason });
});

metaCapiQueueEvents.on('retries-exhausted', ({ jobId }) => {
  logger.error({ msg: 'Meta CAPI job retries exhausted', jobId });
});

export async function enqueueMetaCapiEvent(data: MetaCapiJobData): Promise<string> {
  const job = await metaCapiQueue.add('send-event', data, {
    jobId: `meta-${data.conversionEventId}`,
  });

  logger.info({
    msg: 'Meta CAPI event enqueued',
    jobId: job.id,
    eventId: data.event.id,
    conversionEventId: data.conversionEventId,
  });

  return job.id!;
}

export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    metaCapiQueue.getWaitingCount(),
    metaCapiQueue.getActiveCount(),
    metaCapiQueue.getCompletedCount(),
    metaCapiQueue.getFailedCount(),
    metaCapiQueue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}
