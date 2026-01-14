import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/common';
import type { EMQTrendPoint } from '@/types/api';

interface EMQTrendProps {
  data: EMQTrendPoint[];
  target?: number;
}

export const EMQTrend: React.FC<EMQTrendProps> = ({ data, target = 7.0 }) => {
  if (data.length === 0) {
    return (
      <Card title="EMQ Score Trend" className="h-80">
        <div className="flex items-center justify-center h-64 text-gray-500">
          No EMQ data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="EMQ Score Trend" subtitle="Event Match Quality over time">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value as string).toLocaleDateString()}
              formatter={(value) => [Number(value).toFixed(2), 'EMQ Score']}
            />
            <ReferenceLine
              y={target}
              stroke="#059669"
              strokeDasharray="5 5"
              label={{ value: 'Target', position: 'right', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
