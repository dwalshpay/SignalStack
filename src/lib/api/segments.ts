// Audience Segments API endpoints

import { api } from './client';
import type {
  BackendSegment,
  CreateSegmentRequest,
  UpdateSegmentRequest,
} from '../../types/api';

export async function listSegments(): Promise<BackendSegment[]> {
  return api.get<BackendSegment[]>('/segments');
}

export async function getSegment(id: string): Promise<BackendSegment> {
  return api.get<BackendSegment>(`/segments/${id}`);
}

export async function createSegment(data: CreateSegmentRequest): Promise<BackendSegment> {
  return api.post<BackendSegment>('/segments', data);
}

export async function updateSegment(id: string, data: UpdateSegmentRequest): Promise<BackendSegment> {
  return api.put<BackendSegment>(`/segments/${id}`, data);
}

export async function deleteSegment(id: string): Promise<void> {
  return api.delete(`/segments/${id}`);
}
