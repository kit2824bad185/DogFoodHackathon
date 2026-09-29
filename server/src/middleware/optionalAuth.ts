import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';
import { SESSION_COOKIE_NAME } from '../modules/auth/auth.utils';
import '../types/auth';

/**
 * Optional Authentication Middleware:
 * If a session cookie or Bearer token is provided and valid, populates req.user and req.session.
 * Never halts the request with 401; simply continues if unauthenticated.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    return next();
  }

  try {
    const sessionData = await authService.validateSession(token);
    if (sessionData) {
      req.session = sessionData.session;
      req.user = sessionData.user;
    }
    next();
  } catch {
    next();
  }
}
