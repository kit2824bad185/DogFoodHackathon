import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../../db';
import {
  judges,
  rubrics,
  rubricCriteria,
  judgeAssignments,
  judgeConflicts,
  scores,
  scoreItems,
  auditLogs,
} from '../../db/schema';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

export interface ScoreItemPayload {
  criterionId: string;
  value: number;
  feedback?: string | null;
}

export interface ScoreSubmissionPayload {
  items: ScoreItemPayload[];
}

/**
 * Audit Logging Helper (Synchronous inside better-sqlite3 transactions)
 */
export function logAuditEvent(
  tx: any,
  params: {
    actorId: string | null;
    action: 'SCORE_DRAFT_SAVED' | 'SCORE_FINALIZED' | 'JUDGE_CONFLICT_REPORTED';
    entityType: 'judge_assignment' | 'score';
    entityId: string;
    metadata?: Record<string, any>;
  }
) {
  tx.insert(auditLogs).values({
    id: randomUUID(),
    actorId: params.actorId,
    action: params.action,
    entity: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    createdAt: new Date(),
  }).run();
}

/**
 * Server-side Deterministic Weighted Score Calculation
 * rawScore = Σ(value_i × weight_i)
 */
export function calculateWeightedRawScore(
  items: ScoreItemPayload[],
  criteriaMap: Map<string, { weight: number; maxScore: number; name: string }>
): number {
  let total = 0;
  for (const item of items) {
    const criterion = criteriaMap.get(item.criterionId);
    if (!criterion) {
      throw new BadRequestError(`Criterion not found or does not belong to rubric: ${item.criterionId}`);
    }
    if (item.value < 0) {
      throw new BadRequestError(`Score value must be non-negative for criterion: "${criterion.name}"`);
    }
    if (item.value > criterion.maxScore) {
      throw new BadRequestError(
        `Score value ${item.value} exceeds maximum score ${criterion.maxScore} for criterion: "${criterion.name}"`
      );
    }
    total += item.value * criterion.weight;
  }
  // Round to 4 decimal places for floating-point consistency
  return Math.round(total * 10000) / 10000;
}

/**
 * 1. Verify Judge Assignment Access
 * Enforces strict Row-Level Security:
 * Returns 403 Forbidden if the assignment does not belong to the authenticated judge.
 */
export async function verifyJudgeAssignment(assignmentId: string, authenticatedUserId: string) {
  const [result] = await db
    .select({
      assignment: judgeAssignments,
      judge: judges,
    })
    .from(judgeAssignments)
    .innerJoin(judges, eq(judgeAssignments.judgeId, judges.id))
    .where(eq(judgeAssignments.id, assignmentId));

  if (!result) {
    throw new NotFoundError(`Assignment not found: ${assignmentId}`);
  }

  // Allow match by user_id (logged-in user) or judge_id directly
  const isOwner =
    result.judge.userId === authenticatedUserId || result.assignment.judgeId === authenticatedUserId;

  if (!isOwner) {
    throw new ForbiddenError('Forbidden: You are not authorized to access this assignment');
  }

  if (result.judge.status !== 'active') {
    throw new ForbiddenError('Forbidden: Judge is inactive for this event');
  }

  return {
    assignment: result.assignment,
    judge: result.judge,
  };
}

/**
 * Helper to fetch the applicable rubric and all criteria for an assignment's event/track
 */
export async function getApplicableRubricForAssignment(eventId: string, trackId?: string | null) {
  // First attempt track-specific rubric if trackId is provided
  let selectedRubric = null;
  if (trackId) {
    const [trackRubric] = await db
      .select()
      .from(rubrics)
      .where(and(eq(rubrics.eventId, eventId), eq(rubrics.trackId, trackId)));
    selectedRubric = trackRubric;
  }

  // Fallback to event-wide rubric (where trackId is null) or any rubric for event
  if (!selectedRubric) {
    const [eventRubric] = await db
      .select()
      .from(rubrics)
      .where(eq(rubrics.eventId, eventId));
    selectedRubric = eventRubric;
  }

  if (!selectedRubric) {
    throw new NotFoundError(`No rubric found for event: ${eventId}`);
  }

  const criteria = await db
    .select()
    .from(rubricCriteria)
    .where(eq(rubricCriteria.rubricId, selectedRubric.id))
    .orderBy(rubricCriteria.sortOrder);

  if (criteria.length === 0) {
    throw new BadRequestError(`Rubric "${selectedRubric.name}" has no scoring criteria configured`);
  }

  return {
    rubric: selectedRubric,
    criteria,
  };
}

/**
 * 2. Get Judge Assignments
 * Strict Blind-Judging: Only returns the judge's own assignments.
 */
export async function getJudgeAssignments(authenticatedUserId: string, filter?: { eventId?: string }) {
  // 1. Locate all judge records for this user
  const judgeRecords = await db
    .select()
    .from(judges)
    .where(
      filter?.eventId
        ? and(
            sql`(${judges.userId} = ${authenticatedUserId} OR ${judges.id} = ${authenticatedUserId})`,
            eq(judges.eventId, filter.eventId)
          )
        : sql`(${judges.userId} = ${authenticatedUserId} OR ${judges.id} = ${authenticatedUserId})`
    );

  if (judgeRecords.length === 0) {
    return [];
  }

  const judgeIds = judgeRecords.map((j) => j.id);

  // 2. Query assignments for these judge IDs
  const assignments = await db
    .select({
      id: judgeAssignments.id,
      judgeId: judgeAssignments.judgeId,
      submissionId: judgeAssignments.submissionId,
      status: judgeAssignments.status,
      assignedAt: judgeAssignments.assignedAt,
      scoreId: scores.id,
      totalRawScore: scores.totalRawScore,
      isFinal: scores.isFinal,
      submittedAt: scores.submittedAt,
    })
    .from(judgeAssignments)
    .leftJoin(scores, eq(scores.assignmentId, judgeAssignments.id))
    .where(sql`${judgeAssignments.judgeId} IN ${judgeIds}`)
    .orderBy(judgeAssignments.assignedAt);

  return assignments.map((a) => ({
    id: a.id,
    judgeId: a.judgeId,
    submissionId: a.submissionId,
    status: a.status,
    assignedAt: a.assignedAt,
    isScored: a.isFinal === true,
    score: a.scoreId
      ? {
          id: a.scoreId,
          totalRawScore: a.totalRawScore,
          isFinal: a.isFinal,
          submittedAt: a.submittedAt,
        }
      : null,
  }));
}

/**
 * 3. Get Assignment Details
 * Includes permitted assignment info, rubric, criteria, and current judge's existing score.
 */
export async function getAssignmentDetails(assignmentId: string, authenticatedUserId: string) {
  const { assignment, judge } = await verifyJudgeAssignment(assignmentId, authenticatedUserId);

  const { rubric, criteria } = await getApplicableRubricForAssignment(judge.eventId);

  // Fetch current score if one exists
  const [existingScore] = await db
    .select()
    .from(scores)
    .where(eq(scores.assignmentId, assignmentId));

  let scoreDetails = null;
  if (existingScore) {
    const items = await db
      .select()
      .from(scoreItems)
      .where(eq(scoreItems.scoreId, existingScore.id));

    scoreDetails = {
      ...existingScore,
      items,
    };
  }

  return {
    assignment: {
      id: assignment.id,
      judgeId: assignment.judgeId,
      submissionId: assignment.submissionId,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
    },
    rubric: {
      id: rubric.id,
      name: rubric.name,
      description: rubric.description,
      criteria: criteria.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        weight: c.weight,
        maxScore: c.maxScore,
        sortOrder: c.sortOrder,
      })),
    },
    score: scoreDetails,
  };
}

/**
 * 4. Conflict of Interest Reporting
 */
export async function reportConflict(assignmentId: string, authenticatedUserId: string, reason: string) {
  const { assignment, judge } = await verifyJudgeAssignment(assignmentId, authenticatedUserId);

  if (!reason || reason.trim().length === 0) {
    throw new BadRequestError('Conflict reason is required and cannot be blank');
  }

  if (assignment.status === 'scored') {
    throw new BadRequestError('Cannot report conflict on an already scored assignment');
  }

  if (assignment.status === 'conflict') {
    throw new BadRequestError('Conflict has already been reported for this assignment');
  }

  const conflictId = randomUUID();

  db.transaction((tx) => {
    // 1. Create conflict record
    tx.insert(judgeConflicts).values({
      id: conflictId,
      assignmentId: assignment.id,
      judgeId: assignment.judgeId,
      submissionId: assignment.submissionId,
      reason: reason.trim(),
      status: 'reported',
      reportedAt: new Date().toISOString(),
    }).run();

    // 2. Change assignment status to conflict
    tx.update(judgeAssignments)
      .set({ status: 'conflict' })
      .where(eq(judgeAssignments.id, assignment.id))
      .run();

    // 3. Write audit log
    logAuditEvent(tx, {
      actorId: judge.userId,
      action: 'JUDGE_CONFLICT_REPORTED',
      entityType: 'judge_assignment',
      entityId: assignment.id,
      metadata: {
        conflictId,
        judgeId: assignment.judgeId,
        submissionId: assignment.submissionId,
        reason: reason.trim(),
      },
    });
  });

  return {
    success: true,
    conflictId,
    assignmentId: assignment.id,
    status: 'conflict',
  };
}

/**
 * 5. Save Score Draft
 */
export async function saveScoreDraft(
  assignmentId: string,
  authenticatedUserId: string,
  scoreData: ScoreSubmissionPayload
) {
  const { assignment, judge } = await verifyJudgeAssignment(assignmentId, authenticatedUserId);

  if (assignment.status === 'conflict') {
    throw new BadRequestError('Cannot score an assignment that has been marked as a conflict');
  }

  // Check if score is already finalized (Score Immutability Rule)
  const [existingScore] = await db
    .select()
    .from(scores)
    .where(eq(scores.assignmentId, assignmentId));

  if (existingScore && existingScore.isFinal) {
    throw new ForbiddenError('This score has already been finalized and is locked against modifications');
  }

  // Retrieve rubric and validate criteria
  const { criteria } = await getApplicableRubricForAssignment(judge.eventId);
  const criteriaMap = new Map(criteria.map((c) => [c.id, { weight: c.weight, maxScore: c.maxScore, name: c.name }]));

  // Duplicate criterion check
  const seenCriteria = new Set<string>();
  for (const item of scoreData.items) {
    if (seenCriteria.has(item.criterionId)) {
      throw new BadRequestError(`Duplicate criterion ID in score submission: ${item.criterionId}`);
    }
    seenCriteria.add(item.criterionId);
  }

  // Calculate server-side weighted score
  const totalRawScore = calculateWeightedRawScore(scoreData.items, criteriaMap);

  const scoreId = existingScore ? existingScore.id : randomUUID();
  const submittedAt = new Date().toISOString();

  db.transaction((tx) => {
    // 1. Upsert score header
    if (existingScore) {
      tx.update(scores)
        .set({
          totalRawScore,
          isFinal: false,
          submittedAt,
        })
        .where(eq(scores.id, scoreId))
        .run();
    } else {
      tx.insert(scores).values({
        id: scoreId,
        assignmentId: assignment.id,
        totalRawScore,
        isFinal: false,
        submittedAt,
      }).run();
    }

    // 2. Clear old score items and insert new ones
    tx.delete(scoreItems).where(eq(scoreItems.scoreId, scoreId)).run();

    if (scoreData.items.length > 0) {
      const itemsToInsert = scoreData.items.map((item) => ({
        id: randomUUID(),
        scoreId,
        criterionId: item.criterionId,
        value: item.value,
        feedback: item.feedback?.trim() || null,
      }));

      tx.insert(scoreItems).values(itemsToInsert).run();
    }

    // 3. Write audit log
    logAuditEvent(tx, {
      actorId: judge.userId,
      action: 'SCORE_DRAFT_SAVED',
      entityType: 'score',
      entityId: scoreId,
      metadata: {
        assignmentId: assignment.id,
        totalRawScore,
        itemCount: scoreData.items.length,
      },
    });
  });

  return {
    scoreId,
    assignmentId: assignment.id,
    totalRawScore,
    isFinal: false,
    submittedAt,
  };
}

/**
 * 6. Finalize Score
 * Enforces full scoring completeness and locks the evaluation immutably.
 */
export async function finalizeScore(
  assignmentId: string,
  authenticatedUserId: string,
  scoreData: ScoreSubmissionPayload
) {
  const { assignment, judge } = await verifyJudgeAssignment(assignmentId, authenticatedUserId);

  if (assignment.status === 'conflict') {
    throw new BadRequestError('Cannot finalize score for an assignment marked as conflict');
  }

  // Score Immutability Rule
  const [existingScore] = await db
    .select()
    .from(scores)
    .where(eq(scores.assignmentId, assignmentId));

  if (existingScore && existingScore.isFinal) {
    throw new ForbiddenError('This score has already been finalized and is locked against modifications');
  }

  // Retrieve rubric and validate criteria
  const { criteria } = await getApplicableRubricForAssignment(judge.eventId);
  const criteriaMap = new Map(criteria.map((c) => [c.id, { weight: c.weight, maxScore: c.maxScore, name: c.name }]));

  // RULE: Every criterion in the rubric MUST have a score for finalization
  const submittedCriterionIds = new Set(scoreData.items.map((i) => i.criterionId));
  for (const criterion of criteria) {
    if (!submittedCriterionIds.has(criterion.id)) {
      throw new BadRequestError(
        `Final score requires every criterion to be scored. Missing score for: "${criterion.name}"`
      );
    }
  }

  // Duplicate criterion check
  const seenCriteria = new Set<string>();
  for (const item of scoreData.items) {
    if (seenCriteria.has(item.criterionId)) {
      throw new BadRequestError(`Duplicate criterion ID in score submission: ${item.criterionId}`);
    }
    seenCriteria.add(item.criterionId);
  }

  // Calculate server-side weighted score
  const totalRawScore = calculateWeightedRawScore(scoreData.items, criteriaMap);

  const scoreId = existingScore ? existingScore.id : randomUUID();
  const submittedAt = new Date().toISOString();

  db.transaction((tx) => {
    // 1. Save finalized score
    if (existingScore) {
      tx.update(scores)
        .set({
          totalRawScore,
          isFinal: true,
          submittedAt,
        })
        .where(eq(scores.id, scoreId))
        .run();
    } else {
      tx.insert(scores).values({
        id: scoreId,
        assignmentId: assignment.id,
        totalRawScore,
        isFinal: true,
        submittedAt,
      }).run();
    }

    // 2. Replace score items
    tx.delete(scoreItems).where(eq(scoreItems.scoreId, scoreId)).run();
    const itemsToInsert = scoreData.items.map((item) => ({
      id: randomUUID(),
      scoreId,
      criterionId: item.criterionId,
      value: item.value,
      feedback: item.feedback?.trim() || null,
    }));
    tx.insert(scoreItems).values(itemsToInsert).run();

    // 3. Update assignment status to 'scored'
    tx.update(judgeAssignments)
      .set({ status: 'scored' })
      .where(eq(judgeAssignments.id, assignment.id))
      .run();

    // 4. Write audit log
    logAuditEvent(tx, {
      actorId: judge.userId,
      action: 'SCORE_FINALIZED',
      entityType: 'score',
      entityId: scoreId,
      metadata: {
        assignmentId: assignment.id,
        totalRawScore,
        itemCount: scoreData.items.length,
      },
    });

    // 5. Update submission judged status if all assignments scored
    checkAndUpdateSubmissionJudgedStatus(assignment.submissionId, tx);
  });

  return {
    scoreId,
    assignmentId: assignment.id,
    totalRawScore,
    isFinal: true,
    status: 'scored',
    submittedAt,
  };
}

/**
 * 8. Check and Update Submission Judged Status
 * Transitions submission to 'judged' when all assigned judges have finalized scoring.
 */
export function checkAndUpdateSubmissionJudgedStatus(submissionId: string, tx: any = db) {
  const assignments = tx
    .select()
    .from(judgeAssignments)
    .where(
      and(
        eq(judgeAssignments.submissionId, submissionId),
        sql`${judgeAssignments.status} != 'conflict'`
      )
    )
    .all();

  if (assignments.length === 0) {
    return { allScored: false, totalAssignments: 0, scoredAssignments: 0 };
  }

  const scoredAssignments = assignments.filter((a: any) => a.status === 'scored');
  const allScored = scoredAssignments.length === assignments.length;

  if (allScored) {
    try {
      // Gracefully check if 'submissions' table exists before updating
      const checkTable: any = tx.run(
        sql`SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'`
      );
      if (checkTable && checkTable.rows && checkTable.rows.length > 0) {
        tx.run(sql`UPDATE submissions SET status = 'judged' WHERE id = ${submissionId}`);
      }
    } catch {
      // Submissions table not yet created by Member 1; gracefully handle dependency
    }
  }

  return {
    allScored,
    totalAssignments: assignments.length,
    scoredAssignments: scoredAssignments.length,
  };
}
