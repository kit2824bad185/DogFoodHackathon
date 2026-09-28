import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    teamId: z.string().trim().min(1, 'Team ID is required'),
    trackId: z.string().trim().nullable().optional(),
    title: z.string().trim().min(1, 'Project title is required').max(150),
    description: z.string().max(2000).optional(),
    repoUrl: z.string().trim().url('Valid repo URL is required').optional().or(z.literal('')),
    demoUrl: z.string().trim().url('Valid demo URL is required').optional().or(z.literal('')),
    videoUrl: z.string().trim().url('Valid video URL is required').optional().or(z.literal('')),
    techStack: z.string().max(500).optional(),
    // Also accept snake_case aliases
    repo_url: z.string().trim().optional(),
    demo_url: z.string().trim().optional(),
    video_url: z.string().trim().optional(),
    tech_stack: z.string().optional(),
    track_id: z.string().optional(),
    team_id: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Project title cannot be empty').max(150).optional(),
    description: z.string().max(2000).optional(),
    trackId: z.string().trim().nullable().optional(),
    repoUrl: z.string().trim().url('Valid repo URL is required').optional().or(z.literal('')),
    demoUrl: z.string().trim().url('Valid demo URL is required').optional().or(z.literal('')),
    videoUrl: z.string().trim().url('Valid video URL is required').optional().or(z.literal('')),
    techStack: z.string().max(500).optional(),
    // snake_case aliases
    repo_url: z.string().trim().optional(),
    demo_url: z.string().trim().optional(),
    video_url: z.string().trim().optional(),
    tech_stack: z.string().optional(),
    track_id: z.string().nullable().optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
