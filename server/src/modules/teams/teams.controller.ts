import { Request, Response } from 'express';
import { teamsService } from './teams.service';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function createTeamHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    const team = await teamsService.createTeam(req.user.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'TEAM_CREATED',
      entity: 'TEAM',
      entityId: team.id,
      metadata: { name: team.name, eventId: team.eventId },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { team }, { message: 'Team created successfully' }, 201);
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function inviteMemberHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  const teamId = req.params.id as string;

  try {
    const invite = await teamsService.inviteMember(req.user.id, teamId, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'MEMBER_INVITED',
      entity: 'TEAM',
      entityId: teamId,
      metadata: { email: req.body.email },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { invite }, { message: 'Invite created successfully' }, 201);
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function joinTeamHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    const team = await teamsService.joinTeam(req.user.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'MEMBER_JOINED',
      entity: 'TEAM',
      entityId: team.id,
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { team }, { message: 'Joined team successfully' });
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function removeMemberHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  const teamId = req.params.id as string;
  const targetUserId = req.params.userId as string;

  try {
    const result = await teamsService.removeMember(req.user.id, teamId, targetUserId);

    logAuditEvent({
      actorId: req.user.id,
      action: 'MEMBER_REMOVED',
      entity: 'TEAM',
      entityId: teamId,
      metadata: { removedUserId: targetUserId },
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, result);
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function lockTeamHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  const teamId = req.params.id as string;

  try {
    const team = await teamsService.lockTeam(req.user.id, teamId);

    logAuditEvent({
      actorId: req.user.id,
      action: 'TEAM_LOCKED',
      entity: 'TEAM',
      entityId: teamId,
      ipAddress: req.ip || req.socket.remoteAddress,
    }).catch(() => {});

    sendSuccess(res, { team }, { message: 'Team roster locked successfully' });
  } catch (error: any) {
    if (error.statusCode) {
      sendError(res, error.code || 'BAD_REQUEST', error.message, null, error.statusCode);
      return;
    }
    throw error;
  }
}

export async function getTeamByIdHandler(req: Request, res: Response): Promise<void> {
  const teamId = req.params.id as string;
  const team = await teamsService.getTeamById(teamId);

  if (!team) {
    sendError(res, 'NOT_FOUND', 'Team not found', null, 404);
    return;
  }

  sendSuccess(res, { team });
}
