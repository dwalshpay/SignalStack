import { Router } from 'express';
import { prisma } from '../config/database.js';
import { jwtAuth } from '../middleware/auth.js';
import { toNumber } from '../types/index.js';

export const monitoringRoutes = Router();

// All routes require authentication
monitoringRoutes.use(jwtAuth);

// Get dashboard overview
monitoringRoutes.get('/overview', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get event counts
    const [totalEvents, metaEvents, googleEvents] = await Promise.all([
      prisma.conversionEvent.count({
        where: {
          lead: { organizationId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.conversionEvent.count({
        where: {
          lead: { organizationId },
          createdAt: { gte: thirtyDaysAgo },
          metaSentAt: { not: null },
        },
      }),
      prisma.conversionEvent.count({
        where: {
          lead: { organizationId },
          createdAt: { gte: thirtyDaysAgo },
          googleSentAt: { not: null },
        },
      }),
    ]);

    // Get events by event name
    const eventsByName = await prisma.conversionEvent.groupBy({
      by: ['eventName'],
      where: {
        lead: { organizationId },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Get 7-day trend
    const trend7d = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(ce.created_at) as date, COUNT(*) as count
      FROM conversion_events ce
      JOIN leads l ON ce.lead_id = l.id
      WHERE l.organization_id = ${organizationId}
        AND ce.created_at >= ${sevenDaysAgo}
      GROUP BY DATE(ce.created_at)
      ORDER BY date ASC
    `;

    // Get score distribution
    const scoreDistribution = await prisma.lead.groupBy({
      by: ['normalizedScore'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
        normalizedScore: { not: null },
      },
      _count: true,
    });

    let low = 0,
      medium = 0,
      high = 0;
    for (const item of scoreDistribution) {
      const score = item.normalizedScore ?? 0;
      if (score <= 33) low += item._count;
      else if (score <= 66) medium += item._count;
      else high += item._count;
    }

    // Get average score
    const avgScore = await prisma.lead.aggregate({
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
        normalizedScore: { not: null },
      },
      _avg: { normalizedScore: true },
    });

    // Get value stats
    const valueStats = await prisma.conversionEvent.aggregate({
      where: {
        lead: { organizationId },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { value: true },
      _avg: { value: true },
    });

    // Get values by segment
    const valuesBySegment = await prisma.lead.groupBy({
      by: ['segment'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
        segment: { not: null },
      },
      _sum: { value: true },
    });

    // Get active alerts
    const activeAlerts = await prisma.alertIncident.count({
      where: {
        alert: { organizationId },
        resolvedAt: null,
      },
    });

    // Get integration sync status
    const integrations = await prisma.integration.findMany({
      where: { organizationId },
      select: {
        type: true,
        status: true,
        lastSyncAt: true,
      },
    });

    const syncStatus: Record<string, { status: string; lastSync: string | null }> = {};
    for (const integration of integrations) {
      syncStatus[integration.type.toLowerCase()] = {
        status: integration.status,
        lastSync: integration.lastSyncAt?.toISOString() ?? null,
      };
    }

    res.json({
      period: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      },
      events: {
        total: totalEvents,
        byPlatform: { meta: metaEvents, google: googleEvents },
        byEvent: Object.fromEntries(eventsByName.map((e) => [e.eventName, e._count])),
        trend7d: trend7d.map((t) => Number(t.count)),
      },
      emq: {
        current: 0, // TODO: Calculate from actual EMQ data
        trend7d: [],
        target: 7.0,
      },
      matchRates: {
        meta: totalEvents > 0 ? (metaEvents / totalEvents) * 100 : 0,
        google: totalEvents > 0 ? (googleEvents / totalEvents) * 100 : 0,
      },
      scores: {
        average: avgScore._avg.normalizedScore ?? 0,
        distribution: { low, medium, high },
      },
      values: {
        total: toNumber(valueStats._sum.value) ?? 0,
        bySegment: Object.fromEntries(
          valuesBySegment.map((v) => [v.segment ?? 'Unknown', toNumber(v._sum.value) ?? 0])
        ),
        average: toNumber(valueStats._avg.value) ?? 0,
      },
      alerts: {
        activeIncidents: activeAlerts,
        bySeverity: { info: 0, warning: 0, critical: 0 }, // TODO: Implement proper grouping
      },
      syncStatus,
    });
  } catch (error) {
    next(error);
  }
});

// Get events by day
monitoringRoutes.get('/events', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await prisma.$queryRaw<
      { date: Date; event_name: string; count: bigint; meta_sent: bigint; google_sent: bigint }[]
    >`
      SELECT
        DATE(ce.created_at) as date,
        ce.event_name,
        COUNT(*) as count,
        SUM(CASE WHEN ce.meta_sent_at IS NOT NULL THEN 1 ELSE 0 END) as meta_sent,
        SUM(CASE WHEN ce.google_sent_at IS NOT NULL THEN 1 ELSE 0 END) as google_sent
      FROM conversion_events ce
      JOIN leads l ON ce.lead_id = l.id
      WHERE l.organization_id = ${organizationId}
        AND ce.created_at >= ${startDate}
      GROUP BY DATE(ce.created_at), ce.event_name
      ORDER BY date ASC, event_name ASC
    `;

    res.json(
      events.map((e) => ({
        date: e.date,
        eventName: e.event_name,
        count: Number(e.count),
        metaSent: Number(e.meta_sent),
        googleSent: Number(e.google_sent),
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Get EMQ trend
monitoringRoutes.get('/emq', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.signalMetric.findMany({
      where: {
        organizationId,
        date: { gte: startDate },
        platform: 'META',
      },
      orderBy: { date: 'asc' },
    });

    res.json(
      metrics.map((m) => ({
        date: m.date,
        emq: toNumber(m.avgEmq),
        eventsSent: m.eventsSent,
        eventsMatched: m.eventsMatched,
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Get score distribution
monitoringRoutes.get('/scores', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scores = await prisma.lead.groupBy({
      by: ['normalizedScore'],
      where: {
        organizationId,
        createdAt: { gte: startDate },
        normalizedScore: { not: null },
      },
      _count: true,
      orderBy: { normalizedScore: 'asc' },
    });

    // Bucket into ranges of 10
    const buckets: Record<string, number> = {};
    for (let i = 0; i <= 100; i += 10) {
      buckets[`${i}-${i + 9}`] = 0;
    }

    for (const score of scores) {
      const bucket = Math.floor((score.normalizedScore ?? 0) / 10) * 10;
      const key = `${bucket}-${bucket + 9}`;
      buckets[key] = (buckets[key] || 0) + score._count;
    }

    res.json(
      Object.entries(buckets).map(([range, count]) => ({
        range,
        count,
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Get value distribution by segment
monitoringRoutes.get('/values', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const values = await prisma.lead.groupBy({
      by: ['segment'],
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      _sum: { value: true },
      _avg: { value: true },
      _count: true,
    });

    res.json(
      values.map((v) => ({
        segment: v.segment ?? 'Unknown',
        totalValue: toNumber(v._sum.value) ?? 0,
        avgValue: toNumber(v._avg.value) ?? 0,
        count: v._count,
      }))
    );
  } catch (error) {
    next(error);
  }
});
