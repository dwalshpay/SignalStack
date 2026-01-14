// Auth API endpoints

import { api, setTokens, clearTokens } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  InviteRequest,
  AcceptInviteRequest,
  CreateAPIKeyRequest,
  TokenResponse,
  UserWithOrganization,
  APIKey,
  APIKeyCreateResponse,
} from '../../types/api';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/login', data, { requiresAuth: false });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/register', data, { requiresAuth: false });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

export async function refreshSession(data: RefreshTokenRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/refresh', data, { requiresAuth: false });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

export async function getCurrentUser(): Promise<UserWithOrganization> {
  return api.get<UserWithOrganization>('/auth/me');
}

export async function logout(): Promise<void> {
  clearTokens();
}

// Team Management
export async function inviteUser(data: InviteRequest): Promise<{ message: string }> {
  return api.post('/auth/invite', data);
}

export async function acceptInvite(data: AcceptInviteRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/invite/accept', data, { requiresAuth: false });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

// API Keys
export async function createAPIKey(data: CreateAPIKeyRequest): Promise<APIKeyCreateResponse> {
  return api.post<APIKeyCreateResponse>('/auth/api-keys', data);
}

export async function listAPIKeys(): Promise<APIKey[]> {
  return api.get<APIKey[]>('/auth/api-keys');
}

export async function deleteAPIKey(id: string): Promise<void> {
  return api.delete(`/auth/api-keys/${id}`);
}
