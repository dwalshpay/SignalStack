import type { FunnelStep, BusinessMetrics } from '@/types';
import { VALIDATION, CONSUMER_EMAIL_DOMAINS } from './constants';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate funnel configuration
 */
export function validateFunnel(steps: FunnelStep[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (steps.length < VALIDATION.funnel.minSteps) {
    errors.push({
      field: 'funnel',
      message: `Minimum ${VALIDATION.funnel.minSteps} steps required`,
    });
  }

  if (steps.length > VALIDATION.funnel.maxSteps) {
    errors.push({
      field: 'funnel',
      message: `Maximum ${VALIDATION.funnel.maxSteps} steps allowed`,
    });
  }

  steps.forEach((step, index) => {
    if (!step.name.trim()) {
      errors.push({
        field: `step.${index}.name`,
        message: `Step ${index + 1} name is required`,
      });
    }

    if (step.conversionRate < VALIDATION.funnel.conversionRate.min) {
      errors.push({
        field: `step.${index}.conversionRate`,
        message: `Step ${index + 1} conversion rate must be at least ${VALIDATION.funnel.conversionRate.min}%`,
      });
    }

    if (step.conversionRate > VALIDATION.funnel.conversionRate.max) {
      errors.push({
        field: `step.${index}.conversionRate`,
        message: `Step ${index + 1} conversion rate cannot exceed ${VALIDATION.funnel.conversionRate.max}%`,
      });
    }

    if (step.monthlyVolume < 0) {
      errors.push({
        field: `step.${index}.monthlyVolume`,
        message: `Step ${index + 1} volume must be a positive number`,
      });
    }
  });

  return errors;
}

/**
 * Validate business metrics
 */
export function validateMetrics(metrics: BusinessMetrics): ValidationError[] {
  const errors: ValidationError[] = [];

  if (metrics.ltv <= 0) {
    errors.push({
      field: 'ltv',
      message: 'LTV must be a positive number',
    });
  }

  if (metrics.ltvCacRatio <= 0) {
    errors.push({
      field: 'ltvCacRatio',
      message: 'LTV:CAC ratio must be a positive number',
    });
  }

  if (metrics.grossMargin < 0 || metrics.grossMargin > 100) {
    errors.push({
      field: 'grossMargin',
      message: 'Gross margin must be between 0 and 100',
    });
  }

  return errors;
}

/**
 * Check if email is from a consumer domain
 */
export function isConsumerEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true; // Invalid email = treat as consumer

  const allConsumerDomains = [
    ...CONSUMER_EMAIL_DOMAINS.global,
    ...CONSUMER_EMAIL_DOMAINS.australia,
    ...CONSUMER_EMAIL_DOMAINS.regional,
  ];

  return allConsumerDomains.includes(domain);
}

/**
 * Get email type for value calculation
 */
export function getEmailType(email: string): 'business' | 'consumer' {
  return isConsumerEmail(email) ? 'consumer' : 'business';
}
