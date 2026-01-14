import React from 'react';
import { Card } from '@/components/common';
import type { MonitoringOverview } from '@/types/api';

interface IntegrationStatusProps {
  syncStatus: MonitoringOverview['syncStatus'];
  matchRates: MonitoringOverview['matchRates'];
}

export const IntegrationStatus: React.FC<IntegrationStatusProps> = ({
  syncStatus,
  matchRates,
}) => {
  const integrations = [
    {
      name: 'Meta CAPI',
      key: 'meta_capi',
      matchRate: matchRates.meta,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      ),
    },
    {
      name: 'Google Ads',
      key: 'google_ads',
      matchRate: matchRates.google,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      ),
    },
  ];

  return (
    <Card title="Integration Status" subtitle="Platform connections and sync status">
      <div className="space-y-4">
        {integrations.map((integration) => {
          const status = syncStatus[integration.key];
          const isActive = status?.status === 'ACTIVE';
          const lastSync = status?.lastSync
            ? new Date(status.lastSync).toLocaleString()
            : 'Never';

          return (
            <div
              key={integration.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {integration.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {integration.name}
                  </p>
                  <p className="text-xs text-gray-500">Last sync: {lastSync}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={status?.status || 'PENDING'} />
                <p className="text-xs text-gray-500 mt-1">
                  {integration.matchRate.toFixed(1)}% match rate
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ERROR: 'bg-red-100 text-red-800',
    DISABLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
};
