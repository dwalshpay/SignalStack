// Business Metrics API endpoints

import { api } from './client';
import type { BackendMetrics, CreateMetricsRequest } from '../../types/api';

export async function getCurrentMetrics(): Promise<BackendMetrics | null> {
  const response = await api.get<BackendMetrics | null>('/metrics');
  return response;
}

export async function getMetricsHistory(): Promise<BackendMetrics[]> {
  return api.get<BackendMetrics[]>('/metrics/history');
}

export async function createMetrics(data: CreateMetricsRequest): Promise<BackendMetrics> {
  return api.post<BackendMetrics>('/metrics', data);
}
