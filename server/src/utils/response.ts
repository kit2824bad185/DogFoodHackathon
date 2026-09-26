import { Response } from 'express';

export function sendSuccess(res: Response, data: any, meta: any = {}, statusCode = 200) {
  res.status(statusCode).json({ data, meta });
}

export function sendError(res: Response, code: string, message: string, details?: any, statusCode = 400) {
  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}
