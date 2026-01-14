// API Request/Response Types

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface InviteRequest {
  email: string;
  role: UserRole;
}

export interface AcceptInviteRequest {
  token: string;
  password: string;
  name: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  scopes: string[];
  expiresAt?: string;
}

// User & Organization Types
export type UserRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface UserWithOrganization extends User {
  organization: Organization;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserWithOrganization;
}

export interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface APIKeyCreateResponse extends APIKey {
  key: string; // Only returned on creation
}

// Backend Data Types (mirror Prisma models)
export interface BackendFunnel {
  id: string;
  name: string;
  organizationId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  steps: BackendFunnelStep[];
}

export interface BackendFunnelStep {
  id: string;
  funnelId: string;
  name: string;
  order: number;
  conversionRate: string; // Prisma Decimal as string
  monthlyVolume: number;
  isTrackable: boolean;
  eventName: string | null;
}

export interface BackendMetrics {
  id: string;
  organizationId: string;
  ltv: string; // Prisma Decimal
  ltvCacRatio: string;
  grossMargin: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  source: 'MANUAL' | 'SALESFORCE' | 'AMPLITUDE';
  createdAt: string;
}

export interface BackendSegment {
  id: string;
  organizationId: string;
  name: string;
  multiplier: string; // Prisma Decimal
  identificationType: 'email_domain' | 'form_field' | 'behavioral';
  identificationCondition: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendScoringRule {
  id: string;
  organizationId: string;
  category: 'FIRMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT';
  field: string;
  condition: string;
  points: number;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Integration Types
export type IntegrationType = 'META_CAPI' | 'GOOGLE_ADS' | 'AMPLITUDE' | 'SALESFORCE' | 'CLEARBIT';
export type IntegrationStatus = 'PENDING' | 'ACTIVE' | 'ERROR' | 'DISABLED';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  settings: Record<string, unknown>;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationRequest {
  type: IntegrationType;
  name: string;
  credentials: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface UpdateIntegrationRequest {
  name?: string;
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
  status?: IntegrationStatus;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  recordsProcessed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

// Monitoring Types
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

export interface EventsByDay {
  date: string;
  eventName: string;
  count: number;
}

export interface EMQTrendPoint {
  date: string;
  score: number;
}

export interface ScoreDistribution {
  bucket: string; // "0-10", "10-20", etc.
  count: number;
  percentage: number;
}

export interface ValueBySegment {
  segment: string;
  totalValue: number;
  count: number;
  averageValue: number;
}

// Request Types for CRUD operations
export interface CreateFunnelRequest {
  name: string;
  isDefault?: boolean;
  steps: {
    name: string;
    order: number;
    conversionRate: number;
    monthlyVolume: number;
    isTrackable: boolean;
    eventName?: string;
  }[];
}

export interface UpdateFunnelRequest {
  name?: string;
  isDefault?: boolean;
  steps?: {
    id?: string;
    name: string;
    order: number;
    conversionRate: number;
    monthlyVolume: number;
    isTrackable: boolean;
    eventName?: string;
  }[];
}

export interface CreateMetricsRequest {
  ltv: number;
  ltvCacRatio: number;
  grossMargin: number;
  currency: string;
}

export interface CreateSegmentRequest {
  name: string;
  multiplier: number;
  identificationType: 'email_domain' | 'form_field' | 'behavioral';
  identificationCondition: string;
  isActive?: boolean;
}

export interface UpdateSegmentRequest {
  name?: string;
  multiplier?: number;
  identificationType?: 'email_domain' | 'form_field' | 'behavioral';
  identificationCondition?: string;
  isActive?: boolean;
}

export interface CreateScoringRuleRequest {
  category: 'FIRMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT';
  field: string;
  condition: string;
  points: number;
  enabled?: boolean;
}

export interface UpdateScoringRuleRequest {
  field?: string;
  condition?: string;
  points?: number;
  enabled?: boolean;
}

export interface ReorderScoringRulesRequest {
  ruleIds: string[];
}

// API Error Response
export interface APIErrorResponse {
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
}
