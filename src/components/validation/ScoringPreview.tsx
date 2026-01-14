import React, { useMemo } from 'react';
import { Card } from '@/components/common/Card';
import type { ScoringRule } from '@/types';
import { scoreToMultiplier, getMaxPossibleScore } from '@/lib/scoringCalculations';
import { SCORING } from '@/lib/constants';

interface ScoringPreviewProps {
  rules: ScoringRule[];
}

export const ScoringPreview: React.FC<ScoringPreviewProps> = ({ rules }) => {
  const enabledRules = rules.filter((r) => r.enabled);
  const maxPossibleScore = getMaxPossibleScore(rules);

  // Generate example multipliers at different score levels
  const examples = useMemo(() => {
    const scores = [0, 25, 50, 75, 100];
    return scores.map((score) => ({
      score,
      multiplier: scoreToMultiplier(score),
    }));
  }, []);

  // Calculate points by category
  const pointsByCategory = useMemo(() => {
    const categories = {
      firmographic: 0,
      behavioural: 0,
      engagement: 0,
    };
    for (const rule of enabledRules) {
      categories[rule.category] += rule.points;
    }
    return categories;
  }, [enabledRules]);

  return (
    <Card title="Scoring Preview" subtitle="See how scores translate to value multipliers">
      <div className="space-y-6">
        {/* Score to Multiplier Visual */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Score to Multiplier Scale</h4>
          <div className="relative h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full overflow-hidden">
            {/* Score markers */}
            {examples.map(({ score, multiplier }) => (
              <div
                key={score}
                className="absolute top-full transform -translate-x-1/2"
                style={{ left: `${score}%` }}
              >
                <div className="w-px h-2 bg-gray-400 mx-auto" />
                <div className="text-xs text-gray-600 text-center mt-1">
                  <div className="font-medium">{score}</div>
                  <div className="text-gray-500">{multiplier}x</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-8">
            <span>Low Value ({SCORING.minMultiplier}x)</span>
            <span>High Value ({SCORING.maxMultiplier}x)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Rules" value={enabledRules.length} />
          <StatCard label="Max Possible Score" value={maxPossibleScore} />
          <StatCard label="Min Multiplier" value={`${SCORING.minMultiplier}x`} />
          <StatCard label="Max Multiplier" value={`${SCORING.maxMultiplier}x`} />
        </div>

        {/* Points by Category */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Points by Category</h4>
          <div className="space-y-2">
            <CategoryBar
              label="Firmographic"
              points={pointsByCategory.firmographic}
              maxPoints={maxPossibleScore}
              color="bg-purple-500"
            />
            <CategoryBar
              label="Behavioural"
              points={pointsByCategory.behavioural}
              maxPoints={maxPossibleScore}
              color="bg-blue-500"
            />
            <CategoryBar
              label="Engagement"
              points={pointsByCategory.engagement}
              maxPoints={maxPossibleScore}
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">How It Works</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              1. Each lead is evaluated against all enabled scoring rules
            </p>
            <p>
              2. Points from matching rules are summed (capped at 100)
            </p>
            <p>
              3. Score is converted to a multiplier: <code className="text-xs bg-gray-200 px-1 rounded">0.1 + (score/100) × 1.9</code>
            </p>
            <p>
              4. The multiplier adjusts the conversion value for ad platforms
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

interface CategoryBarProps {
  label: string;
  points: number;
  maxPoints: number;
  color: string;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ label, points, maxPoints, color }) => {
  const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-12 text-right">{points} pts</span>
    </div>
  );
};
