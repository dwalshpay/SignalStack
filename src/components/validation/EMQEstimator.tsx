import React, { useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { EMQScoreDisplay } from './EMQScoreDisplay';
import { useStore, useEMQMatchKeys } from '@/store/useStore';
import { calculateEMQScore, getEMQRecommendations } from '@/lib/emqCalculator';

export const EMQEstimator: React.FC = () => {
  const matchKeys = useEMQMatchKeys();
  const setEMQMatchKey = useStore((state) => state.setEMQMatchKey);

  const estimate = useMemo(() => calculateEMQScore(matchKeys), [matchKeys]);
  const recommendations = useMemo(() => getEMQRecommendations(estimate), [estimate]);

  // Group match keys by importance
  const highImpactKeys = estimate.matchKeys.filter((k) => k.weight >= 1.5);
  const mediumImpactKeys = estimate.matchKeys.filter((k) => k.weight >= 0.5 && k.weight < 1.5);
  const lowImpactKeys = estimate.matchKeys.filter((k) => k.weight < 0.5);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <EMQScoreDisplay estimate={estimate} size="lg" />

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Event Match Quality Score
            </h3>
            <p className="text-gray-600 mb-4">
              EMQ measures how well Meta can match your conversion events to users.
              A higher score means better attribution and more effective ad optimisation.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Available Keys:</span>
                <span className="ml-2 font-medium">
                  {estimate.matchKeys.filter((k) => k.available).length} / {estimate.matchKeys.length}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Base Score:</span>
                <span className="ml-2 font-medium">3.0</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Match Key Toggles */}
      <Card title="Match Keys" subtitle="Toggle the data points you collect">
        <div className="space-y-6">
          {/* High Impact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              High Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highImpactKeys.map((key) => (
                <MatchKeyToggle
                  key={key.key}
                  matchKey={key}
                  onChange={(available) => setEMQMatchKey(key.key, available)}
                />
              ))}
            </div>
          </div>

          {/* Medium Impact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Medium Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mediumImpactKeys.map((key) => (
                <MatchKeyToggle
                  key={key.key}
                  matchKey={key}
                  onChange={(available) => setEMQMatchKey(key.key, available)}
                />
              ))}
            </div>
          </div>

          {/* Low Impact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              Low Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowImpactKeys.map((key) => (
                <MatchKeyToggle
                  key={key.key}
                  matchKey={key}
                  onChange={(available) => setEMQMatchKey(key.key, available)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card title="Recommendations" subtitle="Ways to improve your EMQ score">
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">→</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

// Match Key Toggle Component
interface MatchKeyToggleProps {
  matchKey: { key: string; label: string; weight: number; available: boolean };
  onChange: (available: boolean) => void;
}

const MatchKeyToggle: React.FC<MatchKeyToggleProps> = ({ matchKey, onChange }) => {
  return (
    <label
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
        matchKey.available
          ? 'border-primary-300 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={matchKey.available}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <div>
          <span className="font-medium text-gray-900">{matchKey.label}</span>
          <span className="ml-2 text-xs text-gray-500">+{matchKey.weight}</span>
        </div>
      </div>
    </label>
  );
};
