import React, { useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, VolumeStatusBadge } from '@/components/common';
import { BusinessMetricsEditor } from '@/components/metrics';
import { FunnelBuilder } from '@/components/funnel';
import { SegmentList } from '@/components/segments';
import { ScenarioCompare } from '@/components/results';
import { useStore } from '@/store/useStore';
import { useCalculator, useFunnel } from '@/hooks';
import { downloadJSON, downloadCSV } from '@/lib/export';
import { formatCurrency } from '@/lib/calculations';

export const Calculator: React.FC = () => {
  // Funnel state and actions
  const {
    funnel,
    updateStep,
    addStep,
    removeStep,
    reorderSteps,
    canAddStep,
    canRemoveStep
  } = useFunnel();

  // Metrics state and actions
  const metrics = useStore((state) => state.metrics);
  const updateMetrics = useStore((state) => state.updateMetrics);

  // Segments state and actions
  const segments = useStore((state) => state.segments);
  const addSegment = useStore((state) => state.addSegment);
  const updateSegment = useStore((state) => state.updateSegment);
  const removeSegment = useStore((state) => state.removeSegment);

  // Calculated values
  const { calculatedValues, derivedMetrics } = useCalculator();

  // Export handlers
  const handleExport = useCallback(() => {
    downloadCSV(calculatedValues, segments, metrics.currency);
  }, [calculatedValues, segments, metrics.currency]);

  const handleSave = useCallback(() => {
    downloadJSON({ funnel, metrics, segments });
  }, [funnel, metrics, segments]);

  return (
    <MainLayout onSave={handleSave} onExport={handleExport}>
      <div className="space-y-6">
        {/* Editable Business Metrics */}
        <BusinessMetricsEditor
          metrics={metrics}
          derivedMetrics={derivedMetrics}
          onUpdate={updateMetrics}
        />

        {/* Funnel Builder with Drag & Drop */}
        <FunnelBuilder
          steps={funnel}
          onReorder={reorderSteps}
          onUpdateStep={updateStep}
          onAddStep={addStep}
          onRemoveStep={removeStep}
          canAddStep={canAddStep}
          canRemoveStep={canRemoveStep}
        />

        {/* Editable Segments */}
        <SegmentList
          segments={segments}
          onAdd={addSegment}
          onUpdate={updateSegment}
          onRemove={removeSegment}
        />

        {/* Results Table */}
        <Card title="Calculated Values" subtitle="Event values based on your funnel configuration">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Value
                  </th>
                  {segments.map((s) => (
                    <th
                      key={s.id}
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculatedValues.map((value) => (
                  <tr key={value.stepId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{value.stepName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value.monthlyVolume.toLocaleString()}/mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <VolumeStatusBadge status={value.volumeStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(value.cumulativeProbability * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(value.baseValue, metrics.currency)}
                    </td>
                    {segments.map((s) => (
                      <td
                        key={s.id}
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right"
                      >
                        {formatCurrency(value.segmentValues[s.id] || 0, metrics.currency)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          {calculatedValues.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {calculatedValues
                  .filter(v => v.volumeStatus === 'sufficient')
                  .slice(0, 2)
                  .map(v => (
                    <li key={v.stepId}>
                      <strong>{v.stepName}</strong>: {v.recommendation}
                    </li>
                  ))}
                {calculatedValues.filter(v => v.volumeStatus === 'insufficient').length > 0 && (
                  <li className="text-amber-700">
                    Events with insufficient volume ({calculatedValues.filter(v => v.volumeStatus === 'insufficient').map(v => v.stepName).join(', ')}) should be used for measurement only.
                  </li>
                )}
              </ul>
            </div>
          )}
        </Card>

        {/* Scenario Comparison */}
        <ScenarioCompare
          metrics={metrics}
          funnel={funnel}
          segments={segments}
        />
      </div>
    </MainLayout>
  );
};
