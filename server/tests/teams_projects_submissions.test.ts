import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Teams, Projects & Submissions Engine', () => {
  let adminCookie: string;
  let captainCookie: string;
  let captainUserId: string;
  let memberCookie: string;
  let memberUserId: string;
  let outsiderCookie: string;

  let eventId: string;
  let trackId: string;
  let teamId: string;
  let joinCode: string;
  let inviteToken: string;
  let projectId: string;

  beforeAll(async () => {
    // 1. Register admin
    const adminEmail = `admin-tps-${Date.now()}@dogfood.local`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ email: adminEmail, password: 'Password123!', fullName: 'Admin User' });
    adminCookie = adminRes.headers['set-cookie'][0].split(';')[0];
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, adminRes.body.data.user.id));

    // 2. Register captain
    const capRes = await request(app)
      .post('/api/auth/register')
      .send({ email: `cap-tps-${Date.now()}@dogfood.local`, password: 'Password123!', fullName: 'Captain Alice' });
    captainCookie = capRes.headers['set-cookie'][0].split(';')[0];
    captainUserId = capRes.body.data.user.id;

    // 3. Register member
    const memRes = await request(app)
      .post('/api/auth/register')
      .send({ email: `mem-tps-${Date.now()}@dogfood.local`, password: 'Password123!', fullName: 'Member Bob' });
    memberCookie = memRes.headers['set-cookie'][0].split(';')[0];
    memberUserId = memRes.body.data.user.id;

    // 4. Register outsider
    const outRes = await request(app)
      .post('/api/auth/register')
      .send({ email: `out-tps-${Date.now()}@dogfood.local`, password: 'Password123!', fullName: 'Outsider Charlie' });
    outsiderCookie = outRes.headers['set-cookie'][0].split(';')[0];

    // 5. Create event (starts in DRAFT)
    const eventRes = await request(app)
      .post('/api/events')
      .set('Cookie', [adminCookie])
      .send({
        title: 'Team & Project Hackathon 2026',
        slug: `team-proj-hackathon-${Date.now()}`,
        description: 'Testing teams and submissions',
        settings: {
          minTeamSize: 1,
          maxTeamSize: 2, // max 2 members for testing capacity enforcement
        },
      });
    eventId = eventRes.body.data.event.id;

    // 6. Add track
    const trackRes = await request(app)
      .post(`/api/events/${eventId}/tracks`)
      .set('Cookie', [adminCookie])
      .send({
        name: 'Web3 & Decentralization',
        description: 'Offline and decentralized tech',
      });
    trackId = trackRes.body.data.track.id;
  });

  describe('Part 1: Team Collaboration Engine', () => {
    it('should reject team creation while event is in DRAFT', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Cookie', [captainCookie])
        .send({
          eventId,
          name: 'The Early Birds',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('REGISTRATION_CLOSED');
    });

    it('should allow captain to create a team when event registration is open', async () => {
      // Transition event to REGISTRATION_OPEN
      await request(app)
        .patch(`/api/events/${eventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'REGISTRATION_OPEN' });

      const res = await request(app)
        .post('/api/teams')
        .set('Cookie', [captainCookie])
        .send({
          eventId,
          name: 'The Quantum Hackers',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.team).toBeDefined();
      expect(res.body.data.team.name).toBe('The Quantum Hackers');
      expect(res.body.data.team.captainId).toBe(captainUserId);
      expect(res.body.data.team.joinCode).toBeDefined();
      expect(res.body.data.team.isLocked).toBe(false);

      teamId = res.body.data.team.id;
      joinCode = res.body.data.team.joinCode;
    });

    it('should prevent captain from creating a second team in the same event', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Cookie', [captainCookie])
        .send({
          eventId,
          name: 'Another Team',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should allow captain to generate an invite token', async () => {
      const res = await request(app)
        .post(`/api/teams/${teamId}/invite`)
        .set('Cookie', [captainCookie])
        .send({
          email: 'invited@dogfood.local',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.invite.token).toBeDefined();
      inviteToken = res.body.data.invite.token;
    });

    it('should reject non-captain attempting to generate invite token', async () => {
      const res = await request(app)
        .post(`/api/teams/${teamId}/invite`)
        .set('Cookie', [memberCookie])
        .send({
          email: 'somebody@dogfood.local',
        });

      expect(res.status).toBe(403);
    });

    it('should allow member to join via joinCode', async () => {
      const res = await request(app)
        .post('/api/teams/join')
        .set('Cookie', [memberCookie])
        .send({ joinCode });

      expect(res.status).toBe(200);
      expect(res.body.data.team.members.some((m: any) => m.userId === memberUserId)).toBe(true);
    });

    it('should enforce max_team_size (max 2 members in settings)', async () => {
      // Outsider tries to join full team
      const res = await request(app)
        .post('/api/teams/join')
        .set('Cookie', [outsiderCookie])
        .send({ joinCode });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('TEAM_FULL');
    });

    it('should allow captain to lock the team roster', async () => {
      const res = await request(app)
        .post(`/api/teams/${teamId}/lock`)
        .set('Cookie', [captainCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.team.isLocked).toBe(true);
    });

    it('should reject member joining a locked team', async () => {
      const res = await request(app)
        .post('/api/teams/join')
        .set('Cookie', [outsiderCookie])
        .send({ token: inviteToken });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('TEAM_LOCKED');
    });

    it('should reject member removal from a locked team', async () => {
      const res = await request(app)
        .delete(`/api/teams/${teamId}/member/${memberUserId}`)
        .set('Cookie', [captainCookie]);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('TEAM_LOCKED');
    });
  });

  describe('Part 2: Projects & Submissions Engine', () => {
    it('should allow captain to create a project linked to team and track', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [captainCookie])
        .send({
          teamId,
          trackId,
          title: 'Offline Vault',
          description: 'Secure, offline decentralized password and secret vault',
          repoUrl: 'https://github.com/dogfood/offline-vault',
          demoUrl: 'https://vault.dogfood.local',
          techStack: 'Node.js, SQLite, Argon2, React',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.title).toBe('Offline Vault');
      expect(res.body.data.project.teamId).toBe(teamId);
      expect(res.body.data.project.trackId).toBe(trackId);

      projectId = res.body.data.project.id;
    });

    it('should prevent non-team member from editing the project', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Cookie', [outsiderCookie])
        .send({
          title: 'Hijacked Title',
        });

      expect(res.status).toBe(403);
    });

    it('should allow team member to update the project details', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Cookie', [memberCookie])
        .send({
          title: 'Offline Vault 2.0',
          description: 'Updated comprehensive description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.project.title).toBe('Offline Vault 2.0');
    });

    it('should allow team members to save draft submissions', async () => {
      const res = await request(app)
        .post('/api/submissions/draft')
        .set('Cookie', [memberCookie])
        .send({
          projectId,
          description: 'Work in progress draft description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.submission.status).toBe('DRAFT');
      expect(res.body.data.submission.isFinal).toBe(false);
    });

    it('should reject finalization if event phase is not SUBMISSION_OPEN', async () => {
      // Event is currently in REGISTRATION_OPEN
      const res = await request(app)
        .post('/api/submissions/finalize')
        .set('Cookie', [captainCookie])
        .send({ projectId });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SUBMISSION_PHASE_INVALID');
    });

    it('should successfully finalize submission when in SUBMISSION_OPEN phase', async () => {
      // Transition event: REGISTRATION_OPEN -> REGISTRATION_CLOSED -> SUBMISSION_OPEN
      await request(app)
        .patch(`/api/events/${eventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'REGISTRATION_CLOSED' });

      await request(app)
        .patch(`/api/events/${eventId}/phase`)
        .set('Cookie', [adminCookie])
        .send({ phase: 'SUBMISSION_OPEN' });

      const res = await request(app)
        .post('/api/submissions/finalize')
        .set('Cookie', [captainCookie])
        .send({ projectId });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('LOCKED');
      expect(res.body.data.isFinal).toBe(true);
      expect(res.body.data.versionNumber).toBe(1);
    });

    it('should block further project edits once submission is locked', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Cookie', [captainCookie])
        .send({
          title: 'Should Be Rejected',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SUBMISSION_LOCKED');
    });

    it('should block draft submissions once submission is locked', async () => {
      const res = await request(app)
        .post('/api/submissions/draft')
        .set('Cookie', [memberCookie])
        .send({
          projectId,
          description: 'Should fail',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SUBMISSION_LOCKED');
    });

    it('should retrieve submission status and version snapshot history', async () => {
      const res = await request(app).get(`/api/submissions/${projectId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.submission.status).toBe('LOCKED');
      expect(res.body.data.submission.isFinal).toBe(true);
      expect(res.body.data.submission.versions).toBeDefined();
      expect(res.body.data.submission.versions.length).toBeGreaterThanOrEqual(1);

      const snapshot = JSON.parse(res.body.data.submission.versions[0].payload);
      expect(snapshot.title).toBe('Offline Vault 2.0');
      expect(snapshot.team.name).toBe('The Quantum Hackers');
    });
  });
});
