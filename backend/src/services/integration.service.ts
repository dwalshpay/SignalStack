import { prisma } from '../config/database.js';
import { decrypt } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';
import type { IntegrationType, IntegrationStatus } from '@prisma/client';
import type { MetaCapiCredentials } from '../types/meta-capi.types.js';

export interface IntegrationWithCredentials<T> {
  id: string;
  type: IntegrationType;
  status: IntegrationStatus;
  credentials: T;
  settings: Record<string, unknown>;
}

export async function getActiveIntegration<T>(
  organizationId: string,
  type: IntegrationType
): Promise<IntegrationWithCredentials<T> | null> {
  const integration = await prisma.integration.findFirst({
    where: {
      organizationId,
      type,
      status: 'ACTIVE',
    },
  });

  if (!integration) {
    return null;
  }

  try {
    const credentialsBuffer = Buffer.from(integration.credentials);
    const credentials = decrypt<T>(credentialsBuffer);

    return {
      id: integration.id,
      type: integration.type,
      status: integration.status,
      credentials,
      settings: integration.settings as Record<string, unknown>,
    };
  } catch (error) {
    logger.error({
      msg: 'Failed to decrypt integration credentials',
      integrationId: integration.id,
      type,
    });
    return null;
  }
}

export async function getMetaCapiIntegration(
  organizationId: string
): Promise<IntegrationWithCredentials<MetaCapiCredentials> | null> {
  return getActiveIntegration<MetaCapiCredentials>(organizationId, 'META_CAPI');
}

export async function updateIntegrationStatus(
  integrationId: string,
  status: IntegrationStatus,
  error?: string
): Promise<void> {
  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      status,
      lastSyncAt: new Date(),
      lastError: error || null,
    },
  });
}

export async function createSyncLog(
  integrationId: string,
  status: 'RUNNING' | 'COMPLETED' | 'FAILED',
  options?: {
    recordsProcessed?: number;
    recordsFailed?: number;
    error?: string;
    metadata?: object;
    completedAt?: Date;
  }
): Promise<string> {
  const log = await prisma.syncLog.create({
    data: {
      integrationId,
      status,
      startedAt: new Date(),
      recordsProcessed: options?.recordsProcessed ?? 0,
      recordsFailed: options?.recordsFailed ?? 0,
      error: options?.error,
      metadata: options?.metadata ?? undefined,
      completedAt: options?.completedAt,
    },
  });

  return log.id;
}
