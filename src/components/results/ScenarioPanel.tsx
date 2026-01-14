import React from 'react';
import { Button, Input, Select } from '@/components/common';
import { formatCurrency } from '@/lib/calculations';
import type { Scenario, ScenarioResult, ScenarioOverride, ScenarioOverrideType } from '@/types/scenario';
import type { FunnelStep, CurrencyCode } from '@/types';

interface ScenarioPanelProps {
  scenario: Scenario;
  result: ScenarioResult;
  funnelSteps: FunnelStep[];
  currency: CurrencyCode;
  onUpdateName: (name: string) => void;
  onAddOverride: (override: ScenarioOverride) => void;
  onRemoveOverride: (type: string, stepId?: string) => void;
  onRemove?: () => void;
}

const overrideTypeOptions = [
  { value: 'ltv', label: 'LTV' },
  { value: 'ltvCacRatio', label: 'LTV:CAC Ratio' },
  { value: 'grossMargin', label: 'Gross Margin' },
  { value: 'conversionRate', label: 'Conversion Rate' }
];

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  scenario,
  result,
  funnelSteps,
  currency,
  onUpdateName,
  onAddOverride,
  onRemoveOverride,
  onRemove
}) => {
  const [selectedType, setSelectedType] = React.useState<ScenarioOverrideType>('ltv');
  const [selectedStepId, setSelectedStepId] = React.useState<string>(funnelSteps[0]?.id || '');
  const [overrideValue, setOverrideValue] = React.useState<string>('');

  const handleAddOverride = () => {
    const value = parseFloat(overrideValue);
    if (isNaN(value)) return;

    const override: ScenarioOverride = {
      type: selectedType,
      value,
      stepId: selectedType === 'conversionRate' ? selectedStepId : undefined
    };

    onAddOverride(override);
    setOverrideValue('');
  };

  const getOverrideLabel = (override: ScenarioOverride): string => {
    if (override.type === 'conversionRate') {
      const step = funnelSteps.find(s => s.id === override.stepId);
      return `${step?.name || 'Step'}: ${override.value}%`;
    }
    if (override.type === 'grossMargin') {
      return `Margin: ${override.value}%`;
    }
    if (override.type === 'ltvCacRatio') {
      return `Ratio: ${override.value}:1`;
    }
    return `LTV: ${formatCurrency(override.value, currency)}`;
  };

  return (
    <div className={`flex flex-col h-full ${scenario.isBaseline ? 'bg-gray-50' : 'bg-white'} rounded-lg border ${scenario.isBaseline ? 'border-gray-200' : 'border-primary-200'} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {scenario.isBaseline ? (
          <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
        ) : (
          <Input
            value={scenario.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="text-sm font-semibold"
          />
        )}
        {onRemove && !scenario.isBaseline && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* Target CAC */}
      <div className="mb-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-xs text-primary-600">Target CAC</p>
        <p className="text-lg font-semibold text-primary-700">
          {formatCurrency(result.targetCAC, currency)}
        </p>
      </div>

      {/* Overrides (for non-baseline scenarios) */}
      {!scenario.isBaseline && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">OVERRIDES</p>

          {/* Current overrides */}
          <div className="space-y-1 mb-3">
            {scenario.overrides.map((override, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-gray-100 rounded px-2 py-1">
                <span>{getOverrideLabel(override)}</span>
                <button
                  onClick={() => onRemoveOverride(override.type, override.stepId)}
                  className="text-gray-400 hover:text-error"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add override */}
          <div className="space-y-2">
            <Select
              options={overrideTypeOptions}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ScenarioOverrideType)}
            />

            {selectedType === 'conversionRate' && (
              <Select
                options={funnelSteps.map(s => ({ value: s.id, label: s.name }))}
                value={selectedStepId}
                onChange={(e) => setSelectedStepId(e.target.value)}
              />
            )}

            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Value"
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value)}
                rightAddon={selectedType === 'ltv' ? currency : selectedType === 'ltvCacRatio' ? ':1' : '%'}
              />
              <Button variant="outline" size="sm" onClick={handleAddOverride}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Values Table */}
      <div className="flex-1 overflow-auto">
        <p className="text-xs font-medium text-gray-500 mb-2">EVENT VALUES</p>
        <div className="space-y-1">
          {result.values.map((value) => (
            <div key={value.stepId} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 truncate max-w-[120px]">{value.stepName}</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">
                  {formatCurrency(value.baseValue, currency)}
                </span>
                {value.differenceFromBaseline !== undefined && value.differenceFromBaseline !== 0 && (
                  <span className={`ml-1 text-xs ${value.differenceFromBaseline > 0 ? 'text-success' : 'text-error'}`}>
                    {value.differenceFromBaseline > 0 ? '+' : ''}{value.differenceFromBaseline.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
