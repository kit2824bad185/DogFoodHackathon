import { z } from 'zod';

// ==========================================
// A. Rubric Schemas
// ==========================================

export const createRubricSchema = z
  .object({
    eventId: z.string({ message: 'Event ID must be a string' }).trim().min(1, 'Event ID is required'),
    trackId: z.string({ message: 'Track ID must be a string' }).trim().min(1, 'Track ID cannot be empty').optional().nullable(),
    name: z.string({ message: 'Rubric name must be a string' }).trim().min(1, 'Rubric name is required'),
    description: z.string({ message: 'Description must be a string' }).trim().optional().nullable(),
  })
  .strict();

export const updateRubricSchema = z
  .object({
    name: z.string({ message: 'Rubric name must be a string' }).trim().min(1, 'Rubric name cannot be empty').optional(),
    description: z.string({ message: 'Description must be a string' }).trim().optional().nullable(),
    trackId: z.string({ message: 'Track ID must be a string' }).trim().min(1, 'Track ID cannot be empty').optional().nullable(),
  })
  .strict();

// ==========================================
// B. Rubric Criterion Schemas
// ==========================================

export const createRubricCriterionSchema = z
  .object({
    rubricId: z.string({ message: 'Rubric ID must be a string' }).trim().min(1, 'Rubric ID is required'),
    name: z.string({ message: 'Criterion name must be a string' }).trim().min(1, 'Criterion name is required'),
    description: z.string({ message: 'Description must be a string' }).trim().optional().nullable(),
    weight: z
      .number({ message: 'Weight must be a number' })
      .positive('Weight must be greater than 0')
      .default(1.0),
    maxScore: z
      .number({ message: 'Max score must be a number' })
      .positive('Max score must be greater than 0')
      .default(10),
    sortOrder: z
      .number({ message: 'Sort order must be a number' })
      .int('Sort order must be an integer')
      .nonnegative('Sort order must be non-negative')
      .default(0),
  })
  .strict();

export const updateRubricCriterionSchema = z
  .object({
    name: z.string({ message: 'Criterion name must be a string' }).trim().min(1, 'Criterion name cannot be empty').optional(),
    description: z.string({ message: 'Description must be a string' }).trim().optional().nullable(),
    weight: z
      .number({ message: 'Weight must be a number' })
      .positive('Weight must be greater than 0')
      .optional(),
    maxScore: z
      .number({ message: 'Max score must be a number' })
      .positive('Max score must be greater than 0')
      .optional(),
    sortOrder: z
      .number({ message: 'Sort order must be a number' })
      .int('Sort order must be an integer')
      .nonnegative('Sort order must be non-negative')
      .optional(),
  })
  .strict();

// ==========================================
// C. Judge Management Schemas
// ==========================================

export const registerJudgeSchema = z
  .object({
    eventId: z.string({ message: 'Event ID must be a string' }).trim().min(1, 'Event ID is required'),
    userId: z.string({ message: 'User ID must be a string' }).trim().min(1, 'User ID is required'),
    status: z.enum(['active', 'inactive'], {
      message: "Status must be either 'active' or 'inactive'",
    }).default('active'),
  })
  .strict();

export const assignJudgeSchema = z
  .object({
    judgeId: z.string({ message: 'Judge ID must be a string' }).trim().min(1, 'Judge ID is required'),
    submissionId: z.string({ message: 'Submission ID must be a string' }).trim().min(1, 'Submission ID is required'),
  })
  .strict();

// ==========================================
// D. Conflict of Interest Schemas
// ==========================================

export const reportConflictSchema = z
  .object({
    assignmentId: z.string({ message: 'Assignment ID must be a string' }).trim().min(1, 'Assignment ID is required'),
    reason: z
      .string({ message: 'Conflict reason is required' })
      .trim()
      .min(1, 'Conflict reason is required and cannot be blank'),
  })
  .strict();

export const resolveConflictSchema = z
  .object({
    conflictId: z.string({ message: 'Conflict ID must be a string' }).trim().min(1, 'Conflict ID is required'),
    newJudgeId: z.string({ message: 'New Judge ID must be a string' }).trim().min(1, 'New Judge ID is required'),
  })
  .strict();

// ==========================================
// E. Scoring Schemas
// ==========================================

export const scoreItemSchema = z
  .object({
    criterionId: z.string({ message: 'Criterion ID must be a string' }).trim().min(1, 'Criterion ID is required'),
    value: z
      .number({ message: 'Score value must be numeric' })
      .min(0, 'Score value must be non-negative (>= 0)'),
    feedback: z.string({ message: 'Feedback must be a string' }).trim().optional().nullable(),
  })
  .strict();

export const submitScoreSchema = z
  .object({
    items: z
      .array(scoreItemSchema, { message: 'Score items are required' })
      .min(1, 'Score submission must contain at least one score item'),
    isFinal: z.boolean({
      message: 'isFinal must be a boolean',
    }),
  })
  .strict()
  .refine(
    (data) => {
      const ids = data.items.map((item) => item.criterionId);
      return new Set(ids).size === ids.length;
    },
    {
      message: 'Duplicate criterion IDs are not allowed in score submission',
      path: ['items'],
    }
  );

export const unlockScoreSchema = z
  .object({
    scoreId: z.string({ message: 'Score ID must be a string' }).trim().min(1, 'Score ID is required'),
    reason: z
      .string({ message: 'Unlock reason is mandatory for audit logging' })
      .trim()
      .min(1, 'Unlock reason is mandatory for audit logging and cannot be blank'),
  })
  .strict();

// ==========================================
// F. Normalization & Results Schemas
// ==========================================

export const runNormalizationSchema = z
  .object({
    eventId: z.string({ message: 'Event ID must be a string' }).trim().min(1, 'Event ID is required'),
    trackId: z.string({ message: 'Track ID must be a string' }).trim().min(1, 'Track ID cannot be empty').optional().nullable(),
    minJudgeSampleCount: z
      .number({ message: 'Minimum sample count must be a number' })
      .int('Minimum sample count must be an integer')
      .positive('Minimum sample count must be a positive integer (> 0)')
      .default(5)
      .optional(),
  })
  .strict();

export const publishResultsSchema = z
  .object({
    eventId: z.string({ message: 'Event ID must be a string' }).trim().min(1, 'Event ID is required'),
    trackId: z.string({ message: 'Track ID must be a string' }).trim().min(1, 'Track ID cannot be empty').optional().nullable(),
    note: z.string({ message: 'Note must be a string' }).trim().optional().nullable(),
  })
  .strict();

// ==========================================
// Inferred TypeScript Types
// ==========================================

export type CreateRubricInput = z.infer<typeof createRubricSchema>;
export type UpdateRubricInput = z.infer<typeof updateRubricSchema>;
export type CreateRubricCriterionInput = z.infer<typeof createRubricCriterionSchema>;
export type UpdateRubricCriterionInput = z.infer<typeof updateRubricCriterionSchema>;
export type RegisterJudgeInput = z.infer<typeof registerJudgeSchema>;
export type AssignJudgeInput = z.infer<typeof assignJudgeSchema>;
export type ReportConflictInput = z.infer<typeof reportConflictSchema>;
export type ResolveConflictInput = z.infer<typeof resolveConflictSchema>;
export type ScoreItemInput = z.infer<typeof scoreItemSchema>;
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
export type UnlockScoreInput = z.infer<typeof unlockScoreSchema>;
export type RunNormalizationInput = z.infer<typeof runNormalizationSchema>;
export type PublishResultsInput = z.infer<typeof publishResultsSchema>;
