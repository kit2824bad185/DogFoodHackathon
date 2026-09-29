import { sqliteTable, text, integer, real, check, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './schema';

// 1. Judges Table
export const judges = sqliteTable(
  'judges',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(), // Referenced table 'events' not yet implemented by Member 1
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),

    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('judges_event_user_unique').on(table.eventId, table.userId),
    index('judges_event_id_idx').on(table.eventId),
    index('judges_user_id_idx').on(table.userId),
  ]
);

// 2. Rubrics Table
export const rubrics = sqliteTable(
  'rubrics',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull(), // Referenced table 'events' not yet implemented by Member 1
    trackId: text('track_id'), // Nullable for event-wide rubric; 'tracks' not yet implemented by Member 1
    name: text('name').notNull(),
    description: text('description'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('rubrics_event_id_idx').on(table.eventId),
    index('rubrics_track_id_idx').on(table.trackId),
  ]
);

// 3. Rubric Criteria Table
export const rubricCriteria = sqliteTable(
  'rubric_criteria',
  {
    id: text('id').primaryKey(),
    rubricId: text('rubric_id')
      .notNull()
      .references(() => rubrics.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    weight: real('weight').notNull().default(1.0),
    maxScore: integer('max_score').notNull().default(10),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    check('criteria_weight_gt_zero', sql`${table.weight} > 0`),
    check('criteria_max_score_gt_zero', sql`${table.maxScore} > 0`),
    index('rubric_criteria_rubric_id_idx').on(table.rubricId),
  ]
);

// 4. Judge Assignments Table
export const judgeAssignments = sqliteTable(
  'judge_assignments',
  {
    id: text('id').primaryKey(),
    judgeId: text('judge_id')
      .notNull()
      .references(() => judges.id, { onDelete: 'cascade' }),
    submissionId: text('submission_id').notNull(), // Referenced table 'submissions' not yet implemented by Member 1
    status: text('status', { enum: ['pending', 'scored', 'conflict'] })
      .notNull()
      .default('pending'),
    assignedAt: text('assigned_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('judge_assignments_judge_submission_unique').on(table.judgeId, table.submissionId),
    index('judge_assignments_judge_id_idx').on(table.judgeId),
    index('judge_assignments_submission_id_idx').on(table.submissionId),
    index('judge_assignments_status_idx').on(table.status),
  ]
);

// 5. Judge Conflicts Table
export const judgeConflicts = sqliteTable(
  'judge_conflicts',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => judgeAssignments.id, { onDelete: 'cascade' }),
    judgeId: text('judge_id')
      .notNull()
      .references(() => judges.id, { onDelete: 'cascade' }),
    submissionId: text('submission_id').notNull(), // Referenced table 'submissions' not yet implemented by Member 1
    reason: text('reason').notNull(),
    status: text('status', { enum: ['reported', 'resolved'] })
      .notNull()
      .default('reported'),
    reportedAt: text('reported_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    resolvedAt: text('resolved_at'),
  },
  (table) => [
    index('judge_conflicts_assignment_id_idx').on(table.assignmentId),
    index('judge_conflicts_judge_id_idx').on(table.judgeId),
    index('judge_conflicts_submission_id_idx').on(table.submissionId),
    index('judge_conflicts_status_idx').on(table.status),
  ]
);

// 6. Scores Table
export const scores = sqliteTable(
  'scores',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id')
      .notNull()
      .unique()
      .references(() => judgeAssignments.id, { onDelete: 'cascade' }),
    totalRawScore: real('total_raw_score').notNull(),
    totalNormalizedScore: real('total_normalized_score'),
    isFinal: integer('is_final', { mode: 'boolean' })
      .notNull()
      .default(false),
    submittedAt: text('submitted_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('scores_assignment_id_idx').on(table.assignmentId),
  ]
);

// 7. Score Items Table
export const scoreItems = sqliteTable(
  'score_items',
  {
    id: text('id').primaryKey(),
    scoreId: text('score_id')
      .notNull()
      .references(() => scores.id, { onDelete: 'cascade' }),
    criterionId: text('criterion_id')
      .notNull()
      .references(() => rubricCriteria.id, { onDelete: 'cascade' }),
    value: real('value').notNull(),
    feedback: text('feedback'),
  },
  (table) => [
    uniqueIndex('score_items_score_criterion_unique').on(table.scoreId, table.criterionId),
    index('score_items_score_id_idx').on(table.scoreId),
    index('score_items_criterion_id_idx').on(table.criterionId),
  ]
);

// 8. Judge Stats Table (stores statistics per normalization run)
export const judgeStats = sqliteTable(
  'judge_stats',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    judgeId: text('judge_id')
      .notNull()
      .references(() => judges.id, { onDelete: 'cascade' }),
    meanScore: real('mean_score').notNull(),
    stdDev: real('std_dev').notNull(),
    sampleCount: integer('sample_count').notNull(),
    calculatedAt: text('calculated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('judge_stats_run_judge_unique').on(table.runId, table.judgeId),
    index('judge_stats_run_id_idx').on(table.runId),
    index('judge_stats_judge_id_idx').on(table.judgeId),
  ]
);

// 9. Normalization Results Table
export const normalizationResults = sqliteTable(
  'normalization_results',
  {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull(),
    submissionId: text('submission_id').notNull(), // Referenced table 'submissions' not yet implemented by Member 1
    trackId: text('track_id'), // Nullable track filter; 'tracks' not yet implemented by Member 1
    aggregateZScore: real('aggregate_z_score').notNull(),
    finalNormalizedScore: real('final_normalized_score').notNull(),
    rawScoreAverage: real('raw_score_average').notNull(),
    rank: integer('rank').notNull(),
    calculatedAt: text('calculated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('norm_results_run_submission_unique').on(table.runId, table.submissionId),
    index('norm_results_run_id_idx').on(table.runId),
    index('norm_results_submission_id_idx').on(table.submissionId),
    index('norm_results_track_id_idx').on(table.trackId),
  ]
);
