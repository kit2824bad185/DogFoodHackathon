import { Request, Response } from 'express';
import { submissionsService } from './submissions.service';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function saveDraftHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    const submission = await submissionsService.saveDraft(req.user.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'SUBMISSION_DRAFTED',
      entity: 'SUBMISSION',
      entityId: submission.id,
      metadata: { projectId: req.body.projectId },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { submission }, { message: 'Draft saved successfully' });
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function finalizeSubmissionHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    const result = await submissionsService.finalizeSubmission(req.user.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'SUBMISSION_FINALIZED',
      entity: 'SUBMISSION',
      entityId: result.submissionId,
      metadata: { projectId: req.body.projectId, versionNumber: result.versionNumber },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, result, { message: 'Project submission finalized and locked for judging' });
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function getSubmissionByProjectHandler(req: Request, res: Response): Promise<void> {
  const projectId = req.params.projectId as string;
  const submission = await submissionsService.getSubmissionByProject(projectId);

  if (!submission) {
    sendError(res, 'NOT_FOUND', 'Submission not found for this project', null, 404);
    return;
  }

  sendSuccess(res, { submission });
}
