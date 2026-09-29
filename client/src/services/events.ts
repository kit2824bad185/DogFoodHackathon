import { apiClient } from '../api/client';
import type { ApiResponse } from './types';

export type EventStatus =
  | 'Draft'
  | 'Registration'
  | 'Hacking'
  | 'Judging'
  | 'Review'
  | 'Locked'
  | 'Published'
  | 'Archived';

export interface Track {
  id: string;
  eventId: string;
  name: string;
  description: string;
}

export interface HackathonEvent {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  submissionDeadline?: string;
  registrationStatus?: string;
  trackCount?: number;
  tracks?: Track[];
  rules?: string[];
  submissionGuidelines?: string;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  status?: EventStatus;
}

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  content: string;
  authorName?: string;
  isPinned?: boolean;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  eventId: string;
  title: string;
  content: string;
  isPinned?: boolean;
}

/**
 * Events Service
 *
 * BACKEND STATUS:
 * - GET /api/v1/events: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:slugOrId: ⏳ PENDING (Not yet implemented in server/)
 * - PATCH /api/v1/events/:id: ⏳ PENDING (Not yet implemented in server/)
 * - GET /api/v1/events/:id/announcements: ⏳ PENDING (Not yet implemented in server/)
 * - POST /api/v1/announcements: ⏳ PENDING (Not yet implemented in server/)
 */

export async function getEvents(): Promise<HackathonEvent[]> {
  const response = await apiClient.get<ApiResponse<HackathonEvent[]>>('/events');
  const payload =
    (response as unknown as ApiResponse<HackathonEvent[]>)?.data ||
    (response as unknown as HackathonEvent[]);
  return Array.isArray(payload) ? payload : [];
}

export async function getEventBySlugOrId(slugOrId: string): Promise<HackathonEvent> {
  const response = await apiClient.get<ApiResponse<HackathonEvent>>(
    `/events/${encodeURIComponent(slugOrId)}`
  );
  return (
    (response as unknown as ApiResponse<HackathonEvent>)?.data ||
    (response as unknown as HackathonEvent)
  );
}

export async function updateEvent(
  id: string,
  updates: UpdateEventRequest
): Promise<HackathonEvent> {
  const response = await apiClient.patch<ApiResponse<HackathonEvent>>(
    `/events/${encodeURIComponent(id)}`,
    updates
  );
  return (
    (response as unknown as ApiResponse<HackathonEvent>)?.data ||
    (response as unknown as HackathonEvent)
  );
}

export async function getEventAnnouncements(eventId: string): Promise<Announcement[]> {
  const response = await apiClient.get<ApiResponse<Announcement[]>>(
    `/events/${encodeURIComponent(eventId)}/announcements`
  );
  const payload =
    (response as unknown as ApiResponse<Announcement[]>)?.data ||
    (response as unknown as Announcement[]);
  return Array.isArray(payload) ? payload : [];
}

export async function createAnnouncement(
  data: CreateAnnouncementRequest
): Promise<Announcement> {
  const response = await apiClient.post<ApiResponse<Announcement>>('/announcements', data);
  return (
    (response as unknown as ApiResponse<Announcement>)?.data ||
    (response as unknown as Announcement)
  );
}
