import { Request, Response } from 'express';
import { usersService } from './users.service';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  const profile = await usersService.updateProfile(req.user.id, req.body);
  sendSuccess(res, { profile }, { message: 'Profile updated successfully' });
}

export async function getUsersHandler(req: Request, res: Response): Promise<void> {
  const result = await usersService.getUsers(req.query as any);
  sendSuccess(res, { users: result.users }, result.pagination);
}

export async function updateUserStatusHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { status } = req.body;

  try {
    const user = await usersService.updateUserStatus(id, status);

    logAuditEvent({
      actorId: req.user?.id || null,
      action: 'USER_STATUS_UPDATED',
      entity: 'USER',
      entityId: id,
      metadata: { status },
      ipAddress: String(req.ip || ''),
    }).catch(() => {});

    sendSuccess(res, { user }, { message: `User status updated to ${status}` });
  } catch (error: any) {
    if (error.statusCode === 404) {
      sendError(res, 'NOT_FOUND', error.message, null, 404);
      return;
    }
    throw error;
  }
}

export async function updateUserRoleHandler(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { role } = req.body;

  try {
    const user = await usersService.updateUserRole(id, role);

    logAuditEvent({
      actorId: req.user?.id || null,
      action: 'ROLE_ASSIGNED',
      entity: 'USER',
      entityId: id,
      metadata: { role },
      ipAddress: String(req.ip || ''),
    }).catch(() => {});

    sendSuccess(res, { user }, { message: `User role updated to ${role}` });
  } catch (error: any) {
    if (error.statusCode === 404) {
      sendError(res, 'NOT_FOUND', error.message, null, 404);
      return;
    }
    throw error;
  }
}
