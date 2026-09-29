import { Request, Response, NextFunction } from 'express';
import { eq, or } from 'drizzle-orm';
import { db } from '../db';
import { users, judges } from '../db/schema';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { env } from '../config/env';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'participant' | 'judge' | 'organizer' | 'admin' | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware Integration Point
 * Extracts user identity from Authorization Bearer token or x-user-id header.
 * Reuses the existing users table and sets req.user.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const xUserId = req.headers['x-user-id'] as string;
    const xUserRole = req.headers['x-user-role'] as string;

    let tokenOrId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenOrId = authHeader.substring(7).trim();
    } else if (xUserId) {
      tokenOrId = xUserId.trim();
    }

    if (!tokenOrId) {
      throw new UnauthorizedError('Authentication required. Missing Bearer token or credentials');
    }

    // Lookup user in SQLite database
    let userRecord: any = null;
    const [foundUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.id, tokenOrId), eq(users.email, tokenOrId)));

    if (foundUser) {
      userRecord = foundUser;
    } else if (env.NODE_ENV === 'test' && xUserRole) {
      userRecord = { id: tokenOrId, email: `${tokenOrId}@local`, role: xUserRole };
    } else {
      // Check if token matches a registered judge's user ID
      const [foundJudge] = await db
        .select()
        .from(judges)
        .where(or(eq(judges.userId, tokenOrId), eq(judges.id, tokenOrId)));

      if (foundJudge) {
        userRecord = { id: foundJudge.userId, email: `${foundJudge.userId}@local`, role: 'judge' };
      }
    }

    if (!userRecord) {
      throw new UnauthorizedError('Invalid authentication credentials');
    }

    req.user = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}
