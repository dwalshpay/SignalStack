import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { logger, logError } from '../utils/logger.js';
import {
  buildConversion,
  uploadToGoogleAds,
  hasMinimumData,
} from '../services/google-ads.service.js';
import { getGoogleAdsIntegration, updateIntegrationStatus } from '../services/integration.service.js';
import { QUEUE_NAME } from './google-ads.queue.js';
import type { GoogleAdsJobData } from '../types/google-ads.types.js';

const CONCURRENCY = 5;

async function processGoogleAdsJob(job: Job<GoogleAdsJobData>): Promise<void> {
  const { data } = job;

  logger.info({
    msg: 'Processing Google Ads job',
    jobId: job.id,
    conversionEventId: data.conversionEventId,
    eventName: data.event.name,
    hasGclid: !!data.userData.gclid,
    attempt: job.attemptsMade + 1,
  });

  if (!hasMinimumData(data.userData)) {
    logger.warn({
      msg: 'Skipping Google Ads event - no GCLID or enhanced conversion data',
      conversionEventId: data.conversionEventId,
    });

    await updateConversionEventStatus(data.conversionEventId, {
      skipped: true,
      reason: 'No GCLID or enhanced conversion identifiers',
    });

    return;
  }

  const integration = await getGoogleAdsIntegration(data.organizationId);

  if (!integration) {
    logger.warn({
      msg: 'Google Ads integration not found or inactive',
      organizationId: data.organizationId,
    });

    await updateConversionEventStatus(data.conversionEventId, {
      skipped: true,
      reason: 'Integration not configured',
    });

    return;
  }

  // Get conversion action ID from settings or credentials
  const conversionActionId = getConversionActionId(integration.settings, integration.credentials.conversionActionId, data.event.name);

  if (!conversionActionId) {
    logger.warn({
      msg: 'No conversion action ID configured for event',
      eventName: data.event.name,
      conversionEventId: data.conversionEventId,
    });

    await updateConversionEventStatus(data.conversionEventId, {
      skipped: true,
      reason: 'No conversion action ID configured',
    });

    return;
  }

  const conversion = buildConversion(data, integration.credentials.customerId, conversionActionId);

  logger.debug({
    msg: 'Google Ads conversion payload built',
    hasGclid: !!conversion.gclid,
    hasEnhancedConversions: !!conversion.userIdentifiers?.length,
    conversionAction: conversion.conversionAction,
  });

  const result = await uploadToGoogleAds(integration.credentials, [conversion]);

  if (!result.success) {
    if (!result.isRetryable) {
      logger.error({
        msg: 'Google Ads non-retryable error',
        errorCode: result.errorCode,
        error: result.error,
        conversionEventId: data.conversionEventId,
      });

      await updateConversionEventStatus(data.conversionEventId, {
        failed: true,
        error: result.error,
        errorCode: result.errorCode,
      });

      // Update integration status on auth errors
      if (result.errorCode === 'UNAUTHORIZED' || result.errorCode === 'PERMISSION_DENIED') {
        await updateIntegrationStatus(integration.id, 'ERROR', result.error);
      }

      return;
    }

    throw new Error(`Google Ads error: ${result.error}`);
  }

  await updateConversionEventStatus(data.conversionEventId, {
    sent: true,
    conversionsUploaded: result.conversionsUploaded,
  });

  logger.info({
    msg: 'Google Ads conversion uploaded successfully',
    conversionEventId: data.conversionEventId,
    conversionsUploaded: result.conversionsUploaded,
  });
}

function getConversionActionId(
  settings: Record<string, unknown>,
  defaultActionId: string | undefined,
  eventName: string
): string | undefined {
  // Check for event-specific mapping in settings
  const conversionActions = settings.conversionActions as Record<string, string> | undefined;
  if (conversionActions?.[eventName]) {
    return conversionActions[eventName];
  }

  // Fall back to default conversion action ID
  return defaultActionId;
}

async function updateConversionEventStatus(
  conversionEventId: string,
  status: {
    sent?: boolean;
    skipped?: boolean;
    failed?: boolean;
    conversionsUploaded?: number;
    error?: string;
    errorCode?: string;
    reason?: string;
  }
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {};

    if (status.sent) {
      updateData.googleSentAt = new Date();
      updateData.googleStatus = 'SUCCESS';
    } else if (status.failed) {
      updateData.googleStatus = `ERROR:${status.errorCode || 'UNKNOWN'}:${status.error?.substring(0, 100)}`;
    } else if (status.skipped) {
      updateData.googleStatus = `SKIPPED:${status.reason}`;
    }

    await prisma.conversionEvent.update({
      where: { id: conversionEventId },
      data: updateData,
    });
  } catch (error) {
    logError('Failed to update conversion event status', error);
  }
}

export const googleAdsWorker = new Worker<GoogleAdsJobData>(
  QUEUE_NAME,
  processGoogleAdsJob,
  {
    connection: redis,
    concurrency: CONCURRENCY,
  }
);

googleAdsWorker.on('completed', (job) => {
  logger.debug({ msg: 'Google Ads worker completed job', jobId: job.id });
});

googleAdsWorker.on('failed', (job, error) => {
  logger.error({
    msg: 'Google Ads worker job failed',
    jobId: job?.id,
    error: error.message,
    attempt: job?.attemptsMade,
  });
});

googleAdsWorker.on('error', (error) => {
  logError('Google Ads worker error', error);
});

export async function shutdownGoogleAdsWorker(): Promise<void> {
  logger.info('Shutting down Google Ads worker...');
  await googleAdsWorker.close();
  logger.info('Google Ads worker shut down');
}
