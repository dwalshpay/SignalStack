// Data mappers between frontend and backend formats

import type {
  BackendFunnel,
  BackendFunnelStep,
  BackendMetrics,
  BackendSegment,
  BackendScoringRule,
} from '../../types/api';
import type {
  FunnelStep,
  BusinessMetrics,
  AudienceSegment,
  ScoringRule,
  ScoringCategory,
  CurrencyCode,
} from '../../types';

// Prisma Decimal to number
function toNumber(value: string | number): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}

// Funnel Step Mappers
export function mapBackendStepToFrontend(step: BackendFunnelStep): FunnelStep {
  return {
    id: step.id,
    name: step.name,
    order: step.order,
    conversionRate: toNumber(step.conversionRate),
    monthlyVolume: step.monthlyVolume,
    isTrackable: step.isTrackable,
    eventName: step.eventName || undefined,
  };
}

export function mapFrontendStepToBackend(
  step: FunnelStep
): Omit<BackendFunnelStep, 'funnelId'> {
  return {
    id: step.id,
    name: step.name,
    order: step.order,
    conversionRate: step.conversionRate.toString(),
    monthlyVolume: step.monthlyVolume,
    isTrackable: step.isTrackable,
    eventName: step.eventName || null,
  };
}

// Funnel Mappers
export function mapBackendFunnelToFrontend(funnel: BackendFunnel): FunnelStep[] {
  return funnel.steps
    .map(mapBackendStepToFrontend)
    .sort((a, b) => a.order - b.order);
}

// Metrics Mappers
export function mapBackendMetricsToFrontend(metrics: BackendMetrics): BusinessMetrics {
  return {
    ltv: toNumber(metrics.ltv),
    ltvCacRatio: toNumber(metrics.ltvCacRatio),
    grossMargin: toNumber(metrics.grossMargin),
    currency: metrics.currency as CurrencyCode,
  };
}

export function mapFrontendMetricsToBackend(metrics: BusinessMetrics): {
  ltv: number;
  ltvCacRatio: number;
  grossMargin: number;
  currency: string;
} {
  return {
    ltv: metrics.ltv,
    ltvCacRatio: metrics.ltvCacRatio,
    grossMargin: metrics.grossMargin,
    currency: metrics.currency,
  };
}

// Segment Mappers
export function mapBackendSegmentToFrontend(segment: BackendSegment): AudienceSegment {
  // Backend uses 'behavioral', frontend uses 'behaviour'
  const typeMap: Record<string, 'email_domain' | 'form_field' | 'behaviour'> = {
    email_domain: 'email_domain',
    form_field: 'form_field',
    behavioral: 'behaviour',
  };

  return {
    id: segment.id,
    name: segment.name,
    multiplier: toNumber(segment.multiplier),
    identificationRule: {
      type: typeMap[segment.identificationType] || 'email_domain',
      condition: segment.identificationCondition,
    },
  };
}

export function mapFrontendSegmentToBackend(segment: AudienceSegment): {
  name: string;
  multiplier: number;
  identificationType: 'email_domain' | 'form_field' | 'behavioral';
  identificationCondition: string;
  isActive: boolean;
} {
  // Frontend uses 'behaviour', backend uses 'behavioral'
  const typeMap: Record<string, 'email_domain' | 'form_field' | 'behavioral'> = {
    email_domain: 'email_domain',
    form_field: 'form_field',
    behaviour: 'behavioral',
  };

  return {
    name: segment.name,
    multiplier: segment.multiplier,
    identificationType: typeMap[segment.identificationRule.type] || 'email_domain',
    identificationCondition: segment.identificationRule.condition,
    isActive: true,
  };
}

// Scoring Rule Mappers
export function mapBackendScoringRuleToFrontend(rule: BackendScoringRule): ScoringRule {
  // Backend uses uppercase enum, frontend uses lowercase
  const categoryMap: Record<string, ScoringCategory> = {
    FIRMOGRAPHIC: 'firmographic',
    BEHAVIORAL: 'behavioural',
    ENGAGEMENT: 'engagement',
  };

  return {
    id: rule.id,
    category: categoryMap[rule.category] || 'firmographic',
    field: rule.field,
    condition: rule.condition,
    points: rule.points,
    enabled: rule.enabled,
  };
}

export function mapFrontendScoringRuleToBackend(rule: ScoringRule): {
  category: 'FIRMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT';
  field: string;
  condition: string;
  points: number;
  enabled: boolean;
} {
  // Frontend uses lowercase, backend uses uppercase
  const categoryMap: Record<ScoringCategory, 'FIRMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT'> = {
    firmographic: 'FIRMOGRAPHIC',
    behavioural: 'BEHAVIORAL',
    engagement: 'ENGAGEMENT',
  };

  return {
    category: categoryMap[rule.category],
    field: rule.field,
    condition: rule.condition,
    points: rule.points,
    enabled: rule.enabled,
  };
}

// Batch mappers for lists
export function mapBackendSegmentsToFrontend(segments: BackendSegment[]): AudienceSegment[] {
  return segments.filter((s) => s.isActive).map(mapBackendSegmentToFrontend);
}

export function mapBackendScoringRulesToFrontend(rules: BackendScoringRule[]): ScoringRule[] {
  return rules.sort((a, b) => a.order - b.order).map(mapBackendScoringRuleToFrontend);
}
