import crypto from 'crypto';
import { eq, ne, desc } from 'drizzle-orm';
import { db } from '../../db';
import { events, eventSettings, tracks, Event, EventSettings, Track, EventStatus } from '../../db/schema';
import { SafeUser } from '../../types/auth';
import { CreateEventInput, AddTrackInput } from './events.schemas';
import { validatePhaseTransition } from './events.constants';

export interface EventWithDetails extends Event {
  settings?: EventSettings | null;
  tracks?: Track[];
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .slice(0, 80);
}

export class EventsService {
  /**
   * Create an event with initial event settings.
   */
  async createEvent(data: CreateEventInput): Promise<EventWithDetails> {
    const rawSlug = data.slug || slugify(data.title);
    const slug = rawSlug || `event-${Date.now()}`;

    // Verify slug uniqueness
    const existing = await db.query.events.findFirst({
      where: eq(events.slug, slug),
    });

    if (existing) {
      const error: any = new Error(`An event with slug '${slug}' already exists`);
      error.code = 'CONFLICT';
      error.statusCode = 409;
      throw error;
    }

    const eventId = crypto.randomUUID();
    const settingsId = crypto.randomUUID();
    const now = new Date();

    const [newEvent] = await db
      .insert(events)
      .values({
        id: eventId,
        title: data.title,
        slug,
        description: data.description || null,
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const [newSettings] = await db
      .insert(eventSettings)
      .values({
        id: settingsId,
        eventId,
        minTeamSize: data.settings?.minTeamSize ?? 1,
        maxTeamSize: data.settings?.maxTeamSize ?? 4,
        registrationDeadline: data.settings?.registrationDeadline || null,
        submissionDeadline: data.settings?.submissionDeadline || null,
      })
      .returning();

    return {
      ...newEvent,
      settings: newSettings,
      tracks: [],
    };
  }

  /**
   * List events. Non-organizers only see non-DRAFT events.
   */
  async getEvents(user?: SafeUser): Promise<EventWithDetails[]> {
    const isOrganizerOrAdmin = user && (user.role === 'ORGANIZER' || user.role === 'ADMIN');

    const whereClause = isOrganizerOrAdmin ? undefined : ne(events.status, 'DRAFT');

    const results = await db.query.events.findMany({
      where: whereClause,
      with: {
        settings: true,
        tracks: true,
      },
      orderBy: [desc(events.createdAt)],
    });

    return results;
  }

  /**
   * Get single event by ID or slug.
   */
  async getEventById(identifier: string, user?: SafeUser): Promise<EventWithDetails | null> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, identifier),
      with: {
        settings: true,
        tracks: true,
      },
    });

    if (!event) {
      // Also try by slug if not found by ID
      const bySlug = await db.query.events.findFirst({
        where: eq(events.slug, identifier),
        with: {
          settings: true,
          tracks: true,
        },
      });
      if (!bySlug) return null;
      return this.checkVisibility(bySlug, user);
    }

    return this.checkVisibility(event, user);
  }

  private checkVisibility(event: EventWithDetails, user?: SafeUser): EventWithDetails | null {
    if (event.status === 'DRAFT') {
      const isOrganizerOrAdmin = user && (user.role === 'ORGANIZER' || user.role === 'ADMIN');
      if (!isOrganizerOrAdmin) {
        return null;
      }
    }
    return event;
  }

  /**
   * Add a track to an event.
   */
  async addTrack(eventId: string, data: AddTrackInput): Promise<Track> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      const error: any = new Error('Event not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const trackId = crypto.randomUUID();

    const [track] = await db
      .insert(tracks)
      .values({
        id: trackId,
        eventId,
        name: data.name,
        description: data.description || null,
      })
      .returning();

    return track;
  }

  /**
   * Transition event to the next linear lifecycle phase.
   */
  async transitionPhase(eventId: string, targetPhase: EventStatus): Promise<EventWithDetails> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        settings: true,
        tracks: true,
      },
    });

    if (!event) {
      const error: any = new Error('Event not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const transitionResult = validatePhaseTransition(event.status, targetPhase);
    if (!transitionResult.valid) {
      const error: any = new Error(transitionResult.message);
      error.code = 'INVALID_PHASE_TRANSITION';
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();

    const [updatedEvent] = await db
      .update(events)
      .set({
        status: targetPhase,
        updatedAt: now,
      })
      .where(eq(events.id, eventId))
      .returning();

    return {
      ...updatedEvent,
      settings: event.settings,
      tracks: event.tracks,
    };
  }
}

export const eventsService = new EventsService();
