import type { Decimal } from '@prisma/client/runtime/library';
import type { FunnelStep } from '../types/index.js';

// Platform thresholds from frontend constants
const PLATFORM_THRESHOLDS = {
  google: { minimum: 15, recommended: 50 },
  meta: { minimum: 200, recommended: 200 },
};

export type VolumeStatus = 'sufficient' | 'borderline' | 'insufficient';

export interface BusinessMetricsInput {
  ltv: number | Decimal;
  ltvCacRatio: number | Decimal;
  grossMargin: number | Decimal;
  currency: string;
}

export interface CalculatedValue {
  stepId: string;
  stepName: string;
  eventName: string;
  monthlyVolume: number;
  conversionRate: number;
  cumulativeProbability: number;
  baseValue: number;
  volumeStatus: VolumeStatus;
}

/**
 * Calculate Target CAC from business metrics
 * Formula: Target CAC = LTV / LTV:CAC Ratio × (Gross Margin / 100)
 * Ported from frontend: /src/lib/calculations.ts
 */
export function calculateTargetCAC(metrics: BusinessMetricsInput): number {
  const ltv = Number(metrics.ltv);
  const ltvCacRatio = Number(metrics.ltvCacRatio);
  const grossMargin = Number(metrics.grossMargin);

  const baseCAC = ltv / ltvCacRatio;
  return baseCAC * (grossMargin / 100);
}

/**
 * Determine volume status based on platform thresholds
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
 * Calculate funnel values for all steps
 * Ported from frontend: /src/lib/calculations.ts
 */
export function calculateFunnelValues(
  steps: FunnelStep[],
  metrics: BusinessMetricsInput
): CalculatedValue[] {
  const targetCAC = calculateTargetCAC(metrics);

  // Sort steps by order (ascending)
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  // Calculate cumulative probabilities from bottom up
  const cumulativeProbs: number[] = new Array(sortedSteps.length);

  for (let i = sortedSteps.length - 1; i >= 0; i--) {
    if (i === sortedSteps.length - 1) {
      cumulativeProbs[i] = 1;
    } else {
      cumulativeProbs[i] = (sortedSteps[i].conversionRate / 100) * cumulativeProbs[i + 1];
    }
  }

  return sortedSteps.map((step, index) => {
    const baseValue = targetCAC * cumulativeProbs[index];
    const volumeStatus = getVolumeStatus(step.monthlyVolume);

    return {
      stepId: step.id,
      stepName: step.name,
      eventName: step.eventName,
      monthlyVolume: step.monthlyVolume,
      conversionRate: step.conversionRate,
      cumulativeProbability: cumulativeProbs[index],
      baseValue,
      volumeStatus,
    };
  });
}

/**
 * Get the calculated value for a specific event
 */
export function getEventValue(
  eventName: string,
  steps: FunnelStep[],
  metrics: BusinessMetricsInput
): { baseValue: number; volumeStatus: VolumeStatus } | null {
  const values = calculateFunnelValues(steps, metrics);
  const eventValue = values.find((v) => v.eventName === eventName);

  if (!eventValue) {
    return null;
  }

  return {
    baseValue: eventValue.baseValue,
    volumeStatus: eventValue.volumeStatus,
  };
}
