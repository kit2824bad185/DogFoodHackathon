import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export interface HealthStatus {
  status: 'ok' | string;
  timestamp: string;
  database: 'connected' | string;
  version: string;
}

/**
 * System Health Check API
 * Endpoint: GET /api/v1/health
 * Status: ✅ ACTIVE (Actually implemented in server/src/routes/health.ts)
 */
export async function getHealth(): Promise<HealthStatus> {
  const response = await apiClient.get<ApiResponse<HealthStatus>>('/health');
  const payload =
    (response as unknown as ApiResponse<HealthStatus>)?.data ||
    (response as unknown as HealthStatus);
  return payload;
}
