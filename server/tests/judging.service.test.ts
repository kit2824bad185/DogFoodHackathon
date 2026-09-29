import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../src/db';
import {
  users,
  judges,
  rubrics,
  rubricCriteria,
  judgeAssignments,
  judgeConflicts,
  scores,
  scoreItems,
  auditLogs,
} from '../src/db/schema';
import {
  verifyJudgeAssignment,
  getJudgeAssignments,
  getAssignmentDetails,
  reportConflict,
  saveScoreDraft,
  finalizeScore,
  calculateWeightedRawScore,
} from '../src/modules/judging/judging.service';
import { ForbiddenError, NotFoundError, BadRequestError } from '../src/utils/errors';

describe('Core Judging Service', () => {
  let eventId: string;
  let userJudge1: string;
  let userJudge2: string;
  let judge1Id: string;
  let judge2Id: string;
  let rubricId: string;
  let crit1Id: string;
  let crit2Id: string;
  let crit3Id: string;
  let assign1Id: string;
  let assign2Id: string;
  let assignConflictId: string;

  beforeAll(async () => {
    eventId = `event-${randomUUID()}`;
    userJudge1 = `user-judge1-${randomUUID()}`;
    userJudge2 = `user-judge2-${randomUUID()}`;
    judge1Id = `judge-1-${randomUUID()}`;
    judge2Id = `judge-2-${randomUUID()}`;
    rubricId = `rubric-${randomUUID()}`;
    crit1Id = `crit-1-${randomUUID()}`;
    crit2Id = `crit-2-${randomUUID()}`;
    crit3Id = `crit-3-${randomUUID()}`;

    // Create users
    await db.insert(users).values([
      {
        id: userJudge1,
        email: `judge1-${randomUUID()}@dogfood.local`,
        passwordHash: 'hash',
        role: 'judge',
      },
      {
        id: userJudge2,
        email: `judge2-${randomUUID()}@dogfood.local`,
        passwordHash: 'hash',
        role: 'judge',
      },
    ]);

    // Create judges
    await db.insert(judges).values([
      { id: judge1Id, eventId, userId: userJudge1, status: 'active' },
      { id: judge2Id, eventId, userId: userJudge2, status: 'active' },
    ]);

    // Create rubric & criteria
    await db.insert(rubrics).values({
      id: rubricId,
      eventId,
      name: 'Hackathon Rubric',
      description: 'Standard evaluation rubric',
    });

    // Criterion 1: weight 1.0, maxScore 10
    // Criterion 2: weight 2.0, maxScore 10
    // Criterion 3: weight 1.5, maxScore 10
    await db.insert(rubricCriteria).values([
      { id: crit1Id, rubricId, name: 'Innovation', weight: 1.0, maxScore: 10, sortOrder: 0 },
      { id: crit2Id, rubricId, name: 'Technical Complexity', weight: 2.0, maxScore: 10, sortOrder: 1 },
      { id: crit3Id, rubricId, name: 'Design & Polish', weight: 1.5, maxScore: 10, sortOrder: 2 },
    ]);
  });

  beforeEach(async () => {
    // Fresh assignments for each test with unique submission IDs to respect unique constraint
    assign1Id = `assign-1-${randomUUID()}`;
    assign2Id = `assign-2-${randomUUID()}`;
    assignConflictId = `assign-conflict-${randomUUID()}`;
    const subAlpha = `sub-alpha-${randomUUID()}`;
    const subBeta = `sub-beta-${randomUUID()}`;

    await db.insert(judgeAssignments).values([
      { id: assign1Id, judgeId: judge1Id, submissionId: subAlpha, status: 'pending' },
      { id: assign2Id, judgeId: judge2Id, submissionId: subAlpha, status: 'pending' },
      { id: assignConflictId, judgeId: judge1Id, submissionId: subBeta, status: 'pending' },
    ]);
  });

  // ==========================================
  // 1. Assignment Security
  // ==========================================
  describe('Assignment Security & Row-Level Authorization', () => {
    it('allows a judge to access their own assignment', async () => {
      const { assignment } = await verifyJudgeAssignment(assign1Id, userJudge1);
      expect(assignment.id).toBe(assign1Id);
      expect(assignment.judgeId).toBe(judge1Id);
    });

    it('rejects access when a judge tries to access another judge assignment', async () => {
      await expect(verifyJudgeAssignment(assign2Id, userJudge1)).rejects.toThrow(ForbiddenError);
    });

    it('rejects nonexistent assignment with NotFoundError', async () => {
      await expect(verifyJudgeAssignment('non-existent-id', userJudge1)).rejects.toThrow(NotFoundError);
    });

    it('getJudgeAssignments returns only assignments for the authenticated judge', async () => {
      const judge1List = await getJudgeAssignments(userJudge1, { eventId });
      const assignmentIds = judge1List.map((a) => a.id);

      expect(assignmentIds).toContain(assign1Id);
      expect(assignmentIds).not.toContain(assign2Id); // Judge 2's assignment must NEVER appear
    });
  });

  // ==========================================
  // 2. Conflict of Interest (COI)
  // ==========================================
  describe('Conflict of Interest Reporting', () => {
    it('reports a valid COI, updates status to conflict, and creates audit log', async () => {
      const reason = 'I am an advisor to this project team.';
      const result = await reportConflict(assignConflictId, userJudge1, reason);

      expect(result.success).toBe(true);
      expect(result.status).toBe('conflict');

      // Verify assignment status in DB
      const [updatedAssign] = await db
        .select()
        .from(judgeAssignments)
        .where(eq(judgeAssignments.id, assignConflictId));
      expect(updatedAssign.status).toBe('conflict');

      // Verify conflict record created
      const [conflictRecord] = await db
        .select()
        .from(judgeConflicts)
        .where(eq(judgeConflicts.assignmentId, assignConflictId));
      expect(conflictRecord).toBeDefined();
      expect(conflictRecord.reason).toBe(reason);

      // Verify audit log created
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.entityId, assignConflictId),
            eq(auditLogs.action, 'JUDGE_CONFLICT_REPORTED')
          )
        );
      expect(auditLog).toBeDefined();
      expect(auditLog.actorId).toBe(userJudge1);
    });

    it('prevents scoring an assignment marked as conflict', async () => {
      await reportConflict(assignConflictId, userJudge1, 'Conflict of interest');

      await expect(
        saveScoreDraft(assignConflictId, userJudge1, {
          items: [{ criterionId: crit1Id, value: 8 }],
        })
      ).rejects.toThrow(BadRequestError);

      await expect(
        finalizeScore(assignConflictId, userJudge1, {
          items: [
            { criterionId: crit1Id, value: 8 },
            { criterionId: crit2Id, value: 9 },
            { criterionId: crit3Id, value: 7 },
          ],
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ==========================================
  // 3. Draft Scoring & Calculations
  // ==========================================
  describe('Draft Scoring', () => {
    it('calculates weighted total correctly and saves draft score and items', async () => {
      // 8 * 1.0 (crit1) + 9 * 2.0 (crit2) = 8 + 18 = 26.0
      const draftData = {
        items: [
          { criterionId: crit1Id, value: 8, feedback: 'Strong innovation' },
          { criterionId: crit2Id, value: 9, feedback: 'Hard problem' },
        ],
      };

      const result = await saveScoreDraft(assign1Id, userJudge1, draftData);
      expect(result.totalRawScore).toBe(26);
      expect(result.isFinal).toBe(false);

      // Verify DB records
      const [savedScore] = await db.select().from(scores).where(eq(scores.assignmentId, assign1Id));
      expect(savedScore.totalRawScore).toBe(26);
      expect(savedScore.isFinal).toBe(false);

      const items = await db.select().from(scoreItems).where(eq(scoreItems.scoreId, savedScore.id));
      expect(items.length).toBe(2);

      // Verify audit log
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.entityId, savedScore.id), eq(auditLogs.action, 'SCORE_DRAFT_SAVED')));
      expect(auditLog).toBeDefined();
    });

    it('allows a draft to be updated and re-calculates score', async () => {
      await saveScoreDraft(assign1Id, userJudge1, {
        items: [{ criterionId: crit1Id, value: 5 }],
      });

      // Update the draft with new values
      const updatedResult = await saveScoreDraft(assign1Id, userJudge1, {
        items: [{ criterionId: crit1Id, value: 10 }],
      });

      expect(updatedResult.totalRawScore).toBe(10);
    });

    it('rejects score exceeding criterion maxScore', async () => {
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [{ criterionId: crit1Id, value: 15 }], // maxScore is 10
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects negative criterion score', async () => {
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [{ criterionId: crit1Id, value: -1 }],
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects criterion not belonging to rubric', async () => {
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [{ criterionId: 'non-existent-crit', value: 8 }],
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects duplicate criteria in same draft submission', async () => {
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [
            { criterionId: crit1Id, value: 5 },
            { criterionId: crit1Id, value: 6 },
          ],
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ==========================================
  // 4. Final Scoring & Immutability
  // ==========================================
  describe('Final Scoring & Immutability', () => {
    it('requires all rubric criteria to be scored for finalization', async () => {
      // Omitting crit3
      const incompleteData = {
        items: [
          { criterionId: crit1Id, value: 8 },
          { criterionId: crit2Id, value: 9 },
        ],
      };

      await expect(finalizeScore(assign1Id, userJudge1, incompleteData)).rejects.toThrow(
        /Final score requires every criterion to be scored/
      );
    });

    it('finalizes score, computes deterministic weighted total, updates assignment status to scored, and creates audit log', async () => {
      // 8 * 1.0 (8) + 9 * 2.0 (18) + 7 * 1.5 (10.5) = 36.5
      const finalData = {
        items: [
          { criterionId: crit1Id, value: 8, feedback: 'Innovative' },
          { criterionId: crit2Id, value: 9, feedback: 'Very complex' },
          { criterionId: crit3Id, value: 7, feedback: 'Clean design' },
        ],
      };

      const result = await finalizeScore(assign1Id, userJudge1, finalData);
      expect(result.totalRawScore).toBe(36.5);
      expect(result.isFinal).toBe(true);
      expect(result.status).toBe('scored');

      // Verify assignment status in DB
      const [assignment] = await db
        .select()
        .from(judgeAssignments)
        .where(eq(judgeAssignments.id, assign1Id));
      expect(assignment.status).toBe('scored');

      // Verify audit log
      const [auditLog] = await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.entityId, result.scoreId), eq(auditLogs.action, 'SCORE_FINALIZED')));
      expect(auditLog).toBeDefined();
    });

    it('strictly locks finalized scores against further modifications by the judge', async () => {
      // 1. Finalize score
      await finalizeScore(assign1Id, userJudge1, {
        items: [
          { criterionId: crit1Id, value: 8 },
          { criterionId: crit2Id, value: 9 },
          { criterionId: crit3Id, value: 7 },
        ],
      });

      // 2. Attempt to overwrite with draft
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [{ criterionId: crit1Id, value: 10 }],
        })
      ).rejects.toThrow(ForbiddenError);

      // 3. Attempt to re-finalize
      await expect(
        finalizeScore(assign1Id, userJudge1, {
          items: [
            { criterionId: crit1Id, value: 10 },
            { criterionId: crit2Id, value: 10 },
            { criterionId: crit3Id, value: 10 },
          ],
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ==========================================
  // 5. Assignment Details & Blind Judging
  // ==========================================
  describe('Assignment Details', () => {
    it('returns rubric, criteria, and judge score without exposing other judges', async () => {
      await saveScoreDraft(assign1Id, userJudge1, {
        items: [{ criterionId: crit1Id, value: 7.5, feedback: 'Nice UI' }],
      });

      const details = await getAssignmentDetails(assign1Id, userJudge1);
      expect(details.assignment.id).toBe(assign1Id);
      expect(details.rubric.name).toBe('Hackathon Rubric');
      expect(details.rubric.criteria.length).toBe(3);
      expect(details.score).toBeDefined();
      expect(details.score?.items.length).toBe(1);

      // Verify strict isolation: details does not leak other assignments
      expect((details as any).otherJudges).toBeUndefined();
    });
  });

  // ==========================================
  // 6. Transaction Safety & Pure Math
  // ==========================================
  describe('Transaction Safety & Deterministic Math', () => {
    it('calculateWeightedRawScore correctly computes rawScore = Σ(value_i × weight_i)', () => {
      const criteriaMap = new Map([
        ['A', { weight: 1.0, maxScore: 10, name: 'A' }],
        ['B', { weight: 2.0, maxScore: 10, name: 'B' }],
        ['C', { weight: 1.5, maxScore: 10, name: 'C' }],
      ]);

      const items = [
        { criterionId: 'A', value: 8 },
        { criterionId: 'B', value: 9 },
        { criterionId: 'C', value: 7 },
      ];

      // 8*1 + 9*2 + 7*1.5 = 8 + 18 + 10.5 = 36.5
      const total = calculateWeightedRawScore(items, criteriaMap);
      expect(total).toBe(36.5);
    });

    it('rolls back transaction on error and does not leave partial score records', async () => {
      const initialScoreCount = (await db.select().from(scores)).length;

      // Passing invalid data that fails during transaction
      await expect(
        saveScoreDraft(assign1Id, userJudge1, {
          items: [
            { criterionId: crit1Id, value: 5 },
            { criterionId: crit1Id, value: 6 }, // Duplicate
          ],
        })
      ).rejects.toThrow();

      const finalScoreCount = (await db.select().from(scores)).length;
      expect(finalScoreCount).toBe(initialScoreCount);
    });
  });
});
