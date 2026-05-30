import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates Express middleware that validates request body against a Zod schema.
 * On validation failure, returns 400 with detailed error messages.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.body);
      // Replace body with validated/parsed data (strips unknown fields)
      req.body = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(err);
    }
  };
};

/**
 * Creates Express middleware that validates query parameters against a Zod schema.
 * On validation failure, returns 400 with detailed error messages.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(err);
    }
  };
};
