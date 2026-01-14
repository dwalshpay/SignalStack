import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  calculateFunnelValues,
  calculateDerivedMetrics,
  type DerivedMetrics
} from '@/lib/calculations';
import type { CalculatedValue } from '@/types';

interface UseCalculatorReturn {
  calculatedValues: CalculatedValue[];
  values: CalculatedValue[]; // Alias for calculatedValues
  derivedMetrics: DerivedMetrics;
  isValid: boolean;
}

export function useCalculator(): UseCalculatorReturn {
  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);
  const segments = useStore((state) => state.segments);

  const calculatedValues = useMemo(() => {
    if (funnel.length === 0 || metrics.ltv <= 0 || metrics.ltvCacRatio <= 0) {
      return [];
    }
    return calculateFunnelValues(funnel, metrics, segments);
  }, [funnel, metrics, segments]);

  const derivedMetrics = useMemo(() => {
    return calculateDerivedMetrics(metrics, calculatedValues);
  }, [metrics, calculatedValues]);

  const isValid = funnel.length >= 2 && metrics.ltv > 0 && metrics.ltvCacRatio > 0;

  return {
    calculatedValues,
    values: calculatedValues, // Alias for convenience
    derivedMetrics,
    isValid,
  };
}
