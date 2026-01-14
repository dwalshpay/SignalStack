import type {
  FunnelStep,
  BusinessMetrics,
  AudienceSegment,
  PlatformConfig,
  CurrencyCode
} from '@/types';

// Platform volume thresholds (from PRD)
export const PLATFORM_THRESHOLDS: PlatformConfig = {
  google: {
    minimum: 15,      // per 30 days
    recommended: 50   // per 30 days
  },
  meta: {
    minimum: 200,     // per 30 days (50/week × 4)
    recommended: 200  // per 30 days
  }
};

// Default funnel steps (from PRD Section 1.1)
export const DEFAULT_FUNNEL: FunnelStep[] = [
  { id: '1', name: 'Website Visit', order: 0, conversionRate: 8, monthlyVolume: 10000, isTrackable: true, eventName: 'website_visit' },
  { id: '2', name: 'Email Captured', order: 1, conversionRate: 25, monthlyVolume: 800, isTrackable: true, eventName: 'email_captured' },
  { id: '3', name: 'Application Started', order: 2, conversionRate: 60, monthlyVolume: 200, isTrackable: true, eventName: 'application_started' },
  { id: '4', name: 'Signup Complete', order: 3, conversionRate: 40, monthlyVolume: 120, isTrackable: true, eventName: 'signup_complete' },
  { id: '5', name: 'First Transaction', order: 4, conversionRate: 50, monthlyVolume: 48, isTrackable: true, eventName: 'first_transaction' },
  { id: '6', name: 'Activated', order: 5, conversionRate: 100, monthlyVolume: 24, isTrackable: true, eventName: 'activated' },
];

// Default business metrics (from PRD)
export const DEFAULT_METRICS: BusinessMetrics = {
  ltv: 5700,
  ltvCacRatio: 4,
  grossMargin: 100,
  currency: 'AUD'
};

// Default audience segments (from PRD)
export const DEFAULT_SEGMENTS: AudienceSegment[] = [
  {
    id: '1',
    name: 'Business Email',
    multiplier: 1.5,
    identificationRule: {
      type: 'email_domain',
      condition: 'not_in_blocklist'
    }
  },
  {
    id: '2',
    name: 'Consumer Email',
    multiplier: 0.1,
    identificationRule: {
      type: 'email_domain',
      condition: 'in_blocklist'
    }
  },
];

// Supported currencies with symbols
export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string }> = {
  AUD: { symbol: '$', name: 'Australian Dollar' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  NZD: { symbol: '$', name: 'New Zealand Dollar' },
};

// Validation constraints (from PRD)
export const VALIDATION = {
  funnel: {
    minSteps: 2,
    maxSteps: 10,
    conversionRate: {
      min: 0.1,
      max: 100
    }
  },
  segment: {
    multiplier: {
      min: 0,
      max: 10
    }
  }
};

// Consumer email domains blocklist (from PRD Section 2.5)
export const CONSUMER_EMAIL_DOMAINS = {
  global: [
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au',
    'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com',
    'aol.com',
    'protonmail.com', 'proton.me',
    'zoho.com',
    'mail.com', 'email.com',
    'gmx.com', 'gmx.net'
  ],
  australia: [
    'bigpond.com', 'bigpond.net.au',
    'optusnet.com.au',
    'ozemail.com.au',
    'tpg.com.au',
    'internode.on.net',
    'dodo.com.au'
  ],
  regional: [
    'qq.com', '163.com', '126.com',
    'mail.ru', 'yandex.ru',
    'naver.com', 'daum.net',
    'web.de', 'gmx.de',
    'orange.fr', 'free.fr',
    'libero.it', 'virgilio.it'
  ]
};

// Storage key for Zustand persist
export const STORAGE_KEY = 'signalstack-storage';
export const STORAGE_VERSION = 1;

// EMQ (Event Match Quality) weights for Meta CAPI (Phase 3)
export const EMQ_WEIGHTS: Record<string, { weight: number; label: string }> = {
  email: { weight: 2.5, label: 'Email (hashed)' },
  fbc: { weight: 2.0, label: 'Click ID (fbc)' },
  phone: { weight: 1.5, label: 'Phone (hashed)' },
  fbp: { weight: 1.0, label: 'Browser ID (fbp)' },
  external_id: { weight: 0.8, label: 'External ID' },
  ip_address: { weight: 0.5, label: 'IP Address' },
  user_agent: { weight: 0.5, label: 'User Agent' },
  city: { weight: 0.3, label: 'City' },
  state: { weight: 0.3, label: 'State' },
  zip: { weight: 0.3, label: 'Zip Code' },
  country: { weight: 0.2, label: 'Country' },
};

export const EMQ_BASE_SCORE = 3.0;
export const EMQ_MAX_SCORE = 9.3;

// Lead scoring constants (Phase 3)
export const SCORING = {
  minMultiplier: 0.1,
  maxMultiplier: 2.0,
  maxScore: 100,
};

// Default scoring rule templates (Phase 3)
import type { ScoringRule } from '@/types';

export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  // Firmographic
  { id: 'rule-1', category: 'firmographic', field: 'email_type', condition: 'equals:business', points: 15, enabled: true },
  { id: 'rule-2', category: 'firmographic', field: 'company_size', condition: 'greater_than:100', points: 20, enabled: true },
  { id: 'rule-3', category: 'firmographic', field: 'industry', condition: 'in_list:technology,finance,healthcare', points: 15, enabled: true },
  // Behavioural
  { id: 'rule-4', category: 'behavioural', field: 'page_path', condition: 'contains:/pricing', points: 10, enabled: true },
  { id: 'rule-5', category: 'behavioural', field: 'page_path', condition: 'contains:/demo', points: 15, enabled: true },
  { id: 'rule-6', category: 'behavioural', field: 'session_count', condition: 'greater_than:1', points: 10, enabled: true },
  { id: 'rule-7', category: 'behavioural', field: 'time_on_site', condition: 'greater_than:300', points: 10, enabled: true },
  // Engagement
  { id: 'rule-8', category: 'engagement', field: 'form_type', condition: 'equals:demo_request', points: 25, enabled: true },
  { id: 'rule-9', category: 'engagement', field: 'content_download', condition: 'equals:case_study', points: 15, enabled: true },
  { id: 'rule-10', category: 'engagement', field: 'cta_clicked', condition: 'equals:true', points: 10, enabled: true },
];

// GTM Validation check codes (Phase 3)
export const VALIDATION_CHECKS = {
  MISSING_EVENT: { code: 'MISSING_EVENT', severity: 'error' as const, title: 'Missing Funnel Event' },
  NO_EVENT_VALUE: { code: 'NO_EVENT_VALUE', severity: 'warning' as const, title: 'Missing Event Value' },
  NO_EVENT_ID: { code: 'NO_EVENT_ID', severity: 'error' as const, title: 'Missing Event ID for Deduplication' },
  NO_MATCH_KEYS: { code: 'NO_MATCH_KEYS', severity: 'warning' as const, title: 'Missing Match Keys' },
  UNHASHED_PII: { code: 'UNHASHED_PII', severity: 'error' as const, title: 'Unhashed PII Detected' },
  NO_CONSENT_MODE: { code: 'NO_CONSENT_MODE', severity: 'warning' as const, title: 'Consent Mode Not Configured' },
  NO_CAPI: { code: 'NO_CAPI', severity: 'info' as const, title: 'No Server-Side Tags' },
  BROAD_TRIGGER: { code: 'BROAD_TRIGGER', severity: 'warning' as const, title: 'Overly Broad Trigger' },
};
