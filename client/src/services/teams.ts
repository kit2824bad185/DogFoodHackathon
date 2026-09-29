import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export type TeamMemberRole = 'owner' | 'member';

export interface TeamMember {
  userId: string;
  name: string;
  email?: string;
  role: TeamMemberRole;
  joinedAt?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt?: string;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  joinCode: string;
  members: TeamMember[];
  invitations?: TeamInvitation[];
  projectAssociation?: string;
  status?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  trackId?: string;
  trackName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  registeredAt: string;
}

export interface CreateTeamRequest {
  name: string;
}

export interface JoinTeamRequest {
  joinCode: string;
}

export interface InviteMemberRequest {
  email: string;
}

/**
 * Teams & Registration Service
 *
 * BACKEND STATUS:
 * - GET /api/v1/events/:eventId/registration: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:eventId/registrations: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:eventId/teams/me: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:eventId/teams: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/events/:eventId/teams: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/teams/join: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/teams/:id/invitations: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getMyRegistration(eventId: string): Promise<Registration> {
  const response = await apiClient.get<ApiResponse<Registration>>(
    `/events/${encodeURIComponent(eventId)}/registration`
  );
  return (
    (response as unknown as ApiResponse<Registration>)?.data ||
    (response as unknown as Registration)
  );
}

export async function getEventRegistrations(
  eventId: string,
  params?: {
    search?: string;
    track?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<Registration[]> {
  const response = await apiClient.get<ApiResponse<Registration[]>>(
    `/events/${encodeURIComponent(eventId)}/registrations`,
    { params }
  );
  const payload =
    (response as unknown as ApiResponse<Registration[]>)?.data ||
    (response as unknown as Registration[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getMyTeam(eventId: string): Promise<Team> {
  const response = await apiClient.get<ApiResponse<Team>>(
    `/events/${encodeURIComponent(eventId)}/teams/me`
  );
  return (
    (response as unknown as ApiResponse<Team>)?.data ||
    (response as unknown as Team)
  );
}

export async function getEventTeams(eventId: string): Promise<Team[]> {
  const response = await apiClient.get<ApiResponse<Team[]>>(
    `/events/${encodeURIComponent(eventId)}/teams`
  );
  const payload =
    (response as unknown as ApiResponse<Team[]>)?.data ||
    (response as unknown as Team[]);
  return Array.isArray(payload) ? payload : [];
}

export async function createTeam(
  eventId: string,
  data: CreateTeamRequest
): Promise<Team> {
  const response = await apiClient.post<ApiResponse<Team>>(
    `/events/${encodeURIComponent(eventId)}/teams`,
    data
  );
  return (
    (response as unknown as ApiResponse<Team>)?.data ||
    (response as unknown as Team)
  );
}

export async function joinTeam(data: JoinTeamRequest): Promise<Team> {
  const response = await apiClient.post<ApiResponse<Team>>('/teams/join', data);
  return (
    (response as unknown as ApiResponse<Team>)?.data ||
    (response as unknown as Team)
  );
}

export async function inviteTeamMember(
  teamId: string,
  data: InviteMemberRequest
): Promise<TeamInvitation> {
  const response = await apiClient.post<ApiResponse<TeamInvitation>>(
    `/teams/${encodeURIComponent(teamId)}/invitations`,
    data
  );
  return (
    (response as unknown as ApiResponse<TeamInvitation>)?.data ||
    (response as unknown as TeamInvitation)
  );
}
