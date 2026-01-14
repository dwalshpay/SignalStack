import React from 'react';
import { Card } from '@/components/common';
import type { MonitoringOverview } from '@/types/api';

interface AlertsSummaryProps {
  alerts: MonitoringOverview['alerts'];
}

export const AlertsSummary: React.FC<AlertsSummaryProps> = ({ alerts }) => {
  const { activeIncidents, bySeverity } = alerts;

  if (activeIncidents === 0) {
    return (
      <Card title="Active Alerts" subtitle="System health status">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">All systems operational</p>
          <p className="text-xs text-gray-500 mt-1">No active alerts</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Active Alerts" subtitle={`${activeIncidents} active incident${activeIncidents > 1 ? 's' : ''}`}>
      <div className="space-y-3">
        {bySeverity.critical > 0 && (
          <AlertRow
            severity="critical"
            count={bySeverity.critical}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
          />
        )}
        {bySeverity.warning > 0 && (
          <AlertRow
            severity="warning"
            count={bySeverity.warning}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        )}
        {bySeverity.info > 0 && (
          <AlertRow
            severity="info"
            count={bySeverity.info}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        )}
      </div>
    </Card>
  );
};

interface AlertRowProps {
  severity: 'critical' | 'warning' | 'info';
  count: number;
  icon: React.ReactNode;
}

const AlertRow: React.FC<AlertRowProps> = ({ severity, count, icon }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
  };

  const style = styles[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${style.bg} ${style.border}`}
    >
      <div className={`flex items-center gap-3 ${style.text}`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-sm font-bold ${style.text}`}>{count}</span>
    </div>
  );
};
