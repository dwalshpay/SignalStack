import React from 'react';
import { Card, Button } from '@/components/common';
import { ScenarioPanel } from './ScenarioPanel';
import { useScenarios } from '@/hooks/useScenarios';
import type { BusinessMetrics, FunnelStep, AudienceSegment } from '@/types';

interface ScenarioCompareProps {
  metrics: BusinessMetrics;
  funnel: FunnelStep[];
  segments: AudienceSegment[];
}

export const ScenarioCompare: React.FC<ScenarioCompareProps> = ({
  metrics,
  funnel,
  segments
}) => {
  const {
    scenarios,
    scenarioResults,
    addScenario,
    updateScenario,
    removeScenario,
    addOverride,
    removeOverride,
    canAddScenario
  } = useScenarios({
    baseMetrics: metrics,
    baseFunnel: funnel,
    segments
  });

  const addButton = canAddScenario ? (
    <Button variant="outline" size="sm" onClick={addScenario}>
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Scenario
    </Button>
  ) : (
    <span className="text-sm text-gray-500">Max 3 scenarios</span>
  );

  return (
    <Card
      title="Scenario Comparison"
      subtitle="Compare different business assumptions side-by-side"
      action={addButton}
    >
      <div className={`grid gap-4 ${
        scenarios.length === 1 ? 'grid-cols-1 max-w-md' :
        scenarios.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {scenarios.map((scenario) => {
          const result = scenarioResults.find(r => r.scenarioId === scenario.id);
          if (!result) return null;

          return (
            <ScenarioPanel
              key={scenario.id}
              scenario={scenario}
              result={result}
              funnelSteps={funnel}
              currency={metrics.currency}
              onUpdateName={(name) => updateScenario(scenario.id, { name })}
              onAddOverride={(override) => addOverride(scenario.id, override)}
              onRemoveOverride={(type, stepId) => removeOverride(scenario.id, type, stepId)}
              onRemove={scenario.isBaseline ? undefined : () => removeScenario(scenario.id)}
            />
          );
        })}
      </div>

      {scenarios.length === 1 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Add a scenario to compare different LTV values, target ratios, or conversion rates side-by-side.
          </p>
        </div>
      )}
    </Card>
  );
};
