// Funnels API endpoints

import { api } from './client';
import type {
  BackendFunnel,
  CreateFunnelRequest,
  UpdateFunnelRequest,
} from '../../types/api';

export async function listFunnels(): Promise<BackendFunnel[]> {
  return api.get<BackendFunnel[]>('/funnels');
}

export async function getFunnel(id: string): Promise<BackendFunnel> {
  return api.get<BackendFunnel>(`/funnels/${id}`);
}

export async function createFunnel(data: CreateFunnelRequest): Promise<BackendFunnel> {
  return api.post<BackendFunnel>('/funnels', data);
}

export async function updateFunnel(id: string, data: UpdateFunnelRequest): Promise<BackendFunnel> {
  return api.put<BackendFunnel>(`/funnels/${id}`, data);
}

export async function deleteFunnel(id: string): Promise<void> {
  return api.delete(`/funnels/${id}`);
}

export async function getDefaultFunnel(): Promise<BackendFunnel | null> {
  const funnels = await listFunnels();
  return funnels.find((f) => f.isDefault) || funnels[0] || null;
}
