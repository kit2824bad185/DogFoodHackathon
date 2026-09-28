import crypto from 'crypto';
import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../../db';
import {
  submissions,
  submissionVersions,
  projects,
  teamMembers,
  events,
  eventSettings,
  Submission,
  Project,
} from '../../db/schema';
import { DraftSubmissionInput, FinalizeSubmissionInput } from './submissions.schemas';

export class SubmissionsService {
  /**
   * Save a draft submission and work in progress.
   */
  async saveDraft(userId: string, data: DraftSubmissionInput): Promise<any> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
      with: {
        submissions: true,
      },
    });

    if (!project) {
      const error: any = new Error('Project not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Verify user is a member of the project team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, project.teamId),
        eq(teamMembers.userId, userId)
      ),
    });

    if (!membership) {
      const error: any = new Error('Only team members can save submission drafts');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Check if submission is already locked
    const existingSubmission = project.submissions[0];
    if (existingSubmission && (existingSubmission.status === 'LOCKED' || existingSubmission.isFinal)) {
      const error: any = new Error('Submission is finalized and locked. No further draft updates are permitted.');
      error.code = 'SUBMISSION_LOCKED';
      error.statusCode = 400;
      throw error;
    }

    // Update project fields if provided in draft
    const projectUpdates: Partial<Project> = { updatedAt: new Date() };
    if (data.title !== undefined) projectUpdates.title = data.title;
    if (data.description !== undefined) projectUpdates.description = data.description;
    if (data.repoUrl !== undefined) projectUpdates.repoUrl = data.repoUrl;
    if (data.demoUrl !== undefined) projectUpdates.demoUrl = data.demoUrl;
    if (data.videoUrl !== undefined) projectUpdates.videoUrl = data.videoUrl;
    if (data.techStack !== undefined) projectUpdates.techStack = data.techStack;

    await db.update(projects).set(projectUpdates).where(eq(projects.id, data.projectId));

    const now = new Date();
    let submission: Submission;

    if (existingSubmission) {
      const [updated] = await db
        .update(submissions)
        .set({
          status: 'DRAFT',
          isFinal: false,
          updatedAt: now,
        })
        .where(eq(submissions.id, existingSubmission.id))
        .returning();
      submission = updated;
    } else {
      const [created] = await db
        .insert(submissions)
        .values({
          id: crypto.randomUUID(),
          projectId: data.projectId,
          status: 'DRAFT',
          isFinal: false,
          submittedAt: null,
          updatedAt: now,
        })
        .returning();
      submission = created;
    }

    return submission;
  }

  /**
   * Finalize and lock a submission.
   */
  async finalizeSubmission(userId: string, data: FinalizeSubmissionInput): Promise<any> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
      with: {
        track: true,
        submissions: true,
        team: {
          with: {
            event: {
              with: {
                settings: true,
              },
            },
            members: {
              with: {
                user: {
                  with: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project || !project.team) {
      const error: any = new Error('Project or team not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // 1. Verify user is in project team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, project.teamId),
        eq(teamMembers.userId, userId)
      ),
    });

    if (!membership) {
      const error: any = new Error('Only team members can finalize the submission');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // 2. Validate event phase is SUBMISSION_OPEN
    const event = project.team.event;
    if (!event || event.status !== 'SUBMISSION_OPEN') {
      const error: any = new Error(
        `Submissions can only be finalized during the SUBMISSION_OPEN phase. Current phase: ${event?.status || 'UNKNOWN'}`
      );
      error.code = 'SUBMISSION_PHASE_INVALID';
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate submission deadline
    const deadline = event.settings?.submissionDeadline;
    if (deadline && new Date() > new Date(deadline)) {
      const error: any = new Error('The submission deadline for this event has passed');
      error.code = 'DEADLINE_PASSED';
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate mandatory fields
    if (!project.title || !project.description || !project.repoUrl) {
      const missing = [];
      if (!project.title) missing.push('title');
      if (!project.description) missing.push('description');
      if (!project.repoUrl) missing.push('repo_url (repository URL)');

      const error: any = new Error(
        `Cannot finalize submission. Missing mandatory project fields: ${missing.join(', ')}`
      );
      error.code = 'MANDATORY_FIELDS_MISSING';
      error.statusCode = 400;
      throw error;
    }

    // 5. Check if already locked
    const existingSubmission = project.submissions[0];
    if (existingSubmission && existingSubmission.status === 'LOCKED' && existingSubmission.isFinal) {
      const error: any = new Error('Submission is already finalized and locked');
      error.code = 'ALREADY_FINALIZED';
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    let submissionId = existingSubmission?.id;

    if (existingSubmission) {
      await db
        .update(submissions)
        .set({
          status: 'LOCKED',
          isFinal: true,
          submittedAt: now,
          updatedAt: now,
        })
        .where(eq(submissions.id, existingSubmission.id));
    } else {
      submissionId = crypto.randomUUID();
      await db.insert(submissions).values({
        id: submissionId,
        projectId: project.id,
        status: 'LOCKED',
        isFinal: true,
        submittedAt: now,
        updatedAt: now,
      });
    }

    // 6. Compute version number and create immutable snapshot in submission_versions
    const [versionCountResult] = await db
      .select({ count: count() })
      .from(submissionVersions)
      .where(eq(submissionVersions.submissionId, submissionId!));

    const nextVersionNumber = (versionCountResult?.count || 0) + 1;

    const snapshotPayload = JSON.stringify({
      projectId: project.id,
      title: project.title,
      description: project.description,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      videoUrl: project.videoUrl,
      techStack: project.techStack,
      track: project.track ? { id: project.track.id, name: project.track.name } : null,
      team: {
        id: project.team.id,
        name: project.team.name,
        captainId: project.team.captainId,
        members: project.team.members.map((m) => ({
          userId: m.userId,
          role: m.role,
          fullName: m.user?.profile?.fullName || null,
        })),
      },
      finalizedBy: userId,
      finalizedAt: now.toISOString(),
      versionNumber: nextVersionNumber,
    });

    const versionId = crypto.randomUUID();
    await db.insert(submissionVersions).values({
      id: versionId,
      submissionId: submissionId!,
      versionNumber: nextVersionNumber,
      payload: snapshotPayload,
      createdAt: now,
    });

    return {
      submissionId,
      projectId: project.id,
      status: 'LOCKED',
      isFinal: true,
      versionNumber: nextVersionNumber,
      submittedAt: now,
    };
  }

  /**
   * Get submission status and version history for a project.
   */
  async getSubmissionByProject(projectId: string): Promise<any> {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.projectId, projectId),
      with: {
        versions: {
          orderBy: [desc(submissionVersions.versionNumber)],
        },
      },
    });

    return submission || null;
  }
}

export const submissionsService = new SubmissionsService();
