import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import type { GoogleAdsJobData } from '../types/google-ads.types.js';

export const QUEUE_NAME = 'google-ads';

const queueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 2000, // Slightly longer initial delay for Google Ads
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

export const googleAdsQueue = new Queue<GoogleAdsJobData>(QUEUE_NAME, queueOptions);

export const googleAdsQueueEvents = new QueueEvents(QUEUE_NAME, { connection: redis });

googleAdsQueueEvents.on('completed', ({ jobId }) => {
  logger.debug({ msg: 'Google Ads job completed', jobId });
});

googleAdsQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ msg: 'Google Ads job failed', jobId, reason: failedReason });
});

googleAdsQueueEvents.on('retries-exhausted', ({ jobId }) => {
  logger.error({ msg: 'Google Ads job retries exhausted', jobId });
});

export async function enqueueGoogleAdsEvent(data: GoogleAdsJobData): Promise<string> {
  const job = await googleAdsQueue.add('upload-conversion', data, {
    jobId: `google-${data.conversionEventId}`,
  });

  logger.info({
    msg: 'Google Ads event enqueued',
    jobId: job.id,
    eventId: data.event.id,
    conversionEventId: data.conversionEventId,
    hasGclid: !!data.userData.gclid,
  });

  return job.id!;
}

export async function getGoogleAdsQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    googleAdsQueue.getWaitingCount(),
    googleAdsQueue.getActiveCount(),
    googleAdsQueue.getCompletedCount(),
    googleAdsQueue.getFailedCount(),
    googleAdsQueue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}
