// Scoring Rules API endpoints

import { api } from './client';
import type {
  BackendScoringRule,
  CreateScoringRuleRequest,
  UpdateScoringRuleRequest,
  ReorderScoringRulesRequest,
} from '../../types/api';

export async function listScoringRules(): Promise<BackendScoringRule[]> {
  return api.get<BackendScoringRule[]>('/scoring-rules');
}

export async function getScoringRule(id: string): Promise<BackendScoringRule> {
  return api.get<BackendScoringRule>(`/scoring-rules/${id}`);
}

export async function createScoringRule(data: CreateScoringRuleRequest): Promise<BackendScoringRule> {
  return api.post<BackendScoringRule>('/scoring-rules', data);
}

export async function updateScoringRule(
  id: string,
  data: UpdateScoringRuleRequest
): Promise<BackendScoringRule> {
  return api.put<BackendScoringRule>(`/scoring-rules/${id}`, data);
}

export async function deleteScoringRule(id: string): Promise<void> {
  return api.delete(`/scoring-rules/${id}`);
}

export async function reorderScoringRules(data: ReorderScoringRulesRequest): Promise<BackendScoringRule[]> {
  return api.post<BackendScoringRule[]>('/scoring-rules/reorder', data);
}

export async function toggleScoringRule(id: string): Promise<BackendScoringRule> {
  return api.post<BackendScoringRule>(`/scoring-rules/${id}/toggle`);
}
