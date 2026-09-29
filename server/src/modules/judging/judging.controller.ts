import { Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db';
import { normalizationResults, judgeStats } from '../../db/schema';
import {
  getJudgeAssignments,
  getAssignmentDetails,
  reportConflict,
  saveScoreDraft,
  finalizeScore,
} from './judging.service';
import { normalizationService } from './normalization.service';
import { reportConflictSchema, runNormalizationSchema, submitScoreSchema } from './judging.schema';
import { sendSuccess } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

export class JudgingController {
  /**
   * 1. GET /api/v1/judging/assignments
   * Judge retrieves their own assignments.
   */
  async getAssignments(req: Request, res: Response) {
    const authenticatedUserId = req.user!.id;
    const eventId = typeof req.query.eventId === 'string' ? req.query.eventId : undefined;

    const assignments = await getJudgeAssignments(authenticatedUserId, { eventId });
    sendSuccess(res, assignments);
  }

  /**
   * 2. GET /api/v1/judging/assignments/:assignmentId
   * Retrieves single assignment details (with rubric & criteria).
   */
  async getAssignmentDetails(req: Request, res: Response) {
    const authenticatedUserId = req.user!.id;
    const assignmentId = String(req.params.assignmentId);

    const details = await getAssignmentDetails(assignmentId, authenticatedUserId);
    sendSuccess(res, details);
  }

  /**
   * 3. POST /api/v1/judging/assignments/:assignmentId/conflict
   * Report conflict of interest.
   */
  async reportConflict(req: Request, res: Response) {
    const authenticatedUserId = req.user!.id;
    const assignmentId = String(req.params.assignmentId);

    // Validate using reportConflictSchema
    const validated = await reportConflictSchema.parseAsync({
      assignmentId,
      reason: req.body?.reason,
    });

    const result = await reportConflict(assignmentId, authenticatedUserId, validated.reason);
    sendSuccess(res, result);
  }

  /**
   * 4. PUT/POST /api/v1/judging/assignments/:assignmentId/score
   * Save draft or finalize score.
   */
  async submitScore(req: Request, res: Response) {
    const authenticatedUserId = req.user!.id;
    const assignmentId = String(req.params.assignmentId);

    // Validate body strictly
    const validatedData = await submitScoreSchema.parseAsync(req.body);

    if (validatedData.isFinal) {
      const result = await finalizeScore(assignmentId, authenticatedUserId, validatedData);
      sendSuccess(res, result);
    } else {
      const result = await saveScoreDraft(assignmentId, authenticatedUserId, validatedData);
      sendSuccess(res, result);
    }
  }

  /**
   * 5. POST /api/v1/judging/normalize
   * Organizer / Admin triggers Z-score normalization.
   */
  async runNormalization(req: Request, res: Response) {
    const validatedData = await runNormalizationSchema.parseAsync(req.body);

    const result = await normalizationService.runNormalization({
      eventId: validatedData.eventId,
      trackId: validatedData.trackId,
      minJudgeSampleCount: validatedData.minJudgeSampleCount,
    });

    sendSuccess(res, result);
  }

  /**
   * 6. GET /api/v1/judging/results
   * Retrieves normalized results without exposing private judge scores.
   */
  async getResults(req: Request, res: Response) {
    const eventId = typeof req.query.eventId === 'string' ? req.query.eventId : undefined;
    const trackId = typeof req.query.trackId === 'string' ? req.query.trackId : undefined;
    const runId = typeof req.query.runId === 'string' ? req.query.runId : undefined;

    let targetRunId = runId;

    // If runId is not explicitly specified, find the latest run
    if (!targetRunId) {
      const [latest] = await db
        .select({ runId: normalizationResults.runId })
        .from(normalizationResults)
        .orderBy(desc(normalizationResults.calculatedAt))
        .limit(1);

      if (!latest) {
        return sendSuccess(res, []);
      }
      targetRunId = latest.runId;
    }

    const whereConditions = [eq(normalizationResults.runId, targetRunId)];
    if (trackId) {
      whereConditions.push(eq(normalizationResults.trackId, trackId));
    }

    const results = await db
      .select({
        submissionId: normalizationResults.submissionId,
        trackId: normalizationResults.trackId,
        aggregateZScore: normalizationResults.aggregateZScore,
        finalNormalizedScore: normalizationResults.finalNormalizedScore,
        rawScoreAverage: normalizationResults.rawScoreAverage,
        rank: normalizationResults.rank,
        calculatedAt: normalizationResults.calculatedAt,
      })
      .from(normalizationResults)
      .where(and(...whereConditions))
      .orderBy(normalizationResults.rank);

    sendSuccess(res, results, { runId: targetRunId, count: results.length });
  }

  /**
   * 7. GET /api/v1/judging/normalization/:runId
   * Retrieves full stats and results for a specific run (Admin / Organizer only).
   */
  async getNormalizationRun(req: Request, res: Response) {
    const runId = String(req.params.runId);

    const stats = await db
      .select({
        judgeId: judgeStats.judgeId,
        meanScore: judgeStats.meanScore,
        stdDev: judgeStats.stdDev,
        sampleCount: judgeStats.sampleCount,
      })
      .from(judgeStats)
      .where(eq(judgeStats.runId, runId));

    const results = await db
      .select({
        submissionId: normalizationResults.submissionId,
        trackId: normalizationResults.trackId,
        aggregateZScore: normalizationResults.aggregateZScore,
        finalNormalizedScore: normalizationResults.finalNormalizedScore,
        rawScoreAverage: normalizationResults.rawScoreAverage,
        rank: normalizationResults.rank,
      })
      .from(normalizationResults)
      .where(eq(normalizationResults.runId, runId))
      .orderBy(normalizationResults.rank);

    if (stats.length === 0 && results.length === 0) {
      throw new NotFoundError(`Normalization run not found: ${runId}`);
    }

    sendSuccess(res, {
      runId,
      judgeStats: stats,
      results,
    });
  }
}

export const judgingController = new JudgingController();
