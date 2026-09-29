import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import {
  users,
  judges,
  judgeAssignments,
  scores,
  normalizationResults,
  judgeStats,
} from '../src/db/schema';
import {
  calculateMean,
  calculateStandardDeviation,
  calculateZScore,
  calculateAggregateZScore,
  calculateFinalNormalizedScore,
  calculateRankings,
  normalizationService,
} from '../src/modules/judging/normalization.service';

describe('Z-Score Normalization & Ranking Engine', () => {
  // ==========================================
  // 1. Pure Mathematical Functions
  // ==========================================
  describe('Mean Calculation', () => {
    it('calculates mean correctly for multiple values', () => {
      expect(calculateMean([10, 20, 30, 40])).toBe(25);
    });

    it('calculates mean for a single value', () => {
      expect(calculateMean([42])).toBe(42);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMean([])).toBe(0);
    });
  });

  describe('Standard Deviation Calculation', () => {
    it('calculates sample standard deviation for a normal dataset', () => {
      // Dataset: [10, 12, 23, 23, 16, 23, 21, 16]
      // Mean = 18.0
      // Sample variance sum = (64 + 36 + 25 + 25 + 4 + 25 + 9 + 4) = 192 / 7 ≈ 27.4286
      // StdDev = sqrt(27.4286) ≈ 5.2372
      const dataset = [10, 12, 23, 23, 16, 23, 21, 16];
      expect(calculateStandardDeviation(dataset)).toBeCloseTo(5.2372, 3);
    });

    it('returns 0 for identical values (zero variance)', () => {
      expect(calculateStandardDeviation([80, 80, 80, 80])).toBe(0);
    });

    it('returns 0 for small dataset with single value', () => {
      expect(calculateStandardDeviation([50])).toBe(0);
    });
  });

  describe('Z-Score Calculation', () => {
    it('calculates positive z-score for value above mean', () => {
      // value 80, mean 70, stdDev 10 => z = (80 - 70) / 10 = +1.0
      expect(calculateZScore(80, 70, 10)).toBe(1.0);
    });

    it('calculates negative z-score for value below mean', () => {
      // value 60, mean 70, stdDev 10 => z = (60 - 70) / 10 = -1.0
      expect(calculateZScore(60, 70, 10)).toBe(-1.0);
    });

    it('calculates zero z-score for value equal to mean', () => {
      expect(calculateZScore(70, 70, 10)).toBe(0);
    });

    it('uses neutral zero z-score strategy when standard deviation is zero', () => {
      // Zero standard deviation must return 0, avoiding NaN or Infinity
      expect(calculateZScore(80, 80, 0)).toBe(0);
    });
  });

  describe('Aggregation Across Judges', () => {
    it('calculates mean of valid judge z-scores: [1.2, 0.8, 1.0] => 1.0', () => {
      expect(calculateAggregateZScore([1.2, 0.8, 1.0])).toBe(1.0);
    });

    it('returns 0 for empty list of z-scores', () => {
      expect(calculateAggregateZScore([])).toBe(0);
    });
  });

  describe('Final Normalized Score', () => {
    it('transforms aggregate Z to 0-100 scale: 50 + 10 * Z', () => {
      // Z = 0 => 50.0
      expect(calculateFinalNormalizedScore(0)).toBe(50.0);
      // Z = 1.0 => 60.0
      expect(calculateFinalNormalizedScore(1.0)).toBe(60.0);
      // Z = -1.5 => 35.0
      expect(calculateFinalNormalizedScore(-1.5)).toBe(35.0);
    });

    it('clamps extreme z-scores to [0, 100]', () => {
      // Z = +6.0 => 50 + 60 = 110 => clamped to 100
      expect(calculateFinalNormalizedScore(6.0)).toBe(100.0);
      // Z = -6.0 => 50 - 60 = -10 => clamped to 0
      expect(calculateFinalNormalizedScore(-6.0)).toBe(0.0);
    });
  });

  describe('Ranking Algorithm & Tie-Breakers', () => {
    it('orders by final_normalized_score descending', () => {
      const items = [
        { submissionId: 'sub-c', finalNormalizedScore: 55, rawScoreAverage: 70 },
        { submissionId: 'sub-a', finalNormalizedScore: 65, rawScoreAverage: 80 },
        { submissionId: 'sub-b', finalNormalizedScore: 60, rawScoreAverage: 75 },
      ];

      const ranked = calculateRankings(items);
      expect(ranked[0].submissionId).toBe('sub-a');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].submissionId).toBe('sub-b');
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].submissionId).toBe('sub-c');
      expect(ranked[2].rank).toBe(3);
    });

    it('uses raw_score_average descending as primary tie-breaker', () => {
      const items = [
        { submissionId: 'sub-low-raw', finalNormalizedScore: 60, rawScoreAverage: 70 },
        { submissionId: 'sub-high-raw', finalNormalizedScore: 60, rawScoreAverage: 85 },
      ];

      const ranked = calculateRankings(items);
      expect(ranked[0].submissionId).toBe('sub-high-raw');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].submissionId).toBe('sub-low-raw');
      expect(ranked[1].rank).toBe(2);
    });

    it('uses submissionId ascending as final deterministic tie-breaker', () => {
      const items = [
        { submissionId: 'sub-z', finalNormalizedScore: 60, rawScoreAverage: 80 },
        { submissionId: 'sub-a', finalNormalizedScore: 60, rawScoreAverage: 80 },
      ];

      const ranked = calculateRankings(items);
      expect(ranked[0].submissionId).toBe('sub-a');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].submissionId).toBe('sub-z');
      expect(ranked[1].rank).toBe(2);
    });
  });

  // ==========================================
  // 2. Integration: Normalization Run Service
  // ==========================================
  describe('Full Normalization Run Service', () => {
    let eventId: string;
    let judgeAId: string;
    let judgeBId: string;
    let judgeSmallId: string; // Has < 5 evaluations

    beforeAll(async () => {
      eventId = `event-norm-${randomUUID()}`;

      // Create users
      const u1 = `u1-${randomUUID()}`;
      const u2 = `u2-${randomUUID()}`;
      const u3 = `u3-${randomUUID()}`;

      await db.insert(users).values([
        { id: u1, email: `norm1-${randomUUID()}@local`, passwordHash: 'h', role: 'judge' },
        { id: u2, email: `norm2-${randomUUID()}@local`, passwordHash: 'h', role: 'judge' },
        { id: u3, email: `norm3-${randomUUID()}@local`, passwordHash: 'h', role: 'judge' },
      ]);

      judgeAId = `judge-a-${randomUUID()}`;
      judgeBId = `judge-b-${randomUUID()}`;
      judgeSmallId = `judge-small-${randomUUID()}`;

      await db.insert(judges).values([
        { id: judgeAId, eventId, userId: u1, status: 'active' },
        { id: judgeBId, eventId, userId: u2, status: 'active' },
        { id: judgeSmallId, eventId, userId: u3, status: 'active' },
      ]);
    });

    it('executes normalization run, calculates Z-scores, excludes insufficient judges, and stores results', async () => {
      // Judge A scores 5 submissions: [60, 70, 80, 90, 100] (mean = 80, stdDev = 15.8114)
      // Judge B scores 5 submissions: [40, 50, 60, 70, 80] (mean = 60, stdDev = 15.8114)
      // Judge Small scores only 2 submissions: [90, 95] -> should be excluded by default threshold (5)
      const subIds = ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5'];

      for (let i = 0; i < 5; i++) {
        // Judge A assignment
        const assignA = `assign-a-${i}-${randomUUID()}`;
        await db.insert(judgeAssignments).values({
          id: assignA,
          judgeId: judgeAId,
          submissionId: subIds[i],
          status: 'scored',
        });
        await db.insert(scores).values({
          id: `score-a-${i}-${randomUUID()}`,
          assignmentId: assignA,
          totalRawScore: 60 + i * 10, // 60, 70, 80, 90, 100
          isFinal: true,
        });

        // Judge B assignment
        const assignB = `assign-b-${i}-${randomUUID()}`;
        await db.insert(judgeAssignments).values({
          id: assignB,
          judgeId: judgeBId,
          submissionId: subIds[i],
          status: 'scored',
        });
        await db.insert(scores).values({
          id: `score-b-${i}-${randomUUID()}`,
          assignmentId: assignB,
          totalRawScore: 40 + i * 10, // 40, 50, 60, 70, 80
          isFinal: true,
        });
      }

      // Judge Small has only 2 scores
      for (let i = 0; i < 2; i++) {
        const assignSmall = `assign-small-${i}-${randomUUID()}`;
        await db.insert(judgeAssignments).values({
          id: assignSmall,
          judgeId: judgeSmallId,
          submissionId: subIds[i],
          status: 'scored',
        });
        await db.insert(scores).values({
          id: `score-small-${i}-${randomUUID()}`,
          assignmentId: assignSmall,
          totalRawScore: 90 + i * 5,
          isFinal: true,
        });
      }

      // Execute Normalization
      const runResult = await normalizationService.runNormalization({
        eventId,
        minJudgeSampleCount: 5,
      });

      expect(runResult.runId).toBeDefined();
      expect(runResult.results.length).toBe(5);

      // Verify Judge Small is excluded
      const smallExcluded = runResult.excludedJudges.find((j) => j.judgeId === judgeSmallId);
      expect(smallExcluded).toBeDefined();
      expect(smallExcluded?.sampleCount).toBe(2);

      // Verify Judge A and Judge B are included in stats
      expect(runResult.judgeStats.length).toBe(2);
      const statA = runResult.judgeStats.find((j) => j.judgeId === judgeAId);
      expect(statA?.mean).toBe(80);
      expect(statA?.sampleCount).toBe(5);

      // Verify rankings: sub-5 has highest scores in both judges (100 and 80) -> Rank 1
      const topSub = runResult.results.find((r) => r.rank === 1);
      expect(topSub?.submissionId).toBe('sub-5');

      // Verify persistence in DB
      const persistedResults = await db
        .select()
        .from(normalizationResults)
        .where(eq(normalizationResults.runId, runResult.runId));
      expect(persistedResults.length).toBe(5);

      const persistedStats = await db
        .select()
        .from(judgeStats)
        .where(eq(judgeStats.runId, runResult.runId));
      expect(persistedStats.length).toBe(2);
    });

    it('respects custom minJudgeSampleCount', async () => {
      // With threshold 2, Judge Small should now be included
      const runResult = await normalizationService.runNormalization({
        eventId,
        minJudgeSampleCount: 2,
      });

      const smallIncluded = runResult.judgeStats.find((j) => j.judgeId === judgeSmallId);
      expect(smallIncluded).toBeDefined();
      expect(smallIncluded?.sampleCount).toBe(2);
      expect(runResult.excludedJudges.length).toBe(0);
    });

    it('strictly excludes draft scores from normalization', async () => {
      const draftEventId = `event-draft-${randomUUID()}`;
      const draftJudgeId = `judge-draft-${randomUUID()}`;
      const u = `u-draft-${randomUUID()}`;

      await db.insert(users).values({
        id: u,
        email: `draft-${randomUUID()}@local`,
        passwordHash: 'h',
        role: 'judge',
      });
      await db.insert(judges).values({
        id: draftJudgeId,
        eventId: draftEventId,
        userId: u,
        status: 'active',
      });

      const assignDraft = `assign-draft-${randomUUID()}`;
      await db.insert(judgeAssignments).values({
        id: assignDraft,
        judgeId: draftJudgeId,
        submissionId: 'sub-draft',
        status: 'pending',
      });

      // Draft score: isFinal = false
      await db.insert(scores).values({
        id: `score-draft-${randomUUID()}`,
        assignmentId: assignDraft,
        totalRawScore: 99,
        isFinal: false,
      });

      const runResult = await normalizationService.runNormalization({
        eventId: draftEventId,
        minJudgeSampleCount: 1,
      });

      // Draft score must not appear in normalization results
      expect(runResult.results.length).toBe(0);
    });

    it('strictly excludes conflicted assignments from normalization', async () => {
      const conflictEventId = `event-conflict-${randomUUID()}`;
      const conflictJudgeId = `judge-conflict-${randomUUID()}`;
      const u = `u-conflict-${randomUUID()}`;

      await db.insert(users).values({
        id: u,
        email: `conflict-${randomUUID()}@local`,
        passwordHash: 'h',
        role: 'judge',
      });
      await db.insert(judges).values({
        id: conflictJudgeId,
        eventId: conflictEventId,
        userId: u,
        status: 'active',
      });

      const assignConflict = `assign-conflict-${randomUUID()}`;
      await db.insert(judgeAssignments).values({
        id: assignConflict,
        judgeId: conflictJudgeId,
        submissionId: 'sub-conflict',
        status: 'conflict',
      });

      await db.insert(scores).values({
        id: `score-conflict-${randomUUID()}`,
        assignmentId: assignConflict,
        totalRawScore: 90,
        isFinal: true,
      });

      const runResult = await normalizationService.runNormalization({
        eventId: conflictEventId,
        minJudgeSampleCount: 1,
      });

      // Conflicted assignment must not be processed
      expect(runResult.results.length).toBe(0);
    });

    it('enforces track isolation when trackId is specified', async () => {
      const trackEventId = `event-tracks-${randomUUID()}`;
      const trackJudgeId = `judge-tracks-${randomUUID()}`;
      const u = `u-tracks-${randomUUID()}`;

      await db.insert(users).values({
        id: u,
        email: `track-${randomUUID()}@local`,
        passwordHash: 'h',
        role: 'judge',
      });
      await db.insert(judges).values({
        id: trackJudgeId,
        eventId: trackEventId,
        userId: u,
        status: 'active',
      });

      const subTrackA = `sub-track-A-${randomUUID()}`;
      const subTrackB = `sub-track-B-${randomUUID()}`;

      // Assign and score both
      const assignA = `assign-track-a-${randomUUID()}`;
      await db.insert(judgeAssignments).values({
        id: assignA,
        judgeId: trackJudgeId,
        submissionId: subTrackA,
        status: 'scored',
      });
      await db.insert(scores).values({
        id: `score-track-a-${randomUUID()}`,
        assignmentId: assignA,
        totalRawScore: 85,
        isFinal: true,
      });

      const assignB = `assign-track-b-${randomUUID()}`;
      await db.insert(judgeAssignments).values({
        id: assignB,
        judgeId: trackJudgeId,
        submissionId: subTrackB,
        status: 'scored',
      });
      await db.insert(scores).values({
        id: `score-track-b-${randomUUID()}`,
        assignmentId: assignB,
        totalRawScore: 95,
        isFinal: true,
      });

      const submissionTrackMap = new Map([
        [subTrackA, 'track-ai'],
        [subTrackB, 'track-web3'],
      ]);

      // Normalize ONLY track-ai
      const trackAResult = await normalizationService.runNormalization({
        eventId: trackEventId,
        trackId: 'track-ai',
        minJudgeSampleCount: 1,
        submissionTrackMap,
      });

      expect(trackAResult.results.length).toBe(1);
      expect(trackAResult.results[0].submissionId).toBe(subTrackA);
      expect(trackAResult.results[0].trackId).toBe('track-ai');
    });

    it('is completely repeatable: multiple runs on same dataset yield identical rankings', async () => {
      const run1 = await normalizationService.runNormalization({
        eventId,
        minJudgeSampleCount: 5,
      });

      const run2 = await normalizationService.runNormalization({
        eventId,
        minJudgeSampleCount: 5,
      });

      // Different run IDs (re-run safety)
      expect(run1.runId).not.toBe(run2.runId);

      // Identical rankings and scores
      expect(run1.results.length).toBe(run2.results.length);
      for (let i = 0; i < run1.results.length; i++) {
        expect(run1.results[i].submissionId).toBe(run2.results[i].submissionId);
        expect(run1.results[i].rank).toBe(run2.results[i].rank);
        expect(run1.results[i].finalNormalizedScore).toBe(run2.results[i].finalNormalizedScore);
      }
    });

    it('rolls back completely if a persistence error occurs during normalization run', async () => {
      // Test transaction safety: if an error occurs inside transaction, no records remain
      const initialNormResults = (await db.select().from(normalizationResults)).length;

      // Mock an invalid event ID or bad data that throws during execution
      await expect(
        normalizationService.runNormalization({
          eventId: '', // Invalid
        })
      ).rejects.toThrow();

      const finalNormResults = (await db.select().from(normalizationResults)).length;
      expect(finalNormResults).toBe(initialNormResults);
    });
  });
});
