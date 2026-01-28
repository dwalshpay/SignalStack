/**
 * Alert Configuration Types
 * PRD-defined alert rules for monitoring conversion signals
 */

// Available metrics to monitor
export type AlertMetric = 'emq_score' | 'event_volume' | 'conversion_rate' | 'match_rate';

// Conditions for triggering alerts
export type AlertCondition = 'drops_below' | 'drops_by_percent' | 'changes_by_percent' | 'exceeds';

// Time windows for evaluation
export type AlertWindow = '1h' | '24h' | '7d' | '30d';

// Alert severity levels
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Alert rule configuration
 */
export interface AlertRule {
  id: string;
  name: string;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
  window: AlertWindow;
  severity: AlertSeverity;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User notification preferences for alerts
 */
export interface AlertNotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  notifyOnSeverity: AlertSeverity[];
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: AlertNotificationPreferences = {
  emailNotifications: true,
  browserNotifications: false,
  notifyOnSeverity: ['warning', 'critical'],
};
