import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../../db';
import {
  judges,
  judgeAssignments,
  scores,
  judgeStats,
  normalizationResults,
} from '../../db/schema';
import { BadRequestError } from '../../utils/errors';

// ==========================================
// Types
// ==========================================

export interface NormalizationRunParams {
  eventId: string;
  trackId?: string | null;
  minJudgeSampleCount?: number;
  submissionTrackMap?: Map<string, string>;
}

export interface JudgeStatItem {
  judgeId: string;
  mean: number;
  stdDev: number;
  sampleCount: number;
}

export interface ExcludedJudgeItem {
  judgeId: string;
  sampleCount: number;
  reason: string;
}

export interface SubmissionNormalizationResult {
  submissionId: string;
  trackId?: string | null;
  aggregateZScore: number;
  finalNormalizedScore: number;
  rawScoreAverage: number;
  rank: number;
  evaluatedJudgeCount: number;
}

export interface NormalizationRunResult {
  runId: string;
  eventId: string;
  trackId: string | null;
  judgeStats: JudgeStatItem[];
  excludedJudges: ExcludedJudgeItem[];
  results: SubmissionNormalizationResult[];
  calculatedAt: string;
}

// ==========================================
// Pure Mathematical Functions
// ==========================================

/**
 * Rounds a number to a fixed decimal precision for deterministic persistence.
 * Prevents NaN, Infinity, -Infinity.
 */
export function roundTo(value: number, decimals = 4): number {
  if (isNaN(value) || !isFinite(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate arithmetic mean: μ = (Σ x_i) / n
 */
export function calculateMean(scoresList: number[]): number {
  if (!scoresList || scoresList.length === 0) {
    return 0;
  }
  const sum = scoresList.reduce((acc, val) => acc + val, 0);
  return roundTo(sum / scoresList.length, 4);
}

/**
 * Calculate sample standard deviation:
 * σ = sqrt( Σ (x_i - μ)^2 / (n - 1) ) for n > 1
 * For n <= 1, returns 0.
 */
export function calculateStandardDeviation(scoresList: number[], meanVal?: number): number {
  if (!scoresList || scoresList.length <= 1) {
    return 0;
  }
  const mean = meanVal !== undefined ? meanVal : calculateMean(scoresList);
  const varianceSum = scoresList.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = varianceSum / (scoresList.length - 1);
  return roundTo(Math.sqrt(variance), 4);
}

/**
 * Calculate Z-Score: z = (x - μ) / σ
 * Zero Standard Deviation Strategy:
 * When σ = 0 (all scores from judge are identical), judge has no variance.
 * To prevent division by zero, return a neutral z-score of 0.0.
 */
export function calculateZScore(value: number, mean: number, standardDeviation: number): number {
  if (standardDeviation === 0 || isNaN(standardDeviation) || !isFinite(standardDeviation)) {
    return 0;
  }
  const z = (value - mean) / standardDeviation;
  return roundTo(z, 4);
}

/**
 * Calculate aggregate Z-Score across all valid judges for a single submission.
 * Default strategy: mean of valid judge z-scores.
 */
export function calculateAggregateZScore(zScores: number[]): number {
  if (!zScores || zScores.length === 0) {
    return 0;
  }
  const sum = zScores.reduce((acc, val) => acc + val, 0);
  return roundTo(sum / zScores.length, 4);
}

/**
 * Final Normalized Score Formula:
 * T-Score transformation: FinalScore = clamp(50 + 10 * aggregateZScore, 0, 100)
 *
 * Rationale:
 * Standard normal Z typically ranges between -3.0 and +3.0.
 * A mean score (Z = 0) maps to 50.0.
 * 1 standard deviation above average (Z = +1.0) maps to 60.0.
 * Clamped strictly to [0, 100] to produce an intuitive, ranking-friendly 0-100 scale.
 */
export function calculateFinalNormalizedScore(aggregateZScore: number): number {
  const score = 50 + aggregateZScore * 10;
  const clamped = Math.max(0, Math.min(100, score));
  return roundTo(clamped, 4);
}

/**
 * Deterministic Ranking Engine:
 * 1. final_normalized_score descending
 * 2. raw_score_average descending (primary tie-breaker)
 * 3. submissionId ascending (deterministic alphabetical tie-breaker)
 */
export function calculateRankings<
  T extends { finalNormalizedScore: number; rawScoreAverage: number; submissionId: string }
>(items: T[]): Array<T & { rank: number }> {
  const sorted = [...items].sort((a, b) => {
    // 1. Normalized score desc
    if (b.finalNormalizedScore !== a.finalNormalizedScore) {
      return b.finalNormalizedScore - a.finalNormalizedScore;
    }
    // 2. Raw score average desc
    if (b.rawScoreAverage !== a.rawScoreAverage) {
      return b.rawScoreAverage - a.rawScoreAverage;
    }
    // 3. Deterministic submissionId asc
    return a.submissionId.localeCompare(b.submissionId);
  });

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

// ==========================================
// Service Implementation
// ==========================================

export class NormalizationService {
  /**
   * Execute a full, transaction-safe normalization run.
   */
  async runNormalization(params: NormalizationRunParams): Promise<NormalizationRunResult> {
    if (!params.eventId || params.eventId.trim().length === 0) {
      throw new BadRequestError('Event ID is required for normalization run');
    }

    const minJudgeSampleCount =
      params.minJudgeSampleCount !== undefined && params.minJudgeSampleCount > 0
        ? params.minJudgeSampleCount
        : 5;

    // 1. Collect all FINALIZED scores for the event
    // Draft scores and conflicted assignments are strictly excluded.
    const rawEvaluations = await db
      .select({
        scoreId: scores.id,
        totalRawScore: scores.totalRawScore,
        isFinal: scores.isFinal,
        assignmentId: judgeAssignments.id,
        assignmentStatus: judgeAssignments.status,
        judgeId: judgeAssignments.judgeId,
        submissionId: judgeAssignments.submissionId,
        eventId: judges.eventId,
      })
      .from(scores)
      .innerJoin(judgeAssignments, eq(scores.assignmentId, judgeAssignments.id))
      .innerJoin(judges, eq(judgeAssignments.judgeId, judges.id))
      .where(
        and(
          eq(judges.eventId, params.eventId),
          eq(scores.isFinal, true),
          eq(judgeAssignments.status, 'scored')
        )
      );

    if (rawEvaluations.length === 0) {
      const runId = randomUUID();
      const calculatedAt = new Date().toISOString();
      return {
        runId,
        eventId: params.eventId,
        trackId: params.trackId ?? null,
        judgeStats: [],
        excludedJudges: [],
        results: [],
        calculatedAt,
      };
    }

    // 2. Track Isolation Filtering
    let trackFilteredEvaluations = rawEvaluations;
    if (params.trackId) {
      let submissionTrackMap = params.submissionTrackMap;
      if (!submissionTrackMap) {
        try {
          const checkTable: any = await db.run(
            sql`SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'`
          );
          if (checkTable && checkTable.rows && checkTable.rows.length > 0) {
            const subRows: any = await db.run(sql`SELECT id, track_id FROM submissions`);
            submissionTrackMap = new Map(subRows.rows.map((r: any) => [r.id, r.track_id]));
          }
        } catch {
          // Table doesn't exist yet
        }
      }

      if (submissionTrackMap) {
        trackFilteredEvaluations = rawEvaluations.filter(
          (e) => submissionTrackMap!.get(e.submissionId) === params.trackId
        );
      }
    }

    // 3. Compute Judge Statistics from ALL finalized scores of that judge in the event
    // (Note: Judge scoring behavior is judged across all their event evaluations)
    const judgeAllScoresMap = new Map<string, number[]>();
    for (const evaluation of rawEvaluations) {
      const existing = judgeAllScoresMap.get(evaluation.judgeId) || [];
      existing.push(evaluation.totalRawScore);
      judgeAllScoresMap.set(evaluation.judgeId, existing);
    }

    const validJudges = new Map<string, { mean: number; stdDev: number; sampleCount: number }>();
    const excludedJudges: ExcludedJudgeItem[] = [];

    for (const [judgeId, scoreList] of judgeAllScoresMap.entries()) {
      if (scoreList.length < minJudgeSampleCount) {
        excludedJudges.push({
          judgeId,
          sampleCount: scoreList.length,
          reason: `Insufficient sample count (${scoreList.length} < minimum ${minJudgeSampleCount})`,
        });
      } else {
        const mean = calculateMean(scoreList);
        const stdDev = calculateStandardDeviation(scoreList, mean);
        validJudges.set(judgeId, { mean, stdDev, sampleCount: scoreList.length });
      }
    }

    // 4. Calculate Z-Scores & Aggregate per Submission
    const submissionEvalsMap = new Map<
      string,
      Array<{ judgeId: string; rawScore: number; zScore?: number }>
    >();

    for (const evaluation of trackFilteredEvaluations) {
      const list = submissionEvalsMap.get(evaluation.submissionId) || [];
      const judgeStat = validJudges.get(evaluation.judgeId);

      if (judgeStat) {
        const zScore = calculateZScore(evaluation.totalRawScore, judgeStat.mean, judgeStat.stdDev);
        list.push({ judgeId: evaluation.judgeId, rawScore: evaluation.totalRawScore, zScore });
      } else {
        // Excluded judge score still kept for raw average but excluded from z-score
        list.push({ judgeId: evaluation.judgeId, rawScore: evaluation.totalRawScore });
      }

      submissionEvalsMap.set(evaluation.submissionId, list);
    }

    // 5. Aggregate Normalized Scores per Submission
    const unrankedResults: Array<{
      submissionId: string;
      trackId: string | null;
      aggregateZScore: number;
      finalNormalizedScore: number;
      rawScoreAverage: number;
      evaluatedJudgeCount: number;
    }> = [];

    for (const [submissionId, evals] of submissionEvalsMap.entries()) {
      const validZScores = evals
        .filter((e) => e.zScore !== undefined)
        .map((e) => e.zScore as number);

      const allRawScores = evals.map((e) => e.rawScore);
      const rawScoreAverage = calculateMean(allRawScores);

      const aggregateZScore =
        validZScores.length > 0 ? calculateAggregateZScore(validZScores) : 0;
      const finalNormalizedScore = calculateFinalNormalizedScore(aggregateZScore);

      unrankedResults.push({
        submissionId,
        trackId: params.trackId ?? null,
        aggregateZScore,
        finalNormalizedScore,
        rawScoreAverage,
        evaluatedJudgeCount: evals.length,
      });
    }

    // 6. Generate Deterministic Rankings with Tie-Breakers
    const rankedResults = calculateRankings(unrankedResults);

    // 7. Persist Run Results Transactionally
    const runId = randomUUID();
    const calculatedAt = new Date().toISOString();

    db.transaction((tx) => {
      // 1. Persist judge_stats
      for (const [judgeId, stats] of validJudges.entries()) {
        tx.insert(judgeStats)
          .values({
            id: randomUUID(),
            runId,
            judgeId,
            meanScore: stats.mean,
            stdDev: stats.stdDev,
            sampleCount: stats.sampleCount,
            calculatedAt,
          })
          .run();
      }

      // 2. Persist normalization_results
      for (const res of rankedResults) {
        tx.insert(normalizationResults)
          .values({
            id: randomUUID(),
            runId,
            submissionId: res.submissionId,
            trackId: res.trackId,
            aggregateZScore: res.aggregateZScore,
            finalNormalizedScore: res.finalNormalizedScore,
            rawScoreAverage: res.rawScoreAverage,
            rank: res.rank,
            calculatedAt,
          })
          .run();
      }
    });

    return {
      runId,
      eventId: params.eventId,
      trackId: params.trackId ?? null,
      judgeStats: Array.from(validJudges.entries()).map(([judgeId, stats]) => ({
        judgeId,
        ...stats,
      })),
      excludedJudges,
      results: rankedResults,
      calculatedAt,
    };
  }
}

export const normalizationService = new NormalizationService();
