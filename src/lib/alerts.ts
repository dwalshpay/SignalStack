/**
 * Alert Configuration Constants and Helpers
 * Based on PRD Section 4.3 ALERT_RULES
 */

import type {
  AlertRule,
  AlertMetric,
  AlertCondition,
  AlertWindow,
  AlertSeverity,
} from '@/types/alerts';

/**
 * Default alert rules from PRD
 */
export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'default-1',
    name: 'EMQ Score Drop',
    metric: 'emq_score',
    condition: 'drops_below',
    threshold: 7.0,
    window: '24h',
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'default-2',
    name: 'Event Volume Drop',
    metric: 'event_volume',
    condition: 'drops_by_percent',
    threshold: 30,
    window: '24h',
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'default-3',
    name: 'Conversion Rate Change',
    metric: 'conversion_rate',
    condition: 'changes_by_percent',
    threshold: 20,
    window: '7d',
    severity: 'info',
    enabled: true,
  },
];

/**
 * Alert metric configurations with labels and units
 */
export const ALERT_METRICS: Record<AlertMetric, { label: string; description: string; unit: string }> = {
  emq_score: {
    label: 'EMQ Score',
    description: 'Event Match Quality score from Meta CAPI',
    unit: 'points',
  },
  event_volume: {
    label: 'Event Volume',
    description: 'Total conversion events sent to platforms',
    unit: 'events',
  },
  conversion_rate: {
    label: 'Conversion Rate',
    description: 'Funnel step conversion rate',
    unit: '%',
  },
  match_rate: {
    label: 'Match Rate',
    description: 'Platform attribution match rate',
    unit: '%',
  },
};

/**
 * Alert condition labels
 */
export const ALERT_CONDITIONS: Record<AlertCondition, { label: string; requiresPercent: boolean }> = {
  drops_below: { label: 'Drops below', requiresPercent: false },
  drops_by_percent: { label: 'Drops by %', requiresPercent: true },
  changes_by_percent: { label: 'Changes by %', requiresPercent: true },
  exceeds: { label: 'Exceeds', requiresPercent: false },
};

/**
 * Alert time window labels
 */
export const ALERT_WINDOWS: Record<AlertWindow, string> = {
  '1h': 'Last hour',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

/**
 * Alert severity configurations
 */
export const ALERT_SEVERITIES: Record<AlertSeverity, { label: string; color: string; bgColor: string }> = {
  info: { label: 'Info', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  warning: { label: 'Warning', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100' },
};

/**
 * Generate a unique alert rule ID
 */
export function generateAlertRuleId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new alert rule with defaults
 */
export function createAlertRule(partial: Partial<AlertRule> = {}): AlertRule {
  return {
    id: generateAlertRuleId(),
    name: 'New Alert Rule',
    metric: 'event_volume',
    condition: 'drops_by_percent',
    threshold: 20,
    window: '24h',
    severity: 'warning',
    enabled: true,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

/**
 * Format an alert rule for display
 */
export function formatAlertRuleDescription(rule: AlertRule): string {
  const metric = ALERT_METRICS[rule.metric].label;
  const condition = ALERT_CONDITIONS[rule.condition].label.toLowerCase();
  const window = ALERT_WINDOWS[rule.window].toLowerCase();
  const unit = ALERT_CONDITIONS[rule.condition].requiresPercent ? '%' : '';

  return `${metric} ${condition} ${rule.threshold}${unit} in the ${window}`;
}
