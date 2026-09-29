import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'disqualified'
  | 'judged'
  | 'locked';

export interface Submission {
  id: string;
  projectId: string;
  projectTitle?: string;
  teamId?: string;
  teamName?: string;
  trackId: string;
  trackName?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  lockedAt?: string;
}

export interface SubmitProjectRequest {
  trackId: string;
  notes?: string;
}

export interface EligibilityCheck {
  name: string;
  passed: boolean;
  details?: string;
}

export interface EligibilityReport {
  submissionId: string;
  status: 'eligible' | 'not_eligible' | 'pending';
  checks: EligibilityCheck[];
  lastCheckedAt?: string;
  overrideNote?: string;
}

/**
 * Submissions & Eligibility Service
 *
 * BACKEND STATUS:
 * - POST /api/v1/projects/:projectId/submissions: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:eventId/submissions: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/submissions/:submissionId/eligibility: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:eventId/eligibility: ⏳ PENDING (Not yet implemented in server/)
 */

export async function submitProject(
  projectId: string,
  data: SubmitProjectRequest
): Promise<Submission> {
  const response = await apiClient.post<ApiResponse<Submission>>(
    `/projects/${encodeURIComponent(projectId)}/submissions`,
    data
  );
  return (
    (response as unknown as ApiResponse<Submission>)?.data ||
    (response as unknown as Submission)
  );
}

export async function getOrganizerSubmissions(eventId: string): Promise<Submission[]> {
  const response = await apiClient.get<ApiResponse<Submission[]>>(
    `/events/${encodeURIComponent(eventId)}/submissions`
  );
  const payload =
    (response as unknown as ApiResponse<Submission[]>)?.data ||
    (response as unknown as Submission[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getSubmissionEligibility(
  submissionId: string
): Promise<EligibilityReport> {
  const response = await apiClient.get<ApiResponse<EligibilityReport>>(
    `/submissions/${encodeURIComponent(submissionId)}/eligibility`
  );
  return (
    (response as unknown as ApiResponse<EligibilityReport>)?.data ||
    (response as unknown as EligibilityReport)
  );
}

export async function getOrganizerEligibility(
  eventId: string
): Promise<EligibilityReport[]> {
  const response = await apiClient.get<ApiResponse<EligibilityReport[]>>(
    `/events/${encodeURIComponent(eventId)}/eligibility`
  );
  const payload =
    (response as unknown as ApiResponse<EligibilityReport[]>)?.data ||
    (response as unknown as EligibilityReport[]);
  return Array.isArray(payload) ? payload : [];
}
