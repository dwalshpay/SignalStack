import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { businessMetricsSchema } from '../utils/validation.js';
import { toNumber } from '../types/index.js';

export const metricsRoutes = Router();

// All routes require authentication
metricsRoutes.use(jwtAuth);

// Get current business metrics
metricsRoutes.get('/', async (req, res, next) => {
  try {
    const metrics = await prisma.businessMetrics.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        effectiveTo: null,
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!metrics) {
      res.json(null);
      return;
    }

    res.json({
      id: metrics.id,
      ltv: toNumber(metrics.ltv),
      ltvCacRatio: toNumber(metrics.ltvCacRatio),
      grossMargin: toNumber(metrics.grossMargin),
      currency: metrics.currency,
      effectiveFrom: metrics.effectiveFrom,
      source: metrics.source,
    });
  } catch (error) {
    next(error);
  }
});

// Get metrics history
metricsRoutes.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    const metrics = await prisma.businessMetrics.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { effectiveFrom: 'desc' },
      take: limit,
    });

    res.json(
      metrics.map((m) => ({
        id: m.id,
        ltv: toNumber(m.ltv),
        ltvCacRatio: toNumber(m.ltvCacRatio),
        grossMargin: toNumber(m.grossMargin),
        currency: m.currency,
        effectiveFrom: m.effectiveFrom,
        effectiveTo: m.effectiveTo,
        source: m.source,
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Create new business metrics (closes previous record)
metricsRoutes.post('/', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = businessMetricsSchema.parse(req.body);

    const metrics = await prisma.$transaction(async (tx) => {
      // Close any existing open record
      await tx.businessMetrics.updateMany({
        where: {
          organizationId: req.user!.organizationId,
          effectiveTo: null,
        },
        data: { effectiveTo: new Date() },
      });

      // Create new record
      return tx.businessMetrics.create({
        data: {
          organizationId: req.user!.organizationId,
          ltv: input.ltv,
          ltvCacRatio: input.ltvCacRatio,
          grossMargin: input.grossMargin ?? 100,
          currency: input.currency ?? 'AUD',
          effectiveFrom: new Date(),
          source: 'MANUAL',
        },
      });
    });

    res.status(201).json({
      id: metrics.id,
      ltv: toNumber(metrics.ltv),
      ltvCacRatio: toNumber(metrics.ltvCacRatio),
      grossMargin: toNumber(metrics.grossMargin),
      currency: metrics.currency,
      effectiveFrom: metrics.effectiveFrom,
      source: metrics.source,
    });
  } catch (error) {
    next(error);
  }
});
