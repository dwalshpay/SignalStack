import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createFunnelSchema, updateFunnelSchema } from '../utils/validation.js';

export const funnelRoutes = Router();

// Helper to get param as string
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param ?? '';
}

// All routes require authentication
funnelRoutes.use(jwtAuth);

// List all funnels
funnelRoutes.get('/', async (req, res, next) => {
  try {
    const funnels = await prisma.funnel.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(funnels);
  } catch (error) {
    next(error);
  }
});

// Get single funnel
funnelRoutes.get('/:id', async (req, res, next) => {
  try {
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!funnel) {
      throw new AppError(404, 'Funnel not found');
    }

    res.json(funnel);
  } catch (error) {
    next(error);
  }
});

// Create funnel
funnelRoutes.post('/', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = createFunnelSchema.parse(req.body);

    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await prisma.funnel.updateMany({
        where: { organizationId: req.user!.organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const funnel = await prisma.funnel.create({
      data: {
        organizationId: req.user!.organizationId,
        name: input.name,
        isDefault: input.isDefault ?? false,
        steps: input.steps,
      },
    });

    res.status(201).json(funnel);
  } catch (error) {
    next(error);
  }
});

// Update funnel
funnelRoutes.put('/:id', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = updateFunnelSchema.parse(req.body);

    // Verify ownership
    const existing = await prisma.funnel.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Funnel not found');
    }

    // If setting as default, unset others
    if (input.isDefault) {
      await prisma.funnel.updateMany({
        where: {
          organizationId: req.user!.organizationId,
          isDefault: true,
          id: { not: getParam(req.params.id) },
        },
        data: { isDefault: false },
      });
    }

    const funnel = await prisma.funnel.update({
      where: { id: getParam(req.params.id) },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.steps && { steps: input.steps }),
      },
    });

    res.json(funnel);
  } catch (error) {
    next(error);
  }
});

// Delete funnel
funnelRoutes.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.funnel.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Funnel not found');
    }

    if (existing.isDefault) {
      throw new AppError(400, 'Cannot delete the default funnel');
    }

    await prisma.funnel.delete({
      where: { id: getParam(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
