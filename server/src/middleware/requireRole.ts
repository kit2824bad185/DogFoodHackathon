import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { UserRole } from '../db/schema';
import '../types/auth';

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Checks whether req.user has one of the allowed roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
      return;
    }
    const userRole = req.user.role;
    const isAllowed = (allowedRoles as string[]).some(
      (r) => r.toLowerCase() === userRole.toLowerCase()
    );

    if (!isAllowed) {
      sendError(
        res,
        'FORBIDDEN',
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        { requiredRoles: allowedRoles, currentRole: req.user.role },
        403
      );
      return;
    }

    next();
  };
}
