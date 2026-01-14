// API Error Handling

import type { APIErrorResponse } from '../../types/api';

export class APIError extends Error {
  status: number;
  code?: string;
  details?: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static isAPIError(error: unknown): error is APIError {
    return error instanceof APIError;
  }

  static isUnauthorized(error: unknown): boolean {
    return APIError.isAPIError(error) && error.status === 401;
  }

  static isForbidden(error: unknown): boolean {
    return APIError.isAPIError(error) && error.status === 403;
  }

  static isNotFound(error: unknown): boolean {
    return APIError.isAPIError(error) && error.status === 404;
  }

  static isValidationError(error: unknown): boolean {
    return APIError.isAPIError(error) && error.status === 400 && !!error.details?.length;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }

  static isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
  }
}

export async function parseAPIError(response: Response): Promise<APIError> {
  let errorData: APIErrorResponse | null = null;

  try {
    errorData = await response.json();
  } catch {
    // Response body is not JSON
  }

  const message = errorData?.error || getDefaultErrorMessage(response.status);
  return new APIError(message, response.status, errorData?.code, errorData?.details);
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'An unexpected error occurred. Please try again.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

export function getErrorMessage(error: unknown): string {
  if (APIError.isAPIError(error)) {
    return error.message;
  }
  if (NetworkError.isNetworkError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
