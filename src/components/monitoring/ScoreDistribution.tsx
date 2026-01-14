import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/components/common';
import type { ScoreDistribution as ScoreDistributionType } from '@/types/api';

interface ScoreDistributionProps {
  data: ScoreDistributionType[];
}

export const ScoreDistribution: React.FC<ScoreDistributionProps> = ({ data }) => {
  const getBarColor = (bucket: string): string => {
    const score = parseInt(bucket.split('-')[0], 10);
    if (score >= 70) return '#059669'; // green - high
    if (score >= 40) return '#d97706'; // amber - medium
    return '#dc2626'; // red - low
  };

  if (data.length === 0) {
    return (
      <Card title="Score Distribution" className="h-80">
        <div className="flex items-center justify-center h-64 text-gray-500">
          No score data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Score Distribution" subtitle="Lead scores by quality tier">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'count') return [Number(value).toLocaleString(), 'Leads'];
                return [value, name];
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bucket)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600">Low (0-40)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className="text-gray-600">Medium (40-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-600"></div>
          <span className="text-gray-600">High (70-100)</span>
        </div>
      </div>
    </Card>
  );
};
