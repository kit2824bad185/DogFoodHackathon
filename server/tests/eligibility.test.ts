import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users, eventSettings, registrations, submissions } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  evaluateProjectEligibility,
  evaluateTeamEligibility,
} from '../src/services/eligibility';

describe('Explainable Eligibility Engine', () => {
  let adminCookie: string;
  let captainCookie: string;
  let captainUserId: string;

  let eventId: string;
  let trackId: string;
  let teamId: string;
  let projectId: string;

  beforeAll(async () => {
    // 1. Register admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `admin-el-${Date.now()}@dogfood.local`,
        password: 'Password123!',
        fullName: 'Admin Evaluator',
      });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, adminRes.body.data.user.id));

    // 2. Register captain
    const capRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `cap-el-${Date.now()}@dogfood.local`,
        password: 'Password123!',
        fullName: 'Captain Evaluator',
      });
    captainCookie = capRes.headers['set-cookie'][0].split(';')[0];
    captainUserId = capRes.body.data.user.id;

    // 3. Create event (min 2, max 4 members)
    const eventRes = await request(app)
      .post('/api/events')
      .set('Cookie', [adminCookie])
      .send({
        title: 'Eligibility Test Hackathon',
        slug: `eligibility-test-${Date.now()}`,
        settings: {
          minTeamSize: 2,
          maxTeamSize: 4,
          submissionDeadline: new Date(Date.now() + 86400000).toISOString(),
        },
      });
    eventId = eventRes.body.data.event.id;

    // Transition event to REGISTRATION_OPEN
    await request(app)
      .patch(`/api/events/${eventId}/phase`)
      .set('Cookie', [adminCookie])
      .send({ phase: 'REGISTRATION_OPEN' });

    // 4. Create track
    const trackRes = await request(app)
      .post(`/api/events/${eventId}/tracks`)
      .set('Cookie', [adminCookie])
      .send({
        name: 'AI Engineering',
      });
    trackId = trackRes.body.data.track.id;

    // 5. Create team (has only 1 member: captain)
    const teamRes = await request(app)
      .post('/api/teams')
      .set('Cookie', [captainCookie])
      .send({
        eventId,
        name: 'Solitary Devs',
      });
    teamId = teamRes.body.data.team.id;

    // 6. Create project without track or repoUrl
    const projRes = await request(app)
      .post('/api/projects')
      .set('Cookie', [captainCookie])
      .send({
        teamId,
        title: 'Incomplete Project',
        description: '',
      });
    projectId = projRes.body.data.project.id;
  });

  it('should identify all failing conditions for an incomplete and unsubmitted project', async () => {
    const result = await evaluateProjectEligibility(projectId);

    expect(result.eligible).toBe(false);
    expect(result.projectId).toBe(projectId);
    expect(result.teamId).toBe(teamId);
    expect(result.evaluatedAt).toBeDefined();

    // Checklist verifications:
    // 1. Team size validation (1 member < min 2)
    expect(result.reasons.some((r) => r.includes('minimum required is 2'))).toBe(true);

    // 2. Track selection (no track selected)
    expect(result.reasons.some((r) => r.includes('valid track'))).toBe(true);

    // 3. Required fields (description, repo_url)
    expect(result.reasons.some((r) => r.includes('Missing required project fields'))).toBe(true);

    // 4. Final submission missing
    expect(result.reasons.some((r) => r.includes('Final submission was not submitted or locked'))).toBe(true);
  });

  it('should detect when a team member has an incomplete event registration', async () => {
    // Modify captain's registration to completedProfile = false
    await db
      .update(registrations)
      .set({ completedProfile: false })
      .where(eq(registrations.userId, captainUserId));

    const result = await evaluateProjectEligibility(projectId);
    expect(result.reasons.some((r) => r.includes('has incomplete event registration'))).toBe(true);

    // Restore completedProfile to true
    await db
      .update(registrations)
      .set({ completedProfile: true })
      .where(eq(registrations.userId, captainUserId));
  });

  it('should detect late submission after deadline', async () => {
    // Set submission deadline in the past
    const pastDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    await db
      .update(eventSettings)
      .set({ submissionDeadline: pastDeadline })
      .where(eq(eventSettings.eventId, eventId));

    // Create a mock locked submission timestamped after deadline
    await db
      .update(submissions)
      .set({
        status: 'LOCKED',
        isFinal: true,
        submittedAt: new Date(),
      })
      .where(eq(submissions.projectId, projectId));

    const result = await evaluateProjectEligibility(projectId);
    expect(result.reasons.some((r) => r.includes('submitted after the deadline'))).toBe(true);

    // Restore submission deadline to the future
    await db
      .update(eventSettings)
      .set({ submissionDeadline: new Date(Date.now() + 86400000) })
      .where(eq(eventSettings.eventId, eventId));
  });

  it('should return eligible = true with empty reasons array when all rules pass', async () => {
    // 1. Adjust team size setting to min 1 member
    await db
      .update(eventSettings)
      .set({ minTeamSize: 1, maxTeamSize: 4 })
      .where(eq(eventSettings.eventId, eventId));

    // 2. Update project directly with valid track and all required fields
    const { projects } = await import('../src/db/schema');
    await db
      .update(projects)
      .set({
        trackId,
        title: 'Flawless AI Platform',
        description: 'Complete architecture and implementation',
        repoUrl: 'https://github.com/dogfood/flawless-ai',
      })
      .where(eq(projects.id, projectId));

    // 3. Mark submission as locked & submitted before deadline
    await db
      .update(submissions)
      .set({
        status: 'LOCKED',
        isFinal: true,
        submittedAt: new Date(),
      })
      .where(eq(submissions.projectId, projectId));

    const result = await evaluateProjectEligibility(projectId);

    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.projectId).toBe(projectId);
    expect(result.teamId).toBe(teamId);
  });

  it('should evaluate team eligibility via evaluateTeamEligibility', async () => {
    const result = await evaluateTeamEligibility(teamId);

    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.projectId).toBe(projectId);
    expect(result.teamId).toBe(teamId);
  });

  it('should expose eligibility through GET /api/projects/:id/eligibility', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/eligibility`);

    expect(res.status).toBe(200);
    expect(res.body.data.eligible).toBe(true);
    expect(res.body.data.reasons).toEqual([]);
    expect(res.body.data.projectId).toBe(projectId);
  });
});
