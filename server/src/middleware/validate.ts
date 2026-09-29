
import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodTypeAny } from 'zod';

export const validate = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed && typeof parsed === 'object') {
        if ('body' in parsed && parsed.body !== undefined) req.body = parsed.body;
        if ('query' in parsed && parsed.query !== undefined) req.query = parsed.query;
        if ('params' in parsed && parsed.params !== undefined) req.params = parsed.params;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
