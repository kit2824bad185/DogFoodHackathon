import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { apiRouter } from '../src/routes';
import { requireAuth } from '../src/middleware/requireAuth';
import { requireRole } from '../src/middleware/requireRole';
import { sendSuccess } from '../src/utils/response';

// Add a test-only route on apiRouter for RBAC testing
apiRouter.get('/test/admin-only', requireAuth, requireRole('ADMIN'), (req, res) => {
  sendSuccess(res, { message: 'Welcome Admin', role: req.user!.role });
});

describe('Authentication & RBAC System', () => {
  const testUser = {
    email: `test-${Date.now()}@dogfood.local`,
    password: 'SecurePassword123!',
    fullName: 'Jane Doe',
  };

  let sessionCookie: string;
  let userId: string;

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user, create profile, and set session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.role).toBe('PARTICIPANT');
      expect(res.body.data.user.status).toBe('ACTIVE');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.profile).toBeDefined();
      expect(res.body.data.user.profile.fullName).toBe(testUser.fullName);

      // Verify session cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookieHeader = cookies.find((c: string) => c.startsWith('session_token='));
      expect(sessionCookieHeader).toBeDefined();
      expect(sessionCookieHeader).toContain('HttpOnly');

      userId = res.body.data.user.id;
      sessionCookie = sessionCookieHeader.split(';')[0];
    });

    it('should return 409 Conflict when registering with an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should return 400 Bad Request when password is under 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'shortpass@test.com',
          password: 'short',
          fullName: 'Short Pass User',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials and return new session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.passwordHash).toBeUndefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookieHeader = cookies.find((c: string) => c.startsWith('session_token='));
      expect(sessionCookieHeader).toBeDefined();

      sessionCookie = sessionCookieHeader.split(';')[0];
    });

    it('should return 401 Unauthorized for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 Unauthorized for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@dogfood.local',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user and profile details when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(userId);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.profile.fullName).toBe(testUser.fullName);
    });

    it('should return 401 Unauthorized when no cookie is sent', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('RBAC Middleware (requireRole)', () => {
    it('should return 403 Forbidden when a PARTICIPANT accesses ADMIN route', async () => {
      const res = await request(app)
        .get('/api/test/admin-only')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow access when user role is updated to ADMIN', async () => {
      // Temporarily promote test user to ADMIN
      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, userId));

      const res = await request(app)
        .get('/api/test/admin-only')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Welcome Admin');
      expect(res.body.data.role).toBe('ADMIN');

      // Revert back to PARTICIPANT
      await db.update(users).set({ role: 'PARTICIPANT' }).where(eq(users.id, userId));
    });
  });

  describe('POST /api/auth/change-password', () => {
    const newPassword = 'NewSecretPassword456!';

    it('should return 401 if old password does not match', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', [sessionCookie])
        .send({
          oldPassword: 'IncorrectOldPassword!',
          newPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should successfully change password with valid current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', [sessionCookie])
        .send({
          oldPassword: testUser.password,
          newPassword,
        });

      expect(res.status).toBe(200);

      // Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        });

      expect(loginRes.status).toBe(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout, clear session cookie, and invalidate the session', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [sessionCookie]);

      expect(res.status).toBe(200);

      // Cookie should be cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Subsequent request with the same cookie should now fail with 401
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [sessionCookie]);

      expect(meRes.status).toBe(401);
    });
  });
});
