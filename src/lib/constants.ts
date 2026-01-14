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
