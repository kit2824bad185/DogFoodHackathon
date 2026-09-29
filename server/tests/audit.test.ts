import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../src/modules/audit';

describe('Centralized Audit Logging System', () => {
  let adminCookie: string;
  let adminUserId: string;
  let participantCookie: string;
  let participantUserId: string;

  beforeAll(async () => {
    // 1. Register admin
    const adminEmail = `admin-audit-${Date.now()}@dogfood.local`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: 'Password123!',
        fullName: 'Audit Admin',
      });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    adminUserId = adminRes.body.data.user.id;
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, adminUserId));

    // 2. Register participant
    const partEmail = `participant-audit-${Date.now()}@dogfood.local`;
    const partRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: partEmail,
        password: 'Password123!',
        fullName: 'Audit Participant',
      });
    participantCookie = partRes.headers['set-cookie'][0].split(';')[0];
    participantUserId = partRes.body.data.user.id;
  });

  describe('logAuditEvent Helper Function', () => {
    it('successfully inserts an audit record with metadata and actor', async () => {
      await logAuditEvent({
        actorId: adminUserId,
        action: 'ROLE_ASSIGNED',
        entity: 'USER',
        entityId: participantUserId,
        metadata: { newRole: 'JUDGE', previousRole: 'PARTICIPANT' },
        ipAddress: '127.0.0.1',
      });

      const res = await request(app)
        .get('/api/organizer/audit-logs?action=ROLE_ASSIGNED')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.logs)).toBe(true);

      const targetLog = res.body.data.logs.find(
        (l: any) => l.action === 'ROLE_ASSIGNED' && l.entityId === participantUserId
      );
      expect(targetLog).toBeDefined();
      expect(targetLog.entity).toBe('USER');
      expect(targetLog.metadata?.newRole).toBe('JUDGE');
      expect(targetLog.actor?.id).toBe(adminUserId);
    });

    it('handles null actorId and empty metadata without throwing', async () => {
      await expect(
        logAuditEvent({
          action: 'ELIGIBILITY_EVALUATED',
          entity: 'PROJECT',
          entityId: 'proj-anonymous-test',
        })
      ).resolves.toBeUndefined();

      const res = await request(app)
        .get('/api/organizer/audit-logs?action=ELIGIBILITY_EVALUATED')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      const found = res.body.data.logs.find(
        (l: any) => l.entityId === 'proj-anonymous-test'
      );
      expect(found).toBeDefined();
      expect(found.actor).toBeNull();
    });
  });

  describe('RBAC on GET /api/organizer/audit-logs', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/organizer/audit-logs');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects participant requests with 403', async () => {
      const res = await request(app)
        .get('/api/organizer/audit-logs')
        .set('Cookie', [participantCookie]);
      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows ORGANIZER or ADMIN access with 200', async () => {
      const res = await request(app)
        .get('/api/organizer/audit-logs')
        .set('Cookie', [adminCookie]);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('logs');
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('Filtering and Pagination', () => {
    it('supports pagination with limit and page params', async () => {
      const res = await request(app)
        .get('/api/organizer/audit-logs?page=1&limit=2')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeLessThanOrEqual(2);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('filters records by entity', async () => {
      const res = await request(app)
        .get('/api/organizer/audit-logs?entity=USER')
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      for (const log of res.body.data.logs) {
        expect(log.entity).toBe('USER');
      }
    });

    it('filters records by actorId', async () => {
      const res = await request(app)
        .get(`/api/organizer/audit-logs?actorId=${adminUserId}`)
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(200);
      for (const log of res.body.data.logs) {
        expect(log.actor?.id).toBe(adminUserId);
      }
    });
  });

  describe('Controller Instrumentation Verification', () => {
    it('records USER_REGISTERED and USER_LOGIN audit events', async () => {
      const testEmail = `audit-instr-${Date.now()}@dogfood.local`;

      // 1. Register -> creates USER_REGISTERED
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          fullName: 'Instrumented User',
        });
      expect(regRes.status).toBe(201);
      const newUserId = regRes.body.data.user.id;

      // 2. Login -> creates USER_LOGIN
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        });
      expect(loginRes.status).toBe(200);

      // Verify audit logs
      const auditRes = await request(app)
        .get(`/api/organizer/audit-logs?actorId=${newUserId}`)
        .set('Cookie', [adminCookie]);

      expect(auditRes.status).toBe(200);
      const actions = auditRes.body.data.logs.map((l: any) => l.action);
      expect(actions).toContain('USER_REGISTERED');
      expect(actions).toContain('USER_LOGIN');
    });

    it('records EVENT_CREATED and EVENT_PHASE_CHANGED audit events', async () => {
      const eventRes = await request(app)
        .post('/api/events')
        .set('Cookie', [adminCookie])
        .send({
          title: `Audit Event ${Date.now()}`,
          slug: `audit-event-${Date.now()}`,
        });
      expect(eventRes.status).toBe(201);
      const eventId = eventRes.body.data.event.id;

      // Transition phase via PATCH /api/events/:id/phase
      const phaseRes = await request(app)
        .patch(`/api/events/${eventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'REGISTRATION_OPEN' });
      expect(phaseRes.status).toBe(200);

      // Verify audit logs
      const auditRes = await request(app)
        .get(`/api/organizer/audit-logs?entity=EVENT`)
        .set('Cookie', [adminCookie]);

      expect(auditRes.status).toBe(200);
      const eventLogs = auditRes.body.data.logs.filter((l: any) => l.entityId === eventId);
      const actions = eventLogs.map((l: any) => l.action);
      expect(actions).toContain('EVENT_CREATED');
      expect(actions).toContain('EVENT_PHASE_CHANGED');
    });
  });
});
