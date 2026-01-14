// Monitoring API endpoints

import { api } from './client';
import type {
  MonitoringOverview,
  EventsByDay,
  EMQTrendPoint,
  ScoreDistribution,
  ValueBySegment,
} from '../../types/api';

export interface MonitoringQueryParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

function buildQueryString(params?: MonitoringQueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.days !== undefined) searchParams.set('days', params.days.toString());
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getOverview(params?: MonitoringQueryParams): Promise<MonitoringOverview> {
  return api.get<MonitoringOverview>(`/monitoring/overview${buildQueryString(params)}`);
}

export async function getEventsByDay(params?: MonitoringQueryParams): Promise<EventsByDay[]> {
  return api.get<EventsByDay[]>(`/monitoring/events${buildQueryString(params)}`);
}

export async function getEMQTrend(params?: MonitoringQueryParams): Promise<EMQTrendPoint[]> {
  return api.get<EMQTrendPoint[]>(`/monitoring/emq${buildQueryString(params)}`);
}

export async function getScoreDistribution(params?: MonitoringQueryParams): Promise<ScoreDistribution[]> {
  return api.get<ScoreDistribution[]>(`/monitoring/scores${buildQueryString(params)}`);
}

export async function getValueBySegment(params?: MonitoringQueryParams): Promise<ValueBySegment[]> {
  return api.get<ValueBySegment[]>(`/monitoring/values${buildQueryString(params)}`);
}
