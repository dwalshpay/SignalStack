// Integrations API endpoints

import { api } from './client';
import type {
  Integration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  SyncLog,
} from '../../types/api';

export async function listIntegrations(): Promise<Integration[]> {
  return api.get<Integration[]>('/integrations');
}

export async function getIntegration(id: string): Promise<Integration> {
  return api.get<Integration>(`/integrations/${id}`);
}

export async function createIntegration(data: CreateIntegrationRequest): Promise<Integration> {
  return api.post<Integration>('/integrations', data);
}

export async function updateIntegration(
  id: string,
  data: UpdateIntegrationRequest
): Promise<Integration> {
  return api.put<Integration>(`/integrations/${id}`, data);
}

export async function deleteIntegration(id: string): Promise<void> {
  return api.delete(`/integrations/${id}`);
}

export async function testIntegrationConnection(id: string): Promise<{ success: boolean; message: string }> {
  return api.post(`/integrations/${id}/test`);
}

export async function triggerIntegrationSync(id: string): Promise<{ message: string }> {
  return api.post(`/integrations/${id}/sync`);
}

export async function getIntegrationLogs(id: string): Promise<SyncLog[]> {
  return api.get<SyncLog[]>(`/integrations/${id}/logs`);
}
