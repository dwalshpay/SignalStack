import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../config/database.js';
import { apiKeyAuth, requireScope } from '../middleware/auth.js';
import { webhookRateLimit } from '../middleware/rateLimit.js';
import { scoreLeadSchema } from '../utils/validation.js';
import { calculateScoringResult } from '../services/scoring.service.js';
import { getEventValue } from '../services/calculation.service.js';
import { hashEmail, hashPhone, getEmailType } from '../services/hashing.service.js';
import { encrypt } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';
import type { ScoreLeadInput, ScoreLeadResponse, FunnelStep } from '../types/index.js';

export const leadRoutes = Router();

// Lead scoring webhook - API key auth with rate limiting
leadRoutes.post(
  '/',
  webhookRateLimit,
  apiKeyAuth,
  requireScope('score-lead'),
  async (req, res, next) => {
    const startTime = Date.now();

    try {
      const input = scoreLeadSchema.parse(req.body) as ScoreLeadInput;
      const organizationId = req.organization!.id;

      // Generate event ID if not provided
      const eventId = input.event_id || randomUUID();

      // Fetch organization data in parallel
      const [funnel, metrics, scoringRules, segments] = await Promise.all([
        prisma.funnel.findFirst({
          where: { organizationId, isDefault: true },
        }),
        prisma.businessMetrics.findFirst({
          where: { organizationId, effectiveTo: null },
          orderBy: { effectiveFrom: 'desc' },
        }),
        prisma.scoringRule.findMany({
          where: { organizationId, enabled: true },
          orderBy: { order: 'asc' },
        }),
        prisma.audienceSegment.findMany({
          where: { organizationId, isActive: true },
        }),
      ]);

      if (!funnel || !metrics) {
        res.status(400).json({
          success: false,
          error: 'Organization not fully configured. Missing funnel or business metrics.',
        });
        return;
      }

      // Hash PII
      const emailHash = input.email ? hashEmail(input.email) : null;
      const phoneHash = input.phone ? hashPhone(input.phone) : null;

      // Determine email type for segment matching
      const emailType = input.email ? getEmailType(input.email) : null;

      // Build lead data for scoring
      const leadData: Record<string, unknown> = {
        event_name: input.event_name,
        email_type: emailType,
        page_path: input.page_path,
        session_duration: input.session_duration,
        pages_viewed: input.pages_viewed,
        scroll_depth: input.scroll_depth,
        session_count: input.session_count,
        form_type: input.form_type,
        company_size: input.company_size,
        industry: input.industry,
        job_title: input.job_title,
        utm_source: input.utm_source,
        utm_medium: input.utm_medium,
        utm_campaign: input.utm_campaign,
      };

      // Calculate score
      const scoringResult = calculateScoringResult(scoringRules, leadData);

      // Get base value for this event
      const funnelSteps = funnel.steps as unknown as FunnelStep[];
      const eventValue = getEventValue(input.event_name, funnelSteps, metrics);

      // Default to target CAC if event not found in funnel
      const baseValue = eventValue?.baseValue ?? Number(metrics.ltv) / Number(metrics.ltvCacRatio);

      // Apply multiplier to get adjusted value
      const adjustedValue = baseValue * scoringResult.multiplier;

      // Determine segment
      let segmentName: string | null = null;
      if (emailType) {
        const matchingSegment = segments.find((s) => {
          if (s.identificationType === 'email_domain') {
            if (s.identificationCondition === 'in_blocklist' && emailType === 'consumer') {
              return true;
            }
            if (s.identificationCondition === 'not_in_blocklist' && emailType === 'business') {
              return true;
            }
          }
          return false;
        });
        segmentName = matchingSegment?.name ?? null;
      }

      // Encrypt raw lead data for storage
      const rawData = new Uint8Array(encrypt({
        email: input.email,
        phone: input.phone,
        ip_address: input.ip_address,
        user_agent: input.user_agent,
      }));

      // Store lead and event in transaction
      const { lead, event } = await prisma.$transaction(async (tx) => {
        const newLead = await tx.lead.create({
          data: {
            organizationId,
            emailHash,
            phoneHash,
            externalId: input.external_id,
            score: scoringResult.totalPoints,
            normalizedScore: scoringResult.normalizedScore,
            multiplier: scoringResult.multiplier,
            value: adjustedValue,
            segment: segmentName,
            signals: scoringResult.appliedRules as object[],
            rawData,
            source: input.utm_source,
            campaign: input.utm_campaign,
            medium: input.utm_medium,
            gclid: input.gclid,
            fbc: input.fbc,
            fbp: input.fbp,
            ipAddress: input.ip_address,
            userAgent: input.user_agent,
          },
        });

        const newEvent = await tx.conversionEvent.create({
          data: {
            leadId: newLead.id,
            eventName: input.event_name,
            eventId,
            value: adjustedValue,
            currency: metrics.currency,
            pageUrl: input.page_url,
          },
        });

        return { lead: newLead, event: newEvent };
      });

      // TODO: Send to Meta CAPI (async, don't block response)
      // TODO: Queue for Google Ads upload

      const processingTimeMs = Date.now() - startTime;

      const response: ScoreLeadResponse = {
        success: true,
        leadId: lead.id,
        eventId: event.eventId,
        scoring: {
          rawScore: scoringResult.totalPoints,
          normalizedScore: scoringResult.normalizedScore,
          multiplier: scoringResult.multiplier,
          appliedRules: scoringResult.appliedRules,
        },
        value: {
          baseValue,
          adjustedValue,
          currency: metrics.currency,
          segment: segmentName,
        },
        platformStatus: {
          metaCapi: {
            sent: false, // TODO: Implement
            eventId: undefined,
            error: undefined,
          },
          googleAds: {
            queued: !!input.gclid, // TODO: Implement actual queueing
            gclidCaptured: !!input.gclid,
          },
        },
        processingTimeMs,
      };

      // Log if over target
      if (processingTimeMs > 100) {
        logger.warn(`Webhook processing exceeded 100ms target: ${processingTimeMs}ms`);
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);
