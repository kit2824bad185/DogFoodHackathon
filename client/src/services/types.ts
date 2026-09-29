/**
 * Common API Response and Error Types
 * Reflects backend sendSuccess/sendError envelope
 */

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface RequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  statusCode?: number;
}
