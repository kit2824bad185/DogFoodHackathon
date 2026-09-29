import { db } from './index';
import {
  users,
  judges,
  rubrics,
  rubricCriteria,
  judgeAssignments,
  judgeConflicts,
  scores,
  scoreItems,
} from './schema';
import { normalizationService } from '../modules/judging/normalization.service';
import { logger } from '../config/logger';

async function seed() {
  logger.info('Seeding database with comprehensive demo dataset...');

  try {
    const eventId = 'event-dogfood-2026';

    // 1. Seed Demo Users
    const demoUsers: Array<typeof users.$inferInsert> = [
      { id: 'demo-user-1', email: 'admin@dogfood.local', passwordHash: 'hash', role: 'admin' },
      { id: 'demo-admin', email: 'root@dogfood.local', passwordHash: 'hash', role: 'admin' },
      { id: 'demo-organizer', email: 'organizer@dogfood.local', passwordHash: 'hash', role: 'organizer' },
      { id: 'demo-judge-1', email: 'sarah.judge@dogfood.local', passwordHash: 'hash', role: 'judge' },
      { id: 'demo-judge-2', email: 'marcus.judge@dogfood.local', passwordHash: 'hash', role: 'judge' },
      { id: 'demo-judge-3', email: 'elena.judge@dogfood.local', passwordHash: 'hash', role: 'judge' },
      { id: 'demo-judge-4', email: 'devon.judge@dogfood.local', passwordHash: 'hash', role: 'judge' },
      { id: 'demo-judge-5', email: 'aisha.judge@dogfood.local', passwordHash: 'hash', role: 'judge' },
      { id: 'demo-participant', email: 'alex.participant@dogfood.local', passwordHash: 'hash', role: 'participant' },
    ];

    for (const u of demoUsers) {
      await db.insert(users).values(u).onConflictDoNothing();
    }

    // 2. Seed Judges for Event
    const judgeList = [
      { id: 'judge-1', eventId, userId: 'demo-judge-1', status: 'active' as const },
      { id: 'judge-2', eventId, userId: 'demo-judge-2', status: 'active' as const },
      { id: 'judge-3', eventId, userId: 'demo-judge-3', status: 'active' as const },
      { id: 'judge-4', eventId, userId: 'demo-judge-4', status: 'active' as const },
      { id: 'judge-5', eventId, userId: 'demo-judge-5', status: 'active' as const },
    ];

    for (const j of judgeList) {
      await db.insert(judges).values(j).onConflictDoUpdate({ target: judges.id, set: j });
    }

    // 3. Seed Rubric and Criteria
    const rubricId = 'rubric-innovation-matrix';
    await db.insert(rubrics).values({
      id: rubricId,
      eventId,
      trackId: null,
      name: 'Dogfood 2026 Core Innovation Rubric',
      description: 'Standardized holistic evaluation matrix across technology, feasibility, and impact.',
    }).onConflictDoNothing();

    const criteriaList = [
      {
        id: 'crit-innovation',
        rubricId,
        name: 'Innovation & Technical Originality',
        description: 'How novel, creative, and audacious is the concept and technical approach?',
        weight: 1.5,
        maxScore: 10,
        sortOrder: 1,
      },
      {
        id: 'crit-execution',
        rubricId,
        name: 'Technical Execution & Architecture',
        description: 'Quality of the code, stability, offline-first reliability, and architectural soundness.',
        weight: 1.5,
        maxScore: 10,
        sortOrder: 2,
      },
      {
        id: 'crit-impact',
        rubricId,
        name: 'Real-World Impact & Usability',
        description: 'Does this meaningfully solve a real problem with intuitive usability?',
        weight: 1.0,
        maxScore: 10,
        sortOrder: 3,
      },
      {
        id: 'crit-polish',
        rubricId,
        name: 'Design, Polish & Presentation',
        description: 'Visual aesthetics, fluid animations, micro-interactions, and completeness.',
        weight: 1.0,
        maxScore: 10,
        sortOrder: 4,
      },
    ];

    for (const c of criteriaList) {
      await db.insert(rubricCriteria).values(c).onConflictDoUpdate({ target: rubricCriteria.id, set: c });
    }

    // 4. Submissions
    const submissions = [
      'sub-001', // EcoTrack
      'sub-002', // AetherOS
      'sub-003', // BioPulse
      'sub-004', // SoundWave
      'sub-005', // AgriSense
      'sub-006', // OmniDoc
    ];

    // 5. Create Assignments across Judges
    // Judge 1 (demo-judge-1):
    // sub-001: pending (user can evaluate in live demo!)
    // sub-002: pending/draft
    // sub-003..005: scored
    // sub-006: conflict
    const assignmentsToSeed = [
      // Judge 1
      { id: 'assign-j1-s1', judgeId: 'judge-1', submissionId: 'sub-001', status: 'pending' as const },
      { id: 'assign-j1-s2', judgeId: 'judge-1', submissionId: 'sub-002', status: 'pending' as const },
      { id: 'assign-j1-s3', judgeId: 'judge-1', submissionId: 'sub-003', status: 'scored' as const },
      { id: 'assign-j1-s4', judgeId: 'judge-1', submissionId: 'sub-004', status: 'scored' as const },
      { id: 'assign-j1-s5', judgeId: 'judge-1', submissionId: 'sub-005', status: 'scored' as const },
      { id: 'assign-j1-s6', judgeId: 'judge-1', submissionId: 'sub-006', status: 'conflict' as const },

      // Judge 2
      { id: 'assign-j2-s1', judgeId: 'judge-2', submissionId: 'sub-001', status: 'scored' as const },
      { id: 'assign-j2-s2', judgeId: 'judge-2', submissionId: 'sub-002', status: 'scored' as const },
      { id: 'assign-j2-s3', judgeId: 'judge-2', submissionId: 'sub-003', status: 'scored' as const },
      { id: 'assign-j2-s4', judgeId: 'judge-2', submissionId: 'sub-004', status: 'scored' as const },
      { id: 'assign-j2-s5', judgeId: 'judge-2', submissionId: 'sub-005', status: 'scored' as const },

      // Judge 3
      { id: 'assign-j3-s1', judgeId: 'judge-3', submissionId: 'sub-001', status: 'scored' as const },
      { id: 'assign-j3-s2', judgeId: 'judge-3', submissionId: 'sub-002', status: 'scored' as const },
      { id: 'assign-j3-s3', judgeId: 'judge-3', submissionId: 'sub-003', status: 'scored' as const },
      { id: 'assign-j3-s4', judgeId: 'judge-3', submissionId: 'sub-004', status: 'scored' as const },
      { id: 'assign-j3-s5', judgeId: 'judge-3', submissionId: 'sub-005', status: 'scored' as const },

      // Judge 4
      { id: 'assign-j4-s1', judgeId: 'judge-4', submissionId: 'sub-001', status: 'scored' as const },
      { id: 'assign-j4-s2', judgeId: 'judge-4', submissionId: 'sub-002', status: 'scored' as const },
      { id: 'assign-j4-s3', judgeId: 'judge-4', submissionId: 'sub-003', status: 'scored' as const },
      { id: 'assign-j4-s4', judgeId: 'judge-4', submissionId: 'sub-004', status: 'scored' as const },
      { id: 'assign-j4-s5', judgeId: 'judge-4', submissionId: 'sub-005', status: 'scored' as const },

      // Judge 5
      { id: 'assign-j5-s1', judgeId: 'judge-5', submissionId: 'sub-001', status: 'scored' as const },
      { id: 'assign-j5-s2', judgeId: 'judge-5', submissionId: 'sub-002', status: 'scored' as const },
      { id: 'assign-j5-s3', judgeId: 'judge-5', submissionId: 'sub-003', status: 'scored' as const },
      { id: 'assign-j5-s4', judgeId: 'judge-5', submissionId: 'sub-004', status: 'scored' as const },
      { id: 'assign-j5-s5', judgeId: 'judge-5', submissionId: 'sub-005', status: 'scored' as const },
    ];

    for (const a of assignmentsToSeed) {
      await db.insert(judgeAssignments).values(a).onConflictDoUpdate({ target: judgeAssignments.id, set: a });
    }

    // Seed conflict for assign-j1-s6
    await db.insert(judgeConflicts).values({
      id: 'conflict-j1-s6',
      assignmentId: 'assign-j1-s6',
      judgeId: 'judge-1',
      submissionId: 'sub-006',
      reason: 'Former co-worker is team captain on this project.',
      status: 'reported',
    }).onConflictDoNothing();

    // 6. Seed scores and score items
    const evaluationData = [
      // Judge 1 (lenient)
      { assignId: 'assign-j1-s3', scores: [9, 9, 8.5, 9] },
      { assignId: 'assign-j1-s4', scores: [8.5, 8, 8, 8.5] },
      { assignId: 'assign-j1-s5', scores: [9.5, 9, 9, 9.5] },

      // Judge 2 (critical/strict)
      { assignId: 'assign-j2-s1', scores: [7, 6.5, 7, 7.5] },
      { assignId: 'assign-j2-s2', scores: [6, 6, 6.5, 6] },
      { assignId: 'assign-j2-s3', scores: [8, 7.5, 8, 8] },
      { assignId: 'assign-j2-s4', scores: [7.5, 7, 7, 7] },
      { assignId: 'assign-j2-s5', scores: [8.5, 8, 8.5, 8] },

      // Judge 3 (moderate)
      { assignId: 'assign-j3-s1', scores: [8, 8, 8.5, 8] },
      { assignId: 'assign-j3-s2', scores: [7, 7.5, 7, 7] },
      { assignId: 'assign-j3-s3', scores: [8.5, 9, 8.5, 9] },
      { assignId: 'assign-j3-s4', scores: [8, 8, 7.5, 8] },
      { assignId: 'assign-j3-s5', scores: [9, 9, 9, 9.5] },

      // Judge 4 (balanced)
      { assignId: 'assign-j4-s1', scores: [8.5, 8, 8, 8.5] },
      { assignId: 'assign-j4-s2', scores: [7.5, 8, 7.5, 7] },
      { assignId: 'assign-j4-s3', scores: [9, 8.5, 9, 9] },
      { assignId: 'assign-j4-s4', scores: [8, 7.5, 8, 8] },
      { assignId: 'assign-j4-s5', scores: [9, 9.5, 9, 9] },

      // Judge 5 (balanced)
      { assignId: 'assign-j5-s1', scores: [8, 8.5, 8, 8] },
      { assignId: 'assign-j5-s2', scores: [7, 7, 7.5, 7] },
      { assignId: 'assign-j5-s3', scores: [8.5, 8.5, 9, 8.5] },
      { assignId: 'assign-j5-s4', scores: [7.5, 8, 7.5, 8] },
      { assignId: 'assign-j5-s5', scores: [9.5, 9, 9.5, 9] },
    ];

    const critWeights = [1.5, 1.5, 1.0, 1.0];

    for (const ev of evaluationData) {
      const scoreId = `score-${ev.assignId}`;
      let totalRaw = 0;
      for (let i = 0; i < 4; i++) {
        totalRaw += ev.scores[i] * critWeights[i];
      }
      totalRaw = Math.round(totalRaw * 100) / 100;

      await db.insert(scores).values({
        id: scoreId,
        assignmentId: ev.assignId,
        totalRawScore: totalRaw,
        isFinal: true,
      }).onConflictDoUpdate({
        target: scores.id,
        set: { totalRawScore: totalRaw, isFinal: true },
      });

      for (let i = 0; i < 4; i++) {
        const itemId = `item-${scoreId}-${i}`;
        await db.insert(scoreItems).values({
          id: itemId,
          scoreId,
          criterionId: criteriaList[i].id,
          value: ev.scores[i],
          feedback: 'Solid implementation adhering to technical specs.',
        }).onConflictDoNothing();
      }
    }

    // 7. Run initial normalization to populate leaderboard
    logger.info('Executing initial normalization run...');
    const normResult = await normalizationService.runNormalization({
      eventId,
      minJudgeSampleCount: 3, // Enable normalization for demo judges with 3+ scores
    });

    logger.info({ runId: normResult.runId, resultsCount: normResult.results.length }, 'Seeding completed successfully!');
  } catch (err) {
    logger.error({ err }, 'Seeding failed');
    process.exit(1);
  }
}

seed();

