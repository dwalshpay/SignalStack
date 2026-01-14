import React, { useCallback } from 'react';
import { Card, Input, Select } from '@/components/common';
import { CURRENCIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';
import type { BusinessMetrics, CurrencyCode } from '@/types';

interface DerivedMetrics {
  targetCAC: number;
  adjustedCAC: number;
  maxEventValue: number;
}

interface BusinessMetricsEditorProps {
  metrics: BusinessMetrics;
  derivedMetrics: DerivedMetrics;
  onUpdate: (updates: Partial<BusinessMetrics>) => void;
}

// Currency options for select
const currencyOptions = Object.entries(CURRENCIES).map(([code, { name }]) => ({
  value: code,
  label: `${code} - ${name}`
}));

export const BusinessMetricsEditor: React.FC<BusinessMetricsEditorProps> = ({
  metrics,
  derivedMetrics,
  onUpdate
}) => {
  const currencySymbol = CURRENCIES[metrics.currency]?.symbol || '$';

  const handleLtvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({ ltv: value });
  }, [onUpdate]);

  const handleRatioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({ ltvCacRatio: value });
  }, [onUpdate]);

  const handleMarginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    // Clamp between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    onUpdate({ grossMargin: clampedValue });
  }, [onUpdate]);

  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ currency: e.target.value as CurrencyCode });
  }, [onUpdate]);

  return (
    <Card title="Business Metrics" subtitle="Configure your LTV and target ratios">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* LTV Input */}
        <div>
          <Input
            label="Customer LTV"
            type="number"
            min={0}
            step={100}
            leftAddon={currencySymbol}
            value={metrics.ltv}
            onChange={handleLtvChange}
            hint="Average lifetime value"
          />
        </div>

        {/* LTV:CAC Ratio Input */}
        <div>
          <Input
            label="LTV:CAC Ratio"
            type="number"
            min={0.1}
            step={0.5}
            rightAddon=":1"
            value={metrics.ltvCacRatio}
            onChange={handleRatioChange}
            hint="Target ratio (e.g., 4:1)"
          />
        </div>

        {/* Gross Margin Input */}
        <div>
          <Input
            label="Gross Margin"
            type="number"
            min={0}
            max={100}
            step={1}
            rightAddon="%"
            value={metrics.grossMargin}
            onChange={handleMarginChange}
            hint="Product margin percentage"
          />
        </div>

        {/* Currency Selector */}
        <div>
          <Select
            label="Currency"
            options={currencyOptions}
            value={metrics.currency}
            onChange={handleCurrencyChange}
          />
        </div>

        {/* Target CAC (Derived - Read Only) */}
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 flex flex-col justify-center">
          <p className="text-sm text-primary-600 mb-1">Target CAC</p>
          <p className="text-2xl font-semibold text-primary-700">
            {formatCurrency(derivedMetrics.targetCAC, metrics.currency)}
          </p>
          <p className="text-xs text-primary-500 mt-1">
            LTV / Ratio × Margin
          </p>
        </div>
      </div>
    </Card>
  );
};
