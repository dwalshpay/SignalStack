import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createSegmentSchema, updateSegmentSchema } from '../utils/validation.js';
import { toNumber } from '../types/index.js';

export const segmentRoutes = Router();

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param ?? '';
}

// All routes require authentication
segmentRoutes.use(jwtAuth);

// List all segments
segmentRoutes.get('/', async (req, res, next) => {
  try {
    const segments = await prisma.audienceSegment.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(
      segments.map((s) => ({
        id: s.id,
        name: s.name,
        multiplier: toNumber(s.multiplier),
        identificationType: s.identificationType,
        identificationCondition: s.identificationCondition,
        isActive: s.isActive,
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Get single segment
segmentRoutes.get('/:id', async (req, res, next) => {
  try {
    const segment = await prisma.audienceSegment.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!segment) {
      throw new AppError(404, 'Segment not found');
    }

    res.json({
      id: segment.id,
      name: segment.name,
      multiplier: toNumber(segment.multiplier),
      identificationType: segment.identificationType,
      identificationCondition: segment.identificationCondition,
      isActive: segment.isActive,
    });
  } catch (error) {
    next(error);
  }
});

// Create segment
segmentRoutes.post('/', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = createSegmentSchema.parse(req.body);

    const segment = await prisma.audienceSegment.create({
      data: {
        organizationId: req.user!.organizationId,
        name: input.name,
        multiplier: input.multiplier,
        identificationType: input.identificationType,
        identificationCondition: input.identificationCondition,
      },
    });

    res.status(201).json({
      id: segment.id,
      name: segment.name,
      multiplier: toNumber(segment.multiplier),
      identificationType: segment.identificationType,
      identificationCondition: segment.identificationCondition,
      isActive: segment.isActive,
    });
  } catch (error) {
    next(error);
  }
});

// Update segment
segmentRoutes.put('/:id', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = updateSegmentSchema.parse(req.body);

    const existing = await prisma.audienceSegment.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Segment not found');
    }

    const segment = await prisma.audienceSegment.update({
      where: { id: getParam(req.params.id) },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.multiplier !== undefined && { multiplier: input.multiplier }),
        ...(input.identificationType && { identificationType: input.identificationType }),
        ...(input.identificationCondition && { identificationCondition: input.identificationCondition }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    res.json({
      id: segment.id,
      name: segment.name,
      multiplier: toNumber(segment.multiplier),
      identificationType: segment.identificationType,
      identificationCondition: segment.identificationCondition,
      isActive: segment.isActive,
    });
  } catch (error) {
    next(error);
  }
});

// Delete segment
segmentRoutes.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.audienceSegment.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Segment not found');
    }

    await prisma.audienceSegment.delete({
      where: { id: getParam(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
