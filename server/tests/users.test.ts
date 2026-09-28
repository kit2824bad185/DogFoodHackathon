import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Users & Organizer Management API', () => {
  let adminCookie: string;
  let participantCookie: string;
  let participantUserId: string;

  beforeAll(async () => {
    // Register participant
    const partRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `participant-${Date.now()}@dogfood.local`,
        password: 'Password123!',
        fullName: 'Test Participant',
      });
    participantCookie = partRes.headers['set-cookie'][0].split(';')[0];
    participantUserId = partRes.body.data.user.id;

    // Register admin user
    const adminEmail = `admin-${Date.now()}@dogfood.local`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: 'Password123!',
        fullName: 'Test Admin',
      });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    const adminUserId = adminRes.body.data.user.id;

    // Promote to ADMIN in DB
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, adminUserId));
  });

  describe('PUT /api/users/profile', () => {
    it('should update the authenticated user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Cookie', [participantCookie])
        .send({
          fullName: 'Jane Updated Doe',
          bio: 'Fullstack developer & hackathon enthusiast',
          githubUrl: 'https://github.com/janedoe',
          linkedinUrl: 'https://linkedin.com/in/janedoe',
          skills: 'TypeScript, React, Node.js, SQLite',
          tShirtSize: 'M',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.profile.fullName).toBe('Jane Updated Doe');
      expect(res.body.data.profile.bio).toBe('Fullstack developer & hackathon enthusiast');
      expect(res.body.data.profile.tShirtSize).toBe('M');
    });

    it('should return 401 when updating profile without auth', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ fullName: 'Unauthenticated' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/organizer/users', () => {
    it('should return 403 Forbidden when a PARTICIPANT accesses organizer user list', async () => {
      const res = await request(app)
        .get('/api/organizer/users')
        .set('Cookie', [participantCookie]);

      expect(res.status).toBe(403);
    });

    it('should return paginated users for an ADMIN', async () => {
      const res = await request(app)
        .get('/api/organizer/users?page=1&limit=5')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should filter users by search term', async () => {
      const res = await request(app)
        .get('/api/organizer/users?search=Jane')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.users.some((u: any) => u.profile?.fullName.includes('Jane'))).toBe(true);
    });
  });

  describe('PATCH /api/organizer/users/:id/status', () => {
    it('should update user status to SUSPENDED by ADMIN', async () => {
      const res = await request(app)
        .patch(`/api/organizer/users/${participantUserId}/status`)
        .set('Cookie', [adminCookie])
        .send({ status: 'SUSPENDED' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.status).toBe('SUSPENDED');

      // Verify suspended user cannot make authenticated requests
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [participantCookie]);
      expect(meRes.status).toBe(401);

      // Restore status to ACTIVE
      await request(app)
        .patch(`/api/organizer/users/${participantUserId}/status`)
        .set('Cookie', [adminCookie])
        .send({ status: 'ACTIVE' });
    });
  });

  describe('POST /api/organizer/users/:id/role', () => {
    it('should promote user to JUDGE role', async () => {
      const res = await request(app)
        .post(`/api/organizer/users/${participantUserId}/role`)
        .set('Cookie', [adminCookie])
        .send({ role: 'JUDGE' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('JUDGE');

      // Revert back to PARTICIPANT
      await request(app)
        .post(`/api/organizer/users/${participantUserId}/role`)
        .set('Cookie', [adminCookie])
        .send({ role: 'PARTICIPANT' });
    });
  });
});
