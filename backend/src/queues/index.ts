import { metaCapiQueue, metaCapiQueueEvents, enqueueMetaCapiEvent, getQueueStats as getMetaQueueStats } from './meta-capi.queue.js';
import { metaCapiWorker, shutdownWorker as shutdownMetaWorker } from './meta-capi.worker.js';
import { googleAdsQueue, googleAdsQueueEvents, enqueueGoogleAdsEvent, getGoogleAdsQueueStats } from './google-ads.queue.js';
import { googleAdsWorker, shutdownGoogleAdsWorker } from './google-ads.worker.js';
import { logger } from '../utils/logger.js';

export {
  // Meta CAPI
  metaCapiQueue,
  metaCapiQueueEvents,
  enqueueMetaCapiEvent,
  getMetaQueueStats,
  metaCapiWorker,
  shutdownMetaWorker,
  // Google Ads
  googleAdsQueue,
  googleAdsQueueEvents,
  enqueueGoogleAdsEvent,
  getGoogleAdsQueueStats,
  googleAdsWorker,
  shutdownGoogleAdsWorker,
};

// Backwards compatibility alias
export const getQueueStats = getMetaQueueStats;
export const shutdownWorker = shutdownMetaWorker;

export async function initializeQueues(): Promise<void> {
  logger.info('Initializing BullMQ queues...');

  const [metaStats, googleStats] = await Promise.all([
    getMetaQueueStats(),
    getGoogleAdsQueueStats(),
  ]);

  logger.info({
    msg: 'Meta CAPI queue initialized',
    stats: metaStats,
  });

  logger.info({
    msg: 'Google Ads queue initialized',
    stats: googleStats,
  });
}

export async function shutdownQueues(): Promise<void> {
  logger.info('Shutting down BullMQ queues...');

  await Promise.all([
    shutdownMetaWorker(),
    shutdownGoogleAdsWorker(),
    metaCapiQueue.close(),
    metaCapiQueueEvents.close(),
    googleAdsQueue.close(),
    googleAdsQueueEvents.close(),
  ]);

  logger.info('All queues shut down');
}
