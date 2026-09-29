import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export interface PublicStanding {
  rank: number;
  projectName: string;
  teamName: string;
  track: string;
  award?: string;
  finalScore?: number;
}

export interface PublicResultsResponse {
  eventName?: string;
  isPublished: boolean;
  publishedAt?: string;
  standings: PublicStanding[];
}

export interface ArchiveRecord {
  id: string;
  name: string;
  year: number;
  winnerProject?: string;
  winningTeam?: string;
  trackCount: number;
  projectCount: number;
}

export interface CertificateData {
  id: string;
  recipientName: string;
  eventName: string;
  role: string;
  trackName?: string;
  issuedAt: string;
  verificationHash: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  result: string;
  metadata?: string;
}

export interface AwardItem {
  id: string;
  name: string;
  trackId?: string;
  trackName?: string;
  recipientTeamId?: string;
  recipientTeamName?: string;
  prizeDescription?: string;
}

/**
 * Results & Awards Service
 *
 * BACKEND STATUS:
 * - GET /api/v1/results: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/archive: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:id/normalize: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/results: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:id/publish-results: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/awards: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/certificates/me: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/certificates/organizer: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:id/certificates/generate: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/audit-logs: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/archive: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:id/archive/export: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getPublicResults(): Promise<PublicResultsResponse> {
  const response = await apiClient.get<ApiResponse<PublicResultsResponse>>('/results');
  return (
    (response as unknown as ApiResponse<PublicResultsResponse>)?.data ||
    (response as unknown as PublicResultsResponse)
  );
}

export async function getPublicArchive(): Promise<ArchiveRecord[]> {
  const response = await apiClient.get<ApiResponse<ArchiveRecord[]>>('/archive');
  const payload =
    (response as unknown as ApiResponse<ArchiveRecord[]>)?.data ||
    (response as unknown as ArchiveRecord[]);
  return Array.isArray(payload) ? payload : [];
}

export async function runScoreNormalization(
  eventId: string
): Promise<{ success: boolean; normalizedCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; normalizedCount: number }>
  >(`/events/${encodeURIComponent(eventId)}/normalize`);
  return (
    (
      response as unknown as ApiResponse<{
        success: boolean;
        normalizedCount: number;
      }>
    )?.data ||
    (response as unknown as { success: boolean; normalizedCount: number })
  );
}

export async function getOrganizerResults(eventId: string): Promise<unknown> {
  const response = await apiClient.get<ApiResponse<unknown>>(
    `/events/${encodeURIComponent(eventId)}/results`
  );
  return (response as unknown as ApiResponse<unknown>)?.data || response;
}

export async function publishResults(
  eventId: string
): Promise<{ success: boolean; publishedAt: string }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; publishedAt: string }>
  >(`/events/${encodeURIComponent(eventId)}/publish-results`);
  return (
    (
      response as unknown as ApiResponse<{
        success: boolean;
        publishedAt: string;
      }>
    )?.data || (response as unknown as { success: boolean; publishedAt: string })
  );
}

export async function getAwards(eventId: string): Promise<AwardItem[]> {
  const response = await apiClient.get<ApiResponse<AwardItem[]>>(
    `/events/${encodeURIComponent(eventId)}/awards`
  );
  const payload =
    (response as unknown as ApiResponse<AwardItem[]>)?.data ||
    (response as unknown as AwardItem[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getMyCertificate(eventId: string): Promise<CertificateData> {
  const response = await apiClient.get<ApiResponse<CertificateData>>(
    `/events/${encodeURIComponent(eventId)}/certificates/me`
  );
  return (
    (response as unknown as ApiResponse<CertificateData>)?.data ||
    (response as unknown as CertificateData)
  );
}

export async function getOrganizerCertificates(
  eventId: string
): Promise<CertificateData[]> {
  const response = await apiClient.get<ApiResponse<CertificateData[]>>(
    `/events/${encodeURIComponent(eventId)}/certificates/organizer`
  );
  const payload =
    (response as unknown as ApiResponse<CertificateData[]>)?.data ||
    (response as unknown as CertificateData[]);
  return Array.isArray(payload) ? payload : [];
}

export async function generateCertificates(
  eventId: string
): Promise<{ success: boolean; generatedCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; generatedCount: number }>
  >(`/events/${encodeURIComponent(eventId)}/certificates/generate`);
  return (
    (
      response as unknown as ApiResponse<{
        success: boolean;
        generatedCount: number;
      }>
    )?.data ||
    (response as unknown as { success: boolean; generatedCount: number })
  );
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const response = await apiClient.get<ApiResponse<AuditLogEntry[]>>('/audit-logs');
  const payload =
    (response as unknown as ApiResponse<AuditLogEntry[]>)?.data ||
    (response as unknown as AuditLogEntry[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getOrganizerArchive(eventId: string): Promise<ArchiveRecord> {
  const response = await apiClient.get<ApiResponse<ArchiveRecord>>(
    `/events/${encodeURIComponent(eventId)}/archive`
  );
  return (
    (response as unknown as ApiResponse<ArchiveRecord>)?.data ||
    (response as unknown as ArchiveRecord)
  );
}

export async function exportArchive(eventId: string): Promise<Blob> {
  const response = await apiClient.post(
    `/events/${encodeURIComponent(eventId)}/archive/export`,
    null,
    {
      responseType: 'blob',
    }
  );
  return response as unknown as Blob;
}
