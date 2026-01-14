import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/common';
import type { EventsByDay } from '@/types/api';

interface EventsChartProps {
  events: EventsByDay[];
}

export const EventsChart: React.FC<EventsChartProps> = ({ events }) => {
  // Transform data: group by date and pivot event names to columns
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, string | number>> = {};

    events.forEach((event) => {
      if (!byDate[event.date]) {
        byDate[event.date] = { date: event.date };
      }
      byDate[event.date][event.eventName] = event.count;
    });

    return Object.values(byDate).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [events]);

  // Get unique event names for lines
  const eventNames = useMemo(() => {
    const names = new Set<string>();
    events.forEach((e) => names.add(e.eventName));
    return Array.from(names);
  }, [events]);

  const colors = [
    '#2563eb', // blue
    '#059669', // green
    '#d97706', // amber
    '#dc2626', // red
    '#7c3aed', // purple
  ];

  if (chartData.length === 0) {
    return (
      <Card title="Events Over Time" className="h-80">
        <div className="flex items-center justify-center h-64 text-gray-500">
          No event data available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Events Over Time" subtitle="Conversion events by day">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value) => new Date(value as string).toLocaleDateString()}
            />
            <Legend />
            {eventNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
