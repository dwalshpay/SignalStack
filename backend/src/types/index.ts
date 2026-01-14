import type { Decimal } from '@prisma/client/runtime/library';

// ============================================
// FUNNEL TYPES
// ============================================

export interface FunnelStep {
  id: string;
  name: string;
  order: number;
  conversionRate: number;
  monthlyVolume: number;
  isTrackable: boolean;
  eventName: string;
}

export interface CreateFunnelInput {
  name: string;
  isDefault?: boolean;
  steps: FunnelStep[];
}

export interface UpdateFunnelInput {
  name?: string;
  isDefault?: boolean;
  steps?: FunnelStep[];
}

// ============================================
// BUSINESS METRICS TYPES
// ============================================

export interface BusinessMetricsInput {
  ltv: number;
  ltvCacRatio: number;
  grossMargin?: number;
  currency?: string;
}

// ============================================
// SEGMENT TYPES
// ============================================

export interface CreateSegmentInput {
  name: string;
  multiplier: number;
  identificationType: string;
  identificationCondition: string;
}

export interface UpdateSegmentInput {
  name?: string;
  multiplier?: number;
  identificationType?: string;
  identificationCondition?: string;
  isActive?: boolean;
}

// ============================================
// SCORING RULE TYPES
// ============================================

export type ScoringCategory = 'FIRMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT';

export interface CreateScoringRuleInput {
  category: ScoringCategory;
  field: string;
  condition: string;
  points: number;
  enabled?: boolean;
  order?: number;
}

export interface UpdateScoringRuleInput {
  category?: ScoringCategory;
  field?: string;
  condition?: string;
  points?: number;
  enabled?: boolean;
  order?: number;
}

// ============================================
// LEAD SCORING TYPES
// ============================================

export interface ScoreLeadInput {
  event_name: string;
  email?: string;
  phone?: string;
  fbc?: string;
  fbp?: string;
  gclid?: string;
  page_path?: string;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  session_duration?: number;
  pages_viewed?: number;
  scroll_depth?: number;
  session_count?: number;
  form_type?: string;
  company_size?: string | number;
  industry?: string;
  job_title?: string;
  external_id?: string;
  ip_address?: string;
  user_agent?: string;
  event_id?: string;
  timestamp?: string;
}

export interface AppliedRule {
  ruleId: string;
  field: string;
  points: number;
}

export interface ScoreLeadResponse {
  success: boolean;
  leadId: string;
  eventId: string;
  scoring: {
    rawScore: number;
    normalizedScore: number;
    multiplier: number;
    appliedRules: AppliedRule[];
  };
  value: {
    baseValue: number;
    adjustedValue: number;
    currency: string;
    segment: string | null;
  };
  platformStatus: {
    metaCapi: {
      sent: boolean;
      queued: boolean;
      eventId?: string;
      error?: string;
    };
    googleAds: {
      queued: boolean;
      gclidCaptured: boolean;
    };
  };
  processingTimeMs: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

// ============================================
// INTEGRATION TYPES
// ============================================

export type IntegrationType =
  | 'AMPLITUDE'
  | 'SALESFORCE'
  | 'META_CAPI'
  | 'GOOGLE_ADS'
  | 'CLEARBIT';

export interface CreateIntegrationInput {
  type: IntegrationType;
  name: string;
  credentials: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface UpdateIntegrationInput {
  name?: string;
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
}

// ============================================
// MONITORING TYPES
// ============================================

export interface DashboardOverview {
  period: { start: string; end: string };
  events: {
    total: number;
    byPlatform: { meta: number; google: number };
    byEvent: Record<string, number>;
    trend7d: number[];
  };
  emq: {
    current: number;
    trend7d: number[];
    target: number;
  };
  matchRates: {
    meta: number;
    google: number;
  };
  scores: {
    average: number;
    distribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  values: {
    total: number;
    bySegment: Record<string, number>;
    average: number;
  };
  alerts: {
    activeIncidents: number;
    bySeverity: { info: number; warning: number; critical: number };
  };
  syncStatus: Record<string, { status: string; lastSync: string | null }>;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function toNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}
