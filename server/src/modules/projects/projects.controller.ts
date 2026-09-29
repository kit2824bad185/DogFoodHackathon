import { Request, Response } from 'express';
import { projectsService } from './projects.service';
import { evaluateProjectEligibility } from '../../services/eligibility';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function createProjectHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    const project = await projectsService.createProject(req.user.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'PROJECT_CREATED',
      entity: 'PROJECT',
      entityId: project.id,
      metadata: { teamId: project.teamId, title: project.title },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { project }, { message: 'Project created successfully' }, 201);
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function updateProjectHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  const id = req.params.id as string;

  try {
    const project = await projectsService.updateProject(req.user.id, id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'PROJECT_UPDATED',
      entity: 'PROJECT',
      entityId: project.id,
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { project }, { message: 'Project updated successfully' });
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function getProjectByIdHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const project = await projectsService.getProjectById(id);

  if (!project) {
    sendError(res, 'NOT_FOUND', 'Project not found', null, 404);
    return;
  }

  sendSuccess(res, { project });
}

export async function getProjectEligibilityHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await evaluateProjectEligibility(id);

  logAuditEvent({
    actorId: req.user?.id || null,
    action: 'ELIGIBILITY_EVALUATED',
    entity: 'PROJECT',
    entityId: id,
    metadata: { eligible: result.eligible },
    ipAddress: req.ip || req.socket.remoteAddress,
  }).catch(() => {});

  sendSuccess(res, result);
}
