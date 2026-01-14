import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// FUNNEL SCHEMAS
// ============================================

export const funnelStepSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Step name is required'),
  order: z.number().int().min(0),
  conversionRate: z.number().min(0.1).max(100),
  monthlyVolume: z.number().min(0),
  isTrackable: z.boolean(),
  eventName: z.string(),
});

export const createFunnelSchema = z.object({
  name: z.string().min(1, 'Funnel name is required'),
  isDefault: z.boolean().optional(),
  steps: z.array(funnelStepSchema).min(2, 'Funnel must have at least 2 steps').max(10),
});

export const updateFunnelSchema = z.object({
  name: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  steps: z.array(funnelStepSchema).min(2).max(10).optional(),
});

// ============================================
// METRICS SCHEMAS
// ============================================

export const businessMetricsSchema = z.object({
  ltv: z.number().positive('LTV must be positive'),
  ltvCacRatio: z.number().min(1, 'LTV:CAC ratio must be at least 1'),
  grossMargin: z.number().min(0).max(100).optional(),
  currency: z.enum(['AUD', 'USD', 'GBP', 'EUR', 'NZD']).optional(),
});

// ============================================
// SEGMENT SCHEMAS
// ============================================

export const createSegmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required'),
  multiplier: z.number().min(0).max(10),
  identificationType: z.enum(['email_domain', 'form_field', 'behavioral']),
  identificationCondition: z.string().min(1, 'Identification condition is required'),
});

export const updateSegmentSchema = z.object({
  name: z.string().min(1).optional(),
  multiplier: z.number().min(0).max(10).optional(),
  identificationType: z.enum(['email_domain', 'form_field', 'behavioral']).optional(),
  identificationCondition: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// SCORING RULE SCHEMAS
// ============================================

export const createScoringRuleSchema = z.object({
  category: z.enum(['FIRMOGRAPHIC', 'BEHAVIORAL', 'ENGAGEMENT']),
  field: z.string().min(1, 'Field is required'),
  condition: z.string().min(1, 'Condition is required'),
  points: z.number().int().min(-100).max(100),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateScoringRuleSchema = z.object({
  category: z.enum(['FIRMOGRAPHIC', 'BEHAVIORAL', 'ENGAGEMENT']).optional(),
  field: z.string().min(1).optional(),
  condition: z.string().min(1).optional(),
  points: z.number().int().min(-100).max(100).optional(),
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderScoringRulesSchema = z.object({
  ruleIds: z.array(z.string().uuid()),
});

// ============================================
// LEAD SCORING SCHEMAS
// ============================================

export const scoreLeadSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fbc: z.string().optional(),
  fbp: z.string().optional(),
  gclid: z.string().optional(),
  page_path: z.string().optional(),
  page_url: z.string().url().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  session_duration: z.number().min(0).optional(),
  pages_viewed: z.number().int().min(0).optional(),
  scroll_depth: z.number().min(0).max(100).optional(),
  session_count: z.number().int().min(0).optional(),
  form_type: z.string().optional(),
  company_size: z.union([z.string(), z.number()]).optional(),
  industry: z.string().optional(),
  job_title: z.string().optional(),
  external_id: z.string().optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional(),
  event_id: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// ============================================
// INTEGRATION SCHEMAS
// ============================================

export const createIntegrationSchema = z.object({
  type: z.enum(['AMPLITUDE', 'SALESFORCE', 'META_CAPI', 'GOOGLE_ADS', 'CLEARBIT']),
  name: z.string().min(1, 'Integration name is required'),
  credentials: z.record(z.string()),
  settings: z.record(z.unknown()).optional(),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  credentials: z.record(z.string()).optional(),
  settings: z.record(z.unknown()).optional(),
});

// ============================================
// INVITE SCHEMAS
// ============================================

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

// ============================================
// API KEY SCHEMAS
// ============================================

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});
