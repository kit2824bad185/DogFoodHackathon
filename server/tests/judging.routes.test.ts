import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { app } from '../src/app';
import { db } from '../src/db';
import {
  users,
  judges,
  rubrics,
  rubricCriteria,
  judgeAssignments,
  scores,
} from '../src/db/schema';

describe('Judging API Routes Integration Tests', () => {
  let eventId: string;
  let userJudge1: string;
  let userJudge2: string;
  let userParticipant: string;
  let userOrganizer: string;
  let judge1Id: string;
  let judge2Id: string;
  let rubricId: string;
  let crit1Id: string;
  let crit2Id: string;
  let assign1Id: string;
  let assign2Id: string;
  let assignConflictId: string;

  beforeAll(async () => {
    eventId = `event-${randomUUID()}`;
    userJudge1 = `user-judge1-${randomUUID()}`;
    userJudge2 = `user-judge2-${randomUUID()}`;
    userParticipant = `user-part-${randomUUID()}`;
    userOrganizer = `user-org-${randomUUID()}`;

    // 1. Create users with distinct RBAC roles
    await db.insert(users).values([
      {
        id: userJudge1,
        email: `judge1-${randomUUID()}@local`,
        passwordHash: 'hash',
        role: 'judge',
      },
      {
        id: userJudge2,
        email: `judge2-${randomUUID()}@local`,
        passwordHash: 'hash',
        role: 'judge',
      },
      {
        id: userParticipant,
        email: `part-${randomUUID()}@local`,
        passwordHash: 'hash',
        role: 'participant',
      },
      {
        id: userOrganizer,
        email: `org-${randomUUID()}@local`,
        passwordHash: 'hash',
        role: 'organizer',
      },
    ]);

    judge1Id = `judge1-${randomUUID()}`;
    judge2Id = `judge2-${randomUUID()}`;

    // 2. Register judges
    await db.insert(judges).values([
      { id: judge1Id, eventId, userId: userJudge1, status: 'active' },
      { id: judge2Id, eventId, userId: userJudge2, status: 'active' },
    ]);

    // 3. Create Rubric & Criteria
    rubricId = `rubric-${randomUUID()}`;
    crit1Id = `crit1-${randomUUID()}`;
    crit2Id = `crit2-${randomUUID()}`;

    await db.insert(rubrics).values({
      id: rubricId,
      eventId,
      name: 'API Test Rubric',
      description: 'Used for route tests',
    });

    await db.insert(rubricCriteria).values([
      { id: crit1Id, rubricId, name: 'Functionality', weight: 1.0, maxScore: 10, sortOrder: 0 },
      { id: crit2Id, rubricId, name: 'Creativity', weight: 2.0, maxScore: 10, sortOrder: 1 },
    ]);

    // 4. Create Assignments
    assign1Id = `assign1-${randomUUID()}`;
    assign2Id = `assign2-${randomUUID()}`;
    assignConflictId = `assign-conflict-${randomUUID()}`;

    await db.insert(judgeAssignments).values([
      { id: assign1Id, judgeId: judge1Id, submissionId: `sub1-${randomUUID()}`, status: 'pending' },
      { id: assign2Id, judgeId: judge2Id, submissionId: `sub2-${randomUUID()}`, status: 'pending' },
      { id: assignConflictId, judgeId: judge1Id, submissionId: `sub3-${randomUUID()}`, status: 'pending' },
    ]);
  });

  // ==========================================
  // 1. Authentication & Role Authorization
  // ==========================================
  describe('Authentication & Role Enforcement', () => {
    it('rejects unauthenticated request to /api/v1/judging/assignments with 401', async () => {
      const res = await request(app).get('/api/v1/judging/assignments');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects participant trying to access judge assignments with 403', async () => {
      const res = await request(app)
        .get('/api/v1/judging/assignments')
        .set('Authorization', `Bearer ${userParticipant}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows authenticated judge to retrieve their assignments', async () => {
      const res = await request(app)
        .get('/api/v1/judging/assignments')
        .set('Authorization', `Bearer ${userJudge1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const ids = res.body.data.map((a: any) => a.id);
      expect(ids).toContain(assign1Id);
      expect(ids).not.toContain(assign2Id); // Judge 2 assignment must NOT be present
    });
  });

  // ==========================================
  // 2. Assignment Details & Blind Judging
  // ==========================================
  describe('Assignment Details', () => {
    it('allows a judge to get details of their own assignment', async () => {
      const res = await request(app)
        .get(`/api/v1/judging/assignments/${assign1Id}`)
        .set('Authorization', `Bearer ${userJudge1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.assignment.id).toBe(assign1Id);
      expect(res.body.data.rubric.criteria.length).toBe(2);
    });

    it('forbids a judge from accessing another judge assignment with 403', async () => {
      const res = await request(app)
        .get(`/api/v1/judging/assignments/${assign2Id}`)
        .set('Authorization', `Bearer ${userJudge1}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 for a non-existent assignment', async () => {
      const res = await request(app)
        .get('/api/v1/judging/assignments/non-existent-id')
        .set('Authorization', `Bearer ${userJudge1}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // 3. Conflict of Interest Reporting
  // ==========================================
  describe('Conflict of Interest API', () => {
    it('successfully reports conflict for judge own assignment', async () => {
      const res = await request(app)
        .post(`/api/v1/judging/assignments/${assignConflictId}/conflict`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send({ reason: 'Team member is my coworker' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('conflict');
    });

    it('rejects conflict reporting with empty/whitespace reason with 400', async () => {
      const res = await request(app)
        .post(`/api/v1/judging/assignments/${assign1Id}/conflict`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send({ reason: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('rejects conflict reporting on another judge assignment with 403', async () => {
      const res = await request(app)
        .post(`/api/v1/judging/assignments/${assign2Id}/conflict`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send({ reason: 'Unauthorized conflict report' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================
  // 4. Score Submission (Draft & Final)
  // ==========================================
  describe('Score Submission API', () => {
    it('saves a draft score successfully', async () => {
      const draftPayload = {
        items: [{ criterionId: crit1Id, value: 8, feedback: 'Good start' }],
        isFinal: false,
      };

      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(draftPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.isFinal).toBe(false);
      expect(res.body.data.totalRawScore).toBe(8); // 8 * 1.0
    });

    it('rejects invalid score exceeding maxScore with 400', async () => {
      const invalidPayload = {
        items: [{ criterionId: crit1Id, value: 25 }], // maxScore is 10
        isFinal: false,
      };

      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('rejects final score if criteria are missing with 400', async () => {
      const incompleteFinalPayload = {
        items: [{ criterionId: crit1Id, value: 9 }], // crit2 is missing
        isFinal: true,
      };

      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(incompleteFinalPayload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('finalizes score successfully when all criteria are provided', async () => {
      // crit1: 8 * 1.0 (8) + crit2: 9 * 2.0 (18) = 26.0
      const completeFinalPayload = {
        items: [
          { criterionId: crit1Id, value: 8, feedback: 'Strong tech' },
          { criterionId: crit2Id, value: 9, feedback: 'Very creative' },
        ],
        isFinal: true,
      };

      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(completeFinalPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.isFinal).toBe(true);
      expect(res.body.data.status).toBe('scored');
      expect(res.body.data.totalRawScore).toBe(26);
    });

    it('strictly forbids modifying a finalized score with 403', async () => {
      const overwriteAttempt = {
        items: [{ criterionId: crit1Id, value: 10 }],
        isFinal: false,
      };

      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(overwriteAttempt);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ==========================================
  // 5. Admin / Organizer Normalization API
  // ==========================================
  describe('Normalization & Results API', () => {
    it('rejects unauthorized judge from triggering normalization with 403', async () => {
      const res = await request(app)
        .post('/api/v1/judging/normalize')
        .set('Authorization', `Bearer ${userJudge1}`)
        .send({ eventId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects invalid normalization request (e.g. invalid sample count) with 400', async () => {
      const res = await request(app)
        .post('/api/v1/judging/normalize')
        .set('Authorization', `Bearer ${userOrganizer}`)
        .send({ eventId, minJudgeSampleCount: -1 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('allows organizer to trigger normalization successfully', async () => {
      // Finalize assign2 as well so we have scores
      await db.update(scores).set({ isFinal: true }).where(eq(scores.assignmentId, assign2Id));

      const res = await request(app)
        .post('/api/v1/judging/normalize')
        .set('Authorization', `Bearer ${userOrganizer}`)
        .send({ eventId, minJudgeSampleCount: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.runId).toBeDefined();
      expect(Array.isArray(res.body.data.results)).toBe(true);
    });

    it('retrieves calculated results without exposing private judge scores', async () => {
      const res = await request(app)
        .get(`/api/v1/judging/results?eventId=${eventId}`)
        .set('Authorization', `Bearer ${userOrganizer}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Verify privacy: individual judge identity and raw criterion scores are NOT exposed
      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item.submissionId).toBeDefined();
        expect(item.finalNormalizedScore).toBeDefined();
        expect(item.rank).toBeDefined();
        expect(item.judgeId).toBeUndefined();
        expect(item.criteriaScores).toBeUndefined();
      }
    });

    it('retrieves specific normalization run details by runId', async () => {
      // First run normalization
      const normRes = await request(app)
        .post('/api/v1/judging/normalize')
        .set('Authorization', `Bearer ${userOrganizer}`)
        .send({ eventId, minJudgeSampleCount: 1 });

      const runId = normRes.body.data.runId;

      const runDetailsRes = await request(app)
        .get(`/api/v1/judging/normalization/${runId}`)
        .set('Authorization', `Bearer ${userOrganizer}`);

      expect(runDetailsRes.status).toBe(200);
      expect(runDetailsRes.body.data.runId).toBe(runId);
      expect(Array.isArray(runDetailsRes.body.data.results)).toBe(true);
    });
  });

  // ==========================================
  // 6. Security Guarantees
  // ==========================================
  describe('Security Guarantees', () => {
    it('ignores client-injected judgeId in request body', async () => {
      // Client attempts to spoof judgeId in score submission
      const spoofAttempt = {
        judgeId: userJudge2, // Client trying to score on behalf of Judge 2
        items: [
          { criterionId: crit1Id, value: 5 },
          { criterionId: crit2Id, value: 5 },
        ],
        isFinal: false,
      };

      // Strict validation rejects unexpected properties
      const res = await request(app)
        .put(`/api/v1/judging/assignments/${assign1Id}/score`)
        .set('Authorization', `Bearer ${userJudge1}`)
        .send(spoofAttempt);

      // Zod strict validation blocks arbitrary fields
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('both /api/v1/judging and /api/judging aliases function identically', async () => {
      const res1 = await request(app)
        .get('/api/v1/judging/assignments')
        .set('Authorization', `Bearer ${userJudge1}`);

      const res2 = await request(app)
        .get('/api/judging/assignments')
        .set('Authorization', `Bearer ${userJudge1}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.data.length).toBe(res2.body.data.length);
    });

    it('supports direct /v1/judging route prefix as required by audit', async () => {
      // 1. GET /v1/judging/assignments
      const resAssignments = await request(app)
        .get('/v1/judging/assignments')
        .set('Authorization', `Bearer ${userJudge1}`);
      expect(resAssignments.status).toBe(200);

      // 2. GET /v1/judging/assignments/:assignmentId
      const resDetails = await request(app)
        .get(`/v1/judging/assignments/${assign1Id}`)
        .set('Authorization', `Bearer ${userJudge1}`);
      expect(resDetails.status).toBe(200);

      // 3. GET /v1/judging/results
      const resResults = await request(app)
        .get(`/v1/judging/results?eventId=${eventId}`)
        .set('Authorization', `Bearer ${userOrganizer}`);
      expect(resResults.status).toBe(200);

      // 4. POST /v1/judging/normalize
      const resNorm = await request(app)
        .post('/v1/judging/normalize')
        .set('Authorization', `Bearer ${userOrganizer}`)
        .send({ eventId, minJudgeSampleCount: 1 });
      expect(resNorm.status).toBe(200);

      // 5. GET /v1/judging/normalization/:runId
      const runId = resNorm.body.data.runId;
      const resRun = await request(app)
        .get(`/v1/judging/normalization/${runId}`)
        .set('Authorization', `Bearer ${userOrganizer}`);
      expect(resRun.status).toBe(200);
    });
  });
});
