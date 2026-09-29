import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export type AssignmentStatus = 'pending' | 'scored' | 'conflict';

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

export interface JudgeAssignment {
  assignmentId: string;
  projectId: string;
  projectName: string;
  track: string;
  status: AssignmentStatus;
  deadline?: string;
}

export interface ScoreItem {
  criterionId: string;
  value: number;
}

export interface CurrentScore {
  totalRawScore?: number;
  feedback?: string;
  items?: ScoreItem[];
}

export interface AssignmentDetailResponse {
  assignmentId: string;
  project: {
    id: string;
    title: string;
    description: string;
    track: string;
    githubUrl?: string;
    demoUrl?: string;
  };
  rubric: Rubric;
  currentScore?: CurrentScore | null;
  isLocked: boolean;
}

export interface SubmitScoreRequest {
  isDraft: boolean;
  items: ScoreItem[];
  feedback?: string;
}

export interface ConflictDeclaration {
  id?: string;
  assignmentId: string;
  projectId?: string;
  projectName?: string;
  reason: string;
  status?: 'reported' | 'resolved';
  createdAt?: string;
}

export interface DeclareConflictRequest {
  reason: string;
}

export interface JudgeRosterItem {
  id: string;
  name: string;
  email: string;
  assignedCount: number;
  completedCount: number;
  status: 'active' | 'inactive';
}

/**
 * Judging Service
 *
 * BACKEND STATUS:
 * - GET /api/v1/judges/me/assignments: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/assignments/:id: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/assignments/:id/conflict: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/judges/me/conflicts: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/assignments/:id/scores: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/judges/me/history: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/rubrics: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/judges: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/judges/assign: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:id/judges/assign: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/conflicts/organizer: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/scores/organizer: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getMyAssignments(): Promise<JudgeAssignment[]> {
  const response = await apiClient.get<ApiResponse<JudgeAssignment[]>>(
    '/judges/me/assignments'
  );
  const payload =
    (response as unknown as ApiResponse<JudgeAssignment[]>)?.data ||
    (response as unknown as JudgeAssignment[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getAssignmentDetail(
  assignmentId: string
): Promise<AssignmentDetailResponse> {
  const response = await apiClient.get<ApiResponse<AssignmentDetailResponse>>(
    `/assignments/${encodeURIComponent(assignmentId)}`
  );
  return (
    (response as unknown as ApiResponse<AssignmentDetailResponse>)?.data ||
    (response as unknown as AssignmentDetailResponse)
  );
}

export async function declareConflict(
  assignmentId: string,
  data: DeclareConflictRequest
): Promise<ConflictDeclaration> {
  const response = await apiClient.post<ApiResponse<ConflictDeclaration>>(
    `/assignments/${encodeURIComponent(assignmentId)}/conflict`,
    data
  );
  return (
    (response as unknown as ApiResponse<ConflictDeclaration>)?.data ||
    (response as unknown as ConflictDeclaration)
  );
}

export async function getMyConflicts(): Promise<ConflictDeclaration[]> {
  const response = await apiClient.get<ApiResponse<ConflictDeclaration[]>>(
    '/judges/me/conflicts'
  );
  const payload =
    (response as unknown as ApiResponse<ConflictDeclaration[]>)?.data ||
    (response as unknown as ConflictDeclaration[]);
  return Array.isArray(payload) ? payload : [];
}

export async function submitScores(
  assignmentId: string,
  payload: SubmitScoreRequest
): Promise<{ success: boolean; isLocked: boolean }> {
  const response = await apiClient.post<ApiResponse<{ success: boolean; isLocked: boolean }>>(
    `/assignments/${encodeURIComponent(assignmentId)}/scores`,
    payload
  );
  return (
    (response as unknown as ApiResponse<{ success: boolean; isLocked: boolean }>)?.data ||
    (response as unknown as { success: boolean; isLocked: boolean })
  );
}

export async function getMyEvaluationHistory(): Promise<JudgeAssignment[]> {
  const response = await apiClient.get<ApiResponse<JudgeAssignment[]>>(
    '/judges/me/history'
  );
  const payload =
    (response as unknown as ApiResponse<JudgeAssignment[]>)?.data ||
    (response as unknown as JudgeAssignment[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getRubrics(eventId: string): Promise<Rubric[]> {
  const response = await apiClient.get<ApiResponse<Rubric[]>>(
    `/events/${encodeURIComponent(eventId)}/rubrics`
  );
  const payload =
    (response as unknown as ApiResponse<Rubric[]>)?.data ||
    (response as unknown as Rubric[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getJudges(eventId: string): Promise<JudgeRosterItem[]> {
  const response = await apiClient.get<ApiResponse<JudgeRosterItem[]>>(
    `/events/${encodeURIComponent(eventId)}/judges`
  );
  const payload =
    (response as unknown as ApiResponse<JudgeRosterItem[]>)?.data ||
    (response as unknown as JudgeRosterItem[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getAssignmentsMatrix(eventId: string): Promise<unknown> {
  const response = await apiClient.get<ApiResponse<unknown>>(
    `/events/${encodeURIComponent(eventId)}/judges/assign`
  );
  return (response as unknown as ApiResponse<unknown>)?.data || response;
}

export async function runAutoAssignment(
  eventId: string
): Promise<{ success: boolean; assignmentsCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; assignmentsCount: number }>
  >(`/events/${encodeURIComponent(eventId)}/judges/assign`);
  return (
    (
      response as unknown as ApiResponse<{
        success: boolean;
        assignmentsCount: number;
      }>
    )?.data ||
    (response as unknown as { success: boolean; assignmentsCount: number })
  );
}

export async function getOrganizerConflicts(): Promise<unknown[]> {
  const response = await apiClient.get<ApiResponse<unknown[]>>('/conflicts/organizer');
  const payload =
    (response as unknown as ApiResponse<unknown[]>)?.data ||
    (response as unknown as unknown[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getOrganizerScoresStream(): Promise<unknown[]> {
  const response = await apiClient.get<ApiResponse<unknown[]>>('/scores/organizer');
  const payload =
    (response as unknown as ApiResponse<unknown[]>)?.data ||
    (response as unknown as unknown[]);
  return Array.isArray(payload) ? payload : [];
}
