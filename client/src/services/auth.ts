import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export type UserRole = 'participant' | 'judge' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
}

/**
 * Auth Service
 * 
 * BACKEND STATUS:
 * - GET /api/v1/auth/me: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/auth/login: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/auth/logout: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return (response as unknown as ApiResponse<User>)?.data || (response as unknown as User);
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', credentials);
  return (response as unknown as ApiResponse<AuthSession>)?.data || (response as unknown as AuthSession);
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
