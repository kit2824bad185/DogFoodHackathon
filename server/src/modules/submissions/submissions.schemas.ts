import { z } from 'zod';

export const draftSubmissionSchema = z.object({
  body: z.object({
    projectId: z.string().trim().min(1, 'Project ID is required'),
    payload: z.any().optional(),
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    repoUrl: z.string().trim().optional(),
    demoUrl: z.string().trim().optional(),
    videoUrl: z.string().trim().optional(),
    techStack: z.string().optional(),
  }),
});

export const finalizeSubmissionSchema = z.object({
  body: z.object({
    projectId: z.string().trim().min(1, 'Project ID is required'),
  }),
});

export type DraftSubmissionInput = z.infer<typeof draftSubmissionSchema>['body'];
export type FinalizeSubmissionInput = z.infer<typeof finalizeSubmissionSchema>['body'];
