import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getOverview,
  getEventsByDay,
  getEMQTrend,
  getScoreDistribution,
  getValueBySegment,
} from '@/lib/api';
import type {
  MonitoringOverview,
  EventsByDay,
  EMQTrendPoint,
  ScoreDistribution,
  ValueBySegment,
} from '@/types/api';
import { getErrorMessage } from '@/lib/api/errors';

interface UseMonitoringResult {
  overview: MonitoringOverview | null;
  events: EventsByDay[];
  emqTrend: EMQTrendPoint[];
  scoreDistribution: ScoreDistribution[];
  valueBySegment: ValueBySegment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMonitoring(days: number = 30): UseMonitoringResult {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [events, setEvents] = useState<EventsByDay[]>([]);
  const [emqTrend, setEmqTrend] = useState<EMQTrendPoint[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [valueBySegment, setValueBySegment] = useState<ValueBySegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = { days };
      const [
        overviewData,
        eventsData,
        emqData,
        scoresData,
        valuesData,
      ] = await Promise.all([
        getOverview(params),
        getEventsByDay(params),
        getEMQTrend(params),
        getScoreDistribution(params),
        getValueBySegment(params),
      ]);

      setOverview(overviewData);
      setEvents(eventsData);
      setEmqTrend(emqData);
      setScoreDistribution(scoresData);
      setValueBySegment(valuesData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, days]);

  // Fetch on mount and when days changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    overview,
    events,
    emqTrend,
    scoreDistribution,
    valueBySegment,
    isLoading,
    error,
    refresh: fetchData,
  };
}
