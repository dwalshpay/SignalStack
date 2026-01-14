import { metaCapiQueue, metaCapiQueueEvents, enqueueMetaCapiEvent, getQueueStats } from './meta-capi.queue.js';
import { metaCapiWorker, shutdownWorker } from './meta-capi.worker.js';
import { logger } from '../utils/logger.js';

export {
  metaCapiQueue,
  metaCapiQueueEvents,
  enqueueMetaCapiEvent,
  getQueueStats,
  metaCapiWorker,
  shutdownWorker,
};

export async function initializeQueues(): Promise<void> {
  logger.info('Initializing BullMQ queues...');

  const stats = await getQueueStats();
  logger.info({
    msg: 'Meta CAPI queue initialized',
    stats,
  });
}

export async function shutdownQueues(): Promise<void> {
  logger.info('Shutting down BullMQ queues...');

  await Promise.all([
    shutdownWorker(),
    metaCapiQueue.close(),
    metaCapiQueueEvents.close(),
  ]);

  logger.info('All queues shut down');
}
