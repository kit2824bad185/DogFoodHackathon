import { Request, Response } from 'express';
import { authService } from './auth.service';
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  clearSessionCookie,
} from './auth.utils';
import { logAuditEvent } from '../audit';
import { sendSuccess, sendError } from '../../utils/response';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const meta = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const { user, token } = await authService.register(req.body, meta);

    res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    logAuditEvent({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: String(meta.ipAddress || ''),
    }).catch(() => {});

    sendSuccess(
      res,
      { user },
      { message: 'User registered and authenticated successfully' },
      201
    );
  } catch (error: any) {
    if (error.statusCode === 409) {
      sendError(res, error.code || 'CONFLICT', error.message, null, 409);
      return;
    }
    throw error;
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const meta = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const { user, token } = await authService.login(req.body, meta);

    res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    logAuditEvent({
      actorId: user.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: String(meta.ipAddress || ''),
    }).catch(() => {});

    sendSuccess(res, { user }, { message: 'Login successful' }, 200);
  } catch (error: any) {
    if (error.statusCode === 401) {
      sendError(res, error.code || 'UNAUTHORIZED', error.message, null, 401);
      return;
    }
    if (error.statusCode === 403) {
      sendError(res, error.code || 'FORBIDDEN', error.message, null, 403);
      return;
    }
    throw error;
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  if (req.session) {
    await authService.logout(req.session.id);
  }

  clearSessionCookie(res);

  sendSuccess(res, { message: 'Logged out successfully' });
}

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  sendSuccess(res, { user: req.user });
}

export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.session) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    return;
  }

  try {
    await authService.changePassword(req.user.id, req.session.id, req.body);

    logAuditEvent({
      actorId: req.user.id,
      action: 'PASSWORD_CHANGED',
      entity: 'USER',
      entityId: req.user.id,
      ipAddress: String(req.ip || ''),
    }).catch(() => {});

    sendSuccess(res, {
      message: 'Password updated successfully. Other active sessions have been revoked.',
    });
  } catch (error: any) {
    if (error.statusCode === 401) {
      sendError(res, error.code || 'UNAUTHORIZED', error.message, null, 401);
      return;
    }
    if (error.statusCode === 404) {
      sendError(res, error.code || 'NOT_FOUND', error.message, null, 404);
      return;
    }
    throw error;
  }
}
