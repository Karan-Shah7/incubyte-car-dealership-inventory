import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues || err.errors || [],
        });
      }
      next(err);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues || err.errors || [],
        });
      }
      next(err);
    }
  };
};
