// Funnel step in the conversion funnel
export interface FunnelStep {
  id: string;
  name: string;
  order: number;
  conversionRate: number;      // 0-100 (percentage)
  monthlyVolume: number;
  isTrackable: boolean;
  eventName?: string;          // snake_case for implementation
}

// Business metrics for value calculations
export interface BusinessMetrics {
  ltv: number;                 // Average Customer Lifetime Value
  ltvCacRatio: number;         // Target LTV:CAC ratio (e.g., 4 means 4:1)
  grossMargin: number;         // 0-100 (percentage)
  currency: CurrencyCode;
}

// Supported currencies
export type CurrencyCode = 'AUD' | 'USD' | 'GBP' | 'EUR' | 'NZD';

// Audience segment with value multiplier
export interface AudienceSegment {
  id: string;
  name: string;
  multiplier: number;          // e.g., 1.5 = 150% of base value
  identificationRule: IdentificationRule;
}

// How to identify a segment
export interface IdentificationRule {
  type: 'email_domain' | 'form_field' | 'behaviour';
  condition: string;           // e.g., 'not_in_blocklist', 'in_blocklist'
}

// Calculated value for a funnel step
export interface CalculatedValue {
  stepId: string;
  stepName: string;
  monthlyVolume: number;
  conversionRate: number;
  cumulativeProbability: number;
  baseValue: number;
  segmentValues: Record<string, number>;  // segmentId -> calculated value
  volumeStatus: VolumeStatus;
  recommendation: string;
}

// Volume status relative to platform thresholds
export type VolumeStatus = 'sufficient' | 'borderline' | 'insufficient';

// Lead scoring rule (Phase 3)
export type ScoringCategory = 'firmographic' | 'behavioural' | 'engagement';

export interface ScoringRule {
  id: string;
  category: ScoringCategory;
  field: string;
  condition: string;
  points: number;
  enabled: boolean;
}

// GTM Validation Types (Phase 3)
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  code: string;
  title: string;
  description: string;
  recommendation: string;
  affectedItems?: string[];
}

export interface GTMValidationResult {
  isValid: boolean;
  containerName: string;
  containerVersion: string;
  issueCount: {
    error: number;
    warning: number;
    info: number;
  };
  issues: ValidationIssue[];
  detectedMatchKeys: string[];
  estimatedEMQ: number;
  parsedAt: string;
}

// EMQ Types (Phase 3)
export interface EMQMatchKey {
  key: string;
  label: string;
  weight: number;
  available: boolean;
}

export type EMQRating = 'poor' | 'fair' | 'good' | 'excellent';

export interface EMQEstimate {
  score: number;
  maxScore: number;
  matchKeys: EMQMatchKey[];
  rating: EMQRating;
}

// Scoring Result (Phase 3)
export interface ScoringResult {
  totalPoints: number;
  normalizedScore: number;
  multiplier: number;
  appliedRules: { ruleId: string; points: number }[];
}

// Persisted state structure
export interface StoredState {
  version: number;
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
  scoringRules: ScoringRule[];
  lastUpdated: string;
}

// Platform thresholds for volume analysis
export interface PlatformThresholds {
  minimum: number;             // Minimum conversions per 30 days
  recommended: number;         // Recommended conversions per 30 days
}

// Platform configuration
export interface PlatformConfig {
  google: PlatformThresholds;
  meta: PlatformThresholds;
}

// Monitoring Types (Phase 4)
export interface MonitoringOverview {
  period: {
    start: string;
    end: string;
  };
  events: {
    total: number;
    byPlatform: {
      meta: number;
      google: number;
    };
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
    bySeverity: {
      info: number;
      warning: number;
      critical: number;
    };
  };
  syncStatus: Record<string, {
    status: string;
    lastSync: string | null;
  }>;
}
