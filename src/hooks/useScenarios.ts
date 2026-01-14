import { useState, useCallback, useMemo } from 'react';
import type { Scenario, ScenarioOverride, ScenarioResult, ScenarioStepValue } from '@/types/scenario';
import type { BusinessMetrics, FunnelStep, AudienceSegment } from '@/types';
import { calculateFunnelValues, calculateTargetCAC } from '@/lib/calculations';

interface UseScenarioProps {
  baseMetrics: BusinessMetrics;
  baseFunnel: FunnelStep[];
  segments: AudienceSegment[];
}

export function useScenarios({ baseMetrics, baseFunnel, segments }: UseScenarioProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'baseline',
      name: 'Current',
      overrides: [],
      isBaseline: true
    }
  ]);

  const addScenario = useCallback(() => {
    if (scenarios.length >= 3) return;

    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name: `Scenario ${scenarios.length}`,
      overrides: [],
      isBaseline: false
    };

    setScenarios(prev => [...prev, newScenario]);
  }, [scenarios.length]);

  const updateScenario = useCallback((id: string, updates: Partial<Scenario>) => {
    setScenarios(prev =>
      prev.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => !s.isBaseline && s.id !== id ? true : s.isBaseline));
  }, []);

  const addOverride = useCallback((scenarioId: string, override: ScenarioOverride) => {
    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== scenarioId) return s;
        // Remove any existing override of the same type (and stepId if applicable)
        const filteredOverrides = s.overrides.filter(o => {
          if (o.type !== override.type) return true;
          if (o.type === 'conversionRate' && o.stepId !== override.stepId) return true;
          return false;
        });
        return { ...s, overrides: [...filteredOverrides, override] };
      })
    );
  }, []);

  const removeOverride = useCallback((scenarioId: string, overrideType: string, stepId?: string) => {
    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== scenarioId) return s;
        return {
          ...s,
          overrides: s.overrides.filter(o => {
            if (o.type !== overrideType) return true;
            if (o.type === 'conversionRate' && o.stepId !== stepId) return true;
            return false;
          })
        };
      })
    );
  }, []);

  // Calculate results for each scenario
  const scenarioResults = useMemo((): ScenarioResult[] => {
    // First calculate baseline values
    const baselineValues = calculateFunnelValues(baseFunnel, baseMetrics, segments);

    return scenarios.map(scenario => {
      // Apply overrides to metrics and funnel
      let modifiedMetrics = { ...baseMetrics };
      let modifiedFunnel = [...baseFunnel];

      for (const override of scenario.overrides) {
        switch (override.type) {
          case 'ltv':
            modifiedMetrics.ltv = override.value;
            break;
          case 'ltvCacRatio':
            modifiedMetrics.ltvCacRatio = override.value;
            break;
          case 'grossMargin':
            modifiedMetrics.grossMargin = override.value;
            break;
          case 'conversionRate':
            if (override.stepId) {
              modifiedFunnel = modifiedFunnel.map(step =>
                step.id === override.stepId
                  ? { ...step, conversionRate: override.value }
                  : step
              );
            }
            break;
        }
      }

      // Calculate values with modified data
      const calculatedValues = calculateFunnelValues(modifiedFunnel, modifiedMetrics, segments);
      const targetCAC = calculateTargetCAC(modifiedMetrics);

      // Build step values with difference from baseline
      const values: ScenarioStepValue[] = calculatedValues.map((cv, index) => {
        const baselineValue = baselineValues[index]?.baseValue || 0;
        const differenceAmount = cv.baseValue - baselineValue;
        const differenceFromBaseline = baselineValue !== 0
          ? ((cv.baseValue - baselineValue) / baselineValue) * 100
          : 0;

        return {
          stepId: cv.stepId,
          stepName: cv.stepName,
          baseValue: cv.baseValue,
          differenceAmount: scenario.isBaseline ? undefined : differenceAmount,
          differenceFromBaseline: scenario.isBaseline ? undefined : differenceFromBaseline
        };
      });

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        targetCAC,
        values
      };
    });
  }, [scenarios, baseMetrics, baseFunnel, segments]);

  const canAddScenario = scenarios.length < 3;

  return {
    scenarios,
    scenarioResults,
    addScenario,
    updateScenario,
    removeScenario,
    addOverride,
    removeOverride,
    canAddScenario
  };
}
