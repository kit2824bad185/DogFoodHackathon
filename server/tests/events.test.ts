import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Event Lifecycle & Tracks API', () => {
  let adminCookie: string;
  let participantCookie: string;
  let createdEventId: string;

  beforeAll(async () => {
    // Register participant
    const partRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `part-ev-${Date.now()}@dogfood.local`,
        password: 'Password123!',
        fullName: 'Event Participant',
      });
    participantCookie = partRes.headers['set-cookie'][0].split(';')[0];

    // Register admin user
    const adminEmail = `admin-ev-${Date.now()}@dogfood.local`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: 'Password123!',
        fullName: 'Event Admin',
      });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    const adminUserId = adminRes.body.data.user.id;

    // Promote to ADMIN
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, adminUserId));
  });

  describe('POST /api/events', () => {
    it('should return 403 Forbidden when a PARTICIPANT attempts to create an event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [participantCookie])
        .send({
          title: 'Unauthorized Event',
          description: 'Participant trying to create',
        });

      expect(res.status).toBe(403);
    });

    it('should successfully create an event with settings in DRAFT status by ADMIN', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [adminCookie])
        .send({
          title: 'Dogfood Hackathon 2026',
          slug: `dogfood-hackathon-${Date.now()}`,
          description: 'The premier offline-first engineering hackathon',
          settings: {
            minTeamSize: 2,
            maxTeamSize: 5,
            registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
            submissionDeadline: new Date(Date.now() + 172800000).toISOString(),
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.event).toBeDefined();
      expect(res.body.data.event.title).toBe('Dogfood Hackathon 2026');
      expect(res.body.data.event.status).toBe('DRAFT');
      expect(res.body.data.event.settings).toBeDefined();
      expect(res.body.data.event.settings.minTeamSize).toBe(2);
      expect(res.body.data.event.settings.maxTeamSize).toBe(5);

      createdEventId = res.body.data.event.id;
    });
  });

  describe('GET /api/events and GET /api/events/:id visibility', () => {
    it('should show DRAFT events to ADMIN', async () => {
      const res = await request(app)
        .get('/api/events')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.events.some((e: any) => e.id === createdEventId)).toBe(true);
    });

    it('should NOT show DRAFT events to public / unauthenticated users', async () => {
      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.data.events.some((e: any) => e.id === createdEventId)).toBe(false);
    });

    it('should return 404 for unauthenticated access to a DRAFT event details', async () => {
      const res = await request(app).get(`/api/events/${createdEventId}`);
      expect(res.status).toBe(404);
    });

    it('should return event details to ADMIN for a DRAFT event', async () => {
      const res = await request(app)
        .get(`/api/events/${createdEventId}`)
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.event.id).toBe(createdEventId);
      expect(res.body.data.event.settings).toBeDefined();
    });
  });

  describe('POST /api/events/:id/tracks', () => {
    it('should allow ADMIN to add a track to the event', async () => {
      const res = await request(app)
        .post(`/api/events/${createdEventId}/tracks`)
        .set('Cookie', [adminCookie])
        .send({
          name: 'AI & Developer Tooling',
          description: 'Innovative tools improving developer productivity',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.track).toBeDefined();
      expect(res.body.data.track.name).toBe('AI & Developer Tooling');
      expect(res.body.data.track.eventId).toBe(createdEventId);
    });

    it('should return 403 when a PARTICIPANT tries to add a track', async () => {
      const res = await request(app)
        .post(`/api/events/${createdEventId}/tracks`)
        .set('Cookie', [participantCookie])
        .send({
          name: 'Security Track',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/events/:id/phase (Linear State Machine)', () => {
    it('should reject illegal jump from DRAFT to JUDGING with 400 Bad Request', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'JUDGING' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_PHASE_TRANSITION');
      expect(res.body.error.message).toContain('Illegal phase transition');
      expect(res.body.error.message).toContain('REGISTRATION_OPEN');
    });

    it('should successfully transition from DRAFT to REGISTRATION_OPEN', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'REGISTRATION_OPEN' });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('REGISTRATION_OPEN');

      // Now the event should be visible publicly
      const publicRes = await request(app).get('/api/events');
      expect(publicRes.body.data.events.some((e: any) => e.id === createdEventId)).toBe(true);
    });

    it('should successfully transition from REGISTRATION_OPEN to REGISTRATION_CLOSED', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'REGISTRATION_CLOSED' });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('REGISTRATION_CLOSED');
    });

    it('should successfully transition from REGISTRATION_CLOSED to SUBMISSION_OPEN', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'SUBMISSION_OPEN' });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('SUBMISSION_OPEN');
    });
  });
});
