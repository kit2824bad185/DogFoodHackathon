import { z } from 'zod';
import { EVENT_PHASE_SEQUENCE } from './events.constants';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with optional hyphens')
      .optional(),
    description: z.string().max(2000).optional(),
    settings: z
      .object({
        minTeamSize: z.coerce.number().int().min(1).default(1),
        maxTeamSize: z.coerce.number().int().min(1).default(4),
        registrationDeadline: z.coerce.date().nullable().optional(),
        submissionDeadline: z.coerce.date().nullable().optional(),
      })
      .optional()
      .default({ minTeamSize: 1, maxTeamSize: 4 }),
  }),
});

export const addTrackSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Track name is required').max(100),
    description: z.string().max(1000).optional(),
  }),
});

export const updatePhaseSchema = z.object({
  body: z.object({
    phase: z.enum(EVENT_PHASE_SEQUENCE as [string, ...string[]], {
      message: `Phase must be one of: ${EVENT_PHASE_SEQUENCE.join(', ')}`,
    }),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>['body'];
export type AddTrackInput = z.infer<typeof addTrackSchema>['body'];
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>['body'];
