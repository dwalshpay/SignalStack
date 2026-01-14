// Core API Client with JWT handling

import { APIError, NetworkError, parseAPIError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Queue for requests waiting on token refresh
type QueuedRequest = {
  resolve: () => void;
  reject: (error: Error) => void;
};
const requestQueue: QueuedRequest[] = [];

// Token management
export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('refreshToken', refresh);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken || localStorage.getItem('refreshToken');
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refreshToken');
}

export function hasValidSession(): boolean {
  return !!getRefreshToken();
}

// Process queued requests after token refresh
function processQueue(error?: Error): void {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  requestQueue.length = 0;
}

// Refresh the access token
async function refreshAccessToken(): Promise<void> {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    throw new APIError('No refresh token available', 401);
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw await parseAPIError(response);
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
}

// Handle token refresh with request queueing
async function handleTokenRefresh(): Promise<void> {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .then(() => {
      processQueue();
    })
    .catch((error) => {
      processQueue(error);
      throw error;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// Request options type
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

// Main fetch wrapper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    requiresAuth = true,
    skipAuthRefresh = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Add auth header if required and available
  if (requiresAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new NetworkError();
  }

  // Handle 401 - attempt token refresh
  if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
    try {
      await handleTokenRefresh();
      // Retry the request with new token
      return apiRequest<T>(endpoint, { ...options, skipAuthRefresh: true });
    } catch {
      // Refresh failed, clear session
      clearTokens();
      throw new APIError('Session expired. Please log in again.', 401);
    }
  }

  if (!response.ok) {
    throw await parseAPIError(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
