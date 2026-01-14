import type {
  FunnelStep,
  BusinessMetrics,
  AudienceSegment,
  CalculatedValue,
  VolumeStatus
} from '@/types';
import { PLATFORM_THRESHOLDS } from './constants';

/**
 * Calculate Target CAC from business metrics
 * Formula: Target CAC = LTV / LTV:CAC Ratio × (Gross Margin / 100)
 */
export function calculateTargetCAC(metrics: BusinessMetrics): number {
  const baseCAC = metrics.ltv / metrics.ltvCacRatio;
  return baseCAC * (metrics.grossMargin / 100);
}

/**
 * Determine volume status based on platform thresholds
 * Uses Google Ads thresholds as the baseline (more conservative)
 */
export function getVolumeStatus(volume: number): VolumeStatus {
  if (volume >= PLATFORM_THRESHOLDS.google.recommended) {
    return 'sufficient';
  }
  if (volume >= PLATFORM_THRESHOLDS.google.minimum) {
    return 'borderline';
  }
  return 'insufficient';
}

/**
 * Generate recommendation based on volume status and position in funnel
 */
export function getRecommendation(
  status: VolumeStatus,
  stepIndex: number,
  totalSteps: number,
  volume: number
): string {
  if (status === 'sufficient') {
    return 'Optimise toward this event';
  }

  if (status === 'borderline') {
    return 'Usable for optimisation with caution. Consider combining with higher-volume events.';
  }

  // Insufficient volume
  if (stepIndex < totalSteps - 1) {
    return 'Use as measurement only. Optimise toward higher-volume events earlier in funnel.';
  }

  return `Volume too low for optimisation (${volume}/month). Need ${PLATFORM_THRESHOLDS.google.minimum}+ for Google Ads.`;
}

/**
 * Main calculation engine
 * Computes values for each funnel step based on cumulative conversion probability
 *
 * Formula: Event Value = Target CAC × Cumulative Conversion Probability
 * Where: Cumulative Probability = Product of all downstream conversion rates
 */
export function calculateFunnelValues(
  steps: FunnelStep[],
  metrics: BusinessMetrics,
  segments: AudienceSegment[]
): CalculatedValue[] {
  const targetCAC = calculateTargetCAC(metrics);

  // Sort steps by order (ascending)
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  // Calculate cumulative probabilities from bottom up
  // Start from the last step and work backwards
  // Each step's probability = product of all downstream conversion rates
  const cumulativeProbs: number[] = new Array(sortedSteps.length);

  // Last step has probability = 1 (if you reach it, you're there)
  // Work backwards: each step's cumulative prob = next step's rate × next step's cumulative prob
  for (let i = sortedSteps.length - 1; i >= 0; i--) {
    if (i === sortedSteps.length - 1) {
      // Last step: probability is 1 (terminal state)
      cumulativeProbs[i] = 1;
    } else {
      // Cumulative probability = this step's conversion rate to next × next step's cumulative
      cumulativeProbs[i] = (sortedSteps[i].conversionRate / 100) * cumulativeProbs[i + 1];
    }
  }

  // Calculate values for each step
  return sortedSteps.map((step, index) => {
    const baseValue = targetCAC * cumulativeProbs[index];

    // Calculate segment-specific values
    const segmentValues: Record<string, number> = {};
    for (const segment of segments) {
      segmentValues[segment.id] = baseValue * segment.multiplier;
    }

    const volumeStatus = getVolumeStatus(step.monthlyVolume);
    const recommendation = getRecommendation(
      volumeStatus,
      index,
      sortedSteps.length,
      step.monthlyVolume
    );

    return {
      stepId: step.id,
      stepName: step.name,
      monthlyVolume: step.monthlyVolume,
      conversionRate: step.conversionRate,
      cumulativeProbability: cumulativeProbs[index],
      baseValue,
      segmentValues,
      volumeStatus,
      recommendation,
    };
  });
}

/**
 * Format currency value for display
 */
export function formatCurrency(
  value: number,
  currency: string = 'AUD',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate derived metrics for display
 */
export interface DerivedMetrics {
  targetCAC: number;
  adjustedCAC: number;
  maxEventValue: number;
}

export function calculateDerivedMetrics(
  metrics: BusinessMetrics,
  calculatedValues: CalculatedValue[]
): DerivedMetrics {
  const targetCAC = metrics.ltv / metrics.ltvCacRatio;
  const adjustedCAC = calculateTargetCAC(metrics);
  const maxEventValue = calculatedValues.length > 0
    ? Math.max(...calculatedValues.map(v => v.baseValue))
    : adjustedCAC;

  return {
    targetCAC,
    adjustedCAC,
    maxEventValue,
  };
}
