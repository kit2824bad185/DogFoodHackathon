import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { authService } from '../modules/auth/auth.service';
import { SESSION_COOKIE_NAME } from '../modules/auth/auth.utils';
import '../types/auth'; // Ensure type augmentations are loaded

/**
 * Authentication Middleware:
 * Validates session from cookie (or optional Authorization header Bearer token),
 * checks expiration, fetches user with profile, and attaches to req.user and req.session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];

  // Optional fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required. No active session found.', null, 401);
    return;
  }

  try {
    const sessionData = await authService.validateSession(token);

    if (!sessionData) {
      sendError(res, 'UNAUTHORIZED', 'Session is invalid or has expired', null, 401);
      return;
    }

    req.session = sessionData.session;
    req.user = sessionData.user;

    next();
  } catch (error) {
    next(error);
  }
}
