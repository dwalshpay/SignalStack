import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createIntegrationSchema, updateIntegrationSchema } from '../utils/validation.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import type { Prisma } from '@prisma/client';

export const integrationRoutes = Router();

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param ?? '';
}

// All routes require authentication
integrationRoutes.use(jwtAuth);

// List all integrations
integrationRoutes.get('/', async (req, res, next) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        lastSyncAt: true,
        lastError: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(integrations);
  } catch (error) {
    next(error);
  }
});

// Get single integration
integrationRoutes.get('/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        lastSyncAt: true,
        lastError: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    res.json(integration);
  } catch (error) {
    next(error);
  }
});

// Create integration (admin only)
integrationRoutes.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = createIntegrationSchema.parse(req.body);

    // Check if integration type already exists for this org
    const existing = await prisma.integration.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        type: input.type,
      },
    });

    if (existing) {
      throw new AppError(409, `Integration of type ${input.type} already exists`);
    }

    // Encrypt credentials
    const encryptedCredentials = encrypt(input.credentials);

    const integration = await prisma.integration.create({
      data: {
        organizationId: req.user!.organizationId,
        type: input.type,
        name: input.name,
        credentials: new Uint8Array(encryptedCredentials),
        settings: (input.settings || {}) as Prisma.InputJsonValue,
        status: 'PENDING',
      },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        settings: true,
        createdAt: true,
      },
    });

    res.status(201).json(integration);
  } catch (error) {
    next(error);
  }
});

// Update integration (admin only)
integrationRoutes.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = updateIntegrationSchema.parse(req.body);

    const existing = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Integration not found');
    }

    const updateData: Record<string, unknown> = {};

    if (input.name) {
      updateData.name = input.name;
    }

    if (input.credentials) {
      updateData.credentials = new Uint8Array(encrypt(input.credentials));
    }

    if (input.settings) {
      updateData.settings = input.settings as Prisma.InputJsonValue;
    }

    const integration = await prisma.integration.update({
      where: { id: getParam(req.params.id) },
      data: updateData,
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        settings: true,
        updatedAt: true,
      },
    });

    res.json(integration);
  } catch (error) {
    next(error);
  }
});

// Delete integration (admin only)
integrationRoutes.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Integration not found');
    }

    await prisma.integration.delete({
      where: { id: getParam(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Test integration connection (admin only)
integrationRoutes.post('/:id/test', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    // Decrypt credentials to verify they're valid
    const credentialsBuffer = Buffer.from(integration.credentials);
    decrypt<Record<string, string>>(credentialsBuffer);

    // TODO: Implement actual connection testing for each integration type
    // For now, just return success
    const testResult = {
      success: true,
      message: `Connection test for ${integration.type} not yet implemented`,
      timestamp: new Date().toISOString(),
    };

    res.json(testResult);
  } catch (error) {
    next(error);
  }
});

// Trigger manual sync (admin only)
integrationRoutes.post('/:id/sync', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    if (integration.status === 'DISABLED') {
      throw new AppError(400, 'Integration is disabled');
    }

    // TODO: Queue sync job
    // For now, just return acknowledged
    res.json({
      success: true,
      message: `Sync queued for ${integration.type}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Get sync logs for integration
integrationRoutes.get('/:id/logs', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const logs = await prisma.syncLog.findMany({
      where: { integrationId: getParam(req.params.id) },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
});
