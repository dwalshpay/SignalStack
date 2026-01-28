import React, { useMemo } from 'react';
import { Card, Badge } from '@/components/common';
import { calculateBreakevenAnalysis, formatCurrency } from '@/lib/calculations';
import type { CalculatedValue, AudienceSegment, CurrencyCode } from '@/types';

interface BreakevenAnalysisProps {
  calculatedValues: CalculatedValue[];
  segments: AudienceSegment[];
  currency: CurrencyCode;
}

export const BreakevenAnalysis: React.FC<BreakevenAnalysisProps> = ({
  calculatedValues,
  segments,
  currency,
}) => {
  // Find the consumer segment multiplier (default to 0.1 if not found)
  const consumerSegment = segments.find(
    (s) => s.name.toLowerCase().includes('consumer') || s.multiplier < 0.5
  );
  const consumerMultiplier = consumerSegment?.multiplier || 0.1;

  const breakevenResults = useMemo(
    () => calculateBreakevenAnalysis(calculatedValues, consumerMultiplier),
    [calculatedValues, consumerMultiplier]
  );

  // Count how many steps have profitable consumer traffic
  const profitableSteps = breakevenResults.filter((r) => r.isProfitable);
  const allProfitable = profitableSteps.length === breakevenResults.length;
  const noneProfitable = profitableSteps.length === 0;

  if (calculatedValues.length === 0) {
    return null;
  }

  return (
    <Card
      title="Breakeven Analysis"
      subtitle="At what point does consumer traffic become worth bidding on?"
    >
      {/* Summary */}
      <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          {allProfitable ? (
            <Badge variant="success">All Steps Profitable</Badge>
          ) : noneProfitable ? (
            <Badge variant="error">No Profitable Consumer Events</Badge>
          ) : (
            <Badge variant="warning">{profitableSteps.length} of {breakevenResults.length} Profitable</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          With a consumer multiplier of <strong>{(consumerMultiplier * 100).toFixed(0)}%</strong>,
          {allProfitable
            ? ' all funnel events generate positive value from consumer traffic.'
            : noneProfitable
            ? ' none of your funnel events justify bidding on consumer traffic.'
            : ` only ${profitableSteps.length} event${profitableSteps.length > 1 ? 's' : ''} generate${profitableSteps.length === 1 ? 's' : ''} positive value from consumer traffic.`}
        </p>
      </div>

      {/* Detailed breakdown */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consumer Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breakeven Multiplier
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {breakevenResults.map((result) => (
              <tr key={result.stepId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{result.stepName}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(result.baseValue, currency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  <span className={result.isProfitable ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {formatCurrency(result.consumerValue, currency)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {result.breakevenMultiplier === Infinity
                    ? 'N/A'
                    : `${(result.breakevenMultiplier * 100).toFixed(2)}%`}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {result.isProfitable ? (
                    <span className="inline-flex items-center text-green-600" title="Consumer traffic is profitable">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-500" title={`Need ${(result.breakevenMultiplier * 100).toFixed(1)}% multiplier`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insight */}
      {!allProfitable && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-1">Insight</h4>
          <p className="text-sm text-amber-800">
            {noneProfitable ? (
              <>
                Consumer traffic is not worth bidding on at any funnel stage with the current {(consumerMultiplier * 100).toFixed(0)}% multiplier.
                Consider blocking consumer emails entirely or using a higher multiplier if consumer conversion quality improves.
              </>
            ) : (
              <>
                Consider bidding on consumer traffic for{' '}
                <strong>{profitableSteps.map((s) => s.stepName).join(', ')}</strong>{' '}
                where the consumer value exceeds minimum bid thresholds.
              </>
            )}
          </p>
        </div>
      )}
    </Card>
  );
};
