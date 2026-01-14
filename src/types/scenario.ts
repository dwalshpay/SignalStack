// Types for scenario modelling

export type ScenarioOverrideType = 'ltv' | 'ltvCacRatio' | 'grossMargin' | 'conversionRate';

export interface ScenarioOverride {
  type: ScenarioOverrideType;
  stepId?: string;  // Only used for conversionRate overrides
  value: number;
}

export interface Scenario {
  id: string;
  name: string;
  overrides: ScenarioOverride[];
  isBaseline: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  targetCAC: number;
  values: ScenarioStepValue[];
}

export interface ScenarioStepValue {
  stepId: string;
  stepName: string;
  baseValue: number;
  differenceFromBaseline?: number;  // Percentage difference
  differenceAmount?: number;        // Absolute difference
}
