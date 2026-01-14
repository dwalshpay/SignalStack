import React from 'react';
import { Card } from '@/components/common';
import type { MonitoringOverview } from '@/types/api';

interface OverviewCardsProps {
  overview: MonitoringOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: 'Total Events',
      value: overview.events.total.toLocaleString(),
      subtitle: `${overview.events.byPlatform.meta.toLocaleString()} Meta, ${overview.events.byPlatform.google.toLocaleString()} Google`,
      trend: calculateTrend(overview.events.trend7d),
    },
    {
      title: 'EMQ Score',
      value: overview.emq.current.toFixed(1),
      subtitle: `Target: ${overview.emq.target.toFixed(1)}`,
      trend: calculateTrend(overview.emq.trend7d),
      status: overview.emq.current >= overview.emq.target ? 'good' : 'warning',
    },
    {
      title: 'Avg Lead Score',
      value: overview.scores.average.toFixed(0),
      subtitle: `${overview.scores.distribution.high}% high quality`,
      trend: null,
    },
    {
      title: 'Total Value',
      value: formatCompactNumber(overview.values.total),
      subtitle: `Avg: ${formatCompactNumber(overview.values.average)}/lead`,
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </div>
            {card.trend !== null && (
              <TrendBadge value={card.trend} />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

interface TrendBadgeProps {
  value: number;
}

const TrendBadge: React.FC<TrendBadgeProps> = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPositive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
};

function calculateTrend(data: number[]): number {
  if (data.length < 2) return 0;
  const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const older = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  if (older === 0) return 0;
  return ((recent - older) / older) * 100;
}

function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
}
