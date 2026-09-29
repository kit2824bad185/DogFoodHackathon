import { describe, it, expect } from 'vitest';
import {
  createRubricSchema,
  updateRubricSchema,
  createRubricCriterionSchema,
  updateRubricCriterionSchema,
  registerJudgeSchema,
  assignJudgeSchema,
  reportConflictSchema,
  resolveConflictSchema,
  scoreItemSchema,
  submitScoreSchema,
  unlockScoreSchema,
  runNormalizationSchema,
  publishResultsSchema,
} from '../src/modules/judging/judging.schema';

describe('Judging Zod Validation Schemas', () => {
  // ==========================================
  // 1. Rubric Schemas
  // ==========================================
  describe('createRubricSchema', () => {
    it('accepts a valid rubric', () => {
      const input = {
        eventId: 'event-123',
        trackId: 'track-456',
        name: 'Technical Innovation Rubric',
        description: 'Comprehensive scoring rubric for technical projects',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Technical Innovation Rubric');
        expect(result.data.trackId).toBe('track-456');
      }
    });

    it('accepts a valid event-wide rubric with null/omitted trackId and description', () => {
      const input = {
        eventId: 'event-123',
        name: 'General Rubric',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an empty rubric name', () => {
      const input = {
        eventId: 'event-123',
        name: '',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only rubric name', () => {
      const input = {
        eventId: 'event-123',
        name: '   ',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects missing eventId', () => {
      const input = {
        name: 'Rubric Without Event',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects unknown fields in strict mode', () => {
      const input = {
        eventId: 'event-123',
        name: 'Strict Rubric',
        unknownField: 'malformed',
      };
      const result = createRubricSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updateRubricSchema', () => {
    it('accepts valid partial updates', () => {
      const result = updateRubricSchema.safeParse({ name: 'Updated Name' });
      expect(result.success).toBe(true);
    });

    it('rejects empty name on update', () => {
      const result = updateRubricSchema.safeParse({ name: '  ' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // 2. Rubric Criterion Schemas
  // ==========================================
  describe('createRubricCriterionSchema', () => {
    it('accepts a valid criterion with all fields', () => {
      const input = {
        rubricId: 'rubric-1',
        name: 'Code Quality',
        description: 'Clean, idiomatic, well-tested code',
        weight: 1.5,
        maxScore: 20,
        sortOrder: 1,
      };
      const result = createRubricCriterionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBe(1.5);
        expect(result.data.maxScore).toBe(20);
      }
    });

    it('applies defaults for weight, maxScore, and sortOrder', () => {
      const input = {
        rubricId: 'rubric-1',
        name: 'UI/UX Design',
      };
      const result = createRubricCriterionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBe(1.0);
        expect(result.data.maxScore).toBe(10);
        expect(result.data.sortOrder).toBe(0);
      }
    });

    it('rejects empty criterion name', () => {
      const input = {
        rubricId: 'rubric-1',
        name: '',
      };
      const result = createRubricCriterionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects invalid weight (zero or negative)', () => {
      const zeroWeight = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        weight: 0,
      });
      expect(zeroWeight.success).toBe(false);

      const negativeWeight = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        weight: -0.5,
      });
      expect(negativeWeight.success).toBe(false);
    });

    it('rejects invalid maxScore (zero or negative)', () => {
      const zeroMaxScore = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        maxScore: 0,
      });
      expect(zeroMaxScore.success).toBe(false);

      const negativeMaxScore = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        maxScore: -10,
      });
      expect(negativeMaxScore.success).toBe(false);
    });

    it('rejects invalid sortOrder (negative or float)', () => {
      const negativeSort = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        sortOrder: -1,
      });
      expect(negativeSort.success).toBe(false);

      const floatSort = createRubricCriterionSchema.safeParse({
        rubricId: 'rubric-1',
        name: 'Criterion',
        sortOrder: 1.5,
      });
      expect(floatSort.success).toBe(false);
    });
  });

  describe('updateRubricCriterionSchema', () => {
    it('accepts valid partial criterion update', () => {
      const result = updateRubricCriterionSchema.safeParse({
        weight: 2.0,
        maxScore: 50,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid weight in partial update', () => {
      const result = updateRubricCriterionSchema.safeParse({
        weight: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // 3. Judge Management Schemas
  // ==========================================
  describe('registerJudgeSchema', () => {
    it('accepts valid judge registration with default status', () => {
      const input = {
        eventId: 'event-1',
        userId: 'user-1',
      };
      const result = registerJudgeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('active');
      }
    });

    it('accepts explicit inactive status', () => {
      const input = {
        eventId: 'event-1',
        userId: 'user-1',
        status: 'inactive',
      };
      const result = registerJudgeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('inactive');
      }
    });

    it('rejects invalid status', () => {
      const input = {
        eventId: 'event-1',
        userId: 'user-1',
        status: 'suspended',
      };
      const result = registerJudgeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects missing eventId or userId', () => {
      expect(registerJudgeSchema.safeParse({ userId: 'u1' }).success).toBe(false);
      expect(registerJudgeSchema.safeParse({ eventId: 'e1' }).success).toBe(false);
    });
  });

  describe('assignJudgeSchema', () => {
    it('accepts a valid assignment', () => {
      const input = {
        judgeId: 'judge-10',
        submissionId: 'sub-20',
      };
      const result = assignJudgeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid assignment with missing fields or empty strings', () => {
      expect(assignJudgeSchema.safeParse({ judgeId: 'judge-10' }).success).toBe(false);
      expect(assignJudgeSchema.safeParse({ submissionId: 'sub-20' }).success).toBe(false);
      expect(assignJudgeSchema.safeParse({ judgeId: '', submissionId: 'sub-20' }).success).toBe(false);
      expect(assignJudgeSchema.safeParse({ judgeId: 'judge-10', submissionId: '   ' }).success).toBe(false);
    });
  });

  // ==========================================
  // 4. Conflict of Interest Schemas
  // ==========================================
  describe('reportConflictSchema', () => {
    it('accepts a valid conflict report', () => {
      const input = {
        assignmentId: 'assign-1',
        reason: 'I am a mentor for this team.',
      };
      const result = reportConflictSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an empty conflict reason', () => {
      const input = {
        assignmentId: 'assign-1',
        reason: '',
      };
      const result = reportConflictSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only conflict reason', () => {
      const input = {
        assignmentId: 'assign-1',
        reason: '     ',
      };
      const result = reportConflictSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('resolveConflictSchema', () => {
    it('accepts a valid conflict resolution', () => {
      const input = {
        conflictId: 'conflict-1',
        newJudgeId: 'judge-new',
      };
      const result = resolveConflictSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects missing fields in conflict resolution', () => {
      expect(resolveConflictSchema.safeParse({ conflictId: 'c1' }).success).toBe(false);
      expect(resolveConflictSchema.safeParse({ newJudgeId: 'j2' }).success).toBe(false);
    });
  });

  // ==========================================
  // 5. Scoring Schemas
  // ==========================================
  describe('scoreItemSchema', () => {
    it('accepts a valid score item', () => {
      const input = {
        criterionId: 'crit-1',
        value: 8.5,
        feedback: 'Great presentation and clear demo.',
      };
      const result = scoreItemSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts a score value of zero', () => {
      const input = {
        criterionId: 'crit-1',
        value: 0,
      };
      const result = scoreItemSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects negative criterion score', () => {
      const input = {
        criterionId: 'crit-1',
        value: -1,
      };
      const result = scoreItemSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-numeric criterion score', () => {
      const input = {
        criterionId: 'crit-1',
        value: 'ten',
      };
      const result = scoreItemSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('submitScoreSchema', () => {
    it('accepts a valid score submission', () => {
      const input = {
        items: [
          { criterionId: 'crit-1', value: 8.5, feedback: 'Strong tech' },
          { criterionId: 'crit-2', value: 9.0, feedback: 'Beautiful UX' },
        ],
        isFinal: true,
      };
      const result = submitScoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts a valid draft score submission (isFinal: false)', () => {
      const input = {
        items: [{ criterionId: 'crit-1', value: 5.0 }],
        isFinal: false,
      };
      const result = submitScoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty score items array', () => {
      const input = {
        items: [],
        isFinal: true,
      };
      const result = submitScoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects duplicate criterion IDs in score submission', () => {
      const input = {
        items: [
          { criterionId: 'crit-1', value: 7 },
          { criterionId: 'crit-1', value: 9 }, // Duplicate criterionId
        ],
        isFinal: true,
      };
      const result = submitScoreSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Duplicate criterion IDs');
      }
    });

    it('rejects invalid isFinal values (string or missing)', () => {
      const nonBooleanFinal = submitScoreSchema.safeParse({
        items: [{ criterionId: 'crit-1', value: 5 }],
        isFinal: 'true',
      });
      expect(nonBooleanFinal.success).toBe(false);

      const missingFinal = submitScoreSchema.safeParse({
        items: [{ criterionId: 'crit-1', value: 5 }],
      });
      expect(missingFinal.success).toBe(false);
    });
  });

  describe('unlockScoreSchema', () => {
    it('accepts a valid unlock request', () => {
      const input = {
        scoreId: 'score-123',
        reason: 'Judge accidentally hit finalize before finishing feedback.',
      };
      const result = unlockScoreSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty unlock reason', () => {
      const input = {
        scoreId: 'score-123',
        reason: '',
      };
      const result = unlockScoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects whitespace-only unlock reason', () => {
      const input = {
        scoreId: 'score-123',
        reason: '   ',
      };
      const result = unlockScoreSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // 6. Normalization & Publication Schemas
  // ==========================================
  describe('runNormalizationSchema', () => {
    it('accepts a valid normalization request with defaults', () => {
      const input = {
        eventId: 'event-1',
      };
      const result = runNormalizationSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minJudgeSampleCount).toBe(5);
      }
    });

    it('accepts custom valid sample count and trackId', () => {
      const input = {
        eventId: 'event-1',
        trackId: 'track-ai',
        minJudgeSampleCount: 3,
      };
      const result = runNormalizationSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minJudgeSampleCount).toBe(3);
        expect(result.data.trackId).toBe('track-ai');
      }
    });

    it('rejects invalid normalization parameters (negative, zero, float)', () => {
      expect(runNormalizationSchema.safeParse({ eventId: 'e1', minJudgeSampleCount: 0 }).success).toBe(false);
      expect(runNormalizationSchema.safeParse({ eventId: 'e1', minJudgeSampleCount: -3 }).success).toBe(false);
      expect(runNormalizationSchema.safeParse({ eventId: 'e1', minJudgeSampleCount: 2.5 }).success).toBe(false);
    });

    it('rejects missing eventId in normalization request', () => {
      expect(runNormalizationSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('publishResultsSchema', () => {
    it('accepts valid publish request', () => {
      const input = {
        eventId: 'event-1',
        trackId: 'track-fintech',
        note: 'Official Final Results approved by judging committee.',
      };
      const result = publishResultsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects missing eventId', () => {
      const result = publishResultsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
