import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    eventId: z.string().trim().min(1, 'Event ID is required'),
    name: z.string().trim().min(2, 'Team name must be at least 2 characters').max(100),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Valid email address is required').toLowerCase(),
  }),
});

export const joinTeamSchema = z.object({
  body: z
    .object({
      joinCode: z.string().trim().min(4).max(20).optional(),
      join_code: z.string().trim().min(4).max(20).optional(),
      token: z.string().trim().min(8).optional(),
    })
    .refine((data) => data.joinCode || data.join_code || data.token, {
      message: 'Either joinCode or invite token is required',
    }),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>['body'];
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>['body'];
export type JoinTeamInput = z.infer<typeof joinTeamSchema>['body'];
