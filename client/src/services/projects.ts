import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export interface Project {
  id: string;
  teamId: string;
  teamName?: string;
  eventId: string;
  title: string;
  description: string;
  track?: string;
  trackId?: string;
  techStack?: string[];
  technologies?: string[];
  githubUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  trackId: string;
  githubUrl?: string;
  demoUrl?: string;
  technologies?: string[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  trackId?: string;
  githubUrl?: string;
  demoUrl?: string;
  technologies?: string[];
}

/**
 * Projects Service
 *
 * BACKEND STATUS:
 * - GET /api/v1/events/:slug/projects: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:slug/projects/:id: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/teams/:teamId/projects: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/teams/:teamId/projects: ⏳ PENDING (Not yet implemented in server/)
 * - PATCH /api/v1/projects/:projectId: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/projects: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getPublicProjects(eventSlug: string): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>(
    `/events/${encodeURIComponent(eventSlug)}/projects`
  );
  const payload =
    (response as unknown as ApiResponse<Project[]>)?.data ||
    (response as unknown as Project[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getPublicProjectDetail(
  eventSlug: string,
  projectId: string
): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(
    `/events/${encodeURIComponent(eventSlug)}/projects/${encodeURIComponent(projectId)}`
  );
  return (
    (response as unknown as ApiResponse<Project>)?.data ||
    (response as unknown as Project)
  );
}

export async function getTeamProjects(teamId: string): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>(
    `/teams/${encodeURIComponent(teamId)}/projects`
  );
  const payload =
    (response as unknown as ApiResponse<Project[]>)?.data ||
    (response as unknown as Project[]);
  return Array.isArray(payload) ? payload : [];
}

export async function createProject(
  teamId: string,
  data: CreateProjectRequest
): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    `/teams/${encodeURIComponent(teamId)}/projects`,
    data
  );
  return (
    (response as unknown as ApiResponse<Project>)?.data ||
    (response as unknown as Project)
  );
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<Project> {
  const response = await apiClient.patch<ApiResponse<Project>>(
    `/projects/${encodeURIComponent(projectId)}`,
    data
  );
  return (
    (response as unknown as ApiResponse<Project>)?.data ||
    (response as unknown as Project)
  );
}

export async function getOrganizerProjects(eventId: string): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>(
    `/events/${encodeURIComponent(eventId)}/projects`
  );
  const payload =
    (response as unknown as ApiResponse<Project[]>)?.data ||
    (response as unknown as Project[]);
  return Array.isArray(payload) ? payload : [];
}
