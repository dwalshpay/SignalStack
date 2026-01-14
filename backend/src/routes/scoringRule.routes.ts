import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  createScoringRuleSchema,
  updateScoringRuleSchema,
  reorderScoringRulesSchema,
} from '../utils/validation.js';

export const scoringRuleRoutes = Router();

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param ?? '';
}

// All routes require authentication
scoringRuleRoutes.use(jwtAuth);

// List all scoring rules
scoringRuleRoutes.get('/', async (req, res, next) => {
  try {
    const rules = await prisma.scoringRule.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { order: 'asc' },
    });

    res.json(rules);
  } catch (error) {
    next(error);
  }
});

// Get single scoring rule
scoringRuleRoutes.get('/:id', async (req, res, next) => {
  try {
    const rule = await prisma.scoringRule.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!rule) {
      throw new AppError(404, 'Scoring rule not found');
    }

    res.json(rule);
  } catch (error) {
    next(error);
  }
});

// Create scoring rule
scoringRuleRoutes.post('/', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = createScoringRuleSchema.parse(req.body);

    // Get max order for new rule
    const maxOrder = await prisma.scoringRule.aggregate({
      where: { organizationId: req.user!.organizationId },
      _max: { order: true },
    });

    const rule = await prisma.scoringRule.create({
      data: {
        organizationId: req.user!.organizationId,
        category: input.category,
        field: input.field,
        condition: input.condition,
        points: input.points,
        enabled: input.enabled ?? true,
        order: input.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

// Update scoring rule
scoringRuleRoutes.put('/:id', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const input = updateScoringRuleSchema.parse(req.body);

    const existing = await prisma.scoringRule.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Scoring rule not found');
    }

    const rule = await prisma.scoringRule.update({
      where: { id: getParam(req.params.id) },
      data: {
        ...(input.category && { category: input.category }),
        ...(input.field && { field: input.field }),
        ...(input.condition && { condition: input.condition }),
        ...(input.points !== undefined && { points: input.points }),
        ...(input.enabled !== undefined && { enabled: input.enabled }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });

    res.json(rule);
  } catch (error) {
    next(error);
  }
});

// Reorder scoring rules
scoringRuleRoutes.post('/reorder', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const { ruleIds } = reorderScoringRulesSchema.parse(req.body);

    // Verify all rules belong to this organization
    const rules = await prisma.scoringRule.findMany({
      where: {
        id: { in: ruleIds },
        organizationId: req.user!.organizationId,
      },
    });

    if (rules.length !== ruleIds.length) {
      throw new AppError(400, 'Some rules not found or do not belong to this organization');
    }

    // Update orders in transaction
    await prisma.$transaction(
      ruleIds.map((id, index) =>
        prisma.scoringRule.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    // Return updated rules
    const updatedRules = await prisma.scoringRule.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { order: 'asc' },
    });

    res.json(updatedRules);
  } catch (error) {
    next(error);
  }
});

// Toggle rule enabled status
scoringRuleRoutes.post('/:id/toggle', requireRole('ADMIN', 'MEMBER'), async (req, res, next) => {
  try {
    const existing = await prisma.scoringRule.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Scoring rule not found');
    }

    const rule = await prisma.scoringRule.update({
      where: { id: getParam(req.params.id) },
      data: { enabled: !existing.enabled },
    });

    res.json(rule);
  } catch (error) {
    next(error);
  }
});

// Delete scoring rule
scoringRuleRoutes.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.scoringRule.findFirst({
      where: {
        id: getParam(req.params.id),
        organizationId: req.user!.organizationId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Scoring rule not found');
    }

    await prisma.scoringRule.delete({
      where: { id: getParam(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
