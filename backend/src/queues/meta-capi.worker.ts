import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { logger, logError } from '../utils/logger.js';
import {
  buildEventPayload,
  sendToMetaCapi,
  hasMinimumUserData,
  estimateEmqScore,
} from '../services/meta-capi.service.js';
import { getMetaCapiIntegration, updateIntegrationStatus } from '../services/integration.service.js';
import { QUEUE_NAME } from './meta-capi.queue.js';
import type { MetaCapiJobData } from '../types/meta-capi.types.js';

const CONCURRENCY = 5;

async function processMetaCapiJob(job: Job<MetaCapiJobData>): Promise<void> {
  const { data } = job;

  logger.info({
    msg: 'Processing Meta CAPI job',
    jobId: job.id,
    conversionEventId: data.conversionEventId,
    eventName: data.event.name,
    attempt: job.attemptsMade + 1,
  });

  if (!hasMinimumUserData(data.userData)) {
    logger.warn({
      msg: 'Skipping Meta CAPI event - insufficient user data',
      conversionEventId: data.conversionEventId,
    });

    await updateConversionEventStatus(data.conversionEventId, {
      skipped: true,
      reason: 'Insufficient user data for Meta CAPI',
    });

    return;
  }

  const integration = await getMetaCapiIntegration(data.organizationId);

  if (!integration) {
    logger.warn({
      msg: 'Meta CAPI integration not found or inactive',
      organizationId: data.organizationId,
    });

    await updateConversionEventStatus(data.conversionEventId, {
      skipped: true,
      reason: 'Integration not configured',
    });

    return;
  }

  const payload = buildEventPayload(data, integration.credentials.testEventCode);

  const estimatedEmq = estimateEmqScore(payload.data[0].user_data);
  logger.debug({
    msg: 'Meta CAPI payload built',
    estimatedEmq,
    hasEmail: !!data.userData.emailHash,
    hasPhone: !!data.userData.phoneHash,
    hasFbc: !!data.userData.fbc,
    hasFbp: !!data.userData.fbp,
  });

  const result = await sendToMetaCapi(integration.credentials, payload);

  if (!result.success) {
    if (!result.isRetryable) {
      logger.error({
        msg: 'Meta CAPI non-retryable error',
        errorCode: result.errorCode,
        error: result.error,
        conversionEventId: data.conversionEventId,
      });

      await updateConversionEventStatus(data.conversionEventId, {
        failed: true,
        error: result.error,
        errorCode: result.errorCode,
      });

      if (result.errorCode === 190) {
        await updateIntegrationStatus(integration.id, 'ERROR', result.error);
      }

      return;
    }

    throw new Error(`Meta CAPI error: ${result.error}`);
  }

  await updateConversionEventStatus(data.conversionEventId, {
    sent: true,
    fbTraceId: result.fbTraceId,
    eventsReceived: result.eventsReceived,
  });

  logger.info({
    msg: 'Meta CAPI event processed successfully',
    conversionEventId: data.conversionEventId,
    fbTraceId: result.fbTraceId,
    eventsReceived: result.eventsReceived,
  });
}

async function updateConversionEventStatus(
  conversionEventId: string,
  status: {
    sent?: boolean;
    skipped?: boolean;
    failed?: boolean;
    fbTraceId?: string;
    eventsReceived?: number;
    error?: string;
    errorCode?: number;
    reason?: string;
  }
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {};

    if (status.sent) {
      updateData.metaSentAt = new Date();
      updateData.metaEventId = status.fbTraceId;
    } else if (status.failed || status.skipped) {
      updateData.metaEventId = status.failed
        ? `ERROR:${status.errorCode || 'UNKNOWN'}:${status.error?.substring(0, 100)}`
        : `SKIPPED:${status.reason}`;
    }

    await prisma.conversionEvent.update({
      where: { id: conversionEventId },
      data: updateData,
    });
  } catch (error) {
    logError('Failed to update conversion event status', error);
  }
}

export const metaCapiWorker = new Worker<MetaCapiJobData>(
  QUEUE_NAME,
  processMetaCapiJob,
  {
    connection: redis,
    concurrency: CONCURRENCY,
  }
);

metaCapiWorker.on('completed', (job) => {
  logger.debug({ msg: 'Worker completed job', jobId: job.id });
});

metaCapiWorker.on('failed', (job, error) => {
  logger.error({
    msg: 'Worker job failed',
    jobId: job?.id,
    error: error.message,
    attempt: job?.attemptsMade,
  });
});

metaCapiWorker.on('error', (error) => {
  logError('Worker error', error);
});

export async function shutdownWorker(): Promise<void> {
  logger.info('Shutting down Meta CAPI worker...');
  await metaCapiWorker.close();
  logger.info('Meta CAPI worker shut down');
}
