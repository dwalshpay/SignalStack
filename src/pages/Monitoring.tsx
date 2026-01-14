import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, useToast } from '@/components/common';
import {
  OverviewCards,
  EventsChart,
  EMQTrend,
  ScoreDistribution,
  ValueBreakdown,
  IntegrationStatus,
  AlertsSummary,
} from '@/components/monitoring';
import { useMonitoring } from '@/hooks/useMonitoring';

export const Monitoring: React.FC = () => {
  const { addToast } = useToast();
  const [days, setDays] = useState(30);

  const {
    overview,
    events,
    emqTrend,
    scoreDistribution,
    valueBySegment,
    isLoading,
    error,
    refresh,
  } = useMonitoring(days);

  const handleRefresh = async () => {
    await refresh();
    addToast('success', 'Dashboard refreshed');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading monitoring data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">Failed to load monitoring data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button variant="primary" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>
            <p className="text-sm text-gray-500">
              Track your ad signal performance and integration health
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && <OverviewCards overview={overview} />}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventsChart events={events} />
          <EMQTrend data={emqTrend} target={overview?.emq.target} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreDistribution data={scoreDistribution} />
          <ValueBreakdown data={valueBySegment} />
        </div>

        {/* Integration Status & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {overview && (
            <>
              <IntegrationStatus
                syncStatus={overview.syncStatus}
                matchRates={overview.matchRates}
              />
              <AlertsSummary alerts={overview.alerts} />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
