import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    logger.warn({ err: err.issues, path: req.path }, 'Validation error');
    return sendError(res, 'VALIDATION_FAILED', 'Invalid request data', err.issues, 400);
  }

  // Handle specific known business errors here if we had custom Error classes
  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'UNAUTHORIZED', 'Authentication failed', null, 401);
  }

  if (err.name === 'ForbiddenError') {
    return sendError(res, 'FORBIDDEN', 'Insufficient permissions', null, 403);
  }

  if (err.name === 'NotFoundError') {
    return sendError(res, 'NOT_FOUND', 'Resource not found', null, 404);
  }

  // Fallback for unexpected errors
  logger.error({ err, path: req.path }, 'Unexpected server error');
  
  const details = env.NODE_ENV === 'development' ? err.message : undefined;
  return sendError(res, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred', details, 500);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  return sendError(res, 'NOT_FOUND', 'Route not found', { path: req.path }, 404);
}
