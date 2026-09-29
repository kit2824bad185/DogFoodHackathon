import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1, 'Full name cannot be empty').optional(),
    full_name: z.string().trim().min(1, 'Full name cannot be empty').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').nullable().optional(),
    githubUrl: z.string().trim().nullable().optional(),
    github_url: z.string().trim().nullable().optional(),
    linkedinUrl: z.string().trim().nullable().optional(),
    linkedin_url: z.string().trim().nullable().optional(),
    skills: z.string().max(500).nullable().optional(),
    tShirtSize: z.string().max(20).nullable().optional(),
    t_shirt_size: z.string().max(20).nullable().optional(),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    role: z.enum(['PARTICIPANT', 'JUDGE', 'ORGANIZER', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
      message: "Status must be 'ACTIVE', 'INACTIVE', or 'SUSPENDED'",
    }),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['PARTICIPANT', 'JUDGE', 'ORGANIZER', 'ADMIN'], {
      message: "Role must be 'PARTICIPANT', 'JUDGE', 'ORGANIZER', or 'ADMIN'",
    }),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>['query'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>['body'];
