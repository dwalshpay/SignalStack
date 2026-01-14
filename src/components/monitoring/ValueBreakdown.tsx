import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/common';
import type { ValueBySegment } from '@/types/api';

interface ValueBreakdownProps {
  data: ValueBySegment[];
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export const ValueBreakdown: React.FC<ValueBreakdownProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.segment,
    value: item.totalValue,
    count: item.count,
    average: item.averageValue,
  }));

  if (data.length === 0) {
    return (
      <Card title="Value by Segment" className="h-80">
        <div className="flex items-center justify-center h-64 text-gray-500">
          No value data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Value by Segment" subtitle="Total conversion value distribution">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => {
                const item = chartData.find((d) => d.name === value);
                return (
                  <span className="text-sm text-gray-600">
                    {value} ({item?.count.toLocaleString()} leads)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
